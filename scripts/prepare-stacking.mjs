import {mkdirSync,readdirSync,writeFileSync,statSync,copyFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const input='.local-assets/stacking-master.mp4',root='public/frames/stacking';
if(existsSync(`${root}/manifest.json`))throw Error('Diese Sequenz wurde bereits vorbereitet. Für neue Filme einen neuen Ordner verwenden.');
const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,duration,r_frame_rate','-of','json',input],{encoding:'utf8'});
if(probe.status!==0)throw Error('Film konnte nicht gelesen werden.');
const source=JSON.parse(probe.stdout).streams[0],fps=24;
function sequence(folder,width,quality){mkdirSync(folder,{recursive:true});const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-an','-vf',`fps=${fps},scale=${width}:-2`,'-c:v','libwebp','-quality',String(quality),'-start_number','0',`${folder}/frame-%04d.webp`],{stdio:'inherit'});if(result.status!==0)throw Error('Bildsequenz fehlgeschlagen.');const files=readdirSync(folder).filter(n=>/^frame-\d{4}\.webp$/.test(n)).sort();files.forEach((name,i)=>{if(name!==`frame-${String(i).padStart(4,'0')}.webp`||!statSync(`${folder}/${name}`).size)throw Error('Unvollständige Bildfolge.');});return {count:files.length,fps,width,height:Math.round(width*source.height/source.width/2)*2,pattern:`/${folder.replace('public/','')}/frame-%04d.webp`,totalBytes:files.reduce((n,f)=>n+statSync(`${folder}/${f}`).size,0)}}
const desktop=sequence(root,Math.min(1920,source.width),83),mobile=sequence(`${root}/mobile`,Math.min(960,source.width),78);
if(desktop.count!==mobile.count)throw Error('Bildfolgen stimmen nicht überein.');
const startFrame=48; // Reviewed opening: omit the generated floating-stack artifact.
copyFileSync(`${root}/frame-0048.webp`,'public/assets/stacking-poster.webp');
copyFileSync(`${root}/frame-0048.webp`,'public/assets/caramel.webp');
const manifest={...desktop,mobile,source,startFrame,sourceBytes:statSync(input).size,duration:Number(source.duration),poster:'/assets/stacking-poster.webp'};
writeFileSync(`${root}/manifest.json`,JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
