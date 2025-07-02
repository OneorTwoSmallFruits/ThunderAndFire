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
    getTrickValue, getAliveNum,
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

const {
    thunderweimu, thunderwenhe_shan, thunderwenhe_notShan
} = asyncs.qun.thunder_jiaxu;//SE贾诩

const { icelongdui } = asyncs.qun.ice_zhugeliang;//躬耕南阳诸葛亮

/** @type { importCharacterConfig['skill'] } */
const TAF_qitaSkills = {
    //诸葛亮
    //布衣
    icebuyi: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            cardDiscardable: function(card, player) {
                if (get.position(card) == "h" || get.position(card) == "e") return false;
            },
            canBeDiscarded: function(card, player) {
                if (get.position(card) == "h" || get.position(card) == "e") return false;
            },
            playerEnabled: function(card, player, target) {
                if (card.name !== "tao") {
                    if (target === player) return true;
                    else return false;
                }
            },
            targetEnabled: function(card, player, target) {
                if (card.name !== "tao") return false;
            },
        },
        trigger: {
            player:["phaseJieshuBegin"],
        },
        locked: true,
        direct:true,
        filter: function(event, player) {
            const cards =  player.getCards("he");
            if(cards && cards.length >= 54) return true;
            return false;
        },
        async content(event, trigger, player) {
            player.chat("再见各位！恭喜发财！");
            await player.die();
        },
        "_priority": 1314,
    },
    //隆对
    icelongdui: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player: "enterGame",
            global: ["phaseBefore","phaseUseBegin","chooseToUseBefore"],
        },
        direct:true,
        filter: function(event, player, name) {
            if(name === "phaseUseBegin") {
                const t = event.player;
                if(t === player) return false;
                return player.inRange(t);
            } else {
                const targets = game.players.filter(o => o !== player && o.isAlive() && !o.hasSkill("icelongdui_give"));
                if(!targets || targets.length === 0) return;
                if(targets && targets.length > 0) {
                    for(let target of targets) {
                        if(!target.hasSkill("icelongdui_give")) {
                            target.addSkill("icelongdui_give");
                        }
                    }
                }
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseUseBegin") {
                const juexing = player.storage.icechushan;
                let setnum = 3;
                if(juexing && juexing === true) setnum = 1;
                const target = trigger.player;
                await target.draw();
                const tcards = target.getCards("he");
                if(!tcards || tcards.length === 0 || target.countGainableCards(player, "he") === 0) return;
                const settext = setColor("〖隆对〗：");
                const num = target.countGainableCards(player, "he");
                let infonum = Math.min(num, setnum);
                let cards = await target.chooseCard(settext + "请选择至多"+ get.cnNumber(infonum) + "张牌，展示并交给" + get.translation(player), 'he', [1, infonum], true, function(card) {
                    return target.countCards("he") > 0 && target.countGainableCards(player, "he") > 0;
                }).set('ai', function(card) {

                    const{ longduiAI } = setAI.qun;
                    const types = longduiAI(target);

                    const att = get.attitude(target, player);
                    const value = get.value(card,target);
                    const selectedCards = ui.selected.cards;
                    if (att >= 2) {
                        if (!types.basic && !types.trick && !types.equip) {
                            if (selectedCards.length <= 0) {
                                if (value < 7) return true
                                else return true;
                            } else {
                                return false;
                            }
                        } else {
                            if(juexing && juexing === true) {
                                if (types.basic) {
                                    return get.type(card) === "basic";
                                } else if (types.trick) {
                                    return get.type(card) === "trick";
                                } else if (types.equip) {
                                    return get.type(card) === "equip";
                                } else {
                                    if (value < 7) return true
                                    else return true;
                                }
                            } else {
                                if (selectedCards.length <= 0) {
                                    if (types.basic) {
                                        return get.type(card) === "basic";
                                    } else if (types.trick) {
                                        return get.type(card) === "trick";
                                    } else if (types.equip) {
                                        return get.type(card) === "equip";
                                    } else {
                                        if (value < 7) return true
                                        else return true;
                                    }
                                } else if (selectedCards.length === 1) {
                                    const selectedtype = get.type(selectedCards[0]);
                                    if (types.basic) {
                                        return get.type(card) === "basic" && selectedtype !== "basic";
                                    } else if (types.trick) {
                                        return get.type(card) === "trick" && selectedtype !== "trick";
                                    } else if (types.equip) {
                                        return get.type(card) === "equip" && selectedtype !== "equip";
                                    } else {
                                        return false;
                                    }
                                } else if (selectedCards.length === 2) {
                                    const selectedtype1 = get.type(selectedCards[0]);
                                    const selectedtype2 = get.type(selectedCards[1]);
                                    if (types.basic) {
                                        return get.type(card) === "basic" && (selectedtype1 !== "basic" && selectedtype2 !== "basic");
                                    } else if (types.trick) {
                                        return get.type(card) === "trick" && (selectedtype1 !== "trick" && selectedtype2 !== "trick");
                                    } else if (types.equip) {
                                        return get.type(card) === "equip" && (selectedtype1 !== "equip" && selectedtype2 !== "equip");
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    } else {
                        if (selectedCards.length <= 0) {
                            const tcards = target.getCards("he").sort((a, b) => get.value(b, target) - get.value(a, target));
                            return tcards[0];
                        } else {
                            return false;
                        }
                    }
                }).forResultCards();
                if (cards && cards.length) {
                    const text = setColor("〖隆对〗");
                    await target.showCards(cards, get.translation(target) + "对" + get.translation(player) + "发动了" + text);
                    await target.give(cards, player);
                    game.log(target, "将" + cards.length + "张牌交给了", player);
                    await icelongdui(player, target, cards);
                }
            }
        },
        subSkill: {
            give: {
                audio: "ext:银竹离火/audio/skill:2",
                name: "隆对",
                enable: "phaseUse",
                usable: 1,
                filter: function(event, player) {
                    const targets = game.players.filter(o => o !== player && o.isAlive() && o.hasSkill("icelongdui"));
                    if(!targets || targets.length === 0) return false;
                    return player.countCards("he") > 0;
                },
                filterTarget: function(card, player, target) {
                    return target !== player && target.hasSkill("icelongdui");
                },
                selectTarget: 1,
                filterCard: function (card) {
                    return true;
                },
                selectCard: [1, 3],
                discard: false,
                lose: false,
                delay: false,
                position: "he",
                check: function(card) {
                    const player = get.owner(card);
                    const selectedCards = ui.selected.cards;
                    const{ longduiAI } = setAI.qun;
                    const types = longduiAI(player);
                    let key = lib.skill.icelongdui_give.selectCard;
                    if (key === 1) {
                        if (types.basic) {
                            return get.type(card) === "basic";
                        } else if (types.trick) {
                            return get.type(card) === "trick";
                        } else if (types.equip) {
                            return get.type(card) === "equip";
                        } else {
                            return false;
                        }
                    } else if (Array.isArray(key) && key.length === 2 && key[0] === 1 && key[1] === 3) {
                        if (selectedCards.length <= 0) {
                            if (types.basic) {
                                return get.type(card) === "basic";
                            } else if (types.trick) {
                                return get.type(card) === "trick";
                            } else if (types.equip) {
                                return get.type(card) === "equip";
                            } else {
                                return false;
                            }
                        } else if (selectedCards.length === 1) {
                            const selectedtype = get.type(selectedCards[0]);
                            if (types.basic) {
                                return get.type(card) === "basic" && selectedtype !== "basic";
                            } else if (types.trick) {
                                return get.type(card) === "trick" && selectedtype !== "trick";
                            } else if (types.equip) {
                                return get.type(card) === "equip" && selectedtype !== "equip";
                            } else {
                                return false;
                            }
                        } else if (selectedCards.length === 2) {
                            const selectedtype1 = get.type(selectedCards[0]);
                            const selectedtype2 = get.type(selectedCards[1]);
                            if (types.basic) {
                                return get.type(card) === "basic" && (selectedtype1 !== "basic" && selectedtype2 !== "basic");
                            } else if (types.trick) {
                                return get.type(card) === "trick" && (selectedtype1 !== "trick" && selectedtype2 !== "trick");
                            } else if (types.equip) {
                                return get.type(card) === "equip" && (selectedtype1 !== "equip" && selectedtype2 !== "equip");
                            } else {
                                return false;
                            }
                        }
                    }
                },
                ai2: function(target) {
                    const player = _status.event.player;
                    const att = get.attitude(player, target);
                    return att > 2;
                },
                async content(event, trigger, player) {
                    const cards = event.cards;
                    const target = event.targets[0];
                    if (cards && cards.length && target) {
                        const text = setColor("〖隆对〗");
                        await player.showCards(cards, get.translation(player) + "对" + get.translation(target) + "发动了" + text);
                        await player.give(cards, target); 
                        game.log(player, "将" + cards.length + "张牌交给了", event.targets[0]);
                        await icelongdui(event.targets[0], player, cards);
                    }
                },
                ai: {
                    order: 13,
                    expose: 0.5,
                    result: {
                        target: function(player,target){
                            const att = get.attitude(player, target);
                            if (att >= 2) {
                                const{ longduiAI } = setAI.qun;
                                const types = longduiAI(player);
                                if (types.basic) {
                                    return true;
                                } else if (types.trick) {
                                    return true;
                                } else if (types.equip) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        },
                    },
                },
                sub: true,
                sourceSkill: "icelongdui",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    //出山
    icechushan: {
        audio: "ext:银竹离火/audio/skill:2",
        marktext: "<font color= #AFEEEE>出山</font>",
        intro: {
            content: "players",
            onunmark: true,
            name: "<font color= #AFEEEE>出山</font>",
        },
        trigger:{
            player:"phaseZhunbeiBegin",
        },
        persevereSkill: true,
        unique: true,
        forced: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: "ice",
        init:async function(player, skill) {
            if(!player.storage.icechushan) player.storage.icechushan = false;
        },
        filter: function(event, player) {
            if(player.storage.icechushan === true) return false;
            const list = player.getStorage('icechushan');
            if(list && list.length >= 3) {
                return true;
            } else {
                const ts = game.players.filter(o => o !== player);
                if(!ts || ts.length === 0) return false;
                if(ts && ts.length < 3) {
                    return list.length === ts.length;
                }
            }
        },
        derivation: ['icejiejian','icewenxing','iceshezhan'],
        async content(event, trigger, player) {
            const list = player.getStorage('icechushan');
            if(list) {
                player.removeStorage('icechushan');
                player.unmarkSkill("icechushan");
            }
            player.storage.icechushan = true;
            player.removeSkill("icebuyi");
            player.loseMaxHp();
            let Grouplists = ["wei","shu","wu"];
            const result = await player.chooseControl(Grouplists).set ("ai", control => {
                const index = Math.floor(Math.random() * Grouplists.length);
                return Grouplists[index];
            }).set('forced', true).forResult();
            if (result.control === "wei") {
                player.changeGroup("wei");
                if(!player.hasSkill("icejiejian")) {
                    player.addSkill("icejiejian");
                }
            } else if (result.control === "shu") {
                player.changeGroup("shu");
                if(!player.hasSkill("icewenxing")) {
                    player.addSkill("icewenxing");
                }
            } else if (result.control === "wu") {
                player.changeGroup("wu");
                if(!player.hasSkill("iceshezhan")) {
                    player.addSkill("iceshezhan");
                }
            }
            lib.skill.icelongdui_give.selectCard = 1;
            player.awakenSkill("icechushan");
        },
        ai: {
            combo: ["icelongdui"],
        },
        "_priority": 0,
    },
    //借箭
    icejiejian: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            cardUsable: function(card,player,num){
                if(player.group !== "wei") return;
                if (!card.cards) return;
                for (let ccc of card.cards) {
                    if (ccc.hasGaintag("icejiejian")) return Infinity;
                }
            },
            targetInRange: function(card,player){
                if(player.group !== "wei") return;
                if (!card.cards) return;
                for (let ccc of card.cards) {
                    if (ccc.hasGaintag("icejiejian")) return true;
                }
            },
        },
        enable: "phaseUse",
        usable: 1,
        unique: true,
        locked: false,
        groupSkill: "wei",
        filter: function(event, player) {
            if(player.group !== "wei") return false;
            const targets = game.players.filter(o => o !== player && o.isAlive());
            if(!targets || targets.length === 0) return false;
            return true;
        },
        filterTarget: function(card, player, target) {
            return target !== player && target.canUse("sha", player, false);
        },
        selectTarget: 1,
        ai2: function(target) {
            const player = _status.event.player;
            let enemys = game.players.filter(o => o !== player && o.isAlive() && get.attitude(player, o) < 2);
            if(!enemys || enemys.length === 0) return false;
            let livenum = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
            const shan_num = player.countCards('h', { name: 'shan' });
            enemys.sort((a, b) => a.hp - b.hp);
            if (shan_num > 1) {
                return enemys[0];
            } else if (shan_num <= 1) {
                if (livenum >= 1) {
                    return enemys[0];
                } else {
                    return false;
                }
            }
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            let TXT = setColor("〖借箭〗：是否对") + get.translation(player) + setColor("视为使用一张无距离限制的〖杀〗？");
            let result = await target.chooseBool(TXT).set('ai', function() {
                return true;
            }).forResult();
            if (result.bool) {
                await target.useCard({ name: "sha" }, player, false).set('forced', true);
                let findevt = false;
                const globalHistory = _status.globalHistory;
                if (globalHistory.length > 0) {
                    const Evts = globalHistory[globalHistory.length - 1];
                    if (Evts.everything && Evts.everything.length > 0) {
                        for (let evt of Evts.everything) {
                            if (evt.name === 'damage') {
                                 const card = evt.card;
                                 const num = evt.num;
                                 if (card && card.name === "sha" && num && num > 0 && evt.source === target) {
                                     if (card.cards && card.cards.length === 0) {
                                        //console.log(evt);
                                        findevt = true;
                                        const firenum = num + 1;
                                        await target.damage(firenum, "fire", 'nocard', player);
                                     }
                                 }
                            }
                        }
                    }
                }
                if (!findevt) {
                    const shacards = await player.specifyCards('sha');
                    if (shacards && shacards.length > 0) {
                        player.addGaintag(shacards, "icejiejian");
                    }
                }
            } else {
                target.turnOver();
            }
        },
        ai: {
            fireAttack: true,
            order: 13,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
            result: {
                target: function(player,target){
                    const enemys = game.players.filter(o => o !== player && o.isAlive() && get.attitude(player, o) < 2);
                    if(!enemys || enemys.length === 0) return 0;
                    let livenum = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
                    const shan_num = player.countCards('h', { name: 'shan' });
                    if (shan_num > 1) {
                        return -10;
                    } else if (shan_num <= 1) {
                        if (livenum >= 1) {
                            return -10;
                        } else {
                            return 0;
                        }
                    }
                },
            },
        },
        "_priority": 0,
    },
    //问星
    icewenxing: {
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #AFEEEE>问星</font>",
        intro:{
            mark: function(dialog, storage, player) {
                const num = player.icewenxing_setnum;
                if (num && num > 0) {
                    const seenum = Math.min(5, Math.max(2, player.hp)) + 1;
                    dialog.addText(setColor("〖问星〗：可观看牌堆顶" + seenum + "张牌。"));
                } else {
                    dialog.addText(setColor("〖问星〗：次数已用完，待重置！"));
                }
            },
            markcount: function(storage, player) {
                const num = player.icewenxing_setnum;
                if (num && num > 0) {
                    return num;
                } else {
                    return 0;
                }
            },
            onunmark: true,
            name:"<font color= #AFEEEE>问星</font>",
        },
        trigger: {
            global: ["phaseZhunbeiBegin","roundStart"],
            player: ["changeHpAfter","damageAfter"],
        },
        groupSkill: "shu",
        unique: true,
        direct: true,
        init: async function(player, skill) {
            if(!player.icewenxing_setnum) player.icewenxing_setnum = 1;
            if(!player.icewenxing_damage) player.icewenxing_damage = 0;
            //用于AI判断，留一次问星为自己！
            if(!player.icewenxing_usedByme) player.icewenxing_usedByme = false;
            player.markSkill("icewenxing");
            player.update();
        },
        filter: function (event, player, name) {
            if(player.group !== "shu") return false;
            if(name === "roundStart") {
                player.icewenxing_usedByme = false;
                const num = player.icewenxing_damage;
                player.icewenxing_setnum = 1 + num;
                player.markSkill("icewenxing");
                player.update();
                return;
            } else if(name === "changeHpAfter") {
                player.markSkill("icewenxing");
                player.update();
                return;
            } else if(name === "damageAfter") {
                const source = event.source;
                if (!source) return false;
                const num = player.icewenxing_damage;
                return event.num > 0 && num < 3 && player.isAlive();
            } else {
                return player.icewenxing_setnum > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "roundStart") return;
            if(Time === "changeHpAfter") return;
            if(Time === "damageAfter") {
                let count = trigger.num || 1;
                while (count > 0) {
                    count --;
                    player.icewenxing_damage ++;
                    player.icewenxing_setnum ++;
                    if(player.icewenxing_damage >= 3) {
                        break;
                    }
                }
                player.markSkill("icewenxing");
                player.update();
            } else if(Time === "phaseZhunbeiBegin") {
                const seenum = Math.min(5, Math.max(2, player.hp)) + 1;
                const Pile = ui.cardPile.childNodes.length;
                if (Pile < seenum) await game.washCard();
                const Pilewashed = ui.cardPile.childNodes.length;
                const disPile = ui.discardPile.childNodes.length;
                if (Pilewashed + disPile < seenum) return;
                let TXT = setColor("〖问星〗：是否要观看牌堆顶") + seenum + setColor("张牌？并可以任意顺序置于〖牌堆顶〗或〖牌堆底〗。");
                const chooseresult = await player.chooseBool(TXT).set('ai', function() {
                    const target = _status.currentPhase;
                    const num = player.icewenxing_setnum;
                    if (num <= 1) {
                        if (!player.icewenxing_usedByme) {
                            if (target === player) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }).forResult();
                if (chooseresult.bool) {
                    player.icewenxing_setnum --;
                    if(_status.currentPhase === player) {
                        /**
                         * 此设定仅为AI判断做的  辅助线！
                         */
                        player.icewenxing_usedByme = true;
                    }
                    player.markSkill("icewenxing");
                    const cardstop = get.cards(seenum);
                    game.cardsGotoOrdering(cardstop);
                    let TXT_one = setColor("〖问星〗：放置于〖牌堆顶〗！");
                    let TXT_middle = setColor("〖问星〗：请选择移动至〖牌堆顶↑〗或〖牌堆底↓〗。");
                    let TXT_two = setColor("〖问星〗：放置于〖牌堆底〗！");
                    const result = await player.chooseToMove("〖问星〗",true)
                    .set("list", [[TXT_one, []],[TXT_middle, cardstop],[TXT_two, []]])
                    .set("filterMove", (from, to, moved) => {
                        return true;
                    }).set('filterOk', (moved) => {
                        return moved[1].length === 0;
                    }).set("processAI", (list) => {
                        const cards = list[1][1];
                        let 排序后 = [[],[],[]];
                        const target = _status.currentPhase;//当前回合角色
                        const taoValue = compareValue(target, 'tao');
                        const shanValue = compareValue(target, 'shan');
                        const jiuValue = compareValue(target, 'jiu');
    
                        const judges = target.getCards("j");
                        const att = get.attitude(player, target);
                        if (att >= 2) {//若为友方
                            if (judges.length > 0) {//若队友判定区有牌
                                const cheats = setjudgesResult(judges, cards, player);
                                if (cheats && cheats.length > 0) {//如果有帮助对友改判的牌，则优先帮助
                                    const remainingCards = cards.filter(card => !cheats.includes(card));
                                    if (remainingCards.length === 0) {
                                        排序后 = [[...cheats],[],[]];
                                    } else {
                                        const 排序剩余卡片 = remainingCards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                        let secondtop = [], low = [];
                                        for (let card of 排序剩余卡片) {
                                            const value = get.value(card, target);
                                            if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                                if (secondtop.length < 2) {
                                                    secondtop.push(card);
                                                } else {
                                                    low.push(card);
                                                }
                                            } else {
                                                low.push(card);
                                            }
                                        }
                                        排序后 = [cheats.concat(secondtop), [], [...low]];
                                    }
                                } else {//若没有帮助对友改判的牌
                                    const 排序cards = cards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                    let top = [], low = [];
                                    const wuxieCards = player.getCards('hs').filter(card => get.name(card,player) === 'wuxie');
                                    if (wuxieCards && wuxieCards.length > 0) {//若玩家有无懈可击
                                        for (let card of 排序cards) {
                                            const value = get.value(card, target);
                                            if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                                if (top.length < 2) {
                                                    top.push(card);
                                                } else {
                                                    low.push(card);
                                                }
                                            } else {
                                                low.push(card);
                                            }
                                        }
                                        if (top.length === 0) {
                                            if (low.length > 0) {
                                                top.push(low[0]);
                                                low = low.slice(1);
                                            }
                                        }
                                        排序后 = [[...top], [], [...low]];
                                    } else {//若玩家没有无懈可击
                                        const livenum = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
                                        if (livenum >= 2) {
                                            排序后 = [[], [], cards];
                                        } else {
                                            const lowestValueCard = [排序cards[排序cards.length - 1]];
                                            const remainingCards = 排序cards.filter(card => !lowestValueCard.includes(card));
                                            if (remainingCards.length === 0) {
                                                排序后 = [[...lowestValueCard], [], []];
                                            } else {
                                                const 排序剩余卡片 = remainingCards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                                let secondtop = [], low = [];
                                                for (let card of 排序剩余卡片) {
                                                    const value = get.value(card, target);
                                                    if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                                        if (secondtop.length < 2) {
                                                            secondtop.push(card);
                                                        } else {
                                                            low.push(card);
                                                        }
                                                    } else {
                                                        low.push(card);
                                                    }
                                                }
                                                排序后 = [lowestValueCard.concat(secondtop), [], [...low]];
                                            }
                                        }
                                    }
                                }
                            } else {//若队友判定区无牌
                                const 排序cards = cards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                let top = [], low = [];
                                for (let card of 排序cards) {
                                    const value = get.value(card, target);
                                    if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                        if (top.length < 2) {
                                            top.push(card);
                                        } else {
                                            low.push(card);
                                        }
                                    } else {
                                        low.push(card);
                                    }
                                }
                                if (top.length === 0) {
                                    if (low.length > 0) {
                                        top.push(low[0]);
                                        low = low.slice(1);
                                    }
                                }
                                排序后 = [[...top], [], [...low]];
                            }
                        } else {//若为敌方
                            if (judges.length > 0) {//若敌方判定区有牌
                                const cheats = setjudgesResult(cards, judges, player, true);
                                if (cheats && cheats.length > 0) {//若存在可以帮助对敌改判的牌
                                    const remainingCards = cards.filter(card => !cheats.includes(card));
                                    if (remainingCards.length === 0) {
                                        排序后 = [[],[],[...cheats]];
                                    } else {
                                        const 排序剩余卡片 = remainingCards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                        let top = [], secondlow = [];
                                        for (let card of 排序剩余卡片) {
                                            const value = get.value(card, target);
                                            if (value < taoValue - 0.5 || value < shanValue - 0.5 || value < jiuValue - 0.5) {
                                                if (top.length < 2) {
                                                    top.push(card);
                                                } else {
                                                    secondlow.push(card);
                                                }
                                            } else {
                                                secondlow.push(card);
                                            }
                                        }
                                        if (top.length === 0) {
                                            if (secondlow.length > 0) {
                                                top.push(secondlow[0]);
                                                secondlow = secondlow.slice(1);
                                            }
                                        }
                                        排序后 = [[...top], [], cheats.concat(secondlow)];
                                    }
                                } else {//若没有帮助对敌改判的牌
                                    const 排序cards = cards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                    let top = [], low = [];
                                    for (let card of 排序cards) {
                                        const value = get.value(card, target);
                                        if (value < taoValue - 0.5 || value < shanValue - 0.5 || value < jiuValue - 0.5) {
                                            if (top.length < 2) {
                                                top.push(card);
                                            } else {
                                                low.push(card);
                                            }
                                        } else {
                                            low.push(card);
                                        }
                                    }
                                    if (top.length === 0) {
                                        if (low.length > 0) {
                                            top.push(low[0]);
                                            low = low.slice(1);
                                        }
                                    }
                                    排序后 = [[...top], [], [...low]];
                                }
                            } else {
                                const 排序cards = cards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                let top = [], low = [];
                                for (let card of 排序cards) {
                                    const value = get.value(card, target);
                                    if (value < taoValue - 0.5 || value < shanValue - 0.5 || value < jiuValue - 0.5) {
                                        if (top.length < 2) {
                                            top.push(card);
                                        } else {
                                            low.push(card);
                                        }
                                    } else {
                                        low.push(card);
                                    }
                                }
                                if (top.length === 0) {
                                    if (low.length > 0) {
                                        top.push(low[0]);
                                        low = low.slice(1);
                                    }
                                }
                                排序后 = [[...top], [], [...low]];
                            }
                        }
                        return 排序后;
                    }).set('forced', true).forResult();
                    if (result.bool) {
                        let topcards = result.moved[0];
                        let bottomcards = result.moved[2];
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
                        if (bottomcards.length > 0) {
                            for (let card of bottomcards) {
                                ui.cardPile.appendChild(card);
                            }
                            player.popup(get.cnNumber(bottomcards.length) + '下');
                            game.log(player, '将' + get.cnNumber(bottomcards.length) + '张牌置于牌堆底！');
                            player.update();
                            game.updateRoundNumber();
                        }
                        if (topcards.length === 0) {
                            await player.loseHp();
                        }
                    }
                }
            }
        },
        "_priority": 0,
    },
    //舌战
    iceshezhan: {
        audio: "ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        prompt: "请选择拼点的角色！",
        groupSkill: "wu",
        init:async function(player, skill) {
            if(!player.iceshezhan_Compare) player.iceshezhan_Compare = 0;
            if(!player.hasSkill("iceshezhan_clear")) {
                player.addSkill("iceshezhan_clear");               
            }
            player.update();
        },
        filter: function(event, player) {
            if(player.group !== "wu") return false;
            if(player.hasSkill("iceshezhan_off")) return false;
            const targets = game.players.filter(o => o !== player && o.isAlive());
            if(!targets || targets.length === 0) return false;
            for(let target of targets) {
                if(!target.hasSkill("iceshezhan_used") && player.canCompare(target)) {
                    return true;
                }
            }
        },
        filterTarget: function(card, player, target) {
            return target !== player && player.canCompare(target) && !target.hasSkill("iceshezhan_used");
        },
        selectTarget: 1,
        ai2: function(target) {
            const player = _status.event.player;
            const att = get.attitude(player, target);
            const phs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
            const ths = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
            return att < 2 && (get.number(phs[0]) > get.number(ths[0]));
        },
        async content(event, trigger, player) {
            if(!player.iceshezhan_Compare) player.iceshezhan_Compare = 0;
            const target = event.targets[0];
            if(!target.hasSkill("iceshezhan_used")) target.addTempSkill("iceshezhan_used");
            let { result } = await player.chooseToCompare(target);
            if(result.bool) {
                player.iceshezhan_Compare ++;
                await player.draw();
                if(!target.hasSkill("iceshezhan_damage")) {
                    target.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    target.markSkill("iceshezhan_damage");
                }
            } else if (result.tie) {
                const winnum = player.iceshezhan_Compare;
                let numdraw = Math.max(1,Math.min(3,winnum));
                if(numdraw > 0) await player.draw(numdraw);
                if(!player.hasSkill("iceshezhan_off")) player.addTempSkill("iceshezhan_off");

                if(!player.hasSkill("iceshezhan_damage")) {
                    player.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    player.markSkill("iceshezhan_damage");
                }
                if(!target.hasSkill("iceshezhan_damage")) {
                    target.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    target.markSkill("iceshezhan_damage");
                }
            } else {
                const winnum = player.iceshezhan_Compare;
                let numdraw = Math.max(1,Math.min(3,winnum));
                if(numdraw > 0) await player.draw(numdraw);
                if(!player.hasSkill("iceshezhan_off")) player.addTempSkill("iceshezhan_off");

                if(!player.hasSkill("iceshezhan_damage")) {
                    player.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    player.markSkill("iceshezhan_damage");
                }
            }
        },
        ai: {
            order: 13,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
            result: {
                target: function(player,target){
                    const enemys = game.players.filter(o => o !== player && o.isAlive() && get.attitude(player, o) < 2 && !o.hasSkill("iceshezhan_used") && player.canCompare(o));
                    if(!enemys || enemys.length === 0) return 0;
                    for(let enemy of enemys) {
                        const phs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                        const ths = enemy.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                        if(get.number(phs[0]) > get.number(ths[0])) {
                            return -10;
                        }
                    }
                    return 0;
                },
            },
        },
        subSkill: {
            off: {
                charlotte:true,
                unique:true,
                sub: true,
                sourceSkill: "iceshezhan",
                "_priority": Infinity,
            },
            used: {
                charlotte:true,
                unique:true,
                sub: true,
                sourceSkill: "iceshezhan",
                "_priority": Infinity,
            },
            damage: {
                mark:true,
                marktext:"<font color= #AFEEEE>增伤</font>",
                intro:{
                    mark: function(dialog, storage, player) {
                        dialog.addText(setColor("〖舌战·增伤〗：受到的伤害 + 1！"));
                    },
                    markcount: function(storage, player) {
                        const num = player.iceshezhan_damage;
                        if (num && num > 0) {
                            return num;
                        } else {
                            return 0;
                        }
                    },
                    onunmark: true,
                    name:"<font color= #AFEEEE>舌战·增伤</font>",
                },
                trigger: {
                    player: "damageBegin",
                },
                charlotte:true,
                unique:true,
                direct:true,
                init:async function(player, skill) {
                    if(!player.iceshezhan_damage) player.iceshezhan_damage = 3;
                },
                filter: function (event, player) {
                    const source = event.source;
                    if (!source) return false;
                    return event.num > 0 && player.iceshezhan_damage > 0;
                },
                async content(event, trigger, player) {
                    trigger.num++;
                    player.iceshezhan_damage--;
                    player.markSkill("iceshezhan_damage");
                    const num = player.iceshezhan_damage;
                    if (num && num <= 0) {
                        player.unmarkSkill("iceshezhan_damage");
                        player.removeSkill("iceshezhan_damage");
                        player.update();
                    }
                },
                sub: true,
                sourceSkill: "iceshezhan",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    iceshezhan_clear: {
        trigger: {
            global: "phaseAfter",
            player: "compare",
            target: "compare",
        },
        charlotte:true,
        unique:true,
        direct:true,
        silent: true,
        popup: false,
        filter: function(event, player,name) {
            if(player.group !== "wu") return false;
            if(!player.hasSkill("iceshezhan")) return false;
            if(name === "phaseAfter") {
                if(!player.iceshezhan_Compare) player.iceshezhan_Compare = 0;
                player.iceshezhan_Compare = 0;
                return;
            } else {
                if (event.player == player) {
                    return !event.iwhile && get.number(event.card1) == 7;
                } else {
                    return get.number(event.card2) == 7;
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseAfter") return;
            game.log(player, "拼点牌点数视为", "#yK");
            if (player == trigger.player) {
                trigger.num1 = 13;
            } else {
                trigger.num2 = 13;
            }
        },
        "_priority": Infinity,
    },
    //隆对基本
    icelongdui_basic: {
        mark:true,
        marktext:"<font color= #AFEEEE>基本</font>",
        intro:{
            content: function (storage, player) {
                return setColor("使用基本牌的基础数值 + 1！");;
            },
            onunmark: true,
            name:"<font color= #AFEEEE>隆对·基本</font>",
        },
        trigger:{
            player:["useCard","phaseBegin"],
        },
        persevereSkill:true,
        charlotte:true,
        unique:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === "useCard") {
                return get.type(event.card) == "basic";
            } else if (name === "phaseBegin") {
                player.unmarkSkill("icelongdui_basic");
                player.removeSkill("icelongdui_basic");
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseBegin") return;
            trigger.baseDamage++;
            game.log(player, "使用的", trigger.card, "基础数值+1");
        },
        "_priority":520,
    },
    //隆对锦囊
    icelongdui_trick: {
        mark:true,
        marktext:"<font color= #AFEEEE>锦囊</font>",
        intro:{
            content: function (storage, player) {
                return setColor("使用普通锦囊牌时可为之增加/减少一个目标！");;
            },
            onunmark: true,
            name:"<font color= #AFEEEE>隆对·锦囊</font>",
        },
        trigger:{
            player:["useCard","phaseBegin"],
        },
        persevereSkill:true,
        charlotte:true,
        unique:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === "useCard") {
                const cardinfo = get.info(event.card, false);
                if (cardinfo.allowMultiple === false) return false;
                if (cardinfo.multitarget === false) return false;
                if (cardinfo.type === "trick") {
                    const targets = event.targets;
                    if (!targets || targets.length === 0) return false;
                    const hastargets = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(event.card, player, o));
                    if (hastargets && hastargets.length > 0) {
                        return true;
                    }
                    if (targets && targets.length > 1) {
                        return true;
                    }
                    return false;
                }
                return false;
            } else if (name === "phaseBegin") {
                player.unmarkSkill("icelongdui_trick");
                player.removeSkill("icelongdui_trick");
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseBegin") return;
            const targets = trigger.targets;
            let text1 = "为" + get.translation(trigger.card) + "增加一个目标";
            let text2 = "为" + get.translation(trigger.card) + "减少一个目标";
            let lists = [];
            let Control1 = false, Control2 = false;
            const hastargets = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, player, o));
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
                const effect = get.effect(player, trigger.card, player, player);
                if (effect > 0) {//如果此牌站在玩家自身角度为正收益
                    if (Control1) {
                        const hasFriends = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, player, o) && get.attitude(player, o) >= 2);
                        if (hasFriends && hasFriends.length > 0) return text1;
                    }
                    if (Control2) {
                        const hasEmptys = game.players.filter(o => o.isAlive() && targets.includes(o) && get.attitude(player, o) < 2);
                        if (hasEmptys && hasEmptys.length > 0) return text2;
                    }
                    return 'cancel2';
                } else if (effect < 0) {//如果此牌站在玩家自身角度为负收益
                    if (Control1) {
                        const hasEmptys = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, player, o) && get.attitude(player, o) < 2);
                        if (hasEmptys && hasEmptys.length > 0) {
                            for (let Empty of hasEmptys) {
                                if (get.effect(Empty, trigger.card, player, player) < 0) {
                                    return text1;//如果此牌站在玩家角度，对某个敌方释放时也是负收益，则增加目标
                                }
                            }
                        }
                    }
                    if (Control2) {//如果此牌站在玩家自身角度为负收益
                        const hasFriends = game.players.filter(o => o.isAlive() && targets.includes(o) && get.attitude(player, o) >= 2);
                        if (hasFriends && hasFriends.length > 0) {
                            for (let Friend of hasFriends) {
                                if (get.effect(Friend, trigger.card, player, player) < 0) {
                                    return text2;//如果此牌目标中有友方，且站在玩家角度看友方对此牌的收益也为负收益，则减少目标
                                }
                            }
                        }
                    }
                    return 'cancel2';
                }
                return 'cancel2';
            }).forResult();
            if (result.control === 'cancel2') return;
            let TXT = "";
            if (result.control === text1) {
                TXT = text1;
            } else if (result.control === text2) {
                TXT = text2;
            }
            const chooseresult = await player.chooseTarget(TXT, function (card, player, target) {
                if (result.control === text1) {
                    return !targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target);
                } else if (result.control === text2) {
                    return targets.includes(target);
                }
            }).set("ai", function (target) {
                const player = _status.event.player;
                const card = _status.event.getTrigger().card;
                if (result.control === text1) {
                    return get.effect(target, card, player, player);
                } else if (result.control === text2) {
                     return -get.effect(target, card, player, player);
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
        "_priority":521,
    },
    //隆对装备
    icelongdui_equip: {
        mark:true,
        marktext:"<font color= #AFEEEE>上限</font>",
        intro:{
            content: function (storage, player) {
                const ecardsnum = player.getCards("e").length;
                return "手牌上限 + " + ecardsnum + "！";
            },
            onunmark: true,
            name:"<font color= #AFEEEE>隆对·上限</font>",
        },
        mod: {
            maxHandcard: function (player, num) {
                const ecardsnum = player.getCards("e").length;
                return num + ecardsnum;
            },
        },
        trigger:{
            player:["phaseBegin"],
        },
        persevereSkill:true,
        charlotte:true,
        unique:true,
        direct:true,
        filter:function (event, player) {
            player.unmarkSkill("icelongdui_equip");
            player.removeSkill("icelongdui_equip");
            player.update();
        },
        "_priority":522,
    },
    //SE贾诩
    thunderweimu: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= EE9A00>帷幕</font>",
        intro: {
            content: function (storage, player) {
                let text_one = "<font color= #EE9A00>帷幕·展示:</font>";
                let text_two = "<font color= #EE9A00>帷幕·视为:</font>";
                const showdname = player.thunderweimu_showdname;
                const usedname = player.thunderweimu_usedname;
                if (showdname && showdname.length > 0) {
                    let namelist = [];
                    for (let name of showdname) {
                        const fanyi = get.translation(name);
                        if (fanyi) {
                            namelist.push(fanyi);
                        }
                    }
                    text_one += namelist.join("、") + "。";
                } else {
                    text_one += "无。";
                }
                if (usedname && usedname.length > 0) {
                    let namelist = [];
                    for (let name of usedname) {
                        const fanyi = get.translation(name);
                        if (fanyi) {
                            namelist.push(fanyi);
                        }
                    }
                    text_two += namelist.join("、") + "。";
                } else {
                    text_two += "无。";
                }
                return text_one + "<br/>" + text_two;
            },
            onunmark: true,
            name: "<font color= EE9A00>帷幕</font>",
        },
        mod:{
            targetEnabled:function (card, player, target) {
                const usedname = target.thunderweimu_usedname;
                if (usedname && usedname.length > 0) {
                    if (player !== target) {
                        if (card && card.name && usedname.includes(card.name)) {
                            return false;
                        }
                    }
                }
            },
            cardEnabled:function (card, player, target) {
                const showdname = player.thunderweimu_showdname;
                if (showdname && showdname.length > 0) {
                    if (card && card.name && showdname.includes(card.name)) {
                        return false;
                    }
                }
            },
        },
        trigger: {
            global: ["phaseUseBegin","roundStart"],
        },
        locked: false,
        direct:true,
        init:async function(player, skill) {
            if (!player.thunderweimu_usedname) player.thunderweimu_usedname = [];
            if (!player.thunderweimu_showdname) player.thunderweimu_showdname = [];
            if (!player.thunderweimu_used) player.thunderweimu_used = false;//是否发动过帷幕
        },
        filter:function(event, player, name){
            if(name=="roundStart"){
                if (!player.thunderweimu_usedname) player.thunderweimu_usedname = [];
                if (!player.thunderweimu_showdname) player.thunderweimu_showdname = [];
                player.thunderweimu_usedname = [];
                player.thunderweimu_showdname = [];
                return;
            } else if( name=="phaseUseBegin"){
                return true;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time=="phaseUseBegin"){
                await thunderweimu(player,trigger.player);
            }
        },
        "_priority": Infinity,
    },
    /*待修改
    thunderweimu: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= EE9A00>帷幕</font>",
        intro: {
            content: function (storage, player) {
                let text_one = "<font color= #EE9A00>帷幕·展示:</font>";
                let text_two = "<font color= #EE9A00>帷幕·视为:</font>";
                const showdname = player.thunderweimu_showdname;
                const usedname = player.thunderweimu_usedname;
                if (showdname && showdname.length > 0) {
                    let namelist = [];
                    for (let name of showdname) {
                        const fanyi = get.translation(name);
                        if (fanyi) {
                            namelist.push(fanyi);
                        }
                    }
                    text_one += namelist.join("、") + "。";
                } else {
                    text_one += "无。";
                }
                if (usedname && usedname.length > 0) {
                    let namelist = [];
                    for (let name of usedname) {
                        const fanyi = get.translation(name);
                        if (fanyi) {
                            namelist.push(fanyi);
                        }
                    }
                    text_two += namelist.join("、") + "。";
                } else {
                    text_two += "无。";
                }
                return text_one + "<br/>" + text_two;
            },
            onunmark: true,
            name: "<font color= EE9A00>帷幕</font>",
        },
        mod:{
            targetEnabled:function (card, player, target) {
                const usedname = target.thunderweimu_usedname;
                if (usedname && usedname.length > 0) {
                    if (player !== target) {
                        if (card && card.name && usedname.includes(card.name)) {
                            return false;
                        }
                    }
                }
            },
            cardEnabled:function (card, player, target) {
                const showdname = player.thunderweimu_showdname;
                if (showdname && showdname.length > 0) {
                    if (card && card.name && showdname.includes(card.name)) {
                        return false;
                    }
                }
            },
        },
        trigger: {
            global: ["phaseBegin","roundStart"],
        },
        locked: false,
        direct:true,
        init:async function(player, skill) {
            if (!player.thunderweimu_usedname) player.thunderweimu_usedname = [];
            if (!player.thunderweimu_showdname) player.thunderweimu_showdname = [];
            if (!player.thunderweimu_used) player.thunderweimu_used = false;//是否发动过帷幕
        },
        filter:function(event, player, name){
            if(name=="roundStart"){
                if (!player.thunderweimu_usedname) player.thunderweimu_usedname = [];
                if (!player.thunderweimu_showdname) player.thunderweimu_showdname = [];
                player.thunderweimu_usedname = [];
                player.thunderweimu_showdname = [];
                return;
            } else if( name=="phaseBegin"){
                const showdnamelist = player.thunderweimu_showdname;
                const usednamenamelist = player.thunderweimu_usedname;
                const cards = player.getCards("hes").filter(card => !showdnamelist.includes(get.name(card,player)));
                if(!cards || cards.length == 0) return false;

                const cardnames = lib.inpile.filter(name => !usednamenamelist.includes(name));
                if(!cardnames || cardnames.length == 0) return false;
                const target = event.player;
                for(const name of cardnames) {
                    const type = get.type(name);
                    const Vcard = { name: name, nature: '', isCard: true };
                    if(type === 'trick') {
                        const hastargetslist = game.players.filter(o => o.isAlive());
                        for(const t of hastargetslist) {
                            if(target.hasUseTarget(Vcard) && player.hasUseTarget(Vcard)) return true;
                        }
                    }
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time !== "phaseBegin") return;
            const target = trigger.player;
            const text = setColor("〖帷幕〗");
            let text1 = setColor("〖帷幕〗：是否展示一张本轮与〖谋身·帷幕〗展示过的不同名牌，并声明一张本轮未声明的普通锦囊牌名并摸一张牌，令");
            let text2 = setColor("选择一项：1.失去一点体力视为使用你声明的牌；2.你将你展示的牌当做声明的牌使用？");
            let TXT1 = text1 + get.translation(target) + text2;
            let cards = await player.chooseCard('he',TXT1,function(card) {
                const showdnamelist = player.thunderweimu_showdname || [];
                return !showdnamelist.includes(get.name(card,player));
            }).set("ai", function (card) {

            }).set('forced', player.thundermoushen_canshow).forResultCards();//如果是回合结束后执行，则改为强制执行！因为【谋身的设定】
            if (cards && cards.length) {
                player.thunderweimu_used = true;
                const showcard = cards[0];
                const name1111 = get.translation(get.name(showcard, player));
                await player.showCards([showcard], get.translation(player) + "发动了" + text);
                if (!player.thunderweimu_showdname.includes(showcard.name)) player.thunderweimu_showdname.push(showcard.name);
                const usednamenamelist = player.thunderweimu_usedname;
                const cardnames = lib.inpile.filter(name => !usednamenamelist.includes(name));
                let list = [];
                for(const name of cardnames) {
                    const type = get.type(name);
                    const Vcard = { name: name, nature: '', isCard: true };
                    if(type === 'trick') {
                        if (target.hasUseTarget(Vcard) && player.hasUseTarget(Vcard)) {
                            list.push([type, '', name]);
                        }
                    }
                }
                if(!list.length) return;
                const chooseButton = await player.chooseButton([
                    "〖帷幕〗：请选择声明一个普通锦囊牌名：",
                    [list, "vcard"]
                ]).set("ai", function (button) {
                    const card = { name: button.link[2], nature: button.link[3], isCard: true, };
                }).set('forced', true).forResult();
                if (chooseButton.bool) {
                    const cardName = chooseButton.links[0][2];
                    if (!player.thunderweimu_usedname.includes(cardName)) player.thunderweimu_usedname.push(cardName);
                    let cardtext = get.translation(cardName);
                    player.popup(cardtext);//声明的牌名
                    game.log(player,"声明了" + cardtext + "令" ,target, "执行" + text + "！");
                    await player.draw();
                    const lists = [
                        '失去一点体力视为使用' + cardtext,
                        get.translation(player) + "将" + name1111 + "当做" + cardtext + "使用",
                    ];
                    const result = await target.chooseControl(lists).set ("ai", control => {
                        if (target === player) return lists[1];
                        const att = get.attitude(player, target);
                        let livenum = target.hp + target.countCards('h', { name: ['tao', 'jiu'] }) - 1;
                        if (att < 2) {
                            if (livenum >= 1) return lists[0];
                            return lists[1];
                        }
                        return lists[1];
                    }).set('forced', true).forResult();
                    const Vcard = { name: cardName, nature: chooseButton.links[0][3], isCard: true };
                    if (result.control === lists[0]) {
                        await target.loseHp();
                        await target.chooseUseTarget(Vcard, true, false);
                    } else if (result.control === lists[1]) {
                        /////viewAsToUse(player,showcard, Vcard,'true');
                    }
                }
            }
        },
        "_priority": Infinity,
    },
    */
    thunderwenhe: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            global: [
                "chooseToRespondBegin","chooseToUseBegin","useCardBefore",
                "phaseAfter"
            ],
        },
        direct:true,
        init:async function(player, skill) {
            if (!player.thunderwenhe_loseHp) player.thunderwenhe_loseHp = false;
            if (!player.thunderwenhe_chooseToUse) player.thunderwenhe_chooseToUse = false;
            if (!player.thunderwenhe_shan) player.thunderwenhe_shan = 0;
            if (!player.thunderwenhe_notShan) player.thunderwenhe_notShan = 0;
        },
        filter:function(event, player, name){
            if(name=="useCardBefore"){
                if(event.player === player) return false;
                if(_status.currentPhase !== player) return false;
                const card = event.card;
                const targets = event.targets;
                if (!card || !targets) return false;
                const cardinfo = get.info(card,false);
                if (!cardinfo) return false;
                if (cardinfo.type !== "basic") return false;
                if (targets.includes(event.player)) return false;
                return player.thunderwenhe_notShan < 1;
            } else if(name=="chooseToRespondBegin" || name=="chooseToUseBegin"){
                if (event.responded) return false;
                if (!event.filterCard || !event.filterCard({ name: "shan" }, event.player, event)) return false;
                if (event.name == "chooseToRespond" && !lib.filter.cardRespondable({ name: "shan" }, event.player, event)) return false;
                return player.thunderwenhe_shan < 1;
            } else if(name=="phaseAfter"){
                player.thunderwenhe_shan = 0;
                player.thunderwenhe_notShan = 0;
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time=="useCardBefore"){
                await thunderwenhe_notShan(trigger, player);
                player.thunderwenhe_loseHp = false;
                player.thunderwenhe_chooseToUse = false;
            } else if(Time=="chooseToRespondBegin" || Time=="chooseToUseBegin"){
                await thunderwenhe_shan(trigger, player);
                player.thunderwenhe_loseHp = false;
                player.thunderwenhe_chooseToUse = false;
            }
        },
        "_priority": 5210,
    },
    thundermoushen: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player: ["useCard","gainAfter","changeHpAfter"],
            global: ["phaseEnd","phaseAfter"],
        },
        locked: true,
        direct: true,
        init:async function(player, skill) {
            if (!player.thundermoushen_basic) player.thundermoushen_basic = false;
            if (!player.thundermoushen_gaincards) player.thundermoushen_gaincards = false;
            if (!player.thundermoushen_changeHp) player.thundermoushen_changeHp = false;
            if (!player.thunderweimu_showdname) player.thunderweimu_showdname = [];
            if (!player.moushen) player.moushen = {
                canUseweimu : function() {
                    if (player.hasSkill("thunderweimu")) {
                        if (player.thunderweimu_used) return false;
                        return true;
                    }
                    return false;
                },
                canUsebasic : function() {
                    if (player.thundermoushen_basic) return false;
                    const basiccards = player.getCards("hs").filter(c => get.type(c,player) === "basic" && get.name(c,player) !== "shan");
                    if (basiccards && basiccards.length > 0) {
                        let canuse = [];
                        for (let card of basiccards) {
                            const targets = game.players.filter(o => o.isAlive());
                            for (let target of targets) {
                                if (lib.filter.targetEnabled2(card, player, target) && lib.filter.cardRespondable(card, player, target) && lib.filter.targetInRange(card, player, target)) {
                                    canuse.push(card);
                                }
                            }
                        }
                        if (canuse.length > 0) {
                            const taocards = canuse.filter(c => get.name(c, player) === "tao");
                            if (taocards && taocards.length === canuse.length) {
                                if(!player.hasSkillTag("respondTao")) return false;
                                if(player.isHealthy()) return false;
                                return true;
                            } else {
                                return true;
                            }
                        }
                        return false;
                    }
                    return false;
                },
                canChangeHp : function() {
                    if (player.thundermoushen_changeHp) return false;
                    return true;
                },
                canGaincards : function() {
                    if (player.thundermoushen_gaincards) return false;
                    return true;
                },
                mergefunc: function () {
                    const keys = Object.keys(player.moushen.skill).filter(key => player.moushen.skill[key].merge_ed === false);
                    if (!keys || keys.length === 0) return [];
                    let 合并项 = null;
                    let 合并项Index = -1;
                    for (let i = 0; i < keys.length; i++) {
                        if (player.moushen.skill[keys[i]].merge === true) {
                            合并项 = keys[i];
                            合并项Index = i;
                            break;
                        }
                    }
                    let 相邻项 = [], 合并项后边所有项 = [];
                    if (合并项) {
                        if (合并项Index > 0) 相邻项.push(keys[合并项Index - 1]);
                        if (合并项Index < keys.length - 1) 相邻项.push(keys[合并项Index + 1]);
                        for (let j = 合并项Index + 1; j < keys.length; j++) {
                            合并项后边所有项.push(keys[j]);
                        }
                    }
                    return [合并项, 相邻项, 合并项后边所有项];
                },
                upDateMergefunc: async function () {
                    const lists = player.moushen.mergefunc();
                    console.log("Lists:", lists);
                    if (lists && lists.length > 0) {
                        const 合并项 = lists[0];//字符串
                        const 相邻项 = lists[1];//数组
                        const 合并项后边所有项 = lists[2];//数组
                        console.log("合并项:", 合并项, "相邻项:", 相邻项, "合并项后边所有项:", 合并项后边所有项);
                        if (!合并项 || !相邻项 || 相邻项.length === 0) return;
                        if (相邻项.length > 1) {
                            const result = await player.chooseControl(相邻项).set ("ai", control => {
                                return 相邻项[0];
                            }).set('forced', true).forResult();
                            if (result.control === 相邻项[0]) {//前一个相邻项
                                const number = player.moushen.skill[相邻项[0]].number;//从后往前合并原则
                                player.moushen.skill[合并项].number = number;
                                player.moushen.skill[合并项].merge = false;
                                player.moushen.skill[合并项].merge_ed = true;//从后往前合并原则，已经合并
                                player.moushen.skill[相邻项[0]].merge = true;//此项变成合并项
                            }
                            /**
                             * 从后往前合并原则，如果选了合并项的后边，往前合并，合并项还是合并项！！！
                             * 所有序号数，执行的次数都要进行更新。
                             * 后邻项这一项改为已经合并。用于筛选！
                             */
                            player.moushen.skill[相邻项[1]].merge_ed = true;
                            for (let key of 合并项后边所有项) {
                                player.moushen.skill[key].number --;
                            }
                        } else {
                            //从大数到小数合并原则
                            let number1 = player.moushen.skill[合并项].number;
                            let number2 = player.moushen.skill[相邻项[0]].number;
                            if (number1 >= number2) {//合并项要往前合并
                                player.moushen.skill[合并项].number = number2;
                                player.moushen.skill[合并项].merge = false;
                                player.moushen.skill[合并项].merge_ed = true;//从大数到小数合并原则，已经合并
                                player.moushen.skill[相邻项[0]].merge = true;//此项变成合并项
                            } else {//相邻项要往前合并
                                player.moushen.skill[相邻项[0]].number = number1;
                                player.moushen.skill[相邻项[0]].merge = false;
                                player.moushen.skill[相邻项[0]].merge_ed = true;//从大数到小数合并原则，已经合并
                                player.moushen.skill[合并项].merge = true;//原合并项还是合并项
                            }
                        }
                    }
                    player.update();
                },
                skill :{
                    one: {
                        name: "项一",
                        number: 1,
                        merge: false,
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canUseweimu} = player.moushen;
                            const {number} = player.moushen.skill.one;
                            console.log("canUseweimu:", canUseweimu());
                            if (canUseweimu()) {
                                let num = number;
                                if (num > 0) {
                                    while (num > 0) {
                                        num--;
                                        await thunderweimu(player,player);
                                    }
                                }
                            }
                        }
                    },
                    two: {
                        name: "项二",
                        number: 2,
                        merge: false,
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canUsebasic} = player.moushen;
                            const {number} = player.moushen.skill.two;
                            console.log("canUsebasic:", canUsebasic());
                            if (canUsebasic()) {
                                let num = number;
                                if (num > 0) {
                                    while (num > 0) {
                                        num--;
                                        if (!canUsebasic()) break;
                                        player.chooseToUse({
                                            prompt: "打出一张基本牌！",
                                            filterCard: function (card, player) {
                                                const cardinfo = get.info(card,false);
                                                if (!cardinfo) return false;
                                                if (cardinfo.type !== "basic") return false;
                                                if (card.name === "shan") return false;
                                                return true;
                                            },
                                            filterTarget: function(card, player, target) {
                                                return lib.filter.targetEnabledx(card, player, target) && lib.filter.targetInRange(card, player, target);
                                            },
                                            position : "hs",
                                            selectCard: 1,
                                        }).set('forced', true);
                                    }
                                }
                            }
                        }
                    },
                    three: {
                        name: "项三",
                        number: 3,
                        merge: true,//初始化，此项设定为合并项
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canChangeHp} = player.moushen;
                            const {number} = player.moushen.skill.three;
                            console.log("canChangeHp:", canChangeHp());
                            if (canChangeHp()) {
                                const num = number;
                                if (num > 0) {
                                    await player.specifyCards({type: 'basic'}, num); 
                                    await player.loseHp();
                                    await player.moushen.upDateMergefunc();
                                    console.log("已更新技能:",[player.moushen.skill.one.number,player.moushen.skill.two.number,player.moushen.skill.three.number,player.moushen.skill.four.number]);
                                }
                            }
                        },
                    },
                    four: {
                        name: "项四",
                        number: 4,
                        merge: false,
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canGaincards} = player.moushen;
                            const {number} = player.moushen.skill.four;
                            console.log("canGaincards:", canGaincards());
                            if (canGaincards()) {
                                const num = number;
                                if (num > 0) {
                                    if (player.countCards('he') >= num) {
                                        await player.chooseToDiscard(num, 'he', true);
                                    } else {
                                        await player.discard(player.getCards('he'), true);
                                    }
                                    await player.draw();
                                    player.moushen.skill = player.moushen.skill_reset;
                                    console.log("已重置技能");
                                    console.log(player.moushen.skill);
                                }
                            }
                        },
                    },
                },
                skill_reset :{
                    one: {
                        name: "项一",
                        number: 1,
                        merge: false,
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canUseweimu} = player.moushen;
                            const {number} = player.moushen.skill.one;
                            console.log("canUseweimu:", canUseweimu());
                            if (canUseweimu()) {
                                let num = number;
                                if (num > 0) {
                                    while (num > 0) {
                                        num--;
                                        await thunderweimu(player,player);
                                    }
                                }
                            }
                        }
                    },
                    two: {
                        name: "项二",
                        number: 2,
                        merge: false,
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canUsebasic} = player.moushen;
                            const {number} = player.moushen.skill.two;
                            console.log("canUsebasic:", canUsebasic());
                            if (canUsebasic()) {
                                let num = number;
                                if (num > 0) {
                                    while (num > 0) {
                                        num--;
                                        if (!canUsebasic()) break;
                                        player.chooseToUse({
                                            prompt: "打出一张基本牌！",
                                            filterCard: function (card, player) {
                                                const cardinfo = get.info(card,false);
                                                if (!cardinfo) return false;
                                                if (cardinfo.type !== "basic") return false;
                                                if (card.name === "shan") return false;
                                                return true;
                                            },
                                            filterTarget: function(card, player, target) {
                                                return lib.filter.targetEnabledx(card, player, target) && lib.filter.targetInRange(card, player, target);
                                            },
                                            position : "hs",
                                            selectCard: 1,
                                        }).set('forced', true);
                                    }
                                }
                            }
                        }
                    },
                    three: {
                        name: "项三",
                        number: 3,
                        merge: true,//初始化，此项设定为合并项
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canChangeHp} = player.moushen;
                            const {number} = player.moushen.skill.three;
                            console.log("canChangeHp:", canChangeHp());
                            if (canChangeHp()) {
                                const num = number;
                                if (num > 0) {
                                    await player.specifyCards({type: 'basic'}, num); 
                                    await player.loseHp();
                                    await player.moushen.upDateMergefunc();
                                    console.log("已更新技能:",[player.moushen.skill.one.number,player.moushen.skill.two.number,player.moushen.skill.three.number,player.moushen.skill.four.number]);
                                }
                            }
                        },
                    },
                    four: {
                        name: "项四",
                        number: 4,
                        merge: false,
                        merge_ed: false,//是否已经合并
                        connect: async function() {
                            const {canGaincards} = player.moushen;
                            const {number} = player.moushen.skill.four;
                            console.log("canGaincards:", canGaincards());
                            if (canGaincards()) {
                                const num = number;
                                if (num > 0) {
                                    if (player.countCards('he') >= num) {
                                        await player.chooseToDiscard(num, 'he', true);
                                    } else {
                                        await player.discard(player.getCards('he'), true);
                                    }
                                    await player.draw();
                                    player.moushen.skill = player.moushen.skill_reset;
                                    console.log("已重置技能");
                                    console.log(player.moushen.skill);
                                }
                            }
                        },
                    },
                },
            };
            player.update();
        },
        filter:function(event, player, name){
            if(name=="useCard"){
                const card = event.card;
                if (!card) return false;
                const cardinfo = get.info(card,false);
                if (!cardinfo) return false;
                if (cardinfo.type !== "basic") return false;
                player.thundermoushen_basic = true;
                return;
            } else if(name=="gainAfter"){
                const target = _status.currentPhase;
                if (!target) return false;
                if (!target.isPhaseUsing()) return false;
                const Cards = event.cards;
                if (!Cards || Cards.length === 0) return false;
                player.thundermoushen_gaincards = true;
                return;
            } else if(name=="changeHpAfter"){
                const target = _status.currentPhase;
                if (!target) return false;
                if (!target.isPhaseUsing()) return false;
                const num = event.num;
                if (num && num > 0) {
                    player.thundermoushen_changeHp = true;
                }
                return;
            } else if(name=="phaseEnd"){
                return true;
            } else if(name=="phaseAfter"){
                player.thundermoushen_basic = false;
                player.thundermoushen_gaincards = false;
                player.thundermoushen_changeHp = false;
                return;
            }
        },
        async content(event, trigger, player) {
            //是否可以记录帷幕的展示牌的设定！
            if (!player.thundermoushen_canshow) player.thundermoushen_canshow = true;
            player.thundermoushen_canshow = true;//如果是回合结束后执行【帷幕】，则改为强制执行！因为【谋身的设定】
            const {one, two, three, four} = player.moushen.skill;
            await one.connect();
            await two.connect();
            await three.connect();
            await four.connect();
            player.thundermoushen_canshow = false;
        },
        "_priority": 13,
    },
    //喵林夕
    icexihuo: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            global: ["phaseBegin"],
        },
        firstDo: true,
        unique: true,
        locked: false,
        direct:true,
        init:function (player, skill) {
            player.icexihuocards = [];
        },
        filter: function (event, player, name) {
            return player.countCards('h') > 0;
        },
        async content(event, trigger, player) {
            async function icexihuo_guanxing(target, info = "top") {
                const cards = target.getCards('h');
                if (!cards || cards.length === 0) return;
                let TXT_one = '';
                let TXT_two = '';
                if (info === "top") {
                    TXT_one = setColor("〖牌堆顶〗");
                    TXT_two = setColor("请将所有手牌按任意顺序置于牌堆顶！");
                } else if (info === "bottom") {
                    TXT_one = setColor("〖牌堆底〗");
                    TXT_two = setColor("请将所有手牌按任意顺序置于牌堆底！");
                }
                game.cardsGotoOrdering(cards);
                const result = await target.chooseToMove("〖戏火〗",true)
                .set("list", [[TXT_one, cards]]).set("prompt", TXT_two)
                .set("filterMove", (from, to, moved) => {
                    return true;
                }).set('filterOk', (moved) => {
                    return true;
                }).set("processAI", (list) => {
                    let cards= list[0][1];
                    let 排序后 = [[]];
                    if (info === "top") {
                        const tttt = _status.currentPhase;
                        const judges = tttt.getCards("j");
                        const wuxie_one = target.getCards('hs').filter(card => get.name(card,target) === 'wuxie');
                        const wuxie_two = tttt.getCards('hs').filter(card => get.name(card,tttt) === 'wuxie');
                        const hasFriend = get.attitude(target, tttt) >= 2;
                        if (hasFriend) {
                            if (judges.length > 0 && !wuxie_one.length && !wuxie_two.length) {
                                let cheats = setjudgesResult(judges,cards,target,false);//令判定牌失效的卡牌
                                if (cheats.length > 0) {
                                    const 排序剩余卡片= cards.filter(card => !cheats.includes(card)).sort((a, b) => get.value(b, tttt) - get.value(a, tttt));
                                    cards = cheats.concat(排序剩余卡片);
                                } else {
                                    cards = cards.sort((a, b) => get.value(b, tttt) - get.value(a, tttt));
                                }
                            } else {
                                cards = cards.sort((a, b) => get.value(b, tttt) - get.value(a, tttt));
                            }
                        } else {
                            cards = cards.sort((a, b) => get.value(a, tttt) - get.value(b, tttt));
                        }
                    } else if (info === "bottom") {
                        cards = cards.sort((a, b) => get.value(a, target) - get.value(b, target));
                    }
                    return [cards];
                }).forResult();
                if (result.bool) {
                    const cards = result.moved[0];
                    await icexihuo_check(cards);
                    if (info === "top") {
                        target.chooseCardsToPile(cards,"top");
                    } else if (info === "bottom") {
                        target.chooseCardsToPile(cards,"bottom");

                    }
                }
            };
            async function icexihuo_useskill(target) {
                const cards = target.getCards('h');
                if (!cards || cards.length === 0) return;
                const TXT = setColor("〖戏火〗");
                let list = [];
                let numdraw = 0;
                if (target === player) {
                    numdraw = target.getDamagedHp() + (target.hasSkill('icelingxi') ? target.lingxi_draw : 0);
                } else {
                    numdraw = target.getDamagedHp();
                }
                list = [
                    setColor("〖选项一〗：是否要将所有手牌置于〖牌堆顶〗，并从〖牌堆底〗摸") + get.cnNumber(numdraw) + "张牌？",
                    setColor("〖选项二〗：是否要将所有手牌置于〖牌堆底〗，并从〖牌堆顶〗摸") + get.cnNumber(numdraw) + "张牌？",
                ];
                const chooseButton = await target.chooseButton([TXT ,
                    [list.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return target.countCards('h') > 0;
                    } else if (button.link === 1) {
                        return target.countCards('h') > 0;
                    }
                }).set("selectButton", 1).set("ai", function (button) {
                    function getLink() {
                        const tttt = _status.currentPhase;//当前回合角色
                        const judges = tttt.getCards("j");
                        const wuxie_one = target.getCards('hs').filter(card => get.name(card,target) === 'wuxie');
                        const wuxie_two = tttt.getCards('hs').filter(card => get.name(card,tttt) === 'wuxie');
                        const hasFriend = get.attitude(target, tttt) >= 2;
                        if (hasFriend && judges.length && !wuxie_one.length && !wuxie_two.length) {
                            let cheats = setjudgesResult(judges,cards,target,false);//令判定牌失效的卡牌
                            if (cheats.length > 0) return 0;
                        }
                        if (target.countCards('h') <= numdraw) {
                            return 1;
                        } else {
                            return 2;
                        }
                    }
                    if(getLink() === 2) return false;
                    return button.link === getLink();
                }).set(/*'forced', target !== player*/).forResult();
                if (chooseButton.bool) {
                    player.logSkill(event.name);
                    const choices = chooseButton.links;
                    if (choices.includes(0)) {
                        await icexihuo_guanxing(target, "top");
                        if (numdraw > 0) {
                            const gaincards =  get.bottomCards(numdraw);
                            await target.gain(gaincards);
                        }
                    } else if (choices.includes(1)) {
                        await icexihuo_guanxing(target, "bottom");
                        if (numdraw > 0) {
                            const gaincards =  get.cards(numdraw);
                            await target.gain(gaincards);
                        }
                    }
                    if (target === player && target.hasSkill('icelingxi')) {
                        target.lingxi_draw = 0;
                        player.updateMarks('icelingxi');
                    }
                    if (target !== player) return;
                    if (target.hasSkill("icedoumao_MOD")) return;
                    const otherPlayers = game.filterPlayer(current => current != player && current.getCards('he').length > 0);
                    if (!otherPlayers || otherPlayers.length === 0) return;
                    const result = await target.chooseTarget('是否令一名角色执行一次〖戏火〗前半部分？', (card, p, t) => {
                        return t.getCards('h').length > 0 &&  t !== player;
                    }).set('ai', t => {
                        const friends = game.filterPlayer(o => o !== player && get.attitude(player, o) >=2 && o.countCards('h') > 0 && o.countCards('h') <= o.getDamagedHp());
                        const enemies = game.filterPlayer(o => o !== player && get.attitude(player, o) < 2 && o.countCards('h') > 0 && o.countCards('h') > o.getDamagedHp());
                        if (friends.length > 0) {
                            let sortfriends = friends.sort((a, b) => {
                                const a_num = Math.abs(a.getDamagedHp() - a.countCards('h'));
                                const b_num = Math.abs(b.getDamagedHp() - b.countCards('h'));
                                if  (a_num !== b_num) return b_num - a_num;
                                return a.hp - b.hp;
                            });
                            return t === sortfriends[0];
                        } else if (enemies.length > 0) {
                            let sortenemies = enemies.sort((a, b) => {
                                const a_num = Math.abs(a.getDamagedHp() - a.countCards('h'));
                                const b_num = Math.abs(b.getDamagedHp() - b.countCards('h'));
                                if  (a_num !== b_num) return b_num - a_num;
                                return b.hp - a.hp;
                            });
                            return t === sortenemies[0];
                        }
                        return false;
                    }).forResult();
                    if (result.bool) {
                        player.logSkill(event.name);
                        const target2 = result.targets[0];
                        game.log(target, '使用了〖戏火〗技能，令', target2, '执行了一次〖戏火〗前半部分！');
                        await icexihuo_useskill(target2);
                    }
                }
            };
            async function icexihuo_check(cards) {
                const pilescards = ui.cardPile.childNodes;
                let checkcards = [];
                for(let card of pilescards) {
                    if (card.storage.icexihuo) {
                        if (!checkcards.includes(card)) checkcards.push(card);
                    }
                }
                let setcardslist = cards.concat(checkcards); 
                for (let card of setcardslist) {
                    if (!card.storage.icexihuo) {
                        card.storage.icexihuo = true;
                    }
                }
                if(setcardslist.length > 4) {
                    for (let i = 4; i < setcardslist.length; i++) {
                        setcardslist[i].storage.icexihuo = false;
                        delete setcardslist[i].storage.icexihuo;
                    }
                }
            };
            await icexihuo_useskill(player);
        },
        group: "icexihuo_gain",
        subSkill: {
            gain: {
                trigger: {
                    player: ["gainEnd","loseAfter"],
                    global: ["loseAsyncEnd","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
                },
                charlotte: true,
                unique: true,
                direct: true,
                silent: true,
                popup: false,
                filter: function(event, player, name) {
                    if (!player.hasSkill('icexihuo')) return;
                    if (name == 'gainEnd' || name == 'loseAsyncEnd' ) {
                        const cards = event.getg(player);
                        if (!cards.length) return false;
                        return cards.some(card => card.storage.icexihuo);
                    } else {
                        const evt = event.getl(player);
                        if (!evt) return false;
                        return evt.cards && evt.cards.length > 0;
                    }
                },
                async content(event, trigger, player) {
                    const Time = event.triggername;
                    if (Time == 'gainEnd' || Time == 'loseAsyncEnd') { 
                        const cards = trigger.getg(player);
                        if (cards && cards.length > 0) {
                            let totagCards = cards.filter(card => card.storage.icexihuo);
                            player.addGaintag(totagCards, "icexihuo_tag");
                        }
                    } else {
                        const evt = trigger.getl(player);
                        const cards = evt.cards;
                        for(let card  of cards) {
                            if (card.storage.icexihuo) {
                                card.storage.icexihuo = false;
                                delete card.storage.icexihuo;
                            }
                        }
                    }
                },
                sub: true,
                sourceSkill: "icexihuo",
                forced: true,
                "_priority": 1,
            },
        },
        "_priority": 521,
    },
    icelingxi: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= #0088CC>伶息</font>",
        intro: {
            content: function(storage, player) {
                let key = player.hasSkill("icedoumao_MOD");
                const setnum = player.lingxi_draw;
                if (setnum >= 0) {
                    return '〖戏火〗摸牌数增加：' + setnum;
                } else {
                    return '〖戏火〗摸牌数减少：' + setnum;
                }
            },
            name: "<font color= #0088CC>伶息</font>",
        },
        trigger: {
            player: ["gainEnd","loseAfter"],
            global: ["phaseEnd","loseAsyncEnd","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
        },
        init:function (player, skill) {
            player.lingxi_draw = 0;
        },
        locked: true,
        direct: true,
        filter: function (event, player, name) {
            if(name == "phaseEnd"){
                if(player.hasSkill("icedoumao_MOD")){
                    player.lingxi_draw = 0;
                    player.updateMarks('icelingxi');
                    return true;
                }
                return false;
            } else {
                if(player.hasSkill("icedoumao_MOD")) return false;
                if(name == 'gainEnd' || name == 'loseAsyncEnd'){
                    const cards = event.getg(player);
                    if (!cards.length) return false;
                    return true;
                } else {
                    const evt = event.getl(player);
                    if (!evt) return false;
                    return (evt.hs && evt.hs.length > 0) || (evt.es && evt.es.length > 0);
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time == "phaseEnd") {
                const pilescards = ui.cardPile.childNodes;
                let gainlist = [];
                for(let card of pilescards) {
                    if (card.storage.icexihuo) {
                        if (!gainlist.includes(card)) gainlist.push(card);
                    }
                }
                if (gainlist.length) {
                    player.logSkill(event.name);
                    await player.gain(gainlist, "gain2");
                }
                return;
            } else {
                if(Time == "gainEnd" || Time == "loseAsyncEnd"){
                    const cards = trigger.getg(player);
                    player.lingxi_draw -= cards.length;
                    if (player.lingxi_draw < -4) player.lingxi_draw = -4;
                    player.updateMarks('icelingxi');
                } else {
                    const evt = trigger.getl(player);
                    if (evt.hs && evt.hs.length > 0) {
                        player.logSkill(event.name);
                        player.lingxi_draw += evt.hs.length;
                    }
                    if (evt.es && evt.es.length > 0) {
                        player.logSkill(event.name);
                        player.lingxi_draw += evt.es.length;
                    }
                    if (player.lingxi_draw > 4) player.lingxi_draw =  4;
                    player.updateMarks('icelingxi');
                }
            }
        },
        "_priority": 1314,
    },

    icedoumao: {
        audio: "ext:银竹离火/audio/skill:1",
        locked: true,
        direct: true,
        init:function(player, skill) {
            if (!player.hasSkill("icedoumao_MOD")) player.addSkill("icedoumao_MOD");
            player.logSkill(skill);
        },
        "_priority": 1314,
    },
    icedoumao_MOD: {
        audio: "ext:银竹离火/audio/skill:1",
        mark:true,
        marktext:"<font color= #0088CC>逗猫</font>",
        intro:{
            content:function(){
                let TXT = setColor("回合开始时，你可以弃置一张牌并选择一名其他角色，转移「逗猫」，并使其摸一张牌，回合结束时，若你拥有「逗猫」，则需弃置一张牌。");
                return TXT;
            },
        },
        trigger: {
            player: ["phaseBegin","phaseEnd"],
        },
        superCharlotte:true,
        charlotte:true,
        unique:true,
        firstDo: true,
        direct: true,
        filter: function (event, player,name) {
            const targets = game.players.filter(o => o!== player && o.isAlive() && !o.hasSkill("icedoumao_MOD"));
            if(name == "phaseBegin"){
                //player.getDiscardableCards(player,'he').length > 0
                return targets.length > 0 && player.countCards('he') > 0;
            } else if(name == "phaseEnd"){
                return player.countCards('he') > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const enemys = game.filterPlayer(o => get.attitude(player, o) < 2 && !o.hasSkill("icedoumao_MOD"));
            if(Time=="phaseBegin"){
                let TXT = setColor("是否要弃置一张牌并选择一名其他角色，转移「逗猫」，并使其摸一张牌？");
                let cards = await player.chooseCard("he",TXT ).set("ai", (card) => {
                    const cards = player.getCards('he').sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (!enemys || !enemys.length) return false;
                    if (player.isDamaged() && cards.length == 1 && get.name(cards[0], player) == "tao" && player.canUse(cards[0],player)) return false;
                    return get.value(card, player) <= get.value(cards[0], player);
                }).forResultCards();
                if(cards &&cards.length > 0){
                    await player.discard(cards[0]);
                    let Result = await player.chooseTarget("选择转移「逗猫」的目标", (card, player, target) => {
                        return target !== player && target.isAlive();
                    }).set('ai', target => {
                        if (enemys && enemys.length > 0){
                            let sortEnemys = enemys.sort((a, b) => {
                                if (a.countCards('he') !== b.countCards('he')) return a.countCards('he') - b.countCards('he');
                                return a.hp - b.hp;
                            });
                            return target == sortEnemys[0];
                        } else {
                            const targets = game.players.filter(o => o!== player && o.isAlive() && !o.hasSkill("icedoumao_MOD"));
                            let sortTargets = targets.sort((a, b) => {
                                if (a.countCards('he') !== b.countCards('he')) return a.countCards('he') - b.countCards('he');
                                return a.hp - b.hp;
                            });
                            return target == sortTargets[0]
                        }
                    }).set('forced', true).forResult();
                    if(Result.bool){
                        let target = Result.targets[0];
                        player.logSkill("icedoumao_MOD");
                        player.line(target,"ice");
                        if(!target.hasSkill("icedoumao_MOD")){
                            target.addSkill("icedoumao_MOD");
                        }
                        player.removeSkill("icedoumao_MOD");
                        await target.draw();
                    }
                }
            } else if(Time=="phaseEnd"){
                if (player.countCards('he') > 0) {
                    await player.chooseToDiscard(1, 'he', true);
                }
            }
        },
        "_priority": 5210,
    },
    //明徐阶
    mingxinxue: {
        audio: "ext:银竹离火/audio/skill:2",
        marktext: "知",
        onremove: function (player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro: {
            content: "expansion",
            markcount: "expansion",
        },
        enable: "phaseUse",
        persevereSkill: true,
        filter: function (event, player) {
            //既然这样设定了必须选择不同的卡牌名字置于武将牌上！这叫技能逻辑的合理性
            var storedCards = player.getExpansions('mingxinxue');
            return player.getCards('he').some(card => !storedCards.includes(card.name)) && player.getExpansions('mingxinxue').length < 5;
        },
        usable: 3,
        selectCard: 1,
        position:"he",
        filterCard: function (card, player) {
            var storedCards = player.getExpansions('mingxinxue');
            return !storedCards.some(storedCard => storedCard.name === card.name);
        },
        discard: false,
        lose: false,
        delay: false,
        check: function(card) {
            //满足什么条件下，储存什么类型什么名字的牌？思考一下
            //分两种情况，拥有革弊前，拥有革弊后！但是回合外要考虑生存，那么必须满足手牌中有牌名相同的牌。
            //武将技能文案已经全部定案了，基本一套公式打出初具成型！别对我说你不会玩根据最新文案！
            //你也别想了，我这边帮你想吧，因为这只是AI的一部分。选牌！ 发动技能也需要写！与其技能联动也需要写！
            //为什么大家都不愿意为线下单机写主动技能的AI，可变因素很多！重复工作（但写法不同）很多，还有可联动性越多思考的越多！
            //尤其是可卡牌名字牵扯到一起。写法千变万化。就相当于现实生活中，垃圾老板的一句话，你需要把方案改了又改！
            //我这边这个武将包就这么多武将了，有趣的机制在添加新武将吧。单纯堆砌数值和无趣的机制就不写了！
                //因为这个武将的文案  限定技之后就立马获得最终形态，没有任何过度性！究极点杀！不管是100还是成千上万血的武诸葛，在你觉醒后如果他手牌点数均比你的手牌点数小，都是一张纸！除非有技能濒死回满血！
                //谁在你面前都是死路一条，这个设定我不是很认同，但是机制很有趣。我也懒得给你改数值了！我现在做的就是，让你看看了解三国杀游戏机制、又会写AI代码的，一看文案就基本知道你这个
                //自定义武将的如何使用的扩展作者，如何使用这个武将，然后把其中一套打法用AI的方式赋值给这个武将的！
            //AI代码如下↓↓↓↓↓↓↓
            var player = _status.event.player;
            if (ui.selected.cards.length && ui.selected.cards[0].name == "du") return 0;
            if (!ui.selected.cards.length && card.name == "du") return 20;
            if (ui.selected.cards.length > 1) return 0;
            var storedCards = player.getExpansions('mingxinxue');
            var HandCards = player.getCards('h');
            var cardName = get.name(card);
            if (HandCards.some(c => storedCards.includes(c.name)) || player.getExpansions('mingxinxue').length >= 5) return 0;
                //卡牌结构，心学技能机制;此阶段对于心学有用的牌，且卡牌结构有多张的卡牌有"杀44张、闪24张、桃12、酒5、决斗3、五谷2、顺手5、过拆6、乐不3、无中4 、借刀2、火攻3、兵粮2、铁索6、闪电2 、无懈7"
                //按照权重，以及对于心学机制再觉醒前有用的卡牌
            if (!player.hasSkill("minggebi") || player.hasSkill("minggebi_used")) {
                if (cardName === "sha") {
                    if (HandCards.some(c => get.name(c) === "sha")) return 10;
                } else if (cardName === "shan") {
                    if (HandCards.some(c => get.name(c) === "shan")) return 9;
                } else if (cardName === "tao") {
                    if (HandCards.filter(c => get.name(c) === "tao").length > 1) return 8;
                } else if (cardName === "wuxie") {
                    if (HandCards.filter(c => get.name(c) === "wuxie").length > 1) return 7;
                } else if (cardName === "tiesuo") {
                    if (HandCards.filter(c => get.name(c) === "tiesuo").length > 1) return 6;
                } else if (cardName === "guohe") {
                    if (HandCards.filter(c => get.name(c) === "guohe").length > 1) return 6;
                } else if (cardName === "shunshou") {
                    if (HandCards.filter(c => get.name(c) === "shunshou").length > 1) return 5;
                } else if (cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "jiu").length > 1) return 5;
                } else if (cardName === "wuzhong") {
                    if (HandCards.filter(c => get.name(c) === "wuzhong").length > 1) return 4;
                } else if (cardName === "lebu" || cardName === "juedou" || cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "lebu").length > 1 ||
                        HandCards.filter(c => get.name(c) === "juedou").length > 1 ||
                        HandCards.filter(c => get.name(c) === "jiu").length > 1) {
                        return 0.5;
                    }
                } else return 0;
            } else if (player.hasSkill("minggebi") && !player.hasSkill("minggebi_used") ) {
                if (cardName === "sha") {
                    if (HandCards.some(c => get.name(c) === "sha")) return 10;
                } else if (cardName === "shan") {
                    if (HandCards.some(c => get.name(c) === "shan")) return 9;
                } else if (cardName === "tao") {
                    if (HandCards.filter(c => get.name(c) === "tao").length > 1) return 8;
                } else if (cardName === "wuxie") {
                    if (HandCards.filter(c => get.name(c) === "wuxie").length > 1) return 7;
                } else if (cardName === "tiesuo") {
                    if (HandCards.filter(c => get.name(c) === "tiesuo").length > 1) return 6;
                } else if (cardName === "guohe") {
                    if (HandCards.filter(c => get.name(c) === "guohe").length > 1) return 6;
                } else if (cardName === "shunshou") {
                    if (HandCards.filter(c => get.name(c) === "shunshou").length > 1) return 5;
                } else if (cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "jiu").length > 1) return 5;
                } else if (cardName === "wuzhong") {
                    if (HandCards.filter(c => get.name(c) === "wuzhong").length > 1) return 4;
                } else if (cardName === "lebu" || cardName === "juedou" || cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "lebu").length > 1 ||
                        HandCards.filter(c => get.name(c) === "juedou").length > 1 ||
                        HandCards.filter(c => get.name(c) === "jiu").length > 1) {
                        return 3;
                    }
                } else return 2;
            }
            return 0;
        },
        group: ["mingxinxue_use"],
        content: function () {
            player.addToExpansion(cards, 'giveAuto', player).gaintag.add('mingxinxue');
            if (player.storage.mingxinxue) {
                player.draw();
            }
        },
        ai:{
            threaten:1.5,
            order:13,
            skillTagFilter:function (player) {
                var storedCards = player.getExpansions('mingxinxue');
                return player.getCards('he').some(card => !storedCards.includes(card.name)) && player.getExpansions('mingxinxue').length < 5;
            },
            result:{
                player:1,
            },
        },
        subSkill: {
            use: {
                audio: "mingxinxue",
                trigger: {
                    player: ["respond", "useCard"],
                },
                persevereSkill: true,
                unique: true,
                forced: false,
                locked: false,
                direct: true,
                filter: function (event, player) {
                    var storedCards = player.getExpansions('mingxinxue');
                    return event.card && storedCards.some(card => card.name === event.card.name);
                },
                content: function () {
                    'step 0'
                    player.chooseCardButton(player.getExpansions('mingxinxue'), '是否要弃置1张与此牌名相同的「知」并摸两张牌？').set('filterButton', function(button) {
                        return button.link.name === trigger.card.name;
                    }).set('ai', function(button) {
                        return true;
                    });
                    'step 1'
                    if (result && result.bool && result.links && result.links.length) {
                        player.logSkill(event.name);
                        player.discard(result.links);
                        if (player.hasSkill("mingyinren")) {
                            player.addMark("mingyinren", 1);
                        } 
                        player.draw(2);
                    }
                },
                sub: true,
                sourceSkill: "mingxinxue",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    mingyinren: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        onremove: true,
        marktext: "<span style=\"color: #AFEEEE\">隐忍</span>",
        intro:{
            content:function (storage, player) {
                var nummark = player.countMark('mingyinren');
                return '你已因触发〖心学〗移去过' + nummark+'张「知」标记！';
            },
            name:"<span style=\"color: #AFEEEE\">隐忍</span>",
        },
        trigger: {
            player: ["phaseBegin", "phaseEnd"],
        },
        persevereSkill:true,
        unique:true,
        forced:true,
        locked:true,
        juexingji:true,
        skillAnimation:true,
        animationColor:"thunder",
        filter: function (event, player) {
            return player.countMark('mingyinren') >= 3;
        },
        derivation:["mingchuyan","minggebi"],
        content: function () {
            player.awakenSkill("mingyinren");
            player.storage.mingxinxue = true;
            player.removeMark('mingyinren', player.countMark('mingyinren'));
            player.addSkill("mingchuyan");
            player.insertPhase();
        },
        "_priority": 0,
    },
    mingchuyan: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        limited:true,
        skillAnimation:"epic",
        animationColor:"thunder",
        init:function (player) {
            player.storage.mingchuyan = false;
        },
        intro:{
            content:"limited",
        },
        enable: "phaseUse",
        persevereSkill:true,
        unique:true,
        forced:true,
        locked:true,
        direct: true,
        filter: function (event, player) {//这个是触发此技能，过滤器函数：也就是你这个技能满足什么条件下，才能发动！！！！！
            //你知道你这个技能描述的弊端吗？
            //………………
            //“出牌阶段你可以减少一点体力上限并移去一张「知」令一名手牌数不小于一号位的角色将体力值和手牌数调整至一，然后你获得〖革弊〗。”，
            //………………
            //就一个逗号，按照技能描述：
            //①如果我觉得前边一句话全部都是触发限定技能的条件，缺一不可；你怎么说？
            //②如果我觉得前边一句话全部都是  此技能获得〖革弊〗的前提条件，缺一不可；你怎么说？
            //………………
            //其他的，我也不多问了：我这边按照修改后的文案：”限定技：出牌阶段，你可以移去一张「知」,并执行以下所有项：①你减少一点体力上限；②选择一名手牌数不小于一号位的角色，令其体力值和手牌数调整至一；③获得技能〖革弊〗。
            //至于为什么这样改：我这边就说一点，按照你这边的技能描述，若场上都比一号位（不管你是几号位）的手牌少，那么技能执行代码，执行到一半就不执行了？
            //还有你如果是一号位，你的手牌最多。这个必选你！因为他是限定技，如果不选择按正常逻辑来讲。你是获得不了〖革弊〗的。所以这个技能欠考虑。不过整体思路不错
            return player.getExpansions('mingxinxue').length > 0 && !player.storage.mingchuyan;
        },
        content: function () {
            'step 0'
            player.chooseCardButton(player.getExpansions('mingxinxue'), '〖限定技·除严〗：是否要移去一张「知」,并执行以下所有项：①你减少一点体力上限；②选择一名手牌数不小于一号位的角色，令其体力值和手牌数调整至一；③获得技能〖革弊〗？').set('ai', function(button) {
                var players = game.players;
                var player = _status.event.player;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].getSeatNum() == 1) {
                        var playerInSeat1 = players[i];
                        var numVs = playerInSeat1.countCards('h');
                    }
                }
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.countCards('h')>=numVs && get.attitude(player, current) <= 0;
                });
                if (targets.length>0) return true;
            });
            'step 1'
            if (result && result.bool && result.links && result.links.length) {
                player.logSkill(event.name);
                player.storage.mingchuyan = true;
                player.awakenSkill("mingchuyan");
                player.discard(result.links);
                player.loseMaxHp();
                var players = game.players;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].getSeatNum() == 1) {
                        var playerInSeat1 = players[i];
                        var numVs = playerInSeat1.countCards('h');
                    }
                }
                var targets = game.filterPlayer(function (current) {
                    return current.countCards('h')>=numVs;
                });
                if (targets.length>0) {
                    player.chooseTarget("请选择一名手牌数不小于一号位的角色，将其体力值和手牌数调整至一", function(card, player, target) {
                        return target.countCards('h')>=numVs;
                    }).set('ai', function(target) {
                        //AI没有设定！人为控制！
                        var player = _status.event.player;
                        var att = get.attitude(player, target);
                        return att <= 0;
                        //鉴于文案如此描述，必须发动！
                        return 1;
                    }).set('forced', true);//因为这是二级开关，必须选择了！！！根据技能文案！
                    event.goto(2);
                } else event.finish();
            } else event.finish();
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target, 'fire');
                if (target.hp>1) {
                    var numlose = target.hp - 1;
                    target.loseHp(numlose);
                }
                if (target.countCards('h')>1) {
                    var numdis = target.countCards('h')-1;
                    target.chooseToDiscard(numdis,'h', true);
                } else if (target.countCards('h')<1) {
                    target.draw();
                }
            }
            'step 3'
            player.addSkill("minggebi");
        },
        ai:{
            threaten:1.5,
            order:12,
            skillTagFilter:function (player) {
                var players = game.players;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].getSeatNum() == 1) {
                        var playerInSeat1 = players[i];
                        var numVs = playerInSeat1.countCards('h');
                    }
                }
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.countCards('h')>=numVs && get.attitude(player, current) <= 0;
                });
                if (targets.length>0) return true;
            },
            result:{
                player:function (player, target) {
                    var players = game.players;
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].getSeatNum() == 1) {
                            var playerInSeat1 = players[i];
                            var numVs = playerInSeat1.countCards('h');
                        }
                    }
                    var targets = game.filterPlayer(function (current) {
                        return current != player && current.countCards('h')>=numVs && get.attitude(player, current) <= 0;
                    });
                    if (targets.length>0) return 2;
                    return 0;
                },
            },
        },
        "_priority": 0,
    },
    minggebi: {
        audio: "ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        persevereSkill:true,
        unique:true,
        forced: false,
        locked: false,
        direct: true,
        filter: function (event, player) {
            //“出牌阶段限一次，你可以移去任意张「知」与一名体力值不大于你的其他角色进行拼点，赢的角色令没赢的角色选择一项：1令对方摸X张牌；2.弃置X张牌；3.失去X点体力(X为当次技能移去「知」的数量)。”，
            if (player.hasSkill("minggebi_used")) return false;
            var targets = game.filterPlayer(function (current) {
                return current != player && current.hp <= player.hp && current.countCards('h')>0 && !current.hasSkillTag("noCompareSource") && !current.hasSkillTag("noCompareTarget");
            });
            return player.getExpansions('mingxinxue').length > 0 && targets.length>0;
        },
        content: function () {
            'step 0'
             var numdis = player.getExpansions('mingxinxue').length;
            player.chooseCardButton(player.getExpansions('mingxinxue'),
                '请选择移去至多' + get.cnNumber(numdis) +
                '张「知」标记牌与一名其他体力值不大于你的角色进行拼点：赢的角色令没赢的角色选择一项：①令对方摸X张牌；②弃置X张牌；③失去X点体力<br>　　注：<span style="color: #0088CC; font-weight: bold;">X</span>为当次技能移去「知」的数量。',
                [1, numdis]
            ).set('filterButton', function (button) {
                return true;
            }).set('ai', function (button) {
                var card = button.link;
                // AI 更倾向于选择更多的「知」标记牌
                return true;
            });
            'step 1'
            if (result && result.bool && result.links && result.links.length) {
                var numToRemove = result.links.length;
                player.logSkill(event.name);
                player.addTempSkill("minggebi_used");
                player.discard(result.links);
                event.numX = result.links.length;
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.hp <= player.hp && current.countCards('h')>0 && !current.hasSkillTag("noCompareSource") && !current.hasSkillTag("noCompareTarget");
                });
                if (targets.length>0) {
                    player.chooseTarget("请选择拼点的目标", function(card, player, target) {
                        return target != player && target.hp <= player.hp && target.countCards('h')>0 && !target.hasSkillTag("noCompareSource") && !target.hasSkillTag("noCompareTarget");
                    }).set('ai', function(target) {
                        //AI设定
                        var player = _status.event.player;
                        var ts = target.getCards("h").sort((a, b) => get.number(a) - get.number(b));
                        var att = get.attitude(player, target);
                        //思路
                        if (att<=0) {
                            var hs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            var ts = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            if (get.number(hs[0]) > get.number(ts[0])) return 4;                    
                            return 1;
                        } else {
                            var hs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            var ts = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            if (get.number(hs[0]) < get.number(ts[0])) return 3;
                            return 2;
                        }
                        return 1;
                    }).set('forced', true);//因为这是二级开关，必须选择了！！！根据技能文案！
                    event.goto(2);
                } else event.finish();
            } else event.finish();
            'step 2'
            if (result.bool) {
                event.target = result.targets[0];
                var target = event.target;
                if (player.canCompare(target)) player.chooseToCompare(target);
                event.goto(3);
            }
            "step 3"
            var target = event.target;
            var numX = event.numX;
            var options = ['选项一', '选项二', '选项三'];
            if (result.bool) {
                //玩家赢
                target.chooseControl(options)
                    .set("choiceList", [
                        "令" + get.translation(player) + "摸" + get.cnNumber(numX) + "张牌",
                        "你弃置" + get.cnNumber(numX) + "张牌",
                        "你失去" + get.cnNumber(numX) + "点体力"
                    ])
                    .set("prompt", "请选择一项执行之！")
                    .set("ai", function () {
                        var targetA = _status.event.player;
                        var att = get.attitude(targetA, event.target);
                        var hasOption = {
                            one: options.includes("选项一"),
                            two: options.includes("选项二"),
                            three: options.includes("选项三")
                        };
                        if (att>0) {
                            if (hasOption.one) return "选项一";                
                        } else {//敌方如何选择
                            var live = target.countCards('he', { name: ['tao', 'jiu'] }) + target.hp - numX;
                            var taos = target.countCards('he', { name: ['tao'] });
                            var shs = target.countCards('he', { name: ['shan'] });
                            var hes = target.countCards('he') - numX;
                            if (live>0) {
                                if (shs>0 && hasOption.three) return "选项三";
                            } else {
                                if ((hes-taos>0 || hes- shs>0) && hasOption.two) return "选项二";
                                if (hasOption.one) return "选项一"; 
                            }
                        }
                    });
                event.goto(4);
            //平局
            } else if (result.tie) {
                event.finish();
            } else {
            //对方赢
                player.chooseControl(options)
                    .set("choiceList", [
                        "令" + get.translation(target) + "摸" + get.cnNumber(numX) + "张牌",
                        "你弃置" + get.cnNumber(numX) + "张牌",
                        "你失去" + get.cnNumber(numX) + "点体力"
                    ])
                    .set("prompt", "请选择一项执行之！")
                    .set("ai", function () {
                        var player = _status.event.player;
                        var att = get.attitude(player, event.target);
                        var hasOption = {
                            one: options.includes("选项一"),
                            two: options.includes("选项二"),
                            three: options.includes("选项三")
                        };
                        if (att>0) {
                            if (hasOption.one) return "选项一";                
                        } else {//敌方如何选择
                            var live = player.countCards('he', { name: ['tao', 'jiu'] }) + player.hp - numX;
                            var taos = player.countCards('he', { name: ['tao'] });
                            var shs = player.countCards('he', { name: ['shan'] });
                            var hes = player.countCards('he') - numX;
                            if (live>0) {
                                if (shs>0 && hasOption.three) return "选项三";
                            } else {
                                if ((hes-taos>0 || hes- shs>0) && hasOption.two) return "选项二";
                                if (hasOption.one) return "选项一"; 
                            }
                        }
                    });
                event.goto(5);                    
            }
            "step 4"
            //玩家赢
            var target = event.target;
            var numX = event.numX;
            if (result.control === "选项一") {
                player.draw(numX);
            } else if (result.control === "选项二") {
                //注意文案设计者这里变成了弃置X张牌！！
                if (target.countCards('he')>numX) {
                    target.chooseToDiscard(numX,'he', true);
                } else {
                    target.discard(target.getCards('he'), true);
                }
            } else if (result.control === "选项三") {
                target.loseHp(numX);
            } else event.finish();
            event.finish();
            "step 5"
            //对方赢
            var target = event.target;
            var numX = event.numX;
            if (result.control === "选项一") {
                target.draw(numX);
            } else if (result.control === "选项二") {
                //注意文案设计者这里变成了弃置X张牌！！
                if (player.countCards('he')>numX) {
                    player.chooseToDiscard(numX,'he', true);
                } else {
                    player.discard(player.getCards('he'), true);
                }
            } else if (result.control === "选项三") {
                player.loseHp(numX);
            } else event.finish();
            event.finish();
        },
        subSkill:{
            used:{
                charlotte:true,
                unique:true,
                sub:true,
                sourceSkill:"minggebi",
                "_priority":0,
            },
        },
        ai:{
            threaten:1.5,
            order:11,
            skillTagFilter:function (player) {
                if (player.hasSkill("minggebi_used")) return false;
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.hp <= player.hp && current.countCards('h')>0 && !current.hasSkillTag("noCompareSource") && !current.hasSkillTag("noCompareTarget");
                });
                return player.getExpansions('mingxinxue').length > 0 && targets.length>0;
            },
            result:{
                player:1,
            },
        },
        "_priority": 0,
    },
    //明朱祁镇
    /*
    mingyuyu: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player: ["chooseToCompareAfter","compareMultipleAfter"],
            target: ["chooseToCompareAfter","compareMultipleAfter"],
            global: ["chooseToCompareBegin","roundStart"],
        },
        persevereSkill: true,
        unique: true,
        forced: true,
        locked: true,
        direct: true,
        init:function(player, skill) {
            player.storage.mingyuyu_zhongjianused = 0;
            player.storage.mingyuyu_fuquanused = 0;
        },
        filter: function (event, player,name) {
            if (name == 'chooseToCompareBegin') {
                if (player == event.player) return true;
                if (event.targets) return event.targets.includes(player);
                return player == event.target;
            } else if (name == 'roundStart') {
                const targets = game.filterPlayer(function(current) {
                    return current !== player && player.canCompare(current) && !current.hasSkill('mingyuyu_fuquan') && !current.hasSkill('mingyuyu_zhongjian');
                }).length;
                return targets > 0;
            } else {
                if (event.preserve) return false;
                return [event.card1, event.card2].filterInD("od").length > 0;
            }
        },
        async content(event, trigger, player) {
            player.logSkill(event.name);
            const Time = event.triggername;
            if (Time == "chooseToCompareBegin") {
                var targets = player == trigger.player ? (trigger.targets ? trigger.targets.slice(0) : [trigger.target]) : [trigger.player];
                if (!trigger.fixedResult) trigger.fixedResult = {};
                while (targets.length) {
                    var target = targets.shift();
                    var hs = target.getCards("h");
                    if (hs.length) trigger.fixedResult[target.playerid] = hs.randomGet();
                }
            } else if (Time == "roundStart") {
                let targets = game.players.filter(target => target !== player && player.canCompare(target) && !target.hasSkill("mingyuyu_fuquan") && !target.hasSkill("mingyuyu_zhongjian"));
                if(targets.length > 0) {
                    for (let target of targets) {
                        let { result } = await player.chooseToCompare(target);
                        if (result.bool) {
                            await target.draw();
                            await target.addSkill("mingyuyu_fuquan");
                        } else {
                            await target.draw();
                            await target.addSkill("mingyuyu_zhongjian");
                        }
                    }
                }
            } else {
                const numdis = [trigger.card1, trigger.card2].filterInD("od").length;
                await player.gain([trigger.card1, trigger.card2].filterInD("od"), "gain2", "log");
                if(player.countCards("he") > numdis && numdis > 0) {
                    await player.chooseToDiscard(numdis, 'he', true);
                }
            }
        },
        group: "mingyuyu_Compare",
        subSkill:{
            Compare:{
                enable: "chooseCard",
                check: function (event, player) {
                    return 10;//先这样吧
                },
                filter: function (event) {
                    return event.type == "compare" && !event.directresult;
                },
                superCharlotte: true,
                charlotte: true,
                unique: true,
                silent: true,
                direct: true,
                onCompare: function (player) {
                    let cardone = game.ZQZspecifyCards(7, 1, "addHEJ");
                    return game.cardsGotoOrdering(cardone).cards;
                },
                sourceSkill:"mingyuyu",
            },
            fuquan:{
                mark:true,
                marktext:"<font color= #FF2400>附权</font>",
                onremove:true,
                intro:{
                    content: "恭喜你获得「附权」",
                    name:"<font color= #FF2400>附权</font>",
                },
                superCharlotte:true,
                charlotte:true,
                unique:true,
                sub:true,
                sourceSkill:"mingyuyu",
                "_priority":Infinity,
            },
            zhongjian:{
                mark:true,
                marktext:"<font color= #0088CC>忠谏</font>",
                onremove:true,
                intro:{
                    content: "恭喜你获得「忠谏」",
                    name:"<font color= #FF2400>忠谏</font>",
                },
                superCharlotte:true,
                charlotte:true,
                unique:true,
                sub:true,
                sourceSkill:"mingyuyu",
                "_priority":Infinity,
            },
        },
        "_priority": 0,
    },
    mingqinzheng:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            global: ["roundStart"],
        },
        persevereSkill:true,
        unique:true,
        forced:true,
        locked:true,
        juexingji:true,
        skillAnimation:true,
        animationColor:"thunder",
        priority: Infinity,
        direct:true,
        init:function(player, skill) {
            player.storage.mingqinzheng = false;
        },
        filter:function(event, player) {
            if (player.storage.mingqinzheng) return;
            const zhongjian = player.storage.mingyuyu_zhongjianused;
            const fuquan = player.storage.mingyuyu_fuquanused;
            const zhongjianplayers = game.filterPlayer(function(current) {
                return current.hasSkill('mingyuyu_zhongjian');
            }).length;
            const fuquanplayers = game.filterPlayer(function(current) {
                return current.hasSkill('mingyuyu_fuquan');
            }).length;
            if (zhongjian > zhongjianplayers || fuquan > fuquanplayers){
                return game.roundNumber > 1;
            } else {
                return false;
            }  
        },
        derivation: ["mingduomen"],
        async content(event, trigger, player) {
            player.logSkill(event.name);
            const zhongjianplayers = game.filterPlayer(function(current) {
                return current.hasSkill('mingyuyu_zhongjian');
            }).length;
            const fuquanplayers = game.filterPlayer(function(current) {
                return current.hasSkill('mingyuyu_fuquan');
            }).length;
            const numdraws = Math.abs(zhongjianplayers - fuquanplayers) + player.getDamagedHp();
            if (numdraws > 0) {
                await player.gainCardsNumbersAndNames(numdraws);
            }
            const targets = game.players;
            for (let target of targets) {
                const cards = target.getCards("he",card =>target.canRecast(card) );
                if (cards.length) {
                    await target.recast(cards);
                }
                if (target.hasSkill('mingyuyu_fuquan')) await target.removeSkill('mingyuyu_fuquan');
                if (target.hasSkill('mingyuyu_zhongjian')) await target.removeSkill('mingyuyu_zhongjian');
            }
            player.awakenSkill("mingyuyu");
            player.awakenSkill("mingqinzheng");
            player.addSkill("mingduomen");
            player.storage.mingqinzheng = true;
            let evt = trigger.getParent("phaseUse");
            if (evt && evt.player != player) {
                evt.skipped = true;
                player.insertPhase();
            } else {
                player.insertPhase();
            }
        },
        ai:{
            combo:["mingyuyu"],
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
        },
    },
    mingduomen:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            player:"damageEnd",
            global:"damageBegin",
        },
        persevereSkill:true,
        unique:true,
        forced:true,
        locked:true,
        direct:true,
        filter:function(event, player, name) {
            if (name == 'damageEnd') {
                const targets = game.filterPlayer(function(current) {
                    return current !== player && current.countCards("he") > 0 && current.countGainableCards(player, "he") > 0;
                }).length;
                return event.num > 0 && targets > 0;
            } else if (name == 'damageBegin') {
                if (player.identity === "zhu") return;
                if (event.player === player) return;
                return event.num > 0 && event.player.identity === "zhu";
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            let count = trigger.num || 1;
            if (Time == "damageEnd") {
                while (count > 0) {
                    count--;
                    let targets = game.players.filter(target => target !== player && target.countCards("he") > 0 && target.countGainableCards(player, "he") > 0);
                    if (targets.length) {
                        let result = await player.chooseBool(get.prompt2("mingduomen")).set('ai', function() {
                            return true
                        }).forResult();
                        if (result.bool) {
                            player.logSkill(event.name);
                            for (let target of targets) {
                                let cards = await target.chooseCard("he", true, `选择交给${get.translation(player)}一张牌`).forResultCards();
                                if (cards && cards.length) {
                                    await target.give(cards, player);
                                    await target.draw();
                                    player.logSkill(event.name);
                                }
                            }
                        }
                    }
                }
            } else {
                player.logSkill(event.name);
                let numdraws = count * 2;
                await player.draw(numdraws);
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
        },
    },
    */
};
export default TAF_qitaSkills;
