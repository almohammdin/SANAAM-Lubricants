window.SANAAM_CONFIG = {
  basePath: '/SANAAM-Lubricants/',
  contact: { inquiryEmail: 'naif123456@gmail.com' },
  formSubmitEndpoint: 'https://formsubmit.co/ajax/naif123456@gmail.com',
  external: { aramcoBaseOils: 'https://www.aramco.com/en/what-we-do/energy-products/refined-products/base-oils' }
};

(()=>{
  const version='20260820-1';
  if(!document.querySelector('link[data-sanaam-sales-assistant]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`sanaam-sales-assistant.css?v=${version}`;
    link.dataset.sanaamSalesAssistant='1';
    document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-sanaam-sales-assistant]')){
    const script=document.createElement('script');
    script.type='module';
    script.src=`sanaam-sales-assistant.js?v=${version}`;
    script.dataset.sanaamSalesAssistant='1';
    document.head.appendChild(script);
  }
})();
