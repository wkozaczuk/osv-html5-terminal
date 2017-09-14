import {OsvApiCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

//TODO: Improve by showing 'rebooting ...' and checking if some status calls returns 200
// to show that it is back online
// Or it could be that this waits until OSv is rebooted
export class OsvRebootCommand extends OsvApiCommandBase<void> {
   typed:string = 'reboot';

   description:string = 'reboot an OSv instance';

   help:string = 'Usage: reboot<BR><BR>\
      Reboot the instance.';

   matches(input: string) {
      return input.indexOf('reboot') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>): JQueryPromise<void> {
      return this.cmd.api.reboot();
   }
   
   handleExecutionSuccess(options: Set<string>, response: void) {
      //this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}
