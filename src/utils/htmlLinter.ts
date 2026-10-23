export interface LintDiagnostic {
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function lintHTML(html: string): LintDiagnostic[] {
  const diagnostics: LintDiagnostic[] = [];
  const lines = html.split('\n');

  const tagStack: Array<{ tag: string; line: number; column: number }> = [];

  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for unclosed attribute quotes
    if (line.includes('=')) {
      const attrRegex = /(\w+)=(["'])/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(line)) !== null) {
        const quoteChar = attrMatch[2];
        const afterQuote = line.substring(attrMatch.index + attrMatch[0].length);
        if (!afterQuote.includes(quoteChar)) {
          diagnostics.push({
            line: i + 1,
            column: attrMatch.index + 1,
            endLine: i + 1,
            endColumn: attrMatch.index + attrMatch[0].length + 1,
            message: `Unclosed attribute quote for "${attrMatch[1]}"`,
            severity: 'error',
          });
        }
      }
    }

    // Find all tags on this line
    let match;
    const lineTagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)?\s*\/?>/g;
    while ((match = lineTagRegex.exec(line)) !== null) {
      const fullMatch = match[0];
      const tagName = match[1].toLowerCase();
      const isClosing = fullMatch.startsWith('</');
      const isSelfClosing = fullMatch.endsWith('/>') || voidElements.has(tagName);

      if (isSelfClosing) continue;

      if (isClosing) {
        let found = false;
        for (let j = tagStack.length - 1; j >= 0; j--) {
          if (tagStack[j].tag === tagName) {
            tagStack.splice(j);
            found = true;
            break;
          }
        }
        if (!found) {
          diagnostics.push({
            line: i + 1,
            column: match.index + 1,
            endLine: i + 1,
            endColumn: match.index + fullMatch.length + 1,
            message: `Unexpected closing tag </${tagName}> with no matching opening tag`,
            severity: 'error',
          });
        }
      } else {
        tagStack.push({ tag: tagName, line: i + 1, column: match.index + 1 });
      }
    }
  }

  // Remaining unclosed tags
  for (const unclosed of tagStack) {
    diagnostics.push({
      line: unclosed.line,
      column: unclosed.column,
      endLine: unclosed.line,
      endColumn: unclosed.column + unclosed.tag.length + 2,
      message: `Unclosed <${unclosed.tag}> tag`,
      severity: 'error',
    });
  }

  // DOMParser validation
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const errors = doc.querySelectorAll('parsererror');
    if (errors.length > 0) {
      diagnostics.push({
        line: 1, column: 1, endLine: 1, endColumn: 1,
        message: 'HTML parsing error detected by browser parser',
        severity: 'warning',
      });
    }
  } catch {
    // DOMParser unavailable
  }

  return diagnostics;
}
