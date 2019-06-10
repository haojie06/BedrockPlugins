export function getTime():string {
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours() + 8; //GMT+8
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return `${month}/${day}/${hour}-${minute}-${second}`;
}
//检查一个名字对应的物品是不是方块
export function checkIfBlock(blockName:string):boolean{
    let blocks = ["minecraft:stone","minecraft:stone","minecraft:grass","minecraft:dirt","minecraft:cobblestone","minecraft:planks","minecraft:sapling","minecraft:bedrock","minecraft:flowing_water","minecraft:water","minecraft:flowing_lava","minecraft:lava","minecraft:sand","minecraft:gravel","minecraft:gold_ore","minecraft:iron_ore","minecraft:iron_coal","minecraft:log","minecraft:leaves","minecraft:sponge","minecraft:glass","minecraft:lapis_ore","minecraft:lapis_block","minecraft:dispenser","minecraft:sandstone","minecraft:noteblock","minecraft:bed","minecraft:golden_rail","minecraft:detector_rail","minecraft:sticky_piston","minecraft:web","minecraft:piston","minecraft:wool","minecraft:gold_block","minecraft:iron_block","minecraft:stone_slab","minecraft:brick_block","minecraft:tnt","minecraft:bookshelf","minecraft:mossy_cobblestone","minecraft:obsidian","minecraft:chest","minecraft:oak_stairs","minecraft:diamond_ore","minecraft:diamond_block","minecraft:crafting_table","minecraft:furnace"];
    if (blocks.indexOf(blockName) == -1) {
        return false;
    }
    else{
        return true;
    }
}
//检查一个名字对应的物品是不是容器
export function checkIfContainer(blockName:string):boolean{
    let blocks = ["minecraft:trapped_chest","minecraft:chest","minecraft:hopper","minecraft:furnace","minecraft:lit_furnace"];
    if (blocks.indexOf(blockName) == -1) {
        return false;
    }
    else{
        return true;
    }
}

export function stringToInt(st:number):number{
    return Number(st.toFixed(0));
}

//转换小数
export function transNum(n:number):number{
    if(n >= 0){
        return Math.floor(n);
    }else{
        return Math.ceil(n);
    }
}

