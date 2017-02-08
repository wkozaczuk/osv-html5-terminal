import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDateCommand extends OsvCommandBase {
   typed:string ='date';

   description:string = 'print the system date and time';

   help:string = "Usage: date<BR><BR>\
      Print OSv reported date.";
   
   matches(input: string) {
      return input.indexOf('date') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return this.cmd.getInstanceSchemeHostPort() + "/os/date";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}