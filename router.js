/**
 * Created by anli on 2017/09/26.
 */

 var logger = require('zlogger').logger('logs/index.log');

 /**
  * router入口
  */
exports.router = function(req, res, callback) {
    var method = req.method.toUpperCase(); //把字符串转换为大写
    var event = emitEvent(method, req.params[1]);
    invoke(req, event, callback);
}

/**
 * 根据请求方式及id判断进入的方法名
 */
function emitEvent(method, id) {
    var localEvent;
    switch (method) {
        case 'GET':
            localEvent = id == 0 ? 'list' : 'retrieve';
            break;
        case 'PUT':
            localEvent = id == 0 ? 'putCollection' : 'update';
            break;
        case 'POST':
            localEvent = id == 0 ? 'create' : 'post';
            break;
        case 'DELETE':
            localEvent = id == 0 ? 'deleteCollection' : 'delete';
            break;
    }
    return localEvent;
}

/**
 * 发送请求并返回数据
 */
function invoke(req, event, callback) {
    var method = req.method.toUpperCase();
        //加载对应的资源处理Module
        var module = loadModule('./daomssql/' + req.params[0] + '_dao');
        if (module) {
            var dao = new module.dao();
            var fn = dao[event];
            var id = req.params[1];
            delete req.params[0];
            delete req.params[1];
            fn(id, req.params, function(result) {
                callback(result);
            });
        } else {
            var errorstr = 'No module found!';
            console.log(errorstr);
            logger.info({
                error: errorstr
            });
            logger.info(errorstr);
            return errorstr;
        }
}

/**
 * 加载对应的模块
 */
function loadModule(path) {
    try {
        return require(path);
    } catch (err) {
        // logger.info("加载模块失败" + path + 'err' + err);
        return null;
    }
}