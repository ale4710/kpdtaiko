# idol

let's go on stage and share our love for taiko to everyone!

created by [ale4710](https://ale4710.neocities.org/)

## dependencies

[color-thief](https://github.com/lokesh/color-thief) - (note: this is loaded from the common space)

## custom idols

the "idol" bottom stage style allows you to add your own custom idols.

to create a custom idol configuration, you need images that will go "on stage," and a configuration file.

### location

place the configuration folders in the following directory:

	.kpdtaiko/custom/bottomstage/idol/

the structure of the directory should be

	.kpdtaiko/
		custom/
			bottomstage/
				idol/
					kurosawa_ruby/
						normal.png
						special.png
						config.json

to use this hypothetical idol, go to settings and navigate to `visual settings > bottom stage > specific stage settings > idol`.

set `idol` to `custom`, and `custom idol path` to `kurosawa_ruby`.

### configuration file

the configuration file is a `json` file. it is an array with objects that describe each idol on stage.

an example of the configuration is below:

``` json
[
	{
		"images": {
			"normal": "normal.png",
			"special": "special.png"
		},
		"animations": {
			"beat": {
				"animation": "bop",
				"mode": null
			},
			"toSpecial": {
				"animation": "spin",
				"mode": null
			},
			"special": {
				"animation": "bop",
				"mode": null
			}
		}
	}
]
```

each array entry is an idol. the idols will be spaced evenly on stage. 

there is no limit to how many idols you can have on stage, but probably the maximum number you can comfortably fit on stage is around three or four.

#### configuration entry explanation

note: i am not good at explaining things. if you have questions, refer to the example above, and ask me if you are very confused (it might take me some time to reply though).

##### `images`
this is an object that defines the images that will be used. each entry contains the paths to the images that will be used, relative to the configuration directory. 

do not use `..` in the paths.

there are two modes that will be displayed, `normal` for normal gameplay, and `special`, which will be displayed during kiai/gogo time.

##### `animations`
this is an object that defines the animations that will be used.

each entry is an event.

`beat` occurs every beat.

`special` is the same as beat, but during kiai/gogo time.

`toSpecial` is the transition from `normal` to `special` mode.

###### `animations` entries
the entries contain these definitions:

`animation` is the animation name. only `bop` and `jump` are available for now.

`mode` is the animation mode. `beat` will change the length of the animation to last the entire beat. null will do default behavior, whatever that is.