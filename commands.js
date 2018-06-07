const path = require('path')
const fs = require('fs')
const {mergeObject, code, run, isPkg, request, extractContent, createConfig} = require('./helpers/helpers')
const {SCRIPTS_MOCHA, CMD_MOCHA, CMD_ESLINT, CMD_INIT, URL_CONFIG, FILENAME_ESLINT, FILENAME_MOCHA, CONTENT_MOCHA} = require('./constants')

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
    createConfig(cwd, FILENAME_ESLINT, content, output, err => {
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
  createConfig(cwd, FILENAME_MOCHA, CONTENT_MOCHA, output, err => {
    if (err) {
      output.appendLine(err)
    } else {
      output.appendLine("Config wrote.")
    }
  })
}

module.exports = {
  eslint,
  mocha
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
