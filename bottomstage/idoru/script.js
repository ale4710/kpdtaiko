function _bottomStageInitialize(interface, selfManager) {
	//load style
	return addGlobalReference(1, selfManager.basePath + 'style')
	.then(function(){
		//	okay initialize
		//container
		let container = document.createElement('div');
		container.classList.add('fill');
		eid('bottom-stage').appendChild(container);
		//shared space
		let shared = {
			container: container
		};
		//	but! but!! did the user set a custom character?
		let characterCheckPromise;
		shared.characterId = selfManager.getSetting('idol');
		if(shared.characterId > 0) {
			//internal character.
			characterCheckPromise = Promise.resolve();
		} else {
			//an external character is set
			shared.userCharacterPath = `${gameDirectory}/${gameSubDirectories.userMedia}/bottomstage/idol/${selfManager.getSetting('custom-idol-path')}/`;
			characterCheckPromise = getFile(shared.userCharacterPath + 'config.json')
			//convert blob to text
			.then(function(blob){return fileReaderA(blob, 'text');})
			//convert text to json
			.then(function(text){return JSON.parse(text);})
			//final
			.then(function(characterInfos){
				//validate
				if(Array.isArray(characterInfos)) {
					shared.userCharacters = characterInfos;
				} else {
					throw 'Not an array';
				}
			})
			//"standardize" error
			.catch(function(err){
				if(typeof(err) === 'object') {
					switch(err.constructor.name) {
						case 'FileReader': throw 'Failed to convert your file to text.';
						case 'SyntaxError': throw 'Your config.json contains errors.';
						case 'DOMRequest':
							switch(err.error.name) {
								case 'NotFoundError': throw 'Your file could not be found:\r\n' + shared.userCharacterPath + 'config.json';
								case 'SecurityError': throw 'Your path contains illegal characters or illegal sequences.';
							}
					}
				}
				//default action
				throw err;
			});
		}
		
		return characterCheckPromise
		.then(function(){
			//"events"
			let niseEvents = {};
			//we will only use specific events
			[
				'finishedLoading',
				'reset',
				'dataUpdated',
				'finish',
				'unload'
			].forEach((ev)=>{
				let niseEvent = new FakeEventTarget();
				niseEvents[ev] = niseEvent;
				interface[ev] = function(){niseEvent.broadcast();};
			});
			//unload is special
			interface.unload = (function(){
				return function(){
					niseEvent.unload.broadcast();
					selfManager.finalizeUnload();
				}
			})();
			//define urls for style
			{
				//filter image
				let filterUrl = selfManager.basePath + 'img/bgfilter.png';
				container.style.setProperty('--filter-url', `url("${filterUrl}")`);
			}
			
			//	load scripts
			//first load libraries
			return addGlobalReferenceGroup(0, [
				'/common/lib/color-thief.umd'
			])
			.then(()=>{
				return new Promise(function(finalResolve){
					//libraries are loaded
					//do some init stuff
					shared.domColorFinder = new ColorThief();
					
					//now, we will load user scripts one after the other
					let scripts = [
						'characters',
						'background',
						'misc'
					];
					(function loadScript() {
						let scriptName = scripts.pop();
						if(scriptName) {
							//load the script
							addGlobalReference(0, selfManager.basePath + scriptName).then(()=>{
								let init = _fiScriptInitialize;
								_fiScriptInitialize = undefined;
								init(
									interface,
									selfManager,
									shared,
									niseEvents
								).then(loadScript);
							});
						} else {
							//all scripts are loaded
							finalResolve();
						}
					})();
				});
			});
		})
		.catch(function(err){
			console.error(err);
			let msgdiv = document.createElement('div');
			msgdiv.classList.add('center', 'text-center');
			msgdiv.innerText = err || 'Unknown error occured.';
			container.appendChild(msgdiv);
			
			if(!('unload' in interface)) {
				interface.unload = (function(){
					container.remove();
					selfManager.finalizeUnload();
				});
			}
		});
	});
};
