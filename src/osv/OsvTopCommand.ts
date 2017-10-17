import {OsvCommandBase} from "./OsvCommandBase"
import {CpuUtilization} from "./OsvApi"
import Set from "typescript-collections/dist/lib/Set";
import {KeyPressedSubscriber} from "../cmd/Cmd";

interface OsvThreadDefinition {
   name:string
   source:string
   numberOfDecimals?:number
   rate?:boolean
   rateby?:string
   multiplier?:number
}

interface OsvTopData {
   threadsTable:string[][];
   threadsCount:number;
   idleThreadsCpu:number[];
   totalIdle:number;
}

export class OsvTopCommand extends OsvCommandBase<CpuUtilization> implements KeyPressedSubscriber {
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

   private lastCpuUtilization:CpuUtilization;
   private stop = false;
   private processorsCount:number = 0;
   private inputString:string = '';
   private nameFilter:RegExp;
   private resetInput:boolean = true;

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

   executeApi(commandArguments: string[], options: Set<string>) : JQueryPromise<CpuUtilization> {
      this.stop = false;
      this.cmd.subscribeToKeyPressed(this);
      this.inputString = '';
      this.resetInput = true;
      this.nameFilter = new RegExp('^');
      return this.cmd.api.getCpuUtilization();   
   }   
   
   handleExecutionSuccess(options: Set<string>, response: CpuUtilization) {
      this.processorsCount = response.processorsCount;
      
      let columnNames = OsvTopCommand.defaultColumnNames;
      if(options.contains("s") || options.contains("switches")) {
         columnNames = OsvTopCommand.allColumnNames;
      }

      if(this.resetInput) {
         this.cmd.setInputString('');
         this.resetInput = false;
      }

      try {
         this.nameFilter = new RegExp(`^` + this.inputString);   
      }
      catch(e) {            
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
      this.inputString = this.cmd.getInputString();
      this.cmd.clearScreen();
      this.cmd.displayOutput(`${statusLine}<BR>${output}<BR>Press q to quit ...`, false);
      this.cmd.setInputString(this.inputString);
      //
      // Set to redo in 2 seconds
      if(!this.stop) {
         setTimeout(()=>this.cmd.api.getCpuUtilization(this.lastCpuUtilization)
            .then((_response)=>this.handleExecutionSuccess(options,_response)),2000);
      }
   }

   onKeyPressed(inputString:string,keyPressed:number) {
      console.log(`Pressed: ${keyPressed} with input: [${inputString}]`);
      if(keyPressed == 81) {
         this.stop = true;
         this.cmd.unSubscribeFromKeyPressed(this);
      }
   }

   private interpretThreads(cpuUtilization:CpuUtilization,columnNames:string[],showIdle:boolean):OsvTopData {
      //
      // Filter
      let threads = cpuUtilization.threads
         .filter(thread => thread.name.indexOf("idle") != 0 && this.nameFilter.test(thread.name));
      //
      // Sort by time in ms particular thread spent on a CPU
      threads.sort((thread1,thread2) => {
         if(thread2.cpu_ms_delta != thread1.cpu_ms_delta) { 
            return thread2.cpu_ms_delta - thread1.cpu_ms_delta;
         }
         else {
            return thread2.cpu_ms - thread1.cpu_ms;
         }
      });
      //
      // Reformat and ...
      let threadsTable = threads.map(thread => {
         return columnNames.map(name => {
            let columnDefinition:OsvThreadDefinition = OsvTopCommand.columns[name];
            let value = thread[columnDefinition.source];

            if (columnDefinition.rate && this.lastCpuUtilization && this.lastCpuUtilization.threadsById[thread.id]) {
               value = value - this.lastCpuUtilization.threadsById[thread.id][columnDefinition.source];
               value = value / (cpuUtilization.timeElapsedMs);
            }
            else
            if(columnDefinition.rateby && this.lastCpuUtilization && this.lastCpuUtilization.threadsById[thread.id]) {
               value = value - this.lastCpuUtilization.threadsById[thread.id][columnDefinition.source];
               if(value) {
                  value = value / (thread[columnDefinition.rateby] - this.lastCpuUtilization.threadsById[thread.id][columnDefinition.rateby]);
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

      this.lastCpuUtilization = cpuUtilization;
      
      return {
         threadsTable:threadsTable,
         threadsCount:cpuUtilization.threads.length,
         idleThreadsCpu:cpuUtilization.idlePercentageByCpu,
         totalIdle:cpuUtilization.idlePercentageByCpu.reduce((acc,val)=>acc+val)
      };
   }
}
