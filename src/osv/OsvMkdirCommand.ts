import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvMkdirCommand extends OsvCommandBase {
   method: string = "PUT";

   typed() {
      return 'mkdir';
   }

   matches(input: string) {
      return input.indexOf('mkdir') === 0;
   }

   help() {
      return "Usage: uptime <BR>\
      Print how long the system has been running.";
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