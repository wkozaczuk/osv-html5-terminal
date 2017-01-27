import {Command} from "../cmd/Cmd";
import {OsvTerminal} from "./OsvTerminal";

export class OsvPwdCommand implements Command {
   private cmd:OsvTerminal;

   typed() {
      return 'pwd';
   }

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