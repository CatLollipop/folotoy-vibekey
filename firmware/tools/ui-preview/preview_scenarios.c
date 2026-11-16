// tools/ui-preview/preview_scenarios.c: 预览场景实现。
//
// 场景是一条连续的"剧本":与真机一样只通过 ib_ui.h 的公开接口改变界面(这些调用与 ib_app.c 中的一致),
// 用 preview_advance() 推进虚拟时间,在关键时刻截图——包括动画中途的帧(文件名带 _<N>ms,
// N 为距离触发调用的毫秒数)。页面切换是"淡出 120 ms 后再淡入 180 ms",所以 _fade_60ms 是旧页面
// 正在淡出、_fade_200ms 是新页面正在淡入。
// 新增场景时按顺序追加即可;编号决定输出文件的排序。
#include "preview_scenarios.h"

#include "ib_ui.h"
#include "lvgl.h"
#include "ib_reply_store.h"
#include "ib_notification.h"
#include "ib_crc32.h"
#include "ib_ui_hints.h"
#include "ib_cloud_stream.h"
#include "preview_host.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const char *s_out_dir;
static const char *s_filter;
static int s_scale;
static int s_index;
static int s_failures;

static void shot(const char *name)
{
    char path[512];
    s_index++;
    snprintf(path, sizeof(path), "%s/%02d_%s.png", s_out_dir, s_index, name);
    if (s_filter && !strstr(path, s_filter)) return;
    if (preview_capture(path, s_scale)) {
        printf("  %s\n", path);
    } else {
        fprintf(stderr, "保存失败:%s\n", path);
        s_failures++;
    }
}

static void keys(ib_icon_t up, ib_icon_t down, ib_icon_t ok)
{
    ib_ui_set_key_icon(IB_UI_KEY_UP, up);
    ib_ui_set_key_icon(IB_UI_KEY_DOWN, down);
    ib_ui_set_key_icon(IB_UI_KEY_OK, ok);
}

// 模拟一段说话的电平起伏(每 100 ms 一个值),让声波截图里有高有低的历史柱。
static void speak(void)
{
    static const uint8_t LEVELS[] = { 10, 45, 85, 60, 25, 70, 95, 55, 20, 5, 0, 35, 80, 65, 30, 50, 90, 40 };
    for (unsigned i = 0; i < sizeof(LEVELS); i++) {
        ib_ui_set_level(LEVELS[i]);
        preview_advance(100);
    }
}

static void set_list(uint16_t sel, uint16_t top)
{
    static const char *const APPS[] = { "Ghostty", "Chrome", "Xcode", "Finder", "Mail", "Notes", "Slack" };
    const uint16_t n = (uint16_t)(sizeof(APPS) / sizeof(APPS[0]));
    ib_ui_list_t l;
    memset(&l, 0, sizeof(l));
    snprintf(l.title, sizeof(l.title), "SWITCH APP");
    for (uint16_t i = 0; i < IB_UI_LIST_ROWS && top + i < n; i++) {
        snprintf(l.items[i], sizeof(l.items[i]), "%s", APPS[top + i]);
        l.rows = (uint8_t)(i + 1);
    }
    l.n = n;
    l.top = top;
    l.sel = sel;
    ib_ui_set_list(&l);
}

static void set_chinese_list(void)
{
    static const char *const ITEMS[] = {
        "像素黑客风", "语音输入体验", "Passport 固件", "FoloVibe Key", "会话切换",
    };
    ib_ui_list_t l;
    memset(&l, 0, sizeof(l));
    snprintf(l.title, sizeof(l.title), "CODEX PROJECT");
    for (uint16_t i = 0; i < sizeof(ITEMS) / sizeof(ITEMS[0]); i++) {
        snprintf(l.items[i], sizeof(l.items[i]), "%s", ITEMS[i]);
    }
    l.rows = (uint8_t)(sizeof(ITEMS) / sizeof(ITEMS[0]));
    l.n = l.rows;
    l.sel = 0;
    l.top = 0;
    ib_ui_set_list(&l);
}

int preview_run_scenarios(const char *out_dir, int scale, const char *filter)
{
    s_out_dir = out_dir;
    s_scale = scale;
    s_filter = filter;
    s_index = 0;
    s_failures = 0;

    // ---- OFFLINE:Mac 未连接,USB 线插着 ----
    ib_ui_set_link(IB_UI_LINK_USB, false);
    ib_ui_set_battery(87, false);
    ib_ui_set_clock("23:41", "THU 10/15");
    ib_ui_set_connection_hint(IB_UI_CONN_RECONNECT);
    preview_advance(1500);
    shot("offline_clock");
    ib_ui_set_connection_hint(IB_UI_CONN_CONNECTING);
    preview_advance(200);
    shot("offline_connecting");

    // ---- IDLE:握手后 Mac 下发 config / keys / state ----
    ib_ui_set_link(IB_UI_LINK_USB, true);
    ib_ui_set_engine("Whisper Turbo");
    keys(IB_ICON_ENTER, IB_ICON_ESC, IB_ICON_MIC);
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_DICT, "");
    preview_advance(60);
    shot("offline_to_idle_fade_60ms");
    preview_advance(140);
    shot("offline_to_idle_fade_200ms");
    preview_advance(1000);
    shot("idle_dict");

    keys(IB_ICON_BKSP, IB_ICON_DEL, IB_ICON_MIC);    // 上 / 下键映射为 Backspace / Delete
    preview_advance(400);
    shot("idle_dict_delete_keys");
    keys(IB_ICON_ENTER, IB_ICON_ESC, IB_ICON_MIC);
    preview_advance(400);

    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_TR, "");      // 模式切换:左右滑动
    preview_advance(100);
    shot("idle_dict_to_tr_100ms");
    preview_advance(600);
    shot("idle_tr");

    keys(IB_ICON_MODE, IB_ICON_HIDE, IB_ICON_PLAY);
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_SUB, "");
    preview_advance(700);
    shot("idle_sub");
    ib_ui_key_press(IB_UI_KEY_OK);                  // 按键反馈:图标与边缘标记 60 ms 冲到白,再回落
    preview_advance(60);
    shot("idle_sub_press_ok_60ms");
    preview_advance(140);
    shot("idle_sub_press_ok_200ms");
    preview_advance(400);

    // ---- USAGE:进入 Agent 时先显示的用量首页 ----
    ib_ui_usage_t usage;
    memset(&usage, 0, sizeof(usage));
    snprintf(usage.app, sizeof(usage.app), "CODEX");
    snprintf(usage.today, sizeof(usage.today), "43,051,522");
    snprintf(usage.week, sizeof(usage.week), "43,051,522");
    snprintf(usage.total, sizeof(usage.total), "4,938,713,816");
    snprintf(usage.reset, sizeof(usage.reset), "4D 2H");
    snprintf(usage.plan, sizeof(usage.plan), "PLUS");
    usage.tab = 0;
    usage.left_percent = 7;
    usage.has_quota = true;
    usage.five_hour_left_percent = 63;
    usage.has_five_hour_quota = true;
    snprintf(usage.five_hour_reset, sizeof(usage.five_hour_reset), "2H 10M");
    usage.credits = 0;
    usage.ready = true;
    ib_ui_set_usage(&usage);
    keys(IB_ICON_UP, IB_ICON_DOWN, IB_ICON_MIC);
    ib_ui_show(IB_UI_USAGE, IB_UI_MODE_DICT, "");
    preview_advance(300);
    shot("usage_today");
    usage.tab = 2;
    ib_ui_set_usage(&usage);
    preview_advance(100);
    shot("usage_total");

    usage.tab = 0;
    usage.has_panel = true;
    snprintf(usage.panel_label[0], sizeof(usage.panel_label[0]), "5H LEFT");
    snprintf(usage.panel_value[0], sizeof(usage.panel_value[0]), "63%%");
    usage.panel_percent[0] = 63;
    usage.panel_has_percent[0] = true;
    snprintf(usage.panel_row_detail[0], sizeof(usage.panel_row_detail[0]), "5H RESET 2H 10M");
    snprintf(usage.panel_label[1], sizeof(usage.panel_label[1]), "WEEK LEFT");
    snprintf(usage.panel_value[1], sizeof(usage.panel_value[1]), "7%%");
    usage.panel_percent[1] = 7;
    usage.panel_has_percent[1] = true;
    snprintf(usage.panel_row_detail[1], sizeof(usage.panel_row_detail[1]), "WEEK RESET 4D 2H");
    snprintf(usage.panel_footer_left, sizeof(usage.panel_footer_left), "PLAN PLUS");
    snprintf(usage.panel_footer_right, sizeof(usage.panel_footer_right), "CREDITS 0");
    ib_ui_set_usage(&usage);
    preview_advance(100);
    shot("usage_codex_panel");

    snprintf(usage.app, sizeof(usage.app), "DSH");
    snprintf(usage.today, sizeof(usage.today), "347,103,089");
    snprintf(usage.week, sizeof(usage.week), "347,103,089");
    snprintf(usage.total, sizeof(usage.total), "2,345,563,337");
    usage.tab = 0;
    usage.has_quota = false;
    usage.has_five_hour_quota = false;
    usage.credits = -1;
    usage.reset[0] = '\0';
    snprintf(usage.plan, sizeof(usage.plan), "DEEPSEEK");
    usage.has_panel = true;
    snprintf(usage.panel_label[0], sizeof(usage.panel_label[0]), "CONTEXT");
    snprintf(usage.panel_value[0], sizeof(usage.panel_value[0]), "19%%");
    usage.panel_percent[0] = 19;
    usage.panel_has_percent[0] = true;
    usage.panel_row_detail[0][0] = '\0';
    usage.panel_row_detail[1][0] = '\0';
    snprintf(usage.panel_label[1], sizeof(usage.panel_label[1]), "SESSIONS");
    snprintf(usage.panel_value[1], sizeof(usage.panel_value[1]), "136");
    usage.panel_has_percent[1] = false;
    snprintf(usage.panel_detail, sizeof(usage.panel_detail), "LAST 2H");
    snprintf(usage.panel_footer_left, sizeof(usage.panel_footer_left), "DEEPSEEK-V4.1");
    snprintf(usage.panel_footer_right, sizeof(usage.panel_footer_right), "TURNS 228");
    ib_ui_set_usage(&usage);
    preview_advance(100);
    shot("usage_dsh_no_quota");
    snprintf(usage.app, sizeof(usage.app), "CLAUDE");
    snprintf(usage.today, sizeof(usage.today), "1,823,400");
    snprintf(usage.week, sizeof(usage.week), "8,231,450");
    snprintf(usage.total, sizeof(usage.total), "18,231,450");
    snprintf(usage.panel_label[0], sizeof(usage.panel_label[0]), "SESSIONS");
    snprintf(usage.panel_value[0], sizeof(usage.panel_value[0]), "12");
    usage.panel_has_percent[0] = false;
    snprintf(usage.panel_label[1], sizeof(usage.panel_label[1]), "TURNS");
    snprintf(usage.panel_value[1], sizeof(usage.panel_value[1]), "48");
    usage.panel_row_detail[0][0] = '\0';
    usage.panel_row_detail[1][0] = '\0';
    snprintf(usage.panel_detail, sizeof(usage.panel_detail), "LAST 2H");
    snprintf(usage.panel_footer_left, sizeof(usage.panel_footer_left), "CLAUDE-OPUS-5");
    snprintf(usage.panel_footer_right, sizeof(usage.panel_footer_right), "PROJECTS 4");
    ib_ui_set_usage(&usage);
    preview_advance(100);
    shot("usage_claude_meta");
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_DICT, "TAP OK: USAGE");
    preview_advance(300);
    shot("idle_usage_hint");
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_DICT, "");
    preview_advance(300);

    // ---- REC:按住说话 → 免提 → 翻译模式 ----
    keys(IB_ICON_NONE, IB_ICON_CANCEL, IB_ICON_STOP);
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_DICT, "");
    preview_advance(400);
    ib_ui_set_ok_held(true);
    ib_ui_set_level(15);
    ib_ui_show(IB_UI_REC, IB_UI_MODE_DICT, "");
    preview_advance(60);
    shot("idle_to_rec_fade_60ms");
    preview_advance(140);
    shot("idle_to_rec_fade_200ms");
    preview_advance(1000);
    shot("rec_hold_low_level");
    speak();
    shot("rec_speaking");
    preview_advance(33);
    shot("rec_speaking_next_frame");                // 与上一张相比整体外移 2 px:流动连续
    ib_ui_set_level(90);
    preview_advance(600);
    shot("rec_hold_high_level");
    ib_ui_set_ok_held(false);
    ib_ui_set_level(50);
    preview_advance(400);
    shot("rec_handsfree");
    ib_ui_show(IB_UI_REC, IB_UI_MODE_TR, "");
    preview_advance(400);
    shot("rec_translate");
    ib_ui_set_level(0);

    // ---- PROC / DONE / ERR ----
    keys(IB_ICON_NONE, IB_ICON_NONE, IB_ICON_NONE);
    ib_ui_show(IB_UI_PROC, IB_UI_MODE_DICT, "");
    preview_advance(700);
    shot("proc");

    ib_ui_show(IB_UI_DONE, IB_UI_MODE_DICT, "");
    preview_advance(60);
    shot("proc_to_done_fade_60ms");
    preview_advance(140);
    shot("done_200ms");
    preview_advance(300);
    shot("done_500ms");
    preview_advance(250);
    shot("done_750ms");
    preview_advance(600);
    shot("done");

    ib_ui_show(IB_UI_ERR, IB_UI_MODE_DICT, "NO SPEECH");
    preview_advance(60);
    shot("done_to_err_fade_60ms");
    preview_advance(150);                           // 淡入开始后约 90 ms:抖动中
    shot("err_shake_210ms");
    preview_advance(700);
    shot("err");

    // ---- SUB:字幕运行中 ----
    keys(IB_ICON_TRANSLATE, IB_ICON_HIDE, IB_ICON_STOP);
    ib_ui_set_level(60);
    ib_ui_set_caption("我们今天把 Passport 的离线页换成绿色像素猫，底部留给点阵时钟。",
                      "We replaced the Passport offline screen with a green pixel cat, leaving the bottom for the dot-matrix clock.",
                      "ego lite", false);
    ib_ui_show(IB_UI_SUB, IB_UI_MODE_SUB, "ego lite");
    preview_advance(300);
    shot("sub_intro_300ms");
    speak();
    shot("sub");
    ib_ui_set_caption("这是一句正在识别、还没有翻译完的中文字幕。", "", "微信", true);
    preview_advance(120);
    shot("sub_live_no_translation");
    ib_ui_set_level(0);

    // ---- LIST:应用切换器(7 项)----
    keys(IB_ICON_UP, IB_ICON_DOWN, IB_ICON_OPEN);
    set_list(0, 0);
    ib_ui_show(IB_UI_LIST, IB_UI_MODE_DICT, "");
    preview_advance(500);
    shot("list_sel0");
    set_list(4, 0);
    preview_advance(60);
    shot("list_sel4_sliding_60ms");
    preview_advance(400);
    shot("list_sel4");
    set_list(6, 1);
    preview_advance(400);
    shot("list_sel6_scrolled");
    set_chinese_list();
    preview_advance(300);
    shot("list_chinese_project");

    // ---- AGENT 通知 ----
    keys(IB_ICON_ENTER, IB_ICON_ESC, IB_ICON_MIC);
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_DICT, "");
    preview_advance(500);
    ib_ui_agent_show(IB_UI_AGENT_DONE, "Claude Code");   // 先铺黑色背景 100 ms,再淡入内容
    preview_advance(50);
    shot("agent_done_backdrop_50ms");
    preview_advance(100);
    shot("agent_done_150ms");
    preview_advance(1500);
    shot("agent_done");
    ib_ui_agent_hide();                                  // 先淡出内容 120 ms,再撤背景 100 ms
    preview_advance(60);
    shot("agent_dismiss_60ms");
    preview_advance(110);
    shot("agent_dismiss_170ms");
    preview_advance(200);

    ib_ui_agent_show(IB_UI_AGENT_INPUT, "Claude Code");
    preview_advance(900);
    shot("agent_input");
    preview_advance(2450);                          // 第二次摇摆的中段
    shot("agent_input_wiggle");
    ib_ui_agent_hide();
    preview_advance(300);

    // 录音中收到通知:只显示顶部横幅
    keys(IB_ICON_NONE, IB_ICON_CANCEL, IB_ICON_STOP);
    ib_ui_set_ok_held(true);
    ib_ui_set_level(40);
    ib_ui_show(IB_UI_REC, IB_UI_MODE_DICT, "");
    preview_advance(300);
    ib_ui_agent_show(IB_UI_AGENT_INPUT, "Claude Code");
    preview_advance(800);
    shot("rec_agent_banner");
    ib_ui_agent_hide();
    ib_ui_set_ok_held(false);
    ib_ui_set_level(0);

    // ---- 状态栏:低电量 / BLE + 充电 ----
    keys(IB_ICON_ENTER, IB_ICON_ESC, IB_ICON_MIC);
    ib_ui_show(IB_UI_IDLE, IB_UI_MODE_DICT, "");
    ib_ui_set_battery(12, false);
    preview_advance(800);
    shot("idle_low_battery");
    ib_ui_set_link(IB_UI_LINK_BLE, true);
    ib_ui_set_battery(64, true);
    preview_advance(300);
    shot("idle_ble_charging");
    ib_ui_set_link(IB_UI_LINK_USB, true);
    ib_ui_set_battery(87, false);

    // ---- Aora Dot：调用真机同一C运行时，非图片或手绘预览 ----
    ib_ui_agent_hide();
    ib_ui_pet_config(true,12,80,0xEADBB9);
    ib_ui_set_engine("CLOUD DIRECT");
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    keys(IB_ICON_NONE,IB_ICON_NONE,IB_ICON_MIC);
    static const char *const pet_states[]={"idle","listening","thinking","composing","celebrate","alerting","sleeping"};
    static const ib_ui_assistant_phase_t pet_phases[]={IB_UI_ASSIST_IDLE,IB_UI_ASSIST_LISTENING,IB_UI_ASSIST_THINKING,IB_UI_ASSIST_REPLYING,IB_UI_ASSIST_DONE,IB_UI_ASSIST_ERROR,IB_UI_ASSIST_COUNT};
    for(unsigned i=0;i<sizeof(pet_states)/sizeof(pet_states[0]);i++){
        ib_ui_pet_assistant_state(pet_states[i],pet_phases[i],true,i==5?"connection_failed":NULL);
        preview_advance(i==4?170:1200);
        char name[80];snprintf(name,sizeof(name),"aora_standalone_%s",pet_states[i]);shot(name);
    }
    ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,true,NULL);
    preview_advance(900);
    ib_ui_show(IB_UI_LIST,IB_UI_MODE_DICT,"");
    preview_advance(300);
    shot("aora_standalone_navigation_overlay");
    ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,false,NULL);
    preview_advance(300);
    shot("aora_desktop_navigation_keeps_list");

    // 真正加载Mac导出包：主题/脸型换入同一C内核，随后离线也不需要Mac帧流。
    static const char *const assets[]={"miso-shades","xm-tree-capsule","sf-goat-screen","vl-kiki-letter-cute","beep-symbol"};
    for(unsigned i=0;i<sizeof(assets)/sizeof(assets[0]);i++){
        char path[512];snprintf(path,sizeof(path),"%s/%s.aorapet",PREVIEW_PET_ASSETS,assets[i]);
        FILE *f=fopen(path,"rb");
        if(!f){fprintf(stderr,"缺少宠物fixture，先运行 tools/test-pet.sh: %s\n",path);s_failures++;continue;}
        fseek(f,0,SEEK_END);long n=ftell(f);rewind(f);uint8_t *bundle=malloc(n>0?(size_t)n:1);
        if(n<=0||!bundle||fread(bundle,1,(size_t)n,f)!=(size_t)n||!ib_ui_pet_load(bundle,(size_t)n)){
            fclose(f);free(bundle);s_failures++;continue;
        }
        fclose(f);
        ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");ib_ui_pet_assistant_state("happy",IB_UI_ASSIST_DONE,true,NULL);preview_advance(900);
        char name[96];snprintf(name,sizeof(name),"aora_selected_%s",assets[i]);shot(name);
        ib_ui_show(IB_UI_OFFLINE,IB_UI_MODE_DICT,"");preview_advance(1100);
        snprintf(name,sizeof(name),"aora_offline_%s",assets[i]);shot(name);
        // 模拟Flash解映射之前，必须成功把运行时切回内置数据。
        if(!ib_ui_pet_load(NULL,0))s_failures++;
        free(bundle);
    }

    // 中文业务状态/错误/离线提示：同一真实UI接口与OFL字体，不模拟绘制文字。
    static const char *const status_names[]={"idle","preparing","listening","transcribing","thinking","replying","done","error","stopped","speaking"};
    static const char *const status_pets[]={"idle","loading","listening","uploading","thinking","composing","celebrate","alerting","powering-down","humming"};
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    for(unsigned i=0;i<IB_UI_ASSIST_COUNT;i++){
        ib_ui_set_assistant_key_hints(true,(ib_ui_assistant_phase_t)i);
        ib_ui_pet_assistant_state(status_pets[i],(ib_ui_assistant_phase_t)i,true,NULL);preview_advance(420);
        char name[96];snprintf(name,sizeof(name),"chinese_cloud_%s",status_names[i]);shot(name);
    }
    ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,false,NULL);preview_advance(400);shot("chinese_desktop_assistant");
    ib_ui_pet_assistant_state("alerting",IB_UI_ASSIST_ERROR,false,"check_mac");preview_advance(400);shot("chinese_desktop_check_mac");
    ib_ui_pet_assistant_state("alerting",IB_UI_ASSIST_ERROR,true,"authentication_failed");preview_advance(400);shot("chinese_cloud_auth_error");
    ib_ui_pet_assistant_state("alerting",IB_UI_ASSIST_ERROR,true,"recording_overflow");preview_advance(400);shot("chinese_cloud_recording_error");
    ib_ui_pet_assistant_state("working",IB_UI_ASSIST_COUNT,false,NULL);preview_advance(400);shot("chinese_canonical_working");
    ib_ui_pet_assistant_state("searching",IB_UI_ASSIST_COUNT,false,NULL);preview_advance(400);shot("chinese_canonical_searching");
    ib_ui_show(IB_UI_OFFLINE,IB_UI_MODE_DICT,"");
    for(unsigned i=0;i<IB_UI_CONN_COUNT;i++){
        ib_ui_set_connection_hint((ib_ui_connection_hint_t)i);preview_advance(200);
        char name[96];snprintf(name,sizeof(name),"chinese_offline_%02u",i);shot(name);
    }

    // 本地运行模式菜单：当前check与高亮选择独立，网络迟到状态/数据不能覆盖。
    ib_ui_agent_hide();ib_ui_set_assistant_key_hints(false,IB_UI_ASSIST_IDLE);
    ib_ui_run_mode_menu(false,0,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(600);shot("run_mode_companion_select_assistant");
    ib_ui_list_t late={0};snprintf(late.title,sizeof(late.title),"LATEST SESSION");late.rows=late.n=1;
    snprintf(late.items[0],sizeof(late.items[0]),"最新会话");
    ib_ui_set_list(&late);ib_ui_show(IB_UI_REC,IB_UI_MODE_TR,"LATE MAC STATE");
    keys(IB_ICON_SEND,IB_ICON_STOP,IB_ICON_MIC);
    ib_ui_set_caption("真正的会话正文保持原样","Original session text is preserved","Test App",true);
    ib_ui_agent_show(IB_UI_AGENT_INPUT,"LATE AGENT");
    preview_advance(600);shot("run_mode_survives_remote_updates");
    for(unsigned i=IB_UI_RUN_MODE_NOTICE_BUSY;i<IB_UI_RUN_MODE_NOTICE_COUNT;i++){
        ib_ui_run_mode_menu(false,0,(ib_ui_run_mode_notice_t)i);preview_advance(300);
        char name[96];snprintf(name,sizeof(name),"run_mode_notice_%02u",i);shot(name);
    }
    ib_ui_run_mode_menu(true,1,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(400);shot("run_mode_assistant_select_computer");
    ib_ui_run_mode_menu(true,2,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(400);shot("run_mode_return_selected");
    ib_ui_run_mode_menu_hide();ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");preview_advance(600);shot("run_mode_closed_latest_agent");
    ib_ui_agent_hide();preview_advance(300);ib_ui_show(IB_UI_LIST,IB_UI_MODE_DICT,"");preview_advance(400);shot("run_mode_closed_latest_list");
    ib_ui_show(IB_UI_SUB,IB_UI_MODE_SUB,"");preview_advance(400);shot("run_mode_closed_latest_caption");
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_IDLE);ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,true,NULL);preview_advance(500);shot("edge_hints_standalone_idle");
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_LISTENING);ib_ui_pet_assistant_state("listening",IB_UI_ASSIST_LISTENING,true,NULL);preview_advance(500);shot("edge_hints_recording");
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_SPEAKING);ib_ui_pet_assistant_state("humming",IB_UI_ASSIST_SPEAKING,true,NULL);preview_advance(500);shot("edge_hints_playback");
    ib_ui_set_assistant_key_hints(false,IB_UI_ASSIST_IDLE);keys(IB_ICON_SEND,IB_ICON_STOP,IB_ICON_MIC);
    ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,false,NULL);preview_advance(500);shot("edge_hints_companion_idle");
    ib_ui_show(IB_UI_OFFLINE,IB_UI_MODE_DICT,"");preview_advance(500);shot("edge_hints_offline");

    // 只验证真实增量接口的固定文字夹具；不是ASR识别结果或计时模拟字幕。
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_LISTENING);
    ib_ui_pet_assistant_state("listening",IB_UI_ASSIST_LISTENING,true,NULL);
    ib_ui_transcript_begin(100);ib_ui_transcript_update(100,"这是用于验证字幕显示区域的固定测试文字，不代表实际语音识别结果。",false);
    preview_advance(500);shot("transcript_fixture_two_line_tail");
    // 比较字幕不变时暂停背景宠物帧，避免眨眼/弹簧差异干扰像素断言。
    ib_ui_set_awake(false);
    ib_ui_transcript_update(100,"固定测试最终文本：第二行完整显示，阶段和按钮提示仍清晰可见。",true);
    preview_advance(400);shot("transcript_fixture_final_frozen");
    ib_ui_transcript_update(100,"迟到partial不应该覆盖最终文本",false);
    preview_advance(400);shot("transcript_fixture_late_partial_ignored");
    ib_ui_set_awake(true);
    ib_ui_pet_assistant_state("alerting",IB_UI_ASSIST_ERROR,true,"authentication_failed");
    preview_advance(400);ib_ui_set_awake(false);shot("transcript_fixture_error_overrides");
    ib_ui_transcript_update(100,"错误后迟到的文本",true);
    preview_advance(400);shot("transcript_fixture_error_rejects_late");
    ib_ui_set_awake(true);
    ib_ui_transcript_begin(101);ib_ui_pet_assistant_state("listening",IB_UI_ASSIST_LISTENING,true,NULL);
    ib_ui_transcript_update(101,"新一轮固定布局测试文字。",false);
    ib_ui_pet_assistant_state("powering-down",IB_UI_ASSIST_STOPPED,true,NULL);
    preview_advance(400);shot("transcript_fixture_cancel_clears");

    // 真实生产store + LVGL reader生命周期；正文是明确的离线布局夹具，不是模型输出。
    static const char reply[]="这是一段完整回复的离线布局测试正文。请使用上键和下键逐页阅读全部内容，不会只保留末尾两行。第二级汉字亍丕乜卮氐胤爰甬，与emoji🙂和生僻字龘也要占据明确字宽，缺字用方框显示。\n第二段包含完整的中文说明与EnglishWordsWithoutSpaces1234567890。页面应保持上方宠物完整可见，底部不再出现绿色时间栏和分隔线。";
    ib_ui_set_awake(true);ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_REPLYING);ib_ui_pet_assistant_state("composing",IB_UI_ASSIST_REPLYING,true,NULL);
    ib_reply_store_clear(0);
    if(ib_reply_store_begin(200,NULL)||!ib_ui_reply_begin(200))s_failures++;
    size_t partial=ib_utf8_prefix(reply,strlen(reply),90);
    if(ib_reply_store_append(200,0,reply,partial)||!ib_ui_reply_update(200,partial,false,ib_reply_store_read,NULL))s_failures++;
    preview_advance(400);shot("reply_quiet_partial");
    for(size_t offset=partial;offset<strlen(reply);){size_t length=ib_utf8_prefix(reply+offset,strlen(reply)-offset,192);
        if(!length||ib_reply_store_append(200,offset,reply+offset,length)){s_failures++;break;}offset+=length;}
    if(ib_reply_store_final(200,strlen(reply))||!ib_ui_reply_update(200,strlen(reply),true,ib_reply_store_read,NULL))s_failures++;
    ib_ui_pet_assistant_state("happy",IB_UI_ASSIST_DONE,true,NULL);ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_DONE);
    preview_advance(400);shot("reply_quiet_first_page");
    if(!ib_ui_reply_page(1))s_failures++;preview_advance(400);shot("reply_quiet_next_page");
    ib_ui_reply_page(9999);preview_advance(400);shot("reply_quiet_last_page");
    if(!ib_ui_reply_update(200,strlen(reply),true,ib_reply_store_read,NULL))s_failures++; // 同一final回执重试幂等。
    ib_ui_set_awake(false);shot("reply_quiet_final_frozen");
    if(ib_ui_reply_update(200,partial,false,ib_reply_store_read,NULL))s_failures++;
    shot("reply_quiet_late_partial_ignored");
    ib_reply_store_clear(200);
    if(ib_ui_reply_page(-1)||ib_ui_reply_visible())s_failures++; // reader失效后不得UAF或保留旧正文。
    if(!ib_ui_reply_clear(200)||ib_reply_store_begin(201,NULL)||!ib_ui_reply_begin(201))s_failures++;
    static const char next[]="新一轮回复，旧正文已经清理。";
    if(ib_reply_store_append(201,0,next,strlen(next))||ib_reply_store_final(201,strlen(next))||
       !ib_ui_reply_update(201,strlen(next),true,ib_reply_store_read,NULL))s_failures++;
    ib_ui_set_awake(true);preview_advance(400);shot("reply_quiet_new_generation");
    ib_ui_run_mode_menu(true,1,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(400);shot("reply_quiet_mode_menu");
    ib_ui_run_mode_menu_hide();ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    ib_ui_reply_clear(0);ib_reply_store_clear(0);
    if(ib_reply_store_begin(0xf0000000u,NULL)||!ib_ui_reply_begin(0xf0000000u))s_failures++;
    if(ib_reply_store_append(0xf0000000u,0,next,strlen(next))||ib_reply_store_final(0xf0000000u,strlen(next))||
       !ib_ui_reply_update(0xf0000000u,strlen(next),true,ib_reply_store_read,NULL))s_failures++;
    ib_ui_reply_clear(0);ib_reply_store_clear(0);
    if(ib_reply_store_begin(3,NULL)||!ib_ui_reply_begin(3))s_failures++;
    if(ib_reply_store_append(3,0,next,strlen(next))||ib_reply_store_final(3,strlen(next))||
       !ib_ui_reply_update(3,strlen(next),true,ib_reply_store_read,NULL))s_failures++;
    if(ib_ui_reply_update(0xf0000000u,strlen(next),true,ib_reply_store_read,NULL))s_failures++;
    preview_advance(100);shot("reply_quiet_new_connection_small_generation");
    ib_ui_reply_clear(0);ib_reply_store_clear(0);
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_IDLE);ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,true,NULL);
    if(!ib_ui_present_boot_frame())s_failures++;
    preview_advance(100);shot("reply_quiet_idle_no_footer");
    // 背光开启前强制提交所选猫的缓存，不能把上一次Dot缓存当作已选资产首帧。
    char boot_path[512];snprintf(boot_path,sizeof(boot_path),"%s/miso-shades.aorapet",PREVIEW_PET_ASSETS);
    FILE *boot_file=fopen(boot_path,"rb");
    if(boot_file){
        fseek(boot_file,0,SEEK_END);long boot_size=ftell(boot_file);rewind(boot_file);void *boot_data=malloc((size_t)boot_size);
        if(!boot_data||fread(boot_data,1,(size_t)boot_size,boot_file)!=(size_t)boot_size||!ib_ui_pet_load(boot_data,(size_t)boot_size)||!ib_ui_present_boot_frame())s_failures++;
        else shot("reply_quiet_selected_pet_boot_frame");
        fclose(boot_file);ib_ui_pet_load(NULL,0);free(boot_data);
    }else s_failures++;
    // 成功轮次后真实worker会后台预擦下一录音槽：store revision不变，UI不得清正文。
    ib_ui_reply_clear(0);ib_reply_store_clear(0);
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_DONE);
    if(ib_reply_store_begin(500,NULL)||!ib_ui_reply_begin(500))s_failures++;
    for(size_t offset=0;offset<strlen(reply);){size_t length=ib_utf8_prefix(reply+offset,strlen(reply)-offset,192);
        if(!length||ib_reply_store_append(500,offset,reply+offset,length)){s_failures++;break;}offset+=length;}
    if(ib_reply_store_final(500,strlen(reply))||!ib_ui_reply_update(500,strlen(reply),true,ib_reply_store_read,NULL))s_failures++;
    ib_ui_pet_assistant_state("happy",IB_UI_ASSIST_DONE,true,NULL);preview_advance(400);ib_ui_set_awake(false);
    shot("reply_051_before_background_prepare");
    uint32_t retained_pixels=preview_region_hash(20,240,200,80);
    ib_reply_snapshot_t retained_before,retained_after;ib_reply_store_snapshot(&retained_before);
    ib_ui_pet_assistant_state("loading",IB_UI_ASSIST_PREPARING,true,NULL);
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_PREPARING);
    ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,true,NULL);
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_IDLE);
    ib_reply_store_snapshot(&retained_after);
    bool retained=ib_ui_reply_visible();
    printf("Reply retained after DONE/PREPARING/IDLE: visible=%d store_final=%d revision_unchanged=%d\n",retained,retained_after.final,retained_after.revision==retained_before.revision);
    if(!retained||!retained_after.final||retained_after.revision!=retained_before.revision)s_failures++;
    shot("reply_051_after_background_prepare_idle");
    if(preview_region_hash(20,240,200,80)!=retained_pixels)s_failures++;
    if(!ib_ui_reply_page(1))s_failures++;
    shot("reply_051_after_prepare_next_page");
    uint32_t next_page_pixels=preview_region_hash(20,240,200,80);
    if(next_page_pixels==retained_pixels)s_failures++;
    ib_ui_run_mode_menu(true,1,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(400);
    ib_ui_run_mode_menu_hide();ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");preview_advance(400);
    if(!ib_ui_reply_visible())s_failures++;
    shot("reply_051_after_prepare_menu_restore");
    if(preview_region_hash(20,240,200,80)!=next_page_pixels)s_failures++;
    // 旧pet_state入口不允许重写已发布正文，状态回放也不改变当前页。
    ib_ui_pet_state("idle","旧接口不能覆盖正文",true);
    if(!ib_ui_reply_visible())s_failures++;
    shot("reply_051_legacy_state_keeps_body");
    if(preview_region_hash(20,240,200,80)!=next_page_pixels)s_failures++;
    ib_ui_reply_clear(0);ib_reply_store_clear(0);
    ib_ui_set_capture_active(false);ib_ui_set_awake(true);
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_IDLE);ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,true,NULL);
    preview_advance(500);shot("layout_051_idle_centered_no_reply_box");
    unsigned neutral_animations=lv_anim_count_running();
    ib_ui_pet_assistant_state("listening",IB_UI_ASSIST_LISTENING,true,NULL);
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_LISTENING);
    if(lv_anim_count_running()!=neutral_animations)s_failures++;
    shot("capture_051_phase_without_reader_neutral");
    ib_ui_set_capture_active(true);
    if(lv_anim_count_running()!=neutral_animations+1)s_failures++;
    preview_advance(200);shot("capture_051_reader_active_green");
    preview_advance(500);shot("capture_051_reader_active_green_pulse");
    ib_ui_set_capture_active(false);
    if(lv_anim_count_running()!=neutral_animations)s_failures++;
    preview_advance(100);shot("capture_051_reader_stopped_neutral");
    ib_ui_set_capture_active(true);ib_ui_set_awake(false);preview_advance(2000);
    if(lv_anim_count_running()!=neutral_animations)s_failures++;
    ib_ui_set_awake(true);
    if(lv_anim_count_running()!=neutral_animations+1)s_failures++;
    ib_ui_run_mode_menu(true,1,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(500);
    if(lv_anim_count_running()!=neutral_animations)s_failures++;
    ib_ui_run_mode_menu_hide();ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");preview_advance(500);
    if(lv_anim_count_running()!=neutral_animations+1)s_failures++;
    ib_ui_set_capture_active(false);
    if(lv_anim_count_running()!=neutral_animations)s_failures++;
    printf("Capture cue: real flag on/off, sleep/menu stop loop, wake restores only active reader; base animations=%u\n",neutral_animations);
    // 本地模式菜单首帧就完整显示，进入/退出都不经过旧READY淡出。
    ib_ui_set_capture_active(false);ib_ui_reply_clear(0);ib_reply_store_clear(0);ib_ui_notification_hide();
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");ib_ui_set_awake(true);
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_IDLE);ib_ui_pet_assistant_state("idle",IB_UI_ASSIST_IDLE,true,NULL);
    preview_advance(400);shot("next_idle_activity_icon");
    ib_ui_run_mode_menu(true,1,IB_UI_RUN_MODE_NOTICE_NONE);shot("next_mode_menu_000ms");
    uint32_t menu_pixels=preview_region_hash(0,24,240,296);
    preview_advance(20);shot("next_mode_menu_020ms");if(preview_region_hash(0,24,240,296)!=menu_pixels)s_failures++;
    preview_advance(40);shot("next_mode_menu_060ms");if(preview_region_hash(0,24,240,296)!=menu_pixels)s_failures++;
    preview_advance(300);shot("next_mode_menu_settled");if(preview_region_hash(0,24,240,296)!=menu_pixels)s_failures++;
    ib_ui_run_mode_menu_hide();shot("next_mode_menu_return_pending");
    if(preview_region_hash(0,24,240,296)!=menu_pixels)s_failures++;
    ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");shot("next_mode_menu_closed_atomic");
    // 当前读层页数很多时只保留7个圆点，当前页必须始终在窗口中。
    char long_reply[1801];for(size_t i=0;i<sizeof(long_reply)-1;i++)long_reply[i]="0123456789 abcdefghijklmnopqrstuvwxyz"[i%37];long_reply[1800]=0;
    if(ib_reply_store_begin(800,NULL)||!ib_ui_reply_begin(800))s_failures++;
    for(size_t offset=0;offset<1800;){size_t n=1800-offset;if(n>192)n=192;
        if(ib_reply_store_append(800,offset,long_reply+offset,n))s_failures++;offset+=n;}
    if(ib_reply_store_final(800,1800)||!ib_ui_reply_update(800,1800,true,ib_reply_store_read,NULL))s_failures++;
    ib_ui_pet_assistant_state("happy",IB_UI_ASSIST_DONE,true,NULL);ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_DONE);
    preview_advance(300);ib_ui_set_awake(false);shot("next_reply_pips_first");
    ib_hint_pages_t first=ib_hints_page_window();
    if(!first.active||first.count!=7||first.before||!first.after||first.current!=0||ib_hints_current_icon(IB_UI_KEY_UP)!=IB_ICON_MODE||ib_hints_current_icon(IB_UI_KEY_DOWN)!=IB_ICON_DOWN)s_failures++;
    ib_ui_reply_page(12);shot("next_reply_pips_middle");ib_hint_pages_t middle=ib_hints_page_window();
    if(!middle.before||!middle.after||middle.current<middle.first||middle.current>=middle.first+middle.count)s_failures++;
    uint32_t reply_page_pixels=preview_region_hash(20,240,200,80);
    uint32_t pet_before_notice=preview_region_hash(20,24,200,200);
    // 泛用完成通知先无正文，再同事件rev升级完整正文；CRC完整前reader不能用于展示。
    static const char nid[]="0123456789abcdef0123456789abcdef";ib_notification_dismiss();
    if(ib_notification_begin(IB_LINK_USB,nid,1,"Claude Code",IB_NOTIFICATION_DONE,0,0,false,false)||
       ib_notification_commit(IB_LINK_USB,nid,1,0,0))s_failures++;
    ib_notification_snapshot_t notice;ib_notification_snapshot(&notice);
    if(!ib_ui_notification_show(notice.generation,notice.source,IB_UI_NOTIFICATION_COMPLETED,false,0,ib_notification_read,NULL))s_failures++;
    if(ib_hints_page_window().active||!ib_ui_notification_visible()||ib_ui_reply_visible())s_failures++;
    if(!ib_notification_presented(notice.generation)||ib_notification_presented(notice.generation))s_failures++;
    shot("next_notification_source_only");
    // application后台工作不占用设备资源；真实capture仍由UI硬门禁拦截。
    ib_ui_notification_hide();ib_ui_set_assistant_key_hints(false,IB_UI_ASSIST_THINKING);
    if(!ib_ui_notification_show(notice.generation,notice.source,IB_UI_NOTIFICATION_COMPLETED,false,0,ib_notification_read,NULL))s_failures++;
    ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_DONE);
    ib_ui_notification_hide();uint32_t crc=ib_crc32(long_reply,1500);
    if(ib_notification_begin(IB_LINK_USB,nid,2,"Claude Code",IB_NOTIFICATION_DONE,1500,crc,false,false))s_failures++;
    ib_notification_snapshot(&notice);
    if(ib_ui_notification_show(notice.generation,notice.source,IB_UI_NOTIFICATION_COMPLETED,false,1500,ib_notification_read,NULL))s_failures++;
    for(size_t offset=0;offset<1500;){size_t n=1500-offset;if(n>96)n=96;
        if(ib_notification_chunk(IB_LINK_USB,nid,2,offset,long_reply+offset,n))s_failures++;offset+=n;}
    if(ib_notification_commit(IB_LINK_USB,nid,2,1500,crc))s_failures++;ib_notification_snapshot(&notice);
    if(!ib_ui_notification_show(notice.generation,notice.source,IB_UI_NOTIFICATION_COMPLETED,false,1500,ib_notification_read,NULL)||ib_notification_presented(notice.generation))s_failures++;
    shot("next_notification_body_first");ib_ui_notification_page(9);shot("next_notification_body_middle");
    ib_hint_pages_t notice_page=ib_hints_page_window();uint32_t notice_pixels=preview_region_hash(21,224,198,96);
    if(!notice_page.before||!notice_page.after||notice_page.current!=9||notice_page.total==middle.total)s_failures++;
    // 不只查pager getter：生产flush后的真正像素必须保留pet、页轨道与每个实体键。
    unsigned pet_ink=preview_region_ink(20,24,200,200),pip_ink=preview_region_ink(224,82,9,76);
    unsigned up_ink=preview_region_ink(220,62,18,16),down_ink=preview_region_ink(220,162,18,16);
    unsigned mic_ink=preview_region_ink(220,260,18,20),power_ink=preview_region_ink(5,50,14,16);
    if(preview_region_hash(20,24,200,200)!=pet_before_notice||pet_ink<500||pip_ink<20||up_ink<5||down_ink<5||mic_ink<10||power_ink<5)s_failures++;
    printf("Notification visible pixels: pet=%u pips=%u up=%u down=%u mic=%u power=%u; pet unchanged=%u\n",pet_ink,pip_ink,up_ink,down_ink,mic_ink,power_ink,preview_region_hash(20,24,200,200)==pet_before_notice);
    // exact commit不响、不换当前页。菜单开关也不能因store revision不变而丢通知页。
    if(ib_notification_commit(IB_LINK_USB,nid,2,1500,crc)||!ib_ui_notification_show(notice.generation,notice.source,IB_UI_NOTIFICATION_COMPLETED,false,1500,ib_notification_read,NULL)||ib_hints_page_window().current!=9)s_failures++;
    ib_ui_run_mode_menu(true,1,IB_UI_RUN_MODE_NOTICE_NONE);preview_advance(50);
    if(ib_ui_notification_visible()||ib_hints_page_window().active)s_failures++;
    ib_ui_run_mode_menu_hide();ib_ui_show(IB_UI_IDLE,IB_UI_MODE_DICT,"");
    if(!ib_ui_notification_visible()||ib_hints_page_window().current!=9||preview_region_hash(21,224,198,96)!=notice_pixels)s_failures++;
    shot("next_notification_menu_restored");
    ib_ui_notification_hide();ib_notification_dismiss();
    if(!ib_ui_reply_visible()||ib_hints_page_window().current!=middle.current||preview_region_hash(20,240,200,80)!=reply_page_pixels)s_failures++;
    shot("next_notification_closed_reply_restored");ib_ui_reply_page(999);shot("next_reply_pips_last");
    ib_hint_pages_t last=ib_hints_page_window();if(!last.before||last.after||last.current+1!=last.total||ib_hints_current_icon(IB_UI_KEY_DOWN)!=IB_ICON_APPS)s_failures++;
    // 助手关闭宠物显示仍使用自身小状态图标，不能退露旧READY文字。
    ib_ui_reply_clear(0);ib_reply_store_clear(0);ib_ui_pet_config(false,12,80,0xEADBB9);
    ib_ui_pet_assistant_state("thinking",IB_UI_ASSIST_THINKING,true,NULL);ib_ui_set_assistant_key_hints(true,IB_UI_ASSIST_THINKING);ib_ui_set_awake(true);
    preview_advance(200);shot("next_pet_disabled_activity_owned");
    ib_ui_set_capture_active(true);
    if(ib_ui_notification_show(999,"Claude Code",IB_UI_NOTIFICATION_COMPLETED,false,0,NULL,NULL))s_failures++;
    preview_advance(200);shot("next_capture_activity_green");ib_ui_set_capture_active(false);
    ib_ui_pet_assistant_state("alerting",IB_UI_ASSIST_ERROR,true,"authentication_failed");preview_advance(200);shot("next_error_keeps_diagnostic");
    ib_ui_pet_config(true,12,80,0xEADBB9);
    printf("Next UI: atomic menu first frame, one action per key, bounded pips and independent production notification lifecycle checks complete.\n");
    return s_failures;
}
