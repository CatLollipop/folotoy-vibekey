'use strict';
// 高清版完全使用固定官方引擎。宿主只下发受约束的状态，不读取聊天或设备凭据。
(() => {
  const host = document.getElementById('pet');
  const preset = Aora.castMember('dot');
  const vars = Aora.getInkVars(preset.color);
  for (const [key, value] of Object.entries(vars)) host.style.setProperty(key, value);
  const pet = Aora.createCharacter(host, {
    shape: preset.shape, face: preset.face, style: 'vector', variant: 'solid',
    state: 'idle', seed: 'passport-dot', entryEffects: true, antics: true,
  });
  let current = 'idle';
  let look = 'dot/capsule/cream';
  window.petHost = Object.freeze({
    apply(state, reducedMotion, paused, appearance) {
      if (!Aora.isCharacterState(state)) state = 'idle';
      current = state;
      const selected=Aora.castMember(appearance?.castId)||preset;
      const face=Aora.isFaceStyle(appearance?.faceId)?appearance.faceId:(selected.face||'cute');
      const color=Aora.ALL_COLOR_IDS.includes(appearance?.colorId)?appearance.colorId:selected.color;
      const key=[selected.id,face,color].join('/');
      if(key!==look){
        for(const key of [...host.style])if(key.startsWith('--aora-'))host.style.removeProperty(key);
        for(const [key,value]of Object.entries(Aora.getInkVars(color)))host.style.setProperty(key,value);
        pet.update({shape:selected.shape,face,nose:selected.nose||Aora.autoNoseForKey('passport-pet')});look=key;
      }
      pet.update({state, reducedMotion: !!reducedMotion, paused: !!paused});
      if (reducedMotion) pet.settle();
      host.setAttribute('data-state', current);
      host.setAttribute('data-cast',selected.id);
      host.setAttribute('data-face',face);
    },
    exportBundle(options){
      const bytes=AoraPetExport(options);let text='';
      for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));
      return btoa(text);
    },
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pet.pause(); else pet.resume();
  });
  window.addEventListener('pagehide', () => pet.destroy(), {once: true});
})();
