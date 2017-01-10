/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import * as Collections from './../node_modules/typescript-collections/dist/lib/umd.min.js';
import {Cmd,Command} from "./Cmd.js";

abstract class OsvCommandBase implements Command {
   protected static urlBase = "http://localhost:8000";
   protected cmd:Cmd;

   method:string = "GET";

   abstract matches(input:string):boolean;
   abstract buildUrl(options:Collections.Set<string>,commandArguments:string[]):string
   abstract handleExecutionSuccess(options:Collections.Set<string>,response:any);

   handleExecutionError(response:any) {
      let text = (response.responseText || "").replace(/\n/g,"<BR>");
      this.cmd.displayOutput("Failed: " + text);
   }

   setCmd(cmd:Cmd) {
      this.cmd = cmd;
   }

   execute(input:string) {
      let words:string[] = input.split(/\s+/);
      words.shift();
      //
      // Extract options first
      let commandArguments:string[] = [];
      let options = new Collections.Set<string>();
      while(words.length > 0) {
         let optionOrArgument = words.shift();
         if(optionOrArgument) {
            if(optionOrArgument.indexOf("--") == 0) {
               options.add(optionOrArgument.substr(2));
            }
            else if(optionOrArgument.indexOf("-") == 0) {
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

      $.ajax({
         url:this.buildUrl(options,commandArguments),
         method:this.method,
         success:(response)=>this.handleExecutionSuccess(options,response),
         error:(response)=>this.handleExecutionError(response)
      });
   }
}

export class OsvShowCommandLineCommand extends OsvCommandBase {
   matches(input:string) {
      return input === 'cmdline';
   }

   buildUrl(options:Collections.Set<string>,commandArguments:string[]) {
      return OsvCommandBase.urlBase + "/os/cmdline";
   }

   handleExecutionSuccess(options:Collections.Set<string>,response:any) {
      this.cmd.displayOutput(response.toString(),false);
   }
}

export class OsvCatCommand extends OsvCommandBase {
   matches(input: string) {
      return input.indexOf('cat') === 0;
   }

   buildUrl(options:Collections.Set<string>,commandArguments:string[]) {
      const path:string = commandArguments[commandArguments.length-1];
      const rpath:string = path.replace(/\//g,"%2F");
      return OsvCommandBase.urlBase + "/file/" + rpath + "?op=GET";
   }

   handleExecutionSuccess(options:Collections.Set<string>,response:any) {
      this.cmd.displayOutput('',false);
      this.cmd.displayOutput(response.replace(/\n/g,"<BR>"),false);
   }
}

export class OsvLsCommand extends OsvCommandBase {
   matches(input: string): boolean {
      return input.indexOf('ls') === 0;
   }

   buildUrl(options:Collections.Set<string>,commandArguments:string[]): string {
      let path:string = "";
      if(commandArguments.length > 0 ) {
         path = commandArguments[commandArguments.length-1].replace(/\//g,"%2F");
      }
      else {
         path = "%2F";
      }

      return OsvCommandBase.urlBase + "/file/" + path + "?op=LISTSTATUS";
   }

   handleExecutionSuccess(options:Collections.Set<string>,response:any) {
      let longFormat = options.contains("l");
      let showAll = options.contains("a") ||  options.contains("all");

      let entries = response.filter((entry)=> showAll || (entry.pathSuffix != '.' && entry.pathSuffix != '..'));

      if(options.contains("n")) {
         entries.sort((entry1,entry2)=>{
            if (entry1.pathSuffix < entry2.pathSuffix) {
               return -1;
            }
            if (entry1.pathSuffix > entry2.pathSuffix ) {
               return 1;
            }
            return 0;
         })
      }

      if(longFormat) {
         this.cmd.displayOutput('<table>',false);
         entries.forEach((entry) => {
            this.cmd.displayOutput('<tr>' +
               '<td>' + entry.owner + '</td>' +
               '<td>' + entry.group + '</td>' +
               '<td>' + entry.length + '</td>' +
               '<td>' + entry.pathSuffix + '</td>' +
               '</tr>', false);
         });
         this.cmd.displayOutput('</table>',false);
      }
      else {
         this.cmd.displayOutput('',false);
         entries.forEach((entry)=>this.cmd.displayOutput(entry.pathSuffix,false));
      }
   }
}

export class OsvDmesgCommand extends OsvCommandBase {
   matches(input: string) {
      return input.indexOf('dmesg') === 0;
   }

   buildUrl(options:Collections.Set<string>,commandArguments:string[]) {
      return OsvCommandBase.urlBase + "/os/dmesg";
   }

   handleExecutionSuccess(options:Collections.Set<string>,response:any) {
      this.cmd.displayOutput(response.replace(/\n/g,"<BR>"),false);
   }
}

export class OsvRebootCommand extends OsvCommandBase {
   method:string = "POST";

   matches(input: string) {
      return input.indexOf('reboot') === 0;
   }

   buildUrl(options:Collections.Set<string>,commandArguments:string[]) {
      return OsvCommandBase.urlBase + "/os/reboot";
   }

   handleExecutionSuccess(options:Collections.Set<string>,response:any) {
      this.cmd.displayOutput(response.replace(/\n/g,"<BR>"),false);
   }
}