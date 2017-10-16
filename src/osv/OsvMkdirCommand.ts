import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvMkdirCommand extends OsvCommandBase<void> {
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
   
   executeApi(commandArguments:string[], options: Set<string>) {
      const path: string = commandArguments[commandArguments.length - 1];
      const resolvedPath = this.cmd.resolvePath(path);
      const createParents = options.contains("p") || options.contains("parents");
      return this.cmd.api.createDirectory(resolvedPath,createParents);
   }

   handleExecutionSuccess(options: Set<string>, response:void) {
      this.cmd.displayOutput("Directory created!", true);
   }
}
