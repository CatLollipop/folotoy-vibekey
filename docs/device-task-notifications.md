# 设备独立任务通知读层（0.6候选）

通知正文与设备云回复、ASR字幕是三个独立生命周期。协议和全来源观察边界见[agent-notifications.md](agent-notifications.md)。UI不持服务密钥、不解析线协议、不做网络重试或提示音判断。

## 发布与所有权

`生产ib_notification store完整CRC/UTF-8 commit → app → ib_ui_notification_show(gen,source,kind,truncated,length,reader,ctx) → UI成功后ACK/通知音去重`。source最多48B，正文最多2048B；只发布source/icon的size0完成通知合法且无页点，不以空正文假冒回复。相同nid更高rev取得新本地generation，升级前隐藏旧读层、旧reader失效后不再读旧缓冲；完整commit前不能展示新正文。exact同gen重试校验相同source/kind/length/truncated/reader后幂等返回，保当前页。生产store负责身份、rev和只响一次，不把UI函数调用次数当通知次数。

UI另保一个有界pager、当前193B显示页与来源缺字映射，不复制第二份2KiB正文。每次reader最多读取32B，GUI锁内短暂取store锁；reader不取GUI锁，避免反向死锁。实际字宽、UTF-8边界和□缺字映射复用cloud reply纯分页核/现有Noto字体；分页无总页数数组和逐页分配。

UI本地只硬阻止菜单/pending返回及真实capture flag。cloud ASR/请求资源busy由app/store提前门禁，Mac暂存重试；电脑application后台thinking/working/replying本身不代表设备忙。录音/新PTT先隐藏并释放通知，不让读层覆盖真实语音页面。

## 阅读与恢复

通知只接管宠物下方caption（屏幕x21/y224、198×96px），保留上方宠物、状态栏与两侧实体键提示。kind图标与真实来源同一行，两行正文紧接在下方，truncated提示位于正文后；source-only也使用同一紧凑区。背景与宠物画布相同，不依赖兄弟层顺序保护边缘提示。阶段/数字页码不占文字行；右侧页点与cloud reply共用规则：至多7点、当前实心、隐藏前后页各有省略，随当前页滚动。通知激活时独占当前pager提示及▲▼；边界仍消费，不落入底下cloud reply。OK同沿关闭通知后立即走PTT，长▲模式/长▼会话由app保留。15秒无交互退出，翻页延长到30秒，由app负责。

菜单只暂停通知层，不clear其page；退出在app明确show最新screen后恢复，无需store revision变化。通知hide只恢复原cloud reply页/页点与宠物，不恢复旧legacy Agent弹层；show成功清掉旧generic缓存，避免同事件显示两次。通知页的翻页不会修改云reply的源偏移/页码。

## 生产回归

`tools/test-display-ui.sh`链接正式ib_notification/ib_crc32/ib_reply_store和同份LVGL UI，夹具覆盖：

- size0/rev1仅来源完成提示，无页轨道；第一次presented成功，exact重试不再presented。
- 同nid/rev2的1500B正文在CRC commit前reader拒展，完整提交后显示；不重响。
- exact commit/UI show保当前第10页；通知页数与底层cloud reply不同，轨道/按钮以通知为准。
- 菜单开关保通知原页和像素；关闭通知恢复原cloud reply第13页和正文ROI。
- application后台thinking允许通知；actual capture=true拒展，原绿色Mic启停/菜单/睡眠回归保留。
- 生产flush帧缓冲检查真实可见像素：宠物9672且与通知前ROI完全一致、页点66、UP16/DOWN16、Mic37、左power16；不是仅检查pager getter。

`outputs/passport-next-ui`提供240×320原尺寸及3倍合成离屏图；不是设备照片，不是用户真实对话，也不能证明真实USB/Wi-Fi ACK或声音。真实通知/热切同boot验收由主集成记录。
