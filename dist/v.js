var v = (function () {
'use strict';

var directives = {
  text: function text(value) {
    this.el.textContent = value || '';
  },
  show: function show(value) {
    this.el.style.display = value ? '' : 'none';
  },
  class: function _class(value) {
    this.el.classList[value ? 'add' : 'remove'](this.arg);
  },
  on: {
    update: function update(handler) {
      var event = this.arg;
      if (!this.handlers) {
        this.handlers = {};
      }

      var handlers = this.handlers;

      if (handlers[event]) {
        this.el.removeEventListener(event, handlers[event]);
      }

      if (handler) {
        handler = handler.bind(this.el);
        this.el.addEventListener(event, handler);
        handlers[event] = handler;
      }
    },
    unbind: function unbind() {
      var event = this.arg;

      if (this.handlers) {
        this.el.removeEventListener(event, this.handlers[event]);
      }
    }
  },
  repeat: function repeat() {}
};

var filters = {
  capitalize: function capitalize(value) {
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
  uppercase: function uppercase(value) {
    return value.toUpperCase();
  },
  delegate: function delegate(handler, selectors) {
    return function (e) {
      var match = selectors.every(function (selector) {
        return e.target.webkitMatchesSelector(selector);
      });

      if (match) handler.apply(this, arguments);
    };
  },
  repeat: function repeat() {}
};

var KEY_RE = /^[^\|]+/;
var FILTERS_RE = /\|[^\|]+/g;

function Directive(def, attr, arg, key) {
  if (typeof def === 'function') {
    this._update = def;
  } else {
    for (var prop in def) {
      if (prop === 'update') {
        this._update = def[prop];
      } else {
        this[prop] = def[prop];
      }
    }
  }

  this.attr = attr;
  this.arg = arg;
  this.key = key;

  var filters$$1 = attr.value.match(FILTERS_RE);
  if (filters$$1) {
    this.filters = filters$$1.map(function (filter) {
      var tokens = filter.replace('|', '').trim().split(/\s+/);
      return {
        apply: filters[tokens[0]],
        args: tokens.length > 1 ? tokens.slice(1) : null
      };
    });
  }
}

Directive.prototype.applyFilters = function (value) {
  var filtered = value;
  this.filters.forEach(function (filter) {
    if (filter.apply) {
      filtered = filter.apply(filtered, filter.args);
    }
  });

  return filtered;
};

Directive.prototype.update = function (value) {
  if (this.filters) {
    value = this.applyFilters(value);
  }

  this._update(value);
};

var Directive$1 = {
  // make sure the directive value is valid
  parse: function parse(attr, prefix) {
    if (attr.name.indexOf(prefix) === -1) return null;

    var noPrefix = attr.name.slice(prefix.length + 1),
        argIndex = noPrefix.indexOf('-'),
        arg = argIndex === -1 ? null : noPrefix.slice(argIndex + 1),
        name = arg ? noPrefix.slice(0, argIndex) : noPrefix,
        def = directives[name];

    var key = attr.value.match(KEY_RE);

    return def && key ? new Directive(def, attr, arg, key[0].trim()) : null;
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
  els = root.querySelectorAll(selector); // DOM binding elements

  self.bindings = {}; // internal real data
  self.scope = {} // external interface

  ;[].forEach.call(els, this.compileNode.bind(this));
  this.compileNode(root);

  // initialize all variables by invoking setters
  for (var key in self.bindings) {
    self.scope[key] = app.scope[key];
  }
}

Seed.prototype.compileNode = function (node) {
  var self = this;

  cloneAttributes(node.attributes).forEach(function (attr) {
    var directive = Directive$1.parse(attr, prefix);
    if (directive) {
      self.bind(node, directive);
    }
  });
};

Seed.prototype.dump = function () {
  var data = {};

  for (var key in this._bindings) {
    data[key] = this._bindings[key];
  }

  return data;
};

Seed.prototype.destroy = function () {
  for (var key in this._bindings) {
    this._bindings[key].directives.forEach(function (directive) {
      if (directive.definition.unbind) {
        directive.definition.unbind(directive.el, directive.argument, directive);
      }
    });
  }

  this.el.parentNode.removeChild(this.el);
};

function cloneAttributes(attributes) {
  return [].map.call(attributes, function (attr) {
    return {
      name: attr.name,
      value: attr.value
    };
  });
}

Seed.prototype.bind = function (node, directive) {
  directive.el = node;
  node.removeAttribute(directive.attr.name);

  var key = directive.key,
      binding = this.bindings[key] || this.createBinding(key);

  // add directive to this binding
  binding.directives.push(directive);

  if (directive.bind) {
    directive.bind(node, binding.value);
  }
};

Seed.prototype.createBinding = function (key) {
  var binding = {
    value: undefined,
    directives: []
  };

  this.bindings[key] = binding;

  // bind accessor triggers to scope
  Object.defineProperty(this.scope, key, {
    get: function get() {
      return binding.value;
    },
    set: function set(value) {
      binding.value = value;
      binding.directives.forEach(function (directive) {
        directive.update(value);
      });
    }
  });

  return binding;
};

var index = {
  create: function create(app) {
    return new Seed(app);
  },
  directive: function directive() {},
  filter: function filter() {}
};

return index;

}());
