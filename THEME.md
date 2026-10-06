# 阅读主题维护

本轮主题以 `8381f15` 为内容基线，采用单左栏阅读布局。正文仍然是普通 Markdown；贡献者无需阅读本文或维护 Vue 组件。

## 写文章的约定不变

- 在现有六个栏目中新增 `.md` 文件即可进入导航和搜索。
- `title`、`order` 是可选页头字段；缺省读取一级标题，并沿用原有排序规则。
- 本页目录读取渲染后的二、三级标题及其真实 `id`，兼容显式锚点，不重新生成章节地址。
- 普通图片、公式、代码、表格和相对 Markdown 链接保持原有写法。贡献指南仍只在仓库根目录。

## 主题结构

页眉和浏览器标签页共用 `docs/public/alignment-mark.svg`，复用 EasyMSA 的原始图标（来源：`D:/code/easymsa/public/brand/easymsa-mark.svg`）。图形为蓝绿色的三行比对方块；页眉显示尺寸为 36px。更新文件名可以避免浏览器继续使用此前缓存的图标。

主题位于 `docs/.vitepress/theme/`：

- `ReadingLayout.vue` 扩展 VitePress 默认布局，用插槽放入合并导航和自动面包屑；页眉仅显示 MSA 标识，不附加站点说明。
- `ReadingNavigation.vue` 直接消费现有 sidebar 配置，管理目录标签、栏目展开、本页标题和移动抽屉焦点。切换文章恢复文档目录，仅展开当前栏目；切换标签不改变正文位置。
- `navigation.mjs` 负责页面与栏目匹配；`style.css` 集中保存颜色、排版、宽度和响应式规则。

正文最大宽度 960px，桌面左栏 264px，顶部 64px。960px 以下使用抽屉；768px 以下正文为 16px，其余为 17px。浅色与深色均保留科研图片的白色图面。没有外部字体、新图标包或新的运行依赖。

搜索始终复用 VitePress 的一个实例。桌面文章页仅通过 CSS 将原搜索按钮移到左栏，首页和移动端留在顶部。不要另加第二个搜索组件，否则会重复快捷键、元素 ID 和弹窗。

## 与 VitePress 1.6.4 的接合点

### 首页目录

`docs/index.md` 仍使用普通 Markdown：二级标题、一段说明、无序链接列表。`home-directory.mjs` 仅在首页构建时将这类章节包成目录行，主题 CSS 在桌面显示左侧说明与右侧链接，768px 以下改为上下排列。新增或改名栏目不需要写 Vue、HTML 或注册章节 ID；包含额外段落、三级标题等更丰富内容的章节会保留普通文档流。

首页目录宽度上限为 1060px，文章仍为 960px。首页链接字号桌面 17px、手机 16px；点击区域和键盘焦点沿用可访问样式。MGA-Dataset 使用普通 Markdown 链接标题，并显式保留原 `多基因组数据资源` 锚点。

VitePress 1.6 的本地搜索标题解析器要求锚点链接在标题中最先出现，因此 `renderSearchContent` 只在首页的搜索副本中去除标题内的普通链接标签，保留文字与章节锚点。实际网页链接不变，`search: false` 仍被遵守。升级后可核对这一兼容处理是否仍然必要；无需贡献者特殊编写正文。

自动测试 `tests/home-directory.test.mjs` 覆盖六个栏目、16 个文章链接、旧锚点、普通 Markdown 新增栏目、富文本回退和搜索标题。

### 阅读导航

默认布局没有完整的侧栏替换插槽，因此使用 `sidebar-nav-before` 放置阅读导航，隐藏原生 `.VPSidebar .nav > .group`。原生导航树保留在 HTML 中，但不显示、不接受键盘焦点；这不影响 Markdown 搜索索引。

移动抽屉继续复用默认主题的菜单、遮罩与滚动锁定。主题补充 `inert`、对话框语义、焦点循环、Esc/关闭后焦点恢复、链接导航后的正文焦点和快捷搜索协调。原有移动端独立目录下拉入口被隐藏。

升级 VitePress 时必须重新验证 `.VPSidebar`、`.VPBackdrop`、`.VPLocalNav`、`#local-search` 及侧栏插槽，而不是只检查构建成功。没有修改 `node_modules`。

## 开发预览与搜索

VitePress 1.6 的开发索引不会完整处理新增、删除页面，在 Windows 上还存在绝对路径热更新问题。`markdown-preview-refresh` 在文档变化后防抖 300ms，通知 VitePress 执行自身的配置重载路径，重新生成导航与搜索快照；不写配置文件，不需要成员手动重启。

因此保存文档时可能短暂刷新整页，这是维持目录、标题、删除条目和搜索一致性的约定。正式静态构建和发布流程不受影响。

## 回归检查

```bash
npm run check
npm test
npm run build
```

`scripts/browser-qa.mjs` 覆盖页面、搜索、目录、焦点、旧链接和移动布局；`scripts/hmr-qa.mjs` 验证临时文档的导航、标题排序、正文与搜索更新。运行这两个脚本需可用的 Playwright 浏览器；本轮视觉和交互检查使用 Codex 内置浏览器，未另启动 Chrome。

多前缀验收可把各次构建保存到独立目录，再使用以下仅监听本机的静态检查服务。它从构建的 `release.json` 读取前缀，不套用当前源码配置，缺失页面返回真正的 404：

```bash
node scripts/serve-built.mjs docs/.vitepress/dist 4183
```

`scripts/integration-qa.mjs` 在临时副本中检查新增文档的构建/索引与失败发布保护；Windows 使用目录 junction，其余平台使用目录 symlink。

实际验收范围、截图和已知限制见 [design-qa.md](design-qa.md) 及 [VALIDATION.md](VALIDATION.md)。
