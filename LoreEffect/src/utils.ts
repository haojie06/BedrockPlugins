import { system } from "./system";
export function utilsReg(){
}
export function getName(entity: IEntity) {
  return system.getComponent<INameableComponent>(entity, MinecraftComponent.Nameable).data.name;
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

export function getPositionComp(entity){
    if (system.hasComponent(entity, "minecraft:position")) {
        let comp = system.getComponent(entity,MinecraftComponent.Position);
        return comp;
    }
    else{
        throw "error";
    }
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
export function randomNum(minNum:number,maxNum:number){ 
    return Math.floor(Math.random()*(maxNum-minNum+1)+minNum); 
} 
export function possibility(p:number){
    if(Math.random() < p){
        return true;
    }
    else{
        return false;
    }
}
