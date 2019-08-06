export const system = server.registerSystem(0, 0);
export let playerKicked = [];
let kickTick = 0

export interface IUseCraftTableComponent {
    ifUse:boolean,
    ifShow:boolean
}

export function kickTickReset() {
    kickTick = 0;
}

export function kickTickAdd(){
    kickTick++;
    if (kickTick >= 40) {
        kickTick = 0;
        return true;
    }
    else{
        return false;
    }
}