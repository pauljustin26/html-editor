export interface ImageInfo {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  line: number;
  column: number;
  fullTag: string;
}

export function extractImages(html: string): ImageInfo[] {
  const images: ImageInfo[] = [];
  const lines = html.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let match;
    const lineContent = lines[i];
    const lineRegex = /<img\s+([^>]*?)\/?\s*>/gi;

    while ((match = lineRegex.exec(lineContent)) !== null) {
      const attrs = match[1];
      const src = extractAttr(attrs, 'src') || '';
      const alt = extractAttr(attrs, 'alt') || '';
      const width = extractAttr(attrs, 'width');
      const height = extractAttr(attrs, 'height');

      images.push({
        src,
        alt,
        width: width || undefined,
        height: height || undefined,
        line: i + 1,
        column: match.index + 1,
        fullTag: match[0],
      });
    }
  }

  return images;
}

function extractAttr(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = regex.exec(attrs);
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

export function replaceImageUrls(
  html: string,
  searchPattern: string,
  replacement: string,
  useRegex: boolean = false,
): { html: string; count: number } {
  let count = 0;
  let result = html;

  if (useRegex) {
    try {
      const regex = new RegExp(searchPattern, 'g');
      const imgSrcRegex = /(<img\s+[^>]*?src\s*=\s*(?:"|'))([^"']*)((?:"|')[^>]*?>)/gi;
      result = result.replace(imgSrcRegex, (fullMatch, before, src, after) => {
        const newSrc = (src as string).replace(regex, replacement);
        if (newSrc !== src) {
          count++;
          return before + newSrc + after;
        }
        return fullMatch;
      });
    } catch {
      // Invalid regex
    }
  } else {
    const imgSrcRegex = /(<img\s+[^>]*?src\s*=\s*(?:"|'))([^"']*)((?:"|')[^>]*?>)/gi;
    result = result.replace(imgSrcRegex, (fullMatch, before, src, after) => {
      if ((src as string).includes(searchPattern)) {
        count++;
        return before + (src as string).split(searchPattern).join(replacement) + after;
      }
      return fullMatch;
    });
  }

  return { html: result, count };
}
