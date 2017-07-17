const directives = {
  text: function (el, value) {
    el.textContent = value || ''
  },
  show: function (el, value) {

  },
  class: function (el, value, classname) {

  },
  on: {
    update: function (el, handler, event, directive) {

    },
    unbind: function (el, event, directive) {

    },
    customFilter: function (handler, selector) {
      
    }
  }
}

export default directives