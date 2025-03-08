const jsonwebtoken = require("jsonwebtoken")
const secret = "lam"
const JWT = {
    generate(value,exprires){// 加密信息,过期时间
        return jsonwebtoken.sign(value,secret,{expiresIn:exprires})
    },
    verify(token){
        try{
            return jsonwebtoken.verify(token,secret)
        }catch(e){
            return false
        }
    }
}

module.exports = JWT