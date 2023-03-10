var 
settingsList = {
    /* 
    'setting-name': {
        'label': string,
        //is just the label. it is different from setting-name.

        'values': ['setting value 1', 'setting value 2', 'etc'],
        //values is what will be displayed, when type is not [ 4 ], [ 2 ], or [ 3 ].

        'type': number,
        //type of setting.
        // 0 = select 1 setting only (radio)
        // 1 = select multiple (checkbox)
        // 2 = number input
        // 3 = text input
        // 4 = excecute function
        // 5 = go to settings page

        'action': () => {} or string,
        //when type is [ 4 ] it will excecute the function. should be function.
        //when type is [ 5 ] it will go to that setting category. should be string.
        //any other type, it will excecute the function after it changes the setting.

        'default': number or string,
        //default setting

        'check': function,
        //used for text input, to check for valid input.

        'help': string,
        //used for the "help" action. shows what the setting will do, or something.
    }
    */

    'offset-mode': { //timeOffset
        label: 'Offset Mode',
        type: 0,
        values: [
            'Earlier (-)',
            'Later (+)'
        ],
        default: 1
    },

    'offset': { //timeOffset
        label: 'Offset (ms)',
        type: 2,
        default: 0
    },

    'show-judge-offset':{
        label: 'Show Delays',
        type: 0,
        values: [
            'Hide',
            'Show'
        ],
        default: 0
    },

    'hit-sounds': {
        label: 'Hit Sounds',
        type: 0,
        values: [
            'None',
            'Taiko-ish',
            'Wood Blocks',
            'Snare Drum',
            'Custom'
        ],
        default: 1
    },

    'metronome': {
        label: 'Metronome',
        type: 0,
        values: [
            'Off',
            'On'
        ],
        default: 0
    },

    'balloon-pop-sound': {
        label: 'Balloon Pop Sound',
        type: 0,
        values: [
            'Disabled',
            'Enabled'
        ],
        default: 1
    },

    'judge-animation-mode': { //judgeAnimationMode
        label: 'Judge Animation Mode',
        type: 0,
        values: [
            'Disabled',
            'Simple',
            'Full'
        ],
        default: 1
    },

    'show-background': {
        label: 'Show Background',
        type: 0,
        values: [
            'Hide',
            'Show'
        ],
        default: 1
    },

    'background-dim': {
        label: 'Background Dim (%)',
        type: 2,
        default: 0,
        check: (n)=>{
            return (
                !isNaN(parseInt(n)) &&
                (n >= 0) &&
                (n <= 100)
            );
        }
    },

    'show-lyrics': { //show-lyrics
        label: 'Show Lyrics',
        type: 0,
        values: [
            'Hide',
            'Show'
        ],
        default: 1
    },

    'show-notes': { //drawingEnabled
        label: 'Show Notes',
        type: 0,
        values: [
            'Hide',
            'Show'
        ],
        default: 1
    },
	
	'show-difficulty-on-intro': {
        label: 'Show Difficulty On Intro',
        type: 0,
        values: [
            'Hide',
            'Show'
        ],
        default: 1
    },
	
	'animate-song-select': {
        label: 'Smooth Scroll List',
        type: 0,
        values: [
            'Disabled',
            'Enabled'
        ],
        default: 1
    },

    'timer-mode': { //timerMode
        label: 'Timer Mode',
        type: 0,
        values: [
            'Linked To Audio',
            'Independent'
        ],
        default: 0
    },

    'note-rendering-mode': {
        label: 'Note Render Mode',
        type: 0,
        values: [
            'WebGL x PixiJS',
            'Canvas',
            'DOM'
        ],
        default: 0
    },

    'canvas-anti-alias-circles': {
        label: 'Anti-Aliased Circles',
        type: 0,
        values: [
            'False',
            'True'
        ],
        default: 1
    },

    'media-play-mode': { //mediaPlayMode
        label: 'Media Play Mode',
        type: 0,
        values: [
            'HTML Audio',
            'AudioContext'
        ],
        default: 1
    },
    
    'draw-loop-method': {
		label: 'Draw Loop Method',
		type: 0,
		values: [
			'requestAnimationFrame',
			'setTimeout'
		],
		default: 0
	},

    'show-file-errors': {
        label: 'Show File Errors',
        type: 0,
        values: [
            'Hide',
            'Show'
        ],
        default: 0
    },
	
	'bottom-stage-style': {
        label: 'Bottom Stage Style',
        type: 0,
        values: [
            'Simple',
            'Failed Idol',
			'Livestream',
        ],
        default: 0
    },
	
	'song-list-animate-random': {
        label: 'Play Randomize Animation',
        type: 0,
        values: [
            'Do Not Play',
            'Play'
        ],
        default: 1
    },
	
	'hit-windows': {
		label: 'Hit Window Size',
		type: 0,
		values: [
			'Custom',
			'Wide',
			'Normal',
			'Tight'
		],
		default: 2
	},
	
	'custom-hit-window-good': {
        label: 'Good Hit Window (ms)',
        type: 2,
        default: 35
    },
	
	'custom-hit-window-okay': {
        label: 'Okay Hit Window (ms)',
        type: 2,
        default: 80
    },
	
	'custom-hit-window-miss': {
        label: 'Miss Hit Window (ms)',
        type: 2,
        default: 95
    },
	
	'game-risky': {
        label: 'Risky',
        type: 2,
        default: 0
    },
	
	//actions and such
	'goto-controls-changer': {
		label: 'Input Settings',
		action: (function(){gotoControlsChanger()}),
		type: 4
	},
	
	'rescan-library': {
		label: 'Rescan Library',
		action: (function(){
			location = '/songscan/index.html';
			disableControls = true;
		}),
		type: 4
	},

    'category-default': {
        action: 'default',
        label: 'Settings',
        type: 5
    },
	'category-offset': {
        action: 'offset',
        label: 'Offset Settings',
        type: 5
    },
	'category-sounds': {
        action: 'sounds',
        label: 'Sound Settings',
        type: 5
    },
	'category-visual': {
        action: 'visual',
        label: 'Visual Settings',
        type: 5
    },
	'category-song-select': {
        action: 'song-select',
        label: 'Song Select Settings',
        type: 5
    },
	'category-bottom-stage': {
        action: 'bottom-stage',
        label: 'Bottom Stage',
        type: 5
    },
	'category-game': {
        action: 'game',
        label: 'Game Settings',
        type: 5
    },
	'category-hit-windows': {
        action: 'hit-windows',
        label: 'Hit Windows',
        type: 5
    },
	'category-advanced': {
        action: 'advanced',
        label: 'Advanced Settings',
        type: 5
    }
},

settingsListCategories = {

    //label is the label of the category.
    //settings is an array with the names from above. they will be displayed in this order.

    'default': {
        label: 'Settings',
        settings: [
			'category-offset',
			'category-game',
			'goto-controls-changer',
			'category-song-select',
			'category-visual',
			'category-sounds',
			'category-advanced'
        ]
    },
	
	'offset': {
		label: 'Offset',
		settings: [
            'offset-mode',
            'offset'
		]
	},
	
	'sounds': {
		label: 'Sound Settings',
		settings: [
			'metronome',
            'hit-sounds',
            'balloon-pop-sound'
		]
	},
	
	'visual': {
		label: 'Visual Settings',
		settings: [
			'category-bottom-stage',
            'show-judge-offset',
			'judge-animation-mode',
            'show-notes'
		]
	},
	
	'bottom-stage': {
		label: 'Bottom Stage',
		settings: [
			'bottom-stage-style',
			'background-dim',
			'show-background',
			'show-lyrics'
		]
	},
	
	'game': {
		label: 'Game Settings',
		settings: [
			'category-hit-windows',
			'game-risky'
		]
	},
	
	'song-select': {
		label: "Song Select",
		settings: [
			'animate-song-select',
			'show-difficulty-on-intro',
			'song-list-animate-random',
			'rescan-library'
		]
	},
	
	'hit-windows': {
		label: 'Hit Windows',
		settings: [
			'hit-windows',
			'custom-hit-window-good',
			'custom-hit-window-okay',
			'custom-hit-window-miss'
		]
	},
	
	'advanced': {
        label: 'Advanced Settings',
		settings: [
            'timer-mode',
            'draw-loop-method',
            'note-rendering-mode',
            'canvas-anti-alias-circles',
            'media-play-mode',
            'show-file-errors'
		]
	},
};
