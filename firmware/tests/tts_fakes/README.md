# TTS播放器主机验证

运行 `firmware/tools/test-tts-player.sh`，默认启用ASan/UBSan；`SANITIZE=0`可使用普通构建。脚本只编译生产的`main/ib_tts_player.c`与pthread测试替身，不连接设备或云端，不替换播放器实现。

测试替身提供有界字节流、二进制信号量、并发任务、单调时钟与可选32,000B/s的I2S写入时钟。每次结束join所有线程，并核对stream/semaphore/task资源全部释放。

StreamBuffer Send按IDF5.5.3实际实现等待`min(request,capacity)`空闲字节，超时才允许部分写；动态创建的公开capacity为请求值4096，内核会多分配1字节用于区分空/满。替身按逻辑capacity保存数据，不把它误写成4095。消费线程及音频时钟仍不模拟RTOS优先级和DMA首次突发容量。

覆盖：预缓冲门限、短音频EOF、32KiB持续输入与背压、逐字节输出一致性、奇数输入拒绝、I2S写失败、分配失败、阻塞生产者取消、DMA尾部等待期间取消、abort/取消后下一轮无旧PCM，以及超过90ms供给空窗的统计。fake不模拟ESP32任务优先级的实际抢占或硬件DMA中断；starves是软件供给空窗指标，真实音质、取消静音与堆余量仍需C3实测。

`uxTaskGetStackHighWaterMark`替身返回固定1728字节哨兵，测试只验证consumer结束前采样并经stats传出；它不估算POSIX线程栈或真实C3栈水位。设备值必须由IDF原API测量。
