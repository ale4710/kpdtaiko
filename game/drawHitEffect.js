var drawNoteHitEffect;
var drawNoteHitEffectReset;

var noteHitEffectManager = (function(){
	let interface = {};
	
	interface.activeTime = 400;
	
	let activeNotes = {};
	let activeNotesOrder = [];
	interface.activeNotes = activeNotes;
	interface.activeNotesOrder = activeNotesOrder;
	
	interface.reset = function(){
		while(activeNotesOrder.length !== 0) {
			delete activeNotes[activeNotesOrder.pop()];
		}
	};
	
	interface.update = function(){
		while(activeNotesOrder.length !== 0) {
			let activeId = activeNotesOrder[0];
			let activeEffect = activeNotes[activeId];
			if(activeEffect.time + interface.activeTime < curTime()) {
				//expired
				activeNotesOrder.shift();
				delete activeNotes[activeId];
			} else {
				//okay (everything past is not expired)
				break;
			}
		}
	};
	
	interface.add = function(type,size){
		let id = createRandomKey(activeNotesOrder);
		//activeNotesOrder.push(id); //createRandomKey adds the id automatically
		activeNotes[id] = {
			time: curTime(),
			type: type,
			size: size
		};
	};
	
	interface.remove = function(id){
		if(id in activeNotes) {
			delete activeNotes[id];
			activeNotesOrder.splice(
				activeNotesOrder.indexOf(id),
				1
			);
		}
	};
	
	return interface;
})();