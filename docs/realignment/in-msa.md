---
title: MSA 工具中的重比对
order: 8
---

# MSA 工具中的重比对

## 纵向分割方法 {#vertical}

### [1. OMA (2000)](https://academic.oup.com/bioinformatics/article/16/9/808/307658)

This tool cuts the sequences into small sub-sequences and implements alignment based on the divide-and-conquer algorithm.

Realignemnt will be performed in the area of W distance near the cutting point.
- [OMA's homepage](https://bibiserv.cebitec.uni-bielefeld.de/oma/)

### [2. FAMSA (2016)](https://www.nature.com/articles/srep33964)

**Vertical-oriented** refinement:
1. Scan the initial alignment randomly and pick a column containing at least a gap.
1. Split the initial alignment into two sub-alignments based on the column.
1. Remove the empty columns in each sub-alignment and realign them.
1. If the new alignment's accuracy is improved, the new one replaces the initial one.

Until a predefined maximum number of iterations is reached.
- This realignment or refinement is particularly beneficial for **smaller** sets of sequences.
- [The github of FAMSA](https://github.com/refresh-bio/FAMSA)

### [3. QuickProbs2 (2017)](https://www.nature.com/articles/srep41553)

Its vertical-oriented refinement idea is the same as FAMSA.

- [The github of QuickProbs](https://github.com/refresh-bio/QuickProbs)

## 横向分割方法 {#horizontal}

### [1. PRRP (1996)](https://www.sciencedirect.com/science/article/pii/S0022283696906798)

Its horizontal-oriented refinement idea is the similar as MUSCLE.
- [ftp.genome.ad.jp FTP]

### [2. MLAGAN (2002)](https://genome.cshlp.org/content/13/4/721.full)

The tool's realignment is optional, which is also single-type partitioning, following:
1. Find segments of sequence Xi that align better than a given cutoff, in the existing multiple alignment. These segments are the anchors between Xi and the other sequences.
1. Realign Xi to the multiple alignment of the other sequences with LAGAN.
- [MLAGAN's homepage](http://lagan.stanford.edu) 


- [LAGAN's homepage](http://lagan.stanford.edu)
### [3. MAFFT (2002)](https://link.springer.com/protocol/10.1007/978-1-62703-646-7_8)

Tree-dependent partitioning realignment

In one cycle of iterative refinement, all the branches in the guide tree are tried as partitioning points.
- [MAFFT's homepage](https://mafft.cbrc.jp/alignment/software/)

### [4. MUSCLE3 (2004)](https://academic.oup.com/nar/article/32/5/1792/2380623)

Tree-dependent partitioning realignment:
1. Randomly divide the alignment into two profiles based on an edge of TREE.
1. A new alignment is obtained by realigning the two profiles.
1. If the SP score is improved, the new alignment is kept.

Until convergence or until a user‐defined limit is reached.
- [MUSCLE's homepage](https://drive5.com/muscle/)

### [5. ProbCons (2004)](https://genome.cshlp.org/content/15/2/330.short)

Random partitioning realignment:
1. Randomly divide the alignment into two profiles. 
1. Realign the two profiles.

Until a predefined maximum number of iterations is reached.
- [ProbCons's homepage](http://probcons.stanford.edu)

### [6. PRIME (2006)](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-7-524)

Before the realignment, this tool calculate a distance matrix from the initial alignment, construct a phylogenetic tree from the distance matrix, calculate pair weights from the phylogenetic tree, then **iteratively realign** the alignment using the phylogenetic tree and the pair weights:

Tree-dependent partitioning realignment:
1. Divide the alignment into two groups based on a randomly chosen branch of the tree.
1. Realign the sequences in each subtree.
Get a new alignment until no better weighted SP score is obtained.

Repeat steps from the begining of calculate a distance matrix from the new alignment to iteratively realign until the weighted SP score of the alignment dose not improve anymore.
- [The source code link is unavailable.](http://prime.cbrc.jp/)

### [7. MANGO (2007)](https://www.worldscientific.com/doi/abs/10.1142/9781860948732_0026)

Single-type partitioning realignment:
1. Select one sequence.
1. Realign it with the others.

Until all sequences realign.
- [The source code link is unavailable.](http://www.bioinfo.org.cn/mango/)

### [8. COBALT (2007)](https://academic.oup.com/bioinformatics/article/23/9/1073/272774)

Tree-dependent partitioning realignment:
1. Partition the current initial alignment into two profiles separated by a edge (**Not its longest one**.)
1. Realign the two profiles.

For each edge, this repeats up to five times, or as long as the best score from the current iteration improves the best score from the previous iteration by at least 2%.
- (Optional) Perform refinement by determining a new set of constraints and iterative tree-dependent partitioning realignment.
- [FTP](ftp://ftp.ncbi.nlm.nih.gov/pub/agarwala/cobalt)


- [The source code link is unavailable.](ftp://ftp.ncbi.nlm.nih.gov/pub/agarwala/cobalt)
### [9. PRALINE™ (2008)](https://academic.oup.com/bioinformatics/article/24/4/492/207730)

Tree-dependent partitioning realignment:
1. Partition the current initial alignment into two profiles separated by each edge (one iterative cycle means that each edge of the tree is visited once.)
1. Realign the two profiles.
1. The new alignment is retained only if a higher SP score is achieved. 

Until a predefined maximum number of iterations is reached.
- [PRALINE's homepage](https://www.ibi.vu.nl/programs/pralinewww/) 

### [10. IPAM (2009)](https://ieeexplore.ieee.org/abstract/document/5223562)

Its horizontal-oriented refinement idea is the same as MUSCLE.

- The source code is not publicized.

### [11. MSAProbs (2010)](https://academic.oup.com/bioinformatics/article/26/16/1958/218540)

Random partitioning realignment:
1. Randomly divide the alignment into two profiles. (its own pseudo random number generator based on the linear congruential method for random partitioning)
1. Realign the two profiles.

Until a predefined maximum number of iterations is reached.
- [MSAProbs's homepage](https://msaprobs.sourceforge.net/homepage.htm#latest)

### [12. MSACompro (2011)](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-12-472#Sec2)

Random partitioning realignment:
1. Randomly divide the alignment into two profiles
1. Realign the two profiles.

Until a predefined maximum number of iterations is reached.
- [MSACompro's homepage](http://sysbio.rnet.missouri.edu/multicom_toolbox/)

### [13. PAAA (2011)](https://link.springer.com/chapter/10.1007/978-3-642-24855-9_26)

Tree-dependent partitioning realignment:
1. Construct a new guide tree utilizing a new distance matrix based on the MSA.
1. Remove an edge from the new guide tree to obtain two new subtrees.
1. Realign the sequences in each subtree.
1. Align the two profiles associated with the two subtrees to get a global MSA.

Until convergence.
- The source code is not publicized.


**Horizontal-oriented** refinement:
1. Construct a new guide tree utilizing a new distance matrix based on the MSA.
1. Remove an edge from the new guide tree to obtain two new subtrees.
1. Realign the sequences in each subtree.
1. Align the two profiles associated with the two subtrees to get a global MSA.
### [14. MMSA (2012)](https://link.springer.com/article/10.1186/1471-2105-13-64)

This tool implements three different horizontal partitioning methods to realign:
1. Random partitioning
1. Tree-dependent partitioning and each time randomly cut a edge of the guiding tree.
1. Tree-dependent partitioning and each edge of the tree is cut only once in the breath-first order.

- [The source code link is unavailable.](http://ekhidna.biocenter.helsinki.fi/MMSA)

### [15. GLProbs (2013)](https://dl.acm.org/doi/abs/10.1145/2506583.2506611)

Random partitioning realignment:
1. Randomly divide the alignment into two profiles
1. Realign the two profiles.

Until convergence or a predefined maximum number of iterations is reached.
- [GLProbs's source code](https://sourceforge.net/projects/glprobs/)

### [16. Javad Sadri's work (2013)](https://ieeexplore.ieee.org/abstract/document/6637352)

Tree-dependent partitioning realignment:
1. Randomly select an edge and cut it into two subtrees.
1. Realign the two profiles.
1. If the result is improved, the guide tree is changed. Otherwise, the previous guide tree is retained.

Until a predefined maximum number of iterations is reached.
- The source code is not publicized.

### [17. Motalign (2013)](https://ieeexplore.ieee.org/abstract/document/6621350)

Its horizontal-oriented refinement idea is the same as MUSCLE.
- The source code is not publicized.

### [18. QuickProbs (2014)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0088901)

Its horizontal-oriented refinement idea is the same as MSAProbs.

QuickProbs2 is the last version.
- [QuickProbs's github](https://github.com/refresh-bio/QuickProbs)

### [19. PnpProbs (2016)](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-016-1121-7)

Random partitioning realignment:
1. Randomly divide the alignment into two profiles
1. Realign the two profiles.

Until convergence or a predefined maximum number of iterations is reached.
- [PnpProbs's github](https://github.com/ytye/PnpProbs)

### [20. Pro-malign (2018)](http://www.jsoftware.us/vol13/312-T017.pdf)

Its realignment does not employ iterative methods.
1. Create two new families based on the distance matrix obtain from the initial alignment.
1. Realign the two families.
- The source code is not publicized.

## 其他方法与补充说明 {#additional}

旧资料中还列有以下方法；原文未提供详细说明的条目按名称保留。

- MULTALIGN (1987)

- Opal (2004)

- SIROA (2004)

- MSAID (2005)

- SPEM (2005)

- PRANK

- SplitVert (2020)
