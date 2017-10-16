import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvConnectCommand extends OsvCommandBase<string> {
   typed:string = 'connect';
   currentInstanceSchemeHostPort:string;

   description:string = 'switch this terminal to point to another OSv instance';

   help:string = 'Usage: connect <schemeHostNamePort> <BR><BR>\
      Switch this terminal to point to another OSv instance.';

   matches(input: string) {
      return input.indexOf('connect') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>) : JQueryPromise<string> {
      this.currentInstanceSchemeHostPort = this.cmd.api.getInstanceSchemeHostPort();
      this.cmd.api.setInstanceSchemeHostPort(commandArguments[0]);
      return this.cmd.api.getOsName();   
   }   

   handleExecutionSuccess(options: Set<string>, response: string) {
      if(response == "OSv") {
         $("#status").html(`Connected to ${this.cmd.api.getInstanceSchemeHostPort()}`);
         this.cmd.setCurrentPath("/");
         this.cmd.displayOutput(`Successfully connected to ${this.cmd.api.getInstanceSchemeHostPort()}`, true);
      }
      else {
         this.cmd.displayOutput(`Git weird response from ${this.cmd.api.getInstanceSchemeHostPort()}`, true);
         this.cmd.setInstanceSchemeHostPort(this.currentInstanceSchemeHostPort);         
      }
   }

   handleExecutionError(response: any) {
      this.cmd.setInstanceSchemeHostPort(this.currentInstanceSchemeHostPort);
      super.handleExecutionError(response);
   }
}
