/**
 * Present ordinary homepage Markdown sections as directory rows at build time.
 * No component syntax, positional section IDs or client-side DOM rewriting.
 */
export function homeDirectory(md) {
  md.core.ruler.push('home-directory', state => {
    if (state.env.relativePath !== 'index.md') return;
    const tokens = state.tokens;
    const starts = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'heading_open' && tokens[i].tag === 'h2' && tokens[i].level === 0) starts.push(i);
    }
    // Work backwards so each original section boundary stays valid.
    for (let n = starts.length - 1; n >= 0; n--) {
      const start = starts[n];
      const end = starts[n + 1] ?? tokens.length;
      const fragment = tokens.slice(start, end);
      // A directory row is deliberately conservative: H2, one paragraph,
      // and one plain list. Richer/new content remains normal document flow.
      const top = fragment.filter(token => token.level === 0 && token.nesting !== -1).map(token => token.type);
      const isDirectory = top.join(',') === 'heading_open,paragraph_open,bullet_list_open';
      const open = new state.Token('html_block', '', 0);
      open.content = `<section class="${isDirectory ? 'home-directory-row' : 'home-resource'}">\n`;
      const close = new state.Token('html_block', '', 0);
      close.content = '</section>\n';
      tokens.splice(end, 0, close);
      tokens.splice(start, 0, open);
    }
  });
}

/** VitePress 1.6's search heading parser expects the permalink to be the first
 * anchor. Keep linked homepage headings clickable on the page, but unwrap their
 * content links in search-only HTML so the heading text is indexed correctly.
 */
export function renderSearchContent(source, env, md) {
  const html = md.render(source, env);
  if (env.frontmatter?.search === false) return '';
  if (env.relativePath !== 'index.md') return html;
  return html.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/g, heading =>
    heading.replace(/<a\b(?![^>]*\bclass="[^"]*\bheader-anchor\b)[^>]*>([\s\S]*?)<\/a>/g, '$1'));
}
