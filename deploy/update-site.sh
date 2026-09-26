#!/usr/bin/env bash
# Usage: bash update-site.sh REPOSITORY_URL ABSOLUTE_DEPLOY_ROOT
set -euo pipefail
repo=${1:?请提供 Git 仓库地址}
root=${2:?请提供独立部署目录的绝对路径}
case "$root" in /*) ;; *) echo '部署目录必须为绝对路径' >&2; exit 1;; esac
root=$(realpath -m -- "$root")
case "$root" in /|/home|/root|/tmp|/var|/srv|/mnt|"${HOME:-/}") echo '拒绝使用宽泛目录作为部署根目录' >&2; exit 1;; esac
if [[ -d "$root" && ! -f "$root/.msa-deploy-root" && -n "$(ls -A "$root")" ]]; then
  echo '目录非空且不属于本站部署，请指定新的独立目录。' >&2; exit 1
fi
mkdir -p -- "$root"
touch "$root/.msa-deploy-root"
exec 9>"$root/update.lock"
flock -n 9 || { echo '另一个更新正在运行，本次跳过。'; exit 0; }
if [[ ! -d "$root/checkout/.git" ]]; then
  git clone --branch site --single-branch -- "$repo" "$root/checkout"
fi
[[ "$(git -C "$root/checkout" remote get-url origin)" == "$repo" ]] || { echo '仓库地址不匹配' >&2; exit 1; }
[[ "$(git -C "$root/checkout" branch --show-current)" == site ]] || { echo '检出分支不是 site' >&2; exit 1; }
[[ -z "$(git -C "$root/checkout" status --porcelain)" ]] || { echo '拉取目录有未提交修改' >&2; exit 1; }
git -C "$root/checkout" pull --ff-only origin site
revision=$(git -C "$root/checkout" rev-parse HEAD)
mkdir -p -- "$root/releases"
release="$root/releases/$revision"
if [[ ! -d "$release" ]]; then
  stage=$(mktemp -d "$root/releases/.incoming.XXXXXX")
  git -C "$root/checkout" archive HEAD | tar -x -C "$stage"
  if [[ -n "$(find "$stage" -type l -print -quit)" ]]; then echo '静态产物不允许符号链接' >&2; exit 1; fi
  for required in index.html 404.html release.json FILES.sha256; do
    [[ -s "$stage/$required" ]] || { echo "缺少发布文件：$required；当前站点保持不变。" >&2; exit 1; }
  done
  (cd "$stage" && sha256sum --check --quiet FILES.sha256)
  mv -- "$stage" "$release"
fi
# Validate again before selecting an existing release (including a rollback).
(cd "$release" && sha256sum --check --quiet FILES.sha256)
[[ -s "$release/index.html" && -s "$release/release.json" ]] || exit 1
if [[ -e "$root/current" && ! -L "$root/current" ]]; then echo 'current 必须为本站管理的符号链接' >&2; exit 1; fi
link="$root/.current-$revision-$$"
ln -s -- "releases/$revision" "$link"
mv -Tf -- "$link" "$root/current"
echo "已切换到 $revision；访问目录：$root/current"
# Old releases and failed incoming directories are retained for diagnosis/rollback.
