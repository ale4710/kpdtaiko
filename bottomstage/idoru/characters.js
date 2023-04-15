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
			return `${selfManager.basePath}/character/${cn}/${fn}.png`;
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
		constructor(config) {
			var container = document.createElement('div');
			
			var floorLight = document.createElement('div');
			floorLight.classList.add('floor-light');
			container.appendChild(floorLight);
			
			var characterPositioner = document.createElement('div');
			characterPositioner.classList.add('character-positioner', 'horizontal-center');
			
			this.imgElement = document.createElement('img');
			this.imgElement.classList.add('character');
			characterPositioner.appendChild(this.imgElement);

			container.appendChild(characterPositioner);
			
			characterContainer.appendChild(container);
			
			this.images = {};
			[
				'normal',
				'special'
			].forEach((imageKey)=>{
				this.images[imageKey] = config.images[imageKey];
			});
			
			this.animations = {};
			[
				'beat',
				'special',
				'toSpecial'
			].forEach((animationKey)=>{
				this.animations[animationKey] = config.animations[animationKey];
			});
			
			this.animationLocked = false;
		}
		
		update(fn) {
			this.imgElement.src = this.images[fn];
		}
		
		playAnimation(aniId, lock) {
			lock = !!lock;
			if(!this.animationLocked) {
				this.stopAnimation();
				
				if(
					(aniId in this.animations) &&
					(!!this.animations[aniId].animation)
				) {
					this.animationLocked = lock;
					
					if(lock) {
						let ut = this;
						this.imgElement.addEventListener('animationend', function aniend(){
							ut.animationLocked = false;
							ut.imgElement.removeEventListener('animationend', aniend);
						});
					}
					
					let animation = this.animations[aniId];
					
					let aniTimeOvr = 0;
					switch(animation.mode) {
						case 'beat':
							aniTimeOvr = (60000 / metronome.getBpm().bpm) + 'ms';
							break;
					}
					
					playAnim(
						this.imgElement,
						animation.animation,
						aniTimeOvr
					);
				}
			}
		}
		
		stopAnimation() {
			Object.values(this.animations).forEach((animInfo)=>{
				this.imgElement.classList.remove(animInfo.animation);
			});
		}
	}
	
	let characters = [];
	
	function updateChar(fn) {
		characters.forEach((c)=>{c.update(fn)});
	}
	
	//animations
	//  to special mode
	var specialModeTransitionPlaying = false;
	function specialModeChangeListener(ev) {
		characters.forEach((character)=>{
			if(ev.detail.enabled) {
				character.playAnimation('toSpecial', true);
				updateChar('special');
			} else {
				updateChar('normal');
			}
		});
	}
	window.addEventListener('specialmodechanged', specialModeChangeListener);
	//  bop
	function bopAnimTickListener() {
		//character
		let spEn = [
			'beat',
			'special'
		][Number(specialMode.checkStatus())];
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
		updateChar('normal');
	});
	
	//load characters
	let loadCharactersPromise;
	if('userCharacters' in shared) {
		//user character(s)
		let loadFilesPromises = {};
		shared.userCharacters.forEach((character)=>{
			Object.keys(character.images).forEach((imgKey)=>{
				let imgLocalPath = character.images[imgKey];
				let imgLoadPromise;
				if(imgLocalPath in loadFilesPromises) {
					imgLoadPromise = loadFilesPromises[imgLocalPath];
				} else {
					imgLoadPromise = getFile(shared.userCharacterPath + imgLocalPath)
					.then((blob)=>{return URL.createObjectURL(blob)});
				}
				
				loadFilesPromises[imgLocalPath] = imgLoadPromise.then((url)=>{
					character.images[imgKey] = url;
					return url; //for chaining
				});
			});
		});
		
		loadCharactersPromise = Promise.allSettled(Object.values(loadFilesPromises))
		.then(()=>{return shared.userCharacters});
	} else {
		loadCharactersPromise = new Promise(function(resolve){
			//singular internal
			let charBasePath = `${selfManager.basePath}character/${shared.characterId - 1}/`
			xmlhttprqsc(
				charBasePath + 'config.json',
				'json',
				(function(ev){
					let config = ev.target.response;
					if(config) {
						//make full path for the images
						[
							'normal',
							'special'
						].forEach((imgKey)=>{
							config.images[imgKey] = charBasePath + config.images[imgKey];
						});
						//ok done
						resolve([config]);
					} else {
						resolve();
					}
				}),
				resolve
			);
		});
	}
	
	return loadCharactersPromise.then(function(characterConfigs){
		if(Array.isArray(characterConfigs)) {
			let initImgLoadPromises = [];
			characterConfigs.forEach((characterConfig)=>{
				let character = new CharacterCL(characterConfig);
				initImgLoadPromises.push(new Promise(function(resolve){
					function imageEventListener(ev){
						ev.target.removeEventListener('load', imageEventListener);
						ev.target.removeEventListener('error', imageEventListener);
						resolve();
					};
					character.imgElement.addEventListener('load', imageEventListener);
					character.imgElement.addEventListener('error', imageEventListener);
				}));
				characters.push(character);
			});
			updateChar('normal');
			return Promise.all(initImgLoadPromises);
		} else {
			return Promise.resolve();
		}
	});
}
