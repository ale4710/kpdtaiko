var autoplayEnabled = modsList.mods.auto.check();

if(autoplayEnabled) {
	let autoplayRepeatLastHit = -Infinity;
	const autoplayRepeatInterval = 10;
	
	function autoplayRepeatLastHitReset() {autoplayRepeatLastHit = -Infinity;}
	[
		'gameballoonreset',
		'gamedrumrollreset'
	].forEach(function(en){
		window.addEventListener(en, autoplayRepeatLastHitReset);
	});
	
	function autoplay(){
		if(autoplayEnabled && !timerPaused) {
			var currentObj = gameFile.objects[latestObject];
			if(currentObj) {
				if(currentObj.time <= curTime()) {
					switch(currentObj.type) {
						case 0://don
							playerAction(gameActionId.don);
							break;
						case 1://kat
							playerAction(gameActionId.kat);
							break;
						case 2://drumroll
						case 3://balloon
							let now = performance.now();
							if(autoplayRepeatLastHit + autoplayRepeatInterval <= now) {
								autoplayRepeatLastHit = now;
								playerAction(Math.floor(Math.random() * 2));
							}
							break;
					}
				}
			}
		}
	}
}