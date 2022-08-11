function parseTjaFile(file, options) {
    if(typeof(options) !== 'object') {options = {}}
    var tjaFinal = {
        title: null,
        artist: null,
        artistDisplayMode: 0,
        creator: null,
        difficulty: null,
        difficultySort: 0,
        difficultyLevel: null,
        objects: [],
        image: null,
        audio: null,
		mediaSource: null,
        previewPoint: 0,
        specialModeToggles: [],
        bpmTimes: [],
        barlines: [],
        lyrics: []
    },
    file = file.split(/\r?\n/g),

    targetCourse,
    targetCourseFound = false,

    checkAllCourse = !!options.checkAllCourse,
    courseInfoEach = [],
    unassignedCourseData = {},
    
    bpm = 120,
    scrollInitMultiplier = 1,
    globalScrollMultiplier = 1,
    balloons = [],
    course = null,
    unlabeledCourseCounter = 1;

    tjaFinal.bpmTimes[0] = {
        beatLength: 60000 / 120,
        time: 0
    };

    if(typeof(options) === 'object') {
        if('targetCourse' in options) {targetCourse = options.targetCourse}

        if('scrollMultiplier' in options) {
            globalScrollMultiplier = options.scrollMultiplier;
        }
    }

    //remove comments and strip whitespace
    file.forEach((line, arindex, array)=>{
        //whitespace strip
        line = line.trim();

        //comment remove
        var commentIndex = line.indexOf('//');
        if(commentIndex !== -1) {
            line = line.substring(0, commentIndex);
        }

        array[arindex] = line;
    });

    function errorMaker(line,reason) {
        return `Error! Line ${line + 1}: ${reason}`;
    }

    function isCommand(line) {
        return line.charAt(0) === '#';
    };

    var inGameData = false;

    var currentMeasureInfo;
    function nextMeasure() {
        currentMeasureInfo = {
            objects: '',
            events: []
        };
    }
    nextMeasure();

    var timeStart = 0,
    currentScrollSpeed,
    timeSignature,
    timeElapsed,
    barlineEnabled,
    discardCourse,
    pendingObject;

    function courseReset() {
        currentScrollSpeed = 1;
        timeSignature = 1;
        timeElapsed = timeStart;
        barlineEnabled = true;

        discardCourse = false;

        pendingObject = null;
    }


    mainFileCheck: for(var i = 0; i < file.length; i++) {
        var line = file[i];
        //console.log(line);
        if(inGameData) {
            if(line.toLowerCase() === '#end') {
                inGameData = false;
                if(checkAllCourse) {
                    if(!discardCourse) {
                        courseInfoEach.push(unassignedCourseData);
                    }
                    unassignedCourseData = Object.assign({}, unassignedCourseData);
                }

                if(targetCourseFound) {break mainFileCheck}
            } else if(
                (course === targetCourse ||
                !targetCourse) &&
                !discardCourse
            ) {
                if(!checkAllCourse) {
                    targetCourse = course;
                    targetCourseFound = true;
                }
                if(line.charAt(0) === '#') {
                    var lineMatch = line.match(/^#([a-z]+)(?: (.*))?/i),
                    event = lineMatch[1].toLowerCase(),
                    value = lineMatch[2],
                    measureEvent = {
                        time: currentMeasureInfo.objects.length,
                        event: event
                    };

                    switch(event) {
                        case 'measure': //time signature change
                            if(currentMeasureInfo.objects.length !== 0) {continue}
                            var timeSig = value.split('/');
                            if(timeSig.length === 2) {
                                timeSig.forEach((num,which)=>{
                                    if(num.match(/^[0-9]+$/)) {
                                        timeSig[which] = parseInt(num);
                                    } else {
                                        if(checkAllCourse) {
                                            discardCourse = true;
                                        } else {
                                            throw errorMaker(i, 'Measure contains non-numbers... ' + value);
                                        }
                                    }
                                });

                                //console.log(timeSig[0] / timeSig[1]);
                                measureEvent.value = timeSig[0] / timeSig[1];
                            } else {
                                if(checkAllCourse) {
                                    discardCourse = true;
                                } else {
                                    throw errorMaker(i, 'Measure does not have the required amount of values...? ' + value);
                                }
                            }
                            break;

                        case 'bpmchange':
                        case 'delay':
                        case 'scroll':
                            measureEvent.value = parseFloat(value);
                            break;
                        case 'lyric':
                            if(value){value.replace('\\n', '\r\n');}
                            measureEvent.value = value || '';
                            break;

                        case 'gogostart':
                        case 'gogoend':
                        case 'barlineon':
                        case 'barlineoff':
                            break;
                        default:
                            if(checkAllCourse) {
                                discardCourse = true;
                            } else {
                                throw errorMaker(i, `unsupported command "${event}" encountered...`);
                            }
                            break;

                        
                    }

                    currentMeasureInfo.events.push(measureEvent);

                } else if(line.match(/^[0-9abf]*,?$/i)) {
                    line = line.toLowerCase();
                    line.replace(/[9f]/,'0');

                    currentMeasureInfo.objects += line;

                    if(line.charAt(line.length - 1) === ',') {
                        //measure terminted.
                        var cobjs = currentMeasureInfo.objects,
                        events = currentMeasureInfo.events,
                        lastEvent = 0;

                        cobjs = cobjs.substring(0,cobjs.length - 1);
                        //console.log(cobjs);

                        if(cobjs.length === 0) {
                            cobjs = '0';
                        }

                        events.sort((a,b)=>{return a.time - b.time;});
                        events.push({time:NaN});

                        var beatLength = 0,
                        lookAhead = 0,
                        timeElapsedPerNote = 0;

                        function calculateLookAhead() {
                            var vel = (100 * scrollInitMultiplier * currentScrollSpeed * globalScrollMultiplier), 
                            dist = 480;
                            lookAhead = beatLength * (dist / vel);
                        }

                        function calculateBeatLength() {
                            beatLength = (60000 / bpm);
                        }
                        function calculateTimeElapsePerNote() {
                            timeElapsedPerNote = (beatLength * (4 * timeSignature)) / cobjs.length;
                            //console.log(bpm,timeElapsedPerNote);
                        }

                        for(var time = 0; time < cobjs.length; time++) {
                            while(events[lastEvent].time === time) {
                                var curEvent = events[lastEvent];
                                //console.log(curEvent);
                                switch(curEvent.event) {
                                    case 'measure': 
                                        timeSignature = curEvent.value; 
                                        //no need to calculate here, measures do not occur past time=0
                                        //and the functions below are executed anyway when time=0
                                        //calculateTimeElapsePerNote();
                                        //calculateLookAhead();
                                        break;
                                    case 'bpmchange': 
                                        bpm = curEvent.value;
                                        //console.log('bpm change', bpm);
                                        calculateBeatLength();
                                        calculateLookAhead();
                                        calculateTimeElapsePerNote();

                                        //bpmtime
                                        tjaFinal.bpmTimes.push({
                                            beatLength: beatLength,
                                            time: timeElapsed
                                        });
                                        break;
                                    case 'delay': timeElapsed += (curEvent.value * 1000); break;
                                    case 'scroll': 
                                        currentScrollSpeed = curEvent.value; 
                                        calculateLookAhead();
                                        break;
                                    case 'gogostart':
                                    case 'gogoend':
                                        tjaFinal.specialModeToggles.push({
                                            on: (curEvent.event.substr(4) === 'start'),
                                            time: timeElapsed
                                        });
                                        break;
                                    case 'barlineon':
                                    case 'barlineoff':
                                        barlineEnabled = (curEvent.event.substr(7) === 'on');
                                        break;
                                    case 'lyric':
                                        tjaFinal.lyrics.push({
                                            lyric: curEvent.value,
                                            time: timeElapsed
                                        });
                                        break;
                                }
                                lastEvent++;
                            }

                            if(time === 0) {
                                calculateBeatLength();
                                calculateLookAhead();
                                calculateTimeElapsePerNote();

                                if(barlineEnabled) {
                                    tjaFinal.barlines.push({
                                        //note: ,
                                        time: timeElapsed,
                                        lookAhead: lookAhead
                                    });
                                }
                            }

                            var curObj = parseInt(cobjs.charAt(time), 16);
                            if(curObj !== 0) {
                                if(pendingObject) {
                                    switch(curObj) {
                                        case 8: //end of object...
                                            switch(pendingObject.type) {
                                                case 2:
                                                    pendingObject.length = timeElapsed - pendingObject.time;
                                                    break;
                                                case 3:
                                                    pendingObject.length = timeElapsed;
                                                    break;
                                            }
                                            tjaFinal.objects.push(pendingObject);
                                            pendingObject = null;
                                        case 5:
                                        case 6:
                                        case 7:
                                        case 9:
                                            //beginning of another long type note.
                                            //ignore these.
                                            break;
                                        default:
                                            if(checkAllCourse) {
                                                discardCourse = true;
                                            } else {
                                                throw errorMaker(i, `Object of type [${curObj}] in between balloon or drumroll.`);
                                            }
                                            break;
                                    }
                                } else {
                                    //create a new object...
                                    var object = {
                                        type: 1,
                                        big: false,
                                        time: timeElapsed,
                                        length: 0,
                                        lookAhead: lookAhead,
                                        limit: 0,

                                        //note: currentScrollSpeed
                                    };
    
                                    switch(curObj) {
                                        case 3: //don big
                                        case 0xa: //multiplayer don
                                            object.big = true;
                                        case 1: //don
                                            object.type = 0;
                                            break;
                                        case 4: //kat big
                                        case 0xb: //multiplayer kat
                                            object.big = true;
                                        case 2://kat
                                            object.type = 1; 
                                            break;
                                        case 6: //drumroll big
                                            object.big = true;
                                        case 5: //drumroll
                                            object.type = 2;
                                            break;
                                        case 7: //balloon
                                        case 9: //special balloon
                                            object.type = 3;
                                            object.limit = balloons.shift();
                                            break;

                                        case 8: 
                                            if(checkAllCourse) {
                                                discardCourse = true;
                                            } else {
                                                throw errorMaker(i, 'unexpected end of drumroll or balloon marker...');
                                            }
                                            break;
                                    }
    
                                    if([2,3].indexOf(object.type) === -1) {
                                        tjaFinal.objects.push(object);
                                    } else {
                                        pendingObject = object;
                                    }
                                }
                            }
                            timeElapsed += timeElapsedPerNote;
                        }

                        nextMeasure();
                    }
                }
            }
        } else {
            var mdataDefCheck = line.match(/^([^:]+):(.+)$/);
            if(mdataDefCheck) {
                var field = mdataDefCheck[1].toLowerCase(),
                value = mdataDefCheck[2];

                switch(field) {
                    case 'title':
                        tjaFinal.title = value;
                        if(checkAllCourse) {unassignedCourseData.title = value}
                        break;
                    case 'bpm': 
                        bpm = parseFloat(value); 
                        tjaFinal.bpmTimes[0].beatLength = 60000 / bpm;
                        break;
                    case 'offset': 
                        timeStart = parseFloat(value) * -1000; 
                        tjaFinal.bpmTimes[0].time = timeStart;
                        break;
                    case 'wave': 
						tjaFinal.audio = value; 
						if(checkAllCourse) {unassignedCourseData.audio = value}
						break;
                    case 'demostart': 
						value = parseFloat(value) * 1000;
						tjaFinal.previewPoint = value; 
						if(checkAllCourse) {unassignedCourseData.previewPoint = value}
						break;
                    case 'maker': 
                        tjaFinal.creator = value;
                        if(checkAllCourse) {unassignedCourseData.creator = value}
                        break;
                    case 'headscroll': scrollInitMultiplier *= parseFloat(value); break;
                    case 'level': 
                        var lvl = parseInt(value);
                        //console.log(lvl);
                        tjaFinal.difficultyLevel = lvl;
                        if(checkAllCourse) {unassignedCourseData.difficultyLevel = lvl}
                        break;
                    case 'course': 
                        course = value;
                        if(value.match(/^[0-9]$/)) {
                            var predefCourse = [
                                'かんたん / Easy',
                                'ふつう / Normal',
                                'むずかしい / Hard',
                                'おに / Oni',
                                'うら / Edit'
                            ],
                            valueAsNum = parseInt(value);
                            if(valueAsNum in predefCourse) {
                                value = predefCourse[valueAsNum];
                            }
                        }
                        tjaFinal.difficulty = value; 
                        if(checkAllCourse) {
                            unassignedCourseData.difficulty = course;
                            unassignedCourseData.difficultyLabel = value;
                        }
                        break;
                    
                    case 'subtitle': 
                        var adm = 0, clipStart = true;
                        switch(value.substr(0,2)) {
                            case '--': adm = 1; break;
                            case '++': adm = 2; break;
                            default: clipStart = false; break;
                        }
                        tjaFinal.artistDisplayMode = adm;

                        if(clipStart) {value = value.substr(2);}
                        tjaFinal.artist = value;
                        if(checkAllCourse) {unassignedCourseData.artist = value}
                        break;

                    case 'balloon':
                        if(value.charAt(value.length - 1) === ',') {
                            value = value.substring(0, value.length - 1);
                        }
                        balloons = value.split(',');
                        balloons.forEach((n,bi)=>{
                            if(!n.match(/^[0-9]+$/)) {
                                throw errorMaker(i, `"${n}" is an invalid number in the BALLOON definition.`);
                            } else {
                                balloons[bi] = parseInt(n);
                            }
                        });
                        break;
                }
            } else if(line.toLowerCase() === '#start') {
                inGameData = true;
                courseReset();
                if(course === null) {
                    tjaFinal.difficulty = 'Unknown';
                    course = unlabeledCourseCounter.toString();
                    if(checkAllCourse) {
                        unassignedCourseData.difficulty = course;
                        unassignedCourseData.difficultyLabel = tjaFinal.difficulty;
                    }
                    unlabeledCourseCounter++;
                }
            }
        }
    }

    if(checkAllCourse) {
        return courseInfoEach;
    } else {
        return tjaFinal;
    }
}