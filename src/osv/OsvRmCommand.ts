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

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput('', false);
      this.cmd.displayOutput("File deleted!", false);
   }
}