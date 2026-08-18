(()=>{
  'use strict';
  const sources={
    'assets/brand/sanaam-logo-original.webp':['asset-b64/logo.webp.b64','image/webp'],
    'assets/products/lineup.webp':['asset-b64/lineup.webp.b64','image/webp'],
    'assets/industry/base-oil.webp':['asset-b64/base-oil.webp.b64','image/webp'],
    'assets/industry/manufacturing.webp':['asset-b64/manufacturing.webp.b64','image/webp'],
    'assets/brand/favicon.png':['asset-b64/favicon.png.b64','image/png']
  };
  const cache=new Map();
  async function getDataUrl(path){
    if(cache.has(path)) return cache.get(path);
    const def=sources[path]; if(!def) return null;
    const res=await fetch(def[0],{cache:'force-cache'}); if(!res.ok) throw new Error(`asset ${path}`);
    const b64=(await res.text()).trim();
    const url=`data:${def[1]};base64,${b64}`; cache.set(path,url); return url;
  }
  async function hydrateImage(img){
    const original=img.getAttribute('src'); if(!sources[original]||img.dataset.assetHydrated) return;
    img.dataset.assetHydrated='1';
    try{const url=await getDataUrl(original); if(url) img.src=url;}catch(e){img.dataset.assetHydrated='';}
  }
  function hydrateTree(root=document){
    if(root instanceof HTMLImageElement) hydrateImage(root);
    root.querySelectorAll?.('img[src]').forEach(hydrateImage);
  }
  async function hydrateIcons(){
    try{const icon=await getDataUrl('assets/brand/favicon.png');document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(el=>el.href=icon);}catch(e){}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    hydrateTree(document); hydrateIcons();
    const observer=new MutationObserver(list=>list.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)hydrateTree(n)})));
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
