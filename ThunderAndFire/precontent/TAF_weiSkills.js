import { lib, game, ui, get, ai, _status, Get } from '../../../../noname.js'
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
    thunderxingshangAI,thunderfulongAI,thunderlvliAI,thunderquediAI,
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

const { initxingshang } = asyncs.wei.thunder_caopi;//曹丕
const { initthunderqizhi } = asyncs.wei.thunder_wangji;//王基

/** @type { importCharacterConfig['skill'] } */
const TAF_weiSkills = {
    //曹丕
    thunderfangzhu:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #0088CC>放逐</font>",
        intro:{
            content: function (storage, player) {
                const fanyi = {
                    thunderFZ01 : '逐①',
                    thunderFZ02 : '逐②',
                    thunderFZ03 : '逐③',
                    thunderFZ04 : '逐④',
                }
                const skills = player.FZlists;
                let str = '放逐可选项：无';
                if(!skills || skills.length == 0) return str;
                str = '放逐可选项：' + skills.map(skill => fanyi[skill] || skill).join('、');
                return str;
            },
            markcount:function(storage, player) {
                const num = player.FZlists?.length || 0;
                return num;
            },
            onunmark:true,
            name:"<font color= #0088CC>放逐</font>",
        },
        trigger:{
            player:"damageEnd",
        },
        locked:false,
        direct:true,
        init:async function (player, skill) {
            if(!player.FZlists) player.FZlists = ['thunderFZ01','thunderFZ02','thunderFZ03','thunderFZ04'];
            if(!player.resetFZ) {
                player.resetFZ = function () {
                    player.FZlists = ['thunderFZ01','thunderFZ02','thunderFZ03','thunderFZ04'];
                };
            }
            if(!player.getUseFZ) {
                player.getUseFZ = function (target) {
                    let getlist = [];
                    const lists = player.FZlists;
                    if (!lists || !lists.length) return getlist;
                    for(const skill of lists){
                        if(!target.hasSkill(skill) && !getlist.includes(skill)){
                            getlist.push(skill);
                        }
                    }
                    return getlist;
                };
            }
            player.update();
        },
        filter:function (event, player) {
            const targets = game.filterPlayer(function(current) {
                return current != player && current.isAlive() && player.getUseFZ(current).length  > 0;
            });
            if (!event.source) return false;
            return targets.length > 0 && event.num > 0;
        },
        async content(event, trigger, player) {
            const list = [
                setColor("〖逐①〗：横置且无法解除，无法使用和打出黑色牌，失去后") + get.translation(player) + "获得之。",
                setColor("〖逐②〗：手牌数不可多于体力值上限数+2，且无法对") + get.translation(player) + "使用伤害牌。",
                setColor("〖逐②〗：回合开始时，随机禁用其半数技能（向上取整）。"),
                setColor("〖逐②〗：将武将牌翻面，并摸已损失体力值数张牌。"),
            ];
            let count = trigger.num || 1;
            while (count > 0) {
                count--;
                const result = await player.chooseTarget(get.prompt('thunderfangzhu'), function (card, player, target) {
                    const targets = game.filterPlayer(function(current) {
                        return current != player && current.isAlive() && player.getUseFZ(current).length  > 0;
                    });
                    return targets.includes(target);
                }).set('ai', function (target) {
                    const targets = game.filterPlayer(function(current) {
                        return current != player && current.isAlive() && player.getUseFZ(current).length  > 0;
                    });
                    const enemys = targets.filter(o => get.attitude(player, o) < 2);
                    const friends = targets.filter(o => 
                        get.attitude(player, o) >= 2 && o.isTurnedOver() && 
                        (!o.hasSkillTag('noTurnover', false, player) || !o.hasSkillTag('noturn', false, player)) && 
                        !o.hasSkill('thunderFZ04') && player.FZlists.includes('thunderFZ04')
                    );
                    if (friends && friends.length > 0) {
                        const sortedfriends = friends.sort((a, b) => {
                            if (a.hp !== b.hp) return a.hp - b.hp;
                            return a.countCards('h') - b.countCards('h');
                        });
                        return target == sortedfriends[0];
                    }
                    const nowtarget = _status.currentPhase;
                    if (targets.includes(nowtarget) && get.attitude(player, nowtarget) < 2) return target === nowtarget;
                    if (enemys && enemys.length > 0) {
                        const sortedenemys = enemys.sort((a, b) => {
                            if (b.countCards('h') != a.countCards('h')) return b.countCards('h') - a.countCards('h');
                            return a.hp - b.hp;
                        });
                        return target === sortedenemys[0];
                    }
                    return false;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, 'thunder');
                    player.logSkill(event.name,target);
                    let txt = setColor("〖放逐〗：请选择一项执行之！")
                    const chooseButton = await target.chooseButton([txt,
                        [list.map((item, i) => {return [i, item];}),"textbutton",],
                    ]).set("filterButton", function (button) {
                        if (button.link === 0) { //逐①
                            return !target.hasSkill('thunderFZ01') && player.FZlists.includes('thunderFZ01');
                        } else if (button.link === 1) { //逐②
                            return !target.hasSkill('thunderFZ02') && player.FZlists.includes('thunderFZ02');
                        } else if (button.link === 2) {//逐③
                            return !target.hasSkill('thunderFZ03') && player.FZlists.includes('thunderFZ03');
                        } else if (button.link === 3) {//逐④
                            return !target.hasSkill('thunderFZ04') && player.FZlists.includes('thunderFZ04');
                        }
                    }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                        function getButtonLink() {//获取可选项
                            let linklist = [];
                            if (!target.hasSkill('thunderFZ01') && player.FZlists.includes('thunderFZ01')) linklist.push(0);
                            if (!target.hasSkill('thunderFZ02') && player.FZlists.includes('thunderFZ02')) linklist.push(1);
                            if (!target.hasSkill('thunderFZ03') && player.FZlists.includes('thunderFZ03')) linklist.push(2);
                            if (!target.hasSkill('thunderFZ04') && player.FZlists.includes('thunderFZ04')) linklist.push(3);
                            return linklist;
                        };
                        function getValueNum() {//公平站在目标角度获取最优选项
                            const linklist = getButtonLink();
                            if (linklist.includes(3)) {
                                if (target.isTurnedOver() && (!target.hasSkillTag('noTurnover', false, player) || !target.hasSkillTag('noturn', false, player))) return 3;
                                if (target.getDamagedHp() > 2) return 3;
                            }
                            if (linklist.includes(2)) return 2;
                            if (linklist.includes(1)) return 1;
                            if (linklist.includes(0)) return 0;
                            if (linklist.includes(3)) return 3;
                            return -1;
                        };
                        const Num = getValueNum();
                        if(Num === -1) return;//不执行！
                        switch (button.link) {
                            case 0:
                                if (Num !== 0) return false;
                                if (Num == 0) return true;
                            case 1:
                                if (Num !== 1) return false;
                                if (Num == 1) return true;
                            case 2:
                                if (Num !== 2) return false;
                                if (Num == 2) return true;
                            case 3:
                                if (Num !== 3) return false;
                                if (Num == 3) return true;
                        }
                    }).forResult();
                    if (chooseButton.bool) {
                        const choices = chooseButton.links;
                        if (choices.includes(0)) {
                            player.FZlists = player.FZlists.filter(id => id != "thunderFZ01");
                            target.addSkill("thunderFZ01");
                            if(!player.getStorage("thunderFZ01").includes(player)) {
                                target.line(player, 'thunder');
                                target.markAuto("thunderFZ01", [player]);
                            }
                            target.chat("我选择了〖逐一〗。");
                            game.log(target,'选择了〖逐①〗。');
                        } else if (choices.includes(1)) {
                            player.FZlists = player.FZlists.filter(id => id != "thunderFZ02");
                            target.addSkill("thunderFZ02");
                            if(!player.getStorage("thunderFZ02").includes(player)) {
                                target.line(player, 'thunder');
                                target.markAuto("thunderFZ02", [player]);
                            }
                            target.chat("我选择了〖逐二〗。");
                            game.log(target,'选择了〖逐②〗。');
                        } else if (choices.includes(2)) {
                            player.FZlists = player.FZlists.filter(id => id != "thunderFZ03");
                            target.addSkill("thunderFZ03");
                            target.chat("我选择了〖逐三〗。");
                            game.log(target,'选择了〖逐③〗。');
                        } else if (choices.includes(3)) {
                            player.FZlists = player.FZlists.filter(id => id != "thunderFZ04");
                            target.addSkill("thunderFZ04");
                            target.chat("我选择了〖逐四〗。");
                            game.log(target,'选择了〖逐④〗。');
                        }
                        player.markSkill(event.name);
                        player.update();
                    }
                }
            }
            const skilllists = player.FZlists;
            if (skilllists.length === 0) {
                player.resetFZ();
                player.markSkill(event.name);
                player.update();
            }
        },
        ai:{
            maixie:true,
            "maixie_hp":true,
            expose:0.4,
            threaten: 3,
            effect:{
                target:function(card, player, target) {
                    if (get.tag(card, "damage")) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        const targets = game.filterPlayer(function(current) {
                            return current != target && current.isAlive() && target.getUseFZ(current).length  > 0;
                        });
                        if (targets.length == 0) return;
                        const enemys = targets.filter(o => get.attitude(target, o) <= 2);
                        if (enemys.length == 0) return;
                        if (getAliveNum(target, get.tag(card, "damage")) <= 0) return [1, 0];
                        function getValueNum() {
                            let result = [];
                            for(const enemy of enemys) {
                                let count = 0;
                                if (!enemy.hasSkill('thunderFZ01') && target.FZlists.includes('thunderFZ01')) count ++;
                                if (!enemy.hasSkill('thunderFZ02') && target.FZlists.includes('thunderFZ02')) count ++;
                                if (!enemy.hasSkill('thunderFZ03') && target.FZlists.includes('thunderFZ03')) count ++;
                                if (!enemy.hasSkill('thunderFZ04') && target.FZlists.includes('thunderFZ04')) count ++;
                                if (!result.includes(count)) {
                                    result.push(count);
                                }
                            }
                            if (!result || result.length === 0) return 0;
                            if (result.includes(1)) return 4;
                            if (result.includes(2)) return 3;
                            if (result.includes(3)) return 2;
                            if (result.includes(4)) return 1;
                            if (result.includes(0)) return 0;
                            return 0;
                        };
                        return [1, getValueNum()];
                    }
                },
            },
        },
        "_priority": 0,
    },
    thunderFZ01:{
        marktext:"<font color= #0088CC>逐①</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #0088CC>逐①</font>",
        },
        mod:{
            cardEnabled:function(card, player) {
                if (get.color(card) == 'black') return false;
            },
            cardSavable: function(card, player) {
                if (get.color(card) == 'black') return false;
            },
            cardRespondable: function(card, player){
                if (get.color(card) == 'black') return false;
            },
        },
        trigger:{
            player:["phaseBegin","linkBefore","loseEnd",],
            global:["phaseEnd","equipEnd","addJudgeEnd","gainEnd","loseAsyncEnd","addToExpansionEnd"],
        },
        firstDo: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        direct: true,
        init:async function (player, skill) {
            if(!player.isLinked()) player.link(true);
            if(!player.thunderFZ01_phaseBegin) player.thunderFZ01_phaseBegin = false;
        },
        filter:function (event, player, name) {
            if (name == 'phaseBegin') {
                player.thunderFZ01_phaseBegin = true;
                return;
            } else if (name == 'linkBefore') {
                return player.isLinked();
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.thunderFZ01_phaseBegin;
                }
                return false;
            } else {
                const findtargets = game.filterPlayer(o => player.getStorage('thunderFZ01').includes(o));
                if  (!findtargets || findtargets.length === 0) return false;
                const evt = event.getl(player);
                if (!evt) return false;
                return (evt.hs && evt.hs.length > 0) || (evt.es && evt.es.length > 0);
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'linkBefore') {
                trigger.cancel();
                game.log(player, '暂时不可解除横置！');
            } else if (Time == 'phaseEnd') {
                player.thunderFZ01_phaseBegin = false;
                delete player.thunderFZ01_phaseBegin;
                player.removeStorage(event.name);
                player.unmarkSkill(event.name);
                player.removeSkill(event.name);
                player.update();
            } else {
                /*
                const cards = player.getCards('he');
                const blackcards = cards.filter(card => get.color(card) == 'black');
                if (blackcards && blackcards.length > 0) {
                    const findtargets = game.filterPlayer(o => player.getStorage('thunderFZ01').includes(o));
                    if (findtargets && findtargets.length > 0) {
                        const target = findtargets[0];
                        let prompt =  setColor("〖逐①〗：请将手牌区及装备区全部黑色牌，交予") + get.translation(target);
                        const result = await player.chooseCard(prompt, 'he', blackcards.length, function(card) {
                            return get.color(card) == 'black';
                        }).set('ai', function(card) {
                            if (get.color(card) == 'black') {
                                return true;
                            } else {
                                return false;
                            }
                        }).set('forced', true).forResult();
                        if (result.bool) {
                            const cards = result.cards;
                            await player.give(cards, target);
                            game.log(player,'交予', target, cards.length, '张黑色牌。');
                        }
                    }
                }
                    */
                const evt = trigger.getl(player);
                if(evt.hs && evt.hs.length > 0){
                    const blackcards = evt.hs.filter(card => get.color(card) == 'black');
                    if(blackcards && blackcards.length > 0){
                        const findtargets = game.filterPlayer(o => player.getStorage('thunderFZ01').includes(o));
                        if (findtargets && findtargets.length > 0) {
                            const target = findtargets[0];
                            await target.gain(blackcards, "gain2");
                            game.log(target,'获得了', blackcards.length, '张黑色牌。');
                        }
                    }
                }
                if(evt.es && evt.es.length > 0){
                    const blackcards = evt.es.filter(card => get.color(card) == 'black');
                    if(blackcards && blackcards.length > 0){
                        const findtargets = game.filterPlayer(o => player.getStorage('thunderFZ01').includes(o));
                        if (findtargets && findtargets.length > 0) {
                            const target = findtargets[0];
                            await target.gain(blackcards, "gain2");
                            game.log(target,'获得了', blackcards.length, '张黑色牌。');
                        }
                    }
                }
            }
        },
        ai:{
            effect:{
                target:function(card, player, target) {
                    if (get.name(card) == "tiesuo") return "zeroplayertarget";
                },
            },
        },
        "_priority": 0,
    },
    thunderFZ02:{
        marktext:"<font color= #0088CC>逐②</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #0088CC>逐②</font>",
        },
        mod:{
            playerEnabled:function (card, player, target) {
                if (get.tag(card, "damage") > 0) {
                    if (player.getStorage("thunderFZ02").includes(target)) return false;
                }
            },
        },
        trigger:{
            player:["phaseBegin","loseAfter"],
            global:["phaseEnd","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter","logSkillBegin","phaseChange","chooseToUseBegin","useCardBegin"],
        },
        firstDo: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        direct: true,
        init:async function (player, skill) {
            if(!player.thunderFZ02_phaseBegin) player.thunderFZ02_phaseBegin = false;
        },
        filter:function (event, player, name) {
            if (name == 'phaseBegin') {
                player.thunderFZ02_phaseBegin = true;
                return;
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.thunderFZ02_phaseBegin;
                }
                return false;
            } else {
                return player.countCards("h") > player.maxHp + 2;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'phaseEnd') {
                player.thunderFZ02_phaseBegin = false;
                delete player.thunderFZ02_phaseBegin;
                player.removeStorage(event.name);
                player.unmarkSkill(event.name);
                player.removeSkill(event.name);
                player.update();
            } else {
                const num = player.countCards("h") - player.maxHp - 2;
                if (num > 0) {
                    await player.chooseToDiscard(num, 'h', true);
                }
            }
        },
        "_priority": 0,
    },
    thunderFZ03:{
        trigger:{
            player:["phaseBegin"],
            global:["phaseEnd"],
        },
        firstDo: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        direct: true,
        init:async function (player, skill) {
            if(!player.thunderFZ03_phaseBegin) player.thunderFZ03_phaseBegin = false;
        },
        filter:function (event, player, name) {
            if (name == 'phaseBegin') {
                return true;
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.thunderFZ03_phaseBegin;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'phaseBegin') {
                player.thunderFZ03_phaseBegin = true;
                player.addTempSkill("thunderFZ03_fengyin");
            } else if (Time == 'phaseEnd') {
                player.thunderFZ03_phaseBegin = false;
                delete player.thunderFZ03_phaseBegin;
                player.removeSkill(event.name);
                player.update();
            }
        },
        "_priority": 0,
    },
    thunderFZ03_fengyin:{
        marktext:"<font color= #0088CC>逐印</font>",
        init:function (player, skill) {
            if(!player.thunderFZ03_fengyin) player.thunderFZ03_fengyin = [];
            const skilllists = player.countSkills();
            if (skilllists.length > 0) {
                const num = Math.ceil(skilllists.length / 2);
                for (let i = 0; i < num; i++) {
                    const randomIndex = Math.floor(Math.random() * skilllists.length);
                    player.thunderFZ03_fengyin.push(skilllists[randomIndex]);
                    skilllists.splice(randomIndex, 1);
                }
            }
            player.addSkillBlocker(skill);
            player.addTip(skill, "随机失效半数技能（向上取整）");
        },
        onremove:function (player, skill) {
            player.thunderFZ03_fengyin = [];
            player.unmarkSkill(skill);
            player.removeSkillBlocker(skill);
            player.removeTip(skill);
        },
        superCharlotte:true,
        charlotte:true,
        skillBlocker:function (skill, player) {
            const skilllists = player.thunderFZ03_fengyin;
            return skilllists.includes(skill);
        },
        mark:true,
        intro:{
            content:function (storage, player, skill) {
                const skilllists = player.thunderFZ03_fengyin;
                if (skilllists.length) return "失效技能：" + get.translation(skilllists);
                return "无失效技能";
            },
        },
    },
    thunderFZ04:{
        trigger:{
            player:["phaseBegin"],
            global:["phaseEnd"],
        },
        firstDo: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        direct: true,
        init:async function (player, skill) {
            if(!player.thunderFZ04_phaseBegin) player.thunderFZ04_phaseBegin = false;
            await player.turnOver();
            const num = player.getDamagedHp();
            if(num > 0){
                await player.draw(num);
            }
        },
        filter:function (event, player, name) {
            if (name == 'phaseBegin') {
                player.thunderFZ04_phaseBegin = true;
                return;
            } else if (name == 'phaseEnd') {
                if (event.player === player) {
                    return player.thunderFZ04_phaseBegin;
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'phaseEnd') {
                player.thunderFZ04_phaseBegin = false;
                delete player.thunderFZ04_phaseBegin;
                player.removeSkill(event.name);
                player.update();
            }
        },
        "_priority": 0,
    },
    thunderxingshang:{
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
            if (event.player.storage.TXScp_used) return;
            const dissumA = Math.max(player.getDamagedHp(), 1);
            const dissumB = Math.max(player.hp, 1);
            const phes = player.getCards('hes').length;
            return phes >= dissumA || phes >= dissumB;
        },
        async content(event, trigger, player) {
            const dissumA = Math.max(player.getDamagedHp(), 1);
            const dissumB = Math.max(player.hp, 1);
            const phes = player.getCards('hes').length;
            const target = trigger.player;
            const att = get.attitude(player, target);
            
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
            const chooseButton = await player.chooseButton([get.prompt('thunderxingshang'),
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
                let shouyi = thunderxingshangAI(player, target, att);
                if (shouyi == 0) return false;
                switch (button.link) {
                    case 0:
                        if (shouyi == 0) return false;
                        if (shouyi == 2) return false;
                        if (shouyi == 1) return true;
                    case 1:
                        if (shouyi == 0) return false;;
                        if (shouyi == 1) return false;
                        if (shouyi == 2) return true;
                }
            }).forResult();
            if (chooseButton.bool) {
                player.logSkill(event.name);
                if (!player.getStorage('thunderxingshang').includes(trigger.player) && !trigger.player.storage.TXScp_used) {
                    trigger.player.storage.TXScp_used = true;
                    player.markAuto('thunderxingshang', [trigger.player]);
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
                        if (target.storage.TXScp_used) return 1;
                        else return 3.5;
                    } else {
                        if (target.storage.TXScp_used) return 1;
                        else return 1.5;
                    }
                } else {
                    return 0.5;
                }
            },
        },
        "_priority": Infinity,
    },
    thundersongwei:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            global: "judgeEnd",
        },
        zhuSkill:true,
        locked:false,
        direct:true,
        filter:function (event, player) {
            if (event.player.group != "wei") return;
            if (event.result.color != "black") return;
            return true;
        },
        async judge(event, trigger, player) {
            let useskill = false;
            const result = await trigger.player.chooseBool(get.prompt("thundersongwei"),"是否与" + get.translation(player) + "各摸一张牌？").set('ai', function() {
                return true;
            }).forResult();
            if (result.bool) {
                useskill = true;
            }
            return useskill;
        },
        async content(event, trigger, player) {
            const useskill = lib.skill.thundersongwei.judge(event, trigger, player);
            if (useskill) {
                player.logSkill(event.name);
                trigger.player.line(player, "thunder");
                if (trigger.player != player) {
                    await trigger.player.draw(1);
                    await player.draw(1);
                } else {
                    await player.draw(1);
                }
            }
        },
        "_priority": Infinity,
    },
    //曹纯
    thundershanjia:{
        audio:"ext:银竹离火/audio/skill:4",
        mark:true,
        marktext:"☯",
        onremove:true,
        zhuanhuanji:true,
        intro:{
            content:function(event, player){
                if(player.isTurnedOver()) return setColor('阴，切换至本状态后，进入横置并获得技能〖御守〗，立即执行一次受到非⚡属性伤害内容，不计入次数限制。');
                return setColor('阳，切换至本状态后，解除横置并获得技能〖攻伐〗，每轮限两次，立即结束当前非你的出牌阶段，进入额外的回合。');
            },
        },
        trigger:{
            player:["phaseEnd","turnOverEnd"],
            global:["roundStart"],
        },
        unique:true,
        locked:false,
        direct:true,
        init: async function(player, skill) {
            if (!player.thundershanjia_phase) player.thundershanjia_phase = 0;
            if (!player.thundershanjia_thunderdamage) player.thundershanjia_thunderdamage = 0;
            if (!player.thundershanjia_nothunderdamage) player.thundershanjia_nothunderdamage = 0;
            if (!player.SetShanjia) {
                player.SetShanjia = {
                    reset : function() {
                        if (!player.hasSkill(skill)) return;
                        player.thundershanjia_phase = 0;
                        player.thundershanjia_thunderdamage = 0;
                        player.thundershanjia_nothunderdamage = 0;
                    },
                    set : async function() {
                        if (!player.hasSkill(skill)) return;
                        if (player.hasEnabledSlot(3)) player.disableEquip(3);
                        if (player.hasEnabledSlot(4)) player.disableEquip(4);
                        if (player.isTurnedOver()) {
                            player.link(true);
                        } else {
                            player.link(false);
                        }
                    },
                    draw: async function() {
                        let count = 0;
                        if (!player.hasSkill(skill)) return 0;
                        const numdraw1 = player.getDamagedHp();
                        const numdraw2 = game.filterPlayer(function(current) {
                            return current.group == 'wei';
                        });
                        const numdraw = numdraw1 + numdraw2.length;
                        if (numdraw > 0) {
                            count += numdraw;
                            await player.gainNames_Subtypes(numdraw);
                        }
                        if (player.countCards('h') > 7) {
                            count -= player.countCards('h') - 7;
                            await player.chooseToDiscard(player.countCards('h') - 7, 'h', true);
                        }
                        return count;
                    }
                }
            }
            player.logSkill(skill);
            player.turnOver(true);
        },
        filter:function(event, player, name) {
            if (name == 'phaseEnd') {
                if (!player.isTurnedOver()) player.turnOver(true);
                return;
            }
            if (name == 'turnOverEnd') return true;
            if (name == 'roundStart') {
                player.SetShanjia.reset();
                return;
            }
            return false;
        },
        derivation: ["thundershanjia_gongfa","thundershanjia_yushou"],
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time !== 'turnOverEnd') return;
            player.logSkill(event.name);
            player.changeZhuanhuanji("thundershanjia");
            if (player.isTurnedOver()) {
                if (changeSkinskey) {
                    if (player.name === 'thunder_caochun') player.changeSkins(1);
                }
                await player.SetShanjia.set();
                player.addTempSkill("thundershanjia_yushou", { player: 'turnOverEnd' });
                if (game.phaseNumber == 0) return;
                await player.SetShanjia.draw();
            } else {
                if (changeSkinskey) {
                    if (player.name === 'thunder_caochun') player.changeSkins(2);
                }
                await player.SetShanjia.set();
                player.addTempSkill("thundershanjia_gongfa", { player: 'turnOverEnd' });
                const phaseuse = player.thundershanjia_phase;
                if (phaseuse < 2) {
                    player.thundershanjia_phase ++;
                    //console.log(player.name + " 第" + player.thundershanjia_phase + "次攻伐");
                    let evtU = trigger.getParent("phaseUse");
                    let evtP = trigger.getParent("phase");
                    if (evtU && evtU.name == "phaseUse") {
                        evtU.skipped = true;
                        player.insertPhase(event.name);
                        return;
                    } else if (evtP && evtP.name == "phase") {
                        evtP.finish();
                        player.insertPhase(event.name);
                        return;
                    }
                }
            }
        },
        ai:{
            threaten:3,
        },
        "_priority":0,
    },
    thundershanjia_gongfa:{
        mod:{
            globalFrom:function(from, to, distance) {
                return distance - 1;
            },
            cardname:function(card,player){
                if(['equip3','equip4'].includes(lib.card[card.name].subtype)) return 'sha';
            },
            cardnature:function(card,player){
                if(['equip3','equip4'].includes(lib.card[card.name].subtype)) return 'thunder';
            },
            targetInRange:function(card, player, target){
                if(card.name =='sha' && card.nature=='thunder') {
                    if(card.cards && card.cards.length === 1) {
                        const name = card.cards[0].name;
                        const info = get.info({ name: name, nature:'', isCard:true });
                        if(info.subtype == 'equip3' || info.subtype == 'equip4') {
                            return true;
                        }
                    }
                }
            },
        },
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["phaseDrawBegin"],
        },
        unique:true,
        locked:false,
        direct:true,
        init: async function(player, skill) {
            if (player.hasEnabledSlot(3)) player.disableEquip(3);
            if (player.hasEnabledSlot(4)) player.disableEquip(4);
        },
        filter:function(event, player, name) {
            return player.hasSkill('thundershanjia');
        },
        async content(event, trigger, player) {
            trigger.cancel();
            await player.gainCardsSuits(4);
            if (player.countCards('h') < 0) return;
            const result = await player.chooseToDiscard("he", true, 1).set('ai', function(card) {
                const cards = player.getCards('hes');
                const wuxiecards = cards.filter(card => get.name(card) =='wuxie');
                const equipCards = cards.filter(card => get.type(card) == 'equip');
                const trickCards = cards.filter(card => {
                    return get.type(card) === "trick" || get.type(card) === "delay";
                });
                const findtargets = game.filterPlayer(function (current) {
                    return get.attitude(player, current) >= 2 && current.countCards('j') > 0;
                });
                if (findtargets.length > 0 && !wuxiecards.length && equipCards.length > 0) {
                    const minValue = equipCards.sort((a, b) => {
                        return get.value(a,player) - get.value(b,player);
                    });
                    return get.value(card, player) <= get.value(minValue[0], player);
                } else {
                    let canUsetrick = [];
                    if (trickCards.length > 0) {
                        for(const trick of trickCards) {
                            for(const target of game.filterPlayer()) {
                                if (player.canUse(trick, target ,false ,false)) {
                                    const effect = get.effect(target, trick, player, player);
                                    if (effect && effect > 0 && !canUsetrick.includes(trick)) {
                                        canUsetrick.push(trick);
                                    }
                                }
                            }
                        }
                    }
                    if (canUsetrick.length > 2) {
                        const minValue = trickCards.sort((a, b) => {
                            return get.value(a, player) - get.value(b, player);
                        });
                        return get.value(card, player) <= get.value(minValue[0], player);
                    } else {
                        const enemies = game.filterPlayer(current => get.attitude(player, current) < 2);
                        const friends = game.filterPlayer(current => get.attitude(player, current) >= 2);
                        const emptyEquipSlots = {
                            equip1: { enemies: [], friends: [] },
                            equip2: { enemies: [], friends: [] },
                            equip3: { enemies: [], friends: [] },
                            equip4: { enemies: [], friends: [] },
                            equip5: { enemies: [], friends: [] }
                        };
                        for (const type of Object.keys(emptyEquipSlots)) {
                            for (const enemy of enemies) {
                                if (enemy.countEmptySlot(type) === 0) {
                                    emptyEquipSlots[type].enemies.push(enemy);
                                }
                            }
                            for (const friend of friends) {
                                if (friend.countEmptySlot(type) > 0) {
                                    emptyEquipSlots[type].friends.push(friend);
                                }
                            }
                        }
                        if(equipCards.length > 0) {
                            const hasMatch = Object.values(emptyEquipSlots).some(
                                slot => slot.enemies.length > 0 && slot.friends.length > 0
                            );
                            if (hasMatch) {
                                const minValue = equipCards.sort((a, b) => get.value(a, player) - get.value(b, player));
                                return get.value(card, player) <= get.value(minValue[0], player);
                            }
                        }
                        const sort_cards = cards.sort((a, b) => {
                            return get.value(a, player) - get.value(b, player);
                        });
                        return get.value(card, player) <= get.value(sort_cards[0], player);
                    }
                }
            }).forResult();
            if (result.bool) {
                const discards = result.cards;
                for (const card of discards) {
                    const cardType = get.type(card);
                    if (cardType == "basic") {
                        await player.chooseUseTarget(
                            { name: "sha", nature: "thunder" }, 
                            "是否视为使用一张无视距离的「<font color= #0088CC>雷杀</font>」", 
                            false, 
                            'nodistance'
                        );
                    } else if (cardType == "equip") {
                        if (player.canMoveCard()) await player.moveCard();
                    } else if (cardType == "trick" || cardType == "delay") {
                        await player.addTempSkill("thundershanjia_gongfa_key");
                    }
                }
            }
        },
        ai:{
            respondSha:true,
            noautowuxie:true,
            skillTagFilter: function (player, tag) {
                switch (tag) {
                    case "respondSha":
                        return player.countCards('hes', { subtype: 'equip3' }) > 0 || player.countCards('hes', { subtype: 'equip4' }) > 0; 
                    case "noautowuxie":
                        return player.hasSkill('thundershanjia_gongfa_key'); 
                }
                return false;
            },
            effect: {
                target: function(card, player, target, current) {
                    if (get.tag(card, "respondSha") && current < 0) return 0.8;
                },
            },
        },
        subSkill:{
            key:{
                mark:true,
                marktext:"⚡",
                intro:{
                    content:"此阶段使用锦囊牌时，无距离限制且摸1张牌。",
                    name:"<font color= #0088CC>攻伐·锦囊</font>",
                },
                mod:{
                    targetInRange:function(card,player,target,now){
                        const cardType = get.type(card);
                        if(cardType =='trick' ||  cardType == 'delay') return true;
                    },
                },
                trigger:{
                    player: ["useCard"],
                },
                charlotte: true,
                unique:true,
                locked:false,
                direct:true,
                filter:function(event, player){
                    const cardType = get.type(event.card);
                    if (!cardType) return false;
                    if (!player.hasSkill('thundershanjia_gongfa')) return false;
                    return cardType == 'trick' ||  cardType == 'delay';
                },
                async content(event, trigger, player) {
                    await player.draw();
                },
                sub:true,
                sourceSkill:"thundershanjia_gongfa",
            },
        },
        "_priority":0,
    },
    thundershanjia_yushou:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            globalTo:function(from, to, distance) {
                return distance + 1;
            },
            cardname:function(card, player) {
                if (['equip3', 'equip4'].includes(lib.card[card.name].subtype)) return 'shan';
            },
        },
        trigger:{
            player:["damageBegin"],
        },
        unique:true,
        locked:false,
        direct:true,
        init: async function(player, skill) {
            if (player.hasEnabledSlot(3)) player.disableEquip(3);
            if (player.hasEnabledSlot(4)) player.disableEquip(4);
        },
        filter:function(event, player){
            if (!player.hasSkill('thundershanjia')) return false;
            if (!event.num || event.num <= 0) return false;
            const thundereuse = player.thundershanjia_thunderdamage;
            const nothundereuse = player.thundershanjia_nothunderdamage;
            if (event.hasNature("thunder")) {
                if (thundereuse < 2 ) return true;
                return false;
            } else {
                if (nothundereuse < 2 ) return true;
                return false;
            }
        },
        async content(event, trigger, player) {
            player.logSkill(event.name);
            if (!player.hasSkill('thundershanjia')) {
                await player.removeSkill("thundershanjia_yushou");
                return;
            }
            if (trigger.hasNature("thunder")) {
                trigger.cancel();
                player.recover();
                player.thundershanjia_thunderdamage++;
            } else {
                await player.SetShanjia.draw();
                player.thundershanjia_nothunderdamage++;
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            respondShan:true,
            nothunder:true,
            skillTagFilter:function(player, tag) {
                if (tag !== "respondShan" || tag !== "nothunder") return;
                switch (tag) {
                    case "respondShan":
                        return player.countCards('hes', { subtype: 'equip3' }) > 0 || player.countCards('hes', { subtype: 'equip4' }) > 0; 
                    case "nothunder":
                        const thundereuse = player.thundershanjia_thunderdamage;
                        if (thundereuse < 2) {
                            return true;
                        } else {
                            return false;
                        }
                }
                return;
            },
            effect:{
                target:function(card, player, target, current) {
                    if (get.tag(card, 'respondShan') && current < 0) return 0.6;
                    if (get.tag(card, "damage")){
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        const thundereuse = target.thundershanjia_thunderdamage;//限制
                        const nothundereuse = target.thundershanjia_nothunderdamage;//限制
                        const livenum = target.hp + target.countCards('h', { name: ['tao', 'jiu'] }) - get.tag(card, "damage");
                        /**AI设定函数如下 */
                        if (get.tag(card,'thunderDamage')) {
                            if (thundereuse >= 2) {
                                return [1, 0];
                            } else {
                                if (target.isDamaged()) {
                                    return [0, 1];
                                } else {
                                    return [0, 0.15];
                                }
                            }
                        } else {
                            if (!target.hasFriend()) return;
                            if (nothundereuse >= 2) return;
                            if (livenum <= 0) return;
                            const numdraw1 = target.getDamagedHp();
                            const numdraw2 = game.filterPlayer(function(current) {
                                return current.group == 'wei';
                            });
                            const numHH = target.countCards('h');
                            const cardsdraw = numdraw1 + numdraw2.length;
                            const cardsEnd = numHH + cardsdraw;
                            let shouyi = 0;
                            if (cardsEnd <= 7) {
                                shouyi = cardsdraw;
                            } else if (cardsEnd > 7) {
                                /**举例：
                                 * 1、5张手牌、摸5张、调整至7：收益=摸5弃3
                                 * 2、7张手牌、摸5张、调整至7：收益=摸5弃5
                                 * 3、9张手牌、摸5张、调整至7：收益=摸5弃7
                                 * 制衡分界线七张手牌，制衡三张收益为一。
                                */
                                let L1 = 1/3;
                                let L2 = 1/2;
                                if (numHH <= 7) {
                                    shouyi = cardsdraw - (cardsEnd - 7) + cardsdraw * L1;//实收益
                                } else if (numHH > 7) {
                                    shouyi = cardsdraw * L1 - Math.abs(cardsEnd - 7 - cardsdraw) * L2;//虚拟收益
                                }
                            }
                            return [1,shouyi];
                        }
                    }
                },
            },
            basic:{
                useful:function(card, i) {
                    let player = _status.event.player;
                    let basic = [7, 5.1, 2];
                    let num = basic[Math.min(2, i)];
                    if (player.hp > 2 && player.hasSkillTag('maixie')) num *= 0.57;
                    if (
                        player.hasSkillTag('freeShan', false, null, true) ||
                        player.getEquip('rewrite_renwang')
                    ) num *= 0.8;
                    return num;
                },
                value:[7,5.1,2],
            },
            result:{
                player:1,
            },
        },
        "_priority":0,
    },
    //王基
    thunderqizhi:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        onremove:true,
        marktext:"<font color= #0088CC>奇制</font>",
        intro:{
            content:function (storage, player) {
                const nummark = player.countMark('thunderqizhi');
                return '<font color= #0088CC>当前已使用次数=　</font>' + nummark;
            },
            name:"<font color= #0088CC>奇制</font>",
        },
        mod: {
            cardUsable: function(card, player, num) {
                if (card.name === 'sha') {
                    const addnum = typeof player.thunderqizhi_sha === 'number' ? player.thunderqizhi_sha : 0;
                    return num + addnum;
                }
                return num;
            },
            aiOrder:function (player, card, num) {
                if ( _status.currentPhase === player) {
                    const type = get.type(card);
                    if (type == "delay") {
                        const damagecards = player.getCards('hes').filter(card => {
                            return get.tag(card, 'damage') >= 1;
                        });
                        const enemies = game.filterPlayer(o => get.attitude(player, o) < 2);
                        let canUseCards = false;
                        for (const card of damagecards) {
                            for (const enemy of enemies) {
                                const canUseKey = player.canUse(card, enemy, true, true);
                                const effect = get.effect(enemy, card, player, player);
                                if (canUseKey && effect > 0) {
                                    canUseCards = true;
                                    break;
                                }
                            }
                        }
                        if (canUseCards) {
                            return num + compareOrder(player, 'sha') + 0.5;
                        }
                    }
                }
            },
        },
        trigger:{
            player:["useCard","respond"],
        },
        locked:false,
        direct:true,
        init:async function (player, skill) {
            if(!player.thunderqizhi_sha) player.thunderqizhi_sha = 0;
            await initthunderqizhi(player, skill);
        },
        filter:function (event, player, name) {
            const targets = game.filterPlayer(function(current) {
                return current.countCards("hej") > 0 && current.countDiscardableCards(player, 'hej') > 0;
            });
            return targets.length > 0;
        },
        async content(event, trigger, player) {
            const result = await player.chooseTarget(get.prompt("thunderqizhi"), "弃置一名角色的区域内一张牌", (card, player, target) => {
                return target.countCards("hej") > 0 && target.countDiscardableCards(player, 'hej') > 0;
            }).set('ai', target => {
                const targets = game.filterPlayer(function(current) {
                    return current.countCards("hej") > 0 && current.countDiscardableCards(player, 'hej') > 0;
                });
                const friends = targets.filter(o => get.attitude(player, o) >= 2);
                const enemies = targets.filter(o => get.attitude(player, o) < 2);
                let hasBadjCards = [];
                for (const friend of friends) {
                    const jcards = friend.getCards('j').filter(card => {
                        const effect = get.effect(friend, card, friend, friend);
                        return effect && effect < 0;
                    });
                    if (jcards.length > 0 && !hasBadjCards.includes(friend)) {
                        hasBadjCards.push(friend);
                    }
                }
                const marks = player.countMark(event.name);
                if (marks >= 6) {
                    if(getAliveNum(player, 1) < 0) return false;
                }
                if (hasBadjCards.length > 0) return target === hasBadjCards[0];//优先帮助友方解决判定区卡牌。
                if (targets.includes(player)) {//针对自己
                    const cards = player.getDiscardableCards(player, "hej");
                    const sortCards = cards.sort((a, b) => {
                        return get.value(a, player) - get.value(b, player);
                    });
                    if ( _status.currentPhase === player) {//回合内偏向于进攻的同时，次要注重防御
                        const enemies = game.filterPlayer(o => get.attitude(player, o) < 2);
                        const compareValueNum = (compareValue(player,'tao') + compareValue(player,'shan') + compareValue(player,'jiu') + compareValue(player,'wuxie')) / 4;
                        if (sortCards[0] <= compareValueNum) {
                            let canUseCards = [];
                            const damagecards = player.getCards('hes').filter(card => {
                                return get.tag(card, 'damage') >= 1;
                            });
                            for (const card of damagecards) {
                                for (const enemy of enemies) {
                                    const canUseKey = player.canUse(card, enemy, true, true);
                                    const effect = get.effect(enemy, card, player, player);
                                    if (canUseKey && effect > 0 && !canUseCards.includes(card)) {
                                        canUseCards.push(card);
                                    }
                                }
                            }
                            if (canUseCards.length === 0) return target === player;
                        }
                    } else {//回合外偏向于防御
                        const compareValueNum = Math.min(compareValue(player,'tao'), compareValue(player,'shan'), compareValue(player,'jiu'));
                        if (sortCards[0] <= compareValueNum) return target === player;
                    }
                }
                if (enemies.length > 0) {
                    const sortenemies = enemies.sort((a, b) => {
                        if (a.countCards('h') !== b.countCards('h')) return a.countCards('h') - b.countCards('h');
                        return a.hp - b.hp;
                    });
                    return target === sortenemies[0];
                }
                return false;
            }).forResult();
            if (result.bool) {
                const target = result.targets[0];
                const chooseCard = await player.discardPlayerCard(target, 1, 'hej', true).forResult();
                if (chooseCard.bool) {
                    player.logSkill(event.name, target);
                    player.line(target, 'thunder');
                    player.addMark(event.name, 1);
                    if (chooseCard.cards[0].original == "e" || chooseCard.cards[0].original == "h") {
                        if (target === player) {
                            await player.draw();
                        } else {
                            await player.draw();
                            await target.draw();
                        }
                    } else if (chooseCard.cards[0].original == "j") {
                        player.thunderqizhi_sha ++;
                        await target.link(false);
                        await target.turnOver(false);
                        await target.recover();
                        const buffs = getDisSkillsTargets("buffs",target);
                        if(buffs.length > 0) {
                            const disskills = getDisSkillsTargets("skills",target);
                            for(let skill of buffs) {
                                await target.removeSkill(skill);
                            }
                            game.log(player, "对", target, "发动了", '#g【奇制】', '：', 
                                '#g【' + disskills.map(get.translation).join('】、【') + '】',
                                "移除失效效果！");
                        }
                    }
                    if (player.countMark(event.name) >= 7) {
                        await player.tempdisSkill(event.name);
                    }
                }
            }
        },
        ai:{
            expose:0.5,
            threaten:1.5,
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    if ( _status.currentPhase === player) {
                        const type = get.type(card);
                        if (type == "delay") {
                            const damagecards = player.getCards('hes').filter(card => {
                                return get.tag(card, 'damage') >= 1;
                            });
                            const enemies = game.filterPlayer(o => get.attitude(player, o) < 2);
                            let canUseCards = false;
                            for (const card of damagecards) {
                                for (const enemy of enemies) {
                                    const canUseKey = player.canUse(card, enemy, true, true);
                                    const effect = get.effect(enemy, card, player, player);
                                    if (canUseKey && effect > 0) {
                                        canUseCards = true;
                                        break;
                                    }
                                }
                            }
                            if (canUseCards) {
                                return [1, 3];
                            }
                        }
                    }
                },
            },
        },
        "_priority":0,
    },
    thunderjinqu: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            maxHandcard: function (player, num) {
                if (player.thunderjinqu_used) {
                    return player.thunderjinqu_count;
                } else {
                    return num;
                }
            },
        },
        trigger: {
            global: ["phaseUseEnd",'phaseAfter'],
        },
        init: function(player, skill) {
            player.thunderjinqu_count = 0;
            player.thunderjinqu_used = false;
        },
        filter: function (event, player, name) {
            if (name == "phaseAfter") {
                player.thunderjinqu_count = 0;
                return;
            } else {
                if (!player.hasSkill('thunderqizhi')) return false;
                return player.countMark('thunderqizhi') > 0;
            }
        },
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            if (event.triggername === "phaseAfter") return;
            /**
             * 一名角色出牌阶段结束时，可从牌堆或弃牌堆随机检索并获取「该回合〖奇制〗使用次数」张「点数不同且牌名不同」的牌，若如此做：
             * 该回合手牌上限改为以此法获得的牌数，且此数值为七时，横置并受到一点无来源的⚡伤害。
             * */
            let txt = setColor('〖进趋〗：是否要摸');
            const numdraws = player.countMark('thunderqizhi');
            if (numdraws > 0 && numdraws < 7) {
                txt += get.cnNumber(numdraws) + '张「点数不同且牌名不同」的牌，并令你的手牌上限改为'+ get.cnNumber(numdraws) + '？';
            } else if (numdraws >= 7) {
                txt += get.cnNumber(numdraws) + '张「点数不同且牌名不同」的牌，并令你的手牌上限改为'+ get.cnNumber(numdraws) + ',横置并受到一点无来源的⚡伤害？'; 
            }
            let result = await player.chooseBool(txt).set('ai', function() {
                if (_status.currentPhase === player) {
                    const maxHandnum = player.getHandcardLimit();
                    const cards = player.getCards('h');
                    //cards + numdraws >= maxHandnum
                    if (cards.length + numdraws >= maxHandnum) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                await player.gainCardsNumbersAndNames(numdraws);
                player.thunderjinqu_used = true;
                if (numdraws >= 7) {
                    player.link(true);
                    player.damage(1, "thunder", "nosource");
                }
            } else {
                player.thunderjinqu_used = false;
            }
            /*******分界线 */
            if (player.thunderjinqu_used) {
                player.thunderjinqu_count = numdraws;
            } else {
                player.thunderjinqu_count = 0;
            }
            
        },
        ai: {
            threaten: function (player, target) {
                const att = get.attitude(player, target);
                let marknum = player.countMark('thunderqizhi');
                let numthreaten = 3.5;
                if (att < 2) {
                    let L1 = 3.5 / 7;
                    numthreaten = numthreaten - L1 * marknum + marknum;
                    numthreaten = Math.max(numthreaten, 1);
                    return numthreaten;
                } else {
                    return 0.5;
                }
            },
        },
        "_priority": 0,
    },    
    //文鸯
    thunderquedi:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"useCardToPlayered",
        },
        locked:false,
        direct:true,
        filter:function(event, player) {
            const targets = event.targets;
            if (!targets || targets.length !== 1) return false;
            const card = event.card;
            if (!card) return false;
            return card.name == "sha" || card.name == "juedou";
        },
        async content(event, trigger, player) {
            const target = trigger.targets[0];
            async function quedi(choices = 0) {
                if (choices === 0) {
                    const ecards = target.getGainableCards(player,"e");
                    const hcards = target.getGainableCards(player,"h");
                    if (ecards.length > 0) await player.gainPlayerCard(target, true, "e");
                    if (hcards.length > 0) await player.gainPlayerCard(target, true, "h");
                } else if (choices === 1) {
                    player.link(true);
                    player.damage(1, "thunder", "nosource");
                    trigger.getParent().baseDamage++;
                } else if (choices === 2) {
                    await quedi(0);
                    await quedi(1);
                }
            }
            const list = [
                setColor("〖冲坚〗：获得") + get.translation(target) + "的手牌区及装备区各一张牌",
                setColor("〖椎锋〗：受到一点无来源的⚡伤害，并令") + get.translation(trigger.card) + "伤害+1",
                setColor("〖背水〗：减一点体力上限并执行所有选项"),
            ];
            const result = await player.chooseButton(["〖却敌〗：请选择一项执行之！",
                [list.map((item, i) => { return [i, item] }), "textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) return target.countGainableCards(player, "he") > 0;
                if (button.link === 1) return true;
                if (button.link === 2) return target.countGainableCards(player, "he") > 0;
            }).set("selectButton", 1).set("ai", function (button) {
                const getchoices = thunderquediAI(trigger, player);
                console.log('〖却敌〗选项输出值',getchoices);
                if(getchoices < 0) return false;
                switch (button.link) {
                    case 0:
                        return getchoices == 0;
                    case 1:
                        return getchoices == 1;
                    case 2:
                        return getchoices == 2;
                }
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name);
                player.tempdisSkill('thunderquedi');
                const choices = result.links;
                if (choices.includes(0)) await quedi(0);
                if (choices.includes(1)) await quedi(1);
                if (choices.includes(2)) {
                    player.loseMaxHp();
                    player.draw();
                    await quedi(2);
                }
            }
        },
        ai:{
            "directHit_ai":true,
            expose:0.5,
            threaten: 3,
            skillTagFilter: async function(player, tag, arg) {
                const dislist = await player.getdisSkill();
                if (tag !== "directHit_ai" || !arg || !arg.card || !arg.target || (arg.card.name != "sha" && arg.card.name != "juedou")) {
                    return false;
                }
                if (dislist.includes('thunderquedi')) return false;
                if (arg.target.countCards("h") == 1 && (arg.card.name != "sha" || !arg.target.hasSkillTag("freeShan", false, {
                    player: player,
                    card: arg.card
                }) || player.hasSkillTag("unequip", false, {
                    name: arg.card ? arg.card.name : null,
                    target: arg.target,
                    card: arg.card
                }) || player.hasSkillTag("unequip_ai", false, {
                    name: arg.card ? arg.card.name : null,
                    target: arg.target,
                    card: arg.card
                }))) {
                    return true;
                }
                return false;
            },
        },
        "_priority":0,
    },
    thunderlvli: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            source: "damageBegin",
            player: "damageBegin",
            global: "phaseEnd",
        },
        locked:false,
        direct:true,
        init: function(player,skill) {
            if (!player.thunderlvli_used) player.thunderlvli_used = false;
        },
        filter: function(event, player, name) {
            if (name === "phaseEnd") return player.thunderlvli_used;
            if (name === "damageBegin") {
                if (!event.source) return;
                if (player.hasSkill('thunderlvli_used')) return;
                return event.num > 0 && !player.thunderlvli_used;
            }
            return false;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseEnd") {
                player.thunderlvli_used = false;
                await player.changeCardsTo(player.maxHp, 'h');
            } else {
                const weis = game.filterPlayer(function(current) {
                    return current.group == 'wei';
                });
                const numdraw = Math.min(weis.length + player.maxHp, 7);
                const prompt = setColor("〖膂力〗：是否将区域内牌数调整至当前体力值数？若如此做，随机从牌堆或弃牌堆中获得") + 
                    get.cnNumber(numdraw) + setColor("张「副类别不同且牌名不同」的牌，则该回合结束后将手牌调整至体力值上限。");
                const result = await player.chooseBool(prompt).set('ai', function() {
                    const source = trigger.source;
                    if (source !== player && getAliveNum(player,1) <= 0) {
                        return true;
                    } else {
                        const shouyi = thunderlvliAI(player);
                        //console.log(shouyi);
                        return shouyi > 0;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    player.thunderlvli_used = true;
                    await player.changeCardsTo(player.hp, 'he');
                    await player.gainNames_Subtypes(numdraw);
                }
            }
        },
        ai:{
            maixie:true,
            "maixie_hp":true,
            threaten: 3,
            effect:{
                target:function(card, player, target) {
                    if (player.thunderlvli_used) return;
                    if (get.tag(card, "damage")) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        if (getAliveNum(target,1) <= 1) return [get.tag(card, "damage"), -2];
                        const shouyi = thunderlvliAI(target);
                        return [get.tag(card, "damage"),shouyi];
                    }
                },
            },
        },
        "_priority": 0,
    },
    thunderchoujue:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            global:"dieAfter",
        },
        forced:true,
        direct:true,
        filter:function(event,player){
            if(_status.currentPhase !== player) return false;
            return event.source && event.source == player;
        },
        async content(event, trigger, player) {
            game.log(player, "发动了", "#g〖仇决〗","重置了〖却敌〗的使用次数！", );
            player.gainMaxHp();
            player.recover();
            player.draw();
            player.removedisSkill('thunderquedi');
        },
        "_priority":0,
    },
    //钟会
    thunderyulei:{
        audio:"ext:银竹离火/audio/skill:6",
        mark:true,
        marktext:"⚡",
        onremove:function (player, skill) {
            const cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro:{
            content:"expansion",
            markcount:"expansion",
            name:"<font color= #0088CC>御雷</font>",
        },
        mod:{
            maxHandcard:function (player, num) {
                let marknum = player.getExpansions('thunderyulei').length;
                return num + marknum;
               /*
                let count = 0;
                const 所有玩家= game.players.filter( o => o.isAlive() && o.countMark('某标记') > 0);
                for (let 玩家 of  所有玩家) {
                    const 某标记数量 = 玩家.countMark('某标记');
                    count += 某标记数量;
                }
                return num + count;
                */
                
            },
        },
        trigger:{
            player:["damageBegin","phaseUseBegin","phaseUseEnd"],
            source:"damageBegin",
        },
        unique: true,
        locked:true,
        direct:true,
        filter:function (event, player, name) {
            if (player.getExpansions('thunderyulei').length > 2) return;
            if (name == 'phaseUseBegin' || name == 'phaseUseEnd') {
                return true;
            } else {
                if (!event.card || !event.source) return false;
                return event.num > 0;
            }
        },
        async content(event, trigger, player) {
            const chat = [
                "囚汝者，非吾也，乃命运之诡道！", 
                "以金索困汝，吾将辖之于掌上！", 
                "缚我者，斩之！", 
                "现在，我钟某已作抉择了…"
            ].randomGet();
            let count = trigger.num || 1;
            while (count > 0) {
                count--;
                await player.draw();
                if (!player.countCards('he') || player.getExpansions('thunderyulei').length > 2) return;
                const cards = await player.chooseCard('【<font color= #0088CC>御雷</font>】：将一张牌置于你的武将牌上作为⚡标记', 'he', true).forResultCards();
                if (cards && cards.length) {
                    player.logSkill(event.name);
                    await player.addToExpansion(cards, 'giveAuto', player).set('gaintag',['thunderyulei']);
                }
                if (player.getExpansions('thunderyulei').length > 2) {
                    const targets = game.filterPlayer(o => o.isAlive() && o != player);
                    if (targets && targets.length > 0) {
                        const result = await player.chooseTarget('【<font color= #0088CC>御雷</font>】：选择一名其他角色与其均横置并弃置一张牌！', function (card, player, target) {
                            return targets.includes(target);
                        }).set('ai', function (target) {
                            const friends = player.getFriends_sorted();
                            const enemies = player.getEnemies_sorted();
                            if (enemies.length > 0) return target === enemies[0];
                            if (friends.length > 0) return target === friends[friends.length - 1];
                            return false;
                        }).set('forced', true).forResult();
                        if (result.bool) {
                            let target = result.targets[0];
                            player.line(target, 'thunder');
                            player.link(true);
                            target.link(true);
                            if (player.countCards('he') > 0) player.chooseToDiscard(1, 'he', true);
                            if (target.countCards('he') > 0) target.chooseToDiscard(1, 'he', true);
                        }
                    }
                    player.chat(chat);
                    player.tempdisSkill('thunderyulei');
                    return;
                }
            }
        },       
        ai:{
            expose:0.25,
            threaten: function(player, target) {
                var att = get.attitude(player, target);
                if (att < 2) {
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
        },
        "_priority":0,
    },
    thunderfulong:{
        audio:"ext:银竹离火/audio/skill:6",
        mark:true,
        marktext:"<font color= #0088CC>缚龙</font>",
        onremove:true,
        intro:{
            content:function(storage, player) {
                const dislist = player.getdisSkill();
                let nummark = player.countMark('thunderfulong');
                if (dislist.includes('thunderfulong')) {
                    return '<font color= #0088CC>本技能失效至本回合结束！</font>';
                } else {
                    return '<font color= #0088CC>当前已使用次数=　</font>' + nummark;
                }
            },
            name:"<font color= #0088CC>缚龙</font>",
        },
        trigger:{
            source:"damageEnd",
            player:"damageEnd",
            global:["phaseAfter"],
        },
        locked:false,
        direct:true,
        filter:function (event, player, name) {
            if (name == 'phaseAfter') {
                player.clearMark('thunderfulong');
                return;
            } else {
                if (!event.card || !event.source) return false;
                return event.num > 0 && player.getExpansions('thunderyulei').length > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseAfter") return;
            const chat = [
                "御龙之术，瞬而失矣…失矣…矣！",
                "不缚苍龙，不缚倾！",
                "谋事在人，成事在天！",
                "伯约何来迟也？"
            ].randomGet();
            /**
             * 技能台词
             */
            const chatB = [
                "今提三尺剑，开万里疆，九鼎不足为重！",
                "经略四州之地，可钓金鲤于渭水。",
                "窃钩者诛，窃国者侯，会欲窃九州为狩。",
                "今长缨在手，欲问鼎九州！",
                "我若束手无策，诸位又有何施为？",
                "我有佐国之术，可缚苍龙！"
            ].randomGet();
            let count = trigger.num || 1;
            while (count > 0) {
                count--;
                const numdraw = getCardSuitNum(trigger.card) + getCardNameNum(trigger.card);
                const numdis = player.countMark('thunderfulong') + 1;
                const infos = setColor('〖缚龙〗，是否要弃置一张⚡标记：然后从牌堆或弃牌堆中随机获得') + get.cnNumber(numdraw) + setColor('张牌「点数不同且牌名不同」的牌并弃置') + get.cnNumber(numdis) + setColor('张牌？');
                let result = await player.chooseCardButton(player.getExpansions('thunderyulei'), infos).set('ai', function(button) {
                    const shouyi = thunderfulongAI(trigger.card,player);
                    return shouyi >= 0;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    player.addMark(event.name, 1);
                    player.discard(result.links);
                    player.update();
                    if (numdraw > 0) {
                        await player.gainCardsNumbersAndNames(numdraw);
                    }
                    if (numdis > 0) {
                        await player.chooseToDiscard(numdis, 'he', true);
                    }
                    if (player.countMark('thunderfulong') > player.getDamagedHp()) {
                        player.tempdisSkill('thunderfulong');
                        await player.changeCardsTo(3, 'he');
                        player.turnOver();
                        player.link(true);
                        player.damage(1, "thunder", "nosource");
                        player.chat(chat);
                        return; 
                    }
                }
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            threaten: 1.5,
            effect:{
                target:function (card, player, target) {
                    const dislist = target.getdisSkill();
                    if (get.tag(card, "damage") && !dislist.includes('thunderfulong')) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        return [1, thunderfulongAI(card,target) - get.tag(card, "damage")];
                    }
                    if (get.tag(card, "recover") && _status.currentPhase == target && !target.needsToDiscard()) {
                        if (target.hp <= 1) return;
                        return [1, -2];
                    }
                },
            },
        },
        "_priority":0,
    },
    thunderyujun:{
        audio:"ext:银竹离火/audio/skill:6",
        trigger:{
            global:["dying","roundStart"],
        },
        locked:false,
        direct:true,
        init: async function (player, skill) {
            if (!player.thunderyujun_used) player.thunderyujun_used = false;
        },
        filter:function(event, player, name) {
            if (name == 'dying') {
                if (player.thunderyujun_used) return false;
                return player.getExpansions('thunderyulei').length > 0 && event.player != player;
            } else if (name == 'roundStart') {
                return player.thunderyujun_used;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const chat = [
                "会不轻易信人，唯不疑伯约。",
                "与君相逢恨晚，数语难道天下谊。",
                "于天下觉春秋尚早，于伯约恨相见太迟。",
                "与君并肩高处，可观众山之小。",
                "你我虽异父异母，亦可约为兄弟。",
                "我以国士待伯约，伯约定不负我。"
            ].randomGet();
            if (Time == "dying") {
                const target = trigger.player;
                let result = await player.chooseCardButton(player.getExpansions('thunderyulei'),get.prompt("thunderyujun")).set('ai',function(button,lists){
                    let cards = player.getExpansions('thunderyulei').sort((a, b) => {
                        return getCardNameNum(b) - getCardNameNum(a);
                    });
                    if (player.identity == "zhong" && target.identity == "zhu") return getCardNameNum(button) >= getCardNameNum(cards[0]);
                    const att = get.attitude (player, target);
                    if (att >= 2) {
                        if (getAliveNum(player, 1) > 0) {
                            return getCardNameNum(button) >= getCardNameNum(cards[0]);
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    player.discard(result.links);
                    player.link(true);
                    player.chat(chat);
                    player.thunderyujun_used = true;
                    player.line(target, 'thunder');
                    target.recover();
                    const drawnum = getCardNameNum(result.links[0]);
                    console .log('与君摸牌数',drawnum);
                    if(drawnum > 0) {
                        await target.draw(drawnum);
                    }
                    const jiangweis = game.filterPlayer((current) => lib.translate[current.name].includes("姜维"));
                    if (jiangweis && jiangweis.length > 0) {
                        const filterJWs = jiangweis.filter (current => current !==  target);
                        if (filterJWs && filterJWs.length > 0) {
                            for (let jiangwei of filterJWs) {
                                player.line(jiangwei, 'thunder');
                                jiangwei.recover();
                                if(drawnum > 0) {
                                    await jiangwei.draw(drawnum);
                                }
                            }
                        }
                    }
                }
            } else if (Time == 'roundStart') {
                game.log(player, '因上轮使用技能', '#g【与君】', '，现即将横置并受到一点无来源的🔥伤害！');
                player.thunderyujun_used = false;
                player.logSkill(event.name);
                player.chat(chat);
                player.link(true);
                player.damage(1, "fire", "nosource");
            }

        },
        ai:{
            expose:1,
            threaten: function (player, target) {
                const att = get.attitude(player, target);
                const disKey = player.thunderyujun_used;
                const marknum = player.getExpansions('thunderyulei').length;
                if (disKey) {
                    return 0.5;
                } else {
                    if (att < 2) return Math.max(1,marknum);
                    return 0.5
                }
            },
        },
        "_priority":Infinity,
    }  
};
export default TAF_weiSkills;
