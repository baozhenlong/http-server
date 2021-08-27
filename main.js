const net = require('net');
const worker = require('./worker');

net
    .createServer((connection) => {
        worker(connection);
    })
    .listen(8088, 'localhost');
