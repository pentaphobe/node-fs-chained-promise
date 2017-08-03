
const testFunc = a => a * 2;

export default testFunc;

class Chain {
  constructor() {
    let _chain = this;

    this.stack = [];
    this.thens = [];
    this.catches = [];
  }

  _run( name, fn ) {
    let args = Array.prototype.slice.call(arguments, 1);

    this.stack.push({
      name: name,
      fn: fn,
      args: args
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
      console.log('promise declaration');
      let handle = setInterval( () => {
        if (!isReady) return;

        console.log('boop');
        clearInterval(handle);

        this.stack.forEach( fn => {
          try {
            fn.fn.apply(null, fn.args);
          } catch (e) {
            reject({error:e, source:fn});
          }
        });
        resolve();
      }, 10 );
    });
    console.log('setting thens');
    this.thens.forEach( thenFn => promise.then(thenFn) );
    console.log('setting catches');
    this.catches.forEach( catchFn => promise.catch(catchFn) );
    console.log('starting promise chain');
    isReady = true;
  }  
}

function fs() {
  return new Chain();
}

fs()
  ._run( 'forceTypeError()', () => this.nonexistant )
  .then( () => console.log('done'))
  .catch( (err) => console.log('error', err.error.name, err.source.name) )
  .go()