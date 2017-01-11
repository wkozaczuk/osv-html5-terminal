/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import {Cmd} from "../cmd/Cmd";
import {OsvCatCommand} from "./OsvCatCommand";
import {OsvLsCommand} from "./OsvLsCommand";
import {OsvDmesgCommand} from "./OsvDmesgCommand";
import {OsvRebootCommand} from "./OsvReboot";
import {OsvCmdineCommand} from "./OsvCmdlineCommand";

export class OsvTerminal extends Cmd {
   constructor(selector: string) {
      super({
         selector: selector,
         historyId: 'OsvTerminal',
         remoteCmdListUrl: 'commands.json',
         executableCommands: [
            new OsvCmdineCommand(),
            new OsvCatCommand(),
            new OsvLsCommand(),
            new OsvDmesgCommand(),
            new OsvRebootCommand()]
      })
   }
}