---
title: Unialigner 安装指南
order: 14
---

# Unialigner 安装指南

[Unialigner](https://www.nature.com/articles/s41592-023-01970-4) 是发表在 Nature Methods 上的论文中提到的一款软件，旨在实现两条超长串联重复序列的比对。该软件的代码托管在 [GitHub](https://github.com/seryrzu/unialigner)。

## 安装前的注意事项

安装 Unialigner 时，请参考项目的 README 文档。以下是安装步骤的简要概述：

```bash
# 克隆项目仓库
$ git clone git@github.com:seryrzu/unialigner.git

# 进入正确的文件夹
$ cd unialigner/tandem_aligner

# 使用 make 命令生成可执行文件
$ make -j4
```

请注意，项目最初名为 `tandem_aligner`，后更名为 `unialigner`。

## CMake 和 GCC 的版本要求

Unialigner 需要 CMake (>= 3.15) 和 GCC (>= 9.4)。如果版本不满足要求，将无法编译。

### CMake 版本过低时的解决方法

1. 如有必要，卸载旧版本的 CMake：

```bash
   $ sudo apt-get remove cmake
```

2. 从 CMake 官方网站下载最新版本并安装：

```bash
   $ sudo sh cmake-3.15.0-Linux-x86_64.sh \-\-prefix=\/usr\/local \-\-exclude-subdir
```

3. 安装完成后，验证 CMake 版本：

```bash
   $ cmake \-\-version
```

### GCC 版本不符合要求时的解决方法

1. 尝试通过包管理器安装 GCC 9.4：

```bash
   $ sudo apt-get update

   $ sudo apt-get install gcc-9
```

2. 如果无法安装，则需从源代码编译（make这一步骤耗时很久）：

```bash
   $ wget https:\/\/ftp.gnu.org\/gnu\/gcc\/gcc-9.4.0\/gcc-9.4.0.tar.gz

   $ tar -xzf gcc-9.4.0.tar.gz

   $ cd gcc-9.4.0
   
   $ make -j\$(nproc)

   $ sudo make install
```

3. 安装后设置环境变量：

```bash
   $ export PATH=\/usr\/local\/gcc-9.4.0\/bin:\$PATH

   $ export LD\_LIBRARY\_PATH=\/usr\/local\/gcc-9.4.0\/lib64:\$LD\_LIBRARY\_PATH
```

4. 重新加载环境变量并验证 GCC 版本：

```bash
   $ source ~/.bashrc
   
   $ gcc \-\-version
```

确认 CMake 和 GCC 版本符合要求后，设置环境变量并编译：

```bash
$ export CC=\/usr\/local\/gcc\-9.4.0\/bin\/gcc

$ export CXX=\/usr\/local\/gcc\-9.4.0\/bin\/g\+\+

$ make
```

最终的可执行文件位于 `./build/bin/` 目录。
