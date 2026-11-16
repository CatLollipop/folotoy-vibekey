# 实际ASR快照驱动的字幕显示接口（0.4接入合同）

UI不发起供应商请求，不模拟识别，也没有按计时器逐字显示。真正数据来源是设备豆包实时ASR/WSS的partial/final，或Mac真实ASR快照。0.3.2可以包含空闲的显示入口，但实时供应商链路、账号和识别质量不能据此声称已验收。

```c
bool ib_ui_transcript_begin(uint32_t generation);
bool ib_ui_transcript_update(uint32_t generation,const char *utf8,bool final);
void ib_ui_transcript_clear(uint32_t generation); // 0强制清理连接/切目标
```

每轮使用非零递增generation，单boot遵循uint32序号比较并支持回绕。begin相同轮次为幂等，不擦掉已有partial；旧begin不能覆盖新轮。update是**当前完整utterance快照的替换**，可纠正已有识别内容；不是追加字符串。旧轮、已取消轮和已final轮的迟到partial被拒绝。clear指定旧轮不影响当前；0用于断连/切目标强制清理，并阻止旧轮复活。

`final`指整轮合法终包；豆包result.text全量结果在采音期间持续更新，不能用一句定稿提前冻结整轮字幕。Mac的ASR层聚合稳定前句和当前partial，再发布完整快照。final冻结后保持文字直到下一轮或清理；错误/取消优先覆盖并关闭本轮。phase和转写数据各自来自真实状态，不用标点或英语文案猜测结束。

设备显示只保留UTF-8末192B，完整识别结果仍由ASR/对话层持有。每次根据Noto真实字宽显示末两行，上方保留一行phase，最多48px；主宠物和页脚时钟保持原区域。文字更新只使label局部失效，没有每帧滚字、字体分配或大缓冲。UI静态状态/渲染缓存约456B；新增字体位图0B。

Mac线协议建议沿`assistant`命令族：`op=transcript_begin/update/clear`，字段`generation`、update的`text`与布尔`final`。整行≤511B，text≤192B有效UTF-8；必须按最终编码长度校验。实际parser/来源owner由助手模块负责，独立模式不能被Mac迟到字幕覆盖。

网络/采音回调不应长等LVGL锁。设备用有界last-write-wins快照转交app任务消费，begin/final/clear边界保序，终止标记不能被同轮partial覆盖；app先begin再更新UI。WSS数据解析/前句合并、TLS和账号由ASR模块实现。

## 测试

```sh
bash firmware/tools/test-ui-transcript.sh # 生产纯状态模块ASan/UBSan
bash firmware/tools/test-display-ui.sh   # 同份LVGL/C，字幕与菜单像素回归
```

纯状态测试验证当前快照替换、generation隔离/回绕、final冻结、取消/强制清理、无效UTF-8拒绝和完整字符尾部截取。真实UI入口的固定文字夹具验证phase+两行布局、final/error对迟到partial的像素输出不变，以及取消后清空。比较时只在测试宿主暂停背景宠物帧，排除眨眼/弹簧的自然图像差异；产品不会冻结宠物来冻结字幕。

交付的字幕UI截图清楚标识“固定测试文字，不代表实际语音识别结果”；这些图只证明显示和状态隔离，不证明供应商连接、实时性、识别准确率或设备麦克风效果。
