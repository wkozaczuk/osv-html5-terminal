import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCmdlineCommand extends OsvCommandBase<string> {
   typed: string = 'cmdline';

   description:string = 'print OSv application cmdline';

   help:string = 'Usage: cmdline<BR><BR>\
     Show OSv application cmdline.';

   matches(input: string) {
      return input === 'cmdline';
   }

   executeApi(commandArguments: string[], options: Set<string>): JQueryPromise<string> {
      return this.cmd.api.getCmdline(); 
  }
   
   handleExecutionSuccess(options:Set<string>, response:string) {
      this.cmd.displayOutput(response.toString(), true);
   }
}
