#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'app/VibeKey/Pet/Resources/AoraPet.bundle');
vm.runInThisContext(fs.readFileSync(path.join(dir,'engine.js'),'utf8'));
globalThis.AoraThemes={};
for(const name of ['extras','halloween','christmas','spring-festival','mid-autumn','easter','summer','valentine'])vm.runInThisContext(fs.readFileSync(path.join(dir,'themes',name+'.js'),'utf8'));
for(const name of ['catalog','exporter'])vm.runInThisContext(fs.readFileSync(path.join(dir,name+'.js'),'utf8'));
const catalog=globalThis.AoraPetCatalog;
fs.writeFileSync(path.join(dir,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
const out=path.join(root,'firmware/build/host-pet/catalog');fs.mkdirSync(out,{recursive:true});
const all=process.argv.includes('--full'),casts=all?catalog.casts:catalog.casts.filter(c=>['dot','miso','beep','xm-tree','sf-goat','vl-kiki-letter'].includes(c.id));
const errors=[],samples=[];let maximum=0,maxLook='',packs=0;
for(const cast of casts)for(const face of catalog.faces){
  try{
    const bytes=AoraPetExport({castId:cast.id,faceId:face.id,revision:42,enabled:true,fps:12,brightness:80});
    if(bytes.length>131072)throw new Error('over 128 KiB');
    if(bytes.length>maximum){maximum=bytes.length;maxLook=cast.id+'/'+face.id;fs.writeFileSync(path.join(out,'largest.aorapet'),bytes);}
    packs++;
    if(['dot','miso','beep','xm-tree','sf-goat','vl-kiki-letter'].includes(cast.id)&&['capsule','cute','line','screen','shades','symbol'].includes(face.id)){
      fs.writeFileSync(path.join(out,cast.id+'-'+face.id+'.aorapet'),bytes);samples.push({cast:cast.id,face:face.id,bytes:bytes.length});
    }
  }catch(error){errors.push({cast:cast.id,face:face.id,error:String(error)});}
}
for(const color of catalog.colors){try{AoraPetExport({castId:'dot',faceId:'capsule',colorId:color.id,revision:42});}catch(error){errors.push({color:color.id,error:String(error)});}}
const report={catalog:Object.fromEntries(Object.entries(catalog).map(([k,v])=>[k,v.length])),packs,maximum,maxLook,errors,samples};
fs.writeFileSync(path.join(out,all?'report-full.json':'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,samples:samples.length}));
if(errors.length)process.exitCode=1;
