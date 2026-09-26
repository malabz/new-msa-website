# MSA · 序列比对知识库

以 Markdown 共同维护课题组的算法、软件、数据和论文知识。VitePress 1.6.4 生成静态网站，构建环境统一为 Node.js 24。

## 从这里开始

1. 安装 [Node.js 24](https://nodejs.org/)。
2. Windows 双击 `preview.cmd`；macOS/Linux/WSL 执行 `bash preview.sh`。
3. 修改 `docs/` 中的 Markdown，浏览器实时查看变化。

启动器只在首次使用或锁文件变化时执行 `npm ci`。使用 GitHub Codespaces 可在浏览器内完成编辑和预览，见[贡献指南](CONTRIBUTING.md)。

```bash
npm ci
npm run dev       # 实时预览，默认 5173
npm run check     # 文档约定检查
npm test          # 导航、搜索分词和隔离部署测试
npm run build     # 构建 + 全站本地链接/资源/公式检查
npm run preview   # 浏览构建产物，默认 4173
```

生成网页位于 `docs/.vitepress/dist/`，通过本地 HTTP 预览；直接双击 HTML 不能完整验证搜索等交互。

## 内容结构

- `docs/`：17 个内容页面（含首页）；六个栏目按目录组织。
- `docs/public/images/`：9 张旧站示意图的本地副本。
- `docs/.vitepress/`：主题、自动导航、搜索及部署前缀配置。
- `CONTRIBUTING.md`：贡献指南，仅保存在仓库，不生成网站页面。
- `scripts/`：构建、校验、预览、发布和质量检查入口。
- `deploy/`：服务器定时更新脚本和 Nginx 示例。
- `migration/`：原稿基线、页面/章节映射、合并记录、图源和核对结果。

普通成员新增文章只需在已有栏目放入 `.md` 文件。标题默认从一级标题读取，页头 `title` 和 `order` 可选；无需手工登记导航。文件名用英文小写及连字符。

## 协作与发布

`main` 保存源码，PR 自动检查。合并后 GitHub Actions 编译，检查通过再以连续提交更新 `site` 分支；服务器拉取 `site` 并切换完整版本。生成 HTML 不放入源码分支。

新仓库尚未绑定所有者。正式地址确定后设置仓库变量 `SITE_BASE`，例如 `/` 或 `/~cjt/MSA/`；服务器设置见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 迁移与使用边界

原站：https://github.com/pinglu-zhang/msawebsite ，基线 `ae32d2cab0483c510103636c777ba384a859d0a7`。

原站 25 页合并为 17 个网站内容页面；贡献指南独立存放于仓库根目录。原有正文与科研命令按基线迁移，不代表全部软件参数已按最新版本重新验证。待核对条目见 [迁移报告](migration/REPORT.md)。

源站文档、图片和所引用数据的原有权利归属保留；本迁移未给第三方材料添加新许可证。原始 jemdoc 与 Git 历史在旧仓库留档。

## 维护者质量检查

`npm run qa` 对已运行的 `npm run preview` 执行浏览器检查；需要先安装测试浏览器 `npx playwright install chromium`。普通文档贡献者不需要安装测试浏览器。可用 `QA_URL` 指定子路径预览地址，用 `QA_CHROME` 指定已有 Chromium 可执行文件。

`node scripts/audit-external.mjs` 仅检查文档外链可访问性，不下载基因组数据；结果保存在 `migration/external-links.json`。`collect-assets.mjs` 是一次性迁移辅助工具，日常写作不运行它。

## 依赖安全约定

VitePress 按方案固定为 1.6.4。其旧版间接依赖通过 `overrides` 固定为 Vite 6.4.3、esbuild 0.25.12 和 @xmldom/xmldom 0.9.12，以修复已知公告；这些覆盖版本需要随站点一起进行构建、预览和浏览器回归，不能盲目删除。2026-09-26 的 `npm audit` 检查为 0 个已知漏洞，不代表永久安全。

本机开发与预览默认仅监听 127.0.0.1；Codespaces 端口保持私有。生产服务器仅部署构建出的静态文件，不运行开发服务。

安全公告：[Vite Windows 路径绕过](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)、[esbuild 开发服务跨源读取](https://github.com/advisories/GHSA-67mh-4wv8-2f99)、[xmldom 内存消耗](https://github.com/advisories/GHSA-965w-775f-mr7g)。
