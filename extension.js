
const {code} = require('./helpers/helpers')
const {eslint, mocha, webpack} = require('./commands')
const output = code.output()
function activate(context) {
    const sub = Array.prototype.push.bind(context.subscriptions)
    let eslintFeature = code.command('safoEslint', () => {
        eslint.install(code.cwd, output)
        eslint.config(code.cwd, output)
    })

    let mochaFeature = code.command('safoMocha', () => {
        mocha.install(code.cwd, output)
        mocha.config(code.cwd, output)
    })

    let webpackFeature = code.command('safoWebpack', () => {
        webpack.install(code.cwd, output)
        webpack.config(code.cwd, output)
    })
    sub(eslintFeature)
    sub(mochaFeature)
    sub(webpackFeature)
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate
