import quiz from './q08.js';
const Q = (id, title) => { const q = quiz.find((x) => x.id === id); return { title, fnName: q.fnName, starter: q.starter, tests: q.tests, hints: q.hints }; };

export default {
  id: 'l4-08', title: 'Cost optimisation and caching', minutes: 22,
  hook: 'The demo cost pennies; the launch costs thousands; the difference is arithmetic you can do in advance.',
  skills: ['l4.cost'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "LLM providers typically charge per token, with output tokens costing more than input tokens. The monthly bill is therefore requests x tokens x price, modified by caching, retries and routing. Because those are all numbers you control, you can model the bill before launch and watch it after." },
    { t: 'widget', w: 'costcalc', props: {}, caption: 'Try this: double the retries percentage, then raise the cache hit rate to 60%. Which lever matters more? (The prices are example numbers; enter your provider\'s.)' },
    { t: 'h', text: 'Where the money goes' },
    { t: 'list', items: [
      "**Input size**: long system prompts, bulky retrieved chunks and ever-growing chat history are paid for on every call.",
      "**Output size**: verbose answers and long reasoning cost more and take longer.",
      "**Call count**: agents multiply calls; retries and loops multiply them again.",
      "**Model choice**: a larger model can cost many times more per token than a small one." ] },
    { t: 'h', text: 'Levers' },
    { t: 'steps', items: [
      { title: 'Measure first', md: "Log tokens and cost per request, by feature and by release (lesson 7). You cannot optimise what you cannot see." },
      { title: 'Route by difficulty', md: "Send simple, well-defined tasks (classification, extraction, short rewrites) to a small cheap model and keep the large model for hard cases. Verify with your eval set that quality holds, and add a fallback to the stronger model when confidence is low." },
      { title: 'Prompt caching', md: "Many providers can reuse the processed prefix of a prompt when it is identical across calls, at a reduced price and lower latency. To benefit, put stable content (instructions, tool definitions, reference documents) **first** and variable content (the user's message) **last**. Details such as minimum size, lifetime and discount differ by provider; check the docs." },
      { title: 'Response / semantic caching', md: "Store whole answers for repeated questions. Exact-match caching is safe and simple. Semantic caching (match by embedding similarity) can return a wrong answer to a question that merely looks similar, so use a strict threshold, never cache personalised or time-sensitive answers, and scope the cache per tenant." },
      { title: 'Trim', md: "Shorter prompts, fewer retrieved chunks after reranking, summarised history, a max output length, structured output instead of prose." },
      { title: 'Batch non-urgent work', md: "Offline jobs (nightly classification, evaluation runs) can often use a cheaper asynchronous batch interface where offered." } ] },
    { t: 'current', key: 'caching-and-batch' },
    { t: 'callout', kind: 'warn', title: 'Caching is not free to start', md: "Providers that offer explicit prompt caching often price **writing** a cache entry differently from ordinary input, and **reading** it back more cheaply. So the saving depends on how often an entry is reused before it expires: at a low hit rate the write premium can cancel the read discount. The calculator below and the exercise use a simple read-discount-only model, so measure your real hit rate and check your provider's current pricing before trusting a forecast." },
    { t: 'callout', kind: 'warn', title: 'Caches leak', md: "A shared response cache that ignores who is asking can show one customer's answer to another. Include tenant and permission context in the cache key, or do not cache that endpoint." },
    { t: 'predict', q: "Your prompt is: [user question][2,000 words of policy text][tool definitions]. Prompt caching saves almost nothing. Why?", options: ["The user question comes first, so the prefix differs on every request", "Policy text cannot be cached", "Tool definitions disable caching", "Caching only works for short prompts"], answer: 0, explain: "Prefix caching matches from the start. Anything that varies near the front breaks the match for everything after it. Put stable content first.", skill: 'l4.cost' },
    { t: 'p', md: "Now compute a real estimate with cache savings." },
    { t: 'widget', w: 'codeplay', props: Q('l4-08-q4', 'monthlyCost') },
    { t: 'try', prompt: "Your feature has 10,000 requests a day. A teammate proposes switching everything to the cheapest model. Write the three checks you would insist on first.", sample: "1. Run the golden set on the cheap model and compare per-category quality, especially the must-pass cases. 2. Estimate cost of failures: if the cheap model's errors cause escalations or rework, net savings may vanish. 3. Prefer routing: cheap model for the easy majority, strong model as fallback for low-confidence cases, then re-measure the blended cost and quality." }
  ],
  reteach: [
    { style: 'analogy', md: "Paying per token is like paying a taxi by the mile: a long route, repeated trips, and a limousine when a hatchback would do all add up. Caching is a season ticket for the part of the route you drive every day." },
    { style: 'simple', md: "Cost is how many words go in, how many come out, how many times you ask, and which model you ask. Cut any of those, reuse answers you already have, and use the cheap model when it is good enough." },
    { style: 'technical', md: "cost per request = (uncached_in x p_in + cached_in x p_in x m + out x p_out) / 1e6 summed over all model calls including retries and loop iterations. Optimise the largest term first; validate each change against the eval suite and track quality-adjusted cost." }
  ],
  quiz,
  takeaways: ['Bill = calls x tokens x price; retries and loops multiply it.', 'Measure per feature and release before optimising.', 'Route by difficulty, validated on your evals.', 'Cache carefully: stable prefix first, strict thresholds, tenant-scoped keys.'],
  apply: "Estimate your feature's monthly cost at 10x current traffic with your provider's real prices. Which input would you check first?"
};
