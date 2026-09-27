# 发布与服务器更新

## 当前生产网站：每五分钟自动更新

- 网站：`http://lab.malab.cn/MSA/`
- 仓库：`https://github.com/malabz/new-msa-website`（公开）
- 服务器账户：`zhangpinglu`
- 唯一网站写入目录：`/www/web/malab_cloudfood_me/public_html/MSA`

`main` 保存 Markdown 源码；GitHub Actions 使用 Node.js 24 检查、测试并按 `/MSA/` 编译，成功后更新 `site` 分支。工作流中的生产前缀固定为 `/MSA/`，不读取仓库变量；本地构建仍可通过 `SITE_BASE` 选择前缀，默认 `/`。

用户 crontab 每五分钟调用 `MSA/.deploy/update-apache.py`。旧服务器的 Git/curl/wget 无法连接 GitHub TLS，因此脚本使用 `.deploy/bin/curl` 下载 `site` 最新提交对应的归档，无需在服务器保存 GitHub 凭据或安装 Node.js。独立客户端由 `deploy/build-static-client.sh` 在本地 Alpine 容器中构建，源码版本、CA、构建记录与校验清单保存在 `.deploy/bin/`；安装时必须实测旧内核兼容性以及 HTTPS 证书校验，不能关闭证书验证。

更新前验证归档路径、文件类型、完整清单、SHA-256、来源提交和 `/MSA/` 前缀。完整网页版本进入 `_releases/<site提交号>/`，`.htaccess` 将 `/MSA/` 请求映射到当前版本。脚本原子替换目录内配置，随后检查首页、深层页面、发布记录和 404；检查失败恢复上一版配置。哈希命名的 `assets/` 文件作为共享资源保留，历史版本不自动删除。

所有下载、锁、日志、状态和首次上线备份均在 `.deploy/`；该目录禁止 HTTP 访问。仅用户 crontab 是网站目录外的必要修改，不改全局 Apache、旧站、父目录或系统软件。

```bash
# 在服务器上手动更新一次
/usr/bin/python -B /www/web/malab_cloudfood_me/public_html/MSA/.deploy/update-apache.py

# 查看状态与最近日志
bash /www/web/malab_cloudfood_me/public_html/MSA/.deploy/cron-control.sh status

# 暂停自动更新（网站继续提供当前版本）
bash /www/web/malab_cloudfood_me/public_html/MSA/.deploy/cron-control.sh pause

# 恢复；下一个五分钟检查点生效
bash /www/web/malab_cloudfood_me/public_html/MSA/.deploy/cron-control.sh resume
```

定时条目由 `cron-control.sh install` 幂等安装并保留其他任务。仅在手动更新和健康检查成功、`.deploy/state.json` 存在后安装。记录位于 `.deploy/update.log`、`.deploy/cron.log`；成功状态记录 site 与源码提交号。下载失败、并发占用或 `.deploy/paused` 存在时不会切换网站。

日常维护流程是修改 Markdown → 提交 PR → 合并 `main` → 等待 GitHub 构建以及下一次服务器检查。更新延迟为构建耗时加最多约五分钟等待及下载时间。不要在生产目录手工修改生成的正文。

首次部署备份在 `.deploy/baseline/` 与 `.deploy/initial.htaccess`；最近一次切换前的配置和状态在 `.deploy/previous.htaccess`、`.deploy/previous-state.json`。人工回退前先暂停任务，再由维护者成对恢复配置与状态，避免下次检查立即覆盖回退结果。首次接入的回退不依赖 previous-state 文件。

## 通用独立目录部署模板

以下为其他服务器的通用模板。当前生产服务器使用上面的 Apache 目录内更新器，不能直接套用依赖新 Git 与 realpath 的 `update-site.sh`。

## 一次性配置

创建独立 GitHub 仓库后，将本项目源码放在 `main` 分支。启用 GitHub Actions，允许发布任务对仓库内容写入。`site` 分支由第一次成功发布自动创建；无需启用 GitHub Pages。

本地 `SITE_BASE` 控制访问前缀，必须以 `/` 开头和结尾。另建站点时应同时调整工作流中的生产前缀：

| 对外访问形式 | SITE_BASE |
| --- | --- |
| 独立域名根目录 | `/` |
| `https://example.org/~cjt/MSA/` | `/~cjt/MSA/` |

修改工作流前缀后重新构建。贡献流程见仓库根目录的 `CONTRIBUTING.md`；网站不显示页面编辑入口。

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

新站点使用上述通用模板前，需要单独确定仓库、URL、目录、Web 服务与运行账户；当前生产站点的信息见本文开头。
