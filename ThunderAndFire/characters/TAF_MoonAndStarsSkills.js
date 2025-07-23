import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import { asyncs } from'../precontent/asyncs.js';
import { oltianshu} from'../precontent/oltianshu.js';
const {
    setColor, delay, getCardSuitNum, getCardNameNum, compareValue, 
    compareOrder, compareUseful, chooseCardsToPile, chooseCardsTodisPile, 
    setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数
const {
    getAliveNum, getFriends, getEnemies,
} = setAI;//银竹离火AI部分函数
const { tenwintenloseAI } = setAI.wei;
const { moonqinyinAI,moonqishiAI,moonshubiAI,moonyingmouAI } = setAI.wu;
const {
    getSuitSymbol, getNumberSymbol, starszhuanzhen, starssixiang,
    useSkillsixiang, starsbazhendialog,
} = asyncs.shu.moon_zhugeliang;//诸葛亮
const 星八阵 = setColor("与「坎丨艮丨震丨巽丨离丨坤丨兑丨乾」点数相同的牌，可以当对应的「无懈丨过河丨铁索丨顺手丨火攻丨南蛮丨无中丨万箭」使用或打出，并可随机获得一张两仪牌然后移除该项。");
const { iceshuijing,iceyinshi } = asyncs.qun.moon_simahui;//司马徽
/** @type { importCharacterConfig['skill'] } */
const TAF_MoonAndStarsSkills = {   
    //司马徽
    iceshuijing: {
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            global: ["useCard"],
        },
        unique: true,
        direct: true,
        onChooseToUse:function(event) {
            if (!game.check() || !lib.config.auto_confirm || !event.dying.length ) {
                const player = event.player;
                let TXT = setColor("〖水镜〗：已记录：");
                const uselist = player.trick_usecard;
                if (uselist && uselist.length > 0) {
                    let names = [];
                    for (let card of uselist) {
                        const name = get.translation(card.name);
                        names.push(name);
                    }
                    TXT += "<br><font color=#AFEEEE>偶数：</font>：" + names.join("、") + "<br>";
                } else {
                    TXT += "<br><font color=#AFEEEE>偶数：</font>：无<br>";
                }
                const beuselist = player.trick_beusecard;
                if (beuselist && beuselist.length > 0) {
                    let names = [];
                    for (let card of beuselist) {
                        const name = get.translation(card.name);
                        names.push(name);
                    }
                    TXT += "<font color=#AFEEEE>奇数：</font>：" + names.join("、") + "<br>";
                } else {
                    TXT += "<font color=#AFEEEE>奇数：</font>：无<br>";
                }
                if (player.hasSkill("iceyinshi")) {
                    const getcolors = iceyinshi(player,'color');
                    if (getcolors.length > 0) {
                        if (getcolors.length === 1) {
                            TXT += "<font color=#AFEEEE>免疫属性伤害：</font>：火";
                        } else {
                            TXT += "<font color=#AFEEEE>免疫属性伤害：</font>：雷";
                        }
                    } else {
                        TXT += "<font color=#AFEEEE>免疫属性伤害：</font>：无";
                    }
                }
                event.prompt = TXT;
            }
        },
        async init(player, skill) {
            const setlist = ["trick"];
            for (const set of setlist) {
                if (!player[set + "_use"]) player[set + "_use"] = 0;
                if (!player[set + "_usecard"]) player[set + "_usecard"] = [];
                if (!player[set + "_beuse"]) player[set + "_beuse"] = 0;
                if (!player[set + "_beusecard"]) player[set + "_beusecard"] = [];
            }
        },
        filter: function (event, player) {
            const cardinfo = get.info(event.card, false);
            if (!cardinfo) return false;
            if (!event.targets || event.targets.length == 0) return false;
            if (cardinfo.type == "trick" || cardinfo.type == "delay") {
                if (event.player === player) return true;
                if (event.player !== player && event.targets.includes(player)) return true;
                return false;
            }
        },
        async content(event, trigger, player) {
            await iceshuijing(event, trigger, player);
        },
        _priority: 0,
    },
    icejianjie: {
        audio: "ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        usable: 1,
        filter: function (event, player) {
            return ui.cardPile.childNodes.length;
        },
        async content(event, trigger, player) {
            const cards = player.getCardsform({ Pile: 'cardPile', field: null }).slice(0, 5);
            if (!cards || cards.length === 0) return;
            const gain = cards.filter(card => get.type(card) === 'trick' || get.type(card) === 'delay');
            if (gain.length > 0) await player.gain(cards,'gain2');
            const giveORthrow = cards.filter(card => !gain.includes(card));
            const target = _status.currentPhase.next;
            const judges = target.getCards('j');
            console.log(target, judges);
            const targets = game.filterPlayer(o => o.isAlive() && o !== player);
            if (giveORthrow.length > 0) {
                await game.cardsGotoOrdering(giveORthrow);
                let TXT_one = setColor("〖荐杰〗：将所有牌按任意顺序置于〖牌堆顶〗！");
                let TXT_middle = setColor("〖荐杰〗：将所有牌交予一名其他角色！");
                let TXT_two = setColor("〖荐杰〗：将所有牌按任意顺序置于〖牌堆底〗！");
                const result = await player.chooseToMove("〖荐杰〗",true).set("list", [
                    [TXT_one, []],[TXT_middle, giveORthrow],[TXT_two, []]
                ]).set("filterMove", (from, to, moved) => {
                    return true;
                }).set('filterOk', (moved) => {
                    return moved[0].length === giveORthrow.length || moved[1].length === giveORthrow.length || moved[2].length === giveORthrow.length;
                }).set("processAI", (list) => {
                    let cards = list[1][1];
                    const target = _status.currentPhase.next;
                    const judges = target.getCards('j');
                    if (judges.length) {
                        if (get.attitude(player, target) >= 2) {
                            const cheats = setjudgesResult(judges,cards,player,false);//令判定牌失效的卡牌
                            const 排序剩余卡片= cards.filter(card => !cheats.includes(card)).sort((a, b) => get.value(b, player) - get.value(a, player));
                            return [cheats.concat(排序剩余卡片), [], []];
                        } else {
                            const cheats = setjudgesResult(judges,cards,player,true);//令判定牌生效的卡牌
                            const 排序剩余卡片= cards.filter(card => !cheats.includes(card)).sort((a, b) => get.value(a, player) - get.value(a, player));
                            return [cheats.concat(排序剩余卡片), [], []];
                        }
                    } else {
                        const friends = targets.filter(o => get.attitude(player, o) >= 2);
                        if (friends && friends.length > 0) {
                            return [[], cards, []];
                        } else {
                            const 不能放牌堆顶 = cards.some(card => {
                                const value = get.value(card, player);
                                return value >= compareValue(player, 'tao');
                            });
                            if(不能放牌堆顶) {
                                return [[], [], cards];
                            } else {
                                const 排序cards = cards.sort((a, b) => get.value(a,player) - get.value(b, player));
                                return [排序cards, [], []];
                            }
                        }
                    }
                }).set('forced', true).forResult();
                if (result.bool) {
                    const topcards = result.moved[0];
                    const midcards = result.moved[1];
                    const bottomcards = result.moved[2];
                    if (topcards.length > 0) await player.chooseCardsToPile(topcards,'top');
                    if (bottomcards.length > 0) await player.chooseCardsToPile(bottomcards,'bottom');
                    if (midcards.length > 0) {
                        if (!targets || targets.length === 0) {
                            await player.loseToDiscardpile(midcards)
                        } else {
                            const prompt = setColor("〖荐杰〗：请选择一名其他角色将所有牌交予其");
                            const result = await player.chooseTarget(prompt, function (card, player, target) {
                                return targets.includes(target);
                            }).set('ai', function (target) {
                                const friends = targets.filter(o => get.attitude(player, o) >= 2).sort((a, b) => {
                                    if (a.getCards('h').length !== b.getCards('h').length) return a.getCards('he').length - b.getCards('he').length;
                                    return a.hp - b.hp;
                                });
                                if (friends && friends.length > 0) {
                                    return target === friends[0];
                                } else {
                                    return target === targets.randomGet();
                                }
                            }).set('forced', true).forResult();
                            if (result.bool) {
                                const target = result.targets[0];
                                await target.gain(midcards,'gain2');
                                await target.chooseToDiscard(midcards.length, 'he', true);
                                await target.draw(2);
                            }
                        }
                    }
                }
            }
        },
        ai: {
            threaten: 1,
            order: 13,
            result:{
                player:1,
            },
        },
        "_priority": 0,
    },
    iceyinshi: {
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= #AFEEEE>隐士</font>",
        intro: {
            onunmark: true,
            name: "",
        },
        trigger: {
            player: ["damageBefore"],
            global: ["useCardBefore"],
        },
        unique: true,
        locked: true,
        direct: true,
        async init(player, skill) {
            const getcolors = iceyinshi(player,'color');
            if (getcolors.length > 0) {
                if (getcolors.length === 1) {
                    lib.skill.iceyinshi.intro.name = "<font color= #AFEEEE>同色</font>";
                } else {
                    lib.skill.iceyinshi.intro.name = "<font color= #AFEEEE>异色</font>";
                }
            } else {
                lib.skill.iceyinshi.intro.name = "<font color= #AFEEEE>无色</font>";
            }
        },
        filter: function (event, player, name) {
            if (name === "damageBefore") {
                if (!event.source) return false;
                const getcolors = iceyinshi(player,'color');
                if (getcolors.length > 0) {
                    if (getcolors.length === 1) return event.hasNature("fire");
                    else return event.hasNature("thunder");
                }
            } else {
                const cardname = event.card.name;
                const targets = event.targets;
                if (!cardname || !targets) return false;
                if (event.player === player) return false;
                const getnames = iceyinshi(player,'name');
                if (getnames.includes(cardname)) return true;
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "damageBefore") {
                player.logSkill(event.name);
                trigger.cancel();
                const getcolors = iceyinshi(player,'color');
                if (getcolors.length > 0) {
                    if (getcolors.length === 1) {
                        game.log(trigger.source, "使用", trigger.card, "，对", player, "造成的伤害无效！");
                        await player.gainCardsColors(2);
                    } else {
                        game.log(trigger.source, "使用", trigger.card, "，对", player, "造成的伤害无效！");
                        const color = getcolors[Math.floor(Math.random() * getcolors.length)];
                        await player.specifyCards(color, 2);
                    }
                }
            } else {
                const targets = trigger.targets;
                player.logSkill(event.name);
                if (targets.includes(player)) {
                    targets.splice(targets.indexOf(player), 1);
                    game.log(trigger.player, "使用", trigger.card, "，对", player, "无效！");
                }
                const card = trigger.card;
                const namenums = getCardNameNum(card);
                await player.gainCardsNumbers(namenums);
            }
        },
        ai:{
            effect:{
                target:function(card, player, target) {
                    const getcolors = iceyinshi(target,'color');
                    if (getcolors.length > 0) {
                        if (getcolors.length === 1) {
                            if (get.tag(card, "fireDamage")) {
                                if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                                return [0, 2];
                            }
                        } else {
                            if (get.tag(card, "thunderDamage")) {
                                if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                                return [0, 2];
                            }
                        }
                    } 
                    const getnames = iceyinshi(target,'name');
                    if (getnames.length > 0 && card.name) {
                        if (player !== target) {
                            if (getnames.includes(card.name)) return [0, 1];
                        } else {
                            if (getnames.includes(card.name)) return [1, 1];
                        }
                    }
                },
            },
        },
        _priority: 521,
    },
    //郭嘉
    thunderqizuo: {
        mod: {
            cardnumber:function(card, player, num) {
                if (card.number > 10) return 10;
            },
            maxHandcard: function (player, num) {
                let totalJudges = game.players.reduce(function(sum, o) {
                    return sum + o.countCards('j');
                }, 0);
                if (totalJudges > 4) totalJudges = 4;
                return num + totalJudges;
            },
        },
        audio:"ext:银竹离火/audio/skill:4",
        trigger: {
                global:["roundStart","loseAfter","loseAsyncAfter","cardsDiscardAfter","equipAfter"],
        },
        unique: true,
        locked: true,
        direct: true,
        async init(player, skill) {
            let checkcards = [];
            const piles = ["cardPile", "discardPile"];
            for (let pile of piles) {
                if (!ui[pile]) continue;
                const cards = ui[pile].childNodes;
                for (let card of cards) {
                    const name =  card.name;
                    if (name === "thundertenwintenlose" && !checkcards.includes(card)) {
                        checkcards.push(card);
                    }
                }
            }
            if (checkcards.length >= 10) return;
            let addcards = [];
            for (let i = 1; i <= 10; i++) {
                addcards.push(game.createCard2("thundertenwintenlose", i % 2 ? "spade" : "heart", i));
            }
            game.broadcastAll(function() {
                lib.inpile.add("thundertenwintenlose");
            });
            game.cardsGotoPile(addcards, function() {
                return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
            });
            game.updateRoundNumber();
            player.logSkill(skill);
            game.log(player, "将", addcards, "置入了牌堆");
        },
        filter: function(event, player, name) {
            if (name === 'roundStart') {
                return !player.isDisabledJudge() && player.canAddJudge("thundertenwintenlose");
            } else if (name === 'loseAfter' || name === 'loseAsyncAfter' || name === 'cardsDiscardAfter' || name === 'equipAfter') {
                let cards = event.getd();
                return cards.some(card => card.name === "thundertenwintenlose");
            }
            return false;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if  (Time === 'roundStart') { 
                const cards = await player.specifyCards('thundertenwintenlose');
                if(cards && cards.length > 0 && player.canAddJudge("thundertenwintenlose")){
                    player.logSkill(event.name);
                    await player.addJudge(cards[0]);
                }
            } else {
                let cards = trigger.getd();
                let count = cards.filter(card => card.name === "thundertenwintenlose").length;
                if(count && count > 0){
                    player.logSkill(event.name);
                    await player.draw(count);
                }
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
        },            
        _priority: 0
    },
    thunderlunshi: {
        audio:"ext:银竹离火/audio/skill:4",
        marktext: "<font color= #0088CC>论势</font>",
        onremove: true,
        intro: {
            content: function(storage, player) {
                const nummark = player.countMark('thunderlunshi'); 
                return '「论势」已发动次数为' + nummark;
            },
            name: "<font color= #0088CC>论势</font>",
        },
        trigger: {
                player:["damageEnd"],
                global:["judgeEnd"],
        },
        unique: true,
        locked: false,
        direct: true,
        async init(player, skill) {
            player.storage.lunshijudge = false;
        },
        changeSkins: async function (player) {
            const names = ["moon_guojia", "moon_guojia1", "moon_guojia2"];
            if (!changeSkinskey) return;
            const skinsID = player.checkSkins();
            if (!names.includes(skinsID)) return;
            if (skinsID === "moon_guojia" || skinsID === "moon_guojia1") player.changeSkins(2);
            if (skinsID === "moon_guojia2") player.changeSkins(1);
            //const changeSkins = get.info(event.name).changeSkins;
        },
        filter: function (event, player, name) {
            if (name === 'judgeEnd') {
                if (event.player === player) return false;
                const suit = get.suit(event.result);
                const number = get.number(event.result);
                const isSpecialCondition = 
                    (suit === "spade" && number > 0 && number < 11 && number % 2 !== 0) || 
                    (suit === "heart" && number > 0 && number < 11 && number % 2 === 0);
                if (isSpecialCondition) return false;
                return true; 
            } else if (name === 'damageEnd') {
                return event.num > 0 && player.storage.lunshijudge;
            }
        },
        lunshijudge: async function (player) {
            const changeSkins = get.info('thunderlunshi').changeSkins;
            await changeSkins(player);
            if (!player.storage.lunshijudge) {
                player.addMark("thunderlunshi", 1);
                if (player.countMark('thunderlunshi') >= 3) {
                    player.storage.lunshijudge = true;
                    player.clearMark('thunderlunshi');
                    player.unmarkSkill('thunderlunshi');
                    if (!player.hasSkill('thunderyiji')) player.addSkill('thunderyiji');
                    player.update();
                }
            }
            const result = await player.judge(function (card) {
                const suit = get.suit(card);
                const number = get.number(card);
                if ((suit === "spade" && number > 0 && number < 11 && number % 2 !== 0) || 
                    (suit === "heart" && number > 0 && number < 11 && number % 2 === 0)) {
                    return 5;
                } else {
                    return -5;
                }
            }).forResult();
            return result.bool;
        },
        derivation: ["thunderyiji"],
        async content(event, trigger, player) {
            const prompt0 = setColor("〖十胜十败〗，判定结果非点数十之内的，奇数且为♠ / 偶数且为♥，判定失败，", player,'执行','#g【论势二】！');
            const prompt1 = setColor("〖十胜十败〗，判定结果为点数十之内的，奇数且为♠ / 偶数且为♥，判定生效，且有有效目标！", player,'执行','#g【十胜十败】','生效效果！');
            const prompt2 = setColor("〖十胜十败〗，判定结果为点数十之内的，奇数且为♠ / 偶数且为♥，判定生效，但无有效目标！", player,'无可执行项！');
            const prompt3 = setColor("请选择一名非郭嘉的其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害！");
            let count = trigger.num || 1;
            const lunshijudge = lib.skill.thunderlunshi.lunshijudge;
            while (count > 0) {
                count--;
                const judgeResult = await lunshijudge(player);
                await delay(1000);
                if (judgeResult) {
                    const targets = game.filterPlayer(function (current) {
                        return !lib.translate[current.name].includes("郭嘉") && current.isAlive() && current !== player;
                    });
                    if (!targets || targets.length === 0) { 
                        game.log(prompt2);
                    } else {
                        game.log(prompt1);
                        const result = await player.chooseTarget(prompt3, true, function (card, player, target) {
                            return targets.includes(target);
                        }).set('ai', function (target) {
                            return target === tenwintenloseAI(player);
                        }).forResult();
                        if (result.bool) {
                            const target = result.targets[0];
                            player.logSkill(event.name,target);
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
                    const weiPlayer = game.filterPlayer(o => o.isAlive() && o.group === 'wei');
                    const numchoose = Math.max(1, weiPlayer.length);
                    const numdraw = Math.max(1, player.getDamagedHp());
                    const result = await player.chooseTarget("请选择至多"+ get.cnNumber(numchoose) +"名角色令其各摸"+ get.cnNumber(numdraw) +"张牌！", [1, numchoose], function (card, player, target) {
                        return true;
                    }).set('ai', function (target) {
                        const friends = getFriends(player);
                        if (friends.includes(target)) return 1;
                        else return 0;
                    }).forResult();
                    if (result.bool) {
                        const targets = result.targets;
                        player.logSkill(event.name,targets);
                        if (targets.length > 0) {
                            for (let target of targets) {
                                player.line(target, 'thunder');
                                await target.draw(numdraw);
                            }
                        }
                    }
                }
                const changeSkins = get.info('thunderlunshi').changeSkins;
                await changeSkins(player);
            }
        },
        ai:{
            maixie:true,
            "maixie_hp":true,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                const num = tenwintenloseAI(player, "resultAI");
                if (att < 2) {
                    if (!player.storage.lunshijudge) {
                        return Math.min(1.5, num);
                    } else {
                        return Math.max(1.5, num);
                    }
                } else {
                    return 0.5;
                }
            },
            effect:{
                target:function(card, player, target) {
                    if (get.tag(card, "damage") && target.storage.lunshijudge) {
                        const numlive = target.hp + target.countCards('h', { name: ['tao', 'jiu'] }) - get.tag(card, "damage");
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        if (numlive <= 1) return;
                        return [1, tenwintenloseAI(target, "resultAI")];
                    }
                },
            },
        },            
        _priority: 0
    },
    thunderjiding: {
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        limited:true,
        skillAnimation: true,
        animationColor:"thunder",
        async init(player) {
            player.storage.thunderjiding = false;
        },
        intro:{
            content:"limited",
        },
        trigger: {
            player: "die",
        },
        persevereSkill: true,
        unique: true,
        forced: true,
        locked: true,
        forceDie:true,
        direct: true,
        filter: function(event, player) {
            if (player.storage.thunderjiding) return false;
            return true;
        },
        async content(event, trigger, player) {
            let result = await player.chooseTarget(get.prompt2("thunderjiding"), function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                const player = _status.event.player;
                return get.attitude(player, target) >= 2;
            }).forResult();
            if(result.bool){
                player.logSkill(event.name);
                player.awakenSkill(event.name);
                player.storage.thunderjiding = true;
                const target = result.targets[0];
                target.gainMaxHp();
                target.recover();
                const cards = player.getCards("hesj");
                if (cards && cards.length) {
                    target.gain(cards, player);
                    player.$giveAuto(cards, target);
                }
                target.addSkill("thunderyiji");
            }
        },
        _priority: 0
    },
    thunderyiji: {
        audio: "ext:银竹离火/audio/skill:4",
        enable: ["chooseToUse", "chooseToRespond"],
        unique: true,
        locked: false,
        filter: function (event, player) {
            const cards = player.getCards("hes").filter(o => get.name(o,player) === "thundertenwintenlose");
            if  (!cards || cards.length === 0) return false;
            const filter = event.filterCard;
            const natures = lib.inpile_nature || [];
            const names = lib.inpile || [];
            for (let name of names) {
                const type = get.type(name);
                if (type === "basic") {
                    if (name === "sha") {
                        if (filter(get.autoViewAs({ name: name, nature: "" }, "unsure"), player, event)) return true;
                        for (let nature of natures) {
                            if (filter(get.autoViewAs({ name: name, nature: nature }, "unsure"), player, event)) return true;
                        }
                    } else {
                        if (filter(get.autoViewAs({ name: name, nature: "" }, "unsure"), player, event)) return true;
                    }
                } else if (type === "trick") {
                    if (filter(get.autoViewAs({ name: name, nature: "" }, "unsure"), player, event)) return true;
                }
            }
            return false;
        },
        chooseButton: {
            dialog: function (event, player) {
                const TXT = setColor("〖遗计〗：请选择视为使用或打出的牌：");
                const filter = event.filterCard;
                const natures = lib.inpile_nature || [];
                const names = lib.inpile || [];
                let list = [];
                for (let name of names) {
                    const type = get.type(name);
                    if (type === "basic") {
                        if (name === "sha") {
                            if (filter(get.autoViewAs({ name: name, nature: "" }, "unsure"), player, event)) list.push(["basic", '', name]);
                            for (let nature of natures) {
                                if (filter(get.autoViewAs({ name: name, nature: nature }, "unsure"), player, event)) list.push(["basic", '', name, nature]);
                            }
                        } else {
                            if (filter(get.autoViewAs({ name: name, nature: "" }, "unsure"), player, event)) list.push(["basic", '', name]);
                        }
                    } else if (type === "trick") {
                        if (filter(get.autoViewAs({ name: name, nature: "" }, "unsure"), player, event)) list.push(["trick", '', name]);
                    }
                }
                if (list.length == 0) return;
                return ui.create.dialog(TXT, [list, "vcard"]);
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
                    const setCards = canUselist.sort((a, b) => player.getUseValue(b) - player.getUseValue(a));
                    return button.link[2] == setCards[0].name && button.link[3] == setCards[0].nature;
                }
            },
            backup: function (links, player) {
                return {
                    audio: "thunderyiji",
                    popname: true,
                    filterCard: function (card) {
                        return card.name === 'thundertenwintenlose';
                    },
                    selectCard: 1,
                    position: "hes",
                    viewAs: { 
                        name: links[0][2], 
                        nature: links[0][3],
                        isCard: true,
                        thunderyiji: true,
                    },
                    precontent: async function () {

                    },
                    onrespond: function () {
                        return this.onuse.apply(this, arguments);
                    },
                    onuse: async function (result) {
                        const card = result.cards[0];
                        if (card) {
                            await player.draw(1);
                        }
                    }
                };
            },
            prompt: function (links, player) {
                return "将一张〖<font color= #0088CC>十胜十败</font>〗当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用或打出，且摸一张牌。";
            },
        },
        hiddenCard: function (player, name) {
            if (!lib.inpile.includes(name)) return false;
            const cards = player.getCards("hes").filter(o => get.name(o,player) === "thundertenwintenlose");
            for ( let i of lib.inpile) {
                if (name == i) {
                    return cards.length > 0;
                }
            }
        },
        ai:{
            expose: 0.2,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
            respondSha: true,
            respondShan: true,
            recover: true,
            save: true,
            respondTao: true,
            tag: {
                recover: 1,
                save: 1,
                gain: 1
            },
            skillTagFilter: function (player, tag, arg) {
                const cards = player.getCards("hes").filter(o => get.name(o,player) === "thundertenwintenlose");
                if (!cards || cards.length === 0) return false;
                return true;
            },
            order: function (item, player) {
                let order = 0;
                let addorder = 0;

                const targets = _status.dying;
                if (targets && targets.length > 0) {
                    const target = targets[0];
                    const att = get.attitude(player, target);
                    if (att >= 2) {
                        addorder += 10;
                    }
                }
                if (player && _status.event.type == "phase") {
                    const natures = lib.inpile_nature || [];
                    const names = lib.inpile || [];
                    const cards = player.getCards("hes").filter(o => get.name(o,player) === "thundertenwintenlose");
                    if  (!cards || cards.length === 0) return order;
                    let canUselist = [];
                    for (let name of names) {
                        const type = get.type(name);
                        let Vcard = {name: name, nature: '', isCard: true};
                        if (type === "basic") {
                            if (name == "sha") {
                                if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                    canUselist.push(Vcard);
                                }
                                for (let nature of natures) {
                                    Vcard.nature = nature;
                                    if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                        canUselist.push(Vcard);
                                    }
                                }
                            } else {
                                if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                    canUselist.push(Vcard);
                                }
                            }
                        }
                        if (type === "trick") {
                            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                canUselist.push(Vcard);
                            }
                        }
                    }
                    if (!canUselist || canUselist.length == 0) return order;
                    let ordernumlist = [];
                    for (let Vcard of canUselist) {
                        const Vorder = get.order(Vcard);
                        if (Vorder && Vorder > order && !ordernumlist.includes(Vorder)) {
                            ordernumlist.push(Vorder);
                        }
                    }
                    if (!ordernumlist || ordernumlist.length == 0) return order;
                    const maxVorder = Math.max(...ordernumlist) + 1;
                    return Math.max(maxVorder, 3.5);
                }
                return 3.5;
            },
            result: {
                player: function (player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    /**
                     * 回合内，郭嘉如果状态良好，则优先将十胜十败置于判定区，因为郭嘉有【奇佐】，其他人获得此技能正常用
                     * 此遗计技能的result 联动【十胜十败】卡牌设定的order参数 而 设定逻辑输出值
                     * 其他玩家想参考 不太适合if (_status.currentPhase === player) {}的输出值的。
                     */
                    if (_status.currentPhase === player) {
                        let Vcard = {name: "thundertenwintenlose", nature: '', isCard: true};
                        const num1 = get.order(Vcard, player)
                        const num2 = lib.skill.thunderyiji.ai.order("thunderyiji", player);
                        return num2 - num1;
                    }
                    return 1;
                },
            },
        },
    },
    //诸葛亮
    starszhuanzhen:{
        audio: "ext:银竹离火/audio/skill:1",       
        trigger:{
            player:["starsliangyiAfter","starssixiangAfter","useCardAfter"],
            global:["gameStart", "roundStart", "phaseBefore","logSkillBefore","phaseChange","chooseToUseBefore","useCardBefore"],//这个全局单纯是换肤设定没什么用！
        },
        persevereSkill:true,
        superCharlotte: true,
        charlotte: true,
        unique:true,
        fixed: true,
        direct:true,
        async init(player, skill) {
            await starszhuanzhen(player);
            player.logSkill(skill);
        },
        zhuanzhen: async function(player, choice) {
            let prompt = "";
            if (choice === 'starsliangyi') {
                prompt = setColor("〖两仪·转阵〗：是否要失去一点体力进行转阵？");
            } else if (choice ==='starssixiang') {
                prompt = setColor("〖四象·转阵〗：是否要回复一点体力进行转阵？");
            } else if (choice ==='starsbazhen') {
                const recordnum = player.starsbazhen_choicenum;
                const recordnumlist = player.starsbazhen_usednum;
                if (recordnum % 7 !== 0 || recordnumlist.includes(recordnum)) return;
                prompt = setColor("〖八阵·转阵〗：是否要失去一点体力进行转阵,并不可再以") + get.cnNumber(recordnum) + setColor("点，进行转阵？");
            }
            const result = await player.chooseBool(prompt).set('ai', function() {
                const bazhen = starszhuanzhen(player, 'starsbazhen');
                const tricks = starsbazhendialog(player);
                const cards = player.getCards("hes");
                if (choice === 'starsliangyi' || choice === 'starsbazhen') {
                    if (bazhen.length <= 4 || tricks.length === 0) {
                        return cards.length >= Math.max(player.maxHp,3) && getAliveNum(player,1);;
                    }
                    return false;
                } else if (choice === 'starssixiang') {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                player.logSkill("starszhuanzhen");
                if (choice === 'starsliangyi') {
                    game.log(player, '选择了', '#g【两仪·转阵】');
                    await player.loseHp(1);
                } else if (choice ==='starssixiang') {
                    game.log(player, '选择了', '#g【四象·转阵】');
                    await player.recover();
                } else if (choice ==='starsbazhen') {
                    const recordnum = player.starsbazhen_choicenum;
                    player.starsbazhen_usednum.push(recordnum);
                    game.log(player, '选择了', '#g【八阵·转阵】', '并记录了点数', recordnum);
                    await player.loseHp(1);
                }
                player.starsbazhen_choicenum = 0;
                await starszhuanzhen(player);
            } else {
                game.log(player,'取消了', '#g【转阵】', '！')
            }
        },
        filter:function(event, player, name) {
            if (name ==='useCardAfter') {
                const card = event.card;
                if (!card) return false;
                const cards = event.cards;
                if (!cards || cards.length === 0) return false;
                const key = card.starsbazhen;
                return key && key === true;
            } else if (name ==='starsliangyiAfter' || name ==='starssixiangAfter') {
                const skills =['starsliangyi','starssixiang'];
                for (let skill of skills) {
                    if (name === skill + 'After') {
                        const combination = starszhuanzhen(player, skill);
                        return combination && combination.length === 0;
                    }
                }
            } else {
                return true;//这个全局单纯是换肤设定没什么用！
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const zhuanzhen = lib.skill.starszhuanzhen.zhuanzhen;
            if (Time ==='useCardAfter') {
                const cards = trigger.cards;
                const number = get.number(cards[0]);//使用的实体卡牌的点数
                player.starsbazhen_choicenum += number;
                const recordnum = player.starsbazhen_choicenum;
                const recordnumlist = player.starsbazhen_usednum;
                if (recordnum % 7 !== 0 || recordnumlist.includes(recordnum)) return;
                await zhuanzhen(player,'starsbazhen');
            } else if (Time ==='starsliangyiAfter' || Time ==='starssixiangAfter') {
                const skills =['starsliangyi','starssixiang'];
                for (let skill of skills) {
                    if (Time === skill + 'After') {
                        const combination = starszhuanzhen(player, skill);
                        if (combination && combination.length === 0) {
                            await zhuanzhen(player, skill);
                        }
                    }
                }
            } else {
                /**
                 * 丞相丞相  汉室衰微啊！切换皮肤哈哈
                 */
                const skinsID = player.checkSkins();
                const lists1 = starszhuanzhen(player, 'starsliangyi');
                const lists2 = starszhuanzhen(player, 'starssixiang');
                const lists3 = starszhuanzhen(player, 'starsbazhen');
                if (lists1.length > 1 && lists2.length > 2 && lists3.length > 4) {
                    if (skinsID === 'moon_zhugeliang' || skinsID === 'moon_zhugeliang2'){
                        player.changeSkins(1);
                    }
                } else {
                    if (skinsID === 'moon_zhugeliang' || skinsID === 'moon_zhugeliang1'){
                        player.changeSkins(2);
                    }
                }
            }
        },
        "_priority":Infinity,
    },
    starsliangyi:{
        audio:"ext:银竹离火/audio/skill:4",
        mark:true,
        marktext:"<font color= #EE9A00>两仪</font>",
        intro:{
            name:"<font color= #EE9A00>两仪</font>",
            mark:function (dialog, storage, player) {
                const list = starszhuanzhen(player, 'starsliangyi');
                if (list && Array.isArray(list) && list.length > 0) {
                    const formattedList = list.map(([suit, number]) => {
                        const color = (suit === 'heart' || suit === 'diamond') ? '#FF2400' : '#00FFFF';
                        const symbol = getSuitSymbol(suit) + getNumberSymbol(number);
                        return `<font color="${color}">${symbol}</font>`;
                    });
                    const result = formattedList.join('　<font color= #EE9A00>☯</font>　');
                    dialog.addText(result);
                } else {
                    dialog.addText("<font color= #EE9A00>鞠躬尽瘁，死而后已！</font>");
                }
            },
            markcount:function (storage, player) {
                const list = starszhuanzhen(player, 'starsliangyi');
                if (list && Array.isArray(list) && list.length > 0) return list.length;
                return 0;
            },
        },
        trigger:{
            global: ["loseAfter","loseAsyncAfter","cardsDiscardAfter","equipAfter"],
        },
        persevereSkill: true,
        unique: true,
        forced: false,
        locked: false,
        direct:true,
        filter:function (event, player) {
            if(!player.hasSkill('starszhuanzhen')) return false;
            if(!player.hasSkill('starsbazhen')) return false;
            const cards = event.getd();
            if (!cards || cards.length === 0) return false;
            const bazhenlist = starszhuanzhen(player, 'starsbazhen');
            if (!bazhenlist || !Array.isArray(bazhenlist) || bazhenlist.length === 0) return false;
            const liangyilist = starszhuanzhen(player, 'starsliangyi');
            if (!liangyilist || !Array.isArray(liangyilist) || liangyilist.length === 0) return false;
            for (let card of cards) {
                if (liangyilist.length === 1) {
                    if (get.suit(card) == liangyilist[0][0] && get.number(card) == liangyilist[0][1]) return true;
                    return false;
                } else if (liangyilist.length === 2) {
                    if(get.suit(card) == liangyilist[0][0] && get.number(card) == liangyilist[0][1]) return true;
                    if(get.suit(card) == liangyilist[1][0] && get.number(card) == liangyilist[1][1]) return true;
                    return false;
                } else {
                    return false;
                }
            }
        },
        liangyi : async function(player, num, from) {
            let list = [];
            const cardstop = get.cards(num);
            const cardsbottom = get.bottomCards(num);
            let TXT = setColor("");
            let setcards = [];
            if (from === 'top') {
                TXT = setColor("〖两仪·牌堆顶〗：选择至多两张与〖八阵〗记录点数相同的牌。");
                setcards = cardstop;
            } else if (from === 'bottom') {
                TXT = setColor("〖两仪·牌堆低〗：选择至多两张与〖八阵〗记录点数不同的牌。");
                setcards = cardsbottom;
            }
            game.cardsGotoOrdering(setcards);
            const result = await player.chooseCardButton(
                TXT, setcards, [1, 2]
            ).set("filterButton", function(button) {
                const bazhenlist = starszhuanzhen(player, 'starsbazhen');
                const numberlist = bazhenlist.map(item => item[1]);
                const num = get.number(button.link);
                if (from === 'top') {
                    return numberlist.includes(num);
                } else if (from === 'bottom') {
                    return !numberlist.includes(num);
                }
            }).set("ai", function(button) {
                return get.value(button.link);
            }).forResult();
            if (result.bool) {
                if (from === 'top') {
                    player.StarsLYMark = player.StarsLYMark.filter(item => item[0] !== 'heart' && item[0] !== 'diamond');
                } else if (from === 'bottom') {
                    player.StarsLYMark = player.StarsLYMark.filter(item => item[0] !== 'spade' && item[0] !== 'club');
                }
                player.markSkill("starsliangyi");
                list = result.links;
            }
            return list;
        },
        async content(event, trigger, player) {
            const cards = trigger.getd();
            const liangyilist = starszhuanzhen(player, 'starsliangyi');
            let Blackcount = 0;
            let Redcount = 0;
            for (let card of cards) {
                if (liangyilist.length === 1) {
                    if (get.suit(card) == liangyilist[0][0] && get.number(card) == liangyilist[0][1]) {
                        const color = get.color(card);
                        if (color == 'black') Blackcount ++;
                        if (color =='red') Redcount ++;
                    }
                } else if (liangyilist.length === 2) {
                    if(get.suit(card) == liangyilist[0][0] && get.number(card) == liangyilist[0][1]) Blackcount ++;
                    if(get.suit(card) == liangyilist[1][0] && get.number(card) == liangyilist[1][1]) Redcount ++;
                }
            }
            while (Blackcount > 0 || Redcount > 0) {
                const bazhenlist = starszhuanzhen(player, 'starsbazhen');
                const liangyi = lib.skill.starsliangyi.liangyi;
                if (Blackcount > 0) {
                    Blackcount = 0;
                    const cards = await liangyi(player, bazhenlist.length ,'bottom');
                    if (cards && cards.length > 0) {
                        player.logSkill(event.name);
                        await player.gain(cards, 'gain2');
                        game.washCard();
                    }
                }
                if (Redcount > 0) {
                    Redcount = 0;
                    const cards = await liangyi(player, bazhenlist.length ,'top');
                    if (cards && cards.length > 0) {
                        player.logSkill(event.name);
                        await player.gain(cards, 'gain2');
                        game.washCard();
                    }
                }
            }
        },
        "_priority":1314,
    },
    starssixiang:{
        audio:"ext:银竹离火/audio/skill:4",
        mark:true,
        marktext:"<font color= #EE9A00>四象</font>",
        intro:{
            name:"<font color= #EE9A00>四象</font>",
            mark:function(dialog, storage, player) {
                const list = starszhuanzhen(player, 'starssixiang');
                if (list && Array.isArray(list) && list.length > 0) {
                    const symbols = list.map(([suit, number]) => ({
                        symbol: `${getSuitSymbol(suit)}${getNumberSymbol(number)}`,
                        color: (suit === 'heart' || suit === 'diamond') ? '#FF2400' : '#00FFFF'
                    }));
                    dialog.content.style["overflow-x"] = "visible";
                    const core = document.createElement("div");
                    core.style.width = "0";
                    core.style.position = "relative";
                    const centerX = -15;
                    const centerY = 45;
                    const radius = 45;
                    const positions = symbols.map((_, index) => {
                        const angle = (index * 360 / symbols.length - 90) * (Math.PI / 180);
                        return {
                            x: centerX + radius * Math.cos(angle),
                            y: centerY + radius * Math.sin(angle)
                        };
                    });
                    positions.forEach((pos, index) => {
                        const { symbol, color } = symbols[index];
                        core.innerHTML += `
                            <div style="position: absolute; left: ${pos.x}px; top: ${pos.y}px; text-align: center;">
                                <font color="${color}">${symbol}</font>
                            </div>
                        `;
                    });
                    dialog.content.appendChild(core);
                } else {
                    dialog.addText("<font color= #EE9A00>鞠躬尽瘁，死而后已！</font>");
                }
            },
            markcount:function(storage, player) {
                const list = starszhuanzhen(player, 'starssixiang');
                if (list && Array.isArray(list) && list.length > 0) return list.length;
                return 0;
            },
        },
        trigger:{
            player:"dyingAfter",
            global:"damageBefore",
        },
        unique: true,
        locked: false,
        direct:true,
        async init(player, skill) {
            if (!player.storage.starssixiang_dyingAfter) player.storage.starssixiang_dyingAfter === false;
        },
        filter:function (event, player, name) {
            if(!player.hasSkill('starszhuanzhen')) return false;
            if (name === "dyingAfter") {
                return !player.storage.starssixiang_dyingAfter;
            } else {
                if (!event.source) return false;
                if (!event.num || event.num <= 0) return false;
                const shuPlayer = game.filterPlayer(function (current) {
                    return current.group == 'shu' && current !== player;
                });
                const target = event.player;
                const object = starssixiang(player, target, 'getSkill');
                if (!object && typeof object !== 'object') return false;
                if (!object.canget) return false;
                if(target === player){
                    return shuPlayer.length > 0 || player.storage.starssixiang_dyingAfter;
                } else {
                    return true;
                }
            }
        },
        derivation: ['starsxuanwu','starsqinglong','starszhuque','starsbaihu'],
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'dyingAfter') {
                player.logSkill(event.name);
                player.storage.starssixiang_dyingAfter = true;
            } else{
                const target = trigger.player;
                const object = await useSkillsixiang(player, target);
                const skillslist = Object.keys(object);
                if (!skillslist || skillslist.length === 0) return;
                for (let skill of skillslist) {
                    const list = object[skill];
                    if (list && Array.isArray(list) && list.length > 0) {
                        const suit = list[0];
                        const number = list[1];
                        if (suit && number) {
                            await target.specifyCards({ suit: suit, number: number });
                        }
                    }
                    if (skill === 'starsxuanwu') {
                        game.log(target, '获得了技能', '#g【玄武】', '！');
                    } else if (skill === 'starsqinglong') {
                        game.log(target, '获得了技能', '#g【青龙】', '！');
                    } else if (skill === 'starszhuque') {
                        game.log(target, '获得了技能', '#g【朱雀】', '！');
                    } else if (skill === 'starsbaihu') {
                        game.log(target, '获得了技能', '#g【白虎】', '！');
                    }
                    if (!target.hasSkill(skill)) target.addSkill(skill);
                    if (!target.hasSkill('starssixiang_SX')) target.addSkill('starssixiang_SX');
                    target.markSkill('starssixiang_SX');
                }
            }
        },
        subSkill: {
            SX: {
                mark: true,
                marktext: "<font color= #EE9A00>象技</font>",
                onremove: true,
                intro: {
                    content: function (storage, player) {
                        let result = "";
                        if (player.starsxuanwu) {
                            result += "<font color= #EE9A00>玄武</font>:受到的伤害时，摸一张牌且此伤害不会大于一点至你下个回合结束。<br>";
                        }
                        if (player.starsqinglong) {
                            result += "<font color= #EE9A00>青龙</font>:每回合第一次受到伤害后回复一点体力至你下个回合结束。<br>";
                        }
                        if (player.starszhuque) {
                            result += "<font color= #EE9A00>朱雀</font>:立即获得一张♦杀，♦杀无距离限制且造成伤害时视为🔥伤害至你下个回合结束。<br>";
                        }
                        if (player.starsbaihu) {
                            result += "<font color= #EE9A00>白虎</font>:立即获得一张♣杀，♣杀不可被响应且造成伤害时视为⚡伤害至你下个回合结束。";
                        }
                        return result;
                    },
                    name: "<font color= #EE9A00>象技</font>",
                },
                trigger:{
                    global:["phaseAfter"],
                },
                firstDo: true,
                silent: true,
                direct: true,
                filter:function (event, player, name) {
                    const skills = ['starsxuanwu','starsqinglong','starszhuque','starsbaihu'];
                    let checkHaslist = [];
                    for (let skill of skills) {
                        if (player.hasSkill(skill)) {
                            checkHaslist.push(skill);
                        }
                    }
                    return checkHaslist.length === 0;
                },
                async content(event, trigger, player) {
                    player.unmarkSkill('starssixiang_SX');
                    player.removeSkill('starssixiang_SX');
                },
                sub: true,
                superCharlotte:true,
                charlotte:true,
                unique:true,
                sourceSkill: "starssixiang",
                "_priority": Infinity,
            },
        },
        "_priority":1314,
    },
    starsbazhen:{
        audio:"ext:银竹离火/audio/skill:4",
        mod: {
            aiValue: function(player, card, num) {
                const lists = starszhuanzhen(player, 'starsbazhen');
                if (!lists || !Array.isArray(lists)) return;
                const compare = {//重要比较值
                    wuxie: () => compareValue(player, "wuxie"),
                    guohe: () => compareValue(player, "guohe"),
                    tiesuo: () => compareValue(player, "tiesuo"),
                    shunshou: () => compareValue(player, "shunshou"),
                    huogong: () => compareValue(player, "huogong"),
                    nanman: () => compareValue(player, "nanman"),
                    wuzhong: () => compareValue(player, "wuzhong"),
                    wanjian: () => compareValue(player, "wanjian")
                };
                const compareMap = {
                    '坎': { key: 'wuxie' },
                    '艮': { key: 'guohe' },
                    '震': { key: 'tiesuo' },
                    '巽': { key: 'shunshou' },
                    '离': { key: 'huogong' },
                    '坤': { key: 'nanman' },
                    '兑': { key: 'wuzhong' },
                    '乾': { key: 'wanjian' }
                };
                let mark = {};
                for (const [hanzi, value] of lists) {
                    if (!mark[value]) mark[value] = [];
                    mark[value].push(hanzi);
                }
                const number = get.number(card, player);
                for (const hanzi in compareMap) {
                    const { key } = compareMap[hanzi];
                    const filtered = lists.filter(item => item[0] === hanzi);
                    if (filtered.length > 0 && filtered[0][1] === number) {
                        return Math.max(num, compare[key]());
                    }
                }
                return num;
            },
            aiUseful: function(player, card, num) {
                return lib.skill.starsbazhen.mod.aiValue.apply(this, arguments);
            },
        },
        mark:true,
        marktext:"<font color= #EE9A00>八阵</font>",
        intro:{
            name:"<font color= #EE9A00>八阵</font>",
            mark: function(dialog, storage, player) {
                const list = starszhuanzhen(player, 'starsbazhen');
                if (list && Array.isArray(list) && list.length > 0) {
                    const symbols = list.map(([hanzi, number]) => {
                        const color = (hanzi === '坎' || hanzi === '震' || hanzi === '离' || hanzi === '兑') ? '#FF2400' : '#00FFFF';
                        return {
                            symbol: `${hanzi}${getNumberSymbol(number)}`,
                            color: color
                        };
                    });
                    dialog.content.style["overflow-x"] = "visible";
                    const core = document.createElement("div");
                    core.style.width = "0";
                    core.style.position = "relative";
                    const centerX = -15;
                    const centerY = 80;
                    const radius = 80;
                    const positions = symbols.map((_, index) => {
                        const angle = (index * 360 / symbols.length - 90) * (Math.PI / 180);
                        return {
                            x: centerX + radius * Math.cos(angle),
                            y: centerY + radius * Math.sin(angle)
                        };
                    });
                    positions.forEach((pos, index) => {
                        const { symbol, color } = symbols[index];
                        core.innerHTML += `
                            <div style="position: absolute; left: ${pos.x}px; top: ${pos.y}px; text-align: center;">
                                <font color="${color}">${symbol}</font> <!-- 使用设置的颜色 -->
                            </div>
                        `;
                    });
                    dialog.content.appendChild(core);
                } else {
                    dialog.addText("<font color= #EE9A00>鞠躬尽瘁，死而后已！</font>");
                }
            },
            markcount:function(storage, player) {
                const list = starszhuanzhen(player, 'starsbazhen');
                if (list && Array.isArray(list) && list.length > 0) return list.length;
                return 0;
            },
        },
        enable:["chooseToUse","chooseToRespond"],
        prompt: 星八阵,
        unique: true,
        locked: false,
        direct:true,
        async init(player, skill) {
            if (!player.starsbazhen_settricks) player.starsbazhen_settricks = {
                '坎': 'wuxie',
                '艮': 'guohe',
                '震': 'tiesuo',
                '巽':'shunshou',
                '离': 'huogong',
                '坤': 'nanman',
                '兑': 'wuzhong',
                '乾': 'wanjian',
            };
        },
        filter: function (event, player) {
            if(!player.hasSkill('starszhuanzhen')) return false;
            const lists = starszhuanzhen(player, 'starsbazhen');
            if  (!lists || !Array.isArray(lists) || lists.length === 0) return false;
            const cards = player.getCards("hes");
            const hes_numlist = [...new Set(cards.map(card => get.number(card)))];
            const markwords = lists.map(item => item[0]);
            const tricks = player.starsbazhen_settricks;
            for(const word of markwords) {
                const Vcard = {name: tricks[word], nature: '', isCard: true, starsbazhen: true};
                const number = lists.find(item => item[0] === word)[1];
                if (hes_numlist.includes(number)) {
                    const filter = event.filterCard;
                    if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) return true;
                }
            }
            return false;
        },
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const lists = starszhuanzhen(player, 'starsbazhen');
            if  (!lists || !Array.isArray(lists) || lists.length === 0) return false;
            const tricks = player.starsbazhen_settricks;
            const markwords = lists.map(item => item[0]);
            for(const word of markwords) {
                const Vcard = {name: tricks[word], nature: '', isCard: true, starsbazhen: true};
                const number = lists.find(item => item[0] === word)[1];
                if (number === get.number(card, player)) {
                    return filter(get.autoViewAs(Vcard, "unsure"), player, event)
                }
            }
            return false;
        },
        viewAs: function (cards, player) {
            const tricks = player.starsbazhen_settricks;
            const lists = starszhuanzhen(player, 'starsbazhen');
            if  (!lists || !Array.isArray(lists) || lists.length === 0) return null;
            if (cards.length) {
                const markwords = lists.map(item => item[0]);
                for(const word of markwords) {
                    const Vcard = {name: tricks[word], nature: '', isCard: true, starsbazhen: true};
                    const number = lists.find(item => item[0] === word)[1];
                    if (number === get.number(cards[0], player)) {
                        return Vcard;
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
            return get.value(card, player) < 8;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        precontent: async function () {
            //无
        },
        onuse: async function (result, player) {
            const card = result.card;
            const name = card.name;
            const number = get.number(result.cards[0]);
            const liangyilist = starszhuanzhen(player, 'starsliangyi');
            if(liangyilist.length > 0) {
                const randomIndex = Math.floor(Math.random() * liangyilist.length);
                const liangyi = liangyilist[randomIndex];
                const liangyiSuit = liangyi[0];
                const liangyiNumber = liangyi[1];
                if (liangyiSuit && liangyiNumber) {
                    await player.specifyCards({ suit: liangyiSuit, number: liangyiNumber });
                }
            }
            const lists = starszhuanzhen(player, 'starsbazhen');
            const tricks = player.starsbazhen_settricks;
            const markwords = lists.map(item => item[0]);
            for(const word of markwords) {
                const trickName = tricks[word];
                const getnumber = lists.find(item => item[0] === word)[1];
                if (trickName === name && getnumber === number) {
                    player.StarsBZMark = player.StarsBZMark.filter(item => item[0] !== word && item[1] !== number);
                    player.markSkill("starsbazhen");
                }
            }
        },
        hiddenCard: function (player, name) {
            const lists = starszhuanzhen(player, 'starsbazhen');
            const cards = player.getCards("hes");
            const hes_numlist = [...new Set(cards.map(card => get.number(card)))];
            const markwords = lists.map(item => item[0]);
            const tricks = player.starsbazhen_settricks;
            for(const word of markwords) {
                const trick = tricks[word];
                if (name  === trick) {
                    const number = lists.find(item => item[0] === word)[1];
                    return hes_numlist.includes(number);
                }
            }
        },
        ai:{
            order: function (item, player) {
                let order = 0;
                if (player && _status.event.type == "phase") {
                    const lists = starszhuanzhen(player, 'starsbazhen');
                    if  (!lists || !Array.isArray(lists) || lists.length === 0) return order;
                    const cards = player.getCards("hes");
                    const hes_numlist = [...new Set(cards.map(card => get.number(card)))];
                    const markwords = lists.map(item => item[0]);
                    const tricks = player.starsbazhen_settricks;
                    let tricklists = [];
                    for(const word of markwords) {
                        const name  = tricks[word];
                        const number = lists.find(item => item[0] === word)[1];
                        if (hes_numlist.includes(number)) {
                            const getnumberCard = cards.filter(card => get.number(card, player) === number);
                            const sortCard = getnumberCard.sort((a,b) => get.value(a, player) - get.value(b, player));
                            if (get.value(sortCard[0], player) < 8) {
                                if(!tricklists.includes(name)) tricklists.push(name);
                            }
                        }
                    }
                    if (!tricklists || tricklists.length == 0) return order;
                    let canUselist = [];
                    for(const name of tricklists) {
                        const Vcard = {name: name, nature: '', isCard: true, starsbazhen: true};
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            canUselist.push(Vcard);
                        }
                    }
                    if (!canUselist || canUselist.length == 0) return order;
                    let ordernumlist = [];
                    for (let card of canUselist) {
                        const Vorder = get.order(card);
                        if (Vorder && Vorder > 0 && !ordernumlist.includes(Vorder)) {
                            ordernumlist.push(Vorder);
                        }
                    }
                    if (!ordernumlist || ordernumlist.length == 0) return order;
                    return Math.max(...ordernumlist) + 1.5;
                }
                return order;
            },
        },
        "_priority":1314,
    },
    starsxuanwu: {//玄武
        trigger:{
            player:["phaseBegin","damageBegin"],
            global:["phaseEnd"],
        },
        unique: true,
        locked: true,
        direct: true,
        async init(player, skill) {
            if (!player.starsxuanwu_phaseBegin) player.starsxuanwu_phaseBegin = false;
        },
        filter: function (event, player, name) {
            if (name == 'phaseBegin') {
                player.starsxuanwu_phaseBegin = true;
                return;
            } else if (name == 'damageBegin') {
                if (!event.source) return false;
                return player.starsxuanwu && event.num > 0;
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.starsxuanwu_phaseBegin;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageBegin') {
                await player.draw();
                const num =  trigger.num;
                if (num > 1) {
                    trigger.num = 1;
                    game.log(player, '发动',  '#g【玄武】', '，将受到的', num,'点伤害降至为1点！');
                }
            } else if (Time == 'phaseEnd') { 
                player.starsxuanwu_phaseBegin = false;
                player.starsxuanwu = false;
                delete player.starsxuanwu_phaseBegin;
                delete player.starsxuanwu;
                player.removeSkill(event.name);
                player.update();
            }
        },
        ai:{
            effect: {
                target: function(card, player, target) {
                    if (get.tag(card, 'damage') > 1) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        else return 0.5;
                    }
                },
                player:function (card, player, target) {
                    //无
                },
            },
        },
        "_priority":10,
    },
    starsqinglong: {//青龙
        trigger:{
            player:["phaseBegin","damageEnd"],
            global:["phaseEnd"],
        },
        unique: true,
        locked: true,
        direct: true,
        async init(player, skill) {
            if (!player.starsqinglong_phaseBegin) player.starsqinglong_phaseBegin = false;
            if (!player.starsqinglong_used) player.starsqinglong_used = false;
        },
        filter: function (event, player, name) {
            if (name == 'phaseBegin') {
                player.starsqinglong_phaseBegin = true;
                return;
            } else if (name == 'damageEnd') {
                if (!event.source) return false;
                return player.starsqinglong && event.num > 0 && !player.starsqinglong_used;
            } else if (name == 'phaseEnd') {
                player.starsqinglong_used = false;
                if (event.player === player) {
                    return player.starsqinglong_phaseBegin;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageEnd') {
                player.starsqinglong_used = true;
                await player.recover();
            } else if (Time == 'phaseEnd') {
                player.starsqinglong_phaseBegin = false;
                delete player.starsqinglong_phaseBegin;
                player.starsqinglong_used = false;
                delete player.starsqinglong_used;
                player.starsqinglong = false;
                delete player.starsqinglong;
                player.removeSkill(event.name);
                player.update();
            }
        },
        ai:{
            effect: {
                target: function(card, player, target) {
                    if (get.tag(card, 'damage') === 1 && !target.starsqinglong_used) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        const cards = player.getCards('hes').filter(card => get.tag(card, 'damage') && player.canUse(card,target));
                        let trickCards = cards.filter(card => get.type(card) == 'trick');
                        let basicCards = cards.filter(card => get.type(card) == 'basic');
                        if (cards.length <= 1) {
                            return [0, 1];
                        } else {
                            if (trickCards.length > 0 && basicCards.length > 0) return [1, 0];
                            if (trickCards.length > 1) return [1, 0];
                            if (basicCards.length > 1) {
                                let canUse = false;
                                for (let ccc of basicCards) {
                                    let usable = player.getCardUsable(ccc);
                                    if (usable > 1) {
                                        canUse = true;
                                        break;
                                    }
                                }
                                if(canUse) return [1, 0];
                            }
                            return [0, 1];
                        }
                    }
                },
                player:function (card, player, target) {
                    //无
                },
            },
        },
        "_priority":9,
    },
    starszhuque: {//朱雀
        mod:{
            targetInRange:function(card, player, target) {
                if (get.suit(card) == 'diamond' && card.name == 'sha' && player.starszhuque) return true;
            },
        },
        trigger:{
            source:["damageBefore"],
            player:["phaseBegin"],
            global:["phaseEnd"],
        },
        unique: true,
        locked: true,
        direct: true,
        async init (player, skill) {
            await player.specifyCards({ suit: 'diamond', name: 'sha' });
            if (!player.starszhuque_phaseBegin) player.starszhuque_phaseBegin = false;
        },
        filter: function (event, player, name) {
            if (name == 'phaseBegin') {
                player.starszhuque_phaseBegin = true;
                return;
            } else if (name == 'damageBefore') {
                if (!event.source) return false;
                if (!event.card) return false;
                if (event.card.name !== 'sha') return false;
                const suit = get.suit(event.card);
                return player.starszhuque && suit === 'diamond' && event.nature != 'fire';
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.starszhuque_phaseBegin;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageBefore') {
                trigger.nature = 'fire';
                game.log(player, '使', trigger.card, '造成的伤害变为火属性！');
            } else if (Time == 'phaseEnd') {
                player.starszhuque_phaseBegin = false;
                delete player.starszhuque_phaseBegin;
                player.starszhuque = false;
                delete player.starszhuque;
                player.removeSkill(event.name);
                player.update();
            }
        },
        ai:{
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    //无
                },
            },
        },
        "_priority":8,
    },
    starsbaihu: {//白虎
        trigger:{
            source:["damageBefore"],
            player:["phaseBegin","useCard"],
            global:["phaseEnd"],
        },
        unique: true,
        locked: true,
        direct: true,
        async init (player, skill) {
            await player.specifyCards({ suit: 'club', name: 'sha' });
            if (!player.starsbaihu_phaseBegin) player.starsbaihu_phaseBegin = false;
        },
        filter: function (event, player, name) {
            if (name == 'phaseBegin') {
                player.starsbaihu_phaseBegin = true;
                return;
            } else if (name == 'damageBefore') {
                if (!event.source) return false;
                if (!event.card) return false;
                if (event.card.name !== 'sha') return false;
                const suit = get.suit(event.card);
                if (!suit) return false;
                return player.starsbaihu && suit === 'club' && event.nature != 'thunder';
            } else if (name == 'useCard') {
                if (!event.card) return false;
                if (event.card.name !== 'sha') return false;
                const suit = get.suit(event.card);
                if (!suit) return false;
                return player.starsbaihu && suit === 'club';
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.starsbaihu_phaseBegin;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageBefore') {
                trigger.nature = 'thunder';
                game.log(player, '使', trigger.card, '造成的伤害变为雷属性！');
            } else if (Time == 'useCard') {
                trigger.directHit.addArray(game.players);
                game.log(player, '使用的', trigger.card, '，不可被响应！');
            } else if (Time == 'phaseEnd') {
                player.starsbaihu_phaseBegin = false;
                delete player.starsbaihu_phaseBegin;
                player.starsbaihu = false;
                delete player.starsbaihu;
                player.removeSkill(event.name);
                player.update();
            }
        },
        ai:{
            "unequip_ai":true,
            "directHit_ai":true,
            skillTagFilter:function(player, tag, arg) {
                if (arg && arg.card && arg.card.name == "sha" && get.suit(arg.card) == "club" && player.starsbaihu) return true;
                return false;
            },
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    //无
                },
            },
        },
        "_priority":7,
    },
    //周瑜
    moonyingzi: {
        audio: "ext:银竹离火/audio/skill:4",
        mod: {
            ignoredHandcard: function(card, player) {
                const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
                for(let tag of tags) {
                    if (card.hasGaintag(tag)) return true;
                }
                return false;
            },
            cardDiscardable: function(card, player, name) {
                const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
                if (name == "phaseDiscard") {
                    for(let tag of tags) {
                        if (card.hasGaintag(tag)) return false;
                    }
                }
                return true;
            },
        },
        trigger:{
            player:["enterGame","gainEnd"],
            global:["phaseBefore","loseAsyncEnd"],
        },
        unique:true,
        locked:true,
        direct:true,
        async init(player, skill) {
            if (!player.checkYingzi) player.checkYingzi = function() {
                const cards = player.getCards("h");
                const hastaglist = new Set();
                const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
                if (!cards || cards.length === 0) return tags;
                for (const card of cards) {
                    for (const tag of tags) {
                        if (card.hasGaintag(tag)) {
                            hastaglist.add(tag);
                            break;
                        }
                    }
                }
                const notags = tags.filter(tag => !hastaglist.has(tag));
                return notags;
            };
            if (!player.addtagYingzi) player.addtagYingzi = function(cards) {
                if (!cards || cards.length === 0) return;
                const suitMap = { moonqishi_tag: 'spade', moonqinyin_tag: 'heart', moonhuayi_tag: 'club', moonshubi_tag: 'diamond' };
                const notags = player.checkYingzi();
                if (!notags || notags.length == 0) return;
                for (const toaddtag of notags) {
                    const suit = suitMap[toaddtag];
                    const Toaddtagcards = cards.filter(card => get.suit(card) === suit);
                    if (Toaddtagcards.length > 0) {
                        player.addGaintag(Toaddtagcards[0], toaddtag);
                    }
                }
            };
            if (game.phaseNumber > 0 || game.roundNumber > 0) {//中途切换角色加入周瑜
                await player.addtagYingzi(player.getCards("h"));
                player.logSkill(skill);
            };
        },
        filter:function (event, player, name) {
            const notags = player.checkYingzi();
            if (!notags || notags.length === 0) return false;
            if (name == 'enterGame' || name == 'phaseBefore') {
                return (event.name != 'phase' || game.phaseNumber == 0) && player.getCards("h").length > 0;
            } else {
                const cards = event.getg(player);
                if (!cards || cards.length === 0) return false;
                const suitMap = { moonqishi_tag: 'spade', moonqinyin_tag: 'heart', moonhuayi_tag: 'club', moonshubi_tag: 'diamond' };
                for (const toaddtag of notags) {
                    const suit = suitMap[toaddtag];
                    const Toaddtagcards = cards.filter(card => get.suit(card) === suit);
                    if (Toaddtagcards.length > 0) return true;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time == 'enterGame' || Time == 'phaseBefore') {
                await player.addtagYingzi(player.getCards("h"));
            } else {
                const cards = trigger.getg(player);
                await player.addtagYingzi(cards);
            }
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
            const skinsID = player.checkSkins();
            const names_one = ['moon_zhouyu', 'moon_zhouyu1', 'moon_zhouyu2'];
            const names_two = ['moon_zhouyu3', 'moon_zhouyu4'];
            if (names_two.includes(skinsID)) {
                player.chatSkill(event.name,chat2);
            } else if (names_one.includes(skinsID)) {
                player.chatSkill(event.name,chat1);
            } else {
                player.logSkill(event.name);
            }
        },
        ai:{
            threaten: 1.5,
        },
        "_priority":Infinity,
    },
    moonyingmou: {
        audio: "ext:银竹离火/audio/skill:4",
        mod: {
            aiOrder:function (player, card, num) {
                const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
                const cards = player.getCards("hs");
                if (!cards || cards.length === 0 || !cards.some(card => tags.some(tag => card.hasGaintag(tag)))) return;
                if(!cards.includes(card)) return num;
                /**
                 * 非常特殊的oder
                 * 当你失去卡牌后，若失去的卡牌中含有「琴棋书画」对应标签，每回合每项限「体力值：奇数:贰；偶数:壹」次，你执行对应标签项。
                 * const tags = ['moonqinyin_tag', 'moonqishi_tag','moonshubi_tag','moonhuayi_tag'];卡牌标签
                 * const keys = ['moonqinyin', 'moonqishi', 'moonshubi', 'moonhuayi'];设定的限制次数
                 * const usedkeys = ['qinyinused', 'qishiused','shubiused', 'huayiused'];已使用的次数
                 * 总体若均满足特定条件时按照 书笔 → 画意 → 琴音 → 棋势 的顺序执行。
                 */
                const settags = {
                    moonqinyin_tag: {
                        canuse: function () {
                            return player.qinyinused < player.moonqinyin;
                        },
                        setoder: function () {
                            return moonqinyinAI(player,"effectAI");
                        }
                    },
                    moonqishi_tag: { 
                        canuse: function () {
                            return player.qishiused < player.moonqishi;
                        },
                        setoder: function () {
                            return moonqishiAI(player,"effectAI");
                        },
                    },
                    moonshubi_tag: {
                        canuse: function () {
                            return player.shubiused < player.moonshubi;
                        },
                        setoder: function () {
                            const numone = moonqinyinAI(player,"effectAI");
                            const numtwo = moonqishiAI(player,"effectAI");
                            return 1 + Math.max(numone,numtwo);
                        },
                    },
                    moonhuayi_tag: { 
                        canuse: function () {
                            return player.huayiused < player.moonhuayi;
                        },
                        setoder: function () {
                            //画意居于书笔之下，琴音和棋势之上之上
                            const numone = settags.moonqinyin_tag.setoder();
                            const numtwo = settags.moonqishi_tag.setoder();
                            const numthree = settags.moonshubi_tag.setoder();
                            const setnumone = (numone + numthree) / 2;
                            const setnumtwo = (numtwo + numthree) / 2;
                            return Math.max(setnumone, setnumtwo);
                        },
                    },
                };
                if (get.tag(card, "recover") === 1) {
                    /**
                     * 规避体力值为偶数的设定！
                     */
                    if (player.hp % 2 == 2 && player.isDamaged()) return num * 2;
                }
                const keys = Object.keys(settags);
                for (let key of keys) {
                    if (card.hasGaintag(key) && settags[key].canuse()) {
                        return num + settags[key].setoder() * 2;
                    }
                }
            },
        },
        mark: true,
        marktext: "<font color= #EE9A00>英谋</font>",
        intro: {
            content: function (storage, player) {
                const hpnum = player.hp;
                if (hpnum % 2 === 1) {
                    return setColor("〖奇数〗：每回合每项限两次，你执行对应标签项。");
                } else {
                    return setColor("〖偶数〗：每回合每项限一次，你执行对应标签项。");
                }
            },
            onunmark: true,
            name: "<font color= #EE9A00>英谋</font>",
        },
        trigger: {
            player: ["changeHpAfter"],
            global: [
                "phaseAfter",
                "equipAfter","addJudgeAfter","loseAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"
            ],
        },
        unique: true,
        locked: false,
        direct:true,
        async init(player, skill) {
            const keys = ['moonqinyin', 'moonqishi', 'moonshubi', 'moonhuayi'];
            const hpnum = player.hp;
            const numset = hpnum % 2 === 1 ? 2 : 1;
            for (let key of keys) {
                if (!player[key]) player[key] = numset;
            }
            const usedkeys = ['qinyinused', 'qishiused','shubiused', 'huayiused'];
            for (let key of usedkeys) {
                if (!player[key]) player[key] = 0;
            }
        },
        filter: function (event, player,name) {
            if (name == 'changeHpAfter') {
                return player.isAlive();
            } else if (name == 'phaseAfter') {
                const usedkeys = ['qinyinused', 'qishiused','shubiused', 'huayiused'];
                for (let key of usedkeys) {
                    if (!player[key]) player[key] = 0;
                    else player[key] = 0;
                }
                return;
            } else {
                const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
                const gettags = player.checkloseTags(event).tags;
                if (!gettags ||!Array.isArray(gettags) || gettags.length === 0) return false;
                return gettags.some(list => Array.isArray(list) && list.some(tag => tags.includes(tag)));
            }
        },
        async changeSkins(player, tag, targets = null) {
            if (!changeSkinskey) {
                if (targets) player.logSkill('moonyingmou',targets,'water');
                else player.logSkill('moonyingmou');
            } else {
                const skinsID = player.checkSkins();
                const chat1 = [
                    "行计以险，纵略以奇，敌虽百万亦戏之如犬豕。",
                    "若生铸剑为犁之心，须有纵钺止戈之力。",
                    "既遇知己之明主，当福祸共之，荣辱共之。",
                    "将者，贵在知敌虚实，而后避实而击虚。"
                ];
                const chat2 = [
                    "良策生胸腹，一瓢锦绣可倾三千弱水。",
                    "雄略规经纬，乘帆梦日，天下自可纵横。",
                    "君子行陌路，振翅破樊笼，何妨天涯万里！",
                    "年少立志三千里，会当击水，屈指问东风！",
                ];
                const tags_one = ['moonqinyin_tag', 'moonshubi_tag'];
                const tags_two = ['moonqishi_tag', 'moonhuayi_tag'];
                if (tags_one.includes(tag)) {
                    const names_1 = ["moon_zhouyu", "moon_zhouyu1"];
                    const names_2 = ["moon_zhouyu3"];
                    if(names_1.includes(skinsID)) {
                        player.changeSkins(2);
                        if(targets) player.chatSkill('moonyingmou',chat1,targets,'water');
                        else player.chatSkill('moonyingmou',chat1);
                    } else if(names_2.includes(skinsID)) {
                        player.changeSkins(4);
                        if(targets) player.chatSkill('moonyingmou',chat2,targets,'water');
                        else player.chatSkill('moonyingmou',chat2);
                    } else {
                        if (targets) player.logSkill('moonyingmou',targets,'water');
                        else player.logSkill('moonyingmou');
                    }
                }
                if (tags_two.includes(tag)) {
                    const names_1 = ["moon_zhouyu", "moon_zhouyu2"];
                    const names_2 = ["moon_zhouyu4"];
                    if(names_1.includes(skinsID)) {
                        player.changeSkins(1);
                        if(targets) player.chatSkill('moonyingmou',chat1,targets,'water');
                        else player.chatSkill('moonyingmou',chat1);
                    } else if(names_2.includes(skinsID)) {
                        player.changeSkins(3);
                        if(targets) player.chatSkill('moonyingmou',chat2,targets,'water');
                        else player.chatSkill('moonyingmou',chat2);
                    } else {
                        if (targets) player.logSkill('moonyingmou',targets,'water');
                        else player.logSkill('moonyingmou');
                    }
                }
            }
        },
        async losemoontags(player, tag) {
            const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
            if(!tags.includes(tag)) return;
            const changeSkins = lib.skill.moonyingmou.changeSkins;
            if(tag === "moonqinyin_tag") {
                const wuPlayers = game.filterPlayer(function (current) {
                    return current.group === 'wu';
                });
                if(!wuPlayers || wuPlayers.length === 0) return;
                const prompt = setColor("〖琴音〗：是否令至多" + get.cnNumber(wuPlayers.length) + "名其他角色，令其选择一项：①交给你一张牌并回复一点体力；②令你摸一张牌并失去一点体力？");
                const result = await player.chooseTarget(prompt, [1, wuPlayers.length], function (card, player, target) {
                        return target !== player;
                }).set('ai', (target) => {
                    if (moonqinyinAI(player,"targetAI").includes(target)) return 1;
                    else return 0;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    await changeSkins(player, tag, targets);
                    while (targets.length) {
                        let target = targets.shift();
                        const list = [
                            setColor("〖选项一〗：交给" + get.translation(player) + "一张牌，你回复一点体力。"),
                            setColor("〖选项二〗：令" + get.translation(player) + "摸一张牌，你失去一点体力。"),
                        ];
                        const chooseButton = await target.chooseButton([setColor('〖琴音〗'),
                            [list.map((item, i) => {return [i, item];}),"textbutton",],
                        ]).set("filterButton", function (button) {
                            if (button.link === 0) {
                                const cards = target.getGainableCards(player, "he");
                                return cards && cards.length > 0;
                            } else if (button.link === 1) {
                                return true;
                            }
                        }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                            function getButtonLinks() {
                                let links = [];
                                const cards = target.getGainableCards(player, "he");
                                if (cards && cards.length > 0) links.push(0);
                                links.push(1);
                                return links;
                            }
                            function getValueLink() {
                                const links = getButtonLinks();
                                if (links.includes(0)) {
                                    const valueCards = target.getGainableCards(player, "he").filter(card => get.value(card, target) < compareValue(target,'tao'));
                                    const canSaveCards = target.getCards("hes").filter(card => target.canSaveCard(card, target));
                                    if (valueCards && valueCards.length > 0) return 0;
                                    if (canSaveCards && canSaveCards.length > 0) return 1;
                                    return 0;
                                } else {
                                    return 1;
                                }
                            }
                            return button.link == getValueLink();
                        }).forResult();
                        if (chooseButton.bool) {
                            const choices = chooseButton.links;
                            if (choices.includes(0)) {
                                const cards = await target.chooseCard("he", true, `选择交给${get.translation(player)}一张牌`).forResultCards();
                                if (cards && cards.length) {
                                    await target.give(cards, player);
                                    await target.recover();
                                }
                            } else if (choices.includes(1)) {
                                await player.draw();
                                await target.loseHp();
                            }
                        }
                    }
                }
            } else if(tag === "moonqishi_tag") {
                const prompt = setColor("〖棋势〗：是否选择一名其他角色令其弃置所有♠牌？");
                const result = await player.chooseTarget(prompt, 1, function (card, player, target) {
                        return target !== player;
                }).set('ai', (target) => {
                    return target === moonqishiAI(player,"targetAI");
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    await changeSkins(player, tag, target);
                    player.line(target, 'water');
                    const cards = target.getCards('he',{ suit: 'spade' });
                    if (cards && cards.length > 0) {
                        await target.discard(cards);
                        game.log(target, '弃置了', cards.length, setColor('张♠牌。'));
                        await target.draw();
                    } else {
                        game.log(target, setColor('未弃置♠牌。'));
                        let gainCards = [];
                        const suits = ['heart', 'diamond', 'club'];
                        for (const suit of suits) {
                            const cards = player.getCardsform().filter(card => get.suit(card) === suit);
                            if (cards && cards.length > 0) {
                                gainCards.push(cards[0]);
                            }
                        }
                        if (gainCards && gainCards.length > 0) {
                            await player.gain(gainCards, "gain2");
                        }
                    }
                }
            } else if(tag === "moonshubi_tag") {
                const prompt = setColor("〖书笔〗");
                const topcards = get.cards(1);
                if (!topcards || topcards.length === 0) return;
                await changeSkins(player, tag);
                await player.showCards(topcards, get.translation(player) + "发动了" + prompt);
                await player.gain(topcards, "draw");
                const suits = get.suit(topcards[0]);
                if (suits === 'diamond') {
                    game.log(player, '获得的',topcards[0],setColor('为♦牌。'));
                    const setsuits = ['spade','heart', 'club'];
                    const randomSuit = setsuits[Math.floor(Math.random() * setsuits.length)];
                    await player.specifyCards(randomSuit);
                } else {
                    game.log(player, '获得的',topcards[0],setColor('为非♦牌。'));
                }
                const canRecastcards = player.getCards('he').filter(card => player.canRecast(card));
                if (canRecastcards && canRecastcards.length > 0) {
                    const result = await player.chooseCard("请选择重铸一张牌", 'he', 1, true, function(card) {
                        return player.canRecast(card);
                    }).set('ai', (card) => {
                        const sortedCards = moonshubiAI(player)
                        return get.value(card,player) === get.value(sortedCards[0],player);
                    }).forResult();
                    if (result.bool) {
                        player.recast(result.cards[0]);
                    }
                }
            } else if(tag === "moonhuayi_tag") {
                const fieldcards = player.getCardsform({ Pile: null, field: 'hej' });
                if (fieldcards && fieldcards.length > 0) {
                    const randomCard = fieldcards[Math.floor(Math.random() * fieldcards.length)];
                    const target = get.owner(randomCard);
                    if (target) {
                        await changeSkins(player, tag, target);
                    } else  {
                        await changeSkins(player, tag);
                    }
                    let text = setColor("〖画意〗");
                    const type = get.type(randomCard);
                    if (!type) {
                        game.log('未知错误！');
                        return;
                    }
                    switch (type) {
                        case "basic":
                            text += setColor(`：使用下一张基本牌的基础数值 + 1。${target ? '此牌来源者为：' + get.translation(target) + "。" : " "}`);
                            break;
                        case "trick":
                        case "delay":
                            text += setColor(`：使用下一张普通锦囊牌无距离限制且可多指定两个目标。${target ? '此牌来源者为：' + get.translation(target) + "。" : " "}`);
                            break;
                        case "equip":
                            text += setColor(`：重铸区域内所有♣牌，若无则摸一张牌。${target ? '此牌来源者为：' + get.translation(target) + "。" : " "}`);
                            break;
                        default:
                            text += setColor("：无！希望这不是BUG！而是您的扩展自定义的类型。");
                    }
                    await player.showCards([randomCard], get.translation(player) + "发动了" + text);
                    await player.gain(randomCard, "gain2");
                    if (target)  {
                        game.log(target, "因", player, setColor("发动〖画意〗即将摸一张牌"));
                        await target.draw();
                    }
                    if (type === "basic") {
                        player.addTempSkill('moonyingmou_basic');
                        player.markSkill('moonyingmou_basic');
                        player.update();
    
                    } else if (type === "trick" || type === "delay") {
                        player.addTempSkill('moonyingmou_trick');
                        player.markSkill('moonyingmou_trick');
                        player.update();
                    } else if (type === "equip") {
                        const canRecastclubCards = player.getCards('he').filter(card => get.suit(card) === "club" && player.canRecast(card));
                        if (canRecastclubCards && canRecastclubCards.length > 0) {
                            player.recast(canRecastclubCards);
                        } else {
                            await player.draw();
                        }
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'changeHpAfter') {
                const keys = ['moonqinyin', 'moonqishi', 'moonshubi', 'moonhuayi'];
                const hpnum = player.hp;
                const numset = hpnum % 2 === 1 ? 2 : 1;
                for (let key of keys) {
                    if (!player[key]) player[key] = numset;
                    else player[key] = numset;
                }
            } else {
                const tagsMapping = {
                    moonqinyin_tag: { usedKey: 'qinyinused', setNum: 'moonqinyin' },
                    moonqishi_tag: { usedKey: 'qishiused', setNum: 'moonqishi' },
                    moonshubi_tag: { usedKey: 'shubiused', setNum: 'moonshubi' },
                    moonhuayi_tag: { usedKey: 'huayiused', setNum: 'moonhuayi' },
                };
                const gettags = player.checkloseTags(trigger).tags;
                for (const taglist of gettags) {
                    for (const tag of taglist) {
                        const mapping = tagsMapping[tag];
                        if (mapping) {
                            const used = player[mapping.usedKey];
                            const setnum = Math.max(1, player[mapping.setNum] || 0);
                            if (used < setnum) {
                                const cccccc = lib.skill.moonyingmou.losemoontags;
                                await cccccc(player, tag);
                                player[mapping.usedKey]++;
                            }
                        }
                    }
                }
            }
        },
        ai:{
            expose:0.35,
            noe: true,
            reverseEquip:true,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    if (player.hasSkill("moonyingzi")) {
                        const cardsnum = player.getCards("h").length;
                        const php = player.hp;
                        return Math.max(1, Math.min(4.5, cardsnum - php));
                    } else {
                        return 1;
                    }
                } else {
                    return 0.5;
                }
            },
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    return moonyingmouAI(card, player, target);
                },
            },
        },
        "_priority":Infinity,
    },
    moonyingmou_basic:{
        mark:true,
        marktext:"<font color= #48D1CC>基本</font>",
        intro:{
            content: function (storage, player) {
                return setColor("使用下一张基本牌的基础数值+1。");;
            },
            onunmark: true,
            name:"<font color= #48D1CC>英谋·基本</font>",
        },
        trigger:{
            player:"useCard",
            global:"phaseAfter",
        },
        unique:true,
        charlotte:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === "useCard") {
                if (!player.hasSkill("moonyingmou")) return false;
                return get.type(event.card) == "basic";
            } else if (name === "phaseAfter") {
                player.unmarkSkill("moonyingmou_basic");
                player.removeSkill("moonyingmou_basic");
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseAfter") return;
            trigger.baseDamage++;
            game.log(player, "使用的", trigger.card, "基础数值+1");
            await delay(500);
            player.unmarkSkill("moonyingmou_basic");
            player.removeSkill("moonyingmou_basic");
            player.update();
        },
        "_priority":Infinity,
    },
    moonyingmou_trick:{
        mark:true,
        marktext:"<font color= #48D1CC>锦囊</font>",
        intro:{
            content: function (storage, player) {
                return setColor("使用下一张普通锦囊牌无距离限制且可多指定两个目标！");;
            },
            onunmark: true,
            name:"<font color= #48D1CC>英谋·锦囊</font>",
        },
        mod:{
            targetInRange:function (card, player, target) {
                const type = get.type(card);
                if (type == "trick" || type == "delay") return true;
            },
        },
        trigger:{
            player:"useCard",
            global:"phaseAfter",
        },
        unique:true,
        charlotte:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === "useCard") {
                if (!player.hasSkill("moonyingmou")) return false;
                const cardinfo = get.info(event.card, false);
                if (cardinfo.allowMultiple === false) return false;
                if (cardinfo.multitarget === false) return false;
                if (cardinfo.type === "trick") {
                    if (event.targets) {
                        const target = game.filterPlayer(function(current) {
                            return !event.targets.includes(current) && 
                            lib.filter.targetEnabled2(event.card, player, current) && 
                            lib.filter.targetInRange(event.card, player, current);
                        });
                        if (target.length > 0) {
                            return true;
                        }
                    }
                }
                return false;
            } else if (name === "phaseAfter") {
                player.unmarkSkill("moonyingmou_trick");
                player.removeSkill("moonyingmou_trick");
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseAfter") return;
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
            player.unmarkSkill("moonyingmou_trick");
            player.removeSkill("moonyingmou_trick");
            player.update();
        },
        "_priority":Infinity,
    },
};
export default TAF_MoonAndStarsSkills;
