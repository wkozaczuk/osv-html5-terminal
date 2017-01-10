/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import {Cmd} from "../cmd/Cmd.js";
import {OsvShowCommandLineCommand, OsvCatCommand, OsvLsCommand, OsvRebootCommand, OsvDmesgCommand} from "./OsvCommands.js";

export class OsvTerminal extends Cmd {
   constructor(selector: string) {
      super({
         selector: selector,
         historyId: 'OsvTerminal',
         remoteCmdListUrl: 'commands.json',
         executableCommands: [
            new OsvShowCommandLineCommand(),
            new OsvCatCommand(),
            new OsvLsCommand(),
            new OsvDmesgCommand(),
            new OsvRebootCommand()]
      })
   }
}