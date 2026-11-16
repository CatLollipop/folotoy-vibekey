#!/usr/bin/env node
// 使用同一离线引擎验证真实画风，不把UI文案当作能力声明。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bundle=path.join(root,'app/VibeKey/Pet/Resources/AoraPet.bundle');
for(const name of ['engine','theme-bootstrap',...['extras','halloween','christmas','spring-festival','mid-autumn','easter','summer','valentine'].map(s=>'themes/'+s),'catalog','exporter'])vm.runInThisContext(fs.readFileSync(path.join(bundle,name+'.js'),'utf8'),{filename:name});
const c=globalThis.AoraPetCatalog;
assert.deepEqual([c.casts.length,c.faces.length,c.states.length,c.colors.length,c.styles.length],[193,16,44,43,29]);
assert.equal(new Set(AoraPetStateGroups.flatMap(g=>g.states)).size,44);
const images=new Set();
for(const style of c.styles){
  assert(Aora.acceptsVariant(Aora.getStyle(style.style),style.variant));
  const result=Aora.renderStaticSvgDataUrl({shape:'circle',face:'capsule',color:'cream',state:'happy',style:style.style,variant:style.variant,sizePx:80,colorScheme:'light'});
  assert(result.startsWith('data:image/svg+xml,'));
  assert(decodeURIComponent(result).includes('<svg'));
  images.add(result);
}
assert(images.size>=27,`Expected genuinely distinct official artwork; got ${images.size}`);
const options={castId:'miso',faceId:'screen',colorId:'cream',revision:42,fps:12,brightness:80,state:'thinking',followConversation:false};
const canonical=Buffer.from(AoraPetExport(options));
for(const style of c.styles)assert.deepEqual(Buffer.from(AoraPetExport({...options,style:style.style,variant:style.variant})),canonical,style.id+' changed the device dot geometry');
const html=fs.readFileSync(path.join(bundle,'selector.html'),'utf8');
assert(html.includes("connect-src 'none'")&&!html.includes('https://'));
assert(!html.includes("script-src 'self' 'unsafe-inline'"));
console.log(JSON.stringify({catalog:[193,16,44,43],styles:29,distinctStaticArt:images.size,deviceStyleInvariantBytes:canonical.length,offlineCSP:true}));
