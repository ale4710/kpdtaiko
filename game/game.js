var gameFile,
gameLoopReferenceNumber,
latestObject = 0,
hitWindow = {
    good: 35,
    okay: 80,
    miss: 95
    /*               the timing window
        [------[------[------|------]------]------]
        |MISS  |OKAY  |GOOD     GOOD|  OKAY|  MISS|
        |      |      |
        |      |      |good~0: the good time window. hits here ar good.
        |      |okay~good: the okay time window. hits here are okay.
        |miss~okay: spam protection. any hits in this area will be misses.

        any hits outside the timing window will be ignored.
    */
},

ready = false,

prerollAmount,
prerollLastTime,
prerollPlayed = false,

timeOffset = getSettingValue('offset') * (-1 + (2 * getSettingValue('offset-mode'))),
timerPaused = false,

timerMode = getSettingValue('timer-mode'), //0 = linked to audio, 1 = independent
timerMode1 = {
    time: 0,
    last: 0
}
;

if(modsList.mods.swTimingWindow.check()) {
    hitWindow.good = 1500;
    hitWindow.okay = 3000;
    hitWindow.miss = 3000;

    /* eid('indicator-super-wide-hit-windows').classList.remove('hidden'); */
}

function curTime() {
    var time;
    if(prerollAmount > 0) {
        time = prerollAmount * -1;
    } else {
        switch(timerMode) {
            case 0: time = audioControl(audioControlActions.checkTime) * 1000; break;
            case 1: time = timerMode1.time * audioControl(audioControlActions.checkPlaybackRate); break;
        }
    }
    return time - timeOffset;
}
function timerReset() {
    //timerMode = 1
    timerMode1.time = 0;
}
function timerFullReset() {
    prerollAmount = (4000 + timeOffset) * audioControl(audioControlActions.checkPlaybackRate);
    prerollLastTime = null;
    prerollPlayed = false;
    timerMode1.last = 0;
}
function timerUpdate() {
    if(timerPaused) {return}
    if(prerollAmount > 0) {
        var pnow = performance.now();
        if(typeof(prerollLastTime) === 'number') {
            prerollAmount -= ((pnow - prerollLastTime) * audioControl(audioControlActions.checkPlaybackRate));
        }
        prerollLastTime = pnow;
    }
    if(
        !prerollPlayed &&
        prerollAmount <= 0
    ) {
		console.log('play');
        audioControl(audioControlActions.play);
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
        timerMode1.time = audioControl(audioControlActions.checkDuration) * 1000;
        timerMode1.last = performance.now();
        timerMode = 1;
        console.warn('The audio has ended, but the chart has not. Using independent timing from now on...');
    }

    switch(timerMode) {
        case 1:
            var now = performance.now();
			if(timerMode1.last !== null) {
				timerMode1.time += (now - timerMode1.last);
			}
			timerMode1.last = now;
			break;
    }
}
function timerTogglePause() {
    if(!ended) {
        switch(timerMode + (timerPaused<<4)) {
            /* case 0: //mode0, unpaused
                //switch to paused
                audioControl(audioControlActions.pause);
                break;
            case 0+(1<<4): //mode0, paused
                //switch to unpaused
                audioControl(audioControlActions.play);
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
            audioControl(
                audioControlActions[
                    timerPaused? 'play' : 'pause'
                ]
            );
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

function start() {
	//return;
    gameFile.objects.forEach((v,i)=>{v.id = i;});
    gameFile.barlines.forEach((v,i)=>{v.id = i;});
    console.log('ready!', gameFile);

    outputInfo(
        gameFile.title,
        gameFile.artist,
        gameFile.difficulty
    );
	
	bottomStage.dataUpdated();

    createAudioContext().then(()=>{
		function startForReal() {
			document.body.classList.add('ready');

			ready = true;
			reset();
			
			bottomStage.init();

			gameLoopStop();
			gameLoop();
			gameAnim();
		}

		if(audioCtx.state === 'running') {
			startForReal();
		} else {
			eid('loading-display-in').textContent = 'Press Enter.';
			window.addEventListener('keydown', function sac(k){
				if(k.key === 'Enter') {
					audioCtx.resume();
					startForReal();
					window.removeEventListener('keydown', sac);	
				}
			});
		}
    });
}

function reset() {
    timerFullReset();

    audioControl(audioControlActions.stop);

    drawReset();
    calculateDrawingOrder(gameFile);
    barlineManager.calculateOrder();

	bottomStage.reset();
    checkingReset();
    infoReset();
    metronome.reset();
    updateBpm();
}

function gameLoop(proceed) {
    //draw();
    timerUpdate();
    metronome.check();
    checking();
    autoplay();
	
	bottomStage.check();

    if(proceed !== false) {
        eid('ups').textContent = fpsCheck('ups');
        
        //gameLoopReferenceNumber = requestAnimationFrame(gameLoop);
        gameLoopReferenceNumber = setTimeout(gameLoop);
    }
}

var gameAnimRefNum;
var gameAnimMethod = getSettingValue('draw-loop-method');
function gameAnim(proceed) {
    draw();

    if(proceed !== false) {
        eid('fps').textContent = fpsCheck('fps');
        if(gameAnimMethod === 0) {
			gameAnimRefNum = requestAnimationFrame(gameAnim);
		} else {
			gameAnimRefNum = setTimeout(gameAnim);
		}
    }
}

function gameLoopStop() {
    //cancelAnimationFrame(gameLoopReferenceNumber);
    clearTimeout(gameLoopReferenceNumber);
    
    if(gameAnimMethod === 0) {
		cancelAnimationFrame(gameAnimRefNum);
	} else {
		clearTimeout(gameAnimRefNum);
	}
}

function checkingReset() {
    latestObject = 0;
}
function checking() {
    var ct = curTime();

    while(true) { //objectsCheck
        if(!(latestObject in gameFile.objects)) {break;}

        var stop = false,
        currentObj = gameFile.objects[latestObject];
        switch(currentObj.type) {
            default: 
                if(ct > currentObj.time + hitWindow.okay) {
                    miss();
                    outputJudgeOffset('Late', true);
                    console.log('miss: too late.');
                } else {
                    stop = true;
                }
				break;
            case 2: //drumroll
                if(
                    ct > currentObj.time &&
                    !drumrollArrived
                ) {
                    drumrollArrived = true;
                    postJudge(judgeStyles.roll, true);
                } else if(ct > currentObj.time + currentObj.length) {
                    nextObject();
                } else {
                    stop = true;
                }
                break;
            case 3: //balloon
                if(
                    ct > currentObj.time &&
                    !balloonArrived
                ) {
                    balloonArrived = true;
                    postJudge({
                        text: currentObj.limit,
                        className: 'number'
                    }, true);
                } else if(ct > currentObj.length) {
                    nextObject();
                } else {
                    stop = true;
                }
                break;
        }

        if(stop) {
            break;
        }
    }

    if(
        gameFile.objects.length === latestObject &&
        !ended
    ) {end();}
}

function nextObject() {
    var pobj = gameFile.objects[latestObject];
    switch(pobj.type) {
        case 2: //drumroll
            postJudge({
                text: drumrollHit,
                className: 'number'
            });
            drumrollReset();
            break;
        case 3: //balloon
            balloonReset();
            postJudgeHide();
            break;
    }

    latestObject++;

    /* var cobj = gameFile.objects[latestObject];
    if(cobj) {
        switch(cobj.type) {
            case 3: //balloon
                
        }
    } */
}

function disappearAndNext() {
    noDrawObjects.push(latestObject);
    nextObject();
}

function miss(disappear) {
    if(disappear) {
        noDrawObjects.push(latestObject);
    } else {
        notesMissed.push(latestObject);
    }
	window.dispatchEvent(new CustomEvent('gamemissed', {
		detail: {
			combo: combo
		}
	}));
    nextObject();
    postJudge(judgeStyles.miss);
    infoAddHit('miss');
}

//balloon stuff
var balloonHit = 0,
balloonArrived = false;
function balloonReset() {
    balloonHit = 0;
    balloonArrived = false;
}

//drumroll stuff
var drumrollHit = 0,
drumrollArrived = false;
function drumrollReset() {
    drumrollHit = 0;
    drumrollArrived = false;
}

function inHitWindow(time) {
    return curTime() > time - hitWindow.miss;
}

var balloonPopSound = (getSettingValue('balloon-pop-sound') === 1);
function playerAction(action) { //purely game related stuff. do not handle 'pausing' or 'endcall' or etc here.
    if(
        !ended &&
        ready
    ) {

        playSound(['don','kat'][action]);

        var cur = gameFile.objects[latestObject];
        if(cur) {
            switch(cur.type) {
                case 0: //don
                case 1: //kat
                    if(inHitWindow(cur.time)) {
						var delay = curTime() - cur.time;
						hitDataMs.push(delay);
                        if(cur.type === action) {
                            //judge
                            var hitWindowKey = ['miss','okay','good'],
                            hit = 0;
                            for(var i = 0; i < hitWindowKey.length; i++) {
                                if(Math.abs(delay) < hitWindow[hitWindowKey[i]]) {
                                    hit = i;
                                } else {
                                    break;
                                }
                            }
                            if(hit === 0) {
                                miss();
                                outputJudgeOffset('Early', false);
                                console.log('miss: too early');
                            } else {
                                disappearAndNext();
                                outputJudgeOffset(delay);
                                postJudge(judgeStyles[hitWindowKey[hit]]);
                                infoAddHit(hitWindowKey[hit]);
                            }
                        } else {
                            outputJudgeOffset('Color', null);
                            miss();
                            console.log('miss: wrong color.');
                        }
                    }
                    
                    break;
                case 2: //drumroll
                    if(
                        cur.time < curTime() &&
                        cur.time + cur.length > curTime()
                    ) {
                        drumrollHit++;
                        infoAddDrumroll();
                        postJudge({
                            text: drumrollHit,
                            className: 'number'
                        }, true);
                    }
                    break;
                case 3: //balloon
                    if(
                        cur.time < curTime() &&
                        cur.length > curTime()
                    ) {
                        balloonHit++;
                        if(balloonHit === cur.limit) {
                            disappearAndNext();
                            postJudge(judgeStyles.pop);
                            if(balloonPopSound){playSound('pop');}
                        } else {
                            postJudge({
                                text: cur.limit - balloonHit,
                                className: 'number'
                            }, true);
                        }
                    }
                    break;
            }
        }
    }
    
}
