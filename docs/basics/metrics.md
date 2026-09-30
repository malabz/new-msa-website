---
title: 评价指标
order: 5
---

# 评价指标

## SP score

Sum of pairs (SP) score: Scoring a alignment based on pairwise alignments.

### 计算公式

$$
SP\_score(\alpha)=\sum_{i<j} score(\alpha_{ij})
$$

计算方式分为两种（注：p(-,-)=0）:
- 对多序列对齐中的每一列得分进行计算，最后相加
- 对多序列对齐中的每一对PSA得分进行计算，最后相加

### 参考内容

课题组工具 [spscore](https://github.com/malabz/spscore) 可计算已完成核酸多序列比对的 SP 得分，支持 FASTA 和 gzip 输入。安装、评分约定和输出说明见[课题组软件中的 spscore 小节](../software/lab.md#spscore)。

1. Altschul, Stephen F. "Gap costs for multiple sequence alignment." Journal of theoretical biology 138.3 (1989): 297-309.
1. [SP 教学实现](https://github.com/malabz/MSATOOLS/tree/main/SPscore)

## Q score

Q (quality) score is the number of correctly aligned residue pairs divided by the number of residue pairs in the reference alignment. This has previously been termed the developer score and SPS.

### 计算公式

$Q = \frac{{\sum\nolimits_{k = 0}^L {q(k)} }}{{\sum\nolimits_{k = 0}^L {ref(k)} }}$

第k列：$q(k) = \frac{{tes{t_{match}} \times (tes{t_{match}} - 1)}}{2}$ , $ref(k) = \frac{{re{f_{match}} \times (re{f_{match}} - 1)}}{2}$

其中：
- $re{f_{match}}$是在ref文件的第𝑘列中大写碱基的个数
- $tes{t_{match}}$是在test文件的第𝑘列中可以和ref文件完全匹配的碱基个数（大写且相同）

### 参考内容

1. Edgar, Robert C. “MUSCLE: multiple sequence alignment with high accuracy and high throughput.” Nucleic acids research vol. 32,5 1792-7. 19 Mar. 2004, doi:10.1093/nar/gkh340
1. Sauder, J M et al. “Large-scale comparison of protein sequence alignment algorithms with structure alignments.” Proteins vol. 40,1 (2000): 6-22. doi:10.1002/(sici)1097-0134(20000701)40:1&lt;6::aid-prot30>3.0.co;2-7
1. Thompson, J D et al. “A comprehensive comparison of multiple sequence alignment programs.” Nucleic acids research vol. 27,13 (1999): 2682-90. doi:10.1093/nar/27.13.2682
1. [Q score源代码](https://www.drive5.com/qscore/)

## TC score

Total column(TC) score is the number of correctly aligned columns divided by the number of columns in the reference alignment; this is Thompson et al.’s CS and is equivalent to Q in the case of two sequences (as in PREFAB).

### 计算公式

$TC = \frac{{\sum\nolimits_{k = 0}^L {match(tes{t_k},ref)} }}{{re{f_{upper}}}}$

其中：
- $re{f_{upper}}$是ref文件中包含大写字母的列数
- ${match(tes{t_k},ref)}$是在test文件中完全匹配(大写且相同)的列数

### 参考内容

1. Edgar, Robert C. “MUSCLE: multiple sequence alignment with high accuracy and high throughput.” Nucleic acids research vol. 32,5 1792-7. 19 Mar. 2004, doi:10.1093/nar/gkh340
1. Thompson, J D et al. “A comprehensive comparison of multiple sequence alignment programs.” Nucleic acids research vol. 27,13 (1999): 2682-90. doi:10.1093/nar/27.13.2682
1. [TC score源代码](https://www.drive5.com/qscore/)
