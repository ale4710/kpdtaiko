# DOMtaiko
this is a taiko player for KaiOS. It is currently work in progress.

## warning
there will be bugs, because i did not test it a lot.

## controls
i made like a taiko drum thingy.

`4` and `6` are don. `1` and `3` are kat.

at the moment you can not change them without changing the code.

## setup
place songs in your default media location. the location is

	.domtaiko/songs/

supported formats are `osu` and `tja`.

each song should be in it's own folder. e.g.

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