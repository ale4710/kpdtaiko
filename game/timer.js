var hitWindow = {
    good: 35,
    okay: 80,
    miss: 95
};
    /*               the timing window
        [------[------[------|------]------]------]
        |MISS  |OKAY  |GOOD     GOOD|  OKAY|  MISS|
        |      |      |
        |      |      |good~0: the good time window. hits here ar good.
        |      |okay~good: the okay time window. hits here are okay.
        |miss~okay: spam protection. any hits in this area will be misses.

        any hits outside the timing window will be ignored.
    */

var ready = false;

var prerollAmount;
var prerollLastTime;
var prerollPlayed = false;

var timerPaused = false;

var timerMode = getSettingValue('timer-mode'); //0 = linked to audio, 1 = independent
var originalTimerMode = timerMode;
var timerMode1 = {
    time: 0,
    last: 0
};

var timeOffset = 0;
var globalTimeOffset = getSettingValue('offset') * (-1 + (2 * getSettingValue('offset-mode')));
var localTimeOffset = 0;
function recalculateOffset() {
	timeOffset = globalTimeOffset + localTimeOffset;
}

if(modsList.mods.swTimingWindow.check()) {
    hitWindow.good = 1500;
    hitWindow.okay = 3000;
    hitWindow.miss = 3000;
}

function curTime() {
    var time;
    if(prerollAmount > 0) {
        time = prerollAmount * -1;
    } else {
        switch(timerMode) {
            case 0: time = audioControl.checkTime() * 1000; break;
            case 1: time = timerMode1.time * audioControl.checkPlaybackRate(); break;
        }
    }
    return time - timeOffset;
}
function timerReset() {
    //timerMode = 1
    timerMode1.time = 0;
}
function timerFullReset() {
    prerollAmount = (4000 + timeOffset) * audioControl.checkPlaybackRate();
    prerollLastTime = null;
    prerollPlayed = false;
    timerMode1.last = 0;
    timerMode = originalTimerMode;
}
function timerUpdate() {
    if(timerPaused) {return}
    if(prerollAmount > 0) {
        var pnow = performance.now();
        if(typeof(prerollLastTime) === 'number') {
            prerollAmount -= ((pnow - prerollLastTime) * audioControl.checkPlaybackRate());
        }
        prerollLastTime = pnow;
    }
    if(
        !prerollPlayed &&
        prerollAmount <= 0
    ) {
		console.log('play');
        audioControl.play();
        prerollPlayed = true;

        timerReset();
    }

    if(
        audioEnded &&
        !ended &&
        timerMode !== 1
    ) {
        //switch to independent timer mode!
        timerReset();
        timerMode1.time = audioControl.checkDuration() * 1000;
        timerMode1.last = performance.now();
        timerMode = 1;
        console.warn('The audio has ended, but the chart has not. Using independent timing from now on...');
    }

	if(timerMode === 1) {
		var now = performance.now();
		if(timerMode1.last !== null) {
			timerMode1.time += (now - timerMode1.last);
		}
		timerMode1.last = now;
	}
}
function timerTogglePause() {
    if(!ended) {
        switch(timerMode + (timerPaused<<4)) {
            /* case 0: //mode0, unpaused
                //switch to paused
                audioControl.pause();
                break;
            case 0+(1<<4): //mode0, paused
                //switch to unpaused
                audioControl.play();
                break; */
            case 1: //mode1, unpaused
                //switch to puased
                //dont need to do anything ;)
                break;
            case 1+(1<<4): //mode1, paused
                //switch to unpaused
                timerMode1.last = performance.now();
                break;
        }

        if(prerollPlayed) {
            audioControl[
				timerPaused? 'play' : 'pause'
			]();
        }

        if(
            timerPaused &&
            prerollAmount > 0
        ) {
            //switch to unpaused
            prerollLastTime = performance.now();
        }
        timerPaused = !timerPaused;
    }
}