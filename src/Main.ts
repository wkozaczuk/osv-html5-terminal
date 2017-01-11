import {OsvTerminal} from "./osv/OsvTerminal";

var terminal = new OsvTerminal('#cmd');

// Customise the prompt string (PS1)
terminal.setPrompt('I co ? ');

// Run an arbitrary command string
$('button').on('click', function () {
   terminal.handleInput('invert');
});