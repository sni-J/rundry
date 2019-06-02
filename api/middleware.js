const jwt = require('jsonwebtoken');

const isSignedIn = (req, res, next) => {
  const token = req.headers['x-access-token'];
  const secret = req.app.get('jwt-secret');
  if(!token){ return res.status(403).json({success: false, message:'Not signed in'})}
  const decode = async () => {
    try{
      jwt.verify(token, secret, (err, decoded) => {
        if(err) return res.status(403).json({success:false, message:'Invalid Token'});
        req.decoded = decoded;
        next();
      })
    }catch(err){
      res.status(403).json({
        message: err.message,
      });
    }
  }

  decode();
}


module.exports = {isSignedIn};
