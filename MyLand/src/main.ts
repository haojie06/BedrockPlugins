import { system } from "./system";
import {commandReg} from "./commands"
system.initialize = function () {
    server.log("Myland Loaded");
    commandReg();
}