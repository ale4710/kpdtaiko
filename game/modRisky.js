(function(){
	let maxMissCount = modsList.mods.risky.check();
	
	window.addEventListener('gamemissed', function(){
		postJudge({
			text: (maxMissCount - statistics.hits.miss),
			className: judgeStyles.miss.className
		});
	});
	
	gameLoopAdditional.push(function(){
		if(statistics.hits.miss >= maxMissCount) {
			audio.stop();
			end('Too many missed...');
		}
	})
})();