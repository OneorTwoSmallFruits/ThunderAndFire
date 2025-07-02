import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs , oltianshu} from'./asyncs.js';
const {
    setColor, cardAudio, delay, getCardSuitNum, getCardNameNum,
    compareValue, 
    compareOrder, compareUseful, checkVcard, checkSkills,
    chooseCardsToPile, chooseCardsTodisPile, setTimelist,
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


/** @type { importCharacterConfig['skill'] } */
const TAF_sunSkills = {
    //司马懿
    sunquanmou: {
        audio:"ext:银竹离火/audio/skill:4",
        mod:{
            maxHandcardBase: function (player, num) {
                let count = 1;
                if (player.sunpingling_wei) count ++;
                if (player.sunpingling_shu) count ++;
                if (player.sunpingling_wu) count ++;
                return count;
            },
        },
        trigger:{
            source:"damageAfter",
            player:["phaseZhunbeiBegin","phaseJieshuBegin","loseMaxHpBefore","gainMaxHpBefore"],
            global:["phaseUseAfter"],
        },
        locked:true,
        direct:true,
        init: async function (player, skill) {
            if (!player.storage.skill) player.storage.skill = false;
        },
        filter:function(event, player, name) {
            if (name == 'damageAfter') {
                if (!player.sunpingling_wei) return false;
                if (player.storage.sunquanmou) return false;
                if (_status.currentPhase !== player) return false;
                const card = event.card;
                if(!card || card.name != 'sha') return false;
                return true;
            } else if (name == 'phaseJieshuBegin') {
                return player.sunpingling_shu;
            } else if (name == 'phaseZhunbeiBegin') {
                return player.sunpingling_wu; 
            } else if (name == 'loseMaxHpBefore' || name == 'gainMaxHpBefore') {
                return player.storage.sunpingling;
            } else if (name == 'phaseUseAfter') {
                player.storage.sunquanmou = false;
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            player.logSkill(event.name);
            if (Time == 'damageAfter') {
                if (trigger.addCount !== false) {
                    trigger.addCount = false;
                    player.getStat().card.sha = 0;
                    player.storage.sunquanmou = true;
                }
            } else if (Time == 'phaseJieshuBegin') {
                player.link(false);
                await player.draw(3);
                if (player.countCards('he') >= 2) {
                    await player.chooseToDiscard(2, 'he', true);
                } else if (player.countCards('he') > 0) {
                    await player.discard(player.getCards('he'), true);
                }
            } else if (Time == 'phaseZhunbeiBegin') {
                player.link(true);
                await player.draw(2);
                if (player.countCards('he') >= 3) {
                    await player.chooseToDiscard(3, 'he', true);
                } else if (player.countCards('he') > 0) {
                    await player.discard(player.getCards('he'), true);
                }
                const damageType = ['thunder', 'fire', 'ice'][Math.floor(Math.random() * 3)];
                await player.damage(1, damageType);
            } else if (Time == 'loseMaxHpBefore' ||  Time == 'gainMaxHpBefore') {
                trigger.cancel(); 
            }
        },
        subSkill:{
            wei:{
                mark:true,
                marktext:"<font color= #0088CC>魏</font>",
                persevereSkill:true,
                charlotte:true,
                unique:true,
                locked:true,
                forced:true,
                intro:{
                    content:function(){
                        return [
                            "洛水为誓，皇天为证，吾意不在刀兵",
                            "以谋代战，攻形不以力，攻心不以勇。",
                            "烽烟起大荒，戎军远役，问不臣者谁？",
                            "挥斥千军之贲，长驱万里之远",
                            "以权谋而立者，必失大义于千秋……"
                        ].randomGet();
                    },
                },
                sub:true,
                sourceSkill:"sunquanmou",
            },
            shu:{
                mark:true,
                marktext:"<font color= #FF2400>蜀</font>",
                persevereSkill:true,
                charlotte:true,
                unique:true,
                locked:true,
                forced:true,
                intro:{
                    content:function(){
                        return [
                            "鸿门之宴虽歇，会稽之胆尚悬，孤岂姬、项之辈。",
                            "昔藏青锋于沧海，今潮落，可现兵！",
                            "率土之滨皆为王臣，辽土亦居普天之下。",
                            "青云远上，寒锋试刃，北雁当寄红翎。",
                            "人立中流，非己力可向，实大势所迫……"
                        ].randomGet();
                    },
                },
                sub:true,
                sourceSkill:"sunquanmou",
            },
            wu:{
                mark:true,
                marktext:"<font color= #48D1CC>吴</font>",
                persevereSkill:true,
                charlotte:true,
                unique:true,
                locked:true,
                forced:true,
                intro:{
                    content:function(){
                        return [
                            "转守为攻，以静制动",
                            "司马氏，乃天命之所加矣！",
                            "煞星聚顶，你死到临头了！",
                            "天狼星光大盛，天下易主可期！",
                            "忍一时，风平浪静。",
                            "退一步，海空天空。",
                            "老骥伏枥，志在千里。",
                            "烈士暮年，壮心不已！",
                            "赦你死罪，你去吧！",
                            "老夫，即是天命！",
                            "顺应天意。得道多助。",
                            "天要亡你，谁人能救？",
                            "受命于天，既寿永昌！",
                            "一鼓作气，破敌制胜！",
                            "天之道，轮回也。",
                            "鼎足三分，三家归晋！"
                        ].randomGet();
                    },
                },
                sub:true,
                sourceSkill:"sunquanmou",
            },
        },
    },
    sunxiongyi: {
        audio:"ext:银竹离火/audio/skill:4",
        marktext:"<font color= #EE9A00>雄奕</font>",
        onremove:true,
        intro:{
            content:function(storage, player) {
                const skillKey = player.storage.sunpingling;
                let info = '未觉醒：无次数限制！';
                if(!skillKey) return info;
                const dislist = player.getdisSkill();
                let nummark = player.countMark('sunxiongyi');
                if (dislist.includes('sunxiongyi')) {
                    info = '本回合已失效。';
                } else {
                    info = '<font color= #0088CC>当前已使用次数=　</font>' + nummark;
                }
                return info;
            },
            name:"<font color= #EE9A00>雄奕</font>",
        },
        trigger:{
            global:["damageBegin","phaseAfter"],
        },
        filter:function (event, player, name) {
            if (name == 'phaseAfter') {
                player.clearMark('sunxiongyi');
                return;
            } else {
                const target = event.player;
                const source = event.source;
                const num = event.num;
                if (!source || !num) return false;
                if (source === player) return num > 0 && player.storage.sunpingling;
                if (target === player) return num > 0;
                return false
            }
        },
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseAfter") return;
            const chat = [
                "以权谋而立者，必失大义于千秋……", 
                "人立中流，非己力可向，实大势所迫……", 
                "烽烟起大荒，戎军远役，问不臣者谁？", 
                "隐忍必现天弓，蓄势而发！"
            ].randomGet();
            const source = trigger.source;
            const nameID = player.name;
            async function gameplayersDraw(choices = false) {
                let count = 0;
                if  (choices === false) { 
                    if (player.group !== source.group) await player.changeGroup(source.group);
                    const SameGroupPlayers = game.filterPlayer(function(current) {
                        return current.group === source.group ;
                    }).sortBySeat();
                    for (let target of SameGroupPlayers) {
                        player.line(target, 'thunder');
                        await target.draw();
                        if(target.countGainableCards(player, "hej") > 0){
                            count ++;
                            await player.gainPlayerCard(target, "hej", true);
                        }
                    }
                } else if (choices === true) { 
                    for (let target of game.filterPlayer().sortBySeat()) {
                        player.line(target, 'thunder');
                        await target.draw();
                        if(target.countGainableCards(player, "hej") > 0){
                            count ++;
                            await player.gainPlayerCard(target, "hej", true);
                        }
                    }
                }
                return count;
            }
            const skillKey = player.storage.sunpingling;
            let count = trigger.num || 1;
            while (count > 0) {
                count--;
                let numdraw = 0;
                const keys = ['wei','shu','wu'];
                for (const key of keys) {
                    if (player['sunpingling_' + key]) numdraw ++;
                }
                const result = await player.chooseBool(get.prompt("sunxiongyi")).set('ai', function(bool) {
                    const shouyi = sunxiongyiAI(player);
                    //console.log(shouyi);
                    return shouyi > 0;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    if (changeSkinskey) {
                        const skinsID = player.checkSkins();
                        if (skinsID) {
                            if (skinsID === nameID || skinsID === nameID + "1") player.changeSkins(2);
                            if (skinsID === nameID + "3") player.changeSkins(4);
                        }
                    }
                    if(skillKey) player.addMark("sunxiongyi", 1);
                    if (numdraw > 0) await player.draw(numdraw);
                    if(skillKey) {
                        const getDrawSum = await gameplayersDraw(true);
                        if (getDrawSum > 0) {
                            const disnum = Math.floor((getDrawSum + numdraw) / 2);
                            if (disnum > 0) {
                                await player.chooseToDiscard(disnum, 'he', true);
                            }
                        }
                        const nummark = player.countMark('sunxiongyi');
                        if (nummark > player.getDamagedHp()) {
                            player.tempdisSkill('sunxiongyi');
                            await player.changeCardsTo(3, 'he');
                            player.turnOver();
                            player.link(true);
                            const damageType = ['thunder', 'fire', 'ice'][Math.floor(Math.random() * 3)];
                            player.damage(1, damageType, "nosource");
                            player.chat(chat);
                            if (changeSkinskey) {
                                const skinsID = player.checkSkins();
                                if (skinsID) {
                                    if (skinsID === nameID || skinsID === nameID + "2") player.changeSkins(1);
                                    if (skinsID === nameID + "4") player.changeSkins(3);
                                }
                            }
                            return;
                        }
                    } else {
                        await gameplayersDraw(false);
                        await player.changeGroup("wei");
                        const sourceGroupPlayers = game.filterPlayer(function(current) {
                            return current.group === source.group;
                        });
                        if (sourceGroupPlayers && sourceGroupPlayers.length > 0) { 
                            await player.chooseToDiscard(sourceGroupPlayers.length, 'he', true);
                        }
                    }
                    if (changeSkinskey) {
                        const skinsID = player.checkSkins();
                        if (skinsID) {
                            if (skinsID === nameID || skinsID === nameID + "2") player.changeSkins(1);
                            if (skinsID === nameID + "4") player.changeSkins(3);
                        }
                    }
                }
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            threaten:function (player, target) {
                const att = get.attitude(player, target);
                let threatennum = sunxiongyiAI(player);
                if (att < 2) {
                    return Math.max(1, threatennum);
                } else {
                    return 0.5;
                }
            },
            effect:{
                target:function(card, player, target) {
                    const dislist = target.getdisSkill();
                    if (get.tag(card, "damage") && !dislist.includes('sunxiongyi')) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        //console.log("雄奕受到伤害卡牌的收益：",sunxiongyiAI(target));
                        return [1, sunxiongyiAI(target) - get.tag(card, "damage")];
                    } else if (get.tag(card, "recover") && _status.currentPhase == target && !dislist.includes('sunxiongyi')) {
                        const skilluse = target.countMark('sunxiongyi') + 1 - target.getDamagedHp();
                        if (target.hp <= 0) return;
                        if (skilluse > 0) return [1, -2];
                    }
                },
            },
        },
        "_priority":0,
    },
    sunpingling: {
        audio:"ext:银竹离火/audio/skill:4",
        marktext:"<font color= #EE9A00>平陵</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #EE9A00>平陵</font>",
        },
        trigger:{
            global:["roundStart","dying"],
        },
        unique:true,
        locked:true,
        direct:true,
        priority: Infinity,
        changeGroup:['wei','jin'],
        init:async function (player, skill) {
            const keys = ['wei','shu','wu','used'];
            for (const key of keys) {
                if (!player['sunpingling_' + key]) player['sunpingling_' + key] = false;
            }
            if (!player.storage.sunpingling) player.storage.sunpingling = false;
            await game.changeGroupSkill(player, skill);
        },
        filter:function (event, player, name) {
            if (name == 'roundStart') {
                player.sunpingling_used = false;
                return;
            } else if (name == 'dying') {
                const wei = player.sunpingling_wei;
                const shu = player.sunpingling_shu;
                const wu = player.sunpingling_wu;
                if (wei && shu && wu) return false;
                const target = event.player;
                if (target === player) {
                    return !player.sunpingling_used;
                } else {
                    if (player.getStorage('sunpingling').includes(target)) return false;
                    return true;
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'roundStart') return;
            const chatwei = [
                "洛水为誓，皇天为证，吾意不在刀兵",
                "以谋代战，攻形不以力，攻心不以勇。",
                "烽烟起大荒，戎军远役，问不臣者谁？",
                "挥斥千军之贲，长驱万里之远",
                "以权谋而立者，必失大义于千秋……"
            ].randomGet();
            const chatshu = [
                "鸿门之宴虽歇，会稽之胆尚悬，孤岂姬、项之辈。",
                "昔藏青锋于沧海，今潮落，可现兵！",
                "率土之滨皆为王臣，辽土亦居普天之下。",
                "青云远上，寒锋试刃，北雁当寄红翎。",
                "人立中流，非己力可向，实大势所迫……"
            ].randomGet();
            const chatwu = [
                "转守为攻，以静制动",
                "司马氏，乃天命之所加矣！",
                "煞星聚顶，你死到临头了！",
                "天狼星光大盛，天下易主可期！",
                "忍一时，风平浪静。",
                "退一步，海空天空。",
                "老骥伏枥，志在千里。",
                "烈士暮年，壮心不已！",
                "赦你死罪，你去吧！",
                "老夫，即是天命！",
                "顺应天意。得道多助。",
                "天要亡你，谁人能救？",
                "受命于天，既寿永昌！",
                "一鼓作气，破敌制胜！",
                "天之道，轮回也。",
                "鼎足三分，三家归晋！"
            ].randomGet();
            const target = trigger.player;
            if (target === player) {
                player.sunpingling_used = true;
                game.log(player, '已对自身发动', '#g【平陵】', '此效果失效至新的一轮开始时！');
            } else {
                if (!player.getStorage(event.name).includes(target)) {
                    player.line(target, 'thunder');
                    player.markAuto(event.name, [target]);
                }
            }
            let count = 0;
            if (!player.sunpingling_wei) {
                player.logSkill(event.name);
                player.sunpingling_wei = true;
                if (player.sunpingling_wei) count ++;
                player.markSkill('sunquanmou_wei');
                player.chat(chatwei);
                player.draw(count);
                player.recover();
                return;
            } else if (!player.sunpingling_shu) { 
                player.logSkill(event.name);
                player.sunpingling_shu = true;
                if (player.sunpingling_wei) count ++;
                if (player.sunpingling_shu) count ++;
                player.markSkill('sunquanmou_shu');
                player.chat(chatshu);
                player.draw(count);
                player.recover();
                return;
            } else if (!player.sunpingling_wu) { 
                player.logSkill(event.name);
                player.sunpingling_wu = true;
                if (player.sunpingling_wei) count ++;
                if (player.sunpingling_shu) count ++;
                if (player.sunpingling_wu) count ++;
                player.markSkill('sunquanmou_wu');
                player.chat(chatwu);
                player.draw(count);
                player.recover();
                player.maxHp = 4;
                player.update();
                player.changeGroup("jin");
                player.removeStorage(event.name);
                player.unmarkSkill(event.name);
                player.storage.sunpingling = true;
                player.awakenSkill("sunpingling");
                game.log(player, '鼎足三分已成空，今潮落，可现兵！', '#g【平陵】');
                return;
            }
        },
        ai:{
            combo:["sunquanmou"],
        },
        "_priority":0,
    },
    //张春华
    sunjueqing: {
        audio: "ext:银竹离火/audio/skill:4",
        mark: true,
        marktext: "☯",
        onremove: true,
        zhuanhuanji: true,
        intro: {
            //晋，可减去一点体力值上限，令此次伤害改为流失体力并回复等量体力，然后摸一张黑色牌转换势力至魏；魏，可增加一点体力值上限，令此次伤害数值加一并失去一点体力，然后摸一张红色牌转换势力至晋。
            content: function(event, player) {
                let TXT = "";
                if (player.group != 'wei') {
                    TXT = setColor("晋：可减去一点体力值上限，令此次伤害改为流失体力并回复等量体力，然后摸一张黑色牌转换势力至魏！");
                } else {
                    TXT = setColor("魏，可增加一点体力值上限，令此次伤害数值加一并失去一点体力，然后摸一张红色牌转换势力至晋！");
                }
                return TXT;
            }
        },
        trigger: {
            source: "damageBefore",
        },
        changeGroup:['wei','jin'],
        locked:true,
        direct:true,
        init:async function (player, skill) {
            await game.changeGroupSkill(player, skill);
        },
        filter: function(event, player, name) {
            if (event.player === player) return false;
            return event.num > 0;
        },
        async content(event, trigger, player) {
            
            const nameID = player.name;
            const target = trigger.player;
            const att = get.attitude(player, target);
            const numlive = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
            let TXT = "";
            if (player.group != 'wei') {
                TXT = setColor("是否要减去一点体力值上限，令此次伤害改为流失体力并回复等量体力，然后摸一张黑色牌转换势力至魏？");
            } else {
                TXT = setColor("是否要增加一点体力值上限，令此次伤害数值加一并失去一点体力，然后摸一张红色牌转换势力至晋？");
            }
            const num = trigger.num;
            let result = await player.chooseBool(TXT).set('ai', function() {
                if (player.group != 'wei') {
                    if (att >= 2) {
                        return !target.hasSkillTag("maixie", false, player);
                    } else {
                        return true;
                    }
                } else {
                    if (target.hasSkillTag("filterDamage", false, player) || target.hasSkillTag("nodamage", false, player)) {
                        return false;
                    } else {
                        if (att >= 2) {
                            return false;
                        } else {
                            return numlive > 0;
                        }
                    }
                }
            }).forResult();
            if (result.bool) {
                player.changeZhuanhuanji("sunjueqing");
                player.logSkill(event.name);
                if (player.group != 'wei') {
                    trigger.cancel();
                    player.loseMaxHp();
                    trigger.player.loseHp(num);
                    player.recover(num);
                    await player.specifyCards('black');
                    if (player.group !== 'wei') {
                        player.changeGroup("wei");
                    }
                    if (changeSkinskey) {
                        const skinsID = player.checkSkins();
                        if (skinsID) {
                            if (skinsID === nameID || skinsID === nameID + "2") {
                                player.changeSkins(1);
                            }
                        }
                    }
                } else {
                    player.gainMaxHp();
                    trigger.num++;
                    player.loseHp(1);
                    await player.specifyCards('red');
                    if (player.group !== 'jin') {
                        player.changeGroup("jin");
                    }
                    if (changeSkinskey) {
                        const skinsID = player.checkSkins();
                        if (skinsID) {
                            if (skinsID === nameID || skinsID === nameID + "1") {
                                player.changeSkins(2);
                            }
                        }
                    }
                }
            }
        },
        ai:{
            expose:0.5,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
            jueqing: true,
            skillTagFilter: function (player, tag) {
                switch (tag) {
                    case "jueqing":
                        return player.group != 'wei'; 
                }
                return false;
            },
        },
        "_priority": 0
    },
    sunshangshi: {
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            player: ["damageBegin"],
            global: ["logSkill", "useCard", "changeHp", "gainMaxHp", "loseMaxHp", "equipAfter", "addJudgeAfter", "loseAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
        },
        filter: function(event, player, name) {
            if (name == 'damageBegin') {
                return player.countCards("he") > 0 && event.source && event.num > 0;
            } else {
                if (player.isHealthy()) return false;
                const cards = player.getCards("h");
                if (name == 'logSkill' || name == 'useCard' || name == 'changeHp' || name == 'gainMaxHp' || name == 'loseMaxHp') {
                    return cards.length < player.maxHp;
                } else {
                    const evt = event.getl(event.player);
                    if (evt && evt.cards && evt.cards.length > 0) {
                        return cards.length < player.maxHp;
                    }
                    return false;
                }
            }
        },
        persevereSkill: true,
        unique: true,
        direct: true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageBegin') {
                const result = await player.chooseCard(get.prompt('sunshangshi'), "是否弃置一张牌？", "he").set("ai", function(card) {
                    return sunshangshiAI(player, card);
                }).forResult();
                if (result.bool) {
                    const card = result.cards[0];
                    player.discard(card);
                }
            } else {
                player.logSkill(event.name);
                player.draw(player.maxHp - player.getCards("h").length);
            }
        },
        ai: {
            noh: true,
            skillTagFilter: function(player, tag) {
                const cards = player.getCards("h");
                if (tag == "noh") {
                    return cards.length < player.maxHp;
                }
            },
            effect:{
                target:function(card, player, target) {
                    if (get.tag(card, "damage")) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        const numlive = target.hp + target.countCards('h', { name: ['tao', 'jiu'] }) - get.tag(card, "damage");
                        if (target.isHealthy() && numlive > 0 ) return [1, 2];
                    }
                },
            },
        },
        "_priority": 0
    }  
};
export default TAF_sunSkills;
