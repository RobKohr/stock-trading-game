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
    if( (api_help.login_required) && (!req.session.username)){
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
    var email = req.request.email,
        password = req.request.password;
    email = email.toLowerCase();

    db.collection('users').findOne({_id:username}, function(err, user){
        if(err || !user){
            return res.json({success:false, error:'No user found: '+ username});
        }
        bcrypt.compare(password, user.password_hash, function (err, matched) {
            if(!matched){
                return res.json({success:false, error:'Login failure. Invalid password'});
            }else{
                req.session.username = user._id;
                delete user.password_hash; //so that isn't set in the json;
                return res.json({success:true, message:'User logged in', username: user._id, user:user});
            }
        });

    });
};

help['auth/login_status'] = {required_fields:[], optional_fields:[], login_required:false, description:'returns {success:true, username:username} if user is logged in'};
exports['auth/login_status'] = function(req, res){
    if(req.session.username) {
        res.json({success:true, username: req.session.username})
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
    db.collection('users').findOne({_id:req.session.username}, function(err, user){
        if(err || !user){
            return res.json({success:false, error:'No user found: '+ username});
        }
        delete user.password_hash;
        return callback(user);
    });
}