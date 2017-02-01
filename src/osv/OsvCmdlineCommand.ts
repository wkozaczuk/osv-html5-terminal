import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCmdlineCommand extends OsvCommandBase {
   typed() {
      return 'cmdline';
   }

   matches(input: string) {
      return input === 'cmdline';
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/cmdline";
   }

   help() {
      return "Usage: uptime <BR>\
      Print how long the system has been running.";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.toString(), true);
   }
}