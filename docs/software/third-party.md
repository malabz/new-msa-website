---
title: 第三方比对工具
order: 12
---

# 第三方比对工具

## 工具目录 {#catalog}

| 软件名称 | 主页 | 适用范围 | 介绍 |
| --- | --- | --- | --- |
| ClustalO | [http://www.clustal.org/omega/](http://www.clustal.org/omega/) | 蛋白质、DNA、RNA | [详细](third-party.md#clustalo) |
| Dialign-tx | [http://dialign-tx.gobics.de/](http://dialign-tx.gobics.de/) | 蛋白质、DNA、RNA | — |
| HAlign | [http://lab.malab.cn/soft/halign/](http://lab.malab.cn/soft/halign/) | 蛋白质、DNA、RNA | — |
| Kalign | [http://msa.cgb.ki.se](http://msa.cgb.ki.se) | 蛋白质、DNA、RNA | — |
| MAFFT | [http://www.biophys.kyoto-u.ac.jp/~katoh/programs/align/mafft/](http://www.biophys.kyoto-u.ac.jp/~katoh/programs/align/mafft/) | 蛋白质、DNA、RNA | — |
| Muscle | [http://www.drive5.com/muscle/](http://www.drive5.com/muscle/) | 蛋白质、DNA、RNA | — |
| T-Coffee | [http://www.tcoffee.org](http://www.tcoffee.org) | 蛋白质、DNA、RNA | [详细](third-party.md#tcoffee) |
| abPOA | [https://github.com/yangao07/abPOA](https://github.com/yangao07/abPOA) | 蛋白质、DNA、RNA | [详细](third-party.md#abpoa) |

## GENERIC RESOURCES

| Multiple Sequence Alignment | [https://en.wikipedia.org/wiki/List_of_sequence_alignment_software](https://en.wikipedia.org/wiki/List_of_sequence_alignment_software) |
| --- | --- |

## abPOA {#abpoa}

abPOA 实现了偏序图比对，并采用了 K-band + SIMD 优化。支持蛋白质、DNA、RNA 序列。

### 安装

#### 推荐使用 conda 进行配置

**conda 配置**

```bash
# 下载编译好的程序
$ conda install -c wym6912 -c conda-forge abpoa
```

#### Linux 系统

**安装示例：**

```bash
# 下载源代码
$ wget https://github.com/malabz/abPOA/releases/download/v1.4.1.1/abPOA-v1.4.1.1.tar.gz

# 解压
$ tar -xvf abPOA-v1.4.1.1.tar.gz

# 进入目录
$ cd abPOA-v1.4.1.1/

# 编译
$ make -j16

# 安装
$ sudo cp bin/abpoa /usr/bin/
```

#### Windows 系统

下载 [压缩包](https://github.com/malabz/abPOA/releases/download/v1.4.1.1/abPOA-v1.4.1.1.tar.gz) 并使用压缩包管理器软件解压。

接下来在 Visual Studio 2022 上编译程序并使用：打开 abpoa.sln ，接下来选择 Build -> Build Solution 。打开 x64\Debug 文件夹，获得 abpoa.exe 。若要生成正式版，需要在“属性”处选择 Release 模式。接下来， 选择 Properties -> Configuration Properties ，选择 Configuration Manager... 按钮，修改 Active Solution 为 Release。重新编译，在 x64\Release 文件夹下获得 abpoa.exe。

### 使用

```text
# 利用 POA 进行偏序比对
$ abpoa mt1x.fasta -r 1 > mt1x.ans.fasta
# 比对蛋白质序列
$ abpoa protein.fasta -r 1 -c > protein.ans.fasta
# 生成共识序列
$ abpoa mt1x.fasta -r 0 > mt1x.abpoa.center.fasta

# 详细使用方法
$ abpoa --help
```

### 参考内容

· Lee, C., Grasso, C., & Sharlow, M. F. (2002). Multiple sequence alignment using partial order graphs. Bioinformatics, 18(3), 452-464.

· Lee, C. (2003). Generating consensus sequences from partial order multiple sequence alignment graphs. Bioinformatics, 19(8), 999-1008.

· Gao, Y., Liu, Y., Ma, Y., Liu, B., Wang, Y., & Xing, Y. (2021). abPOA: an SIMD-based C library for fast partial order alignment using adaptive band. Bioinformatics, 37(15), 2209-2211.

## Clustal Omega {#clustalo}

### 安装（Unix系统下）

#### 安装clustalo

**安装示例：**

```bash
# 下载源代码
$ wget http://www.clustal.org/omega/clustal-omega-1.2.4.tar.gz

# 解压
$ tar -xvf clustal-omega-1.2.4.tar.gz

# 进入目录
$ cd clustal-omega-1.2.4/

# 配置
$ ./configure

# 编译
$ make

# 安装
$ make install

# 环境变量设置，修改启动配置文件
$ vim ~/.bashrc
# 将以下内容添加到.bashrc文件中，localPath是clustalo的安装路径
export PATH=/localPath/clustal-1.2.4:$PATH
export PATH=/localPath/clustal-1.2.4/src:$PATH
# 更新启动配置文件
$ source ~/.bashrc
```

**注意事项：**
Clustal-Omega需要argtable2([http://argtable.sourceforge.net/](http://argtable.sourceforge.net/))。如果argtable2安装在非标准目录中，您可能需要的配置到它的安装目录。

**在使用默认配置安装clustalo时，可能会报错：**

```bash
configure: error: Could not find argtable2.h. Try $ ./configure CFLAGS='-Iyour-argtable2-include-path

# 解决方法：安装argtable2后，使用如下命令（localPath是argtable2的安装路径）
$ ./configure CFLAGS='-I/localPath/argtable2-13/src' LDFLAGS="-L/localPath/argtable2-13/src/.libs -largtable2"'
```

详见：[clustalo官方安装手册](http://www.clustal.org/omega/INSTALL)

#### 安装argtable2

**安装示例：**

```bash
# 下载源代码
$ wget http://prdownloads.sourceforge.net/argtable/argtable2-13.tar.gz

# 解压
$ tar -xvf argtable2-13.tar.gz

# 进入目录
$ cd argtable2-13

# 配置
$ ./configure

# 编译
$ make

# 安装
$ make install

# 环境变量设置，修改启动配置文件
$ vim ~/.bashrc
# 将以下内容添加到.bashrc文件中，localPath是argtable2的安装路径
export PATH=/localPath/argtable2-13:$PATH
export PATH=/localPath/argtable2-13/src:$PATH
export LD_LIBRARY_PATH=//localPath/argtable2-13/src:$LD_LIBRARY_PATH
# 更新启动配置文件
$ source ~/.bashrc
```

详见：[argtable2](https://github.com/jonathanmarvens/argtable2)

### 使用

```text
# 最基础的使用方法
$ clustalo -i my-in-seqs.fa -o my-out-seqs.fa

# 详细使用方法
$ clustalo --help
```

### 参考内容

1. Sievers, Fabian et al. “Fast, scalable generation of high-quality protein multiple sequence alignments using Clustal Omega.” Molecular systems biology vol. 7 539. 11 Oct. 2011, doi:10.1038/msb.2011.75
1. Sievers, Fabian, and Desmond G Higgins. “Clustal Omega for making accurate alignments of many protein sequences.” Protein science : a publication of the Protein Society vol. 27,1 (2018): 135-145. doi:10.1002/pro.3290
1. [clustalo的安装](https://www.cnblogs.com/wh-ff-ly520/p/10281711.html)
1. [Clustal Omega Help and Documentation](https://www.ebi.ac.uk/seqdb/confluence/display/JDSAT/Clustal+Omega+Help+and+Documentation)

## T-Coffee {#tcoffee}

### 安装（Unix系统下）

#### 安装T-Coffee

**安装示例：**

```bash
# 从以下网址下载与您的系统相对应的安装程序包：
  http://tcoffee.org/Packages/Stable/Latest/

# 授予可执行权限：
$ chmod +x T-COFFEE_install_"version_x".bin

# 运行
$ ./T-COFFEE_installer_"version_x".bin

# 按照向导说明完成安装

# 打开一个新的终端会话以确保您的环境已更新

# 验证是否安装成功
$ t_coffee -version

```

详见：[T-Coffee官方手册](https://tcoffee.readthedocs.io/en/latest/tcoffee_installation.html)

### 使用

```text
# 最基础的使用方法
$ t_coffee sample_seq.fasta

# 运行M-Coffee
$ t_coffee sample_seq.fasta -mode mcoffee
```

### 参考内容

1. Notredame, Cédric, Desmond G. Higgins, and Jaap Heringa. "T-Coffee: A novel method for fast and accurate multiple sequence alignment." Journal of molecular biology 302.1 (2000): 205-217.
1. Wallace, Iain M., et al. "M-Coffee: combining multiple sequence alignment methods with T-Coffee." Nucleic acids research 34.6 (2006): 1692-1699.
1. [T-Coffee and related packages documentation](https://tcoffee.readthedocs.io/en/latest/)

## 基因组比对工具安装提示 {#installation}

[**unialigner**](https://www.nature.com/articles/s41592-023-01970-4)是针对超长串联重复区域的序列比对方法，github代码在[此页面](https://github.com/seryrzu/unialigner)。

Readme部分对于安装并不友好。在make时候，对cmake和gcc版本有着严格要求，cmake>=3.15，gcc>=9.4，具体内容见详情页面。

## [Cactus的安装和简单使用](cactus.md)

[Cactus](https://www.nature.com/articles/s41586-020-2871-y)是发表在Nature正刊上的一款多基因组比对软件，能够完成多个物种的基因组比对。其代码可在[Github页面](https://github.com/ComparativeGenomicsToolkit/cactus)找到。

其安装和简单使用比较参考具体详情页面。
