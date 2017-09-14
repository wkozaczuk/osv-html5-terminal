import {OsvApiCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDmesgCommand extends OsvApiCommandBase<string> {
   typed:string = 'dmesg';

   description:string = 'print operating system boot log';

   help:string = 'Usage: dmesg<BR><BR>\
      Print operating system boot log.';

   matches(input: string) {
      return input.indexOf('dmesg') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>) : JQueryPromise<string> {
      return this.cmd.api.getSystemLog();
   }

   handleExecutionSuccess(options: Set<string>, response: string) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}