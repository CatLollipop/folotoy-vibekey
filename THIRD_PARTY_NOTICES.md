# 第三方组件与许可

本项目代码采用 MIT 许可(见 LICENSE)。下列第三方组件按各自许可使用。

## 上游项目

| 组件 | 位置 | 许可 |
| --- | --- | --- |
| [InputBetter](https://github.com/racall/InputBetter) @ `ab1fd9f3e7a1c0a6cbb04533c07829845ddc9b0b` | VibeKey 的 app / firmware 基线 | MIT(版权归 InputBetter contributors) |

## 随仓库提交

| 组件 | 位置 | 许可 |
| --- | --- | --- |
| folotoy/ai-passport 板级支持包 | `firmware/components/bsp` | MIT(见该目录 LICENSE) |
| Material Icons Round(生成的图标字体) | `firmware/main/icons` | Apache-2.0(见 `LICENSE-material-icons`) |
| stb_image_write | `firmware/tools/ui-preview/third_party` | MIT / Public Domain(见文件末尾) |
| silero-vad 模型 | `app/VibeKey/Resources/silero_vad.onnx` | MIT(snakers4/silero-vad) |
| [Aora Bot](https://github.com/sam70361/aora-bot) / `@aora-bot/engine@0.2.0`，源码 `164ffa38b3c27a8512e7c09cfceb7cf0c98f5144` | `vendor/aora-bot`、`app/VibeKey/Pet/Resources/AoraPet.bundle`、`firmware/main/ib_pet*` 中的派生数据与数值移植 | Aora Bot License 1.1（完整原文见 `vendor/aora-bot/LICENSE`；不由本项目 MIT 许可重新授权） |

**Powered by Aora Bot** — 角色由 [Aora Bot](https://github.com/sam70361/aora-bot) 提供。源码、角色及其派生内容保留 Copyright (c) 2026 sam70361。个人及许可定义的其他免费使用者可按原许可集成到应用与硬件；公开分发保留许可和署名链接。其他组织的上线与商业使用适用原许可的商业授权条款。Mac 使用新版原创 Dot 的高清 vector/solid；设备使用同一新版关键几何与 C 数值移植的 pixel/dot，没有引入经典 Emotion Ball/NX 内容。

## 编译时获取(不在仓库中)

| 组件 | 方式 | 许可 |
| --- | --- | --- |
| WhisperKit(argmax-oss-swift) | Swift Package | MIT |
| sherpa-onnx / onnxruntime | Swift Package | Apache-2.0 / MIT |
| KeyboardShortcuts | Swift Package | MIT |
| ESP-IDF、LVGL、esp_lvgl_port 等 | ESP-IDF 组件管理器 | Apache-2.0 / MIT |
| esptool 独立版 | `app/scripts/bundle-device-assets.sh` 下载并打包进 app | GPL-2.0(作为独立程序调用,附 LICENSE) |

## 运行时由用户下载

| 模型 | 许可 |
| --- | --- |
| Whisper(argmaxinc/whisperkit-coreml) | MIT |
| SenseVoice Small(sherpa-onnx 转换版) | FunASR 模型许可,使用前请阅读 |
| Apple Speech | 由 macOS 提供 |
