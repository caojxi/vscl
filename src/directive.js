import Config from './config'
import Directives from './directives'
import Filters from './filters'

var KEY_RE = /^[^\|]+/, // strings not begin with |
    FILTERS_RE = /\|[^\|]+/g

function Directive(def, attr, arg, key) {
  if (typeof def === 'function') {
    this._update = def
  } else {
    for (var prop in def) {
      if (prop === 'update') {
        this._update = def[prop]
      } else {
        this[prop] = def[prop]
      }
    }
  }

  this.attr = attr
  this.arg = arg
  this.key = key

  var filters = attr.value.match(FILTERS_RE)
  if (filters) {
    this.filters = filters.map(function (filter) {
      var tokens = filter.replace('|', '').trim().split(/\s+/)
      var name = tokens[0]
      return {
        name: name,
        apply: Filters[name],
        args: tokens.length > 1 ? tokens.slice(1) : null
      }
    })
  }
}

Directive.prototype.applyFilters = function (value) {
  var filtered = value
  this.filters.forEach(function (filter) {
    if (filter.apply) {
      filtered = filter.apply(filtered, filter.args)
    }
  })

  return filtered
}

Directive.prototype.update = function (value) {
  if (this.filters) {
    value = this.applyFilters(value)
  }

  this._update(value)
}

export default {
  // make sure the directive value is valid
  parse: function (attr) {
    var prefix = Config.prefix

    if (attr.name.indexOf(prefix) === -1) return null

    var noPrefix = attr.name.slice(prefix.length + 1),
        argIndex = noPrefix.indexOf('-'),
        arg = argIndex === -1
          ? null
          : noPrefix.slice(argIndex + 1),
        name = arg
          ? noPrefix.slice(0, argIndex)
          : noPrefix,
        def = Directives[name]
        
    var key = attr.value.match(KEY_RE)
    
    return def && key
      ? new Directive(def, attr, arg, key[0].trim())
      : null
  }
}