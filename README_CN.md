# camshaft

使用SQL语句创建数据视图的分析库

开发基于的开源版本是 tag: 0.9.0 版

## 内部机制

- Analysis: 表示数据计算的方式，通过其节点（Nodes）定义一个分析。
- Node: 分析中的每个节点，用 SQL 查询作为最终输出或作为其他节点的输入。
- Source: 最基本的节点类型，定义了一个包含原始 SQL 的节点。
- Operation: 一个节点，输入一个或多个节点对象，并产生一个节点。

### Node

分析中的所有节点由一个 ID 标识。ID 在图中是唯一的。

节点像黑盒一样工作，内部实现是隐藏的，我们只关心它们的输出是什么：一个 SQL 查询。

一个节点可能在一个表中缓存结果，或者几个表，并返回一个 SELECT * FROM cached_table 查询，或者它甚至可以生成几个缓存表，例如，路由分析可能生成一张线表和另一张点表。


### 工作流数据结构

工作流图是一个有向无环图。

### 参考资料

 - [The Architecture of Open Source Applications: Git](http://www.aosabook.org/en/git.html)
 - [Wikipedia: Directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)


## 依赖

 * Node >= 10.x
 * npm >= 6.x

## 安装

运行
```
npm install
```

## 测试

运行
```
npm test
```

这将执行 (js)lint 并运行测试。

