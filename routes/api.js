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

