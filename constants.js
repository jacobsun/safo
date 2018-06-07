exports.CMD_ESLINT = `yarn add --dev eslint eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard`
exports.CMD_MOCHA = `yarn add --dev mocha chai`
exports.CMD_INIT = `yarn init -y`
exports.URL_CONFIG = `https://api.github.com/gists/9750f9be5f31b2ef7fe8432b5a2efa98`
exports.FILENAME_ESLINT = '.eslintrc.json'
exports.FILENAME_MOCHA = 'test/index.test.js'

exports.CONTENT_MOCHA = `
const expect = require('chai').expect

describe('Test example', () => {
  it('should be equal', () => {
    expect(1).to.equal(1)
  })
})
`

exports.SCRIPTS_MOCHA = JSON.stringify(
{
  "scripts": {
    "test": "mocha test/**/*.js"
  }
}
)
