function _fiScriptInitialize(
	interface,
	selfManager,
	shared,
	niseEvents
) {
	var bgcont = document.createElement('div');
	shared.container.appendChild(bgcont);
	bgcont.classList.add('bg-container');
	
	var bgcontFill = document.createElement('div');
	bgcont.appendChild(bgcontFill);
	bgcontFill.classList.add('fill', 'cover');

	var bgPlaceholder = document.createElement('div');
	bgPlaceholder.classList.add('bg', 'horizontal-center', 'bg-placeholder');
	bgcont.appendChild(bgPlaceholder);

	var bg = document.createElement('img');
	bg.classList.add('bg', 'horizontal-center', 'hidden');
	bgcont.appendChild(bg);

	var bgf = document.createElement('div');
	bgf.classList.add('bg', 'horizontal-center', 'filter');
	bgcont.appendChild(bgf);
	bgf = null;

	var bgg = document.createElement('div');
	bgg.classList.add('bg', 'horizontal-center', 'glow');
	bgcont.appendChild(bgg);
	bgg = null;

	//  stage lights
	var stageLights = document.createElement('div');
	stageLights.classList.add('stage-lights-container');
	bgcont.appendChild(stageLights);
	for(var i = 0; i < 8; i++) {
		var sl = document.createElement('div');
		sl.classList.add('stage-light');
		sl.appendChild(document.createElement('div')); //for keeping it a circle
		stageLights.appendChild(sl);
	}
	
	function bpmTickListener() {
		if(specialMode.checkStatus()) {
			playAnim(
				stageLights,
				'flash'
			);
			
			setCssVariable(
				'sl-hue',
				`${Math.random()}turn`,
				stageLights
			);
		}
	}
	window.addEventListener('bpmtick', bpmTickListener);
	niseEvents.unload.addListener(function(){
		window.removeEventListener('bpmtick', bpmTickListener);
	});
	
	niseEvents.dataUpdated.addListener(function(){
		var bsd = interface.data;
		bg.classList.toggle('hidden', !bsd.img);
		if(bsd.img) {
			bg.addEventListener('load', function imgloaded(){
				bg.removeEventListener('load', imgloaded);
				var domColor = shared.domColorFinder.getColor(bg);
				
				/* var imageColorPal = shared.domColorFinder.getPalette(bg);
				for(var i = 0; i < 4; i++) {
					var c = imageColorPal[i % imageColorPal.length];
					setCssVariable(
						`stage-light-color-${i+1}`,
						`rgb(${c[0]},${c[1]},${c[2]})`
					);
				} */
				
				setCssVariable(
					'bottom-stage-primary-color',
					`rgb(${domColor[0]},${domColor[1]},${domColor[2]})`
				);
				
				//bgcont.style.backgroundImage = `linear-gradient(0deg,rgba(${domColor[0]},${domColor[1]},${domColor[2]},0.7) 0%, rgba(0,0,0,0) 100%)`;
			});
			bg.src = bsd.img;
		}
		
		
		if(gameFile) {
			var tl = String(gameFile.title + gameFile.artist + gameFile.difficulty);
			
			var dataCodeSum = 0;
			for(var i = 0; i < tl.length; i++) {
				dataCodeSum += tl.charCodeAt(i);
			}
			
			var gradient = `linear-gradient(${dataCodeSum}deg,`;
			
			var stops = 6 + (3 - (dataCodeSum % 6)),
			clTop = 11;
			for(var i = 0; i < stops; i++) {
				var stopPer = ((i / (stops - 1)) * 100).toFixed(0),
				hue = (((tl.charCodeAt(Math.floor((i / (stops)) * (tl.length + 1))) % clTop) / clTop) * 360).toFixed(0);
				
				gradient += `hsl(${hue},100%,50%) ${stopPer}%,`;
			}
			
			bgPlaceholder.style.backgroundImage = gradient.substring(0, gradient.length - 1) + ')';
			
			//console.log(gradient.substring(0, gradient.length - 1) + ')');
		}
	});
	
	return Promise.resolve();
};