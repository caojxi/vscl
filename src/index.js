import Directive from './directive'
import Directives from './directives'

var prefix = 'sd',
    selector = Object.keys(Directives).map(function (d) {
      return '[' + prefix + '-' + d + ']'
    }).join()

function Seed(app) {
   var self = this,
       root = this.el = document.getElementById(app.id), // Element
       els = root.querySelectorAll(selector) // DOM binding elements

  self.bindings = {}  // internal real data
  self.scope = {} // external interface

  ;[].forEach.call(els, this.compileNode.bind(this))
  this.compileNode(root)

  // initialize all variables by invoking setters
  for (var key in self.bindings) {
    self.scope[key] = app.scope[key]
  }
}

Seed.prototype.compileNode = function (node) {
  var self = this

  cloneAttributes(node.attributes).forEach(function (attr) {
    var directive = Directive.parse(attr, prefix)
    if (directive) {
      self.bind(node, directive)
    }
  })
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

Seed.prototype.bind = function (node, directive) {
  directive.el = node
  node.removeAttribute(directive.attr.name)

  var key = directive.key,
      binding = this.bindings[key] || this.createBinding(key)
  
  // add directive to this binding
  binding.directives.push(directive)

  if (directive.bind) {
    directive.bind(node, binding.value)
  }
}

Seed.prototype.createBinding = function (key) {
  var binding = {
    value: undefined,
    directives: []
  }

  this.bindings[key] = binding

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

export default {
  create: function (app) {
    return new Seed(app)
  },
  directive: function () {

  },
  filter: function () {

  }
}