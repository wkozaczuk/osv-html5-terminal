import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvPowerOffCommand extends OsvCommandBase<void> {
   typed: string = 'poweroff';

   description:string = 'poweroff an OSv instance';

   help:string = 'Usage: poweroff<BR><BR>\
      Poweroff the instance.';

   matches(input: string) {
      return input.indexOf('poweroff') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>): JQueryPromise<void> {
      return this.cmd.api.powerOff();
   }
   
   handleExecutionSuccess(options: Set<string>, response:void) {
      //TODO: Eventually provide 
      //this.cmd.displayOutput(response.toStrreplace(/\n/g, "<BR>"), true); 
   }
}
