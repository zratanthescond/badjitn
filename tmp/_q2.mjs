import {readFileSync} from 'fs';
const o=JSON.parse(readFileSync('tmp/_orders-full.json','utf8'));
const g=(x,f)=>(x.requiredUserInfo||[]).find(r=>r.field===f)?.value||'';
const names=new Set();
for(const x of o){const l=(x.details||[]).filter(d=>/uit/i.test(d.name));
 const rm=g(x,'roommateName');
 if(!l.length&&!rm)continue;
 console.log(x.orderNumber,'|',g(x,'firstName'),g(x,'lastName'),'|',g(x,'Téléphone / WhatsApp'),'|',l.map(d=>d.name.replace(/.*du /,'')+':'+d.option.replace('Chambre ','')+d.price).join(', '),'| rm=',rm,'|',g(x,'roommateEmail'));}
