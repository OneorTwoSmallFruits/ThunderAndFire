
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs } from'./asyncs.js';
import { oltianshu} from'./oltianshu.js';
export async function ThunderAndFire_global(lib, game, ui, get, ai, _status){
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
    const checkTimes = await setTimelist();//如果输入数组自动生成"Before", "Begin", "End", "After"时间节点数组！
    //《银竹离火》阵亡、部分角色卡牌语音全局函数
    lib.skill._ThunderAndFire_setaudio = {
        trigger: { player: ['useCardBefore','dieBefore']},
        ruleSkill: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        fixed: true,
        priority: Infinity ,
        direct: true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'useCardBefore') {
                const name = trigger.card.name;
                if (!name) return;
                const setaudiocard = lib.ThunderAndFire.cards.setAudio;
                if (setaudiocard.includes(name)) {
                    const num = Math.floor(Math.random() * 2) + 1;
                    game.playAudio('..', 'extension', '银竹离火/audio/card/diycard', name + num);
                } else {
                    cardAudio(trigger, player);//特殊武将及卡牌语音：目前有郭嘉、诸葛亮、钟会
                }
            } else if (Time == 'dieBefore') {
                const characters = lib.ThunderAndFire.characters.character;
                const playerID = trigger.player.name;
                if (characters.includes(playerID)) {
                    trigger.audio = false;
                    game.playAudio('..', 'extension', '银竹离火/audio/die', trigger.player.name);
                }
            }
        }
    };
    /*
    lib.skill._TAFceshi1 = {
        trigger:{
            global:["useCardAfter"],
        },
        direct: true,
        async content(event, trigger, player) {
            const t = trigger.player;
            console.log([
                compareValue(t,'TAF_fumojingangchu'),
                compareValue(t,'TAF_feijiangshenweijian'),
                compareValue(t,'TAF_wushuangxiuluoji'),
                compareValue(t,'TAF_honglianzijinguan'),
                compareValue(t,'TAF_youhuoshepoling'),
                compareValue(t,'TAF_leishan'),
                compareValue(t,'icewuqibingfa'),
            ]);
            console.log([
                compareOrder(t,'TAF_fumojingangchu'),
                compareOrder(t,'TAF_feijiangshenweijian'),
                compareOrder(t,'TAF_wushuangxiuluoji'),
                compareOrder(t,'TAF_honglianzijinguan'),
                compareOrder(t,'TAF_youhuoshepoling'),
                compareOrder(t,'TAF_leishan'),
                compareOrder(t,'icewuqibingfa'),
            ]);
            console.log([
                compareUseful(t,'TAF_fumojingangchu'),
                compareUseful(t,'TAF_feijiangshenweijian'),
                compareUseful(t,'TAF_wushuangxiuluoji'),
                compareUseful(t,'TAF_honglianzijinguan'),
                compareUseful(t,'TAF_youhuoshepoling'),
                compareOrder(t,'TAF_leishan'),
                compareUseful(t,'icewuqibingfa'),
            ]);
            console.log(trigger)
            debugger;
        }
    };
    */
/*
    lib.skill._TAFceshi2 = {
        trigger:{
            global: "useCardAfter",
        },
        direct: true,
        async content(event, trigger, player) {
            const evts = game.getAllGlobalHistory("everything", evt => {
                if (!evt.name || evt.name !== "damage") return false;
                return evt.source === trigger.player && evt.num > 0;
            });
            console.log(evts);
            debugger;
        }
    };
*/

}