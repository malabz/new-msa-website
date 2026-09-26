---
title: 序列比对知识库
layout: doc
pageClass: academic-home
sidebar: false
aside: false
outline: false
prev: false
next: false
---

# 序列比对知识库

序列比对是将两个或多个序列排列在一起，标明其相似之处。序列中可以插入间隔（通常用短横线“-”表示）。对应的相同或相似的符号（在核酸中是A, T（或U）, C, G，在蛋白质中是氨基酸残基的单字母表示）排列在同一列上。这一方法常用于研究由共同祖先进化而来的序列，特别是如蛋白质序列或DNA序列等生物序列。在比对中，错配与突变相应，而空位与插入或缺失对应。序列比对还可用于语言进化或文本间相似性之类的研究。

## 比对基础

序列比对的基本问题、算法与评价方法。

- [双序列比对](./basics/pairwise.md)
- [多序列比对](./basics/multiple.md)
- [基因组比对](./basics/genome.md)
- [评价指标](./basics/metrics.md)

## 重比对

按分割方式整理独立重比对工具和 MSA 工具中的迭代优化方法。

- [重比对概述](./realignment/overview.md)
- [独立重比对工具](./realignment/standalone.md)
- [MSA 工具中的重比对](./realignment/in-msa.md)

## 数据与评测

真实与模拟数据集，以及可复用的数据生成流程。

- [数据集目录](./data/datasets.md)
- [模拟数据生成](./data/simulation.md)

## 软件指南

课题组软件及第三方工具的安装、使用方法与实践经验。

- [课题组软件](./software/lab.md)
- [第三方比对工具](./software/third-party.md)
- [Cactus 安装与使用](./software/cactus.md)
- [Unialigner 安装指南](./software/unialigner.md)

## 开发工具

常用数据处理脚本、索引库和序列处理模块。

- [数据处理脚本](./development/scripts.md)
- [开发库](./development/libraries.md)

## 论文成果

按研究方向整理的课题组论文及相关软件。

- [论文列表](./publications/papers.md)

## 多基因组数据资源

[MGA-Dataset](https://github.com/malabz/MGA-Dataset) 持续整理多基因组比对与泛基因组研究的数据集说明、官方来源和下载入口。原始数据由各发布方提供，仓库提供分类导航与使用说明。
