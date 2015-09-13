/*
 * Serve JSON to our AngularJS client
 */
var package_obj = require('../package.json');
var bcrypt = require('bcrypt');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var db = null;
// Connection URL
var url = 'mongodb://localhost:27017/'+package_obj.name;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db_ptr) {
    if(err){
        return console.log('Error starting mongodb', package_obj.name, err);
    }
    console.log("Mongo db connection started. DB = "+package_obj.name);
    db = db_ptr;
});


// Helper functions
function requiredField(req, res, field){
    if(!req.request[field]){
        res.json({success:false, error: field+' is a required field'});
        return;
    }
    return req.request[field];
}

// Middleware that will throw errors using the "help" object's required_fields and login_required properties
exports._apiRequestValidator = function(req, res, next){
    var api_name = req.path.replace('/api/', '');
    var api_help = help[api_name];
    if( (api_help.login_required) && (!req.session.user)){
        return res.json({success:false, error:'Login required', redirect:'/login'})
    }
    var errors = [];
    for(var i = 0; i < api_help.required_fields.length; i++){
        var field = api_help.required_fields[i];
        var t = typeof(req.request[field]);
        if( t == 'undefined' || t == 'null' || req.request[field] === ''){
            errors.push(field+' is a required field');
        }
    }
    if(errors.length){
        return res.json({success:false, errors:errors});
    }
    return next();
};

var help = {};
help['help'] = {required_fields:[], optional_fields:[], login_required:false, description:'Provides a list of apis available'};
exports['help'] = function(req, res){
    return res.json(help);
};


//App api paths (exports[PATH_NAME] -> domain.com/api/PATH_NAME)
help['stock_positions'] = {required_fields:[], optional_fields:[], login_required:true, description:'{data:[array of stocks owned by logged in user]}'};
exports['stock_positions'] = function(req, res){
    var data = [
        {stock:'APPL', price:391.23, change_dollars:-23.13, change_percent:-.04, shares:30420, value:93232231.33},
        {stock:'MSN', price:391.23, change_dollars:-23.13, change_percent:-.04, shares:30420, value:93232231.33},
        {stock:'GE', price:391.23, change_dollars:-23.13, change_percent:-.04, shares:30420, value:93232231.33},
    ];
    return res.json({success:true, data:data});
};
help['funds'] = {required_fields:[], optional_fields:[], login_required:true, description:'get users current funds'};
exports['funds'] = function(req, res){
    getLoggedInUser(req, res, function(user){

    });
};

help['trade/buy'] = {required_fields:['stock', 'total_value'], optional_fields:[], login_required:true, description:'Purchase stocks up to a specific value'};
exports['trade/buy'] = function(req, res){
    return res.json({success:true});
};

help['trade/sell'] = {required_fields:['stock', 'quantity'], optional_fields:[], login_required:true, description:'Sell a certain number of stocks'};
exports['trade/sell'] = function(res, res){
    return res.json({success:true});
};

// AUTH

help['auth/register'] = {required_fields:['username', 'password'], optional_fields:['email'], login_required:false, description:'Create a new user'};
exports['auth/register'] = function(req, res){
    var username = req.request.username,
        password = req.request.password;
    var display_username = username;
    username = username.toLowerCase();
    var user = {};
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            var user={
                password_hash: hash,
                _id: username,
                display_username: display_username
            };
            db.collection('users').insertOne(user, function userInsertCallback(err, result){
                if(err){
                    return res.json({success:false, error:'Error creating user.'});
                }
                return res.json({success:true, message:'Registration successful. Please log in.'});
            });
        });
    });
};


help['auth/login'] = {required_fields:['username', 'password'], optional_fields:[], login_required:false, description:'Login as a user. Returns {success:true, username:username} for logged in user '};
exports['auth/login'] = function(req, res){
    var username = req.request.username,
        password = req.request.password;
    username = username.toLowerCase();

    db.collection('users').findOne({_id:username}, function(err, user){
        if(err || !user){
            return res.json({success:false, error:'No user found: '+ username});
        }
        bcrypt.compare(password, user.password_hash, function (err, matched) {
            if(!matched){
                return res.json({success:false, error:'Login failure. Invalid password'});
            }else{
                delete user.password_hash; //so that isn't set in the json;
                req.session.user = user;
                return res.json({success:true, message:'User logged in', user:user});
            }
        });

    });
};

help['auth/logout'] = {required_fields:[], optional_fields:[], login_required:false, description:'Destroys user session'};
exports['auth/logout'] = function(req, res){
    req.session.user = null;
    return res.json({success:true, message:'User logged out'})
}

help['auth/login_status'] = {required_fields:[], optional_fields:[], login_required:false, description:'returns {success:true, username:username} if user is logged in'};
exports['auth/login_status'] = function(req, res){
    if(req.session.user) {
        res.json({success:true, user: req.session.user})
    }else{
        res.json({success:false});
    }
};
help['auth/logged_in_user'] = {required_fields:[], optional_fields:[], login_required:true, description:'returns {success:true, user:userObject} if user is logged in'};
exports['auth/logged_in_user'] = function(req, res){
    getLoggedInUser(req, res, function(user){
        return res.json({success:true, user:user});
    })
};

function getLoggedInUser(req, res, callback){
    db.collection('users').findOne({_id:req.session.user._id}, function(err, user){
        if(err || !user){
            return res.json({success:false, error:'No user found:'+req.session.user._id});
        }
        delete user.password_hash;
        return callback(user);
    });
}
var stocks = [
    {ticker:'APPL', price:32.44, delay:15},
    {ticker:'MSN', price:12.22, delay:15},
    {ticker:'TOYT', price:10.37, delay:30}
];
help['stock/search'] =  {required_fields:['q'], optional_fields:[], login_required:false, description:'finds stocks and their prices by search terms'}
exports['stock/search'] = function stockSearch(req, res){
    var out = stocks;
    res.json(out);
};

help['stock/quote'] = {required_fields:['ticker'], optional_fields:[], login_required:false, description:'Get stock info including price and delay'};
exports['stock/quote'] = function stockPrice(req, res){
    getStockQuote(req.request['ticker'], function(stock){
        res.json(stock);
    });
};

function getStockQuote(ticker, callback){
    var out = null;
    stocks.forEach(function(stock){
        if(stock.ticker == ticker){
            out = stock;
        }
    });
    callback(out);
}


help['stock/buy'] = {required_fields:['ticker', 'dollar_amount', 'quantity'], optional_fields:[], login_required:true, description:'Buy as many stocks as you can for x dollars up to a certain quantity. Delayed 15 min'};
exports['stock/buy'] = function stockBuy(req, res){
    var ticker = req.request['ticker'];
    getStockQuote(ticker, function(stock){
        getLoggedInUser(req, res, function(user){
            var delay = stock.delay * 60 * 1000; //convert minutes to microseconds
            var now = new Date();
            var completes = new Date(now+delay);
            var pending_transaction = {completes:completes, user_id:user._id, dollar_amount:req.request.dollar_amount, quantity:req.request.quantity };
            db.collection('pending_buys').insertOne(pending_transaction);
            res.json({success:true, delay:stock.delay, transaction:pending_transaction});
        });
    });
};


help['stock/sell'] = {required_fields:['ticker', 'quantity'], optional_fields:[], login_required:true, description:'Sell this many stocks. Delayed 15 min'}
