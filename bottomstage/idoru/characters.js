function _fiScriptInitialize(
	interface,
	selfManager,
	shared,
	niseEvents
) {
	//characters
	
	let characterContainer = document.createElement('div');
	characterContainer.classList.add('character-container');
	shared.container.appendChild(characterContainer);
	
	let createDefaultImageList = (function(){
		function makepath(cn, fn) {
			return `${selfManager.basePath}img/character/${cn}/${fn}.png`;
		}
		let fns = [
			'normal',
			'special'
		];
		return function(cn) {
			let l = {};
			fns.forEach((fn)=>{
				l[fn] = makepath(cn, fn);
			});
			return l;
		}
	})();
	
	class CharacterCL {
		constructor(
			images,
			beatAnim,
			specialAnim,
			toSpecialAnim
		) {
			var container = document.createElement('div');
			
			var floorLight = document.createElement('div');
			floorLight.classList.add('floor-light');
			container.appendChild(floorLight);
			
			var characterPositioner = document.createElement('div');
			characterPositioner.classList.add('character-positioner', 'horizontal-center');
			
			this.img = document.createElement('img');
			this.img.classList.add('character');
			characterPositioner.appendChild(this.img);

			container.appendChild(characterPositioner);
			
			characterContainer.appendChild(container);
			
			this.images = images;
			
			this.animationClassNames = [
				beatAnim,
				specialAnim,
				toSpecialAnim
			];
			
			this.animationMode = {};
			
			this.animationLocked = false;
		}
		
		update(fn) {
			this.img.src = this.images[fn];
		}
		
		playAnimation(aniId, lock) {
			lock = !!lock;
			if(!this.animationLocked) {
				this.stopAnimation();
				
				this.animationLocked = lock;
				
				if(lock) {
					var ut = this;
					this.img.addEventListener('animationend', function aniend(){
						ut.animationLocked = false;
						ut.img.removeEventListener('animationend', aniend);
					});
				}
				
				var aniTimeOvr = 0;
				
				if(aniId in this.animationMode) {
					switch(this.animationMode[aniId]) {
						case 'beat':
							aniTimeOvr = (60000 / metronome.getBpm().bpm) + 'ms';
							break;
					}
				}
				
				playAnim(
					this.img, 
					this.animationClassNames[aniId],
					aniTimeOvr
				);
			}
		}
		
		stopAnimation() {
			this.img.classList.remove(...this.animationClassNames);
		}
	}
	
	var chfns = {
		nm: 'normal',
		sp: 'special'
	},
	characters = [];
	
	function updateChar(fn) {
		characters.forEach((c)=>{c.update(fn)});
	}
	
	[
		{
			imgList: createDefaultImageList(0), 
			beat: 'bop', 
			special: 'bop', 
			toSpecial: 'spin',
			
			/* animationMode: {
				1: 'beat'
			} */
		},
	].forEach((ci)=>{
		var tc = new CharacterCL(
			ci.imgList,
			ci.beat,
			ci.special,
			ci.toSpecial
		);
		if(ci.animationMode) {
			tc.animationMode = ci.aniMode;
		}
		characters.push(tc);
	});
	
	updateChar(chfns.nm);
	
	//animations
	//  to special mode
	var specialModeTransitionPlaying = false;
	function specialModeChangeListener(ev) {
		characters.forEach((character)=>{
			if(ev.detail.enabled) {
				character.playAnimation(2, true);
				updateChar(chfns.sp);
			} else {
				updateChar(chfns.nm);
			}
		});
	}
	window.addEventListener('specialmodechanged', specialModeChangeListener);
	//  bop
	function bopAnimTickListener() {
		//character
		var spEn = Number(specialMode.checkStatus());
		characters.forEach((character)=>{
			character.playAnimation(spEn);
		});
	}
	window.addEventListener('bpmtick', bopAnimTickListener);
	
	//delete listeners on unload
	niseEvents.unload.addListener(function(){
		window.removeEventListener('specialmodechanged', specialModeChangeListener);
		window.removeEventListener('bpmtick', bopAnimTickListener);
	});
	
	niseEvents.reset.addListener(function(){
		updateChar(chfns.nm);
	});
	
	return Promise.resolve();
}