import {OsvApiCommandBase} from "./OsvCommandBase"
import {MemoryInfo} from "./OsvApi"
import Set from "typescript-collections/dist/lib/Set";

export class OsvFreeCommand extends OsvApiCommandBase<MemoryInfo> {
   typed:string = 'free';

   description:string = 'display amount of free and used memory in system';

   help:string = 'Usage: free<BR><BR>\
      Print OSv memory usage.';

   matches(input: string) {
      return input.indexOf('free') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>):JQueryPromise<MemoryInfo> {
      return this.cmd.api.getMemoryInfo();
   }

   handleExecutionSuccess(options: Set<string>, response: MemoryInfo) {
      this.displayOutputTable(response.totalInBytes,response.freeInBytes,options.contains("h"))
   }

   private displayOutputTable(total:number, free:number, humanReadable:boolean) {
      let _total = humanReadable ? this.humanReadableByteSize(total): total; 
      let _used = humanReadable ? this.humanReadableByteSize(total-free): (total - free); 
      let _free = humanReadable ? this.humanReadableByteSize(free): free;       
      let output = '<table>';
      output = output + '<tr><td>&nbsp;</td><td>total</td><td>used</td><td>free</td></tr>';
      output = output + `<tr><td>Mem</td><td>${_total}</td><td>${_used}</td><td>${_free}</td></tr>`;
      output = output + '</table>';
      this.cmd.displayOutput(output, true);
   }
}