import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDateCommand extends OsvCommandBase {
   typed() {
      return 'date';
   }

   matches(input: string) {
      return input.indexOf('date') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/date";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput('', false);
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), false);
   }
}