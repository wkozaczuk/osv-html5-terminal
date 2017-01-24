import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDfCommand extends OsvCommandBase {
   typed() {
      return 'df';
   }

   matches(input: string) {
      return input.indexOf('df') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      if(commandArguments.length > 0 ) {
         return OsvCommandBase.urlBase + "/fs/df/" + encodeURIComponent(commandArguments[0]);
      }
      else {
         return OsvCommandBase.urlBase + "/fs/df";
      }
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput('<table>', false);
      this.cmd.displayOutput('<tr>' +
         '<td>Filesystem</td>' +
         '<td>Total</td>' +
         '<td>Used</td>' +
         '<td>Use%</td>' +
         '<td>Mounted on</td>' +
         '</tr>', false);
      response.forEach((entry) => {
         this.cmd.displayOutput('<tr>' +
            '<td>' + entry.filesystem + '</td>' +
            '<td>' + entry.btotal + '</td>' +
            '<td>' + (entry.btotal - entry.bfree) + '</td>' +
            '<td>' + (100 - Math.round(100 * (entry.bfree / entry.btotal))) + '</td>' +
            '<td>' + entry.mount + '</td>' +
            '</tr>', false);
      });
      this.cmd.displayOutput('</table>', false);
   }
}