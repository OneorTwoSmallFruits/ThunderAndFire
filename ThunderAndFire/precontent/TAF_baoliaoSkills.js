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

const { icefangcan, choosefangcan } = asyncs.qun.ice_jiaxu;//蝶贾诩

const { initicelianjie, initicejiangxian } = asyncs.qun.ice_huangfusong;//武皇甫嵩

const { initfirelieqiong, initfirezhanjue } = asyncs.shu.fire_huangzhong;//神黄忠


/** @type { importCharacterConfig['skill'] } */
const TAF_baoliaoSkills = {
    //武吕蒙
    waterjuxian: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            ignoredHandcard: function(card, player) {
                if (card.hasGaintag("waterjuxian")) return true;
            },
            cardDiscardable: function(card, player, name) {
                if (card.hasGaintag("waterjuxian")) return false;
            },
        },
        trigger: {
            player: ["useCardToPlayered"],
            global: ["phaseAfter"],
        },
        forced: true,
        init:async function(player, skill) {
            if (!player.getJuxianCards) player.getJuxianCards = function() {
                const piles = ["cardPile"];
                let gainCards = [];
                for (const pile of piles) {
                    const cards = ui[pile].childNodes;
                    for (const card of cards) {
                        const number = get.number(card);
                        if (number === 6) {
                            if (!gainCards.includes(card)) gainCards.push(card);
                            if (gainCards.length > 0) break;
                        }
                    }
                    if (gainCards.length > 0) break;
                }
                return gainCards;
            };
        },
        filter: function(event, player, name) {
            if (name == "useCardToPlayered") {
                return event.targets && event.targets.length == 1;
            } else if (name == "phaseAfter") {
                player.removeGaintag("waterjuxian");
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time !== "useCardToPlayered") return;
            const cards = player.getJuxianCards();
            if (cards && cards.length > 0) {
                await player.gain(cards, "gain2");
                player.addGaintag(cards, "waterjuxian");
            } else {
                const evt = await player.draw();
                player.addGaintag(evt.result, "waterjuxian");
            }
        },
        "_priority": 0,
    },
    watershiji: {
        audio: "ext:银竹离火/audio/skill:4",
        mod: {
            cardUsable: function (card, player, num) {
                if (card.watershiji) return Infinity;
            },
            aiValue: function(player, card, num) {
                const number = get.number(card, player);
                if(!number) return num;
                if (number !== 6) return num;
                const color = get.color(card, player);
                let Vcard;
                switch (color) {
                    case "red": Vcard = { name: "sha", nature: "fire", isCard: true, watershiji: true }; break;
                    case "black": Vcard = { name: "sha", nature: "thunder", isCard: true, watershiji: true }; break;
                    default: return num;
                }
                return Math.max(num, get.value(Vcard, player));
            },
            aiUseful: function() {
                return lib.skill.watershiji.mod.aiValue.apply(this, arguments);
            },
        },
        enable:["chooseToUse","chooseToRespond"],
        usable:2,
        unique: true,
        locked: false,
        filter: function (event, player, name) {
            const cards = player.getCards("hes").filter(card => get.number(card) === 6);
            if (cards.length === 0) return false;
            const shalist = [
                { name: "sha", nature: "thunder", isCard: true, watershiji: true },
                { name: "sha", nature: "fire", isCard: true, watershiji: true }
            ];
            const filter = event.filterCard;
            return shalist.some(Vard => filter(get.autoViewAs(Vard, "unsure"), player, event));
        },
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const number = get.number(card, player);
            if (number !== 6) return false;
            const shalist = [
                { name: "sha", nature: "thunder", isCard: true, watershiji: true },
                { name: "sha", nature: "fire", isCard: true, watershiji: true }
            ];
            return shalist.some(Vard => filter(get.autoViewAs(Vard, "unsure"), player, event));
        },
        viewAs: function (cards, player) {
            const viewTypeMap = {
                red: { name: "sha", nature: "fire" },
                black: { name: "sha", nature: "thunder" },
            };
            if (cards.length) {
                if (get.number(cards[0], player) === 6) {
                    const color = get.color(cards[0]);
                    const type = viewTypeMap[color];
                    if (type) {
                        return { ...type, isCard: true, watershiji: true };
                    }
                }
            }
            return null;
        },
        position: "hes",
        selectCard: 1,
        complexCard: true,
        check: function (card) {
            const player = _status.event.player;
            return get.value(card, player) < compareValue(player, 'tao');
        },
        precontent: async function () {//不计入次数限制
            const evt = _status.event;
            evt.getParent().addCount = false;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result) {
            //无
        },
        hiddenCard: function (player, name) {
            const cards = player.getCards("hes").filter(card => get.number(card) === 6);
            if (name == "sha") return cards.length > 0;
        },
        ai:{
            respondSha: true,
            skillTagFilter: function (player, tag) {
                if (tag !== 'respondSha') return;
                const cards = player.getCards("hes").filter(card => get.number(card) === 6);
                if (!cards || cards.length === 0) return false;
                return true;
            },
            order: function (item, player) {
                let order = 0;
                if (player && _status.event.type == "phase") {
                    const cards = player.getCards("hes").filter(card => get.number(card) === 6);
                    if (!cards || cards.length === 0) return order;
                    const sortCard = cards.sort((a,b) => get.value(a, player) - get.value(b, player));
                    if (get.value(sortCard[0], player) >= compareValue(player, 'tao')) return order;
                    const Vardlist = [
                        { name: "sha", nature: "thunder", isCard: true, watershiji:true },
                        { name: "sha", nature: "fire", isCard: true, watershiji:true },
                    ];
                    let canUselist = [];
                    for (const Vcard of Vardlist) {
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            canUselist.push(Vcard);
                        }
                    }
                    let ordernumlist = [];
                    for (let Vcard of canUselist) {
                        const Vorder = get.order(Vcard);
                        if (Vorder && Vorder > order && !ordernumlist.includes(Vorder)) {
                            ordernumlist.push(Vorder);
                        }
                    }
                    if (!ordernumlist || ordernumlist.length == 0) return order;
                    const maxVorder = Math.max(...ordernumlist) + 1.5;
                    return maxVorder;
                }
                return order;
            },
        },
        group: "watershiji_viewAs",
        subSkill: {
            viewAs: {
                audio: "watershiji",
                mod: {
                    targetInRange: function(card, player, target) {
                        const Vtargets = player.getStorage("watershiji_viewAs");
                        if (Vtargets.includes(target)) return true;
                    },
                },
                mark: true,
                marktext:"<font color= #48D1CC>识计</font>",
                intro:{
                    content: "players",
                    onunmark:true,
                    name:"<font color= #48D1CC>识计</font>",
                },
                trigger: {
                    player: ["useCardAfter","useCardToBefore"]
                },
                locked: false,
                direct:true,
                init:async function(player, skill) {
                    if (!player.getShijiVcard) player.getShijiVcard = {watershiji_viewAs: false};
                    if (!player.getShijifilter) player.getShijifilter = { cards:[], targets:[] };
                },
                filter: function(event, player, name) {
                    if (name == "useCardAfter") {
                        const number = get.number(event.card)
                        if (!number || number !== 6) return false;
                        const targets = game.filterPlayer(o => o.isAlive());
                        if (targets.length === 0) return false;
                        return targets.some(o => player.canUse(event.card, o,false, true)) && get.type(event.card) !== "equip";
                    } else if (name == "useCardToBefore") {
                        const Vtargets = player.getStorage("watershiji_viewAs");
                        if (!Vtargets || Vtargets.length === 0) return false;
                        const cards = event.cards;
                        if (!cards || cards.length === 0) return false;
                        const targets = event.targets;
                        if (!targets || targets.length === 0) return false;
                        const Vcard = player.getShijiVcard;
                        return Vcard && Vcard.watershiji_viewAs && targets.every(o => Vtargets.includes(o) && player.canUse(Vcard, o,false, true));
                    }
                },
                async content(event, trigger, player) {
                    //"你使用点数为6的非装备牌结算完成后，若你可继续使用此牌指定目标(无距离限制)，则你可摸一张牌，若如此做：下次使用牌指定对应目标时视为使用此牌。",
                    const Time = event.triggername;
                    if (Time === "useCardAfter") {
                        const targets = game.filterPlayer(o => {
                            return o.isAlive() && player.canUse(trigger.card, o, false, true);
                        });
                        if (targets.length === 0) return;
                        const cardname = (get.translation(trigger.card.nature) || "") + get.translation(trigger.card.name);
                        const promptX = cardname + "可指定的目标(无距离限制)有：" + targets.map(o => get.translation(o)).join(",");
                        const prompt = setColor("〖识计〗：" + "<br>" + promptX + "<br>" + "是否摸一张牌，若如此做：下次使用牌指定对这些目标时视为使用" + cardname + "？");
                        const result = await player.chooseBool(prompt).set('ai', function() {
                            const effectTs = targets.filter(target => {
                                const effect = get.effect(target, trigger.card, player, player);
                                return effect && effect > 0;
                            });
                            if (effectTs.length === 0) return false;
                            const cards = player.getCards('hes');
                            if (cards.length === 0) return false;
                            const effectCards = new Set();
                            for (const card of cards) {
                                for(const target of effectTs) {
                                    const effect = get.effect(target, card, player, player);
                                    if (effect && effect > 0 && player.canUse(card, target, false, true)) {
                                        effectCards.add(card);
                                    }
                                }
                            }
                            const effectCardsArray = [...effectCards];
                            return effectCardsArray.length > 0;
                        }).forResult();
                        if (result.bool) {
                            player.logSkill(event.name);
                            const Vcard = {name: get.name(trigger.card), nature: get.nature(trigger.card), isCard: true, watershiji_viewAs: true};
                            player.getShijiVcard = Vcard;
                            for(const target of targets) {
                                if(!player.getStorage(event.name).includes(target)) {
                                    player.line(target, 'ice');
                                    player.markAuto(event.name, [target]);
                                }
                            }
                        }
                    } else if (Time === "useCardToBefore") {
                        player.logSkill(event.name,trigger.targets);
                        //player.getShijiVcard.watershiji_viewAs = false;
                        trigger.cancel();
                        player.getShijifilter = {
                            cards: trigger.cards,
                            targets: trigger.targets,
                        };
                        await player.gain(trigger.cards, "gain2");
                        //debugger;
                        const Vcard = player.getShijiVcard;
                        const cardname = (get.translation(Vcard.nature) || "") + get.translation(Vcard.name);
                        const prompt = "请将" + get.translation(trigger.card) + "当作" + cardname + "对" + trigger.targets.map(o => get.translation(o)).join(",") + "使用或打出。";
                        const next = player.chooseToUse(true);
                        next.set("prompt", prompt);
                        next.set('norestore', true);
                        next.set('_backupevent', 'watershiji_backup');
                        next.set('addCount', false);
                        next.set('custom', {
                            add: {},
                            replace: {},
                        });
                        next.backup('watershiji_backup');
                    }
                },
            },
            backup: {
                charlotte: true,
                filterCard: function(card, player) {
                    return player.getShijifilter.cards.includes(card);
                },
                selectCard: function() {
                    const player = _status.event.player;
                    return player.getShijifilter.cards.length;
                },
                position: "hes",
                viewAs: function (cards, player) {
                    return player.getShijiVcard;
                },
                filterTarget: function(card, player, target) {
                    return player.getShijifilter.targets.includes(target);
                },
                selectTarget: function() {
                    const player = _status.event.player;
                    return player.getShijifilter.targets.length;
                },
                precontent: async function () {
                    const player = _status.event.player;
                    player.getShijiVcard = {watershiji_viewAs: false};
                    player.getShijifilter = { cards:[], targets:[], InRange:[] };
                    player.removeStorage('watershiji_viewAs');
                    player.unmarkSkill('watershiji_viewAs');
                },
                log: false,
                "_priority": -25,
            },
        },
    },
    waterzhanxian: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= #48D1CC>战贤</font>",
        limited: true,
        skillAnimation: "epic",
        animationColor: "thunder",
        init: async function (player, skill) {
            if (!player.getZhanxianCards) player.getZhanxianCards = function() {
                let PileCards = [];
                const piles = ["cardPile", "discardPile"];
                for (const pile of piles) {
                    if (!ui[pile]) continue;
                    const cards = ui[pile].childNodes;
                    for (const card of cards) {
                        const number = get.number(card);
                        if (number === 6) {
                            if (!PileCards.includes(card)) PileCards.push(card);
                        }
                    }
                }
                const targets = game.filterPlayer(o => {
                    return o.getCards("ej").length > 0;
                });
                let targetCards = [];
                for (const target of targets) {
                    const cards = target.getCards("ej");
                    for (const card of cards) {
                        const number = get.number(card);
                        if (number === 6) {
                            if (!targetCards.includes(card)) targetCards.push(card);
                        }
                    }
                }
                return PileCards.concat(targetCards);
            };
            if (!player.storage.waterzhanxian) player.storage.waterzhanxian === false;
        },
        intro: {
            content: "limited",
            name: "<font color= #48D1CC>战贤·限定技</font>",
        },
        enable: "phaseUse",
        unique:true,
        filter:function (event, player) {
            return !player.storage.waterzhanxian;
        },
        async content(event, trigger, player) {
            player.storage.icejiangxian = true;
            const cards = player.getZhanxianCards();
            if (cards && cards.length > 0) {
                await player.gain(cards, "gain2");
            }   
            player.awakenSkill(event.name);
            player.addTempSkill("waterzhanxian_source");
        },
        ai:{
            order: 15,
            threaten:1.5,
            result: {
                player: function (player, target) {
                    const cards = player.getCards('hes');
                    const Zhanxiancards = player.getZhanxianCards();
                    const cards_set = new Set(cards.concat(Zhanxiancards));
                    const enemies = game.filterPlayer(o => get.attitude(player, o) < 2);
                    let canUseCards = [];
                    for(let card of cards_set) {
                        if (player.hasUseTarget(card) && player.hasValueTarget(card) && player.getUseValue(card) > 0) {
                            canUseCards.push(card);
                        }
                    }
                    if(!canUseCards || canUseCards.length === 0) return 0;
                    const sortcanUseEnemies = enemies.sort((a, b) => {
                        const cardsA = a.getCards('hes');
                        const cardsB = b.getCards('hes');
                        if(cardsA.length !== cardsB.length) return  cardsA.length - cardsB.length;
                        return a.hp - b.hp;
                    });
                    return canUseCards.length > sortcanUseEnemies[0].hp? 1 : 0;
                },
            },
        },
        subSkill: {
            source: {
                trigger:{
                    player: "useCardAfter",
                },
                charlotte: true,
                firstDo: true,
                unique: true,
                direct: true,
                filter: function (event, player) {
                    const card = event.card;
                    const number = get.number(card);
                    return number && number === 6;
                },
                async content(event, trigger, player) {
                    const prompt = "〖战贤〗：是否选择对一名角色造成一点伤害并摸一张牌？";
                    const result = await player.chooseTarget(prompt, 1, function (card, player, target) {
                        const targets = game.filterPlayer();
                        return targets.includes(target);
                    }).set('ai', function (target) {
                        const shouyi = get.damageEffect(target, player, player, "damage");
                        return shouyi && shouyi > 0;
                    }).forResult();
                    if (result.bool) {
                        const target = result.targets[0];
                        player.line(target, 'water');
                        await target.damage(1, "nocard");
                        player.draw();
                    }
                },
                sub: true,
                sourceSkill: "waterzhanxian",
                "_priority": Infinity,
            },
        },
        "_priority": -25,
    },
    //OL南华老仙
    iceqingshu: {
        audio: "ext:银竹离火/audio/skill:3",
        trigger:{
            player: ["phaseZhunbeiBegin","phaseJieshuBegin"],
        },
        forced:true,
        init:async function(player, skill) {
            //用于显示选择天书时机后，选择天书效果的已选择时机的信息提示
            if (!player.oltianshu_textone) player.oltianshu_textone = '';
            //记录选择的时机类型，再选择天书效果时，从对应类型的天书效果中选择
            if (!player.oltianshu_choicestype) player.oltianshu_choicestype = null;
            if (!player.oltianshu_choicesNum) player.oltianshu_choicesNum = 0;
            //设定触发天书的优先级，后来者居上原则！
            if (!player.oltianshu_priority) player.oltianshu_priority = 0;
            if (!player.oltianshu_obj) player.oltianshu_obj  = oltianshu;//单纯赋值天书对象
            //游戏开始时，您老获得一本天书！
            player.logSkill("iceqingshu");
            await oltianshu.chooseButton(player);
        },
        async content(event, trigger, player) {
            const skill = await oltianshu.chooseButton(player);
            console.log(skill);
        },
        "_priority": 1314,//小于合道！！！
    },
    iceshoushu: {
        audio: "ext:银竹离火/audio/skill:3",
        enable: "phaseUse",
        usable: 1,
        filter: function (event, player) {
            if (!player.hasSkill("iceqingshu")) return false;
            if (!player.hasSkill("icehedao")) return false;
            const setnum = player.icehedao_tianshu;
            if (!setnum) return false;
            const skillslist = player.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
            if (!skillslist || skillslist.length === 0) return false;
            for (let skill of skillslist) {
                if (player[skill + '_use'] && player[skill + '_use'] >= player.icehedao_tianshu) {
                    return true;
                }
            }
        },
        filterTarget: function(card, player, target) {
            const skillslist = target.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
            return target !== player && (!skillslist || skillslist.length === 0);
        },
        selectTarget: 1,
        async content(event, trigger, player) {
            const target = event.targets[0];
            const skillslist = player.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
            let list = [];
            let skilllist = [];
            for (let skill of skillslist) {
                if (player[skill + '_use'] && player[skill + '_use'] >= player.icehedao_tianshu) {
                    const text = lib.skill[skill].TAFoltianshu_info;
                    if (text) {
                        list.push(text);
                        skilllist.push(skill);
                    }
                }
            }
            if (list.length === 0) return;
            let TEXT = setColor("〖授术〗") + "请选择一册天书：";
            const chooseButton = await player.chooseButton([TEXT,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                return true;
            }).set("selectButton", 1).set("ai", function (button) {
                const targets = game.players.filter(o => o !== player && get.attitude(player, o) >= 2);
                if (targets.length === 0) return false;
                const choicesnum = list.length;
                const randomIndex = Math.floor(Math.random() * choicesnum);
                return button.link === randomIndex;
            }).set("forced", true).forResult();
            if (chooseButton.bool) {
                const choices = chooseButton.links;
                const skill = skilllist[choices];
                await oltianshu.removeTianshu(player,skill);
                await oltianshu.addTianshu(target,skill);
            }
        },
        ai: {
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
            order: 13,
            result: {
                target: function(player,target){
                    if (!player.hasSkill("icehedao") || !player.hasSkill("iceqingshu")) return;
                    const num = player.icehedao_tianshu;
                    if (!num) return;
                    const skillslist = player.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
                    function key(player) {
                        if (!skillslist || skillslist.length === 0) return false;
                        for (let skill of skillslist) {
                            if (player[skill + '_use'] && player[skill + '_use'] >= player.icehedao_tianshu) {
                                return true;
                            }
                        }
                        return false;
                    }
                    if (!key(player)) return;
                    if (skillslist.length <= 1) return 0;
                    const friends = game.filterPlayer(
                        o => o.isAlive() && o !== player && get.attitude(player, o) >= 2 && 
                        o.countSkills().filter(skill => skill.startsWith("TAFoltianshu_").length === 0)
                    );
                    if (!friends || friends.length === 0) return 0;
                    return 10;
                },
            },
        },
        "_priority": 0,
    },
    icehedao: {
        audio: "ext:银竹离火/audio/skill:3",
        mark: true,
        marktext: "<font color= #EE9A00>合道</font>",
        intro: {
            mark: function(dialog, storage, player) {
                const num = player.icehedao_tianshu;
                dialog.addText(setColor("至多拥有" + num + "本〖天书〗！"));
            },
            markcount: function(storage, player) {
                return player.icehedao_tianshu;
            },
            onunmark: true,
            name: "<font color= #EE9A00>合道</font>",
        },
        trigger:{
            player: ["enterGame","dyingAfter"],
            global: ["phaseBefore"],
        },
        firstDo: true,
        direct:true,
        init:async function(player, skill) {
            if (!player.icehedao_tianshu) player.icehedao_tianshu = 2;
            const newname = skill + '_die';
            if (!lib.skill[newname]) lib.skill[newname] = {};
            lib.skill[newname] = {
                trigger:{
                    player:["dieBefore"],
                },
                firstDo: true,
                superCharlotte: true,
                charlotte: true,
                silent: true,
                priority: Infinity,
                direct: true,
                filter:function (event, player) {
                    const targets = game.players.filter(o => o.isAlive() && o !== player && o.countSkills().filter(skill => skill.startsWith("TAFoltianshu_")).length > 0);
                    return targets.length > 0;
                },
                async content(event, trigger, player) {
                    const targets = game.players.filter(o => o.isAlive() && o !== player && o.countSkills().filter(skill => skill.startsWith("TAFoltianshu_")).length > 0);
                    for (let target of targets) {
                        player.line(target, "ice");
                        const skillslist = target.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
                        for (let skill of skillslist) {
                            target.removeSkill(skill);
                            let TEXT = setColor("失去了一本神秘的〖天书〗！");
                            game.log(target, TEXT);
                        }
                    }
                }
            };
            player.addSkill(newname);
            player.markSkill(skill);
            if (game.phaseNumber > 0 || game.roundNumber > 0) {//中途加入南华老仙
                const targets = game.players.filter(o => o.isAlive() && o !== player);
                for (let target of targets) {
                    player.line(target, "ice");
                    if (!target.icehedao_tianshu) target.icehedao_tianshu = 1;
                }
            };
            player.update();
        },
        filter:function (event, player, name) {
            if (name == 'dyingAfter') {
                return player.isAlive() && player.icehedao_tianshu !== 3;
            } else {
                return (event.name != 'phase' || game.phaseNumber == 0);
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'dyingAfter') {
                player.logSkill(event.name);
                player.icehedao_tianshu = 3;
                player.markSkill(event.name);
            } else {
                const targets = game.players.filter(o => o.isAlive() && o !== player);
                player.logSkill(event.name,targets);
                for (let target of targets) {
                    player.line(target, "ice");
                    if (!target.icehedao_tianshu) target.icehedao_tianshu = 1;
                }
            }
        },
        "_priority": Infinity,
    },
    iceqingshu_maxHandcard: {
        mod: {
            maxHandcard: function (player, num) {
                return num + 2;
            },
        },
        charlotte: true,
        unique: true,
        "_priority": 0,
    },
    iceqingshu_useCard: {
        marktext: "<font color= #EE9A00>用牌</font>",
        onremove: true,
        intro: {
            content: "players",
            onunmark: true,
            name: "<font color= #EE9A00>天书·无距离与次数限制</font>",
        },
        mod: {
            targetInRange: function(card, player, target) {
                if (player.getStorage('iceqingshu_useCard').includes(target)) {
                    return true;
                }
            },
            cardUsableTarget: function(card, player, target) {
                if (player.getStorage('iceqingshu_useCard').includes(target)) return true;
            },
        },
        charlotte: true,
        unique: true,
        "_priority": 0,
    },
    //神黄忠
    firelieqiong: {
        audio: "ext:银竹离火/audio/skill:2",
        marktext:"<font color= #FF2400>裂穹</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #FF2400>裂穹</font>",
        },
        trigger: {
            global: ["damageEnd"],
        },
        init: async function(player, skill) {
            await initfirelieqiong(player, skill);
        },
        filter: function (event, player, name) {
            if (name === 'damageEnd') {
                return event.source && event.source === player && event.player.isAlive();
            } else {
                return false;
            }
        },
        persevereSkill: true,
        forced: false,
        locked: false,
        direct: true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === 'damageEnd') {
                const p = player;
                const t = trigger.player;
                const thp = t.hp;
                const tmhp = t.maxHp;
                const thes = t.getCards('h').length
                const thsdis = Math.ceil(thes / 2);

                const att = get.attitude(p, t);
                const list = [
                    "〖力烽〗：令" + get.translation(t) + "随机弃置" + get.cnNumber(thsdis) + "张手牌。",
                    "〖地机〗：令" + get.translation(t) + "下一次受到的伤害+1直到" + get.translation(t) + "回合结束。",
                    "〖中枢〗：令" + get.translation(t) + "使用的下一张牌无效直到" + get.translation(t) + "回合结束。",
                    "〖气海〗：令" + get.translation(t) + "不能使用或打出红桃牌直到" + get.translation(t) + "回合结束。",
                    "〖天冲〗：令" + get.translation(t) + "失去剩余" + get.cnNumber(thp) + "点体力值，若" + get.translation(t) + "因此死亡，你+1体力上限。",
                ];
                let result = await player.chooseButton(["〖裂穹〗：请选择一项执行之！",
                    [list.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) { //力烽
                        return t.isAlive() && thsdis > 0;
                    } else if (button.link === 1) { //地机
                        return t.isAlive() && !t.storage.firelieqiong_JS_DJ;
                    } else if (button.link === 2) {//中枢
                        return t.isAlive() && !t.storage.firelieqiong_JS_ZS;
                    } else if (button.link === 3) {//气海
                        return t.isAlive() && !t.storage.firelieqiong_JS_QH;
                    } else if (button.link === 4) {//天冲
                        return t.isAlive() && thp > 0 && t.storage.firelieqiong_JS_TC;
                    }
                }).set("selectButton", 1).set("ai", function (button) {
                    /**
                     * 选项一：如果对方牌超过其体力值上限4+2=6张，保底三张，则收益=1
                     * 不想了就这吧
                     */
                    let shouyi = 0;
                    if (att >= 2) {
                        shouyi = 0;
                    } else {
                        if (t.storage.firelieqiong_JS_TC) shouyi = 5;
                        if (!t.storage.firelieqiong_JS_QH) shouyi = 4;
                        if (thes >= tmhp + 2 || thsdis >= 3) shouyi = 1;
                        if (!t.storage.firelieqiong_JS_DJ) shouyi = 2;
                        if (!t.storage.firelieqiong_JS_ZS) shouyi = 3;
                        if (thes > 0 && thsdis > 0) shouyi = 1;
                        else shouyi = 0;
                    }
                    if (shouyi === 0) return;
                    switch (button.link) {
                        case 0:
                            if (shouyi == 1) return true;
                        case 1:
                            if (shouyi == 2) return true;
                        case 2:
                            if (shouyi == 3) return true;
                        case 3:
                            if (shouyi == 4) return true;
                        case 4:
                            if (shouyi == 5) return true;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    const choices = result.links;
                    if (!player.getStorage('firelieqiong').includes(t) && !t.storage.firelieqiong_JS_TC) {
                        t.storage.firelieqiong_JS_TC = true;
                        player.markAuto('firelieqiong', [t]);
                    }
                    if (!t.hasSkill('firelieqiong_JS')) t.addSkill('firelieqiong_JS');
                    if (choices.includes(0)) {//力烽
                        t.storage.firelieqiong_JS_LF = true;
                        let cards = t.getCards('h');
                        if (thsdis > 0) {
                            await t.discard(cards.randomGets(thsdis), true);
                        }
                    } else if (choices.includes(1)) {//地机
                        t.storage.firelieqiong_JS_DJ = true;
                    } else if (choices.includes(2)) {//中枢
                        t.storage.firelieqiong_JS_ZS = true;
                    } else if (choices.includes(3)) {//气海
                        t.storage.firelieqiong_JS_QH = true;
                    } else if (choices.includes(4)) {//天冲
                        await t.loseHp(thp);
                        if (game.getGlobalHistory("everything", evt => {
                            if (evt.name != "die" || evt.player != t) return false;
                            return evt.reason?.getParent() == event;
                        }).length > 0) {
                            await player.gainMaxHp();
                            game.log(player, "获得了", "#g1点体力上限");
                        }
                    }
                }
            } else {
                return;
            }
        },
        subSkill: {
            JS: {
                mark: true,
                marktext: "<font color= #FF2400>伤</font>",
                onremove: true,
                charlotte: true,
                unique: true,
                intro: {
                    content:function (storage, player) {
                        let result = "";
                        if (player.storage.firelieqiong_JS_LF) {
                            result += "<font color= #FF2400>力烽</font>:已随机弃置手牌。<br>";
                        }
                        if (player.storage.firelieqiong_JS_DJ) {
                            result += "<font color= #FF2400>地机</font>:下一次受到的伤害+1直到你的回合结束。<br>";
                        }
                        if (player.storage.firelieqiong_JS_ZS) {
                            result += "<font color= #FF2400>中枢</font>:使用的下一张牌无效直到你的回合结束。<br>";
                        }
                        if (player.storage.firelieqiong_JS_QH) {
                            result += "<font color= #FF2400>气海</font>：不能使用或打出红桃牌直到你的回合结束。";
                        }
                        if (!player.storage.firelieqiong_JS_LF && !player.storage.firelieqiong_JS_DJ && !player.storage.firelieqiong_JS_ZS && !player.storage.firelieqiong_JS_QH) {
                            result = "请注意您已被击伤，直到您的回合结束后恢复……";
                        }
                        return result;
                    },
                    name: "<font color= #FF2400>裂穹·击伤</font>",
                },
                sub: true,
                sourceSkill: "firelieqiong",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    firezhanjue: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            targetInRange: function (card, player, target, now) {
                if (card.name == 'sha' && player.storage.firezhanjuedamage) return true;
            },
        },
        marktext:"<font color= #FF2400>斩决</font>",
        intro:{
            content:function(event, player){
                if(player.storage.firezhanjuedamage){
                    return '此阶段使用的下一张〖杀〗无距离限制且不能被响应。';
                } else if(player.storage.firezhanjuerecover){
                    return '此阶段下一次造成伤害后，回复等量体力值。';
                } else {
                    return '<font color= #FF2400>斩决已失效</font>';
                }
            },
            onunmark:true,
            name:"<font color= #FF2400>斩决</font>",
        },
        trigger: {
            player: ["phaseUseBegin", "useCard"],
            source: "damageEnd",
        },
        persevereSkill: true,
        unique: true,
        forced: false,
        locked: false,
        direct: true,
        init: async function(player, skill) {
            if (!player.storage.firezhanjue_damage) player.storage.firezhanjue_damage = false;
            if (!player.storage.firezhanjue_recover) player.storage.firezhanjue_recover = false;
            await initfirezhanjue(player, skill);
        },
        filter: function (event, player, name) {
            if (name === 'phaseUseBegin') {
                return true;
            } else if (name === 'useCard') {
                if (!player.storage.firezhanjuedamage) return;
                return event.card.name == "sha" && player.storage.firezhanjuedamage;
            } else if (name === 'damageEnd') {
                if (event.source === undefined) return;
                return event.num > 0 && player.storage.firezhanjuerecover;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const php = player.hp;
            const pdhp = player.getDamagedHp();
            if (Time === 'phaseUseBegin') {
                const list = [
                    "〖选项一〗：摸" + get.cnNumber(php) + "张牌，此阶段使用的下一张〖杀〗无距离限制且不能被响应；",
                    "〖选项二〗：摸" + get.cnNumber(pdhp) + "张牌，此阶段下一次造成伤害后，回复等量体力值。",
                ];
                let result = await player.chooseButton(["〖斩决〗：请选择一项执行之！",
                    [list.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return php > 0;
                    }
                    if (button.link === 1) {
                        return pdhp > 0;
                    }
                }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                    const player = _status.event.player;
                    let shouyi = firezhanjueAI(player);                  
                    switch (button.link) {
                        case 0:
                            if (shouyi == 1) return true;
                        case 1:
                            if (shouyi == 2) return true;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    const choices = result.links;
                    if (choices.includes(0)) {
                        player.draw(php);
                        player.storage.firezhanjuedamage = true;
                    } else if (choices.includes(1)) {
                        player.draw(pdhp);
                        player.storage.firezhanjuerecover = true;
                    }
                    player.markSkill("firezhanjue");
                }
                return;
            } else if (Time === 'useCard') {
                player.logSkill(event.name);
                trigger.directHit.addArray(game.players);
                game.log(trigger.card, "不可被响应");
                player.storage.firezhanjuedamage = false;
                player.unmarkSkill("firezhanjue");
                return;
            } else {
                let num = trigger.num;
                player.logSkill(event.name);
                player.recover(num);
                player.storage.firezhanjuerecover = false;
                player.unmarkSkill("firezhanjue");
                return;
            }
        },
        ai: {
            directHit_ai: true,
            skillTagFilter: function (player, tag, arg) {
                if (tag !== "directHit_ai") return;
                if (player.storage.firezhanjue_damage) {
                    if (_status.event.getParent().name == "firezhanjue" &&
                        arg.card && arg.card.name == "sha" &&
                        arg.target == _status.event.target) return true;
                } else {
                    return false;
                }
            },
            threaten: function (player, target) {
                var att = get.attitude(player, target);
                let threatennum = 1;
                if (player.storage.firezhanjuedamage) {
                    threatennum += 2;
                } else if (player.storage.firezhanjuerecover) {
                    threatennum += 0.5;
                }
                if (att < 2) {
                    return threatennum;
                } else {
                    return 0.5;
                }
            },
        },
        "_priority": 0,
    },
    //神贾诩，贾老板
    icejiandai:{
        audio:"ext:银竹离火/audio/skill:4",
        trigger:{
            player:["turnOverBefore"],
        },
        unique:true,
        forced:true,
        init:async function(player, skill) {
            if (!player.isTurnedOver()) {
                player.turnOver(true);
                player.logSkill(skill);
            }
            //console.log(countSkills(player));
        },
        filter:function(event, player, name) { return player.isTurnedOver() },
        async content(event, trigger, player) { trigger.cancel() },
        "_priority":0,
    },
    icefangcan: {
        audio:"ext:银竹离火/audio/skill:4",
        intro:{
            content:"已记录：$",
        },
        trigger:{
            global:["loseAfter","loseAsyncAfter","cardsDiscardAfter","equipAfter","phaseEnd"],
        },
        unique:true,
        locked:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === 'phaseEnd') {
                const list = player.getStorage('icefangcan');
                if (!list || list.length === 0) return false;
                return true;
            } else {
                const cards = event.getd();
                for (let i of cards) {
                    if (get.type(i) === 'trick' || get.tag(i, 'damage')) {
                        return true;
                    }
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === 'phaseEnd') {
                const list = player.getStorage('icefangcan');
                let count = 0;
                for (let name of list) {
                    let Vcard = { name: name, nature: '', isCard: true };
                    if (player.hasUseTarget(Vcard)) {
                        count++;
                    }
                }
                let text1 = setColor("〖选项一〗：获得一张记录牌。");
                let text2 = setColor("〖选项二〗：无可使用记录牌。");
                if (count > 0) {
                    text2 = setColor("〖选项二〗：使用一张记录牌。");
                }
                let getVcards = [ text1, text2, ];
                let TXT = setColor("〖纺残〗");
                const chooseButton = await player.chooseButton([TXT,
                    [getVcards.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return true;
                    } else if (button.link === 1) {
                        return count > 0;
                    }
                }).set("selectButton", 1).set("ai", function (button) {
                    let order = 0;
                    for (let name of list) {
                        let Vcard = { name: name, nature: '', isCard: true };
                        const Vorder = get.order(Vcard);
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            if (Vorder >= order) order = Vorder;
                        }
                    }
                    switch (button.link) {
                        case 0:
                            return order === 0;
                        case 1:
                            return order > 0;
                    }
                }).forResult();
                if (chooseButton.bool) {
                    player.logSkill(event.name);
                    const choices = chooseButton.links;
                    if (choices.includes(0)) {
                        await choosefangcan(player, "gain");
                    } else if (choices.includes(1)) {
                        await choosefangcan(player, "use");
                    }
                }
                player.removeStorage('icefangcan');
                player.unmarkSkill("icefangcan");
            } else {
                await icefangcan(trigger, player);
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    if (player.hasSkill('icejiandai')) return 1.5;
                    else return 3;
                } else {
                    return 0.5;
                }
            },
        },
        "_priority":0,
    },
    icejuehun:{
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            global: ["changeHpAfter", "gainMaxHpAfter", "loseMaxHpAfter", "dyingAfter"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: function (player) {
            if (!player.icejuehun) player.icejuehun = 0;
        },
        filter: function (event, player, name) {
            if (!player.icejuehun) player.icejuehun = 0;
            if (name === 'dyingAfter') return event.player.isAlive();
            else return event.player.isHealthy();
        },
        async content(event, trigger, player) {
            player.logSkill(event.name);
            player.icejuehun ++;
            const newCard = game.createCard('icewuqibingfa', 'spade', 2);
            player.$gain2(newCard);
            await player.equip(newCard);
            const number = player.icejuehun;
            if (number % 2 === 0 && number > 0) {
                const list = player.countSkills();
                if (list && list.length > 0) {
                    if (player.hasSkill('icejiandai')) {
                        player.removeSkill('icejiandai');
                        game.log(player, "失去了技能", "#g【缄殆】");
                        return;
                    } else if (player.hasSkill('icefangcan')) {
                        player.removeSkill('icefangcan');
                        game.log(player, "失去了技能", "#g【纺残】");
                        return;
                    } else if (player.hasSkill('icejuehun')) {
                        player.removeSkill('icejuehun');
                        game.log(player, "失去了技能", "#g【绝殙】");
                        return;
                    }
                }
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    if (player.hasSkill('icejiandai')) return 1;
                    else return 1.5;
                } else {
                    return 0.5;
                }
            },
        },
        "_priority":0,
    },
    iceluoshu:{
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            player: ["phaseZhunbeiBegin"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: function (player) {
            if (!player.luoshu_used) player.luoshu_used = [];
            const names = ['乱武', '间书', '拥嫡', '兴衰', '焚城', '奇谋', '雄异', '凶算', '造王', '纷殕'];
            let setlist = [];
            const skillslist = lib.skill;
            if (skillslist) {
                const keys = Object.keys(skillslist);
                for (const skill of keys) {
                    const info = get.info(skill);
                    if(info) {
                        if (lib.translate[skill] && lib.translate[skill + "_info"]) {
                            const skillData = skillslist[skill];
                            if (skillData.limited) {
                                const fanyi = lib.translate[skill];
                                if (names.includes(fanyi)) {
                                    setlist.push(skill);
                                }
                            }
                        }
                    }
                }
            }
            if (luoshukey) {
                if (setlist.length > 0) {
                    if (!player.luoshu_list) player.luoshu_list = setlist;
                }
            } else {
                const listskills = ['reluanwu', 'jianshu', 'yongdi', 'xingshuai', 'dcfencheng', 'reqimou', 'xiongyi', 'xiongsuan', 'olzaowang', 'icefendang'];
                if (!player.luoshu_list) player.luoshu_list = listskills;
            }
        },
        filter: function (event, player) {
            if (!player.luoshu_used) player.luoshu_used = [];
            const listskills = player.luoshu_list || [];
            if (!listskills || listskills.length === 0) return false;
            const used = player.luoshu_used;
            const unused = listskills.filter(i => !used.includes(i));
            return unused.length > 0;
        },
        async content(event, trigger, player) {
            const listskills = player.luoshu_list;
            const unused = listskills.filter(i => !player.luoshu_used.includes(i));
            let lists = [];
            if (unused.length >= 3) {
                const randomSkills = unused.randomGets(3);
                lists = [...randomSkills , 'cancel2'];
            } else {
                lists = [...unused, 'cancel2'];
            }
            let TXT = setColor("〖络殊〗：请选择获得其中一个技能：");
            const result = await player.chooseControl(lists).set('prompt', TXT).set ("ai", control => {
                const getskill = lists.filter(option => option !== 'cancel2');
                return getskill.randomGet();
            }).forResult();
            if (result.control !== 'cancel2') {
                await player.addSkill(result.control);
                player.luoshu_used.push(result.control);
            }

        },
        "_priority":0,
    },
    icefendang:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        limited:true,
        skillAnimation:"epic",
        animationColor:"thunder",
        intro:{
            content:"limited",
        },
        trigger:{
            global:["roundStart"],
        },
        unique:true,
        direct:true,
        init:function (player) {
            player.storage.icefendang = false;
        },
        filter:function (event, player) {
            const targets = game.players.filter(o => o.isAlive());
            return !player.storage.icefendang && targets.length > 0;
        },
        async content(event, trigger, player) {
            let TXT = setColor("〖纷殕〗：是否令所有角色选择两项：1.翻面；2.摸两张牌；3.于本轮获得技能〖鸩毒〗？");
            const result = await player.chooseBool(TXT).set('ai', function() {
                const enemys = game.filterPlayer(function(current) {
                    return current.isAlive() && get.attitude(player, current) < 2 && current.isTurnedOver();
                });
                if (enemys.length > 0) return false;
                return true;
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name);
                const targets = game.players.filter(o => o.isAlive());
                player.line(targets, 'thunder');
                for (let target of targets) {
                    let text = setColor("〖纷殕〗请选择两项执行之：");
                    let text1 = setColor("〖选项一〗：翻面。");
                    let text2 = setColor("〖选项二〗：摸两张牌。");
                    let text3 = setColor("〖选项三〗：获得技能〖鸩毒〗。");
                    const list = [text1, text2, text3];
                    const chooseButton = await target.chooseButton([text,
                        [list.map((item, i) => {return [i, item];}),"textbutton",],
                    ]).set("filterButton", function (button) {
                        return true;
                    }).set("selectButton", 2).set('forced',true).set("ai", function (button) {
                        if (button.link === 0) {
                            if (target.isTurnedOver() && !target.hasSkillTag("noTurnover")) return true;
                            return false;
                        } else if (button.link === 1) {
                            return true;
                        } else if (button.link === 2) {
                            if (target.isTurnedOver() && !target.hasSkillTag("noTurnover")) return false;
                            return true;
                        }
                    }).forResult();
                    if (chooseButton.bool) {
                        const choices = chooseButton.links;
                        if (choices.includes(0)) await target.turnOver();
                        if (choices.includes(1)) await target.draw(2);
                        if (choices.includes(2)) await target.addTempSkill('zhendu', { global: 'roundStart' });
                    }
                }
            }
        },
        ai:{
            threaten:1.5,
        },
        "_priority":0,
    },
    //武皇甫嵩
    icechaozhen:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["phaseZhunbeiBegin","dying"],
        },
        unique:true,
        locked:false,
        direct:true,
        filter:function (event, player) {
            const CardsInPile = ui.cardPile.childNodes.length > 0;
            const hasEjPlayers = game.filterPlayer(current => {
                return current.getCards("ej").length > 0;
            });
            return CardsInPile || hasEjPlayers.length > 0;
        },
        async content(event, trigger, player) {
            function specifyMin(num = 1,from = 'Pile') {
                let lists = [];
                if (from === 'Pile') {
                    lists = [...ui.cardPile.childNodes];
                } else if (from === 'Field') {
                    const hasEjPlayers = game.filterPlayer(current => {
                        return current.getCards("ej").length > 0;
                    });
                    if (hasEjPlayers.length === 0) return [];
                    let findedCards = [];
                    for(let p of hasEjPlayers) {
                        const ejCards = p.getCards("ej");
                        findedCards.push(...ejCards);
                    }
                    lists = findedCards;
                } else {
                    return [];
                }
                //console.log("〖朝镇〗cards", lists);
                const numbers = lists.map(card => get.number(card));
                const targetValue =  Math.min(...numbers);
                const filteredCards = lists.filter(card => get.number(card) === targetValue);
                const gainnum = Math.min(num, filteredCards.length);
                if (filteredCards.length > 0) {
                    const shuffled = filteredCards.sort(() => Math.random() - 0.5);
                    const selectedCards = shuffled.slice(0, gainnum);
                    //await player.gain(selectedCards, "gain2");
                    return selectedCards;
                } else {
                    return [];
                }
            }
            const list = [
                setColor("〖选项一〗：从〖场上〗获得一张点数最小的牌，若你获得的是A，你回复一点体力且此技能本回合失效。"),
                setColor("〖选项二〗：从〖牌堆〗获得一张点数最小的牌，若你获得的是A，你回复一点体力且此技能本回合失效。"),
            ];
            const chooseButton = await player.chooseButton([setColor("〖朝镇〗") ,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    const hasEjPlayers = game.filterPlayer(current => {
                        return current.getCards("ej").length > 0;
                    });
                    return hasEjPlayers && hasEjPlayers.length > 0;
                } else if (button.link === 1) {
                    return ui.cardPile.childNodes.length > 0;;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                function getLink() {
                    let findedCards = [];
                    let enemysCards = [];
                    let friendsCards = [];
                    const hasEjPlayers = game.filterPlayer(current => {
                        return current.getCards("ej").length > 0;
                    });
                    if (hasEjPlayers && hasEjPlayers.length > 0) {
                        for(let p of hasEjPlayers) {
                            const ejCards = p.getCards("ej");
                            findedCards.push(...ejCards);
                        }
                    }
                    const hasEnemys = game.filterPlayer(current => {
                        return current.getCards("ej").length > 0 && get.attitude(player, current) < 2;
                    });
                    if (hasEnemys && hasEnemys.length > 0) {
                        for(let p of hasEnemys) {
                            const ejCards = p.getCards("ej");
                            enemysCards.push(...ejCards);
                        }
                    }
                    const hasFriends = game.filterPlayer(current => {
                        return current.getCards("ej").length > 0 && get.attitude(player, current) >= 2;
                    });
                    if (hasFriends && hasFriends.length > 0) {
                        for(let p of hasFriends) {
                            const ejCards = p.getCards("ej");
                            friendsCards.push(...ejCards);
                        }
                    }
                    if(enemysCards && enemysCards.length > 0) {
                        const findnumber_one = enemysCards.filter(card => get.number(card) === 1 && get.type(card) !== "delay");
                        if (findnumber_one && findnumber_one.length > 0) return 0;
                    }
                    if(findedCards && findedCards.length > 0) {//场上是否有点数一的牌
                        const findnumber_one = findedCards.filter(card => get.number(card) === 1);
                        if (findnumber_one && findnumber_one.length > 0) return 0;
                    }
                    const cards = specifyMin(1,'Pile');//牌堆是否有点数一的牌
                    if(cards && cards.length > 0) {
                        const number = get.number(cards[0]);
                        if (number === 1) {
                            return 1;
                        }
                    }
                    if(findedCards && findedCards.length > 0) {//均找不到点数一，且场上有牌。
                        if(enemysCards.length > 0 &&  friendsCards.length === 0) {
                            const dealycards = enemysCards.filter(card => get.type(card) === "delay");
                            const equipcards = enemysCards.filter(card => get.type(card) === "equip");
                            if(equipcards.length > dealycards.length) return 0;
                        }
                        if(enemysCards.length === 0 && friendsCards.length > 0) {
                            const dealycards = friendsCards.filter(card => get.type(card) === "delay");
                            const equipcards = friendsCards.filter(card => get.type(card) === "equip");
                            if(dealycards.length > equipcards.length) return 0;
                        }
                        if(enemysCards.length > 0 && friendsCards.length > 0) {
                            const dealycards_e = enemysCards.filter(card => get.type(card) === "delay");
                            const equipcards_e = enemysCards.filter(card => get.type(card) === "equip");
                            const dealycards_f = friendsCards.filter(card => get.type(card) === "delay");
                            const equipcards_f = friendsCards.filter(card => get.type(card) === "equip");
                            if(equipcards_e.length > equipcards_f.length || dealycards_f.length > dealycards_e.length) return 0;
                        }
                        return 1;
                    } else { 
                        return 1;
                    }
                }
                switch (button.link) {
                    case 0:
                        if (getLink() !== 0) return false;
                        if (getLink() == 0) return true;
                    case 1:
                        if (getLink() !== 1) return false;
                        if (getLink() == 1) return true;
                }
            }).set(/*'forced', target !== player*/).forResult();
            if (chooseButton.bool) {
                player.logSkill(event.name);
                const choices = chooseButton.links;
                if (choices.includes(0)) {
                    const cards = specifyMin(1,'Field');
                    if (cards && cards.length > 0) {
                        await player.gain(cards, "gain2");
                        const number = get.number(cards[0]);
                        if (number === 1) {
                            await player.recover();
                            player.tempdisSkill(event.name);
                        }
                    }
                } else if (choices.includes(1)) {
                    const cards = specifyMin();
                    if (cards && cards.length > 0) {
                        await player.gain(cards, "gain2");
                        const number = get.number(cards[0]);
                        if (number === 1) {
                            await player.recover();
                            player.tempdisSkill(event.name);
                        }
                    }
                }
            }
        },
        ai:{
            threaten:1.5,
        },
        "_priority":1314,
    },
    icelianjie: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            targetInRange: function (card, player, target) {
                if (!card.cards) return;
                for (const i of card.cards) {
                    if (i.hasGaintag("icelianjie_tag")) return true;
                }
            },
            cardUsable: function (card, player, target) {
                if (!card.cards) return;
                for (const i of card.cards) {
                    if (i.hasGaintag("icelianjie_tag")) return Infinity;
                }
            },
            aiOrder:function (player, card, num) {
                const cards = player.getCards("h");
                if(!cards.includes(card)) return num;
                const min_number = Math.min(...cards.map(card => get.number(card)));
                const max_number = Math.max(...cards.map(card => get.number(card)));
                if(cards.length >= player.maxHp) {
                    if(get.number(card) <= min_number) {
                        return num * 0.95;
                    } else if(get.number(card) > min_number && get.number(card) < max_number) {
                        const diffFromMin = get.number(card) - min_number;
                        const diffFromMax = max_number - get.number(card);
                        let weight = diffFromMin / (diffFromMin + diffFromMax);
                        let priorityBonus = (1 - weight) * num;
                        return num + priorityBonus + 2;
                    } else if(get.number(card) >= max_number) {
                        return num * 0.85;
                    }
                } else {
                    if(get.number(card) <= min_number) {
                        return num * 2;
                    } else if(get.number(card) > min_number && get.number(card) < max_number) {
                        return num;
                    } else if(get.number(card) >= max_number) {
                        return num * 0.85;
                    }
                }                
            },
        },
        marktext:"<font color= #AFEEEE>连捷</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #AFEEEE>连捷</font>",
        },
        trigger: {
            player: "useCardToPlayered",
        },
        unique: true,
        locked: false,
        direct: true,
        init: async function (player, skill) {
            await initicelianjie(player, skill);
        },
        filter:function (event, player, name) {
            const cards = event.cards;
            if (!cards || !cards.length) return false;
            const findcards = cards.filter(card => card.original !== 'h');
            if(findcards.length > 0) return false;
            if(!event.targets || !event.targets.length) return false;
            const findtargets = game.filterPlayer(o => !player.getStorage('icelianjie').includes(o) && o.countCards('h') > 0);
            if(!findtargets || !findtargets.length) return false;
            const cards_h = player.getCards('h');
            if(!cards_h || !cards_h.length) return false;
            let num = 0;
            const number = get.number(event.card);
            if(number) num = number;
            const min_number = Math.min(...cards_h.map(card => get.number(card)));
            //console.log(num,min_number);
            //console.log(cards_h);
            return num <= min_number;
        },
        async content(event, trigger, player) {
            const targets = game.filterPlayer(o => !player.getStorage('icelianjie').includes(o) && o.countCards('h') > 0);
            const prompt = setColor("是否发动〖连捷〗选择一名角色？");
            const result = await player.chooseTarget(prompt, function (card, player, target) {
                return targets.includes(target);
            }).set('ai', function (target) {
                const cards = player.getCards('h');
                const enemys = targets.filter(o => get.attitude(player, o) < 2).sort((a, b) => {
                    if (a.countCards('h') !== b.countCards('h')) return a.countCards('h') - b.countCards('h');
                    return a.hp - b.hp;
                });
                const friends = targets.filter(o => get.attitude(player, o) >= 2).sort((a, b) => {
                    if (b.countCards('h') !== a.countCards('h')) return b.countCards('h') - a.countCards('h');
                    return b.hp - a.hp;
                });
                function canUseCards () {
                    if (cards.length == 0) return false;
                    for(const card of cards) {
                        const cardTag = card.hasGaintag("icelianjie_tag");
                        for(const target of game.players) {
                            const effect = get.effect(target, card, player, player);
                            if(cardTag) {
                                if(effect > 0 && player.canUse(card, target, false, false)) return true;
                            } else {
                                if(effect > 0 && player.canUse(card, target, true, true)) return true;
                            }
                        }
                    }
                    return false;
                }
                if(cards.length >= player.maxHp) {
                    if(canUseCards ()) {
                        return false;
                    } else {
                        if (enemys && enemys.length > 0) {
                            return target == enemys[0];
                        } else {
                            return false;
                        }
                    }
                } else {
                    if (enemys && enemys.length > 0) {
                        return target == enemys[0];
                    } else if (friends && friends.length > 0) {
                        if(canUseCards ()) {
                            return target == friends[0];
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }).set(/*'forced', true*/).forResult();
            if (result.bool) {
                const target = result.targets[0];
                if(!player.getStorage(event.name).includes(target)) {
                    player.line(target, 'ice');
                    player.markAuto(event.name, [target]);
                }
                const cards = target.getCards('h');
                const min_number = Math.min(...cards.map(card => get.number(card)));
                const finddeCards = cards.filter(card => get.number(card) === min_number);
                const card = finddeCards[Math.floor(Math.random() * finddeCards.length)];
                await player.chooseCardsToPile([card],'bottom');
                const Pcards = player.getCards('h');
                if(Pcards.length < player.maxHp) {
                    const Cards = get.cards(player.maxHp - Pcards.length);
                    await player.gain(Cards, "draw");
                    player.addGaintag(Cards, "icelianjie_tag");
                }
            }
        },
        ai:{
            noe: true,
            reverseEquip:true,
            threaten:1.5,
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    const cards = player.getCards("h");
                    const min_number = Math.min(...cards.map(card => get.number(card)));
                    const max_number = Math.max(...cards.map(card => get.number(card)));
                    if(cards.length >= player.maxHp) {
                        if(get.number(card) <= min_number) {
                            return [1, 0.85];
                        } else if(get.number(card) > min_number && get.number(card) < max_number) {
                            const diffFromMin = get.number(card) - min_number;
                            const diffFromMax = max_number - get.number(card);
                            let weight = diffFromMin / (diffFromMin + diffFromMax);
                            let priorityBonus = (1 - weight) * player.maxHp;
                            return [1, priorityBonus];
                        } else if(get.number(card) >= max_number) {
                            return [1,0.95];
                        }
                    } else {
                        if(get.number(card) <= min_number) {
                            return [1, player.maxHp - cards.length];
                        } else if(get.number(card) > min_number && get.number(card) < max_number) {
                            return [1, player.maxHp - cards.length - 0.5];
                        } else if(get.number(card) >= max_number) {
                            return [1, 0.85];
                        }
                    }   
                },
            },
        },
        "_priority":0,
    },
    icejiangxian: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= #AFEEEE>将贤</font>",
        limited: true,
        skillAnimation:"epic",
        animationColor:"thunder",
        init: async function (player, skill) {
            await initicejiangxian(player, skill);
        },
        intro: {
            content: "limited",
            name: "<font color= #AFEEEE>将贤·限定技</font>",
        },
        enable: "phaseUse",
        persevereSkill:true,
        unique:true,
        locked:true,
        filter:function (event, player) {
            return !player.storage.icejiangxian && (player.hasSkill("icechaozhen") || player.hasSkill("icelianjie"));
        },
        async content(event, trigger, player) {
            player.storage.icejiangxian = true;
            player.awakenSkill(event.name);
            player.addTempSkill("icejiangxian_source");
        },
        ai:{
            order: 15,
            threaten:1.5,
            result: {
                player: function (player, target) {
                    if(!player.hasSkill("icelianjie")) return 0;
                    const cards = player.getCards('hs');
                    if(cards.length === 0) return 0;
                    const lianjieCards = cards.filter(card => card.hasGaintag("icelianjie_tag"));
                    if(lianjieCards.length === 0) return 0;
                    const damageCards = lianjieCards.filter(card => get.tag(card, 'damage') >= 1);
                    if(damageCards.length === 0) return 0;
                    const numDamage = player.icelianjie_damage;
                    if(!numDamage || numDamage <= 0) return 0;
                    const targets = game.filterPlayer(o => get.attitude(player, o) < 2);
                    if(!targets || targets.length === 0) return 0;
                    let canUseDamage = [];
                    let canUseTargets = [];
                    for(let card of damageCards) {
                        for(const target of targets) {
                            const effect = get.effect(target, card, player, player);
                            if(effect > 0 && player.canUse(card, target, false, false)) {
                                if(!canUseDamage.includes(card)) canUseDamage.push(card);
                                if(!canUseTargets.includes(target)) canUseTargets.push(target);
                            }
                        }
                    }
                    if(!canUseDamage || canUseDamage.length === 0) return 0;
                    if(!canUseTargets || canUseTargets.length === 0) return 0;
                    const sortedTargets = canUseTargets.sort((a,b) => a.hp - b.hp);
                    const compareNum = sortedTargets[0].hp;
                    if(canUseDamage.length >= compareNum) {
                        return canUseDamage.length;
                    } else {
                        return 0;
                    }
                },
            },
        },
        subSkill: {
            source: {
                mark: true,
                marktext: "<font color= #AFEEEE>增伤</font>",
                onremove: true,
                intro: {
                    content:function(storage, player) {
                        const numDamage = player.icelianjie_damage;
                        return '本回合造成伤害的次数为：' + numDamage;
                    },
                    markcount:function(storage, player) {
                        return player.icelianjie_damage;
                    },
                    name: "<font color= #AFEEEE>将贤</font>",
                },
                trigger:{
                    player: "useCard",
                },
                persevereSkill: true,
                charlotte: true,
                firstDo: true,
                unique: true,
                direct: true,
                filter: function (event, player) {
                    let tags = ["icelianjie_tag"],
                        card = event.card;
                    return player.hasHistory("lose", function (evt) {
                        if (evt.getParent() != event) return false;
                        for (var i in evt.gaintag_map) {
                            for (var tag of evt.gaintag_map[i]) {
                                if (tags.includes(tag)) return true;
                            }
                        }
                        return false;
                    });
                },
                async content(event, trigger, player) {
                    let tags = ["icelianjie_tag"],
                        card = trigger.card;
                    player.hasHistory("lose", function (evt) {
                        if (evt.getParent() != trigger) return false;
                        for (var i in evt.gaintag_map) {
                            tags.removeArray(evt.gaintag_map[i]);
                        }
                        return tags.length == 0;
                    });
                    if (!tags.includes("icelianjie_tag")) {
                        if (get.tag(card, "damage") > 0) {
                            const numDamage = player.icelianjie_damage;
                            trigger.baseDamage += numDamage;
                            game.log(player, '使用的', trigger.card, '的伤害数值增加了', numDamage, '点');
                        }
                        player.update();
                    }
                },
                sub: true,
                sourceSkill: "icejiangxian",
                "_priority": Infinity,
            },
        },
        "_priority": -25,
    },
};
export default TAF_baoliaoSkills;
