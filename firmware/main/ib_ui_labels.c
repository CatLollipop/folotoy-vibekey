/* 中文状态资源集中在只读Flash中；复用现有Noto Sans SC字库，不增加字体位图/RAM。 */
#include "ib_ui_labels.h"
#include <string.h>
#define COUNT(a) (sizeof(a)/sizeof((a)[0]))
typedef struct { const char *id,*label; } label_entry_t;
static const char *const phases[IB_UI_ASSIST_COUNT]={
    [IB_UI_ASSIST_IDLE]="云端待机",
    [IB_UI_ASSIST_PREPARING]="正在准备\n请稍候",
    [IB_UI_ASSIST_LISTENING]="正在聆听\n松开确认键发送",
    [IB_UI_ASSIST_TRANSCRIBING]="正在识别",
    [IB_UI_ASSIST_THINKING]="正在思考",
    [IB_UI_ASSIST_REPLYING]="正在回复",
    [IB_UI_ASSIST_DONE]="已完成",
    [IB_UI_ASSIST_ERROR]="发生错误\n请重试",
    [IB_UI_ASSIST_STOPPED]="已取消",
    [IB_UI_ASSIST_SPEAKING]="正在朗读"
};
static const char desktop[]="电脑助手\n等待会话";
static const char *const conversation_text[]={"对话","我的草稿","确认发送草稿","此会话仅支持查看","等待电脑验证会话","等待电脑确认"};
static const label_entry_t conversation_errors[]={
    {"no_mac","请连接电脑"},{"unbound","请先选择会话"},{"busy","请稍候再操作"},
    {"draft_exists","原会话已有草稿"},{"stale","会话已变，请重新选择"},
    {"unknown","结果未知，请查看电脑"},{"read_only","此会话仅支持查看"},
    {"unavailable","暂不可用，请查看电脑"}
};
const char *ib_ui_conversation_text(unsigned i){return i<COUNT(conversation_text)?conversation_text[i]:"";}
const char *ib_ui_conversation_error(const char *code){if(!code||!code[0])return "";for(unsigned i=0;i<COUNT(conversation_errors);i++)if(!strcmp(code,conversation_errors[i].id))return conversation_errors[i].label;return conversation_errors[COUNT(conversation_errors)-1].label;}
static const char *const run_mode_text[]={
    "运行模式","AI 助理","连接电脑","返回",
    "上下键选择，确认键确定\n30秒无操作自动返回",
    "请先停止当前对话",
    "请先在电脑配置无线网络",
    "请先在电脑同步云端配置",
    "模式保存失败，请重试",
    "助手暂不可用\n请连接电脑检查配置",
    "正在切换模式\n请稍候",
    "正在同步配置\n请稍后切换模式"
};
const char *ib_ui_run_mode_title(void){return run_mode_text[0];}
const char *ib_ui_run_mode_item(unsigned row){return row<3?run_mode_text[row+1]:"";}
const char *ib_ui_run_mode_notice(ib_ui_run_mode_notice_t notice){return run_mode_text[4+((unsigned)notice<IB_UI_RUN_MODE_NOTICE_COUNT?(unsigned)notice:0)];}
static const char *const connections[IB_UI_CONN_COUNT]={
    [IB_UI_CONN_WAITING]="等待电脑连接",
    [IB_UI_CONN_USB_LINKED]="USB已连接，请打开助手",
    [IB_UI_CONN_BLE_LINKED]="蓝牙已连接，请打开助手",
    [IB_UI_CONN_BLE_ONLY]="蓝牙模式，长按下键切换",
    [IB_UI_CONN_WIFI_READY]="网络已配置，请打开助手",
    [IB_UI_CONN_SETUP]="请连接USB或配置网络",
    [IB_UI_CONN_ADD_WIFI_USB]="请用USB连接并配置网络",
    [IB_UI_CONN_SWITCH_BLE]="正在切换蓝牙",
    [IB_UI_CONN_SWITCH_WIFI]="正在切换无线网络",
    [IB_UI_CONN_WIFI_FAILED]="网络切换失败",
    [IB_UI_CONN_BLE_MODE]="正在进入蓝牙模式",
    [IB_UI_CONN_CONNECTING]="正在连接",
    [IB_UI_CONN_CHECK_USB]="请检查USB连接线",
    [IB_UI_CONN_NO_RESPONSE]="电脑未响应，请重试",
    [IB_UI_CONN_RECONNECT]="按确认键重新连接"
};
/* 仅对协议/驱动的稳定机器错误码做适配；未知码统一显示错误，原码仍保留在日志。 */
static const label_entry_t errors[]={
    {"asr_task_failed","识别服务拒绝请求\n请在电脑检查配置"},
    {"asr_task_mismatch","实时识别失败\n请检查网络后重试"},
    {"asr_event_after_finish","实时识别失败\n请检查网络后重试"},
    {"asr_duplicate_start","实时识别失败\n请检查网络后重试"},
    {"asr_not_started","实时识别失败\n请检查网络后重试"},
    {"asr_incomplete_sentence","实时识别失败\n请检查网络后重试"},
    {"asr_invalid_sentence","实时识别失败\n请检查网络后重试"},
    {"asr_missing_sentence_final","实时识别失败\n请检查网络后重试"},
    {"asr_redirect_rejected","实时识别失败\n请检查网络后重试"},
    {"asr_connection_failed","实时识别失败\n请检查网络后重试"},
    {"asr_disconnected","实时识别失败\n请检查网络后重试"},
    {"asr_invalid_frame","实时识别失败\n请检查网络后重试"},
    {"asr_invalid_sequence","实时识别失败\n请检查网络后重试"},
    {"asr_unsupported_compression","实时识别失败\n请检查网络后重试"},
    {"asr_invalid_json","实时识别失败\n请检查网络后重试"},
    {"asr_early_finish","实时识别失败\n请检查网络后重试"},
    {"asr_send_failed","实时识别失败\n请检查网络后重试"},
    {"asr_start_failed","实时识别失败\n请检查网络后重试"},
    {"asr_connect_timeout","实时识别失败\n请检查网络后重试"},
    {"asr_start_timeout","实时识别失败\n请检查网络后重试"},
    {"asr_finish_timeout","实时识别失败\n请检查网络后重试"},
    {"flash_read_failed","录音读取失败\n请重试"},
    {"profile_required","发生错误\n请先在电脑配置云端服务"},
    {"check_mac","发生错误\n请查看电脑端提示"},
    {"recording_not_ready","正在准备\n请稍后重新按住确认键"},
    {"flash_erase_failed","发生错误\n录音存储准备失败"},
    {"audio_busy","发生错误\n音频忙，请稍后重试"},
    {"out_of_memory","发生错误\n内存不足，请重试"},
    {"cancelled","已取消"},
    {"recording_overflow","发生错误\n录音缓冲不足，请重试"},
    {"recording_too_short","录音过短\n请按住确认键说话"},
    {"no_speech","未听到说话\n请按住确认键重试"},
    {"wifi_unavailable","发生错误\n无线网络未连接"},
    {"companion_busy","发生错误\n电脑连接忙，请重试"},
    {"clock_sync_failed","发生错误\n时间同步失败，请检查网络"},
    {"network_error","发生错误\n网络异常，请重试"},
    {"connection_failed","发生错误\n云端连接失败"},
    {"authentication_failed","发生错误\n云端密钥无效，请检查配置"},
    {"insufficient_balance","发生错误\n云端余额不足"},
    {"rate_limited","请求过于频繁\n请稍后重试"},
    {"provider_unavailable","云端暂不可用\n请稍后重试"},
    {"provider_rejected","发生错误\n云端拒绝请求，请检查配置"},
    {"invalid_request","发生错误\n请求配置无效"},
    {"invalid_endpoint","发生错误\n云端地址无效"},
    {"upload_failed","发生错误\n录音上传失败"},
    {"transcript_too_large","识别内容过长\n请缩短说话时间"},
    {"input_too_large","输入内容过长\n请清空对话后重试"},
    {"response_timeout","云端响应超时\n请重试"},
    {"response_too_large","云端回复过长\n请重试"},
    {"reply_too_large","云端回复过长\n请重试"},
    {"reply_truncated","云端回复不完整\n请重试"},
    {"unsupported_reply","云端回复格式不支持"},
    {"incomplete_response","云端回复不完整\n请检查网络"},
    {"empty_reply","云端回复为空\n请重试"},
    {"playback_timeout","朗读超时\n请重试"},
    {"invalid_audio","发生错误\n语音格式无效"},
    {"synthesis_failed","语音生成失败\n请检查云端配置"},
    {"incomplete_audio","语音不完整\n请检查网络"},
    {"playback_failed","语音播放失败\n请重试"},
    {"playback_write_failed","语音输出失败\n请重试"},
    {"playback_underrun","语音播放缓冲不足\n请重试"}
};
static const label_entry_t pets[]={
    {"idle","云端待机"},{"sleeping","正在休息"},{"drowsy","有点困了"},
    {"bored","等待互动"},{"waking","正在醒来"},{"powering-down","准备休息"},
    {"listening","正在聆听"},{"thinking","正在思考"},{"searching","正在搜索"},
    {"reading","正在阅读"},{"writing","正在书写"},{"working","正在工作"},
    {"loading","正在准备"},{"progress","正在处理"},{"radar","正在查找"},
    {"orbit","正在运转"},{"dictating","正在听写"},{"uploading","正在识别"},
    {"sending","正在发送"},{"receiving","正在接收"},{"messaging","正在交流"},
    {"waiting","等待确认"},{"spawning","正在启动"},{"composing","正在回复"},
    {"dragging","正在移动"},{"happy","开心"},{"excited","兴奋"},
    {"laughing","开怀大笑"},{"playful","一起玩耍"},{"proud","很有成就感"},
    {"celebrate","已完成"},{"bouncing","活力满满"},{"shy","害羞"},
    {"sad","难过"},{"angry","生气"},{"confused","有点疑惑"},
    {"suspicious","有点怀疑"},{"surprised","惊讶"},{"scared","有点害怕"},
    {"curious","充满好奇"},{"humming","轻声哼唱"},{"alerting","发生错误\n请重试"},
    {"notifying","有新消息"},{"refusing","暂时无法完成"}
};
static const char *lookup(const label_entry_t *entries,size_t count,const char *id){
    if(id)for(size_t i=0;i<count;i++)if(!strcmp(id,entries[i].id))return entries[i].label;
    return NULL;
}
const char *ib_ui_assistant_label(ib_ui_assistant_phase_t phase,bool standalone,const char *error_code){
    if((unsigned)phase>=IB_UI_ASSIST_COUNT)return phases[IB_UI_ASSIST_ERROR];
    if(phase==IB_UI_ASSIST_IDLE&&!standalone)return desktop;
    if(phase==IB_UI_ASSIST_ERROR){const char *label=lookup(errors,COUNT(errors),error_code);if(label)return label;}
    return phases[phase];
}
const char *ib_ui_connection_label(ib_ui_connection_hint_t hint){
    return (unsigned)hint<IB_UI_CONN_COUNT?connections[hint]:connections[IB_UI_CONN_WAITING];
}
const char *ib_ui_pet_label(const char *state,bool standalone){
    if(state&&!strcmp(state,"idle")&&!standalone)return desktop;
    const char *label=lookup(pets,COUNT(pets),state);
    return label?label:phases[IB_UI_ASSIST_ERROR];
}
size_t ib_ui_label_count(void){return COUNT(phases)+COUNT(connections)+COUNT(errors)+COUNT(pets)+1+COUNT(run_mode_text)+COUNT(conversation_text)+COUNT(conversation_errors);}
const char *ib_ui_label_at(size_t index){
    if(index<COUNT(phases))return phases[index];
    index-=COUNT(phases);
    if(index<COUNT(connections))return connections[index];
    index-=COUNT(connections);
    if(index<COUNT(errors))return errors[index].label;
    index-=COUNT(errors);
    if(index<COUNT(pets))return pets[index].label;
    index-=COUNT(pets);
    if(index==0)return desktop;
    index--;
    if(index<COUNT(run_mode_text))return run_mode_text[index];
    index-=COUNT(run_mode_text);
    if(index<COUNT(conversation_text))return conversation_text[index];
    index-=COUNT(conversation_text);
    return index<COUNT(conversation_errors)?conversation_errors[index].label:NULL;
}
