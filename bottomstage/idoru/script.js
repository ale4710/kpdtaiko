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
		addGlobalReferenceGroup(0, [
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
				function loadScript() {
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
						loadScript = undefined;
						finalResolve();
					}
				}
				//start it off
				loadScript();
			});
		});
		//automatically resolved
	});
};