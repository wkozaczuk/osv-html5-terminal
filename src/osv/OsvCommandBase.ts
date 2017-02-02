/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import {Command} from "../cmd/Cmd";
import Set from "typescript-collections/dist/lib/Set";
import {OsvTerminal} from "./OsvTerminal";

export abstract class OsvCommandBase implements Command {
   protected static urlBase = "http://localhost:8000";
   protected cmd: OsvTerminal;

   method: string = "GET";

   abstract readonly typed:string;
   abstract readonly description:string;
   abstract readonly help:string;

   abstract matches(input: string): boolean;

   abstract buildUrl(options: Set<string>, commandArguments: string[]): string

   abstract handleExecutionSuccess(options: Set<string>, response: any);

   handleExecutionError(response: any) {
      let text = (response.responseText || "").replace(/\n/g, "<BR>");
      this.cmd.displayOutput("Failed: " + text);
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
         $.ajax({
            url: this.buildUrl(options, commandArguments),
            method: this.method,
            success: (response)=>this.handleExecutionSuccess(options, response),
            error: (response)=>this.handleExecutionError(response)
         });
      }
   }
}