let system;
export function utilsReg(sys){
  system = sys;
}
export function getName(entity: IEntity) {
  return system.getComponent(entity, MinecraftComponent.Nameable).data.name;
}

export function getPositionofEntity(entity: IEntity){
  let position;
  if (system.hasComponent(entity, "minecraft:position")) {
      let comp = system.getComponent(entity,MinecraftComponent.Position);
      let px,py,pz;
      position = transNum(comp.data.x) + " " + transNum(comp.data.y) + " " + transNum(comp.data.z);
  }
  else{
      position = "无法获得坐标";
  }
  return position;
}

function transNum(num:number):number{
  if (num >= 0){
      num = Math.floor(num);
  }
  else{
      num = Math.floor(num);
  }
  return num;
}