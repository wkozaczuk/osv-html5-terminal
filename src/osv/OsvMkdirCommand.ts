import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvMkdirCommand extends OsvCommandBase {
   method: string = "PUT";

   typed:string = 'mkdir';

   description:string = 'make directories';

   help:string = 'mkdir - make directories<BR><BR>\
      Usage: mkdir [OPTION]... DIRECTORY... <BR><BR>\
      Create the DIRECTORY(ies). <BR><BR>\
      Options:<BR><BR>\
         -p, --parents  make parent directories as needed';

   matches(input: string) {
      return input.indexOf('mkdir') === 0;
   }
   
   buildUrl(options: Set<string>, commandArguments: string[]) {
      const path: string = commandArguments[commandArguments.length - 1];
      const resolvedPath = this.cmd.resolvePath(path);
      const rpath: string = encodeURIComponent(resolvedPath);
      let basePath = OsvCommandBase.urlBase + "/file/" + rpath + "?op=MKDIRS&permission=0755";

      const createParents = options.contains("p") || options.contains("parents");
      if(createParents) {
         return basePath + "&createParent=true"
      }
      else {
         return basePath;
      }
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput("Directory created!", true);
   }
}