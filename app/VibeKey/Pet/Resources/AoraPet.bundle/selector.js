'use strict';
// 一个动态角色、其余全是惰性静态SVG。只有白名单选择意图能传给原生，不包含会话/凭据。
(() => {
  const $=id=>document.getElementById(id), C=globalThis.AoraPetCatalog;
  const copy={
    settings:['设置','Settings'],petSettings:['宠物设置','Pet settings'],closeSettings:['关闭设置','Close settings'],settingsCategories:['宠物设置分类','Pet settings categories'],
    desktop:['桌面','Desktop'],passport:['Passport','Passport'],
    desktopIntro:['画风与表情即时应用到桌面挂件。','Styles and expressions update the desktop pet immediately.'],
    showDesktop:['显示桌面宠物','Show desktop pet'],size:['挂件大小','Pet size'],alwaysOnTop:['始终置顶','Always on top'],
    clickThrough:['鼠标穿透','Click through'],reducedMotion:['减少动画','Reduce motion'],resetPosition:['恢复挂件位置','Reset pet position'],
    followHelp:['选择表情后固定显示；打开跟随会话可恢复自动联动。','Choosing an expression holds it. Turn on Follow session to restore automatic changes.'],
    deviceIntro:['外观、脸型、颜色与表情同步到 Passport，设备保持点阵画风。','Sync the appearance, face, color and expression to Passport. Its rendering stays dot matrix.'],
    showDevice:['显示设备宠物','Show device pet'],fps:['动画帧率','Animation frame rate'],brightness:['点阵亮度','Dot brightness'],
    deviceHelp:['同步后生效。离线页始终显示当前宠物。按住设备 OK 说话，松开结束。','Changes take effect after sync. The offline page always shows the current pet. Hold OK to speak; release to finish.'],
    syncPet:['同步到 Passport','Sync to Passport'],syncing:['正在同步宠物…','Syncing pet…'],connectPassport:['连接 Passport 后可同步。','Connect Passport to sync.'],
    notSynced:['同步后以设备回执为准。','Sync is confirmed by the device receipt.'],version:['0.2.0 · 离线运行','0.2.0 · Offline'],
    stage:['宠物实时预览','Live pet preview'],desktopStyle:['桌面画风','Desktop style'],categories:['表情分类','Expression categories'],style:['画风','Style'],color:['颜色','Color'],face:['脸型','Face'],expression:['表情','Expression'],
    follow:['跟随会话','Follow session'],appearance:['外观','Appearance'],
    desktopOnly:['画风应用到桌面挂件，Passport 保持点阵。','Styles apply to the desktop pet. Passport stays dot matrix.'],
    saved:['选择自动保存','Saved automatically'],loading:['正在加载宠物…','Loading pets…'],
    error:['宠物预览暂不可用，请重新加载。','The pet preview could not load. Please reload.'],reload:['重新加载','Reload'],
    search:['搜索外观或主题','Search appearances or themes'],empty:['没有匹配的外观，试试其他名称或主题。','No appearances match. Try another name or theme.'],
    previous:['向前浏览外观','Browse previous appearances'],next:['向后浏览外观','Browse next appearances'],
    fixed:['固定表情','Fixed expression'],live:['跟随会话','Following session'],
    vector:['绘画','Drawing'],pixel:['像素','Pixel'],kaomoji:['颜文字','Kaomoji']
  };
  let locale='zh',appearance={castId:'dot',faceId:'capsule',colorId:'cream',style:'vector',variant:'solid'};
  let state='idle',follow=true,reduced=false,group='resting',pet=null,lastKey='',lookRevision=0,search='';
  let drawerOpen=false,activePane='desktop',restoreFocus=null;
  let prefs={desktopEnabled:true,size:220,alwaysOnTop:true,clickThrough:false,reducedMotion:false,deviceEnabled:true,deviceFPS:12,deviceBrightness:80};
  let syncState={available:false,connected:false,busy:false,status:''};
  const imageCache=new Map(), watched=new Map(), pendingPrefs=new Map();
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const run=watched.get(entry.target);if(run){watched.delete(entry.target);observer.unobserve(entry.target);run();}}},{root:null,rootMargin:'50px'});
  const t=key=>copy[key]?.[locale==='zh'?0:1]||key;
  const name=entry=>locale==='zh'?entry.name:(entry.englishName||entry.id);
  const preset=()=>Aora.castMember(appearance.castId)||Aora.castMember('dot');
  const styleChoice=()=>C.styles.find(s=>s.style===appearance.style&&s.variant===appearance.variant)||C.styles[0];
  function post(action,value){
    const body=action==='follow'?{action,enabled:!!value}:{action,id:String(value)};
    send(body);
  }
  function send(body){window.webkit?.messageHandlers?.petSelection?.postMessage(body);}
  function node(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function button(className,label,action){const b=node('button',className);b.type='button';b.setAttribute('aria-label',label);b.title=label;b.addEventListener('click',action);return b;}
  function cacheImage(options){
    const key=JSON.stringify(options);
    if(imageCache.has(key))return imageCache.get(key);
    const url=Aora.renderStaticSvgDataUrl({...options,sizePx:80,colorScheme:'light'});
    imageCache.set(key,url);if(imageCache.size>192)imageCache.delete(imageCache.keys().next().value);
    return url;
  }
  function thumb(options){return cacheImage({shape:preset().shape,color:appearance.colorId,face:appearance.faceId,state,style:appearance.style,variant:appearance.variant,...options});}
  function setImage(image,options,lazy){
    image.removeAttribute('src');const revision=lookRevision;
    const run=()=>{if(revision!==lookRevision||!image.isConnected)return;try{image.src=thumb(options);}catch{image.alt='';}};
    if(lazy){watched.set(image,run);observer.observe(image);}else run();
  }
  function choice(className,label,selected,onClick,options,lazy=false){
    const b=button(className,label,onClick);b.setAttribute('aria-pressed',String(selected));
    const img=node('img');img.alt='';img.width=48;img.height=48;b.append(img);
    const text=node('span','name',label);b.append(text);b._image=img;b._options=options;b._lazy=lazy;
    return b;
  }
  function attachImages(root){for(const b of root.querySelectorAll('button'))if(b._image)setImage(b._image,b._options,b._lazy);}
  function renderStyles(){
    const root=$('styleOptions');root.replaceChildren();let previous='';
    for(const item of C.styles){
      if(item.group!==previous){root.append(node('div','style-group',t(item.group)));previous=item.group;}
      const b=choice('style-choice',name(item),styleChoice().id===item.id,()=>choose('style',item.id),{style:item.style,variant:item.variant});
      b.dataset.id=item.id;root.append(b);
    }
    attachImages(root);
  }
  function renderColors(){
    const root=$('colorOptions');root.replaceChildren();
    for(const color of C.colors){
      const b=button('color-choice',color.name+' '+color.hex,()=>choose('color',color.id));b.style.setProperty('--swatch',color.hex);
      b.setAttribute('aria-pressed',String(color.id===appearance.colorId));b.dataset.id=color.id;root.append(b);
    }
  }
  function renderFaces(){
    const root=$('faceOptions');root.replaceChildren();
    for(const face of C.faces){const b=choice('thumb-choice',name(face),face.id===appearance.faceId,()=>choose('face',face.id),{face:face.id});b.dataset.id=face.id;root.append(b);}
    attachImages(root);
  }
  function renderStates(){
    const groups=globalThis.AoraPetStateGroups, tabs=$('stateGroups');tabs.replaceChildren();
    for(const item of groups){const b=button('state-tab',locale==='zh'?item.labelZh:item.label,()=>{group=item.id;renderStates();});
      b.setAttribute('aria-pressed',String(group===item.id));b.append(node('span','',locale==='zh'?item.labelZh:item.label),node('span','count',String(item.states.length)));tabs.append(b);}
    const root=$('stateOptions');root.replaceChildren();
    const members=groups.find(g=>g.id===group)?.states||[];
    for(const id of members){const item=C.states.find(s=>s.id===id);if(!item)continue;const b=choice('thumb-choice',name(item),id===state,()=>choose('state',id),{state:id});b.dataset.id=id;root.append(b);}
    attachImages(root);
  }
  function renderCasts(){
    const query=search.trim().toLocaleLowerCase();
    const items=C.casts.filter(c=>!query||[c.name,c.englishName,c.id,c.theme,c.themeName,c.englishThemeName].join(' ').toLocaleLowerCase().includes(query));
    const root=$('castOptions');for(const img of root.querySelectorAll('img')){observer.unobserve(img);watched.delete(img);}root.replaceChildren();$('castCount').textContent=items.length+'/'+C.casts.length;
    $('emptySearch').hidden=items.length!==0;$('emptySearch').textContent=t('empty');
    for(const cast of items){const b=choice('thumb-choice',name(cast),cast.id===appearance.castId,()=>choose('cast',cast.id),{shape:cast.shape},true);b.dataset.id=cast.id;root.append(b);}
    attachImages(root);
  }
  function updateHeading(){
    const cast=C.casts.find(c=>c.id===appearance.castId);$('currentName').textContent=cast?name(cast):appearance.castId;
    $('currentStyle').textContent=name(styleChoice());
    const stateChoice=C.states.find(s=>s.id===state);$('currentState').textContent=(stateChoice?name(stateChoice):state)+' · '+t(follow?'live':'fixed');
    $('followButton').setAttribute('aria-checked',String(follow));
    $('faceName').textContent=name(C.faces.find(f=>f.id===appearance.faceId)||{id:appearance.faceId,name:appearance.faceId});
    $('colorName').textContent=appearance.colorId;
  }
  function paintPet(){
    const host=$('previewArt'), selected=preset();
    for(const key of [...host.style])if(key.startsWith('--aora-'))host.style.removeProperty(key);
    for(const [key,value]of Object.entries(Aora.getInkVars(appearance.colorId)))host.style.setProperty(key,value);
    const options={shape:selected.shape,face:appearance.faceId,style:appearance.style,variant:appearance.variant,state,
      nose:selected.nose||Aora.autoNoseForKey('passport-pet'),reducedMotion:reduced,paused:drawerOpen||document.hidden,seed:'passport-selector',entryEffects:false,antics:false};
    if(!pet)pet=Aora.createCharacter(host,options);else pet.update(options);
    if(reduced)pet.settle();
  }
  function renderAll(){
    lookRevision++;observer.disconnect();watched.clear();updateHeading();paintPet();
    renderStyles();renderColors();renderFaces();renderStates();renderCasts();
  }
  function choose(action,id){
    if(action==='cast'){const item=C.casts.find(c=>c.id===id);if(!item)return;appearance={...appearance,castId:id,faceId:item.face,colorId:item.color};}
    if(action==='face'&&C.faces.some(f=>f.id===id))appearance={...appearance,faceId:id};
    if(action==='color'&&C.colors.some(c=>c.id===id))appearance={...appearance,colorId:id};
    if(action==='style'){const item=C.styles.find(s=>s.id===id);if(!item)return;appearance={...appearance,style:item.style,variant:item.variant};}
    if(action==='state'&&Aora.isCharacterState(id)){state=id;follow=false;}
    renderAll();post(action,id);
  }
  function localize(){
    document.documentElement.lang=locale==='zh'?'zh-CN':'en';
    $('settingsOpen').setAttribute('aria-label',t('petSettings'));$('settingsClose').setAttribute('aria-label',t('closeSettings'));
    document.querySelector('.settings-tabs').setAttribute('aria-label',t('settingsCategories'));
    for(const e of document.querySelectorAll('[data-copy]'))e.textContent=t(e.dataset.copy);
    document.querySelector('.stage').setAttribute('aria-label',t('stage'));$('styleOptions').setAttribute('aria-label',t('desktopStyle'));$('stateGroups').setAttribute('aria-label',t('categories'));
    $('castSearch').placeholder=t('search');$('castSearch').setAttribute('aria-label',t('search'));
    $('castPrevious').setAttribute('aria-label',t('previous'));$('castNext').setAttribute('aria-label',t('next'));
  }
  function renderSettings(){
    for(const input of document.querySelectorAll('[data-setting]')){
      const value=prefs[input.dataset.setting];
      if(input.type==='checkbox')input.checked=!!value;else input.value=String(value);
    }
    $('sizeValue').textContent=prefs.size+' px';$('fpsValue').textContent=prefs.deviceFPS+' FPS';$('brightnessValue').textContent=prefs.deviceBrightness+'%';
    const sync=$('syncPet');sync.hidden=!syncState.available;sync.disabled=!syncState.connected||syncState.busy;
    sync.textContent=t(syncState.busy?'syncing':'syncPet');sync.setAttribute('aria-busy',String(syncState.busy));
    $('syncStatus').textContent=syncState.busy?t('syncing'):(syncState.status||t(syncState.connected?'notSynced':'connectPassport'));
  }
  function selectPane(id){
    activePane=id==='device'?'device':'desktop';
    for(const tab of document.querySelectorAll('[data-pane]')){const selected=tab.dataset.pane===activePane;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
    $('desktopSettings').hidden=activePane!=='desktop';$('deviceSettings').hidden=activePane!=='device';
    document.querySelector('.settings-scroll').scrollTop=0;
  }
  function setDrawer(open){
    if(drawerOpen===open)return;
    if(open)restoreFocus=document.activeElement;
    drawerOpen=open;$('settingsBackdrop').hidden=!open;$('selector').inert=open;
    $('settingsOpen').setAttribute('aria-expanded',String(open));
    if(open){renderSettings();$('settingsClose').focus();}
    else{const target=restoreFocus?.isConnected?restoreFocus:$('settingsOpen');target.focus();restoreFocus=null;}
    paintPet();
  }
  function drawerKey(event){
    if(!drawerOpen)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setDrawer(false);return;}
    if(event.key!=='Tab')return;
    const items=[...$('settingsDrawer').querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex="0"]')].filter(e=>e.getClientRects().length&&e.tabIndex>=0);
    const first=items[0],last=items.at(-1);if(!first)return;
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
  function showError(){ $('loadState').hidden=true;$('loadError').hidden=false; }
  try{
    if(!C?.casts?.length||!C.styles?.length)throw new Error('Missing offline catalog');
    $('followButton').addEventListener('click',()=>{follow=!follow;updateHeading();post('follow',follow);});
    let searchTimer;$('castSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{search=$('castSearch').value;renderCasts();},100);});
    $('castPrevious').addEventListener('click',()=>$('castOptions').scrollBy({left:-250,behavior:reduced?'auto':'smooth'}));
    $('castNext').addEventListener('click',()=>$('castOptions').scrollBy({left:250,behavior:reduced?'auto':'smooth'}));
    $('reloadButton').addEventListener('click',()=>location.reload());
    $('settingsOpen').setAttribute('aria-expanded','false');
    $('settingsOpen').addEventListener('click',()=>setDrawer(true));$('settingsClose').addEventListener('click',()=>setDrawer(false));
    $('settingsBackdrop').addEventListener('click',event=>{if(event.target===$('settingsBackdrop'))setDrawer(false);});
    document.addEventListener('keydown',drawerKey);
    for(const tab of document.querySelectorAll('[data-pane]'))tab.addEventListener('click',()=>selectPane(tab.dataset.pane));
    document.querySelector('.settings-tabs').addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();selectPane(event.key==='Home'?'desktop':event.key==='End'?'device':activePane==='desktop'?'device':'desktop');
      $(activePane==='desktop'?'desktopTab':'deviceTab').focus();
    });
    for(const input of document.querySelectorAll('[data-setting]'))input.addEventListener(input.type==='checkbox'?'change':'input',()=>{
      const key=input.dataset.setting,value=input.type==='checkbox'?input.checked:Number(input.value);
      pendingPrefs.set(key,value);prefs={...prefs,[key]:value};renderSettings();send({action:'setting',key,value});
    });
    $('resetPosition').addEventListener('click',()=>send({action:'resetPosition'}));
    $('syncPet').addEventListener('click',()=>{if(!syncState.available||!syncState.connected||syncState.busy)return;syncState={...syncState,busy:true};renderSettings();send({action:'syncPet'});});
    $('attributionButton').addEventListener('click',()=>send({action:'attribution'}));
    window.petSelector=Object.freeze({
      apply(payload){
        if(payload.settings){for(const key of Object.keys(prefs)){
          const value=payload.settings[key];if(typeof value!==typeof prefs[key])continue;
          // 已入WebKit队列的旧回推不能撤销；保留本地意图直到收到同值原生确认。
          if(pendingPrefs.has(key)&&pendingPrefs.get(key)!==value)continue;
          pendingPrefs.delete(key);prefs[key]=value;
        }}
        if(payload.sync)syncState={available:!!payload.sync.available,connected:!!payload.sync.connected,busy:!!payload.sync.busy,status:typeof payload.sync.status==='string'?payload.sync.status:''};
        const next=payload.appearance||{}, selected=C.casts.find(c=>c.id===next.castId)||C.casts[0];
        const look=C.styles.find(s=>s.style===next.style&&s.variant===next.variant)||C.styles[0];
        const nextAppearance={castId:selected.id,faceId:C.faces.some(f=>f.id===next.faceId)?next.faceId:selected.face,
          colorId:C.colors.some(c=>c.id===next.colorId)?next.colorId:selected.color,style:look.style,variant:look.variant};
        const nextState=Aora.isCharacterState(payload.state)?payload.state:'idle', nextLocale=payload.locale==='en'?'en':'zh';
        const key=JSON.stringify([nextAppearance,nextState,nextLocale]);
        appearance=nextAppearance;state=nextState;follow=!!payload.followConversation;reduced=!!payload.reducedMotion;locale=nextLocale;
        if(key!==lastKey){lastKey=key;localize();renderAll();}else{updateHeading();paintPet();}
        renderSettings();
        $('selector').inert=drawerOpen;$('selector').setAttribute('aria-busy','false');$('loadState').hidden=true;
      },
      diagnostics(){return {casts:C.casts.length,faces:C.faces.length,states:C.states.length,styles:C.styles.length,animatedCharacters:1,cacheSize:imageCache.size,appearance:{...appearance},state,follow,drawerOpen,activePane,settings:{...prefs},sync:{...syncState}};},
      destroy(){observer.disconnect();watched.clear();pendingPrefs.clear();document.removeEventListener('keydown',drawerKey);pet?.destroy();pet=null;}
    });
    // 原生目录和首份设置快照到达前保留载入层，避免用户意图被ready门禁静默丢弃。
    localize();renderAll();renderSettings();$('selector').inert=true;
    document.addEventListener('visibilitychange',()=>{if(document.hidden||drawerOpen)pet?.pause();else pet?.resume();});
    window.addEventListener('pagehide',()=>window.petSelector.destroy(),{once:true});
  }catch{showError();}
})();
