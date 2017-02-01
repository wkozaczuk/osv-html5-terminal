import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCatCommand extends OsvCommandBase {
   typed() {
      return 'cat';
   }

   matches(input: string) {
      return input.indexOf('cat') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      const path: string = commandArguments[commandArguments.length - 1];
      const resolvedPath = this.cmd.resolvePath(path);
      const rpath: string = encodeURIComponent(resolvedPath);
      return OsvCommandBase.urlBase + "/file/" + rpath + "?op=GET";
   }

   help() {
      return "Usage: cat [FILE]... <BR><BR>\
      Concatenate FILE(s), or standard input, to standard output.";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      //TODO escape HTML
      //const escapedOutput =
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), true);
   }
}