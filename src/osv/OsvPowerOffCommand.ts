import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvPowerOffCommand extends OsvCommandBase {
   method: string = "POST";

   typed() {
      return 'poweroff';
   }

   matches(input: string) {
      return input.indexOf('poweroff') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/poweroff";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}
