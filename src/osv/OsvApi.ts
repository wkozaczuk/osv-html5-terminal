export interface OsvApi {
   getInstanceSchemeHostPort():string;  
   setInstanceSchemeHostPort(_instanceSchemeHostPort:string);

   createDirectory(path:string,createParents?:boolean,permissions?:string):JQueryPromise<void>; 
   deleteFile(filename:string):JQueryPromise<void>;
   getCmdline():JQueryPromise<string>; 
   getCpuUtilization(lastCpuUtilization?:CpuUtilization):JQueryPromise<CpuUtilization>;
   getFile(filename:string):JQueryPromise<string>;
   getFileStatus(filename:string):JQueryPromise<FileStatus>;
   getFileSystems(filesystem?:string):JQueryPromise<FileSystem[]>;
   getOsName():JQueryPromise<string>; 
   getProcessorsCount():JQueryPromise<number>;
   getMemoryInfo():JQueryPromise<MemoryInfo>;    
   getSystemDate():JQueryPromise<string>;
   getSystemLog():JQueryPromise<string>;
   getUpTimeInSeconds():JQueryPromise<number>; 
   listFiles(path:string):JQueryPromise<EnrichedFileStatus[]>;
   powerOff():JQueryPromise<void>;
   reboot():JQueryPromise<void>;
}

export class MemoryInfo {
   public constructor(readonly freeInBytes:number, readonly totalInBytes:number) {}   
}

export interface FileStatus {
   readonly owner:string;
   readonly group:string;
   readonly permission:string;
   readonly blockSize:number;
   readonly accessTime:number;
   readonly pathSuffix:string;
   readonly modificationTime:number;
   readonly replication:number;
   readonly length:number;
   readonly type:string;
}

export class FileStatusExtension {
   public constructor(private fileStatus:FileStatus) {}    
   
   isDirectory() {
      return this.fileStatus.type == 'DIRECTORY';
   }

   getPermissionsRwx() {
      //TODO: Permissions for some directories look different - fit it
      return this.rwx(parseInt(this.fileStatus.permission[0])) +
         this.rwx(parseInt(this.fileStatus.permission[1])) +
         this.rwx(parseInt(this.fileStatus.permission[2]));   
   }

   private rwx(permissions:number):string {
      switch(permissions) {
         case 0: return "---";
         case 1: return "--x";
         case 2: return "-w-";
         case 3: return "-wx";
         case 4: return "r--";
         case 5: return "r-x";
         case 6: return "rw-";
         case 7: return "rwx";
         default: return "   ";
      }
   }
}

export type EnrichedFileStatus = FileStatus & FileStatusExtension

export interface FileSystem {
   mount:string;
   ffree:number;
   ftotal:number;
   filesystem:string;
   bfree:number;
   btotal:number;
}

export interface Thread {
   status:string;
   priority:number;
   preemptions:number;   // ???
   name:string;
   migrations:number;    // ???
   cpu: number|'-';      // Id of the CPU this thread is on currently
   switches: number;     // ???
   cpu_ms: number;       // Time this thread spent on CPU since it was created
   cpu_ms_delta: number;
   id: number;
   stack_size: number;
}

interface ThreadsRespone {
   time_ms:number;
   list:Thread[];   
}   

export interface CpuUtilization {
  time_ms:number;
  timeElapsedMs:number;
  threads:Thread[];
  threadsById:Object;
  idlePercentageByCpu:number[];
  processorsCount:number
}

export class OsvApiImpl implements OsvApi {

   private instanceSchemeHostPort:string = "";

   private makeApiCall(path:string, method:string="GET"):JQueryPromise<any> {
      return $.ajax({
         url: `${this.instanceSchemeHostPort}${path}`,
         method: method,
         timeout: 1000,
         async: true
      });
   }

   getInstanceSchemeHostPort():string {
      return this.instanceSchemeHostPort;
   }

   setInstanceSchemeHostPort(_instanceSchemeHostPort:string) {
      this.instanceSchemeHostPort = _instanceSchemeHostPort;
   }
   
   createDirectory(path:string,createParents:boolean=false,permissions:string="755"):JQueryPromise<void> {
      const rpath: string = encodeURIComponent(path);
      let url = `/file/${rpath}?op=MKDIRS&permission=${permissions}&createParent=${createParents}`;
      return this.makeApiCall(url,"PUT");
   }

   deleteFile(filename:string):JQueryPromise<void> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`/file/${rpath}?op=DELETE`, 'DELETE');
   }

   getCmdline():JQueryPromise<string> {
      return this.makeApiCall(`/os/cmdline`);
   }

   getCpuUtilization(lastCpuUtilization?:CpuUtilization):JQueryPromise<CpuUtilization> {
      let deferred = jQuery.Deferred<CpuUtilization>();   
      this.makeApiCall('/os/threads')    
         .done((threadsResponse)=>{
            let cpuUtilization = this.calculateCpuUtilization(threadsResponse,lastCpuUtilization);   
            deferred.resolve(cpuUtilization);       
         });
      return deferred.promise();  
   }

   getFile(filename:string):JQueryPromise<string> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`/file/${rpath}?op=GET`);
   }

   getFileStatus(filename:string):JQueryPromise<FileStatus> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`/file/${rpath}?op=GETFILESTATUS`);
   }

   getFileSystems(filesystem?:string):JQueryPromise<FileSystem[]> {
      if(filesystem)
         return this.makeApiCall(`/fs/df/${encodeURIComponent(filesystem)}`);  
      else 
         return this.makeApiCall(`/fs/df`);  
   }

   getMemoryInfo():JQueryPromise<MemoryInfo> {
      //TODO: Fix it to handle errors (switch to then()?) 
      let deferred = jQuery.Deferred<MemoryInfo>();   
      $.when(
         this.makeApiCall(`/os/memory/total`),
         this.makeApiCall(`/os/memory/free`)    
      ).done((totalResponse,freeResponse)=>{
         deferred.resolve(new MemoryInfo(freeResponse[0],totalResponse[0]));       
      });
      return deferred.promise();   
   }

   getOsName():JQueryPromise<string> {
      return this.makeApiCall(`/os/name`);
   }

   getProcessorsCount():JQueryPromise<number> {
      return this.makeApiCall('/hardware/processor/count');
   }

   getSystemDate():JQueryPromise<string> {
      return this.makeApiCall(`/os/date`);
   }

   getSystemLog():JQueryPromise<string> {
      return this.makeApiCall(`/os/dmesg`);
   }

   getUpTimeInSeconds():JQueryPromise<number> {
      return this.makeApiCall(`/os/uptime`);   
   }

   listFiles(path:string):JQueryPromise<EnrichedFileStatus[]> {
      //TODO: Fix it to handle errors (switch to then()?)   
      const rpath: string = encodeURIComponent(path);
      let deferred = jQuery.Deferred<EnrichedFileStatus[]>(); 
      this.makeApiCall(`/file/${rpath}?op=LISTSTATUS`)
        .done(files => {             
           let extendedFiles = files.map(file => this.extend(file,new FileStatusExtension(file)));   
           deferred.resolve(extendedFiles);           
        });  
      return deferred.promise();   
   }

   powerOff():JQueryPromise<void> {
      return this.makeApiCall('/os/poweroff',"POST")   
   }

   reboot():JQueryPromise<void> {
      return this.makeApiCall('/os/reboot',"POST")   
   }

   private extend(original:any,extension:any) {
      for (let id in extension) {
         (<any>original)[id] = (<any>extension)[id];
      }
      return original;     
   }

   private calculateCpuUtilization(response:ThreadsRespone,lastCpuUtilization?:CpuUtilization):CpuUtilization {
      let thisCpuUtilization:CpuUtilization = {
         time_ms:response.time_ms,
         timeElapsedMs:0,
         threadsById:{},
         threads:response.list,
         idlePercentageByCpu:[],
         processorsCount:0
      };

      let idleThreads:Thread[] = [];
      //
      // Normalize and identify idle threads
      thisCpuUtilization.threads.forEach(thread => {
         if(thread.cpu == 0xffffffff) {
            thread.cpu = '-'
         }
         //
         // Calculate delta of cpu_ms => how much time this thread spent on a cpu
         let previousCpuMs = (
            lastCpuUtilization &&
            lastCpuUtilization.threadsById[thread.id] &&
            lastCpuUtilization.threadsById[thread.id].cpu_ms) || 0;

         thread.cpu_ms_delta = thread.cpu_ms - previousCpuMs;

         let isIdle = thread.name.indexOf("idle") == 0;
         if(isIdle) {
            idleThreads.push(thread);
         }

         thisCpuUtilization.threadsById[thread.id] = thread;
      });

      idleThreads.forEach(thread=> {
         let lastThreadMs = (lastCpuUtilization && lastCpuUtilization.threadsById[thread.id].cpu_ms) || 0;
         let lastTimeMs = (lastCpuUtilization && lastCpuUtilization.time_ms) || 0;
         let idlePercentage = (100 * (thread.cpu_ms - lastThreadMs)) / (thisCpuUtilization.time_ms - lastTimeMs);
         thisCpuUtilization.idlePercentageByCpu[thread.cpu] = idlePercentage;
      });

      thisCpuUtilization.processorsCount = idleThreads.length;
      thisCpuUtilization.timeElapsedMs = thisCpuUtilization.time_ms - ((lastCpuUtilization && lastCpuUtilization.time_ms) || 0);      
      return thisCpuUtilization;
   }
}