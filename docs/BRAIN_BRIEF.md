# Brief v2: "My Brain" portfolio

Supersedes the creative direction in `STUDIO_SPEC.md` (the "working notebook"
site in `site/`). The verified facts, the do-not-publish list and the
positioning work in `STUDIO_SPEC.md` §1–2 still apply.

## Mission

An interactive portfolio for Bryan Agas built around one idea: **visitors
enter Bryan's brain.** Compartments of the brain hold the parts of him:

| Compartment | What it holds |
|---|---|
| PROJECTS | What he has built (Both Homes, the tools, the first CV site) |
| SKILLS | What he can do, and where each skill came from |
| EXPERIENCE | The path: shop floor, sales, kitchens, code |
| MINDSET | How he thinks: calm, clarity, agreement, privacy, shipping |
| CURRENT WORK | What he is building right now |
| EXPERIMENTS | AI, data, automation and agent work |
| IDEAS | Ideas in progress and how they get captured |

Signals (particles, pulses along neural pathways) travel between
compartments. The brain is not decoration: **it is the navigation, the
storytelling system and the picture of how he thinks.** Items in one
compartment link to items in others, so a visitor can follow a thought across
the brain (for example Both Homes → its stack in Skills → the customer-service
years in Experience → "calm beats clever" in Mindset).

Feel: futuristic, intelligent, cinematic, interactive, premium, personal,
technically impressive. Never at the cost of usability: it must be obvious
how to explore it, and everything must be reachable without the animation
(keyboard, screen reader, reduced motion, small phones).

Target reaction: "I haven't seen a portfolio like this before."

## Process and checkpoint

```
Bryan → Jane → Scout (research + story) → Nova (brain design)
      → Forge (interactive prototype) → Sentinel (independent review)
      → Jane (improve) → PROTOTYPE → STOP: present to Bryan
      → [approval] → full build → test/fix/retest → deploy → production QA
```

**Phase now: prototype only.** The prototype must demonstrate the
experience, not a static mockup: the brain, its compartments, moving neural
flows, navigation between areas, project presentation, skills, mindset,
experience, current work, key animations and interactions, desktop and a
working mobile version. After it is presented, nothing more is built until
Bryan approves. After approval Jane runs the rest without routine questions.

The prototype is reviewed as a private Claude Artifact (Netlify deploy is
still blocked by the container's network policy).

## Content sources for the prototype

1. **Verified** (may be stated): everything in `STUDIO_SPEC.md` §1.
2. **Observed in Bryan's own workspace, to confirm before going public**
   (used in the private prototype, flagged when presenting):
   - This portfolio is being made by an AI "studio" he directs (an
     orchestrator plus research, design, engineering and QA agents).
   - A multi-agent product-research workflow (scout, vetter, builder,
     auditor roles) for an e-commerce side project.
   - An "Idea Bank": raw ideas captured, expanded and scored in a workbook.
   - Both Homes has a Supabase-backed app and an early repo built with an
     AI app builder (repo name `rork-both-homes`).
   - Automation tooling connected (n8n).
3. **Never**: invented clients, metrics, testimonials, employers or outcomes.
