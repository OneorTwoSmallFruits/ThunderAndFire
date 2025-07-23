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
const { thunderguixinAI } = setAI.wei;
/** @type { importCharacterConfig['skill'] } */
const TAF_sanfenSkills = {
    //曹操
    thunderguixin:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #0088CC>归心</font>",
        onremove:true,
        intro:{
            content:function(storage, player) {
                const dislist = player.getDisSkills();
                const nummark = player.countMark('thunderguixin'); 
                if (dislist.includes('thunderguixin')) return '本回合已失效。';
                return '<font color= #0088CC>当前已使用次数=　</font>' + nummark;
            },
            name:"<font color= #0088CC>归心</font>",
        },
        trigger:{
            player:"damageBegin",
            global:["phaseAfter"],
        },
        unique:true,
        locked:false,
        direct:true,
        filter:function (event, player, name) {
            if (name === 'phaseAfter') {
                player.clearMark('thunderguixin');
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
                        player.tempDisSkills(event.name);
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
                    if (get.tag(card, 'damage')) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        return [1, thunderguixinAI(target) - get.tag(card, "damage")];
                    }
                },
            },
        },
        "_priority":Infinity,
    },
    thunderchiling:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["phaseBegin","phaseEnd"],
        },
        unique:true,
        firstDo: true,
        forced:true,
        filter:function (event, player, name) {
            const weiPlayer = game.filterPlayer(function (current) {
                return current.group == 'wei';
            });
            if (weiPlayer.length > 0) {
                if (name == 'phaseBegin') {
                    return weiPlayer.filter(o => o.hp === 1).length > 0;
                } else {
                    return weiPlayer.filter(o => o.hp < o.maxHp).length > 0;
                }
            }
            return false;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const weiPlayer = game.filterPlayer(function (current) {
                return current.group == 'wei';
            });
            if (Time == "phaseBegin") {
                player.draw(weiPlayer.filter(o => o.hp === 1).length);
            } else {
                player.draw(weiPlayer.filter(o => o.hp < o.maxHp).length);
            }
        },
        ai:{
            threaten:1.5,
        },
        "_priority":Infinity,
    },
    thunderfeiying:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            globalTo:function (from, to, distance) {
                if (!to.checkfeiying()) return distance + 1;
            },
        },
        trigger:{
            player:["damageEnd"],
        },
        locked: function (skill, player) {
            if (!player) return true;
            if (player.hasZhuSkill('thunderhujia')) return false;
            else return true;
        },
        unique:true,
        direct: true,
        async init(player,skill) {
            if (!player.checkfeiying) player.checkfeiying = function () {
                const key = player.hasZhuSkill('thunderhujia');
                if (key) return true;
                else return false;
            }
        }, 
        filter:function (event, player, name) {
            if (!player.checkfeiying()) return false;
            const target = event.source;
            if (!target || target.group !== 'wei' || !target.getEquip(1)) return false;
            return event.num && event.num > 0;
        },
        async content(event, trigger, player) {
            const target = trigger.source;
            const prompt = setColor('〖护驾·飞影〗：是否令' + get.translation(target) + '弃置武器牌你摸一张牌？');
            const result = await player.chooseBool(prompt).set('ai', function() {
                const att = get.attitude(player, target);
                if (att >= 2) return false;
                const zhuge = target.getCards('hs').filter(card => {
                    return card.name ==='zhuge';
                });
                if (zhuge.length > 0) {
                    const shacards = target.getCards('hs').filter(card => {
                        return card.name ==='sha' && target.hasValueTarget(card);
                    });
                    const equip1 = target.getEquip(1);
                    if (equip1 && equip1.name !== 'zhuge' && shacards.length > 0) return false;
                    else return true;
                } else {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name, target);
                if (target.getEquip(1)) await target.discard(target.getEquip(1),target, true);
                await player.draw();
                player.tempDisSkills(event.name);
            }
        },
        ai:{
            threaten: 1.5,
        }, 
        "_priority":1314,
    },
    thunderhujia:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"dying",
        },
        zhuSkill:true,
        unique:true,
        locked:false,
        direct:true,
        filter:function (event, player, name) {
            const weiGroup = game.filterPlayer(function (current) {
                return current != player && current.group == "wei";
            });
            return weiGroup.length > 0;
        },
        async content(event, trigger, player) {
            const weiGroup = game.filterPlayer(function (current) {
                return current != player && current.group == "wei";
            });
            if (weiGroup.length == 0) return;
            const result = await player.chooseTarget(get.prompt2('thunderhujia'), function (card, player, target) {
                return weiGroup.includes(target);
            }).set('ai', function (target) {
                const canfriends = weiGroup.filter(o => get.attitude(player, o) >= 2).sort((a,b) => {
                    const a_hs = a.getCards('hs').length, b_hs = b.getCards('hs').length;
                    const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                    if (a_hs !== b_hs) return b_hs - a_hs;
                    if (a_es !== b_es) return b_es - a_es;
                    return b.hp - a.hp;
                });
                const maixueFS = canfriends.filter(o => {
                    return o.hasSkillTag("maixue",false,player) && get.damageEffect(o, player, player, "damage") > 0;
                });
                const canenemies = weiGroup.filter(o => get.attitude(player, o) < 2).sort((a,b) => {
                    const a_hs = a.getCards('hs').length, b_hs = b.getCards('hs').length;
                    const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                    if (a_hs !== b_hs) return a_hs - b_hs;
                    if (a_es !== b_es) return a_es - b_es;
                    return a.hp - b.hp;
                });
                const notmaixueES = canfriends.filter(o => {
                    return !o.hasSkillTag("maixue",false,player) && get.damageEffect(o, player, player, "damage") > 0;
                });
                const friends = getFriends(player);
                let canSaveCards = [];
                for (const friend of friends) {
                    const cards = friend.getCards("hes");
                    for (const card of cards) {
                        if (friend.canSaveCard(card, player)) {
                            canSaveCards.push(card);
                        }
                    }
                }
                if (canSaveCards.length <= 0) {
                    if (notmaixueES.length > 0) return target === notmaixueES[0];
                    if (canenemies.length > 0) return target === canenemies[0];
                    if (maixueFS.length > 0) return target === maixueFS[0];
                    if (canfriends.length > 0) return target === canfriends[0];
                    return target === weiGroup.sort((a,b) => b.hp - a.hp)[0];
                } else {
                    if (notmaixueES.length > 0) return target === notmaixueES[0];
                    if (maixueFS.length > 0) return target === maixueFS[0];
                    if (canenemies.length > 0) return target === canenemies[0];
                    else return false;
                }
            }).forResult();
            if (result.bool) {
                const target = result.targets[0];
                player.logSkill(event.name, target);
                await target.damage(1, player);
                await player.recover(1 - player.hp);
                await target.changeCardsTo(target.maxHp, 'he');
                player.tempDisSkills("thunderhujia", { global: 'roundStart' });
            }
        },
        ai:{
            maixie:true,
            "maixie_hp":true,
            threaten: 1.5,
            effect:{
                target: function (card, player, target) {
                    const weiGroup = game.filterPlayer(function (current) {
                        return current != target && current.group == "wei";
                    });
                    if (!weiGroup || weiGroup.length == 0) return;
                    if (target.hp !== 1) return;
                    if (get.tag(card, "damage")) {
                        const enemies = weiGroup.filter(o => get.attitude(target, o) < 2);
                        return [1, enemies.length];
                    }
                },
            },
        },
        "_priority":1314,
    },
    //刘备
    firezhaoren:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #FF2400>昭仁</font>",
        onremove:true,
        intro:{
            mark:function (dialog, storage, player) {
                const Key = player.firezhaoren_wuhuused;
                if (Key.now && Key.now.length > 0) {
                    dialog.addText("正在协力：");
                    dialog.addSmall([Key.now, (item, type, position, noclick, node) => 
                        lib.skill.firezhaoren.$createButton(item, type, position, noclick, node)
                    ]);
                }
                if (Key.other && Key.other.length > 0) {
                    dialog.addText("已经协力：");
                    dialog.addSmall([Key.other, (item, type, position, noclick, node) => 
                        lib.skill.firezhaoren.$createButton(item, type, position, noclick, node)
                    ]);
                }
                if ((!Key.now || !Key.now.length) && (!Key.other || !Key.other.length)) {
                    dialog.addText("无〖五虎〗牌！");
                }
            },
            markcount:function (storage, player) {
                return player.firezhaoren_wuhuused.sum.length || 0;
            },
            onunmark: true,
            name: "<font color= #FF2400>昭仁</font>",
        },
        enable:"phaseUse",
        usable: 1,
        unique:true,
        direct:true,
        async init(player,skill) {
            if (!player.zhaorenViewAs) player.zhaorenViewAs = [
                { name: 'sha', nature: 'fire', isCard: true , firezhaoren: true },
                { name: 'tao', nature: '', isCard: true, firezhaoren: true },
                { name: 'wuzhong', nature: '', isCard: true, firezhaoren: true },
                { name: 'taoyuan', nature: '', isCard: true, firezhaoren: true },
                { name: 'wugu', nature: '', isCard: true, firezhaoren: true },
            ];
            player.firezhaoren_wuhulist = [];
            player.firezhaoren_wuhuused = { now: [], other: [], sum: [] };
            player.firezhaoren_usenum = 0;
        },
        filter:function (event, player) {
            const cards = player.getCards("he");
            if (!cards || !cards.length) return false;
            const ViewAs = player.zhaorenViewAs;
            if (!ViewAs || !ViewAs.length) return false;
            const filter = event.filterCard;
            for (const card of ViewAs) {
                if (filter(get.autoViewAs(card, "unsure"), player, event)) return true;
            }
            return false;
        },
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const ViewAs = player.zhaorenViewAs;
            if (!ViewAs || !ViewAs.length) return false;
            for (const card of ViewAs) {
                if (filter(get.autoViewAs(card, "unsure"), player, event)) return true;
            }
            return false;
        },
        selectCard: 1,
        position: "he",
        discard: false,
        lose: false,
        delay: false,
        filterTarget:function(card, player, target) {
            return target !== player;
        },
        selectTarget: 1,
        check:function(card) {
            const player = _status.event.player;
            const cards = player.getCards("he").sort((a,b) => get.value(a) - get.value(b));
            return get.value(card, player) === get.value(cards[0], player);
        },
        async contentBefore(event, trigger, player) {
            const 界五虎setIDs = ['re_guanyu', 're_zhangfei', 're_zhaoyun', 're_machao', 'ol_huangzhong'];
            const 谋五虎setIDs = ['sb_guanyu', 'sb_zhangfei', 'sb_zhaoyun', 'sb_machao', 'sb_huangzhong'];
            const 神五虎setIDs = ['tw_shen_guanyu', 'shen_zhangfei', 'TAF_shen_zhaoyun', 'shen_machao', 'TAF_bl_shenhuangzhong'];
            let wuhulist = [];
            if (player.hasZhuSkill("firejieying")) {
                wuhulist = [...谋五虎setIDs, ...神五虎setIDs];
            } else {
                wuhulist = [...界五虎setIDs, ...谋五虎setIDs];
            }
            const enterGamelists = game.players.map(player => get.translation(player));
            const filterlist = wuhulist.filter(name => {
                const fanyi = lib.translate[name];
                return !enterGamelists.includes(fanyi);
            });
            player.firezhaoren_wuhulist = filterlist;
        },
        async content(event, trigger, player) {
            const cards = event.cards;
            const target = event.targets[0];
            if (!cards || !cards.length || !target) return;
            player.firezhaoren_usenum++;
            await player.give(cards, target);
            const ViewAs = player.zhaorenViewAs;
            let list = [];
            for (let card of ViewAs) {
                if (player.hasUseTarget(card)) {
                    const type = get.type(card);
                    list.push([type, '', card.name, card.nature]);
                }
            }
            if (!list.length) return;
            const prompt = setColor("〖昭仁〗：请选择视为使用一张牌：");
            const result = await player.chooseButton([ prompt, [list, "vcard"]]).set("ai", function (button) {
                let Vcardlist = [];
                for (const card of list) {
                    const Vcard = { name: card[2], nature: card[3], isCard: true, firezhaoren: true };
                    Vcardlist.push(Vcard);
                }
                const sortVcardlist = Vcardlist.sort((a, b) => player.getUseValue(b) - player.getUseValue(a));
                return button.link[2] === sortVcardlist[0].name && button.link[3] === sortVcardlist[0].nature;
            }).set('forced', true).forResult();
            if (result.bool) {
                player.logSkill("firezhaoren", target);
                async function addWuhu(o) {
                    const wuhulist = o.firezhaoren_wuhulist.filter(name => {
                        return !o.firezhaoren_wuhuused.sum.includes(name);
                    });
                    if (wuhulist.length) {
                        const name = wuhulist[Math.floor(Math.random() * wuhulist.length)];
                        o.firezhaoren_wuhuused.now = [name];
                        o.firezhaoren_wuhuused.sum.push(name);
                        o.firezhaoren_wuhuused.other = o.firezhaoren_wuhuused.sum.filter(o => {
                            return o !== name;
                        });
                        const skills = lib.character[name][3];
                        if (skills && skills.length > 0) {
                            for (let skill of skills) {
                                o.addTempSkill(skill, { player: 'phaseUseBegin' });
                            }
                        }
                        game.log(player, "暂时获得了", get.translation(name), "的协力！");
                    }
                    o.markSkill("firezhaoren");
                }
                const wuhulist = player.firezhaoren_wuhulist.filter(name => {
                    return !player.firezhaoren_wuhuused.sum.includes(name);
                });
                if (wuhulist.length) {
                    await addWuhu(player);
                } else {
                    player.firezhaoren_wuhuused.now = [];
                    player.firezhaoren_wuhuused.other = [];
                    player.firezhaoren_wuhuused.sum = [];
                    player.markSkill("firezhaoren");
                    await addWuhu(player);
                }
                const Vcard = { name: result.links[0][2], nature: result.links[0][3], isCard: true, firezhaoren: true };
                await player.chooseUseTarget(Vcard, true, false);
            }
            const num = player.firezhaoren_usenum;
            if (num % 2 == 1) {
                await player.draw(2);
            } else {
                await player.recover();
                await player.chooseToDiscard(1, 'he', true);
            }
        },
		$createButton(item, type, position, noclick, node) {
			node = ui.create.buttonPresets.character(item, "character", position, noclick);
			const info = lib.character[item];
			const skills = info[3];
			if (skills.length) {
				const skillstr = skills.map(i => `[${get.translation(i)}]`).join("<br>");
				const skillnode = ui.create.caption(`<div class="text" data-nature=${get.groupnature(info[1], "raw")}m style="font-family: ${lib.config.name_font || "xinwei"},xinwei">${skillstr}</div>`, node);
				skillnode.style.left = "2px";
				skillnode.style.bottom = "2px";
			}
			node._customintro = function (uiintro, evt) {
				const character = node.link,
					characterInfo = get.character(node.link);
				let capt = get.translation(character);
				if (characterInfo) {
					capt += `&nbsp;&nbsp;${get.translation(characterInfo.sex)}`;
					let charactergroup;
					const charactergroups = get.is.double(character, true);
					if (charactergroups) {
						charactergroup = charactergroups.map(i => get.translation(i)).join("/");
					} else {
						charactergroup = get.translation(characterInfo.group);
					}
					capt += `&nbsp;&nbsp;${charactergroup}`;
				}
				uiintro.add(capt);

				if (lib.characterTitle[node.link]) {
					uiintro.addText(get.colorspan(lib.characterTitle[node.link]));
				}
				for (let i = 0; i < skills.length; i++) {
					if (lib.translate[skills[i] + "_info"]) {
						let translation = lib.translate[skills[i] + "_ab"] || get.translation(skills[i]).slice(0, 2);
						if (lib.skill[skills[i]] && lib.skill[skills[i]].nobracket) {
							uiintro.add('<div><div class="skilln">' + get.translation(skills[i]) + "</div><div>" + get.skillInfoTranslation(skills[i]) + "</div></div>");
						} else {
							uiintro.add('<div><div class="skill">【' + translation + "】</div><div>" + get.skillInfoTranslation(skills[i]) + "</div></div>");
						}
						if (lib.translate[skills[i] + "_append"]) {
							uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + "_append"] + "</div>");
						}
					}
				}
			};
			return node;
		},
        ai:{
            fireAttack:true,
            order:13,
            threaten: 1.3,
            result:{
                target:function(player, target){
                    const cards = player.getCards("he").sort((a,b) => get.value(a) - get.value(b));
                    if (!cards || cards.length === 0) return 0;
                    if (target.hasSkillTag("nogain")) return 0;
                    const cardskey =  cards && cards.length === 1 && get.value(cards[0], player) >= compareValue(player, 'tao');
                    const friends = game.filterPlayer((current)  => {
                        return current !== player && get.attitude(player, current) >= 2;
                    });
                    if (friends.length == 0) {
                        if (cardskey) return 0;
                        else return -2;
                    } else {
                        if (cards.length === 1) return 0;
                        else return 2;
                    }
                },
            },
        },
        "_priority":1314,
    },
    firezhaolie:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["phaseBegin","phaseEnd"],
        },
        unique:true,
        firstDo: true,
        forced:true,
        filter:function (event, player, name) {
            const shuPlayer = game.filterPlayer(function (current) {
                return current.group == 'shu';
            });
            if (shuPlayer.length > 0) {
                if (name == 'phaseBegin') {
                    return shuPlayer.filter(o => o.hp === 1).length > 0;
                } else {
                    return shuPlayer.filter(o => o.hp < o.maxHp).length > 0;
                }
            }
            return false;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const shuPlayer = game.filterPlayer(function (current) {
                return current.group == 'shu';
            });
            if (Time == "phaseBegin") {
                player.draw(shuPlayer.filter(o => o.hp === 1).length);
            } else {
                player.draw(shuPlayer.filter(o => o.hp < o.maxHp).length);
            }
        },
        ai:{
            threaten:1.5,
        },
        "_priority": Infinity,
    },
    firedilu:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            globalTo:function (from, to, distance) {
                if (!to.checkdilu()) return distance + 1;
            },
        },
        trigger:{
            player:["damageEnd"],
        },
        locked: function (skill, player) {
            if (!player) return true;
            if (player.hasZhuSkill('firejieying')) return false;
            else return true;
        },
        unique:true,
        direct: true,
        async init(player,skill) {
            if (!player.checkdilu) player.checkdilu = function () {
                const key = player.hasZhuSkill('firejieying');
                if (key) return true;
                else return false;
            }
        },  
        filter:function (event, player, name) {
            if (!player.checkdilu()) return false;
            const target = event.source;
            if (!target || target.group !== 'shu' || !target.getEquip(1)) return false;
            return event.num && event.num >0;
        },
        async content(event, trigger, player) {
            //非锁定技：每回合限一次，当你受到蜀势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。
            const target = trigger.source;
            const prompt = setColor('〖结义·的卢〗：是否令' + get.translation(target) + '弃置武器牌你摸一张牌？');
            const result = await player.chooseBool(prompt).set('ai', function() {
                const att = get.attitude(player, target);
                if (att >= 2) return false;
                const zhuge = target.getCards('hs').filter(card => {
                    return card.name ==='zhuge';
                });
                if (zhuge.length > 0) {
                    const shacards = target.getCards('hs').filter(card => {
                        return card.name ==='sha' && target.hasValueTarget(card);
                    });
                    const equip1 = target.getEquip(1);
                    if (equip1 && equip1.name !== 'zhuge' && shacards.length > 0) return false;
                    else return true;
                } else {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name, target);
                if (target.getEquip(1)) await target.discard(target.getEquip(1),target, true);
                await player.draw();
                player.tempDisSkills(event.name);
            }
        },
        ai:{
            threaten: 1.5, 
        },
        "_priority":1314,
    },
    firejieying:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["enterGame"],
            global:["phaseBefore","phaseBegin","phaseEnd"],
        },
        zhuSkill:true,
        unique:true,
        locked:false,
        direct:true,
        async init(player,skill) {
            if (!player.checkjieying) player.checkjieying = function () {
                const shuGroup = game.filterPlayer(function(current) {
                    return current.group == 'shu' && current != player && !current.hasSkill('firejieying_jieyi');
                });
                return shuGroup;
            }
        },  
        filter:function(event, player, name) {
            if (name == 'enterGame' || name == 'phaseBefore') {
                return (event.name != 'phase' || game.phaseNumber == 0) && player.checkjieying().length > 0;
            } else {
                return player.checkjieying().length > 0;
            }
        },
        derivation:['firejieying_jieyi'],
        async content(event, trigger, player) {
            const shuGroup = player.checkjieying();
            if (shuGroup.length > 0) {
                player.logSkill(event.name, shuGroup);
                for (const target of shuGroup) {
                    player.line(target, 'fire');
                    target.addSkill('firejieying_jieyi');
                }
            }
        },
        subSkill:{
            jieyi:{
                audio: "ext:银竹离火/audio/skill:2",
                mark:true,
                marktext:"☯",
                onremove:true,
                zhuanhuanji:true,
                intro:{
                    content:function(storage, player) {
                        const bool = player.storage.firejieying_jieyi;
                        if (!bool) {
                            return setColor("阳：进入濒死状态前，可摸一张牌并令刘备摸两张牌，若如此做：其手牌数大于体力值则其可令你摸一张牌。");
                        } else {
                            return setColor("阴：脱离濒死状态后(存活)，可弃一张牌并令刘备回复一点体力，若如此做：其为满体力则其可令你摸两张牌。");
                        }
                    },
                },
                trigger:{
                    player:["dyingBefore","dyingAfter"],
                    global: ["roundStart"],
                },
                unique:true,
                locked:false,
                direct:true,
                async init(player,skill) {
                    if (!player.storage[skill]) player.storage[skill] = false;
                    if (!player.firejieyi_yin) player.firejieyi_yin = false;
                    if (!player.firejieyi_yang) player.firejieyi_yang = false;
                    if (!player.checkliubei) player.checkliubei = function () {
                        const liubei = game.filterPlayer(function(current) {
                            return current.hasZhuSkill('firejieying') && current.isAlive();
                        });
                        return liubei;
                    }
                },
                filter:function(event, player, name) {
                    if (name == 'roundStart') {
                        player.firejieyi_yin = false;
                        player.firejieyi_yang = false;
                        return;
                    } else {
                        if (player.checkliubei().length == 0) return false;
                        if (name == 'dyingBefore') {
                            return !player.firejieyi_yang;
                        } else {
                            return !player.firejieyi_yin && player.isAlive();
                        }
                    }
                },
                async content(event, trigger, player) {
                    const prompt_liubei = player.checkliubei().map(c => get.translation(c)).join('、');
                    let prompt = setColor('〖结义〗：');
                    const key = player.storage.firejieying_jieyi;
                    if (key && !player.firejieyi_yin) {
                        prompt += setColor('阴：是否要弃置一张牌，并令' + prompt_liubei + '回复一点体力？若如此做：其为满体力则其可令你摸两张牌。');
                    } else if (!key && !player.firejieyi_yang) {
                        prompt += setColor('阳：是否要摸一张牌，并令' + prompt_liubei + '摸两张牌？若如此做：其手牌数大于体力值则其可令你摸一张牌。');
                    }
                    const result = await player.chooseBool(prompt).set('ai', function() {
                        let attitude = 0;
                        for (const target of player.checkliubei()) {
                            attitude += get.attitude(player, target);
                        }
                        if (attitude > 0) {
                            return true;
                        } else {
                            if (!key && !player.firejieyi_yang && getAliveNum(player,1) <= 0) return true;
                            else return false;
                        }
                    }).forResult();
                    if (result.bool) {
                        for (const target of player.checkliubei()) {
                            target.logSkill(event.name, player);
                            target.line(player, 'fire');
                        }
                        if (key && !player.firejieyi_yin) {
                            player.firejieyi_yin = true;
                            await player.chooseToDiscard(1, 'he', true);
                            for (const target of player.checkliubei()) {
                                await target.recover();
                                if (target.hp === target.maxHp) {
                                    const targetresult = await target.chooseBool('〖结义〗：是否令'+ get.translation(player) + '摸两张牌？').set('ai', function() {
                                        return get.attitude(target, player) >= 2;
                                    }).forResult();
                                    if (targetresult.bool) {
                                        target.logSkill(event.name, player);
                                        target.line(player, 'fire');
                                        await player.draw(2);
                                    }
                                }
                            }
                            player.changeZhuanhuanji(event.name);
                        } else if (!key && !player.firejieyi_yang) {
                            player.firejieyi_yang = true;
                            await player.draw();
                            for (const target of player.checkliubei()) {
                                await target.draw(2);
                                if (target.countCards('h') > target.hp) {
                                    const targetresult = await target.chooseBool('〖结义〗：是否令'+ get.translation(player) + '摸一张牌？').set('ai', function() {
                                        return get.attitude(target, player) >= 2;
                                    }).forResult();
                                    if (targetresult.bool) {
                                        target.logSkill(event.name, player);
                                        target.line(player, 'fire');
                                        await player.draw();
                                    }
                                }
                            }
                            player.changeZhuanhuanji(event.name);
                        }
                    }
                },
                sub: true,
                sourceSkill: "firejieying",
                "_priority": 0,
            },

        },
        "_priority":0,
    },
    //孙权
    wateryuheng:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiOrder:function (player, card, num) {
                const list = player.wateryuheng_useed;
                if (!Array.isArray(list)) return;
                const cards  = player.getCards("he");
                const Order = {
                    basicCards: cards.filter(card => get.type(card) == "basic").length,
                    trickCards: cards.filter(card => get.type(card) == "trick" || get.type(card) == "delay").length,
                    equipCards: cards.filter(card => get.type(card) == "equip").length,
                };
                const basic = Math.abs(Order.trickCards - Order.equipCards);
                const trick = Math.abs(Order.basicCards - Order.equipCards);
                const equip = Math.abs(Order.basicCards - Order.trickCards);
                if (get.type(card, player) === "basic" && basic > 0) {
                    if (Order.trickCards - Order.equipCards > 0 && !list.includes("trick")) {
                        return num + basic;
                    }
                    if (Order.trickCards - Order.equipCards < 0 && !list.includes("equip")) {
                        return num + basic;
                    }
                    return num;
                }
                if ((get.type(card, player) === "trick" || get.type(card, player) === "delay") && trick > 0) {
                    if (Order.basicCards - Order.equipCards > 0 && !list.includes("basic")) {
                        return num + trick;
                    }
                    if (Order.basicCards - Order.equipCards < 0 && !list.includes("equip")) {
                        return num + trick;
                    }
                    return num;
                }
                if ((get.type(card, player) === "equip") && equip > 0) {
                    if (Order.basicCards - Order.trickCards > 0 && !list.includes("basic")) {
                        return num + equip;
                    }
                    if (Order.basicCards - Order.trickCards < 0 && !list.includes("trick")) {
                        return num + equip;
                    }
                    return num;
                }
            },
        },
        mark:true,
        marktext:"<font color=#48D1CC>驭衡</font>",
        intro:{
            content:function(event, player) {
                let description = '已重铸的类型：';
                const fanyi = player.wateryuheng_useed.map(type => get.translation(type)).join('、');
                return description + fanyi;
            },
            markcount: function (storage, player) {
                return player.wateryuheng_useed.length || 0;
            },
            name:"💧",
        },
        trigger:{
            player:["useCardAfter"],
            global:["phaseAfter"],
        },
        unique:true,
        locked: function (skill, player) {
            if (!player) return true;
            if (player.wateryuxin) return false;
            else return true;
        },
        direct:true,
        async init(player,skill) {
            if (!player.wateryuheng_useed) player.wateryuheng_useed = [];
        },
        filter:function(event, player, name) {
            if (name == 'phaseAfter') { player.wateryuheng_useed = []; return;}
            const cardinfo = get.info(event.card, false);
            const cards  = player.getCards("he");
            const set = {
                basicCards: cards.filter(card => get.type(card) == "basic"),
                trickCards: cards.filter(card => get.type(card) == "trick" || get.type(card) == "delay"),
                equipCards: cards.filter(card => get.type(card) == "equip"),
            };
            const basic = Math.abs(set.trickCards.length - set.equipCards.length);
            const trick = Math.abs(set.basicCards.length - set.equipCards.length);
            const equip = Math.abs(set.basicCards.length - set.trickCards.length);
            const list = player.wateryuheng_useed;
            if (cardinfo.type === "basic" && basic > 0) {
                if (set.trickCards.length - set.equipCards.length > 0) {
                    return !list.includes("trick") && set.trickCards.filter(card => player.canRecast(card)).length > 0;
                } else {
                    return !list.includes("equip") && set.equipCards.filter(card => player.canRecast(card)).length > 0;
                }
            } else if ((cardinfo.type === "trick" || cardinfo.type === "delay") && trick > 0) {
                if (set.basicCards.length - set.equipCards.length > 0) {
                    return !list.includes("basic") && set.basicCards.filter(card => player.canRecast(card)).length > 0;
                } else {
                    return !list.includes("equip") && set.equipCards.filter(card => player.canRecast(card)).length > 0;
                }
            } else if (cardinfo.type === "equip" && equip > 0) {
                if (set.basicCards.length - set.trickCards.length > 0) {
                    return !list.includes("basic") && set.basicCards.filter(card => player.canRecast(card)).length > 0;
                } else {
                    return !list.includes("trick") && set.trickCards.filter(card => player.canRecast(card)).length > 0;
                }
            }
            return false;
        },
        async content(event, trigger, player) {
            const prompt_basic = setColor("〖驭衡〗：是否要立即重铸所有基本牌，并额外摸一张基本牌，本回合使用杀的次数加一？");
            const prompt_trick = setColor("〖驭衡〗：是否要立即重铸所有锦囊牌，并额外摸一张锦囊牌，本回合使用下一张普通锦囊牌额外结算一次？");
            const prompt_equip = setColor("〖驭衡〗：是否要立即重铸所有装备牌，并额外摸一张装备牌，本回合使用牌无距离限制？");
            const log_basic = setColor("使用技能〖驭衡〗：重铸了基本牌，本回合使用杀的次数加一！");
            const log_trick = setColor("使用技能〖驭衡〗：重铸了锦囊牌，本回合使用下一张普通锦囊牌额外结算一次！");
            const log_equip = setColor("使用技能〖驭衡〗：重铸了装备牌，本回合使用牌无距离限制！");
            const cards  = player.getCards("he");
            const set = {
                basicCards: cards.filter(card => get.type(card) == "basic"),
                trickCards: cards.filter(card => get.type(card) == "trick" || get.type(card) == "delay"),
                equipCards: cards.filter(card => get.type(card) == "equip"),
            };
            const canRecast = {
                basic: async function() {
                    const canRecasts = set.basicCards.filter(card => player.canRecast(card));
                    if (canRecasts.length > 0) {
                        await player.recast(canRecasts);
                        await player.specifyCards("basic");
                        player.wateryuheng_useed.push("basic");
                        if (!player.hasSkill('wateryuheng_basic')) player.addTempSkill('wateryuheng_basic');
                        game.log(player, log_basic);
                    }
                },
                trick: async function() {
                    const canRecasts = set.trickCards.filter(card => player.canRecast(card));
                    if (canRecasts.length > 0) {
                        await player.recast(canRecasts);
                        await player.specifyCards("trick");
                        player.wateryuheng_useed.push("trick");
                        if (!player.hasSkill('wateryuheng_trick')) player.addTempSkill('wateryuheng_trick');
                        game.log(player, log_trick);
                    }
                },
                equip: async function() {
                    const canRecasts = set.equipCards.filter(card => player.canRecast(card));
                    if (canRecasts.length > 0) {
                        await player.recast(canRecasts);
                        await player.specifyCards("equip");
                        player.wateryuheng_useed.push("equip");
                        if (!player.hasSkill('wateryuheng_equip')) player.addTempSkill('wateryuheng_equip');
                        game.log(player, log_equip);
                    }
                },
            };
            async function wateryuheng(locked = true) {
                let prompt = "";
                const cardinfo = get.info(trigger.card, false);
                if (cardinfo.type === "basic") {
                    if (set.trickCards.length - set.equipCards.length > 0) {
                        if (locked) {
                            await canRecast.trick();
                        } else {
                            prompt = prompt_trick;
                        }
                    } else {
                        if (locked) {
                            await canRecast.equip();
                        } else {
                            prompt = prompt_equip;
                        }
                    }
                } else if (cardinfo.type === "trick" || cardinfo.type === "delay") {
                    if (set.basicCards.length - set.equipCards.length > 0) {
                        if (locked) {
                            await canRecast.basic();
                        } else {
                            prompt = prompt_basic;
                        }
                    } else {
                        if (locked) {
                            await canRecast.equip();
                        } else {
                            prompt = prompt_equip;
                        }
                    }
                } else if (cardinfo.type === "equip") {
                    if (set.basicCards.length - set.trickCards.length > 0) {
                        if (locked) {
                            await canRecast.basic();
                        } else {
                            prompt = prompt_basic;
                        }
                    } else {
                        if (locked) {
                            await canRecast.trick();
                        } else {
                            prompt = prompt_trick;
                        }
                    }
                }
                return prompt;
            }
            if (!player.wateryuxin) {
                await wateryuheng();
            } else {
                const getprompt = await wateryuheng(false);
                const result = await player.chooseBool(getprompt).set('ai', function() {
                    return true;//就这样！
                }).forResult();
                if (result.bool) {
                    await wateryuheng();
                }
            }
        },
        ai:{
            threaten: 3,
        },
        subSkill: {
            basic: {
                mod:{
                    cardUsable:function(card,player,num){
                        if(card.name=='sha') return num + 1;
                    },
                },
                charlotte:true,
                unique:true,
                sub: true,
                sourceSkill: "wateryuheng",
                "_priority": Infinity,
            },
            trick: {
                trigger:{
                    player:"useCard",
                },
                charlotte:true,
                unique:true,
                direct:true,
                filter:function (event, player) {
                    if (get.type(event.card) != "trick") return false;
                    if (!event.targets.length) return false;
                    return true;
                },
                async content(event, trigger, player) {
                    player.logSkill('wateryuheng');
                    trigger.effectCount++;
                    game.log(trigger.card, "额外结算一次");
                    player.removeSkill('wateryuheng_trick');
                },
                ai:{
                    effect:{
                        player:function (card, player, target) {
                            if (card.name == "tiesuo" || card.name == "wuxie") return "zerotarget";
                        },
                    },
                },
                sub: true,
                sourceSkill: "wateryuheng",
                "_priority": Infinity,
            },
            equip: {
                mod:{
                    targetInRange:() => true,
                },
                charlotte:true,
                unique:true,
                sub: true,
                sourceSkill: "wateryuheng",
                "_priority": Infinity,
            },
        },
        "_priority":1314,
    },
    wateryuxin:{
        audio:"ext:银竹离火/audio/skill:2",
        marktext:"<font color= #48D1CC>驭心</font>",
        intro:{
            content:function (storage, player) {
                const nummark = player.countMark('wateryuxin');
                return '驭心' + nummark;
            },
            name:"<font color= #48D1CC>驭心</font>",
        },
        mod:{
            maxHandcard:function (player, num) {
                const key = player.wateryuxin;
                if (key) return player.maxHp;
                else return num;
            },
        },
        trigger:{
            player:["phaseBegin","phaseEnd"],
        },
        unique:true,
        firstDo: true,
        forced:true,
        async init(player,skill) {
            if (!player.wateryuxin) player.wateryuxin = false;
        },  
        filter:function (event, player, name) {
            const wuPlayer = game.filterPlayer(function (current) {
                return current.group == 'wu';
            });
            if (wuPlayer.length > 0) {
                if (name == 'phaseBegin') {
                    return wuPlayer.filter(o => o.hp === 1).length > 0;
                } else {
                    return wuPlayer.filter(o => o.hp < o.maxHp).length > 0;
                }
            }
            return false;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const wuPlayer = game.filterPlayer(function (current) {
                return current.group == 'wu';
            });
            if (Time == "phaseBegin") {
                player.draw(wuPlayer.filter(o => o.hp === 1).length);
            } else {
                player.draw(wuPlayer.filter(o => o.hp < o.maxHp).length);
            }
            const key = player.wateryuxin;
            if (!key) {
                player.addMark(event.name, 1);
                if (player.countMark(event.name) >= player.maxHp) {
                    player.clearMark(event.name);
                    player.unmarkSkill(event.name);
                    player.wateryuxin = true;
                    if (player.hasSkill('wateryuheng')) {
                        const skillkey = get.is.locked('wateryuheng', player);
                        if (skillkey === false) {
                            game.log(player, '发动了技能', '#g【驭心】','使技能', '#g【驭衡】','变为非锁定技！');
                        }
                    }
                    player.update();
                }
            }
        }, 
        ai:{
            threaten:1.5,
        },
        "_priority":Infinity,
    },
    wateryulong:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            globalTo:function (from, to, distance) {
                if (!to.checkyulong()) return distance + 1;
            },
        },
        trigger:{
            player:["damageEnd"],
        },
        locked: function (skill, player) {
            if (!player) return true;
            if (player.hasZhuSkill('waterquanshu')) return false;
            else return true;
        },
        unique:true,
        direct:true,
        async init(player,skill) {
            if (!player.checkyulong) player.checkyulong = function () {
                const key = player.hasZhuSkill('waterquanshu');
                if (key) return true;
                else return false;
            }
        },  
        filter:function (event, player, name) {
            if (!player.checkyulong()) return false;
            const target = event.source;
            if (!target || target.group !== 'wu' || !target.getEquip(1)) return false;
            return event.num && event.num > 0;
        },
        async content(event, trigger, player) {
            const target = trigger.source;
            const prompt = setColor('〖权术·玉龙〗：是否令' + get.translation(target) + '弃置武器牌你摸一张牌？');
            const result = await player.chooseBool(prompt).set('ai', function() {
                const att = get.attitude(player, target);
                if (att >= 2) return false;
                const zhuge = target.getCards('hs').filter(card => {
                    return card.name ==='zhuge';
                });
                if (zhuge.length > 0) {
                    const shacards = target.getCards('hs').filter(card => {
                        return card.name ==='sha' && target.hasValueTarget(card);
                    });
                    const equip1 = target.getEquip(1);
                    if (equip1 && equip1.name !== 'zhuge' && shacards.length > 0) return false;
                    else return true;
                } else {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name, target);
                if (target.getEquip(1)) await target.discard(target.getEquip(1),target, true);
                await player.draw();
                player.tempDisSkills(event.name);
            }
        },
        ai:{
            threaten: 1.5,
        }, 
        "_priority":1314,
    },
    waterquanshu:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["enterGame"],
            global:["phaseBefore","phaseBegin","phaseEnd"],
        },
        zhuSkill:true,
        unique:true,
        locked:false,
        direct:true,
        async init(player,skill) {
            if (!player.checkquanshu) player.checkquanshu = function () {
                const wuGroup = game.filterPlayer(function(current) {
                    return current.group == 'wu' && current != player && !current.hasSkill('waterquanshu_quandao');
                });
                return wuGroup;
            }
        }, 
        filter:function(event, player, name) {
            if (name == 'enterGame' || name == 'phaseBefore') {
                return (event.name != 'phase' || game.phaseNumber == 0) && player.checkquanshu().length > 0;
            } else {
                return player.checkquanshu().length > 0;
            }
        },
        derivation:['waterquanshu_quandao'],
        async content(event, trigger, player) {
            const wuGroup = player.checkquanshu();
            if (wuGroup.length > 0) {
                player.logSkill(event.name, wuGroup);
                for (const target of wuGroup) {
                    player.line(target, 'water');
                    target.addSkill('waterquanshu_quandao');
                }
            }
        },
        subSkill:{
            quandao:{
                audio: "ext:银竹离火/audio/skill:2",
                mark:true,
                marktext:"☯",
                onremove:true,
                zhuanhuanji:true,
                intro:{
                    content:function(storage, player) {
                        const bool = player.storage.waterquanshu_quandao;
                        if (!bool) {
                            return setColor("阳：造成伤害后，你可摸一张牌并弃置两张牌，若如此做：孙权回复一点体力并可移动场上一张牌。");
                        } else {
                            return setColor("阴：受到伤害后，你可摸两张牌并弃置一张牌，若如此做：孙权摸一张牌并可弃置场上一张牌。");
                        }
                    },
                },
                trigger:{
                    player:"damageAfter",
                    source:"damageAfter",
                    global: ["roundStart"],
                },
                unique:true,
                locked:false,
                direct:true,
                async init(player,skill) {
                    if (!player.storage[skill]) player.storage[skill] = false;
                    if (!player.waterquandao_yin) player.waterquandao_yin = false;
                    if (!player.waterquandao_yang) player.waterquandao_yang = false;
                    if (!player.checksunquan) player.checksunquan = function () {
                        const sunquan = game.filterPlayer(function(current) {
                            return current.hasZhuSkill('waterquanshu') && current.isAlive();
                        });
                        return sunquan;
                    }
                },
                filter:function(event, player, name) {
                    if (name == 'roundStart') {
                        player.waterquandao_yin = false;
                        player.waterquandao_yang = false;
                        return;
                    } else {
                        if (player.checksunquan().length == 0) return false;
                        const source = event.source;
                        if (!source) return false;
                        const num = event.num;
                        if (!num || num <= 0) return false;
                        const key = player.storage.waterquanshu_quandao;
                        if(source === player) return !key && !player.waterquandao_yang;
                        if(event.player  === player) return key && !player.waterquandao_yin;
                        return false;
                    }
                },
                async content(event, trigger, player) {
                    const target = trigger.player;
                    const source = trigger.source;
                    const prompt_sunquan = player.checksunquan().map(c => get.translation(c)).join('、');
                    let prompt = setColor('〖权道〗：');
                    const key = player.storage.waterquanshu_quandao;
                    if (key && target === player && !player.waterquandao_yin) {
                        prompt += setColor('阴：是否摸两张牌并弃置一张牌，若如此做：' + prompt_sunquan + '摸一张牌并可弃置场上一张牌。');
                    } else if (!key && source === player && !player.waterquandao_yang) {
                        prompt += setColor('阳：是否摸一张牌并弃置两张牌，若如此做：' + prompt_sunquan + '回复一点体力并可移动场上一张牌。');
                    }
                    const result = await player.chooseBool(prompt).set('ai', function() {
                        let attitude = 0;
                        for (const ooo of player.checksunquan()) {
                            attitude += get.attitude(player, ooo);
                        }
                        if (attitude > 0) {
                            if (key && target === player && !player.waterquandao_yin) {
                                return true;
                            } else if (!key && source === player && !player.waterquandao_yang) {
                                const getsunquan = player.checksunquan().filter(o => {
                                    const att = get.attitude(player, o);
                                    return att > 0 && (o.isDamaged() || o.canMoveCard());
                                });
                                if (getsunquan.length > 0) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            return false;
                        } else {
                            if (key && target === player && !player.waterquandao_yin) return true;
                            return false;
                        }
                    }).forResult();
                    if (result.bool) {
                        for (const sunquan of player.checksunquan()) {
                            sunquan.logSkill(event.name, player);
                            sunquan.line(player, 'water');
                        }
                        if (key && target === player && !player.waterquandao_yin) {
                            player.waterquandao_yin = true;
                            await player.draw(2);
                            await player.chooseToDiscard(1, 'he', true);
                            for (const sunquan of player.checksunquan()) {
                                await sunquan.draw();
                                const sunquanresult = await sunquan.chooseTarget('是否弃置场上的一张牌？', (card, player, target) => {
                                    return target.countDiscardableCards(sunquan, 'ej') > 0;
                                }).set('ai', target => {
                                    const att = get.attitude(sunquan, target);
                                    if (att > 0 && (target.countCards('j') > 0 || target.countCards('e', function(card) {
                                        return get.value(card, target) < 0;
                                    }))) return 2;
                                    if (att < 0 && target.countCards('e') > 0 && !target.hasSkillTag('noe')) return -1;
                                    return 0;
                                }).forResult();
                                if (sunquanresult.bool) {
                                    await sunquan.discardPlayerCard(sunquanresult.targets[0],'ej',true);
                                }
                            }
                            player.changeZhuanhuanji(event.name);
                        } else if (!key && source === player && !player.waterquandao_yang) {
                            player.waterquandao_yang = true;
                            await player.draw();
                            await player.chooseToDiscard(2, 'he', true);
                            for (const sunquan of player.checksunquan()) {
                                sunquan.recover();
                                if (sunquan.canMoveCard()) sunquan.moveCard();
                            }
                            player.changeZhuanhuanji(event.name);
                        }
                    }
                },
                sub: true,
                sourceSkill: "waterquanshu",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
};
export default TAF_sanfenSkills;