import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDmesgCommand extends OsvCommandBase {
   typed:string = 'dmesg';

   description:string = 'print operating system boot log';

   help:string = 'Usage: dmesg<BR><BR>\
      Print operating system boot log.';

   matches(input: string) {
      return input.indexOf('dmesg') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/dmesg";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}