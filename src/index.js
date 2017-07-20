import Config from './config'
import Seed from './seed'
import Directives from './directives'
import Filters from './filters'

Seed.config = Config
buildSelector()

Seed.directive = function (name, fn) {
  Directives[name] = fn
  buildSelector()
}

Seed.filter = function (name, fn) {
  Filters[name] = fn
}

Seed.extend = function (app) {
  var Spore = function () {
    Seed.apply(this, arguments)
    for (var prop in this.extensions) {
      var ext = this.extensions[ext]
      this.scope[prop] = typeof ext === 'function'
        ? ext.bind(this)
        : ext
    }
  }

  Spore.prototype = Object.create(Seed.prototype)
  Spore.prototype.extensions = {}
  for (var prop in app) {
    Spore.prototype.extensions[prop] = app[prop]
  }

  return Spore
}

function buildSelector() {
  Config.selector = Object.keys(Directives).map(function (directive) {
    return '[' + Config.prefix + '-' + directive + ']'
  }).join()
}

export default Seed