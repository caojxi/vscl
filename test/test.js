import Seed from './../src'
import assert from 'assert'

describe('Seed', function () {
  it('should have a create method', function () {
    assert.ok(Seed.create)
  })
})