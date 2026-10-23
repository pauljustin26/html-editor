export function beautifyHTML(html: string, indent: string = '  '): string {
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  // Tokenize tags, comments, and text nodes into discrete lines
  const tokens = html
    .replace(/(<!--[\s\S]*?-->)/g, '\n$1\n')
    .replace(/(<[^>]+>)/g, '\n$1\n')
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);

  const output: string[] = [];
  let level = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // HTML Comments
    if (token.startsWith('<!--')) {
      output.push(indent.repeat(level) + token);
      continue;
    }

    // Closing tag: </tag>
    if (token.startsWith('</')) {
      level = Math.max(0, level - 1);
      output.push(indent.repeat(level) + token);
      continue;
    }

    // Opening tag: <tag ...>
    const openMatch = token.match(/^<([a-zA-Z0-9]+)/);
    if (openMatch) {
      const tagName = openMatch[1].toLowerCase();
      const isSelfClosing = token.endsWith('/>') || voidElements.has(tagName);

      // Keep leaf inline tags with simple text on single line: <tag>text</tag>
      // e.g., <td>¥1,980</td>, <h2>Title</h2>, <span>Badge</span>
      if (
        !isSelfClosing &&
        i + 2 < tokens.length &&
        !tokens[i + 1].startsWith('<') &&
        tokens[i + 2].toLowerCase() === `</${tagName}>`
      ) {
        output.push(indent.repeat(level) + `${token}${tokens[i + 1]}${tokens[i + 2]}`);
        i += 2;
        continue;
      }

      output.push(indent.repeat(level) + token);
      if (!isSelfClosing) level++;
      continue;
    }

    // Text node
    output.push(indent.repeat(level) + token);
  }

  return output.join('\n');
}

export function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .trim();
}

export function cleanWordHTML(html: string): string {
  let result = html;

  // Remove MS Office conditional comments
  result = result.replace(/<!--\[if[^]*?<!\[endif\]-->/gi, '');

  // Remove MS Office namespaced tags
  result = result.replace(/<o:[^>]*>[\s\S]*?<\/o:[^>]*>/gi, '');
  result = result.replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '');
  result = result.replace(/<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '');

  // Remove class="Mso*"
  result = result.replace(/\s*class="Mso[^"]*"/gi, '');

  // Remove style with mso-*
  result = result.replace(/\s*style="[^"]*mso-[^"]*"/gi, '');

  // Smart quotes and special chars
  result = result.replace(/\u2018|\u2019/g, "'");
  result = result.replace(/\u201C|\u201D/g, '"');
  result = result.replace(/\u2013/g, '-');
  result = result.replace(/\u2014/g, '--');
  result = result.replace(/\u2026/g, '...');
  result = result.replace(/\u00A0/g, ' ');

  // Remove empty spans
  result = result.replace(/<span[^>]*>\s*<\/span>/gi, '');

  // Remove empty paragraphs
  result = result.replace(/<p[^>]*>\s*(&nbsp;)?\s*<\/p>/gi, '');

  // Clean excessive whitespace
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

export function countBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function countChars(text: string): number {
  return [...text].length;
}
