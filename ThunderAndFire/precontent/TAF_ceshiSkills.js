import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs } from'./asyncs.js';
import { oltianshu} from'./oltianshu.js';
const {
    setColor, getDisSkillsTargets, DiycardAudio, cardAudio, 
    delay, getCardSuitNum, getCardNameNum, compareValue, compareOrder, compareUseful, 
    chooseCardsToPile, chooseCardsTodisPile, setTimelist, setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
const luoshukey = lib.config.extension_银竹离火_TAFset_ice_jiaxu;//蝶贾诩络殊技能池拓展开关
const {
    getTypesCardsSum, getTypesCardsSum_byme, getShaValue, getDamageTrickValue,
    getTrickValue, getAliveNum, getFriends, getEnemies,
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
            player:["useCardAfter"],
            global:["logSkill"]
        },
        direct:true,
        init:async function(player, skill) {

        },
        filter: function(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "useCardAfter") {
                const cards1 = await player.specifyCards('TAF_daozhuanqiankun');
                const cards2 = await player.specifyCards('TAF_lunhuizhiyao');
                const chat1 = [
                    "火莲绽江矶，炎映三千弱水。",
                    "奇志吞樯橹，潮平百万寇贼。",
                    "江东多锦绣，离火起曹贼毕，九州同忾。",
                    "星火乘风，风助火势，其必成燎原之姿。"
                ];
                const chat2 = [
                    "烈酒入胸腹，对月啸三分，且炙仇雠八百里。",
                    "千帆载丹鼎，万军为薪，一焚可引振翼之金乌。",
                    "红莲生碧波，水火相融之际、吴钩刈将之时！",
                    "青帆载红莲，白浪淘沙，紫帜漫北地。"
                ];
                const next = player.getNext();
                player.chatSkill('moonyingzi',chat1, next,'fire');
            } else if (Time == "logSkill") {
                console.log("logSkill",trigger,);
            }

        },
        "_priority": 0,
    },
};
export default TAF_ceshiSkills;
