const fs = require('fs');
const path = require('path');


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
        // 文件不存在
        message.response.status = 404;

        return message;
    }

    // 获取文件路径信息
    const requestPathStat = fs.statSync(requestPath);

    if (requestPathStat.isDirectory()) {
        // 目录
        const dirs = fs.readdirSync(requestPath);
        message.response.status = 200;
        const dirBuffers = dirs.map(value => Buffer.from(`${value}\r\n`));
        message.response.body = Buffer.concat(dirBuffers);
    }
    else if (requestPathStat.isFile()) {
        // 文件
        message.response.status = 200;
        message.response.body = fs.readFileSync(requestPath);
    }
    else {
        message.response.status = 404;
    }

    return message;
};

module.exports = plugin;
