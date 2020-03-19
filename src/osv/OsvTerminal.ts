/**
 * OSv commands
 *
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */
import {Cmd} from "../cmd/Cmd";
import {OsvCatCommand} from "./OsvCatCommand";
import {OsvLsCommand} from "./OsvLsCommand";
import {OsvDmesgCommand} from "./OsvDmesgCommand";
import {OsvRebootCommand} from "./OsvRebootCommand";
import {OsvCmdlineCommand} from "./OsvCmdlineCommand";
import {OsvDateCommand} from "./OsvDateCommand";
import {OsvPowerOffCommand} from "./OsvPowerOffCommand";
import {OsvDfCommand} from "./OsvDfCommand";
import {OsvMkdirCommand} from "./OsvMkdirCommand";
import {OsvRmCommand} from "./OsvRmCommand";
import {OsvUptimeCommand} from "./OsvUptimeCommand";
import {OsvFreeCommand} from "./OsvFreeCommand";
import {OsvCdCommand} from "./OsvCdCommand";
import {OsvPwdCommand} from "./OsvPwdCommand";
import {OsvTopCommand} from "./OsvTopCommand";
import {OsvConnectCommand} from "./OsvConnectCommand";
import {OsvApi,OsvApiImpl} from "./OsvApi";

export class OsvTerminal extends Cmd {
   api:OsvApi = new OsvApiImpl();
   private instanceSchemeHostPort:string = "";
   private currentPath:string = "/";
   private parentPathRegex:RegExp = /\/[^\/]+\/\.\.\//g;

   constructor(selector: string) {
      super({
         selector: selector,
         historyId: 'OsvTerminal',
         remoteCmdListUrl: 'commands.json',
         executableCommands: [
            new OsvCmdlineCommand(),
            new OsvCatCommand(),
            new OsvCdCommand(),
            new OsvDateCommand(),
            new OsvDfCommand(),
            new OsvDmesgCommand(),
            new OsvFreeCommand(),
            new OsvLsCommand(),
            new OsvMkdirCommand(),
            new OsvPowerOffCommand(),
            new OsvPwdCommand(),
            new OsvRebootCommand(),
            new OsvRmCommand(),
            new OsvUptimeCommand(),
            new OsvTopCommand(),
            new OsvConnectCommand()],
         afterInitialized: () => {
            let defaultInstanceSchemeHostPort = "http://localhost:8000";
            $.ajax({
               url: `${defaultInstanceSchemeHostPort}/os/name`,
               timeout: 1000,
               success: ()=>{
                  $("#status").html(`Connected to ${defaultInstanceSchemeHostPort}`);
                  this.displayOutput(`Successfully connected to ${defaultInstanceSchemeHostPort}`, true);
                  this.setInstanceSchemeHostPort(defaultInstanceSchemeHostPort);
               },
               error: ()=>{
                  $("#status").html(`<span class="red_error">Failed to connect to ${defaultInstanceSchemeHostPort}</span>`);
               }
            });
         }
      })
   }

   public getCurrentPath():string {
      return this.currentPath;
   }

   public setCurrentPath(path:string) {
      this.currentPath = path;
   }

   public resolvePath(path?:string) {
      if(path) {
         if(path.length > 0 && path[path.length-1] != '/') {
            path = path + '/';
         }

         let resolvedPath = path.substr(0,1) === '/' ? path : `${this.currentPath}/${path}`;
         let normalizedPath = resolvedPath
            .replace(/\/\//g,'/')
            .replace(/\/\.\//g,'/');

         while( this.parentPathRegex.test(normalizedPath)) {
            normalizedPath = normalizedPath.replace(this.parentPathRegex,'/');
         }

         if(normalizedPath.length > 1) {
            return normalizedPath[normalizedPath.length - 1] == "/" ? normalizedPath.substr(0,normalizedPath.length - 1) : normalizedPath;
         }
         else {
            return normalizedPath;
         }
      }
      else {
         return this.currentPath;
      }
   }

   public getInstanceSchemeHostPort(): string {
      return this.instanceSchemeHostPort;
   }

   public setInstanceSchemeHostPort(value: string) {
      this.instanceSchemeHostPort = value;
      this.api.setInstanceSchemeHostPort(value);
   }
}
