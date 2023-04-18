function fixTextEncoding(buffer) {
	if(!(buffer instanceof Uint8Array)) {
		buffer = new Uint8Array(buffer);
	}
    var utf8Decode = new TextDecoder('utf-8', {fatal: true}),
    parseAttempt;
    try {
        parseAttempt = utf8Decode.decode(buffer);
        return parseAttempt;
    } catch(e) {
		console.error('failed to parse text (this is fine.)');
        //console.error(e);
    }

    var sjisDecode = new TextDecoder('shift-jis');
    return sjisDecode.decode(buffer);
}