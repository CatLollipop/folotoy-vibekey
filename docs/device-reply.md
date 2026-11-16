# 设备完整文字回复与边缘提示（0.5.1候选）

设备回复改为文字，不再发起TTS。上方宠物保留，底部显示中文阶段、`当前页/总页数`和两行正文。短▲前页、短▼后页，边界不循环；即使翻到边界，也不会继续执行清历史或停止。长▲运行模式、长▼Wi-Fi/会话、按住OK打断重录由app处理。本地运行模式菜单仍拥有最高界面/输入优先级。

## 所有权与调用链

`ib_reply_store`在assistant只保一份最大4096B UTF-8正文。worker只能追加未发布区，已发布前缀不可修改。UI从不保留可变裸指针，也不复制第二份全文：`reader(gen,offset,out,cap,ctx)`在短锁内复制已发布前缀，旧gen/清理后返回0。每次读最多32B，UI只保当前`text[193]`和页偏移/页码。没有页表或堆分配；上一页按需从头扫描。

`ib_ui_reply_begin/update/clear`与ASR transcript独立。首个回复字发布后关闭旧ASR窗口，避免清除回复后重新露出旧转写。增量默认尾页，用户手动翻页后保当前源起点；未经手动翻页的final返回首页。更新校验完整length、严格UTF-8、前缀指纹、页范围与当前页面构建，成功才冻结final并返回true；网络侧以此为reply_final ACK门禁。重复同gen/length/reader的已发布final可幂等成功，final后partial拒绝。

指定gen clear保留顺序保护，旧轮不能复活；clear0代表明确连接epoch重置，下一begin接受任意非零新gen。较大旧gen→clear0→新连接小gen已联合验证。错误/取消与新录音优先关闭正文；reader失效、长度回退、非法UTF-8或超过4096B安全清理，不悬空读旧内存。

## 字体与布局

分页使用现有12px Noto Sans SC的实际glyph advance，与显示共用缺字映射。现有字库包含GB2312两级常用汉字；emoji/不在该字库的生僻字（例如U+9F98）显示明确的□，不空白，并按□实际advance分页。不是完整Unicode字体，没有新增字体位图或Apple系统字体。

正文区域宽198px、两行，分页输出始终完整UTF-8边界；CRLF归一、Tab显示空格，长英文和显式空行均不跳过源字节。阶段/页码占单独一行，复用原caption256B；label按实际1–3行自然高度排版（行距2px，三行52px），在宠物下方可用空间居中，不保留空64px回复框。主画布全宽240px，宠物与198px文字中心均为x120；空点/背景一致且不随宠物亮度产生矩形暗底，左右不再出现218px左贴画布与22px黑栏。设备宠物隐藏时仍可显示真实转写/回复文字。

绿色常驻`TIME // --:--`和分隔线移除，离线页大时钟仍保留。右UP/DOWN/OK主图标锚点固定70/170/270，左上仅被动电源标识。常用动作采用统一10–12px、1px线宽，中性暖白；长按用同键的次图标/小圆环，无三点装饰或水平抖动。少见的旧keys图标保留12px Material fallback。

## 启动首帧

app在背光门禁阶段应用持久化宠物，再调用`ib_ui_present_boot_frame`。UI持LVGL锁强制当前资产/姿态填充RGB565缓存，不受FPS限流，不推进动画时间；整屏`lv_refr_now`后调用BSP真实DMA等待，成功才允许app点亮。失败不将有效持久化资产回退Dot。主机只能验证选中角色缓存/刷新逻辑，实际冷启动背光顺序仍由真机确认。

## 验证边界

- `tools/test-ui-reply.sh`：生产纯分页核ASan/UBSan，4096B ASCII/中文/emoji、2271页完整重构、UTF-8边界、空行/CRLF/长英文、1–4B短读/0/stale reader、取消/final/epoch/手动页/极值；生产对象无heap引用。Host state280B。
- `tools/test-reply-store.sh`：生产单份store的并发/不可变前缀/取消/释放，ASan/UBSan。
- `ib_ui_reply_font_test`：实际Noto两级汉字存在，emoji与罕见字→非placeholder方框；分页显示≤198×32px。
- `IB_PREVIEW_SANITIZERS=ON`：同一进程编译生产UI、store、reader、分页、font adapter，partial→final→前中末页→store释放后stale reader→新gen→clear0小gen；菜单覆盖/恢复和final迟到partial像素冻结通过，无ASan/UBSan报告。64位主机LVGL峰35712B，仅参考，不替代C3峰值。
- `outputs/passport-text-reply/`包含240×320原尺寸和3倍图，正文为明确离线布局夹具，不能当作真实ASR/模型输出。设备真实网络、连续多轮和冷启动首帧由主集成验收。


## 0.5.1成功正文保留与真实采集提示

0.5故障根因已用生产调用序复现：worker成功DONE后约1.2秒预擦下一录音槽，发布PREPARING；UI曾将此后台准备当作新轮并清reply view。store仍active/final且revision不变，app不会重发，所以正文一闪后永久消失。0.5.1只在真正LISTENING/显式clear/错误或取消清理，PREPARING/IDLE不清正文；final页标题保持已完成，背景预备不影响阅读。旧pet_state入口也不再绕过内容所有权直接覆盖正文label。

真实codec reader活动标志由app传给ib_ui_set_capture_active，不从phase、drain、TLS等待或固定时间推测。右OK麦克风待机中性，实际采集时绿色呼吸/小环；false立即删除循环动画并恢复中性。休眠、菜单遮盖或提示隐藏也停止循环，唤醒仅当前reader仍active才恢复。左被动电源与右主图标中心分别x12/x228，距离边缘一致；idle只显示简短待机标题，不常驻按住确认键说话。

生产store/真实LVGL ASan回归在无revision变化、无新reply_update条件下验证final→DONE→PREPARING→IDLE正文ROI像素不变，并能翻页、模式菜单恢复和抵抗legacy状态覆盖。采集flag true的绿色像素79/103，false和只有LISTENING phase均为0；脉冲循环计数基线0，停止/睡眠/菜单回0。idle文字墨迹中心x120，左右背景采样一致。对应outputs/passport-ui-051是生产代码离屏夹具，正文为合成测试文字，不是设备照片，也不是用户真实对话；修后实机结果由主集成另行确认。
