var Seed = (function () {
'use strict';

var Config = {
  prefix: 'sd',
  selector: null
};

var proto = Array.prototype;
var slice = proto.slice;
var mutatorMethods = ['pop', 'push', 'shift', 'unshift', 'splice', 'sort'];

var watchArray = function watchArray(arr, cb) {
  mutatorMethods.forEach(function (method) {
    arr[method] = function () {
      proto[method].apply(this, arguments);
      cb({
        event: method,
        args: slice.call(arguments), // return a shallow copy
        array: arr
      });
    };
  });
};

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
  each: {
    update: function update(collection) {
      watchArray(collection, this.mutate.bind(this));
    },
    mutate: function mutate(mutation) {}
  }
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
      var name = tokens[0];
      return {
        name: name,
        apply: filters[name],
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
  parse: function parse(attr) {
    var prefix = Config.prefix;

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

function Seed$1(el, app) {
  if (typeof el === 'string') {
    el = document.getElementById(el);
  }

  this.el = el;
  this._bindings = {};
  this.scope = {};

  var els = el.querySelectorAll(Config.selector);[].forEach.call(els, this._compileNode.bind(this));
  this._compileNode(el);

  // initialize all variables by invoking setters
  for (var key in this._bindings) {
    this.scope[key] = app[key];
  }
}

Seed$1.prototype._compileNode = function (node) {
  var self = this;

  cloneAttributes(node.attributes).forEach(function (attr) {
    var directive = Directive$1.parse(attr);
    if (directive) {
      self._bind(node, directive);
    }
  });
};

Seed$1.prototype._bind = function (node, directive) {
  directive.el = node; // save node as reference
  node.removeAttribute(directive.attr.name);

  var key = directive.key,
      binding = this._bindings[key] || this._createBinding(key);

  // add directive to this binding
  binding.directives.push(directive);

  if (directive.bind) {
    directive.bind(node, binding.value);
  }
};

Seed$1.prototype._createBinding = function (key) {
  var binding = {
    value: undefined,
    directives: []
  };

  this._bindings[key] = binding;

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

Seed$1.prototype.dump = function () {
  var data = {};

  for (var key in this._bindings) {
    data[key] = this._bindings[key];
  }

  return data;
};

Seed$1.prototype.destroy = function () {
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

Seed$1.config = Config;
buildSelector();

Seed$1.directive = function (name, fn) {
  directives[name] = fn;
  buildSelector();
};

Seed$1.filter = function (name, fn) {
  filters[name] = fn;
};

Seed$1.extend = function (app) {
  var Spore = function Spore() {
    Seed$1.apply(this, arguments);
    for (var prop in this.extensions) {
      var ext = this.extensions[ext];
      this.scope[prop] = typeof ext === 'function' ? ext.bind(this) : ext;
    }
  };

  Spore.prototype = Object.create(Seed$1.prototype);
  Spore.prototype.extensions = {};
  for (var prop in app) {
    Spore.prototype.extensions[prop] = app[prop];
  }

  return Spore;
};

function buildSelector() {
  Config.selector = Object.keys(directives).map(function (directive) {
    return '[' + Config.prefix + '-' + directive + ']';
  }).join();
}

return Seed$1;

}());
