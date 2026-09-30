---
title: 课题组软件
order: 11
---

# 课题组软件

## 多序列比对工具

### HAlign3

[软件仓库](https://github.com/malabz/HAlign-3)

- 输入格式：FASTA

- 输出格式：FASTA

- 适用数据类型：DNA/RNA

#### 运行方式

1. 通过Conda安装可执行程序运行

在已正确配置Conda环境并完成安装后，可直接使用如下命令运行：

```bash
$ halign -o input_halign3.fasta -t 5 -c 6 -s input.fasta
```

2. 在Java虚拟机环境中通过JAR包运行

若使用JAR包形式，可在已安装Java环境的情况下，通过以下命令运行：

```bash
$ java -jar HAlign-3.0.0_rc1.jar -o input_halign3.fasta -t 5 -c 6 -s input.fasta
```

#### 参数说明

- -o：输出结果文件路径
- -t：使用的线程数（用于并行计算）
- -c：指定中心序列的索引（从0开始计数）
- -s：输出结果中不包含序列ID
- input.fasta：输入的 FASTA 格式序列文件（需作为最后一个参数给出）

#### 注意事项

- 输入文件必须为标准FASTA格式；
- 中心序列索引需小于输入序列总数；
- 建议根据计算资源合理设置线程数以获得最佳性能。

### HAlign4

[软件仓库](https://github.com/malabz/HAlign-4)

- 输入格式：FASTA

- 输出格式：FASTA

- 适用数据类型：DNA/RNA

#### 运行方式

1. 通过Conda安装或源码编译安装可执行程序运行，可直接使用如下命令运行：

```bash
$ halign4 input.fasta input_halign4.fasta -t 4 -r center_seq_id -sa 10
```

#### 参数说明

- input.fasta：输入的FASTA格式序列文件
- input_halign4.fasta：输出结果文件路径
- -t：使用的线程数（用于并行计算）
- -r：指定中心序列的ID
- -sa：全局后缀数组的长度

### FMAlign2

[软件仓库](https://github.com/malabz/FMAlign2)

- 输入格式：FASTA

- 输出格式：FASTA

- 适用数据类型：DNA/RNA

#### 运行方式

1. 通过Conda安装或源码编译安装可执行程序运行，可直接使用如下命令运行：

```bash
$ fmalign2 -i input.fasta -o input_fmalign2.fasta -p /path/to/clustalo-cmd.txt -l 20 -f fast -t 16
```

#### 参数说明

- -i：输入的FASTA格式序列文件
- -o：输出结果文件路径
- -p：用户自定义调用的MSA命令
- -l：设置最小MEM的长度
- -f：指定过滤模式
- -t：使用的线程数（用于并行计算）

#### 注意事项

- 建议优先使用Conda进行软件安装与环境管理，以确保依赖版本的一致性与运行稳定性。
- 本程序在默认配置下兼容HAlign3、HAlign4及MAFFT这三款多序列比对工具。
- 如需调用其他多序列比对工具，请确保相关软件已提前正确安装并配置至系统环境中。

### WMSA2

[软件仓库](https://github.com/malabz/WMSA2/)

- 输入格式：FASTA

- 输出格式：FASTA

- 适用数据类型：DNA/RNA

#### 运行方式

在Java虚拟机环境中通过JAR包运行以下命令：

```bash
$ java -jar WMSA2.jar -m Win -s 0.95 -i test.fasta -o test_algined_WMSA2.fasta -t 
```

#### 参数说明

- -i：输入的FASTA格式序列文件
- -o：输出结果文件路径
- -m：比对模式
- -s：设置聚类的相似度
- -t：构建多序列比对使用的进化树

#### 注意事项

- 当运行模式（-m）设为win时，方可启用参数-s；在其他模式下该参数不可用。

## 实用建议

- 对于**序列相似度较高**的比对任务，推荐优先使用HAlign系列工具，以获得更高的效率与稳定性。
- 对于**超长序列**的多序列比对任务，推荐优先使用FMAlign2，其在处理长序列时具有更好的性能表现。
- 当**序列相似度低于80%**时，推荐使用WMSA2，以提高比对结果的准确性。

## spscore：SP 分数计算 {#spscore}

[软件仓库与安装说明](https://github.com/malabz/spscore)

spscore 用于计算已有多序列比对的 Sum-of-Pairs（SP）得分，不执行序列比对。输入为至少两条等长、非空的核酸序列，支持 FASTA 和 gzip 压缩文件；指标定义见[评价指标](../basics/metrics.md#sp-score)。

### 安装与运行

以下为仓库提供的 Conda 安装方式：

```bash
conda install -c malab spscore

# 使用默认评分；alignment.fasta 为已完成比对的文件
spscore -i alignment.fasta

# 读取压缩文件，指定评分并将结果保存到文件
spscore -i alignment.fasta.gz --match 1 --mismatch -1 --gap1 -2 --gap2 0 > scores.txt
```

### 评分参数

| 参数 | 含义 | 默认值 |
| --- | --- | --- |
| `--match` | 相同的 A/C/G/T 碱基配对 | `1` |
| `--mismatch` | 不同的 A/C/G/T 碱基配对 | `-1` |
| `--gap1` | 空位 `-` 与碱基或 `N` 配对 | `-2` |
| `--gap2` | 空位–空位、`N–N`、`N` 与 A/C/G/T 配对 | `0` |

字符不区分大小写，`U` 按 `T` 处理，其他非标准字符归入 `N`。这里使用逐列评分，不采用仿射空位罚分；不适用于通用蛋白质替换矩阵评分。

### 输出与实现说明

设序列数为 $M$，比对列数为 $L$，序列对数为 $P=M(M-1)/2$：

| 输出项 | 含义 |
| --- | --- |
| `SP score` | 所有列、所有序列对的总得分 |
| `Avg SP` | 总得分除以 $P$，即每对序列的平均得分 |
| `Scaled SP` | 总得分除以 $PL$，即每对序列、每列的平均得分 |

程序流式读取序列并累计逐列字符计数，避免显式枚举所有序列对；时间复杂度为 $O(ML)$，内存占用为 $O(L)$。实现与字符处理约定见[源码](https://github.com/malabz/spscore/blob/master/src/spscore.cpp)。

比较得分时应保持评分参数和字符处理约定一致。`Scaled SP` 是长度归一化的评分，不是相对参考比对的准确率，也不保证处于 0 到 1 之间。
