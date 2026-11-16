'use strict';
// 将当前官方角色/脸型的关键轮廓导出成AORAPET2；动画仍在设备实时积分，不导出帧序列。
(() => {
  const P=globalThis.AoraPetPalette;
  const rgb=s=>parseInt(s.replace('#',''),16),hex=n=>'#'+n.toString(16).padStart(6,'0');
  const align=n=>(n+3)&~3;
  const flatten=(points,t)=>points.map(([x,y])=>[t.x+t.matrix[0]*(x-t.pivotX)+t.matrix[2]*(y-t.pivotY),t.y+t.matrix[1]*(x-t.pivotX)+t.matrix[3]*(y-t.pivotY)]);
  function simplify(points,tolerance){
    if(points.length<5)return points;
    const pts=[...points,points[0]],keep=new Set([0,pts.length-1]);
    function visit(a,b){let best=tolerance*tolerance,at=-1;const [ax,ay]=pts[a],[bx,by]=pts[b],dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
      for(let i=a+1;i<b;i++){const [x,y]=pts[i],k=den?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/den)):0,d=(x-ax-k*dx)**2+(y-ay-k*dy)**2;if(d>best){best=d;at=i;}}
      if(at>=0){keep.add(at);visit(a,at);visit(at,b);}}
    visit(0,pts.length-1);return [...keep].sort((a,b)=>a-b).slice(0,-1).map(i=>pts[i]);
  }
  function stroke(points,width,closed){
    if(points.length<2)return [];
    const p=points.filter((v,i)=>!i||Math.hypot(v[0]-points[i-1][0],v[1]-points[i-1][1])>.001),left=[],right=[];
    for(let i=0;i<p.length;i++){const before=p[i?i-1:closed?p.length-1:0],after=p[i<p.length-1?i+1:closed?0:i],dx=after[0]-before[0],dy=after[1]-before[1],n=Math.hypot(dx,dy)||1;
      left.push([p[i][0]-dy/n*width/2,p[i][1]+dx/n*width/2]);right.push([p[i][0]+dy/n*width/2,p[i][1]-dx/n*width/2]);}
    return [...left,...right.reverse()];
  }
  function build(options,tolerance){
    const preset=Aora.castMember(options.castId);if(!preset)throw new Error('Unknown character');
    const face=options.faceId||preset.face||'cute',color=options.colorId||preset.color;
    if(!Aora.isFaceStyle(face))throw new Error('Unknown face');
    const base=P.lineInks(color).dark||Aora.getInkColor(color,'dark'),light=P.shadeHex(base,.3);
    const rule=P.faceInks(color),r=rule.turns?rule.dark:rule.light;
    const isLight=(() => {const c=rgb(Aora.getInkColor(color,'dark'));return ((c>>16&255)*.2126+(c>>8&255)*.7152+(c&255)*.0722)>180;})();
    const led=isLight?'#17181D':'#FFFFFF';
    const palette=[0x17181D,rgb(base),rgb(led),0xFFC531,0x6EC1FF,rgb(light),rgb(base),0xEE5A5E,0xF7803D,0xF0B53A,0x33B477,0x24A6C9,0x3D8BF2,0x9474EA,0xF7C04A,0xEB4B4F];
    const colorId=value=>{const n=rgb(value);let id=palette.indexOf(n);if(id<0){id=palette.length;palette.push(n);}if(id>255)throw new Error('Too many palette colours');return id;};
    const paintFor=layer=>{
      const role=layer.paint;
      if(Aora.FACE_ACCENTS[role])return colorId(Aora.FACE_ACCENTS[role]);
      if(role==='iris')return colorId(P.shadeHex(base,-.45));
      if(role==='light'&&layer.light)return colorId(hex(layer.light.reduce((v,c)=>v*256+Math.min(255,Math.max(0,Math.round(c/32)*32)),0)));
      return colorId(role==='face'?led:role==='pupil'?r.pupil:role==='glint'?r.glint:r.feature);
    };
    const rings=[],ringMap=new Map(),points=[],parts=[],poses=[],poseMap=new Map(),definitions=[];
    let maxRing=3,shapeScale=1,body=[];
    function ringId(raw){
      let pts=simplify(raw,tolerance);
      for(let t=Math.max(tolerance,.03);pts.length>256&&t<=3;t*=1.6)pts=simplify(raw,t);
      if(pts.length>256)throw new Error('Geometry ring exceeds device limit');
      pts=pts.map(([x,y])=>[Math.round((120+(x-120)*shapeScale)*64),Math.round((120+(y-120)*shapeScale)*64)]);
      if(pts.length<3)return null;
      const key=JSON.stringify(pts);if(ringMap.has(key))return ringMap.get(key);
      const id=rings.length;ringMap.set(key,id);rings.push({first:points.length,count:pts.length});points.push(...pts);maxRing=Math.max(maxRing,pts.length);return id;
    }
    function add(list,raw,group,layer,paint,flags=0){const ring=ringId(raw);if(ring!==null)list.push({ring,group,layer,paint,flags});}
    const design=Aora.isDrawnFace(face)?Aora.getFaceDesign(face):null;
    for(const state of Aora.CHARACTER_STATES){
      const expressions=(design?.states?.[state] || (Aora.isCuteFamily(face)?Aora.STATE_CUTE_EYES[state]:Aora.STATE_EYE_TOPOLOGIES[state]) || ['neutral']).slice(0,8);
      const refs=[];
      for(const expression of expressions){
        const sim=Aora.createSimulation({shape:preset.shape,face,state,seed:'passport-pet',still:{expression},poseHome:{turn:0,tilt:0,roll:0}});
        const frame=sim.snapshot(),g=frame.face.geometry;shapeScale=frame.shapeScale;
        if(!body.length){
          add(body,frame.body.outline,0,0,1);
          for(const [i,part] of frame.body.parts.entries())if(part.opacity>=.5){
            let ink=base;
            if(part.color)ink=P.partColorPair(part.color)?.dark||part.color;
            else if(part.tone==='leaf')ink=Aora.getLeafColor(color);
            else if(part.tone==='inner')ink=P.shadeHex(base,.45);
            else if(part.tone==='hair')ink=P.mixHex(base,P.hairShade(color).dark,.4);
            add(body,part.outline,part.tone==='body'&&!part.color?0:5,i+1,part.tone==='body'&&!part.color?1:colorId(ink));
          }
        }
        const entries=[];let layer=0;
        if(g){
          if((g.eyeOpacity??1)>=.5)for(const [group,eye]of[[1,g.left],[2,g.right]])if(eye?.visible){
            const id=layer++;for(const ring of [eye.points,...(eye.extras||[])])add(entries,flatten(ring,eye.transform),group,id,colorId(led));
          }
          for(const d of g.drawn||[])if(d.opacity>=.5){
            for(const [group,eye]of[[5,d.plate],[1,d.left],[2,d.right]])if(eye?.visible)for(const item of eye.layers){
              if(item.opacity<.5)continue;const id=layer++;
              item.rings.forEach((ring,i)=>add(entries,flatten(ring,eye.transform),group,id,paintFor(item),(item.holes&&i?1:0)|(item.detail?2:0)));
            }
          }
          const mouth=g.mouth;
          if(mouth?.visible&&(mouth.opacity??1)>=.5){
            const ring=frame.face.cute>=.5?mouth.points:stroke(mouth.points,g.lineWidth,mouth.closed);
            add(entries,flatten(ring,mouth.transform),3,layer++,design?paintFor({paint:design.mouthPaint}):colorId(led));
            for(const d of g.drawn||[])for(const item of d.inMouth||[])if(item.opacity>=.5){const id=layer++;item.rings.forEach((v,i)=>add(entries,flatten(v,mouth.transform),3,id,paintFor(item),(item.holes&&i?1:0)|(item.detail?2:0)));}
          }
          if(frame.face.features&&g.nose?.visible)add(entries,flatten(stroke(g.nose.points,g.lineWidth,g.nose.closed),g.nose.transform),4,layer++,colorId(led));
          if(frame.face.blush>=.5&&g.blush)for(const cheek of Object.values(g.blush))if(cheek.visible)add(entries,flatten(cheek.points,cheek.transform),5,layer++,colorId('#FF9DBB'));
        }
        const key=JSON.stringify(entries);let id=poseMap.get(key);
        if(id===undefined){id=poses.length;poseMap.set(key,id);poses.push({first:parts.length,count:entries.length});parts.push(...entries);}
        refs.push(id);sim.dispose();
      }
      definitions.push({refs,blink:Aora.STATE_BLINK_MS[state]||[0,0],cycle:Aora.STATE_EYE_SWITCH_MS[state]||[0,0]});
    }
    if(points.length>24576||parts.length>8192||body.length>128)throw new Error('Geometry exceeds device memory budget');
    const meta=new TextEncoder().encode(JSON.stringify({engine:'@aora-bot/engine@0.2.0',commit:'164ffa38b3c27a8512e7c09cfceb7cf0c98f5144',castId:preset.id,shape:preset.shape,faceId:face,colorId:color,states:44,tolerance}));
    const offsets=[112];offsets.push(align(offsets[0]+meta.length));offsets.push(offsets[1]+points.length*4);offsets.push(offsets[2]+rings.length*8);offsets.push(offsets[3]+parts.length*8);offsets.push(offsets[4]+poses.length*8);offsets.push(offsets[5]+44*28);offsets.push(offsets[6]+body.length*8);
    const total=offsets[7]+palette.length*4;if(total>131072)throw new Error('Geometry exceeds 128 KiB');
    const bytes=new Uint8Array(total),v=new DataView(bytes.buffer),u16=(o,n)=>v.setUint16(o,n,true),u32=(o,n)=>v.setUint32(o,n,true);
    bytes.set(new TextEncoder().encode('AORAPET2'));u16(8,2);u16(10,112);u32(12,total);u32(16,options.revision);
    bytes[20]=options.enabled===false?0:1;bytes[21]=Math.max(6,Math.min(20,options.fps||12));bytes[22]=Math.max(10,Math.min(100,options.brightness||80));
    bytes[23]=options.followConversation===false?Math.max(0,Aora.CHARACTER_STATES.indexOf(options.state||'idle')):255;
    u32(24,rgb(base));u32(28,rgb(light));
    [meta.length,points.length,rings.length,parts.length,poses.length,body.length].forEach((n,i)=>u32(32+i*4,n));
    offsets.forEach((n,i)=>u32(56+i*4,n));u32(88,palette.length);u16(92,64);u16(94,maxRing);
    bytes.set(meta,offsets[0]);points.forEach(([x,y],i)=>{if(x<-32768||x>32767||y<-32768||y>32767)throw new Error('Coordinate out of range');v.setInt16(offsets[1]+i*4,x,true);v.setInt16(offsets[1]+i*4+2,y,true);});
    rings.forEach((r,i)=>{u32(offsets[2]+i*8,r.first);u16(offsets[2]+i*8+4,r.count);});
    const putPart=(p,o)=>{u16(o,p.ring);bytes[o+2]=p.group;bytes[o+3]=p.layer;bytes[o+4]=p.paint;bytes[o+5]=p.flags;};
    parts.forEach((p,i)=>putPart(p,offsets[3]+i*8));poses.forEach((p,i)=>{u32(offsets[4]+i*8,p.first);u16(offsets[4]+i*8+4,p.count);});
    definitions.forEach((d,i)=>{const o=offsets[5]+i*28;d.refs.forEach((n,j)=>u16(o+j*2,n));bytes[o+16]=d.refs.length;u16(o+18,d.blink[0]);u16(o+20,d.blink[1]);u16(o+22,d.cycle[0]);u16(o+24,d.cycle[1]);});
    body.forEach((p,i)=>putPart(p,offsets[6]+i*8));palette.forEach((n,i)=>u32(offsets[7]+i*4,n));
    return bytes;
  }
  globalThis.AoraPetExport = options => {
    if(!Number.isInteger(options.revision)||options.revision<1||options.revision>0xffffffff)throw new Error('Invalid asset revision');
    let last;
    for(const tolerance of [.025,.08,.2,.5,1]){try{return build(options,tolerance);}catch(error){last=error;if(!/budget|128 KiB/.test(error.message))throw error;}}
    throw last;
  };
})();
