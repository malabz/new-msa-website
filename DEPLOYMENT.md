# 发布与服务器更新

## 一次性配置

创建独立 GitHub 仓库后，将本项目源码放在 `main` 分支。启用 GitHub Actions，允许发布任务对仓库内容写入。`site` 分支由第一次成功发布自动创建；无需启用 GitHub Pages。

仓库变量 `SITE_BASE` 控制访问前缀，必须以 `/` 开头和结尾：

| 对外访问形式 | SITE_BASE |
| --- | --- |
| 独立域名根目录 | `/` |
| `https://example.org/~cjt/MSA/` | `/~cjt/MSA/` |

修改变量后手动运行构建工作流。GitHub 仓库名由工作流自动传入 `SITE_REPOSITORY`，启用“在 GitHub 编辑此页”。本地未设置时不显示该入口。

Actions 的 `build` 检查失败时，`publish` 不运行。发布前核对源码仍是远程 `main` 最新提交，发布任务串行且只进行普通 Git 推送，保留 `site` 历史。新源码恰好在推送瞬间到达时，下一次排队发布会继续推进至新版本；不会让较旧任务覆盖已发布的新版本。

## 服务器要求

Linux、Git、Bash、tar、flock、sha256sum、realpath 与静态 Web 服务。服务器无需 Node.js。拉取私有仓库时，由管理员配置只读部署密钥。

使用全新的专用部署目录；以下地址均需替换为实际值：

```bash
bash /opt/msa-maintenance/update-site.sh \
  git@github.com:YOUR-ORG/new-msa-website.git \
  /srv/msa-website
```

更新脚本建议单独放在 `/opt/msa-maintenance/`，不放在发布分支里。它会建立独立的 `checkout/`、`releases/`、`current` 链接和锁文件。`current` 是 Web 服务的站点目录。

示例定时任务（由管理员按需安装，不会由项目自动注册）：

```cron
*/10 * * * * /bin/bash /opt/msa-maintenance/update-site.sh git@github.com:YOUR-ORG/new-msa-website.git /srv/msa-website >> /var/log/msa-website-update.log 2>&1
```

流程为：快进拉取 → 导出完整版本 → 检查必要文件和校验清单 → 原子切换 `current`。网络故障、工作区不干净、哈希不匹配均不会切换当前版本。并发执行由锁阻止。以前版本和失败的临时版本保留，便于排查，由管理员按磁盘策略清理。

## Web 服务

根目录部署可参考 `deploy/nginx.conf.example`，替换域名和绝对目录。不存在页面应返回 HTTP 404，不能把所有请求改写到首页。

子目录部署需将 `/srv/msa-website/current` 映射到访问前缀。例如 Nginx：

```nginx
location = /~cjt/MSA { return 301 /~cjt/MSA/; }
location /~cjt/MSA/ {
    alias /srv/msa-website/current/;
    index index.html;
    autoindex off;
    add_header Cache-Control "no-cache";
    error_page 404 /~cjt/MSA/404.html;
}
```

正式上线前由管理员运行 Nginx 配置检查，并验证主页、深层 `.html`、资源文件、旧地址及不存在页面。Apache 等静态服务也可用，只要前缀映射与构建一致。

旧 `mga.html`、`datasets.html` 等 24 个地址由构建自动生成跳转文件，指向新页面或合并后的章节。原站标题没有通用的章节 id；新站对合并入口指定稳定锚点，未识别的历史 hash 仅在整页映射时原样保留。

## 回滚

先暂停更新定时任务，确认 `releases/` 下要回退的完整提交版本，并在该目录执行 `sha256sum --check FILES.sha256`。校验通过后，用新的临时符号链接原子替换 `current`。不要改写拉取目录的 Git 历史。恢复定时任务之前，先在源码中修复并通过新构建，否则更新任务会再次切换到最新 `site`。

## 尚需提供的上线信息

新仓库所有者和地址、正式 URL 前缀、服务器部署目录、Web 服务类型及定时任务运行用户。目前提供本地完整实现和可配置流程，尚未创建远程仓库或切换生产站点。
