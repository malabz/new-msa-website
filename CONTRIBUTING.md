# 贡献指南

本网站由课题组成员共同维护。日常只需修改 Markdown；导航和网页由构建流程生成。

## 修改现有文章

在仓库的 `docs/` 下找到对应文档，修改文字后预览并提交 Pull Request。也可以直接在 GitHub 网页编辑；网页自带的 Markdown 预览用于检查正文，完整网站效果请使用以下预览方式。

## 本地预览

首次安装 **Node.js 24**。Windows 双击仓库根目录的 `preview.cmd`；macOS、Linux 或 WSL 在仓库目录执行 `bash preview.sh`。启动器会在首次使用或依赖变化时安装依赖，并启动实时预览。

浏览器打开启动器给出的地址，保存 Markdown 后页面自动更新。结束时在终端按 Ctrl+C。

熟悉命令行的成员也可使用：

```bash
npm ci
npm run dev
```

安装依赖需要联网；依赖未改变时，无需重复下载安装。

## 浏览器内预览

在 GitHub 仓库选择 **Code → Codespaces → Create codespace**。环境会自动安装依赖，启动网站并转发 5173 端口。在编辑器里修改 Markdown 后，预览实时更新。

Codespaces 使用个人或组织的计算和存储额度；用完后可停止环境。请先提交并推送文档，再删除云端环境。

## 新增文章

在已有分组目录内新增英文小写文件名，例如 `docs/basics/new-method.md`。一级标题会成为导航标题，可用页头信息覆盖名称或指定顺序：

```markdown
---
title: 新方法介绍
order: 50
---

# 新方法介绍

说明方法适用的问题、数据和限制。

## 方法原理

给出来源明确的介绍。
```

`title` 和 `order` 都可以省略；没有 `order` 的文章按文件名排列在组内末尾。新文章会自动进入导航和搜索，不用编辑共享配置。

## 图片、公式与代码

图片放在 `docs/public/images/`，写清来源和图注。链接到其他文章时使用相对路径；示例：

```markdown
[评价指标](../basics/metrics.md)
![描述图片内容](/images/example.png)

行内公式：$F_1 = 2PR/(P+R)$。

$$
F_1 = \frac{2PR}{P+R}
$$
```

代码使用三个反引号围栏，标注 `bash`、`python` 等语言。不要在可复制命令前添加提示符 `$`。注明工具版本和参数适用条件。

## 检查与提交

```bash
npm run check
npm run build
npm run preview
```

PR 自动检查构建和站内链接，由维护者审阅合并。不要提交 `node_modules` 或生成的 HTML。外部数据文件保留在数据仓库或原发布方，这里只维护说明和入口。
