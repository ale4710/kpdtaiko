var lsSettingKeys = {
    bgDim: 'quick-setting-background-dim',
    autoplay: 'quick-setting-autoplay'
};

(()=>{ //first run check
    if(localStorage.getItem('firstRun') === null) {
        localStorage.setItem('firstRun', '1');
        localStorage.setItem(lsSettingKeys.bgDim, '0.35');
        localStorage.setItem(lsSettingKeys.autoplay, 'false');
    }
})();