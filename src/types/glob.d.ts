declare module 'glob' {
  function sync(pattern: string, options?: any): string[];
  function hasMagic(pattern: string, options?: any): boolean;

  namespace glob {
    function sync(pattern: string, options?: any): string[];
    function hasMagic(pattern: string, options?: any): boolean;
  }

  export default glob;
}
