(()=>{
	//characters
	var shared = bottomStageFailedIdolInit.shared;
	
	var characterContainer = document.createElement('div');
	characterContainer.classList.add('character-container');
	bottomStageElement.appendChild(characterContainer);
	
	class CharacterCL {
		constructor(
			selectedCharacter,
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
			
			this.path = `${bottomStageFailedIdolInit.imgPath}character/${selectedCharacter}/`;
			
			this.animationClassNames = [
				beatAnim,
				specialAnim,
				toSpecialAnim
			];
			
			this.animationMode = {};
			
			this.animationLocked = false;
		}
		
		update(fn) {
			this.img.src = this.path + fn + '.png';
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
			c: 0, 
			t: 'bop', 
			s: 'bop', 
			ts: 'spin',
			
			/* aniMode: {
				1: 'beat'
			} */
		},
	].forEach((ci)=>{
		var tc = new CharacterCL(
			ci.c,
			ci.t,
			ci.s,
			ci.ts
		);
		if(ci.aniMode) {
			tc.animationMode = ci.aniMode;
		}
		characters.push(tc);
	});
	
	updateChar(chfns.nm);
	
	//animations
	//  to special mode
	var specialModeTransitionPlaying = false;
	window.addEventListener('specialmodechanged', (ev)=>{
		characters.forEach((character)=>{
			if(ev.detail.enabled) {
				character.playAnimation(2, true);
				updateChar(chfns.sp);
			} else {
				updateChar(chfns.nm);
			}
		});
	});
	//  bop

	window.addEventListener('bpmtick', ()=>{
		//character
		var spEn = Number(specialMode.checkStatus());
		characters.forEach((character)=>{
			character.playAnimation(spEn);
		});
	});
	
	function rs() {
		updateChar(chfns.nm);
	}
	
	bottomStageFailedIdolInit.init({
		reset: rs
	});
})();