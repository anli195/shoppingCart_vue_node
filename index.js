/**
 * Created by anli on 2017/09/26.
 */

 var restify   = require('restify');
 var apiRouter = require('./router');

 /**
  * 使用restify创建服务器并注册组件
  */
 var server = restify.createServer(); //创建服务器
 server.use(restify.queryParser()); //注册handler
 server.use(restify.bodyParser());
 server.use(restify.dateParser());
 server.use(restify.gzipResponse());
//  restify.CORS.ALLOW_HEADERS.push('authorization');
//  restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');

 server.use(function(req, res, next) {
    var url = req.params[0];
    console.log(url)
    if (url && url == 'shoppingcart') {
        //中文处理
        var querystring = require('querystring');
        for (var key in req.params) {
            if (req.params[key].constructor == String) {
                req.params[key] = querystring.parse('val=' + req.params[key])['val'];

            } else {
                req.params[key] = JSON.parse(querystring.parse('val=' + JSON.stringify(req.params[key]))['val']);
            }
        }
    }
    return next();
});

/**
 * 路由控制
 */
server.get(/^\/((.*)(\.)(.+))*$/, restify.serveStatic({
    directory: "./public",
    default: "index.html"
}));

server.get(/^\/(shoppingcart)\/(.*)/, send);  //响应GET请求
server.post(/^\/(shoppingcart)\/(.*)/, send); //响应POST请求
server.put(/^\/(shoppingcart)\/(.*)/, send);  //响应PUT请求
server.del(/^\/(shoppingcart)\/(.*)/, send);  //响应DELETE请求

/**
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function send(req, res, next) {
    var url = req.params[1];
    if (url) {
        var queryStrs = url.split('/');
        if (queryStrs.length % 2 != 0) {
            queryStrs.push('0');
        }
        req.params[0] = queryStrs[0];
        req.params[1] = queryStrs[1];
        apiRouter.router(req, res, function(result) {
            //显式的设置Response的content-type
            if(req._contentType == 'multipart/form-data'){
                res.setHeader("Content-Type", "text/plain;charset=utf-8");
            }else{
                res.setHeader("Content-Type", "application/json;charset=utf-8");
            }
            
            res.setHeader('Cache-Control','no-cache');
            res.setHeader('Pragma','no-cache');
            
            var stringfyResult = JSON.stringify(result);
            // res.setHeader('authorization', req.session.sid);
            res.end(stringfyResult);
        });
    } else {
        return 'No supported resources found!';
    }
    return next();
}

/**
 * 端口
 */
server.listen(8888, function() {
    console.log('%s listening at %s', server.name, server.url);
});

/**
 * 当 Node 发现一个未捕获的异常时，会触发uncaughtException这个事件。
 * 并且如果这个事件存在回调函数，Node 就不会强制结束进程。
 */
process.on('uncaughtException', function(err) {
    console.log(err);
});