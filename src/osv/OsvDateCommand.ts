import {OsvApiCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDateCommand extends OsvApiCommandBase<string> {
   typed:string ='date';

   description:string = 'print the system date and time';

   help:string = "Usage: date<BR><BR>\
      Print OSv reported date.";
   
   matches(input: string) {
      return input.indexOf('date') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>) {
      return this.cmd.api.getSystemDate();
   }

   handleExecutionSuccess(options: Set<string>, response: string) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}