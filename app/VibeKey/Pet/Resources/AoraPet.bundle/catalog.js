'use strict';
(() => {
  // 所有主题文件随应用离线打包；不依赖动态CDN，不硬编码核心角色数量。
  for (const module of Object.values(globalThis.AoraThemes)) {
    const entry = Object.values(module).find(v => v && v.definition && v.art);
    if (entry) Aora.installTheme(entry);
  }
  const faces = [...new Set([...Aora.FACE_STYLES, ...Aora.definedFaces()])];
  const faceNames={capsule:['胶囊','Capsule'],cute:['可爱','Cute'],eyes:['眼睛','Eyes'],line:['线条','Line'],
    brow:['眉毛','Brow'],glossy:['水润','Glossy'],sparkle:['闪亮','Sparkle'],button:['纽扣','Button'],
    shades:['墨镜','Shades'],droopy:['慵懒','Droopy'],bigmouth:['大嘴','Big mouth'],pie:['派眼','Pie'],
    screen:['屏幕','Screen'],symbol:['符号','Symbol'],teardrop:['泪滴','Teardrop'],specs:['眼镜','Specs']};
  const styleNames={solid:['纯色','Solid'],outline:['轮廓','Outline'],glass:['玻璃','Glass'],sticker:['贴纸','Sticker'],
    paper:['纸片','Paper'],soft:['柔软','Soft'],riso:['孔版','Risograph'],pencil:['铅笔','Pencil'],marker:['马克笔','Marker'],
    crayon:['蜡笔','Crayon'],watercolor:['水彩','Watercolor'],neon:['霓虹','Neon'],chalk:['粉笔','Chalk'],origami:['折纸','Origami'],
    relief:['浮雕','Relief'],gothic:['暗黑手绘','Gothic ink'],doodle:['涂鸦','Doodle'],grainy:['颗粒','Grain'],felt:['毛毡','Felt'],
    papercut:['剪纸','Papercut'],lantern:['灯笼','Lantern'],pastel:['粉彩','Pastel'],soda:['汽水','Soda'],candy:['糖果','Candy'],
    crisp:['清晰','Crisp'],dot:['点阵','Dot matrix'],block:['方块','Block'],plain:['纯文字','Plain text'],bubble:['气泡','Bubble']};
  const catalog = {
    casts: Aora.allCast().map(c => {
      const theme=Aora.themeOwning('cast',c.id)?.id || 'core';
      const label=Aora.THEME_MANIFEST.find(t=>t.id===theme)?.name;
      return {id:c.id, name:c.name.zh, englishName:c.name.en,shape:c.shape, color:c.color,
        face:c.face || 'cute',theme,themeName:label?.zh||'基础角色',englishThemeName:label?.en||'Core cast'};
    }),
    faces: faces.map(id => ({id, name:Aora.definedFaceLabel(id)?.zh || faceNames[id]?.[0] || id,
      englishName:Aora.definedFaceLabel(id)?.en || faceNames[id]?.[1] || id})),
    states: Aora.CHARACTER_STATES.map(id => ({id,name:Aora.EMOTIONS.find(e => e.state===id)?.name.zh || id,
      englishName:Aora.EMOTIONS.find(e => e.state===id)?.name.en || id})),
    colors: Aora.ALL_COLOR_IDS.map(id => ({id,name:id,hex:Aora.getSwatchHex(id)})),
    styles: Aora.listStyles().flatMap(s=>Aora.allVariants(s).map(variant=>({id:s.id+'/'+variant,style:s.id,variant,
      name:styleNames[variant]?.[0]||variant,englishName:styleNames[variant]?.[1]||variant,group:s.id}))),
  };
  globalThis.AoraPetCatalog = Object.freeze(catalog);
  globalThis.AoraPetStateGroups = Aora.STATE_GROUPS;
})();
