import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCmdlineCommand extends OsvCommandBase {
   typed:string = 'cmdline';

   description:string = 'print OSv application cmdline';

   help:string = 'Usage: cmdline<BR><BR>\
     Show OSv application cmdline.';

   matches(input: string) {
      return input === 'cmdline';
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return this.cmd.getInstanceSchemeHostPort() + "/os/cmdline";
   }
   
   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.toString(), true);
   }
}