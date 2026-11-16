# 设备菜单进入/返回与长按下键修复

本轮只改变固件菜单生命周期，不改变Mac协议、按键定义、网络选择行为或热模式资源事务。运行模式仍长▲；独立空闲/离线长▼是设备网络列表，电脑助手接管时长▼由Mac打开会话列表。短按与长按的吞沿由现有生产手势模块负责。

## 真实调用路径与根因

设备本地：`handle_key → reply_down_key(阅读时重放long) → wifi_menu_key → wifi_menu_update → LIST`。旧网络列表虽然先set_list再show，但普通LIST仍执行120ms旧页淡出/180ms新页淡入；pet因LIST立即隐藏，下面旧READY就可露出。另一个独立问题是`refresh_assistant(solo) → show_screen(IDLE)`只检查运行模式菜单owner，没有检查Wi-Fi owner；后台预擦PREPARING/IDLE会把正在读的网络菜单切走。

电脑助手：`AssistantHardwareRouter.longDOWN → AssistantCoordinator.openMenu/showMenu → sendState(.list) + sendList → ib_app.apply_state/apply_list → ib_ui_show(LIST)`。旧听写导航由`DeviceBridge.sync → sendState/list`进入同一固件LIST路径。state先到而list尚未到时，app仍保留当前screen，内容到达后才切；list先到则缓存，之后state直接显示。两种顺序和菜单退出均使用同一修复，不改Mac的消息顺序。

## 生命周期修复

- 任意进入或离开LIST都在同一GUI锁内直切；不对导航边界做淡入淡出。上键模式菜单原子首帧和return-pending继续保留。
- 本地网络菜单使用`ib_ui_local_menu_show/hide`和一份344B静态list，ctx只引用UI拥有的指针；不分配堆、不新增字体。远端ctx.list独立缓存，晚到list不会写坏网络名称/选择。
- `show_screen`同时检查run_menu与wifi_menu owner。后台state/助手phase/错误继续更新缓存，不能切走本地菜单。网络菜单内容更新由专用show API直达当前LIST，不绕过该owner混入远端状态。
- 关闭先撤owner、留下菜单快照；app随后明确show最新实际目标，才解除pending。普通返回、超时、当前网络确认、网络列表消失及切换网络/蓝牙离开路径都经过统一end。在线恢复最新screen_for(state)，不恢复进入前过期screen；独立恢复当前语义状态，离线返回OFFLINE。
- LIST期间导航按钮优先，隐藏底层reply/notification页点，暂停通知与legacy Agent。退回先应用最后的Agent show/hide再解除遮蔽，避免过期generic闪现。已有通知仅暂停，返回恢复原页；完整云reply也保留原页。菜单期间的新notification_show返回busy供现有app/客户端重试，不假ACK已显示。

这不是重启修复。原Wi-Fi/蓝牙选择动作与其既有后续行为不在本轮变更范围；热切AI/电脑模式合同不变。

## 生产回归与边界

`bash firmware/tools/test-display-ui.sh`以`IB_PREVIEW_SANITIZERS=ON`运行生产UI、真实notification/reply store和CRC/reader：

- awake状态下，本地网络菜单与Mac会话菜单0/20/60ms/稳定帧内容hash完全相同；不会利用熄屏本来就cut的路径假通过。
- 注入实际路径使用的PREPARING/IDLE/show、远端state/list、legacy Agent show/hide和新通知，网络菜单像素不变；pending关闭仍保留同一快照。
- 本地菜单关闭恢复底层cloud reply第13页；退出到最新Mac列表也恢复正确内容，没有永久owner。
- 远端LIST返回在pet关闭但助手仍接管的夹具中0/20/60ms/稳定帧像素一致；不露旧LIST/READY，回复页保留。
- 生产通知第5页经远端和本地菜单暂停后恢复，无需store revision变化；关闭通知后云reply原页仍在。
- 菜单期间缓存真实认证错误，返回显示最新诊断；菜单期间已关闭的旧Agent层不会重放；离线进入/返回同一API可释放owner。
- 原有上键模式菜单、正文DONE/PREPARING/IDLE保留、真实capture绿色Mic生命周期、通知可见像素和有界页点回归继续通过。ASan/UBSan无报告，host LVGL峰37496B只代表64位主机，不代表C3峰。

`outputs/passport-down-menu`保存240×320及3倍离屏PNG，网络名/会话/正文均为合成固定夹具，不是设备照片、私人会话或真实路由器信息。host执行的是生产UI公开API与store；ib_app按键/网络/任务链依据实际源码核对，本轮未执行完整ESP-IDF app任务或真实Mac/设备通信。用户已在0.6.1实机确认：连接电脑会话菜单及AI助理网络菜单长按下键进入/返回都不再闪旧页面，并确认宠物右键入口。此反馈不涵盖所有按键时序、复杂并发或长时稳定性；云请求期间C3资源峰仍待验证。
