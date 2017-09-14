import {OsvApiCommandBase} from "./OsvCommandBase"
import Set from "typescript-collections/dist/lib/Set";

export class OsvUptimeCommand extends OsvApiCommandBase<number> {
   typed:string = 'uptime';

   description:string = 'tell how long the system has been running';

   help:string = 'Usage: uptime <BR><BR>\
      Print how long the system has been running.';

   matches(input: string) {
      return input.indexOf('uptime') === 0;
   }

   executeApi(commandArguments: string[], options: Set<string>): JQueryPromise<number> {
      return this.cmd.api.getUpTimeInSeconds();
   }   

   buildUrl(options: Set<string>, commandArguments: string[]) {
      return this.cmd.getInstanceSchemeHostPort() + "/os/uptime";
   }

   handleExecutionSuccess(options: Set<string>, upTimeInSeconds: number) {

      let upTimeText = "up ";
      const upTimeDays = Math.floor(upTimeInSeconds / (60 * 60 * 24));
      if( upTimeDays >= 1) {
         upTimeText += `${upTimeDays} days `; //TODO string.format(" %d day%s,", updays, (updays ~= 1) and "s" or "")
      }

      let upTimeMinutes = Math.floor(upTimeInSeconds / 60);
      const upTimeHours = Math.floor((upTimeMinutes / 60)) % 24;
      upTimeMinutes = upTimeMinutes % 60;

      if( upTimeHours >= 1)
         upTimeText += ` ${upTimeHours} hours and ${upTimeMinutes} minutes`;  //string.format(" %2d:%02d ", uphours, upminutes)
      else
         upTimeText += ` ${upTimeMinutes} minutes`;//string.format(" %d min ", upminutes)

      this.cmd.displayOutput(upTimeText, true);
   }
}