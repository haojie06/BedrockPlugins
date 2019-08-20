//warp 设置传送点系列
import {getName,getPositionofEntity,getDimensionOfEntity} from "../utils";
import {db,INSERT_WARP,SELECT_WARP_BY_NAME,SELECT_ALL_WARP,DELETE_WARP_BY_NAME} from "../database";
let system;
export function warpReg(sys) {
    system = sys;
    server.log("warp模块已加载");
    //设置传送点 op命令
    system.registerCommand("setwarp",{
        description:"设置传送点",
        permission:1,
        overloads:[{
            parameters:[{
                name:"name",
                type:"string"
            }],
        handler([$name]){
            const entity = this.entity;
            if (!entity) throw "Designed for player usage";
            if (getDimensionOfEntity(entity) != 0) throw "目前只支持在主世界设置传送点";
            let comp = system.getComponent(entity,MinecraftComponent.Position);
            let $position:string = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
            let $owner:string = getName(entity);

            //先判断能否写入
            const datas = Array.from(db.query(SELECT_WARP_BY_NAME,{$name}));
            if(datas.length != 0) throw "已有同名传送点";
            db.update(INSERT_WARP,{
                $name,
                $owner,
                $position
            });
            return `§a已创建传送点${$name} (${$position})`;    
        }
        }as CommandOverload<["string"]> ]
    });

    //删除传送点 op命令
    system.registerCommand("delwarp",{
        description:"删除传送点",
        permission:1,
        overloads:[{
            parameters:[{
                name:"name",
                type:"string"
            }],
        handler([$name]){
            const entity = this.entity;
            if (!entity) throw "Designed for player usage";
            //先判断能否删除
            const datas = Array.from(db.query(SELECT_WARP_BY_NAME,{$name}));
            if(datas.length == 0) throw "没有该传送点";
            let $position = datas[0].position;
            let name = getName(entity);

            db.update(DELETE_WARP_BY_NAME,{
                $name
            });
            system.executeCommand(`tellraw @a[name="${name}"] {"rawtext":[{"text":"§a已删除传送点${$name} (${name})"}]}`,data=>{});
            }
        }as CommandOverload<["string"]> ]
    });

        //传送至传送点
        system.registerCommand("warp",{
            description:"传送至传送点",
            permission:0,
            overloads:[{
                parameters:[{
                    name:"name",
                    type:"string"
                }],
            handler([$name]){
                const entity = this.entity;
                if (!entity) throw "Designed for player usage";
                if (getDimensionOfEntity(entity) != 0) throw "目前只支持主世界使用";
                const datas = Array.from(db.query(SELECT_WARP_BY_NAME,{$name}));
                if (datas.length != 1) throw "无效的传送点";
                let position = datas[0].position;
                let owner = datas[0].owner;
                let name = getName(entity);
                system.executeCommand(`playsound mob.endermen.portal @a ${position} 1 0.8`,data=>{});

                system.executeCommand(`tp @a[name="${name}"] ${position}`,data=>{});
                system.executeCommand(`playsound mob.endermen.portal @a ${position} 1 0.8`,data=>{});  
                return "§a已为你传送";  
            }
            }as CommandOverload<["string"]> ]
        });


    system.registerCommand("warps",{
        description:"显示所有传送点",
        permission:0,
        overloads:[{
            parameters: [],
            handler(){
                const entity = this.entity;
                if (!entity) throw "Designed for player usage";
                const datas = Array.from(db.query(SELECT_ALL_WARP,{}));
                let show:string = "";
                for(let index in datas){
                    let data = datas[index];
                    show += `§e<${index}>.§r§a${data.name}:(${data.position})  §3创建者:${data.owner}§r\n`;
                }
                let name = getName(entity);
                return show;
            }
        }as CommandOverload<[]>
    ]
    });
}