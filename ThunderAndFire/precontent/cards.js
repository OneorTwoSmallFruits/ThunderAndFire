import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
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
const loseTime = ["equipAfter","addJudgeAfter","gainAfter", "loseAfter","loseAsyncAfter","addToExpansionAfter"];
const BossEquip1 = ["TAF_fumojingangchu","TAF_feijiangshenweijian","TAF_wushuangxiuluoji"];
const BossEquip5 = ["TAF_youhuoshepoling","TAF_honglianzijinguan"];
/** @type { importCharacterConfig['skill'] } */
const ShenwuCards = {//神吕布神武卡牌
    //金刚伏魔杵
    TAF_fumojingangchu: {
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        image: "ext:银竹离火/image/card/TAF_fumojingangchu.png",
        skills: ["TAF_fumojingangchu_skill"],
        enable: true,
        distance: {
            attackFrom: -2,
        },
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip1;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(o => o != player && get.attitude(player, o) < 2);
                    let value = 0;
                    if  (targets.length > 0) {
                        for (let target of targets) {
                            if (target.getEquip(2)) {
                                value ++;
                            }
                        }
                    }
                    return value + 5;
                },
                order: function (card, player) {
                    const list = BossEquip1;
                    const has = player.getCards("e").filter(card => list.includes(get.name(card)));
                    if (has && has.length > 0) {
                        return 0.5;
                    } else {
                        return game.compareOrder(player,"sha") * 1.25;
                    }
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_fumojingangchu");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip1') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    //飞将神威剑
    TAF_feijiangshenweijian: {
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        image: "ext:银竹离火/image/card/TAF_feijiangshenweijian.png",
        skills: ["TAF_feijiangshenweijian_skill"],
        enable: true,
        distance: {
            attackFrom: -1,
        },
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip1;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(o => o != player && o.hasSkillTag("maixie", false, player) && get.attitude(player, o) < 2);
                    return targets.length * 1.5 + 5;
                },
                order: function (card, player) {
                    const list = BossEquip1;
                    const has = player.getCards("e").filter(card => list.includes(get.name(card)));
                    if (has && has.length > 0) {
                        return 0.5;
                    } else {
                        return game.compareOrder(player,"sha") * 1.25;
                    }
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_feijiangshenweijian");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip1') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    //无双修罗戟
    TAF_wushuangxiuluoji: {
        fullskin: true,
        type: "equip",
        subtype: "equip1",
        image: "ext:银竹离火/image/card/TAF_wushuangxiuluoji.png",
        skills: ["TAF_wushuangxiuluoji_skill"],
        enable: true,
        distance: {
            attackFrom: - 4,
        },
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip1;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(function(current) {
                        return current != player;
                    });
                    let Value = 5;
                    const getcards = player.getCards("hs").filter(card => card.name == "sha" || card.name == "juedou");
                    if(getcards.length > 0) {
                        let canUselist = [];
                        for (let target of targets) {
                            for (let card of getcards) {
                                if (player.canUse(card, target ,false ,true)) {
                                    const effect = get.effect(target, card, player, player);
                                    if (effect && effect > 0 && !canUselist.includes(card)) {
                                        canUselist.push(card);
                                    }
                                }
                            }
                        }
                        if (canUselist.length > 0) Value += canUselist.length;
                    }
                    return Value;
                },
                order: function (card, player) {
                    const list = BossEquip1;
                    const has = player.getCards("e").filter(card => list.includes(get.name(card)));
                    if (has && has.length > 0) {
                        return 1.5;
                    } else {
                        return Math.max(game.compareOrder(player,"sha"), game.compareOrder(player,"juedou")) * 1.25;;
                    }
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_wushuangxiuluoji");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip1') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    //红莲紫金冠
    TAF_honglianzijinguan: {
        fullskin: true,
	    type: "equip",
	    subtype: "equip5",
        image: "ext:银竹离火/image/card/TAF_honglianzijinguan.png",
        skills: ["TAF_honglianzijinguan_skill"],
        enable: true,
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip5;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(function(current) {
                        return current != player;
                    });
                    const friends = targets.filter(o => get.attitude(player, o) > 0 && o.getCards("he").length > 0);
                    const enemies = targets.filter(o => get.attitude(player, o) <= 0 && o.getCards("he").length > 0);
                    return (enemies.length - friends.length) * 1.5 + (enemies.length + friends.length) * 0.5;
                },
                order: function (card, player) {
                    return 1.5;
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_honglianzijinguan");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip5') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
    //幽火摄魄令
    TAF_youhuoshepoling: {
        fullskin: true,
	    type: "equip",
	    subtype: "equip5",
        image: "ext:银竹离火/image/card/TAF_youhuoshepoling.png",
        skills: ["TAF_youhuoshepoling_skill"],
        enable: true,
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
        destroy: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
        toself: true,
        ai: {
            basic: {
                equipValue: function (card, player) {
                    const list = BossEquip5;
                    const keys = { 
                        Can : player.canEquip(card, true), 
                        has : player.getCards("e").filter(card => list.includes(get.name(card))),
                    };
                    if (!keys.Can) return 0.01;
                    if (keys.has && keys.has.length > 0) return 0.5;
                    const targets = game.filterPlayer(function(current) {
                        return current != player;
                    });
                    const friends = targets.filter(o => get.attitude(player, o) > 0);
                    const enemies = targets.filter(o => get.attitude(player, o) <= 0);
                    const selfSaves = player.getCards('hes').filter(card => player.canSaveCard(card, player));
                    let SaveCards = [];
                    if (friends.length > 0) {
                        for (let f of friends) {
                            const cards = f.getCards('hes').filter(card => f.canSaveCard(card, f));
                            if (cards.length > 0) {
                                for (let c of cards) {
                                    if (!SaveCards.includes(c)) {
                                        SaveCards.push(c);
                                    }
                                }
                            }
                        }
                    }
                    const sum_SaveCards = SaveCards.concat(selfSaves).filter(card => card.name !== 'jiu');
                    const effect = sum_SaveCards.length - friends.filter(o => o.hp === 1).length;
                    return enemies.length - friends.length + player.getDamagedHp() + effect * player.getDamagedHp();
                },
                order: function (card, player) {
                    return 1.5;
                },
                value: function (card, player) {
                    return get.equipValue(card, player);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    const numX = player.getHandcardLimit();
                    const cards = player.getCards("h").filter(card => card.name !== "TAF_youhuoshepoling");
                    if (cards.length >= numX && numX > 4 && player.countEmptySlot('equip5') > 0) {
                        const useful = compareUseful(player,'tao') + compareUseful(player,'shan') + compareUseful(player,'jiu') + compareUseful(player,'wuxie');
                        return useful / 4;
                    } else {
                        return 0;
                    }
                },
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
        },
    },
};

/** @type { importCharacterConfig['skill'] } */
const Signaturecards = {//武将专属卡牌
	//神贾诩，贾老板衍生
	icewuqibingfa: {
        fullskin: true,
	    image: "ext:银竹离火/image/card/icewuqibingfa.png",
	    type: "equip",
	    subtype: "equip5",
        enable: true,
        selectTarget: -1,
        filterTarget: function (card, player, target) {
            return player == target && target.canEquip(card, true);
        },
        modTarget: true,
        allowMultiple: false,
	    forceDie: true,
        destroy: true,
        toself: true,
        async onLose(event, trigger, player) {
            const cards = event.cards;
            if (cards && cards.length > 0) {
                for (let c of cards) {
                    c.fix();
                    c.remove();
                    c.destroyed = true;
                    game.log(c, "被销毁了");
                }
                const targets = game.filterPlayer(o => o.isAlive());
                if (!targets.length) return;
                const list = player.countSkills();
                const choosenum = Math.min(list.length , targets.length);
                const prompt = setColor("〖吴起兵法〗：请选择至多") + get.cnNumber(choosenum) + "名角色于本回合结束时将一张牌当【杀】使用！";
                const result = await player.chooseTarget(prompt, [1, choosenum], function(card, player, target) {
                    return targets.includes(target);
                }).set('ai', function(target) {
                    const friends = player.getFriends_sorted();
                    const enemies = player.getEnemies_sorted();
                    let findValueF = [];
                    for (const e of enemies) {
                        for (const f of friends) {
                            if(findValueF.includes(f)) continue;
                            const cards = f.getCards('hes');
                            const EnabledCards = cards.filter(card => lib.filter.cardEnabled(card, f, "forceEnable"));
                            const Vcard_sha = { name: "sha", nature: '', isCard: true };
                            const canUseSha = f.canUse(Vcard_sha, e, true, false);
                            const effect = get.effect(e, Vcard_sha, f, f);
                            if (f.inRange(e) && canUseSha && effect && effect > 0 && EnabledCards && EnabledCards.length > 1) {
                                const sortcards = EnabledCards.sort((a,b) => get.value(a, f) - get.value(b, f));
                                const card = sortcards[0];
                                const compareNum = (compareValue(f, "tao") + compareValue(f, "jiu") + compareValue(f, "shan") + compareValue(f, "wuxie")) / 4;
                                if (get.value(card, f) < compareNum && !findValueF.includes(f)) {
                                    findValueF.push(f);
                                }
                            }
                        }
                    }
                    if (findValueF.length === 0) return false;
                    if (findValueF.includes(target)) return 1;
                    else return 0;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    const num = Math.floor(Math.random() * 2) + 1;
                    game.playAudio('..', 'extension', '银竹离火/audio/card/skills', 'icewuqibingfa_skill' + num);
                    for (let target of targets) {
                        player.line(target, 'ice');
                        game.log(player, "对", target, "使用了", "#g【吴起兵法】", "!");
                        target.addTempSkill("icewuqibingfa_sha");
                        target.markSkill("icewuqibingfa_sha");
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const card = event.card;
            if (card && card.cards) {
                const hasNonOPosition = card.cards.some(singleCard => {
                    return get.position(singleCard, true) !== "o";
                });
                if (!hasNonOPosition) {
                    player.equip(card);
                }
            }
        },
	    ai: {
            basic: {
                equipValue: 6.5,
                order: function (card, player) {
                    const names = lib.inpile.filter(name => name !== "icewuqibingfa");
                    let orderlist = [];
                    for (let name of names) {
                        const Vcard = { name: name, nature: '', isCard: true };
                        const subtype = get.subtype(Vcard);
                        if (subtype && subtype === "equip5") {
                            const order = get.order(Vcard, player);
                            if (order && order > 0) orderlist.push(order);
                        }
                    }
                    if (orderlist.length === 0) return compareValue(player,"muniu") * 1.5;
                    return Math.max(...orderlist) * 1.5;
                    //不要问我怎么把优先级调的这么高！因为就算有其他宝具牌也会后来者顶上替换！吴起兵法本身没有什么用
                    //需要被顶替或顺拆才能发动技能！
                },
                value: function (card, player) {
                    const names = lib.inpile.filter(name => name !== "icewuqibingfa");
                    let valuelist = [];
                    for (let name of names) {
                        const Vcard = { name: name, nature: '', isCard: true };
                        const subtype = get.subtype(Vcard);
                        if (subtype && subtype === "equip5") {
                            const value = get.value(Vcard, player);
                            if (value && value > 0) valuelist.push(value);
                        }
                    }
                    if (valuelist.length === 0) return compareValue(player,"muniu") * 0.85;
                    return Math.max(...valuelist) * 0.5;
                },
                useful: 0,
            },
            result: {
                target: function (player, target, card) {
                    return get.equipResult(player, target, card);
                },
            },
	    },

	},
	//本包郭嘉衍生锦囊卡牌《十胜十败》
    thundertenwintenlose: {
        fullskin: true,
        type: "delay",
        image: "ext:银竹离火/image/card/thundertenwintenlose.png",
        modTarget: function(card, player, target) {
            return lib.filter.judge(card, player, target);
        },
        enable: function(card, player) {
            return player.canAddJudge(card);
        },
        filterTarget: function(card, player, target) {
            return lib.filter.judge(card, player, target) && player === target;
        },
        judge: function(card) {
            const suit = get.suit(card);
            const number = get.number(card);
            if (suit === "spade" && number > 0 && number < 11 && number % 2 !== 0) {
                return 1; 
            } else if (suit === "heart" && number > 0 && number < 11 && number % 2 === 0) {
                return 1;
            } else {
                return -2;
            }
        },
        judge2: function(result) {
            if (result.bool == false) return true;
            return false;
        },
        effect: async function(result) {
            const player = result.player;
            const prompt0 = setColor("此〖十胜十败〗牌，判定结果非点数十之内的，奇数且为♠ / 偶数且为♥，判定失败，此牌将移动至下家判定区！");
            const prompt1 = setColor("此〖十胜十败〗牌，判定结果为点数十之内的，奇数且为♠ / 偶数且为♥，判定生效，且有有效目标！");
            const prompt2 = setColor("此〖十胜十败〗牌，判定结果为点数十之内的，奇数且为♠ / 偶数且为♥，判定生效，但无有效目标！此牌将移动至下家判定区！");
            const prompt3 = setColor("请选择一名非郭嘉的其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害！");
            if (result._result.bool === true) {
                const targets = game.filterPlayer(function (current) {
                    return !lib.translate[current.name].includes("郭嘉") && current.isAlive() && current !== player;
                });
                if (!targets || targets.length === 0) { 
                    game.log(prompt2);
                    player.addJudgeNext(result.card);
                } else {
                    game.log(prompt1);
                    const result = await player.chooseTarget(prompt3, true, function (card, player, target) {
                        return targets.includes(target);
                    }).set('ai', function (target) {
                        return target === tenwintenloseAI(player);
                    }).forResult();
                    if (result.bool) {
                        const num = Math.floor(Math.random() * 2) + 1;
                        game.playAudio('..', 'extension', '银竹离火/audio/card/skills', 'thundertenwintenlose_skill' + num);
                        const target = result.targets[0];
                        player.line(target, 'fire');
                        const phs = player.getCards('h').length;
                        const pes = player.getCards('e').length;
                        const pjs = player.getCards('j').length;
                        const ths = target.getCards('h').length;
                        const tes = target.getCards('e').length;
                        const tjs = target.getCards('j').length;
                        if (phs > ths) {
                            game.log(player,'与',target,'比较手牌区牌数结果为','#g【胜】');
                            await player.draw(2);
                        } else if (phs <= ths) {
                            game.log(player,'与',target,'比较手牌区牌数结果为','#g【负】');
                        }
                        if (pes > tes) {
                            game.log(player,'与',target,'比较装备区牌数结果为','#g【胜】');
                            await player.recover();
                            await player.link(true);
                            await target.link(true);
                        } else if (pes <= tes) {
                            game.log(player,'与',target,'比较装备区牌数结果为','#g【负】');
                        }
                        if (pjs > tjs) {
                            game.log(player,'与',target,'比较判定区牌数结果为','#g【胜】');
                            await target.damage(1, "fire", "nosource");
                        } else if (pjs <= tjs) {
                            game.log(player,'与',target,'比较判定区牌数结果为','#g【负】');
                        }
                    }
                }
            } else {
                game.log(prompt0);
                player.addJudgeNext(result.card);
            }
        },
        cancel: function(card) {
            player.addJudgeNext(card);
        },
        allowMultiple: false,
        ai: {
            basic: {
                order: function (card, player) {
                    const key1 = player.hasSkill("thunderqizuo");
                    const key2 = player.hasSkill("thunderyiji");
                    if (key1 && key2) {
                        const skillOrder = lib.skill.thunderyiji.ai.order("thunderyiji", player);
                        if (player.isHealthy() && player.canAddJudge(card)) {
                            return skillOrder + 3.5;
                        }
                    }
                    return 1.5;
                },
                value: function (card, player) {
                    const key = player.hasSkill("thunderyiji");
                    const cards = player.getCards("hes").filter(card => card.name !== "thundertenwintenlose");
                    if (key) {
                        if (!cards || cards.length === 0) return 9;
                        let valuelist = [];
                        for(let card of cards) {
                            const value = get.value(card);
                            if (value && value > 0) valuelist.push(value);
                        }
                        if (valuelist.length === 0) return 9;
                        const maxValue = Math.max(...valuelist) + 2;
                        return Math.max(9, maxValue);
                    }
                    return 2.5;
                },
                useful: function (card) {
                    let player = _status.event.player;
                    const key = player.hasSkill("thunderyiji");
                    const cards  = player.getCards("hes").filter(card => card.name !== "thundertenwintenlose");
                    if (key) {
                        if (!cards || cards.length === 0) return 2;
                        let usefullist = [];
                        for(let card of cards) {
                            const useful = get.useful(card);
                            if (useful && useful > 0) usefullist.push(useful);
                        }
                        if (usefullist.length === 0) return 2;
                        const maxUseful = Math.max(...usefullist) + 2;
                        return Math.max(2, maxUseful);
                    }
                    return 0;
                },
            },
            result: {
                target: function(player, target) {
                    return tenwintenloseAI(target, "resultAI");
                },
            }
        }
    },
};

/** @type { importCharacterConfig['skill'] } */
const basicCards = {//本扩展有趣的基本牌
    TAF_leishan: {
        audio: true,
        fullskin: true,
        type: "basic",
        notarget: true,
        nodelay: true,
        direct:true,
        image: "ext:银竹离火/image/card/TAF_leishan.png",
        global: ["TAF_leishan_skill","TAF_leishan_remove"],
        defaultYingbianEffect: "draw",
        async content(event, trigger, player) {
            DiycardAudio(event, player);
            const evt2 = event.getParent(3)._trigger;
            //debugger;
            evt2.neutralize();
            //debugger;
            const evt = evt2.getParent();
            const next = game.createEvent("TAF_leishan_remove");
            _status.event.next.remove(next);
            evt.after.unshift(next);
            next.player = player;
            next.setContent(async function () {
                const Parent = event.getParent();
                if (Parent && Parent.respondTo) {
                    const card = Parent.respondTo[1];
                    if (card && card.cards && card.cards.length > 0) {
                        const gaincards = card.cards;
                        await player.gain(gaincards, "gain2", "log");
                    }
                }
                const targets = getDisSkillsTargets("targets");
                if (targets.length) {
                    let prompt = setColor("是否发动【雷闪】：选择场上一名有因〖封印〗类buff而失效技能的角色，令其移除此效果？");
                    const result = await player.chooseTarget(prompt, 1, function (card, player, target) {
                        return targets.includes(target);
                    }).set('ai', function (target) {
                        return get.attitude(player, target) > 0;
                    }).forResult();
                    if (result.bool) {
                        const target = result.targets[0];
                        player.line(target, "thunder");
                        DiycardAudio(event, player, 'effect');
                        const buffs = getDisSkillsTargets("buffs",target);
                        const disskills = getDisSkillsTargets("skills",target);
                        for(let skill of buffs) {
                            await target.removeSkill(skill);
                        }
                        game.log(player, "对", target, "发动了", '#g【雷闪】', '：', 
                            '#g【' + disskills.map(get.translation).join('】、【') + '】',
                            "移除失效效果！");
                    }
                }
            });
        },
        ai: {
            basic: {
                order: function (card, player) {
                    //这个oder和雷闪的卡牌的技能AI作为联动。
                    return compareOrder(player,"shan") * 1.15;
                },
                value: function (card, player) {
                    return Math.min(compareValue(player,"shan") * 1.15, compareValue(player,"tao") * 0.95);
                },
                useful: function (card) {
                    const player = _status.event.player;
                    return Math.min(compareUseful(player,"shan") * 1.15, compareUseful(player,"tao") * 0.95);
                },
            },
            result: { 
                player: 1 
            },
        },
    },

};

/** @type { importCharacterConfig['skill'] } */
const trickCards = {//本扩展有趣的锦囊牌
    TAF_lunhuizhiyao: {//轮回之钥
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        selectTarget: 1,
        reverseOrder: true,
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
            DiycardAudio(event, player);
            player.$fullscreenpop('轮回之钥', 'fire');
            const phaseNames = [ 'phaseZhunbei', 'phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard', 'phaseJieshu' ];
            const list = phaseNames.map(name => {
                return game.createCard(`TAF_lunhuizhiyao_${name}`, 'spade', 6);
            });
            game.cardsGotoOrdering(list);
            const prompt = setColor("〖轮回之钥〗");
            const prompt2 = setColor("请调整〖" + get.translation(target) + "〗下一个回合的六大阶段顺序。");
            const result = await player.chooseToMove(prompt,true).set("list", [[prompt2, list]]).set("filterMove", (from, to, moved) => {
                return true;
            }).set('filterOk', (moved) => {
                return moved[0].length === list.length;
            }).set("processAI", (list) => {
                const phaselist = list[0][1];
                const att = get.attitude(player, target);
                if (att) {
                    if (att >= 2) {
                        /**
                         * 准备阶段、结束阶段、摸牌阶段、出牌阶段、判定阶段、弃牌阶段
                         */
                        return [[phaselist[0], phaselist[5], phaselist[2], phaselist[3], phaselist[1], phaselist[4]]];
                    } else if (att < 2) {
                        /**
                         * 判定阶段、摸牌阶段、结束阶段、准备阶段、弃牌阶段、出牌阶段
                         */
                        return [[phaselist[1], phaselist[2], phaselist[5], phaselist[0], phaselist[4], phaselist[3]]];
                    }
                } else {
                    return [[phaselist[1], phaselist[2], phaselist[5], phaselist[0], phaselist[4], phaselist[3]]];
                }
            }).set('forced', true).forResult();
            if (result.bool) {
                const list = result.moved[0];
                const phaseNames = list.map(card => {
                    return card.name.replace("TAF_lunhuizhiyao_", "");
                });
                if (!target.lunhuizhiyao_phaselist) {
                    target.lunhuizhiyao_phaselist = phaseNames;
                } else {
                    target.lunhuizhiyao_phaselist = phaseNames;
                }
                if(!target.hasSkill('TAF_lunhuizhiyao_skill')) {
                    await target.addSkill('TAF_lunhuizhiyao_skill');
                }
                const prompt = phaseNames.map(name => get.translation(name)).join("、");
                game.log(player,'通过', "#g【轮回之钥】", "将", target,'下个回合的六大阶段顺序更改为：', prompt , '。')
            }
        },
        async contentAfter(event, trigger, player) {
            const phaseNames = ['phaseZhunbei', 'phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard', 'phaseJieshu'];
            const findCards = [];
            ["cardPile", "discardPile"].forEach(pile => {
                const cards = ui[pile].childNodes;
                cards.forEach(card => {
                    if (phaseNames.some(name => card.name === `TAF_lunhuizhiyao_${name}`)) {
                        findCards.push(card);
                    }
                });
            });
            game.players.forEach(target => {
                target.getCards("hesjx").forEach(card => {
                    if (phaseNames.some(name => card.name === `TAF_lunhuizhiyao_${name}`)) {
                        findCards.push(card);
                    }
                });
            });
            if (findCards.length > 0) {
                findCards.forEach(card => {
                    card.fix();
                    card.remove();
                    card.destroyed = true;
                });
            }
            ui.clear();
        },
        ai: {
            basic: {
                order: function (card, player) {
                    const cards = player.getCards("hs");
                    let findCards = [];
                    const targets = game.filterPlayer();
                    for(const card of cards) {
                        const type = get.type2(card);
                        if (type === 'trick' && card.name !== 'TAF_lunhuizhiyao') {
                            for(const target of targets) {
                                const effect = get.effect(target, card, player, player);
                                const canUse = player.canUse(card, target);
                                if (effect && effect > 0 && canUse) {
                                    findCards.push(card);
                                }
                            }
                        }
                    }
                    if (findCards.length === 0) return 5;
                    return 1.5;
                },
                value: function (card, player) {
                    return 9;
                },
                useful: 0,
            },
            result: {
                target: function(player, target){
                    //判定阶段、摸牌阶段、结束阶段、准备阶段、弃牌阶段、出牌阶段
                    const enemiesPhases = ['phaseJudge', 'phaseDraw', 'phaseJieshu', 'phaseZhunbei', 'phaseDiscard', 'phaseUse'];
                    //准备阶段、结束阶段、摸牌阶段、出牌阶段、判定阶段、弃牌阶段
                    const friendsPhases = ['phaseZhunbei', 'phaseJieshu', 'phaseDraw', 'phaseUse', 'phaseJudge', 'phaseDiscard'];
                    const enemies = player.getEnemies_sorted().filter(o => {
                        const key1 = !o.lunhuizhiyao_phaselist;
                        const key2 = o.lunhuizhiyao_phaselist;
                        return key1 || (key2 && !key2.every((v, i) => v === enemiesPhases[i]));
                    });
                    if (enemies && enemies.length > 0) {
                        const reversed = enemies.reverse();
                        const firstTwo = reversed.slice(0, 2);
                        if (firstTwo.includes(target) && target.needsToDiscard() > 0) {
                            return -1;
                        }
                    }
                    const friends = player.getFriends_sorted(false).filter(o => {
                        const key1 = !o.lunhuizhiyao_phaselist;
                        const key2 = o.lunhuizhiyao_phaselist;
                        return key1 || (key2 && !key2.every((v, i) => v === friendsPhases[i]));
                    });
                    if (friends && friends.length > 0) {
                        const reversed = friends.reverse();
                        const firstTwo = reversed.slice(0, 2);
                        if (firstTwo.includes(target) && target.needsToDiscard() > 0) {
                            return 1;
                        }
                    }
                    const targets = game.filterPlayer().sortBySeat(player).filter(o => get.attitude(player, o) < 2);
                    if (targets && targets.length > 0) {
                        const firstTwo = targets.slice(0, 2);
                        if (firstTwo.includes(target)) {
                            return -1;
                        }
                    }
                    return -2;
                },
            },
        },
    },
    TAF_lunhuizhiyao_phaseZhunbei: {//准备阶段
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
    },
    TAF_lunhuizhiyao_phaseJudge: {//判定阶段
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
    },
    TAF_lunhuizhiyao_phaseDraw: {//摸牌阶段
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
    },
    TAF_lunhuizhiyao_phaseUse: {//出牌阶段
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
    },
    TAF_lunhuizhiyao_phaseDiscard: {//弃牌阶段
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
    },
    TAF_lunhuizhiyao_phaseJieshu: {//结束阶段
        audio: true,
        fullskin: true,
        type: "trick",
        enable: true,
        image: "ext:银竹离火/image/card/TAF_lunhuizhiyao.png",
        filterTarget: function(card, player, target) {
            return target !== player;
        },
        async content(event, trigger, player) {
            const target = event.target;
        },
    },
    TAF_daozhuanqiankun: {//倒转乾坤
        audio: true,
        fullskin: true,
        type: "trick",
        image: "ext:银竹离火/image/card/TAF_daozhuanqiankun.png",
        global: ["TAF_daozhuanqiankun_skill"],
        selectTarget: -1,
        reverseOrder: true,
        filterTarget: function(card, player, target) {
            return true;
        },
        async contentBefore(event, trigger, player) {
            DiycardAudio(event, player);
            player.$fullscreenpop('倒转乾坤', 'fire');
            const evt = event.getParent();
            if (evt) {
                const card = evt.card;
                if (card && card.name === "TAF_daozhuanqiankun") {
                    const targets = evt.targets;
                    if (targets.length > 0) {
                        evt.targets.sortBySeat(player);
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const target = event.target;
            if (!target.TAF_daozhuanqiankun) target.TAF_daozhuanqiankun = true;
        },
        async contentAfter(event, trigger, player) {
            const targets = game.filterPlayer().sortBySeat(player);
            const sortTargets = targets.filter(target => target.TAF_daozhuanqiankun);
            async function clear() {
                for (const target of targets) {
                    if (target.TAF_daozhuanqiankun) {
                        target.TAF_daozhuanqiankun = false;
                        delete target.TAF_daozhuanqiankun;
                    }
                }
            }
            if (sortTargets.length < 2) {
                await clear();
                return;
            }
            const toSwapList = [];
            const len = sortTargets.length;
            for (let i = 0; i < Math.floor(len / 2); i++) {
                const j = len - 1 - i;
                toSwapList.push([sortTargets[i], sortTargets[j]]);
            }
            game.broadcastAll(toSwapList => {
                for (const list of toSwapList) {
                    game.swapSeat(list[0], list[1], false);
                }
            }, toSwapList);
            await clear();
        },
        setUseCard: function(player) {//AI决策
            const NowPlayer = _status.currentPhase;
            const nextPlayer = NowPlayer.next;
            const nextSeatNum = nextPlayer.seatNum;//核心参数
            const players = game.filterPlayer(o => o.isAlive());
            const friends = players.filter(o => get.attitude(player, o) >= 2);
            const sorted = players.sortBySeat(player);
            const beforeMap = {};//获取排序前的所有座位号映射的对应玩家
            for (const player of sorted) {
                beforeMap[player.seatNum] = player;
            }
            /***
             * 获取排序后的所有座位号映射的对应玩家，人机策略我这边先不考虑场上无懈了
             */
            const swappedPlayers = [...sorted];
            for (let i = 0; i < Math.floor(sorted.length / 2); i++) {
                const j = sorted.length - 1 - i;
                [swappedPlayers[i], swappedPlayers[j]] = [swappedPlayers[j], swappedPlayers[i]];
            }
            const afterMap = {};
            Object.keys(beforeMap).forEach((seatNum, index) => {
                afterMap[seatNum] = swappedPlayers[index];
            });
            const afterPlayer = afterMap[nextSeatNum];//找出模拟排序后座位号为nextSeatNum的玩家
            const index = swappedPlayers.indexOf(afterPlayer);
            /**
             * 以座位号为nextSeatNum的玩家为基准，将swappedPlayers数组进行排序
             * 也就是打出倒转乾坤后，现在的实际打牌顺序！
             */
            const afterMapsorted = index === -1 ? swappedPlayers : [
                ...swappedPlayers.slice(index),
                ...swappedPlayers.slice(0, index)
            ];
            const half = Math.floor(afterMapsorted.length / 2);
            let count = 0;//统计新的出牌顺序，前一半的角色中的友方角色数量！
            for (let i = 0; i < half; i++) {
                const p = afterMapsorted[i];
                if (get.attitude(player, p) >= 2) {
                    count++;
                }
            }
            /**
             * 本锦囊卡，以大局观思路设定的人机决策，是否使用倒转乾坤，即，友方角色有一半的数量，在前一半中，就行！
             * 如果想详细优化：
             * 猜测无懈，能被无懈掉的角色，是否被兵乐，手牌数量（质量和数量），等因素都考虑进去。
             * 这样其实有些本末倒置了，没太多必要。把基本的逻辑理清就行。
             */
            const halfnum = Math.max(1, Math.floor(friends.length / 2));
            if(get.attitude(player, nextPlayer) >= 2) return 0;
            if (count >= halfnum) return 1;
            return 0;
        },
        ai: {
            basic: {
                order: 1,
                value: 7.5,
                useful: function () {
                    const player = _status.event.player;
                    const shan = compareUseful(player,"shan");
                    const tao = compareUseful(player,"tao");
                    const jiu = compareUseful(player,"jiu");
                    const setnum = {
                        one: Math.min(shan, tao, jiu) * 0.95,
                        two: Math.min(shan, tao),
                    }
                    const result = lib.card.TAF_daozhuanqiankun.setUseCard(player);
                    if (result && result > 0) return setnum.two;
                    return setnum.one;
                },
            },
            result: {
                target: function(player, target){
                    return lib.card.TAF_daozhuanqiankun.setUseCard(player);
                },
            },
        },
    },
};
export const cards = { ...ShenwuCards, ...Signaturecards, ...basicCards, ...trickCards};
let object = lib.ThunderAndFire.cards;
if (object && typeof object === 'object') {
    if (object.cards) object.cards = Object.keys(cards);
    if (object.setShenwu) object.setShenwu = Object.keys(ShenwuCards);
    if (object.setSignature) object.setSignature = Object.keys(Signaturecards);
    if (object.setDestroy) {
        const keysA = Object.keys(cards);
        for (let key of keysA) {
            const type = cards[key].type;
            if (type && type === 'equip') {
                if (!object.setDestroy.includes(key)) {
                    object.setDestroy.push(key);
                }
            }
        }
    }
    if (object.setAudio) {
        const keysB = Object.keys(cards);
        for (let key of keysB) {
            if (!object.setAudio.includes(key)) {
                object.setAudio.push(key);
            }
        }
    }
}
/** @type { importCharacterConfig['skill'] } */
const Skills = {
    //轮回之钥
    TAF_lunhuizhiyao_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: { 
            player:["phaseBeforeStart","phaseBegin","phaseEnd"], 
        },
        charlotte: true,
        firstDo: true,
        forced: true,
        init: function (player, skill) {
            if (!player.lunhuizhiyao_phaseBegin) player.lunhuizhiyao_phaseBegin = false;
        },
        filter: function (event, player, name) {
            if (name === "phaseBeforeStart") {
                const key = player.lunhuizhiyao_phaselist;
                if (!key) return false;
                return player.lunhuizhiyao_phaselist.length === 6;
            } else if (name === "phaseBegin") {
                player.lunhuizhiyao_phaseBegin = true;
                return;
            } else if (name === "phaseEnd") {
                return player.lunhuizhiyao_phaseBegin;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseBeforeStart") {
                trigger.phaseList = player.lunhuizhiyao_phaselist;
            } else if (Time === "phaseEnd") {
                delete player.lunhuizhiyao_phaselist;
                delete player.lunhuizhiyao_phaseBegin;
                player.removeSkill("TAF_lunhuizhiyao_skill");
                player.popup("轮回之钥");
                game.log(player, "的", "#g【轮回之钥】", "持续效果已结束。");
                //player.needsToDiscard();
            }
        },
        "_priority": -25,
    },
    //倒转乾坤
    TAF_daozhuanqiankun_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: { global: "phaseEnd" },
        forced: true,
        filter: function (event, player, name) {
            const cards = player.getCards("hes").filter(card => get.name(card) === 'TAF_daozhuanqiankun');
            const EnabledCards = cards.filter(card => lib.filter.cardEnabled(card, player, "forceEnable"));
            return player.hasUsableCard("TAF_daozhuanqiankun") && EnabledCards.length > 0;
        },
        async content(event, trigger, player) {
            const next = player.chooseToUse();
            next.set("prompt", setColor("是否对所有角色使用【倒转乾坤】？"));
            next.set("filterCard", function (card, player) {
                if (get.name(card) != "TAF_daozhuanqiankun") return false;
                return lib.filter.cardEnabled(card, player, "forceEnable");
            });
            next.set("ai1", function (card) {
                /**
                 * 联动倒转乾坤设定！
                 */
                return lib.card.TAF_daozhuanqiankun.setUseCard(player) > 0;
            });
        },
        "_priority": -25,
    },
    //雷闪
    TAF_leishan_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: { target: "useCardToBegin" },
        forced: true,
        filter: function (event, player, name) {
            const key = event._neutralized;
            if (key && key === true) return false;
            if (event.directHit || !get.tag(event.card, "damage")) return false;
            return player.hasUsableCard("TAF_leishan");
        },
        async content(event, trigger, player) {
            const next = player.chooseToUse();
            next.set("prompt", "是否使用【雷闪】响应" + get.translation(trigger.player) + "使用的" + get.translation(trigger.card) + "？");
            next.set("filterCard", function (card, player) {
                if (get.name(card) != "TAF_leishan") return false;
                return lib.filter.cardEnabled(card, player, "forceEnable");
            });
            next.set( "respondTo", [trigger.player, trigger.card] ).set("goon", function () {
                const effect = get.effect(player, trigger.card, trigger.player, player);
                const cards = player.getCards("hes");
                const shancards = cards.filter(card => get.name(card) === 'shan');
                const shacards = cards.filter(card => get.name(card) === 'sha');
                const name = get.name(trigger.card);
                const targets = getDisSkillsTargets("targets").filter(target => get.attitude(player, target) > 0);
                if (targets.length) {
                    return - effect;
                } else {
                    if(name === 'sha' && shancards.length > 0 && shacards.length > 0) {
                        let canUseShan = false;
                        for(let card of shancards) {
                            const key1 = lib.filter.cardEnabled(card, player, "forceEnable");
                            const key2 = lib.filter.cardRespondable(card, player, trigger);
                            if(key1 && key2) {
                                canUseShan = true;
                                break;
                            }
                        }
                        if(canUseShan) return effect;
                        return - effect;
                    } else {
                        return - effect;
                    }
                }
            });
            next.set("ai1", function (card) {
                /**
                 * 个人理解：我这张卡牌的文案也改了一下。
                 * 于是在filter函数中添加该事件是否已经被抵消，若被抵消则不触发响应雷闪。
                 * 本体逐鹿包的《草船借箭》，我发现在无懈抵消比如决斗、南蛮后，还能使用并获得伤害牌。
                 * 我觉得既然《草船借箭》没有参与抵消卡牌事件，就不应该被选择和使用
                 * （因本体无懈的响应时机先于本卡牌技能的触发时机useCardToBegin）
                 * 若已经被无懈，该伤害牌事件已经被略过，则不触发雷闪。
                 * 优化雷闪的使用价值决策：
                 * 1.场上存在有技能失效的友方，则优先使用雷闪
                 * 2.若响应的牌是【杀】，且手牌中有可以选择和响应的打出的卡牌闪，且有【杀】（证明不缺杀），则不使用雷闪，转而使用普通闪。
                 */
                return _status.event.goon();//收益前边定的收益"goon"
            });
        },
        "_priority": -25,
    },

    //金刚伏魔杵
    TAF_fumojingangchu_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: {
            source: "damageBefore",
            player: "useCardToPlayered",
        },
        forced: true,
        logTarget: "target",
        filter: function (event, player, name) {
            if (name === 'damageBefore') {
                if(!event.player) return false;
                if(!event.source) return false;
                if(event.source !== player) return false;
                if (event.player.getEquip(2)) {
                    return event.num > 0;
                }
                return false;
            } else if (name === 'useCardToPlayered') {
                return event.card.name == "sha";
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "damageBefore") {
                const target = trigger.player;
                let text1 = setColor("发动〖金刚伏魔杵〗，对");
                let text2 = setColor("即将造成的伤害+1！");
                game.log(player, text1, target, text2);
                trigger.num ++;
            } else {
                trigger.target.addTempSkill("TAF_fumojingangchu_attack");
                trigger.target.TAF_fumojingangchu_attack.add(trigger.card);
                trigger.target.markSkill("TAF_fumojingangchu_attack");
            }
        },
        ai: {
            "unequip_ai": true,
            skillTagFilter: function (player, tag, arg) {
                if (arg && arg.name == "sha") return true;
                return false;
            },
        },
        "_priority": -25,
    },
    TAF_fumojingangchu_attack: {
        marktext: "※",
        intro: {
            content: "当前防具技能已失效",
            onremove: true,
        },
        trigger: {
            player: ["damage","damageCancelled","damageZero"],
            source: ["damage","damageCancelled","damageZero"],
            target: ["shaMiss","useCardToExcluded","useCardToEnd","eventNeutralized"],
            global: ["useCardEnd"],
        },
        init: function (player, skill) {
            if (!player[skill]) player[skill] = [];
        },
        firstDo: true,
        charlotte: true,
        silent: true,
        forced: true,
        popup: false,
        priority: 12,
        filter: function (event, player) {
            const evt = event.getParent("useCard", true, true);
            if (evt && evt.effectedCount < evt.effectCount) return false;
            return player.TAF_fumojingangchu_attack && event.card && player.TAF_fumojingangchu_attack.includes(event.card) && (event.name != "damage" || event.notLink());
        },
        async content(event, trigger, player) {
            player.TAF_fumojingangchu_attack.remove(trigger.card);
            if (!player.TAF_fumojingangchu_attack.length) player.removeSkill("TAF_fumojingangchu_attack");
        },
        ai: {
            "unequip2": true,
        },
        "_priority": 1201,
    },
    //飞将神威剑
    TAF_feijiangshenweijian_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: {
            source: "damageBefore",
            global: "loseHpEnd",
        },
        forced: true,
        firstDo: true,
        direct:true,
        logTarget: "target",
        filter: function (event, player, name) {
            if (name === 'damageBefore') {
                if(!event.card) return false;
                return event.card.name == "sha";
            } else if (name === 'loseHpEnd') {
                return event.num > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "damageBefore") {
                trigger.cancel();
                const num = trigger.num;
                const target = trigger.player;
                let text1 = setColor("发动〖飞将神威剑〗，对");
                let text2 = setColor("即将造成的");
                let text3 = setColor("点伤害，改为流失等量体力！");
                game.log(player, text1, target, text2, num, text3);
                game.playAudio('..', 'extension', '银竹离火/audio/card/skills', event.name + '1');
                target.loseHp(num);
            } else {
                game.playAudio('..', 'extension', '银竹离火/audio/card/skills', event.name + '2');
                let count = trigger.num || 0;
                while(count > 0) {
                    count --;
                    await player.draw();
                }
            }
        },
        ai: {
            jueqing: true,
            skillTagFilter: function (player, tag, arg) {
                if (arg && arg.name == "sha") return true;
                return false;
            },
        },
        "_priority": -25,
    },
    //无双修罗戟
    TAF_wushuangxiuluoji_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: {
            source: "damageAfter",
        },
        forced: true,
        firstDo: true,
        direct:true,
        filter: function (event, player) {
            if(!event.card) return false;
            if(!event.player) return false;
            const target1 = event.player.next;
            const target2 = event.player.previous;
            if (!target1 && !target2) return false;
            if (event.card.name !== "sha" && event.card.name !== "juedou") return false;
            return event.num > 0;
        },
        async content(event, trigger, player) {
            let text1 = '无此项';
            let text2 = '无此项';
            const target1 = trigger.player.next;
            const target2 = trigger.player.previous;
            if (target1) {
                text1 = "〖选项一〗：对" + get.translation(target1) + "造成一点伤害。";
            }
            if (target2) {
                text2 = "〖选项二〗：对" + get.translation(target2) + "造成一点伤害。";
            }
            let list = [ text1, text2, ];
            let TXT = setColor("〖无双修罗戟〗");
            const chooseButton = await player.chooseButton([TXT,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    return target1;
                } else if (button.link === 1) {
                    return target2;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                const taos = player.getCards('hs').filter(card => get.name(card == "tao")).length;
                let shouyi = {
                    target1: function () {
                        let shouyi = 0;
                        if (!target1) return shouyi;
                        const livenum1 = taos + target1.hp - 1;
                        const livenum2 = target1.hp - 1;
                        let att = get.attitude(player, target1);
                        const num = get.damageEffect(target1,player,player,"damage");
                        if (num > 0) {
                            if (att >= 2) {
                                if (livenum1 > 0) shouyi = 1;
                                else shouyi = 0;
                            } else {
                                if (livenum2 > 1) shouyi = 0;
                                else shouyi = 1;
                            }
                        }
                        return shouyi;
                    },
                    target2: function () {
                        let shouyi = 0;
                        if (!target2) return shouyi;
                        const livenum1 = taos + target1.hp - 1;
                        const livenum2 = target1.hp - 1;
                        let att = get.attitude(player, target2);
                        const num = get.damageEffect(target2,player,player,"damage");
                        if (num > 0) {
                            if (att >= 2) {
                                if (livenum1 > 0) shouyi = 2;
                                else shouyi = 0;
                            } else {
                                if (livenum2 > 1) shouyi = 0;
                                else shouyi = 2;
                            }
                        }
                        return shouyi;
                    },
                };
                switch (button.link) {
                    case 0:
                        return shouyi.target1() > 0;
                    case 1:
                        return shouyi.target2() > 0;
                }
            }).forResult();
            if (chooseButton.bool) {
                const num = Math.floor(Math.random() * 2) + 1;
                game.playAudio('..', 'extension', '银竹离火/audio/card/skills', event.name + num);
                const choices = chooseButton.links;
                if (choices.includes(0)) {
                    await target1.damage(1, 'nocard', player);
                } else if (choices.includes(1)) {
                    await target2.damage(1, 'nocard', player);
                }
            }
        },
        "_priority": -25,
    },
    //红莲紫金冠
    TAF_honglianzijinguan_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: {
            player: "phaseEnd",
        },
        forced: true,
        firstDo: true,
        direct:true,
        filter: function (event, player) {
            const targets = game.filterPlayer(o => o.isAlive() && o !== player && o.countDiscardableCards(player, 'he') > 0);
            return targets.length > 0;
        },
        async content(event, trigger, player) {
            let TXT = setColor("〖红莲紫金冠〗：是否要随机弃置所有其他角色一张牌？其中每有一张基本牌，你摸两张牌；每有一张装备牌，随机一名其他角色失去一点体力；每有一张锦囊牌，随机获得一名其他角色的一张牌。");
            let result = await player.chooseBool(TXT).set('ai', function() {
                return true;//待定
            }).forResult();
            if(result.bool) {
                const num = Math.floor(Math.random() * 2) + 1;
                game.playAudio('..', 'extension', '银竹离火/audio/card/skills', event.name + num);
                const targets = game.filterPlayer(o => o.isAlive() && o !== player && o.countDiscardableCards(player, 'he') > 0);
                let basic = 0;
                let equip = 0;
                let trick = 0;
                if (targets.length > 0) {
                    for (let target of targets) {
                        const cards = target.getDiscardableCards(player, "he");
                        const card = cards[Math.floor(Math.random() * cards.length)];
                        if (card) {
                            await target.discard(card);
                            const type = get.type(card);
                            if (type == "basic") basic++;
                            else if (type == "equip") equip++;
                            else trick++;
                        }
                    }
                }
                while (basic > 0) {
                    basic --;
                    await player.draw(2);
                }
                while (equip > 0) { 
                    equip --;
                    const targets = game.players.filter(o => o.isAlive() && o !== player);
                    const target = targets[Math.floor(Math.random() * targets.length)];
                    if (target) await target.loseHp(1);
                }
                while (trick > 0) {
                    trick --;
                    const targets = game.players.filter(o => o.isAlive() && o !== player && o.countGainableCards(player, "he") > 0);
                    if (targets.length > 0) {
                        const target = targets[Math.floor(Math.random() * targets.length)];
                        const cards = target.getGainableCards(player, "he");
                        const card = cards[Math.floor(Math.random() * cards.length)];
                        if (card) {
                            await target.gain(card, "gain2");
                            game.log(player, "获得了", target, "的一张", card);
                        }
                    }
                }
            }
        },
        "_priority": -25,
    },
    //幽火摄魄令
    TAF_youhuoshepoling_skill: {
        equipSkill: true,
        audio: "ext:银竹离火/audio/card/skills:2",
        trigger: {
            player: "phaseUseEnd",
        },
        forced: true,
        firstDo: true,
        direct:true,
        filter: function (event, player) {
            const targets = game.players.filter(o => o.isAlive() && o !== player);
            return targets.length > 0;
        },
        async content(event, trigger, player) {
            let TXT = setColor("〖幽火摄魄令〗：是否要对所有其他角色随机造成一点⚡或🔥伤害，你回复等同于造成伤害数值的体力？");
            let result = await player.chooseBool(TXT).set('ai', function() {
                return true;//待定
            }).forResult();
            if(result.bool) {
                const num = Math.floor(Math.random() * 2) + 1;
                game.playAudio('..', 'extension', '银竹离火/audio/card/skills', event.name + num);
                const targets = game.players.filter(o => o.isAlive() && o !== player);
                for (let target of targets) {
                    const damagetype = ['fire', 'thunder'];
                    const nature = damagetype[Math.floor(Math.random() * damagetype.length)];
                    await target.damage(1, nature, 'nocard', player);
                }
                let damageHistory = [];
                const globalHistory = _status.globalHistory;
                if (globalHistory.length > 0) {
                    const Evts = globalHistory[globalHistory.length - 1];
                    if (Evts.everything && Evts.everything.length > 0) {
                        for (let evt of Evts.everything) {
                            if (evt.name == "damage") {
                                if (evt.source == player) {
                                    const parent = evt.parent;
                                    if (parent) {
                                        if (parent.name == "TAF_youhuoshepoling_skill") {
                                            if (_status.currentPhase === player) {
                                                if (!damageHistory.includes(evt)) {
                                                    damageHistory.push(evt);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                let damage = 0;
                if (damageHistory.length > 0) {
                    for (let evt of damageHistory) {
                        const num = evt.num;
                        if (num && num > 0) damage += num;
                    }
                }
                if (damage > 0) {
                    await player.recover(damage);
                }
            }
        },
        "_priority": -25,
    },
    //吴起兵法
    icewuqibingfa_sha: {
        equipSkill: true,
        mark: true,
        marktext: "<font color= #AFEEEE>杀</font>",
        onremove: true,
        intro: {
            content: "本回合结束时，将一张牌当【杀】使用！",
            name: "<font color= #AFEEEE>吴起兵法·杀</font>",
        },
        trigger: {
            global: "phaseEnd",
        },
        superCharlotte: true,
        charlotte: true,
        direct: true,
        filter: function (event, player) {
            const cards = player.getCards("hes");
            const EnabledCards = cards.filter(card => lib.filter.cardEnabled(card, player, "forceEnable"));
            if (!EnabledCards || !EnabledCards.length) return false;
            let Vcard_sha = { name: "sha", nature: '', isCard: true };
            return player.hasUseTarget(Vcard_sha,true,false);
        },
        async content(event, trigger, player) {
            const next = player.chooseToUse(true);
            next.set("prompt", "【吴起兵法】：将一张牌当作【杀】使用？");
            /*
            next.set("filterCard", function (card, player) {
                return get.itemtype(card) === 'card' && lib.filter.cardEnabled(card, player, "forceEnable");
            });
            next.set("filterTarget", function (card, player, target) {
                return lib.filter.targetEnabledx(card, player, target) && lib.filter.targetInRange(card, player, target);
            });
            next.set("position", 'hes');
            next.set('viewAs',function (cards, player) {
                return { name: "sha", nature: '', isCard: true, icewuqibingfa_sha: true };
            });
            next.set('check', function (card) {
                return 8 - get.value(card);
            });
            */
            next.set('norestore', true);
            next.set('_backupevent', 'icewuqibingfa_backup');
            next.set('addCount', false);
            next.set('custom', {
                add: {},
                replace: {},
            });
            next.backup('icewuqibingfa_backup');
        },
        "_priority": -25,
    },
    icewuqibingfa_backup:{
        equipSkill: true,
        superCharlotte: true,
        charlotte: true,
        filterCard: function(card, player) {
            return get.itemtype(card) === 'card' && lib.filter.cardEnabled(card, player, "forceEnable");
        },
        position: "hes",
        viewAs: {
            name: "sha",
            nature: "",
            isCard: true,
            icewuqibingfa: true,
        },
        filterTarget: function(card, player, target) {
            return lib.filter.targetEnabledx(card, player, target) && lib.filter.targetInRange(card, player, target);
        },
        check: function(card) {
            return 8 - get.value(card);
        },
        log: false,
        "_priority": -25,
    },
};
export const cardsSkills = Skills;


export const cardstranslate = {
    TAF_fumojingangchu: "金刚伏魔杵",
    TAF_fumojingangchu_info: "　　你使用〖杀〗指定目标后，令其防具无效。你对有防具的角色造成的伤害+1。",
    TAF_feijiangshenweijian: "飞将神威剑",
    TAF_feijiangshenweijian_info: "　　你使用〖杀〗造成伤害时，改为流失体力。每当有角色流失一点体力，你摸一张牌。",
    TAF_wushuangxiuluoji: "无双修罗戟",
    TAF_wushuangxiuluoji_info: "　　你的〖杀〗或〖决斗〗造成伤害后，你可以对受伤目标的一名相邻角色造成一点伤害。",
    TAF_honglianzijinguan: "红莲紫金冠",
    TAF_honglianzijinguan_info: "　　你的回合结束时，你可以随机弃置所有其他角色一张牌。其中每有一张基本牌，你摸两张牌；每有一张装备牌，随机一名其他角色失去一点体力；每有一张锦囊牌，随机获得一名其他角色的一张牌。",
    TAF_youhuoshepoling: "幽火摄魄令",
    TAF_youhuoshepoling_info: "　　出牌阶段结束时，你可以对所有其他角色随机造成一点⚡或🔥伤害，你回复等同于造成伤害数值的体力。",
    thundertenwintenlose:"十胜十败",
    thundertenwintenlose_info:"　　出牌阶段，对自己使用，判定阶段若判定结果在点数十之内，奇数且为♠ / 偶数且为♥，则你须选择一名非郭嘉其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害；无有效目标或判定失败后，移动至下家判定区！",
    icewuqibingfa:"吴起兵法",
    icewuqibingfa_info:"　　当此牌离开你的装备区时，你销毁之；然后你令至多X名角色于本回合结束时将一张牌当〖杀〗使用（X为你的技能数）。",
    TAF_leishan:"雷闪",
    TAF_leishan_info:"　　抵消一张「未被抵消的」伤害牌并获得此牌，然后可选择场上一名有因〖封印〗类buff而失效技能的角色，令其移除此效果。",
    TAF_leishan_remove: "雷闪",
    TAF_daozhuanqiankun:"倒转乾坤",
    TAF_daozhuanqiankun_info:"　　一名角色回合结束时，对所有角色使用(以使用者座次开始依次结算)，生效角色座次发生逆转（至少生效两名角色）。",
    TAF_lunhuizhiyao:"轮回之钥",
    TAF_lunhuizhiyao_info:"　　出牌阶段对一名其他角色使用，可调整其下一个回合的六大阶段顺序。",
    TAF_lunhuizhiyao_phaseZhunbei:"准备阶段",
    TAF_lunhuizhiyao_phaseJudge:"判定阶段",
    TAF_lunhuizhiyao_phaseDraw:"摸牌阶段",
    TAF_lunhuizhiyao_phaseUse:"出牌阶段",
    TAF_lunhuizhiyao_phaseDiscard:"弃牌阶段",
    TAF_lunhuizhiyao_phaseJieshu:"结束阶段",
};
function Translatecolor(translate) {
    for (const key in translate) {
        if (key.endsWith("_info") && typeof translate[key] === "string") {
            translate[key] = setColor(translate[key]);
        }
    }
    return translate;
}
Translatecolor(cardstranslate);