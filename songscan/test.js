function beginScanTest(detectedFn){
	var sl = [
		'600538 paraoka feat haru nya - Manimani/paraoka feat. harunya - Manimani (Stefan) [Oni].osu',
		'600538 paraoka feat haru nya - Manimani/paraoka feat. harunya - Manimani (Stefan) [Taikovic].osu',
		
		'770379 paraoka feat haru nya - monolithize phases/paraoka feat. harunya - monolithize phases (Stefan) [amalgam].osu',
		
		'1260473 Hanasaka Yui (CV MAO) - Shunkashuutou Egao Biyori (Cut Ver)/Hanasaka Yui (CV M.A.O) - ShunkashuutouEgao Biyori (Cut Ver.) (yuki_momoiro722) [Futsuu].osu',
		'1260473 Hanasaka Yui (CV MAO) - Shunkashuutou Egao Biyori (Cut Ver)/Hanasaka Yui (CV M.A.O) - ShunkashuutouEgao Biyori (Cut Ver.) (yuki_momoiro722) [Inner Oni].osu',
		'1260473 Hanasaka Yui (CV MAO) - Shunkashuutou Egao Biyori (Cut Ver)/Hanasaka Yui (CV M.A.O) - ShunkashuutouEgao Biyori (Cut Ver.) (yuki_momoiro722) [Muzukashii].osu',
		'1260473 Hanasaka Yui (CV MAO) - Shunkashuutou Egao Biyori (Cut Ver)/Hanasaka Yui (CV M.A.O) - ShunkashuutouEgao Biyori (Cut Ver.) (yuki_momoiro722) [Oni].osu',
		
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [Axer\'s Inner Oni].osu',
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [Fuutsu].osu',
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [HiroK\'s Ura Oni].osu',
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [Kantan].osu',
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [Muzukashii].osu',
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [Oni].osu',
		'958909 Feryquitous feat Sennzai - Koe/Feryquitous feat. Sennzai - Koe (Skull Kid) [Rhuzerv].osu',
		
		'1321420 Hoshimi Juuna (CV Satou Hinata), Daiba Nana (CV Koizumi Moeka) - Fly Me to/Hoshimi Juuna (CV Satou Hinata), Daiba Nana (CV Koizumi Moeka) - Fly Me to the Star (TV Size) (Senko-san) [Futsuu].osu',
		'1321420 Hoshimi Juuna (CV Satou Hinata), Daiba Nana (CV Koizumi Moeka) - Fly Me to/Hoshimi Juuna (CV Satou Hinata), Daiba Nana (CV Koizumi Moeka) - Fly Me to the Star (TV Size) (Senko-san) [Muzukashii].osu',
		'1321420 Hoshimi Juuna (CV Satou Hinata), Daiba Nana (CV Koizumi Moeka) - Fly Me to/Hoshimi Juuna (CV Satou Hinata), Daiba Nana (CV Koizumi Moeka) - Fly Me to the Star (TV Size) (Senko-san) [Starlight].osu',
		
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [Futsuu].osu',
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [Muzukashii].osu',
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [Kantan].osu',
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [Oni].osu',
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [Inner Oni].osu',
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [KTYN\'s Agitation].osu',
		'1606746 Rahatt - Matusa Bomber/Rahatt - Matusa Bomber (Quorum) [tasuke\'s Upheaval].osu',
		
		'1633528 paraoka - chaosmaid/paraoka - chaosmaid (Miyoi) [inner oni].osu',
		'1633528 paraoka - chaosmaid/paraoka - chaosmaid (Miyoi) [kyex\'s oni].osu',
		'1633528 paraoka - chaosmaid/paraoka - chaosmaid (Miyoi) [maimai\'s muzukashii].osu',
		
		'1571290 AcesToAces - Memory Lane/AcesToAces - Memory Lane (T w i g) [2199\'s Muzukashii].osu',
		'1571290 AcesToAces - Memory Lane/AcesToAces - Memory Lane (T w i g) [Dreams].osu',
		'1571290 AcesToAces - Memory Lane/AcesToAces - Memory Lane (T w i g) [Futsuu].osu',
		'1571290 AcesToAces - Memory Lane/AcesToAces - Memory Lane (T w i g) [Hivie\'s Kantan].osu',
		'1571290 AcesToAces - Memory Lane/AcesToAces - Memory Lane (T w i g) [Oni].osu',
		
		'1158443 Mia REGINA - I got it! (Slax Remix)/Mia REGINA - I got it! (Slax Remix) (maguro869) [Go Ahead].osu',
		
		'1436637 Ricky Montgomery - This December/Ricky Montgomery - This December (Jekuru) [Futsuu].osu',
		'1436637 Ricky Montgomery - This December/Ricky Montgomery - This December (Jekuru) [Kantan].osu',
		'1436637 Ricky Montgomery - This December/Ricky Montgomery - This December (Jekuru) [Muzukashii].osu',
		'1436637 Ricky Montgomery - This December/Ricky Montgomery - This December (Jekuru) [Oni].osu',
		
		'1691024 Mitsukiyo - Unwelcome School/Mitsukiyo - Unwelcome School (komasy) [Futsuu].osu',
		'1691024 Mitsukiyo - Unwelcome School/Mitsukiyo - Unwelcome School (komasy) [Kantan].osu',
		'1691024 Mitsukiyo - Unwelcome School/Mitsukiyo - Unwelcome School (komasy) [Muzukashii].osu',
		'1691024 Mitsukiyo - Unwelcome School/Mitsukiyo - Unwelcome School (komasy) [Oni].osu',
		'1691024 Mitsukiyo - Unwelcome School/Mitsukiyo - Unwelcome School (komasy) [Inner Oni].osu',
		
		'1669463 KAF feat KAFU - phony/KAF feat. KAFU - phony (komasy) [antipathy world].osu',
		'1669463 KAF feat KAFU - phony/KAF feat. KAFU - phony (komasy) [futsuu].osu',
		'1669463 KAF feat KAFU - phony/KAF feat. KAFU - phony (komasy) [muzukashii].osu',
		'1669463 KAF feat KAFU - phony/KAF feat. KAFU - phony (komasy) [oni].osu',
		
		'1201900 katagiri - STRONG 280/katagiri - STRONG 280 (KTYN) [STRONG COLLAB].osu',
		
		'1242018 Cyte - Silver Winds/Cyte - Silver Winds (Cychloryn) [Futsuu].osu',
		'1242018 Cyte - Silver Winds/Cyte - Silver Winds (Cychloryn) [Kantan].osu',
		'1242018 Cyte - Silver Winds/Cyte - Silver Winds (Cychloryn) [Muzukashii].osu',
		'1242018 Cyte - Silver Winds/Cyte - Silver Winds (Cychloryn) [Oni].osu',
		'1242018 Cyte - Silver Winds/Cyte - Silver Winds (Cychloryn) [Inner Oni].osu',
		
		'955835 KikuoHana - Desert Theater/Kikuohana - Desert Theater (Alchyr) [Muzukashii].osu',
		'955835 KikuoHana - Desert Theater/Kikuohana - Desert Theater (Alchyr) [Oni].osu',
		'955835 KikuoHana - Desert Theater/Kikuohana - Desert Theater (Alchyr) [Withered].osu',
		
		'1604579 Cyte - Xinyi Dist/Cyte - Xinyi Dist (Gamelan4) [08\'s Oni].osu',
		'1604579 Cyte - Xinyi Dist/Cyte - Xinyi Dist (Gamelan4) [Futsuu].osu',
		'1604579 Cyte - Xinyi Dist/Cyte - Xinyi Dist (Gamelan4) [Hell Oni].osu',
		'1604579 Cyte - Xinyi Dist/Cyte - Xinyi Dist (Gamelan4) [Kantan].osu',
		'1604579 Cyte - Xinyi Dist/Cyte - Xinyi Dist (Gamelan4) [Muzukashii].osu',
		
		'857208 SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE-/SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE- (Charlotte) [Futsuu].osu',
		'857208 SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE-/SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE- (Charlotte) [ily4\'s Muzukashii].osu',
		'857208 SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE-/SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE- (Charlotte) [Inner Oni].osu',
		'857208 SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE-/SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE- (Charlotte) [Kqrth\'s Escape Oni].osu',
		'857208 SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE-/SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE- (Charlotte) [Nardo\'s Oni].osu',
		'857208 SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE-/SOUND HOLIC feat. Nana Takahashi - 1001 -ESCAPE- (Charlotte) [Renka\'s Kantan].osu',
		
		'1730764 EMA - God-ish/EMA - God-ish ([Zeth]) [Fapu\'s Futsuu].osu',
		'1730764 EMA - God-ish/EMA - God-ish ([Zeth]) [Hivie\'s Muzukashii].osu',
		'1730764 EMA - God-ish/EMA - God-ish ([Zeth]) [I wish I didn\'t understand the meaning of life.].osu',
		'1730764 EMA - God-ish/EMA - God-ish ([Zeth]) [Oni].osu',
		
		'1228198 lapix - Carry Me Away (Extended Mix)/lapix - Carry Me Away (Extended Mix) (Konpaku Sariel) [Fly Away].osu',
		'1228198 lapix - Carry Me Away (Extended Mix)/lapix - Carry Me Away (Extended Mix) (Konpaku Sariel) [Muzukashii].osu',
		'1228198 lapix - Carry Me Away (Extended Mix)/lapix - Carry Me Away (Extended Mix) (Konpaku Sariel) [Oni].osu',
		'1228198 lapix - Carry Me Away (Extended Mix)/lapix - Carry Me Away (Extended Mix) (Konpaku Sariel) [tasuke\'s Inner Oni].osu',
		
		'942014 Loctek - Summer CarnivaL/Loctek - Summer CarnivaL (Metzo) [CarnivaL Oni].osu',
		
		'../tja/pajamap/pajamap.tja'
	],
	cur = 0,
	
	changed = 0,
	nsongs = 0;
	
	return (new Promise(function(resolve){
		function doit() {
			if(cur in sl) {
				var f = sl[cur],
				parts = parseFilePath(f);
				xmlhttprqsc(
					'/songs/' + f,
					'blob',
					function(e){
						outputProgress(`now scanning ${parts.filename}`);
						fileReaderA(e.target.response, 'arraybuffer').then((fileAB)=>{
							detectedFn(
								e.target.response,
								parts,
								md5(fileAB)
							).then((stats)=>{
								changed += stats.changed;
								nsongs += stats.newFile;
								
								cur++;
								doit();
							});
							
							fileAB = null;
						});
					}
				);
			} else {
				outputProgress(`okay.\r\n${changed} changed\r\n${nsongs} new`);
				doit = null;
				sl = null;
				resolve();
			}
		}
		
		doit();
	}));
}