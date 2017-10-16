/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import {Command} from "../cmd/Cmd";
import Set from "typescript-collections/dist/lib/Set";
import {OsvTerminal} from "./OsvTerminal";

export abstract class OsvCommandBase<T> implements Command {
   protected cmd: OsvTerminal;

   abstract readonly typed:string;
   abstract readonly description:string;
   abstract readonly help:string;

   abstract matches(input: string): boolean;
   abstract executeApi(commandArguments: string[], options: Set<string>):JQueryPromise<T>;  
   abstract handleExecutionSuccess(options: Set<string>,response:T);     

   handleExecutionError(response: any) {
      console.log(response);
      let text = (response.responseText || response.statusText ||  "").replace(/\n/g, "<BR>");
      this.cmd.displayOutput(`<span class="red_error">Failed due to: ${text}</span>`);
   }

   setCmd(cmd: OsvTerminal) {
      this.cmd = cmd;
   }

   execute(input: string) {
      let words: string[] = input.split(/\s+/);
      words.shift();
      //
      // Extract options first
      let commandArguments: string[] = [];
      let options = new Set<string>();
      while (words.length > 0) {
         let optionOrArgument = words.shift();
         if (optionOrArgument) {
            if (optionOrArgument.indexOf("--") == 0) {
               options.add(optionOrArgument.substr(2));
            }
            else if (optionOrArgument.indexOf("-") == 0) {
               let oneLetterOptions = optionOrArgument.substr(1).split("");
               oneLetterOptions.forEach((option)=>options.add(option));
            }
            else { // Argument
               commandArguments.push(optionOrArgument);
               break;
            }
         }
         else // No more words
            break;
      }
      // Add remaining words as arguments
      commandArguments.concat(words);

      if(options.contains('help')) {
         this.cmd.displayOutput(this.help);
      }
      else {
         this.executeApi(commandArguments, options).then(
            (response)=>this.handleExecutionSuccess(options, response),
            (response)=>this.handleExecutionError(response)
         );   
      }
   }

   humanReadableByteSize(bytes:number):string {
      let unit = 1024;
      if (bytes < unit) {
         return bytes + "B";
      }

      let exp = parseInt((Math.log(bytes) / Math.log(unit)) + '', 10);
      let size = "KMGTP".charAt(exp - 1);
      let precision = 1;
      return ( bytes / Math.pow(unit, exp)).toFixed(precision) + size;
  }
}