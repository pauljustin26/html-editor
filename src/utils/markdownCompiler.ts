import type { FeedbackCategory, FeedbackItem } from '../types';

const CATEGORY_HEADERS: Record<FeedbackCategory, { title: string; emoji: string }> = {
  'Bug / Linter Error': { title: 'Bugs & Diagnostics Failures', emoji: '🐛' },
  'UI/UX Improvement': { title: 'UI/UX & Workflow Enhancements', emoji: '🎨' },
  'Feature Request': { title: 'Future Feature Requests & Capabilities', emoji: '💡' },
};

export function compileFeedbackToMarkdown(items: FeedbackItem[]): string {
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  if (items.length === 0) {
    return `# HTML Editor Feedback & Feature Roadmap\n\nGenerated: ${dateStr}\n\n*No pending feedback items in queue.*\n`;
  }

  // Count items per category
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }

  const categoryOrder: FeedbackCategory[] = [
    'Bug / Linter Error',
    'UI/UX Improvement',
    'Feature Request',
  ];

  let md = `# HTML Editor — Feedback Roadmap\n\n`;
  md += `> **Export Date:** ${dateStr}  \n`;
  md += `> **Total Items:** ${items.length}  \n`;
  md += `> **Distribution:** ` + categoryOrder
    .filter(cat => counts[cat])
    .map(cat => `${cat}: **${counts[cat]}**`)
    .join(' | ') + `\n\n`;

  md += `---\n\n`;

  for (const category of categoryOrder) {
    const group = items.filter(item => item.category === category);
    if (group.length === 0) continue;

    const { emoji, title } = CATEGORY_HEADERS[category];
    md += `## ${emoji} ${title} (${group.length})\n\n`;

    group.forEach((item, index) => {
      md += `### ${index + 1}. ${item.title || 'Untitled Feedback'}\n\n`;
      md += `- **ID:** \`${item.id}\`\n`;
      md += `- **Logged At:** ${item.createdAt}\n`;
      md += `- **Platform Target:** \`${item.context.platform}\`\n\n`;
      md += `#### Description & Notes\n\n`;
      md += `${item.description.trim()}\n\n`;

      md += `<details>\n<summary><b>Context & Diagnostic Snapshot</b></summary>\n\n`;
      md += `- **Active Tab / Context:** \`${item.context.activeTab}\`\n`;
      md += `- **Target Item:** \`${item.context.activeProductName || item.context.activeProductId || 'Scratchpad Buffer'}\`\n`;
      md += `- **HTML Payload Size:** ${item.context.htmlByteLength.toLocaleString()} bytes\n`;
      md += `- **Active Diagnostics Count:** ${item.context.diagnosticCount}\n`;
      if (item.context.unresolvedErrors.length > 0) {
        md += `- **Linter Diagnostics:**\n`;
        item.context.unresolvedErrors.forEach(err => {
          md += `  - \`${err}\`\n`;
        });
      }
      md += `- **User Agent:** \`${item.context.userAgent}\`\n`;
      md += `\n</details>\n\n---\n\n`;
    });
  }

  md += `## AI Agent Next Steps\n\n`;
  md += `1. Prioritize unresolved bug diagnostics in \`htmlLinter.ts\`.\n`;
  md += `2. Implement requested e-commerce rules into validation pipelines.\n`;
  md += `3. Review Excel batch sync edge-cases against multi-byte Japanese encodings.\n`;

  return md;
}

export function downloadMarkdownFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
