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
  }

  _run( name, fn ) {
    let args = Array.prototype.slice.call(arguments, 1);

    this.stack.push({
      name: name,
      fn: fn,
      args: args,
      // TODO: fix abstraction.  these should probably just wrap more `Chain`s
      then: [],
      catch: [],
    });

    return this;
  }

  then( fn ) {
    this.thens.push(fn);

    return this;
  }

  catch( fn ) {
    this.catches.push(fn);

    return this;
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
          let returnVal;
          try {
            returnVal = fn.fn.apply(null, fn.args);
          } catch (e) {
            reject({error:e, source:fn});
          }
          return returnVal;
        });
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
  return new Chain();
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