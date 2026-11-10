// One image, three services. With an agent's keys (spredr writes SPREDR_AGENT_ID once the agent is registered) it is an
// agent: an «article» asks the helper for two «sources» at once with ctx.delegate and writes with what comes back; a
// «sources» takes two seconds. Without them it is a plain web service: /health and a line of text. No model, no bill.
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8080);
const HELPER = process.env.HELPER_AGENT ?? 'chain-helper';
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

if (process.env.SPREDR_AGENT_ID) {
  const { Agent } = await import('@spredr/sdk');
  new Agent({
    description: 'spredr lab: agents that hand parts of a task to each other',
    tasks: [{ kind: 'article', description: 'Write an article asking for sources' }, { kind: 'sources', description: 'Find sources' }],
    sleepAfterMinutes: 5,
    concurrency: 4,
    timeoutSeconds: 60,
  })
    .on('article', async (input, ctx) => {
      const topic = String(input?.topic ?? 'coffee');
      const [sources, prices] = await Promise.all([
        ctx.delegate(HELPER, 'sources', { topic }, { title: `Sources: ${topic}` }),
        ctx.delegate(HELPER, 'sources', { topic: `prices of ${topic}` }, { title: `Prices: ${topic}` }),
      ]);
      return { text: `An article on ${topic} with ${sources.found} and ${prices.found}` };
    })
    .on('sources', async (input) => {
      await pause(2_000);
      return { found: `sources on ${String(input?.topic ?? '')}` };
    })
    .listen(PORT);
} else {
  createServer((request, response) => {
    if (request.url === '/health') { response.writeHead(200).end('ok'); return; }
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('spredr lab: a plain service beside two agents\n');
  }).listen(PORT);
}
