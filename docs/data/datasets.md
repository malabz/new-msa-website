---
title: 数据集目录
order: 9
---

# 数据集目录

## 多基因组比对与泛基因组数据集

### MGA-Dataset

- [MGA-Dataset](https://github.com/malabz/MGA-Dataset) 是课题组持续维护的多基因组比对（MGA）与泛基因组（Pangenome）数据资源导航库，汇总数据集说明、官方来源和下载入口，不直接存放数据文件。
- 该资源按真实数据与模拟数据分类，当前覆盖人类、植物、真菌、跨类群基因组集合以及模拟基准集，并标注 T2T、Chromosome、Scaffold、Contig 等组装级别，便于根据研究对象和评测需求选择数据。

## DNA/RNA真实数据集

### Ancient human partial mitochondrial DNA

- 古代人类线粒体高可变区I和高可变区II的基因序列，长度350bp左右，293条高可变区I，100条高可变区II，数据集混在一起，比对时需要分开使用 
- Ref: Ancient DNA Reveals Key Stages in the Formation of Central European Mitochondrial Genetic Diversity. DOI: 10.1126/science.1241844
- 下载 (zipped file): [mt.zip](http://lab.malab.cn/soft/WMSA2/data/mt.zip)

### mitochondrial genomes

- 人类线粒体基因组，672条高度相似的DNA序列，最大长度16579bp
- Ref: Tanaka M., et al. (2004) Mitochondrial genome variation in eastern Asia and the peopling of Japan. Genome Res,14(10a), 1832-1850.
- Download: [1x](http://lab.malab.cn/soft/halign/data/mt1x.zip) (219KB)   [20x](http://lab.malab.cn/soft/halign/data/mt20x.zip) (4.27MB)  [50x](http://lab.malab.cn/soft/halign/data/mt50x.zip) (10.666MB)  [100x](http://lab.malab.cn/soft/halign/data/mt100x.zip) (21.325MB)

### Human Genome

#### 人类基因组基因

- 含有21个人的完整基因,因数据量过大，仅提供基因组的[下载链接](http://lab.malab.cn/~cjt/MSA/data/Human_Genome_21.html)。
- 注意：CHM13_T2T_v1.1 已经更新为 CHM13_T2T_v2.0，请使用 [这个链接](https://s3-us-west-2.amazonaws.com/human-pangenomics/T2T/CHM13/assemblies/analysis_set/chm13v2.0.fa.gz) 获取。

#### 人类Y染色体基因组

- 共44条，均由多个片段拼接而成（参考序列见 CHM13_T2T_\v2.0）
- Download: [Link](ftp://ftp.1000genomes.ebi.ac.uk/vol1/ftp/data_collections/HGSVC3/working/20230412_sigY_assembly_data/assemblies/verkko_1.0_release/chrY/)
- Ref1: Hallast, Pille, et al. "Assembly of 43 human Y chromosomes reveals extensive complexity and variation." Nature (2023): 1-10.
- Ref2: Rhie, Arang, et al. "The complete sequence of a human Y chromosome." Nature (2023): 1-11.

#### 3条人类1号染色体

- 由于数据过大，采用了分卷压缩.
- Download: [part 1](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.001), [part 2](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.002), [part 3](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.003), [part 4](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.004), [part 5](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.005), [part 6](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.006), [part 7](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.007), [part 8](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.008), [part 9](https://github.com/malabz/Halign-G/raw/main/data/3-Human-chromosome-1.zip.009)

### 16S rRNA

- 16S rRNA基因是细菌上编码rRNA相对应的DNA序列，相似度不高，最大长度1586bp
- Ref: DeSantis, T. Z., et al.(2006) NAST: a multiple sequence alignment server for comparative analysis of 16S rRNA genes. Nucleic Acids Res, 34, W394-399.
- Download: [small](http://lab.malab.cn/soft/halign/data/16ssmall.zip) (21.864MB)  [big](http://lab.malab.cn/soft/halign/data/16sbig.zip) (197.224MB)

### Mycobacterium 23S rRNA sequences

- 641 Mycobacterium 23S rRNA sequences with lengths ranging from 1909 to 3485 bp were downloaded as another dataset from the [SILVA rRNA database](http://www.arb-silva.de/) of Bacteria, Archaea and Eukarya.
- Download: [23s_rRNA.tar.xz](http://lab.malab.cn/%7Etfr/HAlign3_testdata/23s_rRNA.tar.xz)

### Neisseria-meningitidis

- 5 条序列，长度为 2,190,088，fasta 格式
- Download: [link](https://github.com/malabz/Halign-G/raw/main/data/Neisseria-meningitidis.zip)

### Streptococcus-pneumoniae

- 11 条序列，长度 2,138,975~2,139,054，fasta 格式
- Download: [link](https://github.com/malabz/Halign-G/raw/main/data/Streptococcus-pneumoniae.zip)

### Escherichia-coil

- 30 条序列，长度 5,060,511~5,060,749，fasta 格式。由于数据过大，采用了分卷压缩
- Download: [part 1](https://github.com/malabz/Halign-G/raw/main/data/Escherichia-coil.zip.001), [part 2](https://github.com/malabz/Halign-G/raw/main/data/Escherichia-coil.zip.002)

### GMGC 数据集

- Global Microbial Gene Catalog 数据集，fasta 格式。
- [原始数据下载](https://gmgc.embl.de/download.cgi)
- [按照长度进行分组存储](https://github.com/malabz/GMGC-data)
- Ref: Coelho, L.P., et al. Towards the biogeography of prokaryotic genes. Nature 601, 252–256 (2022).

### HIV 数据集

- 截至 2021 年的 HIV 数据集，fasta 格式。
- [原始数据下载](https://www.hiv.lanl.gov/content/sequence/NEWALIGN/align.html)
- [按照长度进行分组存储](https://github.com/malabz/HIV-data)
- Ref: https://www.hiv.lanl.gov/ [参考如何引用 HIV 数据集](https://www.hiv.lanl.gov/content/sequence/HIV/refer.html)

## 病毒基因组数据集

### COVID-19

- 新冠病毒基因序列，总共156条，相似度较高，长度大于29000bp
- [http://lab.malab.cn/~zsl/Periodical_results/data/2019nCoVR_20200301.zip](http://lab.malab.cn/~zsl/Periodical_results/data/2019nCoVR_20200301.zip)
- 新冠病毒基因序列，总共1020条，长度层次不齐，未经过有效挑选
- [http://lab.malab.cn/~cjt/MSA/data/SARS-CoV-2_20200417.7z](http://lab.malab.cn/~cjt/MSA/data/SARS-CoV-2_20200417.7z)
- 新冠病毒基因序列，总共13w条，相似度较高，长度大于29000bp
    (序列已对齐，对比前请去除'-')
- [http://lab.malab.cn/~cjt/MSA/data/msa_1012.tar-2.xz](http://lab.malab.cn/~cjt/MSA/data/msa_1012.tar-2.xz)
- 新冠病毒基因序列，总共1M条，相似度较高，长度大于29000bp
    (序列已对齐，对比前请去除'-')
- [http://lab.malab.cn/~tfr/HAlign3_testdata/sars_cov_2_1Mseq.tar.xz](http://lab.malab.cn/~tfr/HAlign3_testdata/sars_cov_2_1Mseq.tar.xz)
- 新冠病毒基因序列，总共24310条，相似度较高，长度大于29000bp
- [http://lab.malab.cn/~cjt/MSA/data/SARS-CoV-2.7z](http://lab.malab.cn/~cjt/MSA/data/SARS-CoV-2.7z)
- 新冠病毒基因序列，总共15900933条，长度层次不齐，长度大于29000bp
    (序列已对齐，对比前请去除'-')
- [http://lab.malab.cn/soft/halign/data/hCoV-19_msa_20230822.tar.xz](http://lab.malab.cn/soft/halign/data/hCoV-19_msa_20230822.tar.xz)

### 猴痘数据集

- 完整数据集（即完整测序的数据集 MPoxBR.complete.fasta.xz）相似度较高，有 1739 条序列，没有对齐，fasta 格式的 DNA 数据集，长度在 183230~210919 之间，平均长度 197135
- 部分数据集（即部分测序的数据集 PoxBR.incomplete.fasta.xz）相似度较低，有 4631 条序列，没有对齐，fasta 格式的 DNA 数据集，长度在 17~228869 之间，平均长度 177921
- 最后更新日期：2023-08-19
- [Dataset Mainpage](https://github.com/malabz/MPoxVR_dataset)
- [Dataset Link](https://github.com/malabz/MPoxVR_dataset/releases/tag/20230819)

### IAV数据集

- 该数据集包含甲型流感病毒多个基因片段的序列数据，覆盖HA-H1、HA-H3、HA-H5、HA-H7，NA-N1、NA-N2、NA-N9，以及MP、NP、NS、PA、PB1、PB2等片段。IAV基因组由8个负链单股RNA片段组成，不同毒株之间具有较高的遗传多样性，并可通过HA和NA的组合划分为不同亚型。本数据集为每个亚型或基因片段提供对应的参考序列，并进一步构建不同长度的子数据集，适合用于病毒序列分类、亚型识别、片段识别、序列比对和模型输入长度分析等任务。
- Download: [iav_data.7z](http://lab.malab.cn/soft/msa_test_data/virus/iav_data.7z)

### Dengue数据集

- Dengue病毒数据集包含登革病毒基因组序列和参考序列，属于正链单股RNA病毒，存在1–4型血清型，序列间差异较明显，完整基因组长度约10.6–10.7kb，该数据集未经过去重和筛选。
- Download: [dengue.7z](http://lab.malab.cn/soft/msa_test_data/virus/dengue.7z)

### Ebola数据集

- Ebola病毒数据集包含埃博拉病毒基因组序列和参考序列，属于负链单股RNA病毒，不同种/株之间存在一定变异，完整基因组长度约18.9–19.0kb，该数据集未经过去重和筛选。
- Download: [ebola.7z](http://lab.malab.cn/soft/msa_test_data/virus/ebola.7z)

### HBV数据集

- HBV病毒数据集包含乙型肝炎病毒基因组序列和参考序列，属于部分双链环状DNA病毒，基因组较短但不同基因型之间存在差异，完整基因组长度约3.2kb，该数据集未经过去重和筛选。
- Download: [hbv.7z](http://lab.malab.cn/soft/msa_test_data/virus/hbv.7z)

### HCV数据集

- HCV病毒数据集包含丙型肝炎病毒基因组序列和参考序列，属于正链单股RNA病毒，基因型多、变异程度较高，完整基因组长度约9.4–9.7kb，该数据集未经过去重和筛选。
- Download: [hcv.7z](http://lab.malab.cn/soft/msa_test_data/virus/hcv.7z)

### HIV-1数据集

- HIV-1病毒数据集包含人类免疫缺陷病毒1型基因组序列和参考序列，属于逆转录病毒，序列变异性高，完整RNA基因组长度约9.2–9.8kb，该数据集未经过去重和筛选。
- Download: [hiv-1.7z](http://lab.malab.cn/soft/msa_test_data/virus/hiv-1.7z)

### Measles数据集

- Measles病毒数据集包含麻疹病毒基因组序列和参考序列，属于负链单股RNA病毒，基因组长度较保守，完整基因组通常为15894bp，该数据集未经过去重和筛选。
- Download: [measles.7z](http://lab.malab.cn/soft/msa_test_data/virus/measles.7z)

### West Nile数据集

- West Nile病毒数据集包含西尼罗病毒基因组序列和参考序列，属于正链单股RNA黄病毒，常用于虫媒病毒分类或进化分析，完整基因组长度约11.0kb，该数据集未经过去重和筛选。
- Download: [measles.7z](http://lab.malab.cn/soft/msa_test_data/virus/measles.7z)

### Zika数据集

- Zika病毒数据集包含寨卡病毒基因组序列和参考序列，属于正链单股RNA黄病毒，与登革病毒和西尼罗病毒同属黄病毒相关类群，完整基因组长度约 10.8 kb。
- Download: [zika.7z](http://lab.malab.cn/soft/msa_test_data/virus/zika.7z)

## DNA/RNA模拟数据集

### Hierarchical tree simulated datasets

- Ref: [HAlign 3](https://doi.org/10.1093/molbev/msac166): Fast Multiple Alignment of Ultra-Large Numbers of Similar DNA/RNA Sequences.
- Download: [sars_cov_2_like_diff_similarity.tar.xz](http://lab.malab.cn/~tfr/HAlign3_testdata/sars_cov_2_like_diff_similarity.tar.xz), [sars_cov_2_like_diff_treelength.tar.xz](http://lab.malab.cn/~tfr/HAlign3_testdata/sars_cov_2_like_diff_treelength.tar.xz), [mt_like_diff_similarity.tar.xz](http://lab.malab.cn/~tfr/HAlign3_testdata/mt_like_diff_similarity.tar.xz), [mt_like_diff_treelength.tar.xz](http://lab.malab.cn/~tfr/HAlign3_testdata/mt_like_diff_treelength.tar.xz)
- [使用IQTree和INDELible生成方法](simulation.md)

### Star-tree simulated datasets

- 14 simulated datasets, each dataset contained 1000 sequences in each dataset with different similarities (99%, 98%, 97%, 96%, 95%, 94%, 93%, 92%, 91%, 90%, 85%, 80%, 70%, and 60%).
- Ref: [HAlign 3](https://doi.org/10.1093/molbev/msac166): Fast Multiple Alignment of Ultra-Large Numbers of Similar DNA/RNA Sequences.
- Download: [star_simudata_1000seq.tar.xz](http://lab.malab.cn/%7Etfr/HAlign3_testdata/star_simudata_1000seq.tar.xz)

### RNA模拟数据

- 含二级结构，NEXUS格式，相似度很高
- [https://kim.bio.upenn.edu/software/csd.shtml](https://kim.bio.upenn.edu/software/csd.shtml)
- 下载 (zipped file): [RNA-255](http://lab.malab.cn/soft/WMSA2/data/RNA-255.zip) [RNA-511](http://lab.malab.cn/soft/WMSA2/data/RNA-511.zip) [RNA-1023](http://lab.malab.cn/soft/WMSA2/data/RNA-1023.zip) [RNA-2047](http://lab.malab.cn/soft/WMSA2/data/RNA-2047.zip) [RNA-4095](http://lab.malab.cn/soft/WMSA2/data/RNA-4095.zip) [RNA-8191](http://lab.malab.cn/soft/WMSA2/data/RNA-8191.zip)

### 模拟noncoding数据

- 相似度较低，有较多类型的数据，fasta格式
- [http://bioinfolab.unl.edu/~cstrope/iSG/benchmark/index.html](http://bioinfolab.unl.edu/~cstrope/iSG/benchmark/index.html)

## 蛋白质数据集

### MUSCLE 数据集

- 相似度较低，有较多类型的数据，fasta格式，以蛋白质数据集为主
- [http://www.drive5.com/bench/](http://www.drive5.com/bench/)
- [https://github.com/rcedgar/balifam](https://github.com/rcedgar/balifam)
- [Q Score 程序](https://github.com/rcedgar/qscore)

### extHomFam 数据集

- 相似度较低，序列长度短(&lt;100bp)，文件内序列数量多(最多415519条)，有金标准对齐，fasta格式，蛋白质数据集
- 金标准对比结果同样采用 [Q Score 程序](https://github.com/rcedgar/qscore)
- [Dataset Link](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/BO2SVW)

### QuanTest2 数据集

- 蛋白质数据集，相似度较低
- Ref: Sievers, F. et al. (2020) QuanTest2: benchmarking multiple sequence alignments using secondary structure prediction, Bioinformatics, 36(1), January 2020, 90–95.
- 原版利用二级结构进行预测，[下载地址](http://bioinf.ucd.ie/quantest2.tar)
- 利用 Q Score 和 TC Score 进行得分计算，[Dataset Mainpage](https://github.com/malabz/QuanTest2)

### Pfam(38.1) full子数据集

- 基于Pfam full alignment 构建的真实蛋白质家族子集，从多个Pfam家族中抽取部分成员形成测试数据。Pfam家族以多序列比对和profile HMM表示，full alignment包含更大范围的同源成员，适合构建真实场景下的MSA测试集。
- 蛋白质数据集，覆盖不同家族规模、序列长度和相似度水平，可用于测试比对方法在低相似、高冗余、规模变化等条件下的表现。
- 与BAliBASE等结构参考基准不同，该数据集强调真实家族覆盖与规模多样性，适合用于算法性能评测、参数敏感性分析以及大规模比对实验；若需参考型质量评估，可结合Pfam seed alignment或其他高可信参考集进行比较。Pfam的seed是经整理的核心对齐，full则是在profile HMM搜索基础上扩展得到的更大成员集合。
- 下载: [pfam_subset.7z](http://lab.malab.cn/soft/msa_test_data/protein/pfam_subset.7z)

### IQ-TREE3模拟数据集

- 基于IQ-TREE3的AliSim模拟器构建，通过控制序列长度、叶子节点数、进化距离和替换模型等参数，生成不同难度与不同规模的模拟多序列比对数据。
- 数据集覆盖从低分化到高分化、从小规模到大规模、从短序列到长序列的多种场景，适合测试多序列比对算法在复杂进化条件下的准确性、稳定性与可扩展性。
- 下载: [iqtree_simulated.7z](http://lab.malab.cn/soft/msa_test_data/protein/iqtree_simulated.7z)
