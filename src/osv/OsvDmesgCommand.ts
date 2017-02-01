import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDmesgCommand extends OsvCommandBase {
   typed() {
      return 'dmesg';
   }

   matches(input: string) {
      return input.indexOf('dmesg') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/dmesg";
   }

   help() {
      return "Usage: uptime <BR>\
      Print how long the system has been running.";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}