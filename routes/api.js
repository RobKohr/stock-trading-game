/*
 * Serve JSON to our AngularJS client
 */

var mysql      = require('mysql');
var ejs      = require('ejs');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'weinraub'
});
connection.connect();

function formatString(str, args)
{
	console.log(args);
    for(i = 0; i < args.length; i++)
    {
    	var rx = new RegExp('\\{' + (i) + '\\}', "g");
        str = str.replace(rx, args[i]);
     }
     return str;
}

var emailAuth = 
    {
        user: 'weinraubtest@gmail.com',
        pass: 'analytics'
    };


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: emailAuth
});



var runQuery = function(query, args, callback){
	console.log('str', query, args);
	connection.query(query, args, callback);
};

var sendQueryResponse = function(query, args, res){
	runQuery(query, args, function(err, rows, fields){
		console.log(rows);
		res.json({data:rows, success:true});
	});
};

var sendQueryFirstResponse = function(query, args, res){
	runQuery(query, args, function(err, rows, fields){
		if(rows.length){
			res.json({data:rows[0], success:true});
		}else{
			res.json({success:false, error:'No results'});
		}
	});
};

var hasResult = function(err, results){
	if (err || !results || !results[0]){
		return false;
	}else{
		return true;
	}
}

/*
	Begin api listings. All methods are accessable through http://somedomain.com/api/METHOD_NAME
*/

//helper for path email/token
function sendTokenEmail(user){
    transporter.sendMail({
	from: emailAuth.user,
	to: user.email,
	subject: 'Your Weinraub Account Registration',
	text: 
	[
	    'Hello '+user.name+',',
	    '',
	    'Click on this link to activate your account:',
	    'http://weinraubanalytics.com/register?token='+user.token,
	    '',
	    'Sincerly,',
	    'The Weinraub Team'
	].join('\n')
    });

}


exports['email/token'] = function(req, res){
	if(!req.query.id){
		return res.json({success:false, error:'You must pass a user id like so: /api/email/token?id=123'});
	}
	var out = {sent:true, id:req.query.id};
	
	runQuery('UPDATE userInfo set token = MD5(RAND()) WHERE token IS NULL', function(){
		runQuery("Select * from userInfo where userId=?", [req.query.id], function(err, results, fields){
			if(err || !results || !results[0]){
				return res.json({success:false, error:'User not found with id '+req.query.id})
			}
			var user = results[0];
			if(user.email_sent){
				return res.json({success:false, error:'Email already sent to user. Set email_sent=0 if you want to resend'});
			}
			sendTokenEmail(user);
			runQuery('UPDATE userInfo set email_sent = ? where userId = ?', [true, req.query.id], function(){
				return res.json({succsss:true, message:'Email sent to '+user.email});
			});
		});
	});
}


exports['auth/user_from_token'] = function(req, res){
	runQuery("Select * from userInfo where token=?", [req.request.token], function(err, results, fields){
		if(err || !results || !results[0]){
			return res.json({success:false, error:'No user found with token '+req.request.token});
		}
		return res.json(results[0]);
	});
}

exports['auth/login_status'] = function(req, res){
	res.json({loggedInUserId: req.session.loggedInUserId})
}


exports['auth/register'] = function(req, res){
	var out = {};
	out.success = false;
	if(!req.request.password){
		out.error = 'Password is required';
		return res.json(out);
	}

	var update = {token:req.request.token};

	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(req.request.password, salt, function(err, hash) {
	        // Store hash in your password DB. 
	        update.password = hash;
	        runQuery("Update userInfo set password=? where token=?", [update.password, update.token], function(err, results, fields){
				if(err){
					return res.json({success:false, error:'Error updating record in db.'});
				}
				return res.json({success:true, message:'Registration successful. Please log in.'});
			});
	    });
	});

}


exports['auth/login'] = function(req, res){
	runQuery("select * from userInfo where email=?", [req.request.email], function(err, results, fields){
		if(!hasResult(err, results)){
			return res.json({success:false, error:'No user found: '+ req.request.email});
		}
		var user = results[0];
		bcrypt.compare(req.request.password, user.password, function(err, matched) {
	    	if(!matched){
	    		return res.json({success:false, error:'Login failure. Invalid password'});
	    	}else{
	    		req.session.loggedInUserId = user.userId;
	    		return res.json({success:true, message:'User logged in', loggedInUserId : user.userId});
	    	}
		});
	});
}

exports['auth/logout'] = function(req, res){
	delete req.session.loggedInUserId;
	res.json({success:true, message:'User logged out', loggedInUserId:false});
}

function loginFailure(req, res){
	if(!req.session.loggedInUserId){
		res.send({success:false, error:'User not logged in'});
		return true;
	}
	return false;
}

exports.account_info = function(req, res){
	if(loginFailure(req, res)) return;
	sendQueryFirstResponse("SELECT * from userInfo where userId=?", [req.session.loggedInUserId], res);

}


exports.summary = function(req, res){
	if(loginFailure(req, res)) return;
	var query = 'select v.date, v.afterTransactions as value \
	, h.afterTransactions as hurdleValue \
    , l.loss as lossValue \
    , f.fee as feeCharged \
from accountValues v  \
join hurdleAccounts h on v.userId=h.userId and v.date = h.date \
join lossAccounts l on l.userId=v.userId and l.date = v.date \
join feesCharged f on f.userId=v.userId and f.date = v.date \
where v.userId=? \
order by v.date';
	sendQueryResponse(query, [req.session.loggedInUserId], res);
}

exports.performance = function(req, res){
	if(loginFailure(req, res)) return;	
	var query = 'select v.date, v.afterTransactions as value, m.sp500 \
from accountValues v \
join market m on v.date = m.pricingDate \
where v.userId=? \
order by v.date';
	sendQueryResponse(query, [req.session.loggedInUserId], res);
}

exports.transactions = function(req, res){
	if(loginFailure(req, res)) return;
	var query = "select t.transDate as date \
	, abs(amount) as amount \
    , if(amount > 0, 'Deposit', 'Withdrawal') as type \
from transactions t \
where t.userId=? \
union \
select f.date, f.fee as amount, 'Fee' \
from feesCharged f \
where f.userId=? and f.fee>0 \
order by date";
	sendQueryResponse(query, [req.session.loggedInUserId, req.session.loggedInUserId], res);
}
