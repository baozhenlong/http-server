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

    if (fs.existsSync(requestPath)) {
        // 文件已存在
        message.response.status = 403;
    }
    else {
        // 创建文件
        fs.mkdirSync(path.dirname(requestPath), { recursive: true });
        fs.writeFileSync(requestPath, message.request.body);
        message.response.status = 201;
    }

    return message;
};

module.exports = plugin;
