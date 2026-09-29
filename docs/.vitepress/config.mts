import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'node:url';
import { sidebar, tokenize, siteBase } from './content.mjs';

export default defineConfig({
  lang: 'zh-CN', title: 'MSA',
  description: '序列比对知识与资源：算法、数据、软件和科研成果。',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: siteBase() + 'favicon.svg' }]],
  base: siteBase(), cleanUrls: false, lastUpdated: false,
  markdown: { math: true, lineNumbers: false },
  vite: {
    server: { watch: { usePolling: process.platform === 'linux' && fileURLToPath(new URL('..', import.meta.url)).startsWith('/mnt/'), interval: 300 } },
    plugins: [{ name: 'markdown-navigation-refresh',
      configureServer(server) {
        const root = fileURLToPath(new URL('..', import.meta.url));
        let previous = JSON.stringify(sidebar(root));
        const refresh = (file: string) => {
          if (!file.endsWith('.md') || file.includes('node_modules')) return;
          const next = sidebar(root), signature = JSON.stringify(next);
          if (signature === previous) return;
          previous = signature;
          (server.config as any).vitepress.site.themeConfig.sidebar = next;
          const module = server.moduleGraph.getModuleById('/@siteData');
          if (module) server.moduleGraph.invalidateModule(module);
          server.ws.send({ type: 'full-reload' });
        };
        server.watcher.on('add', refresh).on('unlink', refresh).on('change', refresh);
        server.httpServer?.once('close', () => {
          server.watcher.off('add', refresh).off('unlink', refresh).off('change', refresh);
        });
      }
    }]
  },
  themeConfig: {
    siteTitle: 'MSA',
    nav: [
      { text: '算法', link: '/basics/pairwise.html', activeMatch: '/(basics|realignment)/' },
      { text: '数据', link: '/data/datasets.html', activeMatch: '/data/' },
      { text: '软件', link: '/software/lab.html', activeMatch: '/software/' },
      { text: '开发', link: '/development/libraries.html', activeMatch: '/development/' },
      { text: '论文', link: '/publications/papers.html', activeMatch: '/publications/' }
    ],
    sidebar: sidebar(fileURLToPath(new URL('..', import.meta.url))),
    outline: { level: [2, 3], label: '本页内容' },
    sidebarMenuLabel: '文档导航', returnToTopLabel: '返回顶部', darkModeSwitchLabel: '外观',
    docFooter: { prev: '上一篇', next: '下一篇' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/malabz/new-msa-website' }],
    search: { provider: 'local', options: {
      miniSearch: { options: { tokenize }, searchOptions: { combineWith: 'OR', prefix: true, fuzzy: 0.2 } },
      translations: { button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
        modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空',
          footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } } }
    } },
    footer: { message: 'MSA' }
  }
});
