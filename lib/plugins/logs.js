
/**
 * Appends logs to the bottom of the string as comments.
 * Each middleware should push logs to any file whenever appropriate.
 * This allows users to figure out how files were transformed
 * and normalized by the proxy just by looking at the file.
 * By logging, we could be more lenient with "errors".
 */

module.exports = function () {
  return function* walkLogs(next) {
    yield* next

    var type = this.is('js', 'css', 'html')
    if (!type) return
    var file = this.file
    if (!file) return
    // don't bother if the string was never read for whatever reason
    var string = file.string
    if (!string) return
    var logs = file.logs
    if (!logs.length) return

    switch (type) {
    case 'js':
      file.string += '\n\n' + logs.map(toJSComment).join('') + '\n'
      return
    case 'css':
      file.string += '\n\n' + logs.map(toCSSComment).join('') + '\n'
      return
    }
  }
}

function toJSComment(log) {
  return '// ' + log + '\n'
}

function toCSSComment(log) {
  return '/* ' + log + '*/\n'
}
