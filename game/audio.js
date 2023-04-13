var audio;
var audioEnded = false;
var audioCtx;
var audioCtxSpace = {};
var sounds = {};

var mediaPlayMode = getSettingValue('media-play-mode'); //0 = html media element, 1 = audiocontext

var audioControl;
function initAudioControl(){
	let ctrls = {};
	
	ctrls.play = function(){
		audioEnded = false;
		audio.play();
	};
	
	ctrls.pause = function(){
		audio.pause();
	}
	
	ctrls.checkPlaybackRate = function(){
		return audio.playbackRate;
	};
	
	switch(mediaPlayMode) {
		case 0: //html
			ctrls.checkPaused = function(){return audio.paused;};
			ctrls.checkTime = function(){return audio.currentTime};
			ctrls.checkDuration = function(){return audio.duration};
			ctrls.stop = function(){
				audio.pause();
				audio.currentTime = 0;
			};
			ctrls.seekAbsolute = function(tt){audio.currentTime = tt}
			ctrls.seekRelative = function(os){audio.currentTime += os}
			break;
		case 1: //actx
			ctrls.checkPaused = function(){return audio.paused()};
			ctrls.checkTime = function(){return audio.currentTime()};
			ctrls.checkDuration = function(){return audio.duration()};
			ctrls.stop = function(){audio.stop()};
			ctrls.seekAbsolute = function(tt){audio.seekAbsolute(tt)};
			ctrls.seekRelative = function(os){audio.seekRelative(os)};
            break;
		case 2: //dummy
			ctrls.play = emptyfn;
			ctrls.pause = emptyfn;
			ctrls.checkPlaybackRate = (function(){
				let pbr = modsList.mods.audioSpeed.check();
				return function(){
					return pbr;
				};
			})();
			ctrls.checkPaused = function(){return timerPaused};
			ctrls.checkTime = function(){return curTime()}; //WARNING: TIMER MODE MUST BE [1] WHEN DUMMY AUDIO IS USED
			ctrls.checkDuration = function(){return audio.duration()};
			ctrls.stop = emptyfn;
			ctrls.seekAbsolute = emptyfn;
			ctrls.seekRelative = emptyfn;
	}
	
	audioControl = ctrls;
}
initAudioControl();

class AudioFromCtx { //definitely not copied from https://stackoverflow.com/a/31653217
    constructor(audbuf, connectTo, playbackrate) {
        if(!audioCtx) {throw 'please start the audioCtx.'}
        if(!(audbuf instanceof AudioBuffer)) {throw 'please pass an AudioBuffer.'}
        this.audioBuffer = audbuf;

        this.startedTime = null;
        this.pausedOffset = null;

        this.destination = connectTo || audioCtx.destination;

        this.playbackRate = playbackrate || 1;
		
		this.stop();
    }

    currentTime() {
        var t = 0;
        if(this.pausedOffset !== null){t = this.pausedOffset}
        if(this.startedTime !== null){t = audioCtx.currentTime - this.startedTime}
        return t * this.playbackRate;
    }

    duration() {return this.audioBuffer.duration;}

    paused() {return !this.sourceNode;}

    sourceNodeCheckEnded(audioFromCtxInstance) {
        if(audioCtx.currentTime - audioFromCtxInstance.startedTime >= audioFromCtxInstance.audioBuffer.duration) {
            //audioFromCtxInstance.pause();
            audioFromCtxInstance.stop();
            console.log('audio ended!');
            audioEnded = true;
        }
    }
    
    play() {
		//console.log('audio ctxstyle play');
        if(this.paused()) {
			let po = this.pausedOffset || 0;
			this.startedTime = audioCtx.currentTime - po;
            
            this.pausedOffset = null;
			
            this.sourceNode = this.preSourceNode;
			this.preSourceNode = null;
            this.sourceNode.start(0, po * this.playbackRate);
        }
	}

    pause() {
		//console.log('audio ctxstyle paused');
        if(!this.paused()) {
            var po = audioCtx.currentTime - this.startedTime;
            //sourceNode.playbackRate.value;
            this.stop();
            this.pausedOffset = po;
        }
    }

    stop() {
        if(!this.paused()) {
            this.sourceNode.removeEventListener('ended', this.sourceNodeEndCallback);
            this.sourceNode.disconnect();
            this.sourceNode.stop();
            this.sourceNode = null;
        }
		
        this.startedTime = null;
        this.pausedOffset = null;
		
		//pre-create the source node
		this.preSourceNode = audioCtx.createBufferSource();
		this.preSourceNode.buffer = this.audioBuffer;
		this.preSourceNode.playbackRate.value = this.playbackRate;
		this.preSourceNode.connect(this.destination);
		
		this.sourceNodeEndCallback = ()=>{this.sourceNodeCheckEnded(this)};
		this.preSourceNode.addEventListener('ended', this.sourceNodeEndCallback);
    }
    
    seekAbsolute(targetTime = 0) {
		let restartAudio = !this.paused();
		this.stop();
		this.pausedOffset = numberClamp(0, this.duration(), targetTime) / this.playbackRate;
		if(restartAudio) {this.play();}
	}
	
	seekRelative(seek = 0) {
		this.seekAbsolute(this.currentTime() + seek);
	}
}

function updateAudioVolume() {
    if(audioCtx) {
        var v = volumeControl.getVolume();

        audioCtxSpace.mediaGain.gain.value = (v.music / v.max);
        audioCtxSpace.sfxGain.gain.value = (v.sfx / v.max);
    }
}
window.addEventListener('volumechange',updateAudioVolume);

function loadAudio(blob) {
    return (new Promise((resolve,reject)=>{
        function beginLoading() {
            if(blob instanceof Blob) {
                switch(mediaPlayMode) {
                    case 0:
                        audio = (new Audio());
                        audio.src = URL.createObjectURL(blob);
                        audio.playbackRate = modsList.mods.audioSpeed.check();
                        audio.addEventListener('ended',()=>{audioEnded = true});
                        audioCtxSpace.media = audioCtx.createMediaElementSource(audio);
                        audioCtxSpace.media.connect(audioCtxSpace.mediaGain);
                        resolve();
                        break;
                    case 1:
                        //convert to audiobuffer...
                        function startConvert(arraybuf){
                            arrayBufToAudData(arraybuf).then((audiobuf)=>{
                                audio = (new AudioFromCtx(
                                    audiobuf, 
                                    audioCtxSpace.mediaGain, 
                                    modsList.mods.audioSpeed.check()
                                ));
								console.log('audio loaded');
                                resolve();
                            }).catch(reject);
                        };

                        if('arrayBuffer' in blob) {
                            blob.arrayBuffer().then(startConvert);
                        } else {
                            fileReaderA(blob, 'arraybuffer')
                            .then((result)=>{
                                startConvert(result);
                            })
                            .catch(reject);
                        }
                        break;
                }
            } else {
                reject('you need to pass a blob.');
            }
        }

        if(audioCtx) {
            beginLoading();
        } else {
            createAudioContext().then(beginLoading);
        }
    }));
}

function createAudioContext() {
    if(audioCtx){
        return (new Promise((r)=>{
            r('audioContext already started.');
        }));
    }
    
    audioCtx = new AudioContext();
    //check if latency settings are supported
    if(audioCtx.baseLatency) {
		//recreate the audio context
		audioCtx.close();
		audioCtx = new AudioContext({
			latencyHint: 'interactive'
		});
	}

    //media sound adjust
    audioCtxSpace.mediaGain = audioCtx.createGain();
    audioCtxSpace.mediaGain.connect(audioCtx.destination);

    //sfx sound adjust
    audioCtxSpace.sfxGain = audioCtx.createGain();
    audioCtxSpace.sfxGain.connect(audioCtx.destination);

    updateAudioVolume();

    return new Promise((resolve)=>{
        var snds = [
            {from: 'internal',url: 'sounds/pop.ogg', name: 'pop'},
            {from: 'internal',url: 'sounds/metronome.ogg', name: 'metronome'}
        ],
        completed = 0;

        //hitsounds
        var hitSoundSetting = getSettingValue('hit-sounds');

        if(hitSoundSetting !== 0) {
            var hitsoundPathPrefix,
            useCustom = (hitSoundSetting === 4);

            if(useCustom) {
                hitsoundPathPrefix = gameSubDirectories.userMedia;
            } else {
                hitsoundPathPrefix = `sounds/hitsound-${hitSoundSetting - 1}`;
            }
    
            var customHitSound = useCustom? 'userStorage' : 'internal';
            snds = snds.concat([
                {from: customHitSound, url: `${hitsoundPathPrefix}/don.ogg`, name: 'don'},
                {from: customHitSound, url: `${hitsoundPathPrefix}/kat.ogg`, name: 'kat'}
            ]);
        }

        

        function sndlf() {
            if(++completed === snds.length) {
                resolve();
            }
        }
    
        snds.forEach((soundInfo)=>{
            loadSoundIntoMemory(
                soundInfo.url,
                soundInfo.from,
                soundInfo.name
            ).then(sndlf).catch(sndlf);
        });
    });
}

function arrayBufToAudData(ab) {
    return (new Promise((resolve, reject)=>{
        if(audioCtx) {
            audioCtx.decodeAudioData(
                ab,
                (audbuf)=>{
                    resolve(audbuf);
                },
                (e)=>{
                    reject(e);
                }
            );
        } else {
            reject();
        }
    }));
};

function loadSoundIntoMemory(path, from, id) {
    return (new Promise((resolve, reject)=>{
        function save(ab) {
            sounds[id] = ab;
            resolve();
        }

        switch(from) {
            case 'internal':
                xmlhttprqsc(
                    path,
                    'arraybuffer',
                    (e)=>{
                        arrayBufToAudData(e.target.response)
                        .then(save)
                        .catch(reject);
                    }
                );
                break;
            case 'userStorage':
                getFile(`${gameDirectory}/${path}`)
                .then((f)=>{return fileReaderA(f, 'arraybuffer')})
                .then(arrayBufToAudData)
                .then(save)
                .catch(reject);
                break;
        }
    }));
}

function playSound(soundId) {
    if(soundId in sounds) {
        var bufsrc = audioCtx.createBufferSource();
        bufsrc.buffer = sounds[soundId];
        bufsrc.connect(audioCtxSpace.sfxGain);
        bufsrc.start();
    }
}

function checkHTMLaudioAutoPlay() {
	return new Promise(function(resolve, reject){
		if(mediaPlayMode === 0) {
			xmlhttprqsc(
				'sounds/blank.mp3',
				'blob',
				function(e) {
					let url = URL.createObjectURL(e.target.response);
					e = undefined;
					let audio = new Audio(url);
					audio.oncanplay = (function(){
						let ppr = audio.play();
						if(ppr) {
							function finish(){
								URL.revokeObjectURL(url);
							}
							
							ppr
							.then(function(){
								finish();
								resolve();
							})
							.catch(function(){
								reject(function(){
									//try again
									audio.play();
									finish();
								});
							});
						} else {
							//cant determine :P
							resolve();
						}
					});
					
					audio.onerror = e=>console.log(e)
				}
			);
		} else {
			resolve();
		}
	});
}

var audioAnalyzer = (function(){
	let interface = {};
	
	let analyzer;
	function initIfNot(){
		if(!analyzer) {
			if(audioCtx) {
				analyzer = audioCtx.createAnalyser();
				audioCtxSpace.mediaGain.connect(analyzer);
				
				analyzer.smoothingTimeConstant = 0.4;
				
				interface.analyzerNode = analyzer;
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	};
	
	function checkArray(existing) {
		if(
			!existing ||
			(existing.length !== analyzer.frequencyBinCount)
		) {
			return new Uint8Array(analyzer.frequencyBinCount);
		} else {
			return existing;
		}
	};
	
	[
		{
			iname: 'getWaveform',
			aname: 'getByteTimeDomainData'
		},
		{
			iname: 'getFrequencies',
			aname: 'getByteFrequencyData'
		}
	].forEach(function(ginfo){
		let array;
		let aname = ginfo.aname;
		interface[ginfo.iname] = function(){
			if(initIfNot()) {
				array = checkArray(array);
				analyzer[aname](array);
				return array;
			}
		};
		ginfo = undefined;
	});
	
	return interface;
})();

//audio context suspending
document.addEventListener('visibilitychange',()=>{
    if(audioCtx) {
        if(document.visibilityState === 'hidden') {
            audioCtx.suspend();
        } else {
            audioCtx.resume();
        }
    }
});
