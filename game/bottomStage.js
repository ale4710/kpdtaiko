var bottomStage;

bottomStageManager.load([
	'simple',
	'idoru',
	'audioAnalyzer'
][getSettingValue('bottom-stage-style')]).then(function(bs){
	bottomStage = bs;
	window.dispatchEvent(new CustomEvent('bottomstageready'));
});

function checkBottomStageReady() {
	return new Promise(function(resolve){
		if(bottomStage) {
			resolve();
		} else {
			window.addEventListener('bottomstageready', resolve);
		}
	});
}
