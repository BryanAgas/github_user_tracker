// generated reference tests for capstone p3 (pure data)
export default [
 {
  "args": [
   "How do I get a refund within 30 days?",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 2,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "refunds:0"
   ],
   "scores": [
    1
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (refunds:0) Refunds are available within 30 days of purchase. Digital items are refunded\n\nQuestion: How do I get a refund within 30 days?"
  },
  "label": "refund question finds the right chunk and builds a cited prompt"
 },
 {
  "args": [
   "How long does express shipping take?",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 2,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "shipping:0"
   ],
   "scores": [
    0.6
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (shipping:0) Standard shipping takes 3 to 5 working days. Express shipping takes 1\n\nQuestion: How long does express shipping take?"
  },
  "label": "express shipping question retrieves the shipping chunk"
 },
 {
  "args": [
   "How long does express shipping take?",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 2,
    "minScore": 0.5,
    "tenant": "globex"
   }
  ],
  "expect": {
   "answerable": false,
   "refs": [],
   "scores": [],
   "prompt": null
  },
  "label": "tenant isolation: a globex caller cannot retrieve acme shipping text"
 },
 {
  "args": [
   "How do I get a refund?",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 2,
    "minScore": 0.5,
    "tenant": "globex"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "other:0"
   ],
   "scores": [
    1
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (other:0) Refunds at Globex take 90 days. Nothing else applies.\n\nQuestion: How do I get a refund?"
  },
  "label": "tenant isolation: a globex caller gets globex refund text"
 },
 {
  "args": [
   "What is the meaning of life?",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 2,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": false,
   "refs": [],
   "scores": [],
   "prompt": null
  },
  "label": "no overlap with any document means not answerable"
 },
 {
  "args": [
   "the of and",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 2,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": false,
   "refs": [],
   "scores": [],
   "prompt": null
  },
  "label": "only stop-words means not answerable"
 },
 {
  "args": [
   "refund",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 5,
    "overlap": 5,
    "k": 2,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": false,
   "refs": [],
   "scores": [],
   "prompt": null
  },
  "label": "invalid chunk settings (overlap >= size) means not answerable"
 },
 {
  "args": [
   "refund shipping",
   [
    {
     "id": "refunds",
     "tenant": "acme",
     "text": "Refunds are available within 30 days of purchase. Digital items are refunded only if unused. Contact support to start a refund."
    },
    {
     "id": "shipping",
     "tenant": "acme",
     "text": "Standard shipping takes 3 to 5 working days. Express shipping takes 1 working day."
    },
    {
     "id": "other",
     "tenant": "globex",
     "text": "Refunds at Globex take 90 days. Nothing else applies."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 1,
    "minScore": 0.4,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "refunds:0"
   ],
   "scores": [
    0.5
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (refunds:0) Refunds are available within 30 days of purchase. Digital items are refunded\n\nQuestion: refund shipping"
  },
  "label": "k=1 keeps only the best chunk; ties go to the earlier chunk"
 }
];
