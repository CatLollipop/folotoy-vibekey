# VibeKey Passport 固件

FoloToy AI Passport(ESP32-C3、8 MB Flash、ST7789 240×320、三键单 ADC、ES8311 麦克风/扬声器、CW2017 电量计)上的 VibeKey 配套固件。设备支持相伴和独立两种模式：相伴模式上报按键、状态与麦克风音频；独立模式在 Mac 关闭后直接完成 豆包实时ASR → DeepSeek → MiniMax TTS。默认相伴，独立模式须先经USB同步云端凭据并保存Wi-Fi。模式切换回执restarting=1后安全重启，独立启动在RF初始化前只启Wi-Fi、不启LAN TLS；未配网返回wifi_required。

当前分支使用 Aora Bot v0.2.0 的 Dot preset，在设备播放24×24核心点阵及装饰动画；宠物通过44个官方状态联动会话。设备使用通用C运动/栅格器，通过≤128KiB的已验证AORAPET2资产支持所选角色/面部/44态表情，Flash mmap零拷贝读取，不加载SVG、旧emotion-ball JSON或远程脚本。列表/字幕/用量页保留专用界面。几何来源、许可和数值比对见 `../docs/pet-runtime.md`。

- 协议:`../docs/protocol.md`(v1)
- 界面:`../docs/device-ui.md`
- 独立助手、原子同步、按键与验收：`../docs/assistant-device-protocol.md`

## Wi-Fi 无线连接

USB 初次配网后，设备加入 2.4 GHz Wi-Fi 并提供 TLS-PSK TCP 8765 服务，通过 mDNS 寻址。Mac 与设备在同一局域网可跨房间使用（取决于信号覆盖），设备可拔线用电池供电。USB 优先；配网后启用Wi-Fi；无配网时BLE仍须通过内存预算门禁，低预算保留USB，避免两套无线栈同时占用录音/TLS内存；音频与按键沿用 v1 协议。BLE仅在启动时free heap≥96KiB且largest≥32KiB的预算门限下可选启用，否则保留USB/Wi-Fi并释放蓝牙控制器内存，不以自动BLE回退造成反复重启。网络凭据仅经 USB 写入普通 NVS，不写出厂 cardid；配网和状态说明见 `docs/protocol.md`。需要同时安装本分支新版 Mac app，原版 InputBetter 不支持此新增链路。C3 无 PSRAM，sdkconfig.defaults 已按低带宽语音调整 Wi-Fi/NimBLE 缓冲和动态 TLS 分配；不要直接恢复 Wi-Fi 默认缓冲数量。

新网络须用 USB 在 Mac 的「设置 › Passport › Wi-Fi 无线连接」添加；长按 ▲ 约 1 秒切换听写 / 翻译 / 字幕，继续按住到约 2.5 秒打开已保存网络列表。蓝牙模式或完全离线时也可长按 ▼ 直接打开列表，选择后短按 OK 切换；Wi-Fi 正常在线时长按 ▼ 仍用于 Agent 导航。蓝牙在线时选择当前标记的 Wi-Fi 会退出蓝牙并尝试连接；Wi-Fi 离线时选择当前网络会重试。Wi-Fi 录音期间临时关闭无线省电，并分开排队发送控制消息和录音帧；录音结束恢复省电。串口日志记录路由器断开原因码和 TLS 收发错误，用来区分无线掉线和加密链路中断。

## 编译

需要 ESP-IDF v5.5.3(`~/esp/esp-idf-v5.5.3`)。

```bash
cd firmware
source ~/esp/esp-idf-v5.5.3/export.sh   # 本机有多个 python 时先 export IDF_PYTHON_ENV_PATH=~/.espressif/python_env/idf5.5_py3.12_env
idf.py set-target esp32c3                # 只需一次
idf.py build
```

校验(主机单元测试 + 编译 + 分区检查):

```bash
tools/validate.sh          # 全部
tools/validate.sh --host   # 只跑主机测试(不需要 ESP-IDF)
tools/test-pet.sh          # Aora几何/运动golden与内存检查
tools/test-ui-labels.sh    # 中文状态逐字形/两行尺寸检查（需已有LVGL组件/sdkconfig）
tools/test-ui-transcript.sh # generation/真实快照替换/final/UTF-8尾部ASan检查
tools/test-ui-reply.sh      # 独立全文分页/4096B/UTF-8/epoch/final/reader ASan检查
tools/test-reply-store.sh   # 单份正文store并发/取消/释放/不可变前缀ASan检查
tools/test-display-ui.sh   # 模式菜单优先与字幕冻结的真实LVGL像素回归
tools/test-tts-player.sh   # 生产TTS player的ASan/UBSan、背压/EOF/取消/资源清理
tools/test-assistant-store.sh # 双bank NOR事务；需要已激活IDF的cJSON源码
```

## 烧录

```bash
../scripts/flash-firmware.sh             # PORT=/dev/cu.usbmodemXXXX 可指定串口
```

脚本会:检查串口没有被 VibeKey / Passport Keys app 或其它程序占用 → 编译 → 该设备(按 MAC)第一次烧录时把整片 8 MB Flash 备份到 `~/esp/passport-backups/passport-<MAC>-flash.bin` → 校验已有备份的大小与 SHA-256、确认设备为 8 MB → 检查备份中的原设备分区表、待写镜像分区表 MD5、镜像列表和扇区擦除范围,并在写入前再次核对设备身份和镜像 SHA-256 → 只写 bootloader / 分区表 / 应用,不擦除整片,**不写 `cardid` 分区(0x356000)**。已有备份缺少校验文件时停止并要求核实。

本开发版已禁用 App 内官网固件刷写入口;请使用上面的受保护脚本刷入本地镜像。上游官网与浏览器刷写入口提供的是原版固件,不能用于安装本分支。

分区:`nvs 0x9000`、`phy_init 0xf000`、`factory 0x10000 (3 MB)`、`wallpaper 0x310000 (192 KB,历史照片数据保留但不显示)`、`cardid 0x356000 (16 KB,出厂身份数据,只保留不写)`、`assistant 0x360000 (512 KiB,双256 KiB配置bank)`、`audio_scratch 0x400000 (2 MiB,双1 MiB录音槽)`。

## 目录结构

```
firmware/
├── components/bsp/        硬件驱动(源自 folotoy/ai-passport,MIT,见其 LICENSE):显示/LVGL、三键 ADC、ES8311、CW2017、I2C
├── main/
│   ├── main.c             入口:按顺序初始化 BSP 与应用
│   ├── ib_app.*           应用核心:事件队列 + 状态机(在线、状态、按键上报、麦克风、Agent 通知、熄屏、电量、时钟)
│   ├── ib_keys.*          按键过滤(纯逻辑):何时上报、ack、熄屏唤醒
│   ├── ib_links.*         每条链路的在线判断(纯逻辑):15 s 超时、bye、拔线(USB 在位 1 s 去抖)
│   ├── ib_charge.*        充电推断与"已充满"判定(纯逻辑)
│   ├── ib_protocol.*      协议(纯逻辑):消息格式化、扁平 JSON 命令解析、行组帧、二进制帧头
│   ├── ib_usb.*           USB Serial/JTAG 链路(与日志共用)
│   ├── ib_ble.*           NimBLE GATT 外设,广播名 VibeKey
│   ├── ib_audio.*         麦克风上行(IMA ADPCM)+ 本地合成提示音
│   ├── ib_assistant.*     独立模式、PTT/取消、双槽采音、同步协议
│   ├── ib_assistant_store.* profile/pet双bank、CRC/字段验证、原子提交
│   ├── ib_assistant_cloud.* DeepSeek SSE、MiniMax TTS（豆包实时ASR见ib_asr_realtime），单公网TLS
│   ├── ib_cloud_stream.*  流式hex PCM、WAV头、UTF-8边界、静音门限
│   ├── ib_pet*            Aora资产校验/读取、44态motion与24×24栅格器
│   ├── ib_adpcm.*         IMA ADPCM 编解码(纯逻辑)
│   ├── ib_clock.*         离线时钟格式化(纯逻辑)
│   ├── ib_ui.*            UI 核心:页面调度、切换动画、逐帧定时器(约 30 fps)、对外接口加锁
│   ├── ib_ui_page.h       页面接口(create / enter / update / frame)
│   ├── ib_ui_gfx.*        配色、缓动、整数三角函数、自绘控件与 lv_draw 封装
│   ├── ib_ui_dots.*       点阵:8 px 网格上的圆点、点阵字形、页面之间的点重排(morph)
│   ├── ib_ui_wave.*       点阵声波(REC 用:活柱跟随电平,历史柱每 100 ms 跳一格)
│   ├── ib_ui_statusbar.*  顶部状态栏(链路 / 电量 / 录音计时 / LIVE)
│   ├── ib_ui_hints.*      右侧竖排按键提示(12 px 图标 + 小点;PROC 时禁用;三个键的纵坐标常量 IB_HINT_Y_* 在这里调)
│   ├── ib_icons.*         keys 命令的图标 id ↔ 枚举(纯逻辑)
│   ├── fonts/             终端 ASCII 字体 + SUB / LIST / Agent 名称用简体中文字体 ib_cjk_font_12.c（Noto Sans SC，OFL）
│   ├── icons/             生成的图标字体 ib_icon_font_12.c / ib_icon_font_56.c、图标表 ib_icon_list.h / ib_icon_large_list.h、Apache-2.0 许可证
│   ├── ib_ui_agent.*      Agent 通知层(全屏 / 录音中横幅)
│   └── ib_ui_<页面>.c     offline / idle / rec / proc / done / err / sub / list 各页面
├── tests/                 主机测试(cc 直接编译,不依赖 ESP-IDF)
└── tools/
    ├── validate.sh        测试 + 编译校验
    ├── gen-icon-font.sh   重新生成图标字体(需要 Node.js;上游字体按固定提交下载并校验 SHA-256)
    ├── gen-cjk-font.sh    重新生成 SUB 页简体中文字体(GB2312 全字集 + ASCII，12 px / 4 bpp)
    └── ui-preview/        主机界面预览:离屏渲染各页面 / 动画帧并导出 PNG(见下文)
```

模块之间只通过头文件通信:UI 不知道协议,协议不知道硬件,`ib_app` 负责把它们串起来。

## 界面预览(不用烧录)

OFFLINE页显示当前所选宠物点阵动画，保留时钟/日期/连接提示；45秒后sleep（用户固定表情优先）。照片入口与offline-art编译/渲染依赖已移除，旧wallpaper分区不自动擦除，也不再映射。预览共用同一C运动/栅格器。

```bash
tools/ui-preview/run.sh          # 全部场景 → tools/ui-preview/out/NN_<名称>.png(480x640)
tools/ui-preview/run.sh list     # 只保存文件名含 list 的截图
SCALE=3 tools/ui-preview/run.sh  # 放大 3 倍
```

在 macOS 上用 cmake + clang 编译固件同一份 LVGL 9.5.0(配置直接取固件的 `build/config/sdkconfig.h`)和 `main/ib_ui*.c` 原样代码,虚拟 240×320 RGB565 显示、4行双缓冲,时间按 5 ms 节拍推进,所以动画第 N 毫秒的画面与真机一致。场景在 `tools/ui-preview/preview_scenarios.c`,只调用 `ib_ui.h` 的公开接口(与 `ib_app` 相同)。第一次使用前需要先执行过一次 `idf.py build`。

## 实现要点

- **日志**:USB 串口与协议共用,默认只输出 WARN 及以上;协议行与音频帧直接整段写入驱动发送环,不会出现半行 JSON。
- **动画**:每个页面用少量"自绘控件"(一个无样式 lv_obj + `LV_EVENT_DRAW_MAIN` 里画图元),逐帧只更新几何参数并重绘该控件区域;切换动画只用 opa / translate,不产生 LVGL 图层缓冲(C3 内存放不下整页图层)。熄屏时暂停逐帧定时器。
- **麦克风**:16 kHz 单声道,每 20 ms 一块 164 字节 IMA ADPCM;USB/Wi-Fi 每帧 2 块,BLE 每帧 1 块(170 字节,需 MTU ≥ 173)。
- **充电标志**:板上没有充电状态引脚,`chg` 按"插着 USB 主机且电量 < 100%"推断。CW2017 是纯电压模型电量计,SOC 会卡在 9x% 到不了 100,所以 `ib_charge` 另做"已充满"判定:USB 在位、SOC ≥ 90、电压 ≥ 4150 mV 持续 10 分钟 → 显示 / 上报 100%、不算充电;之后只在电压低于 4100 mV 或 SOC 低于 90 时清除,与 USB 在位无关;读数失败(-1)不改判定(阈值待实测调整)。
- **USB 在位**:`usb_serial_jtag_is_connected()` 只按 USB SOF 判断(约 4 ms 没收到就判断开),没有去抖;`ib_links_usb_present` 要求连续 1 s 不在位才清除 USB 链路。
- **屏幕点亮**:按键、`state`、Agent 通知、链路恢复在线才点亮;`config`(Mac 每 5 分钟校时重发)不点亮。离线不清除 Mac 下发的状态,恢复在线回到原页面。

Matrix 终端字体由 `tools/gen-terminal-font.sh` 从固定提交的 Roboto Mono 生成 ASCII 子集;SUB 页中文字体由 `tools/gen-cjk-font.sh` 从固定提交的 Noto Sans SC 生成 GB2312 子集。许可证分别位于 `main/fonts/LICENSE-roboto-mono` 与 `main/fonts/LICENSE-noto-sans-sc`。

## 独立模式的内存与验证

C3无PSRAM。16 KiB采音环只在录音时分配，转写/回复缓冲分阶段释放；历史最大8 KiB，退出独立模式释放，云worker也只在独立模式存在。TLS接收记录上限16 KiB、动态缓冲、CA bundle与SNTP校时均随工程配置启用。独立模式暂停Mac局域网TLS任务和队列，三个公网阶段顺序执行。

按住OK说话、松开发送；处理/朗读中再次按住OK，旧轮取消后在仍按住时自动开录。▼短按取消、空闲长按退出独立模式，▲空闲短按清历史。`assistant/status`提供heap/min_free/largest及录音写入/溢出/能量统计。30秒持续采音Flash实时性、真实账号的三阶段链路及连续多轮堆余量是硬件验收项；没有配置不会自动调用云服务。协议和完整验收边界见独立助手文档。

核心启动先分配16项小事件队列与8KiB app任务，再初始化可选无线/音频；app任务等待按键初始化后的boot barrier。原ib_cmd_t为1744字节；现在命令JSON按实际len短期分配，唯一消费者解析后立即释放，队列闲时省约27KiB且保留16项深度。status的app_ready/buttons用于确认普通hello/pong和按键链已运行；assistant capabilities由USB直接处理，单独成功不能证明核心启动完成。profile直接从Flash mmap解析并一次性更新，减少低内存提交峰值。

独立模式进一步不启mDNS和闲置的ADPCM/提示音两个任务；LCD双DMA缓冲各4行，显示颜色/分辨率不变。宠物缓存直接存RGB565，body mask与float coverage错峰复用，几何仍按原精度计算。公网握手完成并验证后释放peer证书链；LLM/TTS请求使用同一JSON序列化器先计Content-Length再以256B输出，不构建完整请求树/副本。历史在成功轮次后按实际需要增长，TLS cleanup后才扩容。LVGL池仍40KiB，依据真机lvgl_peak再决定是否缩小。

点阵draw按当前DMA clip先裁可见行/列；frame timer在完整REFR_READY后再恢复，避免追帧饥饿，ESP-IDF port解锁后会实际delay。fps为目标上限；保留watchdog并通过真实C3启动/长时间交互验收，不能仅凭host预览判断CPU调度。

## 中文状态提示（0.3.1）

独立和电脑助手的宠物caption使用中文语义阶段，区分识别、回复生成与朗读；错误按机器码显示中文原因。离线连接提示使用typed枚举，保留时钟/日期和用户会话名称。复用现有OFL Noto Sans SC字库，新增字体位图0B；109文案/201独立字符实际字形与两行尺寸检查通过。`SCALE=3 tools/ui-preview/run.sh chinese`生成31张中文专用场景；完整调用链、presentation owner和验证边界见[中文状态说明](../docs/firmware-chinese-status.md)。

## 本地模式/边缘提示与实时转写接口

0.3.2候选提供长上键本地运行模式菜单，AI助理/连接电脑/返回三行，当前check与选择分离；菜单缓存迟到Mac页面与通知，退出后恢复最新值。左边显示硬件电源位置，右边短/长按glyph随模式/阶段更新，不新增字体/位图；交互与验证见[device-local-mode.md](../docs/device-local-mode.md)。

0.4字幕接口只接受实际ASR快照，generation隔离、final冻结、错误/取消优先，有限UTF-8末两行；无真实输入不显示。固定文字host夹具不代表已识别语音，实际豆包实时WSS和Mac接入合同见[transcript-display.md](../docs/transcript-display.md)。


实时ASR的WSS传输使用官方 `espressif/esp_websocket_client@1.8.0`（Apache-2.0；[来源提交](https://github.com/espressif/esp-protocols/tree/70bf122fc8bc74622dcf7e15233b5b2af9088df5/components/esp_websocket_client)），由 `dependencies.lock` 固定版本与校验。当前识别为豆包 binary 协议，MiniMax 仅 TTS；供应商字段、帧/事件和验证边界见 [asr-realtime.md](../docs/asr-realtime.md)。


## 0.5文字回复与简化设备界面

当前候选不再请求朗读：回复全文最多4096B由assistant单份缓冲持有，UI reader只保当前两行和页偏移，短▲/▼阅读全文、按住OK发起新轮。final ACK在完整reader校验并发布UI后才成功；clear0重置连接epoch，指定gen取消仍拒迟到。现有Noto覆盖GB2312常用两级汉字，emoji/缺字显式用□占位并按同宽分页；不扩字体资源。绿色常驻时间footer和线已删除，左右提示统一小尺寸中性路径，离线页大时钟保留。详见[device-reply.md](../docs/device-reply.md)。

联合生产store/LVGL的ASan预览：`cmake -S tools/ui-preview -B tools/ui-preview/build -DIB_PREVIEW_SANITIZERS=ON`后运行`tools/test-display-ui.sh`；`tools/test-ui-labels.sh`另检查静态状态，`cmake --build tools/ui-preview/build --target ib_ui_reply_font_test && tools/ui-preview/build/ib_ui_reply_font_test`检查正文汉字/缺字和实际字宽。背光首帧调用`ib_ui_present_boot_frame`强制当前已加载资产填缓存、整屏刷新并等待BSP实际DMA完成，再由app点亮。


0.5.1修复后台预擦录音槽发PREPARING而误清成功正文：生产store revision不变的final→DONE→PREPARING→IDLE序列仍可读/翻页。主画布全宽对称，caption按自然行高，无空回复框。真实codec reader flag驱动右Mic绿色小环呼吸，停止/睡眠/菜单立即停循环，idle不再常驻说话指令。新production离屏夹具与像素/动画回归在outputs/passport-ui-051，不能当设备照片；真机复测由主集成确认。
