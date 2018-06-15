const https = require('https')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const vscode = require('vscode')
const request =  {}
const code = {}

const isPkg = (cwd) => {
  return fs.existsSync(path.join(cwd, 'package.json'))
}

const createFile = (cwd, filename, content, output, cb = () => {}) => {
  let file = path.join(cwd, filename)
  dirP(file)
  if (fs.existsSync(file)) {
    fs.renameSync(file, file + '.backup_' + Date.now())
    output.appendLine('Current config has been renamed.')
  }
  fs.writeFile(file, content, 'utf8', cb)
}

request.get = (uri, cb) => {
  const opt = {
    protocol: 'https:',
    host: 'api.github.com',
    path: uri,
    headers: {
      'User-Agent': 'Node/10, hate IE',
      'Accept': `application/vnd.github.v3+json`,
    }
  }
  https.get(opt, res => {
    let error
    const contentType = res.headers['content-type']
    if (res.statusCode !== 200) {
      error = new Error(`Request Failed.\n Code: ${res.statusCode}`)
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                      `Expected application/json but received ${contentType}`)
    }
    if (error) {
      res.resume()
      cb(error)
      return
    }

    res.setEncoding('utf8')
    let rawData = ''
    res.on('data', (chunk) => { rawData += chunk })
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData)
        cb(null, parsedData)
      } catch (e) {
        cb(e)
      }
    })
  }).on('error', e => {
    cb(e)
  })
}

function extractContent(files, filename) {
  filename = path.basename(filename)
  return files[filename].content
}

const run = (command, cwd, output, cb = () => {}) => {
  output.appendLine(command)
  exec(command, {cwd}, (err, stdout, stderr) => {
    if (err) {
      output.appendLine(`Error: ${err.message}`)
      return
    }
    output.appendLine(`${stderr}`)
    output.appendLine(`${stdout}`)
    cb()
  })
}

code.command = (command, cb) => {
  return vscode.commands.registerCommand(`extension.${command}`, cb)
}
code.cwd = vscode.workspace.workspaceFolders ?
              vscode.workspace.workspaceFolders.length > 0 ?
              vscode.workspace.workspaceFolders[0].uri.fsPath:
              undefined:
            undefined

code.msg = vscode.window.showInformationMessage
code.output = () => {
  return vscode.window.createOutputChannel('safo')
}

function mergeObject (local, other) {
  Object.keys(other).forEach(k => {
    if (typeof local[k] === 'undefined') {
      local[k] = other[k]
      return
    }
    if (typeof local[k] !== typeof other[k]) return
    if (typeof other[k] === 'object') return mergeObject(local[k], other[k])
    if (other[k].constructor === Array) {
      other[k].forEach(ele => {
        if (local[k].indexOf(ele) === -1) local[k].push(ele)
      })
    }
    local[k] = other[k]
  })
  return local
}

function dirP(filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  dirP(dirname)
  fs.mkdirSync(dirname)
}
module.exports = {
  request,
  extractContent,
  createFile,
  run,
  code,
  isPkg,
  mergeObject,
  dirP
}
