function updateSetting(setNm,newVal,noParse) {
    if(setNm in settingsList) {
        if(!noParse && typeof(newVal) !== 'string') {newVal = JSON.stringify(newVal);}
        localStorage.setItem(getSettingKey(setNm), newVal);

        console.log('The setting', setNm, 'has been updated to', newVal);
    }
}