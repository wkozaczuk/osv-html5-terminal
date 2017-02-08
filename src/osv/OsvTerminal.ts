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
import {OsvRebootCommand} from "./OsvReboot";
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

export class OsvTerminal extends Cmd {
   private instanceSchemeHostPort:string = "http://localhost:8000";
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
            new OsvConnectCommand()]
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
   }
}