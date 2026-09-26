---
title: 双序列比对
order: 2
---

# 双序列比对

双序列比对的基本算法主要有**动态规划**、**后缀树**和**傅里叶变换算法**等。此外还有profile比对。

## 动态规划

动态规划法是先设置打分机制，根据打分机制建立动态规划函数。  

::: tip 打分机制
- 字符匹配 : \+m
- 字符不匹配 : -mis
- 字符缺失（-）: -g

:::

**动态规划函数**

$$
a[i,j] = max 
\begin{cases}
a[i,j-1]-g          &\text{if  j>0 and i >= 0}\\
a[i-1,j]-g          &\text{if  j>=0 and i > 0}\\
a[i-1,j-1]+p(i,j)   &\text{if  j>0 and i > 0}
\end{cases}
$$

$$
p(i,j) = 
\begin{cases}
+m  &\text{if  s[i]==t[j]} \\
-mis &\text{if  s[i]$\neq$t[j]}
\end{cases}
$$

[Python](https://nbviewer.jupyter.org/github/malabz/Jtmsa/blob/master/DynamicProgramming.ipynb)

## 分治法-线性空间改进算法

典型的时间换空间算法，对于长序列而言，电脑内存不够，可以采用此算法。

::: tip 算法思路
选取序列s的中间位点i , 那么在双序列比对中s_i的对应只会有两种可能：
1. si与tj对齐
1. si与-对齐

注：j 值是遍历1..n取得分最高的值，通过不断分治，最后得到比对的结果

:::

[Python](https://nbviewer.jupyter.org/github/malabz/Jtmsa/blob/master/DivideConquer.ipynb)

## kband算法

如果我们比对的是两个相似的序列，那我们可以采用k-band算法对其时间复杂度进行改进。

::: tip 算法思路
可知两个相似的序列得到的最佳比对，其回溯路径一般在主对角线附近。那么就不需要对整个矩阵进行填充和计算，只需要对主对角线附近的区域进行计算，这个区域便称为kband。

kband算法的时间和空间复杂度降为O(kn)。

:::

[Python](https://nbviewer.jupyter.org/github/malabz/Jtmsa/blob/master/AffineGap_Kband_DP.ipynb)

## 仿射罚分

仿射罚分是对之间的打分机制进行了改进。因为在实际情况中，更倾向于连续的缺失对齐，而不是非常离散的缺失。所以将缺失对齐的首个gap分配更高的罚分，对后续连续的gap予以较低的罚分。

下图给出了一个例子，左边和右边的匹配按照之前的打分机制来看，所得到的score应该是一致的。但是实际上左边更符合实际的情况，因此引入了仿射罚分的机制，来尽可能的避免出现像右边的情况。

![双序列比对示意图](/images/psa-1.png)

仿射罚分还是利用动态规划的思想来解决，但是需要用到多状态转换，因为需要根据对齐过程中不同的状态进行打分。不难分析，在对齐的过程中一共有三个状态。那么便建立三个打分矩阵，对矩阵同时进行遍历求解，最后得到三个终值，其中最大的值，便为最佳对齐的score。	

::: tip 新打分机制
- match 匹配 +m
- mismatch 不匹配 -mis
- gap 缺失匹配首个 -ogap
- gap 缺失匹配非首个 -egap

:::

**三个状态表**
1. a：s&#91;i&#93; ~ t&#91;j&#93;  即序列s字符对齐序列t字符
1. b：\'—\'~ t&#91;j&#93;  即序列s字符对齐gap，表示序列t中缺失
1. c：s&#91;i&#93;~\'\—\'  即gap对齐序列t字符，表示序列s中缺失

**初始化转态表**

```text
a[0,0] = 0
b[0,j] = -ogap-egap(j-1)
c[i,0] = -ogap-egap(i-1)
others = -inf
```

**动态规划函数**

$$
a[i,j] = p[i,j] + max \begin{cases} 
a[i-1,j-1]\\
b[i-1,j-1]\\
c[i-1,j-1]
\end{cases}
$$

$$
b[i,j] = max 
\begin{cases} 
a[i,j-1]-ogap\\
b[i,j-1]-egap
\end{cases}
$$

$$
c[i,j] = max 
\begin{cases} 
a[i-1,j]-ogap\\
c[i-1,j]-egap
\end{cases}
$$

[Python](https://github.com/Guuhua/PSA/blob/main/python/PSA_Kband.py) [Java](https://github.com/Guuhua/PSA/blob/main/java/Kband.java) [C](https://github.com/Guuhua/PSA/blob/main/c/PSA_kband.c)

### 分治法-线性空间改进仿射罚分算法

在简单双序列比对算法的基础上，需要设计分治及最优点生成策略。

::: tip 算法思路简介
选取序列s的中间位点i, 求解序列t的中间位点j：
1. s&#91;i&#93;与t&#91;j&#93;对齐
1. s&#91;i&#93;和s&#91;i+1&#93;和与-对齐

注：j 值是遍历1..n取得分最高的值，通过不断分治，最后得到比对的结果；另外，需要对分治参数传递和边界条件进行进一步考虑

:::

前人实现了基于四俄国人思想的双序列比对算法模块：

Ref: Wei, Y., Zhou, T., Zhai, Y., Yu, L., & Zou, Q. (2025). FORAlign: accelerating gap-affine DNA pairwise sequence alignment using FOR-blocks based on Four Russians approach with linear space complexity. Briefings in Bioinformatics, 26(1), bbaf061.

[实现代码](https://github.com/malabz/FORAlign)
[使用方法](https://github.com/malabz/FORAlign?tab=readme-ov-file#for-development)

## 基于同源区段对齐的双序列比对

基于同源区段对齐的比对是先将一条序列进行快速索引，通过快速索引可快速遍历得到两条序列之间的同源区段。选出合适的同源区段，并将其对齐，剩下未对齐的序列采用动态规划的方法对齐，最后将所有对齐的片段拼接起来，得到最终结果。

### 索引方式

目前常见的索引方式有两种：
- 后缀树：索引实现 [java](https://github.com/Guuhua/SuffixTree/blob/main/suffixTree.java) [python](https://github.com/Guuhua/SuffixTree/blob/main/suffixTree.py) 
- FM-index：索引实现 [C](https://github.com/Guuhua/FM-index)

### 比对实现

- 基于后缀树的比对 [Python](https://github.com/Guuhua/PSA/blob/main/python/PSA_STree.py) [Java](https://github.com/Guuhua/PSA/blob/main/java/STAlign.java)
- 基于FM-index的比对 [Java](https://github.com/Guuhua/PSA/blob/main/java/FMAlign.java) [C](https://github.com/Guuhua/PSA/blob/main/c/PSA_fmindex.c)

## profile比对

## 比对实现

- [Java](https://github.com/Guuhua/profileAlignment)
