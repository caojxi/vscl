import config from './config'

var attrs = config.attrs,
    toString = Object.prototype.toString,
    join = Array.prototype.join,
    console = window.console

/**
 * Create a prototype less object
 * which is a better hash/amp
 */    
function makeHash() {
  return Object.create(null)
}

var utils = {
  hash: makeHash,

  // global storage for user-registered
  // vms, partials and transitions
  components: makeHash(),
  partials: makeHash(),
  transitions: makeHash(),
  elements: makeHash(),

  extend: function (obj, ext, protective) {
    for (var key in obj) {
      if (protective && obj[key]) continue
      
      obj[key] = ext[key]
    }
  },

  /**
   * Define an enumerable property
   * This avoids it being included in JSON.stringify
   * or for...in loops
   */
  defProtected: function (obj, key, value, enumerable, configurable) {
    if (obj.hasOwnProperty(key)) return
    
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: !!enumerable,
      configurable: !!configurable
    })
  },

  /**
   * Most simple bind
   */
  bind: function (fn, ctx) {
    return function (arg) {
      return fn.call(ctx, arg)
    }
  }
}

export default utils