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

## 如何使用

要使用插件请使用stoneserver，解压release中的压缩包到，把插件文件加移动到和启动脚本同名的游戏文件夹 比如 start/games/com.mojang/development_behavior_packs/ 里面，从插件文件夹的 manifest.json 复制出[header]下的两行
```
    "uuid": "58728fe0-99c1-4fed-bcce-8ffba5e76566",
    "version": [0, 0, 0],
```
在存档文件夹*stoneserver/start/games/com.mojang/minecraftWorlds/world*下新建（如果有就直接编辑） nano world_behavior_packs.json 文件按以下格式添加
```
[
        {
                "pack_id": "ff0d3a21-4ea8-4e02-82b7-bfd8e1ecdf64",
                "version": [0, 0, 0]
        },

        {
                "pack_id": "58728fe0-99c1-4fed-bcce-8ffba5e76566",
                "version": [0, 0, 0]
        }

]

```
**注意 原来复制的uuid要改为pack_id**,示例中添加了两个插件，保存，重启服务端之后插件应该就加载了。


---

The Bedrock Dedicated Server（Alpha）software doesn't provide interfaces for developers, and the script engine only has limited APIs, **CodeHz's** [stoneserver](https://github.com/codehz/StoneServer) is a better choice which optimizes the performance and expands the interces of the official script engine. I use this repository for storing my codes and released plugins.  [**official demo**](https://github.com/stone-addons) *use typescript*
