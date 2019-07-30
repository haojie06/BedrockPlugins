const system = server.registerSystem(0, 0);
system.initialize = function (){
    server.log("ChopTree Loaded");

    system.listenForEvent("minecraft:player_destroyed_block", (data) => {
        let blockName = data.data.block_identifier;
        //砍的是原木 判断是不是树
        if(blockName == "minecraft:log" || blockName == "minecraft:log2"){
        let player = data.data.player;
        let playerName = getName(player);
        let dim = getDimensionOfEntity(player);
        let playerPos = getPosCmp(player);
        let bPostion = data.data.block_position;
        let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
        let tickingArea = tickAreaCmp.data.ticking_area;

        system.sendText(player,`砍了木头`);
        let pX = transNum(playerPos.x);
        let pY = transNum(playerPos.y);
        let pZ = transNum(playerPos.z);
    
        let bX = transNum(bPostion.x);
        let bY = transNum(bPostion.y);
        let bZ = transNum(bPostion.z);




        //let time = getTime();
        //先找和原木贴着的树叶
        let ifTree = false;
        for(let i = 1;i <20; i++){
            let block = system.getBlock(tickingArea,bX,bY+i,bZ);
            let blockName = block.__identifier__;
            if(blockName == "minecraft:leaves" || blockName == "minecraft:leaves2"){
                system.sendText(player,`找到树叶 向上${i}个方块`);
                let vec1: VectorXYZ = {
                    x: bX,
                    y: bY+i,
                    z: bZ
                };
                let vec2: VectorXYZ = {
                    x: 1,
                    y: 1,
                    z: 1
                };
                let structure = system.getStructure(tickingArea,vec1,vec2);
                //let show = structure.toString();
                //system.sendText(player,`${JSON.stringify(block)}`);
                let kind = structure.value.structure.value.palette.value.default.value.block_palette.value[0].value.val.value

                system.sendText(player,`树叶种类${kind}`);
                server.log(`树叶种类${kind}`);
                if (Number(kind) < 4) {
                    system.sendText(player,"这是一棵树");
                    ifTree = true;
                }
                break;
            }
            else if(blockName != "minecraft:log" && blockName != "minecraft:log2"){
                block = system.getBlock(tickingArea,bX+1,bY+i,bZ);
                blockName = block.__identifier__;
                //针对叶子在旁边的情况
                if (blockName == "minecraft:leaves" || blockName == "minecraft:leaves2") {
                    let vec1: VectorXYZ = {
                        x: bX+1,
                        y: bY+i,
                        z: bZ
                    };
                    let vec2: VectorXYZ = {
                        x: 1,
                        y: 1,
                        z: 1
                    };

                    let structure = system.getStructure(tickingArea,vec1,vec2);
                    //let show = structure.toString();
                    //system.sendText(player,`${JSON.stringify(block)}`);
                    let kind = structure.value.structure.value.palette.value.default.value.block_palette.value[0].value.val.value
                    system.sendText(player,`树叶种类${kind}`);
                }
                else{
                system.sendText(player,`未找到树叶 ${blockName}`);
                break;
                }
            }
        }
        if(ifTree){
            
        }
        }
    });
}


function getName(entity: IEntity) {
    return system.getComponent<INameableComponent>(entity, MinecraftComponent.Nameable).data.name;
  }
  
  function getPosCmp(entity: IEntity){
    return system.getComponent<IPositionComponent>(entity,MinecraftComponent.Position).data;
  }
  
  function getDimensionOfEntity(entity: IEntity){
    let dimension;
    if (system.hasComponent(entity, "stone:dimension")) {
      let comp = system.getComponent(entity,MinecraftComponent.Dimension);
      dimension = comp.data;
  }
    else{
      dimension = "无法获得维度";
    }
    return String(dimension);
  }
//转换小数
function transNum(n:number):number{
    if(n >= 0){
        return Math.floor(n);
    }else{
        return Math.floor(n);
    }
}