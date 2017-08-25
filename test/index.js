import * as library from '../lib/index';
// import * as library from '../lib/alt';
import { expect } from 'chai';

// console.dir(library);

// describe('Library', () => {
//   describe('Fake test default export', () => {
//     it('should be a function', () => {
//       let fn = library.default;
//       expect(fn).to.be.a('function');
//     });

//     it('should multiply values by 2', () => {
//       let result = library.default(4);
//       expect(result).to.equal(8);
//     });
//   });
// });
// 

let fs = library.default;

describe('Library', () => {
  describe('error handling', () => {
    it('should catch errors', (done) => {
      fs()
        ._run( 'forceTypeError()', () => this.nonexistant )
        .then( () => {
          // console.log('no error');
          done('should have caught an error');
        })
        .catch( (err) => {
          // console.log('error', err.error.name, err.source.name);
          done();
        })
        .go()
    })

    it('should resolve on no error', (done) => {
      fs()
        ._run( 'do nothing', () => {} )
        .then( () => {
          // console.log('no error');
          done();
        })
        .catch( (err) => {
          done(`got error ${err}`);
        })
        .go()
    })
  })

  describe('chains', () => {
    it('should chain methods', (done) => {
      fs()
        ._run( 'do nothing', () => 'hi' )
        ._run( 'something', () => {let f = 'figgles'; return f;} )
        ._run( 'return a value', () => 23 * 666 )
        .then( (val) => {
          //console.log('success!  values:', val);
          done();
        })
        .catch( (err) => {
          done(`got error ${err}`)
        })
        .go()
    })

    it('multiple results should become an array', (done) => {
      const values = ['hi', 'figgles', 23 * 666];

      fs()
        ._run( 'do nothing', () => values[0] )
        ._run( 'log something', () => values[1] )
        ._run( 'return a value', () => values[2] )
        .then( (val) => {
          expect(val).deep.equals(values);
          done();
        })
        .catch( (err) => {
          done(`got error ${err}`)
        })
        .go()
    }) 

    it('failures should never hit then()', (done) => {
      const values = ['hi', 'figgles', 23 * 666];

      fs()
        ._run( 'do nothing', () => values[0] )
        ._run( 'log something', () => global.someUnlikelyValue.Not.Really )
        ._run( 'return a value', () => values[2] )
        .then( (val) => {
          done('failure is success');
        })
        .catch( (err, vals) => {
          done();
        })
        .go()
    }) 

    it('should support local then() leading to global then()', (done) => {
      const values = ['hi', 'figgles', 23 * 666];
      let gotLocal = false;

      fs()
        ._run( 'do nothing', () => values[0] )
          .local()
          .then( (val) => {
            gotLocal = true;
          })
          .done()
        ._run( 'return a value', () => values[2] )
        .then( (val) => {
          if (gotLocal) {
            done();
          } else {
            done(`didn't hit local then()`);
          }
        })
        .catch( (err, vals) => {
          console.error(err, vals);
          done('failure is failure');
        })
        .go()
    }) 

    it('should support local catch() leading to global catch()', (done) => {
      const values = ['hi', 'figgles', 23 * 666];
      let gotLocal = false;

      fs()
        ._run( 'do nothing', () => values[0] )
        ._run( 'log something', () => global.someUnlikelyValue.Not.Really )
          .local()
          .catch( (err, vals) => {
            gotLocal = true;
          })
          .done()
        .then( (val) => {
          done('success is failure');
        })
        .catch( (err, vals) => {
          if (gotLocal) {
            done();
          } else {
            done(`didn't hit local then()`);
          }
        })
        .go()
    }) 
  }); 

  describe('basic fs replacement', () => {
    it('should successfully wrap a failed readFileSync() call', (done) => {
      let gotLocal = false;

      fs()
        .readFileSync('someMadeUpFilenameWhichHopefullyDoesNotExist!!.txt', {encoding:'utf8'})
          .local()
          .then( (val) => {
            done('that file really should not have existed');
          })
          .catch( (err, vals) => {
            gotLocal = true;
          })
          .done()
        .then( (val) => {
          done('we should never get here');
        })
        .catch( (err, vals) => {
          if (gotLocal) {
            done();
          } else {
            done(`global fail catch`);
          }
        })
        .go()
    });
  });
});