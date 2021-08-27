const Events = require('events');

class RequestParser extends Events {

    _state = this._readRequestLine;

    _message = {
        request: {
            method: '',
            path: '',
            version: '',
            headers: [],
            body: Buffer.from(''),
        },
        response: {
            status: 0,
            headers: [],
            body: Buffer.from(''),
        },
    };

    _cache = null;

    _bodyLength = null;

    _readRequestLine(char) {
        // GET / HTTP/1.1
        if (this._cache === null) {
            // [pointer, method, uri version, crFlag]
            this._cache = [1, '', '', '', false];
        }

        if (char === 0x20) {
            // SPACE
            this._cache[0]++;
        }
        else if (char === 0X0D) {
            // CR
            this._cache[4] = true;
        }
        else if (char === 0X0A && this._cache[4]) {
            // LF
            this._message.request.method = this._cache[1];
            this._message.request.path = this._cache[2];
            this._message.request.version = this._cache[3];
            console.log('_readRequestLine', this._message);
            this._cache = null;

            return this._readHeaderLine;
        }
        else {
            this._cache[this._cache[0]] += String.fromCharCode(char);
        }

        return this._readRequestLine;
    }

    _readHeaderLine(char) {
        // User-Agent: PostmanRuntime/7.28.3
        // Accept: */*
        // Postman-Token: 31923ce8-dc66-4e8c-a792-fc7575722880
        // Host: localhost:8088
        // Accept-Encoding: gzip, deflate, br
        // Connection: keep-alive
        if (this._cache === null) {
            // [pointer, key, value, crFlag]
            this._cache = [1, '', '', false];
        }

        if (char === 0X3A) {
            // :
            this._cache[0]++;
        }
        else if (char === 0X0D) {
            // CR
            this._cache[3] = true;
        }
        else if (char === 0X0A && this._cache[3]) {
            // LF
            if (this._cache[1] !== '') {
                this._message.request.headers.push(
                    {
                        key: this._cache[1],
                        value: this._cache[2],
                    },
                );
                this._cache = null;

                return this._readHeaderLine;
            }
            console.log('headers', this._message.request.headers);
            const contentLengthHeader = this._message.request.headers.filter(({ key }) => key === 'Content-Length');
            if (contentLengthHeader.length > 0) {
                this._cache = null;
                this._bodyLength = contentLengthHeader[0].value;

                return this._readBody;
            }

            return this._sendFinishEvent();

        }
        else {
            this._cache[this._cache[0]] += String.fromCharCode(char);
        }

        return this._readHeaderLine;
    }

    _readBody(char) {
        if (this._cache === null) {
            this._cache = [
                parseInt(this._bodyLength),
                0,
                new Uint8Array(parseInt(this._bodyLength)),
            ];
        }
        if (this._cache[1] < this._cache[0]) {
            this._cache[2][this._cache[1]] = char;
            this._cache[1]++;
            if (this._cache[1] === this._cache[0]) {
                this._message.request.body = Buffer.from(this._cache[2]);
                console.log('body', this._message.request.body);

                return this._sendFinishEvent();
            }
        }

        return this._readBody;
    }

    _sendFinishEvent() {
        this.emit('finish', this._message);

        return this._end();
    }

    _end() {
        return this._end;
    }

    append(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            this._state = this._state(buffer[i]);
        }
    }

}

module.exports = RequestParser;
