import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvConnectCommand extends OsvCommandBase {
   private newInstanceSchemeHostPort:string;
   typed:string = 'connect';

   description:string = 'switch this terminal to point to another OSv instance';

   help:string = 'Usage: connect <schemeHostNamePort> <BR><BR>\
      Switch this terminal to point to another OSv instance.';

   matches(input: string) {
      return input.indexOf('connect') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      this.newInstanceSchemeHostPort = commandArguments[0];
      return this.newInstanceSchemeHostPort + "/os/name";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      if(response == "OSv") {
         $("#status").html(`Connected to ${this.newInstanceSchemeHostPort}`);
         this.cmd.setInstanceSchemeHostPort(this.newInstanceSchemeHostPort);
         this.cmd.setCurrentPath("/");
         this.cmd.displayOutput(`Successfully connected to ${this.newInstanceSchemeHostPort}`, true);
      }
      else {
         this.cmd.displayOutput(`Git weird response from ${this.newInstanceSchemeHostPort}`, true);
      }
   }
}