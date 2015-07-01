/*
 * Serve JSON to our AngularJS client
 */

var apis = ['auth'];

//merge all of the api paths together
for(var i = 0; i<apis.length; i++){
    var api = require('./api/'+apis[i]);
    for(var key in api){
        exports[key] = api[key];
    }
}

exports['stock_positions'] = function(req, res){
    var data = [
        {stock:'APPL', price:391.23, change_dollars:-23.13, change_percent:-.04, shares:30420, value:93232231.33},
        {stock:'MSN', price:391.23, change_dollars:-23.13, change_percent:-.04, shares:30420, value:93232231.33},
        {stock:'GE', price:391.23, change_dollars:-23.13, change_percent:-.04, shares:30420, value:93232231.33},
    ]
    return res.json({success:true, data:data});
}