//一些小指令
import {transNum} from "../utils";
let system;
let testBlockNum = 50; //使用top指令的时候向上检测的方块数量
export function toolReg(sys) {
    system = sys;
    server.log("tools模块加载");

    system.registerCommand("suicide",{
        description: "自杀",
        permission: 0,
        overloads:[
            {
                parameters: [],
                handler(){
                    if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `Can only be used by player`;
                    system.executeCommand(`kill @a[name="${this.name}"]`,data=>{});
                }
            } as CommandOverload<[]>
        ]
    });

    system.registerCommand("stepping",{
        description: "在脚底下生成垫脚石",
        permission: 1,
        overloads:[
            {
                parameters: [],
                handler(){
                    if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `Can only be used by player`;
                    system.executeCommand(`execute @a[name="${this.name}"] ~ ~ ~ fill ~ ~-1 ~ ~ ~-1 ~ dirt 0 replace`,data=>{});
                }
            } as CommandOverload<[]>
        ]
    });

    system.registerCommand("top",{
        description: "上升至顶部",
        permission: 1,
        overloads:[
            {
                parameters: [],
                handler(){
                    if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `只有玩家可以使用`;
                    let tickAreaCmp = system.getComponent(this.entity,MinecraftComponent.TickWorld);
                    let tickingArea = tickAreaCmp.data.ticking_area;
                    let posCmp = system.getComponent(this.entity,MinecraftComponent.Position);
                    let x:number = Math.floor(parseInt(posCmp.data.x));
                    let y:number = Math.floor(parseInt(posCmp.data.y)) + 1;
                    let z:number = Math.floor(parseInt(posCmp.data.z));
                    system.sendText(this.entity,`当前坐标(${x},${y},${z})`);
                    for (let i = 1; i < testBlockNum; i++) {
                        let curBlock = system.getBlock(tickingArea,x,y+i,z).__identifier__;
                        let nextBlock = system.getBlock(tickingArea,x,y+i+1,z).__identifier__;
                        if(curBlock != "minecraft:air" && nextBlock == "minecraft:air"){
                            system.sendText(this.entity,`已找到落脚点${x} ${y+i+1} ${z}`)
                            system.executeCommand(`tp @a[name="${this.name}"] ${x} ${y+i+1} ${z}`,data=>{});
                            i = testBlockNum+1;
                        }
                        if(i == testBlockNum){
                            throw "未找到可落脚的地方";
                        }
                    }                    
                }
            } as CommandOverload<[]>
        ]
    });

    //示例代码 setlore
    system.registerCommand("setlore", {
        description: "为当前物品设置lore标签",
        permission: 1,

        overloads: [
        {
            parameters: [
            {
                type: "string",
                name: "lore"
            }
            ],
            handler([str]) {
              if (!this.entity || !system.hasComponent(this.entity, MinecraftComponent.HandContainer))
                throw `只有手上能拿物品的实体可以使用`;
              const hand = system.getComponent(this.entity, MinecraftComponent.HandContainer);
              const item = hand.data[0];
              const old = system.getComponent(item, MinecraftComponent.Lore);
              old.data = [str];
              system.applyComponentChanges(item, old);
              return "成功设置";
            }
          } as CommandOverload<["string"]>
        ]
      });
}