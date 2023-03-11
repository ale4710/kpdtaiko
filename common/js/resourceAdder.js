function addGlobalReference(type, filename, settings = {}) {
	return (new Promise((resolve, reject)=>{
		var s = document.createElement([
			'script',
			'link'
		][type]);
		
		function thingLoaded(){
			//console.log(filename, 'was loaded');
			rmListeners();
			resolve();
		}
		function thingErrored(err){
			console.error(err);
			rmListeners();
			reject();
		}
		function rmListeners() {
			s.removeEventListener('load', thingLoaded);
			s.removeEventListener('error', thingErrored);
		}
		s.addEventListener('load', thingLoaded);
		s.addEventListener('error', thingErrored);

		switch(type) {
			case 0: //script
				s.src = filename + '.js';
				if('defer' in settings) {
					s.defer = !!settings.defer;
				} else {
					s.defer = true;
				}
				s.async = false;
				break;
			case 1: //style
				s.rel = 'stylesheet';
				s.type = 'text/css';
				s.href = filename + '.css';
				break;
		}

		document.head.appendChild(s);
	}));
}

function addGlobalReferenceGroup(type, filenames) {
	let promises = [];
	filenames.forEach(function(filename){
		promises.push(
			addGlobalReference(type, filename)
		);
	});
	return Promise.allSettled(promises);
}