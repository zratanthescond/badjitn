const fs = require('fs');
try {
  const enStr = fs.readFileSync('d:/BARAKODE/badgi solution/badgitn/messages/en.json', 'utf8');
  const esStr = fs.readFileSync('d:/BARAKODE/badgi solution/badgitn/messages/es.json', 'utf8');
  
  const en = JSON.parse(enStr);
  const es = JSON.parse(esStr);
  
  console.log("EN Footer:");
  console.log(JSON.stringify(en.footer || en.Footer, null, 2));
  console.log("ES Footer:");
  console.log(JSON.stringify(es.footer || es.Footer, null, 2));
} catch (err) {
  console.error(err);
}
