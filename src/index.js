import Filters from './filters'
import Directives from './directives'

var prefix = 'sd',
    selector = Object.keys(Directives).map(function (d) {
      return '[' + prefix + '-' + d + ']'
    }).join()

function Seed(opts) {
   var self = this,
       root = this.el = document.getElementById(opts.id) // Element
       els = root.querySelectorAll(selector),
       bindings = {}  // internal real data

  self.scope = {} // external interface

  ;[].forEach.call(els, processNode)
  processNode(root)

  // initialize all variables by invoking setters
  for (var key in bindings) {
    self.scope[key] = opts.scope[key]
  }

  function processNode(el) {
    cloneAttributes(el.attributes).forEach(function (attr) {
      var directive = parseDirective(attr)
      if (directive) {
        bindDirective(self, el, bindings, directive)
      }
    })
  }
}

function cloneAttributes(attributes) {
  return [].map.call(attributes, function (attr) {
    return {
      name: attr.name,
      value: attr.value
    }
  })
}

function bindDirective(seed, el, bindings, directive) {
  el.removeAttribute(directive.attr.name)

  var key = directive.key,
      binding = bindings[key]
  
  if (!binding) {
    bindings[key] = binding = {
      value: undefined,
      directives: []
    }
  }

  directive.el = el
  binding.directives.push(directive)

  if (directive.bind) {
    directive.bind(el, binding.value)
  }

  if (!seed.scope.hasOwnProperty(key)) {
    bindAccessors(seed, key, binding)
  }
}

function bindAccessors(seed, key, binding) {
  Object.defineProperty(seed.scope, key, {
    get: function () {
      return binding.value
    },
    set: function (value) {
      binding.value = value
      binding.directives.forEach(function (directive) {
        if (value && directive.filters) {
          value = applyFilters(value, directive)
        }

        directive.update(directive.el, value, directive.arguments, directive, seed)
      })
    }
  })
}

function applyFilters(value, directive) {
  if (directive.definition.customFilter) {
    return directive.definition.customFilter(value, directive.filters)
  } else {
    directive.filters.forEach(function (filter) {
      if (Filters[filter]) {
        value = Filters[filter](value)
      }
    })

    return value
  }
}

function parseDirective(attr) {
  if (attr.name.indexOf(prefix) === -1) return
  
  // parse directive name and argument  
  var noprefix = attr.name.slice(prefix.length + 1), // [sd]-text
      argIndex = noprefix.indexOf('-'),
      dirname = argIndex === -1 // no argument
        ? noprefix
        : noprefix.slice(0, argIndex) // [text]-is
      def = Directives[dirname], // directive definition
      arg = argIndex === -1
        ? null
        : noprefix.slice(argIndex)

  // parse scope variable key and pipe filters
  var exp = attr.value,
      pipeIndex = exp.indexOf('|'),
      key = pipeIndex === -1 // no filter
        ? exp.trim()
        : exp.slice(0, pipeIndex).trim(), // sd-text="msg | name"
      filters = pipeIndex === -1
        ? null
        : exp.slice(pipeIndex).split('|').map(function (filter) {
          return filter.trim()
        }) 
  
  return def
        ? {
          attr: attr,
          key: key, // object key
          filters: filters,
          definition: def, // directive definition
          arguments: arg,
          update: typeof def === 'function'
            ? def
            : def.update
        }
        : null
}

export default {
  create: function (opts) {
    return new Seed(opts)
  },
  filters: Filters,
  directives: Directives
}