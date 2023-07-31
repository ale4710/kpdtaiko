var gameFile;
var gameLoopReferenceNumber;
var latestObject = 0;

function start() {
    gameFile.objects.forEach((v,i)=>{
		//set id
		v.id = i;
		//also check for drumroll and balloon
		if(v.type === 2) {drumrollExists = true}
		if(v.type === 3) {balloonsInChart++}
	});
    gameFile.barlines.forEach((v,i)=>{v.id = i;});
    console.log('ready!', gameFile);
	
	bottomStage.dataUpdated();
	
	Promise.allSettled([
		createAudioContext(),
		checkHTMLaudioAutoPlay()
	]).then((results)=>{
		console.log(results);
		
		window.parent.globalIntroSlider.toggleShow(false);
		updateCornerLoadingDisplay(false);
		
		if(
			(audioCtx.state === 'running') &&
			(results[1].status === 'fulfilled')
		) {
			return Promise.resolve();
		} else {
			eid('loading-display-in').textContent = 'Press OK.';
			return new Promise((proceed)=>{
				window.addEventListener('keydown', function sac(k){
					if(k.key === 'Enter') {
						window.removeEventListener('keydown', sac);
						
						audioCtx.resume();
						
						if(results[1].status === 'rejected') {
							results[1].reason();
						}
						
						proceed();
					}
				});
			});
		}
    }).then(()=>{
		document.body.classList.add('ready');

		ready = true;
		reset();
		
		bottomStage.finishedLoading();

		gameLoopStop();
		gameLoop();
		gameAnim();
		
		curpage = gamePageN;
		
		start = undefined;
	});
}

function reset() {
	outputInfo(
        gameFile.title,
        gameFile.artist,
        gameFile.difficulty
    );
	
    timerFullReset();

    audioControl.stop();
	
	endedReset();

    drawReset();
    calculateDrawingOrder(gameFile);
    barlineManager.calculateOrder();
	
	balloonReset();
	drumrollReset();

	metronome.reset();
    checkingReset();
    infoReset();
    updateBpm();
	
	bottomStage.reset();
	topCharacter.reset();
}

var gameLoopAdditional = [];
function gameLoop(proceed) {
    //draw();
    timerUpdate();
    metronome.check();
    checking();
    (autoplay || emptyfn)();
	
	bottomStage.update();
	
	gameLoopAdditional.forEach((fn)=>{fn();});

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
    
	nextObject();
    postJudge(judgeStyles.miss);
    infoAddHit('miss');
	
	{
		let lo = gameFile.objects[latestObject];
		window.dispatchEvent(new CustomEvent('gamehit', {detail: {
			combo: combo,
			judgement: 0,
			type: lo.type,
			big: lo.big
		}}));
	}
}

//balloon stuff
var balloonHit = 0;
var balloonArrived = false;
function balloonReset() {
	window.dispatchEvent(new CustomEvent('gameballoonreset'));
    balloonHit = 0;
    balloonArrived = false;
}

//drumroll stuff
var drumrollHit = 0;
var drumrollArrived = false;
function drumrollReset() {
	window.dispatchEvent(new CustomEvent('gamedrumrollreset'));
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
								if(cur.type <= 2) {
									noteHitEffectManager.add(
										['don', 'kat'][cur.type],
										cur.big && 'big' || 'normal'
									);
								}
                                infoAddHit(hitWindowKey[hit]);
								window.dispatchEvent(new CustomEvent('gamehit', {detail: {
									judgement: hit,
									type: cur.type,
									big: cur.big
								}}));
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
							infoAddBalloon();
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
