// Builders for substantive regex checks on text projects.
// A section = a '#' heading line whose text matches `name`, then everything up to the next heading.
const BODY = '(?:(?!^#)[\\s\\S])';
export const sec = (name, minChars) => `^#+[ \\t]*(?:${name})[^\\n]*\\n${BODY}{${minChars},}`;
export const SG = `${BODY}*?`; // gap that stays inside one section
export const secWith = (name, minChars, ...inners) => `^#+[ \\t]*(?:${name})[^\\n]*\\n${inners.map((i) => `(?=${BODY}*?${i})`).join('')}${BODY}{${minChars},}`;
// n occurrences of a fragment anywhere (lazy gaps)
export const times = (frag, n, gap = '[\\s\\S]*?') => `(?:${frag}${gap}){${n}}`;
// n consecutive markdown table rows: first cell has letters, second a digit, third non-empty
export const tableRows = (n) => `(?:^[ \\t]*\\|[^|\\n]*[A-Za-z][^|\\n]*\\|[^|\\n]*\\d[^|\\n]*\\|[^|\\n]*\\S[^|\\n]*\\|?[ \\t]*(?:\\n|$)){${n}}`;
// n numbered (or table-numbered) case lines each with 20+ characters of text; blank lines allowed between
export const caseLines = (n) => `(?:^[ \\t]*(?:\\d{1,3}[.)]|\\|[ \\t]*\\d{1,3}[ \\t]*\\|)[^\\n]{20,}\\n?(?:[ \\t]*\\n)*){${n}}`;
// n quoted messages of 15+ chars
export const quotes = (n, gap) => times('["\\u201c][^"\\u201d\\n]{15,}["\\u201d]', n, gap);
// n lines naming a cause with 20+ chars of explanation
export const causes = (n) => times('^[^\\n]*\\b(?:cause|caused by|root cause)\\b[^\\n]{20,}\\n', n);
// named failure/risk with a mitigation on the same line, n times
export const mitigated = (n) => times('^[^\\n]*\\b(?:failure mode|risk)\\b[^\\n]{10,}?\\b(?:mitigat\\w*|prevented by|guard)\\b[^\\n]{10,}\\n', n);
export const pct = (n, gap) => times('\\d+(?:\\.\\d+)?[ \\t]*%', n, gap);
