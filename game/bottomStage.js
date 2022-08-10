var bottomStage = null,
bottomStageData = {
	bg: null
},
bottomStageFolder = [
	'simple',
	'failedidol',
	'livestream',
][getSettingValue('bottom-stage-style')],
bottomStageElement = eid('bottom-stage');

function bottomStageInit(initFn) {
	bottomStage = initFn();
	bottomStageInit = null;
	window.dispatchEvent(new CustomEvent('bottomstageready'));
}

(()=>{
	var bsfpx = `bottomstage/${bottomStageFolder}/`;
	addGlobalReference(0, bsfpx + 'script');
	addGlobalReference(1, bsfpx + 'style');
})();