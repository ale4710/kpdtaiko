# DOMtaiko
this is a taiko player for KaiOS. It is currently work in progress.

it's called DOMtaiko because, originally, it was only going to use the DOM for graphics. however i quickly switched to other methods to try to improve performance on actual devices.

[demo on device](https://youtu.be/BOYv75n20d8) - shows the application running on an actual device.  
[demo on pc](https://youtu.be/IpsZ50q9ujw) - provides a better view of the screen.

## links
on [gitlab](https://gitlab.com/ale4710/domtaiko)  
on [github](https://github.com/ale4710/domtaiko)

## warning
there will be bugs, because i did not test it a lot.

## controls
i made it like a taiko drum thingy.

the default controls are as follows:

`4` and `6` are don. `1` and `3` are kat.

## setup
place songs in your default media location. the location is

	.domtaiko/songs/

supported formats are `osu` and `tja`.

each song should be in its own folder. e.g.

	# one song
	.domtaiko/songs/mani_mani/chart.tja
	.domtaiko/songs/mani_mani/audio.ogg
	
	# another song
	.domtaiko/songs/bitter_eacape/chart.osu
	.domtaiko/songs/bitter_escape/audio.ogg

## custom hit sounds
place sounds in

	.domtaiko/custom/don.ogg
	.domtaiko/custom/kat.ogg

due to reasons it needs to be ogg.