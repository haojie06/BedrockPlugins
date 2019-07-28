# EasyEssentialsV2
这是一个为[StoneServer](https://github.com/codehz/StoneServer)1.12 添加基础指令的插件，学习了CodeHz的示例代码，感谢大佬的指导😄。

## 目前实现功能
1. /back 返回死亡地点（目前只能在主世界使用

2. home系列
   1. /sethome home1 设置名为home1的家，最多可设置三个（可以在脚本中修改）
   2. /home home1 返回名为home1的家，如果不指定名字，默认返回最早设定的那个家
   3. /delhome home1 删除名为home1的家
   4. /homes 列出所有的家
3. warp系列
    1. /setwarp name 设置名为name的传送点（op命令
    2. /delwarp name 删除名为name的传送点（op命令
    3. /warp name 传送至name（主世界使用
    4. /warps 列出所有的传送点
4. tpa系列
   1. /tpa 玩家名 请求传送至玩家 有效期60s（可在脚本中设置
   2. /tpah 玩家名 邀请玩家传送到你这里 同上
   3. /tpac /tpad 接受/拒绝他人的传送请求
   4. /tpahc /tpahd 接受/拒绝他人的传送邀请
5. 小工具系列
   1. /suicide 自杀
   2. /stepping 在脚底下生成一个垫脚石（op命令
   3. /setlore 给物品设置lore标签 （来自示例代码
   4. /top 传送至顶部方块
6. 更多功能还在开发...

*Created by haojie06*