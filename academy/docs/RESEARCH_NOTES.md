# Research notes for `js/content/shared.js` (researched 2026-10-14)

## How URLs were verified (read this first)

The research sandbox blocks most outbound hosts. `curl` through the proxy got HTTP 200 for only two hosts, and `WebFetch` could not resolve arxiv.org, huggingface.co, nist.gov, openai.com and others. So **direct fetching was not possible for most links**.

Instead, each URL was checked with `WebSearch`: it counts as verified only if that exact URL came back in live search results for a query on its own domain, with matching title/content. This proves the page is indexed and what it is about. It does not prove it returned HTTP 200 today. Two URLs were fetched directly: `anthropic.com/research` and `anthropic.com/engineering/building-effective-agents`.

Counts: 66 candidates in the first draft of the resource list; 60 shipped (all search-verified); 6 dropped for the 40-60 cap, not because they failed (Kaggle Learn, UNESCO Recommendation, Chroma getting started, Gemini API keys, OpenAI safety best practices, Dive into Deep Learning). Of an initial brainstorm of 145 URLs, the rest were never shipped: some were not searched (to stay within the cap), and some could not be confirmed (Hugging Face Transformers/PEFT doc roots, GitHub repos such as llama.cpp, nanoGPT and the cookbooks, which the proxy blocks). BERT, Llama 2 and Toolformer were search-verified but cut for space. Nothing unverified was added. Recommended follow-up: run a link checker from an unrestricted network before release.

## Sources relied on

- Papers: arXiv abstract/PDF pages for 1706.03762, 2005.14165, 2201.11903, 2005.11401, 2203.02155, 2210.03629, 2106.09685, 2001.08361, 2203.15556, 2212.08073, 2305.18290, 2307.03172 (titles and authors confirmed from search snippets).
- Provider docs: Claude (docs.claude.com, platform.claude.com), OpenAI (platform.openai.com, developers.openai.com, help.openai.com), Google Gemini (ai.google.dev).
- Independent evaluation: Artificial Analysis, LMArena, Stanford CRFM HELM, Epoch AI, Stanford HAI AI Index 2026.
- Security/governance: OWASP GenAI LLM Top 10 and Secrets Management cheat sheet, NIST AIRC, MITRE ATLAS, UK NCSC, UK ICO, OECD, European Commission AI Act pages.
- EU AI Omnibus: law-firm summaries (White & Case, K&L Gates, Gibson Dunn, Orrick, Cuatrecasas) plus the Commission's AI Act page.

## What could not be verified

- **The Official Journal text of Regulation (EU) 2026/1744** (the Digital Omnibus on AI) was not fetched. Publication date (24 July 2026), entry into force (27 July 2026) and new deadlines (Annex III: 2 Dec 2027; Annex I: 2 Aug 2028) come from secondary sources, and the Commission's page agrees on entry into force and deadlines. Sources disagree on adoption date (8 July vs June) and on the Article 50(2) labelling grace period. The entry tells students to check primary text.
- The **OWASP LLM Top 10 2026 edition** was announced (September 2026) but its ranking was not read; the resource entry links the project's list page and says to read the latest.
- **Google's Gemini API key rules** had conflicting dates across pages (May-September 2026); the entry only says policies are tightening.
- **Model names that appear in some provider examples** (e.g. in OpenAI docs and AA index pages) could not be matched to anything verifiable, so no specific model names or rankings are asserted as fact anywhere. Product families appear only as examples (gpt-oss, Qwen, Gemma, via the Ollama page).
- Course details (durations, prices, cohort dates, certificate fees) were not verified; `free: 'mixed'` marks paid or partly paid items. BlueDot course dates and the CS224N video availability change.
- Whether any page loads today (see above).

## Things that go stale fastest (refresh quarterly, or monthly for the first group)

1. **EU AI Act dates and Omnibus details**; whether the Article 50 labelling grace period and the high-risk deadlines moved again; national enforcement bodies.
2. **Key and billing policies**: Google's key types/restrictions, OpenAI/Anthropic project, workspace and service-account terminology, spend-limit features and tiers.
3. **Documentation URLs and domains**: providers moved docs (docs.anthropic.com to docs.claude.com / platform.claude.com; platform.openai.com to developers.openai.com). Re-check every provider link; Ragas, LangGraph, TRL and Hugging Face course URLs are version-sensitive.
4. **Evaluation sites**: Artificial Analysis index versions, LMArena categories, HELM leaderboards, Epoch metrics. Sites rename, merge or change method.
5. **OWASP LLM Top 10 edition**, NIST AI RMF revision status, MITRE ATLAS counts, NCSC/CISA guidance.
6. **MCP**: spec is date-versioned (2026-07-28 made it stateless). The landscape entry links that revision; update when a new one ships.
7. **Landscape categories**: any named models, open-weight families, "reasoning" and "agent" product notions, and the US/China lead claim from the AI Index.
8. **Regulator guidance under review**: UK ICO AI guidance (being reviewed after the Data (Use and Access) Act), NIST AI RMF (being revised).
9. **Course and cohort details** (fast.ai edition, HF courses' syllabi, DeepLearning.AI catalogue, BlueDot application windows).

Stable (low refresh risk): the 12 papers, Illustrated Transformer, Karpathy and 3Blue1Brown material, Lilian Weng's agents post, Jurafsky and Martin (draft updates but URL stable), OECD principles.
