---
title: Cactus 安装与使用
order: 13
---

# Cactus 安装与使用

[Cactus](https://www.nature.com/articles/s41586-020-2871-y)是发表在Nature正刊上的一款多基因组比对软件，能够完成多个物种的基因组比对。其代码可在[Github页面](https://github.com/ComparativeGenomicsToolkit/cactus)找到。

## Cactus的安装

如果要使用源码编译，需要服务器的sudo权限。因此这里我推荐使用作者预先编译好的版本，这里我用[Cactus v2.9.0](https://github.com/ComparativeGenomicsToolkit/cactus/releases/tag/v2.9.0)作为示例。
[此链接](https://github.com/ComparativeGenomicsToolkit/cactus/releases/download/v2.9.0/cactus-bin-v2.9.0.tar.gz)为下载包，参考[此页面](https://github.com/ComparativeGenomicsToolkit/cactus/blob/v2.9.0/BIN-INSTALL.md)进行安装。

首先确认是否安装了`virtualenv`这个包。

```bash
virtualenv --version
```

如果没有安装，可以使用以下命令安装

```bash
python3 -m pip install virtualenv
```

下载预编译包后，解压并进入文件夹

```bash
\$ tar -xzf cactus-bin-v2.9.0.tar.gz
\n
\$ cd cactus-bin-v2.9.0
```

然后运行以下命令进行配置安装

```bash
\$ virtualenv -p python3.8 venv-cactus-v2.9.0
\n
\$ printf "export PATH=$(pwd)\/bin:\$PATH\; export PYTHONPATH=\$(pwd)\/lib:\$PYTHONPATH" >> venv-cactus-v2.9.0\/bin\/activate
\n
\$ source venv-cactus-v2.9.0\/bin\/activate
\n
\$ python3 -m pip install -U setuptools pip wheel
\n
\$ python3 -m pip install -U .
\n
\$ python3 -m pip install -U -r .\/toil-requirement.txt
```

基本会一切顺利完成cactus的安装，这时候可以使用简单的样例来测试cactus的使用。\n

```bash
\$ cactus .\/jobstore .\/examples\/evolverMammals.txt .\/evolverMammals.hal --realTimeLogging
```

## Cactus的简单使用

cactus的使用教程可以参考[官方页面](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/progressive.md)\n
我的使用命令为

```bash
\$ cactus \/path\/to\/js \/path\/to\/seqfile \/path\/to\/output\/hal --workDir \/path\/to\/workdir
```

1. /path/to/js 这个文件夹我也不知道放什么，只要确保为空文件夹或不存在就好\n

2. /path/to/seqfile 存放进化树和数据位置，示例如下

```bash
    (Crab\_eating\_macaque\:0.33, (Gibbons\:5.08, (Orangutans\:3.17, (Gorillas\:4.00, (Chimpanzees\:6.83, Humans\:1.94)anc3e\:5.56)anc4e\:2.38)anc5e\:0.77)anc2e\:0.75)\;
    \n
    Humans \/path\/to\/Humans.fna
    \n
    Chimpanzees \/path\/to\/Chimpanzees.fna
    \n
    Gorillas \/path\/to\/Gorillas.fna
    \n
    Orangutans \/path\/to\/Orangutans.fna
    \n
    Gibbons \/path\/to\/Gibbons.fna
    \n
    Crab\_eating\_macaque \/path\/to\/Crab\_eating\_macaque.fna
```

第一行为进化树，必须要严格符合Newick格式。第二部分是各个物种fasta文件的位置，可以是本地位置，也可以是url链接。\n

3. /path/to/output/hal是输出的hal文件\n

4. --workDir /path/to/workdir 应该是存放中间文件位置，确保该文件夹的硬盘空间足够大，不然可能会报错。
