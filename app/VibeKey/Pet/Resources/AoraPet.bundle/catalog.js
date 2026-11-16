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
  };
  globalThis.AoraPetCatalog = Object.freeze(catalog);
})();
