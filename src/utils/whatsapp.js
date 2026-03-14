const { IST } = require('./helpers');
exports.sendWA = async (to, message) => {
  const id = process.env.WA_PHONE_NUMBER_ID, key = process.env.WA_API_KEY;
  if (!id || !key || key === 'your_whatsapp_api_key') { console.log(`[WA PREVIEW] To:${to} | ${message.substring(0,60)}...`); return { success:true, preview:true }; }
  try {
    const fetch = require('node-fetch');
    const res = await fetch(`https://graph.facebook.com/v18.0/${id}/messages`, { method:'POST', headers:{ 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify({ messaging_product:'whatsapp', to:to.replace(/\D/g,''), type:'text', text:{ body:message } }) });
    const d = await res.json();
    return { success:true, messageId:d.messages?.[0]?.id };
  } catch(e) { return { success:false, error:e.message }; }
};
