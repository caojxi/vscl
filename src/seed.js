import Config from './config'
import Directive from './directive'
import Directives from './directives'
import Filters from './filters'

function Seed(el, app) {
  if (typeof el === 'string') {
    el = document.getElementById(el)
  }

  this.el = el
  this._bindings = {}
  this.scope = {}

  var els = el.querySelectorAll(Config.selector) // DOM binding elements
  ;[].forEach.call(els, this._compileNode.bind(this))
  this._compileNode(el)

  // initialize all variables by invoking setters
  for (var key in this._bindings) {
    this.scope[key] = app[key]
  }
}

Seed.prototype._compileNode = function (node) {
  var self = this

  cloneAttributes(node.attributes).forEach(function (attr) {
    var directive = Directive.parse(attr)
    if (directive) {
      self._bind(node, directive)
    }
  })
}

Seed.prototype._bind = function (node, directive) {
  directive.el = node // save node as reference
  node.removeAttribute(directive.attr.name)

  var key = directive.key,
      binding = this._bindings[key] || this._createBinding(key)
  
  // add directive to this binding
  binding.directives.push(directive)

  if (directive.bind) {
    directive.bind(node, binding.value)
  }
}

Seed.prototype._createBinding = function (key) {
  var binding = {
    value: undefined,
    directives: []
  }

  this._bindings[key] = binding

  // bind accessor triggers to scope
  Object.defineProperty(this.scope, key, {
    get: function () {
      return binding.value
    },
    set: function (value) {
      binding.value = value
      binding.directives.forEach(function (directive) {
        directive.update(value)
      })
    }
  })

  return binding
}

Seed.prototype.dump = function () {
  var data = {}

  for (var key in this._bindings) {
    data[key] = this._bindings[key]
  }

  return data
}

Seed.prototype.destroy = function () {
  for (var key in this._bindings) {
    this._bindings[key].directives.forEach(function (directive) {
      if (directive.definition.unbind) {
        directive.definition.unbind(
          directive.el,
          directive.argument,
          directive
        )
      }
    })
  }

  this.el.parentNode.removeChild(this.el)
}

function cloneAttributes(attributes) {
  return [].map.call(attributes, function (attr) {
    return {
      name: attr.name,
      value: attr.value
    }
  })
}

export default Seed