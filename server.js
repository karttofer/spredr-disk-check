// On demand, measured from outside: does a request start it from where it was (a snapshot) or from zero?
// Its boot does real work (an index built in memory, as an app warms its caches), and it keeps state that only lives
// in its memory: who it is (born), how many requests it answered (hits), and a clock that ticks every second.
// After a snapshot the same born and hits come back, and the clock did not tick while it was off; from zero all is new.
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const began = performance.now();
const index = new Map();
for (let i = 0; i < 400_000; i += 1) index.set(`key-${i}`, { i, tags: [i % 7, i % 13], text: `entry ${i}`.repeat(4) });
const warm = JSON.parse(JSON.stringify([...index.values()].slice(0, 100_000))).length;
const bootMs = Math.round(performance.now() - began);

const born = randomUUID();
const bornAt = new Date().toISOString();
let hits = 0;
let ticks = 0;
setInterval(() => { ticks += 1; }, 1_000);

createServer((request, response) => {
  if (request.url === '/health') { response.end('ok'); return; }
  hits += 1;
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-store');
  response.end(JSON.stringify({ born, bornAt, bootMs, hits, ticks, aliveS: Math.round(process.uptime()), now: new Date().toISOString(), entries: index.size, warm }));
}).listen(8080, () => console.log(`wake-test: booted in ${bootMs} ms as ${born}`));
