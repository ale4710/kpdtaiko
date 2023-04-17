var topCharacter = (function(){
	let interface = {};
	
	const USER_STORAGE_BASE_PATH = `${gameDirectory}/${gameSubDirectories.userMedia}/topcharacter`;
	interface.USER_STORAGE_BASE_PATH = USER_STORAGE_BASE_PATH;
	
	function getStatusKey() {
		return specialMode.checkStatus()? 'special' : 'normal';
	}
	let elements;
	
	let lastSpecialSwitch = -Infinity;
	
	let enabled = false;
	let images = {};
	
	let initialTick = true;
	let frame = 0;
	let allowResetFrame = true;
	function reset() {
		frame = 0; //this is a full reset, so we set frame to 0 regardless of allowResetFrame
		initialTick = true;
		if(elements) {
			if(elements.special) { elements.special.classList.add('hidden'); }
			if(elements.normal) { elements.normal.classList.remove('hidden'); }
		}
		update();
	}
	interface.reset = reset;
	
	let characterLoading = false;
	interface.setCharacter = (function(cc, folder, internal){
		return new Promise((topResolve, topReject)=>{
			if(characterLoading) {
				topReject('a character is already loading');
			}
			
			if(!(
				cc &&
				(typeof(cc) === 'object')
			)) {
				topReject('character config is not provided or incorrect');
			}
			
			enabled = false;
			characterLoading = true;
			reset();
			
			if(elements) {
				Object.values(elements).forEach((el)=>{el.remove()});
			}
			elements = {};
			
			let imageUrls = {};
			let imgLoadPromises = [];
			[
				'normal',
				'special'
			].forEach((mode)=>{
				let spritesheetPath = cc[mode].spritesheet;
				if(!(spritesheetPath in imageUrls)) {
					let imgLoadPromise;
					if(internal) {
						imgLoadPromise = Promise.resolve(`topCharacter/${folder}/${spritesheetPath}`);
					} else {
						imgLoadPromise = getFile(`${USER_STORAGE_BASE_PATH}/${folder}/${spritesheetPath}`).then((file)=>{
							return URL.createObjectURL(file);
						});
					}
					
					imageUrls[spritesheetPath] = true;
					imgLoadPromises.push(
						imgLoadPromise
						.then((url)=>{
							imageUrls[spritesheetPath] = url;
						})
						.catch(()=>{
							delete imgUrls[spritesheetPath];
						})
					);
				}
			});
			
			Promise.allSettled(imgLoadPromises)
			.then(()=>{
				imgLoadPromises = undefined;
				let imgProcessPromises = [];
				
				[
					'normal',
					'special'
				].forEach((mode)=>{
					let spritesheetPath = cc[mode].spritesheet;
					if(spritesheetPath in imageUrls) {
						imgProcessPromises.push(new Promise((ippResolve)=>{
							let url = imageUrls[spritesheetPath];
							let iinfo = {
								frameCount: cc[mode].frameCount,
								failed: false
							};
							images[mode] = iinfo;
							let img = document.createElement('img');
							img.src = url;
							img.addEventListener('load', ()=>{
								let tcel = document.createElement('div');
								tcel.classList.add('top-character');
								tcel.style.setProperty('--hscale', (img.width / iinfo.frameCount) / img.height);
								tcel.style.backgroundImage = `url("${url}")`;
								eid('top-character-container').appendChild(tcel);
								elements[mode] = tcel;
								
								ippResolve();
							});
							img.addEventListener('error', ()=>{
								iinfo.failed = true;
								ippResolve();
							});
						}));
					}
				});
				
				return Promise.allSettled(imgProcessPromises);
			})
			.then(()=>{
				enabled = true;
				allowResetFrame = (images.normal.frameCount !== images.special.frameCount);
				reset();
				topResolve();
			});
		});
	});
	
	function update() {
		if(enabled) {
			Object.values(elements).forEach((el)=>{
				el.classList.add('hidden');
			});
			let element = elements[getStatusKey()];
			if(element) {
				element.classList.remove('hidden');
				//element.style.backgroundPositionX = -(frame * element.offsetWidth) + 'px';
				element.style.backgroundPositionX = -(frame * element.getBoundingClientRect().width) + 'px';
			}
		}
	}
	
	window.addEventListener('specialmodechanged', function(){
		if(enabled) {
			lastSpecialSwitch = performance.now();
			if(allowResetFrame){frame = 0;}
			update();
		}
	});
	
	window.addEventListener('bpmtick', function(){
		if(enabled) {
			if(
				!allowResetFrame ||
				(performance.now() - lastSpecialSwitch > 10)
			) {
				let imgDef = images[getStatusKey()];
				if(initialTick) {
					initialTick = false;
				} else {
					frame++;
				}
				if(frame >= imgDef.frameCount) {frame = 0}
				update();
			}
		}
	});
	
	return interface;
})();

function loadTopCharacter() {
	return new Promise((resolve)=>{
		loadTopCharacter = undefined;
		let character = getSettingValue('top-character');
		if(character !== 0) {
			if(character === 1) {
				let folder = getSettingValue('top-character-custom-path');
				getFile(
					`${topCharacter.USER_STORAGE_BASE_PATH}/${folder}/config.json`
				).then((file)=>{
					return fileReaderA(file, 'text')
				}).then((text)=>{
					return JSON.parse(text);
				}).then((characterConfig)=>{
					return topCharacter.setCharacter(characterConfig, folder);
				}).finally(()=>{
					resolve();
				});
			} else {
				character = [
					'test'
				][character - 2];
				xmlhttprqsc(
					`topCharacter/${character}/config.json`,
					'json',
					(ev)=>{
						topCharacter.setCharacter(ev.target.response, character, true)
						.then(resolve);
					}
				);
			}
		} else {
			resolve();
		}
	});
}