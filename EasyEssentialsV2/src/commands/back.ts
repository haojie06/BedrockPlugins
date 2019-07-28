//玩家的back 返回死亡地点
import {getName,getPositionofEntity,getDimensionOfEntity} from "../utils";
import {db,INSERT_DEATH,SELECT_DEATH,DELETE_DEATH} from "../database";
let system;
export function backReg(sys) {
    system = sys;
    server.log("back模块已加载");
    system.listenForEvent("minecraft:entity_death",onEntityDeath);
    system.registerCommand("back",{
        description: "返回死亡地点",
        permission: 0,
        overloads:[
            {
                parameters: [],
                handler(){
                    if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `Can only be used by player`;
                    const entity = this.entity;
                    if (getDimensionOfEntity(entity) != 0) throw "目前只支持主世界使用/back";                
                    let $player = this.name;
                    const data = Array.from(db.query(SELECT_DEATH,{$player}));
                    if(data.length == 0) throw "你还没有记录的死亡点哦";
                    let position = data[0].position;
                    system.executeCommand(`tp @a[name=${$player}] ${position}`,data=>{});
                    system.executeCommand(`tellraw @a[name=${$player}] {"rawtext":[{"text":"§e已传送至上一死亡点"}]}`,data=>{});
                    db.update(DELETE_DEATH,{$player});
                }
            } as CommandOverload<[]>
        ]
    });
}

function onEntityDeath(eventData){
    let entity = eventData.entity;
    //如果死亡的实体是玩家
    if(entity.__identifier__ == "minecraft:player"){
        //拥有坐标组件
        if (system.hasComponent(entity, "minecraft:position")) {
            let $position:string = getPositionofEntity(entity);
            let $player:string = getName(entity);
            let result = db.update(DELETE_DEATH,{$player});
            db.update(INSERT_DEATH,{
                $player,
                $position
            });
            server.log(`玩家${$player}的死亡点${$position}已经记录`);
            //system.executeCommand(`tell @a[name=${$player}] §a死了?不用担心，输入/back返回死亡点`,data=>{});
            if (getDimensionOfEntity(entity) == 0){            
            system.executeCommand(`tellraw @a[name=${$player}] {"rawtext":[{"text":"§a死了?不用担心，输入/back返回死亡点"}]}`,data=>{server.log(JSON.stringify(data));});
            }
            else{
            system.executeCommand(`tellraw @a[name=${$player}] {"rawtext":[{"text":"§c你死在主世界之外了，无法/back了 position:(${$position})"}]}`,data=>{server.log(JSON.stringify(data));});
            }
        }
    }
}