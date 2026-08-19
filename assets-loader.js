(()=>{
'use strict';
const sources={
  'assets/brand/sanaam-logo-original.webp':['asset-b64/logo.webp.b64','image/webp'],
  'assets/products/lineup.webp':['asset-b64/lineup.webp.b64','image/webp'],
  'assets/products/pack-1l.webp':['asset-b64/pack-1l.webp.b64','image/webp'],
  'assets/products/pack-4l.webp':['asset-b64/pack-4l.webp.b64','image/webp'],
  'assets/industry/base-oil.webp':['asset-b64/base-oil.webp.b64','image/webp'],
  'assets/industry/manufacturing.webp':['asset-b64/manufacturing.webp.b64','image/webp'],
  'assets/brand/favicon.png':['asset-b64/favicon.png.b64','image/png']
};
const cache=new Map();
async function getDataUrl(path){
  if(cache.has(path)) return cache.get(path);
  const def=sources[path]; if(!def) return null;
  const res=await fetch(def[0]+'?v=20260819-2',{cache:'no-store'});
  if(!res.ok) throw new Error('asset:'+path);
  const b64=(await res.text()).replace(/\s+/g,'');
  const url=`data:${def[1]};base64,${b64}`;
  cache.set(path,url); return url;
}
async function hydrateImage(img){
  const original=img.dataset.assetOriginal||img.getAttribute('src');
  if(!sources[original]) return;
  img.dataset.assetOriginal=original;
  try{
    const url=await getDataUrl(original);
    if(url){img.src=url;img.style.visibility='visible';}
  }catch(e){img.style.visibility='visible';}
}
function hydrateTree(root=document){
  if(root instanceof HTMLImageElement) hydrateImage(root);
  root.querySelectorAll?.('img[src]').forEach(hydrateImage);
}
function injectCriticalFixes(){
  if(document.getElementById('sanaam-critical-fixes')) return;
  const s=document.createElement('style');
  s.id='sanaam-critical-fixes';
  s.textContent=`
    .site-header{background:#fff!important;overflow:visible!important}
    .header-inner{height:auto!important;min-height:88px!important;padding:8px 0!important;overflow:visible!important}
    .brand{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:160px!important;height:72px!important;flex:0 0 160px!important;overflow:visible!important;background:transparent!important}
    .brand img{display:block!important;width:160px!important;height:72px!important;max-width:160px!important;object-fit:contain!important;object-position:center!important;background:transparent!important;filter:none!important;opacity:1!important}
    .footer-brand img,.inquiry-cta img{filter:none!important;opacity:1!important;object-fit:contain!important;background:transparent!important}
    .footer-brand{display:inline-flex!important;flex-direction:column!important;align-items:flex-start!important}
    .footer-brand img{width:210px!important;max-height:150px!important;background:#fff!important;border-radius:18px!important;padding:8px!important}
    .hero-product{overflow:visible!important;min-height:330px!important}
    .hero-product img{visibility:visible;display:block!important;width:100%!important;height:auto!important;min-height:180px!important;object-fit:contain!important}
    .packaging-showcase{overflow:visible!important}
    .sanaam-pack-gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:22px}
    .sanaam-pack{background:#f7f7f3;border:1px solid #d9ded9;border-radius:18px;overflow:hidden;min-width:0}
    .sanaam-pack-image{height:230px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center}
    .sanaam-pack-image img{width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;background:#fff}
    .sanaam-pack strong{display:block;text-align:center;padding:10px 6px 12px;color:#064b3e;font-size:17px}
    @media(max-width:820px){
      .header-inner{min-height:82px!important;padding:6px 0!important;gap:8px!important}
      .brand{width:138px!important;height:66px!important;flex-basis:138px!important}
      .brand img{width:138px!important;height:66px!important;max-width:138px!important}
      .lang-switch{display:none!important}
      .inquiry-pill{padding:9px 12px!important;font-size:13px!important}
      .sanaam-pack-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}
      .sanaam-pack-image{height:210px}
      .hero-product{min-height:260px!important}
    }
    @media(max-width:420px){
      .container{width:min(100% - 24px,1180px)!important}
      .brand{width:126px!important;height:62px!important;flex-basis:126px!important}
      .brand img{width:126px!important;height:62px!important;max-width:126px!important}
      .header-actions{gap:6px!important;margin-inline-start:auto!important}
      .inquiry-pill{padding:8px 10px!important}
      .sanaam-pack-image{height:185px}
    }
  `;
  document.head.appendChild(s);
}
async function hydrateIcons(){
  try{
    const icon=await getDataUrl('assets/brand/favicon.png');
    document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(el=>el.href=icon);
  }catch(e){}
}
async function buildPackagingGallery(){
  const box=document.querySelector('.packaging-showcase'); if(!box||box.dataset.galleryBuilt) return;
  box.dataset.galleryBuilt='1';
  const lineup=await getDataUrl('assets/products/lineup.webp').catch(()=>null);
  if(!lineup) return;
  const positions=['5%','27%','50%','73%','94%'];
  const sizes=['1L','4L','5L','20L','200L'];
  box.innerHTML=`<div class="sanaam-pack-gallery">${sizes.map((size,i)=>`<figure class="sanaam-pack"><div class="sanaam-pack-image"><img src="${lineup}" alt="SANAAM ${size} lubricant packaging" style="object-position:${positions[i]} center"></div><strong>${size}</strong></figure>`).join('')}</div>`;
}
function improveProductCards(){
  const cards=[...document.querySelectorAll('.product-card .product-photo img')];
  cards.forEach((img,i)=>{
    const preferred=i%3===0?'assets/products/pack-1l.webp':i%3===1?'assets/products/pack-4l.webp':'assets/products/lineup.webp';
    const url=cache.get(preferred);
    if(url) img.src=url;
  });
}
function observeDynamic(){
  const obs=new MutationObserver(list=>{
    list.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)hydrateTree(n)}));
    improveProductCards();
  });
  obs.observe(document.body,{childList:true,subtree:true});
}
async function init(){
  injectCriticalFixes();
  document.querySelectorAll('img[src]').forEach(img=>{if(sources[img.getAttribute('src')]) img.style.visibility='hidden';});
  await Promise.all(Object.keys(sources).map(p=>getDataUrl(p).catch(()=>null)));
  hydrateTree(document);
  hydrateIcons();
  await buildPackagingGallery();
  improveProductCards();
  observeDynamic();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
