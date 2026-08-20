const TARGETS=['products','applications','distributors','rfq'];
const FAMILY_IDS=['pcmo','hdd','brake','gear','atf','hydraulic','grease'];

export const SANAAM_SALES_TOOL_DECLARATIONS=[
  {name:'get_sales_context',description:'Read the current SANAAM catalog, page language, selected RFQ values and the latest commercial context before answering or recommending.',parametersJsonSchema:{type:'object',properties:{},additionalProperties:false}},
  {name:'find_products',description:'Find SANAAM products using the customer need, grade, family or pack size. Use this before recommending when the product is not already exact.',parametersJsonSchema:{type:'object',properties:{query:{type:'string'},family:{type:'string',enum:FAMILY_IDS},grade:{type:'string'},pack:{type:'string'}},additionalProperties:false}},
  {name:'show_product',description:'Show one SANAAM product visually in the sales assistant card using an exact product id returned from the catalog.',parametersJsonSchema:{type:'object',properties:{product_id:{type:'string'}},required:['product_id'],additionalProperties:false}},
  {name:'prepare_rfq',description:'Prefill the SANAAM quotation form with information the customer has already provided. This does not submit the request. Do not ask the customer to repeat information already present.',parametersJsonSchema:{type:'object',properties:{product_id:{type:'string'},pack:{type:'string'},quantity:{type:'string'},market:{type:'string'},port:{type:'string'},company:{type:'string'},contact:{type:'string'},phone:{type:'string'},notes:{type:'string'},open_form:{type:'boolean'}},additionalProperties:false}},
  {name:'open_section',description:'Open a relevant SANAAM section instead of only explaining where it is.',parametersJsonSchema:{type:'object',properties:{target:{type:'string',enum:TARGETS}},required:['target'],additionalProperties:false}}
];

export async function executeSanaamSalesTool(name,args={}){
  const bridge=window.SanaamSalesBridge;if(!bridge)return {ok:false,error:'sanaam-sales-bridge-unavailable'};
  if(name==='get_sales_context')return {ok:true,context:bridge.getSalesContext()};
  if(name==='find_products')return bridge.findProducts(args);
  if(name==='show_product')return bridge.showProduct(args.product_id);
  if(name==='prepare_rfq')return bridge.prepareRfq(args);
  if(name==='open_section')return bridge.openSection(args.target);
  return {ok:false,error:'unknown-tool'};
}
