const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken')

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //Authorization : 'Bearer TOKEN
        if (!token) {
            const error = new HttpError("authentication failed", 401)
        }
        const decodedToken = jwt.verify(token, 'secret_key')
        req.userData = { userId: decodedToken.userId }
        next();
    } catch (err) {
        const error = new HttpError("authentication failed", 401)
return next(error)
    }
}
module.exports = checkAuth;
