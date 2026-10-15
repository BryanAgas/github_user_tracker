// Builders for substantive regex checks on text projects.
// A section = a '#' heading line whose text matches `name`, then everything up to the next heading.
const BODY = '(?:(?!^#)[\\s\\S])';
// The heading may have words before the name ("One-page spec", "Evaluation results").
const HEAD = (name) => `^#+[ \\t]*(?:[^\\n]*?\\b)?(?:${name})[^\\n]*\\n`;
export const sec = (name, minChars) => `${HEAD(name)}${BODY}{${minChars},}`;
export const SG = `${BODY}*?`; // gap that stays inside one section
export const secWith = (name, minChars, ...inners) => `${HEAD(name)}${inners.map((i) => `(?=${BODY}*?${i})`).join('')}${BODY}{${minChars},}`;
// n occurrences of a fragment anywhere (lazy gaps)
export const times = (frag, n, gap = '[\\s\\S]*?') => `(?:${frag}${gap}){${n}}`;
// n consecutive markdown table rows: first cell has letters, second a digit, any further cells (two columns are enough)
export const tableRows = (n) => `(?:^[ \\t]*\\|[^|\\n]*[A-Za-z][^|\\n]*\\|[^|\\n]*\\d[^|\\n]*\\|(?:[^|\\n]*\\|)*[ \\t]*(?:\\n|$)){${n}}`;
// n numbered cases anywhere in the text (they may be split into groups): "1. ...", "- 3) ...", "Case 4: ...", "T07 - ...", or table rows "| 5 | ... |" / "| V05 | ... |"; 20+ characters of text on the line
export const caseLines = (n) => times('^[ \\t]*\\|?[ \\t]*(?:[-*][ \\t]+)?(?:(?:case|test)[ \\t]*|[A-Za-z]{1,3}[-_]?)?#?\\d{1,3}[ \\t]*(?:[.):\\-\\u2013]|\\|)[^\\n]{20,}$', n)
// n quoted messages of 15+ chars
export const quotes = (n, gap) => times('["\\u201c][^"\\u201d\\n]{15,}["\\u201d]', n, gap);
// n lines naming a cause with 20+ chars of explanation
export const causes = (n) => times('^[^\\n]*\\b(?:cause|caused by|root cause)\\b[^\\n]{8,}$', n);
// named failure/risk with a mitigation on the same line, n times
export const mitigated = (n) => times('^[^\\n]*\\b(?:failure mode|risk|threat)\\b[^\\n]{10,}?\\b(?:mitigat\\w*|prevented by|guard\\w*|safeguard\\w*)\\b[^\\n]{10,}$', n);
export const pct = (n, gap) => times('\\d+(?:\\.\\d+)?[ \\t]*%', n, gap);
