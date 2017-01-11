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
import {OsvDateCommand} from "./OsvDateCommand";
import {OsvPowerOffCommand} from "./OsvPowerOffCommand";
import {OsvDfCommand} from "./OsvDfCommand";

export class OsvTerminal extends Cmd {
   constructor(selector: string) {
      super({
         selector: selector,
         historyId: 'OsvTerminal',
         remoteCmdListUrl: 'commands.json',
         executableCommands: [
            new OsvCmdineCommand(),
            new OsvCatCommand(),
            new OsvDateCommand(),
            new OsvDfCommand(),
            new OsvDmesgCommand(),
            new OsvLsCommand(),
            new OsvPowerOffCommand(),
            new OsvRebootCommand()]
      })
   }
}