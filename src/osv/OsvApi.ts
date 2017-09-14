
export interface OsvApi {
   setInstanceSchemeHostPort(_instanceSchemeHostPort:string)
   getDate():JQueryPromise<string>;
   getFile(filename:string):JQueryPromise<string>;
   getFileStatus(filename:string):JQueryPromise<FileStatus>;
   createDirectory(path:string,createParents?:boolean,permissions?:string):JQueryPromise<void>;
}

export interface FileStatus {
   owner:string;
   group:string;
   permission:string;
   blockSize:number;
   accessTime:number;
   pathSuffix:string;
   modificationTime:number;
   replication:number;
   length:number;
   type:string;
}

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

   private makeApiCall(url:string,method:string="GET"):JQueryPromise<any> {
      return $.ajax({
         url: url,
         method: method,
         timeout: 1000
      });
   }

   setInstanceSchemeHostPort(_instanceSchemeHostPort:string) {
      this.instanceSchemeHostPort = _instanceSchemeHostPort;
   }
   
   getCmdline():JQueryPromise<string> {
      return this.makeApiCall(`${this.instanceSchemeHostPort}/os/cmdline`);
   }

   getDate():JQueryPromise<string> {
      return this.makeApiCall(`${this.instanceSchemeHostPort}/os/date`);
   }

   getSystemLog():JQueryPromise<string> {
      return this.makeApiCall(`${this.instanceSchemeHostPort}/os/dmesg`);
   }

   getFile(filename:string):JQueryPromise<string> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`${this.instanceSchemeHostPort}/file/${rpath}?op=GET`);
   }

   getFileStatus(filename:string):JQueryPromise<FileStatus> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`${this.instanceSchemeHostPort}/file/${rpath}?op=GETFILESTATUS`);
   }

   getFileSystems(filesystem?:string):JQueryPromise<FileSystem[]> {
      if(filesystem)
         return this.makeApiCall(`${this.instanceSchemeHostPort}/fs/df/${encodeURIComponent(filesystem)}`);  
      else 
         return this.makeApiCall(`${this.instanceSchemeHostPort}/fs/df`);  
   }

   getOsName():JQueryPromise<string> {
      return this.makeApiCall(`${this.instanceSchemeHostPort}/os/name`);
   }

   listFiles(path:string):JQueryPromise<FileStatus[]> {
      const rpath: string = encodeURIComponent(path);
      return this.makeApiCall(`${this.instanceSchemeHostPort}/file/${rpath}?op=LISTSTATUS`);
   }

   createDirectory(path:string,createParents:boolean=false,permissions:string="755"):JQueryPromise<void> {
      const rpath: string = encodeURIComponent(path);
      let url = `${this.instanceSchemeHostPort}/file/${rpath}?op=MKDIRS&permission=${permissions}&createParent=${createParents}`;
      return this.makeApiCall(url,"PUT");
   }
}