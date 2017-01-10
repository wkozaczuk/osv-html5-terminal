/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import {OsvShowCommandLineCommand,OsvCatCommand,OsvLsCommand,OsvDmesgCommand,OsvRebootCommand} from "./OsvCommands.js";
import {Cmd} from './Cmd.js'

export class OsvTerminal extends Cmd {
   constructor(selector:string) {
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