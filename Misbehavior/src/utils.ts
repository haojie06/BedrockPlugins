import { system } from "./system";
export let destroyCountMap = new Map();
let destroyCountTimeStamp = 0;
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

export function getDimensionOfEntity(entity: IEntity){
  let dimension:string;
  if (system.hasComponent(entity, "stone:dimension")) {
    let comp = system.getComponent(entity,MinecraftComponent.Dimension);
    dimension = String(comp.data);
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

export function getTime():string {
  let date = new Date();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours() + 8; //GMT+8
  let minute = date.getMinutes();
  let second = date.getSeconds();
  return `${month}/${day}/${hour}-${minute}-${second}`;
}

export function checkMayFly(entity:IEntity){
  try {
    let extradata = system.getComponent(entity,MinecraftComponent.ExtraData).data;
    let mayfly = Number(extradata.value.abilities.value.mayfly.value);
    if(mayfly == 1){
      return true;
    }
    else{
      return false;
    }
  } catch (error) {
    return false;
  }
}

export function checkFlying(entity:IEntity){
  try {
    let extradata = system.getComponent(entity,MinecraftComponent.ExtraData).data;
    let mayfly = extradata.toString();
    return mayfly;

  } catch (error) {
    return "";
  }
}

export function getDesTimeStamp(){
  return destroyCountTimeStamp;
}

export function setDesTimeStamp(timestamp){
  destroyCountTimeStamp = timestamp;
}