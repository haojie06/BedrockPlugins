# BedrockPlugins for stoneserver 基岩版插件
plugins for stoneserver（Minecraft bedrock edition server）
现在已公布的bds（alpha）并没有提供开发的接口，并且优化糟糕。不过有一个更好的选择，那就是**CodeHz**的[stoneserver](https://github.com/codehz/StoneServer)*需使用 linux 基于pe开发*,更好的优化，扩展了官方脚本引擎，使用**typescript**以类似于开发官方脚本的方式编写插件。

用这个仓库储存我这个初学者糟糕的代码） 目前已有插件

1. easyEssentials 目前功能：
 - 返回死亡地点 /back
 - 自杀 /suicide
 - 传送点系列（使用了sqlite）
    - /setwarp 设置传送点
    - /warp 传送至传送点
    - /delwarp 删除传送点
    - /warps 显示所有传送点

---

The Bedrock Dedicated Server（Alpha）software doesn't provide interfaces for developers, and the script engine only has limited APIs, stoneserver is a better choice which optimizes the performance and expands the interces of the official script engine. I use this repository for storing my codes and released plugins. 
