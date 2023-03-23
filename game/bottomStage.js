var bottomStage = null;
var bottomStageData = {
	bg: null
};
var bottomStageFolder = [
	'simple',
	'failedidol',
	'livestream',
][getSettingValue('bottom-stage-style')];
var bottomStageElement = eid('bottom-stage');

function bottomStageInit(initFn) {
	bottomStage = initFn();
	bottomStageInit = null;
	window.dispatchEvent(new CustomEvent('bottomstageready'));
}

function checkBottomStageReady() {
	return new Promise(function(resolve){
		if(bottomStage) {
			resolve();
		} else {
			window.addEventListener('bottomstageready', resolve);
		}
	});
}

(()=>{
	var bsfpx = `bottomstage/${bottomStageFolder}/`;
	addGlobalReference(0, bsfpx + 'script');
	addGlobalReference(1, bsfpx + 'style');
})();