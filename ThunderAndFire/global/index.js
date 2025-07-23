import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import characters from "../characters/character.js";
const {setColor,compareValue} = ThunderAndFire;
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "../characters/character.js";
import cards from "../cards/cards.js";
import { 基本牌, 锦囊牌, 装备牌 } from "../cards/cards.js";
lib.skill._ThunderAndFire_setaudio = {//《银竹离火》部分角色特殊卡牌语音
    trigger: { player: 'useCardBefore'},
    ruleSkill: true,
    superCharlotte: true,
    charlotte: true,
    fixed: true,
    silent: true,
    priority: Infinity ,
    forced: true,
    async content(event, trigger, player) {
        ThunderAndFire.excCardsAudio(trigger, player);//部分武将专属卡牌
        const setAudio = lib.ThunderAndFire.cards.setAudio;
        const name = trigger.card.name;
        if (name && setAudio.includes(name)) {//银竹离火diy卡牌播放
            ThunderAndFire.diyCardsAudio(trigger, player);
        }
    }
};
//《银竹离火》诸葛连弩逻辑AI
lib.skill._ThunderAndFire_useCardAI = {
    mod: {
        aiValue: function(player, card, num) {
            const Pname = player.name;
            const useKey = _status.currentPhase === player;
            if(!Object.keys(characters).includes(Pname) || !useKey) return;
            const cardname = get.name(card, player);
            if (cardname == 'zhuge') {//仅限银竹离火武将
                return player.getCardsValue('sha').length * 2;
            }
        },
        aiUseful: function(player, card, num) {
            const Pname = player.name;
            const useKey = _status.currentPhase === player;
            if(!Object.keys(characters).includes(Pname) || !useKey) return;
            const cardname = get.name(card, player);
            if (cardname == 'zhuge') {//仅限银竹离火武将
                return player.getCardsValue('sha').length;
            }
        },
        aiOrder:function (player, card, num) {

        },
    },
    ruleSkill: true,
    superCharlotte: true,
    charlotte: true,
    fixed: true,
    silent: true,
    priority: Infinity ,
    forced: true,
};
//《银竹离火》SE孙鲁班「向死存吴」光环
lib.skill._ThunderAndFire_SEsunluban_guanghuan = {
    trigger: {
        global: ["loseAfter","loseAsyncAfter","cardsDiscardAfter","equipAfter"],
    },
    ruleSkill: true,
    superCharlotte: true,
    charlotte: true,
    fixed: true,
    silent: true,
    priority: Infinity ,
    forced: true,
    filter(event, player) {
        const targets = game.filterPlayer(o => {
            return o.waterzhanqing_guanghuan && o.waterzhanqing_used < 2 && o.isAlive() && o.getCards('he').length > 0;
        });
        if (!targets || targets.length === 0) return false;
        const cards = event.getd();
        if (!Array.isArray(cards)) return false;
        if (!cards || cards.length === 0) return false;
        return cards.some(card => {
            return get.position(card) === "d" && get.type(card) === "equip";
        })
    },
    async content(event, trigger, player) {
        async function setxiangsicunwu(player) {
            let num = player.waterzhanqing_used;
            let cards = player.getCards('he');
            if (cards.length === 0 || num >= 2) return;
            const prompt = setColor("〖向死存吴〗：每回合限两次，是否弃置任意张牌并摸等量+1张牌，且获得牌中至少有一张牌名信息含有「杀」的牌(若有)？");
            const result = await player.chooseCard(prompt, 'he', [1, Infinity], function(card) {
                return cards.includes(card);
            }).set('ai', function(card) {
                if (get.value(card,player) < compareValue(player,'tao')) return 1;
                else return 0;
            }).forResult();
            if (result.bool) {
                player.waterzhanqing_used++;
                const cards = result.cards;
                const chatlists = [
                    "我的好妹妹，来世莫要生于帝王家。",
                    "至尊有诏，不从长公主者，斩！",
                    "本公主在此，岂容你们放肆。",
                    "我可不是，任你们拿捏的。",
                    "公主之位，众口之谮。",
                    "一船之人，你怎可独自上岸。",
                    "尔等欺君罔上，还敢抵赖。",
                    "哼，真以为我能饶过你。",
                ];
                const num = Math.floor(Math.random() * chatlists.length) + 1;
                player.$fullscreenpop("向死存吴", "fire");
                player.chat(chatlists[num - 1])
                game.playAudio('..', 'extension', '银竹离火/audio/effect/xiangsicunwu', 'xiangsicunwu' + num);
                await player.discard(cards);
                const allPileCards = player.getCardsform();
                if (allPileCards.length === 0) return;
                let hasKillCard = [];
                let gainCards = [];
                let seen = new Set();
                for (const card of allPileCards) {
                    if (seen.has(card)) continue;
                    seen.add(card);
                    if(hasKillCard.length === 0){
                        const name = card.name;
                        if (name) {
                            const info = lib.translate[name + '_info'];
                            const fanyi = lib.translate[name];
                            if ((info && info.includes('杀')) || (fanyi && fanyi.includes('杀'))) {
                                hasKillCard.push(card);
                                gainCards.push(card);
                            }
                        }
                    } else {
                        gainCards.push(card);
                        if (gainCards.length >= cards.length + 1) break;
                    }
                }
                if (gainCards.length > 0) {
                    await player.gain(gainCards,'gain2');
                }
            }
        }
        const targets = game.filterPlayer(o => {
            return o.waterzhanqing_guanghuan && o.waterzhanqing_used < 2 && o.isAlive() && o.getCards('he').length > 0;
        });
        for (const target of targets) {
            await setxiangsicunwu(target);
        }
    },
};
/**
 * 代理本体函数lib.filter.filterTrigger函数 用于禁用技能列表
 */
/*
const originalFilterTrigger = lib.filter.filterTrigger;
lib.filter.filterTrigger = new Proxy(originalFilterTrigger, {
    apply(target, thisArg, argumentsList) {
        if (argumentsList[1]) {
            function noname_skillBlocker() {
                const Blockerskills = [...new Set([...argumentsList[1].skills, ...argumentsList[1].initedSkills])].filter(item => {
                    const init = lib.skill[item].init;
                    const skillBlocker = lib.skill[item].skillBlocker;
                    return init && skillBlocker;
                });
                return Blockerskills;
            }
            if (!noname_skillBlocker() || noname_skillBlocker().length === 0) {
                const name = 'skillBlocker_' + argumentsList[1].playerid;
                if (lib[name]) {
                    for (const skillname in lib[name]) {
                        const originalSkillBlocker = lib[name][skillname];
                        if (lib.skill[skillname] && originalSkillBlocker) {
                            lib.skill[skillname].skillBlocker = originalSkillBlocker;
                        }
                    }
                    delete lib[name];
                };
            }
        }
        const result = Reflect.apply(target, thisArg, argumentsList);
        if (argumentsList[1] && argumentsList[3]) {
            const player = argumentsList[1];
            const skill = argumentsList[3];
            const disSkilllists = player.tempdislist;
            if (disSkilllists && disSkilllists.includes(skill)) {
                return false;
            }
        }
        return result;
    }
});
*/


