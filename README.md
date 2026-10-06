# MSA

用 Markdown 共同维护序列比对领域的算法介绍、软件指南、数据资源和课题组论文。

网站地址：[http://lab.malab.cn/MSA/](http://lab.malab.cn/MSA/)

项目仓库：[malabz/new-msa-website](https://github.com/malabz/new-msa-website)

## 内容维护

课题组成员通过修改 Markdown、提交 Pull Request（PR）更新网站。没有仓库写权限时，先 Fork 到个人账号，再提交 PR。

1. 在下面的目录中找到要修改的 Markdown 文件。
2. 在 GitHub 文件页点击铅笔图标，修改并预览正文。
3. 将改动提交到新分支，向 **`malabz/new-msa-website` 的 `main` 分支**创建 PR。
4. 等待自动检查和维护者审阅；合并后网站自动更新。

具体步骤见[网页修改说明](CONTRIBUTING.md#第一次贡献直接在-github-修改)；完整网站预览见[Codespaces 与本地预览说明](CONTRIBUTING.md#需要完整网站预览时)。

## 内容目录

| 栏目 | 文档目录 | 适合贡献的内容 |
| --- | --- | --- |
| 比对基础 | [docs/basics/](docs/basics/) | 双序列、多序列、基因组比对与评价指标 |
| 重比对 | [docs/realignment/](docs/realignment/) | 重比对思路、独立工具与 MSA 中的迭代改进 |
| 数据与评测 | [docs/data/](docs/data/) | 数据集入口、模拟数据与使用说明 |
| 软件指南 | [docs/software/](docs/software/) | 课题组软件、第三方工具与安装经验 |
| 开发工具 | [docs/development/](docs/development/) | 数据处理脚本与开发库 |
| 论文成果 | [docs/publications/](docs/publications/) | 论文信息、研究方向与相关软件 |

图片统一放在 `docs/public/images/`。在已有栏目新增 `.md` 文件后，导航会自动更新；文章模板、图片、公式和代码示例见[新增文章与常用 Markdown](CONTRIBUTING.md#新增文章与常用-markdown)。

## 本地快速预览

安装 **Node.js 24** 并克隆仓库后，Windows 双击 `preview.cmd`，macOS/Linux/WSL 执行 `bash preview.sh`。启动器会准备依赖并显示预览地址，保存 Markdown 后页面自动更新。

熟悉命令行也可以执行：

```bash
npm ci
npm run dev
```

## 协作与上线

建议一项主题使用一个分支、一个 PR。`main` 保存源码；合并后 GitHub Actions 自动检查并编译，通过后更新 `site` 发布分支，服务器每 5 分钟检查新版本。生成网页不放入源码分支，上线需要等待构建完成及下一次服务器检查。

- **贡献指南**：[CONTRIBUTING.md](CONTRIBUTING.md)，包含编辑、预览和 PR 流程。
- **问题反馈**：[Issues](https://github.com/malabz/new-msa-website/issues)。
- **部署说明**：[DEPLOYMENT.md](DEPLOYMENT.md)。文档维护无需操作服务器或修改生成的 HTML。
- **主题维护**：[THEME.md](THEME.md)，供维护者调整阅读界面；普通内容贡献无需修改主题。
