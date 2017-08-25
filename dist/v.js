var Vue = (function () {
'use strict';

function Compiler(vm, options) {}

/**
 * ViewModel exposed to user that holds data,
 * computed properties, event handlers
 * and a few reserved methods
 * @param {Object} options 
 */
function ViewModel$1(options) {
  return new Compiler(this, options);
}

return ViewModel$1;

}());
