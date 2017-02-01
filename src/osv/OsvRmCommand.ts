import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvRmCommand extends OsvCommandBase {
   method: string = "DELETE";

   typed() {
      return 'rm';
   }

   matches(input: string) {
      return input.indexOf('rm') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      const path: string = commandArguments[commandArguments.length - 1];
      const resolvedPath = this.cmd.resolvePath(path);
      const rpath: string = encodeURIComponent(resolvedPath);
      return OsvCommandBase.urlBase + "/file/" + rpath + "?op=DELETE";
   }

   help() {
      return "Usage: uptime <BR>\
      Print how long the system has been running.";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput("File deleted!", true);
   }
}