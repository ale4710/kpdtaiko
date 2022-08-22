initDatabase();

function outputProgress(text) {
    eid('progress-display').innerText = text;
}

function finish() {
	console.log('finish');
	database.saveDatabase();
	location = '/songselect/index.html';
}
