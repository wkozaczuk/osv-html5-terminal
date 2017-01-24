import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvLsCommand extends OsvCommandBase {

   private path:string;
   private static LongDateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
   //private OverYearDateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };

   typed() {
      return 'ls';
   }

   matches(input: string): boolean {
      return input.indexOf('ls') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]): string {
      if (commandArguments.length > 0) {
         this.path = commandArguments[commandArguments.length - 1];
      }
      else {
         this.path = "/";
      }

      let rpath = encodeURIComponent(this.path);
      return OsvCommandBase.urlBase + "/file/" + rpath + "?op=LISTSTATUS";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.listDirectory(options,response);
      //
      // Check if we need to go recursive
      if (options.contains("R")) {
         this.listSubdirectories(options, response, this.path, []);
      }
   }

   private listSubdirectories(options: Set<string>, response: any, thisPath:string, otherSubdirectories: string[]) {
      let prefixPath = thisPath[thisPath.length-1] == '/' ? thisPath.substr(0,thisPath.length-1) : thisPath;

      let subdirectories = response
         .filter((entry) => entry.pathSuffix != '.' && entry.pathSuffix != '..' && entry.type == 'DIRECTORY')
         .map((entry) => `${prefixPath}/${entry.pathSuffix}`);

      let allSubdirectories = subdirectories.concat(otherSubdirectories);

      if(allSubdirectories.length > 0) {
         let nextSubdirectory = allSubdirectories.shift();

         $.ajax({
            url: OsvCommandBase.urlBase + "/file/" + encodeURIComponent(nextSubdirectory) + "?op=LISTSTATUS",
            method: this.method,
            success: (newResponse)=>{
               this.listDirectory(options,newResponse,nextSubdirectory);
               this.listSubdirectories(options, newResponse, nextSubdirectory, allSubdirectories)
            },
            error: (response)=>this.handleExecutionError(response)
         });
      }
   }

   private listDirectory(options: Set<string>, response: any, thisDirectory?: string) {
      let longFormat = options.contains("l");
      let showAll = options.contains("a") || options.contains("all");

      let entries = response.filter((entry) => showAll || (entry.pathSuffix != '.' && entry.pathSuffix != '..'));

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
         if(thisDirectory) {
            this.cmd.displayOutput(`<tr><td colspan="7">${thisDirectory}:</td></tr>`, false);
         }
         entries.forEach((entry) => {
            let directoryPrefix = entry.type == 'DIRECTORY' ? 'd' : '-';

            //TODO: Permissions for some directories look different - fit it
            let permissionsRwx =
               this.rwx(parseInt(entry.permission[0])) +
               this.rwx(parseInt(entry.permission[1])) +
               this.rwx(parseInt(entry.permission[2]));

            let modificationDateTime = new Date(entry.modificationTime * 1000);
            //TODO: Make it use with last year cut off logic tha would NOT show hour and minute
            let modificationDateTimeStr = modificationDateTime.toLocaleDateString('en-US', OsvLsCommand.LongDateTimeFormatOptions);

            this.cmd.displayOutput('<tr>' +
               `<td>${directoryPrefix}${permissionsRwx}</td>` +
               `<td>${entry.replication}</td>` +
               `<td>${entry.owner}</td>` +
               `<td>${entry.group}</td>` +
               `<td>${entry.length}</td>` +
               `<td>${modificationDateTimeStr.substr(0,modificationDateTimeStr.length-2)}</td>` +
               `<td>${entry.pathSuffix}</td>` +
               '</tr>', false);
         });
         this.cmd.displayOutput('</table>', false);
      }
      else {
         this.cmd.displayOutput('', false);
         entries.forEach((entry)=>this.cmd.displayOutput(entry.pathSuffix, false));
      }
   }

   private rwx(permissions:number):string {
      switch(permissions) {
         case 0: return "---";
         case 1: return "--x";
         case 2: return "-w-";
         case 3: return "-wx";
         case 4: return "r--";
         case 5: return "r-x";
         case 6: return "rw-";
         case 7: return "rwx";
         default: return "   ";
      }
   }
}
