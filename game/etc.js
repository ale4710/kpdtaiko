setCssVariable(
    'bg-dim',
    getSettingValue('background-dim') / 100
);

if(getSettingValue('show-bpm') === 0) {
	eid('bpm-display-all').classList.add('hidden');
}

if(getSettingValue('judge-position') === 1) {
	document.body.classList.add('info-hitarea-bottom');
}

var modsDisplay = (new ModsView(
	0,
	eid('top-info-center')
));

function printBg(url) {
	checkBottomStageReady().then(function(){
		if(bottomStage.data.img) {URL.revokeObjectURL(bottomStage.data.img);}
		bottomStage.data.img = url;
		bottomStage.dataUpdated();
	});
	document.body.classList.add('background-image-exists');
}

class dtKeeper {
	constructor() {
		this.lastTime = -Infinity;
	}
	
	check() {
		let now = performance.now();
		let dt = now - this.lastTime;
		this.lastTime = now;
		return dt;
	}
}

function cycleValue(val,max) {
    val++;
    if(val > max) {return 0}
    return val;
}
function metronomeAudioTick(){
    playSound('metronome');
}
if(modsList.mods.metronome.check()) {
    window.addEventListener('bpmtick',metronomeAudioTick);
    //eid('indicator-metronome').classList.remove('hidden');
}

var metronome = (function(){
    var lastTick, curTimingPoint;

    var events = {
        tick: 'bpmtick',
        bpmChange: 'bpmchange'
    };

    function mreset() {
        lastTick = -4;
        curTimingPoint = 0;
    }
    mreset();

    function getBpm() {
		var b = (60000 / gameFile.bpmTimes[curTimingPoint].beatLength);
        return {
			bpm: b * audioControl.checkPlaybackRate(),
			bpmActual: b
		};
    }

    function check() {
        if(ended) {return}

        var bpmTimes = gameFile.bpmTimes,
        lastBpm = curTimingPoint,
        now = curTime();
        //check next timing point passed
        while(true) {
            if(curTimingPoint + 1 in bpmTimes) {
                var ntp = bpmTimes[curTimingPoint + 1];
                if(ntp.time <= now) {
                    curTimingPoint++;
                    lastTick = 0;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        if(lastBpm !== curTimingPoint) {
			var scale = audioControl.checkPlaybackRate(),
			ob, nb, oba, nba;
			
			oba = (60000 / bpmTimes[lastBpm].beatLength);
			ob = oba * scale;
			
			var nbd = getBpm();
			nba = nbd.bpmActual;
			nb = nbd.bpm;
            window.dispatchEvent(
                new CustomEvent(events.bpmChange,
                    {
                        detail: {
                            oldBpm: ob,
							oldBpmActual: oba,
                            newBpm: nb,
							newBpmActual: nba
                        }
                    }
                )
            );
        }

        var ctp = bpmTimes[curTimingPoint], tick = false;

        while((ctp.time + (ctp.beatLength * lastTick)) <= now) {
            lastTick++;
            tick = true;
        }

        if(tick) {
            window.dispatchEvent(new CustomEvent(events.tick));
        }
    }

    return {
        reset: mreset,
        getBpm: getBpm,
        check: check
    };
})();

//special mode stuff
var specialMode = (function(){
	var nextsp = 0,
	spcurenabled = false,
	evreset = 'specialmodereset',
	evchanged = 'specialmodechanged';
	
	function check() {
		var nsm = gameFile.specialModeToggles[nextsp];
		if(nsm) {
			if(curTime() >= nsm.time) {
				nextsp++;
				spcurenabled = nsm.on;
				window.dispatchEvent(new CustomEvent(
					evchanged,
					{detail: {
						enabled: nsm.on
					}}
				));
			}
		}
	}
	
	function spreset() {
		nextsp = 0;
		spcurenabled = false;
		window.dispatchEvent(new CustomEvent(evreset));
	}
	
	return {
		check: check,
		reset: spreset,
		
		checkStatus: function(){return spcurenabled}
	};
})();
