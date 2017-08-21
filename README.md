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
      chain.writeFileSync(filename, 'blah')
    })
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

## Alternative syntax ideas

How to make promises look like callback hell (urgh)
```js
fs()
  .chdir('something')
    .catch( (err, fs) => {
      fs
        .mkdir('something')
        .catch( (err, fs) => {
          console.error(`permission issue or something`);
        })
    })



```

Onto something, but it may not be workable/..
```js
fs()
  .chdir('something')
    .catch()
    .mkdir('something')
      // implicit catch() fallback failure
    .retry() // go back up a level and try again
  .chdir('another')
    .catch()
    .mkdir('another')    
      // implicit catch() fallback failure
    .retry() // go back up a level and try again
  .readFile('config.txt')
    .catch()
    .writeFile('config.txt', `key=value`)
      .catch( (err, fs) => {
        // actual catch method can be skipped unless custom output is needed
      })
    .retry()


// Happy path:
chdir('something') -> readFile('config.txt')

// Worst case scenario
chdir('something') -> mkdir('something') -> chdir('something') -> readFile('config.txt') -> writeFile('config.txt') -> readFile('config.txt')

```

A less contrived example
```js

const dataPath = 'here';
const filename = 'foobar.txt';
const joined = path.join(dataPath, filename);

const defaultContent = 'hello there';

fs()
  .readFile(joined)
    // catch() can be called empty, in which case it initiates a sub-branch chain which is only terminated by fatal(), retry(), resume(), or done()
    .catch()
    .mkdir(dataPath)
      // fatal() is same as catch() but terminates the chain no matter what
      .fatal( (err) => console.error(`couldn't make dir ${dataPath}`, err) )
    .writeFile(joined, defaultContent)
      .fatal( (err) => console.error(`couldn't make file ${joined}`, err) )
    .retry() // performs the readFile() again
  .
  .done( () => {
    console.log('complete');
  })
```