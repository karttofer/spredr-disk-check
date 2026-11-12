// On demand, measured from outside: where a cold start's time goes. Every mark is on this machine's own clock (ms since
// the epoch): the Node process born (performance.timeOrigin), Node reaching this file, the app's warm-up done and
// listening, the first health check, the first real request. The measurer adds when its request reached the machine
// (the response's date less the proxy's server-timing) and splits the wait: container and gVisor, Node, the app, the
// wait for the health check. Its boot does real work (an index built in memory, as an app warms its caches).
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const at = () => Math.round(performance.timeOrigin + performance.now());
const marks = { nodeBorn: Math.round(performance.timeOrigin), codeReached: at(), listening: 0, firstHealth: 0, firstRequest: 0 };
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
  if (request.url === '/health') { if (!marks.firstHealth) marks.firstHealth = at(); response.end('ok'); return; }
  if (!marks.firstRequest) marks.firstRequest = at();
  hits += 1;
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-store');
  response.end(JSON.stringify({ born, bornAt, bootMs, hits, ticks, aliveS: Math.round(process.uptime()), now: at(), marks, entries: index.size, warm }));
}).listen(8080, () => { marks.listening = at(); console.log(`wake-test: booted in ${bootMs} ms as ${born}`); });
