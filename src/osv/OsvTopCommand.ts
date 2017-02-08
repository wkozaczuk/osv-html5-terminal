import {OsvCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";
import {KeyPressedSubscriber} from "../cmd/Cmd";

interface OsvThread {
   status:string
   priority:number
   preemptions:number   // ???
   name:string
   migrations:number    // ???
   cpu: number|'-'      // Id of the CPU this thread is on currently
   switches: number     // ???
   cpu_ms: number       // Time this thread spent on CPU since it was created
   cpu_ms_delta: number
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

interface OsvTopData {
   threadsTable:string[][];
   threadsCount:number;
   idleThreadsCpu:number[];
   totalIdle:number;
}

export class OsvTopCommand extends OsvCommandBase implements KeyPressedSubscriber {
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
      "STATUS": {
         name: "STATUS",
         source: "status"
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

   private static defaultColumnNames = ["ID", "CPU", "%CPU", "TIME", "NAME", "STATUS"];
   private static allColumnNames = ["ID", "CPU", "%CPU", "TIME",
      "sw", "sw/s", "us/sw", "preempt","pre/s", "mig", "mig/s", "NAME", "STATUS"];

   private lastThreadsState:OsvThreadsState;
   private stop = false;
   private processorsCount:number = 0;

   typed:string = 'top';

   description:string = 'display OSv threads';

   help:string = 'Usage: top<BR><BR>\
      Show thread information >BR><BR>\
      Options: <BR><BR>\
         -l, --lines=[LINES]     Force number of lines to display (default: try to fit to display)<BR>\
         -i, --idle              Show idle threads in list<BR>\
         -s, --switches          Show switches<BR>\
         -p, --period=[SECONDS]  Refresh interval (in seconds)<BR>\
         -h, --help              Display this help and exit';

   matches(input: string) {
      return input.indexOf('top') === 0;
   }

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return this.cmd.getInstanceSchemeHostPort() + "/hardware/processor/count";
   }
   
   handleExecutionSuccess(options: Set<string>, response: any) {
      this.processorsCount = response;
      this.stop = false;
      this.cmd.subscribeToKeyPressed(this);

      $.ajax({
         url: this.cmd.getInstanceSchemeHostPort() + "/os/threads",
         method: this.method,
         success: (newResponse)=>this.handleThreadsResponse(options,newResponse),
         error: (newResponse)=>this.handleExecutionError(newResponse)
      });
   }

   private handleThreadsResponse(options: Set<string>, response: any) {
      let columnNames = OsvTopCommand.defaultColumnNames;
      if(options.contains("s") || options.contains("switches")) {
         columnNames = OsvTopCommand.allColumnNames;
      }
      let topData = this.interpretThreads(response,columnNames,false);

      let statusLine = `${topData.threadsCount} threads on ${this.processorsCount} CPUs; `;
      topData.idleThreadsCpu.forEach(idle=>statusLine = statusLine + idle.toFixed(0) + "% ");
      statusLine = statusLine + '% ' + topData.totalIdle.toFixed(0) + '%';

      let output = '<table><tr>';
      columnNames.forEach(name=>output = output + `<th>${name}</th>`);
      output = output + '</tr>';
      let count = 0;
      topData.threadsTable.forEach(row=>{
         count ++;
         if(count < 32) {  //TODO Come up with some way to calculate how manhy lines fit the screen/area
            output = output + '<tr>';
            row.forEach(value=>output = output + `<td>${value}</td>`);
            output = output + '</tr>';
         }
      });
      output = output + '</table>';
      this.cmd.clearScreen();
      this.cmd.displayOutput(`${statusLine}<BR>${output}<BR>Press q to quit ...`, false);
      //
      // Set to redo in 2 seconds
      if(!this.stop) {
         setTimeout(()=>{
            $.ajax({
               url: this.cmd.getInstanceSchemeHostPort() + "/os/threads",
               method: this.method,
               success: (newResponse)=>this.handleThreadsResponse(options,newResponse),
               error: (newResponse)=>this.handleExecutionError(newResponse)
            });
         },2000);
      }
   }

   onKeyPressed(inputString:string,keyPressed:number) {
      console.log(`Pressed: ${keyPressed} with input: [${inputString}]`);
      if(keyPressed == 81) {
         this.stop = true;
         this.cmd.unSubscribeFromKeyPressed(this);
      }
   }

   private interpretThreads(response:any,columnNames:string[],showIdle:boolean):OsvTopData {
      let currentThreadState:OsvThreadsState = {
         time_ms:response.time_ms,
         threadsById:{}
      };

      let idleThreads:OsvThread[] = [];
      let threadsList:OsvThread[] = response.list;
      //
      // Normalize and identify idle threads
      threadsList.forEach(thread => {
         if(thread.cpu == 0xffffffff) {
            thread.cpu = '-'
         }
         //
         // Calculate delta of cpu_ms => how much time this thread spent on a cpu
         let previousCpuMs = (this.lastThreadsState && this.lastThreadsState.threadsById[thread.id] &&
            this.lastThreadsState.threadsById[thread.id].cpu_ms) || 0;

         thread.cpu_ms_delta = thread.cpu_ms - previousCpuMs;

         let isIdle = thread.name.indexOf("idle") == 0;
         if(isIdle) {
            idleThreads.push(thread);
         }

         currentThreadState.threadsById[thread.id] = thread;
      });
      //
      // Sort by time in ms particular thread spent on a CPU
      threadsList.sort((thread1,thread2) => {
         if(thread2.cpu_ms_delta != thread1.cpu_ms_delta) {
            return thread2.cpu_ms_delta - thread1.cpu_ms_delta;
         }
         else {
            return thread2.cpu_ms - thread1.cpu_ms;
         }
      });

      let idles = [];
      let totalIdle = 0;
      idleThreads.forEach(thread=> {
         let lastThreadMs = (this.lastThreadsState && this.lastThreadsState.threadsById[thread.id].cpu_ms) || 0;
         let lastTimeMs = (this.lastThreadsState && this.lastThreadsState.time_ms) || 0;
         let idle = (100 * (thread.cpu_ms - lastThreadMs)) / (currentThreadState.time_ms - lastTimeMs);
         totalIdle += idle;
         idles[thread.cpu] = idle;
      });
      //
      // Reformat and ...
      let timeElapsedMs = (currentThreadState.time_ms - ((this.lastThreadsState && this.lastThreadsState.time_ms) || 0)) / 1000; //What if not
      let threadsTable = threadsList
         .filter(thread => thread.name.indexOf("idle") != 0)
         .map(thread => {
         return columnNames.map(name => {
            let columnDefinition:OsvThreadDefinition = OsvTopCommand.columns[name];
            let value = thread[columnDefinition.source];

            if (columnDefinition.rate && this.lastThreadsState) {
               value = value - this.lastThreadsState.threadsById[thread.id][columnDefinition.source]; //TODO What if this is new thread --> blows up!!!
               value = value / (timeElapsedMs);
            }
            else
            if(columnDefinition.rateby && this.lastThreadsState) {
               value = value - this.lastThreadsState.threadsById[thread.id][columnDefinition.source];
               if(value) {
                  value = value / (thread[columnDefinition.rateby] - this.lastThreadsState.threadsById[thread.id][columnDefinition.rateby]);
               }
            }

            if(columnDefinition.multiplier != undefined) {
               value = value * columnDefinition.multiplier;
            }

            if(columnDefinition.numberOfDecimals != undefined) {
               return value.toFixed(columnDefinition.numberOfDecimals);
            }
            else {
               return value.toString();
            }
         });
      });
      this.lastThreadsState = currentThreadState;
      return {
         threadsTable:threadsTable,
         threadsCount:threadsList.length,
         idleThreadsCpu:idles,
         totalIdle:totalIdle
      };
   }
}
