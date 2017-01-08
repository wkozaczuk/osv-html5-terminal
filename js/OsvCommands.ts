/**
 * Created by wkozaczuk on 1/7/17.
 */
abstract class OsvCommandBase implements Command {
   protected static urlBase = "http://localhost:8000";
   protected cmd:Cmd;

   abstract matches(input:string):boolean;
   abstract buildUrl(input:string):string
   abstract handleExecutionSuccess(response:any);

   handleExecutionError(response:any) {
      this.cmd.displayOutput("Failed: " + JSON.stringify(response));
   }

   setCmd(cmd:Cmd) {
      this.cmd = cmd;
   }

   execute(input:string) {
      $.ajax({
         url:this.buildUrl(input),
         success:(response)=>this.handleExecutionSuccess(response),
         error:(response)=>this.handleExecutionError(response)
      });
   }
}

class OsvShowCommandLineCommand extends OsvCommandBase {
   matches(input:string) {
      return input === 'cmdline';
   }

   buildUrl(input:string) {
      return OsvCommandBase.urlBase + "/os/cmdline";
   }

   handleExecutionSuccess(response:any) {
      this.cmd.displayOutput(response.toString(),false);
   }
}

class OsvCatCommand extends OsvCommandBase {
   matches(input: string) {
      return input.indexOf('cat') === 0;
   }

   buildUrl(input:string) {
      const elements:string[] = input.split(/\s+/);
      const path:string = elements[1].replace(/\//g,"%2F");
      return OsvCommandBase.urlBase + "/file/" + path + "?op=GET";
   }

   handleExecutionSuccess(response: any) {
      this.cmd.displayOutput(response.replace(/\n/g,"<BR>"),false);
   }
}

class OsvLsCommand extends OsvCommandBase {
   matches(input: string): boolean {
      return input.indexOf('ls') === 0;
   }

   buildUrl(input: string): string {
      var path:string = "";
      const elements:string[] = input.split(/\s+/);

      if(elements.length > 1 ) {
         path = elements[1].replace(/\//g,"%2F");
      }
      else {
         path = "%2F";
      }

      return OsvCommandBase.urlBase + "/file/" + path + "?op=LISTSTATUS";
   }

   handleExecutionSuccess(response: any) {
      //response.forEach((entry)=>this.cmd.displayLine(entry.pathSuffix));

      this.cmd.displayOutput('<table>',false);
      response.forEach((entry) => {
         this.cmd.displayOutput('<tr>' +
            '<td>' + entry.owner + '</td>' +
            '<td>' + entry.group + '</td>' +
            '<td>' + entry.length + '</td>' +
            '<td>' + entry.pathSuffix + '</td>' +
            '</tr>', false);
      });
      this.cmd.displayOutput('</table>',false);
   }
}
