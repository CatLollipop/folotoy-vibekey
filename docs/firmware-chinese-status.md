# Passport 中文状态提示（0.3.1）

点阵宠物下方的助手状态、独立云对话阶段、可恢复错误及离线连接提示统一显示简体中文。时钟数字、日期、用户项目/会话名称、字幕正文和导航功能保留原有行为；不根据英语显示文案猜测业务，也不把自定义正文当翻译键。

## 语义与显示

| 类型化状态 | 中文提示 |
| --- | --- |
| idle + cloud | 云端待机 / 按住确认键说话 |
| idle + application | 电脑助手 / 等待会话 |
| preparing | 正在准备 / 请稍候 |
| recording / listening | 正在聆听 / 松开确认键发送 |
| transcribing | 正在识别 |
| thinking | 正在思考 |
| replying | 正在回复 |
| speaking | 正在朗读 |
| completed / done | 已完成 |
| stopped | 已取消 |
| failed / error | 发生错误；已知机器错误码附中文原因 |

独立运行器保留既有0–8状态数值，在末尾追加`IB_ASSIST_SPEAKING=9`。LLM增量回调发布replying；真正进入TTS时发布speaking，避免把回复生成和朗读混为同一提示。稳定错误码如`authentication_failed`、`recording_overflow`、`wifi_unavailable`、`playback_write_failed`在`ib_ui_labels.c`集中对应友好原因；未知码统一显示“发生错误 / 请重试”，原始协议/日志机器码不被替换。

Mac的`assistant/pet_state`继续使用`value`传Aora canonical动画，新增可选`target`（cloud/application）、`phase`（AssistantPhase语义，opening用preparing）和`error`（空或check_mac）。明确带phase才用业务阶段文案；Hub工作/检索等事件不带phase时仍按canonical ID显示“正在工作/正在搜索”等。`CLOUD READY`、`OPENING SESSION`、`CHECK MAC`之类旧显示msg不参与固件判断。

带target的presentation明确接管caption；接管期间旧state命令继续更新页面，但不能随后覆盖助手的精确阶段。无target的旧pet_state释放接管并清除phase/error/目标残留；全部Mac链路断开也释放接管。这样同时兼容旧客户端和恢复原硬件按键模式，不依赖跨USB回调/任务队列的时序巧合。

## 调用链

- 独立：`ib_assistant typed phase/error → 状态快照 → ib_app.refresh_assistant → ib_ui_pet_assistant_state → ib_ui_labels → LVGL中文label`。
- 相伴：`DeviceAssistantPresentation/Hub canonical → pet_state → 严格字段校验/明确owner → 状态快照 → 同一原子UI入口`。
- 离线：`ib_app连接条件 → ib_ui_connection_hint_t → ib_ui_connection_label → UTF-8安全截断 → ib_ui_offline`。

`ib_ui_pet_assistant_state`在同一LVGL锁内改变动画和中文状态，状态文本为只读常量；没有逐帧翻译、字符串分配或网络访问。通用`ib_ui_pet_state`仍保留调用者明确传入的自定义UTF-8正文，正文既不翻译也不参与业务判断。

## 字体与资源

复用仓库原有`ib_cjk_font_12`：Google Noto Sans SC，固定SemiBold600、12px、4bpp、不压缩，GB2312+常用标点+ASCII。来源固定为google/fonts提交`86aced91de05cd4f96a06838124cca45be337b2b`，生成器`firmware/tools/gen-cjk-font.sh`固定字体与OFL原文件SHA-256以及`lv_font_conv@1.5.3`。完整许可保留在`firmware/main/fonts/LICENSE-noto-sans-sc`，第三方声明包含其来源。

没有打包Apple系统字体，也没有下载或生成第二份中文字库；本次新增字体位图Flash/RAM均为0。现有大中文字库仍供列表/字幕共用。离线提示字段从32B增为64B，增加32B上下文空间，以完整UTF-8字符边界截断；中文提示均为固定常量。状态标签可用198×38px，现有字体行高16px，两行提示保持在区域内。

## 验证

```sh
# 仓库根目录；需已有一次ESP-IDF构建产生的LVGL组件和sdkconfig
bash firmware/tools/test-ui-labels.sh
SCALE=3 bash firmware/tools/ui-preview/run.sh chinese
```

字形测试实际调用LVGL字体查找和A8位图解码接口，逐一验证109个状态/错误/离线文案、813次字形使用（201个独立字符）：所有字符由同一Noto字库解析，非占位符，描述/位图存在；自然排版尺寸全部≤198×38px。另验证typed phase、已知/未知机器错误、云端/电脑待机和canonical工作/搜索的映射。

同份固件LVGL/C代码输出`72..102`共31张中文专用截图：十阶段、电脑助手、check_mac/密钥/录音错误、canonical工作/搜索、十五种离线提示。人工查看云端待机、聆听、朗读、长错误与离线长提示，文字完整，无缺字或截断。host64位LVGL池峰值36888B，仅作参考。真实设备构建、0.3.1刷写和扬声器验收由整体任务另行记录，不把host截图当作真机验收。
