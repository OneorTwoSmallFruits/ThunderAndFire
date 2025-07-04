import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'./functions.js';
const {
    setColor, getDisSkillsTargets, DiycardAudio, cardAudio, 
    delay, getCardSuitNum, getCardNameNum, compareValue, compareOrder, compareUseful, 
    chooseCardsToPile, chooseCardsTodisPile, setTimelist, setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数

const {
    getTypesCardsSum, getTypesCardsSum_byme, getShaValue, getDamageTrickValue,
    getTrickValue, getAliveNum, getFriends, getEnemies,
} = setAI;

const oltianshu_triggers = {
    /*******************************天书时机一 */
    1: {
        trigger: { global: ["useCardAfter"] },
        triggerinfo: "你使用牌后",
        type: 1,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    2: {
        trigger: { global: ["useCardAfter"] },
        triggerinfo: "其他角色对你使用牌后",
        type: 1,
        canuse: async function(trigger, player) {
            const targets = trigger.targets;
            if (!targets || targets.length === 0) return false;
            return trigger.player !== player && targets.includes(player);
        },
    },
    3: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "失去手牌后",
        type: 1,
        canuse: async function(trigger, player) {
            const evt = trigger.getl(player);
            return evt && evt.hs.length > 0;
        },
    },
    /*******************************天书时机二 */
    4: {
        trigger: { global: ["phaseUseBegin"] },
        triggerinfo: "出牌阶段开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    5: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "你受到伤害后",
        type: 2,
        canuse: async function(trigger, player) {
            const num = trigger.num;
            const target = trigger.player;
            if (!num || !target) return false;
            return target == player && num > 0;
        },
    },
    6: {
        trigger: { global: ["phaseZhunbeiBegin"] },
        triggerinfo: "准备阶段",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    7: {
        trigger: { global: ["phaseJieshuBegin"] },
        triggerinfo: "结束阶段",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    8: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "你造成伤害后",
        type: 2,
        canuse: async function(trigger, player) {
            const source = trigger.source;
            if (!source) return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return source == player && num > 0;
        },
    },
    9: {
        trigger: { target: ["useCardToTarget"] },
        triggerinfo: "你成为〖杀〗的目标时",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return card.name == "sha";
        },
    },
    10: {
        trigger: { player: ["useCardToBefore"] },
        triggerinfo: "你使用或打出〖闪〗时",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return card.name == "shan";
        },
    },
    11: {
        trigger: { global: ["judgeBefore"] },
        triggerinfo: "当一张判定牌生效前",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return true;
        },
    },
    12: {
        trigger: { player: ["eventNeutralized","shaMiss"] },
        triggerinfo: "你使用的牌被抵消后",
        type: 2,
        canuse: async function(trigger, player) {
            if (trigger.type != "card" && trigger.name != "_wuxie") return false;
            const card = trigger.card;
            return card;
        },
    },
    13: {
        trigger: { global: ["judge"] },
        triggerinfo: "当一张判定牌生效后",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return true;
        },
    },
    14: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "你于回合外失去红色牌后",
        type: 2,
        canuse: async function(trigger, player) {
            if (player === _status.currentPhase) return false;
            const evt = trigger.getl(player);
            if (!evt) return false;
            if (!evt.cards2) return false;
            if (evt.cards2.length === 0) return false;
            for (let card of evt.cards2) {
                if (get.color(card, player) == "red") return true;
            }
            return false;
        },
    },
    15: {
        trigger: { player: ["phaseDiscardBegin"] },
        triggerinfo: "弃牌阶段开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return true;
        },
    },
    16: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "一名角色受到〖杀〗的伤害后",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            if (card.name != "sha") return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return num > 0;
        },
    },
    17: {
        trigger: { player: ["phaseDrawBegin"] },
        triggerinfo: "摸牌阶段开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return !trigger.numFixed;
        },
    },
    18: {
        trigger: { target: ["useCardToTargeted"] },
        triggerinfo: "你成为普通锦囊牌的目标后",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return get.type(card) == "trick";
        },
    },
    19: {
        trigger: { global: ["linkAfter"] },
        triggerinfo: "一名角色进入连环状态后",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player.isLinked();
        },
    },
    20: {
        trigger: { player: ["changeHpAfter"] },
        triggerinfo: "你的体力值变化后",
        type: 2,
        canuse: async function(trigger, player) {
            const num = trigger.num;
            if (!num) return false;
            return typeof num === "number";
        },
    },
    21: {
        trigger: { global: ["roundStart"] },
        triggerinfo: "每轮开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return true;
        },
    },
    22: {
        trigger: { global: ["damageBegin1"] },
        triggerinfo: "一名角色造成伤害时",
        type: 2,
        canuse: async function(trigger, player) {
            const source = trigger.source;
            if(!source) return false;
            const num = trigger.num;
            if(!num || num <= 0) return false;
            return num > 0;
        },
    },
    23: {
        trigger: { global: ["damageBegin2"] },
        triggerinfo: "一名角色受到伤害时",
        type: 2,
        canuse: async function(trigger, player) {
            const target = trigger.player;
            if(!target) return false;
            const num = trigger.num;
            if(!num || num <= 0) return false;
            return num > 0;
        },
    },
    /*******************************天书时机三 */
    24: {
        trigger: { global: ["dying"] },
        triggerinfo: "一名角色进入濒死时",
        type: 3,
        canuse: async function(trigger, player) {
            const target = trigger.player;
            if (!target) return false;
            return true;
        },
    },
    25: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "你失去装备牌后",
        type: 3,
        canuse: async function(trigger, player) {
            const evt = trigger.getl(player);
            if (!evt) return false;
            if (!evt.es) return false;
            if (evt.es.length === 0) return false;
            return evt.es.length > 0;
        },
    },
    26: {
        trigger: { global: ["dieAfter"] },
        triggerinfo: "一名其他角色死亡后",
        type: 3,
        canuse: async function(trigger, player) {
            return trigger.player !== player;
        },
    },
    27: {
        trigger: { global: ["useCardAfter"] },
        triggerinfo: "〖南蛮入侵〗或〖万箭齐发〗结算后",
        type: 3,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return card.name === "nanman" || card.name === "wanjian";
        },
    },
    28: {
        trigger: { source: ["damageAfter"] },
        triggerinfo: "你使用〖杀〗造成伤害后",
        type: 3,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            if (card.name !== "sha") return false;
            const source = trigger.source;
            if (source !== player) return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return num > 0;
        },
    },
    29: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "一名角色受到属性伤害后",
        type: 3,
        canuse: async function(trigger, player) {
            if (!trigger.hasNature()) return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return num > 0;
        },
    },
    30: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "一名角色失去最后的手牌后",
        type: 3,
        canuse: async function(trigger, player) {
            const target = trigger.player;
            if (!target) return false;
            if (target.countCards("h") === 0) {
                const evt = trigger.getl(target);
                return evt && evt.player == target && evt.hs && evt.hs.length > 0;
            }
            return false;
        },
    },
};
const oltianshu_effects = {
    /*******************************天书效果一 */
    1: {//调试调用正确
        effectinfo: "你可以摸一张牌",
        prompt: "〖天书〗：是否摸一张牌？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const prompt = setColor(oltianshu_effects[1].prompt);
            async function useSkill() {
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    2: {//调试调用正确
        effectinfo: "你可以弃置一名角色区域内的一张牌",
        prompt: "〖天书〗：请选择一名角色，弃置其区域内一张牌？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[2].prompt);
                const targets = game.filterPlayer(o => o.isAlive() && o.getDiscardableCards(player, "hej").length > 0);
                if (!targets || targets.length === 0) return;
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const friends = targets.filter(o => get.attitude(player, o) >= 2 && o.getCards('j').length > 0);
                    if (friends.length > 0) {
                        let hasBadjfriends = [];
                        for (const friend of friends) {
                            const jcards = friend.getCards('j').filter(card => {
                                const effect = get.effect(friend, card, player, player);
                                return effect && effect < 0;
                            });
                            if (jcards.length > 0 && !hasBadjfriends.includes(friend)) {
                                hasBadjfriends.push(friend);
                            }
                        }
                        if (hasBadjfriends.length > 0) {
                            return target === hasBadjfriends[0];
                        }
                    }
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    await player.discardPlayerCard(target, 1, 'hej', true);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    3: {//调试调用正确
        effectinfo: "你可以观看牌堆顶的三张牌，以任意顺序置于牌堆顶或牌堆底",
        prompt: "〖天书〗：是否观看并调整牌堆顶的三张牌",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[3].prompt);
                let result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    const Pile = ui.cardPile.childNodes.length;
                    if(Pile < 3) await game.washCard();
                    const Pilewashed = ui.cardPile.childNodes.length;
                    const disPile = ui.discardPile.childNodes.length;
                    if(Pilewashed + disPile < 3) return;//避免牌堆不够的BUG
                    const cardstop = get.cards(3);
                    game.cardsGotoOrdering(cardstop);
                    let TXT_one = setColor("「天书」可以将所有牌按任意顺序置于〖牌堆顶〗！");
                    let TXT_middle = setColor("「天书」请选择要移动的位置 ↑ ↓ ！");
                    let TXT_two = setColor("「天书」可以将所有牌按任意顺序置于〖牌堆底〗！");
                    const result = await player.chooseToMove("〖天书〗",true)
                    .set("list", [[TXT_one, []],[TXT_middle, cardstop],[TXT_two, []]])
                    .set("filterMove", (from, to, moved) => {
                        return true;
                    }).set('filterOk', (moved) => {
                        return moved[1].length === 0 && (moved[0].length === 3 || moved[2].length === 3);
                    }).set("processAI", (list) => {
                        const cards = list[1][1];
                        let 排序后 = [[],[],[]];
                        const target = _status.currentPhase.next;
                        const judges = target.getCards("j");
                        const att = get.attitude(player, target);
                        if (att >= 2) {
                            if (judges.length > 0) {
                                //用于帮助队友改判断的牌
                                const cheats = setjudgesResult(judges,cards,player,false);//令判定牌失效的卡牌
                                const 剩余卡片 = cards.filter(card => !cheats.includes(card));
                                const 排序剩余卡片 = 剩余卡片.sort((a, b) => get.value(b, player) - get.value(a, player));
                                排序后 = [cheats.concat(排序剩余卡片), [], []];
                            } else {
                                const 排序cards = cards.sort((a, b) => get.value(b,player) - get.value(a, player));
                                排序后 = [排序cards,[],[]];
                            }
                        } else {
                            const taoValue = compareValue(player, 'tao');
                            const shanValue = compareValue(player, 'shan');
                            const jiuValue = compareValue(player, 'jiu');
                            const 不能放牌堆顶 = cards.some(card => {
                                const value = get.value(card, player);
                                return value >= taoValue || value >= shanValue || value >= jiuValue;
                            });
                            const 排序cards = cards.sort((a, b) => get.value(a,player) - get.value(b, player));
                            if (不能放牌堆顶) {
                                排序后 = [[], [], 排序cards];
                            } else {
                                排序后 = [排序cards, [], []];
                            }
                        }
                        return 排序后;
                    }).set('forced', true).forResult();
                    if (result.bool) {
                        let topcards = result.moved[0];
                        if (topcards.length > 0) {
                            const first = ui.cardPile.firstChild;
                            for (let card of topcards) {
                                ui.cardPile.insertBefore(card, first);
                            }
                            player.popup(get.cnNumber(topcards.length) + '上');
                            game.log(player, '将' + get.cnNumber(topcards.length) + '张牌置于牌堆顶！');
                            player.update();
                            game.updateRoundNumber();
                        }
                        let bottomcards = result.moved[2];
                        if (bottomcards.length > 0) {
                            for (let card of bottomcards) {
                                ui.cardPile.appendChild(card);
                            }
                            player.popup(get.cnNumber(bottomcards.length) + '下');
                            game.log(player, '将' + get.cnNumber(bottomcards.length) + '张牌置于牌堆底！');
                            player.update();
                            game.updateRoundNumber();
                        }
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    4: {//调试调用正确
        effectinfo: "你可以弃置任意张牌，摸等量张牌",
        prompt: "〖天书〗：是否弃置任意张牌，摸等量张牌？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[4].prompt);
                const num = player.getCards('he').length;
                if (!num || num === 0) return;
                let result = await player.chooseCard(prompt, 'he', [1, num],  function(card) {
                    return player.getCards('he').includes(card);
                }).set('ai', function(card) {
                    const taoValue = compareValue(player, 'tao');
                    const shanValue = compareValue(player, 'shan');
                    const jiuValue = compareValue(player, 'jiu');
                    const wuzhongValue = compareValue(player, 'wuzhong');
                    const wuxieValue = compareValue(player, 'wuxie');
                    const minValue = Math.min(taoValue, shanValue, jiuValue, wuzhongValue, wuxieValue);
                    const value = get.value(card, player);
                    return value <= minValue;
                }).forResult();
                if (result.bool) {
                    const cards = result.cards;
                    await player.discard(cards);
                    await player.draw(cards.length);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    5: {//调试调用正确
        effectinfo: "你可以获得造成伤害的牌",
        prompt: "〖天书〗：是否获得造成伤害的牌",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                let cards = [];
                if (Time == "useCardAfter") {
                    const evts = game.getGlobalHistory("everything", evt => {
                        if (!evt.name || evt.name !== "damage") return false;
                        const source = evt.source;
                        if (!source || source !== trigger.player) return false;
                        const evtcard = evt.card, card = evt.card;
                        if (!evtcard || !card) return false;
                        if (evtcard.name !== card.name) return false;
                        const evtcards = evt.cards;
                        if (!evtcards || evtcards.length === 0) return false;
                        const cards = trigger.cards;
                        if (!cards || cards.length === 0) return false;
                        if (cards.length !== evtcards.length) return false;
                        const evtcardsids = [], cardsids = [];
                        for (const card of evtcards) {
                            const cardid = card.cardid;
                            if (cardid) {
                                evtcardsids.push(cardid);
                            }
                        }
                        for (const card of cards) {
                            const cardid = card.cardid;
                            if (cardid) {
                                cardsids.push(cardid);
                            }
                        }
                        const evtSet = new Set(evtcardsids);
                        const cardSet = new Set(cardsids);
                        return evtSet.size === cardSet.size && [...evtSet].every(id => cardSet.has(id));
                    });
                    if (evts && evts.length > 0) {
                        cards = evts[0].cards
                    }
                } else {
                    const evts = game.getAllGlobalHistory("everything", evt => {
                        if (!evt.name || evt.name !== "damage") return false;
                        const source = evt.source;
                        const card = evt.card;
                        if (!source || !card) return false;
                        const evtcards = evt.cards;
                        if (!evtcards || evtcards.length === 0) return false;
                        return source === player;
                    });
                    if (evts && evts.length > 0) {
                        const damagCards = [];
                        const seenIds = new Set();
                        for (const evt of evts) {
                            for (const card of evt.cards) {
                                const cardId = card.cardid;
                                if (!seenIds.has(cardId)) {
                                    seenIds.add(cardId);
                                    damagCards.push(card);
                                }
                            }
                        }
                        let finddamage = [];
                        const disPilecards = ui.discardPile.childNodes;
                        for (let i = damagCards.length - 1; i >= 0; i--) {
                            const card = damagCards[i];
                            const cardId = card.cardid;
                            for (let j = 0; j < disPilecards.length; j++) {
                                if (disPilecards[j].cardid === cardId) {
                                    finddamage.push(card);
                                    break;
                                }
                            }
                            if (finddamage.length > 0) {
                                break;
                            }
                        }
                        cards = finddamage;
                    }  
                }
                if(cards.length === 0) return;
                const prompt = setColor(oltianshu_effects[5].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.gain(cards, "gain2");
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    6: {//调试调用正确
        effectinfo: "你可以视为使用一张无距离次数限制的〖杀〗",
        prompt: "〖天书〗：是否选择一名角色，视为对其使用一张无距离次数限制的〖杀〗？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                if (Time == "useCardAfter") {//排除傻逼设定，视为杀之后还复杀！压根就没有用实体牌！
                    const card = trigger.card;
                    if (card.TAFoltianshu_usesha) return;
                    if(!card.cards || card.cards.length === 0) return;
                }
                const prompt = setColor(oltianshu_effects[6].prompt);
                const Vcard = { name: 'sha', nature: '', TAFoltianshu_usesha: true };
                const canuse = player.hasUseTarget(Vcard,false);
                if (!canuse) return;
                const result = await player.chooseBool(prompt).set('ai', function() {
                    if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                        return true;
                    }
                }).forResult();
                if (result.bool) {
                    await player.chooseUseTarget(prompt, Vcard, true, false, 'nodistance');
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    7: {//调试调用正确
        effectinfo: "你可令一名角色的手牌上限+2，直到其回合结束",
        prompt: "〖天书〗：是否选择一名角色，令其手牌上限+2，直到其回合结束？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[7].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    const targets = game.filterPlayer(o => o.isAlive() && !o.hasSkill("iceqingshu_maxHandcard"));
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) >= 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, 'ice');
                    target.addTempSkill("iceqingshu_maxHandcard",{player:"phaseEnd"});
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    /*******************************天书效果二 */
    8: {//调试调用正确
        effectinfo: "你可以获得一名角色区域内的一张牌",
        prompt: "〖天书〗：是否选择一名角色，获得其区域一张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const filterTimes = [];
            if (filterTimes.includes(Time)) return;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && o.getGainableCards(player, "hej").length > 0);
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[8].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const friends = targets.filter(o => get.attitude(player, o) >= 2 && o.getCards('j').length > 0);
                    if (friends.length > 0) {
                        let hasBadjfriends = [];
                        for (const friend of friends) {
                            const jcards = friend.getCards('j').filter(card => {
                                const effect = get.effect(friend, card, player, player);
                                return effect && effect < 0;
                            });
                            if (jcards.length > 0 && !hasBadjfriends.includes(friend)) {
                                hasBadjfriends.push(friend);
                            }
                        }
                        if (hasBadjfriends.length > 0) {
                            return target === hasBadjfriends[0];
                        }
                    }
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    await player.gainPlayerCard(target, 1, 'hej', true);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    9: {//调试调用正确
        effectinfo: "你可以回复一点体力",
        prompt: "〖天书〗：是否选择回复一点体力？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const filterTimes = [];
            if (filterTimes.includes(Time)) return;
            async function useSkill() {
                if (player.isHealthy()) return;
                const prompt = setColor(oltianshu_effects[9].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.recover();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    10: {//调试调用正确
        effectinfo: "你可令此牌对你无效",
        prompt: "〖天书〗：是否令此牌对你无效？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            /***
             * 真几把抽象，次奥尼玛
             * 真几把抽象，次奥尼玛
             * 真几把抽象，次奥尼玛
             * 真几把抽象，次奥尼玛
             */
            const filterTimes = [
                "phaseUseBegin","phaseZhunbeiBegin","phaseJieshuBegin","phaseDiscardBegin","phaseDrawBegin","changeHpAfter","roundStart",
                "equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter",
            ];
            if (filterTimes.includes(Time)) return;
            async function useSkill() {
                const card = trigger.card;
                if (!card) return;
                if (Time === "useCardToTarget") {
                    const targets = trigger.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "useCardToTargeted") {
                    const evt = trigger.getParent();
                    if (!evt) return;
                    const targets = evt.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "judgeBefore" || Time === "judge") {
                    const target = trigger.player;
                    if (target !== player) return;
                }
                if (Time === "linkAfter") {
                    const target = trigger.player;
                    if (target !== player) return;
                }
                if (Time === "damageBegin1" || Time === "damageBegin2") {
                    const target = trigger.player;
                    if (target !== player) return;
                }
                const prompt = setColor(oltianshu_effects[10].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    if (Time === "damageAfter") {
                        const Num = trigger.num;
                        const target = trigger.player;
                        await target.recover(Num);
                        game.log(card,"对",trigger.player,"使用无效");
                    } else if (Time === "useCardToTarget") {
                        const targets = trigger.targets;
                        if(targets.includes(player)){
                            targets.splice(targets.indexOf(player),1);
                            game.log(card,"对",player,"使用无效");
                        }
                    } else if (Time === "useCardToBefore") {
                        trigger.cancel();
                        game.log(player,"使用",trigger.card,"无效");
                    } else if (Time === "judgeBefore") {
                        trigger.cancel();
                        game.log(player, "取消了", trigger.card, "的判定！");
                    } else if (Time === "shaMiss" || Time === "eventNeutralized") {
                        const name = trigger.card.name;
                        const nature = trigger.card.nature;
                        const color = trigger.card.color;
                        const number = trigger.card.number;
                        const target = trigger.target;
                        const suit = trigger.card.suit;
                        let VCard = {name: '', nature: '', color: '', number: '', suit: '', isCard:true};
                        if (!name) return;
                        if (!target) return;
                        if (name && typeof name === 'string') {
                            VCard.name = name;
                        }
                        if (nature && typeof nature === 'string') {
                            VCard.nature = nature;
                        }
                        if (color && typeof color === 'string') {
                            VCard.color = color;
                        }
                        if (number !== undefined) {
                            VCard.number = number;
                        }
                        if (suit && typeof suit === 'string') {
                            VCard.suit = suit;
                        }
                        player.useCard(VCard, target, false);
                        game.log(player, "取消了", trigger.card, "的失效！");
                    } else if (Time === "judge") {
                        const piles = ["cardPile", "discardPile"];
                        let findjudgeCards = [];
                        for (const pile of piles) {
                            const cards = ui[pile].childNodes;
                            for (const card of cards) {
                                const judgefunc = trigger.judge;
                                if (judgefunc(card) && judgefunc(card) > 0) {
                                    findjudgeCards.push(card);
                                }
                                if (findjudgeCards.length > 0) break;
                            }
                            if (findjudgeCards.length > 0) break;
                        }
                        //console.log("findjudgeCards",findjudgeCards);
                        if (findjudgeCards.length > 0) {
                            game.cardsGotoOrdering(findjudgeCards);
                            await player.respond(findjudgeCards[0], "highlight", event.name, "noOrdering");
                            trigger.player.judging[0] = findjudgeCards[0];
                            trigger.orderingCards.addArray(findjudgeCards);
                            game.log(trigger.player, "的判定牌改为", findjudgeCards[0]);
                        }
                    } else if (Time === "useCardToTargeted") {
                        const evt = trigger.getParent();
                        if (evt) {
                            const targets = evt.targets;
                            if (targets && targets.length > 0 && targets.includes(player)) {
                                targets.splice(targets.indexOf(player), 1);
                                game.log(card,"对",player,"使用无效");
                            }
                        }
                    } else if (Time === "linkAfter") {
                        if(player.isLinked()) {
                            player.link(false);
                            game.log(player,"解除横置。");
                        }
                    } else if (Time === "damageBegin1" || Time === "damageBegin2") {
                        trigger.cancel();
                        game.log(card,"对",player,"使用无效");
                    } else {
                        trigger.cancel();
                        game.log(card,"对",player,"使用无效");
                    }
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    11: {//调试调用正确
        effectinfo: "你可以令一名其他角色判定，若结果为黑桃，你对其造成两点雷电伤害。",
        prompt: "〖天书〗：是否令一名其他角色判定，若结果为黑桃，你对其造成两点雷电伤害？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && o != player);
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[11].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    const judgeresult = await target.judge(function (card) {
                        const suitValues = { 'spade': -2, 'heart': 1, 'club': 1, 'diamond': 1 };
                        return suitValues[get.suit(card)];
                    }).forResult();
                    const card = judgeresult.card;//BUGfixed
                    if (card && get.suit(card) === 'spade') {
                        await target.damage(2, "thunder", 'nocard', player);
                        game.log(player, "对", target, "造成两点雷电伤害！");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    12: {//调试调用正确
        effectinfo: "你可以用一张手牌替换判定牌",
        prompt: "〖天书〗：是否用一张手牌替换判定牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time !== "judge" || Time !== "judgeBefore") return;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[12].prompt);
                const result = await player.chooseCard(prompt ,"h", card => {
                    const player = _status.event.player;
                    const mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
                    if (mod2 != "unchanged") return mod2;
                    const mod = game.checkMod(card, player, "unchanged", "cardRespondable", player);
                    if (mod != "unchanged") return mod;
                    return true;
                }).set("ai", card => {
                    const trigger = _status.event.getTrigger();
                    const player = _status.event.player;
                    const judging = _status.event.judging;
                    /**
                     * bug fixed
                     */
                    const cardresult = trigger.judge(card) - trigger.judge(judging);
                    const attitude = get.attitude(player, trigger.player);
                    if (attitude == 0 || cardresult == 0) return 0;
                    if (attitude > 0) {
                        return cardresult - get.value(card) / 2;
                    } else {
                        return -cardresult - get.value(card) / 2;
                    }
                }).forResult();
                if (result.bool) {
                    await player.respond(result.cards[0], "highlight", event.name, "noOrdering");
                    player.$gain2(trigger.player.judging[0]);
                    await player.gain(trigger.player.judging[0]);
                    trigger.player.judging[0] = result.cards[0];
                    trigger.orderingCards.addArray(result.cards);
                    game.log(trigger.player, "的判定牌改为", result.cards[0]);
                    await delay(1000);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    13: {//调试调用正确
        effectinfo: "你可以获得此判定牌",
        prompt: "〖天书〗：是否获得此判定牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time !== "judge" || Time !== "judgeBefore") return;
            const cards = trigger.orderingCards;
            if (!cards || cards.length === 0) return;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[13].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.gain(cards, "gain2");
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    14: {//调试调用正确
        effectinfo: "若你不是体力上限最高的角色，你可增加一点体力上限",
        prompt: "〖天书〗：是否增加一点体力上限？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const maxHP = Math.max(...game.players.filter(o => o.isAlive()).map(o => o.maxHp));
                const isNotMaxHP = player.maxHp < maxHP || game.players.filter(o => o.isAlive() && o.maxHp === maxHP).length > 1;
                if (!isNotMaxHP) return;
                const prompt = setColor(oltianshu_effects[14].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.gainMaxHp();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    15: {//调试调用正确
        effectinfo: "你可与一名已受伤角色拼点，若你赢，你获得其两张牌",
        prompt: "〖天书〗：是否选择与一名已受伤角色拼点，若你赢，你获得其两张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && o.isDamaged() && player.canCompare(o));
                if(!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[15].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const phs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                    const ths = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                    return get.attitude(player, target) < 2 && get.number(phs[0]) > get.number(ths[0]);
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, 'ice');
                    await oltianshu.updateMarks(event,player);
                    return target;
                } else { 
                    return null;
                }
            }
            async function Compare() {//bug fixed
                const target = await useSkill();
                if (!target) return;
                let { result } = await player.chooseToCompare(target);
                if (result.bool) {
                    const he = target.getGainableCards(player, "he");
                    if(he && he.length > 0) {
                        await player.gainPlayerCard(target, [1,2], 'he', true);
                    }
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await Compare();
                }
            }
        },
    },
    16: {//调试调用正确
        effectinfo: "你可令至多两名角色各摸一张牌",
        prompt: "〖天书〗：是否令至多两名角色各摸一张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[16].prompt);
                const targets = game.filterPlayer(o => o.isAlive());
                const result = await player.chooseTarget(prompt, [1, 2], (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) >= 2;
                }).forResult();
                if (result.bool) {
                    for (const target of result.targets) {
                        player.line(target, 'ice');
                        await target.draw();
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    17: {//调试调用正确
        effectinfo: "你可以弃置两张牌，令你和一名其他角色回复一点体力",
        prompt: "〖天书〗：是否弃置两张牌，令你和一名其他角色回复一点体力？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const cards = player.getDiscardableCards(player, "he");
                if (!cards || cards.length < 2) return;
                if (player.isHealthy()) return;
                const targets = game.findPlayer(o => o != player && o.isAlive() && o.isDamaged());
                if (!targets || targets.length === 0) return;
                const friends = game.filterPlayer(o => o != player && o.isAlive() && o.isDamaged());
                const prompt = setColor(oltianshu_effects[17].prompt);
                const choosecards = await player.chooseCard(prompt, 'he', 2, function(card) {
                    return cards.includes(card);
                }).set('ai', function(card) {//bugfix
                    if(friends.length > 0) {
                        return get.value(card, player) < compareValue(player, 'tao');
                    }
                    return false;
                }).forResultCards();
                if (choosecards && choosecards.length) {
                    await player.discard(choosecards);//BUG fixed
                    const prompt22 = setColor("请选择一名角色与其均回复一点体力！");
                    const result = await player.chooseTarget(prompt22, 1, (card, player, target) => {
                        return targets.includes(target);
                    }).set('ai', target => {
                        return get.attitude(player, target) >= 2;
                    }).forResult();
                    if (result.bool) {
                        const target = result.targets[0];
                        player.line(target, 'ice');
                        await player.recover();
                        await target.recover();
                    }
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    18: {//调试调用正确
        effectinfo: "你可令此伤害值+1",
        prompt: "〖天书〗：是否令此伤害值+1？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            /**
             * 成立的组合有：
             * 你成为〖杀〗的目标时，你可令此伤害值+1
             * 你成为普通锦囊牌的目标后,你可令此伤害值+1
             * 一名角色造成伤害时,你可令此伤害值+1
             * 一名角色受到伤害时,你可令此伤害值+1
             */
            const findTimes = [
                "useCardToTarget", "useCardToTargeted","damageBegin1","damageBegin2",
            ];
            if (!findTimes.includes(Time)) return;
            async function useSkill() {
                if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                    const card = trigger.card;
                    if (!card) return;
                    if(!get.tag(card, "damage")) return;
                }
                const prompt = setColor(oltianshu_effects[18].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                        return false;
                    } else {
                        const target = trigger.player;
                        return get.attitude(player, target) < 2;
                    }
                }).forResult();
                if (result.bool) {
                    if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                        const evt = trigger.getParent();
                        if (evt) {
                            const baseDamage = evt.baseDamage;
                            if (baseDamage && typeof baseDamage === "number") {
                                trigger.getParent().baseDamage ++;
                                game.log(player, "令", trigger.card, "的伤害数值+1！");
                            }
                        }
                    } else {
                        trigger.num ++;
                        game.log(player, "令此伤害值+1！");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    19: {//调试调用正确
        effectinfo: "你可以失去一点体力，摸三张牌",
        prompt: "〖天书〗：是否失去一点体力，摸三张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[19].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return getAliveNum(player, 1) > 1;
                }).forResult();
                if (result.bool) {
                    await player.loseHp();
                    await player.draw(3);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    20: {//调试调用正确
        effectinfo: "你可防止此伤害，令伤害来源摸三张牌",
        prompt: "〖天书〗：是否防止此伤害，令伤害来源摸三张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            /**
             * 成立的组合有：
             * 你成为〖杀〗的目标时，你可防止此伤害，令伤害来源摸三张牌
             * 你成为普通锦囊牌的目标后,你可防止此伤害，令伤害来源摸三张牌
             * 一名角色造成伤害时,你可防止此伤害，令伤害来源摸三张牌
             * 一名角色受到伤害时,你可防止此伤害，令伤害来源摸三张牌
             */
            const findTimes = [
                "useCardToTarget", "useCardToTargeted","damageBegin1","damageBegin2",
            ];
            if (!findTimes.includes(Time)) return;
            async function useSkill() {
                if (Time === "useCardToTarget") {
                    const card = trigger.card;
                    if (!card) return;
                    const targets = trigger.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "useCardToTargeted") {
                    const card = trigger.card;
                    if (!card) return;
                    if(!get.tag(card, "damage")) return;
                    const evt = trigger.getParent();
                    if (!evt) return;
                    const targets = evt.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "damageBegin1" || Time === "damageBegin2") {
                    const source = trigger.source;
                    if (!source) return;
                }
                const prompt = setColor(oltianshu_effects[20].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                        const target = trigger.player;
                        return get.attitude(player, target) >= 2;
                    } else if (Time === "damageBegin1") {//这块瞎写
                        const target = trigger.player;
                        const source = trigger.source;
                        return get.attitude(player, source) >= 2 && get.attitude(player, target) < 2;
                    } else if (Time === "damageBegin2") {//这块瞎写
                        const target = trigger.player;
                        const source = trigger.source;
                        return get.attitude(player, source) >= 2 && get.attitude(player, target) < 2;
                    } else {
                        return false;
                    }
                }).forResult();
                if (result.bool) {
                    if (Time === "useCardToTarget") {
                        const targets = trigger.targets;
                        if(targets.includes(player)){
                            targets.splice(targets.indexOf(player),1);
                            game.log(trigger.card,"对",player,"使用无效");
                            await trigger.player.draw(3);
                        }
                    }
                    if (Time === "useCardToTargeted") {
                        const evt = trigger.getParent();
                        if (evt) {
                            const targets = evt.targets;
                            if (targets && targets.length > 0 && targets.includes(player)) {
                                targets.splice(targets.indexOf(player), 1);
                                game.log(trigger.card,"对",player,"使用无效");
                                await trigger.player.draw(3);
                            }
                        }
                    }
                    if (Time === "damageBegin1" || Time === "damageBegin2") {
                        trigger.cancel();
                        const source = trigger.source;
                        await source.draw(3);
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    /*******************************天书效果三 */
    21: {//调试调用正确
        effectinfo: "你可以摸四张牌并翻面",
        prompt: "〖天书〗：是否摸四张牌并翻面？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[21].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw(4);
                    await player.turnOver();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    22: {//调试调用正确
        effectinfo: "你可以摸三张牌，弃置一张牌",
        prompt: "〖天书〗：是否摸三张牌，弃置一张牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[22].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw(3);
                    await player.chooseToDiscard(1, 'he', true);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    23: {//调试调用正确
        effectinfo: "你可以摸牌至体力上限（至多摸五张）",
        prompt: "〖天书〗：是否摸牌至体力上限（至多摸五张）？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const cards = player.getCards('h');
                const num = player.maxHp;
                const maxnum = Math.min(num, 5);
                if (cards.length >= maxnum) return;
                const prompt = setColor(oltianshu_effects[23].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw(maxnum - cards.length);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    24: {//调试调用正确
        effectinfo: "你可令一名角色非锁定技失效直到其下个回合开始",
        prompt: "〖天书〗：是否令一名角色非锁定技失效直到其下个回合开始？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && !o.hasSkill("fengyin"));
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[24].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    target.addTempSkill("fengyin",{player:"phaseBegin"});
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    25: {//调试调用正确
        effectinfo: "你可令一名角色摸两张牌并翻面",
        prompt: "〖天书〗：是否令一名角色摸两张牌并翻面？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive());
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[25].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const friends = targets.filter(o => {
                        return get.attitude(player, o) >= 2 && o.isTurnedOver() && 
                        (!o.hasSkillTag("noTurnover", false, player) || !o.hasSkillTag("noturn", false, player));
                    });
                    if(friends && friends.length > 0) return target === friends[0];
                    const enemies = targets.filter(o => {
                        return get.attitude(player, o) < 2 && !o.isTurnedOver() && 
                        (!o.hasSkillTag("noTurnover", false, player) || !o.hasSkillTag("noturn", false, player));
                    });
                    if(enemies && enemies.length > 0) return target === enemies[0];
                    return false;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    await target.draw(2);
                    await target.turnOver();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    26: {//调试调用正确
        effectinfo: "你可获得两张非基本牌",
        prompt: "〖天书〗：是否获得两张非基本牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[26].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    let gainCards = [];
                    const piles = ["cardPile", "discardPile"];
                    for (const pile of piles) {
                        if (!ui[pile]) continue;
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const type = get.type(card);
                            if(type && type !== 'basic' && !gainCards.includes(card)) {
                                gainCards.push(card);
                            }
                            if (gainCards.length >= 2) break;
                        }
                        if (gainCards.length >= 2) break;
                    }
                    if (gainCards.length > 0) {
                        await player.gain(gainCards, "gain2");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    27: {//调试调用正确
        effectinfo: "你可获得两张锦囊牌",
        prompt: "〖天书〗：是否获得两张锦囊牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[27].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    let gainCards = [];
                    const piles = ["cardPile", "discardPile"];
                    for (const pile of piles) {
                        if (!ui[pile]) continue;
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const type = get.type2(card);
                            if(type && type === 'trick' && !gainCards.includes(card)) {
                                gainCards.push(card);
                            }
                            if (gainCards.length >= 2) break;
                        }
                        if (gainCards.length >= 2) break;
                    }
                    if (gainCards.length > 0) {
                        await player.gain(gainCards, "gain2");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    28: {//调试调用正确
        effectinfo: "你可令你对一名角色使用牌无次数或距离限制直到你的回合结束",
        prompt: "〖天书〗：是否选择一名角色，对其使用牌无次数或距离限制直到你的回合结束？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => {
                    if(!player.hasSkill("iceqingshu_useCard")) {
                        return o.isAlive();
                    } else {
                        return o.isAlive() && !player.getStorage('iceqingshu_useCard').includes(o);
                    }
                });
                const prompt = setColor(oltianshu_effects[28].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    if(!player.hasSkill("iceqingshu_useCard")) {
                        player.addTempSkill("iceqingshu_useCard", {player:"phaseEnd"});
                    }
                    if(player.hasSkill("iceqingshu_useCard")) {
                        if (!player.getStorage('iceqingshu_useCard').includes(target)) {
                            player.getStorage('iceqingshu_useCard').push(target);
                        }
                        player.markSkill("iceqingshu_useCard");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    29: {//调试调用正确
        effectinfo: "你可交换两名角色装备区的牌",
        prompt: "〖天书〗：是否交换两名角色装备区的牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && !o.isMin() && o.countCards("e") > 0);
                if (!targets || targets.length === 0) return;
                const hastargets = game.filterPlayer(o => o.isAlive());
                if (!hastargets || hastargets.length < 2) return;
                const prompt = setColor(oltianshu_effects[29].prompt);
                const result = await player.chooseTarget(prompt, 2,(card, player, target) => {
                    if (target.isMin()) return false;
                    if (ui.selected.targets.length == 0) return true;
                    if (ui.selected.targets.length == 1) {
                        const selectedTarget = ui.selected.targets[0];
                        return selectedTarget.countCards("e") > 0 || target.countCards("e") > 0;
                    }
                    return false;
                }).set('ai', target => {
                    const player = _status.event.player;
                    let enemyslist = [];
                    const enemys = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) < 2);
                    const friends = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) >= 2);
                    for (let enemy of enemys) {
                        if (enemy.countCards("e") > 0) {
                            enemyslist.push(enemy);
                        }
                    }
                    enemyslist.sort((a, b) => b.countCards("e") - a.countCards("e"));
                    friends.sort((a, b) => a.countCards("e") - b.countCards("e"));
                    if (enemyslist.length === 0) return false;
                    const F = friends[0];
                    const E = enemyslist[0];

                    if (F && F.countCards("e") >= E.countCards("e")) return false;
                    if (ui.selected.targets.length === 0) {
                        return E;
                    } else if (ui.selected.targets.length === 1) {
                        const selectedTarget = ui.selected.targets[0];
                        if (selectedTarget === E) {
                            return F;
                        } else {
                            return E;
                        }
                    }
                    return false;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    await targets[0].swapEquip(targets[1]);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    30: {//调试调用正确
        effectinfo: "你可交换两名角色手牌区的牌",
        prompt: "〖天书〗：是否交换两名角色手牌区的牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && !o.isMin() && o.countCards("h") > 0);
                if (!targets || targets.length === 0) return;
                const hastargets = game.filterPlayer(o => o.isAlive());
                if (!hastargets || hastargets.length < 2) return;
                const prompt = setColor(oltianshu_effects[30].prompt);
                const result = await player.chooseTarget(prompt, 2,(card, player, target) => {
                    if (target.isMin()) return false;
                    if (ui.selected.targets.length == 0) return true;
                    if (ui.selected.targets.length == 1) {
                        const selectedTarget = ui.selected.targets[0];
                        return selectedTarget.countCards("h") > 0 || target.countCards("h") > 0;
                    }
                    return false;
                }).set('ai', target => {
                    const player = _status.event.player;
                    let enemyslist = [];
                    const enemys = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) < 2);
                    const friends = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) >= 2);
                    for (let enemy of enemys) {
                        if (enemy.countCards("h") > 0) {
                            enemyslist.push(enemy);
                        }
                    }
                    enemyslist.sort((a, b) => b.countCards("h") - a.countCards("h"));
                    friends.sort((a, b) => a.countCards("h") - b.countCards("h"));
                    if (enemyslist.length === 0) return false;
                    const F = friends[0];
                    const E = enemyslist[0];
                    
                    if (F && F.countCards("h") >= E.countCards("h")) return false;
                    if (ui.selected.targets.length === 0) {
                        return E;
                    } else if (ui.selected.targets.length === 1) {
                        const selectedTarget = ui.selected.targets[0];
                        if (selectedTarget === E) {
                            return F;
                        } else {
                            return E;
                        }
                    }
                    return false;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    await targets[0].swapHandcards(targets[1]);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
};
export const oltianshu = {
    name: "天书",
    update: '2025年6月19日',
    triggers: oltianshu_triggers,//天书时机
    effects: oltianshu_effects,//天书效果
    combination_sum: {
        name: "天书总组合",
        天书总数: 0,
        天书类型一: { 数量: 0, 组合: [], },
        天书类型二: { 数量: 0, 组合: [], },
        天书类型三: { 数量: 0, 组合: [], },
    },
    combination_use: {
        name: "天书净组合",
        info1: "当然有的抽象的，但我觉得合理的我都写了比如：",
        info2: "你成为普通锦囊牌的目标后，你可令此伤害值+1(过滤伤害牌)",
        info3: "失去手牌后，你可以获得造成伤害的牌。(历史记录造成伤害的牌在弃牌堆中)",
        info4: "你成为普通锦囊牌的目标后，你可防止此伤害，令伤害来源摸三张牌。(过滤伤害牌)",
        info5: "你使用的牌被抵消后，你可令此牌对你无效。(重新视为使用此牌)",
        info6: "等等，反正应该这些都可以执行，但避免不了有的地方字符写错，出现bug，如有遇见可以反馈。",
        天书总数: 0,
        天书类型一: { 数量: 0, 组合: [], },
        天书类型二: { 数量: 0, 组合: [], },
        天书类型三: { 数量: 0, 组合: [], },
    },
    /**
     * 获取天书黑名单
     * @param {*} num - 对应的天书时机。
     * @returns  - 带有黑名单的数组
     */
    getblacklist: function(num) {
        const blacklist = {
            4: ['10', '12', '13', '18', '20'],
            5: ['12', '13', '18', '20'],
            6: ['10', '12', '13', '18', '20'],
            7: ['10', '12', '13', '18', '20'],
            8: ['12', '13', '18', '20'],
            9: ['12', '13'],
            10: ['12', '13', '18', '20'],
            11: ['18', '20'],
            12: ['12', '13', '18', '20'],
            13: ['18', '20'],
            14: ['10', '12', '13', '18', '20'],
            15: ['10', '12', '13', '18', '20'],
            16: ['12', '13', '18', '20'],
            17: ['10', '12', '13', '18', '20'],
            18: ['12', '13'],
            19: ['12', '13', '18', '20'],
            20: ['10', '12', '13', '18', '20'],
            21: ['10', '12', '13', '18', '20'],
            22: ['12', '13'],
            23: ['12', '13'],
        }
        let getblacklist = [];
        const triggers_hasblacklist = Object.keys(blacklist);
        const numStr = String(num);
        if (triggers_hasblacklist.includes(numStr)) {
            getblacklist = blacklist[numStr];
        }
        return getblacklist;
    },
    /**
     * 统计总天书信息
     */
    setCombination_sum: function() {
        const 天书列表1 = [] ,天书列表2 = [], 天书列表3 = [];
        for(const key in oltianshu.triggers) {
            const info1 = oltianshu.triggers[key].triggerinfo;
            const type1 =  oltianshu.triggers[key].type;
            for(const key in oltianshu.effects) {
                const info2 = oltianshu.effects[key].effectinfo;
                const type2 =  oltianshu.effects[key].type;
                if (type1 === type2) {
                    const info = [info1 + "，" + info2 + "。"];
                    if (type1 === 1) 天书列表1.push(info);
                    if (type1 === 2) 天书列表2.push(info);
                    if (type1 === 3) 天书列表3.push(info);
                }
            }
        }
        oltianshu.combination_sum.天书总数 = 天书列表1.length + 天书列表2.length + 天书列表3.length;
        oltianshu.combination_sum.天书类型一.数量 = 天书列表1.length;
        oltianshu.combination_sum.天书类型一.组合 = 天书列表1;
        oltianshu.combination_sum.天书类型二.数量 = 天书列表2.length;
        oltianshu.combination_sum.天书类型二.组合 = 天书列表2;
        oltianshu.combination_sum.天书类型三.数量 = 天书列表3.length;
        oltianshu.combination_sum.天书类型三.组合 = 天书列表3;
    },
    /**
     * 统计可用天数信息
     */
    setCombination_use: function() {
        const 天书列表1 = [] ,天书列表2 = [], 天书列表3 = [];
        for(const key in oltianshu.triggers) {
            /**
             * 排除黑名单
             */
            const blacklist = oltianshu.getblacklist(key);
            const info1 = oltianshu.triggers[key].triggerinfo;
            const type1 =  oltianshu.triggers[key].type;
            for(const key in oltianshu.effects) {
                if (blacklist.includes(key)) continue;
                const info2 = oltianshu.effects[key].effectinfo;
                const type2 =  oltianshu.effects[key].type;
                if (type1 === type2) {
                    const info = [info1 + "，" + info2 + "。"];
                    if (type1 === 1) 天书列表1.push(info);
                    if (type1 === 2) 天书列表2.push(info);
                    if (type1 === 3) 天书列表3.push(info);
                }
            }
        }
        oltianshu.combination_use.天书总数 = 天书列表1.length + 天书列表2.length + 天书列表3.length;
        oltianshu.combination_use.天书类型一.数量 = 天书列表1.length;
        oltianshu.combination_use.天书类型一.组合 = 天书列表1;
        oltianshu.combination_use.天书类型二.数量 = 天书列表2.length;
        oltianshu.combination_use.天书类型二.组合 = 天书列表2;
        oltianshu.combination_use.天书类型三.数量 = 天书列表3.length;
        oltianshu.combination_use.天书类型三.组合 = 天书列表3;
    },
    /**
     * 设置天书翻译
     */
    setTranslate: function() {
        //设置所有天书技能组合的翻译和描述
        const tsTimesekys = Object.keys(oltianshu_triggers);
        const tsEffectsekys = Object.keys(oltianshu_effects);
        const namestartsWith = "TAFoltianshu_";
        let skillnames = [];
        for (let i = 0; i < tsTimesekys.length; i++) {
            for (let j = 0; j < tsEffectsekys.length; j++) {
                let skillname = namestartsWith + tsTimesekys[i] + tsEffectsekys[j];
                skillnames.push(skillname);
            }
        }
        if (skillnames.length > 0) {
            let TXT = setColor("一本神秘的〖天书〗！");
            for (let name of skillnames) {
                if (!lib.translate[name]) {
                    lib.translate[name] = "天书";
                }
                if (!lib.translate[name + "_info"]) {
                    lib.translate[name + "_info"] = TXT;
                }
            }
        }
    },
    /**
     * 根据类型获得该类型下的所有触发时机列表
     */
    get_triggers : async function(type){
        const Times = new Set();
        const triggers = oltianshu.triggers;
        const tianshuNums = Object.keys(triggers);
        for (const num of tianshuNums) {
            const gettype = triggers[num].type;
            if (type === gettype) {
                const trigger = triggers[num].trigger;
                for (const key in trigger) {
                    const timelist = trigger[key];
                    if (Array.isArray(timelist) && timelist.length > 0) {
                        timelist.forEach(time => Times.add(time));
                    }
                }
            }
        }
        return [...Times];
    },
    /**
     * 我这边设定的是 是否有全部南华老仙的技能的玩家，
     * 如果不是天书的拥有者，则返回true
     */
    filterOwner :function (player) {
        const skilllist = ['iceqingshu','iceshoushu','icehedao'];
        for (let skill of skilllist) {
            if (!player.hasSkill(skill)) return true;
        }
        return false;
    },
    /**
     * 为非南华老仙玩家添加天书技能的设定
     * 并获得可以显示看到天书信息的设定！
     */
    addTianshu: async function(player,skill) {
        if (!skill.startsWith("TAFoltianshu_")) return;
        const key = oltianshu.filterOwner(player);
        if (key) {
            player.addSkill(skill);
            player.update();
        } else {
            return '亲，您本身就是南华老头就不要调用这个破函数额了哦！';
        }
    },
    /**
     * 移除天书并还原天书技能描述
     */
    removeTianshu : async function (player,skill) {
        if (!skill.startsWith("TAFoltianshu_")) return;
        const TXT = setColor("一本神秘的〖天书〗！");
        lib.translate[skill + "_info"] = TXT;
        delete player[skill + '_use'];
        player.unmarkSkill(skill);
        player.removeSkill(skill);
        player.update();
    },
    /**
     * 〖天书〗标记的更新
     * 〖天书〗技能的描述对除技能拥有者以外的其他角色不可见直到拥有者发动之
     * 非〖天书〗拥有者的移除天书技能及可以看到天书信息的技能
     */
    updateMarks : async function(event,player) {
        const name = event.name;
        if (!name || typeof name !== 'string') return;
        if (!lib.skill[name]) return;
        if (!name.startsWith("TAFoltianshu_")) return;
        if (!player[event.name + '_use']) return;
        player[event.name + '_use']--;
        player.markSkill(event.name);
        const key = oltianshu.filterOwner(player);
        if (key) {
            //如果不是天书的拥有者，直接移除天书技能
            await oltianshu.removeTianshu(player,name);
        } else {
            //让瞎子看技能描述！
            const TXT = lib.skill[event.name].TAFoltianshu_info;
            if (!TXT || typeof TXT !== 'string') return;
            const num = player[event.name + '_use'];
            if (num < player.icehedao_tianshu) {
                lib.translate[event.name + "_info"] = TXT;
            }
        }
        player.update();
    },
    /**
     * 选择〖天书〗ing!
     * 注意选择〖天书〗触发时机后，要根据“已选择的〖天书〗触发时机类型”，从对应类型的天书效果中进行筛选！
     */
    chooseButtonX : async function(player, string) {
        if (!player.oltianshu_textone) player.oltianshu_textone = '';
        if (!player.oltianshu_choicestype) player.oltianshu_choicestype = null;
        if (!player.oltianshu_choicesNum) player.oltianshu_choicesNum = 0;
        if (!player.oltianshu_priority) player.oltianshu_priority = 0;
        function getRandomKeys(keys, count) {
            const shuffled = keys.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }
        let text1 = '', text2 = '', text3 = '', TXT = '';
        let number_times = [], number_effects = [];
        if (string === "times") {
            TXT = setColor("请为〖天书〗选择一个时机：");
            const object = oltianshu.triggers;
            const keys = Object.keys(object);
            const RandomKeys = getRandomKeys(keys, 3);
            number_times = RandomKeys;
            text1 = object[RandomKeys[0]].triggerinfo;
            text2 = object[RandomKeys[1]].triggerinfo;
            text3 = object[RandomKeys[2]].triggerinfo;

        } else if (string === "effects") {
            TXT = setColor("请为〖天书〗选择一个效果：<br/>") + player.oltianshu_textone;
            const object = oltianshu.effects;
            /**
             * 选择根据选择的时机类型，随机选择对应类型的三种天书效果
             */
            const type = player.oltianshu_choicestype;
            let keys_bytype = [];
            for (let key in object) {
                if (object[key].type === type) {
                    keys_bytype.push(key);
                }
            }
            /**
             * 天书黑名单过滤
             */
            const num = player.oltianshu_choicesNum;
            const blacklist = oltianshu.getblacklist(num);
            console.log(keys_bytype,num,blacklist);
            /**
             * 获取排除黑名单数的最终数组
             */
            const filteredKeys = keys_bytype.filter(key => !blacklist.includes(key));
            //console.log(filteredKeys);
            const RandomKeys = getRandomKeys(filteredKeys, 3);
            //console.log(RandomKeys);
            number_effects = RandomKeys;
            text1 = object[RandomKeys[0]].effectinfo;
            text2 = object[RandomKeys[1]].effectinfo;
            text3 = object[RandomKeys[2]].effectinfo;
        }
        const list = [ text1, text2, text3];
        const chooseButton = await player.chooseButton([TXT,
            [list.map((item, i) => {return [i, item];}),"textbutton",],
        ]).set("filterButton", function (button) {
            if (button.link === 0) {
                return true;
            } else if (button.link === 1) {
                return true;
            } else if (button.link === 2) {
                return true;
            }
        }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
            const numlist = [0, 1, 2];
            const choices = numlist[Math.floor(Math.random() * numlist.length)];
            switch (button.link) {
                case 0: return choices === 0;
                case 1: return choices === 1;
                case 2: return choices === 2;
            }
        }).forResult();
        if (chooseButton.bool) {
            const choices = chooseButton.links;
            if (choices.includes(0)) {
                if (string === "times") {
                    player.oltianshu_textone = text1;
                    player.oltianshu_choicestype = oltianshu.triggers[number_times[0]].type;
                    player.oltianshu_choicesNum = number_times[0];
                    return [number_times[0],oltianshu.triggers[number_times[0]]];
                } else if (string === "effects") {
                    return [number_effects[0],oltianshu.effects[number_effects[0]]];
                }
            } else if (choices.includes(1)) {
                if (string === "times") {
                    player.oltianshu_textone = text2;
                    player.oltianshu_choicestype = oltianshu.triggers[number_times[1]].type;
                    player.oltianshu_choicesNum = number_times[1];
                    return [number_times[1],oltianshu.triggers[number_times[1]]];

                } else if (string === "effects") {
                    return [number_effects[1],oltianshu.effects[number_effects[1]]];
                }
            } else if (choices.includes(2)) {
                if (string === "times") {
                    player.oltianshu_textone = text3;
                    player.oltianshu_choicestype = oltianshu.triggers[number_times[2]].type;
                    player.oltianshu_choicesNum = number_times[2];
                    return [number_times[2],oltianshu.triggers[number_times[2]]];
                } else if (string === "effects") {
                    return [number_effects[2],oltianshu.effects[number_effects[2]]];
                }
            }
        } else {
            return {};
        }
    },
    /**
     * 自动为lib.skill添加天书技能
     */
    chooseButton : async function(player) {
        const skillslist = player.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
        const TSLimit = player.icehedao_tianshu;
        //若获得天书达到上限，先移除一个已经用的天书技能！
        if (skillslist && skillslist.length >= TSLimit) {
            let list = [];
            let skilllist = [];
            let Usableist = [];
            for (let skill of skillslist) {
                //获取可使用的次数！
                const num = player[skill + '_use'];
                const text = lib.skill[skill].TAFoltianshu_info;
                let info = setColor("〖可使用次数：〗");
                if (text) {
                    info += num + "次" + "<br/>" + text;
                    list.push(info);
                    skilllist.push(skill);
                    Usableist.push(num);//用于AI判断！
                }
            }
            /**
             * 凸(艹皿艹 )，获得天书时！不是〖青书〗ing吗？非要把描述放在〖合道〗！艹！
             */
            let TEXT = setColor("〖合道〗") + "请移除一册天书：";
            const chooseButton = await player.chooseButton([TEXT,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                return true;
            }).set("selectButton", 1).set("ai", function (button) {
                let numlist = Usableist;
                const minNum = Math.min(...numlist);
                const index = numlist.indexOf(minNum);
                return button.link === index;
            }).set("forced", true).forResult();
            if (chooseButton.bool) {
                if (player.hasSkill("icehedao")) player.logSkill("icehedao");
                const choices = chooseButton.links;
                const skill = skilllist[choices];
                await oltianshu.removeTianshu(player,skill);
            }
        }
        const Times = await oltianshu.chooseButtonX(player, "times");
        const Effects = await oltianshu.chooseButtonX(player, "effects");
        player.oltianshu_priority ++;
        let skillsobj = lib.skill;
        let namestartsWith = "TAFoltianshu_";
        /**
         * 1.生成天书技能ID：
         */
        let skillname = namestartsWith + Times[0] + Effects[0];
        /**
         * 1.获取天书的优先级；设定触发天书的优先级，后来者居上原则！
         */
        let prioritnum = player.oltianshu_priority;
        /**
         * 1.获取天书trigger：天书的触发器
         * 2.获取天书canuse ：非本体的二级filter函数
         * 3.获取天书content：天书效果content函数
         */
        const trigger_bytimes = Times[1].trigger, canuse_bytimes = Times[1].canuse, content_byeffects = Effects[1].content;
        /** 获取这本天书的技能描述 */
        const text1 = Times[1].triggerinfo, text2 = Effects[1].effectinfo;
        const TXT = text1 + "," + text2 + "。";
        /**
         * 添加新的天书技能
         */
        if (!skillsobj[skillname]) {
            lib.skill[skillname] = {
                audio: "ext:银竹离火/audio/skill:2",
                mark: true,
                marktext: "<font color= #EE9A00>天书</font>",
                TAFoltianshuname: skillname,//天书ID
                TAFoltianshu_info: TXT,//天书描述
                intro: {
                    mark: function(dialog, storage, player) {//天书设定不使用别人看不见只能看到天书使用的次数。
                        const num = player[skillname + '_use'];
                        const setnum = player.icehedao_tianshu;
                        const info = lib.skill[skillname].TAFoltianshu_info;
                        if (!num || num <= 0 || !setnum || !info) {
                            dialog.addText(setColor("这是一本空白的〖天书〗！"));
                        } else {
                            if (player.isUnderControl(true)) {
                                dialog.addText(info);
                            } else {
                                if (num >= setnum) {
                                    dialog.addText(setColor("这是一本神秘的〖天书〗，切勿窥探天机！"));
                                } else {
                                    dialog.addText(info);
                                }
                            }
                        }
                    },
                    markcount: function(storage, player) {
                        const num = player[skillname + '_use'] || 0;
                        return num;
                    },
                    onunmark: true,
                    name: "<font color= #EE9A00>天书</font>",
                },
                trigger: trigger_bytimes,
                direct: true,
                init: async function(player, skill) {
                    //Bug fix：非南华老仙角色天书只能使用一次，标记数设定为1！
                    const key = oltianshu.filterOwner(player);
                    const setnum = player.icehedao_tianshu;
                    if (setnum) {
                        if (!player[skillname + '_use']) player[skillname + '_use'] = player.icehedao_tianshu;
                    } else {
                        if (key) {
                            if (!player[skillname + '_use']) player[skillname + '_use'] = 1;
                        } else {
                            if (!player[skillname + '_use']) player[skillname + '_use'] = 2;
                        }
                    }
                    let TXT = setColor("获得了一本神秘的〖天书〗！");
                    player.markSkill(skill);
                    player.update();
                    game.log(player, TXT);
                },
                filter: function(event, player) {
                    return player[skillname + '_use'] > 0;
                },
                canuse:canuse_bytimes, 
                content:content_byeffects,
                "_priority": prioritnum,
            };
        }
        /**
         * 让系统方便一会儿！
         */
        await delay(1000);
        await player.addSkill(skillname);
        player.markSkill(skillname);
        player.update();
        /**
         * 不知道返回什么返回这个技能ID吧！
         */
        return skillname;
    },
};

oltianshu.setTranslate();

oltianshu.setCombination_sum();

oltianshu.setCombination_use();