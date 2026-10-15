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
  "label": "express shipping question retrieves the shipping chunk (note: \"does\" is stemmed, not removed)"
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
    "k": 5,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "refunds:0",
    "refunds:1",
    "shipping:0",
    "shipping:1"
   ],
   "scores": [
    0.5,
    0.5,
    0.5,
    0.5
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (refunds:0) Refunds are available within 30 days of purchase. Digital items are refunded\n[2] (refunds:1) items are refunded only if unused. Contact support to start a refund.\n[3] (shipping:0) Standard shipping takes 3 to 5 working days. Express shipping takes 1\n[4] (shipping:1) shipping takes 1 working day.\n\nQuestion: refund shipping"
  },
  "label": "a score exactly equal to minScore is kept (>=, not >)"
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
    "k": 5,
    "minScore": 0.51,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": false,
   "refs": [],
   "scores": [],
   "prompt": null
  },
  "label": "minScore just above the best score means not answerable"
 },
 {
  "args": [
   "refund digital unused",
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
    "k": 3,
    "minScore": 0.3,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "refunds:0",
    "refunds:1"
   ],
   "scores": [
    0.67,
    0.67
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (refunds:0) Refunds are available within 30 days of purchase. Digital items are refunded\n[2] (refunds:1) items are refunded only if unused. Contact support to start a refund.\n\nQuestion: refund digital unused"
  },
  "label": "scores are rounded to 2 decimals (0.67, not 0.6666...)"
 },
 {
  "args": [
   "alpha zeta epsilon",
   [
    {
     "id": "d",
     "tenant": "acme",
     "text": "alpha beta gamma delta epsilon zeta"
    }
   ],
   {
    "size": 4,
    "overlap": 2,
    "k": 10,
    "minScore": 0.3,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "d:1",
    "d:0"
   ],
   "scores": [
    0.67,
    0.33
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (d:1) gamma delta epsilon zeta\n[2] (d:0) alpha beta gamma delta\n\nQuestion: alpha zeta epsilon"
  },
  "label": "the last chunk stops at the end: no redundant tail chunk"
 },
 {
  "args": [
   "refund refund refund shipping",
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
    "k": 5,
    "minScore": 0.5,
    "tenant": "acme"
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "refunds:0",
    "refunds:1",
    "shipping:0",
    "shipping:1"
   ],
   "scores": [
    0.5,
    0.5,
    0.5,
    0.5
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (refunds:0) Refunds are available within 30 days of purchase. Digital items are refunded\n[2] (refunds:1) items are refunded only if unused. Contact support to start a refund.\n[3] (shipping:0) Standard shipping takes 3 to 5 working days. Express shipping takes 1\n[4] (shipping:1) shipping takes 1 working day.\n\nQuestion: refund refund refund shipping"
  },
  "label": "repeated question words count once (terms are unique)"
 },
 {
  "args": [
   "refund notice",
   [
    {
     "id": "pub",
     "tenant": "",
     "text": "Public holiday refund notice applies to everyone."
    },
    {
     "id": "priv",
     "tenant": "acme",
     "text": "Acme staff refund policy is confidential."
    }
   ],
   {
    "size": 12,
    "overlap": 3,
    "k": 5,
    "minScore": 0.5,
    "tenant": ""
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "pub:0"
   ],
   "scores": [
    1
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (pub:0) Public holiday refund notice applies to everyone.\n\nQuestion: refund notice"
  },
  "label": "an empty-string tenant is a real tenant, not \"no filter\""
 },
 {
  "args": [
   "How long do Globex refunds take?",
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
    "minScore": 0.5
   }
  ],
  "expect": {
   "answerable": true,
   "refs": [
    "other:0"
   ],
   "scores": [
    0.75
   ],
   "prompt": "Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".\n\nSources:\n[1] (other:0) Refunds at Globex take 90 days. Nothing else applies.\n\nQuestion: How long do Globex refunds take?"
  },
  "label": "no tenant in opts searches all documents"
 }
];
