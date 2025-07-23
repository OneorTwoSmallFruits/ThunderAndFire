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

const { firefengmingAI,firezhenwuAI } = setAI.shu;

const { setlonghun } = asyncs.shu.TAF_shen_zhaoyun;
const { initlonghun , initfirehunyou } = asyncs.shu.fire_zhaoxiang;
const { initfirebazhen } = asyncs.shu.fire_jiangwei;//姜维

/** @type { importCharacterConfig['skill'] } */
const TAF_shuSkills = {
    //蜀国全局横置debuff
    fire_hz: {
        trigger:{
            player:"linkBefore",
        },
        superCharlotte: true,
        charlotte: true,
        silent: true,
        direct: true,
        async init(player, skill) {
            if(!player.isLinked()) {
                player.link(true);
            }
        },
        filter:function (event, player, name) {
            return player.isLinked();
        },
        async content(event, trigger, player) {
            trigger.cancel();
            game.log(player, '暂时不可解除横置！');
        },
        ai:{
            effect:{
                target:function(card, player, target) {
                    if (card.name == "tiesuo") return "zeroplayertarget";
                },
            },
        },
        priority: Infinity,
    },
    //鲍三娘
    firezhenwu: {
        audio: "ext:银竹离火/audio/skill:4",
        mark: true,
        marktext:"<font color= #FF2400>镇武</font>",
        intro:{
            content: function (storage, player) {
                const result = player.firezhenwu();
                let str = "";
                str += "<font color= #FF2400>前邻</font>：" + result.前邻.map(c => get.translation(c)).join(" ") + "<br>";
                str += "<font color= #FF2400>中轴</font>：" + result.中轴.map(c => get.translation(c)).join(" ") + "<br>";
                str += "<font color= #FF2400>后邻</font>：" + result.后邻.map(c => get.translation(c)).join(" ");
                return str;
            },
            onunmark: true,
            name:"<font color= #FF2400>镇武</font>",
        },
        trigger: {
            source: ["damageAfter"],
            player: ["damageAfter"],
            global: ["phaseAfter"],
        },
        unique:true,
        locked:false,
        direct:true,
        async init(player, skill) {
            if (!player.firezhenwuused) player.firezhenwuused = 0;
            if (!player.firezhenwu) player.firezhenwu = function () {
                let result = { 前邻:[], 中轴:[], 后邻:[] };
                const getlcards = [];
                const evts = game.getAllGlobalHistory("everything", evt => {
                    if (!evt.name || evt.name !== "lose") return false;
                    const evt2 = evt.getl(player);
                    return evt2 && evt2.hs && evt2.hs.length > 0;
                });
                if (!evts || evts.length === 0) return result;
                for (const evt of evts) {
                    const losecards = evt.getl(player).hs;
                    for (const card of losecards) {
                        getlcards.add(card);
                    }
                }
                if (getlcards.length === 0) return result;
                const len = getlcards.length;
                if (len === 1) {
                    result = { 前邻:[getlcards[0]], 中轴:[], 后邻:[] };
                } else if (len === 2) {
                    result = { 前邻:[getlcards[0]], 中轴:[], 后邻:[getlcards[1]] };
                } else if (len >= 3) {
                    const midIndex = Math.floor(len / 2);
                    if (len % 2 === 0) {
                        result.前邻.push(getlcards[midIndex - 1]);
                        result.后邻.push(getlcards[midIndex]);
                    } else {
                        if (midIndex > 0) result.前邻.push(getlcards[midIndex - 1]);
                        result.中轴.push(getlcards[midIndex]);
                        if (midIndex < len - 1) result.后邻.push(getlcards[midIndex + 1]);
                    }
                }
                return result;
            };
        },
        filter: function (event, player,name) {
            if (name == "phaseAfter") {
                player.firezhenwuused = 0;
                return;
            } else {
                const source = event.source;
                const card = event.card;
                return source && card && event.num > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseAfter") return;
            let count = trigger.num || 1;
            while (count > 0) {
                count--;
                const prompt = setColor("是否发动〖镇武〗？");
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return firezhenwuAI(player) > 0;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    player.firezhenwuused ++ ;
                    const zhenwu = player.firezhenwu();
                    const cards1 = zhenwu.前邻;
                    const cards3 = zhenwu.后邻;
                    let numdraw1 = 0;
                    if (cards1.length > 0) {
                        const suitNum = getCardSuitNum(cards1[0],player);
                        const nameNum = getCardNameNum(cards1[0],player);
                        if (suitNum && suitNum ) {
                            numdraw1 = Math.abs(suitNum - nameNum);
                        }
                    }
                    let numdraw2 = 0;
                    if (cards3.length > 0) {
                        const suitNum = getCardSuitNum(cards3[0],player);
                        const nameNum = getCardNameNum(cards3[0],player);
                        if (suitNum && suitNum ) {
                            numdraw2 = Math.abs(suitNum - nameNum);
                        }
                    }
                    const numdraw = numdraw1 + numdraw2;
                    if (numdraw > 0) await player.gainCardsNumbersAndNames(numdraw);
                    if (player.firezhenwuused > player.getDamagedHp()) {
                        await player.changeCardsTo(player.maxHp,'he');
                        player.addTempSkill('fire_hz');
                        player.tempDisSkills('firezhenwu');
                        return;
                    }
                }
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            effect:{
                target: function (card, player, target) {
                    const damage = get.tag(card, "damage");
                    if (damage) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        if (getAliveNum(target, get.tag(card, "damage")) < 0) return;
                        return [1, firezhenwuAI(target)];
                    }
                },
            },
        },
        "_priority": 1314,
    },
    firezhennan: {
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            player: ["damageBefore"],
        },
        unique:true,
        locked:false,
        async init(player, skill) {
            if (!player.hasSkill('firezhennan_clear')) player.addSkill('firezhennan_clear');
        },
        changeSkins: async function (player) {
            const names = ["fire_baosanniang", "fire_baosanniang1", "fire_baosanniang2"];
            if (!changeSkinskey) return;
            const skinsID = player.checkSkins();
            if (!names.includes(skinsID)) return;
            if (skinsID === "fire_baosanniang" || skinsID === "fire_baosanniang1") {
                player.changeSkins(2);
            } else if (skinsID === "fire_baosanniang2") {
                player.changeSkins(1);
            }
            //const changeSkins = get.info(event.name).changeSkins;
        },
        filter: function (event, player) {
            if (!event.source || event.source == player) return false;
            return event.card && event.card.name !== 'sha' && event.num > 0;
        },
        async cost(event, trigger, player) {
            const prompt = setColor('是否发动〖镇南〗？');
            const result = await player.chooseBool(prompt).set('ai', () => {
                const target = _status.currentPhase;
                if (!target) return false;
                const att = get.attitude(player, target);
                if (att >= 2) return false;
                if (player.hasSkill('firezhenwu')) {
                    let shouyi = 0
                    const zhenwu = player.firezhenwu();
                    const cards = zhenwu.中轴;
                    if (cards.length > 0) {
                        const suitNum = getCardSuitNum(cards[0],player);
                        const nameNum = getCardNameNum(cards[0],player);
                        if (suitNum && suitNum ) {
                            shouyi = suitNum + nameNum;
                        }
                    }
                    return shouyi > 0 && getAliveNum(player, 1) > 0;
                } else {
                    return getAliveNum(player, 1) > 1;
                }
            }).forResult();
            if (result.bool) {
                let numdraw = 0;
                if (player.hasSkill('firezhenwu')) {
                    const zhenwu = player.firezhenwu();
                    const cards = zhenwu.中轴;
                    if (cards.length > 0) {
                        const suitNum = getCardSuitNum(cards[0],player);
                        const nameNum = getCardNameNum(cards[0],player);
                        if (suitNum && suitNum ) {
                            numdraw = suitNum + nameNum;
                        }
                    }
                }
                event.result = {
                    bool: true,
                    cost_data: numdraw,
                }
            }
        },
        async content(event, trigger, player) {
            const changeSkins = get.info('firezhennan').changeSkins;
            trigger.cancel();
            await changeSkins(player);
            player.tempDisSkills('firezhennan', { global: 'roundStart' });
            player.addSkill('firezhennan_damage');
            if(event.cost_data && typeof event.cost_data == 'number' && event.cost_data > 0) {
                const cardszhennan = await player.gainCardsNumbersAndNames(event.cost_data);
                if (cardszhennan.length > 0) {
                    player.addGaintag(cardszhennan, "firezhennan_tag");
                }
            }
            game.swapSeat(player, player.next);
            const evtU = trigger.getParent("phaseUse");
            const evtP = trigger.getParent("phase");
            if (evtU && evtU.name == "phaseUse" && evtU.player !== player) {
                evtU.skipped = true;
                player.insertPhase("firezhennan");
                return;
            } else if (evtP && evtP.name == "phase" && evtP.player !== player) {
                evtP.finish();
                player.insertPhase("firezhennan");
                return;
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            threaten:1.5,
            effect:{
                target: function (card, player, target) {
                    const cardname = get.name(card);
                    const damage = get.tag(card, "damage");
                    if (damage && cardname !== 'sha') {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (player === target) return [1, -2];
                        let shouyi = 0;
                        if (target.hasSkill('firezhenwu')) {
                            const zhenwu = target.firezhenwu();
                            const cards = zhenwu.中轴;
                            if (cards.length > 0) {
                                const suitNum = getCardSuitNum(cards[0],target);
                                const nameNum = getCardNameNum(cards[0],target);
                                if (suitNum && suitNum ) {
                                    shouyi = suitNum + nameNum;
                                }
                            }
                        }
                        return [0, shouyi];
                    }
                },
            },
        },
        subSkill: {
            damage : {
                audio:"firezhennan",
                mod: {
                    targetInRange: function (card, player, target) {
                        if (card.firezhennan) return true;
                    },
                },
                name: "镇南",
                enable:["chooseToUse","chooseToRespond"],
                unique:true,
                locked:false,
                async init(player, skill) {
                    if (!player.firezhennan_used) player.firezhennan_used = [];
                    if (!player.checkZhenNanCards) player.checkZhenNanCards = function() {
                        const cards = player.getCards('hes', card => card.hasGaintag('firezhennan_tag'));
                        let canUselist = [];
                        if (!cards || cards.length === 0) return canUselist;
                        const names = lib.inpile || [];
                        const natures = lib.inpile_nature || [];
                        for (let name of names) {
                            const Vcard = { name: name, nature: '', isCard: true, firezhennan: true};
                            if (get.tag(Vcard, "damage") >= 1) {
                                if (name === "sha") {
                                    if(player.hasUseTarget(Vcard,false)) canUselist.push(Vcard);
                                    for (let nature of natures) {
                                        Vcard.nature = nature;
                                        if(player.hasUseTarget(Vcard,false)) canUselist.push(Vcard);
                                    }
                                } else {
                                    if(player.hasUseTarget(Vcard,false)) canUselist.push(Vcard);
                                }
                            }
                        }
                        const filters = canUselist.filter(card => !player.firezhennan_used.some(used => used.name === card.name && used.nature === card.nature));
                        return filters;
                    };
                },
                filter: function(event, player) {
                    return player.checkZhenNanCards().length > 0;
                },
                chooseButton: {
                    dialog: function (event, player) {
                        const prompt = setColor("〖镇南〗：请选择视为使用或打出的牌：");
                        let list = [];
                        const Vcards = player.checkZhenNanCards();
                        for (let Vcard of Vcards) {
                            const name = Vcard.name;
                            const nature = Vcard.nature;
                            const type = get.type(name);
                            list.push([type, '', name, nature]);
                        }
                        if (list.length === 0) return;
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
                            const setCards = canUselist.sort((a, b) => player.getUseValue(b) - player.getUseValue(a));
                            return button.link[2] == setCards[0].name && button.link[3] == setCards[0].nature;
                        }
                    },
                    backup: function (links, player) {
                        return {
                            audio: "firezhennan",
                            popname: true,
                            filterCard: function (card) {
                                return card.hasGaintag('firezhennan_tag');
                            },
                            selectCard: 1,
                            check: function (card) {
                                const player = get.owner(card);
                                return get.value(card, player) < compareValue(player, 'tao');
                            },
                            position: "hes",
                            viewAs: { 
                                name: links[0][2], 
                                nature: links[0][3],
                                isCard: true,
                                firezhennan: true,
                            },
                            precontent: async function () {

                            },
                            onrespond: function () {
                                return this.onuse.apply(this, arguments);
                            },
                            onuse: async function (result) {
                                const name = result.card.name;
                                const nature = result.card.nature;
                                let Vcard = { name: name, nature: nature, isCard: true, firezhennan: true };
                                if (!player.firezhennan_used.some(used => used.name === name && used.nature === nature)) {
                                    player.firezhennan_used.push(Vcard);
                                }
                                const card = result.cards[0];
                                if (card) {
                                    await player.draw(1);
                                }
                            }
                        };
                    },
                    prompt: function (links, player) {
                        return "将一张〖<font color= #0088CC>镇南</font>〗牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用或打出，且摸一张牌。";
                    },
                },
                hiddenCard: function (player, name) {
                    const Vcards = player.checkZhenNanCards();
                    for (let Vcard of Vcards) {
                        if (Vcard.name == name) return true;
                    }
                    return false;
                },
                ai:{
                    unequip: true,
                    skillTagFilter: function (player, tag, arg) {
                        if (tag == 'unequip') {
                            const cardKey = arg?.card?.firezhennan;
                            if (cardKey) return true;
                        }
                        return false;
                    },
                    order: function (item, player) {
                        let order = 0;
                        const Vcards = get.player().checkZhenNanCards();
                        if(!Vcards || Vcards.length === 0) return order;
                        let canUselist = [];
                        for (const Vcard of Vcards) {
                            if (get.player().hasUseTarget(Vcard) && get.player().hasValueTarget(Vcard) && get.player().getUseValue(Vcard) > 0) {
                                canUselist.push(Vcard);
                            }
                        }
                        if (canUselist.length === 0) return order;
                        let ordernumlist = [];
                        for (const Vcard of canUselist) {
                            const Vorder = get.order(Vcard);
                            if (Vorder && Vorder > order && !ordernumlist.includes(Vorder)) {
                                ordernumlist.push(Vorder);
                            }
                        }
                        if (!ordernumlist || ordernumlist.length == 0) return order;
                        const maxVorder = Math.max(...ordernumlist) + 1;
                        return maxVorder;
                    },
                    result: {
                        player: function (player) {
                            console.log("result", lib.skill.firezhennan_damage.ai.order("firezhennan_damage", player));
                            debugger;
                            return lib.skill.firezhennan_damage.ai.order("firezhennan_damage", player);
                        },
                    },
                },
                sub: true,
                sourceSkill: "firezhennan",
            },
            clear:{
                trigger: {
                    player: ["phaseBegin","phaseEnd"],
                    global: "phaseAfter",
                },
                firstDo: true,
                charlotte: true,
                fixed: true,
                popup: false,
                silent: true,
                forced: true,
                async content(event, trigger, player) {
                    const Time = event.triggername;
                    if (Time == "phaseBegin") {
                        if (player.hasSkill('firezhennan_damage')) {
                            player.addTempSkill('fire_hz',{ player:'phaseEnd'});
                            player.tempDisSkills('firezhenwu',{ player:'phaseEnd'});
                        }
                    } else if (Time == "phaseEnd") {
                        if (player.hasSkill('firezhennan_damage')) {
                            player.firezhennan_used = [];
                            player.link(true);
                            player.damage(1, "fire", "nosource");
                            player.removeGaintag("firezhennan_tag");
                            const changeSkins = get.info('firezhennan').changeSkins;
                            await changeSkins(player);
                            player.removeSkill('firezhennan_damage');
                        }
                    }
                },
                sub: true,
                sourceSkill: "firezhennan",
                "_priority": Infinity,
            },
        },
        "_priority": 1315,
    },
    firefangzong: {
        mod:{
            maxHandcard:function(player, num) {
                return num + 2;
            },
            globalFrom:function(from, to, distance) {
                return distance - 1;
            },
        },
        audio: "ext:银竹离火/audio/skill:4",
        trigger:{
            player:["phaseDrawBegin"]
        },
        priority: Infinity,
        forced:true,
        filter: function (event, player) {
            return !event.numFixed;
        },
        async content(event, trigger, player) {
            trigger.num = 3;
        },
        ai:{
            threaten:1.5,
        },
    },
    //关银屏
    firexuehen:{
        audio:"ext:银竹离火/audio/skill:2",
        enable:"phaseUse",
        usable:1,
        filter:function (event, player) {
            return player.countCards("he", { color: "red" }) > 0;
        },
        filterTarget:true,
        selectTarget:function () {
            const Shu = game.filterPlayer(function(current) {
                return current.group == 'shu';
            }).length;
            return [1, Math.max(1, Shu)];
        },
        position:"he",
        filterCard:{
            color:"red",
        },
        check:function (card) {
            return get.value(card, get.player()) < compareValue(get.player(), "tao");
        },
        multitarget:true,
        multiline:true,
        line:"fire",
        async content(event, trigger, player) {
            const targets = event.targets;
            for (let target of targets) {
                if (!target.isLinked()) {
                    await target.link(true);
                    await target.draw();
                }
            }
            await player.link(true);
            await delay(500);
            const isLinkeds = game.players.filter(o => o.isAlive() && o.isLinked());
            if (isLinkeds && isLinkeds.length > 0) await player.draw(isLinkeds.length);
            player.damage(1, "fire", 'nocard', player);
            const cards = await player.specifyCards("qinglong",1,{ Pile: 'allPile', field: 'hejsx' });
            if (cards && cards.length > 0) await player.equip(cards[0]);
        },
        ai:{
            expose:0.5,
            damage:true,
            fireAttack:true,
            threaten: 3,
            order:3,
            result:{
                target:function (player, target) {
                    return get.damageEffect(target, player, target, "fire");
                },
            },
        },
        "_priority":0,
    },
    firehuxiao:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            source:"damageSource",
            global:["dieAfter"],
        },
        locked:true,
        direct:true,
        filter:function (event, player, name) {
            if (name == 'damageSource') {
                if(_status.currentPhase!=player) return false;
                if (event._notrigger.includes(event.player) || !event.player.isIn()) return false;
                return event.hasNature("fire");
            } else if (name == 'dieAfter') {
                return event.source && event.source == player && player.hasSkill('firehuxiao_red');
            }
        },
        logTarget:"player",
        async content(event, trigger, player) {
            player.logSkill(event.name);
            const Time = event.triggername;
            if (Time == 'damageSource') {
                if (!player.storage.firehuxiao_red) player.storage.firehuxiao_red = [];
                player.storage.firehuxiao_red.add(trigger.player);
                player.addTempSkill("firehuxiao_red");
            } else if (Time == 'dieAfter') {
                player.loseHp();
                if(player.hasSkill('firehuxiao_red')) {
                    player.removeSkill('firehuxiao_red');
                }
            }
        },
        ai:{
            threaten: 1.5,
        },
        subSkill:{
            red:{
                mark:true,
                marktext:"<font color= #FF2400>虎啸</font>",
                onremove:true,
                unique:true,
                intro:{
                    content:"players",
                    name:"<font color= #FF2400>虎啸</font>",
                },
                mod:{
                    cardname:function(card, player, name){
                        if (get.suit(card) == "heart") return "sha";
                    },
                    cardnature:function(card,player){
                        if (get.suit(card) == "heart") return 'fire';
                    },
                    cardUsableTarget:function (card, player, target) {
                        if (player.storage.firehuxiao_red && player.storage.firehuxiao_red.includes(target) && card.name == "sha" && game.hasNature(card, "fire")) return true;
                    },
                },
                ai:{
                    threaten:1.5,
                    effect:{
                        target:function(card,player,target,current){
                            if(get.tag(card,'respondSha')&&current<0) return 0.6
                        },
                    },
                    respondSha:true,
                },
                sub:true,
                sourceSkill:"firehuxiao",
            },
        },
        "_priority":0,
    },
    firefengming:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiValue: function(player, card, num) {
                if (get.name(card, player) === "tengja" || get.name(card, player) === "rewrite_tengjia") {
                    return Math.min(compareValue(player, "tao") * 0.8, compareValue(player, "shan") * 0.8, compareValue(player, "jiu") * 0.8, compareValue(player, "wuxie") * 0.8, num * 2);
                }
            },
            aiUseful: function(player, card, num) {
                return lib.skill.firefengming.mod.aiValue.apply(this, arguments);
            },
        },
        mark:true,
        marktext:"<font color= #FF2400>凤鸣</font>",
        intro:{
            mark: function(dialog, storage, player) {
                const key = _status.currentPhase === player;
                if (key) {
                    return '本回合凤鸣剩余次数：' + player.firefengming_inPhase;
                } else {
                    return '本回合凤鸣剩余次数：' + player.firefengming_outPhase;
                }
            },
            markcount: function(storage, player) {
                const key = _status.currentPhase === player;
                let count = 0;
                if (key) {
                    count = player.firefengming_inPhase;
                } else {
                    count = player.firefengming_outPhase;
                }
                return count;
            },
            onunmark: true,
            name:"<font color= #FF2400>凤鸣</font>",
        },
        trigger:{
            player:"dying",
            global:["phaseBefore","phaseAfter"],
        },
        locked:false,
        direct:true,
        async init(player,skill){
            if (!player.firefengming_inPhase) player.firefengming_inPhase = 2;
            if (!player.firefengming_outPhase) player.firefengming_outPhase = 1;
            player.markSkill(skill);
        },
        filter:function (event, player, name) {
            if (name == 'dying') {
                if(_status.currentPhase === player) {
                    return player.firefengming_inPhase > 0;
                } else {
                    return player.firefengming_outPhase > 0;
                }
            } else {
                player.firefengming_inPhase = 2;
                player.firefengming_outPhase = 1;
                player.markSkill('firefengming');
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseBefore" || Time == "phaseAfter") return;
            const phdisnum = player.getCards('h').length;
            const pDhp = player.getDamagedHp();
            const Shu = game.filterPlayer(function(current) {
                return current.group == 'shu';
            }).length;
            const numdraws = pDhp + Shu;
            let result = await player.chooseBool(get.prompt2("firefengming")).set('ai', function() {
                return firefengmingAI(player) > 0;
            }).forResult();
            if (result.bool) {
                if(_status.currentPhase === player) {
                    player.firefengming_inPhase --;
                } else {
                    player.firefengming_outPhase --;
                }
                player.markSkill('firefengming');
                player.logSkill(event.name);
                if (phdisnum > 0) await player.chooseToDiscard(phdisnum, true, 'h');
                await player.gainCardsNumbersAndNames(numdraws);
                const cards = player.getCards('he');
                if (cards.length >= 3) {
                    let result = await player.chooseToDiscard(3, true, 'he').set('ai', function (card) {
                        let typelist = [];
                        for (let card of cards) {
                            const type = get.type(card);
                            if (!typelist.includes(type)) {
                                typelist.push(type);
                            }
                        }
                        if (typelist.length >= 3) {
                            const type = get.type(card);
                            for (let selectedCard of ui.selected.cards) {
                                if (get.type(selectedCard) === type) return false;
                            }
                            return true;
                        } else {
                            return true;
                        }
                    }).forResult();
                    if (result.cards) {
                        let types = new Set();
                        result.cards.forEach(card => types.add(get.type(card)));
                        if (types.size === 2) {
                            player.recover();
                        } else if (types.size === result.cards.length) {
                            player.recover(1 - player.hp);
                        }
                    }
                }
            }
        },
        ai:{
            maixie:true,
            "maixie_hp":true,
            threaten: 1.5,
            effect:{
                target:function (card, player, target) {
                    if (get.tag(card, "damage")) {
                        if (!target.hasFriend()) return;
                        const shouyi = firefengmingAI(target);
                        const key = _status.currentPhase === target;
                        if (key) {
                            if (target.firefengming_inPhase > 0 && target.hp <= 1) {
                                return [1, shouyi];
                            }
                        } else {
                            if (target.firefengming_outPhase > 0 && target.hp <= 1) {
                                return [1, shouyi];
                            }
                        }
                    }
                },
            },
        },
        "_priority":0,
    },
    //张星彩
    fireshenxian:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #FF2400>甚贤</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #FF2400>甚贤</font>",
        },
        trigger:{
            global:["useCard", "roundStart"],
        },
        filter:function(event, player, name) {
            if (name == 'useCard') {
                if (event.player == player) return false;
                if (!event.targets|| event.targets.length === 0) return false;
                if (!event.targets.includes(player)) return false;
                if (player.getStorage('fireshenxian').includes(event.player)) return false;
                return true;
            } else if (name == "roundStart") {
                player.removeStorage('fireshenxian');
                player.unmarkSkill('fireshenxian');
                return;
            }
        },
        locked:true,
        direct:true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'useCard') {
                let cards = await player.gainCardsSuitsAndNumbers(3);
                if (cards) {
                    player.logSkill(event.name);
                    if (!player.getStorage('fireshenxian').includes(trigger.player)) {
                        player.markAuto('fireshenxian', [trigger.player]);
                    }
                }
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    if (!player.getStorage('fireshenxian').includes(target)) return 3;
                    else return 1;
                } else return 0.5;
            },
        },
        "_priority":1314,
    },
    fireqiangwu:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #FF2400>哀</font>",
        onremove:function(player, skill) {
            const cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro:{
            content:"expansion",
            markcount:"expansion",
            name:"<font color= #FF2400>哀</font>",
        },
        mod:{
            targetInRange:function(card, player, target){
                if(card.fireqiangwu) return true;
            },
        },
        enable: ["chooseToUse", "chooseToRespond"],
        prompt:"你可以将两张与「哀」花色不同且花色不同的手牌，当「雷杀」使用或打出(无距离限制)，并摸一张牌！",
        async init(player, skill) {
            if(!player.fireqiangwu_suit) player.fireqiangwu_suit = undefined;
            if(!player.checkQiangWu) player.checkQiangWu = function(type = 'filter') {
                const hscards = player.getCards('hs');
                const excards = player.getExpansions('fireqiangwu');
                const suit = player.fireqiangwu_suit;
                if (type === 'filter') {
                    if (!excards || excards.length === 0) return false;
                    if (!hscards || hscards.length < 2) return false;
                    if (!suit || typeof suit !== "string") return false;
                    const othersuits = hscards.filter(card => get.suit(card) !== suit);
                    const suits = new Set();
                    for (let card of othersuits) {
                        const suit = get.suit(card, player);
                        if(suit){
                            suits.add(suit);
                            if (suits.size >= 2) return true;
                        }
                    }
                    return false;
                } else if (string === 'cards') {
                    const sameSuit = {"club": [], "spade": [], "diamond": [], "heart": []};
                    sameSuit.club = hscards.filter(card => get.suit(card) === "club").sort((a,b) => get.value(a,player) - get.value(b,player));
                    sameSuit.spade = hscards.filter(card => get.suit(card) === "spade").sort((a,b) => get.value(a,player) - get.value(b,player));
                    sameSuit.diamond = hscards.filter(card => get.suit(card) === "diamond").sort((a,b) => get.value(a,player) - get.value(b,player));
                    sameSuit.heart = hscards.filter(card => get.suit(card) === "heart").sort((a,b) => get.value(a,player) - get.value(b,player));
                    if(sameSuit[suit]) sameSuit[suit] = [];
                    return sameSuit;
                } else {
                    return false;
                }
            }
        },
        filter:function(event, player) {
            return player.checkQiangWu();
        },
        locked:false,
        unique:true,
        filterCard:function(card, player, event) {
            const suit = player.fireqiangwu_suit;
            if (!suit || typeof suit !== "string") return false;
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const Vcard = { name: "sha", nature: "thunder", isCard: true, fireqiangwu: true };
            if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) {
                const selectedCards = ui.selected.cards;
                const suitcard = get.suit(card, player);
                const selectedSuits = selectedCards.map(c => get.suit(c, player));
                return suitcard !== suit && !selectedSuits.includes(suitcard); 
            }
            return false;
        },
        viewAs: function (cards, player) {
            return { name: "sha", nature: "thunder", isCard: true, fireqiangwu: true };
        },
        selectCard:2,
        position:"hs",
        complexCard: true,
        check:function(card) {
            const player = get.owner(card);
            const Vcard = { name: "sha", nature: "thunder", isCard: true };
            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                let getValuecards = [];
                let diffSuit = [];
                const sortedCards = player.getCards('hs').sort((a, b) => get.value(a, player) - get.value(b, player));
                for (let i = 0; i < sortedCards.length; i++) {
                    const suit = get.suit(sortedCards[i], player);
                    if (suit && !diffSuit.includes(suit)) {
                        diffSuit.push(suit);
                        getValuecards.push(sortedCards[i]);
                    }
                }
                if (getValuecards.length >= 2 && get.value(getValuecards[0], player) < compareValue(player, "tao") && get.value(getValuecards[1], player) < compareValue(player, "tao")) {
                    if (getValuecards.includes(card)) return 1;
                    else return 0;
                }
            }
            return 0;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result, player) {
            const VCard = result.card;
            const suit = player.fireqiangwu_suit;
            if (VCard) {
                await player.specifyCards(suit);
            }
        },
        precontent: async function () {
            //无
        },
        hiddenCard: function (player, name) {
            if (name == 'sha') return player.checkQiangWu();
            return false;
        },
        ai:{
            respondSha:true,
            threaten: 1.5,
            skillTagFilter:function (player, tag) {
                if (tag === "respondSha") return player.checkQiangWu();
            },
            order:function (item, player) {
                return compareValue(get.player(), { name: "sha", nature: "thunder", isCard: true, fireqiangwu: true }) + 0.15;
            },
        },
        group:['fireqiangwu_judge'],
        subSkill:{
            judge:{
                audio: "fireqiangwu",
                trigger:{
                    player:["phaseUseBefore", "phaseUseAfter"],
                    global:["dying"],
                },
                locked:false,
                filter:function (event, player, name) {
                    if(name == 'phaseUseBefore') {
                        return true;
                    } else if(name == 'phaseUseAfter') {
                        return player.getExpansions('fireqiangwu').length > 0;
                    } else if(name == 'dying') {
                        const reason = event.reason;
                        return reason && reason.card && reason.card?.fireqiangwu;
                    }
                },
                async cost(event, trigger, player) {
                    const Time = event.triggername;
                    if(Time == 'phaseUseBefore') {
                        const prompt = setColor('〖枪舞〗：是否要进行一次判定，并将此判定牌暂时于此阶段置于武将牌上称为「哀」？');
                        const result = await player.chooseBool(prompt).set('ai', () => {
                            return true;
                        }).forResult();
                        if (result.bool) {
                            const judgeResult = await player.judge('fireqiangwu', function (card) {
                                const suitValues = { 'spade': -1, 'heart': 2, 'club': -2, 'diamond': 1 };
                                return suitValues[get.suit(card)];
                            }).forResult();
                            if (judgeResult?.card && get.suit(judgeResult?.card)) {
                                event.result = {
                                    bool: true,
                                    cost_data: judgeResult.card,
                                }
                            }
                        }
                    } else if(Time == 'phaseUseAfter') {
                        await player.discard(player.getExpansions('fireqiangwu'));
                    } else if(Time == 'dying') {
                        if(player.getExpansions('fireqiangwu').length > 0) {
                            await player.discard(player.getExpansions('fireqiangwu'));
                        }
                        const otherPlayers = game.filterPlayer(o => o != player && o.hasSkill('fireqiangwu_suit'));
                        if (otherPlayers.length) {
                            player.line(otherPlayers, 'thunder');
                            for (const target of otherPlayers) {
                                target.removeSkill('fireqiangwu_suit');
                            }
                        }
                        player.tempDisSkills('fireqiangwu', { player: 'phaseUseAfter' });
                        player.addTempSkill('fire_hz', { player: 'phaseUseAfter' });
                    }
                },
                async content(event, trigger, player) {
                    const card = event.cost_data;
                    if (card) {
                        player.fireqiangwu_suit = card.suit;
                        await player.addToExpansion([card], 'giveAuto', player).set('gaintag',['fireqiangwu']);
                        const otherPlayers = game.filterPlayer(o => o != player);
                        if (otherPlayers.length) {
                            player.line(otherPlayers, 'fire');
                            for (const target of otherPlayers) {
                                if (!target.fireqiangwu_suit) target.fireqiangwu_suit = undefined;
                                target.fireqiangwu_suit = card.suit;
                                if(!target.hasSkill('fireqiangwu_suit')) target.addTempSkill('fireqiangwu_suit');
                                target.markSkill('fireqiangwu_suit');
                            }
                        }
                    }
                },
                sub: true,
                unique: true,
                sourceSkill: "fireqiangwu",
                "_priority": 1314,
            },
            suit:{
                marktext:"<font color= #FF2400>敬</font>",
                intro:{
                    content: function (storage, player) {
                        const suit = player.fireqiangwu_suit;
                        let TXT = "不能使用或打出的花色为：";
                        if (suit && typeof suit === "string") {
                            const fanyi = get.translation(suit);
                            TXT += fanyi;
                        } else {
                            TXT += "无";
                        }
                        return TXT;
                    },
                    onunmark: true,
                    name: "<font color= #FF2400>敬</font>",
                },
                mod:{
                    cardEnabled:function(card, player) {
                        const suit = player.fireqiangwu_suit;
                        const suitcard = get.suit(card, player);
                        if (suit && typeof suit === "string") {
                            if (suitcard === suit) return false;
                        }
                    },
                    cardRespondable:function(card, player) {
                        const suit = player.fireqiangwu_suit;
                        const suitcard = get.suit(card, player);
                        if (suit && typeof suit === "string") {
                            if (suitcard === suit) return false;
                        }
                    },
                    cardSavable:function(card, player) {
                        const suit = player.fireqiangwu_suit;
                        const suitcard = get.suit(card, player);
                        if (suit && typeof suit === "string") {
                            if (suitcard === suit) return false;
                        }
                    },
                },
                sub: true,
                superCharlotte: true,
                charlotte: true,
                unique: true,
                sourceSkill: "fireqiangwu",
                "_priority": Infinity,
            },
        },
        "_priority": 1314,
    },
    fireyuzhui:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        shaRelated:true,
        trigger:{
            source:["damageAfter"],
            player:["phaseEnd"],
        },
        filter:function(event, player, name) {
            if(name == 'damageAfter') {
                const cards = player.getExpansions('fireqiangwu');
                if (!cards || cards.length === 0) return false;
                const key1 = event.card && event.card.name === 'sha';
                const key2 = event.num && event.num > 0;
                return key1 && key2 && player.countCards('he') > 0;
            } else if(name == 'phaseEnd') {
                return player.getHistory('sourceDamage').length > 1
            }
        },
        locked:false,
        async cost(event, trigger, player) {
            const Time = event.triggername;
            if(Time == 'damageAfter') {
                const prompt = setColor('〖玉追〗：是否要弃置一张牌？若如此做：①重置杀的使用次数；②若此牌与「哀」花色相同时，随机获得一张非「哀」花色牌。');
                const result = await player.chooseCard(prompt, 'he', 1).set("ai", function(card) {
                    const cards = player.getExpansions('fireqiangwu');
                    if (!cards || cards.length === 0) return 0;
                    const suit = player.fireqiangwu_suit;
                    if(suit && typeof suit === "string") {
                        const suitcard = get.suit(card, player);
                        const value = get.value(card, player);
                        if(suitcard === suit && value < compareValue(player, "tao")) {
                            return 1;
                        } else if(value < compareValue(player, "tao")) {
                            return 1;
                        } else {
                            return 0;
                        }
                    } else {
                        return 0;
                    }
                }).forResult();
                if (result.bool) {
                    event.result = {
                        bool: true,
                        cost_data: {
                            cards: result.cards,
                            damage: 0,
                        },
                    }
                }
            } else if(Time == 'phaseEnd') {
                event.result = {
                    bool: true,
                    cost_data: {
                        cards: [],
                        damage: player.getHistory('sourceDamage').length,
                    },
                }
            }
        },
        async content(event, trigger, player) {
            const cards = event.cost_data?.cards;
            const damage = event.cost_data?.damage;
            if (cards && cards.length) {
                await player.discard(cards);
                if (trigger.addCount !== false) {
                    trigger.addCount = false;
                    trigger.source.getStat().card.sha = 0;
                }
                const setsuitslist = ["spade", "heart", "diamond", "club"];
                const suit = player.fireqiangwu_suit;
                if (!suit && typeof suit !== "string") return;
                const newsuits = setsuitslist.filter(o => o !== suit);
                const suitcard = get.suit(cards[0], player);
                if (suitcard && suitcard === suit) {
                    const newsuit = newsuits[Math.floor(Math.random() * newsuits.length)];
                    await player.specifyCards(newsuit);
                }
            }
            if (damage && damage > 0) {
                lib.translate['fireshenxian_fireyuzhuiAfter'] = "甚贤";
                const next = game.createEvent('fireshenxian_fireyuzhuiAfter');
                next.num = player.getHistory('sourceDamage').length;
                next.player = player;
                next.setContent(async function (event, trigger, player) {
                    player.logSkill('fireshenxian');
                    const num = event.num;
                    if (num > 0) {  
                        await player.recover(num);
                    }
                    await player.gainCardsSuitsAndNumbers(3);
                });
                await next;
            }
        },
        "_priority":0,
    },
    //赵襄
    firefengpo:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiValue: function(player, card, num) {
                const marks = player.countMark('firefengpo');
                if (!marks || marks <= 0) return num;
                const suit = get.suit(card, player);
                let Vcard;
                switch (suit) {
                    case "diamond": Vcard = { name: "sha", nature: 'fire', isCard: true }; break;
                    case "club":    Vcard = { name: "shan", isCard: true }; break;
                    case "heart":   Vcard = { name: "tao", isCard: true }; break;
                    case "spade":   Vcard = { name: "wuxie", isCard: true }; break;
                    default: return num;
                }
                return Math.max(num, get.value(Vcard, player));
            },
            aiUseful: function(player, card, num) {
                return lib.skill.firefengpo.mod.aiValue.apply(this, arguments);
            },
        },
        mark:true,
        marktext:"<font color= #FF2400>凤魄</font>",
        intro:{
            content:function(storage, player) {
                const nummark = player.countMark('firefengpo');
                return '「凤魄」标记数量为' + nummark;
            },
            name:"<font color= #FF2400>凤魄</font>",
        },
        trigger:{
            player:["useCard"],
            target:"useCardToTargeted",
        },
        locked:false,
        direct:true,
        async init(player, skill) {
            await initlonghun(player, skill);
        },
        filter:function(event, player) {
            const card = event.card;
            if (!card) return false;
            const type = get.type(card);
            if (!type) return false;
            return type === 'basic';
        },
        async content(event, trigger, player) {
            player.addMark('firefengpo', 1);
        },
        group:["firefengpo_longhun"],
        subSkill:{
            longhun: {
                audio: "firefengpo",
                enable: ["chooseToUse", "chooseToRespond"],
                prompt: "你可以弃置一枚「凤魄」标记来发动〖龙魂〗并摸一张牌。",
                unique: true,
                locked: false,
                filter: function (event, player) {
                    const marks = player.countMark('firefengpo');
                    if (!marks || marks <= 0) return;
                    const filter = event.filterCard;
                    if (filter(get.autoViewAs({ name: "sha", nature: "fire" }, "unsure"), player, event) && player.countCards("hes", { suit: "diamond" })) return true;
                    if (filter(get.autoViewAs({ name: "shan" }, "unsure"), player, event) && player.countCards("hes", { suit: "club" })) return true;
                    if (filter(get.autoViewAs({ name: "tao" }, "unsure"), player, event) && player.countCards("hes", { suit: "heart" })) return true;
                    if (filter(get.autoViewAs({ name: "wuxie" }, "unsure"), player, event) && player.countCards("hes", { suit: "spade" })) return true;
                    return;
                },
                filterCard: function (card, player, event) {
                    if (ui.selected.cards.length) return get.suit(card, player) == get.suit(ui.selected.cards[0], player);
                    event = event || _status.event;
                    const filter = event._backup.filterCard;
                    const name = get.suit(card, player);
                    if (name == "diamond" && filter(get.autoViewAs({ name: "sha", nature: "fire" }, "unsure"), player, event)) return true;
                    if (name == "club" && filter(get.autoViewAs({ name: "shan" }, "unsure"), player, event)) return true;
                    if (name == "heart" && filter(get.autoViewAs({ name: "tao" }, "unsure"), player, event)) return true;
                    if (name == "spade" && filter(get.autoViewAs({ name: "wuxie" }, "unsure"), player, event)) return true;
                    return false;
                },
                viewAs: function (cards, player) {
                    if (cards.length) {
                        let viewcard = false;
                        let viewnature = "";
                        switch (get.suit(cards[0], player)) {
                            case "diamond": viewcard = "sha"; viewnature = "fire"; break;
                            case "club": viewcard = "shan"; break;
                            case "heart": viewcard = "tao"; break;
                            case "spade": viewcard = "wuxie"; break;
                        }
                        if (viewcard) return { name: viewcard, nature: viewnature };
                    }
                    return null;
                },
                position: "hes",
                selectCard: [1,2],
                complexCard: true,
                check: function (card) {
                    const player = get.owner(card);
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
                        const marks = player.countMark('firefengpo');
                        if (!marks || marks <= 0) return order;
                        const skillkey = player.hasSkill('firefengpo') && !player.hasSkill('firejueqi') && !player.hasSkill('fireyigong');
                        const object = { sha: "diamond", shan: "club", tao: "heart", wuxie: "spade" };
                        const keys = Object.keys(object);
                        for (let key of keys) {
                            const hasSuits = player.countCards("hes", { suit: object[key] });
                            if (hasSuits > 0) {
                                let Vcard = { name: key, nature: key === "sha" ? 'fire' : '', isCard: true };
                                const Vorder = get.order(Vcard);
                                if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                    if(skillkey && player.countCards("hes", { name: key }) > 0 && (key !=='tao' || key !=='jiu')){
                                        order = Vorder * 0.8 + addorder;
                                    } else {
                                        order = Vorder * 1.2 + addorder;
                                    }
                                } else {
                                    order = Vorder * 0.5 + addorder / 5;
                                }
                                if (order >= Vorder) {
                                    const selectedCards = ui.selected.cards;
                                    if (selectedCards.length === 0) {
                                        return get.value(card) <= compareValue(player,'tao') * 1.25;
                                    }
                                    if (selectedCards.length > 0) {
                                        const target = _status.currentPhase;
                                        if (target && get.attitude(player, target) >= 2 && ["spade","club"].includes(object[key])) {
                                            return 0;
                                        } else {
                                            return get.value(card) <= Math.min(compareValue(player,'tao') * 0.98 , compareValue(player,'shan') * 0.98, compareValue(player,'wuxie') * 0.98);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return 1;
                },
                onrespond: function () {
                    return this.onuse.apply(this, arguments);
                },
                onuse: async function (result, player) {
                    player.removeMark("firefengpo", 1);
                    player.draw();
                    await setlonghun(result, player);
                },
                hiddenCard: function (player, name) {
                    const marks = player.countMark('firefengpo');
                    if (!marks || marks <= 0) return false;
                    if (name == 'sha') return player.countCards("hes", { suit: "diamond" }) > 0;
                    if (name == 'shan') return player.countCards("hes", { suit: "club" }) > 0;
                    if (name == 'tao') return player.countCards("hes", { suit: "heart" }) > 0;
                    if (name == 'wuxie') return player.countCards("hes", { suit: "spade" }) > 0;
                    return false;
                },
                ai: {
                    respondSha: true,
                    respondShan: true,
                    recover: true,
                    save: true,
                    respondTao: true,
                    tag: {
                        recover: 1,
                        save: 1,
                    },
                    skillTagFilter: function (player, tag) {
                        const marks = player.countMark('firefengpo');
                        let suit;
                        switch (tag) {
                            case "respondSha": suit = "diamond"; break;
                            case "respondShan": suit = "club"; break;
                            case "save": suit = "heart"; break;
                            case "recover": suit = "heart"; break;
                            case "respondTao": suit = "heart"; break;
                        }
                        if (!player.countCards("hes", { suit: suit })) return false;
                        if (!marks || marks <= 0) return false;
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
                            const marks = player.countMark('firefengpo');
                            if (!marks || marks <= 0) return order;
                            const skillkey = player.hasSkill('firefengpo') && !player.hasSkill('firejueqi') && !player.hasSkill('fireyigong');
                            const object = { sha: "diamond", shan: "club", tao: "heart", wuxie: "spade" };
                            const keys = Object.keys(object);
                            for (let key of keys) {
                                const hasSuits = player.countCards("hes", { suit: object[key] });
                                if (hasSuits > 0) {
                                    let Vcard = { name: key, nature: key === "sha" ? 'fire' : '', isCard: true };
                                    const Vorder = get.order(Vcard);
                                    if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                        if(skillkey && player.countCards("hes", { name: key }) > 0 && (key !=='tao' || key !=='jiu')){
                                            order = Vorder * 0.8 + addorder;
                                        } else {
                                            order = Vorder * 1.2 + addorder;
                                        }
                                    } else {
                                        order = Vorder * 0.5 + addorder / 5;
                                    }
                                    return Math.max(order, 2);
                                }
                            }
                        }
                        return Math.max(addorder, 2);
                    },
                },
                sub: true,
                sourceSkill: "firefengpo",
            },
        },
        "_priority":1314,
    },
    firehunyou:{
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
            player:["phaseDrawBegin","phaseUseBegin"]
        },
        unique:true,
        locked:true,
        direct:true,
        async init(player, skill) {
            await initfirehunyou(player, skill);
        },
        filter:function(event, player, name){
            if (name == 'phaseDrawBegin') {
                return !event.numFixed;
            } else if (name == 'phaseUseBegin') {
                return player.countMark('firefengpo') >= 5;
            } else if (name == 'phaseUseEnd') {
                return true;
            }
        },
        derivation: ["firejueqi","fireyigong"],
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'phaseDrawBegin') {
                const setlist = [
                    '继续，战斗！',
                    '为了你们，我会战斗到最后一刻。',
                    '我是龙魂的继承者！'
                ];
                const num = Math.floor(Math.random() * setlist.length);
                game.playAudio('..', 'extension', '银竹离火/audio/skill', event.name + '_draw' + (num + 1));
                player.chat(setlist[num]);
                trigger.num = 3;
            } else if (Time == 'phaseUseBegin') {
                player.logSkill(event.name);
                player.clearMark('firefengpo');
                player.recover();
                player.draw(2);
                player.addTempSkill('firejueqi');
                player.addTempSkill('fireyigong');
            }
        },
        ai:{
            threaten:3,
        },
        "_priority": Infinity,
    },
    firejueqi:{
        audio:"ext:银竹离火/audio/skill:4",
        enable:"phaseUse",
        usable: 2,
        unique:true,
        locked:false,
        direct:true,
        filter: function (event, player) {
            return player.getCards("he").length > 0;
        },
        filterTarget:function(card, player, target) {
            const skilllists = ["fire_yijue",'fire_fengyin'];
            for(let skill of skilllists){
                if(target.hasSkill (skill)) return false;
            }
            return player != target && target.getCards("h").length > 0;
        },
        selectTarget: 1,
        line: "fire",
        filterCard:true,
        position:"he",
        check:function(card) {
            const player = get.owner(card);
            const cards = player.getCards('he').sort((a, b) => get.value(a, player) - get.value(b, player));
            return get.value(card, player) <= get.value(cards[0], player);
        },
        async content(event, trigger, player) {
            const chat = [
                "逝者如斯，亘古长流，唯英烈之魂悬北斗而长存！",
                "赵氏之女，跪祈诸公勿渡黄泉，暂留人间，佑大汉万年！",
                "龙凤在侧，五虎在前，天命在汉，既寿永昌！",
                "人言为信，日月为明，言日月为证，佑大汉长明！"
            ];
            const target = event.target;
            player.chatSkill('firejueqi', chat, target, 'fire');
            let result = await target.chooseCard(true, 'h').set('ai', function(card) {
                const att = get.attitude(target, player);
                const cards = target.getCards('h');
                const valueT = get.value(card, target);
                const valueP = get.value(card, player);

                const reds = cards.filter(c => get.color(c) === 'red');
                const blacks = cards.filter(c => get.color(c) === 'black');

                const sortfriend = cards.sort((a, b) => get.value(b, player) - get.value(a, player));
                const sortenemy = cards.sort((a, b) => get.value(a, target) - get.value(b, target));

                if (att >= 2) {
                    if (target.isDamaged()) {
                        if (reds && reds.length > 0) {
                            const sortreds = reds.sort((a,b) => get.value(a, target) - get.value(b, target));
                            return valueT <= get.value(sortreds[0], target);
                        }
                        const sortblacks = blacks.sort((a,b) => get.value(b, player) - get.value(a, player));
                        return valueP >= get.value(sortblacks[0], player);
                    } else {
                        return valueP >= get.value(sortfriend[0], player);
                    }
                } else {
                    const skilllists = target.countSkills();
                    if (!skilllists  || skilllists.length === 0) {
                        if (blacks && blacks.length > 0) {
                            const sortblacks = blacks.sort((a,b) => get.value(a, target) - get.value(b, target));
                            return valueT <= get.value(sortblacks[0], target);
                        }
                        return valueT <= get.value(sortenemy[0], target);
                    } else {
                        let getEffect = [];
                        for(let skill of skilllists){
                            const effect = lib.skill[skill]?.ai?.effect;
                            if (effect && (typeof effect.player === 'function' || typeof effect.target === 'function')) {
                                getEffect.push(skill);
                            }
                        }
                        if (getEffect.length) {
                            let lockedSkills = [];//锁定技
                            let unlockedSkills = [];//非锁定技
                            for (let skill of getEffect) {
                                if (get.is.locked(skill, target)) {
                                    lockedSkills.push(skill);
                                } else {
                                    unlockedSkills.push(skill);
                                }
                            }
                            if (unlockedSkills.length > lockedSkills.length) {
                                if (blacks && blacks.length > 0) {
                                    const sortblacks = blacks.sort((a,b) => get.value(a, target) - get.value(b, target));
                                    return valueT <= get.value(sortblacks[0], target);
                                }
                                return valueT <= get.value(sortenemy[0], target);
                            } else {
                                if (reds && reds.length > 0) {
                                    const sortreds = reds.sort((a,b) => get.value(a, target) - get.value(b, target));
                                    return valueT <= get.value(sortreds[0], target);
                                }
                                return valueT <= get.value(sortenemy[0], target);
                            }
                        } else {
                            if (blacks && blacks.length > 0) {
                                const sortblacks = blacks.sort((a,b) => get.value(a, target) - get.value(b, target));
                                return valueT <= get.value(sortblacks[0], target);
                            }
                            return valueT <= get.value(sortenemy[0], target);
                        }
                    }
                }
            }).forResult();
            if (result.bool) {
                let card = result.cards[0];
                target.showCards(card);
                const color = get.color(card);
                if (color == 'black') {
                    if (!target.hasSkill('fire_yijue')) target.addTempSkill('fire_yijue');
                    target.discard(card, target, true);
                    let result = await target.chooseBool('是否令'+get.translation(player)+'失去一点体力，然后'+get.translation(player)+'摸一张牌？').set('ai', function() {
                        return get.attitude(target, player) < 2;
                    }).forResult();
                    if (result.bool) {
                        player.loseHp();
                        player.draw();
                    }
                } else if (color =='red') {
                    if (!target.hasSkill('fire_fengyin')) target.addTempSkill('fire_fengyin');
                    player.gain(card, target, 'give', 'bySelf');
                    if (target.isDamaged()) {
                        let result = await player.chooseBool('是否令'+get.translation(target)+'回复一点体力，并令'+get.translation(target)+'摸一张牌？').set('ai', function() {
                            return get.recoverEffect(target, player, player) > 0;
                        }).forResult();
                        if (result.bool) {
                            target.recover();
                            target.draw();
                        }
                    }
                }
            }
        },
        ai:{
            order: 10,//待定
            threaten: 3.5,
            result:{
                target:function(player, target){
                    const cards = player.getCards('he').sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (!cards || cards.length < 3) return 0;
                    if (target.countCards("h") > target.hp + 1 && get.recoverEffect(target, player, player) > 0) return 1;
                    const enemys = game.filterPlayer(current => current != player && get.attitude(player, current) < 2 && current.countCards("h") > 0);
                    if (!enemys || enemys.length === 0) return 0;
                    if (get.value(cards[0], player) >= compareValue(player , 'tao')) return 0;
                    if (getAliveNum(player,1) <= 0) return 0;
                    let canUsedamage = false;
                    const damagecards = cards.filter(card => get.tag(card, 'damage'));
                    if (damagecards && damagecards.length > 0) {
                        for(let card of damagecards) {
                            const effect = get.effect(target, card, player, player);
                            if (player.canUse(card, target) && effect > 0) {
                                canUsedamage = true;
                            }
                        }
                    }
                    let firefengpoKey = false;
                    if (player.hasSkill('firefengpo')) {
                        if (player.canUse("sha", target) && (player.countCards("hes", { name: "sha" }) > 0 || player.countCards("hes", { suit: "diamond" }) > 0)) {
                            const key = player.countCards("hes", { suit: "diamond" }) > 0;
                            let Vcard = { name: "sha", nature:  key ? "fire" : "", isCard: true };
                            const effect = get.effect(target, Vcard, player, player);
                            if (effect > 0) firefengpoKey = true;
                        }
                    }
                    if (canUsedamage || firefengpoKey) return -2;
                    return 0;
                },
            },
        },
        "_priority":0,
    },
    fireyigong:{
        audio:"ext:银竹离火/audio/skill:4",
        mod:{
            aiValue: function(player, card, num) {
                if (get.name(card, player) === "tengja" || get.name(card, player) === "rewrite_tengjia") {
                    return - 5;
                }
            },
            aiUseful: function(player, card, num) {
                return lib.skill.fireyigong.mod.aiValue.apply(this, arguments);
            },
        },
        trigger:{
            source:"damageBegin",
            global:"dieAfter",
        },
        filter:function(event, player, name){
            if (name == 'damageBegin') {
                const card = event.card;
                if (!card || card.name !== 'sha') return false;
                const cards = event.cards
                if (!cards || cards.length !== 1) return false;
                return cards[0].name === 'sha';
            } else {
                return event.source && event.source === player;
            }
        },
        unique:true,
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            const chat = [
                "凝傲雪之梅为魄，英魂长存，独耀山河万古明！",
                "铸凌霜之寒成剑，青锋出鞘，斩尽天下不臣贼！",
                "当年明月凝霜刃，此日送尔渡黄泉！",
                "已识万里乾坤大，何虑千山草木青！"
            ];
            const Time = event.triggername;
            if (Time == 'damageBegin') {
                const target = trigger.player;
                let result = await player.chooseBool(get.prompt2(event.name)).set('ai', function(bool){
                    const att = get.attitude(player, target);
                    if (att >= 2) return false;
                    if (player.hasSkillTag("nofire", false, target)) return true;
                    if (player.hasSkillTag("nodamage", false, target)) return true;
                    if (target.hasSkillTag("filterDamage", false, player)) return false;
                    if (target.hasSkillTag("nodamage", false, player)) return false;
                    if (getAliveNum(player, 1) > 0 ) return true;
                    return false;
                }).forResult();
                if (result.bool) {
                    player.chatSkill(event.name, chat, target, 'fire');
                    player.draw();
                    player.damage(1, "fire");
                    trigger.num += 1;
                    if (trigger.addCount !== false) {
                        trigger.addCount = false;
                        player.getStat().card.sha = 0;
                        player.storage.sunquanmou = true;
                    }
                }
            } else {
                player.clearMark('firefengpo');
                player.tempBanSkill('fireyigong');
            }
        },
        ai:{
            expose: 1,
            threaten: 2,
        },
        "_priority":0,
    },
    fire_fengyin:{//封印
        marktext:"<font color= #FF2400>封印</font>",
        async init(player, skill) {
            player.addSkillBlocker(skill);
            player.addTip(skill, "非锁定技失效");
        },
        onremove:function (player, skill) {
            player.unmarkSkill(skill);
            player.removeSkillBlocker(skill);
            player.removeTip(skill);
        },
        superCharlotte:true,
        charlotte:true,
        skillBlocker:function (skill, player) {
            return !lib.skill[skill].persevereSkill && !lib.skill[skill].charlotte && !get.is.locked(skill, player);
        },
        mark:true,
        intro:{
            content:function (storage, player, skill) {
                var list = player.getSkills(null, false, false).filter(function (i) {
                    return lib.skill.fire_fengyin.skillBlocker(i, player);
                });
                if (list.length) return "失效技能：" + get.translation(list);
                return "无失效技能";
            },
        },
    },
    fire_yijue:{//义绝
        marktext:"<font color= #FF2400>义绝</font>",
        async init(player, skill) {
            player.addSkillBlocker(skill);
            player.addTip(skill, "锁定技失效");
        },
        onremove:function (player, skill) {
            player.unmarkSkill(skill);
            player.removeSkillBlocker(skill);
            player.removeTip(skill);
        },
        superCharlotte:true,
        charlotte:true,
        skillBlocker:function (skill, player) {
            return !lib.skill[skill].persevereSkill && !lib.skill[skill].charlotte && get.is.locked(skill, player);
        },
        mark:true,
        intro:{
            content:function (storage, player, skill) {
                var list = player.getSkills(null, false, false).filter(function (i) {
                    return lib.skill.fire_yijue.skillBlocker(i, player);
                });
                if (list.length) return "失效技能：" + get.translation(list);
                return "无失效技能";
            },
        },
    },
    //姜维
    firelinyan:{
        audio:"ext:银竹离火/audio/skill:6",
        mark :true,
        marktext:"<font color= #FF2400>麟焱</font>",
        intro: {
            content: function (storage, player) {
                const Vcards = player.firelinyan_countlists || [];
                const usedVcards = player.firelinyan_countChoosed || [];
                const formatCards = (cards) => {
                    return cards.map(card => {
                        const nature = card.nature ? get.translation(card.nature) : '';
                        const name = get.translation(card.name);
                        return nature + name;
                    }).join('、');
                };
                let result1 = "<font color=#FF2400>麟焱记录：</font>" + (Vcards.length ? formatCards(Vcards) : "无") + "；";
                let result2 = "<font color=#FF2400>已选择牌名：</font>" + (usedVcards.length ? formatCards(usedVcards) : "无") + "。";
                return result1 + "<br>" + result2;
            },
            markcount: function(num, player) {
                return (player.firelinyan_countlists && player.firelinyan_countlists.length) || 0;
            },
            name:"<font color= #FF2400>麟焱</font>",
        },
        trigger:{
            player:["dyingAfter"],
            global:["loseAfter","loseAsyncAfter","cardsDiscardAfter"],
        },
        locked:false,
        changeGroup:['shu','qun'],
        categories(skill, player) {
            const changeGroup = lib.skill[skill].changeGroup;
            if(Array.isArray(changeGroup) && changeGroup.length === 2) {
                return ['势力转化技'];
            } else {
                return [];
            }
        },
        async init(player, skill) {
            if (!player.firelinyan_changed) player.firelinyan_changed = false;
            if (!player.firelinyan_countMarks) player.firelinyan_countMarks = 0;
            if (!player.firelinyan_countlists) player.firelinyan_countlists = [];
            if (!player.firelinyan_countChoosed) player.firelinyan_countChoosed = [];
            await game.changeGroupSkill(player, skill);
            player.update();
        },
        changeSkins: async function (player) {
            const names = ["fire_jiangwei", "fire_jiangwei1"];
            if (!changeSkinskey) return;
            const skinsID = player.checkSkins();
            if (!names.includes(skinsID)) return;
            if (skinsID === "fire_jiangwei") {
                player.changeSkins(1);
            } else if (skinsID === "fire_jiangwei1") {
                player.changeSkins(0);
            }
        },
        filter:function (event, player, name) {
            if (name === 'dyingAfter') {
                return player.isAlive() && player.firelinyan_changed;
            } else {
                if (player.firelinyan_changed) return;
                const cards = event.getd();
                for (const i of cards) {
                    if (!get.tag(i, 'damage')) {
                        return true;
                    }
                }
                return; 
            }
        },
        derivation: ["fireranji"],
        async cost(event, trigger, player) {
            const Time = event.triggername;
            const changeSkins = get.info('firelinyan').changeSkins;
            if (Time == 'dyingAfter') {
                player.firelinyan_changed = false;
                player.firelinyan_countMarks = 0;
                player.firelinyan_countlists = [];
                player.firelinyan_countChoosed = [];
                for (let key in player.storage) {
                    if (key.startsWith('firelinyan')) {
                        player.storage[key] = false;
                    }
                }
                player.removeSkill('fireranji');
                if (player.group !== 'shu') player.changeGroup("shu");
                player.markSkill('firelinyan');
                const prompt = setColor("重置了技能〖麟焱〗。")
                game.log(player, prompt);
                await changeSkins(player);
            } else {
                const cards = trigger.getd();
                let newCount = 0; 
                for (const card of cards) {
                    const name = card.name;
                    const nature = card.nature || '';
                    const Vcard = { name: name, nature: nature, isCard: true };
                    if (!get.tag(card, 'damage') && !player.firelinyan_countlists.some(card => card.name === name && card.nature === nature)) {
                        player.firelinyan_countlists.push (Vcard);
                        player.markSkill('firelinyan');
                        newCount++;
                    }
                }
                player.firelinyan_countMarks += newCount;
                /**
                 * 每大于三的倍数一次,便执行一次！
                 */
                let count = player.firelinyan_countMarks;
                let level = 3;
                let getshowCards = [];
                while (count >= level) {
                    let levelChar = String.fromCharCode(65 + (level / 3) - 1);
                    let storageKey = `firelinyan${levelChar}`;
                    if (!player.storage[storageKey]) {
                        player.storage[storageKey] = true;
                        const Vcards = player.firelinyan_countlists;
                        const getCanChooseVcards = Vcards.filter(card => !player.firelinyan_countChoosed.some(used => {
                            return used.name === card.name && used.nature === card.nature;
                        }));
                        let lists = [];
                        for (const Vcard of getCanChooseVcards) {
                            const name = Vcard.name;
                            const nature = Vcard.nature;
                            const type = get.type(name);
                            lists.push([type, '', name, nature]);
                        }
                        if (lists && lists.length > 0) {
                            const prompt = setColor("〖麟焱〗：是否请选择一个记录牌牌？")
                            const chooseButton = await player.chooseButton([
                                prompt, [lists, "vcard"]
                            ]).set("ai", function (button) {
                                const sortedVcards = getCanChooseVcards.sort((a,b) => {
                                    const aValue = get.value(a, player);
                                    const bValue = get.value(b, player);
                                    if (bValue && aValue && aValue !== bValue) return bValue - aValue;
                                });
                                return button.link[2] === sortedVcards[0].name && button.link[3] === sortedVcards[0].nature;
                            }).forResult();
                            if (chooseButton.bool) {
                                const cardName = chooseButton.links[0][2];
                                const cardNature = chooseButton.links[0][3];
                                const Vcard = { name: cardName, nature: cardNature, isCard: true };
                                if (!player.firelinyan_countChoosed.some(used => {
                                    return used.name === Vcard.name && used.nature === Vcard.nature;
                                })){
                                    player.firelinyan_countChoosed.push(Vcard);
                                }
                                const info = {name: cardName};
                                if (cardNature !== '') info.nature = cardNature;
                                const gaincards = await player.specifyCards(info,1);
                                if(gaincards && gaincards.length > 0) {
                                    getshowCards.push(gaincards[0]);
                                }
                            }
                        }
                    }
                    level += 3;
                }
                if (count >= 9 || getshowCards.length > 0) {
                    event.result = {
                        bool: true,
                        cost_data: {
                            cards: getshowCards,
                            count: player.firelinyan_countMarks,
                        }
                    };
                }
            }
        },
        async content(event, trigger, player) {
            const {cards, count} = event.cost_data;
            if (cards && cards.length > 0) {
                for(const card of cards) {
                    let num = get.number(card);
                    if(!num || typeof num !== 'number') num = 0;
                    const setnum = player.firelinyan_countMarks;
                    let text = num < setnum ? "，小于〖麟焱〗当前已记录牌名数量。" : "，大于等于〖麟焱〗当前已记录牌名数量。";
                    const prompt = setColor(get.translation(player) + "发动了〖麟焱〗：展示的牌的点数是" + num + text);
                    await player.showCards(card, prompt);
                    if(num < setnum) player.recover();
                    const targets = game.filterPlayer(o =>{
                        return o.isIn() && o.getGainableCards(player, "he").length > 0;
                    });
                    if (targets.length > 0) {
                        const result = await player.chooseTarget("请选择一名其他角色令其交予你一张牌", function (card, player, target) {
                            return targets.includes(target);
                        }).set('ai', function (target) {
                            const enemys = targets.filter(o => get.attitude(player,o) < 2).sort((a,b) => {
                                if (a.countCards('he') !== b.countCards('he')) return a.countCards('he') - b.countCards('he');
                                return a.hp - b.hp;
                            });
                            if (enemys.length > 0) {
                                return target === enemys[0];
                            }
                            return target === targets[Math.floor(Math.random() * targets.length)];
                        }).set('forced', true).forResult();
                        if (result.bool) {
                            const choosecards = await result.targets[0].chooseCard("he", true, `选择交给${get.translation(player)}一张牌`).forResultCards();
                            if (choosecards && choosecards.length) {
                                await result.targets[0].give(choosecards, player);
                                let gainedCardNumber = get.number(choosecards[0]);
                                if (gainedCardNumber < num) {
                                    game.log(player, '从', result.targets[0], setColor('获得的牌点数小于〖麟焱〗展示牌的点数。'));
                                    await result.targets[0].damage(1,'fire', 'nocard', player);
                                } else {
                                    game.log(player, '从', result.targets[0], setColor('获得的牌点数大于等于〖麟焱〗展示牌的点数。'));
                                    await result.targets[0].draw();
                                }
                            }
                        }
                    }
                }
            }
            if (count && count >= 9) {
                const changeSkins = get.info('firelinyan').changeSkins;
                player.firelinyan_changed = true;
                if (player.group !== 'qun') player.changeGroup("qun");
                if (!player.hasSkill('fireranji')) player.addSkill('fireranji');
                await changeSkins(player);
                const prompt = setColor("暂时将势力切换至「群」、获得〖燃己〗、本技能失效至脱离濒死状态后反向执行此项，并重置〖麟焱〗。")
                game.log(player, prompt);
            }
        },
        ai:{
            expose:0.35,
            threaten: 1.5,
        },
        "_priority":1310,//与重置时机与君重合！
    },
    firebazhen:{
        audio:"ext:银竹离火/audio/skill:1",
        trigger:{
            player:["damageBegin","chooseToRespondBegin","chooseToUseBegin"],
        },
        forced:true,
        async init(player, skill) {
            await initfirebazhen(player, skill);
        },
        filter:function(event, player, name) {
            if (name == 'damageBegin') {
                return event.hasNature("fire") && event.num > 1;
            } else {
                //是否已被响应
                if (event.responded) return;
                // 检查卡牌是否可被过滤
                if (!event.filterCard || !event.filterCard({ name: "shan" }, player, event)) return;
                // 检查是否可以响应“闪”
                if (event.name == "chooseToRespond" && !lib.filter.cardRespondable({ name: "shan" }, player, event)) return false;
                return true;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername; 
            if (Time == 'damageBegin') {
                trigger.num = 1;
            } else {
                let result = await player.judge(function (card) {
                    if (player.group === 'qun') {
                        return get.suit(card) === 'spade' ? 2 : -2;
                    } else if (player.group === 'shu') {
                        return get.suit(card) === 'heart' ? 2 : -2;
                    }
                }).forResult();
                let card = result.card;
                if (card) {
                    let suit = get.suit(card);
                    if (player.group === 'qun') {
                        if (suit == 'spade') {
                            trigger.untrigger();
                            trigger.set("responded", true);
                            trigger.result = { bool: true, card: { name: "shan", isCard: true } };
                            game.log(player, '的技能', '#g【八阵】', '判断结果为：黑色，已视为打出一张闪！');
                        } else {
                            game.log(player, '的技能', '#g【八阵】', '判断结果为：红色，判定失效！');
                        }
                    } else if (player.group === 'shu') {
                        if (suit == 'heart') {
                            trigger.untrigger();
                            trigger.set("responded", true);
                            trigger.result = { bool: true, card: { name: "shan", isCard: true } };
                            game.log(player, '的技能', '#g【八阵】', '判断结果为：红色，已视为打出一张闪！');
                        } else {
                            game.log(player, '的技能', '#g【八阵】', '判断结果为：黑色，判定失效！');
                        }
                    }

                }
            }
        },
        ai:{
            respondShan: true,
            freeShan: true,
            skillTagFilter: function (player, tag) {
                if (tag !== "respondShan" && tag !== "freeShan") return;
                return true;
            },
            threaten: function(player, target) {
                var att = get.attitude(player, target);
                if (att < 2) return 2;
                else return 0.5;
            },
            effect:{
                target:function(card, player, target) {
                    if (get.tag(card, "respondShan")) return 0.5;
                    if (get.tag(card, 'firedamage') >= 2) return 0.5;
                },
            },
        },
        "_priority":0,
    },
    fireranji:{
        audio:"ext:银竹离火/audio/skill:6",
        marktext:"<font color= #FF2400>燃己</font>",
        onremove:true,
        intro:{
            content:function(storage, player){
                let nummark = player.countMark('fireranji'); 
                return '<font color= #FF2400>当前已使用次数=　</font>' + nummark;
            },
            name:"<font color= #FF2400>燃己</font>",
        },
        trigger:{
            global:["damageBegin4"],
        },
        async init(player, skill) {
            if(!player.hasSkill('fireranji_clear')) player.addSkill('fireranji_clear');
        },
        filter:function (event, player, name) {
            if (!player.hasSkill('firelinyan')) return;
            if (event.player == player || event.source == player) return;
            if (!player.firelinyan_countlists || !player.firelinyan_countChoosed) return;
            const Vcards = player.firelinyan_countlists;
            const getCanChooseVcards = Vcards.filter(card => !player.firelinyan_countChoosed.some(used => {
                return used.name === card.name && used.nature === card.nature;
            }));
            return event.num && event.num > 0 && getCanChooseVcards.length > 0;
        },
        locked:false,
        async cost(event, trigger, player) {
            const Vcards = player.firelinyan_countlists;
            const getCanChooseVcards = Vcards.filter(card => !player.firelinyan_countChoosed.some(used => {
                return used.name === card.name && used.nature === card.nature;
            }));
            let lists = [];
            for (const Vcard of getCanChooseVcards) {
                const name = Vcard.name;
                const nature = Vcard.nature;
                const type = get.type(name);
                lists.push([type, '', name, nature]);
            }
            let getshowCards = [];
            if (lists && lists.length > 0) {
                const prompt = setColor("〖燃己〗：是否要从〖麟焱〗记录中选择一个未选择过的记录牌名令" + get.translation(trigger.player) + "获得一张同名牌并展示之？若如此做：你随机获得此牌花色序数与牌名字数之和张点数不同且牌名不同的牌并弃置以此法获得牌数半数向下取整张牌，最后将"+ get.cnNumber(trigger.num) + "点伤害转移至你。");
                const chooseButton = await player.chooseButton([
                    prompt, [lists, "vcard"]
                ]).set("ai", function (button) {
                    const target = trigger.player;
                    const sortedVcards = getCanChooseVcards.sort((a,b) => {
                        const aValue = get.value(a, target);
                        const bValue = get.value(b, target);
                        if (bValue && aValue && aValue !== bValue) return bValue - aValue;
                    });
                    function useSkill() {
                        if (player.identity == "zhong" && target.identity == "zhu") {
                            if (getAliveNum(target, trigger.num) <= 0) return true;
                        }
                        const att = get.attitude (player, target);
                        if (att < 2) return false;//仅限友方
                        if (target.isHealthy ()) return false;//友方满血不触发！
                        if (getAliveNum(target, trigger.num) > 0 && target.hasSkillTag("maixue",false,player)) return false;//友方为卖血武将，且能存活！不触发！
                        if (getAliveNum(player, trigger.num) <= 0) return false;//姜维不能存活则不触发
                        const skilluse = player.countMark(event.name) + 1 - target.getDamagedHp();
                        if (skilluse > 0) {
                            if (player.isTurnedOver()) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    }
                    if (useSkill()) {
                        return button.link[2] === sortedVcards[0].name && button.link[3] === sortedVcards[0].nature;
                    } else {
                        return false;
                    }
                }).forResult();
                if (chooseButton.bool) {
                    player.addMark("fireranji", 1);
                    const cardName = chooseButton.links[0][2];
                    const cardNature = chooseButton.links[0][3];
                    const Vcard = { name: cardName, nature: cardNature, isCard: true };
                    if (!player.firelinyan_countChoosed.some(used => {
                        return used.name === Vcard.name && used.nature === Vcard.nature;
                    })){
                        player.firelinyan_countChoosed.push(Vcard);
                    }
                    const info = {name: cardName};
                    if (cardNature !== '') info.nature = cardNature;
                    const gaincards = await trigger.player.specifyCards(info,1);
                    if(gaincards && gaincards.length > 0) {
                        getshowCards.push(gaincards[0]);
                    }
                }
            }
            if (getshowCards.length > 0) {
                event.result = {
                    bool: true,
                    cost_data: getshowCards,
                };
            }
        },
        async content(event, trigger, player) {
            const chat = [
                "国恩浩荡，此身食禄而长，亦当报于家国。",
                "天下齐喑，我辈秉身为烛，当照四海九州。",
                "孤鸿鸣于野，其以身为凤，引春风入汉关。",
                "古来圣贤卫道而死，道之存焉何惜深入九渊？",
                "秉笔客书江湖事，执灯叟照当年人。",
                "皮影话峥嵘，千古兴亡事，一杯浊酒中。"
            ].randomGet();
            player.chat(chat);
            trigger.cancel();
            const cards = event.cost_data;
            if (cards && cards.length > 0) {
                const SuitNum = getCardSuitNum(cards[0]) || 0;
                const NameNum = getCardNameNum(cards[0]) || 0
                const prompt = setColor(get.translation(trigger.player) + "，因〖燃己〗：展示牌的花色序数与牌名字数分别为：" + SuitNum + "、" + NameNum + "。");
                await trigger.player.showCards(cards[0], prompt);
                if(SuitNum + NameNum > 0) {
                    await player.gainCardsNumbersAndNames(SuitNum + NameNum);
                    const numdis = Math.floor((SuitNum + NameNum) / 2);
                    if (numdis > 0) {
                        await player.chooseToDiscard(numdis, 'he', true);
                    }
                }
            }
            const source = trigger.source || 'nosource';
            player.damage(source, trigger.nature, trigger.num).set('card', trigger.card).set('cards', trigger.cards);
            if (player.countMark(event.name) > trigger.player.getDamagedHp()) {
                player.tempDisSkills(event.name);
                await player.changeCardsTo(3, 'he');
                player.turnOver();
                player.link(true);
                player.damage(1, "fire", "nosource");
            }
        },
        subSkill:{
            clear: {
                trigger: {
                    global: "phaseAfter",
                },
                firstDo: true,
                charlotte: true,
                fixed: true,
                popup: false,
                silent: true,
                forced: true,
                async content(event, trigger, player) {
                    player.clearMark('fireranji');
                },
                sub: true,
                sourceSkill: "fireranji",
                "_priority": Infinity,
            },
        },
        ai:{
            expose: 0.85,
            threaten: 1.5,
        },
    },
    fireyujun:{
        audio:"ext:银竹离火/audio/skill:6",
        trigger:{
            global:["dyingAfter"],
        },
        locked:false,
        fettersSkill:true,
        categories(skill, player) {
            if (lib.skill[skill]?.fettersSkill) {
                return ['羁绊技'];
            }
            return [];
        },
        async init(player, skill) {
            if (!player.fireyujun_used) player.fireyujun_used = false;
            if(!player.hasSkill('fireyujun_clear')) player.addSkill('fireyujun_clear');
        },
        filter:function(event, player, name) {
            if (!player.hasSkill('firelinyan')) return;
            if (player.fireyujun_used) return false;
            if (event.player == player) return false;
            if (!player.firelinyan_countlists || !player.firelinyan_countChoosed) return;
            const Vcards = player.firelinyan_countlists;
            const getCanChooseVcards = Vcards.filter(card => !player.firelinyan_countChoosed.some(used => {
                return used.name === card.name && used.nature === card.nature;
            }));
            return getCanChooseVcards.length > 0  && event.player.isAlive() && !player.fireyujun_used;
        },
        async cost(event, trigger, player) {
            const Vcards = player.firelinyan_countlists;
            const getCanChooseVcards = Vcards.filter(card => !player.firelinyan_countChoosed.some(used => {
                return used.name === card.name && used.nature === card.nature;
            }));
            let lists = [];
            for (const Vcard of getCanChooseVcards) {
                const name = Vcard.name;
                const nature = Vcard.nature;
                const type = get.type(name);
                lists.push([type, '', name, nature]);
            }
            let getshowCards = [];
            if (lists && lists.length > 0) {
                const prompt = setColor("〖与君〗：每回合限一次，是否要从〖麟焱〗记录中选择一个未选择过的记录牌名并横置，然后令" + get.translation(trigger.player) + "获得一张同名牌并展示之？");
                const chooseButton = await player.chooseButton([
                    prompt, [lists, "vcard"]
                ]).set("ai", function (button) {
                    const target = trigger.player;
                    const sortedVcards = getCanChooseVcards.sort((a,b) => {
                        const aValue = get.value(a, target);
                        const bValue = get.value(b, target);
                        if (bValue && aValue && aValue !== bValue) return bValue - aValue;
                    });
                    function useSkill() {
                        if (player.identity == "zhong" && target.identity == "zhu") {
                            return getAliveNum(player, 1) > 0 && get.recoverEffect(target,player,player) > 0;
                        }
                        const att = get.attitude (player, target);
                        if (att < 2) return false;//仅限友方
                        return getAliveNum(player, 1) > 1 && get.recoverEffect(target,player,player) > 0;
                    }
                    if (useSkill()) {
                        return button.link[2] === sortedVcards[0].name && button.link[3] === sortedVcards[0].nature;
                    } else {
                        return false;
                    }
                }).forResult();
                if (chooseButton.bool) {
                    player.fireyujun_used = true;
                    player.$fullscreenpop("与君", "thunder");
                    player.link(true);
                    const cardName = chooseButton.links[0][2];
                    const cardNature = chooseButton.links[0][3];
                    const Vcard = { name: cardName, nature: cardNature, isCard: true };
                    if (!player.firelinyan_countChoosed.some(used => {
                        return used.name === Vcard.name && used.nature === Vcard.nature;
                    })){
                        player.firelinyan_countChoosed.push(Vcard);
                    }
                    const info = {name: cardName};
                    if (cardNature !== '') info.nature = cardNature;
                    const gaincards = await trigger.player.specifyCards(info,1);
                    if(gaincards && gaincards.length > 0) {
                        getshowCards.push(gaincards[0]);
                    }
                }
            }
            if (getshowCards.length > 0) {
                event.result = {
                    bool: true,
                    cost_data: getshowCards,
                };
            }
        },
        line:'thunder',
        logTarget:'player',
        async content(event, trigger, player) {
            async function fettersSkill(target) {
                const chat = [
                    "你我虽各为其主，然不乏相惜之谊。",
                    "浮生路长，若得遇知己，何其幸哉。",
                    "九州齐喑，我辈燃己长明，君欲同否？",
                    "英才救世，从者皆众，请君拨乱反正。",
                    "国破家亡，君乃最后一线之生机。",
                    "君才胜司马氏十倍，何故居于人下？"
                ].randomGet();
                player.chat(chat);
                await target.recover();
                const cards = event.cost_data;
                if (cards && cards.length > 0) {
                    const NameNum = getCardNameNum(cards[0]) || 0;
                    const prompt = setColor(get.translation(target) + "，因〖与君〗：展示牌的牌名字数为：" + NameNum + "。");
                    await target.showCards(cards[0], prompt);
                    if (NameNum > 0) {
                        await target.draw(NameNum);
                    }
                }
            }
            await fettersSkill(trigger.player);
            const zhonghuis = game.filterPlayer(o => {
                return lib.translate[o.name].includes("钟会") && o !== player && o !== trigger.player && o.isAlive();
            });
            if (zhonghuis && zhonghuis.length > 0) {
                lib.translate['fireyujun_fettersSkill'] = "与君·羁绊";
                const next = game.createEvent('fireyujun_fettersSkill');
                next.player = player;
                next.targets = zhonghuis;
                next.setContent(async function (event, trigger, player) {
                    const targets = event.targets;
                    player.logSkill('fireyujun', targets, 'fire');
                    for (const target of targets) {
                        await fettersSkill(target);
                    }
                });
                const evt = event.getParent();
                evt.after.unshift(next);
            }
        },
        subSkill:{
            clear: {
                trigger: {
                    global: "phaseAfter",
                },
                firstDo: true,
                charlotte: true,
                fixed: true,
                popup: false,
                silent: true,
                forced: true,
                async init(player, skill) {
                    if (!player.fireyujun_used) player.fireyujun_used = false;
                },
                filter(event, player) {
                    return player.fireyujun_used;
                },
                async content(event, trigger, player) {
                    game.log(player, '因本回合使用了技能', '#g【与君】', '，现即将横置并受到一点无来源的⚡伤害！');
                    player.fireyujun_used = false;
                    player.link(true);
                    player.damage(1, "thunder", "nosource");
                },
                sub: true,
                sourceSkill: "fireranji",
                "_priority": Infinity,
            },
        },
        ai:{
            expose:1,
            threaten: 1.5,
        },
        "_priority":Infinity,
    }
};
export default TAF_shuSkills;
