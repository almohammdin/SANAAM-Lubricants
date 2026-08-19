(()=>{
'use strict';
const BUILD='20260819-8';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const PRODUCTS=window.SANAAM_PRODUCTS||[];
const FAMILIES=window.SANAAM_FAMILIES||[];
const I18N=window.SANAAM_I18N||{};
const CONFIG=window.SANAAM_CONFIG||{};
const saved=localStorage.getItem('sanaam.lang');
const state={lang:I18N[saved]?saved:'so'};
const t=(path)=>path.split('.').reduce((o,k)=>o?.[k],I18N[state.lang])??path;
const esc=(v)=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
const asset=(path)=>`${path}${path.includes('?')?'&':'?'}v=${BUILD}`;
const familyTitle=(id)=>{const f=FAMILIES.find(x=>x.id===id);return f?t(f.titleKey):id};

function renderProducts(){
  const host=$('#featuredProducts');
  if(!host)return;
  const featured=PRODUCTS.filter(p=>p.featured).slice(0,9);
  host.innerHTML=featured.map(p=>`<article class="product-card"><img src="${asset(p.image)}" alt="${esc(p.name)}" loading="lazy"><div class="product-content"><div class="grade">${esc(p.grade)}</div><h3>${esc(p.name)}</h3><p>${esc(p.type)}</p><div class="product-meta"><span>${esc(p.api)}</span><span>${esc(familyTitle(p.family))}</span></div><div class="pack-chips">${p.packaging.map(x=>`<i>${esc(x)}</i>`).join('')}</div><button class="product-rfq" type="button" data-rfq-product="${esc(p.id)}">${esc(t('nav.rfq'))}</button></div></article>`).join('');

  const familyGrid=$('#familyGrid');
  if(familyGrid)familyGrid.innerHTML=FAMILIES.map(f=>{const items=PRODUCTS.filter(p=>p.family===f.id);return `<article class="family-card"><strong>${esc(familyTitle(f.id))}</strong><p>${items.map(x=>esc(x.grade)).join(' · ')}</p></article>`}).join('');

  const fullRange=$('#fullRange');
  if(fullRange)fullRange.innerHTML=FAMILIES.map(f=>`<section class="family-range"><h3>${esc(familyTitle(f.id))}</h3><div class="range-chips">${PRODUCTS.filter(p=>p.family===f.id).map(p=>`<button type="button" data-rfq-product="${esc(p.id)}">${esc(p.grade)}</button>`).join('')}</div></section>`).join('');

  $$('[data-rfq-product]').forEach(btn=>btn.addEventListener('click',()=>selectForRfq(btn.dataset.rfqProduct)));
}

function selectForRfq(id){
  const sel=$('#rfqProduct');
  if(sel && PRODUCTS.some(p=>p.id===id))sel.value=id;
  syncPackOptions();
  $('#rfq')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderApplications(){
  const cards=t('applications.cards');
  const host=$('#applicationsGrid');
  if(!host||!Array.isArray(cards))return;
  host.innerHTML=cards.map(c=>`<article class="application-card"><span>${esc(c.code)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><ul>${c.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
}
function renderProcesses(){const p=t('manufacturing.process');const host=$('#processList');if(host&&Array.isArray(p))host.innerHTML=p.map(x=>`<span>${esc(x)}</span>`).join('')}
function renderDistributorPoints(){const p=t('distributors.points');const host=$('#distributorPoints');if(host&&Array.isArray(p))host.innerHTML=p.map(x=>`<div>${esc(x)}</div>`).join('')}

function populateRfqProducts(keep=true){
  const select=$('#rfqProduct');
  if(!select||!PRODUCTS.length)return;
  const old=keep?select.value:'';
  select.innerHTML=PRODUCTS.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.grade)}</option>`).join('');
  if(old&&PRODUCTS.some(p=>p.id===old))select.value=old;
  syncPackOptions();
}
function syncPackOptions(){
  const product=PRODUCTS.find(x=>x.id===$('#rfqProduct')?.value)||PRODUCTS[0];
  const select=$('#rfqPack');
  if(!product||!select)return;
  const old=select.value;
  select.innerHTML=product.packaging.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  if(product.packaging.includes(old))select.value=old;
}

function applyLanguage(){
  const lang=I18N[state.lang]||I18N.so;
  if(!lang)return;
  document.documentElement.lang=state.lang;
  document.documentElement.dir=lang.dir;
  $$('[data-i18n]').forEach(el=>{const v=t(el.dataset.i18n);if(typeof v==='string')el.textContent=v});
  $$('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.lang));
  renderProducts();
  renderApplications();
  renderProcesses();
  renderDistributorPoints();
  populateRfqProducts(true);
}

function bindNavigation(){
  $$('[data-lang]').forEach(b=>b.addEventListener('click',()=>{state.lang=b.dataset.lang;localStorage.setItem('sanaam.lang',state.lang);applyLanguage()}));
  $('#menuToggle')?.addEventListener('click',()=>{const n=$('#mobileNav');n.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(n.classList.contains('open')))});
  $$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{$('#mobileNav')?.classList.remove('open');$('#menuToggle')?.setAttribute('aria-expanded','false')}));
  $('#openRfqTop')?.addEventListener('click',()=>$('#rfq')?.scrollIntoView({behavior:'smooth',block:'start'}));
  $('#toggleRange')?.addEventListener('click',()=>{const r=$('#fullRange');if(r)r.hidden=!r.hidden});
  $('#rfqProduct')?.addEventListener('change',syncPackOptions);
}

async function submitRfq(e){
  e.preventDefault();
  const status=$('#rfqStatus'),btn=$('#sendRfq');
  const required=['rfqProduct','rfqPack','rfqQuantity','rfqMarket','rfqCompany','rfqContact','rfqPhone'];
  const missing=required.some(id=>!String($('#'+id)?.value||'').trim());
  if(missing){status.textContent=t('rfq.required');status.className='err';return}
  const product=PRODUCTS.find(p=>p.id===$('#rfqProduct').value);
  const fd=new FormData();
  fd.append('_subject',`SANAAM RFQ | ${$('#rfqMarket').value} | ${$('#rfqCompany').value}`);
  fd.append('_template','table');
  fd.append('_captcha','false');
  fd.append('Product',product?`${product.name} · ${product.grade}`:$('#rfqProduct').value);
  fd.append('Pack Size',$('#rfqPack').value);
  fd.append('Estimated Quantity',$('#rfqQuantity').value);
  fd.append('Market / Country',$('#rfqMarket').value);
  fd.append('Destination Port',$('#rfqPort').value);
  fd.append('Company Name',$('#rfqCompany').value);
  fd.append('Contact Person',$('#rfqContact').value);
  fd.append('WhatsApp / Phone',$('#rfqPhone').value);
  fd.append('Notes',$('#rfqNotes').value);
  btn.disabled=true;status.textContent=t('rfq.sending');status.className='';
  try{
    const res=await fetch(CONFIG.formSubmitEndpoint,{method:'POST',headers:{Accept:'application/json'},body:fd});
    if(!res.ok)throw new Error('send');
    status.textContent=t('rfq.sent');status.className='ok';
    e.target.reset();populateRfqProducts(false);
  }catch(err){
    status.textContent=t('rfq.error');status.className='err';
  }finally{btn.disabled=false}
}

function init(){
  bindNavigation();
  $('#rfqForm')?.addEventListener('submit',submitRfq);
  applyLanguage();
}
init();
})();
