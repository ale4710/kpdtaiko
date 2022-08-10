for /l %%x in (0,1,14) do (
	magick %%x.png -scale 10%% -scale 1000%% %%x.png
)