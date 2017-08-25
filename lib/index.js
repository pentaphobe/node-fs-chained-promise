let debugMode = false;

// const testFunc = a => a * 2;

// export default testFunc;


class Chain {
  constructor() {
    let _chain = this;

    this.stack = [];
    // global thens and catches (after everything)
    this.thens = [];
    this.catches = [];
    this.context = null;
  }

  _run( name, fn ) {
    let args = Array.prototype.slice.call(arguments, 1);

    this.stack.push({
      name: name,
      fn: fn,
      args: args,
      // TODO: fix abstraction.  these should probably just wrap more `Chain`s
      thens: [],
      catches: [],
    });

    return this;
  }

  local() {
    this.context = this.stack[this.stack.length-1] || null;

    return this;
  }

  done() {
    if (this.context === null) {
      console.warn('called .done() from top level');
    }
    this.context = null;

    return this;
  }

  then( fn ) {
    if (this.context === null) {
      this.thens.push(fn);
    } else {
      let top = this.stack[this.stack.length-1];
      if (top) {
        top.thens.push(fn);
      }
    }

    return this;
  }

  catch( fn ) {
    if (this.context === null) {
      this.catches.push(fn);
    } else {
      let top = this.stack[this.stack.length-1];
      if (top) {
        top.catches.push(fn);
      }      
    }

    return this;
  }

  _runStep(step, reject) {
    let returnVal;
    try {
      returnVal = step.fn.apply(null, step.args);
    } catch (e) {
      let error = {error:e, source:step};
      // TODO: should these act as filters for the error?
      step.catches.forEach( catchFn => catchFn(error) );
      reject(error);
      return returnVal;
    }
    // TODO: should these act as filters for the value?
    step.thens.forEach( thenFn => thenFn(returnVal) );
    return returnVal;    
  }

  go() {
    let _chain = this;
    let isReady = false;
    let promise = new Promise( (resolve, reject) => {
      debugMode && console.log('promise declaration');

      let handle = setTimeout( () => {
        if (!isReady) return;

        debugMode && console.log('boop');
        clearTimeout(handle);

        let result = this.stack.map( fn => {
          // FIXME: "concurrency" issue, assumes synchrony
          return this._runStep(fn, reject);          
        });    

        // FIXME: "concurrency" issue, assumes synchrony   
        resolve(result);
      }, 200 );
    })
    .then( (val) => {
      this.thens.forEach( thenFn => thenFn(val) );
    })
    .catch( (err) => {
      this.catches.forEach( catchFn => catchFn(err) );
    });
    debugMode && console.log('starting promise chain');
    isReady = true;
  }  
}

function fs() {
  const fs = require('fs');

  class Fs extends Chain {
    constructor() {
      super();
    }

    //
    // Actual filesystem routines
    // 
    
    readFile(path) {
      this._run( `readFile(${path})`, () => {
        // TODO: how to functions access the outer promise for async?
      });

      return this;      
    }

    readFileSync(path, options) {
      this._run( `readFileSync(${path})`, () => {
        let result = fs.readFileSync(path, options);

        return result;
      });

      return this;
    }

  }

  return new Fs();
}

export default fs;

export {
  debugMode
}

// fs()
//   ._run( 'forceTypeError()', () => this.nonexistant )
//   .then( () => console.log('done'))
//   .catch( (err) => console.log('error', err.error.name, err.source.name) )
//   .go()