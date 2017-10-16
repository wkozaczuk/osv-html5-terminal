import {OsvCommandBase} from "./OsvCommandBase"
import {FileStatus} from "./OsvApi"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCdCommand extends OsvCommandBase<FileStatus> {
   private resolvedPath: string;

   typed:string = 'cd';

   description:string = 'change the shell working directory';

   help:string = "cd - change the shell working directory<BR><BR>\
      Usage: cd <path>";

   matches(input: string) {
      return input.indexOf('cd') === 0;
   }

   executeApi(commandArguments:string[], options: Set<string>): JQueryPromise<FileStatus> {
      const path: string = commandArguments[commandArguments.length - 1];
      this.resolvedPath = this.cmd.resolvePath(path);
      return this.cmd.api.getFileStatus(this.resolvedPath);
   }

   handleExecutionSuccess(options:Set<string>, response:FileStatus) {
      if(response.type == "DIRECTORY") {
         this.cmd.setCurrentPath(this.resolvedPath);
         this.cmd.displayOutput(`Changed current directory to ${this.resolvedPath}`, true)
      }
      else {
         this.cmd.displayOutput(`${this.resolvedPath} is not a directory`, true);
      }
   }
}
