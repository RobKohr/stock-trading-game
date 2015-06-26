var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorhandler = require('errorhandler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  path = require('path'),
  session = require('express-session');

/* app setup */
var app = module.exports = express();

/**
 * Configuration
 */

// all environments
app.use(session({secret: 'SUPERSECRET!flsjdfeasdlfjewrio3u29oau390u8adslfjou3r4343'}));
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorhandler());
}

// production only
if (env === 'production') {
  // TODO
}


/**
 * Routes
 */

// serve index and view partials
app.get('/*.html', function(req, res, next){
   res.send(404);
});

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);


function mergeGetPost(req, res, next){
  var mergedRequest = {};
  if(req.query){
    for(var key in req.query){
      mergedRequest[key] = req.query[key];
    }
  }
  if(req.body){
    for(var key in req.body){
      mergedRequest[key] = req.body[key];
    }
  }
  req.request = mergedRequest;
  next();
}

// JSON APIs
for(var key in api){
  app.get('/api/'+key, mergeGetPost, api[key]);
  app.post('/api/'+key, mergeGetPost, api[key]);
}

app.get('/api/*', function(req, res, next){
  res.status(404).json({errors:['No api exists at that path.']});
})


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

var connection = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

