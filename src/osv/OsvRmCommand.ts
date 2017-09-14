import {OsvApiCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvRmCommand extends OsvApiCommandBase<void> {
   method: string = "DELETE";

   typed:string = 'rm';

   description:string = 'remove files or directories';

   help:string = 'Usage: rm FILE...';

   matches(input: string) {
      return input.indexOf('rm') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>): JQueryPromise<void> {
      const path: string = commandArguments[commandArguments.length - 1];
      const resolvedPath = this.cmd.resolvePath(path);
      return this.cmd.api.deleteFile(resolvedPath);
   }

   handleExecutionSuccess(options: Set<string>, response: void) {
      this.cmd.displayOutput("File deleted!", true);
   }
}