---
title: 数据处理脚本
order: 15
---

# 数据处理脚本

## 统计数据集序列信息

### 介绍：

- 计算数据集中序列的信息（序列长度的最大值｜最小值｜总和｜平均值，序列条数，序列之间的相似度）
- 作出序列长度分布图和序列相似度分布图

### 用法：

```text
python dataInfo.py input.fasta mafft datasetName
```

参数描述：
- `input.fasta`：待计算相似度的数据集，必须为**fasta格式**
- `mafft`：mafft路径，用于两两序列比对
- `datasetName`：数据集名称，用于命名序列信息文件
-  datasetName.txt  序列基本信息（序列条数和长度）
-  datasetName_Distri.png  序列长度分布图
-  similarity_datasetName.txt  两两序列相比的相似度值
-  similarity_datasetName.png  序列相似度分布图

[源代码](https://github.com/malabz/JMSA)

## 处理非法字符的脚本

### 介绍：

- 用于处理多序列比对后的fasta文件
- 该脚本将RNA序列文件中的碱基“U”替换为“T”，并将非法字符（如“:”）替换为“N”
- 处理后的文件存储在 resultName_processed.fasta

### 用法：

```text
python preprocess.py filepath resultName
```

参数描述：
- `filepath`：要处理的fasta文件的路径
- `resultName`：处理后的Fasta文件名

[源代码](https://github.com/malabz/MSATOOLS/tree/main/preprocess)

## 处理N的脚本

### 介绍：

在比对核苷酸的序列时，N的存在影响比对的难度。同时，不同的比对软件对于N的处理各不相同，得到的比对结果有的包含N，有的将N删掉了，难以比较软件的精度。该脚本处理数据后，可以降低比对的难度并统一比对后的结果，方便比较软件优劣。
- 比对前删除N
- 比对后插回N

### 用法：

```text
# 使用前先编译
g++ deal_N.cpp -o xxx

# 以下内容是Unix系统的使用方法，在Windows系统下使用时仅将./xxx替换为xxx.exe即可

# 1 删除文件中的N并记录N的位置
./xxx -1 in_original.fasta out_removeN.fasta recordN.tmp

# 2 将N插入到比对结果中
./xxx -2 in_ans_withoutN.fasta out_ans_withN.fasta recordN.tmp

# 3 从源文件和结果文件中生成带有N的最终结果文件
./xxx -3 in_original.fasta in_ans_withoutN.fasta out_ans_withN.fasta
```

参数描述：
- `-1｜-2｜-3`：选择的功能号
- `in_original.fasta`：带N的比对前的数据
- `out_removeN.fasta`：删掉N的比对前的数据
- `recordN.tmp`：记录N的位置信息文件
- `in_ans_withoutN.fasta`：没有N的比对结果
- `out_ans_withN.fasta`：将N插回原位的比对结果

[源代码](https://github.com/malabz/MSATOOLS/tree/main/deal_N_tool)
