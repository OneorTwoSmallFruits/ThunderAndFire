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
const ZQY_compete = lib.config.extension_银竹离火_TAFset_TAF_ZQY_compete;
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

const { icelingren } = asyncs.wei.ice_caoying;//曹婴
const { initxingshang } = asyncs.wei.thunder_caopi;//曹丕
const { checkdiaochans, checklijiandebuffs, checklijiantargets, getlijianSkills } = asyncs.qun.ice_diaochan;//貂蝉


/** @type { importCharacterConfig['skill'] } */
const TAF_qunSkills = {
    //张琪瑛
    icefalu: {
        audio: "ext:银竹离火/audio/skill:4",
        mark: true,
        marktext: "☯",
        onremove: true,
        zhuanhuanji: true,
        intro: {
            mark:function (dialog, storage, player) {
                const key = player.storage.icefalu;
                const func = player.icefalu_createButton;
                const prompt1 = setColor("阴：随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底，以此法放置的牌称为〖法箓〗。");
                const prompt2 = setColor("阳：随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶，以此法放置的牌称为〖法箓〗。");
                if(!func || typeof func !== "function") {
                    if(key) {
                        dialog.addText(prompt1);
                    } else {
                        dialog.addText(prompt2);
                    }
                } else {
                    if(key) {
                        dialog.addText(prompt1);
                    } else {
                        dialog.addText(prompt2);
                    }
                    if (player.icefalu.trickRandom && player.icefalu.trickRandom.length > 0) {
                        if (player.isUnderControl(true)) {
                            dialog.addSmall([player.icefalu.trickRandom, (item, type, position, noclick, node) => 
                                func(item, type, position, noclick, node)
                            ]);
                        } else {
                            const prompt3 = setColor("共有" + get.cnNumber(player.icefalu.trickRandom.length) + "张〖法箓锦囊〗牌！");
                            dialog.addText(prompt3);
                        }
                    } else {
                        const prompt4 = setColor("没有可用的〖法箓锦囊〗牌！");
                        dialog.addText(prompt4);
                    }
                }
            },
            markcount:function (storage, player) {
                return player.icefalu.trickRandom.length || 0;
            },
            onunmark: true,
            name: "<font color= #AFEEEE>法箓</font>",
        },
        enable:["chooseToUse","chooseToRespond"],
        unique: true,
        locked: false,
        usable: 1,
        global: ['icefalu_gain'],
        fisherYatesShuffle: function (arr) {
            const array = [...arr];
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },
        init:async function(player, skill) {
            if(!player.storage.icefalu) player.storage.icefalu = false;//转换技切换
            if(!player.icefalu_createButton) player.icefalu_createButton = function (item, type, position, noclick, node) {
                node = ui.create.buttonPresets.vcard(item, "string", position, noclick);
                return node;
            };
            if(!player.icefalu) player.icefalu = { tricklist: [], trickused: [], trickRandom: [] };
            if(ZQY_compete){//参赛投稿版
                const tricklist = ['chuqibuyi', 'huoshaolianying', 'tuixinzhifu','qijia', 'kaihua', 'toulianghuanzhu', 'wangmeizhike','suijiyingbian'];
                for (const name of tricklist) {
                    const Vcard = {name: name, nature: "", isCard: true, icefalu: true,};
                    const info = get.info(Vcard);
                    if(!info || (info.multicheck && !info.multicheck(Vcard, player))) continue;
                    player.icefalu.tricklist.push(name);
                }
            } else { 
                const setPacks = ['standard', 'extra', 'guozhan', 'yingbian', 'yongjian', 'sp', 'zhulu', 'yunchou'];
                for (const Packname of setPacks) {
                    if(lib.cardPack?.[Packname]) {
                        player.icefalu.tricklist = player.icefalu.tricklist.concat(lib.cardPack[Packname].filter(name => get.type(name) === "trick"));
                    }
                }
            }
            if(!player.changeIceFaluTricks) player.changeIceFaluTricks = function () {
                const fisherYatesShuffle = lib.skill.icefalu.fisherYatesShuffle;
                const usedlist = player.icefalu.trickused;
                const nowlist = player.icefalu.trickRandom;
                const newlists = player.icefalu.tricklist.filter(name => !usedlist.includes(name) && !nowlist.includes(name));
                player.icefalu.trickused.push(...nowlist);
                if(ZQY_compete){//参赛投稿版
                    if (newlists.length >= 2) {
                        player.icefalu.trickRandom = fisherYatesShuffle(newlists).slice(0, 2);
                        game.log(player, "随机获取了两张〖法箓锦囊〗牌，并置于武将牌上。");
                        return player.icefalu.trickRandom;
                    } else {
                        player.icefalu.trickused = [];
                        player.icefalu.trickRandom = fisherYatesShuffle(player.icefalu.tricklist).slice(0, 2);
                        game.log(player, "随机获取了两张〖法箓锦囊〗牌，并置于武将牌上。");
                        return player.icefalu.trickRandom;
                    }
                } else {
                    if (newlists.length >= 4) {
                        player.icefalu.trickRandom = fisherYatesShuffle(newlists).slice(0, 4);
                        game.log(player, setColor("随机获取了四张〖法箓锦囊〗牌，并置于武将牌上。"));
                        return player.icefalu.trickRandom;
                    } else {
                        player.icefalu.trickused = [];
                        player.icefalu.trickRandom = fisherYatesShuffle(player.icefalu.tricklist).slice(0, 4);
                        game.log(player, setColor("随机获取了四张〖法箓锦囊〗牌，并置于武将牌上。"));
                        return player.icefalu.trickRandom;
                    }
                }
            };
            await player.changeIceFaluTricks();
        },
        filter: function (event, player) {
            const key = player.storage.icefalu;//转换技切换
            function canuse () {
                if(key) {
                    const disPilecards = ui.discardPile.childNodes;
                    if(disPilecards.length <= 0) return false;
                    return true;
                } else {
                    const pilecards = ui.cardPile.childNodes;
                    if(pilecards.length <= 0) return false;
                    return true;
                }
            }
            if(!canuse()) return false;
            const filter = event.filterCard;

            if(ZQY_compete){//参赛投稿版
                const cards = player.getCards("he");
                if(cards.length === 0) return false;
                const nowlist = player.icefalu.trickRandom;
                if(nowlist.length === 0) return false;
                for (const name of nowlist) {
                    const Vcard = {name: name, nature: "", isCard: true, icefalu: true,};
                    if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) return true;
                }
                return false;
            } else {
                const nowlist = player.icefalu.trickRandom;
                if(nowlist.length === 0) return false;
                for (const name of nowlist) {
                    const Vcard = {name: name, nature: "", isCard: true, icefalu: true,};
                    if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) return true;
                }
                return false;
            }
        },
        chooseButton:{
            dialog:function (event, player) {
                const prompt = setColor("〖法箓〗请选择视为使用或打出的牌：");
                let list = [];
                const filter = event.filterCard;
                const nowlist = player.icefalu.trickRandom;
                for (const name of nowlist) {
                    const type = get.type(name);
                    const Vcard = {name: name, nature: "", isCard: true, icefalu: true,};
                    if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) list.push([type, '', name, ""]);
                }
                if (list.length == 0) return;
                return ui.create.dialog(prompt, [list, "vcard"]);
            },
            check: function (button,lists) {
                const player = _status.event.player;
                let canUselist = [];
                if (lists && lists.length > 0) {
                    for(let list of lists){
                        const vcard = {name: list.link[2], nature: list.link[3], isCard: true};
                        if (player.hasUseTarget(vcard) && player.hasValueTarget(vcard) && player.getUseValue(vcard) > 0) {
                            canUselist.push(vcard);
                        }
                    }
                }
                if (canUselist.length > 0) {
                    let bestCard = canUselist[0];
                    let highestValue = player.getUseValue(bestCard);
                    for (let card of canUselist) {
                        const useValue = player.getUseValue(card);
                        if (useValue > highestValue) {
                            highestValue = useValue;
                            bestCard = card;
                        }
                    }
                    return button.link[2] == bestCard.name && button.link[3] == bestCard.nature;
                }
            },
            backup: function (links, player) {
                return {
                    audio: "icefalu",
                    popname: true,
                    filterCard: function (card, player, event) {
                        if(ZQY_compete){//参赛投稿版
                            const cards = player.getCards("he");
                            return cards.includes(card);
                        } else {
                            return false;
                        }
                    },
                    selectCard: function () {
                        if(ZQY_compete){//参赛投稿版
                            return 1;
                        } else {
                            return 0;
                        }
                    },
                    position: "he",
                    viewAs: { 
                        name: links[0][2], 
                        nature: links[0][3],
                        isCard: true,
                        icefalu: true,
                    },
                    check: function (card) {
                        const cards = player.getCards("he").sort((a, b) => get.value(a, player) - get.value(b, player));
                        if(ZQY_compete){//参赛投稿版
                            return get.value(card, player) === get.value(cards[0], player);
                        } else {
                            return true;
                        }
                    },
                    precontent: async function () {
                        const key = player.storage.icefalu;//转换技切换
                        let getcards = [];
                        if(key) {//阴
                            const cards = player.getCardsform({ Pile: 'discardPile', field: null });
                            getcards = cards.slice(0, 4);
                        } else {//阳
                            const cards = player.getCardsform({ Pile: 'cardPile', field: null });
                            getcards = cards.slice(0, 4);
                        }
                        if(getcards.length > 0) {
                            game.cardsGotoOrdering(getcards);
                            const redcards = getcards.filter(card => get.color(card) === "red");
                            const blackcards = getcards.filter(card => get.color(card) === "black");
                            let prompt_one = "",prompt_two = "";
                            let list_one = [],list_two = [];
                            if(key) {//阴
                                prompt_one = setColor("〖法箓〗：将黑色牌以任意顺序置于〖牌堆顶〗！");
                                list_one = [prompt_one, blackcards];
                                prompt_two = setColor("〖法箓〗：将红色牌以任意顺序置于〖牌堆底〗！");
                                list_two = [prompt_two, redcards];
                            } else {//阳
                                prompt_one = setColor("〖法箓〗：将红色牌以任意顺序置于〖弃牌堆顶〗！");
                                list_one = [prompt_one, redcards];
                                prompt_two = setColor("〖法箓〗：将黑色牌以任意顺序置于〖弃牌堆底〗！");
                                list_two = [prompt_two, blackcards];
                            }
                            const prompt = setColor("〖法箓〗");
                            const Moveresult = await player.chooseToMove(prompt,true).set("list", [list_one,list_two]).set("filterMove", (from, to, moved) => {
                                const isFromInListOne = moved[0].includes(from.link);
                                const isToInListOne = moved[0].includes(to.link);
                                const isFromInListTwo = moved[1].includes(from.link);
                                const isToInListTwo = moved[1].includes(to.link);
                                if ((isFromInListOne && isToInListOne) || (isFromInListTwo && isToInListTwo)) {
                                    return true;
                                }
                                return false;
                            }).set('filterOk', (moved) => {
                                return true;
                            }).set("processAI", (list) => {
                                let 排序后 = [[],[]];
                                if(key) {//阴
                                    const blackcards = list[0][1];
                                    const redcards = list[1][1];
                                    const target = _status.currentPhase.next;
                                    const judges = target.getCards("j");
                                    if (judges.length > 0) {
                                        let cheats = [];
                                        let EndBlackcards = [];
                                        const wuxie_one = target.getCards('hes').filter(card => get.name(card,target) === 'wuxie');
                                        const wuxie_two = player.getCards('hes').filter(card => get.name(card,player) === 'wuxie');
                                        if (get.attitude(player, target) >= 2 && !wuxie_one.length && !wuxie_two.length) {
                                            cheats = setjudgesResult(judges,blackcards,player,false);//令判定牌失效的卡牌
                                            const remainingBlackcards = blackcards.filter(card => !cheats.includes(card)).sort((a, b) => get.value(b, target) - get.value(a, target));
                                            EndBlackcards = cheats.concat(remainingBlackcards);
                                        } else {
                                            cheats = setjudgesResult(judges,blackcards,player,true);//令判定牌生效的卡牌
                                            const remainingBlackcards = blackcards.filter(card => !cheats.includes(card)).sort((a, b) => get.value(a, target) - get.value(b, target));
                                            EndBlackcards = cheats.concat(remainingBlackcards);
                                        }
                                        排序后 = [[...EndBlackcards], [...redcards]];
                                    } else {
                                        let sortedBlackcards = [];
                                        if (get.attitude(player, target) >= 2) {
                                            sortedBlackcards = blackcards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                        } else {
                                            sortedBlackcards = blackcards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                        }
                                        排序后 = [[...sortedBlackcards], [...redcards]];
                                    }
                                } else {//阳
                                    const redcards = list[0][1];
                                    const blackcards = list[1][1];
                                    排序后 = [[...redcards], [...blackcards]];
                                }
                                return 排序后;
                            }).set('forced', true).forResult();
                            if (Moveresult.bool) {
                                const topcards = Moveresult.moved[0];
                                const bottomcards = Moveresult.moved[1];
                                const cards = topcards.concat(bottomcards);
                                if (cards.length > 0) {
                                    for(let card of cards) {
                                        if(!card.storage.icefalu) {
                                            card.storage.icefalu = true;
                                        }
                                    }
                                }
                                if(key) {//阴
                                    if (topcards.length > 0) {
                                        await player.chooseCardsToPile(topcards,'top');
                                    }
                                    if (bottomcards.length > 0) {
                                        await player.chooseCardsToPile(bottomcards,'bottom');
                                    }
                                } else {//阳
                                    if (topcards.length > 0) {
                                        await player.chooseCardsTodisPile(topcards,'top');
                                    }
                                    if (bottomcards.length > 0) {
                                        await player.chooseCardsTodisPile(bottomcards,'bottom');
                                    }
                                }
                            }
                        }
                        await player.changeIceFaluTricks();
                        player.changeZhuanhuanji("icefalu");
                    },
                    onuse: async function (result, player) {
                        const falucards = player.getCardsform().filter(card => card.storage.icefalu).slice(0, 1);
                        if (falucards.length > 0) {
                            await player.gain(falucards, "gain2");
                        }
                    },
                };
            },
            prompt: function (links, player) {
                const prompt = setColor("〖法箓〗：视为使用或打出一张：");
                return prompt + (get.translation(links[0][3]) || "") + get.translation(links[0][2]);
            },
        },
        hiddenCard: function (player, name) {
            const nowlist = player.icefalu.trickRandom;
            if(nowlist.includes(name)) {
                if(ZQY_compete){//参赛投稿版
                    return player.getCards("he").length > 0;
                } else {
                    return true;
                }
            }
            return false;
        },
        ai:{
            order: function (item, player) {
                if (player && _status.event.type == "phase") {
                    const nowlist = player.icefalu.trickRandom;
                    if (nowlist.length === 0) return 0;
                    let canUselist = [];
                    for (const name of nowlist) {
                        const Vcard = {name: name, nature: "", isCard: true, icefalu: true,};
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            canUselist.push(Vcard);
                        }
                    }
                    if (canUselist.length === 0) return 0;
                    let ordernumlist = [];
                    let valuenumlist = [];
                    for (const Vcard of canUselist) {
                        const Vorder = get.order(Vcard);
                        const Vvalue = get.value(Vcard);
                        if (Vorder && Vorder > 0) ordernumlist.push(Vorder);
                        if (Vvalue && Vvalue > 0) valuenumlist.push(Vvalue);
                    }
                    if (ordernumlist.length === 0 || valuenumlist.length === 0) return 0;
                    if(ZQY_compete){//参赛投稿版
                        const cards = player.getCards("he").sort((a, b) => get.value(a, player) - get.value(b, player));
                        if (cards.length === 0) return 0;
                        const maxvalue = Math.max(...valuenumlist);
                        if (maxvalue >= get.value(cards[0], player)) {
                            const maxorder = Math.max(...ordernumlist);
                            return maxorder + 1.5;
                        }
                        return 0;
                    } else {
                        const maxorder = Math.max(...ordernumlist);
                        return maxorder + 1.5;
                    }
                }
                return 1.5;
            },
            result: {
                player: function (player, target, card) {
                    return 1;
                },
            },
        },
        subSkill: {
            gain : {
                trigger: {
                    player: ["gainEnd"],
                    global: ["loseAsyncEnd"],
                },
                firstDo:true,
                charlotte:true,
                unique:true,
                direct:true,
                silent: true,
                popup: false,
                filter: function(event, player, name) {
                    const cards = event.getg(player);
                    if (!cards || !Array.isArray(cards) || cards.length === 0) return false;
                    for (let card of cards) {
                        if (card && card.storage.icefalu) return true;
                    }
                    return false;
                },
                async content(event, trigger, player) {
                    const cards = trigger.getg(player);
                    if (cards && cards.length > 0) {
                        const totagCards = cards.filter(card => card.storage.icefalu);
                        player.addGaintag(totagCards, "icefalu_tag");
                    }
                },
                ai:{
                    effect: {
                        player: function (card, player, target) {
                            //此全局AI联动真仪技能！涉及卡牌收益
                            const ZQY = game.filterPlayer(o => o.isAlive() && o.hasSkill('icezhenyi'));
                            if(ZQY.length === 0 || player.hasSkill('icezhenyi')) return;
                            function checkFalu(card) {
                                const cardinfo = get.info(card, false);
                                if (cardinfo.allowMultiple === false) return false;
                                if (cardinfo.multitarget === false) return false;
                                if (card.icefalu || card.storage?.icefalu) return true;
                                if (card.cards && Array.isArray(card.cards)) {
                                    for (const c of card.cards) {
                                        if (c.icefalu || (c.storage && c.storage.icefalu)) return true;
                                    }
                                }
                                return false;
                            }
                            if (!checkFalu(card)) return;//不可用牌、或不可用的法箓牌则直接跳过！
                            const addTargets = game.filterPlayer(o => {//获取真仪能触发的增加目标！且玩家能对目标使用牌
                                return o.isAlive() && lib.filter.targetEnabled2(card, player, o);
                            });
                            if (addTargets.length <= 1) return;//真仪没有可增加的目标，跳过此法箓牌！
                            let attitude = 0;
                            for (const tz of ZQY) {
                                const att = get.attitude(player, tz);
                                attitude += att;
                            }
                            if (attitude >= 2) return 2;
                            else return [1, -1];
                        },
                    },
                },
                sub: true,
                sourceSkill: "icefalu",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": Infinity,
    },
    icedianhua: {
        audio: "ext:银竹离火/audio/skill:4",
        mod: {
            maxHandcard: function (player, num) {
                const setnum = player.icedianhua_used || 0;
                return num + Math.max(setnum, 1);
            },
            aiOrder:function (player, card, num) {
                const func = player.checkDianhua;
                if (!func || typeof func !== "function" || func(card) !== true) return;
                if (player.isHealthy()) {
                    return num * 2;
                } else if (player.hp > 0) {
                    return num * (player.hp % 2 === 1 ? 1.25 : 2);
                } else {
                    return num;
                }
            },
        },
        trigger: {
            player: ["useCardAfter","respondAfter"],
            global: ["phaseAfter"],
        },
        unique: true,
        locked:true,
        direct:true,
        init:async function(player, skill) {
            if(!player.icedianhua_used) player.icedianhua_used = 0;
            if(!player.checkDianhua) player.checkDianhua = function(card) {//含法箓牌、和转化牌
                const info = get.info(card);
                if(!info || (info.multicheck && !info.multicheck(card, player))) return null;
                if (card.icefalu) return true;
                if (card.storage?.icefalu) return true;
                const cards = card.cards;
                if(!cards || !Array.isArray(cards)) return null;
                if(cards.length === 0 || cards.length !== 1) {
                    return true;
                } else {
                    if (cards[0].storage?.icefalu) return true;
                    const name1 = card.name;
                    const name2 = cards[0].name;
                    if(name1 !== name2) return true;
                    return false;
                }
            };
            if(!player.clearFalu) player.clearFalu = function(evt) {
                const card = evt.card;
                const cards = evt.cards || [];
                if (card && card.storage?.icefalu) {
                    delete card.storage.icefalu;
                }
                if (card.cards && Array.isArray(card.cards)) {
                    for (let c of card.cards) {
                        if (c && c.storage?.icefalu) {
                            delete c.storage.icefalu;
                        }
                    }
                }
                if (Array.isArray(cards)) {
                    for (let c of cards) {
                        if (c && c.storage?.icefalu) {
                            delete c.storage.icefalu;
                        }
                    }
                }
            };
        },
        filter: function(event, player, name) {
            if(name == "useCardAfter" || name == "respondAfter") {
                const card = event.card;
                return player.checkDianhua(card) === true;
            } else if(name == "phaseAfter") {
                player.icedianhua_used = 0;
                return;
            }
        },
        async content(event, trigger, player) {
            player.logSkill(event.name);
            player.icedianhua_used ++;
            if(player.isHealthy()) {
                await player.draw(2);
                await player.loseHp();
            } else {
                if(player.hp > 0) {
                    const php = player.hp;
                    if(php % 2 === 1) {
                        await player.recover(); 
                        await player.chooseToDiscard(1, 'he', true);
                    } else {
                        await player.draw(2);
                        await player.loseHp();
                    }
                }
            }
            await player.clearFalu(trigger);
        },
        ai: {
            effect: {
                player: function (card, player, target) {
                    const func = player.checkDianhua;
                    if (!func || typeof func !== "function" || func(card) !== true) return;
                    if (player.isHealthy()) {
                        return [1, 2];
                    } else if (player.hp > 0) {
                        return player.hp % 2 === 1 ? [1, 0.8] : [1, 2];
                    }
                },
            },
        },
        "_priority": 0,
    },
    icezhenyi: {
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            global: ["useCard"],
        },
        unique: true,
        locked: false,
        direct: true,
        init: async function(player, skill) {
            if(!player.checkFaluCards) player.checkFaluCards = function(evt) {//仅限法箓牌bugfix
                const card = evt.card;
                const cards = evt.cards || [];
                if (card.icefalu || card.storage?.icefalu) return true;
                if (card.cards && Array.isArray(card.cards)) {
                    for (let c of card.cards) {
                        if (c.icefalu || (c.storage && c.storage.icefalu)) return true;
                    }
                }
                if (Array.isArray(cards)) {
                    for (let c of cards) {
                        if (c.icefalu || (c.storage && c.storage.icefalu)) return true;
                    }
                }
                return false;
            };
            if(!player.clearFalu) player.clearFalu = function(evt) {
                const card = evt.card;
                const cards = evt.cards || [];
                if (card && card.storage?.icefalu) {
                    delete card.storage.icefalu;
                }
                if (card.cards && Array.isArray(card.cards)) {
                    for (let c of card.cards) {
                        if (c && c.storage?.icefalu) {
                            delete c.storage.icefalu;
                        }
                    }
                }
                if (Array.isArray(cards)) {
                    for (let c of cards) {
                        if (c && c.storage?.icefalu) {
                            delete c.storage.icefalu;
                        }
                    }
                }
            };
        },
        filter: function(event, player) {
            if (event.player === player) return;
            if (!player.hasSkill('icefalu')) return;
            const cardinfo = get.info(event.card, false);
            if (cardinfo.allowMultiple === false) return false;
            if (cardinfo.multitarget === false) return false;

            if(player.checkFaluCards(event) !== true) return false;//仅限法箓牌bugfix

            const targets = event.targets;
            if (!targets || targets.length === 0) return false;
            if (targets && targets.length > 1) {
                return true;
            }
            const hastargets = game.filterPlayer().filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(event.card, event.player, o));
            if (hastargets && hastargets.length > 0) {
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            const targets = trigger.targets;
            let text1 = "为" + get.translation(trigger.card) + "增加一个目标";
            let text2 = "为" + get.translation(trigger.card) + "减少一个目标";
            let lists = [];
            let Control1 = false, Control2 = false;
            const hastargets = game.filterPlayer().filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, trigger.player, o));
            if (hastargets && hastargets.length > 0) {
                lists.push(text1);
                Control1 = true;
            }
            if (targets && targets.length > 1) {
                lists.push(text2);
                Control2 = true;
            }
            if (lists.length === 0) return;
            if (!lists.includes('cancel2')) lists.push('cancel2');
            const result = await player.chooseControl(lists).set ("ai", control => {
                const hasAddOption = Control1 && lists.includes(text1);//增加目标选项
                const hasRemoveOption = Control2 && lists.includes(text2);//减少目标选项
                if (hasAddOption) {
                    /**
                     * 增加目标就不用考虑了队友了，只需要考虑站在此技能玩家角度，这张牌对谁收益最大，
                     */
                    const getValueTS = hastargets.sort((a, b) =>{
                        const effect1 = get.effect(a, trigger.card, player, player);
                        const effect2 = get.effect(b, trigger.card, player, player);
                        if (effect1 !==  effect2) return  effect2 - effect1;
                    });
                    //
                    if(get.effect(getValueTS[0], trigger.card, player, player) > 0) return text1;
                }
                if (hasRemoveOption) {
                    /**
                     * 减少目标的话，让单机决策优先保队友！
                     */
                    const getValueFriends = targets.filter(o => {
                        const effect = get.effect(o, trigger.card, player, player);
                        return get.attitude(player, o) >= 2 && effect && effect < 0;
                    });
                    if (getValueFriends && getValueFriends.length > 0) return text2;
                    const getValueEnemies = targets.filter(o => {
                        const effect = get.effect(o, trigger.card, player, player);
                        return get.attitude(player, o) < 2 && effect && effect > 0;
                    });
                    if (getValueEnemies && getValueEnemies.length > 0) return text2;
                }
                return 'cancel2';
            }).forResult();
            if (result.control === 'cancel2') return;

            player.logSkill(event.name);
            await player.clearFalu(trigger);

            const chooseresult = await player.chooseTarget(result.control, function (card, player, target) {
                if (result.control === text1) {
                    return hastargets.includes(target);
                } else if (result.control === text2) {
                    return targets.includes(target);
                }
                return false;
            }).set("ai", function (target) {//前后要逻辑一致！不然胡乱返回会报错！因为接下来就只强制触发了！
                if (result.control === text1) {
                    const getValueTS = hastargets.sort((a, b) =>{
                        const effect1 = get.effect(a, trigger.card, player, player);
                        const effect2 = get.effect(b, trigger.card, player, player);
                        if (effect1 !==  effect2) return  effect2 - effect1;
                    });
                    return target === getValueTS[0];
                } else if (result.control === text2) {
                    const getValueFriends = targets.filter(o => {
                        const effect = get.effect(o, trigger.card, player, player);
                        return get.attitude(player, o) >= 2 && effect && effect < 0;
                    }).sort((a, b) => {
                        const effect1 = get.effect(a, trigger.card, player, player);
                        const effect2 = get.effect(b, trigger.card, player, player);
                        if (effect1 !==  effect2) return  effect1 - effect2;
                    });
                    if (getValueFriends && getValueFriends.length > 0) return target === getValueFriends[0];
                    const getValueEnemies = targets.filter(o => {
                        const effect = get.effect(o, trigger.card, player, player);
                        return get.attitude(player, o) < 2 && effect && effect > 0;
                    }).sort((a, b) => {
                        const effect1 = get.effect(a, trigger.card, player, player);
                        const effect2 = get.effect(b, trigger.card, player, player);
                        if (effect1 !==  effect2) return  effect2 - effect1;
                    });
                    if (getValueEnemies && getValueEnemies.length > 0) return target === getValueEnemies[0];
                }
            }).set('forced', true).forResult();
            if (chooseresult.bool) {
                const target = chooseresult.targets[0];
                if (result.control === text1) {
                    game.log(player, "为〖" + get.translation(trigger.card) + "〗增加了一个目标：" + get.translation(target));
                    if (!targets.includes(target)) {
                        targets.push(target);
                    }
                } else if (result.control === text2) {
                    game.log(player, "为〖" + get.translation(trigger.card) + "〗减少了一个目标：" + get.translation(target));
                    if (targets.includes(target)) {
                        targets.splice(targets.indexOf(target), 1);
                    }
                }
            }
        },
        "_priority": 0,
    },
    //关索
    icezhengnan: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player: "useCard",
        },
        filter:function (event, player, name) {
            return true;
        },
        direct:true,
        async content(event, trigger, player) {

        },
        ai:{
            threaten:function (player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
        },
    },
    icexiefang: {
        mod:{
            maxHandcard:function(player, num) {
                return num + 2;
            },
            globalFrom:function(from, to, distance) {
                return distance - 1;
            },
        },
        audio: "ext:银竹离火/audio/skill:2",
        trigger:{
            player:"phaseDrawBegin",
        },
        filter:function (event, player, name) {
            return !event.numFixed;
        },
        forced:true,
        direct:true,
        async content(event, trigger, player) {
            player.logSkill(event.name);
            trigger.num = 3;
        },
        ai:{
            threaten:function (player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
        },
    },
    //吕玲绮
    icewushuang:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"useCardToPlayered",
            target:"useCardToTargeted",
        },
        firstDo: true,
        unique:true,
        forced:true,
        filter:function(event, player){
            const card = event.card;
            if(!card || !card.cards || card.cards.length === 0) return false;
            const name = card.name;
            if(!event.targets || event.targets.length === 0) return false;
            if(name ==='sha') {
                if(event.player !== player) return false;
                const directHit = event.getParent().directHit;
                for(const target of event.targets){
                    if(directHit && !directHit.includes(target)) return true;
                }
            } else if(name === 'juedou') {
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            const name = trigger.card.name;
            if(name ==='sha') {
                const id = trigger.target.playerid;
                const map = trigger.getParent().customArgs;
                if (!map[id]) map[id] = {};
                if (typeof map[id].shanRequired == "number") {
                    map[id].shanRequired++;
                } else {
                    map[id].shanRequired = 2;
                }
            } else if(name === 'juedou') {
                const id = (player == trigger.player ? trigger.target : trigger.player)["playerid"];
                const idt = trigger.target.playerid;
                const map = trigger.getParent().customArgs;
                if (!map[idt]) map[idt] = {};
                if (!map[idt].shaReq) map[idt].shaReq = {};
                if (!map[idt].shaReq[id]) map[idt].shaReq[id] = 1;
                map[idt].shaReq[id]++;
            }
        },
        ai: {
            "directHit_ai": true,
            threaten: 3,
            skillTagFilter: function(player, tag, arg) {
                if (tag === "directHit_ai") {
                    const card = arg.card;
                    if(!card || !card.cards || card.cards.length === 0) return false;
                    const name = card.name;
                    if(name ==='sha') {
                        if (arg.target === player) return false;
                        if (arg.target.countCards("hes", "shan") > 1) return false;
                        return true;
                    } else if(name === 'juedou') {
                        if (Math.floor(arg.target.countCards("hes", "sha") / 2) > player.countCards("hes", "sha")) return false;
                        return true;
                    }
                }
            },
            effect: {
                target: function(card, player, target) {
                    if(card && card.name === 'juedou') {
                        const skillKey = target.hasSkill("TAF_boss_longhun");
                        const Tshas = target.getCards('hes').filter(card => {
                            const key1 = get.suit(card) === 'diamond';
                            const key2 = get.name(card) === 'sha';
                            return (skillKey ? key1 || key2 : key2) && lib.filter.cardEnabled(card, target, "forceEnable");
                        });
                        const Pshas = player.countCards("hes", "sha");
                        if(Math.floor(Pshas / 2) >= Tshas) return [1, 0];
                        return [0, -2];
                    }
                },
                player: function(card, player, target) {
                    const tiejiKey = player.hasSkill('TAF_boss_tieji');
                    const skillKey = player.hasSkill("TAF_boss_longhun");
                    const canSaveCards = player.getCards('hes').filter(card => {
                        const key1 = get.suit(card) === 'heart'
                        const key2 = player.canSaveCard(card, player);
                        if (skillKey) {
                            return key1 || key2;
                        } else {
                            return key2;
                        }
                    });
                    if(card && card.name === 'juedou') {
                        const Tshas = target.countCards("hes", "sha");
                        const Pshas = player.getCards('hes').filter(card => {
                            const key1 = get.suit(card) === 'diamond';
                            const key2 = get.name(card) === 'sha';
                            return (skillKey ? key1 || key2 : key2) && lib.filter.cardEnabled(card, player, "forceEnable");
                        });
                        if(get.attitude(player, target) < 2 && tiejiKey) {
                            if(Pshas >= Math.floor(Tshas / 2)) {
                                return [1, 10];
                            } else {
                                if(player.hp - 1 + canSaveCards.length > 0) return [1, 5];
                                else return [0, -2];
                            }
                        } else {
                            if(Pshas >= Math.floor(Tshas / 2)) return [1, 0];
                            return [0, -2];
                        }
                    }
                    if(card && card.name === 'sha') {
                        const Tshans = target.countCards("hes", "shan");
                        if(get.attitude(player, target) < 2 && tiejiKey) {
                            return [1, 10];
                        } else {
                            if(Tshans < 2) return [1, 1];
                        }
                    }
                },
            },
        },
        "_priority":0,
    },
    iceshenwu:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"phaseUseBegin",
        },
        unique:true,
        preHidden: true,
        locked:false,
        filter:function (event, player) {
            return player.countCards("h") > 0;
        },
        check: function(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            const text = setColor("发动了〖神武〗");
            const result = player.showCards(player.getCards("h"), get.translation(player) + text);
            if (result && result.cards && result.cards.length > 0) {
                let typelist = [];
                for (const card of result.cards) {
                    const type = get.type(card);
                    if (typelist.includes(type)) continue;
                    typelist.push(type);
                }
                debugger;
                if (typelist.length >= 1) await player.specifyCards("sha");
                if (typelist.length >= 2) {
                    player.addTempSkill("iceshenwu_damage", "phaseUseAfter");
                };
                if (typelist.length >= 3) {
                    player.addTempSkill("iceshenwu_add", "phaseUseAfter");
                    const skills = ['TAF_shenfeng','TAF_liechu','TAF_fumo','TAF_jingang'].filter(skill => !player.hasSkill(skill));
                    if (skills.length > 0) {
                        const skill = skills[Math.floor(Math.random() * skills.length)];
                        player.addTempSkill(skill, { player: 'phaseUseBegin' });
                    }
                };
            }
        },
        ai:{
            threaten: 3,
        },
        subSkill:{
            damage:{
                audio:"iceshenwu",
                mod:{
                    targetInRange:() => true,
                },
                trigger:{
                    source:"damageSource",
                },
                filter:function(event, player) {
                    if (!event.card) return false;
                    if (event.player === player) return false;
                    if (event.card.name === 'sha') {
                        return player.countUsed('sha', true) < 2;
                    }
                    if (event.card.name === 'juedou') {
                        return player.countUsed('juedou', true) < 2;
                    }
                    return false;
                },
                unique:true,
                charlotte:true,
                direct:true,
                async content(event, trigger, player) {
                    const cards = trigger.player.getGainableCards(player, "hej");
                    if (cards.length > 0) {
                        const prompt = setColor("〖神武〗：是否获得" + get.translation(trigger.player) + "区域一张牌？");
                        const result = await player.chooseBool(prompt).set('ai', function() {
                            return get.attitude(player, trigger.player) <= 0;
                        }).forResult();
                        if (result.bool) {
                            player.logSkill("iceshenwu");
                            await player.gainPlayerCard(trigger.player, "hej", true);
                        }
                    }
                },
                sub:true,
                sourceSkill:"iceshenwu",
            },
            add:{
                audio:"iceshenwu",
                trigger:{
                    player:"useCard",
                },
                unique:true,
                charlotte:true,
                direct:true,
                filter:function(event, player) {
                    const cardinfo = get.info(event.card, false);
                    if (cardinfo.allowMultiple === false) return false;
                    if (cardinfo.multitarget === false) return false;
                    if (event.card.name !== "sha" && cardinfo.type !== "trick") return false;
                    if (event.targets) {
                        const targets = game.filterPlayer(function(current) {
                            return !event.targets.includes(current) && 
                            lib.filter.targetEnabled2(event.card, player, current) && 
                            lib.filter.targetInRange(event.card, player, current);
                        });
                        return targets.length > 0;
                    }
                    return false;
                },
                async content(event, trigger, player) {
                    const targets = game.filterPlayer(function(current) {
                        return !trigger.targets.includes(current) && 
                        lib.filter.targetEnabled2(trigger.card, player, current) && 
                        lib.filter.targetInRange(trigger.card, player, current);
                    });
                    if (targets.length > 0) {
                        const num = Math.min(2, targets.length);
                        const TXT =  setColor("是否为〖" + get.translation(trigger.card) + "〗增加至多" + num + "个额外目标？");
                        const result = await player.chooseTarget(TXT, [1, Math.min(2, num)], function (card, player, target) {
                            return targets.includes(target);
                        }).set("ai", function (target) {
                            const card = _status.event.getTrigger().card;
                            return get.effect(target, card, player, player);
                        }).forResult();
                        if (result.bool) {
                            player.logSkill("iceshenwu");
                            const targets = result.targets.sortBySeat();
                            const fanyilist = targets.map(target => get.translation(target)).join("、");
                            game.log(player, "为〖" + get.translation(trigger.card) + "〗额外指定了：" + fanyilist + "！");
                            for (let target of targets) {
                                if (!trigger.targets.includes(target)) {
                                    trigger.targets.push(target);
                                }
                            }
                        }
                    }
                },
                sub:true,
                sourceSkill:"iceshenwu",
            },
        },
        "_priority":0,
    },
    iceshenwei:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            maxHandcard:function(player, num) {
                return num + 2;
            },
            globalFrom:function(from, to, distance) {
                return distance - 1;
            },
        },
        trigger:{
            player:["phaseDrawBegin"]
        },
        priority: Infinity,
        forced:true,
        filter: function (event, player) {
            return !event.numFixed;
        },
        async content(event, trigger, player) {
            trigger.num += 2;
        },
        ai:{
            threaten:1.5,
        },
        "_priority":0,
    },
    //张宁
    icetianze:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #AFEEEE>天则</font>",
        intro:{
            name:"<font color= #AFEEEE>天则</font>",
            mark:function(dialog, storage, player) {
                const cards = player.getCards('s', card => card.hasGaintag('icetianze_tag'));
                if (cards.length) {
                    dialog.addAuto(cards);
                } else {
                    dialog.addText(setColor('无「天则」牌！'));
                }
            },
            markcount:function(storage, player) {
                const num = player.getCards('s', card => card.hasGaintag('icetianze_tag')).length;
                return num;
            },
        },
        init:function (player, skill) {
            player.storage.icetianze = 0;
        },
        trigger:{
            source:["damageBegin"],
            player:["damageBegin"],
            global:["judge"],
        },
        locked:false,
        direct:true,
        filter:function (event, player, name) {
            const cards = player.getCards('s', card => card.hasGaintag('icetianze_tag'));
            if (name == 'judge') {
                return cards.length > 0;
            } else {
                return !cards.length || cards.length <= 3;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'judge') {
                const TXT = get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，" + get.prompt("icetianze");
                const result = await player.chooseCard(TXT ,"s", card => {
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
                    const resultnum = trigger.judge(card) - trigger.judge(judging);
                    const attitude = get.attitude(player, trigger.player);
                    if (attitude == 0 || resultnum == 0) return 0;
                    if (attitude > 0) {
                        return resultnum - get.value(card) / 2;
                    } else {
                        return -resultnum - get.value(card) / 2;
                    }
                }).forResult();
                if (result.bool) {
                    await player.respond(result.cards[0], "highlight", "icetianze", "noOrdering");
                    player.$gain2(trigger.player.judging[0]);
                    await player.gain(trigger.player.judging[0]);
                    trigger.player.judging[0] = result.cards[0];
                    trigger.orderingCards.addArray(result.cards);
                    game.log(trigger.player, "的判定牌改为", result.cards[0]);
                    await game.delay(2);
                }
            } else {
                if (!player.storage.icetianze) player.storage.icetianze = 0;
                const suits = ["diamond", "heart", "club", "spade"][player.storage.icetianze % 4];
                const list = [];
                const piles = ["cardPile", "discardPile"];
                for (const pile of piles) {
                    const cards = ui[pile].childNodes;
                    for (let i = 0; i < cards.length; i++) {
                        const card = cards[i];
                        if (!list.includes(card) && get.suit(card) == suits) {
                            list.push(card);
                            if (list.length > 0) break;
                        }
                    }
                    if (list.length > 0) break;
                }
                if (list.length > 0) {
                    await player.gain(list, "gain2");
                    player.storage.icetianze++;
                    player.loseToSpecial(list, "icetianze_tag").visible = true;
                    game.log(player, '将', list, '放到了武将牌上');
                    player.logSkill(event.name);
                    player.markSkill("icetianze");
                    const card = list[0];
                    const number = get.number(card);
                    const suit = get.suit(card);
                    if (number == 11 || number == 12 || number == 13 || number == 1) {
                        if (suit == "diamond") {
                            const result = await player.chooseTarget('是否弃置场上的一张牌？', (card, player, target) => {
                                return target.countDiscardableCards(player, 'ej');
                            }).set('ai', target => {
                                const att = get.attitude(player, target);
                                if (att > 0 && (target.countCards('j') > 0 || target.countCards('e', function(card) {
                                    return get.value(card, target) < 0;
                                }))) return 2;
                                if (att < 0 && target.countCards('e') > 0 && !target.hasSkillTag('noe')) return -1;
                                return 0;
                            }).forResult();
                            if (result.bool) {
                                const chat = ["让本小姐看看，弃置谁的牌好呢？", "那就你的吧：）嘻嘻！"].randomGet();
                                player.chat(chat);
                                player.discardPlayerCard(result.targets[0],'ej',true);
                            }
                        } else if (suit == "heart") {
                            await player.recover();
                        } else if (suit == "club") {
                            if (player.canMoveCard()) {
                                player.moveCard();
                            } 
                        } else if (suit == "spade") {
                            const result = await player.chooseTarget('请选择一名其他角色对其造成一点⚡伤害。', (card, player, target) => {
                                return target != player
                            }).set('ai',  target => {
                                const player = _status.event.player;
                                return - get.attitude(player, target);
                            }).forResult();
                            if (result.bool) {
                                player.line(result.targets[0], 'thunder');
                                result.targets[0].damage("thunder", player);
                            }
                        }
                    }
                }
            }
        },
        ai:{
            threaten:function (player, target) {
                const ss = player.getCards('s', function (card) {
                    return card.hasGaintag('icetianze');
                });
                const att = get.attitude(player, target);
                if (att < 2) {
                    return Math.max(ss.length, 1);
                } else {
                    return 0.5;
                }
            },
            rejudge: true,
            tag: {
                rejudge: 1,
            },
            skillTagFilter: function (player, tag) {
                const cards = player.getCards('s', card => card.hasGaintag('icetianze_tag'));
                if (tag === "rejudge") {
                   if (cards.length > 0) return true;
                   return false;
                }
            },
        },
        "_priority":0,
    },
    icedifa:{
        audio:"ext:银竹离火/audio/skill:2",
        enable:"phaseUse",
        filter:function(event, player) {
            const dislist = player.getdisSkill();
            const num = player.getCards('s', card => card.hasGaintag('icetianze_tag')).length;
            return num > 0 && !dislist.includes('icedifa');
        },
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            let list = [];
            const num = player.getCards('s', card => card.hasGaintag('icetianze_tag')).length;
            const qunGroup = game.filterPlayer((current) => current.group == 'qun').length;
            const viewcardsnum = player.getDamagedHp() + num + qunGroup;
            const cardsdown = get.bottomCards(viewcardsnum);
            game.cardsGotoOrdering(cardsdown);
            const result = await player.chooseCardButton(
                "〖地法〗：请选择点数不同且点数为贰至玖之间的至多四张牌。",
                cardsdown, [0, 4]
            ).set("filterButton", function(button) {
                const selectedNumbers = ui.selected.buttons.map((已选择) => get.number(已选择.link));
                const num = get.number(button.link);
                return num >= 2 && num <= 9 && !selectedNumbers.includes(num);
            }).set("ai", function(button) {
                const value = get.value(button.link);
                return value;
            }).forResult();
            if (result.bool) {
                player.logSkill("icedifa");
                player.tempdisSkill('icedifa');
                const cards = result.links;
                await player.gain(cards, 'gain2');
                list = cardsdown.filter(card => !cards.includes(card));
            }
            if (list.length > 0) {
                const result = await player.chooseToMove("〖地法〗",true)
                .set("list", [["牌堆顶", list]]).set("prompt", "请将剩余的牌按任意顺序置于牌堆顶")
                .set("filterMove", (from, to, moved) => {
                    return true;
                }).set('filterOk', (moved) => {
                    return true;
                }).set("processAI", (list) => {
                    const cards = list[0][1];
                    let 排序后 = [];
                    const target = _status.currentPhase.next;
                    const judges = target.node.judges.childNodes;
                    const hasFriend = get.attitude(player, target) >= 2;
                    const att = get.attitude(player, target);
                    let cheats = [];
                    if (judges.length > 0) {
                        if (hasFriend) {
                            cheats = setjudgesResult(judges,cards,player,false);//令判定牌失效的卡牌
                        } else {
                            cheats = setjudgesResult(judges,cards,player,true);//令判定牌生效的卡牌
                        }
                    }
                    let remainingCards = cards.filter(card => !cheats.includes(card));
                    if (att >= 2) {
                        remainingCards.sort((a, b) => get.value(b, target) - get.value(a, target));
                    } else {
                        remainingCards.sort((a, b) => get.value(a, target) - get.value(b, target));
                    }
                    排序后 = [cheats.concat(remainingCards)];
                    return 排序后;
                }).forResult();
                if (result.bool) {
                    let topcards = result.moved[0];
                    if (topcards.length > 0) {
                        player.chooseCardsToPile(topcards,"top");
                    }
                }
            }
        },
        ai: {
            threaten: 1.5,
            order: 13,
            result: {
                player: 1,
            },
        },
        "_priority":0,
    },
    //曹婴
    icelingren:{
        audio:"ext:银竹离火/audio/skill:4",
        mark:true,
        marktext:"☯",
        onremove:true,
        zhuanhuanji:true,
        intro:{
            content:function(event, player){
                let TXT = "";
                if(player.group === 'wei') {
                    TXT = setColor("魏：你的回合开始时，你将势力转换至「群」！");
                } else {
                    TXT = setColor("群：凌人获得全部衍生技后，你将势力转换至「魏」！");
                }
                return TXT;
            },
            name:"<font color= #AFEEEE>凌人</font>",
        },
        trigger:{
            player:["phaseBegin","useCardToPlayered"],
        },
        changeGroup:['qun','wei'],
        locked:false,
        direct:true,
        init:async function (player, skill) {
            await game.changeGroupSkill(player, skill);
        },
        filter:function (event, player, name) {
            if (name == 'phaseBegin') {
                return player.group !== 'qun';
            } else if (name == 'useCardToPlayered') {
                if (event.getParent().triggeredTargets3.length > 1) return;
                if (!["basic", "trick"].includes(get.type(event.card))) return;
                if (get.tag(event.card, "damage")) return true;
                return;
            }
        },
        derivation: ["icelingren_guixin","icelingren_xingshang"],
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === 'phaseBegin') {
                player.changeZhuanhuanji("icelingren");
                if (player.group !== 'qun') {
                    player.changeGroup("qun");
                }
                return;
            }
            const targets = await icelingren(trigger, player);
            if (targets.length > 0) {
                const target = targets[0];
                const list = ["basic", "trick", "equip"];
                const result = await player.chooseButton([
                    "〖凌人〗：猜测其有哪些类别的手牌？",
                    [list, "vcard"]
                ]).set("selectButton", [0, 3]).set("forced", true).set("ai", icelingrenguessAI(player, target)).forResult();
                
                if (result.bool) {
                    player.logSkill(event.name);
                    player.tempdisSkill('icelingren')
                    const choices = result.links.map(i => i[2]);
                    if (!event.isMine() && !event.isOnline()) await game.delayx();
                    let num = 0;
                    ["basic", "trick", "equip"].forEach(type => {
                        if (choices.includes(type) === target.hasCard({ type: type }, "h")) num++;
                    });
                    player.popup(`猜对${get.cnNumber(num)}项`);
                    game.log(player, `猜对了${get.cnNumber(num)}项`);
                    if (num > 0) {
                        player.draw();
                        if (trigger.target === target) {
                            trigger.getParent().baseDamage++;
                        }
                    }
                    if (num > 1) {
                        player.draw();
                        player.addTempSkill('icelingren_guixin', { player: 'phaseBegin' });
                    }
                    if (num > 2) {
                        player.changeZhuanhuanji("icelingren");
                        if (player.group !== 'wei') {
                            player.changeGroup("wei");
                        }
                        player.draw();
                        player.addTempSkill('icelingren_xingshang', { player: 'phaseBegin' });
                    }
                }
            }
        },
        "_priority":0,
    },
    icelingren_guixin:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #0088CC>归心</font>",
        onremove:true,
        intro:{
            content:function(storage, player) {
                const dislist = player.getdisSkill();
                const nummark = player.countMark('icelingren_guixin'); 
                if (dislist.includes('icelingren_guixin')) return '本回合已失效。';
                return '<font color= #0088CC>当前已使用次数=　</font>' + nummark;
            },
            name:"<font color= #0088CC>归心</font>",
        },
        trigger:{
            player:"damageBegin",
            global:["phaseAfter"],
        },
        locked:false,
        direct:true,
        filter:function (event, player, name) {
            if (name === 'phaseAfter') {
                player.clearMark('icelingren_guixin');
                return;
            } else if (name === 'damageBegin') {
                if (!event.source) return;
                return event.num > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseAfter") return;
            let count = trigger.num || 1;
            while (count > 0) {
                count--;
                let result = await player.chooseBool(get.prompt2(event.name)).set('ai', function (bool) {
                    const shouyi = thunderguixinAI(player);
                    return shouyi > 0;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    player.addMark(event.name, 1);
                    const nowei = game.filterPlayer(function (current) {
                        return current.group != 'wei';
                    }).sortBySeat();
                    if (nowei.length > 0) {
                        for ( let target of nowei) {
                            player.line(target, 'thunder');
                            await target.draw();
                        }
                    }
                    const choosetargets = game.filterPlayer(function (current) {
                        return current.isAlive() && current.getCards('hej').length > 0 && current.countGainableCards(player, "hej") > 0;
                    });
                    let count = 0;
                    if (choosetargets.length > 0) {
                        for (let target of choosetargets) {
                            count ++;
                            await player.gainPlayerCard(target, "hej", true);
                        }
                    }
                    const disnum = Math.floor(count / 2);
                    if (disnum > 0) {
                        await player.chooseToDiscard(disnum, 'he', true);
                    }
                    const nummark = player.countMark(event.name);
                    if (nummark > player.getDamagedHp()) {
                        player.tempdisSkill(event.name);
                        await player.changeCardsTo(4, 'he');
                        player.turnOver();
                        player.link(true);
                        player.damage(1, "thunder");
                    }
                }
            }
        },
        ai:{
            expose:0.2,
            maixie:true,
            "maixie_hp":true,
            threaten:function (player, target) {
                const att = get.attitude(player, target);
                let threatennum = thunderguixinAI(player);;
                if (att < 2) {
                    return Math.max(1, threatennum);
                } else {
                    return 0.5;
                }
            },
            effect:{
                target: function (card, player, target) {
                    const dislist = target.getdisSkill();
                    if (get.tag(card, 'damage') && !dislist.includes('icelingren_guixin')) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        return [1, thunderguixinAI(target) - get.tag(card, "damage")];
                    }
                },
            },
        },
        "_priority":Infinity,
    },
    icelingren_xingshang:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #0088CC>行殇</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #0088CC>行殇</font>",
        },
        trigger:{
            global:"dying",
        },
        locked:false,
        direct:true,
        init:async function (player, skill) {
            await initxingshang(player, skill);
        },
        filter:function (event, player) {
            if (!player.hasZhuSkill('thundersongwei')){
                if (event.player === player) return;
            }
            if (event.player.storage.TXScy_used) return;
            const dissumA = Math.max(player.getDamagedHp(), 1);
            const dissumB = Math.max(player.hp, 1);
            const phes = player.getCards('hes').length;
            return phes >= dissumA || phes >= dissumB;
        },
        async content(event, trigger, player) {
            const dissumA = Math.max(player.getDamagedHp(), 1);
            const dissumB = Math.max(player.hp, 1);
            const phes = player.getCards('hes').length;
            const att = get.attitude(player, trigger.player);
            const drawsum = game.filterPlayer(function(current) {
                return current.group == 'wei';
            }).length;
            const thesj = trigger.player.getCards('hesj');
            const gainsum = Math.ceil(thesj.length / 2);
            const list = [
                //弃置区域内你已损失体力值数张牌，随机使用一张装备牌，失去一点体力并摸场上魏势力人数张牌；
                "〖选项一〗：弃置区域内" + get.cnNumber(dissumA) + "张牌：随机使用一张装备牌，失去一点体力并摸" + get.cnNumber(drawsum) + "张牌。",
                //弃置区域内你体力值数张牌，随机失去一张装备牌，回复一点体力并获得其区域内半数向上取整张牌。
                "〖选项二〗：弃置区域内" + get.cnNumber(dissumB) + "张牌：随机失去一张装备牌，回复一点体力并获得" + get.translation(trigger.player) + "区域内" + get.cnNumber(gainsum) + "张牌。",
            ];
            const chooseButton = await player.chooseButton([get.prompt('icelingren_xingshang'),
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) { //选项一
                    if (phes >= dissumA) return true;
                    else return false;
                } else if (button.link === 1) { //选项二
                    if (phes >= dissumB) return true;
                    else return false;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                /**
                 * 我真棒！o(￣▽￣)ｄ good！
                 * 非常全面的AI！！！
                 * 你是我见过最棒的AI！
                 */
                let shouyi = thunderxingshangAI(player, trigger.player, att);
                if (shouyi == 0) return;
                switch (button.link) {
                    case 0:
                        if (shouyi == 1) return true;
                    case 1:
                        if (shouyi == 2) return true;
                }
            }).forResult();
            if (chooseButton.bool) {
                player.logSkill(event.name);
                if (!player.getStorage('icelingren_xingshang').includes(trigger.player) && !trigger.player.storage.TXScy_used) {
                    trigger.player.storage.TXScy_used = true;
                    player.markAuto('icelingren_xingshang', [trigger.player]);
                }
                const choices = chooseButton.links;
                if (choices.includes(0)) {
                    await player.chooseToDiscard(dissumA, 'he', true);
                    const equipcards = await player.specifyCards("equip");
                    if (equipcards.length > 0) {
                        await player.equip(equipcards[0]);
                    }
                    await player.loseHp();
                    await player.draw(drawsum);
                } else if (choices.includes(1)) {
                    await player.chooseToDiscard(dissumB, 'he', true);
                    const equipcards = player.getCards('es');
                    if (equipcards.length > 0) {
                        await player.discard(equipcards.randomGets(1));
                    }
                    await player.recover();
                    if (gainsum > 0) {
                        const gaincards = thesj.randomGets(gainsum);
                        if (gaincards.length > 0) {
                            player.gain(gaincards, 'gain2');
                            game.log(player, "发动了", "#g〖行殇〗", "从", get.translation(trigger.player), "区域内获得了", gaincards.length, "张牌！");
                        }
                    }
                }
            }
        },
        ai:{
            threaten: function(player, target) {
                var att = get.attitude(player, target);
                if (att < 2) {
                    if (target.hp == 1) {
                        if (target.storage.TXScy_used) return 1;
                        else return 3.5;
                    } else {
                        if (target.storage.TXScy_used) return 1;
                        else return 1.5;
                    }
                } else {
                    return 0.5;
                }
            },
        },
        "_priority": Infinity,
    },
    icefujian:{
        mod:{
            globalFrom:function (from, to) {
                if (from.getStorage('icefujian').includes(to)) return -Infinity;
            },
        },
        audio:"ext:银竹离火/audio/skill:4",
        marktext:"<font color= #0088CC>伏间</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #0088CC>伏间</font>",
        },
        trigger:{
            global:["phaseBegin","phaseEnd"],
        },
        filter:function (event, player, name) {
            const targets = game.filterPlayer().filter(o=> o.isAlive() && o !== player);
            const targetsview = targets.filter(o=> !o.storage.icefujian_used);
            const targetsused = targets.filter(o=> o.storage.icefujian_used);
            const list = player.getStorage('icefujian');
            if (name == 'phaseBegin') {
                return targets.length > 0 && targetsview.length > 0;
            } else if (name == 'phaseEnd') {
                if (targets.length > 0 && targetsused.length >= targets.length) return true;
                if (list.length > 0) return true;
                return false;
            }
        },
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const targets = game.filterPlayer().filter(o=> o.isAlive() && o !== player);
            const targetsview = targets.filter(o=> !o.storage.icefujian_used);
            const targetsused = targets.filter(o=> o.storage.icefujian_used);
            if (Time === 'phaseBegin') {
                if (targetsview.length > 0) {
                    const randomTarget = targetsview.randomGet();
                    randomTarget.storage.icefujian_used = true;
                    player.line(randomTarget, 'thunder');
                    player.logSkill(event.name);
                    if (!player.getStorage('icefujian').includes(randomTarget)) {
                        player.markAuto('icefujian', [randomTarget]);
                    }
                }
                if (trigger.player === player) {
                    const target = player.getStorage('icefujian');
                    if (target.length) {
                        let gaincards = [];
                        let damagecards = [];
                        const tcards = target[0].getCards('he').filter(card => get.tag(card, "damage")).randomSort();
                        for (let card of  ui.cardPile.childNodes) {
                            if (get.tag(card, "damage") > 0) {
                                if (!damagecards.includes(card)) {
                                    damagecards.push(card);
                                }
                            }
                        }
                        damagecards = damagecards.randomSort(); 
                        gaincards = gaincards.concat(tcards, damagecards);
                        if (gaincards.length) {
                            player.gain(gaincards[0], 'gain2');
                        }
                    }
                }
            } else {
                if (player.hasSkill('icefujian')) {
                    player.removeStorage('icefujian');
                    player.unmarkSkill('icefujian');
                }
                if (targets.length > 0 && targetsused.length >= targets.length) {
                    player.logSkill(event.name);
                    for( let target of targets) {
                        player.line(target, 'thunder');
                        target.storage.icefujian_used = false;
                    }
                }
            }
        },
        ai:{
            viewHandcard:true,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    if (target.storage.icefujian_used) {
                        return 2;
                    }
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
            skillTagFilter:function (player, tag, arg) {
                return arg != player && !_status.auto && player.getStorage('icefujian').includes(arg);
            },
        },
        "_priority": Infinity,
    },
    //貂蝉
    icelijian: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            global: ["damageAfter","phaseEnd"],
        },
        locked:false,
        direct:true,
        init:async function (player, skill) {
            if (!player.storage.icelijian_one) player.storage.icelijian_one = 0;
            if (!player.storage.icelijian_two) player.storage.icelijian_two = 0;
            if (!player.getdamageNum) player.getdamageNum = function (target) {
                const evts = game.getAllGlobalHistory("everything", evt => {
                    if (!evt.name || evt.name !== "damage") return false;
                    return evt.source && evt.source === target && evt.num > 0;
                });
                if (!evts || evts.length === 0) return 0;
                return evts.length;
            };
        },
        filter: function (event, player,name) {
            if (name == 'damageAfter') {
                if (!event.source) return;
                if (_status.currentPhase != event.source) return;
                if (event.source == player) return;
                const target = event.source;
                const damagenum = player.getdamageNum(target);
                const one = player.storage.icelijian_one;
                const two = player.storage.icelijian_two;
                if (damagenum % 2 === 1 && one < 3) {
                    return player.countCards("he") > 0;
                } else if (damagenum % 2 === 0 && two < 3) {
                    const haslijianSkills = getlijianSkills(target);
                    return haslijianSkills.length < 3;
                }
            } else if (name == 'phaseEnd') {
                player.storage.icelijian_one = 0;
                player.storage.icelijian_two = 0;
                if (event.player.hasSkill('icelijian_tanbuff')) {
                    const maxHandnum = event.player.tanbuff_diaochandraw;
                    return maxHandnum && maxHandnum < 0;
                }
                return false;
            }
        },
        derivation: ["icelijian_tanbuff", "icelijian_chenbuff", "icelijian_chibuff", "icelijian_libuff", "icelijian_yibuff"],
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === 'damageAfter') {
                const target = trigger.source;
                const att = get.attitude(player, target);
                const damagenum = player.getdamageNum(target);
                if (damagenum % 2 === 1) {
                    let cards = await player.chooseCard("he", `【离间①】：是否要选择交给${get.translation(target)}一张牌？`).set("ai", icelijianCardsAI(player, target)).forResultCards();
                    if (cards && cards.length) {
                        player.logSkill(event.name, target);
                        if (!player.storage.icelijian_one) player.storage.icelijian_one = 0;
                        player.storage.icelijian_one ++;
                        player.line(target, 'ice');
                        await player.give(cards, target);
                        let card = cards[0];
                        const listone = getCardSuitNum(card);
                        const listtwo = getCardNameNum(card);
                        if (!target.hasSkill('icelijian_card')) target.addTempSkill("icelijian_card");
                        if (!target.icelijian_card) target.icelijian_card = [[],[]];
                        target.icelijian_card[0] = [listone, listtwo];
                        target.icelijian_card[1] = [player];
                    }
                } else if (damagenum % 2 === 0) {
                    let result = await player.chooseBool('【离间②】：是否要令其随机获得「贪丨嗔丨痴丨戾丨疑」技能中一个直到其下个回合结束(不重复获得)？').set('ai', function() {
                        return att < 2;
                    }).forResult();
                    if (result.bool) {
                        player.logSkill(event.name, target);
                        if (!player.storage.icelijian_two) player.storage.icelijian_two = 0;
                        player.storage.icelijian_two ++;
                        player.line(target, 'ice');
                        const getskillname = getlijianSkills(target,'gain');
                        if (getskillname && typeof getskillname == 'string') {
                            if (getskillname == 'icelijian_chenbuff') {
                                if (!target.chenbuff_typelist) target.chenbuff_typelist = [];
                                const getcards = await target.gainCardsRandom(2);
                                for (let card of getcards) {
                                    let type = get.type(card);
                                    if (!target.chenbuff_typelist.includes(type)) {
                                        target.chenbuff_typelist.push(type);
                                    }
                                }
                            }
                            target.addSkill(getskillname);
                        }
                        if (!target.hasSkill('icelijian_LJ')) target.addSkill("icelijian_LJ");
                    }
                }
            } else if (Time === 'phaseEnd') {
                const maxHandnum = trigger.player.tanbuff_diaochandraw;
                if (maxHandnum < 0) {
                    const drawnum = Math.abs(maxHandnum);
                    player.line(trigger.player, 'ice');
                    player.logSkill("icelijian",trigger.player);
                    await player.draw(drawnum);
                }
            }
        },
        ai:{
            expose: 0.65,
            threaten: 1.5,
        },
        subSkill: {
            LJ: {
                mark: true,
                marktext: "<font color= #AFEEEE>离间</font>",
                onremove: true,
                intro: {
                    content: function (storage, player) {
                        let result = "";
                        if (player.hasSkill('icelijian_tanbuff')) {
                            const maxHandnum = player.tanbuff_diaochandraw;
                            if (maxHandnum < 0) {
                                const drawnum = Math.abs(maxHandnum);
                                result += setColor("〖贪〗：使用牌后，每回合每种类型限一次，摸剩余类型数张牌并弃置已使用类型数张牌，每次使该回合手牌上限 - 该次获得牌数；该回合结束后，貂蝉摸" + get.cnNumber(drawnum) + "张牌。<br>");
                            } else {
                                result += setColor("〖贪〗：使用牌后，每回合每种类型限一次，摸剩余类型数张牌并弃置已使用类型数张牌，每次使该回合手牌上限 - 该次获得牌数；该回合结束后，貂蝉摸反向手牌上限数张牌。<br>");
                            }
                        }
                        if (player.hasSkill('icelijian_chenbuff')) {
                            const canuseType = player.chenbuff_typelist;
                            if (canuseType && canuseType.length) {
                                result += setColor("〖嗔〗：本回合内，你只能使用以下类型的卡牌：" + canuseType.map(type => get.translation(type)).join('、') + "<br>");
                            }
                        }
                        if (player.hasSkill('icelijian_chibuff')) {
                            result += setColor("〖痴〗：使用牌后，每回合每种花色限一次，选择执行一项：弃置一张牌/貂蝉摸一张。<br>");
                        }
                        if (player.hasSkill('icelijian_libuff')) {
                            result += setColor("〖戾〗：当戾/非戾角色使用牌指定非戾非貂蝉/戾非貂蝉的单一目标后，可弃置一张牌令貂蝉摸一张牌，并令此牌对该角色的伤害+1。<br>");
                        }
                        if (player.hasSkill('icelijian_yibuff')) {
                            result += setColor("〖疑〗：回合内/外，使用非伤害标签牌时，无法对自己及貂蝉/其他角色使用。");
                        }
                        return result;
                    },
                    onunmark: true,
                    name: "<font color= #AFEEEE>离间</font>",
                },
                trigger: {
                    global: "phaseAfter",
                },
                superCharlotte: true,
                charlotte: true,
                silent: true,
                priority: -25,
                direct: true,
                filter: function (event, player) {
                    return getlijianSkills(player).length === 0;
                },
                async content(event, trigger, player) {
                    player.removeSkill("icelijian_LJ");
                },
                sub: true,
                sourceSkill: "icelijian",
            },
            card: {
                trigger: {
                    source:"damageSource",
                    player: "phaseEnd",
                },
                superCharlotte: true,
                charlotte: true,
                unique: true,
                direct: true,
                init: function (player) {
                    if (!player.icelijian_card) player.icelijian_card = [[],[]];
                },
                filter: function (event, player, name) {
                    if (name == 'damageSource') {
                        const target = player.icelijian_card[1][0];
                        return target && target.isAlive();
                    } else {
                        delete player.icelijian_card;
                        return;
                    }
                },
                async content(event, trigger, player) {
                    const Time = event.triggername;
                    if (Time === "damageSource") {
                        let count = 0;
                        const target = player.icelijian_card[1][0];
                        const getCardNameNum = player.icelijian_card[0][1];
                        if (getCardNameNum && getCardNameNum > 0) {
                            await player.draw(getCardNameNum);
                            count ++;
                        }
                        const getCardSuitNum = player.icelijian_card[0][0];
                        if (getCardSuitNum && getCardSuitNum > 0) {
                            await target.draw(getCardSuitNum);
                            count ++;
                        }
                        if (count > 0) {
                            target.logSkill('icelijian', player);
                            target.line(player, 'ice');
                        }
                    }
                },
                sub: true,
                sourceSkill: "icelijian",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    icebiyue: {
        audio: "ext:银竹离火/audio/skill:2",
        mod:{
            maxHandcard:function (player, num) {
                const quns = game.filterPlayer(function(current) {
                    return current.group == 'qun';
                }).length;
                return num + quns;
            },
        },
        trigger: {
            player: ["phaseBegin","phaseEnd"],
        },
        locked:true,
        direct:true,
        filter: function (event, player) {
            return true;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const targetsnum = checklijiantargets();
            const debuffsnum = checklijiandebuffs();
            if (Time === "phaseBegin") {
                if (targetsnum > 0) {
                    player.logSkill(event.name);
                    await player.draw(targetsnum);
                }
            } else if (Time === "phaseEnd") {
                if (debuffsnum > 0) {
                    player.logSkill(event.name);
                    await player.draw(debuffsnum);
                }
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return Math.max(checklijiantargets(), checklijiandebuffs(), 1);
                } else {
                    return 0.5;
                }
            },
        },
        "_priority": Infinity,
    },
    icelijian_tanbuff: {
        mod:{
            maxHandcard:function (player, num) {
                if (checkdiaochans().length === 0) return num;
                const setnum = player.tanbuff_maxHandcard;
                if (setnum && setnum > 0) {
                    player.tanbuff_diaochandraw = num - setnum;
                    return num - setnum;
                } else {
                    return num;
                }
            },
        },
        trigger: {
            player: ["useCardAfter"],
            global: ["phaseAfter"],
        },
        superCharlotte: true,
        charlotte: true,
        silent: true,
        priority: 1,
        direct: true,
        init: function (player) {
            if (!player.tanbuff_typeused) player.tanbuff_typeused = [];
            if (!player.tanbuff_checkTypes) player.tanbuff_checkTypes = [];
            if (!player.tanbuff_maxHandcard) player.tanbuff_maxHandcard = 0;
            if (!player.tanbuff_diaochandraw) player.tanbuff_diaochandraw = 0;
            if (!player.tanbuff_phaseAfter) player.tanbuff_phaseAfter = false;
        },
        filter: function (event, player, name) {
            if (name == 'useCardAfter') {
                if (checkdiaochans().length === 0) return false;
                const type = get.type(event.card);
                if (!type) return false;
                if (player.tanbuff_typeused.includes(type)) return false;
                return true;
            } else {
                if (player.tanbuff_phaseAfter === true) {
                    delete player.tanbuff_typeused;
                    delete player.tanbuff_checkTypes;
                    delete player.tanbuff_maxHandcard;
                    delete player.tanbuff_diaochandraw;
                    delete player.tanbuff_phaseAfter;
                    player.update();
                    player.removeSkill("icelijian_tanbuff");
                    return;
                } else {
                    return true;
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseAfter") {
                player.tanbuff_typeused = [];
                player.tanbuff_checkTypes = [];
                player.tanbuff_maxHandcard = 0;
                player.tanbuff_diaochandraw = 0;
                player.tanbuff_phaseAfter = true;
                player.update();
                return;
            } else {
                let typlist = [];
                for (let cardname of lib.inpile) {
                    const type = get.type(cardname);
                    if (type && !typlist.includes(type)) {
                        typlist.push(type);
                    }
                }
                if (typlist.length === 0) return;
                player.tanbuff_checkTypes = typlist;
                const type = get.type(trigger.card);
                if (!player.tanbuff_typeused.includes(type)) player.tanbuff_typeused.push(type);
                const numdraw = player.tanbuff_checkTypes.length - player.tanbuff_typeused.length;
                const numdis = player.tanbuff_typeused.length;
                if (numdraw > 0) {
                    await player.draw(numdraw);
                    player.tanbuff_maxHandcard += numdraw;
                    game.log(player, "使用", trigger.card, "将获得", numdraw, "张牌，本次使自己的手牌上限减", numdraw,"!");
                }
                if (numdis > 0) {
                    await player.chooseToDiscard(numdis, 'he', true);
                }
            }
        },
    },
    icelijian_chenbuff: {   
        mod:{
            cardEnabled:function(card, player) {
                if (checkdiaochans().length === 0) return;
                const cardType = get.type(card);
                const canuseType = player.chenbuff_typelist;
                if (_status.currentPhase == player) {
                    if (canuseType && canuseType.includes(cardType)) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            cardSavable: function(card, player) {
                if (checkdiaochans().length === 0) return;
                const cardType = get.type(card);
                const canuseType = player.chenbuff_typelist;
                if (_status.currentPhase == player) {
                    if (canuseType && canuseType.includes(cardType)) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            cardRespondable: function(card, player){
                if (checkdiaochans().length === 0) return;
                const cardType = get.type(card);
                const canuseType = player.chenbuff_typelist;
                if (_status.currentPhase == player) {
                    if (canuseType && canuseType.includes(cardType)) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
        },
        trigger: {
            player: ["phaseAfter"],
        },
        superCharlotte: true,
        charlotte: true,
        silent: true,
        priority: 2,
        direct: true,
        init: function (player) {
            if (!player.chenbuff_phaseAfter) player.chenbuff_phaseAfter = false;
        },
        filter: function (event, player) {
            if (player.chenbuff_phaseAfter === true) {
                delete player.chenbuff_typelist;
                delete player.chenbuff_phaseAfter;
                player.update();
                player.removeSkill("icelijian_chenbuff");
                return;
            } else {
                return true;
            }
        },
        async content(event, trigger, player) {
            player.chenbuff_phaseAfter = true;
            return;
        },
    },
    icelijian_chibuff: {
        trigger: {
            player: ["useCardAfter"],
            global: ["phaseAfter"],
        },
        superCharlotte: true,
        charlotte: true,
        silent: true,
        priority: 3,
        direct: true,
        init: function (player) {
            if (!player.chibuff_suitused) player.chibuff_suitused = [];
            if (!player.chibuff_phaseAfter) player.chibuff_phaseAfter = false;
        },
        filter: function (event, player, name) {
            if (name == 'useCardAfter') {
                if (checkdiaochans().length === 0) return false;
                const suit = get.suit(event.card);
                if (!suit) return false;
                if (player.chibuff_suitused.includes(suit)) return false;
                return true;
            } else {
                if (player.chibuff_phaseAfter === true) {
                    delete player.chibuff_suitused;
                    delete player.chibuff_phaseAfter;
                    player.update();
                    player.removeSkill("icelijian_chibuff");
                    return;
                } else {
                    return true;
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseAfter") {
                player.chibuff_suitused = [];
                player.chibuff_phaseAfter = true;
                player.update();
                return;
            }
            const suit = get.suit(trigger.card);
            if (!player.chibuff_suitused.includes(suit)) {
                player.chibuff_suitused.push(suit);
                let lists = [];
                let Control1 = false, Control2 = false;
                if (player.countCards('he') > 0) {
                    lists.push("你弃置一张牌");
                    Control1 = true;
                }
                if (checkdiaochans().length > 0) {
                    lists.push("貂蝉摸一张牌");
                    Control2 = true;
                }
                if (lists.length === 0) return;
                const result = await player.chooseControl(lists).set ("ai", control => {
                    if (Control2) {
                        let attlist = [];
                        for (let diaochan of checkdiaochans()) {
                            const att = get.attitude(player, diaochan);
                            if (att) {
                                attlist.push(att);
                            }
                        }
                        const attsum = attlist.reduce((a, b) => a + b, 0);
                        if (attsum > 0) {
                            return "貂蝉摸一张牌";
                        } else {
                            if (Control1) {
                                if (player.countCards('he') > player.maxHp) return "你弃置一张牌";
                                else return "貂蝉摸一张牌";
                            } else {
                                return "貂蝉摸一张牌";
                            }
                        }
                    }
                    if (Control1) {
                        if (player.countCards('he') > player.maxHp) return "你弃置一张牌";
                        else return "貂蝉摸一张牌";
                    }
                }).set('forced', true).forResult();
                if (result.control === "你弃置一张牌") {
                    await player.chooseToDiscard(1, 'he', true);
                } else if (result.control === "貂蝉摸一张牌") {
                    for (let diaochan of checkdiaochans()) {
                        await diaochan.draw();
                        if (diaochan.hasSkill("icelijian")) {
                            diaochan.line(player, 'ice');
                            diaochan.logSkill("icelijian",player);
                        }
                    }
                }
            }
            
        },
    },
    icelijian_libuff: {
        trigger: {
            player: ["useCardToPlayered","phaseAfter"],
            target: ["useCardToTargeted"],
        },
        superCharlotte: true,
        charlotte: true,
        silent: true,
        priority: 4,
        direct: true,
        init: function (player) {
            if (!player.libuff_phaseAfter) player.libuff_phaseAfter = false;
        },
        filter: function (event, player, name) {
            if (name == 'useCardToPlayered') {
                if (checkdiaochans().length === 0) return false;
                if (!event.targets) return false;
                if (event.targets.length !== 1) return false;
                for (let target of event.targets) {
                    if (checkdiaochans().includes(target)) {
                        return false;
                    }
                }
                return get.tag(event.card, "damage") > 0 && player.countCards('he') > 0;
            } else if (name == 'useCardToTargeted') {
                if (checkdiaochans().length === 0) return false;
                if (event.player === player) return false;
                if (!event.targets) return false;
                if (event.targets.length !== 1) return false;
                for (let target of event.targets) {
                    if (checkdiaochans().includes(target)) {
                        return false;
                    }
                }
                return get.tag(event.card, "damage") > 0 && event.player.countCards('he') > 0;
            } else {
                if (player.libuff_phaseAfter === true) {
                    delete player.libuff_phaseAfter;
                    player.update();
                    player.removeSkill("icelijian_libuff");
                    return;
                } else {
                    return true;
                }

            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseAfter") {
                player.libuff_phaseAfter = true;
                return;
            } else {
                const target = trigger.targets[0];
                const tplayer = trigger.player;
                const att = get.attitude(tplayer, target);
                const cardname = get.name(trigger.card);
                const message = "【离间·戾】：是否弃一张牌并令貂蝉摸一张牌，然后令此" + get.translation(cardname) + "对" + get.translation(target) + "造成的伤害 + 1？";
                let result = await tplayer.chooseBool(message).set('ai', function() {
                    return att < 2;
                }).forResult();
                if (result.bool) {
                    await tplayer.chooseToDiscard(1, 'he', true);
                    for (let diaochan of checkdiaochans()) {
                        await diaochan.draw();
                        if (diaochan.hasSkill("icelijian")) {
                            diaochan.line(tplayer, 'ice');
                            diaochan.logSkill("icelijian",tplayer);
                        }
                    }
                    game.log(tplayer, "使用", trigger.card, "将对", target, "造成的伤害 + 1！请", target, "注意！");
                    trigger.getParent().baseDamage++;
                }
            }
        },
    },
    icelijian_yibuff: {
        mod:{
            playerEnabled:function (card, player, target) {
                if (checkdiaochans().length === 0) return;
                if (!get.tag(card, "damage")) {
                    if (_status.currentPhase == player) {
                        if (checkdiaochans().includes(target)) return false;
                        if (target == player) return false;
                    } else {
                        if (target != player) return false;
                    }
                }
            },
        },
        trigger: {
            player: ["phaseAfter"],
        },
        superCharlotte: true,
        charlotte: true,
        silent: true,
        priority: 5,
        direct: true,
        init: function (player) {
            if (!player.yibuff_phaseAfter) player.yibuff_phaseAfter = false;
        },
        filter: function (event, player) {
            if (player.yibuff_phaseAfter === true) {
                delete player.yibuff_phaseAfter;
                player.update();
                player.removeSkill("icelijian_yibuff");
                return;
            } else {
                return true;
            }
        },
        async content(event, trigger, player) {
            player.yibuff_phaseAfter = true;
            return;
        },
    }
};
export default TAF_qunSkills;
