export interface BreadcrumbNode {
  tag: string;
  id?: string;
  className?: string;
  startOffset: number;
  endOffset: number;
  line: number;
}

export function getBreadcrumbs(html: string, cursorOffset: number): BreadcrumbNode[] {
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)\s*\/?>/g;

  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  interface StackItem {
    tag: string;
    id?: string;
    className?: string;
    startOffset: number;
    line: number;
  }

  const stack: StackItem[] = [];
  let match;

  function getLineFromOffset(offset: number): number {
    let line = 1;
    for (let i = 0; i < offset && i < html.length; i++) {
      if (html[i] === '\n') line++;
    }
    return line;
  }

  while ((match = tagRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();
    const attrs = match[2] || '';
    const isClosing = fullMatch.startsWith('</');
    const isSelfClosing = fullMatch.endsWith('/>') || voidElements.has(tagName);
    const offset = match.index;

    if (offset > cursorOffset) break;

    if (isSelfClosing && !isClosing) continue;

    if (isClosing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tagName) {
          stack.splice(i);
          break;
        }
      }
    } else {
      const idMatch = attrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const classMatch = attrs.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)')/i);

      stack.push({
        tag: tagName,
        id: idMatch ? (idMatch[1] ?? idMatch[2]) : undefined,
        className: classMatch ? (classMatch[1] ?? classMatch[2]) : undefined,
        startOffset: offset,
        line: getLineFromOffset(offset),
      });
    }
  }

  return stack.map(item => ({
    tag: item.tag,
    id: item.id,
    className: item.className,
    startOffset: item.startOffset,
    endOffset: item.startOffset + item.tag.length + 2,
    line: item.line,
  }));
}
