import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'./functions.js';
import { asyncs , oltianshu} from'./asyncs.js';
const {
    setColor, cardAudio, delay, getCardSuitNum, getCardNameNum,
    compareValue, 
    compareOrder, compareUseful, checkVcard, checkSkills,
    chooseCardsToPile, chooseCardsTodisPile, setTimelist,
    changeCardsTo,
} = ThunderAndFire;//银竹离火函数
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
const luoshukey = lib.config.extension_银竹离火_TAFset_ice_jiaxu;//蝶贾诩络殊技能池拓展开关
const {
    getTypesCardsSum, getTypesCardsSum_byme, getShaValue, getDamageTrickValue,
    getTrickValue, getAliveNum,getFriends
} = setAI;
const { changeCharacter, initfanzhuan } = asyncs.qun.TAF_tongyu;
const { shenwangjingtu } = asyncs.qun.TAF_jiangtaixu;
const { setxuanyu } = asyncs.shu.TAF_pangtong;
const { setlonghun, initlonghun } = asyncs.shu.TAF_zhaoyun;
const 龙魂 = setColor("可以将至多两张同花色「♦丨♣丨♥丨♠」当对应的「火杀丨闪丨桃丨无懈」使用或打出。");

/** @type { importCharacterConfig['skill'] } */
const TAF_shenhuaSkills = {
    //神赵云
    TAFjuejing: {
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            maxHandcard:function(player, num) {
                return num + 2;
            },
        },
        trigger:{
            player:["changeHpBefore","changeHpAfter"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            const setlist = ['changeHp'];
            for(let time of setlist) {
                if (!player[time + "Beforehp"]) player[time + "Beforehp"] = 0;
                if (!player[time + "Afterhp"]) player[time + "Afterhp"] = 0;
            }
        },
        filter:function(event, player, name) {
            const setlist = ['changeHp'];
            for(let time of setlist) {
                if (name == time + "Before") {
                    if(!player[name + "hp"]) player[name + "hp"] = 0;
                    player[name + "hp"] = player.hp;
                } else if (name == time + "After") {
                    if(!player[name + "hp"]) player[name + "hp"] = 0;
                    player[name + "hp"] = player.hp;
                    const timetime = time + "Before";
                    const Before_num = player[timetime + "hp"];
                    const After_num = player[name + "hp"];
                    if(Math.abs(Before_num - After_num) > 0){
                        return player.isAlive();
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const setlist = ['changeHp'];
            for(let time of setlist) {
                if (Time == time + "After") {
                    const Before_num = player[time + "Beforehp"];
                    const After_num = player[time + "Afterhp"];
                    if(Math.abs(Before_num - After_num) > 0){
                        player.logSkill(event.name);
                        await player.gainCardsRandom(Math.abs(Before_num - After_num));
                    }
                }
            }
        },
        ai:{
            maixie:true,
            "maixie_hp":true,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                const Before_num = player.changeHpBeforehp || 0;
                const After_num = player.changeHpAfterhp || 0;
                const num = Math.abs(Before_num - After_num);
                return att < 2 ? Math.max(1, num + player.maxHp / 2) : 0.5;
            },
            effect: {
                target: function(card, player, target) {
                    const damage = get.tag(card, "damage");
                    const recover = get.tag(card, "recover");
                    if (damage) {
                        if (!target.hasFriend()) return;
                        const hps = target.hp;
                        const cards = target.getCards("hes");
                        if (cards.length === 0) return [1, 1];
                        let taos = 0, jius = 0, Vtaos = 0;
                        if (target.hasSkill("TAFlonghun")) {
                            taos = cards.filter(c => get.name(c) === "tao" && get.suit(c) !== "heart").length;
                            jius = cards.filter(c => get.name(c) === "jius").length;
                            Vtaos = cards.filter(c => get.suit(c) === "heart").length;
                        } else {
                            taos = cards.filter(c => get.name(c) === "tao").length;
                            jius = cards.filter(c => get.name(c) === "jius").length;
                        }
                        const livenum = hps + taos + jius + Vtaos - damage;
                        if (livenum > 0) {
                            let shouyi = (target.hp === 1) ? damage * 2 : damage * 1.5;
                            return [1, target.hasSkill("TAFlonghun") ? shouyi : 1];
                        }
                    } 
                    if (recover && target.isDamaged()) {
                        return [1, 1];
                    }
                },
            }
        },
        "_priority": 1314,
    },
    TAFlonghun: {
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
                return Math.max(num, get.value(Vcard, player));
            },
            aiUseful: function() {
                return lib.skill.TAFlonghun.mod.aiValue.apply(this, arguments);
            },
        },
        enable: ["chooseToUse", "chooseToRespond"],
        prompt: 龙魂,
        init: async function(player, skill) {
            await initlonghun(player, skill);
        },
        filter: function (event, player) {
            const filter = event.filterCard;
            if (filter(get.autoViewAs({ name: "sha", nature: "fire" }, "unsure"), player, event) && player.countCards("hes", { suit: "diamond" })) return true;
            if (filter(get.autoViewAs({ name: "shan" }, "unsure"), player, event) && player.countCards("hes", { suit: "club" })) return true;
            if (filter(get.autoViewAs({ name: "tao" }, "unsure"), player, event) && player.countCards("hes", { suit: "heart" })) return true;
            if (filter(get.autoViewAs({ name: "wuxie" }, "unsure"), player, event) && player.countCards("hes", { suit: "spade" })) return true;
            return;
        },
        unique: true,
        locked: false,
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
                if (viewcard) return { name: viewcard, nature: viewnature, isCard: true, TAFlonghun: true };
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
                const object = { sha: "diamond", shan: "club", tao: "heart", wuxie: "spade" };
                const keys = Object.keys(object);
                for (let key of keys) {
                    const hasSuits = player.countCards("hes", { suit: object[key] });
                    if (hasSuits > 0) {
                        let Vcard = { name: key, nature: key === "sha" ? 'fire' : '', isCard: true };
                        const Vorder = get.order(Vcard);
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            if (Vorder >= order) order = Vorder * 1.2 + addorder;
                        } else {
                            order = Vorder * 0.5 + addorder / 5;
                        }
                        if (order >= Vorder) {
                            const selectedCards = ui.selected.cards;
                            if (selectedCards.length === 0) {
                                return get.value(card) <= compareValue(player,'tao') * 1.25;
                            }
                            if (selectedCards.length > 0) {
                                return get.value(card) <= Math.min(compareValue(player,'tao') * 0.95 , compareValue(player,'shan') * 0.95, compareValue(player,'wuxie') * 0.95);
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
            await setlonghun(result, player);
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
                            let Vcard = { name: key, nature: key === "sha" ? 'fire' : '', isCard: true };
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
                return Math.max(addorder, 2);
            },
        },
        "_priority": Infinity,
    },
    //神庞统
    TAFxuanyu: {
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            maxHandcard:function(player, num) {
                return num + player.countSkills().length;
            },
        },
        trigger:{
            player:["enterGame"],
            global:["roundStart","phaseBefore","dying"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            if(!player.TAFxuanyu) player.TAFxuanyu = {
                characters: [],
                usedSkills: [],
                choosed: [],//AI决策
            };
            if (game.phaseNumber > 0 && !player.TAFxuanyu.characters.length) {
                /**
                 * 增加出现：中途神庞统加入游戏未赋值玄羽牌的设定
                 * 因为总有人会做出中途切换角色。或者复活。
                 * 因为init中，检索game.players时，只能获取场上玩家数量有几个。
                 * 但是选择的武将牌没有。读取不了场上已存在的武将卡的名字
                 * 玄羽牌设定：你不可能获得与场上武将相同的武将，这是基本逻辑。
                 */
                const lists = await setxuanyu('getCharacter');
                player.TAFxuanyu.characters = lists;
                player.markSkill('TAFxuanyu');
                player.logSkill(skill);
                const prompt1 = setColor("从游戏外获得了");
                const prompt2 = setColor("张〖玄羽〗牌置于武将牌上。");
                game.log(player, prompt1, lists.length, prompt2);
            }
        },
        filter: function(event, player, name) {
            if(name == "enterGame" || name == "phaseBefore") {
                return (event.name != "phase" || game.phaseNumber == 0) && !player.TAFxuanyu.characters.length;
            } else {
                const lists = player.TAFxuanyu.characters
                return lists.length > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time == 'enterGame' ||  Time == 'phaseBefore') {
                const lists = await setxuanyu('getCharacter');
                player.TAFxuanyu.characters = lists;
                player.markSkill('TAFxuanyu');
                player.logSkill(event.name);
                const prompt1 = setColor("从游戏外获得了");
                const prompt2 = setColor("张〖玄羽〗牌置于武将牌上。");
                game.log(player, prompt1, lists.length, prompt2);
            } else {
                const lists = player.TAFxuanyu.characters;
                if(!lists || lists.length === 0) return;
                const prompt = setColor("〖玄羽〗：请选择一张玄羽牌。");
                const chooseButton = await player.chooseButton([prompt,
                    [
                        lists,
                        function (item, type, position, noclick, node) {
                            return lib.skill.TAFxuanyu.$createButton(item, type, position, noclick, node);
                        },
                    ],
                    [1, 1],
                ]).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                    /**
                     * 1.我这边思路如果有转化类的技能优先选择带有转化类技能的玄羽牌
                     * 2.如果存在已经选过的角色，且该角色还有未选择的技能可以选择，则优先选择该角色
                     * 3.因为肯定优先获取完整武将技能最好，因为有的技能之间有联动。
                     * 4.等等
                     */
                    function getValueLinks() {
                        const links = player.TAFxuanyu.characters;
                        const choosed = player.TAFxuanyu.choosed;//AI决策
                        if (choosed.length) {
                            const same = choosed.filter(name => links.includes(name));
                            if (same.length) {
                                const name = same[0];
                                return name;
                            }
                        } else {
                            let target = {};
                            for (const name of links) {
                                const info = lib.character[name];
                                const filterSkills = lib.skill.TAFxuanyu.filterSkills;
                                const skills = info[3].filter((skill) => {
                                    const key = filterSkills(skill,"number").includes(skill) || filterSkills(skill, "type").includes(skill) || filterSkills(skill, "viewAs").includes(skill);
                                    return key && !player.TAFxuanyu.usedSkills.includes(skill);
                                });
                                const viewAsSkills = info[3].filter((skill) => {
                                    return filterSkills(skill,"viewAs").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
                                });
                                if (!target[name]) {
                                    target[name] = {
                                        skills: skills,
                                        viewAsSkills: viewAsSkills,
                                    };
                                }
                            }
                            let keys = Object.keys(target);
                            keys.sort((a, b) => {
                                const ta = target[a];
                                const tb = target[b];
                                if (ta.viewAsSkills.length !== tb.viewAsSkills.length) {
                                    return tb.viewAsSkills.length - ta.viewAsSkills.length;
                                }
                                return tb.skills.length - ta.skills.length;
                            });
                            return keys[0];
                        }
                    }
                    //console.log('AI',getValueLinks());//调试成功
                    return button.link === getValueLinks();
                }).forResult();
                if (chooseButton.bool) {
                    player.logSkill(event.name);
                    const choices = chooseButton.links;
                    //console.log('最终选择',choices);//调试成功
                    const chooseXuanYu = lib.skill.TAFxuanyu.chooseXuanYu;
                    await chooseXuanYu(player, choices);
                }
                await lib.skill.TAFxuanyu.updateMarks(player);
            }
        },
		skillsTypes: ["锁定技","主公技","限定技","觉醒技","转换技","隐匿技","宗族技","势力技","使命技","蓄力技","阵法技","主将技","副将技","君主技","蓄能技","Charlotte","昂扬技","持恒技","连招技","威主技"],
		bannedTypes: ["主公技","限定技","觉醒技","隐匿技","势力技","使命技","阵法技","主将技","副将技","君主技","Charlotte","威主技"],
		cangetTypes: function() {
            /**
             * 排除不必要的标签类型技能。
             * 以上仅限本体标签，目前我找的的就这么多
             * update:  2025年6月15日
             */
            const types = lib.skill.TAFxuanyu.skillsTypes;
            const bannedTypes = lib.skill.TAFxuanyu.bannedTypes;
            return types.filter(t =>!bannedTypes.includes(t));
        },
        filterSkills: function (skillxx, type = "banned") {
            const infos = get.info(skillxx);
            if(!infos) return [];
            if(type === "banned") {//前置条件！排除特定标签
                const categories = get.skillCategoriesOf(skillxx, get.player());
                const bannedTypes = lib.skill.TAFxuanyu.bannedTypes;
                if(categories.some(c => bannedTypes.includes(c))) return [];
                return [skillxx];
            } else if(type === "type") {//技能含有标签
                const skilllists = lib.skill.TAFxuanyu.filterSkills(skillxx);
                if(skilllists.length === 0) return [];
                const cangetTypes = lib.skill.TAFxuanyu.cangetTypes();
                const categories = get.skillCategoriesOf(skillxx, get.player());
                if(categories.some(c => cangetTypes.includes(c))) return [skillxx];
                return [];
            } else if(type === "number") {//技能翻译含有数字或单个字母大小写，比如X  或x  Y或y
                const skilllists = lib.skill.TAFxuanyu.filterSkills(skillxx);
                if(skilllists.length === 0) return [];
                const fanyi = lib.translate[skillxx + "_info"];
                if(!fanyi) return [];
                const DIGIT_REGEX = /(\d+|[一-十百千万亿]|X|x|Y|y|V|v|L|l|C|c|D|d|M|m|I|i)/;
                const hasNumber = DIGIT_REGEX.test(fanyi);
                if (!hasNumber) return [];
                return [skillxx];
            } else if(type === "viewAs") {//转化类技能，视为技？
                const skilllists = lib.skill.TAFxuanyu.filterSkills(skillxx);
                if(skilllists.length === 0) return [];
                let isviewAsSkill = false;
                const setlists = ['viewAs','chooseButton'];
                for(let list of setlists) {
                    const type = lib.skill[skillxx][list];
                    if(type) {
                        if(list === 'viewAs') {
                            isviewAsSkill = true;
                            break;
                        }
                        if(list === 'chooseButton') {
                            const subtype = type.backup;
                            if(subtype) {
                                isviewAsSkill = true;
                                break;
                            }
                        }
                    }
                }
                const fanyi = lib.translate[skillxx + "_info"];
                if(fanyi) {//比如刘永就是在执行函数中设定的。
                    const hasViewAs = /视为使用/.test(fanyi);
                    if(hasViewAs) {
                        isviewAsSkill = true;
                    }
                }
                if(isviewAsSkill) return [skillxx];
                return [];
            }
            return [];
        },
		$createButton(item, type, position, noclick, node) {
			node = ui.create.buttonPresets.character(item, "character", position, noclick);
			const info = lib.character[item];
			const skills = info[3].filter((skill) => {
                const filterSkills = lib.skill.TAFxuanyu.filterSkills;
                const key = filterSkills(skill,"number").includes(skill) || filterSkills(skill, "type").includes(skill) || filterSkills(skill, "viewAs").includes(skill);
                const TAFxuanyu = get.player().TAFxuanyu;
                if(TAFxuanyu && TAFxuanyu.usedSkills) return key && !TAFxuanyu.usedSkills.includes(skill);
                return key
			});
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
        chooseXuanYu: async function(player, choices) {
            const names = choices;
            if(names.length === 0) return;
            const name = names[0];
            const info = lib.character[name];
            const filterSkills = lib.skill.TAFxuanyu.filterSkills;
            const numberskills = info[3].filter((skill) => {
                return filterSkills(skill,"number").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
            });
            const typeskills = info[3].filter((skill) => {
                return filterSkills(skill,"type").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
            });
            const viewAsSkills = info[3].filter((skill) => {
                return filterSkills(skill,"viewAs").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
            });
            const numberfanyi = numberskills.map(i => get.translation(i)).join("、") || "无";
            const typefanyi = typeskills.map(i => get.translation(i)).join("、") || "无";
            const viewAsfanyi = viewAsSkills.map(i => get.translation(i)).join("、") || "无";
            const list = [
                setColor("〖数字〗：") + numberfanyi,
                setColor("〖标签〗：") + typefanyi,
                setColor("〖转化〗：") + viewAsfanyi,
            ];
            const txt = setColor("〖玄羽〗：请选择一项执行之！")
            const chooseButton = await player.chooseButton([txt,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    return numberskills.length > 0;
                } else if (button.link === 1) {
                    return typeskills.length > 0;
                } else if (button.link === 2) {
                    return viewAsSkills.length > 0;
                }
            }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                /**
                 * 获取可选按钮
                 */
                function getlinksNum () {
                    let links = [];
                    if (numberskills.length > 0) links.push(0);
                    if (typeskills.length > 0) links.push(1);
                    if (viewAsSkills.length > 0) links.push(2);
                    return links;
                }
                /**
                 * 获取最优选项，只是理论
                 */
                function getValueLinks () {
                    const links = getlinksNum();
                    if (links.includes(2)) return 2;
                    if (links.includes(1)) return 1;
                    if (links.includes(0)) return 0;
                    return -1;
                }
                if (getValueLinks() === -1) return false;
                switch (button.link) {
                    case 0:
                        return getValueLinks() === 0;
                    case 1:
                        return getValueLinks() === 1;
                    case 2:
                        return getValueLinks() === 2;
                }
            }).forResult();
            if (chooseButton.bool) {
                const choices = chooseButton.links;
                const choosedList = player.TAFxuanyu.choosed;//AI决策
                if(!choosedList.includes(name)) player.TAFxuanyu.choosed.push(name);//AI决策
                if (choices.includes(0)) {
                    await useSkill(numberskills);
                } else if (choices.includes(1)) {
                    await useSkill(typeskills);
                } else if (choices.includes(2)) {
                    await useSkill(viewAsSkills);
                }
            }
            async function useSkill(lists) {
                let TXT = setColor("〖玄羽〗：请选择获得其中一个技能：");
                const result = await player.chooseControl(lists).set('prompt', TXT).set ("ai", control => {
                    return lists.randomGet();
                }).set("forced", true).forResult();
                await player.addSkill(result.control);
                game.log(player, "获得了技能", '#g【' +  get.translation(result.control) + '】');
                player.TAFxuanyu.usedSkills.push(result.control);
            }
        },
        updateMarks : async function(player) {
            const names = player.TAFxuanyu.characters;
            for(const name of names) {
                const info = lib.character[name];
                const filterSkills = lib.skill.TAFxuanyu.filterSkills;
                const numberskills = info[3].filter((skill) => {
                    return filterSkills(skill,"number").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
                });
                const typeskills = info[3].filter((skill) => {
                    return filterSkills(skill,"type").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
                });
                const viewAsSkills = info[3].filter((skill) => {
                    return filterSkills(skill,"viewAs").includes(skill) && !player.TAFxuanyu.usedSkills.includes(skill);
                });
                if(numberskills.length === 0 && typeskills.length === 0 && viewAsSkills.length === 0) {
                    player.TAFxuanyu.characters.splice(player.TAFxuanyu.characters.indexOf(name),1);
                    player.markSkill('TAFxuanyu');
                }
            }
            if(player.TAFxuanyu.characters.length === 0) {
                player.unmarkSkill('TAFxuanyu');
            }
        },
        mark:true,
        marktext:"<font color= #EE9A00>玄羽</font>",
        onremove:true,
        intro:{
            mark:function (dialog, storage, player) {
                if (player.TAFxuanyu.characters && player.TAFxuanyu.characters.length > 0) {
					if (player.isUnderControl(true)) {
						dialog.addSmall([player.TAFxuanyu.characters, (item, type, position, noclick, node) => lib.skill.TAFxuanyu.$createButton(item, type, position, noclick, node)]);
					} else {
						dialog.addText("共有" + get.cnNumber(player.TAFxuanyu.characters.length) + "张〖玄羽〗牌！");
					}
				} else {
					return "无〖玄羽〗牌！";
				}
            },
            markcount:function (storage, player) {
                return player.TAFxuanyu.characters.length || 0;
            },
            onunmark: true,
            name: "<font color= #EE9A00>玄羽</font>",
        },
        "_priority": 0,
    },
    TAFfenshen: {
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "☯",
        onremove: true,
        zhuanhuanji: true,
        intro: {
            content: function(storage, player) {
                const key = player.storage.TAFfenshen
                if (key) {
                    return setColor("阴：你失去一点体力上限，与目标角色各摸一张牌，然后令此牌无法响应。");
                } else {
                    return setColor("阳：你失去一点体力，目标角色重铸一张基本牌，然后令此牌额外结算一次。");
                }
            }
        },
        trigger:{
            player:["useCardToPlayer"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            if(!player.storage.TAFfenshen) player.storage.TAFfenshen === false;
        },
        filter:function(event, player, name) {
            const card = event.card;
            if(!card) return false;
            const targets = event.targets;
            if(!targets || targets.length !== 1 || targets.includes(player)) return false;
            return get.type(card) === "basic" || get.type(card) === "trick";
        },
        async content(event, trigger, player) {
            //锁定技，转换技：<br>　　当你使用基本牌或普通锦囊指定其他角色为唯一目标时：阳，你失去一点体力，目标角色重铸一张基本牌，然后令此牌额外结算一次；阴，你失去一点体力上限，与目标角色均摸一张牌，然后令此牌无法响应。
            async function RecastCards(player) {
                const basiccards = player.getCards("he").filter(card => player.canRecast(card) && get.type(card) === "basic");
                if(!basiccards || basiccards.length === 0) return;
                const prompt = "请选择一张基本牌重铸。";
                const result = await player.chooseCard(prompt, 'he', 1, function(card) {
                    return basiccards.includes(card);
                }).set('ai', function(card) {
                    const sortedCards = basiccards.sort((a,b) => {
                        return get.value(a,player) - get.value(b,player);
                    });
                    return get.value(card,player) <= get.value(sortedCards[0],player);
                }).set("forced", true).forResult();
                if (result.bool) {
                    const card = result.cards[0];
                    await player.recast(card);
                }
            }
            const target = trigger.targets[0];
            const key = player.storage.TAFfenshen;
            let prompt = setColor("〖焚身〗：");
            if(key) {
                prompt += "是否选择失去一点体力上限，与" + get.translation(target) + "各摸一张牌，然后令" + get.translation(trigger.card) + "无法响应？";
            } else {
                prompt += "是否选择失去一点体力，" + get.translation(target) + "重铸一张基本牌，然后令" + get.translation(trigger.card) + "额外结算一次？";
            }
            const result = await player.chooseBool(prompt).set('ai', function() {
                const effect = get.effect(target, trigger.card, player, player);
                const skills = player.countSkills();
                if(effect <= 0) return false;
                if(key) {
                    const card = get.cardPile2(c => get.tag(c, "fireDamage"));
                    if(card) return true;
                    if(skills.length > 2) return true;//联动三技能那块AI决策
                    return false;
                } else {
                    if(getAliveNum(player, 1) > 0) return true;
                    const card = get.cardPile2(c => get.tag(c, "fireDamage"));
                    if(card) return true;
                    if(skills.length > 2) return true;//联动三技能那块AI决策
                    return false;
                }
            }).forResult();
            if (result.bool) {
                player.changeZhuanhuanji(event.name);
                player.logSkill(event.name,target);
                if(key) {
                    player.storage.TAFfenshen = false;
                    await player.loseMaxHp();
                    await player.draw();
                    await target.draw();                  
                    trigger.getParent().directHit.addArray(game.filterPlayer());
                    game.log(player, '使用的', trigger.card, "不可被响应！");
                } else {
                    player.storage.TAFfenshen = true;
                    await player.loseHp();
                    await RecastCards(target);
                    trigger.getParent().effectCount ++;
                    game.log(player, '使用的', trigger.card, "额外结算一次！");
                }
            }
        },
        ai:{
            threaten: 3,
        },
        "_priority": 0,
    },
    TAFyuhuo: {
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["dieBegin"],
            global:['phaseBegin'],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            if(!player.storage.TAFyuhuo) player.storage.TAFyuhuo = player.maxHp;
        },
        filter:function(event, player, name) {
            if(name === 'phaseBegin') {
                player.storage.TAFyuhuo === player.maxHp;
                return;
            } else if(name === 'dieBegin') {
                const card = get.cardPile2(c => get.tag(c, "fireDamage"));
                const skills = player.countSkills();
                return card || skills.length > 0;
            }
        },
        async content(event, trigger, player) {
            const list = [
                setColor("〖选项一〗：移除武将牌上的一个技能。"),
                setColor("〖选项二〗：将牌堆或弃牌堆中的一张火属性伤害牌移除游戏。"),
            ];
            const txt = setColor("〖浴火〗：请选择一项执行之！")
            const chooseButton = await player.chooseButton([txt,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    return player.countSkills().length > 0;
                } else if (button.link === 1) {
                    return get.cardPile2(c => get.tag(c, "fireDamage"));
                }
            }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
               /**
                 * 获取可选按钮
                 */
                function getlinksNum () {
                    let links = [];
                    if (player.countSkills().length > 0) links.push(0);
                    if (get.cardPile2(c => get.tag(c, "fireDamage"))) links.push(1);
                    return links;
                }
                /**
                 * 理论上可以获得高达神马超。
                 * 这玩意儿我都想让他把二技能移除哈哈。
                 * 这里我先返回优先移除火属性伤害牌。
                 */
                function getValueLinks () {
                    const links = getlinksNum();
                    if (links.includes(1)) return 1;
                    if (links.includes(0)) return 0;
                    return -1;
                }
                if (getValueLinks() === -1) return false;
                switch (button.link) {
                    case 0:
                        return getValueLinks() === 0;
                    case 1:
                        return getValueLinks() === 1;
                }
            }).forResult();
            if (chooseButton.bool) {
                player.logSkill(event.name);
                const choices = chooseButton.links;
                if (choices.includes(0)) {
                    const lists = player.countSkills();
                    const prompt = setColor("〖浴火〗：请选择失去其中一个技能。");
                    const result = await player.chooseControl(lists).set('prompt', prompt).set ("ai", control => {
                        /**
                         * 待定，理论上可以获得高达神马超。
                         * 这玩意儿可不好写，我先让单机先不要让他移除一技能和三技能。
                         */
                        const filterSkills = lists.filter(skill => {
                            return skill !== 'TAFxuanyu' && skill!== 'TAFyuhuo';
                        });
                        if(filterSkills.length > 0) {
                            return filterSkills.randomGet();
                        } else {
                            return lists.randomGet();
                        }
                    }).set("forced", true).forResult();
                    await player.removeSkill(result.control);
                    game.log(player, "失去了技能", '#g【' +  get.translation(result.control) + '】');
                    trigger.cancel();
                    const num = player.storage.TAFyuhuo;
                    player.maxHp = num;
                    player.update();
                    await player.recoverTo(1);
                } else if (choices.includes(1)) {
                    const card = get.cardPile2(c => get.tag(c, "fireDamage"));
                    if (!card) return;
                    game.cardsGotoSpecial(card);
                    game.log(player, "将", card, "移出游戏");
                    trigger.cancel();
                    const num = player.storage.TAFyuhuo;
                    player.maxHp = num;
                    player.update();
                    await player.recoverTo(1);
                }
            }
        },
        ai:{
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if(att > 2) return 0.5;
                return player.countSkills().length;
            },
        },
        "_priority": 0,
    },
    //姜太虚
    TAFjingtu: {
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext:"<font color= #EE9A00>净土</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #EE9A00>净土</font>",
        },
        trigger:{
            global:['useCardAfter','roundStart'],
        },
        persevereSkill: true,
        placeSkill: true,
        categories: () => ['战场技'],
        direct:true,
        init: async function(player, skill) {
            if (!ui._shenwangjingtu && !ui._shenwangjingtu_state) {
                game.broadcastAll(() => {
                    if (!_status._shenwangjingtu) _status._shenwangjingtu = 0;
                    _status._shenwangjingtu = Math.max(0, _status._shenwangjingtu);

                    if (get.is.phoneLayout()) {
                        ui._shenwangjingtu = ui.create.div('.touchinfo.left', ui.window);
                        ui._shenwangjingtu_state = ui.create.div('.touchinfo.left', ui.window);
                    } else {
                        ui._shenwangjingtu = ui.create.div(ui.gameinfo);
                        ui._shenwangjingtu_state = ui.create.div(ui.gameinfo);
                    }
                    ui._shenwangjingtu.innerHTML = '当前士气：' + _status._shenwangjingtu;
                    ui._shenwangjingtu_state.innerHTML = '<br>';
                });
            }
            if (!player.clearjingtuMark) player.clearjingtuMark = function() {
                const targets = game.filterPlayer().filter(target => {
                    return target.jingtu_useCardAfter;
                });
                if(targets && targets.length > 0) {
                    for(const target of targets) {
                        target.jingtu_useCardAfter = 0;
                    }
                    player.removeStorage("TAFjingtu");
                }
            };
            await player.addSkill('TAFjingtu_change');
        },
        async updateShiQi(player = _status.event.player, num = 1) {
            if (num) {
                const next = game.createEvent('TAFjingtu_UpdateShiQi');
                next.num = num;
                next.player = player;
                next.setContent(async function (event, trigger, player) {
                    const num = event.num;
                    game.broadcastAll(num => {
                        _status._shenwangjingtu += num;
                        _status._shenwangjingtu = Math.max(0, _status._shenwangjingtu);
                        ui._shenwangjingtu.innerHTML = '当前士气：' + _status._shenwangjingtu;
                    }, num);
                    game.log('#y士气', '#g' + (num > 0 ? '增加了' : '下降了') + Math.abs(num) + '点');
                });
                await next;
            }
        },
        filter:function(event, player, name) {
            if(name === 'useCardAfter') {
                const target = event.player;
                const targets = player.getStorage("TAFjingtu");
                return !targets.includes(target);
            } else if(name === 'roundStart') {
                player.clearjingtuMark();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const updateShiQi = lib.skill.TAFjingtu.updateShiQi;
            if (Time === 'useCardAfter') {
                const target = trigger.player;
                if(!target.jingtu_useCardAfter) target.jingtu_useCardAfter = 0;
                target.jingtu_useCardAfter ++;
                const num = target.jingtu_useCardAfter;
                if(num <= 2) {
                    player.logSkill(event.name);
                    await updateShiQi(player,1);
                    const evt = await player.draw();
                    player.addGaintag(evt.result, "TAFjingtu_tag");
                }
                if(num >= 2) {
                    if(!player.getStorage(event.name).includes(target)) {
                        player.line(target, 'ice');
                        player.markAuto(event.name, [target]);
                    }
                }
            }
        },
        group: ["TAFjingtu_effect"],
        subSkill: {
            effect: {
                audio: "TAFjingtu",
                trigger: {
                    global: ["useCardToBefore","roundStart"]
                },
                unique:true,
                locked:false,
                direct:true,
                init: async function(player,skill) {
                    if (!player.TAFjingtu_effectused) player.TAFjingtu_effectused = [];
                },
                getcanUseList: function(event, player) {
                    const basicAndTrick = lib.inpile.filter(name => {
                        return get.type(name) === "basic" || get.type(name) === "trick";
                    });
                    let usedlist = [];
                    player.getHistory("useCard", function (evt) {
                        const name = evt.card.name;
                        const type = get.type(evt.card);
                        if (name && !usedlist.includes(name) && (type === "trick" || type === "basic")){
                            usedlist.push(name);
                        }
                    });
                    const targets = event.targets;
                    if (!targets || targets.length !== 1) return [];
                    const unusedlist = basicAndTrick.filter(name => !usedlist.includes(name) && !player.TAFjingtu_effectused.includes(name));
                    let canUselist = [];
                    for (const name of unusedlist) {
                        const vcard = {name: name, nature: ""};
                        if (event.player.canUse(vcard, targets[0], false, false) && !canUselist.includes(name)) {
                            canUselist.push(name);
                        }
                    }
                    return canUselist;
                },
                filter: function(event, player, name) {
                    if (name === 'roundStart') {
                        player.TAFjingtu_effectused = [];
                        return;
                    } else {
                        if (event.player === player) return false;
                        const cards = event.cards;
                        if (!cards || cards.length === 0) return false;
                        const targets = event.targets;
                        if (!targets || targets.length === 0) return false;
                        const type = event.card?.jingtu;
                        if (type) {
                            return event.targets && event.targets.length > 0 && !event.targets.includes(player);
                        } else {
                            const tagcards = player.getCards("hes").filter(card => card.hasGaintag("TAFjingtu_tag"));
                            const canUselist = lib.skill.TAFjingtu_effect.getcanUseList(event, player);
                            return canUselist.length > 0 && _status._shenwangjingtu >= 2 && tagcards.length > 0;
                        }
                    }
                },
                async content(event, trigger, player) {
                    const card = trigger.card;
                    const type = card.jingtu;
                    if (type) {
                        const prompt = setColor("〖净土〗：是否要成为") + get.translation(trigger.card) + setColor("的目标？");
                        const result = await player.chooseBool(prompt).set('ai', function() {
                            const effect = get.effect(player, trigger.card, player, player);
                            return effect > 0;
                        }).forResult();
                        if (result.bool) {
                            player.logSkill(event.name,trigger.player);
                            player.line(trigger.player, 'fire');
                            if (!trigger.targets.includes(player)) {
                                trigger.targets.push(player);
                            }
                        }
                    } else {
                        const canUselist = lib.skill.TAFjingtu_effect.getcanUseList(trigger, player);
                        let lists = [];
                        for (const name of canUselist) {
                            const type = get.type(name);
                            const natures = lib.inpile_nature || [];
                            if (name === "sha") {
                                lists.push([type, '', name, '']);
                                for (const nature of natures) {
                                    lists.push([type, '', name , nature]);
                                }
                            } else {
                                lists.push([type, '', name, '']);
                            }
                        }
                        if (lists.length === 0) return;
                        const prompt = setColor("〖净土〗：是否消耗两点士气值并弃置一张〖净土〗牌，更改") + 
                            get.translation(trigger.player) + "对" + get.translation(trigger.targets[0]) + "使用的" + get.translation(trigger.card) + "的效果？";
                        const chooseButton = await player.chooseButton([
                            prompt, [lists, "vcard"]
                        ]).set("ai", function (button) {
                            const target = trigger.targets[0];
                            function getValueLinks() {
                                let canUseCards = [];
                                for (const list of lists) {
                                    const Vcard = { name: list[2], nature: list[3], isCard: true, };
                                    canUseCards.push(Vcard);
                                }
                                const sortCards = canUseCards.sort((a, b) => {
                                    const effectB = get.effect(target, b, player, player);
                                    const effectA = get.effect(target, a, player, player);
                                    return effectB - effectA;
                                });
                                return sortCards[0];
                            }
                            const compareNum = get.effect(target, getValueLinks(), player, player);
                            if (compareNum > 0) {
                                return button.link[2] === getValueLinks().name && button.link[3] === getValueLinks().nature;
                            } else {
                                return false;
                            }
                        }).forResult();
                        if (chooseButton.bool) {
                            player.logSkill(event.name,trigger.player);
                            player.line(trigger.player, 'thunder');
                            const updateShiQi = lib.skill.TAFjingtu.updateShiQi;
                            await updateShiQi(player, -2);
                            await player.chooseToDiscard(1, 'hes', true, function(card) {
                                const tagcards = player.getCards("hes").filter(card => card.hasGaintag("TAFjingtu_tag"));
                                return tagcards.includes(card);
                            });
                            trigger.cancel();

                            const cardName = chooseButton.links[0][2];
                            if (!player.TAFjingtu_effectused.includes(cardName)) player.TAFjingtu_effectused.push(cardName);
                            const cardNature = chooseButton.links[0][3];
                            let Vcard = { name: cardName, nature: '', isCard: true, jingtu: true };
                            if (cardNature) Vcard.nature = cardNature;
                            
                            if (!trigger.player.getjingtuVcard) trigger.player.getjingtuVcard = {};
                            if (!trigger.player.getjingtufilter) trigger.player.getjingtufilter = {cards:[],targets:[]};
                            trigger.player.getjingtuVcard = Vcard;
                            trigger.player.getjingtufilter = {
                                cards: trigger.cards,
                                targets: trigger.targets,
                            };
                            const target = trigger.targets[0];
                            game.log(player, "将", trigger.player, "打出的", get.translation(trigger.card), "更改为", (get.translation(Vcard.nature) || "") + get.translation(Vcard.name) + "。");
                            await trigger.player.gain(trigger.cards, "gain2");
                            //console.log(trigger.player.getjingtuVcard);
                            //console.log(trigger.player.getjingtufilter);
                            const next = trigger.player.chooseToUse(true);
                            next.set("prompt",  "请将" + get.translation(trigger.card) + "当作" + (get.translation(Vcard.nature) || "") + get.translation(Vcard.name) + "对"+ get.translation(target) + "使用。");
                            next.set('norestore', true);
                            next.set('_backupevent', 'TAFjingtu_backup');
                            next.set('addCount', false);
                            next.set('custom', {
                                add: {},
                                replace: {},
                            });
                            next.backup('TAFjingtu_backup');
                            //console.log(next);
                            //debugger;

                        }
                    }
                },
                sub: true,
                sourceSkill: "TAFjingtu",
            },
            backup: {
                charlotte: true,
                filterCard: function(card, player) {
                    return player.getjingtufilter.cards.includes(card);
                },
                selectCard: function() {
                    const player = _status.event.player;
                    return player.getjingtufilter.cards.length;
                },
                position: "hes",
                viewAs: function (cards, player) {
                    return player.getjingtuVcard;
                },
                filterTarget: function(card, player, target) {
                    return player.getjingtufilter.targets.includes(target);
                },
                selectTarget: function() {
                    const player = _status.event.player;
                    return player.getjingtufilter.targets.length;
                },
                precontent: async function () {
                    const player = _status.event.player;
                    player.getjingtuVcard = {};
                    player.getjingtufilter = {cards:[],targets:[]};
                },
                log: false,
                "_priority": -25,
            },
            change: {
                trigger: {
                    global: ["TAFjingtu_UpdateShiQiEnd","dying"],
                },
                filter: function(event, player, name) {
                    if (name === 'TAFjingtu_UpdateShiQiEnd') {
                        if (!ui._shenwangjingtu_state) return false;
                        const string = ui._shenwangjingtu_state.innerHTML;
                        if (_status._shenwangjingtu >= Math.ceil(game.countGroup() / 2)) {
                            return !string.includes('神王净土');
                        } else if (_status._shenwangjingtu <= 0) {
                            return string.includes('神王净土');;
                        }
                        return false;
                    } else {
                        if (!ui._shenwangjingtu) return false;
                        if (_status._shenwangjingtu <= 0) return false;
                        const reason = event.reason;
                        if (reason && reason.card) {
                            const evt = reason.getParent();
                            const type = reason.card.jingtu;
                            const skill = reason.getParent()?.skill;
                            return evt && type && skill && skill === 'TAFjingtu_backup';
                        }
                    }
                },
                placeSkill: true,
                categories: () => ['战场技'],
                charlotte: true,
                unique: true,
                direct: true,
                silent: true,
                popup: false,
                direct:true,
                async content(event, trigger, player) {
                    const Time = event.triggername;
                    if (Time === 'TAFjingtu_UpdateShiQiEnd') {
                        const string = ui._shenwangjingtu_state.innerHTML;
                        if (_status._shenwangjingtu >= Math.ceil(game.countGroup() / 2) && !string.includes('神王净土')) {
                            if (player.checkSkins() === 'TAF_jiangtaixu') player.changeSkins(1);
                            player.$fullscreenpop('神王净土', 'fire');
                            await shenwangjingtu('神王净土');
                        } else if (_status._shenwangjingtu <= 0 && string.includes('神王净土')) {
                            if (player.checkSkins() === 'TAF_jiangtaixu1') player.changeSkins(0);
                            await shenwangjingtu();
                        }
                    } else if (Time === 'dying') {
                        const num = _status._shenwangjingtu;
                        if (num > 0) {
                            const updateShiQi = lib.skill.TAFjingtu.updateShiQi;
                            await updateShiQi(player, -num);
                        }
                    }
                },
                sub: true,
                sourceSkill: "TAFjingtu",
                "_priority": -25,
            },
        },
        "_priority": 0,
    },
    TAFjuechen: {
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "☯",
        onremove: true,
        zhuanhuanji: true,
        intro: {
            content: function(storage, player){
                const key = player.JueChen_change;
                if(key) {
                    return '阴：可以将任意张花色不同的牌当一张普通锦囊牌使用。';
                } else {
                    return '阳：可以将任意张花色相同的牌当一张智囊使用。';
                }
            },
        },
        enable:["chooseToUse","chooseToRespond"],
        unique: true,
        limited: true,
        skillAnimation: "epic",
        animationColor: "thunder",
        locked: false,
        direct: true,
        init: async function(player, skill) {
            if (!player.storage.TAFjuechen) player.storage.TAFjuechen = false;//限定技
            if (!player.JueChen_change) player.JueChen_change = false;//转换技
            if (!player.getJueChenTricks) player.getJueChenTricks = { Normal: [], Special: [] };
            /**
             * 每轮每种牌名限一次。
             */
            if (!player.getJueChenTricks_roundused) player.getJueChenTricks_roundused = [];
            await player.addSkill("TAFjuechen_clear");
            const Normaltricks = lib.inpile.filter(name => {
                return get.type(name) === "trick" && !get.zhinangs().includes(name);
            });
            const Specialtricks = get.zhinangs().filter(name => {
                return lib.inpile.includes(name);
            });
            player.getJueChenTricks.Normal = Normaltricks;
            player.getJueChenTricks.Special = Specialtricks;
            if (!player.checkJueChenCards) player.checkJueChenCards = function() {
                const cards = player.getCards("he");
                if (!cards || cards.length < 2) return false;
                const key = player.JueChen_change;
                if (key) {
                    const suits = new Set();
                    for (const card of cards) {
                        const suit = get.suit(card, player);
                        if (suit) {
                            suits.add(suit);
                            if (suits.size >= 2) {
                                return true;
                            }
                        }
                    }
                    return false;
                } else {
                    const suitCount = {};
                    for (const card of cards) {
                        const suit = get.suit(card, player);
                        if (suit) {
                            suitCount[suit] = (suitCount[suit] || 0) + 1;
                            if (suitCount[suit] >= 2) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            };
        },
        filter:function(event, player, name) {
            const filter = event.filterCard;
            const key = player.JueChen_change;
            const used = player.getJueChenTricks_roundused;
            if (key) {
                const Normaltricks = player.getJueChenTricks.Normal.filter(name => !used.includes(name));
                if (!Normaltricks.length) return false;
                for (const name of Normaltricks) {
                    const Vcard = { name: name, nature: '', isCard: true, juechen: true };
                    if (filter(get.autoViewAs(Vcard, "unsure"), player, event) && player.checkJueChenCards()) return true;
                }
                return false;
            } else {
                const Specialtricks = player.getJueChenTricks.Special.filter(name => !used.includes(name));
                if (!Specialtricks.length) return false;
                for (const name of Specialtricks) {
                    const Vcard = { name: name, nature: '', isCard: true, juechen: true };
                    if (filter(get.autoViewAs(Vcard, "unsure"), player, event) && player.checkJueChenCards()) return true;
                }
                return false;
            }
        },
        chooseButton: {
            dialog: function (event, player) {
                const filter = event.filterCard;
                const key = player.JueChen_change;
                const used = player.getJueChenTricks_roundused;
                let list = [];
                if (key) {
                    const Normaltricks = player.getJueChenTricks.Normal.filter(name => !used.includes(name));
                    for (const name of Normaltricks) {
                        const type = get.type(name);
                        const Vcard = { name: name, nature: '', isCard: true, juechen: true };
                        if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) {
                            list.push([type, '', name, '']);
                        }
                    }
                } else {
                    const Specialtricks = player.getJueChenTricks.Special.filter(name => !used.includes(name));
                    for (const name of Specialtricks) {
                        const type = get.type(name);
                        const Vcard = { name: name, nature: '', isCard: true, juechen: true };
                        if (filter(get.autoViewAs(Vcard, "unsure"), player, event)) {
                            list.push([type, '', name, '']);
                        }
                    }
                }
                const prompt = setColor("〖绝尘〗");
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
                    let bestCard = canUselist[0];
                    let highestValue = player.getUseValue(bestCard);
                    for (let card of canUselist) {
                        const useValue = player.getUseValue(card);
                        if (useValue > highestValue) {
                            highestValue = useValue;
                            bestCard = card;
                        }
                    }
                    return button.link[2] == bestCard.name && button.link[3] == bestCard.nature;
                }
            },
            backup: function (links, player) {
                return {
                    audio: "TAFjuechen",
                    popname: true,
                    filterCard: function (card, player) {
                        const suit = get.suit(card, player);
                        const selectedCards = ui.selected.cards;
                        const key = player.JueChen_change;
                        if (selectedCards.length === 0) return true;
                        if (key) {
                            const usedSuits = selectedCards.map(c => get.suit(c, player));
                            return !usedSuits.includes(suit); 
                        } else {
                            const firstSuit = get.suit(selectedCards[0], player);
                            return suit === firstSuit;
                        }
                    },
                    selectCard: [2, Infinity],
                    check: function (card) {
                        const player = get.owner(card);
                        const selectedCards = ui.selected.cards;
                        const compareNum_one = compareValue(player,'tao');
                        const compareNum_two = (compareValue(player,'tao') + compareValue(player,'shan') + compareValue(player,'jiu') + compareValue(player,'wuxie')) / 4;
                        if (selectedCards.length === 0) {
                            return get.value(card, player) < compareNum_one;
                        }
                        if (selectedCards.length === 1) {
                            return get.value(card, player) < compareNum_two;
                        }
                        if (selectedCards.length > 1) return 0;
                    },
                    position: "hes",
                    viewAs: { 
                        name: links[0][2], 
                        nature: links[0][3],
                        isCard: true,
                        juechen: true,
                    },
                    precontent: async function () {
                        player.changeZhuanhuanji("TAFjuechen");
                        const key = player.JueChen_change;
                        if (key) {
                            player.JueChen_change = false;
                        } else {
                            player.JueChen_change = true;
                        }
                        player.logSkill("TAFjuechen");
                        player.awakenSkill('TAFjuechen', true);
                    },
                    onuse: async function (result) {
                        const used = player.getJueChenTricks_roundused;
                        const card = result.card;
                        if (card) {
                            const name = card.name;
                            if(name && used && !used.includes(name)) {
                                player.getJueChenTricks_roundused.push(name);
                            }
                        }
                        //console.log(player.getJueChenTricks_roundused);
                    }
                };
            },
            prompt: function (links, player) {
                return "将任意张牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用或打出。";
            },
        },
        hiddenCard: function (player, name) {
            if (player.checkJueChenCards()) {
                const key = player.JueChen_change;
                if (key) {
                    const Normaltricks = player.getJueChenTricks.Normal;
                    for (const ccc of Normaltricks) {
                        if (name === ccc) return true;
                    }
                    return false;
                } else {
                    const Specialtricks = player.getJueChenTricks.Special;
                    for (const ccc of Specialtricks) {
                        if (name === ccc) return true;
                    }
                    return false;
                }
            }
            return false;
        },
        ai:{
            order: function (item, player) {
                let order = 0;
                if (player && _status.event.type == "phase") {
                    if (!player.checkJueChenCards()) return order;
                    let canUselist = [];
                    const key = player.JueChen_change;
                    if (key) {
                        const Normaltricks = player.getJueChenTricks.Normal;
                        for (const name of Normaltricks) {
                            const Vcard = { name: name, nature: '', isCard: true, juechen: true };
                            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                canUselist.push(Vcard);
                            }
                        }
                    } else {
                        const Specialtricks = player.getJueChenTricks.Special;
                        for (const name of Specialtricks) {
                            const Vcard = { name: name, nature: '', isCard: true, juechen: true };
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
                    const maxVorder = Math.max(...ordernumlist) * 0.95;
                    return maxVorder;
                }
                return order;
            },
            result: {
                player: function (player, target, card) {
                    if (player.awakenedSkills.includes('TAFjuechen')) return 0;
                    const cards = player.getCards("hes");
                    const targets = game.filterPlayer();
                    let getCanUseCards = [];
                    for (const c of cards) {
                        for (const target of targets) {
                            const effect = get.effect(target, c, player, player);
                            const canUse = player.canUse(c, target, true, true);
                            if (effect && effect > 0 && canUse) {
                                getCanUseCards.push(c);
                            }
                        }
                    }
                    if (getCanUseCards.length > 0) return 0;
                    const cards_he = player.getCards("he");
                    const compareNum = lib.skill.TAFjuechen.ai.order("TAFjuechen", player);
                    const compareNum_one = compareValue(player,'tao');
                    const compareNum_two = (compareValue(player,'tao') + compareValue(player,'shan') + compareValue(player,'jiu') + compareValue(player,'wuxie')) / 4;
                    const key = player.JueChen_change;
                    if (key) {
                        let getcards = [];
                        let diffSuit = [];
                        const sortedCards = cards_he.sort((a, b) => get.value(a, player) - get.value(b, player));
                        for (let i = 0; i < sortedCards.length - 1; i++) {
                            const suit = get.suit(sortedCards[i], player);
                            if (suit && !diffSuit.includes(suit)) {
                                diffSuit.push(suit);
                                getcards.push(sortedCards[i]);
                            }
                            if (getcards.length >= 2) break;
                        }
                        if (getcards.length >= 2 && get.value(getcards[0], player) < compareNum_one && get.value(getcards[1], player) < compareNum_two) {
                            return compareNum;
                        }
                        return 0;
                    } else {
                        const sameSuit = {"club": [], "spade": [], "diamond": [], "heart": []};
                        sameSuit.club = cards_he.filter(card => get.suit(card) === "club").sort((a,b) => get.value(a,player) - get.value(b,player));
                        sameSuit.spade = cards_he.filter(card => get.suit(card) === "spade").sort((a,b) => get.value(a,player) - get.value(b,player));
                        sameSuit.heart = cards_he.filter(card => get.suit(card) === "heart").sort((a,b) => get.value(a,player) - get.value(b,player));
                        sameSuit.diamond = cards_he.filter(card => get.suit(card) === "diamond").sort((a,b) => get.value(a,player) - get.value(b,player));
                        const lists = Object.keys(sameSuit);
                        for (const suit of lists) {
                            if (sameSuit[suit].length >= 2 && get.value(sameSuit[suit][0], player) < compareNum_one && get.value(sameSuit[suit][1], player) < compareNum_two) {
                                return compareNum;
                            }
                        }
                        return 0;
                    }
                },
            },
        },
        subSkill: {
            clear: {
                trigger: {
                    global: ["roundStart"],
                },
                charlotte: true,
                unique: true,
                direct: true,
                silent: true,
                popup: false,
                async content(event, trigger, player) {
                    if (!player.getJueChenTricks_roundused) player.getJueChenTricks_roundused = [];
                    player.getJueChenTricks_roundused = [];
                },
                sub: true,
                sourceSkill: "TAFjuechen",
                "_priority": -25,
            },
        },
        "_priority": 0,
    },
    TAFshenqu: {
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiOrder: function (player, card, num) {
                if (_status.currentPhase !== player || !player.getCards("hs").includes(card) || !player.storage.TAFshenqu_history) return;
                const number = get.number(card);
                if (!number) return;
                const cards_hs = player.getCards("hs");
                const hasnumbers = [...new Set(cards_hs.map(c => get.number(c)))];
                const history = player.storage.TAFshenqu_history || [];
                const cards_h = player.getCards("h");
                const targets = game.filterPlayer(o => o.isAlive());
                let sortedNumbers = [];
                if (history.length < 2) {
                    // 游戏开局阶段：根据手牌与存活角色数量关系选择递增或递减
                    if (cards_h.length - 3 <= targets.length) {
                        sortedNumbers = [...hasnumbers].sort((a, b) => a - b); // 递增
                    } else {
                        sortedNumbers = [...hasnumbers].sort((a, b) => b - a); // 递减
                    }
                } else {
                    const [prev, curr] = history.slice(-2);
                    if (prev < curr) { // 递增趋势
                        const isPositiveGain = cards_h.length - 1 <= targets.length;
                        if (isPositiveGain) {
                            const greaterNumbers = hasnumbers.filter(num => num > curr);
                            if (greaterNumbers.length > 0) {
                                sortedNumbers = [...greaterNumbers].sort((a, b) => a - b); // 继续递增
                                //console.log('已存在连续两次递增，继续递增为正收益：且有继续递增的点数牌可使用',[prev, curr], sortedNumbers);
                            } else {
                                sortedNumbers = [...hasnumbers].sort((a, b) => b - a); // 切换递减
                                //console.log('已存在连续两次递增，继续递增为正收益：但无法继续递增，开始尝试递减趋势',[prev, curr], sortedNumbers);
                            }
                        } else {
                            sortedNumbers = [...hasnumbers].sort((a, b) => b - a); // 手牌过多，尝试递减
                            //console.log('已存在连续两次递增，继续递增为负收益：开始尝试递减趋势',[prev, curr], sortedNumbers);
                        }
                    } else if (prev > curr) { // 递减趋势
                        const lessNumbers = hasnumbers.filter(num => num < curr);
                        if (lessNumbers.length > 0) {
                            sortedNumbers = [...lessNumbers].sort((a, b) => b - a); // 继续递减
                            //console.log('已存在连续两次递减，继续递减为正收益：且有继续递减的点数牌可使用',[prev, curr], sortedNumbers);
                        } else {
                            sortedNumbers = [...hasnumbers].sort((a, b) => a - b); // 切换递增
                            //console.log('已存在连续两次递减，继续递减为负收益：但无法继续递减，开始尝试递增趋势',[prev, curr], sortedNumbers);
                        }
                    }
                }
                const index = sortedNumbers.indexOf(number);
                if (index === -1) return num;//卡牌点数不在列表中返回默认值。
                const weight = 2;
                return num * (sortedNumbers.length - index) * weight;
            },
        },
        trigger:{
            player:["useCard","phaseDrawBegin2"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            if (!player.storage.TAFshenqu_history) player.storage.TAFshenqu_history = [];
        },
        filter:function(event, player, name) {
            if (name == "useCard") {
                return true;
            } else {
                return !event.numFixed;
            }
        },
        restoreSkill: function(event, trigger, player) {
            let tags = ["TAFshenqu_tag"];
            player.hasHistory("lose", function (evt) {
                if (evt.getParent() != trigger) return false;
                for (const i in evt.gaintag_map) {
                    tags.removeArray(evt.gaintag_map[i]);
                }
                return tags.length == 0;
            });
            if (!tags.includes("TAFshenqu_tag") && player.awakenedSkills.includes('TAFjuechen')) {
                player.logSkill(event.name);
                player.restoreSkill('TAFjuechen');
                game.log(player, "恢复了技能", '#g【' +  get.translation("TAFjuechen") + '】');
                //debugger;
            }
        },
        changeCardsOrDiscard: async function(event, trigger, player) {
            if(_status.currentPhase !== player) return;
            let count = 0;
            const card = trigger.card;
            const number = get.number(card);
            if (number) {
                count = number;
            } else {
                const cards = trigger.cards;
                if (cards && cards.length > 0) {
                    for (const c of cards) {
                        const num = get.number(c);
                        if (num) {
                            count += num;
                        }
                    }
                } else {
                    count = 0;
                }
            }
            const history = player.storage.TAFshenqu_history;
            history.push(count);
            if (history.length > 3) history.shift();
            if (history.length === 3) {
                const [a, b, c] = history;
                const isIncreasing = a < b && b < c;
                const isDecreasing = a > b && b > c;
                if (isIncreasing) {
                    game.log(player, '满足连续三次递增');
                    player.logSkill(event.name);
                    const targets = game.filterPlayer(O => O.isAlive());
                    if (targets.length) await changeCardsTo(player,targets.length);
                    return;
                } else if (isDecreasing) {
                    game.log(player, '满足连续三次递减');
                    const targets = game.filterPlayer(O => O.isAlive() && O !== player);
                    if (targets.length) {
                        player.logSkill(event.name, targets);
                        for (const target of targets.sortBySeat(player)) {
                            player.line(target, 'fire');
                            const cards = target.getDiscardableCards(target, "h");
                            if (cards.length > 0) {
                                 await target.chooseToDiscard(1, 'h', true);
                            }
                        }
                    }
                    return;
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseDrawBegin2") {
                trigger.cancel();
                const gainCards = await player.gainCardsSuits(3);
                if (gainCards.length > 0) {
                    player.logSkill(event.name);
                    player.addGaintag(gainCards, "TAFshenqu_tag");
                }
                const tagcards = player.getCards("hes").filter(card => card.hasGaintag("TAFjingtu_tag"));
                if (tagcards.length > 0) {
                    await player.discard(tagcards);
                    const evt = await player.draw();
                    player.addGaintag(evt.result, "TAFshenqu_tag");
                }
            } else if (Time == "useCard") {
                const restoreSkill = lib.skill.TAFshenqu.restoreSkill;
                await restoreSkill(event, trigger, player);
                const changeCardsOrDiscard = lib.skill.TAFshenqu.changeCardsOrDiscard;
                await changeCardsOrDiscard(event, trigger, player);
            }
        },
        ai:{
            threaten: function(player, target) {

            },
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player: function(card, player, target) {
                    const cards = card.cards;
                    if (!cards || cards.length == 0) return;
                    const number = get.number(card);
                    if(!number) return;
                    if (_status.currentPhase !== player) return;
                    const cards_hs = player.getCards("hs");
                    const hasnumbers = [...new Set(cards_hs.map(c => get.number(c)))];
                    const history = player.storage.TAFshenqu_history || [];
                    const cards_h = player.getCards("h");
                    const targets = game.filterPlayer(o => o.isAlive());
                    let sortedNumbers = [];
                    if (history.length < 2) {
                        if (cards_h.length - 3 <= targets.length) {
                            sortedNumbers = [...hasnumbers].sort((a, b) => a - b); // 递增
                        } else {
                            sortedNumbers = [...hasnumbers].sort((a, b) => b - a); // 递减
                        }
                    } else {
                        const [prev, curr] = history.slice(-2);
                        if (prev < curr) { // 递增趋势
                            const isPositiveGain = cards_h.length - 1 <= targets.length;
                            if (isPositiveGain) {
                                const greaterNumbers = hasnumbers.filter(num => num > curr);
                                if (greaterNumbers.length > 0) {
                                    sortedNumbers = [...greaterNumbers].sort((a, b) => a - b); // 继续递增
                                    //console.log('已存在连续两次递增，继续递增为正收益：且有继续递增的点数牌可使用',[prev, curr], sortedNumbers);
                                } else {
                                    sortedNumbers = [...hasnumbers].sort((a, b) => b - a); // 切换递减
                                    //console.log('已存在连续两次递增，继续递增为正收益：但无法继续递增，开始尝试递减趋势',[prev, curr], sortedNumbers);
                                }
                            } else {
                                sortedNumbers = [...hasnumbers].sort((a, b) => b - a); // 手牌过多，尝试递减
                                //console.log('已存在连续两次递增，继续递增为负收益：开始尝试递减趋势',[prev, curr], sortedNumbers);
                            }
                        } else if (prev > curr) { // 递减趋势
                            const lessNumbers = hasnumbers.filter(num => num < curr);
                            if (lessNumbers.length > 0) {
                                sortedNumbers = [...lessNumbers].sort((a, b) => b - a); // 继续递减
                                //console.log('已存在连续两次递减，继续递减为正收益：且有继续递减的点数牌可使用',[prev, curr], sortedNumbers);
                            } else {
                                sortedNumbers = [...hasnumbers].sort((a, b) => a - b); // 切换递增
                                //console.log('已存在连续两次递减，继续递减为负收益：但无法继续递减，开始尝试递增趋势',[prev, curr], sortedNumbers);
                            }
                        }
                    }
                    const index = sortedNumbers.indexOf(number);
                    if (index === -1) return;
                    const compareNum = Math.min(2, sortedNumbers.length - index);
                    const num = Math.max(1, compareNum);
                    //console.log(sortedNumbers,'AI：', card, '点数', number, '权重', num);
                    return [1, num];
                },
            }
        },
        "_priority": 0,
    },
    //天启星魂
    TAFtianci: {
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["phaseBegin","phaseEnd","damageBegin4"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {

        },
        filter:function(event, player, name) {
            return true;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseBegin") {
                player.damage(1, "thunder", 'nocard', "nosource");
            } else if (Time == "phaseEnd") {
                player.damage(1, "fire", 'nocard', "nosource");
            } else if (Time == "damageBegin4") {
                const card = trigger.card;
                const cards = trigger.cards;
                const color = get.color(card);
                if (!card || !cards || cards.length == 0 || !color) {
                    trigger.cancel();
                    player.logSkill(event.name);
                    game.log(player, "取消了本次伤害！");
                } else {
                    if (color == "black") {
                        if (trigger.nature !== 'thunder') {
                            player.logSkill(event.name);
                            trigger.nature = 'thunder';
                        }
                    } else if (color == "red") {
                        if (trigger.nature !== 'fire') {
                            player.logSkill(event.name);
                            trigger.nature = 'fire';
                        }
                    } else {
                        player.logSkill(event.name);
                        trigger.cancel();
                        game.log(player, "取消了本次伤害！");
                    }
                }
            }
        },
        "_priority": 0,
    },
    TAFxingqi: {
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "☯",
        onremove: true,
        zhuanhuanji: true,
        intro:{
            content:function(storage, player) {
                const key = player.storage.TAFxingqi;
                if (key) {
                    return '阴，受到火属性伤害时，从弃牌堆中获得一张黑色牌，然后将一张黑色牌当作乐不思蜀置入判定区。';
                } else {
                    return '阳，受到雷属性伤害时，从牌堆中获得一张红色牌，然后将一张红色牌当作兵粮寸断置入判定区。';
                }
            },
            name:"<font color= #EE9A00>星启</font>",
        },
        trigger:{
            player:["damageBefore"],
        },
        unique:true,
        locked:false,
        direct:true,
        init: async function(player, skill) {
            if (!player.storage.TAFxingqi) player.storage.TAFxingqi = false;
            if (!player.getXingqiCards) player.getXingqiCards = async function () {
                const key = player.storage.TAFxingqi;
                const pile = key ? ui.discardPile : ui.cardPile;
                const targetColor = key ? "black" : "red";
                const gainCards = [];
                for (const card of pile.childNodes) {
                    if (get.color(card) === targetColor) {
                        gainCards.push(card);
                        break;
                    }
                }
                return gainCards;
            };
        },
        filter:function(event, player, name) {
            if(player.isDisabledJudge()) return false;
            const key = player.storage.TAFxingqi;
            const skillkey = player.hasSkill("TAFtianci");
            const cardkey = event.card && get.color(event.card);
            if (key) {
                if (event.hasNature('fire')) return true;
                if (skillkey && cardkey) {
                    return get.color(event.card) == "red";
                }
                return false;
            } else {
                if (event.hasNature('thunder')) return true;
                if (skillkey && cardkey) {
                    return get.color(event.card) == "black";
                }
                return false;
            }
        },
        async content(event, trigger, player) {
            const key = player.storage.TAFxingqi;
            let prompt = setColor('〖星启〗：');
            if (key) {
                prompt += '是否要从弃牌堆中获得一张黑色牌，然后将一张黑色牌当作乐不思蜀置入判定区？';
            } else {
                prompt += '是否要从牌堆中获得一张红色牌，然后将一张红色牌当作兵粮寸断置入判定区？';
            }
            const result = await player.chooseBool(prompt).set('ai', function() {
                if (key) {//就这样吧
                    return true;
                } else {
                    return true;
                }
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name);
                const cards = await player.getXingqiCards();
                if (cards.length > 0) {
                    await player.gain(cards, 'gain2');
                }
                const hecards = player.getCards("he");
                let prompt_1 = setColor('〖星启〗：');
                if (key) {
                    const blacks = hecards.filter(card => get.color(card) == "black");
                    if (!blacks || blacks.length == 0) return;
                    prompt_1 += '请将一张黑色牌当作乐不思蜀置入判定区。';
                } else {
                    const reds = hecards.filter(card => get.color(card) == "red");
                    if (!reds || reds.length == 0) return;
                    prompt_1 += '请将一张红色牌当作兵粮寸断置入判定区。';
                }
                const next = player.chooseToUse(true);
                next.set("prompt",  prompt_1);
                next.set('norestore', true);
                next.set('_backupevent', 'TAFxingqi_backup');
                next.set('addCount', false);
                next.set('custom', {
                    add: {},
                    replace: {},
                });
                next.backup('TAFxingqi_backup');
            }
        },
        ai:{
            threaten: 1.5,
            effect: {
                target: function(card, player, target) {

                },
            }
        },
        subSkill: {
            backup: {
                charlotte: true,
                filterCard: function(card, player) {
                    const key = player.storage.TAFxingqi;
                    if (key) {
                        return get.color(card) == "black";
                    } else {
                        return get.color(card) == "red";
                    }
                },
                selectCard: 1,
                position: "he",
                viewAs: function (cards, player) {
                    const key = player.storage.TAFxingqi;
                    if (key) {
                        return { name: "lebu", nature: "", isCard: true, xingqi: true };
                    } else {
                        return { name: "bingliang", nature: "", isCard: true, xingqi: true };
                    }
                },
                filterTarget: function(card, player, target) {
                    return target == player;
                },
                selectTarget: 1,
                check: function(card) {
                    const player = _status.event.player;
                    const cards = player.getCards("he");
                    const key = player.storage.TAFxingqi;
                    if (key) {
                        const blacks = cards.filter(card => get.color(card) == "black").sort((a, b) => get.value(a, player) - get.value(b, player));
                        return get.value(card, player) === get.value(blacks[0], player);
                    } else {
                        const reds = cards.filter(card => get.color(card) == "red").sort((a, b) => get.value(a, player) - get.value(b, player));
                        return get.value(card, player) === get.value(reds[0], player);
                    }
                },
                precontent: async function () {
                    const player = _status.event.player;
                    if (!player.hasSkill("TAFxingqi")) return;
                    player.changeZhuanhuanji("TAFxingqi");
                },
                log: false,
                sub: true,
                sourceSkill: "TAFxingqi",
                "_priority": -25,
            },
        },
        "_priority": 1314,
    },
    TAFxingpan: {
        audio:"ext:银竹离火/audio/skill:4",
        mark: true,
        marktext: "<font color= #EE9A00>星盘</font>",
        onremove: function (player, skill) {
            const cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro: {
            content: "expansion",
            markcount: "expansion",
            name: "<font color= #EE9A00>星盘</font>",
        },
        mod: {
            aiValue: function(player, card, num) {
                const type = get.type(card,player);
                if (type && type == "delay") return 1.5;
                else return num;
            },
        },
        trigger:{
            player:["judgeEnd"],
            global:["phaseBegin","phaseEnd"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {

        },
        filter:function(event, player, name) {
            if(name == "judgeEnd") {
                return true;
            } else {
                return event.player !== player && player.getCards('j').length > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "judgeEnd") {
                console.log("judgeEnd",_status);
                const result = trigger.result;
                if (result.bool) {
                    const color = result.color;
                    if (color === "black") {
                        const cards = await player.specifyCards("red", 2);
                        if (cards.length > 0) {
                            player.logSkill(event.name);
                            await player.addToExpansion(cards, 'giveAuto', player).set('gaintag',['TAFxingpan']);
                        }
                    } else if (color === "red") {
                        const cards = await player.specifyCards("black", 2);
                        if (cards.length > 0) {
                            player.logSkill(event.name);
                            await player.addToExpansion(cards, 'giveAuto', player).set('gaintag',['TAFxingpan']);
                        }
                    }
                } else {
                    player.recover();
                    const cards = trigger.orderingCards;
                    if (cards.length > 0) {
                        await player.gain(cards, 'gain2');
                        player.logSkill(event.name);
                        await player.addToExpansion(cards, 'giveAuto', player).set('gaintag',['TAFxingpan']);
                    }
                }
                const setlist = ['phaseDraw','phaseUse'];
                player.skipList = player.skipList.filter(o => !setlist.includes(o));
            } else {
                player.logSkill(event.name);
                const next = player.phaseJudge();
                event.next.remove(next);
                trigger.next.push(next);
            }
        },
        ai:{
            threaten: 1.5,
            effect: {
                target: function(card, player, target) {
                    const type = get.type(card);
                    if (type && type == "delay") {
                        return [1, 3];
                    }
                },
            }
        },
        group: ["TAFxingpan_change"],
        subSkill: {
            change: {
                trigger:{
                    player:["TAFxingpanAfter"],
                },
                charlotte: true,
                unique: true,
                firstDo: true,
                direct:true,
                filter:function(event, player, name) {
                    return player.getExpansions('TAFxingpan').length >= 4;
                },
                async content(event, trigger, player) {
                    await changeCharacter(player, "TAF_tongyu_shadow", "TAFxingpan");
                    ///debugger;
                },
                sub: true,
                sourceSkill: "TAFxingqi",
                "_priority": -25,
            },
        },
        "_priority": 1314,
    },
    TAFshuangjiang: {
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            source:["damageBegin4"],
            player:["damageBegin4"],
        },
        unique:true,
        forced:true,
        init: async function(player, skill) {

        },
        filter:function(event, player, name) {
            return true;
        },
        async content(event, trigger, player) {
            trigger.nature = 'ice';
            await changeCardsTo(player, 4);
        },
        ai:{
            effect: {
                player: function(card, player, target) {
                    const damage = get.tag(card, "damage");
                    if (damage && damage >= 1 && player !== target) {
                        const att = get.attitude(player, target);
                        if (target.hasSkillTag("nodamage", false, player)) return 0;
                        if (target.hasSkillTag("natureDamage", false, player)) return 0;
                        if (target.hasSkillTag("iceDamage", false, player)) return 0;
                        const equipcard = target.getEquip(2);
                        if (equipcard && get.name(equipcard) == "tengjia" && att < 2) return [1, 1];
                    }
                },
            }
        },
        "_priority": 1314,
    },
    TAFxuewu: {
        audio:"ext:银竹离火/audio/skill:4",
        mark: true,
        marktext: "<font color= #EE9A00>雪舞</font>",
        onremove: true,
        intro: {
            name: "<font color= #EE9A00>雪舞</font>",
            onunmark: true,
            mark: function(dialog, storage, player) {
                let result = "已使用的花色：";
                const usedsuits = player.TAFxuewu_usedsuits || [];
                if (usedsuits.length > 0) {
                    result += usedsuits.map(suit => get.translation(suit)).join('、');
                } else {
                    result += "无";
                }
                dialog.addText(result);
            },
            markcount: function(storage, player) {
                const usedsuits = player.TAFxuewu_usedsuits || [];
                return usedsuits.length;
            },
        },
        trigger:{
            player: ["useCardAfter","respondAfter"],
            global: ["phaseAfter"],
        },
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            if (!player.TAFxuewu_usedsuits) player.TAFxuewu_usedsuits = [];
        },
        filter:function(event, player, name) {
            if(!player.hasSkill("TAFxingpan_shadow")) return false;
            if(name == "phaseAfter") {
                player.TAFxuewu_usedsuits = [];
                return;
            } else {
                const setsuits = ['spade', 'heart', 'club', 'diamond'];
                const cardsuit = get.suit(event.card);
                if (!cardsuit) return false;
                if (!setsuits.includes(cardsuit)) return false;
                const usedsuits = player.TAFxuewu_usedsuits || [];
                if (usedsuits.includes(cardsuit)) return false;
                return player.getExpansions('TAFxingpan_shadow').length > 0 || player.getCards('h').length > 0;
            }
        },
        async content(event, trigger, player) {
            const suit = get.suit(trigger.card);
            const usedsuits = player.TAFxuewu_usedsuits || [];
            const prompt1 = setColor('〖雪舞〗：已使用花色：') + usedsuits.map(suit => get.translation(suit)).join('、');
            const prompt2 = setColor('〖雪舞〗：每回合每种花色限一次，是否要调转手牌区与星盘区的牌？');
            const result = await player.chooseBool(prompt1 + '<br>' + prompt2).set('ai', function() {
                const cards = player.getCards('h');
                const targets = game.filterPlayer();
                let effectTS = [];
                let effectCS = [];
                for (const target of targets) {
                    for (const card of cards) {
                        const effect = get.effect(target, card, player, player);
                        const canUse = player.canUse(card, target);
                        if (effect && effect > 0 && canUse) {
                            effectTS.push(target);
                            effectCS.push(card);
                        }
                    }
                }
                const valueCards = cards.filter(card => get.value(card, player) >= compareValue(player, 'tao'));
                return effectTS.length === 0 || effectCS.length === 0 || (valueCards.length === 0 && cards.length <= 4);
            }).forResult();
            if (result.bool) {
                player.logSkill(event.name);
                if (!player.TAFxuewu_usedsuits.includes(suit)) player.TAFxuewu_usedsuits.push(suit);
                const cards1 = player.getCards('h');
                const cards2 = player.getExpansions('TAFxingpan_shadow');
                if (cards2.length > 0) {
                    await player.gain(cards2, 'gain2');
                }
                if (cards1.length > 0) {
                    await player.addToExpansion(cards1, 'giveAuto', player).set('gaintag',['TAFxingpan_shadow']);
                }
            }
        },
        ai:{
            threaten: 1.5,
            effect: {
                target: function(card, player, target) {

                },
            }
        },
        "_priority": 1314,
    },
    TAFxingpan_shadow: {
        audio:"ext:银竹离火/audio/skill:4",
        mark: true,
        marktext: "<font color= #EE9A00>星盘</font>",
        onremove: function (player, skill) {
            const cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro: {
            content: "expansion",
            markcount: "expansion",
            name: "<font color= #EE9A00>星盘</font>",
        },
        trigger:{
            player: ["dying"],
            global: ["loseAfter","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
        },
        persevereSkill: true,
        unique:true,
        locked:false,
        direct:true,
        init: async function(player, skill) {
            if (!player.setXingpanSuits) player.setXingpanSuits = ['spade', 'heart', 'club', 'diamond'];
            if (!player.checkXingpan) player.checkXingpan = function (check = 'suit') {
                if (check === 'suit') {
                    const lists = player.getExpansions('TAFxingpan_shadow');
                    if (lists.length === 0) return player.setXingpanSuits;
                    const missingSuits = lists.filter(o => {
                        const suit = get.suit(o);
                        return suit && !player.setXingpanSuits.includes(suit);
                    });
                    let getSuits = []; 
                    const piles = ["cardPile", "discardPile"];
                    for (const pile of piles) {
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const suit = get.suit(card);
                            if(missingSuits.includes(suit) && !getSuits.includes(suit)) {
                                getSuits.push(suit);
                            }
                        }
                    }
                    return getSuits;//进一步过滤避免那种阴间摸光牌堆的畜生！
                } else if (check === 'card') {
                    const lists = player.getExpansions('TAFxingpan_shadow');
                    if (lists.length <= 1) return [];
                    let repeatCards = [];
                    const suitGroups = {};
                    for (let i = 0; i < lists.length; i++) {
                        const card = lists[i];
                        const suit = get.suit(card);
                        if (suit) {
                            if (!suitGroups[suit]) {
                                suitGroups[suit] = [];
                            }
                            suitGroups[suit].push(card);
                        }
                    }
                    for (const suit in suitGroups) {
                        const cards = suitGroups[suit];
                        if (cards.length > 1) {
                            const keepCard = cards[Math.floor(Math.random() * cards.length)];
                            for (let j = 0; j < cards.length; j++) {
                                if (cards[j] !== keepCard) {
                                    repeatCards.push(cards[j]);
                                }
                            }
                        }
                    }
                    return repeatCards;
                }
            };
        },
        filter:function(event, player, name) {
            if(name == "dying") {
                return player.setXingpanSuits.length > 0;
            } else {
                const missingSuits = player.checkXingpan('suit');
                const repeatCards = player.checkXingpan('card');
                return missingSuits.length > 0 || repeatCards.length > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "dying") {
                let lists = [];
                const suitlists = player.setXingpanSuits;
                lists = [...suitlists, 'cancel2'];
                const prompt = setColor("〖星盘〗：是否选择永久移除一种花色，并将体力值调整至一点，然后退出本阶段？");
                const result = await player.chooseControl(lists).set('prompt', prompt).set ("ai", control => {
                    const friends = getFriends(player);
                    let canSaveCard = [];
                    for (const friend of friends) {
                        const cards = friend.getCards('hes');
                        for (const card of cards) {
                            const key = friend.canSaveCard(card, player);
                            if (key && !canSaveCard.includes(card)) {
                                canSaveCard.push(card);
                            }
                        }
                    }
                    if (canSaveCard.length > 0) return 'cancel2';
                    if (lists.includes('club')) return 'club';
                    if (lists.includes('spade')) return 'spade';
                    if (lists.includes('diamond')) return 'diamond';
                    if (lists.includes('heart')) return 'heart';
                }).forResult();
                if (result.control !== 'cancel2') {
                    player.setXingpanSuits = player.setXingpanSuits.filter(suit => suit!== result.control);
                    await player.recoverTo(1);
                    game.log(player,'发动了技能', '#g【星盘】', '选择永久移除了', result.control, '。');
                    await changeCharacter(player, "TAF_tongyu", "TAFxingpan_shadow");
                }
            } else {
                const missingSuits = player.checkXingpan('suit');
                if (missingSuits && missingSuits.length > 0) {
                    let gainCards = [];
                    let getSuits = [];
                    const missingSuits = player.checkXingpan();
                    if (missingSuits.length > 0) {
                        const piles = ["cardPile", "discardPile"];
                        for (const pile of piles) {
                            const cards = ui[pile].childNodes;
                            for (const card of cards) {
                                const suit = get.suit(card);
                                if(missingSuits.includes(suit) && !getSuits.includes(suit)) {
                                    gainCards.push(card);
                                    getSuits.push(suit);
                                }
                            }
                        }
                    }
                    if (gainCards.length > 0) {
                        player.logSkill(event.name);
                        await player.addToExpansion(gainCards, 'giveAuto', player).set('gaintag',['TAFxingpan_shadow']);
                    }
                }
                const repeatCards = player.checkXingpan('card');
                if (repeatCards && repeatCards.length > 0) {
                    player.logSkill(event.name);
                    await player.loseToDiscardpile(repeatCards);
                }
            }
        },
        "_priority": 0,
    },
    TAFfanzhuan: {
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            judge: function(player, result) {
                if (result.bool == false) result.bool = true;
                else result.bool = false;
            },
        },
        persevereSkill: true,
        unique:true,
        locked:true,
        direct:true,
        init: async function(player, skill) {
            await initfanzhuan(player, skill);
        },
        ai:{
            effect: {
                target: function(card, player, target) {
                    if (get.type(card) == "delay") {
                        if (card.name == "shandian") return [1, -2];
                        else return 0.5;
                    }
                },   
            }
        },
        "_priority": 0,
    },
};
export default TAF_shenhuaSkills;
