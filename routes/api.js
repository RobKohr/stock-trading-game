/*
 * Serve JSON to our AngularJS client
 */

exports.account_info = function(req, res){
	var out = {
		name:'Benjamin Wiley',
		email:'benjamin.wiley@weinraubanalytics.com',
		phone:'857-389-8232',
		address:'308 Old Buggy Trl',
		city:'Hillsborough',
		state:'NC',
		zip:'27278'
	}
	res.json(out);
}

exports.summary = function(req, res){
	var out = [
		{
			date:new Date('3/31/15'),
			value:164553.9,
			hurdle_account:161380.34,
			loss_account:0,
			fee:1086.80
		},
		{
			date:new Date('12/31/14'),
			value:156824.66,
			hurdle_account:160678.75,
			loss_account:0,
			fee:''
		},
		{
			date:new Date('9/30/14'),
			value:151911.61,
			hurdle_account:153919.62,
			loss_account:2088.39,
			fee:''
		},
	];
	res.json(out);
}
exports.transactions = function(req, res){
	var out = [
		{
			date:new Date('12/31/15'),
			amount:1000000,
			type:'deposit'
		},
		{
			date:new Date('12/31/15'),
			amount:1000000,
			type:'deposit'
		},
		{
			date:new Date('12/31/15'),
			amount:1000000,
			type:'deposit'
		},
	];
	res.json(out);
}