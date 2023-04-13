function _bottomStageInitialize(interface, selfManager) {
	//load stuff
	return Promise.all([
		//style
		addGlobalReference(1, selfManager.basePath + 'style'),
		//color stealing library
		addGlobalReference(0, '/common/lib/color-thief.umd'),
		//drawing function
		addGlobalReference(0, selfManager.basePath + 'draw' + [
			'Waveform',
			'Frequency'
		][selfManager.getSetting('visualizer')])
	])
	.then(function(){
		//ok stuff is loaded
		//put in stuff
		let container = document.createElement('div');
		let img = document.createElement('img');
		let canvas = document.createElement('canvas');
		let cover = document.createElement('div');
		
		container.classList.add('fill', 'center');
		img.classList.add('fill', 'hidden', 'image');
		canvas.classList.add('fill');
		cover.classList.add('fill', 'cover');
		
		container.appendChild(img);
		container.appendChild(cover);
		container.appendChild(canvas);
		eid('bottom-stage').appendChild(container);
		
		let domColorFinder = new ColorThief();
		const fallbackColor = selfManager.getSetting('fallback-color');
		let color;
		if(selfManager.getSetting('color') === 0) {
			img.addEventListener('load', function(){
				//get the color of that shit
				let c = domColorFinder.getColor(img);
				color = `rgb(${c[0]},${c[1]},${c[2]})`;
			});
		}
		let bsd = interface.data;
		function du() {
			canvas.width = container.offsetWidth;
			canvas.height = container.offsetHeight;
			img.classList.toggle('hidden', !bsd.img);
			if(bsd.img) {
				img.src = bsd.img;
			} else {
				color = undefined;
			}
		}
		interface.doneLoading = du;
		interface.dataUpdated = du;
		
		interface.unload = function(){
			container.remove();
			selfManager.finalizeUnload();
		};
		
		//drawing
		let ctx = canvas.getContext('2d');
		let drawingFn = _bottomStageAudioVisualizerDrawingFunction;
		_bottomStageAudioVisualizerDrawingFunction = undefined;
		interface.draw = function(){
			drawingFn(
				ctx,
				color || fallbackColor
			);
		}
	});
};
