var v = (function () {
'use strict';

var filters = {
  capitalize: function capitalize(value) {
    return value.charAt[0].toUpperCase() + value.slice(1);
  }
};

var directives = {
  text: function text(el, value) {
    el.textContent = value || '';
  },
  show: function show(el, value) {
    el.style.display = value ? '' : 'none';
  },
  class: function _class(el, value, className) {
    el.classList[value ? 'add' : 'remove'](className);
  },
  on: {
    update: function update(el, handler, event, directive) {
      if (!directive.handlers) {
        directive.handlers = {};
      }

      var handlers = directive.handlers;

      if (handlers[event]) {
        el.removeEventListener(event, handlers[event]);
      }

      if (handler) {
        handler = handler.bind(el);
        el.addEventListener(event, handler);
        handlers[event] = handler;
      }
    },
    unbind: function unbind(el, event, directive) {
      if (directive.handlers) {
        el.removeEventListener(event, directive.handlers[event]);
      }
    },
    customFilter: function customFilter(handler, selectors) {
      return function (e) {
        var match = selectors.every(function (selector) {
          return e.target.webkitMatchesSelector(selector);
        });

        if (match) handler.apply(this, arguments);
      };
    }
  }
};

var prefix = 'sd';
var selector = Object.keys(directives).map(function (d) {
  return '[' + prefix + '-' + d + ']';
}).join();

function Seed(app) {
  var self = this,
      root = this.el = document.getElementById(app.id),
      // Element
  els = root.querySelectorAll(selector),
      // DOM binding elements
  bindings = {}; // internal real data

  self.scope = {} // external interface

  ;[].forEach.call(els, processNode);
  processNode(root);

  // initialize all variables by invoking setters
  for (var key in bindings) {
    self.scope[key] = app.scope[key];
  }

  function processNode(el) {
    cloneAttributes(el.attributes).forEach(function (attr) {
      var directive = parseDirective(attr);
      if (directive) {
        bindDirective(self, el, bindings, directive);
      }
    });
  }
}

function cloneAttributes(attributes) {
  return [].map.call(attributes, function (attr) {
    return {
      name: attr.name,
      value: attr.value
    };
  });
}

function bindDirective(seed, el, bindings, directive) {
  el.removeAttribute(directive.attr.name);

  var key = directive.key,
      binding = bindings[key];

  if (!binding) {
    bindings[key] = binding = {
      value: undefined,
      directives: []
    };
  }

  directive.el = el;
  binding.directives.push(directive);

  if (directive.bind) {
    directive.bind(el, binding.value);
  }

  if (!seed.scope.hasOwnProperty(key)) {
    bindAccessors(seed, key, binding);
  }
}

function bindAccessors(seed, key, binding) {
  Object.defineProperty(seed.scope, key, {
    get: function get() {
      return binding.value;
    },
    set: function set(value) {
      binding.value = value;
      binding.directives.forEach(function (directive) {
        if (value && directive.filters) {
          value = applyFilters(value, directive);
        }

        directive.update(directive.el, value, directive.arguments, directive, seed);
      });
    }
  });
}

function applyFilters(value, directive) {
  if (directive.definition.customFilter) {
    return directive.definition.customFilter(value, directive.filters);
  } else {
    directive.filters.forEach(function (filter) {
      if (filters[filter]) {
        value = filters[filter](value);
      }
    });

    return value;
  }
}

function parseDirective(attr) {
  if (attr.name.indexOf(prefix) === -1) return;

  // parse directive name and argument  
  var noprefix = attr.name.slice(prefix.length + 1),
      // sd-[text]
  argIndex = noprefix.indexOf('-'),
      dirname = argIndex === -1 // no argument
  ? noprefix : noprefix.slice(0, argIndex),
      // [on]-click
  def = directives[dirname],
      // directive definition
  arg = argIndex === -1 ? null : noprefix.slice(argIndex); // on-[click]

  // parse scope variable key and pipe filters
  var exp = attr.value,
      pipeIndex = exp.indexOf('|'),
      key = pipeIndex === -1 // no filter
  ? exp.trim() : exp.slice(0, pipeIndex).trim(),
      // sd-text="msg | capitalize"
  filters$$1 = pipeIndex === -1 ? null : exp.slice(pipeIndex).split('|').map(function (filter) {
    return filter.trim();
  });

  return def ? {
    attr: attr,
    key: key, // object key
    filters: filters$$1,
    definition: def, // directive definition
    arguments: arg,
    update: typeof def === 'function' ? def : def.update
  } : null;
}

var index = {
  create: function create(app) {
    return new Seed(app);
  },
  filters: filters,
  directives: directives
};

return index;

}());
