import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCdCommand extends OsvCommandBase {
   private resolvedPath:string;
   typed() {
      return 'cd';
   }

   matches(input: string) {
      return input.indexOf('cd') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      const path: string = commandArguments[commandArguments.length - 1];
      this.resolvedPath = this.cmd.resolvePath(path);
      const rpath: string = encodeURIComponent(this.resolvedPath);
      return OsvCommandBase.urlBase + "/file/" + rpath + "?op=GETFILESTATUS";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      if(response.type == "DIRECTORY") {
         this.cmd.setCurrentPath(this.resolvedPath);
         this.cmd.displayOutput(`Changed current directory to ${this.resolvedPath}`, true)
      }
      else {
         this.cmd.displayOutput(`${this.resolvedPath} is not a directory`, false);
      }
   }
}