export const current = {
  'owasp-llm-top10': {
    title: 'OWASP Top 10 for LLM Applications',
    asOf: '2026-10',
    md: "OWASP's GenAI Security Project publishes a ranked list of the main risks for LLM applications. The most recent edition I could confirm is the **2025 edition (v2.0)**, whose ten categories are: Prompt Injection, Sensitive Information Disclosure, Supply Chain, Data and Model Poisoning, Improper Output Handling, Excessive Agency, System Prompt Leakage, Vector and Embedding Weaknesses, Misinformation, and Unbounded Consumption (which grew out of the earlier Denial of Service entry to include cost and resource abuse).\n\nUse it as a checklist when you threat-model. Names, ordering and numbering change between editions, so check the project page for a newer version before citing it in a document. Related lists for agentic systems also exist and are evolving; look for them on the same site.\n\nWhat is likely to go stale: the edition, the category names and numbers, and any companion guidance for agents.",
    sources: [{ label: 'OWASP GenAI Security Project: LLM Top 10', url: 'https://genai.owasp.org/llm-top-10/' }, { label: 'OWASP: LLM01 Prompt Injection', url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/' }]
  },
  'otel-genai': {
    title: 'Standard names for tracing LLM calls',
    asOf: '2026-10',
    md: "OpenTelemetry, the vendor-neutral observability standard, maintains **semantic conventions for generative AI**: agreed attribute names for things like model, token counts and operations, so traces look the same across tools. Many LLM observability products can ingest or export OpenTelemetry data, and others use their own formats.\n\nThe GenAI conventions have been marked as still evolving, so attribute names may change between releases. Check the current specification status before standardising on names, and check whether your chosen observability tool supports them.\n\nWhat is likely to go stale: attribute names, stability status, and which products support the standard.",
    sources: [{ label: 'OpenTelemetry: Semantic conventions for generative AI', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/' }]
  },
  'caching-and-batch': {
    title: 'Provider caching and batch features: how to check',
    asOf: '2026-10',
    md: "Several model providers offer **prompt caching** (reduced price and latency for a repeated prompt prefix) and an **asynchronous batch interface** for non-urgent work. The details differ and change: how caching is switched on (automatic or by marking sections), the minimum prompt length, how long cached content lives, how much cheaper it is, and whether batch results are discounted.\n\nBefore designing around either, read your provider's current documentation and then **measure**: log cached versus uncached input tokens from the response usage fields, and compute your real hit rate. Put your own measured numbers into the cost calculator rather than quoted figures.\n\nWhat is likely to go stale: every parameter name, discount, lifetime and minimum size.",
    sources: [{ label: 'Anthropic docs: Prompt caching', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-caching' }, { label: 'OpenAI docs: Prompt caching', url: 'https://platform.openai.com/docs/guides/prompt-caching' }]
  },
  'agent-tool-protocols': {
    title: 'Tool and agent protocols: what to check',
    asOf: '2026-10',
    md: "Open protocols such as the **Model Context Protocol (MCP)** let you plug external tools and data sources into agents through a common interface. Convenience raises a security question: every connected server's tool descriptions and outputs become text your model reads, so treat third-party servers as untrusted input, review what each tool can do, grant minimum scopes, and require approval for write actions.\n\nCheck the current specification for its authorisation model and version, and your client's documentation for how permissions are enforced.\n\nWhat is likely to go stale: protocol versions, authorisation details and client behaviour.",
    sources: [{ label: 'Model Context Protocol specification', url: 'https://modelcontextprotocol.io/specification' }]
  }
};
