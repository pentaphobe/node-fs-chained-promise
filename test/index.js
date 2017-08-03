import * as library from '../lib/index';
import { expect } from 'chai';

console.dir(library);

describe('Library', () => {
  describe('Fake test default export', () => {
    it('should be a function', () => {
      let fn = library.default;
      expect(fn).to.be.a('function');
    });

    it('should multiply values by 2', () => {
      let result = library.default(4);
      expect(result).to.equal(8);
    });
  });
});