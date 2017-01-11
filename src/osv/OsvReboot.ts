import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvRebootCommand extends OsvCommandBase {
   method: string = "POST";

   matches(input: string) {
      return input.indexOf('reboot') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/reboot";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), false);
   }
}
