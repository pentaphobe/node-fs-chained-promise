# node-fs-chained-promise

Chain together sequences of fs operations into a single promise

I often find myself performing sequences of filesystem operations which either become callback hell, or where the 
important functionality is punctuated by constant error checks, try-catch blocks, or branching.

The purpose of this library is to explore the possibilities of simplifying this to (eg.):

```js

// a common task in my tools

let newPath = path.join(process.cwd(), 'SOME_NEW_DIR');
let filename = 'something.json';

fsChain()
  .chdir(newPath)
    .fail( (chain) => chain.mkdir(newPath) )
  .readFile()
    .fail( (chain) => {
      chain.writeFileSync(filename, 
    }
  .then( (data) => {
    console.log(`file contents: '${data}'`);
  })
  .catch( (reason) => {
    console.log(`Had some issues here: '${reason}'`);
  })

```

## Thoughts

- [ ] `fail` and `catch` handlers should receive:
  - [ ] chain state
  - [ ] last error (or perhaps error stack)
  - [ ] recovery path ie. equivalent to resolve (continue chain), reject (next `fail`, or global `catch` handlers)
- [ ] might be worth 
- [ ] `.fail()` calls might be able to act like switches?
  - [ ] might be nicer to have a few variants for commonly used errors, eg.
    - [ ] `failFunc(funcName, handler)` - calls handler if failure originated with function `funcName`
    - [ ] `failEx(exceptionType, handler)` - calls handler if an exception of `exceptionType` was thrown
