import { readFile } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:3000';

async function main(){
  const raw = await readFile('tests/fixtures/modules-no-dates.csv','utf8');
  // create user session fetch
  const userResp = await fetch(`${BASE}/api/session/user`);
  const user = await userResp.json();
  const userId = user.user.id;
  // create term
  const termResp = await fetch(`${BASE}/api/terms`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title:'Debug Term', startDate:'2025-08-01', endDate:'2025-11-30' })});
  const term = await termResp.json();
  console.log('Term create response:', term);
  const mapping = { code:'Code', title:'Title', creditHours:'Credit Hours' };
  const ingestResp = await fetch(`${BASE}/api/import/ingest`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ importType:'modules', raw, mapping, userId, termId: term.term?.id })});
  const ingest = await ingestResp.json();
  console.log('Ingest response:', ingest);
}
main().catch(e=>{console.error(e); process.exit(1);});
