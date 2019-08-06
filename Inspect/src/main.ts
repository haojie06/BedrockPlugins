const system = server.registerSystem(0, 0);


let enchMap = new Map<string,string>();
let levelMap = new Map<string,number>();
let unusualItem = ["bedrock","mob_spawner","spawn_egg","command_block","dragon_egg","end_portal_frame","beacon"];
enchMap.set("0","protection");
enchMap.set("1","fire_aspect");
enchMap.set("2","feather_falling");
enchMap.set("3","blast_protection");
enchMap.set("4","projectile_protection");
enchMap.set("5","thorns");

enchMap.set("6","respiration");
enchMap.set("7","depth_strider");
enchMap.set("8","aqua_affinity");
enchMap.set("9","sharpness");
enchMap.set("10","smite");
enchMap.set("11","bane_of_arthropods");

enchMap.set("12","knockback");
enchMap.set("13","fire_aspect");
enchMap.set("14","looting");
enchMap.set("15","efficiency");
enchMap.set("16","silk_touch");
enchMap.set("17","unbreaking");

enchMap.set("18","fortune");
enchMap.set("19","power");
enchMap.set("20","punch");
enchMap.set("21","flame");
enchMap.set("22","infinity");
enchMap.set("23","luck_of_the_sea");

enchMap.set("24","lure");
enchMap.set("25","frost_walker");
enchMap.set("26","mending");
enchMap.set("27","");
enchMap.set("28","");
enchMap.set("29","impaling");

enchMap.set("30","riptide");
enchMap.set("31","loyalty");
enchMap.set("32","channeling");

levelMap.set("0",4);
levelMap.set("1",4);
levelMap.set("2",4);
levelMap.set("3",4);
levelMap.set("4",4);
levelMap.set("5",3);
levelMap.set("6",3);
levelMap.set("7",3);
levelMap.set("8",1);
levelMap.set("9",5);
levelMap.set("10",5);
levelMap.set("11",5);
levelMap.set("12",2);
levelMap.set("13",2);
levelMap.set("14",3);
levelMap.set("15",5);
levelMap.set("16",1);
levelMap.set("17",3);
levelMap.set("18",3);
levelMap.set("19",5);
levelMap.set("20",2);
levelMap.set("21",1);
levelMap.set("22",1);
levelMap.set("23",3);
levelMap.set("24",3);
levelMap.set("25",2);
levelMap.set("26",1);
levelMap.set("27",1);
levelMap.set("28",1);
levelMap.set("29",5);
levelMap.set("30",3);
levelMap.set("31",3);
levelMap.set("32",1);
levelMap.set("33",1);
levelMap.set("34",4);
levelMap.set("35",3);


system.initialize = function () {
    server.log("Inspect背包信息查询 loaded");
    system.registerCommand("inspect",{
        description: "查看背包",
        permission: 1,
        overloads:[{
            parameters:[{
                name:"玩家",
                type:"player"
            }],
            handler([players]){
                //if(!this.entity) return "只有玩家可以执行";
                if(players.length != 1) return "一次只能查询一个玩家的背包";
                let player = players[0];
                
                let armors = ["头盔","胸甲","腿甲","鞋子"];
                let extradata = system.getComponent(player,MinecraftComponent.ExtraData).data;
                let playerLevel = extradata.value.PlayerLevel.value;
                let playerGameMode = extradata.value.PlayerGameMode.value;
                let show = `§9§l玩家信息查询结果§r\n§3玩家等级:${playerLevel} 游戏模式:${playerGameMode}§r\n§e§l----------装备栏----------§r\n`;
                for(let i = 0;i < 4;i++){
                    let armorEnchNum;
                    let armorName = extradata.value.Armor.value[i].value.Name.value.split(":")[1];
                    try{
                        armorEnchNum = extradata.value.Armor.value[i].value.tag.value.ench.value.length;
                    }catch(err){
                        armorEnchNum = 0;
                    }
                    let armorEnch = "";
                    for(let j = 0;j<armorEnchNum;j++){
                        let enchId = String(extradata.value.Armor.value[i].value.tag.value.ench.value[j].value.id.value);
                        let enchLv = extradata.value.Armor.value[i].value.tag.value.ench.value[j].value.lvl.value;
                        if(checkLevel(enchId,Number(enchLv))){
                            armorEnch += `§eid:${enchId}:§r${enchMap.get(enchId)}§9等级:§r${enchLv} `;
                        }
                        else{
                            armorEnch += `§c<异常附魔>§r§eid:${enchId}§r:${enchMap.get(enchId)}§9等级:§r${enchLv} `;
                        }
                    }
                    if(armorEnch != ""){
                        show += `§9${armors[i]}§r:${armorName} 附魔:${armorEnch}\n`;
                    }
                    else{
                        show += `§9${armors[i]}§r:${armorName}\n`;
                    }
                }
                
                // system.sendText(this.entity,extradata.value.Armor.toString());
                let invNum = extradata.value.Inventory.value.length;
                show += `§2§l----------物品栏---------§r`;
                for(let i=0;i<4;i++){
                    show += `\n§a-----------第${i}行---------§r\n`;
                    for(let j=0;j<9;j++){
                        let index = i*9+j;
                        let invName = extradata.value.Inventory.value[index].value.Name.value.split(":")[1];
                        //invName = invName.replace(/[\r\n]/g,"");
                        let invCount = Number(extradata.value.Inventory.value[index].value.Count.value);
                        let invNumShow = "";
                        if(invCount < 32){
                            invNumShow = `§a[${invCount}]§r`;
                        }
                        else if(invCount < 64){
                            invNumShow = `§e[${invCount}]§r`;
                        }
                        else{
                            invNumShow = `§c[${invCount}]§r`;
                        }

                        if(invName != undefined){
                            if(unusualItem.indexOf(invName)!= -1){
                                show += `§4<异常物品>§r${invNumShow}${invName}`;
                            }
                            else{
                                show += `${invNumShow}${invName}`;
                            }
                            
                            try{
                                //有附魔
                                let enchNum = extradata.value.Inventory.value[index].value.tag.value.ench.value.length;
                                for(let n = 0;n < enchNum;n++){
                                    let enchId = String(extradata.value.Inventory.value[index].value.tag.value.ench.value[n].value.id.value);
                                    let enchLv = extradata.value.Inventory.value[index].value.tag.value.ench.value[n].value.lvl.value;
                                    //可以检查一下附魔等级是否异常
                                    if(checkLevel(enchId,Number(enchLv))){
                                        //附魔正常的时候
                                        show += `§e(${enchMap.get(enchId)} lv:${enchLv})§r`;
                                    }
                                    else{
                                        show += `§c<异常附魔>§r§e(${enchMap.get(enchId)} lv:${enchLv})§r`
                                    }
                                }
                            }catch(err)
                            {
                                //无附魔
                            }
                            show += "§a§l§n || §r";
                        }
                }
            }
                show += `\n§5§l----------末影箱----------§r\n`;
                //末影箱
                
                for(let i=0;i<3;i++){
                    show += `\n§d-----------第${i}行---------§r\n`;
                    for(let j=0;j<9;j++){
                        let index = i*9+j;
                        let invName = extradata.value.EnderChestInventory.value[index].value.Name.value.split(":")[1];
                        //invName = invName.replace(/[\r\n]/g,"");
                        let invCount = Number(extradata.value.EnderChestInventory.value[index].value.Count.value);
                        
                        let invNumShow = "";
                        if(invCount < 32){
                            invNumShow = `§a[${invCount}]§r`;
                        }
                        else if(invCount < 64){
                            invNumShow = `§e[${invCount}]§r`;
                        }
                        else{
                            invNumShow = `§c[${invCount}]§r`;
                        }
                        if(invName != undefined){
                            if(unusualItem.indexOf(invName)!= -1){
                                show += `§4<异常物品>§r${invNumShow}${invName}`;
                            }
                            else{
                                show += `${invNumShow}${invName}`;
                            }
                            try{
                                //有附魔
                                let enchNum = extradata.value.EnderChestInventory.value[index].value.tag.value.ench.value.length;
                                for(let n = 0;n < enchNum;n++){
                                    let enchId = String(extradata.value.EnderChestInventory.value[index].value.tag.value.ench.value[n].value.id.value);
                                    let enchLv = extradata.value.EnderChestInventory.value[index].value.tag.value.ench.value[n].value.lvl.value;
                                    //可以检查一下附魔等级是否异常
                                    if(checkLevel(enchId,Number(enchLv))){
                                        //附魔正常的时候
                                        show += `§e(${enchMap.get(enchId)} lv:${enchLv})§r`;
                                    }
                                    else{
                                        show += `§c<异常附魔>§r§e(${enchMap.get(enchId)} lv:${enchLv})§r`
                                    }
                                }
                            }catch(err)
                            {
                                //无附魔
                            }
                            show += "§a§l§n || §r";
                        }
                    }
            }   
            return show;
            }
        }as CommandOverload<["player"]>]
    });
}
//根据id/等级 检查附魔等级是否异常 true(正常) false 异常
function checkLevel(id:string,lv:number){
    let commonLv = levelMap.get(id);
    if(lv > commonLv){
        return false;
    }
    else if(lv < 0){
        return false;
    }
    else{
        return true;
    }
}


