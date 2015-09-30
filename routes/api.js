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
    {ticker:'APPL', price:32.44, delay:0.25},
    {ticker:'MSN', price:12.22, delay:0.25},
    {ticker:'TOYT', price:10.37, delay:30}
];
help['stock/search'] =  {required_fields:['q'], optional_fields:[], login_required:false, description:'finds stocks and their prices by search terms'}
exports['stock/search'] = function stockSearch(req, res){
    var out = stocks;
    res.json(out);
};

help['stock/quote'] = {required_fields:['ticker'], optional_fields:[], login_required:false, description:'Get stock info including price and delay'};
exports['stock/quote'] = function stockPrice(req, res){
    getStockQuote(req.request['ticker'], function(stock, err){
        if(err){
            res.json({error:err});
        } else {
            res.json(stock);
        }
    });
};

var http = require('http');
function getStockQuote(ticker, callback){
    ticker = ticker.toUpperCase();
    if (!ticker.match(/^[0-9A-Z]+$/)) {
        return callback(null, {message:'Invalid ticker'});
    }


    var options = {
        host: 'download.finance.yahoo.com',
        port: 80,
        path: '/d/quotes.csv?s='+ticker+'&f=snabxj2'
    };
    http.get(options, function(resp){
        resp.setEncoding('utf8');
        resp.on('data', function(data){
            data = data.split(',');
            var labels = ['symbol', 'name', 'ask', 'bid', 'exchange', 'outstanding_shares'];
            var isNumber = {ask:1, bid:1, outstanding_shares:1};
            var out = {};
            labels.forEach(function(label, index){
                var val = data[index].replace(/"/g, '').replace(/\n/g, '');
                if(isNumber[label]){
                    val = Number(val);
                }
                out.delay = 0.25;
                out[label] = val;
            })
            return callback(out, null);
        });
    }).on("error", function(e){
        return callback(null, {message:'Error making request'});
    });

}

function createBuyOrSell(req, res, type){
    var ticker = req.request['ticker'];
    getStockQuote(ticker, function(stock){
        getLoggedInUser(req, res, function(user){
            var delay = stock.delay * 60 * 1000; //convert minutes to microseconds
            var now = new Date();
            var completes = new Date(now.getTime() + delay);
            var pending_transaction = {completes:completes, user_id:user._id, quantity:Number(req.request.quantity), ticker:ticker };
            if(type=='buy'){
                //buy orders have an upper limit of expected dollar amount.
                pending_transaction.dollar_amount = Number(req.request.dollar_amount);
            }
            db.collection('pending_'+type+'s').insertOne(pending_transaction);
            res.json({success:true, delay:stock.delay, transaction:pending_transaction, type:type});
        });
    });
}

help['stock/buy'] = {required_fields:['ticker', 'dollar_amount', 'quantity'], optional_fields:[], login_required:true, description:'Buy as many stocks as you can for x dollars up to a certain quantity. Delayed 15 min'};
exports['stock/buy'] = function stockBuy(req, res){
    createBuyOrSell(req, res, 'buy');
};

help['stock/sell'] = {required_fields:['ticker', 'quantity'], optional_fields:[], login_required:true, description:'Sell stocks. Delayed 15 min'};
exports['stock/sell'] = function stockSell(req, res){
    createBuyOrSell(req, res, 'sell');
};

function updateUserBalances(user, andSave){
    user.balance = user.income = getCurrentIncome();
    if(!user.transactions) user.transactions = [];
    user.portfolio = {};

    user.transactions.forEach(function(transaction){
        user.balance += transaction.cash_change;
        var ticker = transaction.ticker;
        var position = user.portfolio[ticker];
        if(!position) position = {quantity : 0};
        position.quantity += transaction.stock_change;
        user.portfolio[ticker] = position;
    });
    if(andSave){
        db.collection('users').save(user, function(){});
    }
    return user;
}

//returns total money earned since Jan 1, 2015 with $1000 earned every 7 days
function getCurrentIncome(){
    var start = new Date("Jan 1, 2015");
    var now = new Date();
    var diff = now.getTime() - start.getTime();
    var microsInSec = 1000, secsInMin = 60, minsInHour = 60, hoursInDay = 24, daysInWeek = 7;
    var microsInWeek =  microsInSec * secsInMin * minsInHour * hoursInDay * daysInWeek;
    var diffInWeeks = Math.floor(diff/microsInWeek);
    return diffInWeeks * 1000;
}

setTimeout(processPendingBuys, 2000);
function processPendingBuys(){
    db.collection('pending_buys').find({completes:{$lt:new Date()}}).toArray(function(err, buys){
        if(err){
            console.log('Error getting pending buys in processPendingBuys', err);
            return setTimeout(processPendingBuys, 1000);
        }
        for(var i = 0; i < buys.length; i++){
            var buy = buys[i];
            db.collection('pending_buys').remove({_id:buy._id});
            getStockQuote(buy.ticker, function(quote){
                db.collection('users').findOne({_id:buy.user_id}, function(err, user){
                    if(err){
                        return console.log('Error finding user in processPendingBuys', err);
                    }
                    if(user){
                        if(!user.transactions){
                            user.transactions = [];
                        }
                        var user = updateUserBalances(user);
                        var quantity = Math.floor(buy.dollar_amount / quote.ask);
                        if(quantity > buy.quantity){
                            quantity = buy.quantity;
                        }

                        var transaction = {
                            cash_change: -quantity * quote.ask,
                            ticker: buy.ticker,
                            stock_change: quantity
                        };
                        if(quantity * quote.ask > user.balance){
                            if(!user.messages) user.messages = [];
                            transaction.balance = user.balance;
                            transaction.user_id = user._id;
                            var message = 'Failed trying to buy :' + JSON.stringify(transaction);
                            user.messages.push();
                            return message;
                        }
                        user.transactions.push(transaction);
                        var user = updateUserBalances(user, true);
                        console.log(user);
                    }
                })
            })
        }
        setTimeout(processPendingBuys, 1000);
    })
}


setTimeout(processPendingSells, 1500);
function processPendingSells(){
    db.collection('pending_sells').find({completes:{$lt:new Date()}}).toArray(function(err, records){
        if(err){
            console.log('Error getting pending records in processPendingSells', err);
            return setTimeout(processPendingSells, 1000);
        }
        for(var i = 0; i < records.length; i++){
            var sell = records[i];
            db.collection('pending_sells').remove({_id:sell._id});
            getStockQuote(sell.ticker, function(quote){
                db.collection('users').findOne({_id:sell.user_id}, function(err, user){
                    if(err){
                        return console.log('Error finding user in processPendingSells', err);
                    }
                    if(user){
                        if(!user.transactions){
                            user.transactions = [];
                        }
                        var user = updateUserBalances(user);
                        var quantity = sell.quantity;
                        var transaction = {
                            cash_change: quantity * quote.bid,
                            ticker: sell.ticker,
                            stock_change: -quantity
                        };
                        if(quantity > user.portfolio[sell.ticker].quantity){
                            if(!user.messages) user.messages = [];
                            transaction.balance = user.balance;
                            transaction.stocks_in_portfolio_available = user.portfolio[sell.ticker].quantity;
                            transaction.user_id = user._id;
                            var message = 'Failed trying to sell :' + JSON.stringify(transaction);
                            user.messages.push();
                            return message; //return, so don't add transaction to user
                        }
                        user.transactions.push(transaction);
                        var user = updateUserBalances(user, true);
                        console.log(user);
                    }
                })
            })
        }
        setTimeout(processPendingSells, 1000);
    })
}





help['stock/sell'] = {required_fields:['ticker', 'quantity'], optional_fields:[], login_required:true, description:'Sell this many stocks. Delayed 15 min'}
