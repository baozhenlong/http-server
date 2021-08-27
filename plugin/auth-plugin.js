const fs = require('fs');
const path = require('path');
const helper = require('../util/helper');

/**
 *
 * @param {HTTP.Env} env
 * @param {HTTP.Message} message
 */
const plugin = (env, message) => {

    const cookieData = helper.readHeader(message.request.headers, 'Cookie');
    if (cookieData) {
        const parsedCookieData = cookieData.match(/sessionID=(session_\d+)/);
        console.log('parsedCookieData', parsedCookieData);
        if (parsedCookieData && parsedCookieData[1]) {
            const sessionPath = path.resolve(env.session, parsedCookieData[1]);
            if (fs.existsSync(sessionPath)) {
                const username = fs.readFileSync(sessionPath).toString();
                if (username === 'admin') {
                    return message;
                }
            }
        }
    }

    const authData = helper.readHeader(message.request.headers, 'Authorization');

    // Authorization: Basic base64(user:pass)
    if (authData) {
        const parsedAuthData = authData.match(/basic\s*(\w+)/i);
        if (parsedAuthData && parsedAuthData[1]) {
            console.log('parsedAuthData', Buffer.from(parsedAuthData[1], 'base64').toString());
            const [username, password] = Buffer.from(parsedAuthData[1], 'base64').toString().split(':');
            if (username === 'admin' && password === '123456') {
                // make session set cookie
                const sessionID = `session_${new Date().getTime()}`;
                const sessionPath = path.resolve(env.session, sessionID);
                fs.writeFileSync(sessionPath, username);
                helper.setHeader(message.response.headers, 'Set-Cookie', `sessionID=${sessionID};max-age=3600`);

                return message;
            }
        }
    }

    message.response.status = 401;
    helper.setHeader(message.response.headers, 'WWW-Authenticate', 'Basic realm="login"');

    return message;

};

module.exports = plugin;
