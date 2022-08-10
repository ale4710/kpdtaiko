/* {
    type: 0, 
    //type of note.
    //0 don
    //1 kat
    //2 drumroll
    //3 ballon

    big: false, //if is big...

    time: 0 //time is in ms, three points. 1.234 -> 1234,

    length: 0 //optional parameter. for drumrolls and ballons.
    //if it's a drumroll this is actually length.
    //if it's a ballon then this is the end time.
} */
var parseOsuFile = (function(){
    var bracket = (s)=>{return `[${s}]`;},
    commaSplit = (s)=>{return s.split(',');},
    colonSplit = (s)=>{
        var sm = s.match(/^([^:]+): ?(.*)/);
        sm.shift();
        return sm;
    },

    typeGate = parseInt('1011',2),
    hitsoundColorGate = parseInt('1010',2),
    hitsoundBigGate = parseInt('100',2);

    function getHitObjectType(type,hitsounds) {
        var r = {
            type: null,
            big: ((hitsounds & hitsoundBigGate) !== 0)
        };

        //console.log(hitsounds.toString(2), (hitsounds & hitsoundColorGate));
        //debugger;

        switch(type & typeGate) {
            case 1:
                r.type = (1 * ((hitsounds & hitsoundColorGate) > 0));
                break;
            case (1<<1): //slider (drumroll)
                r.type = 2;
                break;
            case (1<<3): //spinner (balloon)
                r.type = 3;
                break;
        }

        return r;
    }

    return function(fl, options) {
        fl = fl.split(/\r?\n/g);
		
		sigCheck: {
			if(0 in fl) {
				if(fl[0].match(/^osu file format v[0-9]{1,2}$/)) {
					break sigCheck;
				}
			}
			
			throw 'not osu file';
		}
		
        var curGameObject = {
            title: null,
            artist: null,
            creator: null,
            difficulty: null,
            difficultyLevel: null,
            objects: [],
            image: null,
            audio: null,
			mediaSource: null,
            previewPoint: 0,
            specialModeToggles: [],
            bpmTimes: [],
            barlines: [],
   
            osuSetId: null,
            rawTimingPoints: []
        },
        parse = false,
        timingPoints = [
            /* 
            {
                time: [ms],
                beatLength: [ms],
                meter: [number],
                inherit: [bool],
                specialMode: [bool]
            }
            */
        ],
        diffSettings = {},

        globalScrollMultiplier = 1
        ;

        if(typeof(options) === 'object') {
            if('scrollMultiplier' in options) {
                globalScrollMultiplier = options.scrollMultiplier;
            }
        }
    
        curGameObject.rawTimingPoints = timingPoints;
    
        veryMainLoop: for(var i = 0; i < fl.length; i++) {
            switch(removeWhiteSpace(fl[i])) {
                case bracket('Editor'):
                case bracket('Colours'):
                    parse = false;
                    break;
                case bracket('General'): parse = 'gn'; continue veryMainLoop;
                case bracket('Metadata'): parse = 'md'; continue veryMainLoop;
                case bracket('Difficulty'): parse = 'df'; continue veryMainLoop;
                case bracket('Events'): parse = 'ev'; continue veryMainLoop;
                case bracket('HitObjects'): parse = 'ho'; continue veryMainLoop;
                case bracket('TimingPoints'): parse = 'tp'; continue veryMainLoop;
                default: 
                    if(!parse) {
                        continue veryMainLoop;
                    }
                    break;
    
            }
            if(removeWhiteSpace(fl[i]).length === 0) {continue}
    
            var v = fl[i];
            switch(parse) {
                case 'df':
                    v = colonSplit(v);
                    diffSettings[v[0]] = parseFloat(v[1]); //everything in difficult is a number.
                    break;
                case 'md':
                    v = colonSplit(v);
                    switch(v[0]) {
                        case 'Title': if(!curGameObject.title) {curGameObject.title = v[1];} break;
                        case 'Artist': if(!curGameObject.artist) {curGameObject.artist = v[1];} break;
                        case 'TitleUnicode': curGameObject.title = v[1]; break;
                        case 'ArtistUnicode': curGameObject.artist = v[1]; break;
                        case 'Creator': curGameObject.creator = v[1]; break;
                        case 'Version': curGameObject.difficulty = v[1]; break;
                        case 'BeatmapSetID': curGameObject.osuSetId = v[1]; break;
						case 'Source': curGameObject.mediaSource = v[1]; break;
                    }
                    break;
                case 'gn':
                    v = colonSplit(v);
                    switch(v[0]) {
                        case 'PreviewTime': curGameObject.previewPoint = parseInt(v[1]); break;
                        case 'AudioFilename': curGameObject.audio = v[1]; break;
                        case 'Mode': 
                            //console.log(v[1]);
                            if(v[1] !== '1') {
                                throw 'not taiko';
                            }
                            break;
                    }
                    break;
                case 'tp':
                    v = commaSplit(v);
                    //Timing point syntax: time,beatLength,meter,sampleSet,sampleIndex,volume,uninherited,effects
                    timingPoints.push({
                        time: parseInt(v[0]),
                        beatLength: parseFloat(v[1]),
                        meter: parseInt(v[2]),
                        inherit: v[6] === '0',
                        ignoreFirstBarline: checkBit(parseInt(v[7]), 3) === 1,
                        specialMode: checkBit(parseInt(v[7]), 0) === 1
                    });
                    break;
                case 'ev':
                    //we are only here to get the background image.
                    if(!curGameObject.image) {
                        var bgMatch = v.match(/^0,0,"([^/"]+)"(?:,\-?[0-9]+,\-?[0-9]+)?$/);
                        if(bgMatch) {
                            curGameObject.image = bgMatch[1];
                        }
                    }
                    break;
                case 'ho':
                    var length = null,
                    hitObjectMatch = v.match(/^([0-9]{1,3}),([0-9]{1,3}),([0-9]+(?:\.[0-9]+)?),([0-9]{1,3}),([0-9]{1,2})(?:,(.*))?$/i);
                    /* 
                        hitObjectMatch!
                        [
                            0: whole match
                            1: x pos
                            2: y pos
                            3: time
                            4: type
                            5: hitsound
                            6: everything else. it will be parsed when type is determined.
                        ]
                    */
    
                    //check type...
                    //types are defined above.
                    hom: if(hitObjectMatch) {
                        var ti = getHitObjectType(
                            parseInt(hitObjectMatch[4]),
                            parseInt(hitObjectMatch[5])
                        );

                        switch(ti.type) {
                            case 2: //drumroll
                                var sliderMatch = hitObjectMatch[6].match(/^([bclp]\|[0-9]{1,3}:[0-9]{1,3}(?:(?:\|[0-9]{1,3}:[0-9]{1,3})+)?),([0-9]+),([0-9]+(?:\.[0-9]+)?)(?:,(.*))?/i);
                                /* 
                                    slider match!!!
                                    0: whole match
                                    1: curvepoints (no details available, because its not important here)
                                    2: # of slides
                                    3: length (in osu pixels.......)
                                    4: everything else
                                */
                                if(sliderMatch) {
                                    length = {
                                        length: parseFloat(sliderMatch[3]),
                                        repeat: parseInt(sliderMatch[2])
                                    };
                                } else {
                                    console.warn(`line ${i+1}: slider couldnt be matched.`);
                                    break hom;
                                }
                                break;
                            case 3:
                                var spinnerMatch = hitObjectMatch[6].match(/^([0-9]+),(?:,.*)?/i);
                                /* 
                                    spinner match!!!
                                    0: whole
                                    1: endtime
                                    2: everything else
                                */
                                if(spinnerMatch) {
                                    length = parseInt(spinnerMatch[1]);
                                } else {
                                    console.warn(`line ${i+1}: spinner couldnt be matched.`);
                                    break hom;
                                }
                                break;
                            case null:
                                console.warn(`line ${i+1}: an unknown object was encountered (internal error).`);
                                break;
                        }

                        curGameObject.objects.push({
                            type: ti.type,
                            big: ti.big,
                            time: parseInt(hitObjectMatch[3]),
                            length: length,
                            lookAhead: null,
                            limit: null
                        });
                    } else {
                        console.warn(`line ${i+1}: hit object couldnt be matched.`);
                    }
                    break;
            }
    
        } //close verymainloop

        //console.log(diffSettings);
    
        curGameObject.objects.sort((a,b) => {return a.time - b.time;});
        timingPoints.sort((a,b) => {
            if(a.time === b.time) {
                if(a.inherit) {
                    return 1;
                } else if(b.inherit) {
                    return -1;
                }
            }
            return a.time - b.time;
        });
    
        var litp = 0,
        barlinePrintLeftoff = 0,
        barlineIgnoreFirst = true;
        for(var i = 0; i < timingPoints.length; i++) {
            var ctp = timingPoints[i],
            itp = timingPoints[litp],
            itpChanged = false;
    
            //track speed
            var bl = 0,
            ml = 1;
            
            if(ctp.inherit) {
                //lookahead calc
                //ml = (1 / (-100 / ctp.beatLength));
                ml = -1 / (ctp.beatLength / 100);
                ctp.beatLength = ml;
                bl = itp.beatLength;
            } else {
                //lookahead calc
                bl = ctp.beatLength;

                //timing point management
                litp = i;
                itp = timingPoints[litp];
                itpChanged = true;
            }
    
            //480 is the full width of the osu playfield.
            //the taiko playfield, that is.
            //ctp.lookAhead = bl * (480 / (100 * (diffSettings.SliderMultiplier / ml)));

            var velocity = (100 * diffSettings.SliderMultiplier * ml * globalScrollMultiplier),
            distance = 480;
            ctp.lookAhead = (distance / velocity) * bl;
			//ctp.lookAhead = 800;

    
            //bar lines
            var time = barlinePrintLeftoff,
            first = true,
            proceedBarlinePrinting = true,
            blpEnd;

            if(itpChanged) {time = itp.time;}

            if((i + 1) in timingPoints) {
                var ntp = timingPoints[i + 1];
                if(ntp.time === ctp.time) {
                    proceedBarlinePrinting = false;
                } else {
                    blpEnd = ntp.time;
                }
            } else {
                blpEnd = curGameObject.objects[curGameObject.objects.length - 1].time;
            }

            barlineIgnoreFirst = ctp.ignoreFirstBarline;

            if(proceedBarlinePrinting) {
                //console.log('holding off barline printing until the next loop.');
                while(time < blpEnd) {
                    printTheBarline: {
                        if(first) {
                            first = false;
                            if(barlineIgnoreFirst) {
                                barlineIgnoreFirst = false;
                                break printTheBarline;
                            }
                        }
        
                        curGameObject.barlines.push({
                            //note: ml.toFixed(3),
                            time: time,
                            lookAhead: ctp.lookAhead
                        });
                    }
                    time += (itp.beatLength * itp.meter);
                }
            }
            barlinePrintLeftoff = time;
        }
    
        var tpc = 0, //timing point current
        litp = 0 //last independent timing point (yeah it is confusing...)
        ;
    
        for(var i = 0; i < curGameObject.objects.length; i++) {
            var cobj = curGameObject.objects[i];
            
            while(timingPoints[tpc].time <= cobj.time) {
                if(!timingPoints[tpc].inherit) {
                    litp = tpc;
                    //console.log('passed an independent timing point');
                }
                if(!(tpc + 1 in timingPoints)) {break;}
                tpc++;
                if(timingPoints[tpc].time > cobj.time) {
                    tpc--;
                    break;
                }
            }
            
            var ctp = timingPoints[tpc],
            itp = timingPoints[litp];
            
            //cobj.note = ctp.beatLength.toFixed(2);

            switch(cobj.type) {
                case 2: //drumroll
                    //get the actual length...
                    var ml = 1;

                    if(ctp.inherit) {
                        ml = ctp.beatLength;
                    }

                    //console.log(ctp);

                    var lendata = cobj.length;
                    //cobj.length = lendata.repeat * (lendata.length / (diffSettings.SliderMultiplier * 100 * ml) * itp.beatLength);
                    //cobj.length = lendata.repeat * (itp.beatLength * (lendata.length / diffSettings.SliderMultiplier) / 100);
                    //cobj.length = (lendata.length * lendata.repeat) / (diffSettings.SliderMultiplier * ml );
                    //cobj.length = ((lendata.length * lendata.repeat) / (diffSettings.SliderMultiplier * 100 * ml));

                    var distance = (lendata.length * lendata.repeat),
                    velocity = (diffSettings.SliderMultiplier * 100 * ml);

                    cobj.length = (distance / velocity) * itp.beatLength;

                    //console.log(cobj.length, ctp, cobj.time);
                    //cobj.note = ml.toFixed(3);
                    break;
                case 3: //balloon
                    cobj.limit = Math.floor(
                        Math.max(2,
                            (
                                (cobj.length - cobj.time) / 
                                itp.beatLength
                            ) * diffSettings.SliderTickRate * 2/*  * timingPoints[litp].meter */
                        )
                    )
                    break;
            }
    
            curGameObject.objects[i].lookAhead = timingPoints[tpc].lookAhead;
        }
    
        var ke = false;
        timingPoints.forEach((e,i) => {
            if(e.specialMode !== ke || i === 0) {
                ke = e.specialMode;
                curGameObject.specialModeToggles.push({
                    on: e.specialMode,
                    time: e.time
                });
            }
    
            if(!e.inherit) {
                curGameObject.bpmTimes.push({
                    beatLength: e.beatLength,
                    time: e.time
                });
            }
        })
    
        //console.log(timingPoints);
    
        return curGameObject;
    }
})();
