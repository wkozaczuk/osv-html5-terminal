/**
 * HTML5 Command Line Terminal
 *
 * Adapted and converted from original Javascript implementation to TypeScript by Waldemar Kozaczuk.
 *
 * @author   Jake Gully (chimpytk@gmail.com)
 * @author   Waldemar Kozaczuk, jwkozaczuk@gmail.com
 * @license  MIT License
 */

import {Stack} from "./Stack";
import Set from "typescript-collections/dist/lib/Set";

/**
 * Describes configuration of the command
 */
interface CmdConfiguration {
   readonly busyText: string;
   readonly executableCommands: Command[];
   readonly historyId: string;
   readonly remoteCmdListUrl?: string;
   readonly selector: string;
   readonly unknownCmd: string;
   readonly typewriterTime: number;
}

/**
 * Describes a command that can be executed to show some input
 */
export interface Command {
   typed():string;
   setCmd(cmd: Cmd);
   matches(input: string): boolean;
   execute(input: string);
}

export interface KeyPressedSubscriber {
   onKeyPressed(inputString:string,keyPressed:number);
}

/**
 *
 */
export class Cmd {

   private configuration: CmdConfiguration = {
      busyText: 'Communicating...',
      historyId: 'cmd_history',
      remoteCmdListUrl: '',
      selector: '#cmd',
      unknownCmd: 'Unrecognised command',
      typewriterTime: 32,
      executableCommands: []
   };

   private commandsStack: Stack<string>;

   private autoCompletionAttempted: Boolean = false;
   private keyArrays: Array<number> = [9, 13, 38, 40, 27];
   private prompt: string = '$ ';

   private remoteCommands: Array<string> = [];
   private allCommands: Array<string> = [];
   private localCommands: Array<string> = [
      'clear',
      'clr',
      'cls',
      'clearhistory',
      'invert'
   ];

   private container: JQuery;
   private input: JQuery;
   private output: JQuery;
   private promptElement: JQuery;
   private wrapper: JQuery;

   private keyPressedSubscribers:Set<KeyPressedSubscriber> =
      new Set<KeyPressedSubscriber>();

   constructor(userConfiguration?: any) {
      $.extend(this.configuration, userConfiguration);

      if (this.configuration.remoteCmdListUrl) {
         $.ajax({
            url: this.configuration.remoteCmdListUrl,
            context: this,
            dataType: 'json',
            method: 'GET',
            success: function (data) {
               this.remoteCommands = data;
               this.allCommands = $.merge(this.remoteCommands, this.localCommands);
               this.configuration.executableCommands.forEach((command)=> {
                  this.allCommands.push(command.typed());
               });

            }
         });
      } else {
         this.allCommands = this.localCommands;
      }

      if (!$(this.configuration.selector).length) {
         throw 'Cmd err: Invalid selector.';
      }

      this.commandsStack = new Stack<string>(this.configuration.historyId, 30, "");

      if (this.commandsStack.isEmpty()) {
         this.commandsStack.push('secretmagicword!');
      }

      this.commandsStack.reset();
      this.setupDOM();
      this.input.focus();

      this.configuration.executableCommands.forEach((command)=> {
         command.setCmd(this);
      });

      console.log("Constructor: " + this.allCommands.length);
   }

   /**
    * Attach click handlers to 'autofills' - divs which, when clicked,
    * will insert text into the input
    */
   private activateAutofills() {
      const input = this.input;

      this.wrapper
         .find('[data-type=autofill]')
         .on('click', function () {
            input.val($(this).data('autofill'));
         });
   }

   /**
    * Clears the screen
    */
   public clearScreen() {
      this.container.empty();

      this.output = $('<div/>')
         .addClass('cmd-output')
         .appendTo(this.container);

      this.promptElement = $('<span/>')
         .addClass('main-prompt')
         .addClass('prompt')
         .html(" ?") //this.prompt
         .appendTo(this.container);

      this.input = $('<input/>')
         .addClass('cmd-in')
         .attr('type', 'text')
         .attr('maxlength', 512)
         .appendTo(this.container);

      this.showInputType();

      this.input.val('');
   }

   /**
    * Temporarily disable input while running commands
    */
   private disableInput() {
      this.input
         .attr('disabled', 'true')
         .val(this.configuration.busyText);
   }

   /**
    * Takes an input (which have been collected from keystrokes), escapes <,>,",` and & and outputs with prompt
    * @param input
    */
   private displayInput(input: string) {
      const escapedInput = input.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

      this.output.append('<span class="prompt">' + this.prompt + '</span> ' +
         '<span class="grey_text">' + escapedInput + '</span>');
   }

   /**
    * Takes the client's input and the server's output
    * and displays them appropriately.
    * @param output
    * @param breakLine
    */
   displayOutput(output: string, breakLine: boolean = true) {
      if (this.output.html() && breakLine) {
         this.output.append('<br>');
      }

      this.output.append(output + '<br>');

      this.commandsStack.reset();

      this.input.val('').removeAttr('disabled');

      this.enableInput();
      this.focusOnInput();
      this.activateAutofills();
   }

   /**
    * Reenable input after running disableInput()
    */
   private enableInput() {
      this.input
         .removeAttr('disabled')
         .val('');
   }

   /**
    * TODO
    * Give focus to the command input and
    * scroll to the bottom of the page
    */
   private focusOnInput() {
      //var cmd_width;

      $(this.configuration.selector).scrollTop($(this.configuration.selector)[0].scrollHeight);

      this.input.focus();
   }

   public subscribeToKeyPressed(subscriber:KeyPressedSubscriber) {
      this.keyPressedSubscribers.add(subscriber);
   }

   public unSubscribeFromKeyPressed(subscriber:KeyPressedSubscriber) {
      this.keyPressedSubscribers.remove(subscriber);
   }

   /**
    * Handle keypresses
    */
   private handleKeyPress(event: KeyboardEvent) {
      const keyCode = event.keyCode || event.which;
      const inputString = this.input.val();

      this.keyPressedSubscribers.forEach(subscriber=>subscriber.onKeyPressed(inputString,keyCode))

      if (keyCode === 9) { //tab
         this.tabComplete(inputString);
      } else {
         this.autoCompletionAttempted = false;

         if (keyCode === 13) { // enter
            if (this.input.attr('disabled')) {
               return false;
            }

            this.disableInput();

            // push command to stack if using text input, i.e. no passwords
            if (this.input.get(0)["type"] === 'text') {
               this.commandsStack.push(inputString);
            }

            this.handleInput(inputString);
         } else if (keyCode === 38) { // up arrow
            if (inputString !== "" && this.commandsStack.getCur() === (this.commandsStack.getSize() - 1)) {
               this.commandsStack.push(inputString);
            }

            this.input.val(this.commandsStack.prev());
         } else if (keyCode === 40) { // down arrow
            this.input.val(this.commandsStack.next());
         } else if (keyCode === 27) { // esc
            if (parseFloat(this.container.css('opacity')) > 0.5) {
               this.container.animate({'opacity': 0}, 300);
            } else {
               this.container.animate({'opacity': 1}, 300);
            }
         }
      }
   }

   /**
    * Prevent default action of special keys
    */
   private handleKeyUp(event: KeyboardEvent) {
      const key = event.which;

      if ($.inArray(key, this.keyArrays) > -1) {
         event.preventDefault();
         return false;
      }

      return true;
   }

   /**
    * Prevent default action of special keys
    */
   private handleKeyDown(event: KeyboardEvent) {
      let key = event.which;

      if ($.inArray(key, this.keyArrays) > -1) {
         event.preventDefault();
         return false;
      }
      return true;
   }

   /**
    * Inverts display scheme by removing/adding class inverted
    */
   private invert() {
      this.wrapper.toggleClass('inverted');
   }

   /**
    * Make prompt and input fit on one line
    */
   private resizeInput() {
      const width = this.wrapper.width() - this.wrapper.find('.main-prompt').first().width() - 45;

      this.input.focus().css('width', width);
   }

   /**
    * Create DOM elements, add click & key handlers
    */
   private setupDOM() {
      this.wrapper = $(this.configuration.selector).addClass('cmd-interface');

      this.container = $('<div/>')
         .addClass('cmd-container')
         .appendTo(this.wrapper);

      this.clearScreen(); // adds output, input and prompt

      $(this.configuration.selector).on('click', $.proxy(this.focusOnInput, this));
      $(window).resize($.proxy(this.resizeInput, this));

      this.wrapper.keydown($.proxy(this.handleKeyDown, this));
      this.wrapper.keyup($.proxy(this.handleKeyUp, this));
      this.wrapper.keydown($.proxy(this.handleKeyPress, this));
   }

   /**
    * Changes the input type to the specified one
    * @param inputType
    */
   private showInputType(inputType?: string) {
      switch (inputType) {
         case 'password':
            this.input = $('<input/>')
               .attr('type', 'password')
               .attr('maxlength', 512)
               .addClass('cmd-in');
            break;

         case 'textarea':
            this.input = $('<textarea/>')
               .addClass('cmd-in');
            break;

         default:
            this.input = $('<input/>')
               .attr('type', 'text')
               .attr('maxlength', 512)
               .addClass('cmd-in');
      }

      this.container.children('.cmd-in').remove();

      this.input.appendTo(this.container)
         .attr('title', 'Chimpcom input');

      this.focusOnInput();
   }

   /**
    * Complete command names when tab is pressed
    */
   private tabComplete(str: string) {
      // If we have a space then offload to external processor
      if (str.indexOf(' ') !== -1) {
         this.autoCompletionAttempted = false;
         return;
      }

      console.log("Tab: " + this.allCommands.length);
      let suggestions = this.allCommands.filter((value: string) => {
         return value.indexOf(str) == 0;
      });


      if (suggestions.length === 0) {
         return false;
      } else if (suggestions.length === 1) {
         this.input.val(suggestions[0]);
      } else {
         if (this.autoCompletionAttempted) {
            this.displayOutput(suggestions.join(', '));
            this.autoCompletionAttempted = false;
            this.input.val(str);
            return;
         } else {
            this.autoCompletionAttempted = true;
         }
      }
      //TODO
   }

   /**
    * Set the prompt string
    * @param {string} new_prompt The new prompt string
    */
   public setPrompt(newPrompt: string) {
      this.prompt = newPrompt;
      this.promptElement.html(this.prompt);
   }

   /**
    * Handle typed in input
    * @param input
    * @returns {boolean}
    */
   public handleInput(input: string) {
      const commands = input.split(' ');

      this.displayInput(input);

      // TODO Check if has anything
      switch (commands[0]) {
         case '':
            this.displayOutput('');
            break;

         case 'clear':
         case 'cls':
         case 'clr':
            this.clearScreen();
            break;

         case 'clearHistory':
            this.commandsStack.empty();
            this.commandsStack.reset();
            this.displayOutput('Command history cleared. ');
            break;

         case 'invert':
            this.invert();
            this.displayOutput('Shazam.');
            break;

         default:
            let matchingExecutableCommands = this.configuration.executableCommands.filter((command)=>command.matches(input));

            if (matchingExecutableCommands.length == 0) {
               this.displayOutput(this.configuration.unknownCmd);
               return false;
            }

            matchingExecutableCommands[0].execute(input);
         /*
          var result = this.options.external_processor(input_str, this);

          switch (typeof result) {
          // If undefined, external handler should
          // call handleResponse when done
          case 'boolean':
          if (!result) {
          this.displayOutput(this.options.unknown_cmd);
          }
          break;
          // If we get a response object, deal with it directly
          case 'object':
          this.handleResponse(result);
          break;
          // If we have a string, output it. This shouldn't
          // really happen but it might be useful
          case 'string':
          this.displayOutput(result);
          break;
          default:
          this.displayOutput(this.options.unknown_cmd);
          }
          */
      }
   }
}
