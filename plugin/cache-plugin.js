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
        // 检查 If-None-Match
        const requestETag = helper.readHeader(message.request.headers, 'If-None-Match');
        if (requestETag) {
            const requestPathStat = fs.statSync(requestPath);
            if (requestETag === (requestPathStat.mtimeMs.toString() + requestPathStat.size.toString(16))) {
                message.response.status = 304;

                return message;
            }
        }
    }

    const requestPathStat = fs.statSync(requestPath);
    helper.setHeader(message.response.headers, 'Cache-Control', 'max-age=10');
    helper.setHeader(message.response.headers, 'Last-Modified', requestPathStat.mtime);
    helper.setHeader(
        message.response.headers, 'ETag',
        requestPathStat.mtimeMs.toString() + requestPathStat.size.toString(16),
    );

    return message;
};

module.exports = plugin;
