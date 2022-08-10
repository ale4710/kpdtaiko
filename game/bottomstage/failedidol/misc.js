(()=>{
	var floor = document.createElement('div');
	floor.classList.add('floor');
	bottomStageElement.appendChild(floor);
	
	function linit() {
		var stageCover = document.createElement('div');
		stageCover.classList.add('cover', 'fill');
		bottomStageElement.appendChild(stageCover);
	}
	
	bottomStageFailedIdolInit.init({
		init: linit
	});
})();