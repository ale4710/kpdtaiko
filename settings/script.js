var
currentSetting = {index: 0, name: ''},
currentCategory = 'default',
settingNavigationHistory = [],
curpage = 0;

window.addEventListener('DOMContentLoaded',()=>{
    if(location.hash === '#bootup') {
        console.log('app has been started.');
        sessionStorage.setItem('apprunning',true);
        initSettings(0,true);

        setTimeout(()=>{
            location = '/songscan/index.html';
        }, 10);
        } else {
            disableControls = false;
            eid('main').classList.remove('hidden');
            initSettings(0);
            updateHeader();
            updatenavbar();
    }
});

function initSettings(focusIndex, updateAll) {
    eid('settings-list').innerHTML = '';
    var st = updateAll? Object.keys(settingsList) : settingsListCategories[currentCategory].settings,
    addedElements = 0;

    for(var i = 0; i < st.length; i++) {
        var csn = st[i],
        cs = settingsList[csn],
        novalue = (
			getSettingValue(csn) === null && 
			[4,5].indexOf(cs.type) === -1
		);

        if(novalue) {updateSetting(csn, cs.default, true);}
        
        if(updateAll) {continue}

        var op = [
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div')
        ];

        //layer 01
        op[0].classList.add('setting', 'focusable-item');
        op[0].dataset.setting = csn;
        op[0].tabIndex = addedElements;

        //layer 02
        op[1].classList.add('vertical-center');

        //layer 03
        //setting name
        op[2].classList.add('setting-name');
        op[2].textContent = getSettingLabel(csn);

        //setting value
        op[3].classList.add('setting-value');
        op[3].textContent = getFormattedSettingValue(csn);
        /* 
        <0>
            <1>
                <2>name</2>
                <3>value</3>
            </1>
        </0>
        */
        op[1].appendChild(op[2]);
        op[1].appendChild(op[3]);
        op[0].appendChild(op[1]);
        eid('settings-list').appendChild(op[0]);
        addedElements++;
    }

    if(!updateAll) {
        eid('settings-list').children[focusIndex].focus();
        eid('settings-list').children[focusIndex].scrollIntoView(false);
        currentSetting.name = actEl().dataset.setting;
        currentSetting.index = focusIndex;
    }
}

function updateActiveSettingDisplay() {
    ecls('setting')[currentSetting.index].getElementsByClassName('setting-value')[0].textContent = getFormattedSettingValue(currentSetting.name);
}

function getFormattedSettingValue(setNm) {
    if(setNm in settingsList) {
        var cs = settingsList[setNm],
        csv = getSettingValue(setNm);

        switch(cs.type) {
            case 0: 
                return getSettingValueLabel(setNm, csv);
            case 1:
                if(csv.length === 0) {
                    return 'None';
                } else {
                    for(var i = 0; i < csv.length; i++) {
                        csv[i] = getSettingValueLabel(setNm, csv[i]);
                    }
                    return csv.join(', ');
                }
            case 2:
            case 3:
                return csv;
        }
    }
}

var settingChangeDialog = new OptionsMenuSelectable('', 'text');
function showSettingChangeDialog() {
    curpage = 1;
    //allowBack = false;

    settingChangeDialog.updateHeader(getSettingLabel(currentSetting.name));

    var cs = settingsList[currentSetting.name],
    cv = getSettingValue(currentSetting.name);

    settingChangeDialog.changeType([
        'radio',
        'checkbox',
        'tel',
        'text'
    ][cs.type]);

    if(cs.type < 2) {
        for(var i = 0; i < cs.values.length; i++) {
            var checked = false;
            switch(cs.type) {
                case 0: //radio
                    if(i === cv) {checked = true;}
                    break;
                case 1: //checkbox
                    if(cv.indexOf(i) !== -1) {checked = true;}
                    break;
            }
            settingChangeDialog.addOption(
                getSettingValueLabel(currentSetting.name, i),
                checked
            );
        }
    } else {
        settingChangeDialog.setValue(cv);
    }

    settingChangeDialog.menuViewToggle(true, 2);
}

function hideSettingChangeDialog() {
    curpage = 0;
    ecls('setting')[currentSetting.index].focus();
    settingChangeDialog.menuViewToggle(false);
    //allowBack = settingNavigationHistory.length === 0;
}

manageSettingsPageHistory = {
    append: (category, index) => {
        settingNavigationHistory.push({
            category: category,
            index: index
        });

        //allowBack = false;
    },

    back: () => {
        var li = settingNavigationHistory.pop();
        if(li) {
            currentCategory = li.category;
            updateHeader();
            initSettings(li.index);
        } else {
            location = '/songselect/index.html';
        }
    }
}

function getSettingLabel(sn) {return settingsList[sn].label;}
function getSettingValueLabel(sn,i) {return settingsList[sn].values[i]}

function updateHeader() {eid('header').textContent = getSettingLabel('category-' + currentCategory);}

function localupdatenavbar() {
    switch(curpage) {
        case 0:
            outputNavbar(
                'back',
                'select'
            );
            break;
        case 1:
            outputNavbar(
                'done',
                settingsList[currentSetting.name].type < 2? 'select' : 'save'
            );
            break;
    }
}

function navigateSettings(dir) {
    currentSetting.index = navigatelist(
        actEl().tabIndex,
        ecls('setting'),
        dir
    );
    scrolliv(actEl(), dir === 1);
    currentSetting.name = actEl().dataset.setting;
    currentSetting.index = actEl().tabIndex;
}

function keyHandler(k) {
    switch(curpage) {
        case 0: mainScreenK(k); break;
        case 1: settingChangeK(k); break;
    }
}

function mainScreenK(k) {
    switch(k.key) {
        case 'ArrowUp':
            var u = -1;
        case 'ArrowDown': 
            navigateSettings(u || 1); 
            k.preventDefault();
            break;
        case 'Enter': 
            var cs = settingsList[currentSetting.name];
            switch(cs.type) {
                case 4: cs.action(); break;
                case 5:
                    manageSettingsPageHistory.append(
                        currentCategory,
                        currentSetting.index
                    );
                    currentCategory = cs.action;
                    updateHeader();
                    initSettings(0);
                    break;
                default: showSettingChangeDialog(); break;
            }
            break;
        case 'SoftLeft':
        case 'Backspace':
            manageSettingsPageHistory.back();
            break;
    }
}

function settingChangeK(k) {
    switch(k.key) {
        case 'ArrowUp': 
            var u = -1;
        case 'ArrowDown': 
            settingChangeDialog.navigate(u || 1);
            k.preventDefault();
            break;
        case 'SoftLeft':
            hideSettingChangeDialog();
            break;
        case 'Enter': 
            switch(settingsList[currentSetting.name].type) {
                case 0: //radio
                    updateSetting(currentSetting.name, actEl().tabIndex);
                    hideSettingChangeDialog();
                    break;
                case 1: //checkbox
                    settingChangeDialog.selectItem(actEl().tabIndex);
                    updateSetting(
                        currentSetting.name, 
                        settingChangeDialog.getValue().value
                    );
                    break;
                case 2:
                case 3:
                    if(actEl().value === '') {
                        alertMessage('Please enter a value.', 5000, 3);
                        break;
                    }
                    if('check' in settingsList[currentSetting.name]) {
                        if(!settingsList[currentSetting.name].check(actEl().value)) {
                            alertMessage('Invalid input. Please double check what you typed.', 5000, 3);
                            break;
                        }
                    }
                    updateSetting(
                        currentSetting.name,

                        //both of the below work fine
                        settingChangeDialog.getValue().value
                        //actEl().value
                    );
                    hideSettingChangeDialog();
                    break;
            }

            if('action' in settingsList[currentSetting.name]) {
                settingsList[currentSetting.name].action();
            }

            updateActiveSettingDisplay();

            break;

        case 'Backspace': 
            hideSettingChangeDialog();
            if(settingsList[currentSetting.name].type > 1) {
                alertMessage('Changes discarded.',5000,0);
            }
            break;

    }
}