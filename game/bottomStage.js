var bottomStage = null;

bottomStageManager.load([
	'simple',
	'idoru'
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