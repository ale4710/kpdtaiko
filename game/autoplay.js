var autoplayEnabled = modsList.mods.auto.check(),
autoplayLastBalloon = -Infinity;

function autoplay(){
    if(autoplayEnabled && !timerPaused) {
        var currentObj = gameFile.objects[latestObject];
        if(currentObj) {
            if(currentObj.time /* + hitWindow.good */ <= curTime()) {
                switch(currentObj.type) {
                    case 0:/* don */playerAction(gameActionId.don);break;
                    case 1:/* kat */playerAction(gameActionId.kat);break;
                    case 2://drumroll
                    case 3://balloon
                        var now = performance.now();
                        if(autoplayLastBalloon + 60 < now) {
                            autoplayLastBalloon = now;
                            playerAction(Math.floor(Math.random() * 2));
                        }
                        break;
                }
            }
        }
    }
}

/* function updateAutoplayIndicator() {
    eid('indicator-autoplay').classList.toggle('hidden', !autoplayEnabled);
}

updateAutoplayIndicator(); */