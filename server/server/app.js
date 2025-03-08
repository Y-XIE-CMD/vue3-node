var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const UserRouter = require('./routes/admin/UserRouter');
const NewsRouter = require('./routes/admin/NewsRouter');
const ProductRouter = require('./routes/admin/ProductRouter');

const webNewsRouter = require('./routes/web/NewsRouter');
const webProductRouter = require('./routes/web/ProductRouter');
const JWT = require('./util/JWT');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(webNewsRouter) 
app.use(webProductRouter)


// 设置中间件验证token(在所有的中间件之前,不放行后续接口无法响应)
/*
  token有效,中间件放行next(),token无效则不放行[返回401状态]
*/
app.use((req,res,next)=>{
  // 如果token有效 ,next() 
  // 如果token过期了, 返回401错误
  /*
    首先排除登录接口(因为登录接口没有token)
  */
  if(req.url==="/adminapi/user/login"){
    next()
    return;
  }

  const token = req.headers["authorization"].split(" ")[1]
  // token解析
  if(token){
    var payload = JWT.verify(token)
    // console.log(payload)
    if(payload){
      // 每一次请求,重新生成新的token
      const newToken = JWT.generate({
        _id:payload._id,
        username:payload.username
      },"7d")
      res.header("Authorization",newToken)
      next()
    }else{
      res.status(401).send({errCode:"-1",errorInfo:"token过期"})
    }
  }
})

app.use(UserRouter) 
app.use(NewsRouter)
app.use(ProductRouter)


app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
