
import nonameContents from'./nonameContents.js';
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs , oltianshu} from'./asyncs.js';
import { 
    character,
    神话再临character, 隐忍天弓character, 鼎足三分character, 星河皓月character,
    惊世银竹character, 期期离火character, 欲雨临泽character, 惊鸿玉蝶character,
    雾山五行character, 爆料体验character, 其他武将character, 异构Bosscharacter,
    测试专属character,
} from'./characters.js';
const {
    setColor, cardAudio, delay, getCardSuitNum, getCardNameNum,
    compareValue, 
    compareOrder, compareUseful, checkVcard, checkSkills,
    chooseCardsToPile, chooseCardsTodisPile, setTimelist,
} = ThunderAndFire;//银竹离火函数
const {
    getTypesCardsSum, getTypesCardsSum_byme, getShaValue, getDamageTrickValue,
    getTrickValue, getAliveNum,
} = setAI;

export async function ThunderAndFire_useCardAI(lib,game,ui,get,ai,_status){
    const TAFcharacters = Object.keys(character);
    lib.skill._ThunderAndFire_useCardAI = {
        ruleSkill: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        fixed: true,
        priority: Infinity,
        direct: true,
        mod: {
            aiValue: function(player, card, num) {
                const Pname = player.name;
                const useKey = _status.currentPhase === player;
                if(!TAFcharacters.includes(Pname) && !useKey) return;
                const cardname = get.name(card, player);
                if (cardname == 'zhuge') {
                    if (getShaValue(player)) {
                        const shaCardCount = player.countCards("hes", { name: "sha" });
                        const setnum = num + shaCardCount * 2;
                        //console.log('诸葛亮连弩价值设定：',[cardname,setnum,]);
                        return setnum;
                    }
                }
            },
            aiUseful: function(player, card, num) {
                const Pname = player.name;
                const useKey = _status.currentPhase === player;
                if(!TAFcharacters.includes(Pname) && !useKey) return;
                const cardname = get.name(card, player);
                if (cardname == 'zhuge') { 
                    if (getShaValue(player)) {
                        const shaCardCount = player.countCards("hes", { name: "sha" });
                        const setnum = num + shaCardCount * 2;
                        return setnum;
                    }
                }
            },
            aiOrder:function (player, card, num) {

            },
        },
    };
}