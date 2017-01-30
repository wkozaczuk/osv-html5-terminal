import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

interface OsvThread {
   status:string
   priority:number
   preemptions:number   // ???
   name:string
   migrations:number    // ???
   cpu: number|'-'      // Id of the CPU this thread is on currently
   switches: number     // ???
   cpu_ms: number       // Time this thread spent on CPU since it was created
   id: number
   stack_size: number
}

interface OsvThreadDefinition {
   name:string
   source:string
   numberOfDecimals?:number
   rate?:boolean
   rateby?:string
   multiplier?:number
}

interface OsvThreadsState {
   time_ms:number
   threadsById:Object
}

export class OsvTopCommand extends OsvCommandBase {
   private static columns:Object = {
      "ID": {
         name: "ID",
         source: "id"
      },
      "CPU": {
         name: "CPU",
         source: "cpu"
      },
      "%CPU": {
         name: "%CPU",
         numberOfDecimals: 1,
         source: "cpu_ms",
         rate: true,
         multiplier: 0.1
      },
      "TIME": {
         name: "TIME",
         numberOfDecimals: 2,
         source: "cpu_ms",
         multiplier: 0.001
      },
      "NAME": {
         name: "NAME",
         source: "name"
      },
      "sw": {
         name: "sw",
         source: "switches",
      },
      "sw/s": {
         name: "sw/s",
         numberOfDecimals: 1,
         source: "switches",
         rate: true,
      },
      "us/sw": {
         name: 'us/sw',
         numberOfDecimals: 0,
         source: 'cpu_ms',
         multiplier: 1000.0,
         rateby: 'switches'
      },
      "preempt": {
         name: 'preempt',
         source: 'preemptions',
      },
      "pre/s": {
         name: 'pre/s',
         numberOfDecimals: 1,
         source: 'preemptions',
         rate: true,
      },
      "mig": {
         name: 'mig',
         source: 'migrations',
      },
      "mig/s": {
         name: 'mig/s',
         numberOfDecimals: 1,
         source: 'migrations',
         rate: true,
      },
   };

   private static defaultColumnNames = ["ID", "CPU", "%CPU", "TIME", "NAME"];
   private static allColumnNames = ["ID", "CPU", "%CPU", "TIME",
      "sw", "sw/s", "us/sw", "preempt","pre/s", "mig", "mig/s", "NAME"];

   private lastThreadsState:OsvThreadsState;

   typed() {
      return 'top';
   }

   matches(input: string) {
      return input.indexOf('top') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return OsvCommandBase.urlBase + "/os/threads";
   }

   handleExecutionSuccess(options: Set<string>, response: any) {
      let valuesTable = this.interpretThreads(response,OsvTopCommand.defaultColumnNames,false);
      let output = '<table><tr>';
      OsvTopCommand.defaultColumnNames.forEach(name=>output = output + `<th>${name}</th>`);
      output = output + '</tr>';
      valuesTable.forEach(row=>{
         output = output + '<tr>';
         row.forEach(value=>output = output + `<td>${value}</td>`);
         output = output + '</tr>';
      });
      output = output + '</table>';
      this.cmd.displayOutput(output, true);
   }

   private interpretThreads(response:any,columnNames:string[],showIdle:boolean):string[][] {
      let currentThreadState:OsvThreadsState = {
         time_ms:response.time_ms,
         threadsById:{}
      };

      let idleThreadsById = {};
      let threadsList:OsvThread[] = response.list;
      //
      // Normalize and identify idle threads
      threadsList.forEach(thread => {
         if(thread.cpu == 0xffffffff) {
            thread.cpu = '-'
         }

         let isIdle = thread.name.indexOf("idle") == 0;
         if(isIdle) {
            idleThreadsById[thread.id] = thread;
         }

         if( isIdle && ! showIdle){
         }
         else {
            currentThreadState.threadsById[thread.id] = thread;
         }
      });
      //
      // Sort by time in ms particular thread spent on a CPU
      threadsList.sort((thread1,thread2) => {
         let thread1CurrentCpuMs = thread1.cpu_ms;
         let thread2CurrentCpuMs = thread2.cpu_ms;
         //
         // If it's a new thread, take 0 for its previous cpu_ms
         let thread1PreviousCpuMs = (this.lastThreadsState && this.lastThreadsState.threadsById[thread1.id]) || 0;
         let thread2PreviousCpuMs = (this.lastThreadsState && this.lastThreadsState.threadsById[thread2.id]) || 0;

         return (thread1CurrentCpuMs - thread1PreviousCpuMs) - (thread2CurrentCpuMs - thread2PreviousCpuMs);
      });

      //TODO: Global thread status (top-most line)
      //
      // Reformat and ...
      let threadsTable = threadsList.map(thread => {
         return columnNames.map(name => {
            let columnDefinition:OsvThreadDefinition = OsvTopCommand.columns[name];
            let value = thread[columnDefinition.source];

            if (columnDefinition.rate /* && prev*/) {
               value = value - 0; //prev.list[id][column.source]
               value = 0; //val / ((current.time_ms - prev.time_ms) / 1000)
            }
            else
            if(columnDefinition.rateby /* && prev*/) {
               value = value - 0; //prev.list[id][column.source]
               /*if val ~= 0 then
                val = val / (current.list[id][column.rateby] -
                prev.list[id][column.rateby])
                end */
            }

            if(columnDefinition.multiplier) {
               value = value * columnDefinition.multiplier;
            }

            if(columnDefinition.numberOfDecimals) {
               return value.toFixed(columnDefinition.numberOfDecimals);
            }
            else {
               return value.toString();
            }
         });
      });

      return threadsTable;
   }
}
