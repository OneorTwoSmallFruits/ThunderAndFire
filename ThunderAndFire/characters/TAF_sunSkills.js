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
const { sunxiongyiAI} = setAI.wei;
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
        async init (player, skill) {
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
                const dislist = player.getDisSkills();
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
        changeSkins: async function (player) {
            const names = ["sun_simayi", "sun_simayi1", "sun_simayi2", "sun_simayi3", "sun_simayi4"];
            if (!changeSkinskey) return;
            const skinsID = player.checkSkins();
            if (!names.includes(skinsID)) return;
            if (skinsID === "sun_simayi" || skinsID === "sun_simayi1") player.changeSkins(2);
            if (skinsID === "sun_simayi3") player.changeSkins(4);
            if (skinsID === "sun_simayi2") player.changeSkins(1);
            if (skinsID === "sun_simayi4") player.changeSkins(3);
            //const changeSkins = get.info(event.name).changeSkins;
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
            const changeSkins = get.info(event.name).changeSkins;
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
                    return shouyi > 0;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    await changeSkins(player);
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
                            player.tempDisSkills('sunxiongyi');
                            await player.changeCardsTo(3, 'he');
                            player.turnOver();
                            player.link(true);
                            const damageType = ['thunder', 'fire', 'ice'][Math.floor(Math.random() * 3)];
                            player.damage(1, damageType, "nosource");
                            player.chat(chat);
                            await changeSkins(player);
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
                    await changeSkins(player);
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
                    if (get.tag(card, "damage")) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        return [1, sunxiongyiAI(target) - get.tag(card, "damage")];
                    } else if (get.tag(card, "recover") && _status.currentPhase == target) {
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
        categories(skill, player) {
            const changeGroup = lib.skill[skill].changeGroup;
            if(Array.isArray(changeGroup) && changeGroup.length === 2) {
                return ['势力转化技'];
            } else {
                return [];
            }
        },
        async init(player, skill) {
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
            content: function(event, player) {
                const bool = player.group !== 'wei';
                let yang = "魏，可增加一点体力值上限，令此次伤害数值加一并失去一点体力，然后摸一张红色牌",
                    yin = "晋：可减去一点体力值上限，令此次伤害改为流失体力并回复等量体力，然后摸一张黑色牌";
                if (!bool) {
                    return setColor(yang);
                } else {
                    return setColor(yin);
                }
            }
        },
        trigger: {
            source: "damageBefore",
        },
        categories(skill, player) {
            const changeGroup = lib.skill[skill].changeGroup;
            if(Array.isArray(changeGroup) && changeGroup.length === 2) {
                return ['势力转化技'];
            } else {
                return [];
            }
        },
        changeGroup:['wei','jin'],
        locked:false,
        init:async function (player, skill) {
            await game.changeGroupSkill(player, skill);
        },
        changeSkins: async function (player) {
            const names = ["sun_zhangchunhua", "sun_zhangchunhua1", "sun_zhangchunhua2"];
            if (!changeSkinskey) return;
            const skinsID = player.checkSkins();
            if (!names.includes(skinsID)) return;
            if (skinsID === "sun_zhangchunhua" || skinsID === "sun_zhangchunhua1") player.changeSkins(2);
            if (skinsID === "sun_zhangchunhua2") player.changeSkins(1);
            //const changeSkins = get.info(event.name).changeSkins;
        },
        filter: function(event, player, name) {
            if (event.player === player) return false;
            return event.num > 0;
        },
        async cost(event, trigger, player) {
            const bool = player.group !== 'wei';
            let yang = "〖绝情〗魏，可增加一点体力值上限，令此次伤害数值加一并失去一点体力，然后摸一张红色牌",
                yin = "〖绝情〗晋：可减去一点体力值上限，令此次伤害改为流失体力并回复等量体力，然后摸一张黑色牌";
            let prompt;
            if (!bool) prompt = setColor(yang);
            else prompt = setColor(yin);
            const target = trigger.player;
            const result = await player.chooseBool(prompt).set('ai', function() {
                const att = get.attitude(player, target);
                if (!bool) {
                    if (target.hasSkillTag("filterDamage", false, player) || target.hasSkillTag("nodamage", false, player)) return false;
                    if (att >= 2) return false;
                    return true;
                } else {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                event.result = { bool: true, cost_data: !bool? '魏' : '晋' };
            }
        },
        async content(event, trigger, player) {
            const changeSkins = get.info(event.name).changeSkins;
            const bool = event.cost_data;
            switch (bool) {
                case '魏':
                    player.gainMaxHp();
                    trigger.num++;
                    player.loseHp(1);
                    await player.specifyCards('red');
                    await player.changeGroup("jin");
                    break;
                case '晋':
                    trigger.cancel();
                    player.loseMaxHp();
                    trigger.player.loseHp(trigger.num);
                    player.recover(trigger.num);
                    await player.specifyCards('black');
                    await player.changeGroup("wei");
                    break;
                default:
                    break;
            }
            player.changeZhuanhuanji(event.name);
            await changeSkins(player);
        },
        ai:{
            expose:0.5,
            threaten: 1.5,
            jueqing: true,
            skillTagFilter: function (player, tag, arg) {
                if (tag == "jueqing") {
                    const bool = player.group !== 'wei';
                    if (!bool) return false;
                    return true;
                }
            },
        },
        "_priority": 0
    },
    sunshangshi: {
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            player: ["damageBegin"],
            global: ["changeHp", "gainMaxHp", "loseMaxHp", "equipAfter", "addJudgeAfter", "loseAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
        },
        locked:false,
        filter: function(event, player, name) {
            if (name == 'damageBegin') {
                return player.countCards("he") > 0 && event.source && event.num > 0;
            } else {
                if (player.isHealthy()) return false;
                const cards = player.getCards("h");
                return cards.length < player.maxHp;
            }
        },
        async cost(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageBegin') {
                const prompt = setColor('〖伤势〗：是否弃置一张牌？');
                const result = await player.chooseCard(prompt, "是否弃置一张牌？", "he").set("ai", function(card) {
                    const Phase = _status.currentPhase === player;
                    const key = player.getCardsValue('sha').length > 1;
                    if (Phase && key) return get.value(card) < compareValue(player, 'tao') && get.name(card) !== 'zhuge';
                    return get.value(card,player) < compareValue(player, 'tao');
                }).forResult();
                if (result.bool) {
                    event.result = {
                        bool: true,
                        cost_data: {
                            cards: result.cards,
                        },
                    };
                }
            } else {
                event.result = {
                    bool: true,
                    cost_data: {
                        cards: [],
                    },
                };
            }
        },
        async content(event, trigger, player) {
            const cards = event.cost_data?.cards;
            if (cards) { 
                if (cards.length > 0) {
                    await player.discard(cards);
                } else {
                    await player.draw(player.maxHp - player.getCards("h").length);
                }
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
                    if (get.tag(card, "damage") && get.attitude(player, target) < 2) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (target.isHealthy() && getAliveNum(target, get.tag(card, "damage")) > 0 ) return [1, 1];
                    }
                },
            },
        },
        "_priority": 0
    }  
};
export default TAF_sunSkills;
