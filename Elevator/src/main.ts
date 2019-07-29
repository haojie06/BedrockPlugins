const system = server.registerSystem(0, 0);
//电梯方块是什么 这里用的是铁块
let eBlockName = "minecraft:iron_block";
//方块之间最大上升距离 这里是15格
let maxUpDis = 20;
system.initialize = function() {
    server.log("Elevator Plugin Loaded");
    system.listenForEvent("minecraft:block_interacted_with",(data)=>{
        let player = data.data.player;
        let bPosition = data.data.block_position;
        let playerPos = getPosCmp(player);
        let bX = transNum(bPosition.x);
        let bY = transNum(bPosition.y);
        let bZ = transNum(bPosition.z);
        let pX = transNum(playerPos.x);
        let pY = transNum(playerPos.y);
        let pZ = transNum(playerPos.z);
        let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
        let tickingArea = tickAreaCmp.data.ticking_area;
        let ifFind = false;
        let block = system.getBlock(tickingArea,bX,bY,bZ);
        let blockName = block.__identifier__;
        //system.sendText(player,`与方块交互 ${blockName} (${pX},${pY},${pZ}) (${bX},${bY},${bZ})`);
        if(blockName == eBlockName && pX == bX && pZ == bZ){
            //server.log("玩家触发电梯方块");
            for (let i = 1; i <= maxUpDis; i++) {
                let tblock = system.getBlock(tickingArea,bX,bY-i,bZ);
                let testBlockName = tblock.__identifier__;
                //server.log(`找到的方块名${testBlockName}`);
                if(testBlockName == blockName){
                    //system.sendText(player,`已找到向上电梯方块`);
                    system.executeCommand(`playsound tile.piston.in @a[name="${getName(player)}"] ${bX} ${bY} ${bZ} 1 1`,data=>{});
                    let pcmp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                    pcmp.data.y = bY - i + 1;
                    system.applyComponentChanges(player,pcmp);
                    system.executeCommand(`playsound tile.piston.out @a[name="${getName(player)}"] ${bX} ${bY - i +1} ${bZ} 1 1`,data=>{});
                    ifFind = true;
                    i = maxUpDis + 1;
                }
            }
            if(!ifFind){
                system.sendText(player, "未在下方找到电梯方块");
            }
        }
    });

    system.listenForEvent("minecraft:block_destruction_started",data=>{
        let player = data.data.player;
        let bPosition = data.data.block_position;
        let playerPos = getPosCmp(player);
        let bX = transNum(bPosition.x);
        let bY = transNum(bPosition.y);
        let bZ = transNum(bPosition.z);
        let pX = transNum(playerPos.x);
        let pY = transNum(playerPos.y);
        let pZ = transNum(playerPos.z);
        let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
        let tickingArea = tickAreaCmp.data.ticking_area;
        let ifFind = false;
        let block = system.getBlock(tickingArea,bX,bY,bZ);
        let blockName = block.__identifier__;
        //system.sendText(player,`点击方块 ${blockName} (${pX},${pY},${pZ}) (${bX},${bY},${bZ})`);
        if(blockName == eBlockName && pX == bX && pZ == bZ){
            //server.log("玩家触发电梯方块");
            for (let i = 1; i <= maxUpDis; i++) {
                let tblock = system.getBlock(tickingArea,bX,bY+i,bZ);
                let testBlockName = tblock.__identifier__;
                //server.log(`找到的方块名${testBlockName}`);
                if(testBlockName == blockName){
                    //system.sendText(player,`已找到向下电梯方块`);
                    system.executeCommand(`playsound tile.piston.in @a[name="${getName(player)}"] ${bX} ${bY} ${bZ} 1 1`,data=>{});
                    let pcmp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                    pcmp.data.y = bY + i + 1;
                    system.applyComponentChanges(player,pcmp);
                    system.executeCommand(`playsound tile.piston.out @a[name="${getName(player)}"] ${bX} ${bY + i +1} ${bZ} 1 1`,data=>{});
                    i = maxUpDis + 1;
                    ifFind = true;
                }
            }
            if(!ifFind){
                system.sendText(player, "未在上方找到电梯方块");
            }
        }
    });
}

function transNum(n:number):number{
    if(n >= 0){
        return Math.floor(n);
    }else{
        return Math.floor(n);
    }
}


function getPosCmp(entity: IEntity){
    return system.getComponent<IPositionComponent>(entity,MinecraftComponent.Position).data;
}

function getName(entity: IEntity) {
    return system.getComponent<INameableComponent>(entity, MinecraftComponent.Nameable).data.name;
  }

