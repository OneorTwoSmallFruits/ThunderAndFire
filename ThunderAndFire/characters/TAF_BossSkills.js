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
const { TAF_Bosslvbu_xuli,initboss_juejing, } = asyncs.boss;
const 龙魂 = setColor("可以将一张「♦丨♣丨♥丨♠」牌当对应的「火杀丨闪丨桃丨无懈」使用或打出。");
/** @type { importCharacterConfig['skill'] } */
const TAF_Bosslvbu = {//虎牢神吕布
    TAF_mashu:{
        mod:{
            maxHandcardBase: function (player, num) {
                let count = 0;
                const targets = game.filterPlayer(o => o.isAlive() && o !== player);
                for (const target of targets) {
                    const maxHand = target.maxHp;
                    if (maxHand > 0) {
                        count += maxHand;
                    }
                }
                return Math.max(count, 9);
            },
            globalFrom: function(from, to, distance) {
                return distance - 1;
            },
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_wushuang:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            targetEnabled: function (card) {
                if (get.type(card) == "delay") return false;
            },
        },
        trigger:{
            player:"useCardToPlayered",
            target:"useCardToTargeted",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        async init(player, skill) {

        },
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
                            if(Tshans < 2) return [1, 0];
                        }
                    }
                },
            },
        },
        "_priority":Infinity,
    },
    TAF_baguan:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            global: "phaseEnd",
            player: "phaseDrawBegin",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        async init(player, skill) {
            if(!player.TAF_baguan) player.TAF_baguan = false;
        },
        filter: function (event, player, name) {
            if(name === 'phaseEnd') return event.player != player;
            else return !event.numFixed && player.TAF_baguan === true;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseDrawBegin") {
                trigger.num = 4;
                player.TAF_baguan = false;
            } else if(Time === "phaseEnd") {
                player.TAF_baguan = true
                player.insertPhase("TAF_baguan");
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_zhanjia:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            player: ["damageBefore","damageAfter"],
            global: "phaseAfter",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        async init(player, skill) {
            if(!player.TAF_zhanjia_damage) player.TAF_zhanjia_damage = 0;
            if(!player.TAF_zhanjia_BeforeUsed) player.TAF_zhanjia_BeforeUsed = 0;
            if(!player.TAF_zhanjia_AfterUsed) player.TAF_zhanjia_AfterUsed = 0;
        },
        filter: function (event, player, name) {
            if(name === 'damageBefore') {
                if(!event.source) return false;
                const num = player.TAF_zhanjia_BeforeUsed;
                return event.num > 1 && num < 3;
            } else if(name === 'damageAfter') {
                const num = player.TAF_zhanjia_AfterUsed;
                return event.num > 0 && num < 3;
            } else {
                player.TAF_zhanjia_damage = 0;
                player.TAF_zhanjia_BeforeUsed = 0;
                player.TAF_zhanjia_AfterUsed = 0;
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "damageBefore") {
                player.logSkill(event.name);
                trigger.num = 2;
                player.TAF_zhanjia_BeforeUsed++;
            } else if(Time === "damageAfter") {
                player.logSkill(event.name);
                player.TAF_zhanjia_damage += trigger.num;
                while(player.TAF_zhanjia_damage >= 2) {
                    if(player.TAF_zhanjia_AfterUsed >= 2) break;
                    player.TAF_zhanjia_damage -= 2;
                    await player.draw(3);
                    player.TAF_zhanjia_AfterUsed ++;
                }
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_xuli:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            player: "changeHpAfter",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        filter: function (event, player) {
            return player.getDamagedHp() > player.hp;
        },
        async content(event, trigger, player) {
            await TAF_Bosslvbu_xuli(player, 'TAF_boss_shenlvbu2', event.name);
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    /**
     * 第二阶段
     */
    TAF_chiyan:{
        mod:{
            maxHandcardBase: function (player, num) {
                const name = player.name;
                if (name === "TAF_boss_shenlvbu1" || name === "TAF_boss_shenlvbu2") {
                    let count = 0;
                    const targets = game.filterPlayer(o => o.isAlive() && o !== player);
                    for (const target of targets) {
                        const maxHand = target.maxHp;
                        if (maxHand > 0) {
                            count += maxHand;
                        }
                    }
                    return Math.max(count, 9);
                } else {//非boss场吕布设定手牌上限为至多7张。
                    return Math.min(player.maxHp, 7);
                }
            },
            globalFrom: function(from, to, distance) {
                return distance - 1;
            },
            globalTo: function(from, to, distance) {
                return distance + 1;
            },
            cardname: function(card,player){
                const Cardinfo = get.info(card,false);
                if (Cardinfo && Cardinfo.type === 'equip' && Cardinfo.subtype === 'equip4') return "sha";
                if (Cardinfo && Cardinfo.type === 'equip' && Cardinfo.subtype === 'equip3') return "juedou";
            },
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_zhankai:{
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext:"<font color= #EE9A00>战铠</font>",
        intro:{
            content: function (storage, player) {
                let text_one = "<font color= #EE9A00>战铠·睚眦:</font>";
                let text_two = "<font color= #EE9A00>战铠·回合:</font>";
                const damagenum = player.TAF_zhankai_damage;
                const phasenum = player.TAF_zhankai_phase;
                //return text_one + damagenum + "<br/>" + text_two + phasenum;
                if (player.TAF_zhankai_phase_used) {
                    return text_one + damagenum + "<br/>" + text_two + "当前回合结束后，进行一次额外的回合。";
                } else {
                    return text_one + damagenum + "<br/>" + text_two + phasenum;
                }
            },
            onunmark: true,
            name:"<font color= #EE9A00>战铠</font>",
        },
        trigger: {
            player: ["phaseBegin","phaseUseBefore","damageAfter"],
            global: "phaseAfter",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        async init(player, skill) {
            if(!player.TAF_zhankai_damage) player.TAF_zhankai_damage = 0;
            if(!player.TAF_zhankai_phase) player.TAF_zhankai_phase = 0;
            if(!player.TAF_zhankai_phase_used) player.TAF_zhankai_phase_used = false;
        },
        filter: function (event, player, name) {
            if(name === "phaseBegin") {
                if(player.TAF_zhankai_phase_used === true) {
                    player.TAF_zhankai_phase_used = false;
                }
                return;
            } else if(name === "phaseUseBefore") {
                return true;
            } else if(name === "damageAfter") {
                if(!event.source) return false;
                return event.num > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseUseBefore") {
                player.logSkill(event.name);
                const list = lib.ThunderAndFire.cards.setShenwu;
                if(list && list.length > 0) {
                    const name = list[Math.floor(Math.random() * list.length)];
                    if (name && typeof name === "string") {
                        function set(name) {
                            switch (name) {
                                case 'TAF_fumojingangchu':
                                    return ['TAF_fumojingangchu', 'spade', 13];
                                case 'TAF_feijiangshenweijian':
                                    return ['TAF_feijiangshenweijian', 'heart', 13];
                                case 'TAF_wushuangxiuluoji':
                                    return ['TAF_wushuangxiuluoji', 'diamond', 13];
                                case 'TAF_honglianzijinguan':
                                    return ['TAF_honglianzijinguan', 'heart', 1];
                                case 'TAF_youhuoshepoling':
                                    return ['TAF_youhuoshepoling', 'club', 13];
                                default:
                                    return [];
                            }
                        }
                        const getcards = set(name);
                        if (getcards && getcards.length > 0) {
                            const newCard = game.createCard(getcards[0], getcards[1], getcards[2]);
                            player.$gain2(newCard);
                            await player.equip(newCard);
                        }
                    }
                }
            } else if(Time === "damageAfter") {
                const source = trigger.source;
                player.TAF_zhankai_damage += trigger.num;
                if(player.TAF_zhankai_phase_used === false) {
                    player.TAF_zhankai_phase += trigger.num;
                }
                while(player.TAF_zhankai_damage >= 3) {
                    player.TAF_zhankai_damage -= 3;
                    player.logSkill(event.name);
                    await player.draw(6);
                    await source.damage(1, 'nocard', player);
                    const Ecards = source.getDiscardableCards(player, "e");
                    if (Ecards && Ecards.length > 0) {
                        const card = Ecards[Math.floor(Math.random() * Ecards.length)];
                        if(card) {
                            await source.discard(card);
                        }
                    } else {
                        const cards = await player.specifyCards('equip');
                        if(cards && cards.length > 0) {
                            player.equip(cards[0]);
                        }
                    }
                }
                while(player.TAF_zhankai_phase >= 9) {
                    if(player.TAF_zhankai_phase_used === true) break;
                    player.TAF_zhankai_phase -= 9;
                    player.markSkill("TAF_zhankai");
                    player.logSkill(event.name);
                    let evtU = trigger.getParent("phaseUse");
                    let evtP = trigger.getParent("phase");
                    if (evtU && evtU.name == "phaseUse") {
                        evtU.skipped = true;
                        player.insertPhase("TAF_zhankai");
                    } else if (evtP && evtP.name == "phase") {
                        evtP.finish();
                        player.insertPhase("TAF_zhankai");
                    }
                    player.TAF_zhankai_phase_used = true;
                }
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_xiuluo:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player: ["changeHpAfter","loseMaxHpAfter", "gainMaxHpAfter"],
        },
        skillAnimation: "legend",
        animationColor: "metal",
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        hulaoBGM:function(){
            ui.backgroundMusic.pause();
            ui.backgroundMusic.src = lib.assetURL + 'extension/银竹离火/audio/gameBGM/征战虎牢.mp3';
        },
        async init(player, skill) {
            if(!player.TAF_Bosslvbu) player.TAF_Bosslvbu = [];
            if(!player.setTAF_Bosslvbu) player.setTAF_Bosslvbu = false;
            if(!player.setFirst_xiuluo) player.setFirst_xiuluo = Math.floor(player.hp / 3 * 2);
            if(!player.setFirst_xiuluoused) player.setFirst_xiuluoused = false;
            if(!player.setSecond_xiuluo) player.setSecond_xiuluo = Math.floor(player.hp / 3);
            if(!player.setSecond_xiuluoused) player.setSecond_xiuluoused = false;
            player.TAF_Bosslvbu = ['TAF_shenfeng','TAF_liechu','TAF_fumo','TAF_jingang'];
            const skills = player.TAF_Bosslvbu;
            const addskill = skills[Math.floor(Math.random() * skills.length)];
            player.addSkill(addskill);
            player.logSkill('TAF_xiuluo');
            player.TAF_Bosslvbu = skills.filter(key => key !== addskill);
            game.log(player, "获得了技能：", addskill);
            const hulaoBGM = lib.skill.TAF_xiuluo.hulaoBGM;
            hulaoBGM();
            ui.backgroundMusic.addEventListener('ended', hulaoBGM);
        },
        filter:function(event, player){
            const name = player.name;
            if (name === "TAF_boss_shenlvbu1" || name === "TAF_boss_shenlvbu2") {
                const pHp = player.hp;
                const set = ['setFirst_xiuluo','setSecond_xiuluo'];
                for(const num of set){
                    const setnum = player[num];
                    if(!setnum || typeof setnum !== "number") return false;
                    if(pHp <= setnum && player[num + 'used'] === false) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        },
        derivation: ['TAF_shenfeng','TAF_liechu','TAF_fumo','TAF_jingang','TAF_shenji'],
        async content(event, trigger, player) {
            const pHp = player.hp;
            const setnum_one = player.setFirst_xiuluo;
            const setnum_two = player.setSecond_xiuluo;
            if(pHp <= setnum_one && player.setFirst_xiuluoused === false) {
                player.setFirst_xiuluoused = true;
                const skills = player.TAF_Bosslvbu;
                if(!skills || skills.length === 0) return;
                const skill = skills[Math.floor(Math.random() * skills.length)];
                player.addSkill(skill);
                player.logSkill(event.name);
                game.log(player, "获得了技能：", skill);
                player.TAF_Bosslvbu = skills.filter(key => key !== skill);
            }
            if(pHp <= setnum_two && player.setSecond_xiuluoused === false) {
                player.setSecond_xiuluoused = true;
                const skills = ['TAF_shenji'];
                const fanyi = lib.translate[skills[0]];
                const fanyi_info = lib.translate[skills[0] + "_info"];
                if(!fanyi || !fanyi_info) return;
                player.addSkill(skills[0]);
                player.logSkill(event.name);
                game.log(player, "获得了技能：", skills[0]);
            }
            let evtU = trigger.getParent("phaseUse");
            let evtP = trigger.getParent("phase");
            if (evtU && evtU.name == "phaseUse" && evtU.player !== player) {
                evtU.skipped = true;
                player.insertPhase("TAF_xiuluo");
                return;
            } else if (evtP && evtP.name == "phase" && evtP.player !== player) {
                evtP.finish();
                player.insertPhase("TAF_xiuluo");
                return;
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_shenfeng:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"useCardToPlayer",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        async init(player, skill) {
            if(!player.checkBossVcard) player.checkBossVcard = function(evt){
                const card = evt.card;
                const cards = evt.card.cards;
                if(cards.length === 0) return true;
                if(cards.length !== 1) return true;
                const name1 = card.name;
                const name2 = cards[0].name;
                if(name1 !== name2) return true;
                return false;
            };
        },
        filter:function(event, player){
            const targets = event.targets;
            if(!targets || targets.length === 0) return false;
            const cards = event.cards;
            if(!cards || !Array.isArray(cards)) return false;
            return event.card && (event.card.name ==='sha' || event.card.name === 'juedou');
        },
        async content(event, trigger, player) {
            const targets = trigger.targets;
            const checkBossVcard = player.checkBossVcard(trigger);
            if(checkBossVcard) {//转化牌
                player.logSkill(event.name, targets);
                for(const target of targets) {
                    player.line(target, 'thunder');
                    const es = target.getGainableCards(player, "e");
                    if(es && es.length > 0) {
                        const escard = es[Math.floor(Math.random() * es.length)];
                        await player.gain(escard, "gain2");
                        if(player.canEquip(escard)) await player.equip(escard);
                    } else {
                        await target.damage(1, "thunder", 'nocard', player);
                    }
                }
            } else {
                player.logSkill(event.name, targets);
                for(const target of targets) {
                    const hs = target.getGainableCards(player, "h");
                    if(hs && hs.length > 0) {
                        const hscard = hs[Math.floor(Math.random() * hs.length)];
                        await player.gain(hscard, "gain2");
                    } else {
                        await target.damage(1, "fire", 'nocard', player);
                    }
                }
            }
        },
        ai: {
            unequip: true,
            threaten: 3,
            skillTagFilter: function (player, tag, arg) {
                if (tag === "unequip") {
                    const card = arg.card;
                    const target = arg.target;
                    if (!card || !target || card.name !== "sha" || card.name !== "juedou") return false;
                    const Tcards = target.getCards('e');
                    if (Tcards.length !== 1) return false;
                    const subtype = get.subtype(Tcards[0]);
                    if (!subtype || subtype !== "equip2") return false;
                    const es = target.getGainableCards(player, "e");
                    if(!es || es.length === 0) return false;
                    const cards = card.cards;
                    if(cards && Array.isArray(cards)) {
                        if(cards.length === 0) return true;
                        if(cards.length !== 1) return true;
                        const name1 = card.name;
                        const name2 = cards[0].name;
                        if(name1 !== name2) return true;
                        return false;
                    } else {
                        return false;
                    }
                }
            },
        },
        "_priority":Infinity,
    },
    TAF_liechu:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            source:"damageAfter",
            global:["phaseAfter"],
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        async init(player, skill) {
            if(!player.checkBossVcard) player.checkBossVcard = function(evt){
                const card = evt.card;
                const cards = evt.card.cards;
                if(cards.length === 0) return true;
                if(cards.length !== 1) return true;
                const name1 = card.name;
                const name2 = cards[0].name;
                if(name1 !== name2) return true;
                return false;
            };
            const set = ['sha','juedou'];
            for(const name of set){
                if(!player[name + 'Vcount']) player[name + 'Vcount'] = 0;
                if(!player[name + 'Scount']) player[name + 'Scount'] = 0;
            }
        },
        filter:function(event, player, name){
            if(name === "damageAfter") {
                const card = event.card;
                if(!card) return false;
                const checkBossVcard = player.checkBossVcard(event);
                if(card.name =='sha') {
                    if(checkBossVcard){
                        return player[card.name + 'Vcount'] === 0;
                    } else {
                        return player[card.name + 'Scount'] === 0;
                    }
                } else if(card.name =='juedou') {
                    if(checkBossVcard){
                        return player[card.name + 'Vcount'] === 0;
                    } else {
                        return player[card.name + 'Scount'] === 0;
                    }
                }
                return false;
            } else {
                const set = ['sha','juedou'];
                for(const name of set){
                    player[name + 'Vcount'] = 0;
                    player[name + 'Scount'] = 0;
                }
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function setSkill(string) {
                const Pilenum = ui.cardPile.childNodes.length;
                const disPilenum = ui.discardPile.childNodes.length;
                let setcards = [];
                if(string === "top") {
                    const getnum = Math.min(6, Pilenum);
                    if(getnum === 0) return;//避免牌堆不够的BUG
                    setcards = get.cards(getnum);
                } else if(string === "low") {
                    const getnum = Math.min(6, disPilenum);
                    if(getnum === 0) return;//避免牌堆不够的BUG
                    setcards = get.bottomCards(getnum);
                }
                player.logSkill(event.name);
                game.cardsGotoOrdering(setcards);
                let gaincards = [];
                let throwcards = [];
                for(const card of setcards) {
                    const info = get.info(card,false);
                    if(info) {
                        if(info.type === 'equip' || info.type === 'basic') {
                            gaincards.push(card);
                        } else if(get.name(card,player) === 'juedou') {
                            gaincards.push(card);
                        } else {
                            throwcards.push(card);
                        }
                    } else {
                        throwcards.push(card);
                    }
                }
                if(gaincards.length > 0) {
                    await player.gain(gaincards, "gain2");
                }
                if(throwcards.length > 0) {
                    player.$throw(throwcards, 1000, 'TAF_liechu', 'highlight');
                    game.log(player, "将", throwcards, "置入了弃牌堆");
                }
            };
            if(Time === "damageAfter") {
                const checkBossVcard = player.checkBossVcard(trigger);
                if(checkBossVcard){//转化牌
                    player[trigger.card.name + 'Vcount']++;
                    await setSkill("top");
                } else {
                    player[trigger.card.name + 'Scount']++;
                    await setSkill("low");
                }
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_fumo:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            global:["equipAfter","addJudgeAfter","gainAfter", "loseAfter","loseAsyncAfter","addToExpansionAfter"],
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        filter:function(event, player){
            const targets = game.filterPlayer(o => o.isAlive() && o != player && o.getDiscardableCards(player, "he").length > 0);
            const evt = event.getl(player);
            return evt && evt.es && evt.es.length > 0 && targets.length > 0;
        },
        async content(event, trigger, player) {
            let count = trigger.getl(player).es.length || 0;
            while(count > 0) {
                count --;
                player.logSkill(event.name);
                const targets = game.filterPlayer(o => o.isAlive() && o != player && o.getDiscardableCards(player, "he").length > 0);
                if(!targets || targets.length === 0) return;
                for(const target of targets) {
                    let setdisnum = 2;
                    while (setdisnum > 0) {
                        const hs = target.getDiscardableCards(player, "h");
                        const es = target.getDiscardableCards(player, "e");
                        if (!hs && !es) break;
                        if (hs && hs.length === 0 && es && es.length === 0) break;
                        if (setdisnum === 0) break;
                        if (es.length > 0) {
                            if (es.length >= setdisnum) {
                                await target.discard(es.randomGets(setdisnum));
                                setdisnum = 0;
                                break;
                            } else {
                                await target.discard(es.randomGet(es.length));
                                setdisnum -= es.length;
                            }
                        }
                        if (hs.length > 0 && setdisnum > 0) {
                            if (hs.length >= setdisnum) {
                                await target.discard(hs.randomGets(setdisnum));
                                setdisnum = 0;
                                break;
                            } else {
                                await target.discard(hs.randomGet(hs.length));
                                setdisnum -= hs.length;
                            }
                        }
                    }
                    const cards_1 = player.getCardsform().filter(card => {
                        return get.type2(card) !== 'trick';
                    });
                    const cards_2 = player.getCardsform().filter(card => {
                        return get.name(card) === 'juedou';
                    });
                    const cards = cards_1.concat(cards_2);
                    if (cards && cards.length > 0) {
                        let selectedCards = [];
                        let tempCards = cards.slice();
                        let count = Math.min(2, tempCards.length);
                        for (let i = 0; i < count; i++) {
                            let randomIndex = Math.floor(Math.random() * tempCards.length);
                            selectedCards.push(tempCards[randomIndex]);
                            tempCards.splice(randomIndex, 1);
                        }
                        if (selectedCards.length > 0) {
                            await player.gain(selectedCards, "gain2");
                        }
                    }
                }
            }
        },
        ai: {
            noe: true,
            reverseEquip: true,
            threaten: 3,
            effect: {
                target: function (card, player, target, current) {
                    if (get.type(card) == "equip" && !get.cardtag(card, "gifts")) {
                        const enemys = game.players.filter(o => o != target && 
                            get.attitude(target, o) < 2 && 
                            o.getCards("he").length >= o.maxHp
                        );
                        if (enemys && enemys.length > 0) return [1, 3];
                    }
                },
            },
        },
        "_priority":Infinity,
    },
    TAF_jingang:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #EE9A00>金刚</font>",
        intro:{
            content: function (storage, player) {
                let result = "<font color= #EE9A00>金刚花色：</font>：";
                const getSuits = player.TAF_jingang || [];
                if (getSuits.length > 0) {
                    let suits = [];
                    for (const suit of getSuits) {
                        const suitname = get.translation(suit);
                        if (!suits.includes(suitname)) suits.push(suitname);
                    }
                    result += suits.join("、");
                } else {
                    result += "无";
                }
                return result;
            },
            markcount:function (storage, player) {
                return player.TAF_jingang.length || 0;
            },
            onunmark: true,
            name:"<font color= #EE9A00>金刚</font>",
        },
        trigger:{
            player:["damageBefore","damageAfter",],
            global:["phaseAfter"],
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        async init(player, skill) {
            player.TAF_jingang = [];
        },
        filter:function(event, player, name){
            if(!player.TAF_jingang) player.TAF_jingang = [];
            if(name === "damageBefore") {
                if(!event.source) return false;
                if(event.source === player) return false;
                return event.num > 0 && event.source.isAlive();
            } else if(name === "damageAfter") {
                if(!event.source) return false;
                if(event.source === player) return false;
                return event.num > 0;
            } else if(name === "phaseAfter") {
                player.unmarkSkill('TAF_jingang');
                player.TAF_jingang = [];
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "damageBefore") {
                let count = trigger.num || 1;
                const source = trigger.source;
                while (count > 0 && source.isAlive()) {
                    count--;
                    player.logSkill(event.name, source);
                    const setsuits = ['spade', 'heart', 'club', 'diamond'];
                    const cards = await source.chooseCard(`〖金刚〗：请交给${get.translation(player)}一张，本回合其未记录的花色牌，否则随机受到一点无来源的⚡或🔥伤害！`, "he", 1, function(card) {
                        const suit = get.suit(card);
                        const getsuitslist = player.TAF_jingang;
                        return !getsuitslist.includes(suit) && setsuits.includes(suit);
                    }).set("ai", function(card) {
                        return 8 - get.value(card);//待定
                    }).forResultCards();
                    if (cards && cards.length) {
                        player.line(source, 'fire');
                        await source.give(cards, player);
                        const suit = get.suit(cards[0]);
                        if (!player.TAF_jingang.includes(suit)) player.TAF_jingang.push(suit);
                        player.markSkill('TAF_jingang');
                    } else {
                        const damagetype = ['fire', 'thunder'];
                        const nature = damagetype[Math.floor(Math.random() * damagetype.length)];
                        await source.damage(1, nature, "nosource");
                    }
                }
            } else if(Time === "damageAfter") {
                let count = trigger.num || 1;
                while (count > 0) {
                    count--;
                    await player.draw(2);
                    const Tao = {name: "tao", nature: "", isCard: true}
                    if(player.countCards("hes", "tao") > 0 && lib.filter.cardEnabled(Tao, player, "forceEnable")) {
                        const TXT = setColor("〖金刚〗：是否使用一张桃？");
                        const buttons =  await player.chooseToUse({ name: "tao" }, TXT).forResult();
                        if (buttons.bool) {
                            player.logSkill(event.name);
                        }
                    }
                }
            }
        },
        ai: {
            maixie:true,
            "maixie_hp":true,
            threaten: 3,
            effect: {
                target: function(card, player, target) {
                    const damage = get.tag(card, "damage");
                    if (damage) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        const setsuits = ['spade', 'heart', 'club', 'diamond'];
                        const getsuitslist = target.TAF_jingang;
                        const compareHp = Math.max(1, Math.floor(player.maxHp / 3));
                        const uninsuits = setsuits.filter(suit => !getsuitslist.includes(suit));
                        if (uninsuits.length === 0) {
                            if (getAliveNum(player, 1) <= compareHp) {
                                return [1, 2, 1, -4];
                            }
                            return [1, 1, 1, 1];
                        }
                        const unincards = player.getCards('he').filter(card => uninsuits.includes(get.suit(card)));
                        if (!unincards || unincards.length === 0) return [1, 2, 1, -4];
                        return [1, 1, 1, 1];
                    }
                },
            },
        },
        "_priority":Infinity,
    },
    TAF_shenji:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            selectTarget:function (card, player, range){
                if(!card.cards || card.cards.length === 0 || card.cards.length > 1) return;
                const VCardname = get.name(card,player);
                if(!VCardname) return;
                if(VCardname === 'sha' && card.cards[0].name === 'sha') {
                    range[1] += 2;
                } else if(VCardname === 'juedou' && card.cards[0].name === 'juedou') {
                    range[1] += 2;
                }
            },
            /*
            ******你要替换的函数，让杀变成无限制！
            cardUsable: function(card,player,num){
                if(card && card.name === 'sha') return Infinity;
            },
            */
            cardUsable: function(card,player,num){
                if(!card.cards || card.cards.length === 0) return;
                const VCardname = get.name(card,player);
                if(!VCardname) return;
                if(VCardname === 'sha') {
                    if(card.cards.length === 1) {
                        if(card.cards[0].name !== 'sha') return num + Infinity;
                        else return num + 2;
                    } else {
                        return num + Infinity;
                    }
                }
            },
            targetInRange: function(card,player){
                if(!card.cards || card.cards.length === 0) return;
                const VCardname = get.name(card,player);
                if(!VCardname) return;
                if(VCardname === 'sha') {
                    if(card.cards.length === 1) {
                        if(card.cards[0].name !== 'sha') return true;
                    } else {
                        return true;
                    }
                }
            },
        },
        trigger: {
            player: "phaseDrawBegin",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        filter:function(event, player, name){
            return !event.numFixed;
        },
        async content(event, trigger, player) {
            let setnum = 9;
            const Pile = ui.cardPile.childNodes.length;
            if(Pile < setnum) await game.washCard();
            const Pilewashed = ui.cardPile.childNodes.length;
            const disPile = ui.discardPile.childNodes.length;
            if(Pilewashed + disPile < setnum) {
                setnum = Pilewashed;
            }
            if(setnum > 0) {
                let TXT = setColor("〖神戟〗：是否要弃置所有手牌并将手牌摸至") + get.cnNumber(setnum)+ " 张？";
                let result = await player.chooseBool(TXT).set('ai', function() {
                    return player.countCards('h') + 2 <= setnum;
                }).forResult();
                if(result.bool) {
                    player.logSkill(event.name);
                    const cards = player.getCards('h');
                    if(cards.length > 0) {
                        await player.discard(cards);
                    }
                    trigger.num = setnum;
                }
            }
        },
        ai: {
            unequip: true,
            threaten: 3,
            skillTagFilter: function (player, tag, arg) {
                if (tag === "unequip") {
                    const card = arg.card;
                    const target = arg.target;
                    if (!card || !target) return false;
                    if (card.name !== "sha") return false;
                    const cards = card.cards;
                    if(cards && Array.isArray(cards)) {
                        if(cards.length === 0) return true;
                        if(cards.length !== 1) return true;
                        const name1 = card.name;
                        const name2 = cards[0].name;
                        if(name1 !== name2) return true;
                        return false;
                    } else {
                        return false;
                    }
                }
            },
        },
        "_priority":Infinity,
    },
    /**
     * 其他设定
     */
    TAF_shenwu_equips:{
        superCharlotte: true,
        charlotte: true,
        unique: true,
    },
    TAF_shenwu_shadow:{//扯淡技能！
        audio: false,
        enable: "phaseUse",
        unique: true,
        locked: false,
        async init(player, skill) {
            if (!player._shenwuCards) player._shenwuCards = [
                'TAF_fumojingangchu','TAF_feijiangshenweijian','TAF_wushuangxiuluoji',
                'TAF_honglianzijinguan','TAF_youhuoshepoling'
            ];
        },
        filter:function (event, player) {
            return true;
        },
        async content(event, trigger, player) {
            const list = [
                setColor("〖选项一〗：是否要无脑新增装备栏？"),
                setColor("〖选项二〗：是否要无脑获得一张未获得的神武装备？"),
            ];
            const chooseButton = await player.chooseButton([setColor("〖神武〗") ,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    return true;
                } else if (button.link === 1) {
                    return true;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                return false;
            }).set(/*'forced', target !== player*/).forResult();
            if (chooseButton.bool) {
                const choices = chooseButton.links;
                if (choices.includes(0)) {
                    let lists = ['武器栏','防具栏','防御马','进攻马','宝具栏', 'cancel2'];
                    const prompt = setColor("请选择你要新增的装备栏。");
                    const Equipresult = await player.chooseControl(lists).set('prompt', prompt).set ("ai", control => {
                        return 'cancel2';
                    }).forResult();
                    if (Equipresult.control !== 'cancel2') {
                        if (Equipresult.control === '武器栏') player.expandEquip(1);
                        if (Equipresult.control === '防具栏') player.expandEquip(2);
                        if (Equipresult.control === '防御马') player.expandEquip(3);
                        if (Equipresult.control === '进攻马') player.expandEquip(4);
                        if (Equipresult.control === '宝具栏') player.expandEquip(5);
                    }
                    return;
                } else if (choices.includes(1)) {
                    let lists = [];
                    const cards = player.getCards('hes');
                    if(cards.filter(card => card.name === 'TAF_fumojingangchu').length === 0) lists.push('TAF_fumojingangchu');
                    if(cards.filter(card => card.name === 'TAF_feijiangshenweijian').length === 0) lists.push('TAF_feijiangshenweijian');
                    if(cards.filter(card => card.name === 'TAF_wushuangxiuluoji').length === 0) lists.push('TAF_wushuangxiuluoji');
                    if(cards.filter(card => card.name === 'TAF_honglianzijinguan').length === 0) lists.push('TAF_honglianzijinguan');
                    if(cards.filter(card => card.name === 'TAF_youhuoshepoling').length === 0) lists.push('TAF_youhuoshepoling');
                    if(lists.length > 0) lists.push('cancel2');
                    if(lists.length === 0) return;
                    const prompt = setColor("请选择你要获得的装备。");
                    const shenwuresult = await player.chooseControl(lists).set('prompt', prompt).set ("ai", control => {
                        return 'cancel2';
                    }).forResult();
                    if (shenwuresult.control !== 'cancel2') {
                        if (shenwuresult.control == 'TAF_fumojingangchu') {
                            const newCard = game.createCard2('TAF_fumojingangchu', 'spade', 13);
                            player.$gain2(newCard);
                            await player.equip(newCard);
                        }
                        if (shenwuresult.control == 'TAF_feijiangshenweijian') {
                            const newCard = game.createCard2('TAF_feijiangshenweijian', 'heart', 13);
                            player.$gain2(newCard);
                            await player.equip(newCard);
                        }
                        if (shenwuresult.control == 'TAF_wushuangxiuluoji') {
                            const newCard = game.createCard2('TAF_wushuangxiuluoji', 'diamond', 13);
                            player.$gain2(newCard);
                            await player.equip(newCard);
                        }
                        if (shenwuresult.control == 'TAF_honglianzijinguan') {
                            const newCard = game.createCard2('TAF_honglianzijinguan', 'heart', 1);
                            player.$gain2(newCard);
                            await player.equip(newCard);
                        }
                        if (shenwuresult.control == 'TAF_youhuoshepoling') {
                            const newCard = game.createCard2('TAF_youhuoshepoling', 'club', 13);
                            player.$gain2(newCard);
                            await player.equip(newCard);
                        }
                    }
                }
            }
        },
        "_priority":0,
    },


    TAF_mashu_shadow:{
        mod:{
            globalFrom: function(from, to, distance) {
                return distance - 1;
            },
        },
        forced:true,
        ai: {
            threaten: 1,
        },
        "_priority":Infinity,
    },
    TAF_kuangbao_shadow:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #EE9A00>狂暴</font>",
        intro:{
            content: function (storage, player) {
                const nummark = player.countMark('TAF_kuangbao_shadow');
                return '「狂暴」标记数量为' + nummark;
            },
            markcount:function (storage, player) {
                return player.countMark('TAF_kuangbao_shadow') || 0;
            },
            onunmark: true,
            name:"<font color= #EE9A00>狂暴</font>",
        },
        trigger:{
            player: ["damageBegin"],
            source: ["damageBegin"],
        },
        firstDo: true,
        unique:true,
        forced:true,
        async init(player, skill) {
            player.addMark(skill, 2);
            player.logSkill(skill);
        },
        filter:function(event, player){
            const source = event.source;
            return source && event.num && event.num > 0;
        },
        async content(event, trigger, player) {
            player.addMark(event.name, trigger.num);
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
    TAF_xiuluo_shadow:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["phaseUseBegin"],
            global:["dieAfter"],
        },
        firstDo: true,
        unique:true,
        forced:true,
        direct:true,//必须要！
        async init(player, skill) {
            player.TAF_xiuluo_shadow = ['TAF_shenfeng','TAF_liechu','TAF_fumo','TAF_jingang'];
            player.TAF_xiuluo_shadow_dieAfter = false;
        },
        filter:function(event, player, name){
            if(name === "phaseUseBegin") {
                const skills = player.TAF_xiuluo_shadow.filter(skill => !player.hasSkill(skill));
                if(!skills || skills.length === 0) return;
                return player.countMark('TAF_kuangbao_shadow') >= game.filterPlayer(o => o.isAlive()).length;
            } else {
                return event.source && event.source === player && !player.TAF_xiuluo_shadow_dieAfter;
            }
        },
        derivation: ['TAF_shenfeng','TAF_liechu','TAF_fumo','TAF_jingang'],
        async content(event, trigger, player) {
            const Time = event.triggername;
            let skills = [];
            let prompt = '';
            if(Time === "phaseUseBegin") {
                skills = player.TAF_xiuluo_shadow.filter(skill => !player.hasSkill(skill));
                prompt = setColor("〖修罗〗：请选择获得其中一个技能，直到下个出牌阶段开始时：");
            } else {
                skills = player.TAF_xiuluo_shadow;
                prompt = setColor("〖修罗〗：请选择获得其中一个技能：");
            }
            if(!skills || skills.length === 0) return;
            const lists = skills.concat(['cancel2']);
            const result = await player.chooseControl(lists).set('prompt', prompt).set ("ai", () => {
                const damageCards = player.getCards('hes').filter(card => get.tag(card, "damage") >= 1);
                const canValueCards = damageCards.filter(card =>
                    player.hasUseTarget(card) && player.hasValueTarget(card) && player.getUseValue(card) > 0
                );
                const equipCards = player.getCards('hs').filter(card =>
                    get.type(card) === 'equip' && lib.filter.cardEnabled(card, player, "forceEnable")
                );
                if (Time === "phaseUseBegin") {
                    if (canValueCards.length >= 1) {
                        const possibleSkills = lists.filter(skill =>
                            skill === 'TAF_shenfeng' || skill === 'TAF_liechu'
                        );
                        return possibleSkills.length > 0 ? possibleSkills.randomGet() : 'cancel2';
                    }
                    if (equipCards.length > 0 && lists.includes('TAF_fumo')) return 'TAF_fumo';
                    return lists.includes('TAF_jingang') ? 'TAF_jingang' : 'cancel2';
                } else {
                    const priorityOrder = ['TAF_jingang', 'TAF_shenfeng', 'TAF_fumo', 'TAF_liechu'];
                    for (const skill of priorityOrder) {
                        if (lists.includes(skill)) return skill;
                    }
                    return 'cancel2';
                }
            }).forResult();
            if(result.control === 'cancel2') return;
            if(Time === "phaseUseBegin") {
                player.logSkill(event.name);
                player.clearMark('TAF_kuangbao_shadow');
                player.addTempSkill(result.control, { player: 'phaseUseBegin' });
            } else {
                player.logSkill(event.name,trigger.player);
                player.TAF_xiuluo_shadow_dieAfter = true;
                if(player.hasSkill(result.control)) player.removeSkill(result.control);
                player.addSkill(result.control);
                player.update();
            }
            game.log(player, "获得了技能：", result.control);
        },
        ai: {
            threaten: 3,
        },
        "_priority":Infinity,
    },
};
/** @type { importCharacterConfig['skill'] } */
const TAF_boss_shenguigaoda = {//神鬼高达
    TAF_boss_juejing:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player: ["enterGame", "phaseBegin", "recoverBefore","gainMaxHpBegin","loseMaxHpBegin"],
            global: ["phaseBefore", "loseAfter","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        async init(player, skill) {
            await initboss_juejing(player, skill);
            if(!player.equipQingGang) player.equipQingGang = async function(){
                let qinggang = null;
                if(player.hasDisabledSlot(1) || !player.canEquip('qinggang')) return null;
                const findCards = player.getCardsform({ Pile: 'allPile', field: 'hesjx' }).filter(card => card.name === 'qinggang');
                if(findCards.length > 0) {
                    qinggang = findCards[0];
                    await player.equip(findCards[0]);
                    const targets = game.filterPlayer(() => true);
                    targets.forEach(target => {
                        target.update();
                        target.updateMark();
                    });
                    ui.clear();
                } else {
                    const newCard = game.createCard2('qinggang', 'heart', 6);
                    qinggang = newCard;
                    player.$gain2(newCard);
                    await player.equip(newCard);
                }
                return qinggang;
            };
            player.logSkill(skill);
            const newCard = game.createCard2('qinggang', 'heart', 6);
            game.cardsGotoPile([newCard], function() {
                return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
            });
            game.updateRoundNumber();
            game.log(player, "将一张新的", newCard, "置入牌堆");
        },
        filter:function(event, player, name){
            if(name === "enterGame" || name === "phaseBefore") {
                return (event.name !== 'phase' || game.phaseNumber == 0) && player.maxHp !== 2;
            } else if(name === "phaseBegin") {
                return !player.hasDisabledSlot(1) && player.canEquip('qinggang');
            } else if(name === "recoverBefore") {
                return player.hp > 0;
            } else if(name === "gainMaxHpBegin" || name === "loseMaxHpBegin") {
                return true;
            } else {
                const cards = player.getCards('h');
                return cards.length !== 4;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(player.group !== "shen") player.changeGroup("shen");
            if(player.maxHp !== 2) { player.maxHp = 2; player.update();};
            if(Time === "phaseBegin") {
                await player.equipQingGang();
            } else if(Time === "recoverBefore") {
                trigger.cancel();
                game.log(player, "取消回复体力的效果。");
            } else if(Time === "gainMaxHpBegin" || Time === "loseMaxHpBegin") {
                trigger.cancel();
                game.log(player, "取消获得/失去最大体力的效果。");
            } else {
                await player.changeCardsTo(4);
            }
        },
        ai: {
            noh: true,
            nogain: true,
            reverseEquip: true,
            threaten: 3,
            effect: {
                target: function(card, player, target) {
                    if(card.name === 'bingliang') return 0;
                    if (get.tag(card, "recover") && target.hp > 0) {
                        const skillKey = target.hasSkill("TAF_boss_longhun");
                        const canSaveCards = target.getCards('hes').filter(card => {
                            const key1 = get.suit(card) === 'heart'
                            const key2 = target.canSaveCard(card, target);
                            if (skillKey) {
                                return key1 || key2;
                            } else {
                                return key2;
                            }
                        });
                        if (player !== target) {
                            return "zeroplayertarget";
                        } else {
                            if (canSaveCards.length > 1) {
                                return [0, 2];
                            } else {
                                return "zeroplayertarget";
                            }
                        }
                    }
                    const subtype = get.subtype(card, target);
                    const valueSuits = ['heart', 'spade'];
                    if (subtype && target.canEquip(card) && !get.cardtag(card, "gifts")) {
                        if (subtype === "equip1") {
                            const equip1 = target.getEquip(1);
                            if (equip1 && get.name(equip1) === "zhuge") {
                                return [1, -3];
                            } else {
                                return [1, 3];
                            }
                        } else if (["equip2", "equip3", "equip4", "equip5"].includes(subtype)) {
                            const equipIndex = parseInt(subtype.slice(5), 10);
                            const equipCard = target.getEquip(equipIndex);
                            if (equipCard) {
                                const suit = get.suit(equipCard);
                                if (valueSuits.includes(suit)) {
                                    return [1, -1];
                                }
                            } else {
                                return [1, 3];
                            }
                        }
                    }
                },
                player: function(card, player, target) {
                    if (get.tag(card, "recover") && player.hp > 0) {
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
                        if (player !== target) {
                            if (get.attitude(player, target) >= 2) return [1,1];
                            else return 0;
                        } else {
                            if (canSaveCards.length > 1) {
                                return [0, 2];
                            } else {
                                return "zeroplayertarget";
                            }
                        }
                    }
                    const subtype = get.subtype(card, player);
                    const valueSuits = ['heart', 'spade'];
                    if (subtype && player.canEquip(card) && !get.cardtag(card, "gifts")) {
                        if (subtype === "equip1") {
                            const equip1 = player.getEquip(1);
                            if (equip1 && get.name(equip1) === "zhuge") {
                                return [1, -3];
                            } else {
                                return [1, 3];
                            }
                        } else if (["equip2", "equip3", "equip4", "equip5"].includes(subtype)) {
                            const equipIndex = parseInt(subtype.slice(5), 10);
                            const equipCard = player.getEquip(equipIndex);
                            if (equipCard) {
                                const suit = get.suit(equipCard);
                                if (valueSuits.includes(suit)) {
                                    return [1, -1];
                                }
                            } else {
                                return [1, 3];
                            }
                        }
                    }
                    return [1, 1]
                },
            },
        },
        "_priority":Infinity,
    },
    TAF_boss_wushuang:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"useCardToPlayered",
            target:"useCardToTargeted",
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        forced:true,
        async init(player, skill) {
            
        },
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
        "_priority":Infinity,
    },
    TAF_boss_longhun:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiValue: function(player, card, num) {
                const suit = get.suit(card, player);
                let Vcard;
                switch (suit) {
                    case "diamond": Vcard = { name: "sha", nature: 'fire', isCard: true }; break;
                    case "club":    Vcard = { name: "shan", isCard: true }; break;
                    case "heart":   Vcard = { name: "tao", isCard: true }; break;
                    case "spade":   Vcard = { name: "wuxie", isCard: true }; break;
                    default: return num;
                }
                return Math.max(num, get.value(Vcard, player)) + 0.5;
            },
            aiUseful: function() {
                return lib.skill.TAF_boss_longhun.mod.aiValue.apply(this, arguments);
            },
        },
        enable: ["chooseToUse", "chooseToRespond"],
        prompt: 龙魂,
        async init(player, skill) {
            if (!player._longhunViewAs) player._longhunViewAs = [
                { name: 'sha', nature: 'fire', isCard: true , boss_longhun: true },
                { name: 'shan', nature: '', isCard: true , boss_longhun: true },
                { name: 'tao', nature: '', isCard: true , boss_longhun: true },
                { name: 'wuxie', nature: '', isCard: true , boss_longhun: true },
            ];

        },
        filter: function (event, player) {
            const filter = event.filterCard;
            if (filter(get.autoViewAs({ name: 'sha', nature: 'fire', isCard: true , boss_longhun: true }, "unsure"), player, event) && player.countCards("hes", { suit: "diamond" })) return true;
            if (filter(get.autoViewAs({ name: 'shan', nature: '', isCard: true , boss_longhun: true }, "unsure"), player, event) && player.countCards("hes", { suit: "club" })) return true;
            if (filter(get.autoViewAs({ name: 'tao', nature: '', isCard: true , boss_longhun: true }, "unsure"), player, event) && player.countCards("hes", { suit: "heart" })) return true;
            if (filter(get.autoViewAs({ name: 'wuxie', nature: '', isCard: true , boss_longhun: true }, "unsure"), player, event) && player.countCards("hes", { suit: "spade" })) return true;
            return false;
        },
        charlotte: true,
        unique:true,
        locked: false,
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const name = get.suit(card, player);
            if (name == "diamond" && filter(get.autoViewAs({ name: 'sha', nature: 'fire', isCard: true , boss_longhun: true }, "unsure"), player, event)) return true;
            if (name == "club" && filter(get.autoViewAs({ name: 'shan', nature: '', isCard: true , boss_longhun: true }, "unsure"), player, event)) return true;
            if (name == "heart" && filter(get.autoViewAs({ name: 'tao', nature: '', isCard: true , boss_longhun: true }, "unsure"), player, event)) return true;
            if (name == "spade" && filter(get.autoViewAs({ name: 'wuxie', nature: '', isCard: true , boss_longhun: true }, "unsure"), player, event)) return true;
            return false;
        },
        viewAs: function (cards, player) {
            if (cards.length) {
                let viewcard = false;
                let viewnature = "";
                switch (get.suit(cards[0], player)) {
                    case "diamond": viewcard = "sha"; viewnature = "fire"; break;
                    case "club": viewcard = "shan"; viewnature = ""; break;
                    case "heart": viewcard = "tao"; viewnature = ""; break;
                    case "spade": viewcard = "wuxie"; viewnature = ""; break;
                }
                if (viewcard) return { name: viewcard, nature: viewnature, isCard: true, boss_longhun: true };
            }
            return null;
        },
        position: "hes",
        selectCard: 1,
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
                const object = { sha: "diamond", shan: "club", tao: "heart", wuxie: "spade" };
                const keys = Object.keys(object);
                for (let key of keys) {
                    const hasSuits = player.countCards("hes", { suit: object[key] });
                    if (hasSuits > 0) {
                        let Vcard = { name: key, nature: key === "sha" ? 'fire' : '', isCard: true, boss_longhun: true };
                        const Vorder = get.order(Vcard);
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            if (Vorder >= order) order = Vorder * 1.2 + addorder;
                        } else {
                            order = Vorder * 0.5 + addorder / 5;
                        }
                        if (addorder > 0) return 2;
                        if (order >= Vorder) {
                            return get.value(card, player) <= compareValue(player,'tao') * 1.25;
                        } else {
                            return get.value(card, player) <= Math.min(compareValue(player,'tao') * 0.95 , compareValue(player,'shan') * 0.95, compareValue(player,'wuxie') * 0.95);
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
            //无
        },
        precontent: async function () {
            //无
        },
        hiddenCard: function (player, name) {
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
            threaten: 3,
            skillTagFilter: function (player, tag) {
                let suit;
                switch (tag) {
                    case "respondSha": suit = "diamond"; break;
                    case "respondShan": suit = "club"; break;
                    case "save": suit = "heart"; break;
                    case "recover": suit = "heart"; break;
                    case "respondTao": suit = "heart"; break;
                }
                if (!player.countCards("hes", { suit: suit })) return false;
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
                    const object = { sha: "diamond", shan: "club", tao: "heart", wuxie: "spade" };
                    const keys = Object.keys(object);
                    for (let key of keys) {
                        const hasSuits = player.countCards("hes", { suit: object[key] });
                        if (hasSuits > 0) {
                            let Vcard = { name: key, nature: key === "sha" ? 'fire' : '', isCard: true, boss_longhun: true };
                            const Vorder = get.order(Vcard);
                            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                if (Vorder >= order) order = Vorder * 1.2 + addorder;
                            } else {
                                order = Vorder * 0.5 + addorder / 5;
                            }
                            return Math.max(order, 2);
                        }
                    }
                }
                return Math.max(order + addorder, 2);
            },
        },
        subSkill: {
            backup: {
                charlotte: true,
                unique:true,
                filterCard: function(card, player) {
                    const cards = player.getCards('hes');
                    const filteredCards = cards.filter(card => {
                        const cardkey = get.suit(card) === 'heart' || get.name(card) === 'tao';
                        return lib.filter.cardEnabled(card, player, "forceEnable") && cardkey;
                    });
                    return filteredCards.includes(card);
                },
                selectCard: 1,
                position: "hes",
                viewAs: function (cards, player) {
                    return { name: 'tao', nature: '', isCard: true , boss_longhun: true };
                },
                filterTarget: function(card, player, target) {
                    return player === target && lib.filter.targetEnabled(card, player, target);;
                },
                check: function (card) {
                    const player = _status.event.player;
                    const skillKey = player.hasSkill("TAF_boss_juejing");
                    if (!skillKey) return 1;
                    const skillKey_longhun = player.hasSkill("TAF_boss_longhun");
                    const canSaveCards = player.getCards('hes').filter(card => {
                        const key1 = get.suit(card) === 'heart';
                        const key2 = player.canSaveCard(card, player);
                        if (skillKey_longhun) {
                            return key1 || key2;
                        } else {
                            return key2;
                        }
                    }).sort((a, b) => get.value(a) - get.value(b));
                    if (canSaveCards.length > 1) return get.value(card, player) === get.value(canSaveCards[0], player);
                    return 0;
                },
                onrespond: function () {
                    return this.onuse.apply(this, arguments);
                },
                precontent: async function () {
                    //无
                },
                onuse: async function (result, player) {
                    player.logSkill('TAF_boss_longhun');
                },
                log: false,
                sub: true,
                sourceSkill: "TAF_boss_longhun",
                "_priority": -25,
            },
        },
        "_priority": 0,
    },
    TAF_boss_jiwu:{
        audio:"ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        firstDo: true,
        charlotte: true,
        unique:true,
        locked:false,
        async init(player, skill) {
            if (!player._jiwufilterCard) player._jiwufilterCard = function() {
                let suitlist = [];
                if (!player.hasSkill("TAF_boss_xuanfeng")) suitlist.push("diamond");
                if (!player.hasSkill("TAF_boss_wansha")) suitlist.push("club");
                if (!player.hasSkill("TAF_boss_qiangxi")) suitlist.push("heart");
                if (!player.hasSkill("TAF_boss_tieji")) suitlist.push("spade");
                return suitlist;
            };
        },
        filter:function (event, player) {
            const suitlist = player._jiwufilterCard();
            const cards = player.getCards('he');
            if (suitlist.length === 0) return false;
            for(const suit of suitlist) {
                if(cards.filter(card => get.suit(card) === suit).length > 0) return true;
            }
            return false;
        },
        derivation: ["TAF_boss_xuanfeng","TAF_boss_wansha","TAF_boss_qiangxi","TAF_boss_tieji"],
        filterCard: function (card, player, event) {
            const suitlist = player._jiwufilterCard();
            const suit = get.suit(card, player);
            if (suitlist.includes(suit)) return true;
            return false;
        },
        selectCard: 1,
        position: "he",
        check: function(card) {
            const player = _status.event.player;
            const cards = player.getCards('he');
            const set = {
                diamond: cards.filter(card => get.suit(card) === 'diamond').sort((a, b) => get.value(a) - get.value(b)),
                club: cards.filter(card => get.suit(card) === 'club').sort((a, b) => get.value(a) - get.value(b)),
                heart: cards.filter(card => get.suit(card) === 'heart').sort((a, b) => get.value(a) - get.value(b)),
                spade: cards.filter(card => get.suit(card) ==='spade').sort((a, b) => get.value(a) - get.value(b)),
            }
            if (!player.hasSkill("TAF_boss_xuanfeng") && set.diamond.length > 0) return card === set.diamond[0];
            if (!player.hasSkill("TAF_boss_wansha") && set.heart.length > 0) return card === set.heart[0];
            if (!player.hasSkill("TAF_boss_qiangxi") && set.club.length > 0) return card === set.club[0];
            if (!player.hasSkill("TAF_boss_tieji") && set.spade.length > 0) return card === set.spade[0];
            return false;
        },
        async content(event, trigger, player) {
            const cards = event.cards;
            if (cards.length === 0) return;
            const suit = get.suit(cards[0], player);
            if (suit) {
                switch (suit) {
                    case "diamond":
                        player.addTempSkill("TAF_boss_xuanfeng");
                        game.log(player, '获得了技能', '#g【旋风】', '。');
                        break;
                    case "club":
                        player.addTempSkill("TAF_boss_wansha");
                        game.log(player, '获得了技能', '#g【完杀】', '。');
                        break;
                    case "heart":
                        player.addTempSkill("TAF_boss_qiangxi");
                        game.log(player, '获得了技能', '#g【强袭】', '。');
                        break;
                    case "spade":
                        player.addTempSkill("TAF_boss_tieji");
                        game.log(player, '获得了技能', '#g【铁骑】', '。');
                        break;
                    default:
                        break;
                }
            }
        },
        ai: {
            threaten: 3,
            order: function (item, player) {
                if (player && _status.event.type == "phase") {
                    let setorder = 9;
                    const suitlist = player._jiwufilterCard();
                    if(suitlist && Array.isArray(suitlist)) {
                        setorder += suitlist.length;
                    }
                    const cards = player.getCards('he');
                    if(cards && cards.length > 0) {
                        const set = {
                            diamond: cards.filter(card => get.suit(card) === 'diamond'),
                            club: cards.filter(card => get.suit(card) === 'club'),
                            heart: cards.filter(card => get.suit(card) === 'heart'),
                            spade: cards.filter(card => get.suit(card) ==='spade'),
                        }
                        const Orderlist = [];
                        for(const card of cards) {
                            const sorder = get.order(card, player);
                            if(sorder && sorder > 0) {
                                Orderlist.push(sorder);
                            }
                        }
                        const maxOrder = Math.max(...Orderlist);
                        if (!player.hasSkill("TAF_boss_xuanfeng") && set.diamond.length > 0) return Math.max(setorder, maxOrder * 4);
                        if (!player.hasSkill("TAF_boss_wansha") && set.heart.length > 0) return Math.max(setorder, maxOrder * 4);
                        if (!player.hasSkill("TAF_boss_qiangxi") && set.club.length > 0) return Math.max(setorder, maxOrder * 4);
                        if (!player.hasSkill("TAF_boss_tieji") && set.spade.length > 0) return Math.max(setorder, maxOrder * 4);
                        return setorder;
                    }
                    return setorder;
                }
                return 9;
            },
            result:{
                player:function (player, target, card){
                    return 10;
                },
            },
        },
        "_priority": Infinity,
    },
    TAF_boss_shenqu:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player: ["dyingAfter"],
            global: ["phaseBegin"],
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        locked: false,
        direct:true,
        async init(player, skill) {

        },
        filter:function(event, player , name){
            if(name === "phaseBegin"){
                return event.player !== player;
            } else if(name === "dyingAfter"){
                const Vcard = { name: 'tao', nature: '', isCard: true , boss_longhun: true };
                if (!lib.filter.cardEnabled(Vcard, player)) return false
                const cards = player.getCards('he');
                const filteredCards = cards.filter(card => {
                    const cardkey = get.suit(card) === 'heart' || get.name(card) === 'tao';
                    return lib.filter.cardEnabled(card, player, "forceEnable") && cardkey;
                });
                return player.isAlive() && filteredCards.length > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseBegin") {
                const prompt = setColor("〖神躯〗：是否弃置两张牌？");
                const result = await player.chooseBool(prompt).set('ai', function() {
                    const skillKey = player.hasSkill("TAF_boss_juejing");
                    if (!skillKey) return false;
                    const skillKey_longhun = player.hasSkill("TAF_boss_longhun");
                    const canSaveCards = player.getCards('hes').filter(card => {
                        const key1 = get.suit(card) === 'heart';
                        const key2 = player.canSaveCard(card, player);
                        if (skillKey_longhun) {
                            return key1 || key2;
                        } else {
                            return key2;
                        }
                    }).sort((a, b) => get.value(a) - get.value(b));
                    if (canSaveCards.length < 2) return true;
                    return false;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    await player.chooseToDiscard(2, 'he', true).set('ai', function(card) {
                        const cards = player.getCards('he').sort((a, b) => get.value(a,player) - get.value(b,player));
                        const topTwo = cards.slice(0, 2);
                        if (topTwo.includes(card)) return 3;
                        else return 1;//因为是强制没办法！
                    });
                }
            } else if(Time === "dyingAfter") {
                const prompt = setColor("是否使用一张龙魂〖桃〗牌？");
                const next = player.chooseToUse();
                next.set("prompt", prompt);
                next.set('norestore', true);
                next.set('_backupevent', 'TAF_boss_longhun_backup');
                next.set('addCount', false);
                next.set('custom', {
                    add: {},
                    replace: {},
                });
                next.backup('TAF_boss_longhun_backup');
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority": Infinity,
    },
    TAF_boss_xuanfeng:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            global: ["loseAfter","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
        },
        firstDo: true,
        charlotte: true,
        unique:true,
        locked: false,
        direct:true,
        async init(player, skill) {
            if(!player.checkTargets_xuanfeng) player.checkTargets_xuanfeng = function(){
                const targets = game.filterPlayer(o => {
                    return o.isAlive() && o.countCards('he') > 0 && o.countDiscardableCards(player, "he") > 0;
                });
                return targets;
            };
        },
        filter:function(event, player, name){
            if (_status.dying.length > 0) return false;
            const evt = event.getl(player);
            const targets = player.checkTargets_xuanfeng();
            return evt && evt.es && evt.es.length > 0 && targets.length > 0;
        },
        async content(event, trigger, player) {
            const evt = trigger.getl(player);
            let count = evt?.es?.length || 1;
            while (count > 0) {
                count--;
                if (_status.dying.length > 0) return;
                const targets = player.checkTargets_xuanfeng();
                if (targets.length === 0) return;
                const numchoose = Math.min(2, targets.length);
                const prompt = setColor("〖旋风〗：是否要弃置至多"+ get.cnNumber(numchoose) +"名其他角色共计"+ get.cnNumber(numchoose) +"张牌？");
                const result = await player.chooseTarget(prompt, [0, numchoose], function (card, player, target) {
                    return targets.includes(target);
                }).set('ai', function (target) {
                    const enemies = targets.filter(o => get.attitude(player, o) < 2).sort((a, b) => {
                        const a_hs = a.getCards('hs').length, b_hs = b.getCards('hs').length;
                        const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                        if (a_es !== b_es) return b_es - a_es;
                        if (a_hs !== b_hs) return b_hs - a_hs;
                        return a.hp - b.hp;
                    });
                    if (enemies.length > 1) {
                        const selectedTargets = enemies.slice(0, 2);
                        if (selectedTargets.includes(target)) return 1;
                        else return 0;
                    } else if (enemies.length === 1) {
                        if (targets.includes(player)) {
                            const selectedTargets = [player, enemies[0]];
                            if (selectedTargets.includes(target)) return 1;
                            else return 0;
                        } else {
                            return 0;
                        }
                    } else {
                        return 0;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name, result.targets);
                    let numdiscard = 0;
                    for (const target of result.targets) {
                        numdiscard ++;
                        player.line(target,'fire');
                        await player.discardPlayerCard(target, "he", true);
                    }
                    if (numdiscard >= 2) {
                        const fanyi = result.targets.map(o => get.translation(o)).join('、');
                        const prompt = setColor("〖旋风〗：是否要从" + fanyi + " 中选择一名对其造成一点伤害？");
                        const Targetresult = await player.chooseTarget(prompt, function (card, player, target) {
                            return result.targets.includes(target);
                        }).set('ai', function (target) {
                            return get.damageEffect(target, player, player);
                        }).forResult();
                        if (Targetresult.bool) {
                            const target = Targetresult.targets[0];
                            player.logSkill(event.name, target);
                            player.line(target,'fire');
                            await target.damage(1, 'nocard', player);
                        }
                    }
                }
            }
        },
        "_priority":0,
    },
    TAF_boss_wansha:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            global: ["dying"],
        },
        firstDo: true,
        charlotte: true,
        unique: true,
        forced: true,
        global: ["TAF_boss_wansha_buff"],
        async init(player, skill) {},
        filter:function(event, player, name){ return _status.currentPhase == player && event.player != player; },
        async content(event, trigger, player) {},
        "_priority": 0,
    },
    TAF_boss_wansha_buff:{
        audio:"TAF_boss_wansha",
        mod: {
            cardSavable: function(card, player) {
                if (card.name == "tao" && _status.currentPhase?.isIn() && _status.currentPhase.hasSkill("TAF_boss_wansha") && _status.currentPhase != player) {
                    if (!player.isDying()) {
                        return false;
                    }
                }
            },
            cardEnabled: function (card, player) {
                if (card.name == "tao" && _status.currentPhase?.isIn() && _status.currentPhase.hasSkill("TAF_boss_wansha") && _status.currentPhase != player) {
                    if (!player.isDying()) {
                        return false;
                    }
                }
            },
        },
        firstDo: true,
        charlotte: true,
        unique: true,
        forced: true,
        "_priority": 0,
    },
    TAF_boss_qiangxi:{
        audio:"ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        usable: 2,
        charlotte: true,
        unique: true,
        locked: false,
        async init(player, skill) {
            if (!player._qiangxiCards) player._qiangxiCards = function() {
                const cards = player.getCards('he').filter(card => {
                    return get.subtype(card, player) == "equip1";
                });
                return cards;
            };
        },
        filter:function (event, player) {
            return player._qiangxiCards().length > 0 || player.hp > 0;
        },
        filterCard: function (card, player, event) {
            return get.subtype(card) == "equip1";
        },
        selectCard: function () {
            const equip1 = _status.event.player._qiangxiCards();
            if (equip1 && equip1.length > 0) {
                return [0, 1];
            } else {
                return 0;
            }
        },
        position: "he",
        filterTarget: function (card, player, target) {
            if (player == target) return false;
            const stat = player.getStat()._boss_qiangxi;
            return !stat || !stat.includes(target);
        },
        selectTarget: function () {
            return 1;
        },
        logTarget: "target",
        line: "fire",
        async content(event, trigger, player) {
            const stat = player.getStat();
            if (!stat._boss_qiangxi) stat._boss_qiangxi = [];
            const cards = event.cards;
            const targets = event.targets;
            if (cards.length === 0) await player.loseHp();
            if (targets.length === 0) return;
            stat._boss_qiangxi.push(targets[0]);
            await targets[0].damage(1, 'nocard', player);
        },
        ai: {
            threaten: 3,
            order: function (item, player) {
                let order = 0;
                if (player && _status.event.type == "phase") {
                    if (player.hasSkill("TAF_boss_tieji")) {
                        return compareOrder(player, 'sha') * 0.75;
                    }
                    return Math.max(order,2);
                }
                return Math.max(order,2);
            },
            result:{
                target:function (player, target, card){
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
                    if (!ui.selected.cards.length) {
                        if (canSaveCards.length == 0) return 0;
                        if (canSaveCards.length > 0 && skillKey) return get.damageEffect(target, player, target);
                        return 0;
                    }
                    return get.damageEffect(target, player, target);
                },
            },
        },
        "_priority":0,
    },
    TAF_boss_tieji:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger: {
            player: ["useCardToPlayered"],
        },
        logTarget: "target",
        charlotte: true,
        frequent: true,
        preHidden: true,
        shaRelated: true,
        filter(event, player, name) {
            const targets = event.targets;
            if (!targets || targets.length !== 1) return false;
            const card = event.card;
            return card.name === 'sha' || card.name === 'juedou';
        },
        check(event, player) {
            return get.attitude(player, event.target) < 2;
        },
        async content(event, trigger, player) {
            const name = trigger.card.name;
            const target = trigger.targets[0];
            const skillKey = player.hasSkill('TAF_boss_wushuang');
            /**
             * 史上最人性化的铁骑AI。
             */
            const judgeresult = await player.judge(function (card) {
                const suit = get.suit(card);
                const cards_he = target.getCards('he').sort((a, b) => get.value(a,target) - get.value(b,target));
                if(!cards_he || cards_he.length === 0) return 0;
                let setValueSuits = []; 
                for(const card of cards_he) {
                    const suit = get.suit(card, target);
                    if(setValueSuits.includes(suit)) continue;
                    setValueSuits.push(suit);
                }
                let getValueSuits = [];//模拟对于玩家不重要的花色
                if(setValueSuits.length <= 1) {
                    getValueSuits = setValueSuits.slice(0,1);
                } else {
                    getValueSuits = setValueSuits.slice(0,2);
                }
                if(!getValueSuits.includes(suit)) {//提前返回判定结果
                    return -4;
                } else {
                    const getValuecards = [];//模拟对于玩家不重要的对应花色牌，排序后的第一张价值最低的牌
                    const selectSuits = [];
                    for(const card of cards_he) {
                        const suit = get.suit(card, target);
                        if(getValueSuits.includes(suit) && !selectSuits.includes(suit)) {
                            getValuecards.push(card);
                            selectSuits.push(suit);
                        }
                    }
                    const filtercards = cards_he.filter(card => !getValuecards.includes(card));//过滤出模拟对于玩家不重要的对应花色牌首张牌。
                    if(name ==='sha') {
                        const selected = filtercards.filter(c => get.name(c) === 'shan');
                        if(skillKey) {//玩家有无双技能
                            if(selected.length > 1 && getValueSuits.includes(suit)) return 2;
                            return - 2;
                        } else {//玩家没有无双技能
                            if(selected.length > 0 && getValueSuits.includes(suit)) return 2;
                            return - 2;
                        }
                    } else if(name ==='juedou') {
                        const selected = filtercards.filter(c => get.name(c) === 'sha');
                        if(skillKey) {
                            if(selected.length > 1 && getValueSuits.includes(suit)) return 2;
                            return - 2;
                        } else {
                            if(selected.length > 0 && getValueSuits.includes(suit)) return 2;
                            return - 2;
                        }
                    } else {
                        return - 1;
                    }
                }
            }).forResult();
            const suit = judgeresult.suit;
            //debugger;
            if(name ==='sha') {
                if(!target.hasSkill('fire_fengyin')) target.addTempSkill('fire_fengyin');
            } else if(name === 'juedou') {
                if(!target.hasSkill('fire_yijue')) target.addTempSkill('fire_yijue');
            }
            const prompt = setColor("请弃置一张" + get.translation(suit) + "牌，否则不能响应" + get.translation(trigger.card) + "！");
            const disresult = await target.chooseToDiscard(prompt, 1, 'he', function(card) {
                return get.suit(card) === suit;
            }).set('ai', function(card) {
                /**
                 * 就问你思路清晰不清晰！
                 */
                if (judgeresult.bool === true) {
                    const filtercards = target.getCards('he').filter(card => get.suit(card) === suit).sort((a, b) => get.value(a, target) - get.value(b, target));
                    if(filtercards.length > 0) return get.value(card, target) === get.value(filtercards[0], target);
                    return false;
                }
                return false;
            }).forResult();
            if(!disresult.bool) {
                trigger.getParent().directHit.add(target);
                game.log(target, "未弃置" , suit , "牌，其不能响应", player ,"使用" , trigger.card, "！");
            }
        },
        ai:{
            order: 13,
            "directHit_ai": true,
            ignoreSkill: true,
            threaten: 3,
            skillTagFilter: function (player, tag, arg){
                if (tag == "directHit_ai") {
                    return arg?.target && get.attitude(player, arg.target) < 2;
                }
                if (tag == "ignoreSkill") {
                    if (!arg || arg.isLink || !arg.card) return false;
                    if (arg.card.name !== "sha" || arg.card.name !== "juedou") return false;
                    if (!arg.target || get.attitude(player, arg.target) >= 2) return false;
                    const skill = arg.skill;
                    const target = arg.target;
                    if (!target || !skill) return false;
                    if (!target.getSkills(true, false).includes(skill)) return false;
                    const key1 = lib.skill[skill].persevereSkill;
                    const key2 = lib.skill[skill].charlotte;
                    const key3 = get.is.locked(skill, target);
                    if (arg.card.name === "juedou") {//锁定技失效，忽略锁定技的effec收益
                        if (!key1 && !key2 && key3) return true;
                    }
                    if (arg.card.name === "sha") {//非锁定技失效，忽略非锁定技的effec收益
                        if (!key1 && !key2 && !key3) return true;
                    }
                    return false;
                }
            },
        },
    },
};

/** @type { importCharacterConfig['skill'] } */
const TAF_Bossfengdu = {

};
const TAF_BossSkills = {
    ...TAF_Bosslvbu,
    ...TAF_boss_shenguigaoda,
    ...TAF_Bossfengdu,
};
export default TAF_BossSkills;
