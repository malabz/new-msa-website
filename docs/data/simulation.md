---
title: 模拟数据生成
order: 10
---

# 模拟数据生成

IQTree是一款构建进化树的软件，INDELible是一款依据进化树生成模拟数据的软件，两者结合使用可以生成层次树模拟数据集。

## 使用示例

### IQTree生成碱基替换模型和进化树

注意：
1. IQTree需要运行两次，第一次生成替换模型，第二次生成进化树。
1. 生成替换模型时选用数据集的全部数据，生成进化树时选择的序列数量与模拟数据集中的序列数量相同。

例如：

人类线粒体真实数据集有642条，我们希望最终使用INDELible生成100条人类线粒体模拟数据。
1. 生成替换模型的数据集：642条（全部数据集）
1. 生成进化树的数据集：100条（全部数据集中随机挑选的100条）

**使用示例：**

```bash
# 1. 使用MAFFT等多序列比对软件将数据比对好（IQTree的输入数据是对齐好的序列）
# 生成碱基替换模型的数据集
$ mafft example_all.fas > example_all_aligned.fas
# 生成进化树的数据集
$ mafft example_100.fas > example_100_aligned.fas

# 2. 运行IQTree
# -s 输入数据， -B bootstrap次数， -m 测试模型， -T 并行数， --prefix 输出结果的前缀
# 不同版本的参数略有区别，具体使用方法查看./iqtree -h
# 生成碱基替换模型
$ ./iqtree -s PATH/example_all_aligned.fas -B 1000 -m TEST -T 20 --prefix example_model
# 生成进化树
$ ./iqtree -s PATH/example_100_aligned.fas -B 1000 -m TEST -T 20 --prefix example_tree

# 3. 查看example_model.iqtree文件确定碱基替换模型
# example_model.iqtree文件中的重要信息（模型和参数，这些需要输入到INDELible的control.txt中）：
# Model list: 确定碱基替换模型
# General matrix: 确定替换模型的参数（a b c d e f）
# Base frequencies: A: xxx  C: xxx  G: xxx  T: xxx
# Proportion of invariable sites: xxx
# Gamma shape alpha: xxx

# 4. 将example_tree.treefile文件中的冒号和冒号后的数字删除得到进化树
```

### 使用INDELible生成模拟数据集

最关键的是：修改control.txt文件

依据IQTree得到的碱基替换模型和进化树修改control.txt中的如下字段：
1. &#91;MODEL&#93; - &#91;submodel&#93;,&#91;statefreq&#93;,&#91;rates&#93; (分别是具体的替换模型和参数，碱基替换频率，pinv和alpha参数)
1. &#91;TREE&#93; - &#91;treelength&#93;（TREE后面是TREE的名字和IQTree得到的去掉冒号和数字的进化树，treelength控制生成数据的序列相似度，数字越小相似度越高，反之相似度越低）
1. &#91;PARTITIONS&#93; - &#91;TREE_name\ MODEL_name\ seq_length&#93; （用户自定义项，TREE_name是TREE的名字，MODEL_name是MODEL的名字，seq_length是模拟数据集中序列的平均长度）
1. &#91;EVOLVE&#93; - &#91;PARTITIONS_name\ replicate_num\ outputname&#93; （用户自定义项，PARTITIONS_name是PARTITIONS的名字，replicate_num是重复次数，outputname是输出模拟数据集的名称）

**control.txt示例：**

```bash
////////////////////////////////////////////////////////////////////////////////////
//                                                                                 //
//  INDELible V1.03 control file - basicnucleotide.txt                             //
//                                                                                 //
//      A basic introduction to the structure of the INDELible control file.       //
//                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////

// It is useful to know that anything on a line after two forward slashes is ignored.

/*
   Another useful thing to know is that anything after a forward slash and star
   is ignored until INDELible sees a star followed by a forward slash later on.
*/

[TYPE] NUCLEOTIDE 1 //  EVERY control file must begin with a [TYPE] command.
            //  The number after "NUCLEOTIDE" can be 1 or 2 and chooses the
            //  algorithm that INDELible uses (see manuscript). Both give
            //  identical results but in some cases one is quicker.
            //  Other blocks and commands following this statement
            //  can come in any order you like.

[SETTINGS]
  [ancestralprint]           FALSE     // NEW, SAME or FALSE
  [output]                   FASTA    // FASTA, NEXUS, PHYLIP or PHYLIPT
  [phylipextension]          phy       // any alpha-numeric string
  [nexusextension]           nex       // any alpha-numeric string
  [fastaextension]           fas       // any alpha-numeric string
  [printrates]               FALSE     // FALSE or TRUE
  [insertaslowercase]        FALSE      // FALSE or TRUE
  [markdeletedinsertions]    FALSE     // FALSE or TRUE
  [printcodonsasaminoacids]  FALSE     // FALSE or TRUE
  [fileperrep]               TRUE     // FALSE or TRUE

[MODEL]  TVM_mt
  [submodel]     TVM 0.01 0.01 0.04 0.04        //  TVM: b=0.01, c=0.01, d=0.04, e=0.04,a=f=1
  [statefreq]    0.25 0.31 0.31 0.13                //  pi_T=0.25, pi_C=0.31, pi_A=0.31, pi_G=0.13
  [rates]        0.84 1.03 4                      //  pinv=0.84, alpha=1.03, ngamcat=4
  [indelmodel]   LAV  5 50                      //  Lavalette indel length distribution (a=5, M=50)
  [insertrate]   0.01                           //  insertion rate = 0.01 relative to substitution rate of 1
  [deleterate]   0.1                            //  deletion rate = 0.1 relative to substitution rate of 1

[TREE] mt100 (sq001,(((((((sq002,(sq044,sq053)),((sq024,sq077),sq071)),(sq052,sq065)),((sq014,(sq040,sq066)),sq076)),((((((((((((sq003,sq034),sq028),((((sq008,(sq018,sq029)),(sq037,sq056)),(((sq022,sq033),sq050),sq080)),(sq055,sq099))),((((((sq016,sq081),sq085),sq084),(((sq026,sq059),sq035),(sq047,sq069))),sq051),sq060)),sq091),(((sq010,sq041),sq082),sq094)),((sq012,sq062),(sq025,sq075))),((sq007,(sq046,sq087)),(((((((sq011,(sq021,sq089)),(sq067,sq096)),((sq039,sq079),sq093)),sq063),sq057),(sq015,sq054)),(sq032,(sq073,sq095))))),(((sq045,sq070),sq078),sq072)),((sq013,(((sq030,sq048),sq036),sq088)),(sq064,sq090))),(sq042,sq100)),sq058)),(((((((sq004,sq009),sq043),sq023),sq083),sq038),sq017),(((sq005,sq092),(((sq006,sq098),(sq031,sq097)),sq074)),sq049))),((sq019,sq086),((sq020,sq061),sq027))),sq068);
  [treelength] 0.22
  [branchlengths] NON-ULTRAMETRIC

[PARTITIONS] partitionname             //  [PARTITIONS] blocks say which models go with
  [mt100 TVM_mt 16000]            //  which trees and define the length of the
                                       //  sequence generated at the root (1000 here).

[EVOLVE] partitionname 10 tl0022  //  This will generate 100 replicate datasets
                                       //  from the [PARTITIONS] block named above.

// The true alignment will be output in a file named outputname_TRUE.phy
// The unaligned sequences will be output in a file named outputname.fas
// To learn how to implement more complicated simulations (or different
// models) please consult the manual or the other example control files.s
```

参考：[INDELible官方网站对control.txt字段的详细介绍](http://abacus.gene.ucl.ac.uk/software/indelible/manual/)

**使用示例：**

```bash
# INDELible使用方法
$ ./indelible PATH/control.txt
```

## 参考内容

1. [INDELible官方网站](http://abacus.gene.ucl.ac.uk/software/indelible/)
1. [IQTree官方网站](http://www.iqtree.org)
1. [HAlign3层次树模拟数据集生成过程](https://github.com/malabz/HAlign-3/tree/main/dataset)
1. [IQ-TREE的使用 - 超快速用极大似然法构建进化树](https://www.jianshu.com/p/fa057daadfbc)
