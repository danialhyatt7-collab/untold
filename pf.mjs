import { chromium } from 'playwright';
const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1280,height:720} });
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:5173/',{waitUntil:'load'});
await p.waitForTimeout(16000);
async function shoot(id,name){ await p.evaluate(s=>window.__untold.nav.goToSection(window.__untold.nav.sections.findIndex(x=>x.id===s)), id); await p.waitForTimeout(6000); try{await p.screenshot({path:`/tmp/${name}.png`,timeout:60000});console.log(name,'ok');}catch(e){console.log(name,'fail');} }
await shoot('top','pf-untold');
await shoot('airbeat','pf-airbeat');
await shoot('enter','pf-enter');
console.log('ERRS', errs.length?[...new Set(errs)].slice(0,4).join(' | '):'none');
await b.close();
