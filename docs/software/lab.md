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
