import Config from './config'
import watchArray from './watchArray'

const directives = {
  text: function (value) {
    this.el.textContent = value || ''
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  class: function (value) {
    this.el.classList[value ? 'add' : 'remove'](this.arg)
  },
  on: {
    update: function (handler) {
      var event = this.arg
      if (!this.handlers) {
        this.handlers = {}
      } 

      var handlers = this.handlers

      if (handlers[event]) {
        this.el.removeEventListener(event, handlers[event])
      }

      if (handler) {
        this.el.addEventListener(event, handler)
        handlers[event] = handler
      }
    },
    unbind: function () {
      var event = this.arg

      if (this.handlers) {
        this.el.removeEventListener(event, this.handlers[event])
      }
    }
  },
  each: {
    update: function (collection) {
      watchArray(collection, this.mutate.bind(this))
    },
    mutate: function (mutation) {

    }
  }
}

export default directives