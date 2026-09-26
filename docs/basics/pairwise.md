---
title: 双序列比对
order: 2
---

# 双序列比对

双序列比对（pairwise sequence alignment）要回答一个具体问题：给定两条 DNA、RNA 或蛋白质序列，哪些位置应当相互对应？算法允许在序列中插入空位（gap，记作 `-`），但不改变原有字符的顺序，再根据预先定义的打分规则寻找得分最高的排列。

本文面向有编程基础的初学者。先理解全局比对的动态规划，再学习仿射空位罚分、空间优化与带状计算，最后了解索引和 profile 如何扩展这一思路。文中的“最优”均指**在指定打分规则与允许的比对范围内最优**，不等于已经还原真实的进化历史。

## 问题定义与基本概念

例如，将 `ACG` 与 `AG` 排列为：

<!-- example: linear -->
```text
S  ACG
T  A-G
```

两行长度相同，每一列表示一次对应关系。第一列和第三列是字符匹配，中间一列是字符与空位对齐；若一列的两个字符不同，则称为错配。删除空位后，必须能恢复原始输入。不允许出现两行都是空位的列。

空位是比对表示中的符号。把它解释为哪条谱系上的插入或缺失，需要参考方向与额外的生物学证据，不能只根据这一列作判断。

### 全局、局部与半全局比对

| 类型 | 要解决的问题 | 边界与结果范围 |
| --- | --- | --- |
| 全局比对 | 两条序列从头到尾如何对应？ | 消耗两条完整序列；本文默认包括末端空位在内的所有空位都计罚分 |
| 局部比对 | 哪两个连续片段的对应得分最高？ | 允许在内部重新开始，在得分最高的位置结束 |
| 半全局比对 | 如何比较有重叠或包含关系的序列，而不过度惩罚外侧未覆盖部分？ | 预先指定哪些序列的哪些末端免罚；不存在适用于所有任务的唯一边界设置 |

全局比对的经典方法是 Needleman–Wunsch；局部比对的经典方法是 Smith–Waterman。在线性空位罚分下，局部比对可在递推候选值中加入 $0$，将首行、首列置为 $0$，从矩阵最大值回溯至 $0$。半全局比对则按任务调整初始化和允许的终止位置，不能只把所有空位罚分都设为零。[Needleman–Wunsch 原始论文](https://web.stanford.edu/class/sbio228/public/readings/Bioinformatics_I_Lecture6/Needleman_Wunsch_JMB_70_Global_alignment.pdf)、[Smith–Waterman 原始论文](https://doi.org/10.1016/0022-2836(81)90087-5)、[末端罚分的实现说明](https://biopython.org/docs/latest/Tutorial/chapter_pairwise.html#affine-gap-scores)。

## 打分模型与动态规划 {#动态规划}

### 统一符号与打分规则

记两条序列为 $S=s_1\cdots s_m$ 和 $T=t_1\cdots t_n$，长度分别为 $m$、$n$。下标 $i$、$j$ 表示已经消耗的字符数，因此 $i=0$ 或 $j=0$ 对应空前缀；它们不是程序中直接访问字符串的下标。

教学示例采用简单的 DNA 打分：匹配奖励 $r>0$，错配罚分 $q>0$，每个空位罚分 $g>0$。字符替换得分为：

$$
\sigma(s_i,t_j)=
\begin{cases}
r, & s_i=t_j,\\
-q, & s_i\ne t_j.
\end{cases}
$$

完整比对的得分等于所有匹配、错配和空位得分之和。长度为 $\ell$ 的连续空位扣除 $\ell g$，称为**线性空位罚分**。蛋白质比对通常使用替换矩阵区分不同氨基酸配对，而不是把所有错配都赋予相同分数；递推框架仍可使用替换得分 $\sigma$。[替换得分的实现说明](https://biopython.org/docs/latest/Tutorial/chapter_pairwise.html#substitution-scores)。

### 初始化、递推与终止

定义 $F_{i,j}$ 为前缀 $s_1\cdots s_i$ 与 $t_1\cdots t_j$ 的最优全局比对得分。先处理边界：

$$
F_{0,0}=0,\qquad
F_{i,0}=-ig\ (1\le i\le m),\qquad
F_{0,j}=-jg\ (1\le j\le n).
$$

一条非空前缀与空序列比对时，只能把每个字符与空位对齐，因此边界得分随长度递减。对于 $i\ge1$、$j\ge1$：

$$
F_{i,j}=\max
\begin{cases}
F_{i-1,j-1}+\sigma(s_i,t_j), & \text{字符与字符对齐},\\
F_{i-1,j}-g, & \text{字符 }s_i\text{ 与空位对齐},\\
F_{i,j-1}-g, & \text{空位与字符 }t_j\text{ 对齐}.
\end{cases}
$$

这三个候选覆盖了最后一列的所有可能情况。按行或按列计算，只要先计算依赖的单元即可。最终的最优得分是右下角 $F_{m,n}$，不是整个矩阵的最大值。

### 一个可以手算的例子

继续使用 `ACG` 与 `AG`，取 $r=2$、$q=1$、$g=2$。矩阵的行对应 $S$，列对应 $T$：

<!-- example: linear-matrix -->
| $S\backslash T$ | 空前缀 | A | G |
| --- | ---: | ---: | ---: |
| 空前缀 | 0 | -2 | -4 |
| A | -2 | 2 | 0 |
| C | -4 | 0 | 1 |
| G | -6 | -2 | 2 |

例如，$F_{2,2}=\max(2-1,\ 0-2,\ 0-2)=1$。右下角的得分为 $2$，与开头所示排列的 $2-2+2=2$ 一致。

### 从得分恢复比对结果

得分矩阵并不是最终的两行比对。还需要从 $(m,n)$ 沿着产生当前得分的前驱反向移动：

- 向左上走：输出 $s_i$ 与 $t_j$。
- 向上走：输出 $s_i$ 与空位。
- 向左走：输出空位与 $t_j$。

到达 $(0,0)$ 后，将两行输出分别反转。上例可以沿 $(3,2)\to(2,1)\to(1,1)\to(0,0)$ 回溯，得到 `ACG` / `A-G`。多个前驱得分相同时，可能存在多个最优比对；固定择优顺序可以让教学实现的输出可重复，但不代表其他并列结果错误。

常规实现需要 $O(mn)$ 时间和 $O(mn)$ 矩阵空间。若只要分数，可以用滚动行将 DP 工作空间降至 $O(\min(m,n))$；若还要输出路径，不能直接丢掉所有历史信息而不设计恢复策略。[线性空间与路径恢复的讨论](https://www.cs.ucf.edu/courses/cap5510/fall2009/SeqAlign/Linear_Space_Alignment.pdf)。

教学实现：[Python 动态规划笔记](https://nbviewer.jupyter.org/github/malabz/Jtmsa/blob/master/DynamicProgramming.ipynb)。

## 仿射空位罚分 {#仿射罚分}

### 为什么区分开启与延伸

线性罚分只统计空位总长度，不能区分一个长空位段和多个短空位段。仿射空位罚分为开启一段空位设置罚分 $g_o$，为同一段后续的每个空位设置罚分 $g_e$。本文约定 $g_o\ge g_e>0$，长度 $\ell\ge1$ 的空位段扣除：

$$
G(\ell)=g_o+(\ell-1)g_e.
$$

当 $g_o>g_e$ 时，在其他列的得分相同、空位总长度相同的情况下，较少的空位段得到较轻的惩罚。这可以表达对连续插入或缺失的建模偏好，但不能据此断言某一种排列一定符合真实历史。有的软件使用 $o+\ell e$ 的约定；比较参数前应先换算，本文的 $g_o$ 对应后一约定中的 $o+e$。[罚分约定说明](https://biopython.org/docs/latest/Tutorial/chapter_pairwise.html#affine-gap-scores)。

![旧站保留的七条序列的两种比对排列，左侧空位较集中，右侧部分空位被分开](/images/psa-1.png)

图 1：旧站示意图实际包含七条序列，用于直观比较空位集中与分散的排列。它不是一个完整定义了评分规则的双序列算例，因此不直接据图判定两侧总分相等或哪侧为真实比对。[原图来源](https://cdn.jsdelivr.net/gh/Guuhua/PicBed@master/imgdllwin10/20201217144946.png)。

下面改用可手算的双序列例子。两种排列的输入都是 `AAAAA` 与 `AAA`，均含三个匹配和两个空位：

<!-- example: affine-grouped -->
```text
S  AAAAA
T  AAA--
```

<!-- example: affine-split -->
```text
S  AAAAA
T  A-A-A
```

取 $r=2$、$q=1$、$g_o=3$、$g_e=1$。第一种排列只有一段长度为 2 的空位，得分 $6-(3+1)=2$；第二种有两段长度为 1 的空位，得分 $6-3-3=0$。差别来自空位段数，而不是字符匹配数。

### 三个状态分别表示什么

为了知道下一个空位是“开启”还是“延伸”，分别保存以下最优得分：

| 状态 | 前缀比对的最后一列 | 本步消耗的字符 |
| --- | --- | --- |
| $M_{i,j}$ | $s_i$ 与 $t_j$ | 两条序列各一个 |
| $X_{i,j}$ | $s_i$ 与空位，即 $T$ 中有空位 | 仅 $S$ 一个 |
| $Y_{i,j}$ | 空位与 $t_j$，即 $S$ 中有空位 | 仅 $T$ 一个 |

多状态动态规划是处理仿射罚分的经典思路，见 [Gotoh（1982）](https://doi.org/10.1016/0022-2836(82)90398-9)。下面给出本文采用的明确状态约定；边界与路径恢复参考 [Myers–Miller（1988）的完整描述](https://www.cs.ucf.edu/courses/cap5510/fall2009/SeqAlign/Linear_Space_Alignment.pdf)，不是直接照搬旧稿的矩阵命名。

### 初始化与递推

把不可能的状态设为 $-\infty$，而不是设为 $0$。用 $M_{0,0}=0$ 作为起点，其余边界为：

$$
\begin{aligned}
X_{i,0}&=-g_o-(i-1)g_e &&(1\le i\le m),\\
Y_{0,j}&=-g_o-(j-1)g_e &&(1\le j\le n).
\end{aligned}
$$

除上述值外，首行与首列的所有 $M$、$X$、$Y$ 值都为 $-\infty$，包括 $X_{0,0}$ 与 $Y_{0,0}$。对于 $i\ge1$、$j\ge1$：

$$
M_{i,j}=\sigma(s_i,t_j)+\max\{M_{i-1,j-1},X_{i-1,j-1},Y_{i-1,j-1}\}.
$$

$$
X_{i,j}=\max
\begin{cases}
M_{i-1,j}-g_o, & \text{开启 }T\text{ 中的空位},\\
X_{i-1,j}-g_e, & \text{延伸 }T\text{ 中的空位},\\
Y_{i-1,j}-g_o, & \text{换方向并开启新的空位}.
\end{cases}
$$

$$
Y_{i,j}=\max
\begin{cases}
M_{i,j-1}-g_o, & \text{开启 }S\text{ 中的空位},\\
Y_{i,j-1}-g_e, & \text{延伸 }S\text{ 中的空位},\\
X_{i,j-1}-g_o, & \text{换方向并开启新的空位}.
\end{cases}
$$

这里允许相邻的两列从一个方向的空位切换到另一个方向，因此 $X$、$Y$ 间也有转移，切换时重新支付开启罚分。若某个实现明确禁止这种排列，应删除这两项；这属于不同的允许路径约定，尤其在错配罚分很高时可能改变最优值。不要把不同状态定义或路径约定的公式混在一起。

全局比对的最优得分为 $\max\{M_{m,n},X_{m,n},Y_{m,n}\}$。回溯时除坐标外，还要记录当前状态和前驱状态。三个矩阵只增加常数因子，完整计算仍需 $O(mn)$ 时间；保存全部矩阵和回溯信息需 $O(mn)$ 空间。

教学实现：[Python](https://github.com/Guuhua/PSA/blob/main/python/PSA_Kband.py)、[Java](https://github.com/Guuhua/PSA/blob/main/java/Kband.java)、[C](https://github.com/Guuhua/PSA/blob/main/c/PSA_kband.c)。这些旧实现还包含带状计算；使用前应检查各自的边界、罚分和状态约定，不能默认与本文逐项相同。

## 计算与存储优化

### 带状动态规划 {#kband算法}

如果有理由预期比对路径靠近某条对角线，可以只计算一条带内的单元。例如，定义半带宽 $k\ge0$，只计算 $|i-j|\le k$ 的位置；带外状态视为不可达。

它省去了带外计算，但求得的是**带内允许路径的最优解**。只有至少一条完整矩阵的最优路径被包含在带内时，才能得到相同的全局最优得分。对于以上主对角线带，全局终点还要求 $|m-n|\le k$；长插入、长缺失或起点偏移都可能使窄带失效。逐步扩大带宽是一种补救方式，但连续两次得分相同本身不是最优性证明。[Gibrat（2018）](https://link.springer.com/article/10.1186/s12859-018-2228-9)。

设 $L=\max(m,n)$，每行最多计算 $2k+1$ 个单元，则带内时间和完整路径存储的上界可写为 $O(L(k+1))$，且不超过完整矩阵的量级。若只计算分数，滚动带只需 $O(k+1)$ DP 工作空间；扩带到覆盖全矩阵时，不再具有窄带的节省效果。线性罚分和仿射罚分均可使用这一限制计算区域的思路。

教学实现：[Python 带状仿射罚分笔记](https://nbviewer.jupyter.org/github/malabz/Jtmsa/blob/master/AffineGap_Kband_DP.ipynb)。

### 线性空间分治 {#分治法-线性空间改进算法}

当问题是“矩阵放不下，但仍需要完整比对结果”时，可以采用 Hirschberg 的分治思路。与带状方法不同，它不通过排除矩阵区域来缩小允许的路径集合。

在线性罚分下，取 $S$ 的分割位置 $h=\lfloor m/2\rfloor$。分别用滚动行计算：$L_j$ 为 $S$ 前 $h$ 个字符与 $T$ 前 $j$ 个字符的最优得分；$R_j$ 为剩余两个后缀的最优得分。选择：

$$
j^*\in\mathop{\mathrm{arg\,max}}_{0\le j\le n}(L_j+R_j).
$$

这里的 $j=0$ 和 $j=n$ 都必须纳入考虑。分割点表示“已经消耗多少个字符”，不是简单地寻找 $s_h$ 对应的一个字符。对前后两个子问题递归求解，直到空序列或足够小的子问题，再按顺序拼接结果。反向计算后缀分数时，要正确转换反向数组的下标。[Hirschberg 原始论文](https://ics.uci.edu/~dhirschb/pubs/p341-hirschberg.pdf)。

这一方法通过重新计算部分得分来恢复路径，时间仍为 $O(mn)$。滚动分数向量可沿较短序列存储；若复用缓冲区、传递区间而不复制子串，并计入递归管理与输出，整体可保持 $O(m+n)$ 线性空间。它的核心收益是降低存储需求，而不是保证运行得更快。

教学实现：[Python 线性空间分治笔记](https://nbviewer.jupyter.org/github/malabz/Jtmsa/blob/master/DivideConquer.ipynb)。

### 仿射罚分下的分治与 FORAlign {#分治法-线性空间改进仿射罚分算法}

仿射罚分下，一个空位段可能跨过分割位置。若直接把两侧当作两个独立问题，就可能对同一段空位重复扣除开启罚分。因此还需处理分割处的状态、空位是否延续以及子问题的边界条件。Myers–Miller 将线性空间分治用于仿射罚分比对；学习实现时，应连同状态传递一起阅读，而不只替换评分公式。[原始论文](https://www.cs.ucf.edu/courses/cap5510/fall2009/SeqAlign/Linear_Space_Alignment.pdf)。

课题组的 FORAlign 是进一步阅读这一方向的研究入口，结合 Four Russians 分块思想与线性空间比对。其接口使用罚分参数，不能直接照搬本文的正匹配奖励设置；具体约定以代码和接口说明为准。本页保留研究入口，不将论文报告的速度表现视为本页已经复现的结果。[FORAlign 仓库与开发说明](https://github.com/malabz/FORAlign?tab=readme-ov-file#for-development)。

Wei, Y., Zhou, T., Zhai, Y., Yu, L., & Zou, Q. (2025). *FORAlign: accelerating gap-affine DNA pairwise sequence alignment using FOR-blocks based on Four Russians approach with linear space complexity*. Briefings in Bioinformatics, 26(1), bbaf061。[实现代码](https://github.com/malabz/FORAlign)、[论文](https://doi.org/10.1093/bib/bbaf061)。

## 基于种子或锚点的比对 {#基于同源区段对齐的双序列比对}

对于较长序列，一种常用思路是先找到候选匹配片段，再对未覆盖区域进行更细致的计算：

1. 为一条序列建立索引，以便查找短匹配或其他种子。
2. 在另一条序列中查找候选匹配，过滤过于重复或不可靠的候选。
3. 按位置和方向选择相容的锚点，必要时将它们连接成链。
4. 对锚点之间的区域执行动态规划，对两端按任务需要延伸或处理。
5. 拼接并检查局部结果，输出最终比对或多个比对区段。

索引回答“候选匹配在哪里”，动态规划回答“给定区域如何按评分规则对齐”。两者可以组合，不能把后缀树、FM-index 与动态规划当成同一层次上互斥的算法类别。种子与锚点是计算候选，也不能直接等同于已证实的同源区段。若前期选择遗漏了正确区域，后续局部最优计算并不能自动补救。可参照 [minimap2 官方算法概述](https://github.com/lh3/minimap2#algorithm-overview) 理解种子、链和碱基级比对的分工；这里不展开其完整方法。

### 索引方式

旧站提供以下教学入口；它们不是所有索引结构的完整清单：

- 后缀树：[Java](https://github.com/Guuhua/SuffixTree/blob/main/suffixTree.java)、[Python](https://github.com/Guuhua/SuffixTree/blob/main/suffixTree.py)。
- FM-index：[C](https://github.com/Guuhua/FM-index)。

### 基于索引的比对实现 {#比对实现}

- 基于后缀树：[Python](https://github.com/Guuhua/PSA/blob/main/python/PSA_STree.py)、[Java](https://github.com/Guuhua/PSA/blob/main/java/STAlign.java)。
- 基于 FM-index：[Java](https://github.com/Guuhua/PSA/blob/main/java/FMAlign.java)、[C](https://github.com/Guuhua/PSA/blob/main/c/PSA_fmindex.c)。

## 从序列比对到 profile 比对 {#profile比对}

一组序列已经对齐后，可以按列汇总字符频率或位置相关的打分信息，形成 profile。它保留一组序列在各位置的变化信息，不等于简单地选出一条代表序列。例如：

<!-- example: profile -->
```text
S1  ACG
S2  ATG
S3  A-G
```

第二列同时包含 `C`、`T` 和空位；若只选一条序列代表这一列，就会丢失部分信息。实际 profile 的构建还可以涉及序列权重、替换得分和位置相关的空位处理，不能仅由这个频数例子推导出唯一的评分公式。[Gribskov 等的 profile 原始论文](https://doc.aporc.org/attach/Course001Papers/gribshovetal1987.pdf)。

- **序列–profile 比对**：将一条新序列与已有比对的各列比较，把新序列加入这一组。
- **profile–profile 比对**：比较两组已有比对的列，并将两组结果合并；在通常的渐进式合并中，对组内各行同步插入空位列，保留已有列的相对顺序。

动态规划中的“字符与字符得分”由此扩展为“字符与列”或“列与列”的得分，但评分和空位处理需要额外定义。具体工具还可能使用 profile HMM 等更丰富的表示，并非都采用同一公式。这个概念是理解[基于指导树的渐进式多序列比对](./multiple.md#树比对)的桥梁。

### Profile 教学实现 {#比对实现-1}

- [Java profile 比对实现](https://github.com/Guuhua/profileAlignment)。

## 实现与延伸阅读

建议先手算线性罚分的小矩阵，再阅读教学代码中的初始化与回溯，随后实现仿射罚分的状态转移。处理更长的序列时，再判断瓶颈是计算时间、矩阵存储还是候选区域搜索，不必一开始就把所有优化组合起来。

本页的短例用于解释与校验算法，不是软件性能评测。上述旧代码入口保留了原作者的实现，运行环境、输入限制与参数约定应在使用前单独检查；本文不承诺它们与这里的公式使用完全一致的路径约定。研究软件 FORAlign 的用法可继续查看[开发库栏目](../development/libraries.md)。

阅读后可以检查自己是否能回答：为什么全局比对取右下角而局部比对取矩阵最大值？为什么一个分数不足以恢复路径？什么时候可以信任窄带结果？一个空位段跨过分治点时，为什么不能重新收取开启罚分？
