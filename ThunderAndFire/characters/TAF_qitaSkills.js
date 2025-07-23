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
const { icelongdui } = asyncs.qun.TAF_qt_SEzhugeliang;//躬耕南阳诸葛亮
/** @type { importCharacterConfig['skill'] } */
const TAF_qitaSkills = {
    //SE孙鲁班
    waterjiaoman: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #48D1CC>权欲</font>",
        onremove:true,
        intro:{
            content:function(storage, player) {
                let nummark = player.countMark('waterjiaoman');
                return '<font color= #48D1CC>当前权欲值：</font>' + nummark;
            },
            name:"<font color= #48D1CC>权欲</font>",
        },
        trigger: {
            global: [
                "gainEnd","loseAsyncEnd",
                "loseAfter","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter",
                "damageAfter",
            ],
        },
        async init(player, skill) {
            player.logSkill('waterjiaoman');
            await get.info('waterjiaoman').updateMark(player,get.info('waterjiaoman').quanyuBegin);
        },
        one:["gainEnd","loseAsyncEnd"],
        two:["loseAfter","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
        three:["damageAfter"],
        quanyuBegin:15,
        quanyuMax:99,
        forced:true,
        async updateMark(player,num){
            const maxNum = get.info('waterjiaoman').quanyuMax;
            const markNum = player.countMark('waterjiaoman');
            if(markNum >= maxNum || typeof num!== 'number' || num <= 0) return 0;
            const addNum = Math.min(num,maxNum-markNum);
            player.addMark('waterjiaoman',Math.min(num,maxNum-markNum));
            return addNum;
        },
        filter: function(event, player, name) {
            if(player.countMark('waterjiaoman') >= get.info('waterjiaoman').quanyuMax) return false;
            if(this.one.includes(name)) {
                const cards = event.getg(player);
                return cards && cards.length > 0;
            } else if(this.two.includes(name)) {
                const evt = event?.getl(player);
                return evt && evt.es && evt.es.length > 0;
            } else if(this.three.includes(name)) {
                const card = event.card;
                const cards = event.cards;
                if(card || cards || cards.length > 0) return false;
                return event.num && event.num > 0;
            }
            return false;
        },
        derivation:["waterzenhui","waterxieming","waterfuxiong","waterzhanqing","waterjiaoman_FAQ"],
        async content(event, trigger, player) {
            const Time = event.triggername;
            const {one, two, three, updateMark} = get.info('waterjiaoman');
            if(one.includes(Time)) {
                await updateMark(player,10);
            } else if(two.includes(Time)) {
                await updateMark(player,15);
            } else if(three.includes(Time)) {
                await updateMark(player,20);
            }
            const nummark = player.countMark('waterjiaoman');
            if(nummark >= 25) {
                if(!player.hasSkill('waterzenhui')) player.addSkill('waterzenhui');
            }
            if(nummark >= 50) {
                if(!player.hasSkill('waterxieming')) player.addSkill('waterxieming');
            }
            if(nummark >= 75) {
                if(!player.hasSkill('waterfuxiong')) player.addSkill('waterfuxiong');
            }
            if(nummark >= 99) {
                if(!player.hasSkill('waterzhanqing')) player.addSkill('waterzhanqing');
            }
            /*
            const targets = get.info('waterfuxiong').setUsefuxiong(player);
            console.log(targets);
            debugger;
            function getlinksNum () {
                let links = [];
                if (player.countSkills().length > 0) links.push(0);
                if (game.filterPlayer(o => o.isIn() && o.getCards('h').length > 0 && o !== player).length > 0) links.push(1);
                return links;
            }
            function getValueLinks() {
                const links = getlinksNum();
                if (links.length === 0) return -1;
                const getskills = player.countSkills();
                if(getskills.includes('waterzhanqing') && player.waterzhanqing_guanghuan) return 0;
                const setSkills = ["waterjiaoman","waterzenhui","waterxieming","waterfuxiong","waterzhanqing"];
                const otherSkills = getskills.filter(skill=> !setSkills.includes(skill));
                if(otherSkills && otherSkills.length > 0) return 0;
                if(links.includes(1)) return 1;
                return -1;
            }
            console.log(getValueLinks());
            debugger;
            */
        },
        "_priority": 0,
    },
    waterjiaoman_FAQ: {
        superCharlotte: true,
        charlotte: true,
        unique: true,
        "_priority": 0,
    },
    waterzenhui: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player:['phaseUseBegin'],
        },
        async init(player, skill) {

        },
        locked: false,
        async getyishi(player){
            const map = { no:[], yes:[] };
            const canyishis = game.filterPlayer(o => o.isIn() && o.getCards('he').length > 0).sortBySeat(player);
            const getnos = game.filterPlayer().filter(o => !canyishis.includes(o));
            let getyishis = [];
            for(const target of canyishis) {
                const prompt = setColor("〖谮毁〗：是否参与议事？");
                const result = await target.chooseBool(prompt).set('ai', function() {
                    if(target.hasSkill('waterzenhui')) return true;
                    return Math.random() < 0.85;
                }).forResult();
                if (result.bool) {
                    target.chat('我选择参与〖议事〗。')
                    getyishis.push(target);
                } else {
                    target.chat('不参与！！！')
                }
            }
            const others = canyishis.filter(o => o.isIn() &&!getyishis.includes(o));
            map.no = getnos.concat(others);
            map.yes = getyishis;
            return map;
        },
        filter: function(event, player, name) {
            if(!player.hasSkill('waterjiaoman')) return false;
            if(player.countMark('waterjiaoman') < 25) return false;
            return game.filterPlayer(o => o.isIn() && o.getCards('he').length > 0);
        },
        async cost(event, trigger, player) {
            const {no,yes} = await get.info('waterzenhui').getyishi(player);
            if(yes.length > 0) {
                const { result } = await player.chooseToDebate(yes);
                if(result && result.opinion && typeof result.opinion === "string") {
                    event.result = {
                        bool: true,
                        cost_data: {
                            color: result.opinion,
                            targets: result.targets,
                            others: no,
                        }
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const { color, targets, others } = event.cost_data;
            let prompt;
            const red = color && color === "red" && others && others.length > 0;
            const black = color && color === "black" && targets && targets.length > 0;
            if(red) {
                prompt = setColor("〖谮毁〗：是否选择一名未进行议事的角色，对其造成两点伤害？");
            } else if(black) {
                await player.draw(3);
                prompt = setColor("〖谮毁〗：是否选择一名已进行议事的角色，令其非锁定技失效直到你的回合结束？");
            }
            if(red || black) {
                const resultTarget = await player.chooseTarget(prompt, 1, function (card, player, target) {
                    if(red) {
                        return others.includes(target);
                    } else if(black) {
                        return targets.includes(target);
                    }
                    return false;
                }).set('ai', function (target) {
                    if(red) {
                        return get.damageEffect(target, player, player, "damage") > 0;
                    } else if(black) {
                        return get.attitude(player, target) < 2;
                    }
                    return false;
                }).set(/*'forced', true*/).forResult();
                if (resultTarget.bool) {
                    const target = resultTarget.targets[0];
                    if(red) {
                        player.line(target, "fire");
                        await target.damage(2, 'nocard', player);
                    } else if(black) {
                        player.line(target, "thunder");
                        await target.addTempSkill('fengyin');
                    }
                }
            }
        },
        group: "waterzenhui_debate",
        subSkill: {
            debate: {
                audio: "waterzenhui",
                trigger: {
                    global: "debateShowOpinion",
                },
                filter(event, player) {
                    return event.targets.includes(player) && event.opinions.some(i => event[i].flat().includes(player));
                },
                forced: true,
                locked: false,
                content() {
                    const ops = trigger.opinions.filter(i => trigger[i].flat().includes(player));
                    for (const op of ops) {
                        for (const list of trigger[op]) {
                            if (list[0] === player) {
                                const color = typeof list[1] == "string" ? list[1] : get.color(list[1], list[0]);
                                trigger[op].push([player, color]);
                                game.log(player, "的", "#g" + get.translation(color) + "意见+1");
                                break;
                            }
                        }
                    }
                },
                sub: true,
                sourceSkill: "waterzenhui",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    waterxieming: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player:['phaseEnd','damageEnd'],
        },
        locked: false,
        async init(player, skill) {
            if(!player.waterfuxiong) player.waterfuxiong = { usedChars: [], nowChars: [], usedSkills: [] };
        },
        filter: function(event, player) {
            if(!player.hasSkill('waterjiaoman')) return false;
            if(player.countMark('waterjiaoman') < 50) return false;
            return player.countSkills().length > 0 || game.filterPlayer(o => o.isIn() && o.getCards('h').length > 0 && o !== player).length > 0;
        },
        async cost(event, trigger, player) {
            const getshowNums = [];
            const lists = [
                setColor("〖选项一〗：失去武将牌上一个技能并摸两张牌展示之。"),
                setColor("〖选项二〗：选择一名其他角色与你各展示一张手牌。"),
                setColor("若如此做：你可弃置一名角色区域内一张牌其摸一张牌，若此牌点数处于展示牌点数之间/之外，随机装备一张装备牌/随机获得一张与之点数相同的牌。"),
            ];
            const prompt = setColor("〖挟名〗：请选择执行项：");
            const result = await player.chooseButton([prompt,
                [lists.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    return player.countSkills().length > 0;
                } else if (button.link === 1) {
                    return game.filterPlayer(o => o.isIn() && o.getCards('h').length > 0 && o !== player).length > 0;
                } else if (button.link === 2) {
                    return false;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                    function getlinksNum () {
                        let links = [];
                        if (player.countSkills().length > 0) links.push(0);
                        if (game.filterPlayer(o => o.isIn() && o.getCards('h').length > 0 && o !== player).length > 0) links.push(1);
                        return links;
                    }
                    function getValueLinks() {
                        const links = getlinksNum();
                        if (links.length === 0) return -1;
                        const getskills = player.countSkills();
                        if(getskills.includes('waterzhanqing') && player.waterzhanqing_guanghuan) return 0;
                        const setSkills = ["waterjiaoman","waterzenhui","waterxieming","waterfuxiong","waterzhanqing"];
                        const otherSkills = getskills.filter(skill=> !setSkills.includes(skill));
                        if(otherSkills && otherSkills.length > 0) return 0;
                        if(links.includes(1)) return 1;
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
            if (result.bool) {
                const choices = result.links;
                if (choices.includes(0)) {
                    const getskills = player.countSkills();
                    const prompt = setColor("〖挟名〗：失去武将牌上一个技能并摸两张牌展示之。");
                    const Controlresult = await player.chooseControl(getskills).set('prompt', prompt).set ("ai", () => {
                        if(getskills.includes('waterzhanqing') && player.waterzhanqing_guanghuan) return 'waterzhanqing';//第一条！
                        const setSkills = ["waterjiaoman","waterzenhui","waterxieming","waterfuxiong","waterzhanqing"];
                        const otherSkills = getskills.filter(skill=> !setSkills.includes(skill));
                        if(otherSkills && otherSkills.length > 0) {
                            return otherSkills[Math.floor(Math.random()*otherSkills.length)];
                        } else {
                            if(getskills.includes('waterzhanqing')) return 'waterzhanqing';
                            if(getskills.includes('waterfuxiong')) return 'waterfuxiong';
                            if(getskills.includes('waterxieming')) return 'waterxieming';
                            if(getskills.includes('waterzenhui')) return 'waterzenhui';
                            return getskills.randomGet();
                        }
                    }).set("forced", true).forResult();
                    await player.removeSkill(Controlresult.control);
                    const usedSkills = player.waterfuxiong?.usedSkills || [];
                    if(usedSkills && !usedSkills.includes(Controlresult.control)) player.waterfuxiong?.usedSkills.push(Controlresult.control);
                    if(player.hasSkill('waterfuxiong')) player.markSkill('waterfuxiong');
                    game.log(player, "失去了技能", '#g【' +  get.translation(Controlresult.control) + '】');
                    const evt = await player.draw(2);
                    if(evt && evt.result && evt.result.length > 0) {
                        const cards = evt.result.sort((a, b) => a.number - b.number);
                        const numbers = evt.result.map(card => card?.number || 0).sort((a, b) => a - b);
                        const prompt = setColor(get.translation(player) + "发动了〖挟名〗：展示牌的点数分别为：" + numbers.join("、") + "。");
                        await player.showCards(cards, prompt);
                        getshowNums.push(...numbers);
                    }
                } else if (choices.includes(1)) {
                    const prompt = setColor("〖挟名〗：选择一名其他角色与你随机展示一张手牌。");
                    const resultTarget = await player.chooseTarget(prompt, 1, function (card, player, target) {
                        return game.filterPlayer(o => o.isIn() && o.getCards('h').length > 0 && o !== player).includes(target);
                    }).set('ai', function (target) {
                        const targets = game.filterPlayer(o => o.isIn() && o.getCards('h').length > 0 && o !== player);
                        const enemies = targets.filter(o => get.attitude(player, o) < 2).sort((a, b) => {
                            const a_hs = a.getCards('h').length, b_hs = b.getCards('h').length;
                            const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                            if (a_hs !== b_hs) return a_hs - b_hs;
                            if (a_es !== b_es) return a_es - b_es;
                            return a.hp - b.hp;
                        });
                        if(enemies && enemies.length > 0) {
                            return target === enemies[0];
                        } else {
                            return target === targets[Math.floor(Math.random() * targets.length)]
                        }
                    }).set('forced', true).forResult();
                    if (resultTarget.bool) {
                        const target = resultTarget.targets[0];
                        const randomCard1 = player.getCards('h').randomGet();
                        if(randomCard1){
                            const num1 = randomCard1?.number || 0;
                            const prompt1 = setColor(get.translation(player) + "发动了〖挟名〗：随机展示牌的点数为：" + num1 + "。");
                            await player.showCards(randomCard1, prompt1);
                        }
                        const randomCard2 = target.getCards('h').randomGet();
                        if(randomCard2){
                            const num2 = randomCard2?.number || 0;
                            const prompt2 = setColor(get.translation(target) + "因〖挟名〗：随机展示牌的点数为：" + num2 + "。");
                            await target.showCards(randomCard2, prompt2);
                        }
                        if (randomCard1 && randomCard2) {
                            const numbers = [randomCard1, randomCard2].map(card => card?.number || 0).sort((a, b) => a - b);
                            getshowNums.push(...numbers);
                        }
                    }
                } else {
                    return;
                }
            }
            const targets = game.filterPlayer(o => {
                const cards = o.getDiscardableCards(player, 'hej');
                return o.isIn() && cards.length > 0;
            });
            if(getshowNums.length > 0 && targets && targets.length > 0) {
                const prompt = setColor("〖挟名〗：是否选择弃置一名角色区域内一张牌其摸一张牌，若此牌点数处于展示牌点数之间/之外，你随机装备一张装备牌/随机获得一张与之点数相同的牌。");
                const resultTarget = await player.chooseTarget(prompt, 1, function (card, player, target) {
                    return targets.includes(target);
                }).set('ai', function (target) {
                    const friends = targets.filter(o => get.attitude(player, o) >= 2);
                    const enemies = targets.filter(o => get.attitude(player, o) < 2).sort((a, b) => {
                        const a_hs = a.getCards('h').length, b_hs = b.getCards('h').length;
                        const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                        if (a_hs !== b_hs) return a_hs - b_hs;
                        if (a_es !== b_es) return a_es - b_es;
                        return a.hp - b.hp;
                    });
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
                    if (hasBadjCards.length > 0) return target === hasBadjCards[0];//优先帮助友方解决判定区卡牌。
                    let equips = [];
                    for (const enemy of enemies) {
                        const cards = enemy.getDiscardableCards(player, 'hej');
                        for (let i = 0; i < cards.length; i++) {
                            if (get.equipValue(cards[i]) >= 6) {
                                equips.push(enemy);
                            }
                        }
                    }
                    if (equips.length > 0) return target === equips[0];
                    if (enemies && enemies.length > 0) return target === enemies[0];
                    return target === targets[Math.floor(Math.random() * targets.length)];
                }).set('forced', true).forResult();
                if (resultTarget.bool) {
                    event.result = {
                        bool: true,
                        cost_data: {
                            numbers: getshowNums,
                            targets: resultTarget.targets,
                        }
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const { numbers, targets } = event.cost_data;
            if(numbers && numbers.length > 0 && targets && targets.length > 0) {
                const target = targets[0];
                player.line(target,'fire');
                const Tcards = target.getDiscardableCards(player, 'hej');
                if (Tcards && Tcards.length > 0) {
                    const result = await player.discardPlayerCard(target, 'hej', true, 1).forResult();
                    if(result.bool) {
                        const card = result.cards[0];
                        await target.draw(1);
                        const num = card?.number || 0;
                        const min = Math.min(...numbers);
                        const max = Math.max(...numbers);
                        if (num >= min && num <= max) {
                            game.log(player,'弃置的卡牌',card,'点数',num,'处于展示牌的点数之间，随机装备一张装备牌。');
                            const equipCards = await player.specifyCards("equip");
                            if (equipCards.length > 0 && player.canEquip(equipCards[0])) {
                                await player.equip(equipCards[0]);
                            }
                        } else {
                            game.log(player,'弃置的卡牌',card,'点数',num,'处于展示牌的点数之外，随机获得一张与之点数相同的牌。');
                            const numberCards = await player.specifyCards(num);
                        }
                    }
                }
            }
        },
        "_priority": 0,
    },
    waterfuxiong: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #48D1CC>赴凶</font>",
        onremove:true,
        intro:{
            mark:function (dialog, storage, player) {
                const nowChars = player.waterfuxiong?.nowChars;
                const setButton = get.info('waterfuxiong').$createButton;
                if (nowChars && nowChars.length > 0) {
                    dialog.addText("正在协战：");
                    dialog.addSmall([nowChars, (item, type, position, noclick, node) => 
                        setButton(item, type, position, noclick, node)
                    ]);
                } else {
                    dialog.addText("暂无协战武将！");
                }
            },
            markcount:function (storage, player) {
                const nowChars = player.waterfuxiong?.nowChars;
                return nowChars? nowChars.length : 0;
            },
            onunmark: true,
            name: "<font color= #48D1CC>赴凶</font>",
        },
        enable: ["phaseUse"],
        usable: 1,
        locked: false,
        async init(player, skill) {
            if(!player.waterfuxiong) player.waterfuxiong = { usedChars: [], nowChars: [], usedSkills: [] };
            if(!player.waterfuxiong_playerEnabled) player.waterfuxiong_playerEnabled = [];
            if(!player.hasSkill("waterfuxiong_clear")) player.addSkill("waterfuxiong_clear");
        },
        filter(event, player) {
            if(!player.hasSkill('waterjiaoman')) return false;
            if(player.countMark('waterjiaoman') < 75) return false;
            const targets = game.filterPlayer(o => {
                return o.isIn() && player.canCompare(o) && o !== player;
            });
            return targets.length > 0;
        },
        filterTarget(card, player, target) {
            return player.canCompare(target) && player !== target;
        },
        selectTarget: 1,
        logTarget: "target",
        line: "fire",
        skillsTypes: ["锁定技","主公技","限定技","觉醒技","转换技","隐匿技","宗族技","势力技","使命技","蓄力技","阵法技","主将技","副将技","君主技","蓄能技","Charlotte","昂扬技","持恒技","连招技","威主技"],
        bannedTypes: ["主公技","限定技","觉醒技","隐匿技","势力技","使命技","阵法技","主将技","副将技","君主技","Charlotte","威主技"],
        filterSkills(skillxx) {
            const infos = get.info(skillxx);
            if(!infos) return [];
            const bannedTypes = get.info("waterfuxiong").bannedTypes;
            const categories = get.skillCategoriesOf(skillxx, get.player());
            if(categories.some(c => bannedTypes.includes(c))) return [];
            return [skillxx];
        },
        $createButton(item, type, position, noclick, node) {
            node = ui.create.buttonPresets.character(item, "character", position, noclick);
            const info = lib.character[item];
            const skills = info[3].filter((skill) => {
                const filterSkills = get.info("waterfuxiong").filterSkills;
                const usedSkills = get.player().waterfuxiong?.usedSkills || [];
                return filterSkills(skill).includes(skill) && !usedSkills.includes(skill)
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
        setfuxiong() {
            let setWugroup = [];
            const seenPlayers = new Set();
            const setlist = [
                'standard', 'shenhua', 'yijiang', 'refresh',
                'sp', 'sp2', 'newjiang', 'onlyOL',
                'yingbian', 'clan', 'huicui', 'xianding',
                'mobile', 'shiji', 'sb', 'tw',
            ];
            const Packs = lib.characterPack;
            for (const packName of setlist) {
                if (!Packs[packName]) continue;
                for (let characterName in Packs[packName]) {
                    const fanyi = lib.translate[characterName];
                    if (fanyi && fanyi.includes('孙鲁班')) continue;
                    if (!fanyi) continue;
                    const info = Packs[packName][characterName];
                    if (info) {
                        const group = info.group;
                        if (group && group === 'wu' && info.skills && Array.isArray(info.skills) && info.skills.length > 0) {
                            const skills = info.skills.filter((skill) => {
                                const filterSkills = get.info("waterfuxiong").filterSkills;
                                const usedSkills = get.player().waterfuxiong?.usedSkills || [];
                                return filterSkills(skill).includes(skill) && !usedSkills.includes(skill)
                            });
                            if (skills.length > 0) {
                                const gamePlayersNmaes = game.players.map(o => o.name);
                                if (!seenPlayers.has(characterName) && !gamePlayersNmaes.includes(characterName)) {
                                    setWugroup.push(characterName);
                                    seenPlayers.add(characterName);
                                }
                            }
                        }
                    }
                }
            }
            return setWugroup;
        },
        fisherYatesShuffle: function (arr) {
            const array = [...arr];
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },
        async content(event, trigger, player) {
            const fisherYatesShuffle = get.info('waterfuxiong').fisherYatesShuffle;
            const targets = event.targets;
            const randomCard = targets[0].getCards('h').randomGet();
            const gettype = get.type(randomCard);
            if(!player.waterfuxiong_playerEnabled.includes(targets[0])) player.waterfuxiong_playerEnabled.push(targets[0]);
            const { result } = await player.chooseToCompare(targets[0]);
            if(result.bool) {//赢
                const {usedChars, nowChars, usedSkills} = player.waterfuxiong;
                const setWugroup = get.info('waterfuxiong').setfuxiong().filter(c => !usedChars.includes(c));
                if(setWugroup.length > 0) {
                    const setButton = get.info('waterfuxiong').$createButton;
                    const lists = fisherYatesShuffle(setWugroup).slice(0, 3);
                    if(lists.length === 0) return;
                    const prompt = setColor("〖赴凶〗：请选择一个武将获得其全部技能直到你下个出牌阶段开始时。");
                    const chooseButton = await player.chooseButton([prompt,
                        [lists, (item, type, position, noclick, node) => setButton(item, type, position, noclick, node)],
                        [1, 1],
                    ]).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                        function getValueLinks() {
                            const charactersWithSkills = lists.map(name => {
                                const info = lib.character[name];
                                const skills = info[3].filter((skill) => {
                                    const filterSkills = get.info("waterfuxiong").filterSkills;
                                    const usedSkills = player.waterfuxiong?.usedSkills || [];
                                    return filterSkills(skill).includes(skill) && !usedSkills.includes(skill);
                                });
                                return { name, skillCount: skills.length };
                            });
                            charactersWithSkills.sort((a, b) => b.skillCount - a.skillCount);
                            return charactersWithSkills.map(item => item.name);
                        }
                        return button.link === getValueLinks()[0];
                    }).forResult();
                    if (chooseButton.bool) {
                        const name = chooseButton.links[0];
                        player.waterfuxiong.nowChars = [name];
                        const info = lib.character[name];
                        const skills = info[3].filter((skill) => {
                            const filterSkills = get.info("waterfuxiong").filterSkills;
                            const usedSkills = get.player().waterfuxiong?.usedSkills || [];
                            return filterSkills(skill).includes(skill) && !usedSkills.includes(skill)
                        });
                        if(skills.length > 0) {
                            const namefanyi = get.translation(name);
                            const skillsfanyi = "「" + skills.map(i => get.translation(i)).join("丨") + "」";
                            for(const skill of skills) {
                                player.addSkill(skill);
                            }
                            const prompt = setColor("获得了吴势力武将〖" + namefanyi + "〗的暂时协战，协战技能为：" + skillsfanyi + "。");
                            game.log(player, prompt);
                        }
                        player.markSkill('waterfuxiong');
                    }
                }
                await player.specifyCards(gettype);
            } else if (result.tie) {
                return;
            } else {//输
                const [p1, p2] = [player, targets[0]];
                const [cardsP1H, cardsP2H] = [p1.getCards('h'), p2.getCards('h')];
                const [cardsP1E, cardsP2E] = [p1.getCards('e'), p2.getCards('e')];
                const allH = fisherYatesShuffle([...cardsP1H, ...cardsP2H]);
                const allE = fisherYatesShuffle([...cardsP1E, ...cardsP2E]);
                async function distributeCards(cards, receiver, equip = false) {
                    if (cards.length === 0) return;
                    await receiver.gain(cards, "giveAuto", "bySelf");
                    if (equip) {
                        for (const card of cards) {
                            if (receiver.canEquip(card)) await receiver.equip(card);
                        }
                    }
                }
                const splitIndexH = Math.ceil(allH.length / 2);
                const gainH1 = allH.slice(0, splitIndexH);
                const gainH2 = allH.slice(splitIndexH);

                const splitIndexE = Math.ceil(allE.length / 2);
                const gainE1 = allE.slice(0, splitIndexE);
                const gainE2 = allE.slice(splitIndexE);

                await distributeCards(gainH1, p1);
                await distributeCards(gainH2, p2);
                await distributeCards(gainE1, p1, true);
                await distributeCards(gainE2, p2, true);
                const getNowCards_gettype = player.getCards('he').filter(c => get.type(c) === gettype);
                if(getNowCards_gettype.length > 0) {
                    await player.chooseToDiscard(1, 'he', true, function(card) {
                        return get.type(card) === gettype;
                    });
                }
                player.addTempSkill('waterfuxiong_buff',{ player:'phaseUseEnd'});
            }
        },
        setUsefuxiong(player) {
            let getValueTargets = [];
            const cardsP = player.getCards('h').sort((a, b) => b.number - a.number);
            if(!cardsP || cardsP.length === 0) return getValueTargets;

            const targets = game.filterPlayer(o => o.isIn() && player.canCompare(o) && o !== player);
            if(!targets || targets.length === 0) return getValueTargets;

            const enemies = targets.filter(o => get.attitude(player, o) < 2).sort((a, b) =>{
                const cardsA = a.getCards('he'), cardsB = b.getCards('he');
                if(cardsA.length !== cardsB.length) return cardsB.length - cardsA.length;
                return a.hp - b.hp;
            });
            if(enemies.length > 0) {
                const filters = enemies.filter(o => o.getCards('he').length >= player.getCards('he').length + 2);
                if(filters.length > 0 && enemies.length > 1) {
                    getValueTargets = [filters[0]];
                } else {
                    for(const target of enemies) {
                        const cardsT = target.getCards('h').sort((a, b) => b.number - a.number);
                        if(cardsP[0].number > cardsT[0].number) {
                            getValueTargets = [target];
                            break;
                        }
                    }
                }
            }
            if(getValueTargets.length === 0) {
                const friends = targets.filter(o => get.attitude(player, o) >= 2).sort((a, b) =>{
                    const cardsA = a.getCards('he'), cardsB = b.getCards('he');
                    if(cardsA.length !== cardsB.length) return cardsB.length - cardsA.length;
                    return b.hp - a.hp;
                });
                if(friends.length > 0) {
                    getValueTargets = [friends[0]];
                }
            }
            return getValueTargets;
        },
        ai: {
            order: 15,
            threaten: 1.5,
            result: {
                target: function (player, target, card) {
                    const targets = get.info('waterfuxiong').setUsefuxiong(player);
                    if(targets && targets.length > 0 && targets.includes(target)) {
                        return get.attitude(player, target);
                    } else {
                        return 0;
                    }
                },
            },
        },
        subSkill:{
            buff:{
                mod: {
                    targetInRange: (card, player, target) => {
                        if(player.isPhaseUsing()) return true;
                    },
                    cardUsable: (card, player,num) => {
                        if(player.isPhaseUsing()) return Infinity;
                    },
                    playerEnabled: (card, player, target) => {
                        const targets = player.waterfuxiong_playerEnabled;
                        if (target === targets[0] && player.isPhaseUsing()) return false;
                    },
                },
            },
            clear: {
                trigger: {
                    player: ["phaseUseBegin","phaseUseEnd"],
                },
                firstDo: true,
                charlotte: true,
                fixed: true,
                popup: false,
                silent: true,
                forced: true,
                async init(player, skill) {
                    if(!player.waterfuxiong) player.waterfuxiong = { usedChars: [], nowChars: [], usedSkills: [] };
                    if(!player.waterfuxiong_playerEnabled) player.waterfuxiong_playerEnabled = [];
                },
                filter(event, player,name) {
                    if(name === "phaseUseBegin") {
                        return player.hasSkill("waterfuxiong") && player.waterfuxiong?.nowChars.length > 0;
                    } else if(name === "phaseUseEnd") {
                        return player.waterfuxiong_playerEnabled.length > 0;
                    }
                },
                async content(event, trigger, player) {
                    const Time = event.triggername;
                    if(Time === "phaseUseBegin") {
                        const name = player.waterfuxiong.nowChars[0];
                        const info = lib.character[name];
                        const skills = info[3].filter((skill) => {
                            const filterSkills = get.info("waterfuxiong").filterSkills;
                            const usedSkills = player.waterfuxiong?.usedSkills || [];
                            return filterSkills(skill).includes(skill) && !usedSkills.includes(skill)
                        });
                        let getSkills = [];
                        if(skills.length > 0) {
                            for(const skill of skills) {
                                if(player.hasSkill(skill)) {
                                    getSkills.push(skill);
                                    player.removeSkill(skill);
                                }
                            }
                        }
                        const namefanyi = get.translation(name);
                        let skillsfanyi = "无";
                        if(getSkills.length > 0) {
                            skillsfanyi = "「" + getSkills.map(i => get.translation(i)).join("丨") + "」";
                        }
                        player.markSkill('waterfuxiong');
                        const prompt = setColor("失去了吴势力武将〖" + namefanyi + "〗的协战，失去技能为：" + skillsfanyi + "。");
                        game.log(player, prompt);
                    } else if(Time === "phaseUseEnd") {
                        player.waterfuxiong_playerEnabled = [];
                    }
                },
                sub: true,
                sourceSkill: "waterfuxiong",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    waterzhanqing: {
        audio: "ext:银竹离火/audio/skill:2",
        enable: ["phaseUse"],
        limited: true,
        skillAnimation: "epic",
        animationColor: "fire",
        locked: false,
        async init(player, skill) {
            if(!player.storage.waterzhanqing) player.storage.waterzhanqing = false;
            if(!player.waterzhanqing_guanghuan) player.waterzhanqing_guanghuan = false;
            if(!player.waterzhanqing_used) player.waterzhanqing_used = 0;
        },
        filter: function(event, player) {
            if(!player.hasSkill('waterjiaoman')) return false;
            if(player.countMark('waterjiaoman') < 99) return false;
            return !player.storage.waterzhanqing;
        },
        async contentBefore(event, trigger, player) {
            const targets = game.filterPlayer(() => true).sortBySeat(player);
            player.line(targets, "fire");
            for(const target of targets) {
                const num = target.hp - 1;
                if(num > 0) {
                    await target.changeHp(-num);
                    await target.changeHujia(num + (player == target ? 2 : 0), null, true);
                } else if (player == target) {
                    await target.changeHujia(2, null, true);
                }
            }
        },
        async content(event, trigger, player) {
            player.$fullscreenpop("向死存吴", "fire");
            player.storage.waterzhanqing = true;
            player.waterzhanqing_guanghuan = true;
            player.awakenSkill(event.name);
            player.addSkill('waterzhanqing_clear');
        },
        ai: {
            order: 15,
            threaten: 1.5,
            result: {
                player: function (player, target) {
                    return 1;
                },
            },
        },
        subSkill:{
            clear: {
                trigger: {
                    global: ["phaseAfter"],
                },
                firstDo: true,
                charlotte: true,
                fixed: true,
                popup: false,
                silent: true,
                forced: true,
                async init(player, skill) {
                    if(!player.waterzhanqing_used) player.waterzhanqing_used = 0;
                },
                async content(event, trigger, player) {
                    player.waterzhanqing_used = 0;
                },
                sub: true,
                sourceSkill: "waterzhanqing",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    icejiuguo: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player:['icexueyiAfter'],
        },
        juexingji: true,
        forced: true,
        skillAnimation: true,
        animationColor: "thunder",
        async init(player, skill) {
            if(!player.icexueyi_used) player.icexueyi_used = 0;
            if(!player.storage.icejiuguo) player.storage.icejiuguo = false;
        },
        filter(event, player) {
            return player.hasSkill('icexueyi') && player.icexueyi_used >= 5 && !player.storage.icejiuguo;
        },
        async content(event, trigger, player) {
            player.storage.icejiuguo = true;
            player.awakenSkill("icejiuguo");
            const xueyiCards = player.getCardsform({ Pile: 'allPile', field: 'hesjx' }).filter(c => c.storage.icexueyi);
            if(xueyiCards && xueyiCards.length > 0) {
                const targets = game.filterPlayer(() => true);
                targets.forEach(target => {
                    target.updateMark();
                    target.update();
                });
                ui.clear();
                await player.gain(xueyiCards, 'gain2');
                player.addGaintag(xueyiCards, "icexueyi");
            }
        },
        ai: {
            effect: {
                target: function (card, player, target) {

                },
                player: function (card, player, target) {
                    
                },
            },
        },
        subSkill: {
            shezhanqunru: {
                audio: "ext:银竹离火/audio/skill:2",
                sub: true,
                sourceSkill: "icejiuguo",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    //文鲁迅
    icexueyi: {
        audio: "ext:银竹离火/audio/skill:2",
        marktext: "<font color= #FF2400>学医</font>",
        intro: {
            content: "players",
            onunmark: true,
            name: "<font color= #FF2400>学医</font>",
        },
        trigger: {
            global: ["damageEnd","roundStart"],
        },
        async init(player, skill) {
            if(!player.icexueyi_used) player.icexueyi_used = 0;
            if(!player.storage.icexueyi) player.storage.icexueyi = false;
            if(!player.hasSkill('icexueyi_useCard')) player.addSkill('icexueyi_useCard');
        },
        filter(event, player, name) {
            if(name === "damageEnd") {
                const key1 = event.card && event.source && event.num && event.num > 0;
                const key2 = player.getGainableCards(event.source, 'he').length > 0;
                const key3 = !player.getStorage('icexueyi').includes(event.player);
                return key1 && key2 && key3 && !player.storage.icejiuguo;
            } else {
                player.removeStorage('icexueyi');
                player.unmarkSkill('icexueyi');
                return;
            }
        },
        async cost(event, trigger, player) {
            const source = trigger.source;
            const cards = player.getGainableCards(source, 'he');
            if(cards && cards.length > 0) {
                const prompt = setColor("〖学医〗：是否交给" + get.translation(source) + "一张牌？");
                const result = await player.chooseCard("he", prompt, function(card) { 
                    return cards.includes(card);
                }).set('ai', function(card) {

                }).set('forced', false).forResult();
                if(result.bool) {
                    player.icexueyi_used ++;
                    event.result = {
                        bool: true,
                        cost_data: {
                            cards: result.cards,
                        },
                    };
                }
            }
        },
        async content(event, trigger, player) {
            const cards = event.cost_data?.cards;
            if(cards && cards.length > 0) {
                if (!player.getStorage(event.name).includes(trigger.player)) player.markAuto(event.name, [trigger.player]);
                await player.give(cards, trigger.source);
                const prompt = setColor("〖学医〗");
                await trigger.source.showCards(cards, get.translation(trigger.source) + "发动了" + prompt);
                if(trigger.source !== player && !cards[0].storage.icexueyi) cards[0].storage.icexueyi = true;
                if (get.color(cards[0]) == "black") {
                    trigger.player.draw(2);
                } else if (get.color(cards[0]) == "red") {
                    trigger.player.recover();
                }
            }
            //await player.viewAsToUse('shezhanqunru',cards[0]);
        },
        ai: {
            effect: {
                target: function (card, player, target) {

                },
                player: function (card, player, target) {

                },
            },
        },
        group: ['icexueyi_shezhanqunru'],
        subSkill: {
            shezhanqunru: {
                audio: "icexueyi",
                mod: {
                    aiValue(player, card, num) {
                        const cards = player.getCards('hes', card => card.hasGaintag('icexueyi'));
                        if (!cards.includes(card)) return;
                        const Vcard = { name: "shezhanqunru", nature: "", isCard: true, icexueyi_shezhanqunru: true };
                        return Math.max(num, get.value(Vcard, player));
                    },
                    aiUseful() {
                        return lib.skill.icexueyi_shezhanqunru.mod.aiValue.apply(this, arguments);
                    },
                    ignoredHandcard: function(card, player) {
                        const bool = player.storage.icexueyi_shezhanqunru;
                        if (!bool && card.hasGaintag('icexueyi')) return true;
                    },
                    cardDiscardable: function(card, player, name) {
                        const bool = player.storage.icexueyi_shezhanqunru;
                        if (name == "phaseDiscard") {
                            if (!bool && card.hasGaintag('icexueyi')) {
                                return false;
                            }
                        }
                    },
                },
                enable: ["chooseToRespond","chooseToUse"],
                locked: false,
                limited: true,
                skillAnimation: "epic",
                animationColor: "thunder",
                async init(player, skill) {
                    if(!player.storage.icexueyi_shezhanqunru) player.storage.icexueyi_shezhanqunru = false;
                },
                filter(event, player) {
                    const cards = player.getCards('hes', card => card.hasGaintag('icexueyi'));
                    return cards.length > 0 && player.storage.icejiuguo;
                },
                filterCard(card, player) {
                    return card.hasGaintag('icexueyi');
                },
                selectCard: [1, Infinity],
                position: "hes",
                viewAs(cards, player) {
                    return { name: "shezhanqunru", nature: "", isCard: true, icexueyi_shezhanqunru: true };
                },
                prompt: "将任意张〖学医〗牌当〖舌战群儒〗使用或打出, 并摸等量张牌。",
                check(card) {
                    const player = get.owner(card);
                    const cards = player.getCards('hes', card => card.hasGaintag('icexueyi'));
                    const Vcard = { name: "shezhanqunru", nature: "", isCard: true, icexueyi_shezhanqunru: true };
                    const filterCards = cards.filter(card => {
                        return get.value(card, player) <= get.value(Vcard, player) && get.name(card) !== "tao";
                    });
                    if(filterCards.includes(card)) return 1;
                    return 0;
                },
                precontent: async function () {
                    const player = _status.event.player;
                    player.storage.icexueyi_shezhanqunru = true;
                    player.awakenSkill('icexueyi', true);
                    player.awakenSkill('icexueyi_shezhanqunru', true);
                },
                onrespond: function () {
                    return this.onuse.apply(this, arguments);
                },
                onuse: async function (result, player) {
                    const cards = result.cards;
                    if(cards && cards.length > 0) {
                        await player.draw(cards.length);
                    }
                },
                hiddenCard: function (player, name) {
                    const cards = player.getCards('hes', card => card.hasGaintag('icexueyi'));
                    if (name == "shezhanqunru") return cards.length > 0 && player.storage.icejiuguo;
                    return false;
                },
                ai: {
                    order: function (item, player) {
                        if (player && _status.event.type == "phase") {
                            const Vcard = { name: "shezhanqunru", nature: "", isCard: true, icexueyi_shezhanqunru: true };
                            const cards = player.getCards('hes', card => card.hasGaintag('icexueyi'));
                            if (!cards || !cards.length || !player.storage.icejiuguo) return 0;
                            const order = get.order(Vcard, player);
                            if (order && order > 0) {
                                const filterCards = cards.filter(card => {
                                    return get.value(card, player) <= get.value(Vcard, player) && get.name(card) !== "tao";
                                });
                                if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0 && filterCards.length > 0) {
                                    return order + 0.15;
                                } else {
                                    return 1.5;
                                }
                            } else {
                                return 1.5;
                            }
                        }
                        return 1.5;
                    },
                },
                sub: true,
                sourceSkill: "icexueyi",
                "_priority": 0,
            },
            useCard: {
                trigger: {
                    player:["useCardAfter"],
                },
                firstDo: true,
                charlotte: true,
                silent: true,
                forced: true,
                async init(player, skill) {

                },
                filter(event, player, name) {
                    const card = event.card;
                    const key1 = card && card.name == 'shezhanqunru';
                    const key2 = card.icexueyi_shezhanqunru && card.icexueyi_shezhanqunru == true;
                    const cards = player.getCards('he');
                    return key1 && key2 && cards.length > 0;
                },
                async content(event, trigger, player) {
                    const cards = player.getCards('he');
                    if(!cards || cards.length == 0) return;
                    const useedTargets = [];
                    player.addGaintag(cards, "icexueyi_give");
                    let setnum = cards.length;
                    while(setnum > 0) {
                        let Gtargets = game.filterPlayer(o => !useedTargets.includes(o) && o.isAlive() && o !== player);
                        if(!Gtargets || Gtargets.length === 0) break;
                        const result = await player.chooseCardTarget({
                            filterCard(card, player) {
                                return get.itemtype(card) == "card" && card.hasGaintag("icexueyi_give");
                            },
                            filterTarget(card, player, target) {
                                return !useedTargets.includes(target) && target.isAlive() && target !== player;
                            },
                            selectCard: [1, 2],
                            prompt: "请选择要分配的卡牌和目标",
                            ai1(card) {
                                if (!ui.selected.cards.length) {
                                    return 1;
                                }
                                return 0;
                            },
                            ai2(target) {
                                const player = _status.event.player, card = ui.selected.cards[0];
                                var val = target.getUseValue(card);
                                if (val > 0) {
                                    return val * get.attitude(player, target) * 2;
                                }
                                return get.value(card, target) * get.attitude(player, target);
                            },
                        }).forResult();
                        if(result.bool) {
                            const cards = result.cards;
                            const target = result.targets[0];
                            player.line(target, "fire");
                            await player.give(cards, target);
                            useedTargets.push(target);
                            setnum -= cards.length;
                        } else {
                            break;
                        }
                    }
                    player.removeGaintag("icexueyi_give");
                },
                sub: true,
                sourceSkill: "icexueyi",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    icejiuguo: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player:['icexueyiAfter'],
        },
        juexingji: true,
        forced: true,
        skillAnimation: true,
        animationColor: "thunder",
        async init(player, skill) {
            if(!player.icexueyi_used) player.icexueyi_used = 0;
            if(!player.storage.icejiuguo) player.storage.icejiuguo = false;
        },
        filter(event, player) {
            return player.hasSkill('icexueyi') && player.icexueyi_used >= 5 && !player.storage.icejiuguo;
        },
        async content(event, trigger, player) {
            player.storage.icejiuguo = true;
            player.awakenSkill("icejiuguo");
            const xueyiCards = player.getCardsform({ Pile: 'allPile', field: 'hesjx' }).filter(c => c.storage.icexueyi);
            if(xueyiCards && xueyiCards.length > 0) {
                const targets = game.filterPlayer(() => true);
                targets.forEach(target => {
                    target.updateMark();
                    target.update();
                });
                ui.clear();
                await player.gain(xueyiCards, 'gain2');
                player.addGaintag(xueyiCards, "icexueyi");
            }
        },
        ai: {
            effect: {
                target: function (card, player, target) {

                },
                player: function (card, player, target) {
                    
                },
            },
        },
        subSkill: {
            shezhanqunru: {
                audio: "ext:银竹离火/audio/skill:2",
                sub: true,
                sourceSkill: "icejiuguo",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    //诸葛亮
    //布衣
    icebuyi: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            cardDiscardable: function(card, player) {
                if (get.position(card) == "h" || get.position(card) == "e") return false;
            },
            canBeDiscarded: function(card, player) {
                if (get.position(card) == "h" || get.position(card) == "e") return false;
            },
            playerEnabled: function(card, player, target) {
                if (card.name !== "tao") {
                    if (target === player) return true;
                    else return false;
                }
            },
            targetEnabled: function(card, player, target) {
                if (card.name !== "tao") return false;
            },
        },
        trigger: {
            player:["phaseJieshuBegin"],
        },
        locked: true,
        direct:true,
        filter: function(event, player) {
            const cards =  player.getCards("he");
            if(cards && cards.length >= 54) return true;
            return false;
        },
        async content(event, trigger, player) {
            player.chat("再见各位！恭喜发财！");
            await player.die();
        },
        "_priority": 1314,
    },
    //隆对
    icelongdui: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            player: "enterGame",
            global: ["phaseBefore","phaseUseBegin","chooseToUseBefore"],
        },
        direct:true,
        filter: function(event, player, name) {
            if(name === "phaseUseBegin") {
                const t = event.player;
                if(t === player) return false;
                return player.inRange(t);
            } else {
                const targets = game.players.filter(o => o !== player && o.isAlive() && !o.hasSkill("icelongdui_give"));
                if(!targets || targets.length === 0) return;
                if(targets && targets.length > 0) {
                    for(let target of targets) {
                        if(!target.hasSkill("icelongdui_give")) {
                            target.addSkill("icelongdui_give");
                        }
                    }
                }
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseUseBegin") {
                const juexing = player.storage.icechushan;
                let setnum = 3;
                if(juexing && juexing === true) setnum = 1;
                const target = trigger.player;
                await target.draw();
                const tcards = target.getCards("he");
                if(!tcards || tcards.length === 0 || target.countGainableCards(player, "he") === 0) return;
                const settext = setColor("〖隆对〗：");
                const num = target.countGainableCards(player, "he");
                let infonum = Math.min(num, setnum);
                let cards = await target.chooseCard(settext + "请选择至多"+ get.cnNumber(infonum) + "张牌，展示并交给" + get.translation(player), 'he', [1, infonum], true, function(card) {
                    return target.countCards("he") > 0 && target.countGainableCards(player, "he") > 0;
                }).set('ai', function(card) {

                    const{ longduiAI } = setAI.qun;
                    const types = longduiAI(target);

                    const att = get.attitude(target, player);
                    const value = get.value(card,target);
                    const selectedCards = ui.selected.cards;
                    if (att >= 2) {
                        if (!types.basic && !types.trick && !types.equip) {
                            if (selectedCards.length <= 0) {
                                if (value < 7) return true
                                else return true;
                            } else {
                                return false;
                            }
                        } else {
                            if(juexing && juexing === true) {
                                if (types.basic) {
                                    return get.type(card) === "basic";
                                } else if (types.trick) {
                                    return get.type(card) === "trick";
                                } else if (types.equip) {
                                    return get.type(card) === "equip";
                                } else {
                                    if (value < 7) return true
                                    else return true;
                                }
                            } else {
                                if (selectedCards.length <= 0) {
                                    if (types.basic) {
                                        return get.type(card) === "basic";
                                    } else if (types.trick) {
                                        return get.type(card) === "trick";
                                    } else if (types.equip) {
                                        return get.type(card) === "equip";
                                    } else {
                                        if (value < 7) return true
                                        else return true;
                                    }
                                } else if (selectedCards.length === 1) {
                                    const selectedtype = get.type(selectedCards[0]);
                                    if (types.basic) {
                                        return get.type(card) === "basic" && selectedtype !== "basic";
                                    } else if (types.trick) {
                                        return get.type(card) === "trick" && selectedtype !== "trick";
                                    } else if (types.equip) {
                                        return get.type(card) === "equip" && selectedtype !== "equip";
                                    } else {
                                        return false;
                                    }
                                } else if (selectedCards.length === 2) {
                                    const selectedtype1 = get.type(selectedCards[0]);
                                    const selectedtype2 = get.type(selectedCards[1]);
                                    if (types.basic) {
                                        return get.type(card) === "basic" && (selectedtype1 !== "basic" && selectedtype2 !== "basic");
                                    } else if (types.trick) {
                                        return get.type(card) === "trick" && (selectedtype1 !== "trick" && selectedtype2 !== "trick");
                                    } else if (types.equip) {
                                        return get.type(card) === "equip" && (selectedtype1 !== "equip" && selectedtype2 !== "equip");
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    } else {
                        if (selectedCards.length <= 0) {
                            const tcards = target.getCards("he").sort((a, b) => get.value(b, target) - get.value(a, target));
                            return tcards[0];
                        } else {
                            return false;
                        }
                    }
                }).forResultCards();
                if (cards && cards.length) {
                    const text = setColor("〖隆对〗");
                    await target.showCards(cards, get.translation(target) + "对" + get.translation(player) + "发动了" + text);
                    await target.give(cards, player);
                    game.log(target, "将" + cards.length + "张牌交给了", player);
                    await icelongdui(player, target, cards);
                }
            }
        },
        subSkill: {
            give: {
                audio: "ext:银竹离火/audio/skill:2",
                name: "隆对",
                enable: "phaseUse",
                usable: 1,
                filter: function(event, player) {
                    const targets = game.players.filter(o => o !== player && o.isAlive() && o.hasSkill("icelongdui"));
                    if(!targets || targets.length === 0) return false;
                    return player.countCards("he") > 0;
                },
                filterTarget: function(card, player, target) {
                    return target !== player && target.hasSkill("icelongdui");
                },
                selectTarget: 1,
                filterCard: function (card) {
                    return true;
                },
                selectCard: [1, 3],
                discard: false,
                lose: false,
                delay: false,
                position: "he",
                check: function(card) {
                    const player = get.owner(card);
                    const selectedCards = ui.selected.cards;
                    const{ longduiAI } = setAI.qun;
                    const types = longduiAI(player);
                    let key = lib.skill.icelongdui_give.selectCard;
                    if (key === 1) {
                        if (types.basic) {
                            return get.type(card) === "basic";
                        } else if (types.trick) {
                            return get.type(card) === "trick";
                        } else if (types.equip) {
                            return get.type(card) === "equip";
                        } else {
                            return false;
                        }
                    } else if (Array.isArray(key) && key.length === 2 && key[0] === 1 && key[1] === 3) {
                        if (selectedCards.length <= 0) {
                            if (types.basic) {
                                return get.type(card) === "basic";
                            } else if (types.trick) {
                                return get.type(card) === "trick";
                            } else if (types.equip) {
                                return get.type(card) === "equip";
                            } else {
                                return false;
                            }
                        } else if (selectedCards.length === 1) {
                            const selectedtype = get.type(selectedCards[0]);
                            if (types.basic) {
                                return get.type(card) === "basic" && selectedtype !== "basic";
                            } else if (types.trick) {
                                return get.type(card) === "trick" && selectedtype !== "trick";
                            } else if (types.equip) {
                                return get.type(card) === "equip" && selectedtype !== "equip";
                            } else {
                                return false;
                            }
                        } else if (selectedCards.length === 2) {
                            const selectedtype1 = get.type(selectedCards[0]);
                            const selectedtype2 = get.type(selectedCards[1]);
                            if (types.basic) {
                                return get.type(card) === "basic" && (selectedtype1 !== "basic" && selectedtype2 !== "basic");
                            } else if (types.trick) {
                                return get.type(card) === "trick" && (selectedtype1 !== "trick" && selectedtype2 !== "trick");
                            } else if (types.equip) {
                                return get.type(card) === "equip" && (selectedtype1 !== "equip" && selectedtype2 !== "equip");
                            } else {
                                return false;
                            }
                        }
                    }
                },
                ai2: function(target) {
                    const player = _status.event.player;
                    const att = get.attitude(player, target);
                    return att > 2;
                },
                async content(event, trigger, player) {
                    const cards = event.cards;
                    const target = event.targets[0];
                    if (cards && cards.length && target) {
                        const text = setColor("〖隆对〗");
                        await player.showCards(cards, get.translation(player) + "对" + get.translation(target) + "发动了" + text);
                        await player.give(cards, target); 
                        game.log(player, "将" + cards.length + "张牌交给了", event.targets[0]);
                        await icelongdui(event.targets[0], player, cards);
                    }
                },
                ai: {
                    order: 13,
                    expose: 0.5,
                    result: {
                        target: function(player,target){
                            const att = get.attitude(player, target);
                            if (att >= 2) {
                                const{ longduiAI } = setAI.qun;
                                const types = longduiAI(player);
                                if (types.basic) {
                                    return true;
                                } else if (types.trick) {
                                    return true;
                                } else if (types.equip) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        },
                    },
                },
                sub: true,
                sourceSkill: "icelongdui",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    //出山
    icechushan: {
        audio: "ext:银竹离火/audio/skill:2",
        marktext: "<font color= #AFEEEE>出山</font>",
        intro: {
            content: "players",
            onunmark: true,
            name: "<font color= #AFEEEE>出山</font>",
        },
        trigger:{
            player:"phaseZhunbeiBegin",
        },
        persevereSkill: true,
        unique: true,
        forced: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: "ice",
        async init(player, skill) {
            if(!player.storage.icechushan) player.storage.icechushan = false;
        },
        filter: function(event, player) {
            if(player.storage.icechushan === true) return false;
            const list = player.getStorage('icechushan');
            if(list && list.length >= 3) {
                return true;
            } else {
                const ts = game.players.filter(o => o !== player);
                if(!ts || ts.length === 0) return false;
                if(ts && ts.length < 3) {
                    return list.length === ts.length;
                }
            }
        },
        derivation: ['icejiejian','icewenxing','iceshezhan'],
        async content(event, trigger, player) {
            const list = player.getStorage('icechushan');
            if(list) {
                player.removeStorage('icechushan');
                player.unmarkSkill("icechushan");
            }
            player.storage.icechushan = true;
            player.removeSkill("icebuyi");
            player.loseMaxHp();
            let Grouplists = ["wei","shu","wu"];
            const result = await player.chooseControl(Grouplists).set ("ai", control => {
                const index = Math.floor(Math.random() * Grouplists.length);
                return Grouplists[index];
            }).set('forced', true).forResult();
            if (result.control === "wei") {
                player.changeGroup("wei");
                if(!player.hasSkill("icejiejian")) {
                    player.addSkill("icejiejian");
                }
            } else if (result.control === "shu") {
                player.changeGroup("shu");
                if(!player.hasSkill("icewenxing")) {
                    player.addSkill("icewenxing");
                }
            } else if (result.control === "wu") {
                player.changeGroup("wu");
                if(!player.hasSkill("iceshezhan")) {
                    player.addSkill("iceshezhan");
                }
            }
            lib.skill.icelongdui_give.selectCard = 1;
            player.awakenSkill("icechushan");
        },
        ai: {
            combo: ["icelongdui"],
        },
        "_priority": 0,
    },
    //借箭
    icejiejian: {
        audio: "ext:银竹离火/audio/skill:2",
        mod: {
            cardUsable: function(card,player,num){
                if(player.group !== "wei") return;
                if (!card.cards) return;
                for (let ccc of card.cards) {
                    if (ccc.hasGaintag("icejiejian")) return Infinity;
                }
            },
            targetInRange: function(card,player){
                if(player.group !== "wei") return;
                if (!card.cards) return;
                for (let ccc of card.cards) {
                    if (ccc.hasGaintag("icejiejian")) return true;
                }
            },
        },
        enable: "phaseUse",
        usable: 1,
        unique: true,
        locked: false,
        groupSkill: "wei",
        filter: function(event, player) {
            if(player.group !== "wei") return false;
            const targets = game.players.filter(o => o !== player && o.isAlive());
            if(!targets || targets.length === 0) return false;
            return true;
        },
        filterTarget: function(card, player, target) {
            return target !== player && target.canUse("sha", player, false);
        },
        selectTarget: 1,
        ai2: function(target) {
            const player = _status.event.player;
            let enemys = game.players.filter(o => o !== player && o.isAlive() && get.attitude(player, o) < 2);
            if(!enemys || enemys.length === 0) return false;
            let livenum = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
            const shan_num = player.countCards('h', { name: 'shan' });
            enemys.sort((a, b) => a.hp - b.hp);
            if (shan_num > 1) {
                return enemys[0];
            } else if (shan_num <= 1) {
                if (livenum >= 1) {
                    return enemys[0];
                } else {
                    return false;
                }
            }
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            let TXT = setColor("〖借箭〗：是否对") + get.translation(player) + setColor("视为使用一张无距离限制的〖杀〗？");
            let result = await target.chooseBool(TXT).set('ai', function() {
                return true;
            }).forResult();
            if (result.bool) {
                await target.useCard({ name: "sha" }, player, false).set('forced', true);
                let findevt = false;
                const globalHistory = _status.globalHistory;
                if (globalHistory.length > 0) {
                    const Evts = globalHistory[globalHistory.length - 1];
                    if (Evts.everything && Evts.everything.length > 0) {
                        for (let evt of Evts.everything) {
                            if (evt.name === 'damage') {
                                 const card = evt.card;
                                 const num = evt.num;
                                 if (card && card.name === "sha" && num && num > 0 && evt.source === target) {
                                     if (card.cards && card.cards.length === 0) {
                                        findevt = true;
                                        const firenum = num + 1;
                                        await target.damage(firenum, "fire", 'nocard', player);
                                     }
                                 }
                            }
                        }
                    }
                }
                if (!findevt) {
                    const shacards = await player.specifyCards('sha');
                    if (shacards && shacards.length > 0) {
                        player.addGaintag(shacards, "icejiejian");
                    }
                }
            } else {
                target.turnOver();
            }
        },
        ai: {
            fireAttack: true,
            order: 13,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
            result: {
                target: function(player,target){
                    const enemys = game.players.filter(o => o !== player && o.isAlive() && get.attitude(player, o) < 2);
                    if(!enemys || enemys.length === 0) return 0;
                    let livenum = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
                    const shan_num = player.countCards('h', { name: 'shan' });
                    if (shan_num > 1) {
                        return -10;
                    } else if (shan_num <= 1) {
                        if (livenum >= 1) {
                            return -10;
                        } else {
                            return 0;
                        }
                    }
                },
            },
        },
        "_priority": 0,
    },
    //问星
    icewenxing: {
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #AFEEEE>问星</font>",
        intro:{
            mark: function(dialog, storage, player) {
                const num = player.icewenxing_setnum;
                if (num && num > 0) {
                    const seenum = Math.min(5, Math.max(2, player.hp)) + 1;
                    dialog.addText(setColor("〖问星〗：可观看牌堆顶" + seenum + "张牌。"));
                } else {
                    dialog.addText(setColor("〖问星〗：次数已用完，待重置！"));
                }
            },
            markcount: function(storage, player) {
                const num = player.icewenxing_setnum;
                if (num && num > 0) {
                    return num;
                } else {
                    return 0;
                }
            },
            onunmark: true,
            name:"<font color= #AFEEEE>问星</font>",
        },
        trigger: {
            global: ["phaseZhunbeiBegin","roundStart"],
            player: ["changeHpAfter","damageAfter"],
        },
        groupSkill: "shu",
        unique: true,
        direct: true,
        async init(player, skill) {
            if(!player.icewenxing_setnum) player.icewenxing_setnum = 1;
            if(!player.icewenxing_damage) player.icewenxing_damage = 0;
            //用于AI判断，留一次问星为自己！
            if(!player.icewenxing_usedByme) player.icewenxing_usedByme = false;
            player.markSkill("icewenxing");
            player.update();
        },
        filter: function (event, player, name) {
            if(player.group !== "shu") return false;
            if(name === "roundStart") {
                player.icewenxing_usedByme = false;
                const num = player.icewenxing_damage;
                player.icewenxing_setnum = 1 + num;
                player.markSkill("icewenxing");
                player.update();
                return;
            } else if(name === "changeHpAfter") {
                player.markSkill("icewenxing");
                player.update();
                return;
            } else if(name === "damageAfter") {
                const source = event.source;
                if (!source) return false;
                const num = player.icewenxing_damage;
                return event.num > 0 && num < 3 && player.isAlive();
            } else {
                return player.icewenxing_setnum > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "roundStart") return;
            if(Time === "changeHpAfter") return;
            if(Time === "damageAfter") {
                let count = trigger.num || 1;
                while (count > 0) {
                    count --;
                    player.icewenxing_damage ++;
                    player.icewenxing_setnum ++;
                    if(player.icewenxing_damage >= 3) {
                        break;
                    }
                }
                player.markSkill("icewenxing");
                player.update();
            } else if(Time === "phaseZhunbeiBegin") {
                const seenum = Math.min(5, Math.max(2, player.hp)) + 1;
                const Pile = ui.cardPile.childNodes.length;
                if (Pile < seenum) await game.washCard();
                const Pilewashed = ui.cardPile.childNodes.length;
                const disPile = ui.discardPile.childNodes.length;
                if (Pilewashed + disPile < seenum) return;
                let TXT = setColor("〖问星〗：是否要观看牌堆顶") + seenum + setColor("张牌？并可以任意顺序置于〖牌堆顶〗或〖牌堆底〗。");
                const chooseresult = await player.chooseBool(TXT).set('ai', function() {
                    const target = _status.currentPhase;
                    const num = player.icewenxing_setnum;
                    if (num <= 1) {
                        if (!player.icewenxing_usedByme) {
                            if (target === player) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }).forResult();
                if (chooseresult.bool) {
                    player.icewenxing_setnum --;
                    if(_status.currentPhase === player) {
                        /**
                         * 此设定仅为AI判断做的  辅助线！
                         */
                        player.icewenxing_usedByme = true;
                    }
                    player.markSkill("icewenxing");
                    const cardstop = get.cards(seenum);
                    game.cardsGotoOrdering(cardstop);
                    let TXT_one = setColor("〖问星〗：放置于〖牌堆顶〗！");
                    let TXT_middle = setColor("〖问星〗：请选择移动至〖牌堆顶↑〗或〖牌堆底↓〗。");
                    let TXT_two = setColor("〖问星〗：放置于〖牌堆底〗！");
                    const result = await player.chooseToMove("〖问星〗",true)
                    .set("list", [[TXT_one, []],[TXT_middle, cardstop],[TXT_two, []]])
                    .set("filterMove", (from, to, moved) => {
                        return true;
                    }).set('filterOk', (moved) => {
                        return moved[1].length === 0;
                    }).set("processAI", (list) => {
                        const cards = list[1][1];
                        let 排序后 = [[],[],[]];
                        const target = _status.currentPhase;//当前回合角色
                        const taoValue = compareValue(target, 'tao');
                        const shanValue = compareValue(target, 'shan');
                        const jiuValue = compareValue(target, 'jiu');
    
                        const judges = target.getCards("j");
                        const att = get.attitude(player, target);
                        if (att >= 2) {//若为友方
                            if (judges.length > 0) {//若队友判定区有牌
                                const cheats = setjudgesResult(judges, cards, player);
                                if (cheats && cheats.length > 0) {//如果有帮助对友改判的牌，则优先帮助
                                    const remainingCards = cards.filter(card => !cheats.includes(card));
                                    if (remainingCards.length === 0) {
                                        排序后 = [[...cheats],[],[]];
                                    } else {
                                        const 排序剩余卡片 = remainingCards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                        let secondtop = [], low = [];
                                        for (let card of 排序剩余卡片) {
                                            const value = get.value(card, target);
                                            if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                                if (secondtop.length < 2) {
                                                    secondtop.push(card);
                                                } else {
                                                    low.push(card);
                                                }
                                            } else {
                                                low.push(card);
                                            }
                                        }
                                        排序后 = [cheats.concat(secondtop), [], [...low]];
                                    }
                                } else {//若没有帮助对友改判的牌
                                    const 排序cards = cards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                    let top = [], low = [];
                                    const wuxieCards = player.getCards('hs').filter(card => get.name(card,player) === 'wuxie');
                                    if (wuxieCards && wuxieCards.length > 0) {//若玩家有无懈可击
                                        for (let card of 排序cards) {
                                            const value = get.value(card, target);
                                            if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                                if (top.length < 2) {
                                                    top.push(card);
                                                } else {
                                                    low.push(card);
                                                }
                                            } else {
                                                low.push(card);
                                            }
                                        }
                                        if (top.length === 0) {
                                            if (low.length > 0) {
                                                top.push(low[0]);
                                                low = low.slice(1);
                                            }
                                        }
                                        排序后 = [[...top], [], [...low]];
                                    } else {//若玩家没有无懈可击
                                        const livenum = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
                                        if (livenum >= 2) {
                                            排序后 = [[], [], cards];
                                        } else {
                                            const lowestValueCard = [排序cards[排序cards.length - 1]];
                                            const remainingCards = 排序cards.filter(card => !lowestValueCard.includes(card));
                                            if (remainingCards.length === 0) {
                                                排序后 = [[...lowestValueCard], [], []];
                                            } else {
                                                const 排序剩余卡片 = remainingCards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                                let secondtop = [], low = [];
                                                for (let card of 排序剩余卡片) {
                                                    const value = get.value(card, target);
                                                    if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                                        if (secondtop.length < 2) {
                                                            secondtop.push(card);
                                                        } else {
                                                            low.push(card);
                                                        }
                                                    } else {
                                                        low.push(card);
                                                    }
                                                }
                                                排序后 = [lowestValueCard.concat(secondtop), [], [...low]];
                                            }
                                        }
                                    }
                                }
                            } else {//若队友判定区无牌
                                const 排序cards = cards.sort((a, b) => get.value(b, target) - get.value(a, target));
                                let top = [], low = [];
                                for (let card of 排序cards) {
                                    const value = get.value(card, target);
                                    if (value >= taoValue - 0.5 || value >= shanValue - 0.5 || value >= jiuValue - 0.5) {
                                        if (top.length < 2) {
                                            top.push(card);
                                        } else {
                                            low.push(card);
                                        }
                                    } else {
                                        low.push(card);
                                    }
                                }
                                if (top.length === 0) {
                                    if (low.length > 0) {
                                        top.push(low[0]);
                                        low = low.slice(1);
                                    }
                                }
                                排序后 = [[...top], [], [...low]];
                            }
                        } else {//若为敌方
                            if (judges.length > 0) {//若敌方判定区有牌
                                const cheats = setjudgesResult(cards, judges, player, true);
                                if (cheats && cheats.length > 0) {//若存在可以帮助对敌改判的牌
                                    const remainingCards = cards.filter(card => !cheats.includes(card));
                                    if (remainingCards.length === 0) {
                                        排序后 = [[],[],[...cheats]];
                                    } else {
                                        const 排序剩余卡片 = remainingCards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                        let top = [], secondlow = [];
                                        for (let card of 排序剩余卡片) {
                                            const value = get.value(card, target);
                                            if (value < taoValue - 0.5 || value < shanValue - 0.5 || value < jiuValue - 0.5) {
                                                if (top.length < 2) {
                                                    top.push(card);
                                                } else {
                                                    secondlow.push(card);
                                                }
                                            } else {
                                                secondlow.push(card);
                                            }
                                        }
                                        if (top.length === 0) {
                                            if (secondlow.length > 0) {
                                                top.push(secondlow[0]);
                                                secondlow = secondlow.slice(1);
                                            }
                                        }
                                        排序后 = [[...top], [], cheats.concat(secondlow)];
                                    }
                                } else {//若没有帮助对敌改判的牌
                                    const 排序cards = cards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                    let top = [], low = [];
                                    for (let card of 排序cards) {
                                        const value = get.value(card, target);
                                        if (value < taoValue - 0.5 || value < shanValue - 0.5 || value < jiuValue - 0.5) {
                                            if (top.length < 2) {
                                                top.push(card);
                                            } else {
                                                low.push(card);
                                            }
                                        } else {
                                            low.push(card);
                                        }
                                    }
                                    if (top.length === 0) {
                                        if (low.length > 0) {
                                            top.push(low[0]);
                                            low = low.slice(1);
                                        }
                                    }
                                    排序后 = [[...top], [], [...low]];
                                }
                            } else {
                                const 排序cards = cards.sort((a, b) => get.value(a, target) - get.value(b, target));
                                let top = [], low = [];
                                for (let card of 排序cards) {
                                    const value = get.value(card, target);
                                    if (value < taoValue - 0.5 || value < shanValue - 0.5 || value < jiuValue - 0.5) {
                                        if (top.length < 2) {
                                            top.push(card);
                                        } else {
                                            low.push(card);
                                        }
                                    } else {
                                        low.push(card);
                                    }
                                }
                                if (top.length === 0) {
                                    if (low.length > 0) {
                                        top.push(low[0]);
                                        low = low.slice(1);
                                    }
                                }
                                排序后 = [[...top], [], [...low]];
                            }
                        }
                        return 排序后;
                    }).set('forced', true).forResult();
                    if (result.bool) {
                        let topcards = result.moved[0];
                        let bottomcards = result.moved[2];
                        if (topcards.length > 0) {
                            const first = ui.cardPile.firstChild;
                            for (let card of topcards) {
                                ui.cardPile.insertBefore(card, first);
                            }
                            player.popup(get.cnNumber(topcards.length) + '上');
                            game.log(player, '将' + get.cnNumber(topcards.length) + '张牌置于牌堆顶！');
                            player.update();
                            game.updateRoundNumber();
                        }
                        if (bottomcards.length > 0) {
                            for (let card of bottomcards) {
                                ui.cardPile.appendChild(card);
                            }
                            player.popup(get.cnNumber(bottomcards.length) + '下');
                            game.log(player, '将' + get.cnNumber(bottomcards.length) + '张牌置于牌堆底！');
                            player.update();
                            game.updateRoundNumber();
                        }
                        if (topcards.length === 0) {
                            await player.loseHp();
                        }
                    }
                }
            }
        },
        "_priority": 0,
    },
    //舌战
    iceshezhan: {
        audio: "ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        prompt: "请选择拼点的角色！",
        groupSkill: "wu",
        async init(player, skill) {
            if(!player.iceshezhan_Compare) player.iceshezhan_Compare = 0;
            if(!player.hasSkill("iceshezhan_clear")) {
                player.addSkill("iceshezhan_clear");               
            }
            player.update();
        },
        filter: function(event, player) {
            if(player.group !== "wu") return false;
            if(player.hasSkill("iceshezhan_off")) return false;
            const targets = game.players.filter(o => o !== player && o.isAlive());
            if(!targets || targets.length === 0) return false;
            for(let target of targets) {
                if(!target.hasSkill("iceshezhan_used") && player.canCompare(target)) {
                    return true;
                }
            }
        },
        filterTarget: function(card, player, target) {
            return target !== player && player.canCompare(target) && !target.hasSkill("iceshezhan_used");
        },
        selectTarget: 1,
        ai2: function(target) {
            const player = _status.event.player;
            const att = get.attitude(player, target);
            const phs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
            const ths = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
            return att < 2 && (get.number(phs[0]) > get.number(ths[0]));
        },
        async content(event, trigger, player) {
            if(!player.iceshezhan_Compare) player.iceshezhan_Compare = 0;
            const target = event.targets[0];
            if(!target.hasSkill("iceshezhan_used")) target.addTempSkill("iceshezhan_used");
            let { result } = await player.chooseToCompare(target);
            if(result.bool) {
                player.iceshezhan_Compare ++;
                await player.draw();
                if(!target.hasSkill("iceshezhan_damage")) {
                    target.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    target.markSkill("iceshezhan_damage");
                }
            } else if (result.tie) {
                const winnum = player.iceshezhan_Compare;
                let numdraw = Math.max(1,Math.min(3,winnum));
                if(numdraw > 0) await player.draw(numdraw);
                if(!player.hasSkill("iceshezhan_off")) player.addTempSkill("iceshezhan_off");

                if(!player.hasSkill("iceshezhan_damage")) {
                    player.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    player.markSkill("iceshezhan_damage");
                }
                if(!target.hasSkill("iceshezhan_damage")) {
                    target.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    target.markSkill("iceshezhan_damage");
                }
            } else {
                const winnum = player.iceshezhan_Compare;
                let numdraw = Math.max(1,Math.min(3,winnum));
                if(numdraw > 0) await player.draw(numdraw);
                if(!player.hasSkill("iceshezhan_off")) player.addTempSkill("iceshezhan_off");

                if(!player.hasSkill("iceshezhan_damage")) {
                    player.addTempSkill("iceshezhan_damage", {player:"phaseBegin"});
                    player.markSkill("iceshezhan_damage");
                }
            }
        },
        ai: {
            order: 13,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3;
                } else {
                    return 0.5;
                }
            },
            result: {
                target: function(player,target){
                    const enemys = game.players.filter(o => o !== player && o.isAlive() && get.attitude(player, o) < 2 && !o.hasSkill("iceshezhan_used") && player.canCompare(o));
                    if(!enemys || enemys.length === 0) return 0;
                    for(let enemy of enemys) {
                        const phs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                        const ths = enemy.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                        if(get.number(phs[0]) > get.number(ths[0])) {
                            return -10;
                        }
                    }
                    return 0;
                },
            },
        },
        subSkill: {
            off: {
                charlotte:true,
                unique:true,
                sub: true,
                sourceSkill: "iceshezhan",
                "_priority": Infinity,
            },
            used: {
                charlotte:true,
                unique:true,
                sub: true,
                sourceSkill: "iceshezhan",
                "_priority": Infinity,
            },
            damage: {
                mark:true,
                marktext:"<font color= #AFEEEE>增伤</font>",
                intro:{
                    mark: function(dialog, storage, player) {
                        dialog.addText(setColor("〖舌战·增伤〗：受到的伤害 + 1！"));
                    },
                    markcount: function(storage, player) {
                        const num = player.iceshezhan_damage;
                        if (num && num > 0) {
                            return num;
                        } else {
                            return 0;
                        }
                    },
                    onunmark: true,
                    name:"<font color= #AFEEEE>舌战·增伤</font>",
                },
                trigger: {
                    player: "damageBegin",
                },
                charlotte:true,
                unique:true,
                direct:true,
                async init(player, skill) {
                    if(!player.iceshezhan_damage) player.iceshezhan_damage = 3;
                },
                filter: function (event, player) {
                    const source = event.source;
                    if (!source) return false;
                    return event.num > 0 && player.iceshezhan_damage > 0;
                },
                async content(event, trigger, player) {
                    trigger.num++;
                    player.iceshezhan_damage--;
                    player.markSkill("iceshezhan_damage");
                    const num = player.iceshezhan_damage;
                    if (num && num <= 0) {
                        player.unmarkSkill("iceshezhan_damage");
                        player.removeSkill("iceshezhan_damage");
                        player.update();
                    }
                },
                sub: true,
                sourceSkill: "iceshezhan",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    iceshezhan_clear: {
        trigger: {
            global: "phaseAfter",
            player: "compare",
            target: "compare",
        },
        charlotte:true,
        unique:true,
        direct:true,
        silent: true,
        popup: false,
        filter: function(event, player,name) {
            if(player.group !== "wu") return false;
            if(!player.hasSkill("iceshezhan")) return false;
            if(name === "phaseAfter") {
                if(!player.iceshezhan_Compare) player.iceshezhan_Compare = 0;
                player.iceshezhan_Compare = 0;
                return;
            } else {
                if (event.player == player) {
                    return !event.iwhile && get.number(event.card1) == 7;
                } else {
                    return get.number(event.card2) == 7;
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time === "phaseAfter") return;
            game.log(player, "拼点牌点数视为", "#yK");
            if (player == trigger.player) {
                trigger.num1 = 13;
            } else {
                trigger.num2 = 13;
            }
        },
        "_priority": Infinity,
    },
    //隆对基本
    icelongdui_basic: {
        mark:true,
        marktext:"<font color= #AFEEEE>基本</font>",
        intro:{
            content: function (storage, player) {
                return setColor("使用基本牌的基础数值 + 1！");;
            },
            onunmark: true,
            name:"<font color= #AFEEEE>隆对·基本</font>",
        },
        trigger:{
            player:["useCard","phaseBegin"],
        },
        persevereSkill:true,
        charlotte:true,
        unique:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === "useCard") {
                return get.type(event.card) == "basic";
            } else if (name === "phaseBegin") {
                player.unmarkSkill("icelongdui_basic");
                player.removeSkill("icelongdui_basic");
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseBegin") return;
            trigger.baseDamage++;
            game.log(player, "使用的", trigger.card, "基础数值+1");
        },
        "_priority":520,
    },
    //隆对锦囊
    icelongdui_trick: {
        mark:true,
        marktext:"<font color= #AFEEEE>锦囊</font>",
        intro:{
            content: function (storage, player) {
                return setColor("使用普通锦囊牌时可为之增加/减少一个目标！");;
            },
            onunmark: true,
            name:"<font color= #AFEEEE>隆对·锦囊</font>",
        },
        trigger:{
            player:["useCard","phaseBegin"],
        },
        persevereSkill:true,
        charlotte:true,
        unique:true,
        direct:true,
        filter:function (event, player, name) {
            if (name === "useCard") {
                const cardinfo = get.info(event.card, false);
                if (cardinfo.allowMultiple === false) return false;
                if (cardinfo.multitarget === false) return false;
                if (cardinfo.type === "trick") {
                    const targets = event.targets;
                    if (!targets || targets.length === 0) return false;
                    const hastargets = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(event.card, player, o));
                    if (hastargets && hastargets.length > 0) {
                        return true;
                    }
                    if (targets && targets.length > 1) {
                        return true;
                    }
                    return false;
                }
                return false;
            } else if (name === "phaseBegin") {
                player.unmarkSkill("icelongdui_trick");
                player.removeSkill("icelongdui_trick");
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseBegin") return;
            const targets = trigger.targets;
            let text1 = "为" + get.translation(trigger.card) + "增加一个目标";
            let text2 = "为" + get.translation(trigger.card) + "减少一个目标";
            let lists = [];
            let Control1 = false, Control2 = false;
            const hastargets = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, player, o));
            if (hastargets && hastargets.length > 0) {
                lists.push(text1);
                Control1 = true;
            }
            if (targets && targets.length > 1) {
                lists.push(text2);
                Control2 = true;
            }
            if (lists.length === 0) return;
            if (!lists.includes('cancel2')) lists.push('cancel2');
            const result = await player.chooseControl(lists).set ("ai", control => {
                const effect = get.effect(player, trigger.card, player, player);
                if (effect > 0) {//如果此牌站在玩家自身角度为正收益
                    if (Control1) {
                        const hasFriends = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, player, o) && get.attitude(player, o) >= 2);
                        if (hasFriends && hasFriends.length > 0) return text1;
                    }
                    if (Control2) {
                        const hasEmptys = game.players.filter(o => o.isAlive() && targets.includes(o) && get.attitude(player, o) < 2);
                        if (hasEmptys && hasEmptys.length > 0) return text2;
                    }
                    return 'cancel2';
                } else if (effect < 0) {//如果此牌站在玩家自身角度为负收益
                    if (Control1) {
                        const hasEmptys = game.players.filter(o => o.isAlive() && !targets.includes(o) && lib.filter.targetEnabled2(trigger.card, player, o) && get.attitude(player, o) < 2);
                        if (hasEmptys && hasEmptys.length > 0) {
                            for (let Empty of hasEmptys) {
                                if (get.effect(Empty, trigger.card, player, player) < 0) {
                                    return text1;//如果此牌站在玩家角度，对某个敌方释放时也是负收益，则增加目标
                                }
                            }
                        }
                    }
                    if (Control2) {//如果此牌站在玩家自身角度为负收益
                        const hasFriends = game.players.filter(o => o.isAlive() && targets.includes(o) && get.attitude(player, o) >= 2);
                        if (hasFriends && hasFriends.length > 0) {
                            for (let Friend of hasFriends) {
                                if (get.effect(Friend, trigger.card, player, player) < 0) {
                                    return text2;//如果此牌目标中有友方，且站在玩家角度看友方对此牌的收益也为负收益，则减少目标
                                }
                            }
                        }
                    }
                    return 'cancel2';
                }
                return 'cancel2';
            }).forResult();
            if (result.control === 'cancel2') return;
            let TXT = "";
            if (result.control === text1) {
                TXT = text1;
            } else if (result.control === text2) {
                TXT = text2;
            }
            const chooseresult = await player.chooseTarget(TXT, function (card, player, target) {
                if (result.control === text1) {
                    return !targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target);
                } else if (result.control === text2) {
                    return targets.includes(target);
                }
            }).set("ai", function (target) {
                const player = _status.event.player;
                const card = _status.event.getTrigger().card;
                if (result.control === text1) {
                    return get.effect(target, card, player, player);
                } else if (result.control === text2) {
                     return -get.effect(target, card, player, player);
                }
            }).set('forced', true).forResult();
            if (chooseresult.bool) {
                const target = chooseresult.targets[0];
                if (result.control === text1) {
                    game.log(player, "为〖" + get.translation(trigger.card) + "〗增加了一个目标：" + get.translation(target));
                    if (!targets.includes(target)) {
                        targets.push(target);
                    }
                } else if (result.control === text2) {
                    game.log(player, "为〖" + get.translation(trigger.card) + "〗减少了一个目标：" + get.translation(target));
                    if (targets.includes(target)) {
                        targets.splice(targets.indexOf(target), 1);
                    }
                }
            }
        },
        "_priority":521,
    },
    //隆对装备
    icelongdui_equip: {
        mark:true,
        marktext:"<font color= #AFEEEE>上限</font>",
        intro:{
            content: function (storage, player) {
                const ecardsnum = player.getCards("e").length;
                return "手牌上限 + " + ecardsnum + "！";
            },
            onunmark: true,
            name:"<font color= #AFEEEE>隆对·上限</font>",
        },
        mod: {
            maxHandcard: function (player, num) {
                const ecardsnum = player.getCards("e").length;
                return num + ecardsnum;
            },
        },
        trigger:{
            player:["phaseBegin"],
        },
        persevereSkill:true,
        charlotte:true,
        unique:true,
        direct:true,
        filter:function (event, player) {
            player.unmarkSkill("icelongdui_equip");
            player.removeSkill("icelongdui_equip");
            player.update();
        },
        "_priority":522,
    },
    //SE贾诩
    thunderweimu: {
        audio: "ext:银竹离火/audio/skill:4",
        mark: true,
        marktext: "<font color= EE9A00>帷幕</font>",
        intro: {
            content: function (storage, player) {
                let prompt = "<font color= #EE9A00>帷幕·已声明:</font>";
                const used = player.thunderweimu?.used || [];
                if (used && used.length > 0) {
                    const namelist = used.map(name => get.translation(name));
                    prompt += namelist.join("、") + "。";
                } else {
                    prompt += "无。";
                }
                return prompt;
            },
            markcount: function (storage, player) {
                return player.thunderweimu?.used.length || 0;
            },
            onunmark: true,
            name: "<font color= EE9A00>帷幕</font>",
        },
        mod:{
            targetEnabled:function (card, player, target) {
                const used = target.thunderweimu?.used || [];
                if (used && used.length > 0) {
                    if (player !== target) {
                        if (card && card.name && used.includes(card.name)) {
                            return false;
                        }
                    }
                }
            },
            playerEnabled:function (card, player, target) {
                const used = player.thunderweimu?.used || [];
                if (used && used.length > 0) {
                    if (player !== target) {
                        if (card && card.name && used.includes(card.name)) {
                            return false;
                        }
                    }
                }
            },
        },
        trigger: {
            global: ["phaseBegin","useCardAfter","roundStart"],
        },
        locked: false,
        direct:true,
        async init(player, skill) {
            if (!player.thunderweimu) player.thunderweimu = { used: [], usedSkill: false };
            if (!player.clearWeimu) player.clearWeimu = function() {
                player.thunderweimu.used = [];
            };
            if (!player.getWeimuTrick) player.getWeimuTrick = function(target) {
                let canUselist = [];
                const used = player.thunderweimu?.used || [];
                const cardnames = lib.inpile.filter(name => !used.includes(name) && get.type(name) === "trick");
                if (!cardnames || cardnames.length == 0) return canUselist;
                const cards = player.getCards("h");
                if(!cards || cards.length == 0) return canUselist;
                for(const name of cardnames) {
                    const Vcard = { name: name, nature: '', isCard: true, thunderweimu: true };
                    if(target.hasUseTarget(Vcard) && player.hasUseTarget(Vcard)) {
                        canUselist.push(Vcard);
                    }
                }
                return canUselist;
            };
        },
        filter:function(event, player, name){
            if(name == "roundStart") { 
                player.clearWeimu(); 
                return; 
            } else if(name=="phaseBegin") {
                return player.getWeimuTrick(event.player).length > 0;
            } else if(name=="useCardAfter") {
                return event.card && event.card.thunderweimu;
            }
        },
        async addUsedCards(player, Vcard) {
            const name = Vcard.name;
            const used = player.thunderweimu?.used;
            if (!used || !Array.isArray(used)) return;
            if (!Vcard.thunderweimu) return;
            if (!used.includes(name)) {
                player.thunderweimu.used.push(name);
            }
            player.markSkill("thunderweimu");
        },
        async useWeimu(event, trigger, player) {
            const Time = event.triggername;
            let target = null;
            if (Time === "phaseBegin") {
                target = trigger.player;
            } else if (Time === "phaseEnd") {
                target = player;
            }
            const ViewAs = player.getWeimuTrick(target);
            if (!ViewAs || ViewAs.length == 0) return;
            let lists = [];
            for (let card of ViewAs) {
                const type = get.type(card);
                lists.push([type, '', card.name, card.nature]);
            }
            function getValueCardsAI() {//是否触发技能AI，因为两次联动封装一下！
                let getValueCards = [];
                if (Time === "phaseBegin") {
                    const sortlist = ViewAs.sort((a, b) => target.getUseValue(b) - target.getUseValue(a));
                    const attitude = get.attitude(player, target);
                    if (attitude > 0) {
                        getValueCards = [sortlist[0]];
                    } else {
                        const getTValuelist = ViewAs.filter(card => target.hasValueTarget(card) && target.getUseValue(card) > 0);
                        const uninTValuelist = ViewAs.filter(card => !getTValuelist.includes(card));
                        if (uninTValuelist.length > 0) {
                            const sortlist = uninTValuelist.sort((a, b) => target.getUseValue(a) - target.getUseValue(b));
                            getValueCards = [sortlist[0]];
                        }
                        const compareNum = Math.max(1, Math.floor(target.maxHp / 3));
                        if (getAliveNum(target, 1) <= compareNum) {
                            const sortlist = getTValuelist.sort((a, b) => target.getUseValue(a) - target.getUseValue(b));
                            getValueCards = [sortlist[0]];
                        }
                    }
                } else if (Time === "phaseEnd") {
                    const sortlist = ViewAs.sort((a, b) => target.getUseValue(b) - target.getUseValue(a));
                    getValueCards = [sortlist[0]];
                }
                return getValueCards;
            }
            const prompt = setColor("〖帷幕〗: 是否展示一张手牌，然后声明一张本轮未声明的普通锦囊牌名并摸一张牌，然后令" + get.translation(target) + "选择一项：1.失去一点体力视为使用你声明的牌；2.你将你展示的牌当作声明的牌使用？");
            const cards = await player.chooseCard('h',prompt,function(card) {
                const cards = player.getCards("h");
                return cards.includes(card);
            }).set("ai", function (card) {
                const cards = player.getCards("h").sort((a, b) => get.value(a, player) - get.value(b, player));
                if (Time === "phaseBegin") {
                    const getValueCards = getValueCardsAI();//第一次调用
                    if (getValueCards.length === 0) return false;
                    const key1 = get.value(card,player) < compareValue(player,'tao');
                    const key2 = get.value(card,player) <= get.value(cards[0],player) * 1.05;
                    return key1 && key2;
                } else if (Time === "phaseEnd") {//强制执行
                    return get.value(card,player) <= get.value(cards[0],player);
                }
            }).set('forced', Time === "phaseEnd").forResultCards();//如果是回合结束后执行，则改为强制执行！因为【谋身的设定】
            if (cards && cards.length) {
                if (Time === "phaseBegin") {
                    player.thunderweimu.usedSkill = true;
                    player.logSkill(event.name, target, 'ice');
                }
                if (Time === "phaseEnd") {
                    player.thunderweimu.usedSkill = false;
                    player.line(target, 'ice');
                }
                const showcard = cards[0];
                await player.showCards([showcard]);
                const chooseButton = await player.chooseButton([
                    "〖帷幕〗：请选择声明一个普通锦囊牌名：",
                    [lists, "vcard"]
                ]).set("ai", function (button) {
                    const getValueCards = getValueCardsAI();//第二次调用
                    if (getValueCards.length === 0) return false;
                    return button.link[2] === getValueCards[0].name;
                }).set('forced', true).forResult();
                if (chooseButton.bool) {
                    const Vcard = { name: chooseButton.links[0][2], nature: chooseButton.links[0][3], isCard: true, thunderweimu: true };
                    const cardtext = get.translation(Vcard.name);
                    player.popup(cardtext);//声明的牌名
                    game.log(player,"声明的锦囊牌名为：" + cardtext + "，并令" ,target, "执行","#g【帷幕】","选项。");
                    await player.draw();
                    const list = [
                        setColor("〖选项一〗：失去一点体力视为使用" + get.translation(player) + "声明的" + cardtext + "。"),
                        setColor("〖选项二〗：" + get.translation(player) + "将其展示的" + get.translation(showcard) + "当作声明的" + cardtext + "使用，"),
                    ];
                    const txt = setColor("〖帷幕〗：请选择一项执行之！")
                    const targetchooseButton = await target.chooseButton([txt,
                        [list.map((item, i) => {return [i, item];}),"textbutton",],
                    ]).set("filterButton", function (button) {
                        if (button.link === 0) { //帷幕①
                            return target.hp > 0;
                        } else if (button.link === 1) { //帷幕②
                            const cards = player.getCards("h");
                            return cards.includes(showcard);
                        }
                    }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                        function getButtonLink() {//获取可选项
                            let linklist = [];
                            if (target.hp > 0) linklist.push(0);
                            const cards = player.getCards("h");
                            if (cards.includes(showcard)) linklist.push(1);
                            return linklist;
                        };
                        function getValueNum() {//公平站在目标角度获取最优选项
                            const linklist = getButtonLink();
                            if (linklist.includes(1) && target === player) return 1;
                            const compareNum = Math.max(1, Math.floor(target.maxHp / 3));
                            const usekey = target.hasValueTarget(Vcard) && target.getUseValue(Vcard) > 0
                            if (linklist.includes(0) && usekey && getAliveNum(target, 1) > compareNum) return 0;
                            if (linklist.includes(1)) return 1;
                            return -1;
                        };
                        const Num = getValueNum();
                        if(Num === -1) return;//不执行！
                        switch (button.link) {
                            case 0:
                                return getValueNum() === 0;
                            case 1:
                                return getValueNum() === 1;
                        }
                    }).forResult();
                    if (targetchooseButton.bool) {
                        const choices = targetchooseButton.links;
                        if (choices.includes(0)) {
                            target.chat("我选择了〖帷幕①〗。");
                            game.log(target,'选择了〖帷幕①〗。');
                            await target.loseHp();
                            await target.chooseUseTarget(Vcard, true, false);
                        } else if (choices.includes(1)) {
                            target.chat("我选择了〖帷幕②〗。");
                            game.log(target,'选择了〖帷幕②〗。');
                            await player.viewAsToUse(Vcard,cards,null,true,true,true);
                        }
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time === "phaseBegin") {
                const useWeimu = lib.skill.thunderweimu.useWeimu;
                await useWeimu(event, trigger, player);
            } else if (Time === "useCardAfter") {
                const addUsedCards = lib.skill.thunderweimu.addUsedCards;
                await addUsedCards(player, trigger.card);
            }
        },
        "_priority": Infinity,
    },
    thunderwenhe: {
        audio: "ext:银竹离火/audio/skill:4",
        trigger: {
            global: ["chooseToRespondBegin","chooseToUseBegin", "useCardToTargeted","phaseAfter"],
        },
        firstDo: true,
        locked: false,
        direct:true,
        async init(player, skill) {
            if (!player.thunderwenhe) player.thunderwenhe = { 
                shaned: false, //首次
                basiced: false, //首次
                used_basic: false, //打出基本牌
                used_loseHp: false //失去体力
            };
            if (!player.clearWenhe) player.clearWenhe = function() {
                player.thunderwenhe.shaned = false;
                player.thunderwenhe.basiced = false;
                player.thunderwenhe.used_basic = false;
                player.thunderwenhe.used_loseHp = false;
            };
        },
        filter:function(event, player, name){
            if(name=="chooseToRespondBegin" || name=="chooseToUseBegin"){
                if (event.responded) return false;
                if (!event.filterCard || !event.filterCard({ name: "shan" }, event.player, event)) return false;
                if (event.name == "chooseToRespond" && !lib.filter.cardRespondable({ name: "shan" }, event.player, event)) return false;
                return !player.thunderwenhe.shaned && event.player && event.player !== player;
            } else if(name=="useCardToTargeted"){
                const card = event.card;
                const cards = event.cards;
                const targets = event.targets;
                if (!card || !targets || get.type(card) !== "basic" || !cards || cards.length === 0) return false;
                return !player.thunderwenhe.basiced && event.player && event.player !== player;;
            } else if(name=="phaseAfter"){
                player.clearWenhe();
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const skillprompt = setColor("〖文和〗：是否摸一张牌：");
            const prompt1 = setColor("〖选项一〗：选择〖打出一张基本牌〗");
            const prompt2 = setColor("〖选项二〗：选择〖失去一点体力〗");
            let lists = [];
            if(Time == "chooseToRespondBegin" || Time == "chooseToUseBegin"){
                const target = trigger.player;
                player.thunderwenhe.shaned = true;
                const prompt = setColor("跳过" + get.translation(target) + "〖闪〗的询问，令其视为使用之。");
                lists.push(prompt1 + prompt, prompt2 + prompt);
            } else if(Time == "useCardToTargeted"){
                const target = trigger.player;
                const card = trigger.card;
                player.thunderwenhe.basiced = true;
                const prompt = "取消" + get.translation(target) + "此次使用的" + get.translation(card) + "，令其视为使用之。";
                lists.push(prompt1 + prompt, prompt2 + prompt);
            }
            const chooseButton = await player.chooseButton([skillprompt,
                [lists.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    let cards = player.getCards("hs").filter(c => {
                        return get.type(c) === "basic" && player.hasUseTarget(c) && lib.filter.cardEnabled(c, player, "forceEnable");
                    });
                    return cards.length > 0;
                } else if (button.link === 1) {
                    return player.hp > 0;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                function getButtonLink() {//获取可选项
                    let linklist = [];
                    const cards = player.getCards("hs").filter(c => {
                        return get.type(c) === "basic" && player.hasUseTarget(c);
                    });
                    if (cards && cards.length > 0) linklist.push(0);
                    if (player.hp > 0) linklist.push(1);
                    return linklist;
                };
                function getValueNum() {//获取最优选项
                    const linklist = getButtonLink();
                    const target = trigger.player;
                    if (get.attitude(player, target) < 2) return -1;
                    if (linklist.includes(0)) {
                        const cards = player.getCards("hs").filter(c => {
                            return get.type(c) === "basic" && 
                            player.hasUseTarget(c) && 
                            player.hasValueTarget(c) && 
                            player.getUseValue(c) > 0 &&
                            lib.filter.cardEnabled(c, player, "forceEnable");
                        });
                        if (cards && cards.length > 0) return 0;
                    }
                    if (linklist.includes(1)) {
                        const shans = target.getCards("hes").filter(c => get.name(c) === "shan");
                        if (shans && shans.length > 0) return -1;
                        if (target === player) return 1;
                        if (getAliveNum(target,1) <= 0 && getAliveNum(player, 1) > 1) return 1;
                    }
                    return -1;
                };
                if(getValueNum() === -1) return false;//不执行！
                switch (button.link) {
                    case 0:
                        return getValueNum() === 0;
                    case 1:
                        return getValueNum() === 1;
                }
            }).forResult();
            if (chooseButton.bool) {
                const choices = chooseButton.links;
                player.logSkill(event.name, trigger.player, 'ice');
                await player.draw();
                if (choices.includes(0)) {
                    const cards = player.getCards("hes").filter(c => {
                        return get.type(c) === "basic" && player.hasUseTarget(c) && lib.filter.cardEnabled(c, player, "forceEnable");
                    });
                    if (!cards || cards.length === 0) return;
                    const next = player.chooseToUse(true);
                    next.set("prompt", "请选择使用或打出一张基本牌");
                    next.set("filterCard", function (card, player) {
                        return cards.includes(card);
                    });
                    next.set("addCount", true);
                    next.set("ai1", function (card) {
                        return 1;
                    });
                    player.thunderwenhe.used_basic = true;
                    if(Time == "chooseToRespondBegin" || Time == "chooseToUseBegin"){
                        trigger.untrigger();
                        trigger.set("responded", true);
                        trigger.result = { bool: true, card: { name: "shan", nature: "", isCard: true, thunderwenhe: true } };
                    } else if(Time == "useCardToTargeted"){
                        const Parent = trigger.getParent();
                        if (Parent) {
                            const targets = Parent.targets;
                            if (targets && targets.length > 0) Parent.targets = [];
                            if (trigger.cards && trigger.cards.length > 0) {
                                await trigger.player.gain(trigger.cards, "gain2");
                            }
                            const Vcard = { 
                                name: trigger.card.name, 
                                nature: trigger.card?.nature || "", 
                                isCard: true, 
                                thunderwenhe: true 
                            };
                            await trigger.player.viewAsToUse(Vcard,null,targets,true,false,false);
                        }
                    }
                } else if (choices.includes(1)) {
                    await player.loseHp();
                    player.thunderwenhe.used_loseHp = true;
                    if(Time == "chooseToRespondBegin" || Time == "chooseToUseBegin"){
                        trigger.untrigger();
                        trigger.set("responded", true);
                        trigger.result = { bool: true, card: { name: "shan", nature: "", isCard: true, thunderwenhe: true } };
                    } else if(Time == "useCardToTargeted"){
                        const Parent = trigger.getParent();
                        if (Parent) {
                            const targets = Parent.targets;
                            if (targets && targets.length > 0) Parent.targets = [];
                            if (trigger.cards && trigger.cards.length > 0) {
                                await trigger.player.gain(trigger.cards, "gain2");
                            }
                            const Vcard = { 
                                name: trigger.card.name, 
                                nature: trigger.card?.nature || "", 
                                isCard: true, 
                                thunderwenhe: true 
                            };
                            await trigger.player.viewAsToUse(Vcard,null,targets,true,false,false);
                        }
                    }
                }
            }
        },
        "_priority": 5210,
    },
    thundermoushen: {
        audio: "ext:银竹离火/audio/skill:4",
        mod:{
            playerEnabled:function (card, player, target) {
                if (player !== target && player.isPhaseUsing()) {
                    if (card && get.type(card) && get.type(card) === "basic") {
                        return false;
                    }
                }
            },
        },
        trigger: {
            player: ["gainEnd"],
            global: ["phaseEnd","loseAsyncEnd","phaseAfter"],
        },
        locked: true,
        direct: true,
        async init(player, skill) {
            const init1 = lib.skill.thunderweimu.init;
            const init2 = lib.skill.thunderwenhe.init;
            if (init1 && typeof init1 === "function") {
                await init1(player, skill);
            } else if (init2 && typeof init2 === "function") {
                await init2(player, skill);
            }
            if (!player.thundermoushen) player.thundermoushen = {
                gaincards: false, //是否获得过牌
            };
            if (!player.moushen) player.moushen = {
                one: {
                    name: "项一",
                    number: 1,
                    merge: false,
                    async content(event, trigger, player) {
                        const func1 = async function(num){
                            if (player.thunderweimu?.usedSkill === true) return;
                            const useWeimu = lib.skill.thunderweimu.useWeimu;
                            while (num > 0) {
                                num--;
                                await useWeimu(event, trigger, player);
                            }
                        };
                        const setnum = player.moushen.one.number;
                        await func1(setnum);
                    }
                },
                two: {
                    name: "项二",
                    number: 2,
                    merge: false,
                    async content(event, trigger, player) {
                        const func2 = async function(num){
                            if (player.thunderwenhe?.used_basic === true) return;
                            let cards = player.getCards("hs").filter(c => {
                                return get.type(c) === "basic" && player.hasUseTarget(c) && lib.filter.cardEnabled(c, player, "forceEnable");
                            });
                            if (!cards || cards.length === 0) return;
                            let useNum = Math.min(num, cards.length);
                            while (useNum > 0 ) {
                                let checkcards = player.getCards("hs").filter(c => {
                                    return get.type(c) === "basic" && player.hasUseTarget(c) && lib.filter.cardEnabled(c, player, "forceEnable");
                                });
                                if (!checkcards || checkcards.length === 0) return;
                                const next = player.chooseToUse();
                                next.set("forced", useNum > 0);
                                next.set("prompt", "请选择使用或打出一张基本牌");
                                next.set("filterCard", function (card, player) {
                                    return checkcards.includes(card);
                                });
                                next.set("selectCard", 1);
                                next.position = "hs";
                                next.set("addCount", false);
                                next.set("ai1", function (card) {
                                    return useNum > 0;
                                });
                                useNum--;
                            }
                        };
                        const setnum = player.moushen.two.number;
                        await func2(setnum);
                    }
                },
                three: {
                    name: "项三",
                    number: 3,
                    merge: true,//初始化，此项设定为合并项
                    async content(event, trigger, player) {
                        const func3 = async function(num){
                            if (player.thunderwenhe?.used_loseHp === true) return;
                            await player.loseHp();
                            await player.specifyCards("basic",num);
                            const getMergeitems = lib.skill.thundermoushen.getMergeitems;
                            if (getMergeitems(player).length === 0) return;
                            const lists = [];
                            for (let skillname of getMergeitems(player)) {
                                if (player.moushen[skillname]) {
                                    const name = player.moushen[skillname].name;
                                    lists.push(name);
                                }
                            }
                            const result = await player.chooseControl(lists).set ("ai", () => {
                                return lists.randomGet();
                            }).set('forced', true).forResult();
                            if (result.control) {
                                const index = lists.indexOf(result.control);
                                const skillname = getMergeitems(player)[index];
                                const upDateMergeitems = lib.skill.thundermoushen.upDateMergeitems;
                                const updateresult = upDateMergeitems(player, skillname);
                            }
                        };
                        const setnum = player.moushen.three.number;
                        await func3(setnum);
                    }
                },
                four: {
                    name: "项四",
                    number: 4,
                    merge: false,
                    async content(event, trigger, player) {
                        const func4 = async function(num){
                            if (player.thundermoushen?.gaincards === true) return;
                            await player.recover();
                            await player.chooseToDiscard(num, 'he', true);
                            /*
                            const cards = player.getCardsform().filter(c => get.type(c) !== "basic");
                            if (cards && cards.length > 0) {
                                await player.gain(cards[0], "gain2");
                            }
                                */
                            player.moushen.one.name = "项一";
                            player.moushen.one.number = 1;
                            player.moushen.one.merge = false;
                            player.moushen.two.name = "项二";
                            player.moushen.two.number = 2;
                            player.moushen.two.merge = false;
                            player.moushen.three.name = "项三";
                            player.moushen.three.number = 3;
                            player.moushen.three.merge = true;
                            player.moushen.four.name = "项四";
                            player.moushen.four.number = 4;
                            player.moushen.four.merge = false;
                            game.log(player,'重置了技能：','#g【谋身】');
                        };
                        const setnum = player.moushen.four.number;
                        await func4(setnum);
                    }
                },
            };
        },
        getMergeitems: function (player) {
            let result = [];
            const moushen = player.moushen;
            if (!moushen || typeof moushen !== 'object') return result;
            const keys = Object.keys(moushen);
            if (keys.length === 0) return result;
            const mergekeys = keys.filter(key => moushen[key].merge === true);
            if (mergekeys.length === 0) return result;
            const adjacentOnly = [];
            for (let i = 0; i < mergekeys.length; i++) {
                const key = mergekeys[i];
                const index = keys.indexOf(key);
                if (index > 0 && !moushen[keys[index - 1]]?.merge) {
                    adjacentOnly.push(keys[index - 1]);
                }
                if (index < keys.length - 1 && !moushen[keys[index + 1]]?.merge) {
                    adjacentOnly.push(keys[index + 1]);
                }
            }
            for (let i = 0; i < adjacentOnly.length; i++) {
                const item = adjacentOnly[i];
                if (!result.includes(item)) {
                    result.push(item);
                }
            }
            return result;
        },
        upDateMergeitems: function (player, skillname) {
            const moushen = player.moushen;
            if (!moushen || typeof moushen !== 'object') return;

            const keys = Object.keys(moushen);
            if (keys.length === 0) return;

            const skill = player.moushen[skillname];
            if (!skill) return;

            const currentIndex = keys.indexOf(skillname);
            const old_mergekeys = keys.filter(key => moushen[key].merge === true);
            if (old_mergekeys.length === 0) return;


            const first_oldIndex = keys.indexOf(old_mergekeys[0]);
            const last_oldIndex = keys.indexOf(old_mergekeys[old_mergekeys.length - 1]);
            
            if (currentIndex < first_oldIndex) {//在合并项的前边
                const name = skill.name;
                const number = skill.number;
                player.moushen[skillname].merge = true;
                const mergekeys = keys.filter(key => moushen[key].merge === true);
                for (const key of mergekeys) {
                    player.moushen[key].name = name;
                    player.moushen[key].number = number;
                }
            } else if (currentIndex > last_oldIndex) {// 在合并项的后边
                const name = player.moushen[old_mergekeys[old_mergekeys.length - 1]].name;
                const number = player.moushen[old_mergekeys[old_mergekeys.length - 1]].number;
                player.moushen[skillname].merge = true;
                const mergekeys = keys.filter(key => moushen[key].merge === true);
                for (const key of mergekeys) {
                    player.moushen[key].name = name;
                    player.moushen[key].number = number;
                }
            }
            const adjacentOnly = [];
            for (let i = currentIndex + 1; i < keys.length; i++) {
                const key = keys[i];
                if (!moushen[key].merge) {
                    adjacentOnly.push(key);
                }
            }
            if (adjacentOnly.length > 0) {
                for (const key of adjacentOnly) {
                    let hanzi = ["项一", "项二", "项三", "项四"];
                    const number = player.moushen[key].number;
                    const name = player.moushen[key].name;
                    const index = hanzi.indexOf(name);
                    player.moushen[key].number = number - 1;
                    player.moushen[key].name = hanzi[index - 1];
                }
            }
            return player.moushen;
        },
        filter:function(event, player, name){
            if (name=="phaseEnd") {
                const key1 = player.thunderweimu?.usedSkill;
                const key2 = player.thunderwenhe?.used_basic;
                const key3 = player.thunderwenhe?.used_loseHp;
                const key4 = player.thundermoushen?.gaincards;
                if (![key1, key2, key3, key4].every(val => typeof val === 'boolean')) return false;
                if (!key1 || !key2 || !key3 || !key4) return true;
                return false;
            } else if(name=="gainEnd" || name=="loseAsyncEnd"){
                const target = _status.currentPhase;
                if (!target || player.thundermoushen.gaincards) return;
                if (!target.isPhaseUsing()) return;
                const cards = event.getg(player);
                if (cards && cards.length) {
                    if (!player.thundermoushen.gaincards) player.thundermoushen.gaincards = true;
                }
                return;
            } else if (name=="phaseAfter") {
                player.thundermoushen.gaincards = false;
                return;
            }
        },
        async content(event, trigger, player) {
            const {one, two, three, four} = player.moushen;
            player.logSkill(event.name);
            await one.content(event, trigger, player);
            await two.content(event, trigger, player);
            await three.content(event, trigger, player);
            await four.content(event, trigger, player);
        },
        "_priority": 13,
    },
    //喵林夕
    icexihuo: {
        audio: "ext:银竹离火/audio/skill:2",
        trigger: {
            global: ["phaseBegin"],
        },
        firstDo: true,
        unique: true,
        locked: false,
        direct:true,
        async init(player, skill) {
            player.icexihuocards = [];
        },
        filter: function (event, player, name) {
            return player.countCards('h') > 0;
        },
        async content(event, trigger, player) {
            async function icexihuo_guanxing(target, info = "top") {
                const cards = target.getCards('h');
                if (!cards || cards.length === 0) return;
                let TXT_one = '';
                let TXT_two = '';
                if (info === "top") {
                    TXT_one = setColor("〖牌堆顶〗");
                    TXT_two = setColor("请将所有手牌按任意顺序置于牌堆顶！");
                } else if (info === "bottom") {
                    TXT_one = setColor("〖牌堆底〗");
                    TXT_two = setColor("请将所有手牌按任意顺序置于牌堆底！");
                }
                game.cardsGotoOrdering(cards);
                const result = await target.chooseToMove("〖戏火〗",true)
                .set("list", [[TXT_one, cards]]).set("prompt", TXT_two)
                .set("filterMove", (from, to, moved) => {
                    return true;
                }).set('filterOk', (moved) => {
                    return true;
                }).set("processAI", (list) => {
                    let cards= list[0][1];
                    let 排序后 = [[]];
                    if (info === "top") {
                        const tttt = _status.currentPhase;
                        const judges = tttt.getCards("j");
                        const wuxie_one = target.getCards('hs').filter(card => get.name(card,target) === 'wuxie');
                        const wuxie_two = tttt.getCards('hs').filter(card => get.name(card,tttt) === 'wuxie');
                        const hasFriend = get.attitude(target, tttt) >= 2;
                        if (hasFriend) {
                            if (judges.length > 0 && !wuxie_one.length && !wuxie_two.length) {
                                let cheats = setjudgesResult(judges,cards,target,false);//令判定牌失效的卡牌
                                if (cheats.length > 0) {
                                    const 排序剩余卡片= cards.filter(card => !cheats.includes(card)).sort((a, b) => get.value(b, tttt) - get.value(a, tttt));
                                    cards = cheats.concat(排序剩余卡片);
                                } else {
                                    cards = cards.sort((a, b) => get.value(b, tttt) - get.value(a, tttt));
                                }
                            } else {
                                cards = cards.sort((a, b) => get.value(b, tttt) - get.value(a, tttt));
                            }
                        } else {
                            cards = cards.sort((a, b) => get.value(a, tttt) - get.value(b, tttt));
                        }
                    } else if (info === "bottom") {
                        cards = cards.sort((a, b) => get.value(a, target) - get.value(b, target));
                    }
                    return [cards];
                }).forResult();
                if (result.bool) {
                    const cards = result.moved[0];
                    await icexihuo_check(cards);
                    if (info === "top") {
                        target.chooseCardsToPile(cards,"top");
                    } else if (info === "bottom") {
                        target.chooseCardsToPile(cards,"bottom");

                    }
                }
            };
            async function icexihuo_useskill(target) {
                const cards = target.getCards('h');
                if (!cards || cards.length === 0) return;
                const TXT = setColor("〖戏火〗");
                let list = [];
                let numdraw = 0;
                if (target === player) {
                    numdraw = target.getDamagedHp() + (target.hasSkill('icelingxi') ? target.lingxi_draw : 0);
                } else {
                    numdraw = target.getDamagedHp();
                }
                list = [
                    setColor("〖选项一〗：是否要将所有手牌置于〖牌堆顶〗，并从〖牌堆底〗摸") + get.cnNumber(numdraw) + "张牌？",
                    setColor("〖选项二〗：是否要将所有手牌置于〖牌堆底〗，并从〖牌堆顶〗摸") + get.cnNumber(numdraw) + "张牌？",
                ];
                const chooseButton = await target.chooseButton([TXT ,
                    [list.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return target.countCards('h') > 0;
                    } else if (button.link === 1) {
                        return target.countCards('h') > 0;
                    }
                }).set("selectButton", 1).set("ai", function (button) {
                    function getLink() {
                        const tttt = _status.currentPhase;//当前回合角色
                        const judges = tttt.getCards("j");
                        const wuxie_one = target.getCards('hs').filter(card => get.name(card,target) === 'wuxie');
                        const wuxie_two = tttt.getCards('hs').filter(card => get.name(card,tttt) === 'wuxie');
                        const hasFriend = get.attitude(target, tttt) >= 2;
                        if (hasFriend && judges.length && !wuxie_one.length && !wuxie_two.length) {
                            let cheats = setjudgesResult(judges,cards,target,false);//令判定牌失效的卡牌
                            if (cheats.length > 0) return 0;
                        }
                        if (target.countCards('h') <= numdraw) {
                            return 1;
                        } else {
                            return 2;
                        }
                    }
                    if(getLink() === 2) return false;
                    return button.link === getLink();
                }).set(/*'forced', target !== player*/).forResult();
                if (chooseButton.bool) {
                    player.logSkill(event.name);
                    const choices = chooseButton.links;
                    if (choices.includes(0)) {
                        await icexihuo_guanxing(target, "top");
                        if (numdraw > 0) {
                            const gaincards =  get.bottomCards(numdraw);
                            await target.gain(gaincards);
                        }
                    } else if (choices.includes(1)) {
                        await icexihuo_guanxing(target, "bottom");
                        if (numdraw > 0) {
                            const gaincards =  get.cards(numdraw);
                            await target.gain(gaincards);
                        }
                    }
                    if (target === player && target.hasSkill('icelingxi')) {
                        target.lingxi_draw = 0;
                        player.updateMarks('icelingxi');
                    }
                    if (target !== player) return;
                    if (target.hasSkill("icedoumao_MOD")) return;
                    const otherPlayers = game.filterPlayer(current => current != player && current.getCards('he').length > 0);
                    if (!otherPlayers || otherPlayers.length === 0) return;
                    const result = await target.chooseTarget('是否令一名角色执行一次〖戏火〗前半部分？', (card, p, t) => {
                        return t.getCards('h').length > 0 &&  t !== player;
                    }).set('ai', t => {
                        const friends = game.filterPlayer(o => o !== player && get.attitude(player, o) >=2 && o.countCards('h') > 0 && o.countCards('h') <= o.getDamagedHp());
                        const enemies = game.filterPlayer(o => o !== player && get.attitude(player, o) < 2 && o.countCards('h') > 0 && o.countCards('h') > o.getDamagedHp());
                        if (friends.length > 0) {
                            let sortfriends = friends.sort((a, b) => {
                                const a_num = Math.abs(a.getDamagedHp() - a.countCards('h'));
                                const b_num = Math.abs(b.getDamagedHp() - b.countCards('h'));
                                if  (a_num !== b_num) return b_num - a_num;
                                return a.hp - b.hp;
                            });
                            return t === sortfriends[0];
                        } else if (enemies.length > 0) {
                            let sortenemies = enemies.sort((a, b) => {
                                const a_num = Math.abs(a.getDamagedHp() - a.countCards('h'));
                                const b_num = Math.abs(b.getDamagedHp() - b.countCards('h'));
                                if  (a_num !== b_num) return b_num - a_num;
                                return b.hp - a.hp;
                            });
                            return t === sortenemies[0];
                        }
                        return false;
                    }).forResult();
                    if (result.bool) {
                        player.logSkill(event.name);
                        const target2 = result.targets[0];
                        game.log(target, '使用了〖戏火〗技能，令', target2, '执行了一次〖戏火〗前半部分！');
                        await icexihuo_useskill(target2);
                    }
                }
            };
            async function icexihuo_check(cards) {
                const pilescards = ui.cardPile.childNodes;
                let checkcards = [];
                for(let card of pilescards) {
                    if (card.storage.icexihuo) {
                        if (!checkcards.includes(card)) checkcards.push(card);
                    }
                }
                let setcardslist = cards.concat(checkcards); 
                for (let card of setcardslist) {
                    if (!card.storage.icexihuo) {
                        card.storage.icexihuo = true;
                    }
                }
                if(setcardslist.length > 4) {
                    for (let i = 4; i < setcardslist.length; i++) {
                        setcardslist[i].storage.icexihuo = false;
                        delete setcardslist[i].storage.icexihuo;
                    }
                }
            };
            await icexihuo_useskill(player);
        },
        group: "icexihuo_gain",
        subSkill: {
            gain: {
                trigger: {
                    player: ["gainEnd","loseAfter"],
                    global: ["loseAsyncEnd","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
                },
                charlotte: true,
                unique: true,
                direct: true,
                silent: true,
                popup: false,
                filter: function(event, player, name) {
                    if (!player.hasSkill('icexihuo')) return;
                    if (name == 'gainEnd' || name == 'loseAsyncEnd' ) {
                        const cards = event.getg(player);
                        if (!cards.length) return false;
                        return cards.some(card => card.storage.icexihuo);
                    } else {
                        const evt = event.getl(player);
                        if (!evt) return false;
                        return evt.cards && evt.cards.length > 0;
                    }
                },
                async content(event, trigger, player) {
                    const Time = event.triggername;
                    if (Time == 'gainEnd' || Time == 'loseAsyncEnd') { 
                        const cards = trigger.getg(player);
                        if (cards && cards.length > 0) {
                            let totagCards = cards.filter(card => card.storage.icexihuo);
                            player.addGaintag(totagCards, "icexihuo_tag");
                        }
                    } else {
                        const evt = trigger.getl(player);
                        const cards = evt.cards;
                        for(let card  of cards) {
                            if (card.storage.icexihuo) {
                                card.storage.icexihuo = false;
                                delete card.storage.icexihuo;
                            }
                        }
                    }
                },
                sub: true,
                sourceSkill: "icexihuo",
                forced: true,
                "_priority": 1,
            },
        },
        "_priority": 521,
    },
    icelingxi: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= #0088CC>伶息</font>",
        intro: {
            content: function(storage, player) {
                let key = player.hasSkill("icedoumao_MOD");
                const setnum = player.lingxi_draw;
                if (setnum >= 0) {
                    return '〖戏火〗摸牌数增加：' + setnum;
                } else {
                    return '〖戏火〗摸牌数减少：' + setnum;
                }
            },
            name: "<font color= #0088CC>伶息</font>",
        },
        trigger: {
            player: ["gainEnd","loseAfter"],
            global: ["phaseEnd","loseAsyncEnd","equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter"],
        },
        async init(player, skill) {
            player.lingxi_draw = 0;
        },
        locked: true,
        direct: true,
        filter: function (event, player, name) {
            if(name == "phaseEnd"){
                if(player.hasSkill("icedoumao_MOD")){
                    player.lingxi_draw = 0;
                    player.updateMarks('icelingxi');
                    return true;
                }
                return false;
            } else {
                if(player.hasSkill("icedoumao_MOD")) return false;
                if(name == 'gainEnd' || name == 'loseAsyncEnd'){
                    const cards = event.getg(player);
                    if (!cards.length) return false;
                    return true;
                } else {
                    const evt = event.getl(player);
                    if (!evt) return false;
                    return (evt.hs && evt.hs.length > 0) || (evt.es && evt.es.length > 0);
                }
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time == "phaseEnd") {
                const pilescards = ui.cardPile.childNodes;
                let gainlist = [];
                for(let card of pilescards) {
                    if (card.storage.icexihuo) {
                        if (!gainlist.includes(card)) gainlist.push(card);
                    }
                }
                if (gainlist.length) {
                    player.logSkill(event.name);
                    await player.gain(gainlist, "gain2");
                }
                return;
            } else {
                if(Time == "gainEnd" || Time == "loseAsyncEnd"){
                    const cards = trigger.getg(player);
                    player.lingxi_draw -= cards.length;
                    if (player.lingxi_draw < -4) player.lingxi_draw = -4;
                    player.updateMarks('icelingxi');
                } else {
                    const evt = trigger.getl(player);
                    if (evt.hs && evt.hs.length > 0) {
                        player.logSkill(event.name);
                        player.lingxi_draw += evt.hs.length;
                    }
                    if (evt.es && evt.es.length > 0) {
                        player.logSkill(event.name);
                        player.lingxi_draw += evt.es.length;
                    }
                    if (player.lingxi_draw > 4) player.lingxi_draw =  4;
                    player.updateMarks('icelingxi');
                }
            }
        },
        "_priority": 1314,
    },
    icedoumao: {
        audio: "ext:银竹离火/audio/skill:1",
        locked: true,
        direct: true,
        async init(player, skill) {
            if (!player.hasSkill("icedoumao_MOD")) player.addSkill("icedoumao_MOD");
            player.logSkill(skill);
        },
        "_priority": 1314,
    },
    icedoumao_MOD: {
        audio: "ext:银竹离火/audio/skill:1",
        mark:true,
        marktext:"<font color= #0088CC>逗猫</font>",
        intro:{
            content:function(){
                let TXT = setColor("回合开始时，你可以弃置一张牌并选择一名其他角色，转移「逗猫」，并使其摸一张牌，回合结束时，若你拥有「逗猫」，则需弃置一张牌。");
                return TXT;
            },
        },
        trigger: {
            player: ["phaseBegin","phaseEnd"],
        },
        superCharlotte:true,
        charlotte:true,
        unique:true,
        firstDo: true,
        direct: true,
        filter: function (event, player,name) {
            const targets = game.players.filter(o => o!== player && o.isAlive() && !o.hasSkill("icedoumao_MOD"));
            if(name == "phaseBegin"){
                //player.getDiscardableCards(player,'he').length > 0
                return targets.length > 0 && player.countCards('he') > 0;
            } else if(name == "phaseEnd"){
                return player.countCards('he') > 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            const enemys = game.filterPlayer(o => get.attitude(player, o) < 2 && !o.hasSkill("icedoumao_MOD"));
            if(Time=="phaseBegin"){
                let TXT = setColor("是否要弃置一张牌并选择一名其他角色，转移「逗猫」，并使其摸一张牌？");
                let cards = await player.chooseCard("he",TXT ).set("ai", (card) => {
                    const cards = player.getCards('he').sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (!enemys || !enemys.length) return false;
                    if (player.isDamaged() && cards.length == 1 && get.name(cards[0], player) == "tao" && player.canUse(cards[0],player)) return false;
                    return get.value(card, player) <= get.value(cards[0], player);
                }).forResultCards();
                if(cards &&cards.length > 0){
                    await player.discard(cards[0]);
                    let Result = await player.chooseTarget("选择转移「逗猫」的目标", (card, player, target) => {
                        return target !== player && target.isAlive();
                    }).set('ai', target => {
                        if (enemys && enemys.length > 0){
                            let sortEnemys = enemys.sort((a, b) => {
                                if (a.countCards('he') !== b.countCards('he')) return a.countCards('he') - b.countCards('he');
                                return a.hp - b.hp;
                            });
                            return target == sortEnemys[0];
                        } else {
                            const targets = game.players.filter(o => o!== player && o.isAlive() && !o.hasSkill("icedoumao_MOD"));
                            let sortTargets = targets.sort((a, b) => {
                                if (a.countCards('he') !== b.countCards('he')) return a.countCards('he') - b.countCards('he');
                                return a.hp - b.hp;
                            });
                            return target == sortTargets[0]
                        }
                    }).set('forced', true).forResult();
                    if(Result.bool){
                        let target = Result.targets[0];
                        player.logSkill("icedoumao_MOD");
                        player.line(target,"ice");
                        if(!target.hasSkill("icedoumao_MOD")){
                            target.addSkill("icedoumao_MOD");
                        }
                        player.removeSkill("icedoumao_MOD");
                        await target.draw();
                    }
                }
            } else if(Time=="phaseEnd"){
                if (player.countCards('he') > 0) {
                    await player.chooseToDiscard(1, 'he', true);
                }
            }
        },
        "_priority": 5210,
    },
    //明徐阶
    mingxinxue: {
        audio: "ext:银竹离火/audio/skill:2",
        marktext: "知",
        onremove: function (player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro: {
            content: "expansion",
            markcount: "expansion",
        },
        enable: "phaseUse",
        persevereSkill: true,
        filter: function (event, player) {
            //既然这样设定了必须选择不同的卡牌名字置于武将牌上！这叫技能逻辑的合理性
            var storedCards = player.getExpansions('mingxinxue');
            return player.getCards('he').some(card => !storedCards.includes(card.name)) && player.getExpansions('mingxinxue').length < 5;
        },
        usable: 3,
        selectCard: 1,
        position:"he",
        filterCard: function (card, player) {
            var storedCards = player.getExpansions('mingxinxue');
            return !storedCards.some(storedCard => storedCard.name === card.name);
        },
        discard: false,
        lose: false,
        delay: false,
        check: function(card) {
            //满足什么条件下，储存什么类型什么名字的牌？思考一下
            //分两种情况，拥有革弊前，拥有革弊后！但是回合外要考虑生存，那么必须满足手牌中有牌名相同的牌。
            //武将技能文案已经全部定案了，基本一套公式打出初具成型！别对我说你不会玩根据最新文案！
            //你也别想了，我这边帮你想吧，因为这只是AI的一部分。选牌！ 发动技能也需要写！与其技能联动也需要写！
            //为什么大家都不愿意为线下单机写主动技能的AI，可变因素很多！重复工作（但写法不同）很多，还有可联动性越多思考的越多！
            //尤其是可卡牌名字牵扯到一起。写法千变万化。就相当于现实生活中，垃圾老板的一句话，你需要把方案改了又改！
            //我这边这个武将包就这么多武将了，有趣的机制在添加新武将吧。单纯堆砌数值和无趣的机制就不写了！
                //因为这个武将的文案  限定技之后就立马获得最终形态，没有任何过度性！究极点杀！不管是100还是成千上万血的武诸葛，在你觉醒后如果他手牌点数均比你的手牌点数小，都是一张纸！除非有技能濒死回满血！
                //谁在你面前都是死路一条，这个设定我不是很认同，但是机制很有趣。我也懒得给你改数值了！我现在做的就是，让你看看了解三国杀游戏机制、又会写AI代码的，一看文案就基本知道你这个
                //自定义武将的如何使用的扩展作者，如何使用这个武将，然后把其中一套打法用AI的方式赋值给这个武将的！
            //AI代码如下↓↓↓↓↓↓↓
            var player = _status.event.player;
            if (ui.selected.cards.length && ui.selected.cards[0].name == "du") return 0;
            if (!ui.selected.cards.length && card.name == "du") return 20;
            if (ui.selected.cards.length > 1) return 0;
            var storedCards = player.getExpansions('mingxinxue');
            var HandCards = player.getCards('h');
            var cardName = get.name(card);
            if (HandCards.some(c => storedCards.includes(c.name)) || player.getExpansions('mingxinxue').length >= 5) return 0;
                //卡牌结构，心学技能机制;此阶段对于心学有用的牌，且卡牌结构有多张的卡牌有"杀44张、闪24张、桃12、酒5、决斗3、五谷2、顺手5、过拆6、乐不3、无中4 、借刀2、火攻3、兵粮2、铁索6、闪电2 、无懈7"
                //按照权重，以及对于心学机制再觉醒前有用的卡牌
            if (!player.hasSkill("minggebi") || player.hasSkill("minggebi_used")) {
                if (cardName === "sha") {
                    if (HandCards.some(c => get.name(c) === "sha")) return 10;
                } else if (cardName === "shan") {
                    if (HandCards.some(c => get.name(c) === "shan")) return 9;
                } else if (cardName === "tao") {
                    if (HandCards.filter(c => get.name(c) === "tao").length > 1) return 8;
                } else if (cardName === "wuxie") {
                    if (HandCards.filter(c => get.name(c) === "wuxie").length > 1) return 7;
                } else if (cardName === "tiesuo") {
                    if (HandCards.filter(c => get.name(c) === "tiesuo").length > 1) return 6;
                } else if (cardName === "guohe") {
                    if (HandCards.filter(c => get.name(c) === "guohe").length > 1) return 6;
                } else if (cardName === "shunshou") {
                    if (HandCards.filter(c => get.name(c) === "shunshou").length > 1) return 5;
                } else if (cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "jiu").length > 1) return 5;
                } else if (cardName === "wuzhong") {
                    if (HandCards.filter(c => get.name(c) === "wuzhong").length > 1) return 4;
                } else if (cardName === "lebu" || cardName === "juedou" || cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "lebu").length > 1 ||
                        HandCards.filter(c => get.name(c) === "juedou").length > 1 ||
                        HandCards.filter(c => get.name(c) === "jiu").length > 1) {
                        return 0.5;
                    }
                } else return 0;
            } else if (player.hasSkill("minggebi") && !player.hasSkill("minggebi_used") ) {
                if (cardName === "sha") {
                    if (HandCards.some(c => get.name(c) === "sha")) return 10;
                } else if (cardName === "shan") {
                    if (HandCards.some(c => get.name(c) === "shan")) return 9;
                } else if (cardName === "tao") {
                    if (HandCards.filter(c => get.name(c) === "tao").length > 1) return 8;
                } else if (cardName === "wuxie") {
                    if (HandCards.filter(c => get.name(c) === "wuxie").length > 1) return 7;
                } else if (cardName === "tiesuo") {
                    if (HandCards.filter(c => get.name(c) === "tiesuo").length > 1) return 6;
                } else if (cardName === "guohe") {
                    if (HandCards.filter(c => get.name(c) === "guohe").length > 1) return 6;
                } else if (cardName === "shunshou") {
                    if (HandCards.filter(c => get.name(c) === "shunshou").length > 1) return 5;
                } else if (cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "jiu").length > 1) return 5;
                } else if (cardName === "wuzhong") {
                    if (HandCards.filter(c => get.name(c) === "wuzhong").length > 1) return 4;
                } else if (cardName === "lebu" || cardName === "juedou" || cardName === "jiu") {
                    if (HandCards.filter(c => get.name(c) === "lebu").length > 1 ||
                        HandCards.filter(c => get.name(c) === "juedou").length > 1 ||
                        HandCards.filter(c => get.name(c) === "jiu").length > 1) {
                        return 3;
                    }
                } else return 2;
            }
            return 0;
        },
        group: ["mingxinxue_use"],
        content: function () {
            player.addToExpansion(cards, 'giveAuto', player).gaintag.add('mingxinxue');
            if (player.storage.mingxinxue) {
                player.draw();
            }
        },
        ai:{
            threaten:1.5,
            order:13,
            skillTagFilter:function (player) {
                var storedCards = player.getExpansions('mingxinxue');
                return player.getCards('he').some(card => !storedCards.includes(card.name)) && player.getExpansions('mingxinxue').length < 5;
            },
            result:{
                player:1,
            },
        },
        subSkill: {
            use: {
                audio: "mingxinxue",
                trigger: {
                    player: ["respond", "useCard"],
                },
                persevereSkill: true,
                unique: true,
                forced: false,
                locked: false,
                direct: true,
                filter: function (event, player) {
                    var storedCards = player.getExpansions('mingxinxue');
                    return event.card && storedCards.some(card => card.name === event.card.name);
                },
                content: function () {
                    'step 0'
                    player.chooseCardButton(player.getExpansions('mingxinxue'), '是否要弃置1张与此牌名相同的「知」并摸两张牌？').set('filterButton', function(button) {
                        return button.link.name === trigger.card.name;
                    }).set('ai', function(button) {
                        return true;
                    });
                    'step 1'
                    if (result && result.bool && result.links && result.links.length) {
                        player.logSkill(event.name);
                        player.discard(result.links);
                        if (player.hasSkill("mingyinren")) {
                            player.addMark("mingyinren", 1);
                        } 
                        player.draw(2);
                    }
                },
                sub: true,
                sourceSkill: "mingxinxue",
                "_priority": 0,
            },
        },
        "_priority": 0,
    },
    mingyinren: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        onremove: true,
        marktext: "<span style=\"color: #AFEEEE\">隐忍</span>",
        intro:{
            content:function (storage, player) {
                var nummark = player.countMark('mingyinren');
                return '你已因触发〖心学〗移去过' + nummark+'张「知」标记！';
            },
            name:"<span style=\"color: #AFEEEE\">隐忍</span>",
        },
        trigger: {
            player: ["phaseBegin", "phaseEnd"],
        },
        persevereSkill:true,
        unique:true,
        forced:true,
        locked:true,
        juexingji:true,
        skillAnimation:true,
        animationColor:"thunder",
        filter: function (event, player) {
            return player.countMark('mingyinren') >= 3;
        },
        derivation:["mingchuyan","minggebi"],
        content: function () {
            player.awakenSkill("mingyinren");
            player.storage.mingxinxue = true;
            player.removeMark('mingyinren', player.countMark('mingyinren'));
            player.addSkill("mingchuyan");
            player.insertPhase();
        },
        "_priority": 0,
    },
    mingchuyan: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        limited:true,
        skillAnimation:"epic",
        animationColor:"thunder",
        async init(player) {
            player.storage.mingchuyan = false;
        },
        intro:{
            content:"limited",
        },
        enable: "phaseUse",
        persevereSkill:true,
        unique:true,
        forced:true,
        locked:true,
        direct: true,
        filter: function (event, player) {//这个是触发此技能，过滤器函数：也就是你这个技能满足什么条件下，才能发动！！！！！
            //你知道你这个技能描述的弊端吗？
            //………………
            //“出牌阶段你可以减少一点体力上限并移去一张「知」令一名手牌数不小于一号位的角色将体力值和手牌数调整至一，然后你获得〖革弊〗。”，
            //………………
            //就一个逗号，按照技能描述：
            //①如果我觉得前边一句话全部都是触发限定技能的条件，缺一不可；你怎么说？
            //②如果我觉得前边一句话全部都是  此技能获得〖革弊〗的前提条件，缺一不可；你怎么说？
            //………………
            //其他的，我也不多问了：我这边按照修改后的文案：”限定技：出牌阶段，你可以移去一张「知」,并执行以下所有项：①你减少一点体力上限；②选择一名手牌数不小于一号位的角色，令其体力值和手牌数调整至一；③获得技能〖革弊〗。
            //至于为什么这样改：我这边就说一点，按照你这边的技能描述，若场上都比一号位（不管你是几号位）的手牌少，那么技能执行代码，执行到一半就不执行了？
            //还有你如果是一号位，你的手牌最多。这个必选你！因为他是限定技，如果不选择按正常逻辑来讲。你是获得不了〖革弊〗的。所以这个技能欠考虑。不过整体思路不错
            return player.getExpansions('mingxinxue').length > 0 && !player.storage.mingchuyan;
        },
        content: function () {
            'step 0'
            player.chooseCardButton(player.getExpansions('mingxinxue'), '〖限定技·除严〗：是否要移去一张「知」,并执行以下所有项：①你减少一点体力上限；②选择一名手牌数不小于一号位的角色，令其体力值和手牌数调整至一；③获得技能〖革弊〗？').set('ai', function(button) {
                var players = game.players;
                var player = _status.event.player;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].getSeatNum() == 1) {
                        var playerInSeat1 = players[i];
                        var numVs = playerInSeat1.countCards('h');
                    }
                }
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.countCards('h')>=numVs && get.attitude(player, current) <= 0;
                });
                if (targets.length>0) return true;
            });
            'step 1'
            if (result && result.bool && result.links && result.links.length) {
                player.logSkill(event.name);
                player.storage.mingchuyan = true;
                player.awakenSkill("mingchuyan");
                player.discard(result.links);
                player.loseMaxHp();
                var players = game.players;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].getSeatNum() == 1) {
                        var playerInSeat1 = players[i];
                        var numVs = playerInSeat1.countCards('h');
                    }
                }
                var targets = game.filterPlayer(function (current) {
                    return current.countCards('h')>=numVs;
                });
                if (targets.length>0) {
                    player.chooseTarget("请选择一名手牌数不小于一号位的角色，将其体力值和手牌数调整至一", function(card, player, target) {
                        return target.countCards('h')>=numVs;
                    }).set('ai', function(target) {
                        //AI没有设定！人为控制！
                        var player = _status.event.player;
                        var att = get.attitude(player, target);
                        return att <= 0;
                        //鉴于文案如此描述，必须发动！
                        return 1;
                    }).set('forced', true);//因为这是二级开关，必须选择了！！！根据技能文案！
                    event.goto(2);
                } else event.finish();
            } else event.finish();
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target, 'fire');
                if (target.hp>1) {
                    var numlose = target.hp - 1;
                    target.loseHp(numlose);
                }
                if (target.countCards('h')>1) {
                    var numdis = target.countCards('h')-1;
                    target.chooseToDiscard(numdis,'h', true);
                } else if (target.countCards('h')<1) {
                    target.draw();
                }
            }
            'step 3'
            player.addSkill("minggebi");
        },
        ai:{
            threaten:1.5,
            order:12,
            skillTagFilter:function (player) {
                var players = game.players;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].getSeatNum() == 1) {
                        var playerInSeat1 = players[i];
                        var numVs = playerInSeat1.countCards('h');
                    }
                }
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.countCards('h')>=numVs && get.attitude(player, current) <= 0;
                });
                if (targets.length>0) return true;
            },
            result:{
                player:function (player, target) {
                    var players = game.players;
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].getSeatNum() == 1) {
                            var playerInSeat1 = players[i];
                            var numVs = playerInSeat1.countCards('h');
                        }
                    }
                    var targets = game.filterPlayer(function (current) {
                        return current != player && current.countCards('h')>=numVs && get.attitude(player, current) <= 0;
                    });
                    if (targets.length>0) return 2;
                    return 0;
                },
            },
        },
        "_priority": 0,
    },
    minggebi: {
        audio: "ext:银竹离火/audio/skill:2",
        enable: "phaseUse",
        persevereSkill:true,
        unique:true,
        forced: false,
        locked: false,
        direct: true,
        filter: function (event, player) {
            //“出牌阶段限一次，你可以移去任意张「知」与一名体力值不大于你的其他角色进行拼点，赢的角色令没赢的角色选择一项：1令对方摸X张牌；2.弃置X张牌；3.失去X点体力(X为当次技能移去「知」的数量)。”，
            if (player.hasSkill("minggebi_used")) return false;
            var targets = game.filterPlayer(function (current) {
                return current != player && current.hp <= player.hp && current.countCards('h')>0 && !current.hasSkillTag("noCompareSource") && !current.hasSkillTag("noCompareTarget");
            });
            return player.getExpansions('mingxinxue').length > 0 && targets.length>0;
        },
        content: function () {
            'step 0'
             var numdis = player.getExpansions('mingxinxue').length;
            player.chooseCardButton(player.getExpansions('mingxinxue'),
                '请选择移去至多' + get.cnNumber(numdis) +
                '张「知」标记牌与一名其他体力值不大于你的角色进行拼点：赢的角色令没赢的角色选择一项：①令对方摸X张牌；②弃置X张牌；③失去X点体力<br>　　注：<span style="color: #0088CC; font-weight: bold;">X</span>为当次技能移去「知」的数量。',
                [1, numdis]
            ).set('filterButton', function (button) {
                return true;
            }).set('ai', function (button) {
                var card = button.link;
                // AI 更倾向于选择更多的「知」标记牌
                return true;
            });
            'step 1'
            if (result && result.bool && result.links && result.links.length) {
                var numToRemove = result.links.length;
                player.logSkill(event.name);
                player.addTempSkill("minggebi_used");
                player.discard(result.links);
                event.numX = result.links.length;
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.hp <= player.hp && current.countCards('h')>0 && !current.hasSkillTag("noCompareSource") && !current.hasSkillTag("noCompareTarget");
                });
                if (targets.length>0) {
                    player.chooseTarget("请选择拼点的目标", function(card, player, target) {
                        return target != player && target.hp <= player.hp && target.countCards('h')>0 && !target.hasSkillTag("noCompareSource") && !target.hasSkillTag("noCompareTarget");
                    }).set('ai', function(target) {
                        //AI设定
                        var player = _status.event.player;
                        var ts = target.getCards("h").sort((a, b) => get.number(a) - get.number(b));
                        var att = get.attitude(player, target);
                        //思路
                        if (att<=0) {
                            var hs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            var ts = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            if (get.number(hs[0]) > get.number(ts[0])) return 4;                    
                            return 1;
                        } else {
                            var hs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            var ts = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                            if (get.number(hs[0]) < get.number(ts[0])) return 3;
                            return 2;
                        }
                        return 1;
                    }).set('forced', true);//因为这是二级开关，必须选择了！！！根据技能文案！
                    event.goto(2);
                } else event.finish();
            } else event.finish();
            'step 2'
            if (result.bool) {
                event.target = result.targets[0];
                var target = event.target;
                if (player.canCompare(target)) player.chooseToCompare(target);
                event.goto(3);
            }
            "step 3"
            var target = event.target;
            var numX = event.numX;
            var options = ['选项一', '选项二', '选项三'];
            if (result.bool) {
                //玩家赢
                target.chooseControl(options)
                    .set("choiceList", [
                        "令" + get.translation(player) + "摸" + get.cnNumber(numX) + "张牌",
                        "你弃置" + get.cnNumber(numX) + "张牌",
                        "你失去" + get.cnNumber(numX) + "点体力"
                    ])
                    .set("prompt", "请选择一项执行之！")
                    .set("ai", function () {
                        var targetA = _status.event.player;
                        var att = get.attitude(targetA, event.target);
                        var hasOption = {
                            one: options.includes("选项一"),
                            two: options.includes("选项二"),
                            three: options.includes("选项三")
                        };
                        if (att>0) {
                            if (hasOption.one) return "选项一";                
                        } else {//敌方如何选择
                            var live = target.countCards('he', { name: ['tao', 'jiu'] }) + target.hp - numX;
                            var taos = target.countCards('he', { name: ['tao'] });
                            var shs = target.countCards('he', { name: ['shan'] });
                            var hes = target.countCards('he') - numX;
                            if (live>0) {
                                if (shs>0 && hasOption.three) return "选项三";
                            } else {
                                if ((hes-taos>0 || hes- shs>0) && hasOption.two) return "选项二";
                                if (hasOption.one) return "选项一"; 
                            }
                        }
                    });
                event.goto(4);
            //平局
            } else if (result.tie) {
                event.finish();
            } else {
            //对方赢
                player.chooseControl(options)
                    .set("choiceList", [
                        "令" + get.translation(target) + "摸" + get.cnNumber(numX) + "张牌",
                        "你弃置" + get.cnNumber(numX) + "张牌",
                        "你失去" + get.cnNumber(numX) + "点体力"
                    ])
                    .set("prompt", "请选择一项执行之！")
                    .set("ai", function () {
                        var player = _status.event.player;
                        var att = get.attitude(player, event.target);
                        var hasOption = {
                            one: options.includes("选项一"),
                            two: options.includes("选项二"),
                            three: options.includes("选项三")
                        };
                        if (att>0) {
                            if (hasOption.one) return "选项一";                
                        } else {//敌方如何选择
                            var live = player.countCards('he', { name: ['tao', 'jiu'] }) + player.hp - numX;
                            var taos = player.countCards('he', { name: ['tao'] });
                            var shs = player.countCards('he', { name: ['shan'] });
                            var hes = player.countCards('he') - numX;
                            if (live>0) {
                                if (shs>0 && hasOption.three) return "选项三";
                            } else {
                                if ((hes-taos>0 || hes- shs>0) && hasOption.two) return "选项二";
                                if (hasOption.one) return "选项一"; 
                            }
                        }
                    });
                event.goto(5);                    
            }
            "step 4"
            //玩家赢
            var target = event.target;
            var numX = event.numX;
            if (result.control === "选项一") {
                player.draw(numX);
            } else if (result.control === "选项二") {
                //注意文案设计者这里变成了弃置X张牌！！
                if (target.countCards('he')>numX) {
                    target.chooseToDiscard(numX,'he', true);
                } else {
                    target.discard(target.getCards('he'), true);
                }
            } else if (result.control === "选项三") {
                target.loseHp(numX);
            } else event.finish();
            event.finish();
            "step 5"
            //对方赢
            var target = event.target;
            var numX = event.numX;
            if (result.control === "选项一") {
                target.draw(numX);
            } else if (result.control === "选项二") {
                //注意文案设计者这里变成了弃置X张牌！！
                if (player.countCards('he')>numX) {
                    player.chooseToDiscard(numX,'he', true);
                } else {
                    player.discard(player.getCards('he'), true);
                }
            } else if (result.control === "选项三") {
                player.loseHp(numX);
            } else event.finish();
            event.finish();
        },
        subSkill:{
            used:{
                charlotte:true,
                unique:true,
                sub:true,
                sourceSkill:"minggebi",
                "_priority":0,
            },
        },
        ai:{
            threaten:1.5,
            order:11,
            skillTagFilter:function (player) {
                if (player.hasSkill("minggebi_used")) return false;
                var targets = game.filterPlayer(function (current) {
                    return current != player && current.hp <= player.hp && current.countCards('h')>0 && !current.hasSkillTag("noCompareSource") && !current.hasSkillTag("noCompareTarget");
                });
                return player.getExpansions('mingxinxue').length > 0 && targets.length>0;
            },
            result:{
                player:1,
            },
        },
        "_priority": 0,
    },
};
export default TAF_qitaSkills;
