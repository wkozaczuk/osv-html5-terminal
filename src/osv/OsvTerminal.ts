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
import {OsvCmdlineCommand} from "./OsvCmdlineCommand";
import {OsvDateCommand} from "./OsvDateCommand";
import {OsvPowerOffCommand} from "./OsvPowerOffCommand";
import {OsvDfCommand} from "./OsvDfCommand";
import {OsvMkdirCommand} from "./OsvMkdirCommand";
import {OsvRmCommand} from "./OsvRmCommand";
import {OsvUptimeCommand} from "./OsvUptimeCommand";
import {OsvFreeCommand} from "./OsvFreeCommand";

export class OsvTerminal extends Cmd {
   constructor(selector: string) {
      super({
         selector: selector,
         historyId: 'OsvTerminal',
         remoteCmdListUrl: 'commands.json',
         executableCommands: [
            new OsvCmdlineCommand(),
            new OsvCatCommand(),
            new OsvDateCommand(),
            new OsvDfCommand(),
            new OsvDmesgCommand(),
            new OsvLsCommand(),
            new OsvPowerOffCommand(),
            new OsvRebootCommand(),
            new OsvMkdirCommand(),
            new OsvRmCommand(),
            new OsvFreeCommand(),
            new OsvUptimeCommand()]
      })
   }
}