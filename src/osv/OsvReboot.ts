import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

//TODO: Improve by showing 'rebooting ...' and checking if some status calls returns 200
// to show that it is back online
export class OsvRebootCommand extends OsvCommandBase {
   method: string = "POST";

   typed:string = 'reboot';

   description:string = 'reboot an OSv instance';

   help:string = 'Usage: reboot<BR><BR>\
      Reboot the instance.';

   matches(input: string) {
      return input.indexOf('reboot') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/reboot";
   }
   
   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}
