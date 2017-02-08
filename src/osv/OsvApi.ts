
export interface OsvApi {
   getDate():JQueryPromise<string>;
   getFile(filename:string):JQueryPromise<string>;
   getFileStatus(filename:string):JQueryPromise<FileStatus>;
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

export class OsvApiImpl implements OsvApi {

   private instanceSchemeHostPort:string = "http://localhost:8000";

   private makeApiCall(url:string,method:string="GET"):JQueryPromise<any> {
      return $.ajax({
         url: url,
         method: method,
         timeout: 1000
      });
   }
   
   getDate():JQueryPromise<string> {
      return this.makeApiCall(`${this.instanceSchemeHostPort}/os/date`);
   }

   getFile(filename:string):JQueryPromise<string> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`${this.instanceSchemeHostPort}/file/${rpath}?op=GET`);
   }

   getFileStatus(filename:string):JQueryPromise<FileStatus> {
      const rpath: string = encodeURIComponent(filename);
      return this.makeApiCall(`${this.instanceSchemeHostPort}/file/${rpath}?op=GETFILESTATUS`);
   }
}