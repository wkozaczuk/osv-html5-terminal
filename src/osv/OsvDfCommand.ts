import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvDfCommand extends OsvCommandBase {
   typed:string = 'df';

   description:string = 'report file system disk space usage';

   help:string = 'df - report file system disk space usage<BR><BR>\
      Usage: df [FILE]... <BR><BR>\
      Show information about the file system mount, or for all mounts by default.';

   matches(input: string) {
      return input.indexOf('df') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      if(commandArguments.length > 0 ) {
         return OsvCommandBase.urlBase + "/fs/df/" + encodeURIComponent(commandArguments[0]);
      }
      else {
         return OsvCommandBase.urlBase + "/fs/df";
      }
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      let output = '<table>';
      output = output + '<tr>' +
         '<th>Filesystem</th>' +
         '<th>Total</th>' +
         '<th>Used</th>' +
         '<th>Use%</th>' +
         '<th>Mounted on</th>' +
         '</tr>';
      response.forEach((entry) => {
         output = output + '<tr>' +
            '<td>' + entry.filesystem + '</td>' +
            '<td>' + entry.btotal + '</td>' +
            '<td>' + (entry.btotal - entry.bfree) + '</td>' +
            '<td>' + (100 - Math.round(100 * (entry.bfree / entry.btotal))) + '</td>' +
            '<td>' + entry.mount + '</td>' +
            '</tr>';
      });
      output = output + '</table>';
      this.cmd.displayOutput(output, true);
   }
}