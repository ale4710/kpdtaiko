function outputInfo(title,artist,difficulty) {
    eid('info-title').textContent = title;
    eid('info-artist').textContent = artist;
    eid('info-difficulty').textContent = difficulty;
}

var statistics,
hitData = [],
hitDataMs = [],
combo = 0;
function infoReset() {
    statistics = {
        normalNoteCount: 0,
        maxCombo: 0,
        drumrollTotal: 0,
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
    eid('game-stats-good').textContent = statistics.hits.good;
    eid('game-stats-okay').textContent = statistics.hits.okay;
    eid('game-stats-miss').textContent = statistics.hits.miss;

    //accuracy
    eid('game-stats-accuracy').textContent = getAccuracy();
    if(isPerfectAccuracy()) {eid('game-stats-accuracy').classList.add('hilight')}

	//max combo
    eid('game-stats-max-combo').textContent = statistics.maxCombo;
    if(isFullCombo()) {eid('game-stats-max-combo').classList.add('hilight')}

	//drumroll
    eid('game-stats-drumroll').textContent = statistics.drumrollTotal;
	
	//img
	eid('game-stats-histogram').src = createTimeGraph(2);
	//timedata
	var td = analyzeTimeData();
	//  misc data
	eid('game-stats-late').textContent = td.late;
	eid('game-stats-early').textContent = td.early;
	eid('game-stats-average').textContent = td.average.toFixed(2);
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
var createTimeGraph = (function(){
	var cv;
	var ctx;
	
	return function(
		barWidth = 1,
		barSpacing = 0,
		w = 200,
		h = 70,
		color = '#fff',
		timeData = hitDataMs
	) {
		//initialize canvas
		if(!cv) {
			cv = document.createElement('canvas'),
			ctx = cv.getContext('2d');
		}
		
		cv.width = w;
		cv.height = h;
		
		ctx.clearRect(
			0, 0,
			w, h
		);
		
		//collect data
		//get the number of "bins"
		let binCount = Math.floor(w / (barWidth + barSpacing));
		if(binCount === 0) {throw Error('something went wrong when calculating the binCount');}
		//amount of time to be sampled
		let timingSampleSize = (hitWindow.miss * 2) / binCount;
		//fill histogram array with 0
		let histogram = [];
		while(histogram.length !== binCount) {histogram.push(0);}
		//now count
		let max = 0;
		hitDataMs.forEach((ms)=>{
			//determine bin
			let bin = Math.floor((ms + hitWindow.miss) / timingSampleSize);
			//put it in
			if(bin in histogram) {
				histogram[bin]++;
				max = Math.max(max, histogram[bin]);
			}
		});
		
		//draw
		ctx.fillStyle = color;
		histogram.forEach((count, index)=>{
			let barHeight = (count / max) * h;
			ctx.fillRect(
				(barWidth + barSpacing) * index,
				h - barHeight,
				barWidth,
				barHeight
			);
		});
		
		//center the image
		let img = ctx.getImageData(0,0,w,h);
		ctx.clearRect(0,0,w,h);
		ctx.putImageData(
			img,
			Math.floor((w - ((barWidth + barSpacing) * binCount)) / 2),
			0
		);
		
		return cv.toDataURL();
	}
})();

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
