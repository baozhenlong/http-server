const path = require('path');
const RequestParser = require('./util/request-parser');
const responseGenerator = require('./response-generator');
const postPlugin = require('./plugin/post-plugin');
const getPlugin = require('./plugin/get-plugin');
const putPlugin = require('./plugin/put-plugin');
const deletePlugin = require('./plugin/delete-plugin');
const authPlugin = require('./plugin/auth-plugin');
const corsPlugin = require('./plugin/cors-plugin');
const cachePlugin = require('./plugin/cache-plugin');

module.exports = (connection) => {

    const parser = new RequestParser();
    const env = {
        root: path.resolve('./www'),
        session: path.resolve('./session'),
    };

    // 解析请求
    connection.on('data', (buffer) => {
        console.log('data', String.fromCharCode(...buffer));
        parser.append(buffer);
    });

    // 生成响应

    parser.on('finish', (/** @type {HTTP.Message} */ message) => {
        console.log('parser finish');
        // 插件
        if (message.response.status === 0) {
            message = corsPlugin(env, message);
            message = authPlugin(env, message);
            if (message.request.method === 'POST') {
                message = postPlugin(env, message);
            }
            else if (message.request.method === 'GET') {
                message = cachePlugin(env, message);
                message = getPlugin(env, message);
            }
            else if (message.request.method === 'PUT') {
                message = putPlugin(env, message);
            }
            else if (message.request.method === 'DELETE') {
                message = deletePlugin(env, message);
            }
        }

        connection.end(responseGenerator(message));
    });
};
