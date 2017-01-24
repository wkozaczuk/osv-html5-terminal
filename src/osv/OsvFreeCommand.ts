import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvFreeCommand extends OsvCommandBase {
   matches(input: string) {
      return input.indexOf('free') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/memory/total";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {

      if(typeof(response) === "number") {
         const totalMemory = <number>response;
         $.ajax({
            url: OsvCommandBase.urlBase +"/os/memory/free",
            method: this.method,
            success: (freeMemoryResponse)=>{
               if(typeof(freeMemoryResponse) === "number") {
                  this.displayOutputTable(totalMemory,<number>freeMemoryResponse)
               }
               else {
                  this.handleWrongData();
               }
            },
            error: (response)=>this.handleExecutionError(response)
         });
      }
      else {
         this.handleWrongData();
      }
   }

   private displayOutputTable(total:number,free:number) {
      this.cmd.displayOutput('<table>', false);
      this.cmd.displayOutput('<tr><td>&nbsp;</td><td>total</td><td>used</td><td>free</td></tr>',false);
      this.cmd.displayOutput(`<tr><td>Mem</td><td>${total}</td><td>${total-free}</td><td>${free}</td></tr>`,false);
      this.cmd.displayOutput('</table>', false);
   }

   private handleWrongData() {
      this.cmd.displayOutput('', false);
      this.cmd.displayOutput("Wrong data returned from server", false);
   }
}