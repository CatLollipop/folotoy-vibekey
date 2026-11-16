# 官方Agent图标

此目录只用于标识支持接入的第三方应用。图标、品牌和商标的权利归各自所有者，不随本项目源码重新声明为MIT。来源、版本、转换方式及SHA-256见 `sources.json`。

- Claude Code / Claude Desktop共享Claude官方品牌标记；桌面宿主已安装时使用其当前App图标。
- ChatGPT.App读取本机实际注册的 `com.openai.codex` 或 `com.openai.chat` 图标；离线回退为已安装官方ChatGPT.app导出的品牌图标。
- DeepSeek Harness使用已安装官方App图标；OMP、Kimi、WorkBuddy来自各自官网声明的图标资源。
- 原色显示，不作为系统模板图标染灰。资源随客户端离线打包，不在设置页动态下载，不执行宿主应用。
- PNG使用唯一的 `agent-` 前缀，兼容Xcode平铺和SwiftPM/CLT文件夹打包。WorkBuddy原始SVG保留以便核对。
