import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import { asyncs } from'../precontent/asyncs.js';
import { oltianshu} from'../precontent/oltianshu.js';
const {
    setColor, delay, getCardSuitNum, getCardNameNum, 
    compareValue, compareOrder, compareUseful, chooseCardsToPile, 
    chooseCardsTodisPile, setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数
const {
    getAliveNum, getFriends, getEnemies,
} = setAI;//银竹离火AI部分函数
const { tenwintenloseAI } = setAI.wei;
const BossEquip1 = ["TAF_fumojingangchu","TAF_feijiangshenweijian","TAF_wushuangxiuluoji"];
const BossEquip5 = ["TAF_youhuoshepoling","TAF_honglianzijinguan"];
/** @type { importCardConfig['skill'] } */
const skills = {
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
                const targets = game.filterPlayer(o => {
                    return o.isAlive() && o.getDisSkills().length > 0 && get.attitude(player, o) > 0;
                });
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
export default skills;