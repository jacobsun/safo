const path = require('path')
const fs = require('fs')
const {mergeObject, code, run, isPkg, request, extractContent, createFile} = require('./helpers/helpers')
const {FILENAME_STYLUS, FILENAME_JS, CONTENT_JS, FILENAME_HTML, FILENAME_WEBPACK, CMD_WEBPACK, SCRIPTS_WEBPACK, SCRIPTS_MOCHA, CMD_MOCHA, CMD_ESLINT, CMD_INIT, URL_CONFIG, FILENAME_ESLINT, FILENAME_MOCHA, CONTENT_MOCHA} = require('./constants')

const eslint = {}

eslint.install = (cwd, output) => {
  if (isPkg(cwd)) {
    run(CMD_ESLINT, cwd, output)
  } else {
    run(CMD_INIT, cwd, output, () => {
      run(CMD_ESLINT, cwd, output)
    })
  }
}

eslint.config = (cwd, output) => {
  output.appendLine(`Request ${URL_CONFIG}`)
  request.get(URL_CONFIG, (err, data) => {
    if(err) {
      code.msg(err.message)
      output.appendLine(err)
      return
    }
    output.appendLine('Successfully Requested.')
    const content = extractContent(data.files, FILENAME_ESLINT)
    createFile(cwd, FILENAME_ESLINT, content, output, err => {
      if (err) {
        output.appendLine(err)
      } else {
        output.appendLine("Config wrote.")
      }
    })
  })
}

const mocha = {}
mocha.install = (cwd, output) => {
  if (isPkg(cwd)) {
    run(CMD_MOCHA, cwd, output, () => {
      updatePackageJson(SCRIPTS_MOCHA, cwd, output)
    })
  } else {
    run(CMD_INIT, cwd, output, () => {
      run(CMD_MOCHA, cwd, output)
    })
  }
}

mocha.config = (cwd, output) => {
  createFile(cwd, FILENAME_MOCHA, CONTENT_MOCHA, output, err => {
    if (err) {
      output.appendLine(err)
    } else {
      output.appendLine("Config wrote.")
    }
  })
}
const webpack = {}
webpack.install = (cwd, output) => {
  if (isPkg(cwd)) {
    run(CMD_WEBPACK, cwd, output, () => {
      updatePackageJson(SCRIPTS_WEBPACK, cwd, output)
    })
  } else {
    run(CMD_INIT, cwd, output, () => {
      run(CMD_WEBPACK, cwd, output, () => {
        updatePackageJson(SCRIPTS_WEBPACK, cwd, output)
      })
    })
  }
}

webpack.config = (cwd, output) => {
  output.appendLine(`Request ${URL_CONFIG}`)
  request.get(URL_CONFIG, (err, data) => {
    if(err) {
      code.msg(err.message)
      output.appendLine(err)
      return
    }
    output.appendLine('Successfully Requested.')
    const webpackConfig = extractContent(data.files, FILENAME_WEBPACK, output)
    createFile(cwd, FILENAME_WEBPACK, webpackConfig, output, err => {
      if (err) {
        output.appendLine(err)
      } else {
        updatePackageJson(SCRIPTS_WEBPACK, cwd, output)
        output.appendLine("webpack.config.js wrote.")
      }
    })
    const html = extractContent(data.files, FILENAME_HTML, output)
    createFile(cwd, FILENAME_HTML, html, output, err => {
      if (err) {
        output.appendLine(err)
      } else {
        output.appendLine("index.html wrote.")
      }
    })
    const styles = extractContent(data.files, FILENAME_STYLUS, output)
    createFile(cwd, FILENAME_STYLUS, styles, output, err => {
      if (err) {
        output.appendLine(err)
      } else {
        output.appendLine("main.styl wrote.")
      }
    })
    createFile(cwd, FILENAME_JS, CONTENT_JS, output, err => {
      if (err) {
        output.appendLine(err)
      } else {
        output.appendLine("src/index.js wrote.")
      }
    })
  })
}
module.exports = {
  eslint,
  mocha,
  webpack
}

function updatePackageJson(other, cwd, output) {
  const packageFileUrl = path.join(cwd, 'package.json')
  const local = fs.readFileSync(packageFileUrl)
  if (!local) return
  fs.writeFileSync(packageFileUrl, mergePackageJson(local, other))
  output.appendLine('package.json updated.')
}

function mergePackageJson (local, other) {
  return JSON.stringify(mergeObject(JSON.parse(local), JSON.parse(other)),undefined,2)
}
