---
title: 开发库
order: 16
---

# 开发库

## [kilb](https://github.com/malabz/klib) 

klib是一个轻量级的 C 语言库，包含常用的数据结构和算法。大多数组件不依赖外部库，并且彼此独立。要使用该库的组件，只需将几个文件复制到您的源代码树中，无需担心库依赖性。Klib 在生物信息学中被广泛应用，例如 minimap2 使用了部分库作为其基础数据结构。

Klib 追求高效和小内存占用。在速度和内存使用方面，一些组件（如哈希表、B 树、向量和排序算法）是所有编程语言中类似算法或数据结构中最有效的实现之一。

与 C++ 的标准库（std）相比，Klib 运行速度更快，占用内存更少。但是，由于 Klib 主要由 C 语言的宏实现，调试难度较大，并且需要手动管理内存，因此请根据实际情况使用。

### 用法：

[klib文件夹](https://github.com/metaphysicser/klib/tree/main/klib)存放修改后的klib代码，[docs文件夹](https://github.com/metaphysicser/klib/tree/main/docs)存放常用头文件的教程，如kvec.h, kseq.h, kthread.h等。

## Sufkit 后缀索引库

### 简介：

Sufkit 是一个面向基因组序列的 C++17 后缀索引库和命令行工具，集成了后缀数组、压缩后缀数组（FM-index）以及多种精确匹配算法，可用于基因组索引构建、模式搜索以及 MEM 等匹配片段的查找。

Sufkit 对常用的后缀索引相关算法进行了统一封装，同时支持普通程序调用和 CMake 库集成，适合用于序列比对、基因组搜索以及相关算法的开发和实验。

特点:

1. 支持 divsufsort 和 CaPS-SA 两种后缀数组构造方式，其中 CaPS-SA 支持共享内存并行构建，并提供 32 位和 64 位版本

2. 支持基于 SDSL 的 Huffman、balanced 和 DNA EPR 等多种压缩后缀数组（FM-index）实现，可根据索引大小和查询速度选择不同的数据结构

3. 支持 exact count、locate 等精确模式匹配，并提供 ISA、LCP、CHILD、suffix-link 等结构辅助的匹配算法

4. 支持 MEM（Maximal Exact Match）和 reference-MAM 等极大精确匹配搜索，可用于序列比对和同源区域查找等任务

5. 支持 FASTA/FASTA.gz、多 contig、正向和反向互补序列查询，并可以将构建完成的索引保存为带版本和 CRC 校验的 `.sufidx` 文件

### 项目地址

[项目路径](https://github.com/malabz/sufkit)

## SeqPro FASTA 随机访问库

### 简介：

SeqPro 是一个使用 C++17 开发的 FASTA 索引随机访问库，主要用于快速访问大型未压缩 FASTA 文件中的指定序列或区间。SeqPro 使用标准 FAI 索引记录序列位置，并通过 mmap 将 FASTA 文件映射到虚拟内存，因此无需将完整基因组序列加载到内存中。

对于大型参考基因组，SeqPro 打开已有索引时的内存开销主要与 FASTA 中的序列记录数量和名称长度有关，而不是与基因组总碱基数直接相关。因此，该库适合需要频繁随机读取大型参考序列的生物信息学程序。

特点:

1. 支持创建和读取与 Samtools/HTSlib 兼容的标准五列 FAI 索引，可以直接使用已有的合法 FAI 文件

2. 使用只读 mmap 访问 FASTA 文件，支持单碱基、子序列以及大区间的按需读取，避免将完整序列复制到堆内存中

3. 支持直接获取指向 mmap 数据的连续 sequence chunk，可减少大规模序列读取过程中的额外内存复制

4. 提供独立的 SequenceTextLayout 可选组件，可以将多个序列或指定区间组织为适合后缀数组和 FM-index 构建的输入文本，并提供相应的坐标转换功能

5. 索引打开后的主要查询对象为只读结构，支持无锁并发查询，适合作为大型基因组分析和索引算法的底层序列访问模块

### 项目地址

[项目路径](https://github.com/malabz/seqpro)

## 基于四俄国人思想的双序列比对算法模块

### 简介：

基于四俄国人思想的双序列比对算法是一种并行求解双序列比对的算法，对[分治法-线性空间改进算法](../basics/pairwise.md)进行进一步的并行化，减少了计算量。

该库不仅可以直接通过程序调用，也可以通过库进行调用。

建议在序列相似度较低时使用。

### 用法：

参考 [usage](https://github.com/malabz/FORAlign?tab=readme-ov-file#for-development)

### 项目地址：

[项目路径](https://github.com/malabz/FORAlign)

### 文献引用：

Wei, Y., Zhou, T., Zhai, Y., Yu, L., & Zou, Q. (2025). FORAlign: accelerating gap-affine DNA pairwise sequence alignment using FOR-blocks based on Four Russians approach with linear space complexity. Briefings in Bioinformatics, 26(1), bbaf061.
