function getSettingKey(setNm) {
    return 'setting-' + setNm;
}

function getSettingValue(sn) {
    var sn = localStorage.getItem(getSettingKey(sn));
    if(sn === null) {
        return null;
    } else {
        try {
            return JSON.parse(sn);
        } catch(e) {
            return sn;
        }
    }
}
/* 
if('testingMode' in window) {
    getSettingValue = function(sn) { //overwrite
        return {
            offset: 0,
            ['offset-mode']: 1,
            ['hit-sounds']: 3,
            ['balloon-pop-sound']: 1,
            ['judge-animation-mode']: 1,
            ['show-background']: 1,
            ['background-dim']: 0,
            ['show-lyrics']: 1,
            ['show-notes']: 1,
            ['timer-mode']: 0,
            ['media-play-mode']: 1,
            ['show-file-errors']: 1,
            ['note-rendering-mode']: 0,
            ['metronome']: 0,
            ['canvas-anti-alias-circles']: 1,
            ['show-judge-offset']: 1,
            ['super-wide-hit-windows']: 0,
			['bottom-stage-style']: 1
        }[sn];
    };
}
 */