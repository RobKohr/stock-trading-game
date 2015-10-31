var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorhandler = require('errorhandler'),
    morgan = require('morgan'),
    routes = require('./routes'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    compress = require('compression'),
    local_config = require('./local.conf.json'),
    MongoClient = require('mongodb').MongoClient;
/* app setup */
var app = module.exports = express();

/**
 * Configuration
 */

var package_obj = require('./package.json');
var mongo_url = 'mongodb://localhost:27017/'+package_obj.name;

app.use(session({
    secret: local_config.secret,
    store: new MongoStore({ url: mongo_url })
}));

app.use(compress());
app.set('port', local_config.port || process.env.PORT || 80);
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
app.get('/*.html', f404);
app.get('/*.js', f404);

function f404(req, res, next){
    res.send(404);
}

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
    if(key.charAt(0)!='_') {
        if(typeof(api[key])=='function') {
            app.get('/api/' + key, mergeGetPost, api._apiRequestValidator, api[key]);
            app.post('/api/' + key, mergeGetPost, api._apiRequestValidator, api[key]);
        }
    }
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




// Connection URL
// Use connect method to connect to the Server
MongoClient.connect(mongo_url, function(err, db_ptr) {
    if(err){
        return console.log('Error starting mongodb', package_obj.name, err);
    }
    console.log("Mongo db connection started. DB = "+package_obj.name);
    api.db = db = db_ptr;
});
