import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvCatCommand extends OsvCommandBase {
   matches(input: string) {
      return input.indexOf('cat') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      const path: string = commandArguments[commandArguments.length - 1];
      const rpath: string = encodeURIComponent(path);
      return OsvCommandBase.urlBase + "/file/" + rpath + "?op=GET";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      this.cmd.displayOutput('', false);
      this.cmd.displayOutput(response.replace(/\n/g, "<BR>"), false);
   }
}