express-able
============

[Able](https://www.npmjs.com/package/able) A/B testing middleware for [express](http://expressjs.com)

# Example

```js

var app = express()

app.use(
  require('express-able')({
    dir: './experiments',
    git: 'git://github.com/dannycoates/able-demo.git#master',
    addRoutes: true
  })
)

app.get('/foo', function (req, res) {
  res.send(200, req.able.choose('bar'))
})

```

## Options

- **dir** : *optional* directory where experiments are stored. Defaults to `./experiments` in the current working directory.
- **git** : *optional* a github url to watch for experiment changes.
- **addRoutes** : *optional* adds routes for using Able from a client browser. Defaults to `false`.
