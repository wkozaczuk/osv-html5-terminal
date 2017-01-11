import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvLsCommand extends OsvCommandBase {
   matches(input: string): boolean {
      return input.indexOf('ls') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]): string {
      let path: string = "";
      if (commandArguments.length > 0) {
         path = commandArguments[commandArguments.length - 1].replace(/\//g, "%2F");
      }
      else {
         path = "%2F";
      }

      return OsvCommandBase.urlBase + "/file/" + path + "?op=LISTSTATUS";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      let longFormat = options.contains("l");
      let showAll = options.contains("a") || options.contains("all");

      let entries = response.filter((entry)=> showAll || (entry.pathSuffix != '.' && entry.pathSuffix != '..'));

      if (options.contains("n")) {
         entries.sort((entry1, entry2)=> {
            if (entry1.pathSuffix < entry2.pathSuffix) {
               return -1;
            }
            if (entry1.pathSuffix > entry2.pathSuffix) {
               return 1;
            }
            return 0;
         })
      }

      if (longFormat) {
         this.cmd.displayOutput('<table>', false);
         entries.forEach((entry) => {
            this.cmd.displayOutput('<tr>' +
               '<td>' + entry.owner + '</td>' +
               '<td>' + entry.group + '</td>' +
               '<td>' + entry.length + '</td>' +
               '<td>' + entry.pathSuffix + '</td>' +
               '</tr>', false);
         });
         this.cmd.displayOutput('</table>', false);
      }
      else {
         this.cmd.displayOutput('', false);
         entries.forEach((entry)=>this.cmd.displayOutput(entry.pathSuffix, false));
      }
   }
}
