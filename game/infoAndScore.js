function outputInfo(title,artist,difficulty) {
    eid('info-title').textContent = title;
    eid('info-artist').textContent = artist;
    eid('info-difficulty').textContent = difficulty;
}

var balloonsInChart = 0;
var drumrollExists = false;

var statistics;
var hitData = [];
var hitDataMs = [];
var combo = 0;
function infoReset() {
    statistics = {
        normalNoteCount: 0,
        maxCombo: 0,
        drumrollTotal: 0,
		balloonTotal: 0,
        hits: {
            good: 0,
            okay: 0,
            miss: 0
        }
    };
    combo = 0;

    eid('game-stats-dg-accuracy').textContent = '--.--%';
    eid('game-stats-dg-combo').textContent = 0;
	
	hitData.length = 0;
	hitDataMs.length = 0;
}
function infoAddHit(hit) {
    if(hit in statistics.hits) {
        statistics.hits[hit]++;
		hitData.push(hit);
    
		if(hit === 'miss') {
			combo = 0;
		} else {
			combo++;
			statistics.maxCombo = Math.max(
				statistics.maxCombo,
				combo
			);
		}
		outputGameplayInfo();
	}
}
function infoAddDrumroll() {
    statistics.drumrollTotal++;
}
function infoAddBalloon() {
	statistics.balloonTotal++;
}
function getAccuracy() {
    return (getAccuracyRaw() * 100).toFixed(2) + '%';
}
function getAccuracyRaw() {
    return (
        (statistics.hits.good + (statistics.hits.okay * 0.5)) / 
        (statistics.hits.good + statistics.hits.okay + statistics.hits.miss)
    );
}
function outputGameplayInfo() {
    eid('game-stats-dg-accuracy').textContent = getAccuracy();
    eid('game-stats-dg-combo').textContent = combo;
}
function isFullCombo() {return statistics.hits.miss === 0}
function isPerfectAccuracy() {return getAccuracyRaw() === 1}

function outputGameplayInfoFinal() {
	//reset
	eid('game-stats-accuracy').classList.remove('hilight');
	eid('game-stats-max-combo').classList.remove('hilight');
	
	//okay output for real
    eid('game-stats-good').textContent = statistics.hits.good;
    eid('game-stats-okay').textContent = statistics.hits.okay;
    eid('game-stats-miss').textContent = statistics.hits.miss;
	{
		let missedBalloons = balloonsInChart - statistics.balloonTotal;
		eid('game-stats-miss-balloon').classList.toggle('hidden', missedBalloons === 0);
		eid('game-stats-miss-balloon').textContent = missedBalloons;
	}
    //accuracy
    eid('game-stats-accuracy').textContent = getAccuracy();
    if(isPerfectAccuracy()) {eid('game-stats-accuracy').classList.add('hilight')}

	//max combo
    eid('game-stats-max-combo').textContent = statistics.maxCombo;
    if(isFullCombo()) {eid('game-stats-max-combo').classList.add('hilight')}

	//drumroll
    eid('game-stats-drumroll').textContent = (
		drumrollExists? statistics.drumrollTotal : 'N/A'
	);
}

function getAverageError() {
	let tms = 0;
	hitDataMs.forEach((ms)=>{
		tms += ms;
	});
	return tms / hitDataMs.length;
}

function analyzeTimeData() {
	var late = 0, early = 0, allMs = 0;

	hitDataMs.forEach((ms)=>{
		//late/early
		if(ms > 0) {
			late++;
		} else {
			early++;
		}
		
		//for average
		allMs += ms;
	});
	
	return {
		late: late,
		early: early,
		average: (allMs / hitDataMs.length)
	};
}

var showJudgeOffset = getSettingValue('show-judge-offset') === 1;
function outputJudgeOffset(offset,manLate) {
    if(showJudgeOffset) {
        if(typeof(offset) === 'number') {
            if(typeof(manLate) === 'undefined') {
                manLate = (offset > 0);
            }

            offset = offset.toFixed(0);
        }

        eid('judge-offset').textContent = offset;
        eid('judge-offset').classList.remove('late','early');
        
        if(typeof(manLate) === 'boolean') {
            eid('judge-offset').classList.add(
                manLate? 'late' : 'early'
            );
        }
    }
    
}

function updateBpm(e) {
    var bpm;
    if(e) {
        bpm = e.detail.newBpm;
    } else {
        bpm = metronome.getBpm().bpm;
    }

    var tf = 0,
    bpmSigCheck = bpm % 1;
    if(
        bpmSigCheck > 0.01 &&
        bpmSigCheck < 0.99
    ) {
        tf = 2;
    }
    bpm = bpm.toFixed(tf);

    eid('bpm-display').textContent = bpm;
}
window.addEventListener('bpmchange',updateBpm);
