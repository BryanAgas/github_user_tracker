// Level 5 — Models & Machine Learning
import { lessons as a } from './l5/a.js';
import { lessons as b } from './l5/b.js';
import { lessons as c } from './l5/c.js';
import { lessons as d } from './l5/d.js';
import { lessons as e } from './l5/e.js';
import { extra } from './l5/extra.js';

const base = [...a, ...b, ...c, ...d, ...e];
for (const L of base) if (extra[L.id]) L.quiz.push(...extra[L.id]);

export default {
  skills: [
    { id:'l5.loss-gradient', name:'Loss and gradient descent', desc:'Explain loss, gradients and learning rate, and compute a gradient step.' },
    { id:'l5.neural-nets', name:'Neural network mechanics', desc:'Layers, non-linearity, backpropagation intuition and parameter counting.' },
    { id:'l5.embeddings', name:'Embeddings and representation', desc:'What embeddings are, how they are learned, and how to compare them.' },
    { id:'l5.attention', name:'Attention', desc:'Scaled dot-product attention, softmax, masks and cost.' },
    { id:'l5.transformer', name:'The transformer', desc:'Blocks, residuals, positional information, decoder-only models, parameter and FLOP estimates.' },
    { id:'l5.pretraining', name:'Pretraining and scaling', desc:'Next-token objective, training compute, scaling ideas and their limits.' },
    { id:'l5.data-quality', name:'Data quality', desc:'What data quality means: dedupe, contamination, coverage, privacy and labels.' },
    { id:'l5.finetuning', name:'Fine-tuning and LoRA', desc:'Full versus parameter-efficient tuning, and when not to fine-tune.' },
    { id:'l5.rl', name:'Reinforcement learning', desc:'Rewards, policies, Q-learning and reward hacking.' },
    { id:'l5.preference', name:'RLHF and preference optimisation', desc:'Reward models, KL penalty and DPO-style training at intuition level.' },
    { id:'l5.evaluation', name:'Model evaluation', desc:'Precision, recall, F1, thresholds, benchmark limits, contamination and uncertainty.' },
    { id:'l5.running-models', name:'Running models locally', desc:'Memory arithmetic, KV cache, quantisation and speed limits.' },
    { id:'l5.model-selection', name:'Model selection', desc:'An evidence-based process for choosing and adapting a model.' },
    { id:'l5.training-at-scale', name:'Training at scale and modern architecture', desc:'BPE, Adam, mixed precision, FlashAttention, GQA, mixture of experts and parallelism.' },
    { id:'l5.verifiable-rewards', name:'Post-training with verifiable rewards', desc:'RLVR, GRPO-style group advantages, pass@k and reward hacking of verifiers.' }
  ],
  lessons: base,
  projects: [
    {
      id:'p5', level:5, kind:'text',
      title:'Model selection and adaptation decision memo',
      objective:'Write a realistic decision memo that chooses a model and an adaptation strategy for a stated use case, backed by an evaluation plan, resource arithmetic and a risk analysis.',
      skills:['l5.model-selection','l5.evaluation','l5.finetuning','l5.running-models','l5.data-quality'],
      requirements:[
        'State a specific use case with users, volume, data sensitivity and constraints (latency, budget, hardware, licence).',
        'Compare at least three candidate models or model classes (for example closed API, open-weight self-hosted, small tuned model) against your constraints.',
        'Define an evaluation set: size, how examples are collected, how answers are scored, and how you will avoid contamination.',
        'Name metrics with a justification (for example precision and recall, or task success rate) and a pass threshold chosen in advance.',
        'Decide where you sit on the adaptation ladder (prompting, retrieval, fine-tuning) and justify it, including when you would NOT fine-tune.',
        'Do memory arithmetic for any model you would self-host: weights at a stated precision plus an estimate for KV cache.',
        'List at least three risks or failure modes with a mitigation each, including one about data or privacy.',
        'End with a clear recommendation, what evidence would change it, and a re-evaluation trigger.'
      ],
      guidance:[
        { title:'1. Pick a use case you can describe concretely', md:"Choose something real from your work or a plausible one: for example summarising support tickets for a team, extracting fields from invoices, or answering questions over an internal handbook. Write who uses it, how many requests per day, what the inputs look like and what happens if it is wrong." },
        { title:'2. Write constraints before candidates', md:"List hard constraints (data cannot leave the network? must respond in under two seconds? licence must allow commercial use? one 24 GB GPU?) and soft preferences. These remove options before you measure anything. Do not quote prices or leaderboard ranks from memory; say where you would check them." },
        { title:'3. Design the evaluation before you test', md:"Say how many examples, where they come from, who writes the reference answers, how outputs are scored (programmatic check, human rubric, or a judge model calibrated against humans) and what metric and threshold counts as good enough. Include hard and adversarial cases and a held-out slice that is never used for prompt tuning. With 100 items an accuracy has roughly plus or minus 8 points of uncertainty; say how that affects your decision." },
        { title:'4. Walk the adaptation ladder', md:"Start with prompting plus examples. Add retrieval if the gap is knowledge. Consider fine-tuning only if the evaluation shows prompting cannot reach the threshold or costs too much at volume. Explain what training data you would need and how you would check its quality." },
        { title:'5. Do the resource arithmetic', md:"If self-hosting, compute weights memory as parameters x bits / 8, add a KV cache estimate (2 x layers x kv heads x head dim x tokens x bytes) and working memory, and compare with your hardware. Estimate tokens per second from memory bandwidth divided by model size." },
        { title:'6. Risks, recommendation and review triggers', md:"List failure modes (hallucination, bias, privacy leaks, licence issues, vendor change, evaluation contamination) with mitigations. Finish with a recommendation and what result would make you change your mind. Say when you will re-run the evaluation." }
      ],
      hints:[
        'Use headings so each required part is easy to find: Use case, Constraints, Candidates, Evaluation plan, Adaptation decision, Resources, Risks, Recommendation.',
        'If your memo does not contain a number you computed (for example GB of memory), you probably have not done the arithmetic.',
        'Name your decision criterion for fine-tuning explicitly: "I would fine-tune only if the prompted baseline scores below X on the evaluation set."',
        'A strong memo says what evidence would reverse its own recommendation.'
      ],
      success:[
        'A reader can see exactly which model and approach you recommend and why, in terms of the stated constraints.',
        'The evaluation plan could be executed by someone else: sizes, scoring, metrics and thresholds are specified.',
        'Fine-tuning versus prompting versus retrieval is argued, not assumed.',
        'Resource figures are computed with shown arithmetic.',
        'Risks are concrete and each has a mitigation; claims about models are hedged appropriately.'
      ],
      checks:[
        { id:'sections', label:'At least 7 headed sections', type:'sections', n:7, hint:'Start section lines with # (for example "# Use case", "# Evaluation plan").' },
        { id:'words-min', label:'At least 600 words', type:'minWords', n:600, hint:'A decision memo needs enough detail to be actionable; aim for 700 to 1100 words.' },
        { id:'words-max', label:'No more than 2000 words', type:'maxWords', n:2000, hint:'Cut repetition; a memo should be readable in a few minutes.' },
        { id:'usecase', label:'States a use case with volume or users', type:'regex', pattern:'use case[\\s\\S]*(requests?|users?|tickets?|documents?|per (day|month|week))', flags:'i', hint:'Describe who uses it and roughly how many requests per day or month.' },
        { id:'constraints', label:'Mentions constraints (latency, privacy, budget, hardware or licence)', type:'regex', pattern:'(latency|privacy|budget|hardware|licen[cs]e|gpu)', flags:'i', hint:'List at least latency, privacy, budget, hardware or licence constraints.' },
        { id:'candidates', label:'Compares candidate models', type:'regex', pattern:'(candidate|shortlist|option)[\\s\\S]*(open-weight|closed|api|self-host|small model)', flags:'i', hint:'Compare at least three options such as a closed API, an open-weight model and a small tuned model.' },
        { id:'evalset', label:'Defines an evaluation set', type:'regex', pattern:'(evaluation|eval|test) (set|dataset)', flags:'i', hint:'Say how many examples, where from and how scored.' },
        { id:'metrics', label:'Names metrics', type:'regex', pattern:'(precision|recall|f1|accuracy|task success|pass rate)', flags:'i', hint:'Choose metrics such as precision, recall, F1, accuracy or task success rate.' },
        { id:'threshold', label:'Sets a pass threshold in advance', type:'regex', pattern:'(threshold|target|at least|pass mark|acceptance|\\d+\\s?%)', flags:'i', hint:'State what score counts as good enough before testing.' },
        { id:'contam', label:'Addresses contamination or held-out data', type:'regex', pattern:'(contaminat|held[- ]out|leak)', flags:'i', hint:'Explain how you keep evaluation data out of prompts, tuning and training.' },
        { id:'ladder', label:'Discusses prompting, retrieval and fine-tuning', type:'regex', pattern:'(?=[\\s\\S]*(prompt))(?=[\\s\\S]*(retriev|rag))(?=[\\s\\S]*(fine-?tun|lora))', flags:'i', hint:'Cover prompting, retrieval and fine-tuning and justify where you land.' },
        { id:'not-ft', label:'Says when you would NOT fine-tune (or only if a condition holds)', type:'regex', pattern:'(would not|do not|don.t|only if|unless|not fine-?tun)', flags:'i', hint:'State the condition that would justify fine-tuning, and when you would avoid it.' },
        { id:'memory', label:'Includes memory arithmetic in GB', type:'regex', pattern:'\\d+(\\.\\d+)?\\s?(gb|gib)', flags:'i', hint:'Show weights memory, for example 7B parameters at 4 bits is about 3.5 GB.' },
        { id:'bits', label:'Mentions precision or quantisation', type:'regex', pattern:'(quantis|quantiz|\\d+[- ]?bit|fp16|bf16|precision)', flags:'i', hint:'State the bit width or quantisation of any self-hosted model.' },
        { id:'risks', label:'Lists risks or failure modes', type:'regex', pattern:'(risk|failure mode|hallucinat|bias|privacy)', flags:'i', hint:'List at least three risks with mitigations.' },
        { id:'recommend', label:'Gives a recommendation', type:'regex', pattern:'(recommend|decision|we (will )?(choose|select|adopt))', flags:'i', hint:'End with a clear recommendation.' },
        { id:'revisit', label:'Says what would change the decision', type:'regex', pattern:'(revisit|re-?evaluat|change (my|our) (mind|decision)|would change|trigger)', flags:'i', hint:'Name the evidence or event that would make you reverse or revisit the choice.' }
      ],
      rubric:[
        { criterion:'Use case and constraints', lookFor:'Concrete, realistic use case with volume, data sensitivity and hard constraints that actually drive later choices.' },
        { criterion:'Candidate comparison', lookFor:'At least three genuinely different options compared against the constraints, not a list of names; avoids unsupported claims about rankings or prices.' },
        { criterion:'Evaluation plan', lookFor:'Executable plan: size, sourcing, scoring method, metric choice justified by error costs, threshold fixed in advance, contamination avoided, uncertainty acknowledged.' },
        { criterion:'Adaptation reasoning', lookFor:'Climbs prompting, retrieval, fine-tuning with explicit conditions; correctly distinguishes behaviour from knowledge; considers data quality if tuning.' },
        { criterion:'Technical accuracy', lookFor:'Memory arithmetic correct (params x bits / 8, KV cache), claims about methods hedged appropriately, no invented numbers presented as fact.' },
        { criterion:'Risks and decision quality', lookFor:'Specific risks with mitigations; recommendation is clear, justified and revisable.' }
      ],
      extensions:[
        'Write a one-page evaluation protocol with the exact scoring rubric and ten sample items.',
        'Compute the break-even request volume at which self-hosting becomes cheaper than an API, using prices you look up and cite with the date.',
        'Add a LoRA training plan: base model, rank, data size, held-out set, and a regression suite for general and safety behaviour.'
      ],
      est:'90 min'
    }
  ],
  glossary: [
    { term:'Loss', def:'A number measuring how wrong a model\'s predictions are on data. Training adjusts parameters to reduce it. Examples: mean squared error, cross-entropy.', level:5, see:['Gradient','Cross-entropy'] },
    { term:'Gradient', def:'The slope of the loss with respect to each parameter: how the loss changes if that parameter increases slightly. Gradient descent steps against it.', level:5, see:['Learning rate','Backpropagation'] },
    { term:'Learning rate', def:'The step size in gradient descent. Too small is slow; too large overshoots and can diverge.', level:5, see:['Gradient'] },
    { term:'Cross-entropy', def:'A loss for predicted probabilities: the negative log of the probability given to the correct answer. Zero for certainty in the right answer, large for confident mistakes.', level:5, see:['Loss','Perplexity'] },
    { term:'Perplexity', def:'The exponential of the average cross-entropy; roughly the number of equally likely next-token choices the model is torn between. Lower is better at predicting text.', level:5, see:['Cross-entropy'] },
    { term:'Backpropagation', def:'An efficient way to compute the gradient of the loss for every weight using the chain rule, working backwards from the output. The optimiser then uses those gradients.', level:5, see:['Gradient'] },
    { term:'Activation function', def:'A non-linear function applied after a layer\'s weighted sum, such as ReLU or tanh. Without it, stacked layers collapse into one linear map.', level:5, see:['Backpropagation'] },
    { term:'Embedding', def:'A learned vector representing a token, text or image so that similar items sit close together in the space.', level:5, see:['Cosine similarity'] },
    { term:'Cosine similarity', def:'The cosine of the angle between two vectors: dot product divided by the product of their lengths. 1 means same direction, 0 unrelated, minus 1 opposite.', level:5, see:['Embedding'] },
    { term:'Attention', def:'An operation where each position computes weights over other positions from query-key similarity and returns a weighted blend of their values.', level:5, see:['Softmax','Transformer'] },
    { term:'Softmax', def:'A function turning a list of scores into positive weights summing to 1, by exponentiating and normalising. Larger scores get disproportionately larger weights.', level:5, see:['Attention'] },
    { term:'Causal mask', def:'A restriction in decoder models stopping each position from attending to later positions, so it cannot read the token it must predict.', level:5, see:['Attention'] },
    { term:'Transformer', def:'A neural network architecture made of repeated blocks, each with attention and a feed-forward network, wrapped in residual connections and normalisation.', level:5, see:['Residual connection','Attention'] },
    { term:'Residual connection', def:'A shortcut adding a layer\'s input to its output (x + Layer(x)), which eases gradient flow and lets layers learn refinements.', level:5, see:['Transformer'] },
    { term:'KV cache', def:'Stored keys and values of earlier tokens kept during generation so they are not recomputed. It grows with context length and number of concurrent sequences.', level:5, see:['Attention','Quantisation'] },
    { term:'Pretraining', def:'The first, large-scale training stage in which a model learns to predict the next token over a huge text corpus, producing a base model.', level:5, see:['Fine-tuning'] },
    { term:'Scaling laws', def:'Empirical relationships showing loss falling smoothly as parameters, data and compute grow. Used to plan training; they describe fitted trends, not guarantees.', level:5, see:['Pretraining'] },
    { term:'Fine-tuning', def:'Continuing training of a pretrained model on a smaller targeted dataset to change its behaviour. Best for style, format and narrow tasks, less reliable for adding facts.', level:5, see:['LoRA'] },
    { term:'LoRA', def:'Low-Rank Adaptation: freeze the original weights and train small low-rank matrices whose product is added to selected weight matrices, cutting trainable parameters and memory.', level:5, see:['Fine-tuning'] },
    { term:'Reward model', def:'A model trained on human comparisons to score outputs, standing in for human judgement during reinforcement learning from feedback.', level:5, see:['RLHF','Reward hacking'] },
    { term:'RLHF', def:'Reinforcement learning from human feedback: fine-tune on demonstrations, learn a reward model from human rankings, then optimise the model against it with a KL penalty.', level:5, see:['Reward model','DPO'] },
    { term:'DPO', def:'Direct Preference Optimisation: trains directly on preferred versus rejected answers against a frozen reference model, avoiding a separate reward model and RL loop.', level:5, see:['RLHF'] },
    { term:'Reward hacking', def:'When an agent exploits a flaw in its reward to score highly without achieving the intended goal; an instance of Goodhart\'s law.', level:5, see:['Reward model'] },
    { term:'Precision and recall', def:'Precision: of the items flagged, the fraction that were right. Recall: of the items that should be flagged, the fraction found. F1 is their harmonic mean.', level:5, see:['Confusion matrix'] },
    { term:'Confusion matrix', def:'A table of true positives, false positives, false negatives and true negatives, from which precision, recall and accuracy are computed.', level:5, see:['Precision and recall'] },
    { term:'Contamination', def:'Evaluation items appearing in a model\'s training data, so benchmark scores reflect memorisation rather than ability.', level:5, see:['Benchmark'] },
    { term:'Benchmark', def:'A fixed test set and scoring method used to compare models. Useful for screening, limited by contamination, saturation, narrow format and sensitivity to setup.', level:5, see:['Contamination'] },
    { term:'BPE', def:'Byte-pair encoding: build a token vocabulary by repeatedly merging the most frequent adjacent pair of symbols, starting from characters or bytes.', level:5, see:['Embedding'] },
    { term:'AdamW', def:'Adam with decoupled weight decay: per-weight step sizes scaled by gradient history, with decay applied directly to the weights rather than through the gradient.', level:5, see:['Gradient'] },
    { term:'Mixed precision', def:'Training with 16-bit numbers for compute and 32-bit master weights and optimiser state, saving memory and time while keeping updates accurate.', level:5, see:['AdamW'] },
    { term:'FlashAttention', def:'An exact attention algorithm that tiles the computation in fast on-chip memory so the full score matrix is never stored, cutting memory traffic.', level:5, see:['Attention','KV cache'] },
    { term:'Mixture of experts', def:'A layer with many expert networks and a router sending each token to the top few. Total parameters set memory; active parameters set per-token compute.', level:5, see:['Transformer'] },
    { term:'Tensor and pipeline parallelism', def:'Ways to split one model across devices: tensor parallelism splits individual matrix multiplications, pipeline parallelism places consecutive layers on different devices.', level:5, see:['Mixed precision'] },
    { term:'RLVR', def:'Reinforcement learning with verifiable rewards: the reward comes from a programmatic check (matching answer, passing tests) instead of a learned preference model.', level:5, see:['GRPO','Reward hacking'] },
    { term:'GRPO', def:'Group Relative Policy Optimization: sample several answers per prompt and use each answer\'s reward relative to the group as its advantage, with no learned critic.', level:5, see:['RLVR','RLHF'] },
    { term:'pass@k', def:'The probability that at least one of k sampled answers is correct, estimated unbiasedly from n samples of which c are correct.', level:5, see:['RLVR'] },
    { term:'Open-weight model', def:'A model whose trained weights are published for download and use under a licence. Not necessarily open-source, since data and training code may not be released.', level:5, see:['Quantisation'] },
    { term:'Quantisation', def:'Storing model weights in fewer bits, with shared scale factors, to save memory and speed up inference at the cost of some rounding error.', level:5, see:['KV cache','Open-weight model'] }
  ],
  current: {
    'l5-open-weight-landscape': {
      title:'Open-weight models: what to check right now',
      asOf:'2026-10',
      md:"Several organisations publish model weights, and the set of models, their sizes and their licences changes every few months. This entry gives a way to evaluate any release rather than a list to memorise.\n\n- **Read the licence itself.** Open-weight licences differ: some allow broad commercial use, others add use restrictions, user-count thresholds or attribution rules. Do not infer terms from the model's reputation.\n- **Check what is actually released.** Weights only, or also training code, evaluation code and information about the training data? The Open Source Initiative publishes a definition of open-source AI that asks for more than weights; use it as a checklist.\n- **Read the model card** for intended uses, known limitations, evaluation methods and the stated training-data summary.\n- **Check the base versus instruction-tuned variant.** Base models continue text; instruction-tuned variants follow prompts.\n- **Verify file provenance.** Download from the publisher's official repository and prefer file formats that cannot execute code on load.\n\nWhat will go stale: model names, sizes, licences and which models lead on any task. Rankings and prices are deliberately not quoted here; look them up on the day you decide, and always confirm with your own evaluation set.",
      sources:[
        { label:'Open Source Initiative: Open Source AI Definition', url:'https://opensource.org/ai/open-source-ai-definition' },
        { label:'Hugging Face Transformers: quantization overview', url:'https://huggingface.co/docs/transformers/main/en/quantization/overview' }
      ]
    },
    'l5-running-tools': {
      title:'Running models locally: tooling to know about',
      asOf:'2026-10',
      md:"Local inference tooling moves quickly. At the time of writing, two durable starting points are:\n\n- **llama.cpp**, an open-source (MIT-licensed) C/C++ inference project that runs models on a wide range of hardware and supports integer quantisation from roughly 1.5 to 8 bits. Its conversion scripts produce models in its GGUF file format.\n- **Hugging Face Transformers**, a Python library that loads many open models and documents several quantisation methods and their trade-offs.\n\nOther runtimes and desktop apps wrap these or similar engines. Names, supported formats, quantisation methods and hardware backends change often; check each project's own documentation and release notes before relying on a feature.\n\nWhat will go stale: tool names, supported model families, quantisation schemes and recommended settings. What will not: memory is weights plus KV cache plus overhead, and speed is limited by memory bandwidth for single-user generation.",
      sources:[
        { label:'llama.cpp on GitHub', url:'https://github.com/ggml-org/llama.cpp' },
        { label:'Hugging Face Transformers: quantization overview', url:'https://huggingface.co/docs/transformers/main/en/quantization/overview' }
      ]
    },
    'l5-post-training-landscape': {
      title:'Post-training methods: foundations and what has moved',
      asOf:'2026-10',
      md:"Foundations (stable): supervised fine-tuning plus RLHF as described for InstructGPT (Ouyang et al., 2022), LoRA (Hu et al., 2021) and direct preference optimisation (Rafailov et al., 2023). Read the originals.\n\nWhat has moved (as of this entry): reinforcement learning against automatically checkable rewards (RLVR) became a central ingredient of post-training for reasoning-oriented models; GRPO (Shao et al., 2024), which replaces the learned critic with group-relative advantages, was used in the open DeepSeek-R1 work, and published variants such as Dr. GRPO and DAPO adjust normalisation, clipping and sampling. Tulu 3 described an open post-training recipe combining supervised fine-tuning, preference tuning and RLVR. Many preference-optimisation variants beyond DPO exist.\n\nWhat is contested: how far RLVR creates new capability rather than sharpening what the base model could already sample, how well gains transfer outside checkable domains, and which variant is best; reported results differ by model family and task. Commercial labs disclose their recipes only partly.\n\nWhat will go stale fastest: algorithm names and defaults, and any statement about which model uses which method. How to keep up: read the technical report or model card rather than summaries, separate what was measured from what was speculated, and re-run your own evaluation.",
      sources:[
        { label:'Training language models to follow instructions with human feedback (InstructGPT)', url:'https://arxiv.org/abs/2203.02155' },
        { label:'LoRA: Low-Rank Adaptation of Large Language Models', url:'https://arxiv.org/abs/2106.09685' },
        { label:'Direct Preference Optimization', url:'https://arxiv.org/abs/2305.18290' },
        { label:'DeepSeekMath (introduces GRPO)', url:'https://arxiv.org/abs/2402.03300' },
        { label:'DeepSeek-R1 (RL for reasoning)', url:'https://arxiv.org/abs/2501.12948' },
        { label:'Tulu 3 (open post-training recipe, RLVR)', url:'https://arxiv.org/abs/2411.15124' }
      ]
    },
    'l5-rl-reasoning-landscape': {
      title:'RL for reasoning models: current practice and open questions',
      asOf:'2026-10',
      md:"Current practice (as reported in public papers and technical reports): sample several answers per prompt; score them with a verifier (exact-match answers, unit tests, format checks) and sometimes a learned reward model; compute group-relative advantages (GRPO-style, without a critic) or a close variant; keep a KL term or similar constraint to a reference model; filter prompts that are too easy or too hard so the group has reward variance. Variants such as Dr. GRPO and DAPO (2025) change length and standard-deviation normalisation, clipping and dynamic sampling, and later work continues to compare them; recent papers report that results differ across model families and domains.\n\nOpen questions: whether RLVR mainly improves pass@1 by sharpening the sampling distribution or also extends what a model can solve at large k; how to give useful rewards for steps rather than only final answers; how to avoid reward hacking in code and tool-use settings; how well gains generalise beyond maths and code.\n\nWhat will go stale: algorithm names and recommended hyperparameters, and which labs use which approach. Check the most recent technical reports and verify claims with your own held-out tasks. This entry reflects searches up to its date and does not list every method published since.",
      sources:[
        { label:'DeepSeekMath (introduces GRPO)', url:'https://arxiv.org/abs/2402.03300' },
        { label:'DeepSeek-R1', url:'https://arxiv.org/abs/2501.12948' },
        { label:'DAPO: an open-source LLM RL system at scale', url:'https://arxiv.org/abs/2503.14476' },
        { label:'Understanding R1-Zero-like training (Dr. GRPO)', url:'https://arxiv.org/abs/2503.20783' },
        { label:'Tulu 3', url:'https://arxiv.org/abs/2411.15124' }
      ]
    },
    'l5-training-at-scale-landscape': {
      title:'Training at scale: what practice looks like now',
      asOf:'2026-10',
      md:"Widely used building blocks (documented in papers and open technical reports): BPE-family tokenisers, often byte-level; AdamW with warm-up and decay schedules; bf16 mixed precision, with FP8 training used in some large runs (the DeepSeek-V3 report describes a recipe, validated against bf16 at several scales); FlashAttention-style fused attention kernels, now in several generations; grouped-query attention for smaller KV caches; rotary position embeddings; and sparse mixture-of-experts layers, where model cards give total and active parameters (Switch Transformers, Mixtral and DeepSeek-V3 are public examples). Distributed training combines data parallelism with sharding (ZeRO, PyTorch FSDP), tensor, pipeline and expert parallelism, as in Megatron-style frameworks.\n\nOpen or moving: lower-precision formats beyond FP8 (for example 4-bit floating-point training) and their stability; the best MoE routing and load-balancing methods; attention variants for very long context; how data quality and synthetic data change scaling trade-offs.\n\nWhat will go stale: framework names and versions, supported formats and kernel generations. Check each project's documentation and the latest technical reports. This entry summarises sources verified up to its date and does not claim to list every recent system.",
      sources:[
        { label:'FlashAttention', url:'https://arxiv.org/abs/2205.14135' },
        { label:'DeepSeek-V3 Technical Report (FP8 training, MoE)', url:'https://arxiv.org/abs/2412.19437' },
        { label:'Switch Transformers', url:'https://arxiv.org/abs/2101.03961' },
        { label:'ZeRO: memory optimizations for training large models', url:'https://arxiv.org/abs/1910.02054' },
        { label:'Megatron-LM', url:'https://arxiv.org/abs/1909.08053' },
        { label:'PyTorch FSDP documentation', url:'https://pytorch.org/docs/stable/fsdp.html' }
      ]
    },
    'l5-eval-tooling': {
      title:'Evaluation tooling: how to check a claim',
      asOf:'2026-10',
      md:"Open evaluation harnesses let you run the same benchmarks on different models with the same prompts and settings, which removes one source of non-comparability. EleutherAI's Language Model Evaluation Harness is one widely used open-source example.\n\nWhen you see a reported score, check: which benchmark version, which prompt format and number of examples, who ran it, what sampling settings, whether the test could be contaminated, and whether the number comes with uncertainty. Public leaderboards and their contents change often, so this entry quotes none; treat them as a way to build a shortlist, then evaluate on your own data.\n\nWhat will go stale: benchmark names, which ones are saturated and the tools around them.",
      sources:[
        { label:'EleutherAI Language Model Evaluation Harness', url:'https://github.com/EleutherAI/lm-evaluation-harness' }
      ]
    }
  }
};
