---
title: 重比对概述
order: 6
---

# 重比对概述

The progressive method is employed in most multiple sequence alignment tools but based on the rule of “Once a gap, always a gap,” wrong insertions will remain in the output, impacting the accuracy of the final alignment.

**Realignment methods, sometimes also considered refinement methods, which choose sequences or blocks of existing alignments and realign in the hopes that the realigned result is more accurate.**

Both **the realigner** and the **post-processing of some MSA tools** utilize the realignment method, and here we summarize it by **partitioning**.
In addition, the realignment methods **often (do not always)** combine with iterative methods. **The five commonly iterative methods are:**
1. Round-robin(RR) iterative algorithm
1. Remove First(RF) iterative algorithm
1. Best First(BF) iterative algorithm
1. Random(RD) iterative algorithm
1. Tree-based(TB) iterative algorithm

## [Realigners based on vertical partitioning](standalone.md#vertical)

Summary of the realigners based on vertical partitioning.

There are tow restricted vertical partitioning (column-oriented partitioning):
1. Gap-based partitioning
1. Whole same column-based partitioning

## [Realigners based on horizontal partitioning](standalone.md#horizontal)

Summary of the realigners based on horizontal partitioning.

There are three restricted horizontal partitioning (row-oriented partitioning):
1. Single-type partitioning
1. Double-type partitioning
1. Tree-dependent partitioning

## [Realigners based on vertical and horizontal partitioning](standalone.md#combined)

Summary of the realigners based on vertical and horizontal partitioning.

## Realignment in MSA tools

Summary of the realignment post-processing in MSA tools.

### [Vertical-oriented realignment in MSA tools](in-msa.md#vertical)

### [Horizontal-oriented realignment in MSA tools](in-msa.md#horizontal)

1. Random partitioning (ProbCons / MSAProbs / MSACompro / GLProbs / QuickProbs / PnpProbs)
1. Single-type partitioning (MLAGAN / MANGO)
1. Tree-dependent partitioning (MUSCLE / MAFFT / PRIME / PRALINE / PAAA / Javad Sadri's work / Motalign)

## Reference

1. Gotoh, Osamu. "Optimal alignment between groups of sequences and its application to multiple sequence alignment." Bioinformatics 9.3 (1993): 361-370.
1. Hirosawa, Makoto, et al. "Comprehensive study on iterative algorithms of multiple sequence alignment." Bioinformatics 11.1 (1995): 13-18.
1. Wallace, Iain M., and Desmond G. Higgins. "Evaluation of iterative alignment algorithms for multiple alignment." Bioinformatics 21.8 (2005): 1408-1414.
1. Wakatsu, Daigo, and Takeo Okazaki. "Statistical Comparative Study of Multiple Sequence Alignment Scores of Iterative Refinement Algorithms." IPSJ Transactions on Bioinformatics 2 (2009): 74-82.
1. DeBlasio, Dan, and John Kececioglu. Parameter advising for multiple sequence alignment. Vol. 26. Springer, 2018.
