var proto = Array.prototype,
    slice = proto.slice,
    mutatorMethods = [
      'pop',
      'push',
      'shift',
      'unshift',
      'splice',
      'sort'
    ]

var watchArray = function (arr, cb) {
  mutatorMethods.forEach(function (method) {
    arr[method] = function () {
      proto[method].apply(this, arguments)
      cb({
        event: method,
        args: slice.call(arguments), // return a shallow copy
        array: arr
      })
    }
  })
}

export default watchArray