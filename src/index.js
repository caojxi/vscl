import filters from './filters'
import directives from './directives'

function Seed(opts) {

}

export default {
  create: function (opts) {
    return new Seed(opts)
  },
  filters: filters,
  directives: directives
}