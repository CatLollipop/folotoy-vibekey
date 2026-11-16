# Passport标准聊天流与确认草稿（0.8候选）

用户选择标准逐条聊天：助手气泡靠左，首片带当前所选Aora mini；用户消息靠右；未发送ASR草稿是时间流末尾标注“草稿”的右侧气泡。没有固定底栏、没有左右两列。仅改Passport；Mac设置结构保持。0.7 schema1双栏是已发布历史，本节为替代它的schema2合同，不重新打包旧版本。

Mac只观察本次运行实际收到的新消息和明确提交的本机消息，按观察顺序构成有界时间流；不拉取原生历史、不伪称完整原会话。完整本机观察内容、官方能力与投递票据由Mac维护。设备只有当前阅读屏和一个事务暂存，不能自行执行Agent控制或原生GUI导航。

## 几何与呈现

240×320保留24px状态栏，标题/小阶段icon占下一行。正文窗口x21…218（198px）、y50…293（244px）。assistant气泡x45；首片mini20px在x21，与泡泡间距4px。user/draft右对齐，x=219−bubbleWidth。气泡宽度是显式折行正文及首片状态标题的实际最大字宽+12px内边距，限制48…168px；最大正文宽156px，Mac按13个Unicode scalar保守全角折行。字库逐scalar映射缺字□，不会把emoji/ZWJ当一个字宽。C另用真实Noto advance验证每一显式行，禁止隐式换行、裁字后ACK。

每片高度=上下padding共12+18×正文行数；只有user/draft的head片再加18px状态行，空正文算1行。气泡间8px，总高不得超过244px。head=false仅泡边短线表示连续，不添加“续”前缀、不重复mini或状态行；tail=false在泡边保留续接短线。trunc在对应泡尾画省略并在标题显示“截断”，older用标题省略提示更早的完整消息已因有界预算淘汰，均不占正文行。普通阶段只在标题行画真实状态icon；具体失败/只读说明临时或明确显示在内容窗外。

| delivery | 显示与保证 |
| --- | --- |
| none | assistant正文，不额外添加投递标题 |
| draft | 草稿；只有当前版本真实可见尾片可确认 |
| submitting | 提交中；没有结果时不得重发 |
| queued | 已排队；是收到的排队回执，不暗示一直仍在等待 |
| accepted | 已提交；不能推断完成 |
| admitted | 已接收；不能推断完成 |
| failed | 发送失败；是否能重试仍由Mac票据判断 |
| unknown | 结果未知；不显示为已接收、不自动重试 |

mini直接采样同份已加载Aora点阵缓存，没有第二套引擎/资产/帧缓存。一个自绘对象绘制最多四个气泡，懒建/释放聊天对象，不给每条消息创建一组长期LVGL控件。

## 独立schema2线合同

USB/已配对TLS Wi-Fi的flat JSON Lines，整行不含换行≤511B，BLE不承载。独立cmd/t=conversation；cap返回schema=2,chat=1，不宣称split=1，不扩大接近511B的assistant能力帧。所有请求rid非零UInt32，ACK回显rid/op/ok；成功binding请求回显sid/rev，window请求还回显wid。旧pane明确unsupported。

| op | 字段/原子语义 |
| --- | --- |
| bind | sid32小写hex、rev>0、title≤32B合法UTF-8、writable0/1、view dialogue/pet。新binding清窗口/暂存；精确重传不解除pending确认。standalone只缓存，不抢云页面 |
| state | sid/rev匹配；phase idle/recording/transcribing/draft/sending/working/waiting/done/error/unknown，drev UInt32、writable0/1，可选机器error。state更新不擅自改写旧屏草稿正文 |
| window_begin | sid/rev、wid>0、n0…4、page/pages从1开始且page≤pages≤65535、unread0…65535、following0/1、drev UInt32、older0/1；同binding内wid单调。只开启暂存，不改active或UI |
| window_item | sid/rev/wid、index0…n−1、mid16小写hex、role assistant/user/draft、delivery上述枚举、head/tail/trunc均0/1、text≤128B合法UTF-8。精确重复幂等，冲突重复拒绝；draft只在流尾，同mid续片相邻且不换角色/投递状态 |
| window_commit | sid/rev/wid，全部n片收齐、顺序及GUI真实尺寸验证成功后才原子替换active并ACK。失败保留旧窗和可重试暂存；新higher-wid begin可替换同owner旧暂存，不重放任何业务 |
| view | sid/rev、dialogue/pet；只改视觉，不转移输入owner |
| clear | 无binding是连接epoch清理；带身份须匹配，不能清除新binding |
| result | gid>0，status ok/unavailable/stale/unknown，只接受pending或已发动作关联gid；任意迟到gid不能修改新手势 |

n=0是合法空观察窗；不虚构欢迎消息或旧历史。只bind而尚无成功首window时不能录音；任何暂存片段都不能作为确认依据。候选模型提交前调用GUI，只有GUI成功才修改active，因此window_commit ACK是已呈现的完整窗口，不是单纯收到字节。

## 阅读与OK所有权

UP/DOWN按阅读屏翻页。Mac保存窗口cursor；设备事件包含其所见wid，因此迟到的翻页不作用于新屏。停在最新末尾时可跟随追加；手动回看保持位置并显示“新消息”。右侧轨道仍最多7点滚窗、前后省略，代表阅读屏，不代表消息数。通知暂读和LIST菜单优先；关闭后恢复原聊天窗口、page/pages及可用动作。

所有非jump设备event含固定sid/rev/drev/wid、boot/gid；jump只带不透明nid/nrev及boot/gid。action保留record_start/record_stop/confirm/page_prev/page_next/focus/view/jump，新增latest。record_start/stop共用按下时的gid/wid，后续ASR窗口到达不能重定向手势；合法stop应按已验证的capture owner处理，不能因旧window map被淘汰而吞掉松开。

- 180ms真持有只开始一次采音；松开只停止，识别结果留作草稿。真实codec flag才使Mic绿色呼吸，停止/睡眠/菜单停止循环。
- 另一次短OK才可confirm：实际view=dialogue、全局READY、writable、无pending、active following=true、active.drev与当前drev一致，并且active确有delivery=draft、非空、tail=true的草稿。同drev消费一次；UNKNOWN禁新录音/确认。
- 离开最新屏时，短OK只发latest，不发送不可见草稿。到达最新后仍需一次新的短按确认。
- 通知active的首个短OK等待280ms，仅dismiss；第二短OK只请求原会话jump，长持仍采音，60ms回弹过滤。首次按下固定身份，新通知不能变更owner。
- PET与聊天模式共享同一新输入owner，不回落legacy录音。PET caption可能裁尾，永不直接确认；首个短OK只发latest请求，Mac展开dialogue并发布最新窗口，下一次独立短按才可能确认。设备不乐观本地切view；首次按下锁定latest意图，迟到dialogue ACK也不能把同次松开升级成发送。长持采音/松开停止保持原行为。late mic-on在松开后拒绝；旧legacy idle不能停掉有效会话采音。长UP模式、长DOWN会话/网络菜单及0.6.1原子进入返回保持。

## 资源、验证与限制

调用链：`Mac观察/有界分页 → window_begin/item → app唯一队列 → ib_conversation暂存 → complete+GUI字体/尺寸验证 → active原子发布/commit ACK`；`物理key_at → ib_dialogue_keys → 固定sid/rev/drev/wid或nid/nrev → 专属event → Mac官方通道/结果`。

host sizeof模型（含active+stage）1408B，每window624B；编译期断言模型<3072B。UI仅四个193B字形映射片段及少量元数据，没有全量聊天史/额外任务/全屏新帧缓存。64位host LVGL峰39256B仅参考，不代表C3。166条静态文案/238独立字形通过，新增字体位图0B。

- `bash firmware/tools/test-dialogue.sh`：生产cJSON/gesture ASan/UBSan，覆盖完整/缺片/错binding/wid/冲突重复/替换暂存/GUI失败保留、顺序与UTF-8/数值枚举、未首窗禁录音、尾片/版本/可见草稿确认、旧屏latest而非发送、PET/UNKNOWN/迟到mic。
- `bash firmware/tools/test-display-ui.sh`：同份生产LVGL，气泡时序/自然宽/内联草稿、mini和实际Mic像素、13scalar显式长行、单字中文/ASCII、queued与unknown、unread/截断、过宽/总高拒绝、原菜单/通知/云reply生命周期与返回页点。
- UI内存检查：配置host preview `-DIB_PREVIEW_SANITIZERS=ON`，同份生产UI/store生命周期ASan/UBSan通过。`test-ui-labels.sh`验证现有Noto真实glyph/bitmap；并非仅检查字符串存在。

`outputs/passport-chat-080`是固定合成离屏预览，不是设备照片、真实ASR或私聊。host不执行完整ib_app/真实Mac/codec/USB/Wi-Fi；真实物理手势次数、发送/双击跳转官方会话、同boot热切及C3 LVGL/heap峰值由主集成另验。设备显示已排队/已提交/已接收均不是已完成或用户已读证明。
