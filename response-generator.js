const statuses = {
    200: 'OK',
    201: 'Created',
    304: 'Not Modified',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
};

/**
 * 生成响应
 * @param {HTTP.Message} message
 */
const responseGenerator = (message) => {
    const reasonPhrase = statuses[message.response.status];

    const statusLine = `${message.request.version} ${message.response.status} ${reasonPhrase}\r\n`;

    message.response.headers.push({
        key: 'Content-Length',
        value: message.response.body.length,
    });

    let headerLines = message.response.headers.map(
        (({ key, value }) => `${key}: ${value}\r\n`),
    ).join('');

    headerLines += '\r\n';

    return Buffer.concat([
        Buffer.from(statusLine),
        Buffer.from(headerLines),
        message.response.body,
    ]);
};

module.exports = responseGenerator;
