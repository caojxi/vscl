import Compiler from './compiler'
import utils from './utils'

var def = utils.defProtected

/**
 * ViewModel exposed to user that holds data,
 * computed properties, event handlers
 * and a few reserved methods
 * @param {Object} options 
 */
function ViewModel(options) {
  return new Compiler(this, options)
}

export default ViewModel