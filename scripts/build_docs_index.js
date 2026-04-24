// Build a docs index from Markdown files in docs/ with front matter support
// Output: docs/docs-index.json and HTML versions for each MD (docs/NAME.html)
const fs = require('fs');
const path = require('path');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
// Use Markdown-It for robust MD->HTML (with syntax highlighting)
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  },
});

function parseFrontMatter(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {};
  let body = content;
  if (fm) {
    const metaPart = fm[1];
    body = fm[2];
    metaPart.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
    });
  }
  return { meta, body };
}

function extractTitleFromMarkdown(content) {
  const m = content.match(/^#\s+(.*)$/m);
  return m ? m[1].trim() : '';
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^|-$/g, '');
}

function main() {
  const docsDir = path.resolve(__dirname, '..', 'docs');
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));

  const items = files.map((fname, idx) => {
    const full = path.join(docsDir, fname);
    const content = fs.readFileSync(full, 'utf8');
    const { meta, body } = parseFrontMatter(content);
    const title = meta.title || extractTitleFromMarkdown(body || content) || fname.replace('.md', '');
    const order = meta.order !== undefined ? Number(meta.order) : idx + 1;
    const htmlBody = md.render(body || content);
    const slug = slugify(fname.replace('.md', ''));
    const htmlPath = path.join(docsDir, slug + '.html');
    const htmlContent = `<!doctype html><html><head><meta charset='utf-8'><title>${title}</title></head><body>${htmlBody}</body></html>`;
    fs.writeFileSync(htmlPath, htmlContent);
    return {
      id: slug,
      title,
      path: `docs/${slug}.html`,
      order,
    };
  });

  const outPath = path.resolve(docsDir, 'docs-index.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
  console.log(`Docs index generated: ${outPath}`);

  // Also emit a root-level docs-index.json for GH Pages/public hosting
  const rootIndexPath = path.resolve(__dirname, '..', 'docs-index.json');
  fs.writeFileSync(rootIndexPath, JSON.stringify(items, null, 2));
  console.log(`Docs root index generated: ${rootIndexPath}`);
}

main();
