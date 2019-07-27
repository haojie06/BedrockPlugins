//一些小指令
let system;
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
}