/**
 *
 * @param {HTTP.Header[]} headers
 * @param {string} key
 * @returns
 */
function readHeader(headers, key) {
    const filteredHeaders = headers.filter(item => item.key === key);
    if (filteredHeaders.length > 0) {
        return filteredHeaders[0].value.trim();
    }

    return null;
}

/**
 *
 * @param {HTTP.Header[]} headers
 * @param {string} key
 * @param {string} value
 */
function setHeader(headers, key, value) {
    let found = false;
    for (let i = 0, len = headers.length; i < len; i++) {
        if (headers[i].key === key) {
            found = true;
            headers[i].key = value;
            break;
        }
    }
    if (!found) {
        headers.push({
            key,
            value,
        });
    }
}

module.exports = {
    readHeader,
    setHeader,
};
