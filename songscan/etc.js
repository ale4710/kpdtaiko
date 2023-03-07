initDatabase();

function outputProgress(text) {
    eid('progress-display').innerText = text;
}

function finish() {
	console.log('finish');
	database.saveDatabase();
	location = '/songselect/index.html#titlescreen';
}

var errhandle = (function(){
	let errMsg = {
		'NotFoundError': `The song folder at ${formFullgameDirectory()} was not found.`,
		'SecurityError': 'You need to allow storage access to the program. Please go to settings to allow access.'
	};
	let defMsg = 'An unknown error occured.';
	
	return function(err) {
		let msg = defMsg;
		
		if(err instanceof Event) {
			if(
				err &&
				'target' in err &&
				'error' in err.target &&
				'name' in err.target.error
			) {
				msg = err.target.error.name || msg;
			}
		} else if(err instanceof Error) {
			msg = err.message || err.name || msg;
		}
		
		msg = errMsg[msg] || msg;
		
		messageBox.create(
			'Error occured',
			msg + '\n\nPlease close the program and resolve the issue or try again.',
			{
				back:  messageBox.makeOpt(emptyfn)
			}
		);
	}
})();