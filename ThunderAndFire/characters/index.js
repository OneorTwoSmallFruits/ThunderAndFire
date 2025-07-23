import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
import characters from "./character.js";
import { characterSort, characterSortTranslate } from "./sort.js";
import characterFilters from "./characterFilter.js";
import characterTitles from "./characterTitle.js";
import dynamicTranslates from "./dynamicTranslate.js";
import characterIntros from "./intro.js";
import characterReplaces from "./characterReplace.js";
import cards from "./card.js";
/**分界线 */
import TAF_sunSkills from "./TAF_sunSkills.js";
import TAF_sanfenSkills from "./TAF_sanfenSkills.js";
import TAF_MoonAndStarsSkills from "./TAF_MoonAndStarsSkills.js";
import TAF_weiSkills from "./TAF_weiSkills.js";
import TAF_shuSkills from "./TAF_shuSkills.js";
import TAF_wuSkills from "./TAF_wuSkills.js";
import TAF_qunSkills from "./TAF_qunSkills.js";
import TAF_shenhuaSkills from "./TAF_shenhuaSkills.js";
import TAF_wuxingSkills from "./TAF_wuxingSkills.js";
import TAF_baoliaoSkills from "./TAF_baoliaoSkills.js";
import TAF_qitaSkills from "./TAF_qitaSkills.js";
import TAF_BossSkills from "./TAF_BossSkills.js";
import TAF_jianglingSkills from "./TAF_jianglingSkills.js";
import TAF_ceshiSkills from "./TAF_ceshiSkills.js";
/**分界线 */
import translates from "./translate.js";
import voices from "./voices.js";
import pinyins from "./pinyin.js";
game.import("character", function () {
	const ThunderAndFire = {
		name: "ThunderAndFire",
		connect: true,
		character: { ...characters },
		characterSort: {
			ThunderAndFire: characterSort,
		},
		characterFilter: { ...characterFilters },
		characterTitle: { ...characterTitles },
		dynamicTranslate: { ...dynamicTranslates },
		characterIntro: { ...characterIntros },
		characterReplace: { ...characterReplaces },
		card: { ...cards },
		skill: { 
			...TAF_sunSkills,
			...TAF_sanfenSkills,
			...TAF_MoonAndStarsSkills,
			...TAF_weiSkills,
			...TAF_shuSkills,
			...TAF_wuSkills,
			...TAF_qunSkills,
			...TAF_shenhuaSkills,
			...TAF_wuxingSkills,
			...TAF_baoliaoSkills,
			...TAF_qitaSkills,
			...TAF_BossSkills,
			...TAF_jianglingSkills,
			...TAF_ceshiSkills,
		},
		translate: { ...translates, ...voices, ...characterSortTranslate },
		pinyins: { ...pinyins },
	};
	for (const name in ThunderAndFire.character) {
		const dieAudioPath = `die:ext:银竹离火/audio/die/${name}.mp3`;
		const imagesPath_png = `ext:银竹离火/image/character/standard/${name}.png`;
		const imagesPath_gif = `ext:银竹离火/image/character/standard/TAF_shen_zhaoyun/${name}.gif`;
		if(name === "TAF_shen_zhaoyun") {
			ThunderAndFire.character[name][4].push(dieAudioPath, imagesPath_gif);
		} else {
			ThunderAndFire.character[name][4].push(dieAudioPath, imagesPath_png);
		}
	}
	lib.translate["ThunderAndFire_character_config"] = "<font color= #0088CC>银竹</font><font color= #EE9A00>丨</font><font color= #FF2400>离火</font>";
	lib.config.characters.add("ThunderAndFire");
	return ThunderAndFire;
});