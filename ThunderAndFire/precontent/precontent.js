import { lib, game, ui, get, ai, _status } from '../../../../noname.js'

import firstSettings  from'./firstSettings.js';
import {
    character, characterSort, characterFilter, characterTitle, 
    dynamicTranslate, characterIntro, characterReplace, translate
} from'./characters.js';
import { voices } from "./voices.js";

import TAF_shenhuaSkills from "./TAF_shenhuaSkills.js";
import TAF_sunSkills from "./TAF_sunSkills.js";
import TAF_sanfenSkills from "./TAF_sanfenSkills.js";
import TAF_MoonAndStarsSkills from "./TAF_MoonAndStarsSkills.js";
import TAF_weiSkills from "./TAF_weiSkills.js";
import TAF_shuSkills from "./TAF_shuSkills.js";
import TAF_wuSkills from "./TAF_wuSkills.js";
import TAF_qunSkills from "./TAF_qunSkills.js";
import TAF_wuxingSkills from "./TAF_wuxingSkills.js";
import TAF_baoliaoSkills from "./TAF_baoliaoSkills.js";
import TAF_qitaSkills from "./TAF_qitaSkills.js";
import TAF_BossSkills from "./TAF_BossSkills.js";
import TAF_ceshiSkills from "./TAF_ceshiSkills.js";

import {cards, cardsSkills, cardstranslate} from'./cards.js';

import { ThunderAndFire_Skin } from "./ThunderAndFire_Skin.js";
import { ThunderAndFire_global } from "./ThunderAndFire_global.js";
import { ThunderAndFire_useCardAI } from "./ThunderAndFire_useCardAI.js";
export function precontent(ThunderAndFire) {
    ThunderAndFire_Skin(lib, game, ui, get, ai, _status);
    ThunderAndFire_global(lib, game, ui, get, ai, _status);
    ThunderAndFire_useCardAI(lib, game, ui, get, ai, _status);
    if (ThunderAndFire.enable) {
        game.import("character", function () {
            const ThunderAndFireConfig = {
                name: "ThunderAndFire",
                connect: true,
                firstSettings: firstSettings,
                character: character,
                characterSort: {
                    ThunderAndFire: characterSort,
                },
                characterFilter: characterFilter,
                characterTitle: characterTitle,
                dynamicTranslate: dynamicTranslate,
                characterIntro: characterIntro,
                characterReplace: characterReplace,
                card: {},
                skill: {
                    ...TAF_shenhuaSkills,
                    ...TAF_sunSkills,
                    ...TAF_sanfenSkills,
                    ...TAF_MoonAndStarsSkills,
                    ...TAF_weiSkills,
                    ...TAF_shuSkills,
                    ...TAF_wuSkills,
                    ...TAF_qunSkills,
                    ...TAF_wuxingSkills,
                    ...TAF_baoliaoSkills,
                    ...TAF_qitaSkills,
                    ...TAF_BossSkills,
                    ...TAF_ceshiSkills,
                },
                translate: {...translate,...voices},
                pinyins: {},
            };
            const charactername = Object.keys(ThunderAndFireConfig.character);
            for (const i of charactername) {
                const dieAudioPath = `die:ext:银竹离火/audio/die/${i}.mp3`;
                if (i === "TAF_zhaoyun") {
                    const imagesPath = `ext:银竹离火/image/character/standard/${i}.gif`;
                    ThunderAndFireConfig.character[i][4].push(dieAudioPath, imagesPath);
                } else {
                    const imagesPath = `ext:银竹离火/image/character/standard/${i}.png`;
                    ThunderAndFireConfig.character[i][4].push(dieAudioPath, imagesPath);
                }
                /*
                const dieAudioPath = `die:ext:银竹离火/audio/die/${i}.mp3`;
                const imagesPath = `ext:银竹离火/image/character/standard/${i}.png`;
                ThunderAndFireConfig.character[i][4].push(dieAudioPath, imagesPath);
                */
            }
            return ThunderAndFireConfig;
        });
        lib.translate['ThunderAndFire_character_config'] = "<font color= #0088CC>银竹</font><font color= #EE9A00>丨</font><font color= #FF2400>离火</font>";
        if (!lib.config.characters.includes("ThunderAndFire")) {
            lib.config.characters.push("ThunderAndFire");
        }
        
        game.import("card", function () {
            return {
                name: "ThunderAndFirecard",
                connect: true,
                card: cards,
                skill: cardsSkills,
                translate: cardstranslate,
                list: [
                    ['spade', 3, 'TAF_leishan'],
                    ['club', 5, 'TAF_leishan'],
                    ['spade', 7, 'TAF_leishan'],
                    ['club', 9, 'TAF_leishan'],
                    ['spade', 13, 'TAF_daozhuanqiankun'],
                    ['spade', 6, 'TAF_lunhuizhiyao'],
                    /*
                    ['spade', 2, 'icewuqibingfa'],
                    ['spade', 13, 'TAF_fumojingangchu'],
                    ['heart', 13, 'TAF_feijiangshenweijian'],
                    ['diamond', 13, 'TAF_wushuangxiuluoji'],
                    ['heart', 1, 'TAF_honglianzijinguan'],
                    ['club', 13, 'TAF_youhuoshepoling'],
                    */
                ],
            };
        });
        lib.translate['ThunderAndFirecard_card_config'] = "<font color= #0088CC>银竹</font><font color= #EE9A00>丨</font><font color= #FF2400>离火</font>";
        if (!lib.config.cards.includes("ThunderAndFirecard")) {
            lib.config.cards.push("ThunderAndFirecard");
        }
    }
    console.log('已加载《银竹离火》lib.ThunderAndFire', lib.ThunderAndFire);
}