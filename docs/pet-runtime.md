# Aora 宠物：Mac 高清挂件与设备点阵

宠物使用 Aora Bot `@aora-bot/engine@0.2.0`，来源提交固定为 `164ffa38b3c27a8512e7c09cfceb7cf0c98f5144`。离线安装核心和全部七个官方主题（Halloween、Christmas、Spring Festival、Mid Autumn、Easter、Summer、Valentine），运行时读取官方目录：193 个角色外观、16 种脸型、44 个状态、43 种配色。默认是新版原创 `dot`（球球）：`circle` 身体、`capsule` 脸、`cream` 配色。没有引入 NX 旧项目、旧 JSON 解释器或旧眼环；球球不被命名为 Grok。

## Mac 调用链

`AppState → PetController.start → NSPanel → PetWebRenderer → AoraPet.bundle/index.html → 安装全部主题 → createCharacter`。

业务发布 `PetController.setState(PetState, caption:)`，只传语义状态。Mac 默认 `vector/solid`，可选择实际安装的全部 29 种官方画风：24 种 vector、3 种 pixel 与 2 种 kaomoji。`PetSettingsView → PetVisualSelector` 以用户参考图为依据，提供暗色中央实时预览、左侧画风栏、右侧颜色/脸型缩略图、下方四类 44 种表情及可搜索的全部 193 种外观横条；搜索支持中英角色名、主题名与 ID。画风偏好单独持久保存，仅影响桌面挂件；Passport 始终导出所选角色的 `pixel/dot`。改变外观先采用该角色的官方脸型和配色，之后仍可独立改选。选择表情会关闭“跟随会话状态”，固定显示该表情；重新打开跟随可恢复最新会话状态。选择进入持久偏好，桌面挂件和设备导出使用同一份角色/脸型/颜色/状态设置，不是仅修改预览。桌面显示、大小、置顶、穿透、减少动画以及设备显示、FPS/亮度都整合到同一暗色画布的设置抽屉；设置页的“同步到 Passport”复用 `AssistantDeviceSync.syncPet`，是否成功以事务 ACK/设备回读为准，未连接或正在同步时禁用。

挂件是透明、不抢焦点的原生 `NSPanel`，支持显示、大小、置顶、鼠标穿透、减少动画、位置恢复。右键或 Control 点击挂件可打开原生“宠物设置”菜单，直接进入现有设置窗口的宠物页。`PetContextMenu`只监听该挂件窗口的本地鼠标事件，消费菜单点击、保留普通左键拖动；开启鼠标穿透时事件仍交给下层窗口，需从菜单栏进入设置。导航由`PetController.onOpenSettings → AppState → WindowManager.showSettings(.pet)`注入，网页不增加脚本消息权限。监视器随挂件停止/释放移除，隐藏后恢复仍保持单份实例。位置由 macOS 自动保存；隐藏、系统休眠或退出会暂停动画。挂件 WebView 是非持久数据容器，只加载随应用打包的资源，没有消息处理器。设置选择器使用独立的非持久 WKWebView，以严格白名单消息提交 cast/face/color/style/state/follow 六种选择意图；原生校验主 frame、本地页面 URL、键集合、字段类型/长度及目录 ID。只有中央角色持续播放；其余缩略图通过官方 `renderStaticSvgDataUrl` 静态生成，外观惰性加载，缓存最多 192 项。页面不接收对话正文、API 密钥或设备同步对象；两者 CSP 的 `connect-src 'none'` 均阻止联网。设置页关闭时销毁动画、观察器和消息 handler，拒绝外部导航，资源失败提供重新加载。画布高度由原生设置容器随窗口传入：`canvasHeight = max(560, min(820, settingsHeight - 98))`，逻辑高度范围为 560–820；组件未传参数时默认 600，默认窗口约 600，不再固定为 600。CSS 在宿主高度≤650px 时启用紧凑行高和缩略图，较高窗口使用宽松布局；目标是默认窗口首屏同时提供预览、表情和外观横条，抽屉设置在其内部有界滚动。高度来源为 `SettingsView → PetSettingsView(canvasHeight:) → PetVisualSelector`。

## 设备调用链

桌面与设备的全部参数现位于选择器内“设置”抽屉，原生卡片已移除。桌面/Passport页签包含显示、大小、置顶、穿透、减少动画、恢复位置、FPS、亮度和同步/回执。设置写入通过额外的typed意图校验CFBoolean、整数范围与步进；不能选择任意UserDefaults键。位置恢复、同步和固定署名链接分别使用无参数白名单意图，页面拿不到事务对象或凭据。快速滑动保留本地待确认值，旧原生回推不能拉回滑块；抽屉有界滚动、关闭按钮固定，Esc/Tab边界和关闭焦点恢复完整。

`PetController.makeDeviceConfiguration(revision:) async → 官方 createSimulation/关键轮廓导出 → AORAPET2 → 事务分片同步/Flash bank → mmap → ib_pet_load_bundle → C状态机 → 官方数值behaviour → 120Hz春簧积分 → 几何插值/眨眼 → 覆盖率栅格 → ib_pet_pixel_fn → LVGL点阵视图`。

- `exporter.js` 从选中角色真实 `body.outline/body.parts` 与脸型 `frame.face.geometry` 导出轮廓、带孔图层、配色、每个状态的表情姿态池、眨眼和轮换区间。轮廓采用 Q6 坐标与有界简化；不是预烘动画帧，不需要 Mac 持续传帧。全部 193×16 组合均可导出，最大 83584 B，低于 128 KiB 上限。
- 0.5设备同步要求 `single_pet` 能力，只有新资源提交、活动mmap切换并释放旧映射后，才擦除旧inactive bank并校验全量空白；`retired_clean=1` 才表示旧持久资源回收完成。清理失败保留新active与明确错误，不误报同步完成。Flash仍保留事务staging能力，不能把旧bank回收称为RAM扩容；不影响193角色的Mac离线选择目录。
- `ib_pet_bundle.c` 是无 LVGL/IDF 依赖的纯格式验证器，检查总长、revision、设置范围、段顺序、计数、轮廓和姿态索引。验证失败不改变活动资产。
- `ib_pet_load_bundle` 仅保留已提交只读 mmap 指针，缓存当前状态的小表；不分配或复制大包。调用方在 UI 锁内完成切换后才能解除旧映射。`ib_pet_load_bundle(NULL,0)` 恢复内置 Dot 并取消旧指针引用。旧设备 JSON 由外层存储模块兼容为内置 Dot；不接受用户此前 NX 表情 JSON。
- `ib_pet_motion.c` 移植官方 `behaviours.ts` 与 `spring.ts` 公式，设备实时计算位移、倾斜、压缩、弹簧和眨眼；半隐式 Euler 子步长与上游相同为 `1/120 s`。`ib_pet.c` 支持动态身体部件、自有色配件、16 类脸型图层与关键姿态轮换。
- 栅格移植 `grid.ts` 的布局、`raster.ts` 的半开扫描线与六次子采样覆盖率、`face.ts` 的自适应字形阈值与细笔画保留。角色横跨 24 格，两侧各 2 格 margin，总计 `28×28`，LVGL 点间缝隙 16%。设备固定 `pixel/dot`，FPS 6–20，亮度 10–100。覆盖率仅扫描轮廓包围盒内的行，跳过必然零覆盖采样而不降低六次子采样精度。每帧无 malloc、网络或 Flash 读取调用；大表直接在 Flash 地址空间中索引。
- UI 单任务独占宠物接口，复用约 8 KiB 静态栅格/轮廓工作区（身体mask和脸部覆盖率错峰共用，节省784 B）。`ib_pet_state_is_valid` 提供无副作用协议预检，外部不应 include 含静态数组的数据头。在线隐藏开关由 UI 控制；离线页始终显示已持久化的当前宠物，断网仍可本地 idle/sleep 动画。

设备还实现 sleeping 的浮动 zzz、thinking 的三颗错拍脉冲点、celebrate 的 14 颗有界撒花与 alerting 的红色 bang。装饰使用官方 fx-units/fx-activity/PAPER 的坐标、周期、重力、阻力与配色；撒花数组增加 448 B RAM。Mac 保留完整上游特效；设备尚未逐项移植心形、完整彩带、主题附加特效和球面实时 gaze 投影，主题身体轮廓目前随统一身体变换运动。设备输出是所选角色的真实几何与原生动态，不能描述成所有上游特效的逐帧复刻。

## AORAPET2 二进制

所有整数采用 little endian。头 112 B，magic `AORAPET2`；schema=2，headerBytes=112，总长≤131072，revision 非零。设置保存 enabled、fps、brightness、fixedState（255 为跟随；0–43 固定表情）、base/light RGB。

头中的 count/offset 指向按顺序排列的 metadata UTF-8 JSON、点、轮廓、脸部图层、姿态、44 状态、身体图层、调色板。metadata 仅含引擎版本/提交、角色/脸型/配色 ID 与几何简化容差，不含用户或会话数据。点为 4 B（int16 x/y，单位 1/64）；轮廓/图层/姿态为 8 B；状态为 28 B（最多 8 姿态 + 眨眼/轮换区间）；调色板为 RGB888 u32。头字段定义及严格边界在 `ib_pet_bundle.h/.c`。

限制：metadata≤4096 B，点≤24576，轮廓≤4096，每轮廓≤256 点，脸部图层≤8192，姿态≤512，每姿态≤128 图层，身体图层≤128，颜色16–256。导出优先保留高精度，超出体积预算才逐步放宽几何简化。无动画位图序列。

## 配置与可重复构建

```sh
python3 scripts/vendor-aora.py       # 指定npm/源码快照，校验npm SHA-512，全部主题离线打包
node scripts/generate-aora-pet.mjs  # 内置Dot几何/参数和独立官方测试golden
node scripts/test-pet-catalog.mjs --full # 全193×16组合与43配色，写构建目录report
node scripts/test-pet-selector.mjs # 29种真实静态画风与设备dot导出不变性
bash firmware/tools/test-pet.sh    # 官方golden与真实导出资产端到端ASan/UBSan
SCALE=3 bash firmware/tools/ui-preview/run.sh aora # 同份固件LVGL截图，含选中角色/离线
```

`AoraPet.bundle` 必须作为完整 folder resource。`.mjs` 供无 DOM 的 Node 生成器使用；`engine.js` 与 `themes/*.js` 只转换最终 ESM 导出为本地 globals，并暴露原始 palette helpers 给紧凑导出器，上游算法未修改。

## 验证边界

Host 覆盖内置 44 态、132 组官方 motion 黄金值（误差<`1e-4`）、限帧、亮度、时钟回绕和四类装饰。内置核心点阵与官方独立 rasterise 比较，41 态逐格一致，剩余共 5 格 Q6 阈值差异，单态≤`2/784` 格。动态资产测试加载 37 个真实导出包（含最大样本）×44 态，检查可见性、实时运动、固定表情、错误段/索引拒绝、失败保留活动资产、恢复内置后释放旧内存无悬空访问；ASan/UBSan 通过。

2026-11-16 宠物选择器通过 Swift 6 类型检查和离线 WKWebView 的 527px 中文 / 840px 英文交互回归：角色、脸型、画风、固定表情、搜索均更新真实原生偏好；畸形/越权意图拒绝。29 种官方静态画风各不同，切换全部画风后设备样本包 29364 B 逐字节不变。机械 detector 无发现；暗色舞台说明文字对背景对比度为 8.38–9.15:1。证据为 `work/pet-qa/selector-527-zh-Hans.png`、`selector-840-en.png` 与 `selector-qa.json`；最终原生设置窗口与打包应用检查由主集成流程完成。

此前实际离线 WKWebView 读取全目录、切换 Dot/capsule、Miso/shades、Christmas tree/sparkle、Goat/screen 的角色/脸型/状态并成功导出完整包，15–81 KiB 导出耗时37–82 ms（本机一次测量）。早期原生设置卡片的浅深主题截图使用真实窗口背景，小说明使用 `Color.primary.opacity(0.72)`，保留已验证的≥4.5:1对比度。固件同份 LVGL/C 主机预览验证七个内置状态、导航叠层和五个动态角色的在线/离线外观；主机64位 LVGL 池峰值36936 B，仅作参考。整机屏幕、音频与并发内存仍需真实设备验收。

## 第三方许可

保留 `vendor/aora-bot/LICENSE` 和 bundle 原许可，使用 Aora Bot License 1.1。个人与符合许可定义的免费使用者可集成到产品及硬件；公开分发时保留源码许可，并在关于、README 或第三方声明链接署名 **Powered by Aora Bot**。本项目其他代码的 MIT 许可不覆盖 Aora 内容。


2026-11-16 内嵌设置回归使用独立偏好与模拟同步回调，不连接设备：真实离线WK覆盖527px中文/840px英文的全部开关/大小/FPS/亮度绑定、同步busy与重复/离线拦截、非法类型/范围拒绝和Esc焦点恢复。`work/pet-qa/drawer-qa.json`及`drawer-{desktop,device}-527-zh-Hans.png`、`drawer-device-840-en.png`为本轮证据；截图中的Fixture receipt仅为UI夹具，实际设备ACK由主集成验证。


0.5交付范围说明：旧版浅深卡片图、0.3.x/0.4录音与朗读记录均为版本化历史证据。新暗色一体抽屉及自适应560–820高度、设备完整文字回复、移除时间栏、冷启动首帧与单宠物回收的当前真机结果，以主集成最终验收为准；既有离线WK/LVGL夹具不替代该结论。
