import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import nonameContents from'./nonameContents.js';
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs } from'./asyncs.js';
import { oltianshu} from'./oltianshu.js';
import { 
    character,
    神话再临character, 隐忍天弓character, 鼎足三分character, 星河皓月character,
    惊世银竹character, 期期离火character, 欲雨临泽character, 惊鸿玉蝶character,
    雾山五行character, 爆料体验character, 其他武将character, 异构Bosscharacter,
    测试专属character,
} from'./characters.js';

const firstSettings = { };
if (!lib.ThunderAndFire) {
    lib.ThunderAndFire = {
        Times:{
            setTimes: nonameContents,//此列表不含"gameStart", "roundStart"
            checkTimes:[],//全时机检查列表
        },
		characters: {
			character: Object.keys(character),
			神话再临: Object.keys(神话再临character),
			隐忍天弓: Object.keys(隐忍天弓character),
			鼎足三分: Object.keys(鼎足三分character),
			星河皓月: Object.keys(星河皓月character),
			惊世银竹: Object.keys(惊世银竹character),
			期期离火: Object.keys(期期离火character),
			欲雨临泽: Object.keys(欲雨临泽character),
			惊鸿玉蝶: Object.keys(惊鸿玉蝶character),
            雾山五行: Object.keys(雾山五行character),
			爆料体验: Object.keys(爆料体验character),
			其他武将: Object.keys(其他武将character),
			异构Boss: Object.keys(异构Bosscharacter),
			测试专属: Object.keys(测试专属character),
        },
        cards: {
			cards:[],
            setShenwu:[],//神武卡牌
			setSignature:[],//专属卡牌
            setDestroy:[],//销毁设定的卡牌
            setAudio:[],//设定音效的卡牌
        },
        func : ThunderAndFire,
        ai: setAI,
        asyncs: asyncs,
        oltianshu : oltianshu,
    };
}
export default firstSettings;
