const fs = require('fs');
const path = require('path');
const helper = require('../util/helper');

/**
 *
 * @param {HTTP.Env} env
 * @param {HTTP.Message} message
 */
const plugin = (env, message) => {
    if (message.response.status !== 0) {
        return message;
    }

    if (message.request.path.indexOf('.') === 0) {
        message.response.status = 403;

        return message;
    }

    const requestPath = path.resolve(env.root + message.request.path);

    if (!fs.existsSync(requestPath)) {
        // 路径是否存在
        message.response.status = 404;

        return message;
    }

    if (fs.statSync(requestPath).isFile()) {
        // 是文件
        helper.setHeader(message.response.headers, 'Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    }
    else {
        helper.setHeader(message.response.headers, 'Access-Control-Allow-Methods', 'POST, GET');
    }
    message.response.status = 200;

    return message;
};

module.exports = plugin;
