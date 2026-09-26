---
title: 序列比对知识库
layout: home
hero:
  name: 序列比对知识库
  text: 从算法原理，到科研实践
  tagline: 汇集双序列、多序列与基因组比对的知识、数据和工具。由课题组共同整理，持续积累。
  actions:
    - theme: brand
      text: 开始阅读
      link: /basics/pairwise.html
    - theme: alt
      text: 查找数据集
      link: /data/datasets.html
    - theme: alt
      text: 参与贡献
      link: /development/contributing.html
features:
  - title: 比对基础
    details: 双序列、多序列和基因组比对，从动态规划到偏序图与泛基因组。
    link: /basics/pairwise.html
  - title: 重比对
    details: 按分割方式梳理独立工具与 MSA 工具中的迭代优化方法。
    link: /realignment/overview.html
  - title: 数据与评测
    details: 查找真实与模拟数据、评价指标，以及可复用的数据生成流程。
    link: /data/datasets.html
  - title: 软件指南
    details: 课题组软件与第三方工具的安装、使用方法和实践经验。
    link: /software/lab.html
  - title: 开发工具
    details: 常用数据处理脚本、后缀索引库和基因组序列访问模块。
    link: /development/libraries.html
  - title: 论文成果
    details: 按研究方向整理课题组论文，连接方法、软件与参考资料。
    link: /publications/papers.html
---

## 序列比对连接了什么？

序列比对是将两个或多个序列排列在一起，标明其相似之处。序列中可以插入间隔（通常用短横线“-”表示）。对应的相同或相似的符号（在核酸中是A, T（或U）, C, G，在蛋白质中是氨基酸残基的单字母表示）排列在同一列上。这一方法常用于研究由共同祖先进化而来的序列，特别是如蛋白质序列或DNA序列等生物序列。在比对中，错配与突变相应，而空位与插入或缺失对应。序列比对还可用于语言进化或文本间相似性之类的研究。

## 多基因组数据资源

[MGA-Dataset](https://github.com/malabz/MGA-Dataset) 持续整理多基因组比对与泛基因组研究的数据集说明、官方来源和下载入口。原始数据由各发布方提供，仓库提供分类导航与使用说明。

## 一起完善知识库

发现新的工具、数据或使用经验时，可以直接补充 Markdown 文档。查看[贡献指南](./development/contributing.md)，了解如何预览页面和提交修改。
