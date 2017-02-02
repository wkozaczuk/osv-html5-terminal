import {Command} from "../cmd/Cmd";
import {OsvTerminal} from "./OsvTerminal";

export class OsvPwdCommand implements Command {
   private cmd:OsvTerminal;

   typed:string = 'pwd';

   description:string = 'show the shell working directory';

   help:string = "pwd - show the shell working directory<BR><BR>\
      Usage: pwd";

   matches(input: string) {
      return input.indexOf('pwd') === 0;
   }

   setCmd(cmd: OsvTerminal) {
      this.cmd = cmd;
   }

   execute(input: string) {
      this.cmd.displayOutput(`${this.cmd.getCurrentPath()}`, true);
   }
}