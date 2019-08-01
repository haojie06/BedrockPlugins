import { system } from "./system";

export interface Vec {
    x : number;
    y : number;
    z : number;
}

export function getName(entity: IEntity) {
  return system.getComponent<INameableComponent>(entity, MinecraftComponent.Nameable).data.name;
}

export function getVecOfEntity(entity:IEntity){
    let vec:Vec;
    if (system.hasComponent(entity, "minecraft:position")) {
        let comp = system.getComponent<IPositionComponent>(entity,MinecraftComponent.Position);
        let px,py,pz;
        vec.x = Math.floor(px);
        vec.y = Math.floor(py);
        vec.z = Math.floor(pz);
    }
    else{
        vec.x = 0;
        vec.y = 0;
        vec.z = 0;
    }
    return vec;
}

export function getPositionofEntity(entity: IEntity){
  let position;
  if (system.hasComponent(entity, "minecraft:position")) {
      let comp = system.getComponent<IPositionComponent>(entity,MinecraftComponent.Position);
      let px,py,pz;
      position = transNum(comp.data.x) + " " + transNum(comp.data.y) + " " + transNum(comp.data.z);
  }
  else{
      position = "无法获得坐标";
  }
  return position;
}

export function getDimensionOfEntity(entity: IEntity){
  let dimension;
  if (system.hasComponent(entity, "stone:dimension")) {
    let comp = system.getComponent(entity,MinecraftComponent.Dimension);
    dimension = comp.data;
}
  else{
    dimension = "无法获得维度";
  }
  return dimension;
}


export function transNum(num:number):number{
  if (num >= 0){
      num = Math.floor(num);
  }
  else{
      num = Math.floor(num);
  }
  return num;
}

export function getMax(a:number,b:number){
    if(a > b){
        return a;
    }
    else{
        return b;
    }
}

export function getMin(a:number,b:number){
    if(a < b){
        return a;
    }
    else{
        return b;
    }
}

//利用tag来给予op破坏权限
export function checkAdmin(entity:IEntity){
    let ifAdmin = false;
    let extra = system.getComponent(entity,MinecraftComponent.ExtraData).data;
    if(extra.value.abilities.value.op.value == "1"){
        ifAdmin = true;
    }
    else{
        ifAdmin = false;
    }
    return ifAdmin;
}