export interface OsvApi {
   setInstanceSchemeHostPort(_instanceSchemeHostPort:string)

   createDirectory(path:string,createParents?:boolean,permissions?:string):JQueryPromise<void> 
   deleteFile(filename:string):JQueryPromise<void>
   getCmdline():JQueryPromise<string> 
   getFile(filename:string):JQueryPromise<string>;
   getFileStatus(filename:string):JQueryPromise<FileStatus>;
   getFileSystems(filesystem?:string):JQueryPromise<FileSystem[]>
   getOsName():JQueryPromise<string> 
   getSystemDate():JQueryPromise<string>;
   getSystemLog():JQueryPromise<string>
   getUpTimeInSeconds():JQueryPromise<number> 
   listFiles(path:string):JQueryPromise<EnrichedFileStatus[]>
   powerOff():JQueryPromise<void>
   reboot():JQueryPromise<void>
}

export interface MemoryInfo {
   freeInBytes:number;
   totalInBytes:number;   
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
      return this.fileStatus.type == 'DIRECTORY'
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

export class OsvApiImpl implements OsvApi {

   private instanceSchemeHostPort:string = "";

   private makeApiCall(path:string, method:string="GET"):JQueryPromise<any> {
      return $.ajax({
         url: `${this.instanceSchemeHostPort}${path}`,
         method: method,
         timeout: 1000
      });
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

   getOsName():JQueryPromise<string> {
      return this.makeApiCall(`/os/name`);
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
      const rpath: string = encodeURIComponent(path);
      return this.makeApiCall(`/file/${rpath}?op=LISTSTATUS`)
        .done(files => {
           let deferred = jQuery.Deferred();   
           let extendedFiles = files.map(file => this.extend(file,new FileStatusExtension(file)));   
           deferred.resolveWith(extendedFiles);
           return deferred.promise();
        });   
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
}