# kpdtaiko
this is a taiko player for KaiOS. It is currently work in progress.

kpdtaiko means "KeyPaD taiko", because it is played on a keypad.

this project was previously known as DOMtaiko. it was called DOMtaiko because, originally, it was only going to use the DOM for graphics.

the name was changed to avoid confusion with another project, and to provide a name that more accurately reflects the project.

[demo on device](https://www.youtube.com/watch?v=OB_leU3yVsg) - shows the application running on an actual device.  
[old demo on device](https://youtu.be/BOYv75n20d8) - same as the above, but it is an older version of the application.  
[old demo on pc](https://youtu.be/IpsZ50q9ujw) - provides a better view of the screen, but it is an older version of the application.

## links
[project website](https://alego.web.fc2.com/kaiosapps/kpdtaiko/)  
on [gitlab](https://gitlab.com/ale4710/kpdtaiko)  
on [github](https://github.com/ale4710/kpdtaiko)

## warning
there will be bugs, because i did not test it a lot.

## controls
i made it like a taiko drum thingy.

the default controls are as follows:

`4` and `6` are don. `1` and `3` are kat.

## setup
place songs in your default media location. the location is

	other/.kpdtaiko/songs/

supported formats are `osu` and `tja`.

each song should be in its own folder. e.g.

	# one song
	other/.kpdtaiko/songs/mani_mani/chart.tja
	other/.kpdtaiko/songs/mani_mani/audio.ogg
	
	# another song
	other/.kpdtaiko/songs/bitter_escape/chart.osu
	other/.kpdtaiko/songs/bitter_escape/audio.ogg

## custom hit sounds
place sounds in

	other/.kpdtaiko/custom/don.ogg
	other/.kpdtaiko/custom/kat.ogg

due to reasons it needs to be ogg.

## playing

### ...on pc
simply start up a web server and navigate to `/main-app/`.

playing on pc is really only meant for debugging, so loading up songs will be a pain.

ensure that the testing script is enabled in `/common/js/scripts2.js`:

	//test script
	bg+user+'test',

then, on the root of the web server, make a folder called `debugsongs`.

in that folder should be a file called `songlist.json`, and the songs you wish to play.

`songlist.json` should contain a json array with the paths to the chart files themselves, relative to `/debugsongs/`.

for example, consider the following directory structure.

	debugsongs/
		manimani/
			chart.tja
			audio.ogg
		bitter_escape/
			chart.osu
			audio.mp3
		songlist.json

the `songlist.json` file would contain the following:

	[
		"manimani/chart.tja",
		"bitter_escape/chart.osu"
	]

### ...on a real device
install this like you would any other application.

please make sure that the `test` script is disabled.

in `/common/js/scripts2.js`, look for the following line...

	//test script
	bg+user+'test',

...and make sure that the `bg+user+'test'` line is commented out or deleted.

see the "setup" section above for more details.
