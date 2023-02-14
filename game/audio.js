var audio,
audioEnded = false,
audioCtx,
audioCtxSpace = {},
sounds = {},

mediaPlayMode = getSettingValue('media-play-mode') //0 = html media element, 1 = audiocontext
;

var audioControl = (function(){
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
	}
	
	return ctrls;
})();

function audioControl(action) {
	//console.log(action);
	
    if(audio) {
        switch(action + (mediaPlayMode << 4)) {
            //theyre the same!
            case audioControlActions.pause: //html
            case audioControlActions.pause + (1<<4): //audctx
                audio.pause();
                break;
            case audioControlActions.play: //html
            case audioControlActions.play + (1<<4): //audctx
                audioEnded = false;
                audio.play();
                break;
            case audioControlActions.checkPlaybackRate: //html
            case audioControlActions.checkPlaybackRate + (1<<4): //audctx
                return audio.playbackRate;
    
            //html specific
            case audioControlActions.checkPaused:
                return audio.paused;
            case audioControlActions.checkTime:
                return audio.currentTime;
            case audioControlActions.checkDuration:
                return audio.duration;
            case audioControlActions.stop:
                audio.pause();
                audio.currentTime = 0;
                break;
    
            //audiocontext specific
            case audioControlActions.checkPaused + (1<<4):
                return audio.paused();
            case audioControlActions.checkTime + (1<<4):
                return audio.currentTime();
            case audioControlActions.checkDuration + (1<<4):
                return audio.duration();
            case audioControlActions.stop + (1<<4):
                audio.stop();
                break;
        }
    }
    
}

class AudioFromCtx { //definitely not copied from https://stackoverflow.com/a/31653217
    constructor(audbuf, connectTo, playbackrate) {
        if(!audioCtx) {throw 'please start the audioCtx.'}
        if(!(audbuf instanceof AudioBuffer)) {throw 'please pass an AudioBuffer.'}
        this.audioBuffer = audbuf;

        this.startedTime = null;
        this.pausedOffset = null;

        this.destination = connectTo || audioCtx.destination;

        this.playbackRate = playbackrate || 1;
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
			
            this.sourceNode = audioCtx.createBufferSource();
            this.sourceNode.buffer = this.audioBuffer;
            this.sourceNode.playbackRate.value = this.playbackRate;
            this.sourceNode.connect(this.destination);
            
            this.sourceNode.start(0, po * this.playbackRate);

            this.sourceNodeEndCallback = ()=>{this.sourceNodeCheckEnded(this)};
            this.sourceNode.addEventListener('ended', this.sourceNodeEndCallback);
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
            this.sourceNodeEndCallback = null;
            this.sourceNode.disconnect();
            this.sourceNode.stop();
            this.sourceNode = null;
        }
        this.startedTime = null;
        this.pausedOffset = null;
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