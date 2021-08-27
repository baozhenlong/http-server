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
    helper.setHeader(message.response.headers, 'Access-Control-Allow-Origin', 'http://a.com');
    helper.setHeader(message.response.headers, 'Access-Control-Allow-Credentials', 'true');

    return message;
};

module.exports = plugin;
