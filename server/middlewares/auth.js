const jwt = require('jsonwebtoken')
const config = require('../../config/defaut')
const exceptions = require('../../commons/exceptions')

//Verificar token
let verifyToken = (req, res, next) => {
    let token = req.get('Authorization')
    if (token) {
        jwt.verify(token.split(' ')[1], config.auth.secret, (err, user) => {
            if (err || !user) {
                return res.status(401).json({
                    ok: false,
                    code: 5101,
                    message: 'Invalid token'
                })
            }
            // Pass user to req
            req.user = user
            next()
        })
    } else {
        return res.status(401).json({
            ok: false,
            code: 5101,
            message: 'Invalid token'
        })
    }
}

//Verificar rol
let verifyRole = allowedRoles => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(exceptions.exceptionType.unauthorizeUser)
        }
        next()
    }
}
module.exports = {
    verifyToken,
    verifyRole
}
