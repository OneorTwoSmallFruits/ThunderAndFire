import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs , oltianshu} from'./asyncs.js';
const {
    setColor, cardAudio, delay, getCardSuitNum, getCardNameNum,
    compareValue, 
    compareOrder, compareUseful, checkVcard, checkSkills,
    chooseCardsToPile, chooseCardsTodisPile, setTimelist,
    setjudgesResult
} = ThunderAndFire;//银竹离火函数
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
const luoshukey = lib.config.extension_银竹离火_TAFset_ice_jiaxu;//蝶贾诩络殊技能池拓展开关
const {
    getTypesCardsSum, getTypesCardsSum_byme, getShaValue, getDamageTrickValue,
    getTrickValue, getAliveNum,getFriends,getEnemies
} = setAI;
const {
    sunxiongyiAI, sunshangshiAI, thunderguixinAI, tenwintenloseAI,
    thunderxingshangAI,thunderfulongAI,
} = setAI.wei;
const {
    firezhanjueAI,firefengmingAI,
} = setAI.shu;
const {
    moonqinyinAI,moonqishiAI,moonshubiAI,
} = setAI.wu;
const {
    icefaluAI,icefaluOrderAI,longduiAI,icelijianCardsAI,icelingrenguessAI,icejiangxianresultAI
} = setAI.qun;

/** @type { importCharacterConfig['skill'] } */
const TAF_ceshiSkills = {
    iceceshiSkill: {
        audio: "ext:银竹离火/audio/skill:2",        
        trigger: {
            player:["useCardAfter"]
        },
        direct:true,
        init:async function(player, skill) {

        },
        filter: function(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            const cards1 = await player.specifyCards('TAF_daozhuanqiankun');
            const cards2 = await player.specifyCards('TAF_lunhuizhiyao');
        },
        "_priority": 0,
    },
};
export default TAF_ceshiSkills;
