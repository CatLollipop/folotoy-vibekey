# Passport统一会话路由与双栏草稿（方案B）

电脑会话由Mac验证官方原生身份、能力和发送结果；Passport不解析窗口标题猜会话，不另启同名Agent，也不直接执行第三方应用控制。设备只保存当前绑定、32B标题和Agent/草稿各128B窗口；完整会话、草稿和分页历史在Mac。只读来源可查看，不伪装成可写官方会话。当前实现与完整验收应分开记录。

## 界面与输入所有权

240×320屏保留24px状态栏和左右实体键安全区。左栏顶部是28×28当前所选Aora真实栅格头像与Agent标识，左正文与右侧“我的草稿”持续并排；均为既有12px Noto字体、84px有效行宽。Mac按每行7字符（ASCII也保守计全角）、8行及128B UTF-8上限分页。实际自然高度超过170px的pane返回invalid_pane，不能ACK后静默裁字。缺失Unicode使用既有□映射，不新增字体/位图。

右侧UP/DOWN只翻当前focus栏，1-based page/pages转换为原有至多7点滚动轨道/上下省略；菜单优先并隐藏底层页点。焦点与对话/PET视图入口由Mac长DOWN会话菜单提供，state可选focus=agent|draft；bind默认draft。普通阶段只显示紧凑动画icon，没有常驻确认/等待文案；会话名、Agent/我的草稿、实际正文、只读和具体错误仍保留。

输入owner与画面分开：DIALOGUE与PET都属于同一已绑定会话，PET不会回落legacy录音。有效长持由Mac展开dialogue显示实时草稿；PET也能查看当前focus窗口和页点。只读/UNKNOWN不能开始新录音或确认。菜单、断连和standalone不冒充当前电脑会话已就绪；standalone收到bind只缓存，不覆盖本机云页面，实际热切由Mac在官方绑定验证后请求。

## OK与通知手势

- 电脑会话OK先等待180ms辨别短按/持有；真正持有只发一次record_start，由同一Mac采音/ASR会话处理。松开只发同gid record_stop并停止本机mic，不提交；识别final保留为草稿。
- 另一次新的短按才可confirm，包含固定sid/rev/drev/gid。设备每个drev只消费一次；unknown不重新开放同草稿发送。明确可重试时由Mac发布新的drev，不自动补发。
- 通知active的首个短按延迟280ms：没有第二击时仅dismiss，不确认、不采音。第二个短按完成才发jump；60ms回弹不能构成双击。第二击转成长持时只采音，不同时jump/confirm。每次按下锁定当时绑定/草稿或通知nid/nrev，新消息不能重定向正在进行的手势。
- 跳转仅针对完成通知，带不透明nid/nrev和boot/gid。Mac从有界映射核对真正官方会话，成功bind后才算进入；设备不盲开GUI、不重启、不自行热切。失败仍保留提醒，已知关联gid的unavailable/stale显示短说明，unknown锁输入。通知来源正文与原云reply仍是独立生命周期。
- 长UP运行模式、长DOWN会话/网络列表，以及原通知分页保持。已经开始的录音由对应松开沿结束；释放录音永远不降级成短按确认。记录物理沿时间，队列延迟下未真正开启的长持只报告不可用，不能误发送草稿。

## 独立线协议

USB/已配对TLS Wi-Fi的flat JSON Lines，整行不含换行≤511B；BLE不承载。独立cmd/t=conversation，不增加接近511B的assistant capabilities。所有请求带非零UInt32 rid，响应匹配rid/op/ok；bind/state/pane/view成功回显sid/rev。callback完成UI字形映射/尺寸验证后才提交模型并ACK，GUI忙或无效pane不发布半个新窗口。

| Mac op | 字段 |
| --- | --- |
| cap | 响应schema=1, split=1 |
| bind | sid=32小写hex，rev>0，title≤32B UTF-8，writable=0/1，view=dialogue/pet；重复同binding不解除pending确认 |
| state | sid/rev必须匹配；phase=idle/recording/transcribing/draft/sending/working/waiting/done/error/unknown，drev UInt32、writable；可选机器error与focus=agent/draft，缺focus保留 |
| pane | sid/rev、role=agent/draft、page从1开始、pages1…65535、text≤128B合法UTF-8；page≤pages |
| view | sid/rev、view=dialogue/pet；仅改变画面，不转移输入owner |
| clear | 无sid/rev为连接epoch清理；带身份时须匹配，不能清除新binding |
| result | gid>0、status=ok/unavailable/stale/unknown；只接受pending confirm/jump、最近发出的动作或仍关联的record gid，不接受任意旧gid |

设备事件为`t:conversation,op:event`，action=record_start/record_stop/confirm/page_prev/page_next/focus/view/jump。普通事件带sid/rev/drev/gid及8位hex boot；record_start/stop共用一个gid，Mac按(action,boot,gid)与binding确认身份，不把stop当第二次识别。jump可无binding，但必带nid和nrev（通知revision，不能与binding rev混用）。当前focus/view变更由Mac菜单发布，设备不增加与PTT冲突的长OK。

设备在发送confirm/jump后等待结果，8秒无结果显示unknown并锁新录音/确认，不自动重试。通知ACK只表示接纳；官方绑定、busy和最终投递结果均由Mac真实通道判断。late mic-on只有当前会话长持仍拥有录音时才接受，松开后不能重新开麦；旧legacy idle也不能停掉新会话owner的有效采音。真实codec flag才使Mic变绿。

## 实现、内存与回归边界

调用链：`app EV_COMMAND → ib_conversation生产cJSON校验/候选模型 → GUI callback → ib_ui_conversation双栏/当前Aora cache → ACK`；`物理key_at → ib_dialogue_keys纯仲裁 → ib_app固定owner → conversation event → Mac`。模型432B，只有两个128B原文窗口；UI只保字形映射缓存。双栏对象懒创建，unbound/standalone释放整组LVGL控件；没有额外任务、全量聊天史或宠物动画资源副本。

`bash firmware/tools/test-dialogue.sh`：生产gesture与cJSON wire/model，ASan/UBSan；覆盖短confirm/持有一次/松开只stop、通知单/双/第二击长持、回弹、离线/reset/回绕、binding边界、UI拒绝原子性、同drev一次性消费、result关联/UNKNOWN锁、PET输入owner/late mic/只读。

`bash firmware/tools/test-display-ui.sh`：同份生产LVGL与wire，验证左右正文、真实mini cache、页点/动作可见像素、过长pane拒绝、菜单返回/原页、pending/unknown保留草稿、standalone不抢界面、PET切换。普通footer文字区域亮像素为0；157静态文案/233独立字形通过`test-ui-labels.sh`。旧UP/DOWN菜单无闪、通知页点/正文生命周期、实际capture启停回归继续通过。64位host LVGL峰41776B只作参考，不能推算32位C3峰值。

`outputs/passport-conversation`是固定合成的240×320/3倍离屏PNG，不是设备照片、真实ASR或私聊。host不执行完整ib_app/真实Mac/codec/USB/Wi-Fi；Mac官方能力、双击→原会话绑定/热切失败回滚、连续PTT与实际ASR请求数、确认恰好一次、C3 LVGL/heap峰值与物理手势仍由主集成验收。未知发送结果不得据测试模拟器宣称已送达。
