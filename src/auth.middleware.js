const jwt = require('jsonwebtoken');

const PIN = process.env.PIN || '123456';

const checkToken = (req, res, next) => {
  let token = req.headers.authorization;

  if (token) {
    token = token.slice(7, token.length);
    jwt.verify(token, PIN, (err, decoded) => {
      if (err) {
        res.status(401)
          .json({ msg: 'Invalid token' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(400)
      .json({ msg: 'Empty token' });
  }
};

module.exports = { checkToken };
