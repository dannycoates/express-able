var able = require('able')
var path = require('path')
var parseUrl = require('parseurl')

module.exports = function (options) {
  var project = null

  function getProject(cb) {
    if (project) { return cb(null, project) }
    able.load(
      {
        dirname: path.resolve(process.cwd(), options.dir || './experiments'),
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
    var pathname = parseUrl(req).pathname
    if (
      options.addRoutes &&
      req.method === 'GET' &&
      pathname === '/experiments.bundle.js'
    ) {
      getProject(
        function (err, proj) {
          if (err) { return next(err) }
          var body = Buffer(proj.bundle('/able/report'), 'utf8')
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Content-Length', body.length)
          res.end(body)
        }
      )
      return
    }
    else if (
      options.addRoutes &&
      options.reportHandler &&
      req.method === 'POST' &&
      pathname === '/able/report'
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
