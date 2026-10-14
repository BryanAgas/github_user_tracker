export default [
{
  id:'l2-04',
  title:'AI automation: triggers, schedules, and when not to',
  hook:"The question is not 'can we automate this?' but 'what happens on the day it goes wrong and nobody is looking?'",
  minutes: 15,
  skills:['l2.automation'],
  core: true, code: false, deep: false,
  blocks:[
    { t:'p', md:"A workflow you run by hand is a tool. A workflow that runs by itself is an **automation**, and it changes the risk completely: no one is there to notice a strange result. This lesson is about choosing when something starts, and, just as important, which jobs should never run unattended." },
    { t:'p', md:"Running example: the school office wants a Monday-morning digest of the week's absence emails, sent to heads of year." },
    { t:'h', text:'Triggers and schedules' },
    { t:'compare', title:'What starts an automation', cols:['Trigger','Example','Good for','Watch out for'], rows:[
      ['Schedule','Every Monday at 07:30','Digests, reports, reminders','Runs even when nothing has changed or an input source is down'],
      ['Event','A new form is submitted','Instant handling of individual items','Bursts: fifty events at once; the same event twice'],
      ['Condition','A value passes a threshold','Alerts and escalation','Flapping: firing again and again around the threshold'],
      ['Manual button','A person presses Run','Anything you are not ready to trust fully','Needs someone to remember']
    ] },
    { t:'h', text:'Five things a trustworthy automation has' },
    { t:'list', ordered:true, items:["**Idempotent steps.** Running a step twice gives the same end state (it does not email the same person twice).","**A log.** What ran, on what input, what it decided. Without it you cannot find or fix faults.","**A kill switch.** One obvious way to pause it.","**Failure alerts to a named person.** Silent failure is the worst kind.","**A limit.** A cap on how many things it may do in one run."] },
    { t:'predict', q:"A digest automation fires at 07:30. The absence inbox was unreachable that morning, so it received zero emails and the model was asked to summarise nothing. What is the most likely harm?", options:["The digest will be blank and everyone will notice","The model may invent plausible-sounding absences to fill the gap, and the digest is sent anyway","The model will refuse and send an error to the heads of year","Nothing; models cannot write without input"], answer:1, explain:"Models tend to produce fluent text even with nothing to work on. The fix is a gate before the model: if no inputs were retrieved, stop and alert a person instead of generating.", skill:'l2.automation' },
    { t:'widget', w:'sorter', props:{ title:'Automate, assist, or leave alone?', skill:'l2.automation', buckets:['Automate fully','Automate with approval','Do not automate'], items:[
      { text:'Sorting incoming emails into folders by topic (easy to undo)', bucket:'Automate fully', why:'Low stakes, reversible, easy to spot-check.' },
      { text:'Drafting weekly newsletter text for the head to edit', bucket:'Automate with approval', why:'Useful drafting; external publication needs a person.' },
      { text:'Sending exam-result decisions to families', bucket:'Do not automate', why:'High stakes, personal and hard to undo; needs human judgement and accountability.' },
      { text:'Renaming and filing scanned documents using a checked naming rule', bucket:'Automate fully', why:'Rule-based and reversible; log and sample-check.' },
      { text:'Replying to safeguarding concerns raised by parents', bucket:'Do not automate', why:'Sensitive, urgent and the consequences of error are severe; route to a trained person.' },
      { text:'Posting a reply to a public complaint on social media', bucket:'Automate with approval', why:'Public and hard to retract; a person should approve.' }
    ] } },
    { t:'h', text:'When NOT to automate' },
    { t:'list', items:["The cost of one mistake is high or cannot be reversed.","The task happens rarely, so building and testing costs more than doing it by hand.","You cannot say what a good result is, so you could not tell a failure from a success.","The inputs are messy or changing and no one will notice drift.","A person's judgement or accountability is the point, such as a decision about a child."] },
    { t:'callout', kind:'misconception', title:'Misconception', md:"'If it works in testing, it will work unattended.' Testing uses inputs you thought of. Real use brings odd inputs, outages, duplicates and slow drift in what people write. Unattended systems need monitoring, not just testing." },
    { t:'try', prompt:"Pick one repetitive task from your own work. Say: (1) what the trigger would be; (2) what the worst realistic failure is; (3) whether you would automate fully, with approval, or not at all; (4) one safeguard from the five-point list you would add.", sample:"Task: weekly summary of customer feedback forms.\n(1) Schedule: Friday 15:00.\n(2) Worst failure: a summary that omits a serious complaint, so it is never seen.\n(3) Automate with approval: the draft goes to me, not to the team.\n(4) Safeguard: the digest lists how many forms were read and flags any containing the words 'injury', 'unsafe' or 'legal' regardless of what the model summarises." }
  ],
  reteach:[
    { style:'analogy', md:"An automation is like a central heating timer. It is perfect for 'warm the house at seven', because a mistake is trivial and obvious. You would not hand the same unwatched timer the job of deciding when to unlock the front door." },
    { style:'simple', md:"Before automating anything, ask: if this goes wrong at 3am and nobody looks for a week, how bad is it? If the answer is 'a bit annoying', automate with logs. If it is 'someone is harmed', keep a person in charge." }
  ],
  quiz:[
    { id:'l2-04-q1', skill:'l2.automation', type:'mcq', difficulty:1, q:"Which trigger is best for a report that everyone expects at the start of each week?", options:["An event trigger on every new email","A schedule","A threshold condition","A manual button nobody is assigned to press"], answer:1, hints:["The need is regular and predictable.","Which trigger repeats on a clock?"], explain:"A schedule matches a regular expectation. Event triggers suit item-by-item handling, and a manual button depends on someone remembering." },
    { id:'l2-04-q2', skill:'l2.automation', type:'mcq', difficulty:2, q:"A form-triggered automation sometimes fires twice for one submission and sends the parent two confirmation emails. What property was missing?", options:["Idempotence","A bigger model","More detailed logs only","A faster trigger"], answer:0, wrong:{ '2':'Logs help you spot it but do not prevent the repeat.' }, hints:["What does safe to run twice mean?","Record which submissions were already handled."], explain:"An idempotent step recognises it has already handled the submission and does nothing the second time. The fix is a record of handled ids, not extra intelligence." },
    { id:'l2-04-q3', skill:'l2.automation', type:'multi', difficulty:2, q:"Which tasks are poor candidates for unattended automation? Select all that apply.", options:["Deciding which pupils receive a disciplinary sanction","Filing invoices into dated folders using a checked naming rule","Telling a family their child's place offer has been withdrawn","Tagging support emails with a topic label"], answer:[0,2], hints:["Which have severe, hard-to-reverse effects on people?","Which are easily undone?"], explain:"Decisions about individuals with serious consequences need human judgement and accountability. Filing and tagging are low-stakes and reversible." },
    { id:'l2-04-q4', skill:'l2.automation', type:'mcq', difficulty:3, q:"Your monthly report automation asked a model to summarise a spreadsheet that, one month, failed to load and was empty. The report was sent saying all targets were met. What is the best fix?", options:["Tell the model to be more honest","Add a gate before the model: stop and alert a named person if the input is empty or smaller than expected","Run the model twice and compare","Send the report later in the day"], answer:1, wrong:{ '2':'Both runs would see the same empty input.' }, hints:["The fault is upstream of the model.","A plain rule can detect an empty input."], explain:"The failure was missing input, which a simple rule can detect. Guarding the input, and alerting someone, prevents confident nonsense from going out." },
    { id:'l2-04-q5', skill:'l2.automation', type:'order', difficulty:3, q:"Order these steps for rolling out a new automation sensibly.", items:["Run it by hand on real examples and review every output","Run it on a schedule but send results only to the builder","Add logging, a limit and failure alerts","Release it to users with a visible kill switch","Review logs after the first weeks and adjust"], hints:["Trust is earned in stages.","Users come after the builder has watched it work."], explain:"Move from manual to supervised to live, adding safeguards before wide release and reviewing afterwards. Jumping straight to unattended skips the evidence that it is safe." }
  ],
  takeaways:["Choose the trigger that matches the need: schedule, event, condition or manual.","Trustworthy automations are idempotent, logged, limited, alerting and stoppable.","Guard inputs with plain rules; models will happily write about nothing.","Do not automate where one mistake is severe, irreversible or where human accountability is the point."],
  apply:"Pick one thing you do repeatedly and fill in the three-line card: trigger, worst failure, safeguard. Decide honestly whether it should be automated at all."
},
{
  id:'l2-05',
  title:'Memory: what an AI system remembers, and what it should',
  hook:"A model does not remember you; any memory it seems to have was built, deliberately, by someone.",
  minutes: 15,
  skills:['l2.memory'],
  core: true, code: false, deep: false,
  blocks:[
    { t:'p', md:"In Level 0 you saw that a model only knows what is in its context window right now. When a product says 'it remembers me', it means the builder wrote something down somewhere and put it back into the window next time. Memory is a **design choice**, with benefits, costs and privacy duties." },
    { t:'widget', w:'contextwindow', props:{ size: 400 }, caption:'Shrink the window and watch the early facts fall out. This is short-term memory: the conversation so far, with a hard limit.' },
    { t:'h', text:'Short-term and long-term memory' },
    { t:'compare', cols:['','Short-term (working) memory','Long-term memory'], rows:[
      ['Where it lives','The context window','A store outside the model: notes, a database, a profile'],
      ['How long','Until the session ends or older text falls out','Until someone deletes it'],
      ['Who decides what is kept','Automatic, by position and limit','A design rule or a person: what is worth saving'],
      ['Main risk','Forgetting early details','Storing wrong, stale or sensitive information']
    ] },
    { t:'widget', w:'flow', props:{ title:'A simple long-term memory loop', height:300, nodes:[
      { id:'chat', label:'Conversation', x:10, y:30, kind:'input', note:'Where new information appears.' },
      { id:'extract', label:'Pick what is worth saving', x:35, y:30, kind:'model', note:'A rule or model proposes memory notes. Not everything is worth keeping.' },
      { id:'check', label:'Filter: no sensitive data; user can see it', x:60, y:30, kind:'process', note:'Rules and consent applied before saving.' },
      { id:'store', label:'Memory store', x:85, y:30, kind:'store', note:'Short notes with dates, easy to view, edit and delete.' },
      { id:'retrieve', label:'Retrieve relevant notes next time', x:60, y:78, kind:'process', note:'Only notes relevant to the new task, not everything.' },
      { id:'window', label:'Context window', x:20, y:78, kind:'model', note:'Notes are placed here as text, then the model reads them.' }
    ], edges:[['chat','extract'],['extract','check'],['check','store'],['store','retrieve'],['retrieve','window']], steps:[
      { show:['chat','extract'], text:'During a conversation, something possibly worth remembering appears.' },
      { show:['check','store'], text:'It is filtered and saved as a short, dated note a person can inspect.' },
      { show:['retrieve','window'], text:'Next time, only relevant notes are retrieved and put into the window.' }
    ] } },
    { t:'h', text:'What to store, and what not to' },
    { t:'list', items:["**Store:** stable preferences ('prefers British spelling'), standing decisions, project facts that will be asked about again.","**Summarise, do not hoard:** keep the conclusion, not a transcript of the meeting that produced it.","**Date it.** Facts go stale; a dated note can be checked or retired.","**Do not store by default:** health, safeguarding, financial or identity details, passwords, anything about children, unless there is a clear purpose, a lawful basis and a deletion route.","**Let people see, correct and delete** what is remembered about them."] },
    { t:'callout', kind:'warn', title:'Privacy is part of the design', md:"Memory turns a forgettable chat into a record. Before storing anything about a person, ask who can read it, how long it lives, how they can remove it, and whether your organisation's data protection rules allow it. When in doubt, store less." },
    { t:'predict', q:"An assistant saves a note early in the year: 'Maya is in Year 9 and prefers email.' Fourteen months later it is still being used in drafts. What is the main problem?", options:["Notes should never be saved","The note is stale; no date or review meant a changed fact is still being trusted","The model forgot the note","Email is a bad preference"], answer:1, explain:"Memory without dates or review goes quietly wrong. Time-stamping and periodic expiry or review keep long-term memory trustworthy.", skill:'l2.memory' },
    { t:'try', prompt:"Imagine a personal study assistant for a student. List five things it should remember between sessions, two things it should deliberately NOT keep, and how often the stored notes should be reviewed.", sample:"Remember: exam dates; subjects they find hard; preferred explanation style; current revision plan; topics already mastered.\nDo not keep: anything about their health or family situation shared in passing; raw chat transcripts.\nReview: the student can view and delete notes at any time, and notes older than a term are shown for confirmation or removed." }
  ],
  reteach:[
    { style:'analogy', md:"The model is like a brilliant colleague with no memory who reads a sticky note on the desk each morning. Short-term memory is the pile of papers on the desk (limited space). Long-term memory is the filing cabinet: only useful if someone files the right things, labels them, and throws out the old ones." },
    { style:'simple', md:"Models forget everything between chats unless a system saves notes and feeds them back in. So decide three things: what is worth saving, how it is kept safe, and how it is kept up to date." }
  ],
  quiz:[
    { id:'l2-05-q1', skill:'l2.memory', type:'mcq', difficulty:1, q:"When a chat assistant 'remembers' your preferences next week, what is usually really happening?", options:["The model's weights were updated during your chat","A system saved notes and placed them in the new context window","The model keeps your chat in its head","The provider re-reads all your old chats each time"], answer:1, hints:["Think back to what the model can see.","Where do the preferences have to be for the model to use them?"], explain:"Models do not change as they talk to you. Memory features save text outside the model and feed relevant parts back into the window." },
    { id:'l2-05-q2', skill:'l2.memory', type:'multi', difficulty:2, q:"Which are good practice for long-term memory in an AI system? Select all that apply.", options:["Date each memory note","Store full transcripts of every conversation 'just in case'","Let users view, correct and delete what is stored","Avoid storing sensitive personal data unless there is a clear purpose and permission","Never update notes once saved"], answer:[0,2,3], hints:["Think accuracy over time, and rights over data.","Which options minimise risk?"], explain:"Dated, inspectable, minimal notes stay accurate and respect privacy. Hoarding transcripts and never updating create stale or risky records." },
    { id:'l2-05-q3', skill:'l2.memory', type:'mcq', difficulty:2, q:"A support assistant stores each customer's last ten conversations and places all of them in every new request. Responses are slow, costly and sometimes get confused by old issues. What is the better design?", options:["Store nothing at all","Keep a short summary of each customer and retrieve only the notes relevant to the current question","Use a larger window and keep everything","Store only the first message"], answer:1, wrong:{ '2':'A larger window may help capacity but not relevance, cost or confusion.' }, hints:["The problem is relevance, not capacity.","Retrieve what matters now."], explain:"Memory should be selective: summarise what matters and retrieve what is relevant. Stuffing everything into every request costs more and distracts." },
    { id:'l2-05-q4', skill:'l2.memory', type:'mcq', difficulty:3, q:"A tutoring assistant for secondary pupils offers to remember 'anything the pupil tells it so it can help better'. Which concern should come first?", options:["The tone of the replies","Whether personal and sensitive disclosures should be stored at all, who can see them, and how they are deleted","The speed of retrieval","Whether the notes are in alphabetical order"], answer:1, hints:["Think about who the users are.","What could a child tell it that should not simply sit in a database?"], explain:"Children may share sensitive information. Design must decide what is out of scope, escalate safeguarding disclosures to a trained person, and limit retention. Speed and formatting come later." },
    { id:'l2-05-q5', skill:'l2.memory', type:'order', difficulty:2, q:"Put the life of one memory note in order.", items:["Something possibly worth remembering appears in a conversation","A rule or reviewer decides whether it is worth keeping and safe to keep","It is saved as a short dated note","Later, it is retrieved because it is relevant to a new request","It is reviewed, updated or deleted when it goes stale"], hints:["Decision comes before saving.","Maintenance comes last."], explain:"Capture, filter, save, retrieve, maintain. Skipping the filter stores unsafe data; skipping maintenance leaves stale facts." }
  ],
  takeaways:["Models do not remember; systems do, by saving text and placing it back in the window.","Short-term memory is the window; long-term memory is a store someone designed.","Store little, date it, summarise it, and retrieve only what is relevant.","Sensitive data, especially about children, needs a clear purpose, limits and a way to delete."],
  apply:"Look at an AI tool you use that 'remembers' things. Find where those memories are viewable, read them, and delete or correct one."
},
{
  id:'l2-06',
  title:'Context engineering: what goes in the window',
  hook:"Most disappointing AI output is not a model problem; it is a 'what did you put in front of it' problem.",
  minutes: 18,
  skills:['l2.context-engineering'],
  core: true, code: false, deep: false,
  blocks:[
    { t:'p', md:"Prompting is what you ask. **Context engineering** is deciding everything that sits in front of the model when it answers: instructions, retrieved documents, memory notes, tool results, the conversation so far. The window is finite and every item competes for attention, so choosing what goes in, and in what order, is a design skill." },
    { t:'p', md:"Running example: a staff handbook assistant that answers questions such as 'how many days' notice do I give for a school trip?'" },
    { t:'h', text:'Retrieval versus stuffing' },
    { t:'p', md:"Option one is **stuffing**: paste the whole handbook into every request. Option two is **retrieval**: search the handbook for the few relevant passages and include only those." },
    { t:'compare', cols:['','Stuffing everything','Retrieving relevant pieces'], rows:[
      ['Setup','Trivial','Needs search, chunking, a store'],
      ['Cost and speed','Pay for all of it every time','Pay for a few passages'],
      ['Accuracy','Can bury the answer in noise','Depends on the search finding the right passage'],
      ['Best when','The material is short and always needed','The material is large or mostly irrelevant to each question']
    ] },
    { t:'widget', w:'ragdemo', props:{ corpus:'handbook' }, caption:'Try the "break it" toggles: chunks too small, k too low. Watch what the assembled prompt loses. Retrieval quality is context quality.' },
    { t:'h', text:'Ordering and attention' },
    { t:'p', md:"Position matters. Research on long inputs has found that models can use information at the start and end of the context better than information buried in the middle, a pattern nicknamed **lost in the middle**. Newer models cope better, but do not assume yours does." },
    { t:'current', key:'long-context-reality' },
    { t:'list', items:["Put the **rules and the question** where they cannot be missed, often start and end.","Put **the most relevant evidence** near the question, not buried.","**Label** each piece: source, date, trusted or untrusted.","**Remove** what is not needed. Irrelevant text is not harmless; it distracts."] },
    { t:'h', text:'Compaction' },
    { t:'p', md:"Long sessions fill the window. **Compaction** replaces old history with a summary of decisions, open questions and key facts. It saves space but loses detail, so summarise *what must survive* (decisions, constraints, names, numbers) and keep the exact wording of anything you may need to quote." },
    { t:'predict', q:"A long planning session has been compacted into a summary twice. The team now notices the assistant keeps suggesting an option that was explicitly rejected earlier. What most likely went wrong?", options:["The model got tired","The compaction did not record rejected options and their reasons, so the information was lost","The window is too large","The first message was too short"], answer:1, explain:"Summaries keep what the summariser thought important. Rejected options and their reasons are easy to drop, then the model re-suggests them. Good compaction records decisions, rejections and constraints.", skill:'l2.context-engineering' },
    { t:'callout', kind:'tip', title:'A context budget', md:"Treat the window like a suitcase. Decide a rough budget: rules, memory notes, retrieved evidence, conversation, room for the answer. If one section grows without limit, it squeezes the rest." },
    { t:'try', prompt:"You are building an assistant that answers parents' questions about school trips. List what goes into the context for each question, in the order you would place it, and say what you deliberately leave out.", sample:"Order: (1) rules: answer only from the supplied documents, say when unsure, never promise places; (2) this trip's key facts (date, cost, deadlines); (3) the 2 or 3 most relevant policy passages, each labelled with source and date; (4) the parent's question last.\nLeft out: the whole trips handbook, other trips' details, old email threads, and any other family's data." }
  ],
  reteach:[
    { style:'analogy', md:"Think of briefing a barrister before a hearing. You do not hand over every file in the building. You give a short brief: the question, the key evidence, the rules, the dates. Too little and they guess; too much and the crucial page is lost. Context engineering is writing that brief each time." },
    { style:'step-by-step', md:"For any step: 1. What question is being answered? 2. What does the model need to know to answer it? 3. Where can I get that exactly (search, memory, a tool)? 4. In what order do I place it? 5. What should I leave out? 6. What happens when it grows too long?" }
  ],
  quiz:[
    { id:'l2-06-q1', skill:'l2.context-engineering', type:'mcq', difficulty:1, q:"You have a 400-page handbook and users ask narrow questions. Which approach usually works better than pasting the whole handbook each time?", options:["Retrieving the few most relevant passages for each question","Pasting only the contents page","Pasting the handbook twice","Asking users to quote the section"], answer:0, hints:["Most of the handbook is irrelevant to each question.","Which approach scales as the document grows?"], explain:"Retrieval keeps the window focused and cheaper. The risk moves to search quality, which then needs testing." },
    { id:'l2-06-q2', skill:'l2.context-engineering', type:'mcq', difficulty:2, q:"A retrieval system returns chunks of 20 words each. Answers keep missing conditions that appear in the sentence after the match. What is the likely cause and fix?", options:["Chunks are too small and cut off context; use larger chunks or overlap","The model is too small; switch models","The question is too long","Retrieval should be switched off"], answer:0, wrong:{ '1':'Switching models will not restore text that was never retrieved.' }, hints:["What does the model see if the key sentence was cut in half?","Overlap helps."], explain:"If a chunk cuts the answer off from its conditions, the model cannot see them. Larger chunks or overlap preserve neighbouring text." },
    { id:'l2-06-q3', skill:'l2.context-engineering', type:'multi', difficulty:2, q:"Which steps usually help when context is long and quality is dropping? Select all that apply.", options:["Remove material not needed for the current step","Place key evidence close to the question","Label each item with its source and date","Add more unrelated documents to be safe","Summarise old history, keeping decisions and constraints"], answer:[0,1,2,4], hints:["Think relevant, near, labelled, shorter.","Which option adds noise?"], explain:"Focus, placement, labelling and careful compaction all help. Adding unrelated material increases noise and cost." },
    { id:'l2-06-q4', skill:'l2.context-engineering', type:'mcq', difficulty:3, q:"You suspect your model ignores facts placed in the middle of a long input. How can you find out for your own case?", options:["Read a vendor press release","Place one key fact at the start, middle and end of a long input, ask a question that needs it, and compare the answers","Assume the 2023 research applies unchanged","Ask the model whether it ignores the middle"], answer:1, wrong:{ '3':'Models are not reliable reporters of their own attention.' }, hints:["A small test beats opinion.","Change one thing: where the fact sits."], explain:"Behaviour varies by model and task. A quick position test on your own material is a miniature evaluation and gives evidence rather than assumption." },
    { id:'l2-06-q5', skill:'l2.context-engineering', type:'order', difficulty:3, q:"Order the parts of a well-organised context for one handbook question, from first to last.", items:["Standing rules and answering instructions","Memory notes relevant to this user","Retrieved passages labelled with source and date","The user's current question"], hints:["Rules first, question last.","Evidence near the question."], explain:"Rules go where they will not be missed, evidence sits just before the question, and the question closes the context so it is freshest. Order is a design choice you should test, not a law." }
  ],
  takeaways:["Context engineering is choosing everything that sits in front of the model, not just writing the question.","Retrieve when material is large; check retrieval quality because the model only sees what you found.","Order and labelling matter; test position effects on your own model rather than assuming.","Compaction saves space but loses detail, so record decisions, rejections and constraints."],
  apply:"Take a document you often paste into AI. Decide which three passages usually matter, and try asking questions with only those passages. Compare quality."
},
{
  id:'l2-07',
  title:'Agentic workflows: plan, act, observe',
  hook:"An agent is a loop with a model deciding the next step, which makes it powerful and harder to predict.",
  minutes: 18,
  skills:['l2.agents','l2.autonomy'],
  core: true, code: false, deep: false,
  blocks:[
    { t:'p', md:"In Lesson 3 you designed the path yourself. In an **agent**, the model chooses the path as it goes: it decides what to do next, uses a tool, reads the result, and decides again until it judges the goal met or it is stopped. A **workflow** has paths set in advance; an **agent** directs its own process." },
    { t:'current', key:'workflow-vocabulary' },
    { t:'h', text:'The loop' },
    { t:'p', md:"The loop has three beats: **think/plan** (what should I do next?), **act** (call a tool), **observe** (read the result). Each pass adds to the context, so the loop gets longer and costlier, and early mistakes stay in view." },
    { t:'widget', w:'agentloop', props:{ scenario:'refund' }, caption:'Step through. Then switch on "inject tool failure" and "require human approval" and compare how the run changes. This is a scripted simulation.' },
    { t:'predict', q:"In the simulation, you switch on 'inject tool failure'. What good behaviour do you most want to see from the agent?", options:["It retries forever until the tool works","It notices the failure, tries a sensible alternative or retries a limited number of times, then reports clearly and asks for help","It pretends the tool worked and carries on","It silently stops"], answer:1, explain:"Good agents handle failure visibly: limited retries, a fallback, then escalation. Endless retries waste money, pretending hides the fault, and silent stopping leaves the user guessing.", skill:'l2.agents' },
    { t:'h', text:'When to use an agent, and when not to' },
    { t:'compare', cols:['','Workflow','Agent'], rows:[
      ['Who picks the next step','You, in advance','The model, at run time'],
      ['Predictability','High','Lower'],
      ['Testing','Test each step','Test whole runs; many possible paths'],
      ['Cost and speed','Fixed and low','Variable and often higher'],
      ['Best for','Known steps, high volume, high stakes','Open-ended problems where the steps cannot be known in advance']
    ] },
    { t:'callout', kind:'why', title:'Rule of thumb', md:"Start with the simplest thing that could work: a single prompt, then a workflow, and reach for an agent only when the steps genuinely cannot be listed in advance and the cost of mistakes is manageable." },
    { t:'h', text:'Autonomy levels' },
    { t:'p', md:"How much freedom you give is a separate choice from whether it is an agent. Think of a ladder, and climb only as far as the cost of errors allows." },
    { t:'compare', title:'A ladder of autonomy', cols:['Level','What the system does','Example'], rows:[
      ['1 Suggest','Proposes; a person does everything','Drafts a refund decision for staff to action'],
      ['2 Act with approval','Prepares the action; a person approves each one','Refund queued; staff click approve'],
      ['3 Act within limits, then report','Acts inside strict limits; a person reviews afterwards','Auto-refunds under a small amount; daily report'],
      ['4 Act freely','Acts without limits or review','Rarely appropriate for anything that affects people or money']
    ] },
    { t:'widget', w:'agentloop', props:{ scenario:'data' }, caption:'Same loop, a different job. Where would you set its autonomy level?' },
    { t:'try', prompt:"Choose a task you might give an agent (such as researching suppliers or tidying a shared folder). Write: the goal in one sentence, the tools it should have, the tools it should NOT have, a stopping rule (cost, steps or time), and its autonomy level.", sample:"Goal: collect three quotes for classroom tablets and summarise differences.\nTools: web search, read page, write to a draft note.\nNot allowed: sending emails, placing orders, any payment.\nStop: after 15 steps or 10 minutes, or when three quotes are found.\nAutonomy: level 1 to 2: it produces a note; a person decides and orders." },
    { t:'callout', kind:'misconception', title:'Misconception', md:"'Agents are just better workflows.' They are different trade-offs: more flexibility for less predictability and higher cost. Many successful systems are workflows with one or two agentic steps inside them." }
  ],
  reteach:[
    { style:'analogy', md:"A workflow is a recipe you follow step by step. An agent is a cook given a goal ('make dinner for six with what is in the fridge') who decides each step while looking at the results. Recipes are predictable. The improvising cook is more flexible and occasionally burns something, so you stay nearby for important guests." },
    { style:'simple', md:"Agent equals a loop: decide, do, look, decide again. The more steps it takes by itself and the more it can touch, the more checks you need. Keep the loop short, limit the tools, and put a person in front of anything that matters." }
  ],
  quiz:[
    { id:'l2-07-q1', skill:'l2.agents', type:'mcq', difficulty:1, q:"What most clearly distinguishes an agent from a workflow?", options:["An agent uses a bigger model","In an agent the model decides the next step at run time; in a workflow the paths are set in advance","Agents never use tools","Workflows cannot call a model more than once"], answer:1, hints:["Who chooses the path?","Think set in advance versus decided as it goes."], explain:"The distinction is who controls the path. Size of model and use of tools do not define it; workflows can use both." },
    { id:'l2-07-q2', skill:'l2.agents', type:'order', difficulty:2, q:"Order one pass of an agent loop.", items:["Decide what to do next given the goal and what is known","Call a tool with chosen arguments","Receive the tool result","Add the result to the context and reassess the goal"], hints:["Think first, then act, then observe.","Observation goes back into context."], explain:"The loop is plan, act, observe, repeat. Each pass adds to the context, which is why long runs get costly and early errors linger." },
    { id:'l2-07-q3', skill:'l2.agents', type:'mcq', difficulty:2, placement:true, q:"A task has well-known steps, runs thousands of times a day, and mistakes are costly. Which approach fits best?", options:["An open-ended agent that decides how to proceed each time","A workflow with fixed steps and gates","A single agent with all tools","No testing is needed if the model is good"], answer:1, wrong:{ '0':'Flexibility is not needed and adds unpredictability at high volume.' }, hints:["Are the steps known in advance?","Think predictability and cost at volume."], explain:"Known steps and high stakes favour a workflow: predictable, testable and cheap. Use an agent when steps cannot be listed in advance." },
    { id:'l2-07-q4', skill:'l2.autonomy', type:'mcq', difficulty:2, q:"A support agent can issue refunds. Which autonomy setting is most sensible when it is first deployed?", options:["Act freely on all amounts","Draft actions for staff approval, then relax to limits once evidence shows it is reliable","Refuse all requests","Act freely but only at night"], answer:1, hints:["Trust is earned from evidence.","Start low on the ladder."], explain:"Begin at suggest or act-with-approval and widen only as logged results prove reliability. Acting freely from day one skips the evidence." },
    { id:'l2-07-q5', skill:'l2.autonomy', type:'multi', difficulty:3, q:"Which controls make an agent safer to run? Select all that apply.", options:["A maximum number of steps or amount of spend","Limiting tools to those the task needs","A log of every action and its reason","Letting it edit its own permissions when it gets stuck","Approval before irreversible actions"], answer:[0,1,2,4], wrong:{ '3':'An agent that can widen its own permissions defeats every other control.' }, hints:["Think limits, scope, visibility, approval.","Which option removes a limit?"], explain:"Budgets, least privilege, logging and approvals all contain mistakes. Self-granted permissions remove the containment." }
  ],
  takeaways:["An agent decides its own next step in a loop; a workflow follows a path you set.","The loop is plan, act, observe, repeat, and the context grows with every pass.","Use the simplest design that works; agents suit open-ended problems with manageable mistakes.","Set autonomy by the cost of errors: suggest, approve, act within limits, and widen only with evidence."],
  apply:"Take a task you might hand to an agent. Write its stopping rule and its allowed and forbidden tools on one card."
}
];
