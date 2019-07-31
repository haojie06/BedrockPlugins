import { attackReg } from "./effect/attack";
import {equReg} from "./effect/equipment";
import { utilsReg } from "./utils"
import {system} from "./system"

system.initialize = function () {
    server.log("LoreEffect Loaded");
    utilsReg();
    attackReg();
    equReg();
}
