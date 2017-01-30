import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvFreeCommand extends OsvCommandBase {
   typed() {
      return 'free';
   }

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
      let output = '<table>';
      output = output + '<tr><td>&nbsp;</td><td>total</td><td>used</td><td>free</td></tr>';
      output = output + `<tr><td>Mem</td><td>${total}</td><td>${total-free}</td><td>${free}</td></tr>`;
      output = output + '</table>';
      this.cmd.displayOutput(output, true);
   }

   private handleWrongData() {
      this.cmd.displayOutput("Wrong data returned from server", true);
   }
}