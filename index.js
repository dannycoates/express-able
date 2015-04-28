var able = require('able')
var path = require('path')
var parseUrl = require('parseurl')

module.exports = function (options) {
  var project = null
  var bundlePath = options.bundlePath || '/experiments.bundle.js'
  var reportPath = options.reportPath || '/able/report'
  var experimentDir = options.dir || './experiments'

  function getProject(cb) {
    if (project) { return cb(null, project) }
    able.load(
      {
        dirname: path.resolve(process.cwd(), experimentDir),
        gitUrl: options.git,
        watch: options.watch
      },
      function (err, proj) {
        if (err) { return cb(err) }
        project = proj
        cb(null, project)
      }
    )
  }

  return function ab(req, res, next) {
    if (options.addRoutes) {
      var pathname = parseUrl(req).pathname
      if (
        pathname === bundlePath &&
        req.method === 'GET'
      ) {
        getProject(
          function (err, proj) {
            if (err) { return next(err) }
            var body = Buffer(proj.bundle(reportPath), 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/javascript')
            res.setHeader('Content-Length', body.length)
            res.end(body)
          }
        )
        return
      }
      else if (
        pathname === reportPath &&
        req.method === 'POST' &&
        options.reportHandler
      ) {
        options.reportHandler(
          req.body,
          function (err) {
            res.setHeader('Content-Type', 'application/json')
            if (err) {
              res.statusCode = 500
              res.end('{"err":' + JSON.stringify(err.toString()) + '}')
            }
            else {
              res.statusCode = 200
              res.end('{}')
            }
          }
        )
        return
      }
    }
    if (req.able) { return next() }
    getProject(
      function (err, proj) {
        if (err) { return next(err) }
        req.able = proj.ab()
        next()
      }
    )
  }
}
