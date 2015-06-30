exports['auth/login_status'] = function(req, res){
    res.json({user_id: req.session.user_id})
}