
var package = require('../package.json');
console.log(package);
/*
 * GET home page.
 */

exports.index = function(req, res){
	var client_javascript_paths = package.configs.client_javascript_paths;
	//get rid of public/
	for(var i = 0; i<client_javascript_paths.length; i++){
		var path = client_javascript_paths[i];
		path = path.replace('public/', '');
		client_javascript_paths[i] = path;
	}
	res.render('index', {client_javascript_paths:client_javascript_paths, title:package.display_name});
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};