(function(){
	let maxMissCount = modsList.mods.risky.check();
	let alreadyFailed = false;
	
	window.addEventListener('gamemissed', function(){
		postJudge({
			text: (maxMissCount - statistics.hits.miss),
			className: judgeStyles.miss.className
		});
	});
	
	gameLoopAdditional.push(function(){
		if(
			!ended &&
			!alreadyFailed &&
			(statistics.hits.miss >= maxMissCount)
		) {
			alreadyFailed = true; //prevent it from double posting
			postExtraInfo('time');
			audio.stop();
			end('Too many missed...');
		}
	});
})();