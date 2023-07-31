var drawReady = false;

var notesDisplay = eid('notes-display');
var notesDisplayCanvasContainer = eid('notes-display-canvas-container');

var latestObjectDrawn;
var noDrawObjects;
var notesMissed;
var objectsPrinted;

var calculateDrawingOrder;
var drawingOrder;

var barlineManager;

var drawFn;
var drawFnReset;
var killDraw;
var preDrawFn;

function broadcastDrawReady() {
    window.dispatchEvent(new CustomEvent('drawready'));
    drawReady = true;
    broadcastDrawReady = null;
}
function waitDrawReady() {
	return new Promise(function(resolve){
		if(drawReady) {
			resolve();
		} else {
			window.addEventListener('drawready', resolve);
		}
	});
}

function drawReset() {
    if(drawFnReset) {drawFnReset()}
	noteHitEffect.reset();
    if(barlineManager){barlineManager.reset();}

    latestObjectDrawn = 0;
    noDrawObjects = [];
    notesMissed = [];
    drawingOrder = [];

    objectsPrinted = [];

    postJudgeHide();
    
	specialMode.reset();
    checkLyricsReset();

    updateBpm();
}
//drawReset();

//judge stuff
var judgeClassNameOld = 'placeholder',
judgeStyles = {
    miss: {
        text: 'Miss',
        className: 'judge-red'
    },
    okay: {
        text: 'Okay',
        className: 'judge-white'
    },
    good: {
        text: 'Good',
        className: 'judge-yellow'
    },
    pop: {
        text: 'Pop!',
        className: 'judge-white'
    },
    roll: {
        text: 'Roll!',
        className: 'judge-white'
    },

},
judgeTimeout,
judgeAnimationMode = getSettingValue('judge-animation-mode'), //0 = off, 1 = simple, 2 = full
judgeSimpleAnimTimeout;
function postJudge(js,nohide) {
    var judge = eid('judge');

    if(!!js) {
        postJudgeHide();
        judge.textContent = js.text;
        judge.classList.add(js.className);
        judgeClassNameOld = js.className;
    }

    switch(judgeAnimationMode) {
        case 1:
            clearTimeout(judgeSimpleAnimTimeout);
            judge.classList.add('nudged');
            judgeSimpleAnimTimeout = setTimeout(()=>{judge.classList.remove('nudged');},60);
            break;
        case 2:
            judge.classList.remove('nudgeAnimation');
            void judge.offsetHeight;
            judge.classList.add('nudgeAnimation');
            break;
    }

    if(!nohide) {
        judgeTimeout = setTimeout(postJudgeHide,1000);
    }
}
function postJudgeHide() {
    var judge = eid('judge');
    clearTimeout(judgeTimeout);
    judge.textContent = '';
    judge.classList.remove(judgeClassNameOld);
}

//special mode stuff
window.addEventListener('specialmodereset',()=>{
	document.body.classList.remove('special');
});
window.addEventListener('specialmodechanged',(ev)=>{
	//console.log(ev);
	document.body.classList.toggle('special', ev.detail.enabled);
});

//lyrics stuff
var nextLyric = 0,
showLyrics = !!getSettingValue('show-lyrics');
function checkLyrics() {
    if(
        'lyrics' in gameFile &&
        showLyrics
    ) {
        var lrcList = gameFile.lyrics;
        if(nextLyric in lrcList) {
            while(lrcList[nextLyric].time <= curTime()) {
                //eid('lyrics-display').textContent = lrcList[nextLyric].lyric;
                eid('lyrics-display').innerText = lrcList[nextLyric].lyric;
                nextLyric++;
                if(!(nextLyric in lrcList)) {break}
            }
        }
    }
}
function checkLyricsReset() {
    nextLyric = 0;
    eid('lyrics-display').innerText = '';
}

//barline (init)
function barlineInitialize(drawingManager){
    console.log('barlinemanager init')

    var barlinesDrawingOrder = [],
    curBarline = 0;

    function calculateBarlineOrder() {
        barlinesDrawingOrder = [].concat(gameFile.barlines);
        barlinesDrawingOrder.sort((a,b)=>{
            a.startDraw = a.time - a.lookAhead;
            b.startDraw = b.time - b.lookAhead;
            return a.startDraw - b.startDraw;
        });
        for(var i = 0; i < barlinesDrawingOrder.length; i++) {
            barlinesDrawingOrder[i] = barlinesDrawingOrder[i].id;
        }
    }

    function resetBarlines() {
        curBarline = 0;
        drawingManager.reset();
    }

    function drawBarlines() {
        curBarline = drawingManager.draw(
            curBarline,
            barlinesDrawingOrder
        );
    }

    barlineInitialize = null;

    return {
        draw: drawBarlines,
        reset: resetBarlines,
        calculateOrder: calculateBarlineOrder
    }
}

//time progress
function updateTimeProgessBar() {
    var playbackRateScaler = 1 / audioControl.checkPlaybackRate(),
    firstObjTime = gameFile.objects[0].time,
    lastObjTime = gameFile.objects[gameFile.objects.length - 1].time,
    timePastFirstObject = curTime() - firstObjTime;

    eid('progress').value = Math.max(0, Math.min(1,
        timePastFirstObject /
        (lastObjTime - firstObjTime)
    ));

    if(timePastFirstObject < 0) {
        eid('progress-text').textContent = `(${timeformat(((firstObjTime - curTime()) * playbackRateScaler) / 1000)})`;
    } else {
        eid('progress-text').textContent = timeformat(
            Math.max(
                0,
                (lastObjTime - curTime()) / 1000
            ) * playbackRateScaler
        );
    }
}

var drawingEnabled = !!getSettingValue('show-notes');
/* if(!drawingEnabled) {
    eid('indicator-notes-hidden').classList.remove('hidden');
} */
function draw() {
    //debugging
    //eid('ndc').textContent = noteDivCache.length;

    var gf = gameFile.objects;
    
    updateTimeProgessBar();
    checkLyrics();
    specialMode.check();
	bottomStage.draw();

    if(drawingEnabled) {
        if(preDrawFn){preDrawFn()}
        barlineManager.draw();
        drawFn(gf);
		noteHitEffect.draw();
    }
}

function getNoteXpos(time, tlookAhead, ctOverride) {
    if(typeof(ctOverride) !== 'number') {
        ctOverride = curTime();
    }
    return ((time - ctOverride) / tlookAhead);
} 