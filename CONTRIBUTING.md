# 为 MSA 贡献内容

这份教程面向第一次参与协作的成员。修正错字、补充引用、更新软件用法，或者新增文章，都欢迎提交。

项目仓库：[malabz/new-msa-website](https://github.com/malabz/new-msa-website)；线上网站：[MSA](http://lab.malab.cn/MSA/)。

**只改少量文字，先完成下面的网页修改教程即可。** 需要同时编辑多个文件、添加图片或查看完整网站效果时，再选择 Codespaces 或本地预览。不需要把三种方式都做一遍。

## 选择贡献内容与找到文件

网站正文来自 `docs/` 下的 Markdown 文件。例如，网站中的“双序列比对”对应 `docs/basics/pairwise.md`。

| 栏目 | 目录 | 示例文件 |
| --- | --- | --- |
| 比对基础 | [docs/basics/](docs/basics/) | `pairwise.md` |
| 重比对 | [docs/realignment/](docs/realignment/) | `overview.md` |
| 数据与评测 | [docs/data/](docs/data/) | `datasets.md` |
| 软件指南 | [docs/software/](docs/software/) | `lab.md` |
| 开发工具 | [docs/development/](docs/development/) | `libraries.md` |
| 论文成果 | [docs/publications/](docs/publications/) | `papers.md` |

首页是 `docs/index.md`，图片在 `docs/public/images/`。已有文章可以直接编辑，新增文章放入合适的栏目。新增顶级栏目或调整主题时，先通过 [Issue](https://github.com/malabz/new-msa-website/issues) 与维护者沟通。

## 第一次贡献：直接在 GitHub 修改

以修订“双序列比对”中的一句话为例：

1. 登录 GitHub，打开[双序列比对源文件](https://github.com/malabz/new-msa-website/blob/main/docs/basics/pairwise.md)。
2. 点击右上方的铅笔图标 **Edit this file**。如果出现 **Fork this repository**，点击它，GitHub 会在你的账号下建立一份项目副本。
3. 修改文字，点击 **Preview** 检查 Markdown 显示。保留文章原有引用和章节锚点；不要为了演示随意修改算法公式。
4. 点击 **Commit changes…**，填写简短说明，例如“澄清全局比对的回溯起点”。
5. 根据权限选择下表中的操作，然后创建 Pull Request（简称 PR，即向维护者提交修改申请）。

| 情况 | 如何提交 |
| --- | --- |
| 没有原仓库写权限 | 按提示在个人 Fork 中提交，再选择 **Propose changes / Create pull request** |
| 有原仓库写权限 | 选择 **Create a new branch for this commit and start a pull request**，分支可命名为 `docs/clarify-pairwise` |

创建 PR 时确认：**目标仓库（base repository）是 `malabz/new-msa-website`，目标分支（base）是 `main`**；来源选择你的贡献分支。填写标题和修改说明，再点击 **Create pull request**。

即使有写权限，也建议使用新分支和 PR，让其他成员能够审阅。GitHub 的 **Preview** 只显示 Markdown 正文，不会运行整套网站。仅修改错字时可以提交 PR 并等待自动检查；需要核对导航、搜索、图片和布局时，使用下一节的完整预览。

界面如有变化，可参考 [GitHub 官方网页编辑说明](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)。

## 需要完整网站预览时

### 方式一：Codespaces，在浏览器中编辑和预览

适合一次编辑多个文件、又不想安装本地环境的成员。

1. 如果还没有个人 Fork，打开[创建 Fork](https://github.com/malabz/new-msa-website/fork)，将副本建到自己账号下。已有 Fork 时，在副本首页使用 **Sync fork → Update branch** 同步 `main`。
2. 在个人 Fork 的分支选择器中，从 `main` 创建贡献分支，例如 `docs/add-alignment-note`，并切换到该分支。如果已有正在修改的分支，直接选中它。
3. 点击 **Code → Codespaces → Create codespace**，确认环境基于该贡献分支创建。
4. 等待依赖准备完成。在 **Ports（端口）** 面板找到 **5173 / MSA 实时预览**，点击浏览器图标打开。项目已配置自动启动；若未启动，在终端执行 `npm run dev`。
5. 编辑并保存 `docs/` 下的 Markdown，预览会自动更新。新图片也应放入仓库对应目录。
6. 在左侧 **Source Control（源代码管理）** 查看差异、暂存本次文件、填写说明并 **Commit**，再通过 **Publish Branch / Push / Sync Changes** 推送。
7. 回到个人 Fork 的 GitHub 页面，点击 **Compare & pull request**，向原仓库 `main` 创建 PR。

如果没有出现 PR 入口，可在[原仓库 Pull requests](https://github.com/malabz/new-msa-website/pulls) 中选择 **New pull request → compare across forks**，再选择自己的 Fork 和贡献分支。

Codespaces 使用个人或组织的计算、存储额度，可能产生费用；使用前查看账号额度。完成后到 [Codespaces 列表](https://github.com/codespaces) 停止环境。**停止不会删除代码；删除环境前务必确认已提交并推送**。参考 [Codespaces 官方入门说明](https://docs.github.com/en/codespaces/quickstart)。

### 方式二：本地编辑和预览

安装 [Git](https://git-scm.com/downloads) 和 **[Node.js 24](https://nodejs.org/)**。下面的命令在终端运行；Windows 可使用 PowerShell 或 Git Bash。

没有写权限时，先在 GitHub 创建个人 Fork，然后克隆自己的副本。将 `YOUR-USERNAME` 换成你的 GitHub 用户名：

```bash
git clone https://github.com/YOUR-USERNAME/new-msa-website.git
cd new-msa-website
git switch -c docs/clarify-pairwise
```

有写权限的成员也可以克隆 `https://github.com/malabz/new-msa-website.git`，同样新建贡献分支。已有本地仓库时不用重复克隆；先确认所在分支和未提交改动。

启动实时预览：

- **Windows：**双击仓库根目录的 `preview.cmd`。
- **macOS/Linux/WSL：**在仓库目录执行 `bash preview.sh`。
- **命令行方式：**首次执行 `npm ci`，然后运行 `npm run dev`。

启动器会检查 Node.js 版本，在首次使用或依赖变化时安装依赖。浏览器打开终端显示的地址，通常是 `http://127.0.0.1:5173/`；保存文档后页面自动更新。结束预览时按 **Ctrl+C**。

不要通过双击生成的 HTML 来判断完整网站效果；预览需要上述本地服务。

## 新增文章与常用 Markdown

在已有栏目下新增文件，例如 `docs/basics/alignment-example.md`。文件名使用英文小写和连字符，标题可以用中文。GitHub 网页中可以在栏目目录选择 **Add file → Create new file**。

下面是可以直接复制的文章起点：

```markdown
---
title: 比对方法示例
order: 50
---

# 比对方法示例

用一段话介绍本文解决什么问题、适合什么读者。

## 方法与使用条件

解释核心思路、输入输出，以及适用范围和限制。

## 示例

给出能够核对的例子，并说明工具版本、参数和预期结果。

## 参考资料

列出实际使用的论文、官方文档或代码来源。
```

`title` 和 `order` 都可省略：未填 `title` 时使用正文一级标题；`order` 数值越小越靠前，未填时在有序文章之后按文件名排列。已有栏目的新文章会自动进入侧边栏，构建后进入搜索，不用修改共享配置。

### 图片与图注

将图片放入 `docs/public/images/`，例如 `alignment-example.svg`。路径和文件名大小写必须一致。

```markdown
![两条序列通过插入空位形成等长排列](/images/alignment-example.svg)

图 1：蓝色表示匹配位置，短横线表示空位。注明图片来源或自绘说明。
```

示例中的图片需要你实际添加。替代文字描述图中内容，图注说明符号和简化约定。按示例写 `/images/...`，不需要手动添加 `/MSA/` 前缀。

### 链接与引用

文章之间使用相对 Markdown 路径。下面的示例适用于放在 `docs/basics/` 下的文章：

```markdown
[评价指标](./metrics.md)
[数据集目录](../data/datasets.md)
[VitePress 官方文档](https://vitepress.dev/)
```

学术结论、算法定义和软件参数应提供可核对的论文或官方说明。修改旧文章标题时保留已有显式锚点，例如 `{#动态规划}`，以免破坏章节链接。

### 公式

```markdown
行内公式：$F_1 = 2PR/(P+R)$。

$$
F_1 = \frac{2PR}{P+R}
$$
```

### 表格

```markdown
| 参数 | 含义 | 示例 |
| --- | --- | --- |
| threads | 线程数 | 4 |
| input | 输入文件 | sequences.fa |
```

### 代码与命令

使用三个反引号包围代码，并标注 `bash`、`python` 等语言。例如：

````markdown
```python
sequence = "ACGT"
print(len(sequence))
```
````

可复制命令前不要添加终端提示符 `$`。软件用法注明版本、输入格式和参数适用条件。数据文件保留在原发布方或数据仓库，本站维护说明与入口。

## 提交、审阅与继续修改

**Commit** 保存一次修改记录，**Push** 将记录推送到 GitHub，**PR** 请求维护者将改动合入原仓库。

### 提交前检查

查看差异，确认只包含本次相关文章和图片。本地或 Codespaces 用户可以运行：

```bash
npm run check
npm run build
npm run preview
```

`check` 检查文档约定，`build` 检查生成网页、站内链接和图片，`preview` 浏览编译结果，通常使用 4173 端口。只在 GitHub 网页修改的成员可以注明“网页预览，等待 CI 检查”，不必为了修正一处文字搭建本地环境。

修改算法示例、教学图或脚本时，另外运行 `npm test`。不要提交 `node_modules/`、构建产物 `docs/.vitepress/dist/`、本地日志或大型数据文件，也不要手工编辑 `site` 分支。

### 提交与推送

下面延续本地教程的 `docs/clarify-pairwise` 分支；若使用其他分支或文章，请对应替换：

```bash
git status
git diff
git add docs/basics/pairwise.md
git commit -m "澄清全局比对的回溯起点"
git push -u origin docs/clarify-pairwise
```

推送命令要求已配置 GitHub 身份验证。尚未配置的成员可使用 [GitHub Desktop](https://desktop.github.com/) 登录，打开本地仓库后通过界面完成提交和 **Push origin**；不要把 GitHub 账号密码填写为 Git 的推送密码。

推送后点击 GitHub 的 **Compare & pull request**，确认目标为 **`malabz/new-msa-website:main`**。按 PR 模板说明改了什么、涉及哪些文章、如何检查以及新增内容的来源。

### 自动检查或审阅提出修改时

- PR 显示红色检查时，进入 **Checks**，打开失败任务及对应步骤。文档问题通常会显示文件名或无效链接；修改后在同一分支再次提交、推送，原 PR 会自动更新。
- 首次外部贡献的检查可能需要维护者批准运行。出现等待批准时联系维护者即可，不需要反复新建 PR。
- 根据审阅意见修改时，也继续使用原分支。无法判断问题时，在 PR 中贴出相关报错文字，请维护者协助。
- 同一主题保留一个 PR；不同主题新建分支和 PR，方便分别审阅、合并。

### 下一次贡献前同步项目

上一篇 PR 合并后，在个人 Fork 首页切换到 `main`，使用 **Sync fork → Update branch**。然后从更新后的 `main` 创建新分支。

本地仓库只有在 `git status` 显示工作区干净、自己的 `main` 没有未合并改动时，才执行：

```bash
git switch main
git pull --ff-only origin main
git switch -c docs/next-topic
```

遇到冲突或无法快进时，先保留自己的修改并向维护者说明情况，不要通过强制推送解决。

## 合并后如何上线

维护者合并到 `main` 后，GitHub Actions 检查、编译，成功后更新 `site` 分支；服务器每 5 分钟检查一次新版本。上线需要等待**构建耗时，加上最多约 5 分钟的检查等待及下载时间**。

可以在 [Actions](https://github.com/malabz/new-msa-website/actions) 查看构建状态，再访问 [MSA 网站](http://lab.malab.cn/MSA/) 核对。贡献文章不需要登录服务器。构建或下载失败时，网站会继续提供之前的版本；部署问题交给维护者处理，操作说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 常见问题

| 问题 | 先检查什么 |
| --- | --- |
| 没有写权限或推送被拒绝 | 使用个人 Fork，确认 `git remote -v` 中的 `origin` 指向自己的副本，再向原仓库提交 PR。 |
| 找不到预览页面 | 查看终端实际端口；Codespaces 查看 Ports 中的 5173。开发预览通常是 5173，构建预览通常是 4173。 |
| Node.js 版本错误 | 安装 Node.js 24，重新打开终端，执行 `node --version` 确认。 |
| 图片不显示 | 确认图片已保存并提交到 `docs/public/images/`，引用为 `/images/文件名`，大小写与扩展名一致。 |
| 新文章没有进入导航 | 确认文件在六个栏目目录内，扩展名为 `.md`，文件名不以点开头；保存后刷新预览。 |
| 链接或锚点检查失败 | 核对文件名、相对路径和目标标题，运行 `npm run build` 查看具体位置。 |
| 合并后网站还没更新 | 先确认原仓库 Actions 成功，再等待下一次五分钟检查；仍未更新时在 PR 中告知维护者。 |

## 专项说明：修改现有教学配图

现有 5 张双序列／多序列教学 SVG 由 `scripts/generate-figures.mjs` 生成。修改这些图时编辑生成脚本，再运行：

```bash
npm run figures
npm run check
npm test
```

将生成脚本、重新生成的 SVG 和相关正文一起提交，核对输入序列、得分和图注。普通文章新增自己的图片时不需要使用生成器。

修改布局或教学图的维护者还可运行 `npm run qa`、`node scripts/figure-qa.mjs`；需要事先启动预览并准备 Playwright 浏览器。图源和旧图记录见 [配图修订记录](migration/FIGURES-REVISION.md)。贡献教程只保存在仓库中，不生成网站文章。
