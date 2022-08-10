function fixTextEncoding(arrayBuf) {
    arrayBuf = new Int8Array(arrayBuf);
    var utf8Decode = new TextDecoder('utf-8', {fatal: true}),
    parseAttempt;
    try {
        parseAttempt = utf8Decode.decode(arrayBuf);
        return parseAttempt;
    } catch(e) {
		console.error('failed to parse text (this is fine.)');
        //console.error(e);
    }

    var sjisDecode = new TextDecoder('shift-jis');
    return sjisDecode.decode(arrayBuf);
}