/**
 * Stack for holding previous commands for retrieval with the up arrow.
 * Stores data in localStorage. Won't push consecutive duplicates.
 *
 * @author   Jake Gully, chimpytk@gmail.com
 * @license  MIT License
 */

/**
 * Constructor
 * @param {string}  id       Unique id for this stack
 * @param {integer} max_size Number of commands to store
 */
class Stack<T> {
   private instanceId:string;
   private maxDepth:number;
   private arr:T[] = [];
   private whenLast:T;
   private cur:number = 0;

   constructor(id:string,maxDepth:number,whenLast:T) {
      this.instanceId = id;
      this.maxDepth = maxDepth;
      this.whenLast = whenLast;
   }

   /**
    * Store the array in localstorage
    */
   private persist(arr) {
      localStorage['cmd_stack_' + this.instanceId] = JSON.stringify(arr);
   }

   /**
    * Load array from localstorage
    */
   private getArray():T[] {
      if (!localStorage['cmd_stack_' + this.instanceId]) {
         this.arr = [];
         this.persist(this.arr);
      }

      try {
         this.arr = JSON.parse(localStorage['cmd_stack_' + this.instanceId]);
      } catch (err) {
         return [];
      }
      return this.arr;
   }

   /**
    * Push a command to the array
    * @param  {string} cmd Command to append to stack
    */
   push(cmd:T) {
      this.arr = this.getArray();

      // don't push if same as last command
      if (cmd === this.arr[this.arr.length - 1]) {
         return false;
      }

      this.arr.push(cmd);

      // crop off excess
      while (this.arr.length > this.maxDepth) {
         this.arr.shift();
      }

      this.cur = this.arr.length;
      this.persist(this.arr);
   }

   /**
    * Get previous command from stack (up key)
    * @return {string} Retrieved command string
    */
   prev():T {
      this.cur -= 1;

      if (this.cur < 0) {
         this.cur = 0;
      }

      return this.arr[this.cur];
   }

   /**
    * Get next command from stack (down key)
    * @return {string} Retrieved command string
    */
   next():T {
      this.cur = this.cur + 1;

      // Return a blank string as last item
      if (this.cur === this.arr.length) {
         return this.whenLast;
      }

      // Limit
      if (this.cur > (this.arr.length - 1)) {
         this.cur = (this.arr.length - 1);
      }

      return this.arr[this.cur];
   }

   /**
    * Move cursor to last element
    */
   reset() {
      this.arr = this.getArray();
      this.cur = this.arr.length;
   }

   /**
    * Is stack empty
    * @return {Boolean} True if stack is empty
    */
   isEmpty():boolean {
      this.arr = this.getArray();
      return (this.arr.length === 0);
   }

   /**
    * Empty array and remove from localstorage
    */
   empty() {
      this.arr = undefined;
      localStorage.clear();
      this.reset();
   }

   /**
    * Get current cursor location
    * @return {integer} Current cursor index
    */
   getCur():number {
      return this.cur;
   }

   /**
    * Get size of the stack
    * @return {Integer} Size of stack
    */
   getSize():number {
      return this.arr.length;
   }
}