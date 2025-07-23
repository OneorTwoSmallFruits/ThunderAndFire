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
/** @type { importCharacterConfig['skill'] } */
const TAF_jianglingSkills = {
    //将灵：神赵云
    sznjl_juejing: {
        audio:"ext:银竹离火/audio/jiangling:true", 
        trigger: {
            player:["phaseZhunbeiBegin","phaseJieshuBegin", "dying","dyingAfter"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        usable: 3,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        check(event, player) {
            return true;
        },
        filter(event, player) {
            return Math.random() < 0.892 + 0.08;
        },
        async content(event, trigger, player) {
            const num = [2, 3, 4].randomGet();
            player.playjianglingAudio(event.name);
            await player.draw(num);
            await player.recover();
        },
        ai: {
            threaten: 3,
        },
        "_priority": 0,
    },
    sznjl_longhun: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player:["useCard"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player) {
            const card = event.card;
            const key1 = card.name == 'sha' || card.name == 'tao';
            const key2 = card.name == 'shan' || card.name == 'wuxie';
            if (key1) return Math.random() < 0.892 + 0.08;
            if (key2) {
                const target = _status.currentPhase;
                const cards = target.getGainableCards(player, 'hej');
                return target && cards.length > 0 && Math.random() < 0.892 + 0.08;
            }
            return false;
        },
        async cost(event, trigger, player) {
            const card = trigger.card;
            const key1 = card.name == 'sha' || card.name == 'tao';
            const key2 = card.name == 'shan' || card.name == 'wuxie';
            let prompt;
            if (key1) {
                prompt = setColor('〖龙魂〗：是否将' + get.translation(card) + '的伤害或回复值随机增加一至三点？');
            } else if (key2) {
                const target = _status.currentPhase;
                prompt = setColor('〖龙魂〗：是否获得' + get.translation(target) + '至多两张牌？');
            } else {
                return;
            }
            const result = await player.chooseBool(prompt).set('ai', () => {
                if (key1) {
                    const targets = trigger.targets;
                    if(!targets || targets.length === 0) return false;
                    if(targets.length > 0) {
                        if (card.name == 'sha') {
                            const friends = targets.filter(o => get.attitude(player, o) > 0);
                            if(friends.length > 0) return false;
                            return true;
                        }
                        if (card.name == 'tao') {
                            const friends = targets.filter(o => get.attitude(player, o) > 0 && o.hp + 1 < o.maxHp);
                            if(friends && friends.length > 0) return true;
                            return false;
                        }
                    }
                } else if (key2) {
                    return get.attitude(player, _status.currentPhase) <= 0;
                }
            }).forResult();
            if (result.bool) {
                event.result = {
                    bool: true,
                    cost_data: trigger.card,
                };
            }
        },
        async content(event, trigger, player) {
            const card = event.cost_data;
            if (['sha', 'tao'].includes(card.name)) {
                player.playjianglingAudio(event.name);
                const num = [1, 2, 3].randomGet();
                trigger.baseDamage += num;
            } else if (['shan', 'wuxie'].includes(card.name)) {
                const target = _status.currentPhase;
                const cards = target.getGainableCards(player, 'hej');
                if (cards && cards.length > 0) {
                    player.playjianglingAudio(event.name,target);
                    await player.gainPlayerCard(target, 'hej', true, [1, 2]);
                }
            }
        },
        ai: {
            threaten: 3,
            effect: {
                player: function (card, player, target) {
                    function getshouyi1() { 
                        let num = 0;
                        if (Math.random() < 0.892 + 0.08) {
                            const setnum = [1, 2, 3].randomGet();
                            num = setnum;
                        }
                        return num;
                    }
                    function getshouyi2() { 
                        const target = _status.currentPhase;
                        let num = 0;
                        if (Math.random() < 0.892 + 0.08) {
                            if (target && get.attitude(player, target) <= 0) {
                                const cards = target.getGainableCards(player, 'hej');
                                num = cards.slice(0, 2).length;
                            } else {
                                num = 0;
                            }
                        }
                        return num;
                    }
                    const name = get.name(card,player);
                    if (name) {
                        if (name === "sha" && get.attitude(player, target) <= 0) {
                            return 1 + getshouyi1();
                        }
                        if (name === "tao" && get.attitude(player, target) > 0 && target.hp + 1 < target.maxHp) {
                            return 1 + getshouyi1();
                        }
                        if (name === "shan" || name === "wuxie") {
                            return [1, getshouyi2()];
                        } else {
                            return;
                        }
                    }
                },
            },
        },
        "_priority": 0,
    },
    //将灵：曹纯
    sznjl_shanjia: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            global:["phaseUseBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_shanjia_roundcount) player.sznjl_shanjia_roundcount = 0;
            if(!player.hasSkill('sznjl_shanjia_sha')) player.addSkill('sznjl_shanjia_sha');
            if(!player.hasSkill('sznjl_shanjia_roundcount')) player.addSkill('sznjl_shanjia_roundcount');
        },
        filter(event, player, name) {
            return Math.random() < 0.842 + 0.08 && player.sznjl_shanjia_roundcount < 3;
        },
        check(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            player.sznjl_shanjia_roundcount++;
            const num = [2, 3, 4].randomGet();
            player.playjianglingAudio(event.name);
            await player.draw(num);
            if (_status.currentPhase === player) {
                const Vcard = { 
                    name: "sha", 
                    nature: "", 
                    isCard: true, 
                    sznjl_shanjia: true 
                };
                const prompt = setColor('〖缮甲〗：是否视为使用一张〖杀〗，此〖杀〗不能被响应且伤害随机增加一至两点？');
                await player.chooseUseTarget(Vcard, prompt);
            }
        },
        ai: {
            threaten: 3,
        },
        subSkill: {
            roundcount:{
                trigger: {
                    global: "roundStart",
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_shanjia_roundcount) player.sznjl_shanjia_roundcount = 0;
                    player.sznjl_shanjia_roundcount = 0;
                },
                sub: true,
                sourceSkill: "sznjl_shanjia",
                forced: true,
                "_priority": Infinity,
            },
            sha: {
                trigger: {
                    player:["useCard"],
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                forced: true,
                async init(player, skill) {

                },
                filter(event, player, name) {
                    const card = event.card;
                    return card && card.name == 'sha' && card.sznjl_shanjia && card.sznjl_shanjia == true;
                },
                async content(event, trigger, player) {
                    trigger.directHit.addArray(game.filterPlayer());
                    const num = [1, 2].randomGet();
                    game.log(player, '使用的', trigger.card, "不能被响应且伤害随机增加一至两点。");
                    if(player.hasSkill('sznjl_shanjia')) {
                        player.playjianglingAudio('sznjl_shanjia',game.filterPlayer());
                    }
                    trigger.baseDamage += num;
                },
                sub: true,
                sourceSkill: "sznjl_shanjia",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    sznjl_xiaorui: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            source:["damageBegin4"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        usable: 4,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            const source = event.source;
            const key1 = source && source.isAlive() && source === player;
            const key2 = event.num && event.num > 0;
            return Math.random() < 0.892 + 0.08 && key1 && key2;
        },
        check(event, player) {
            return get.attitude(player, event.player) <= 0;
        },
        async content(event, trigger, player) {
            player.playjianglingAudio(event.name,trigger.player);
            const cards = trigger.player.getGainableCards(player, 'he');
            if (cards && cards.length > 0) {
                const gainnum = [1, 2, 3, 4].randomGet();
                const gaincards = cards.randomGets(Math.min(gainnum, cards.length)); 
                player.gain(gaincards,trigger.player,'giveAuto','bySelf');//仅自己看到
            }
            const num = [1, 2, 3, 4].randomGet();
            trigger.num += num;
        },
        ai: {
            threaten: 3,
        },
        "_priority": 0,
    },
    //将灵：曹婴
    sznjl_lingren: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player:["useCardToPlayered"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_lingren_used) player.sznjl_lingren_used = 0;
            if(!player.hasSkill('sznjl_lingren_clear')) player.addSkill('sznjl_lingren_clear');
        },
        filter(event, player, name) {
            if (event.getParent().triggeredTargets3.length > 1) return false;
            if (!["basic", "trick"].includes(get.type(event.card))) return false;
            const key1 = get.tag(event.card, "damage") && player.sznjl_lingren_used < 2;
            const key2 = event.targets && event.targets.length > 0;
            return Math.random() < 0.842 + 0.08 && key1 && key2;
        },
        async cost(event, trigger, player) {
            const targets = trigger.targets;
            const prompt = setColor('〖凌人〗：选择其中一个目标使此牌对其伤害随机增加一至两点，然后你随机摸一至三张牌，并且你获得〖奸雄〗、〖行殇〗直到你下回合开始(每回合限2次）');
            event.result = await player.chooseTarget(prompt, 1, (card, player, target) => {
                return targets.includes(target);
            }).set('ai', target => {
                const enemies = targets.filter(o => get.attitude(player, o) < 2).sort((a,b) => {
                    const cards_a = a.getCards('hs');
                    const cards_b = b.getCards('hs');
                    if(cards_a && cards_b) return cards_a.length - cards_b.length;
                    return a.hp - b.hp;
                });
                if(enemies.length > 0) return target === enemies[0];
                return false;
            }).set("targets", trigger.targets).forResult();
        },
        derivation: ['sznjl_lingren_jianxiong','sznjl_lingren_xingshang'],
        async content(event, trigger, player) {
            const target = event.targets[0];
            player.playjianglingAudio(event.name,target);
            player.sznjl_lingren_used++;
            const damage = [1, 2].randomGet();
            const map = trigger.customArgs;
            const id = target.playerid;
            map[id] ??= {};
            if (typeof map[id].extraDamage != "number") map[id].extraDamage = 0;
            map[id].extraDamage += damage;
            const num = [1, 2, 3].randomGet();
            await player.draw(num);
            const skills = ['sznjl_lingren_jianxiong','sznjl_lingren_xingshang'];
            for (const skill of skills) {
                if (!player.hasSkill(skill)) player.addTempSkill(skill, {player: "phaseBegin"});
            }
        },
        ai: {
            threaten: 3,
            effect: {
                player: function (card, player, target) {
                    if(!player.hasSkill('sznjl_lingren_clear') || !player.sznjl_lingren_used) return;
                    if (player.sznjl_lingren_used >= 2) return;
                    const damage = get.tag(card, "damage");
                    const type = get.type(card);
                    function getshouyi() {
                        let num1 = 1 , num2 = 0, num3 = 0;
                        if (Math.random() < 0.842 + 0.08) {
                            //1.增伤，2.摸牌，3.获得技能
                            num1 = [1, 2].randomGet();
                            num2 = [1, 2, 3].randomGet();
                            const skills = ['sznjl_lingren_jianxiong','sznjl_lingren_xingshang'];
                            for (const skill of skills) {
                                if (!player.hasSkill(skill)) {
                                    num3 += 1;
                                }
                            }
                        }
                        return [num1, num2 + num3];
                    }
                    if (damage && damage > 0.5 && get.attitude(player, target) <= 0) {
                        if (type === "basic" || type === "trick") return [1 + getshouyi()[0], getshouyi()[1]];
                    }
                },
            },
        },
        subSkill: {
            jianxiong:{
                audio:"ext:银竹离火/audio/skill:2",
                trigger: { player: "damageEnd", },
                firstDo: true,
                locked: false,
                filter(event, player) {
                    const source = event.source;
                    const num = event.num;
                    return source && num && num > 0;
                },
                check(event, player) {
                    return true;
                },
                async content(event, trigger, player) {
                    if (get.itemtype(trigger.cards) == "cards" && get.position(trigger.cards[0], true) == "o") {
                        await player.gain(trigger.cards, "gain2");
                    }
                    if(trigger.num > 0) {
                        await player.draw(trigger.num);
                    }
                },
                ai: {
                    maixie: true,
                    maixie_hp: true,
                    effect: {
                        target: function (card, player, target) {
                            const damage = get.tag(card, "damage");
                            if (damage && getAliveNum(target, damage) > 0) {
                                if (player.hasSkillTag("jueqing", false, target)) return [1, -1];
                                return [1, damage + 1];
                            }
                        },
                    },
                },
                sub: true,
                sourceSkill: "sznjl_lingren",
                "_priority": 0,
            },
            xingshang:{
                audio:"ext:银竹离火/audio/skill:2", 
                trigger: { global: "die", },
                firstDo: true,
                locked: false,
                filter(event, player) {
                    return player.isDamaged() || event.player.getCards('hejsx').length > 0;
                },
                async cost(event, trigger, player) {
                    const list = [
                        setColor("〖选项一〗：回复一点体力。"),
                        setColor("〖选项二〗：获得" + get.translation(trigger.player) + "的所有牌。"),
                    ];
                    const prompt = setColor("〖行殇〗");
                    const chooseButton = await player.chooseButton([prompt,
                        [list.map((item, i) => {return [i, item];}),"textbutton",],
                    ]).set("filterButton", function (button) {
                        if (button.link === 0) {
                            return player.isDamaged();
                        } else if (button.link === 1) {
                            return trigger.player.getCards('hejsx').length > 0;
                        }
                    }).set("selectButton", 1).set("ai", function (button) {
                        function getlinksNum () {
                            let links = [];
                            if (player.isDamaged()) links.push(0);
                            if (trigger.player.getCards('hejsx').length > 0) links.push(1);
                            return links;
                        }
                        function getValueLinks() {
                            const links = getlinksNum();
                            if (links.includes(1)) {
                                const cards = trigger.player.getCards('hejsx');
                                if (cards && cards.length >= player.isDamaged() * 2) {
                                    return 1;
                                }
                            }
                            if (links.includes(0)) {
                                const compareNum = Math.floor(player.maxHp / 3)
                                if (player.getDamagedHp() > compareNum || player.hp < compareNum) return 0;
                            }
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
                        event.result = {
                            bool: true,
                            cost_data: chooseButton.links,
                        };
                    }
                },
                async content(event, trigger, player) {
                    const choices = event.cost_data;
                    if (choices.includes(0)) {
                        await player.recover();
                    } else if (choices.includes(1)) {
                        const cards = trigger.player.getCards('hejsx');
                        await player.gain(cards, trigger.player, "giveAuto", "bySelf");
                    }
                },
                sub: true,
                sourceSkill: "sznjl_lingren",
                "_priority": 0,
            },
            clear:{
                trigger: { global: "phaseAfter", },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_lingren_used) player.sznjl_lingren_used = 0;
                    player.sznjl_lingren_used = 0;
                },
                sub: true,
                sourceSkill: "sznjl_lingren",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    sznjl_fujian: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player: ["phaseZhunbeiBegin","phaseJieshuBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            const targets = game.filterPlayer(o => o.isAlive() && o.getCards('h').length > 0 && o !== player);
            return Math.random() < 0.892 + 0.08 && targets.length > 0;
        },
        async cost(event, trigger, player) {
            const targets = game.filterPlayer(o => o.isAlive() && o.getCards('h').length > 0 && o !== player);
            const prompt = setColor('〖伏间〗：是否观看一名其他角色的手牌，然后你可以获得其中至多两张牌，若颜色相同，对其造成一点伤害。');
            const result = await player.chooseTarget(prompt, 1, (card, player, target) => {
                return targets.includes(target);
            }).set('ai', target => {
                const enemies = targets.filter(o => get.attitude(player, o) < 2).sort((a,b) => {
                    const cards_a = a.getCards('h');
                    const cards_b = b.getCards('h');
                    if(cards_a && cards_b) return cards_a.length - cards_b.length;
                    return a.hp - b.hp;
                });
                if(enemies.length > 0) {
                    const targetWithTwoCards = enemies.find(enemy => enemy.getCards('h').length === 2);
                    if (targetWithTwoCards) {
                        return target === targetWithTwoCards;
                    } else {
                        return target === enemies[0];
                    }
                }
                return false;
            }).forResult();
            if (result.bool) {
                const target = result.targets[0];
                const cards = target.getCards('h');
                if(cards && cards.length > 0) {
                    //await game.cardsGotoOrdering(cards);不要放处理区了，不然害得发生卡牌移动，放回对方手里！
                    const setnum = Math.min(2, cards.length);
                    const prompt = setColor('〖伏间〗：请选择至多' + get.cnNumber(setnum) + '张牌，若颜色相同，对' + get.translation(target) + '造成一点伤害。');
                    const chooseCard = await player.chooseCardButton( prompt, cards, [1, setnum]).set("filterButton", function(button) {
                       return true;
                    }).set("ai", function(button) {
                        const sortedAllCards = cards.sort((a, b) => {
                            return get.value(b,player) - get.value(a,player);
                        }).slice(0, 2);
                        const sortedRedCards = cards.filter(card => get.color(card) == "red").sort((a, b) => {
                            return get.value(b,player) - get.value(a,player);
                        }).slice(0, 2);
                        const sortedBlackCards = cards.filter(card => get.color(card) == "black").sort((a, b) => {
                            return get.value(b,player) - get.value(a,player);
                        }).slice(0, 2);
                        const compareRedsValue = sortedRedCards.reduce((a, b) => {
                            return a + get.value(b,player);
                        }, 0);
                        const compareBlacksValue = sortedBlackCards.reduce((a, b) => {
                            return a + get.value(b,player); 
                        }, 0);

                        if (sortedRedCards.length >= 2 && compareRedsValue >= compareBlacksValue) {
                            if(sortedRedCards.includes(button.link)) return 1;
                            else return 0;
                        }
                        if (sortedBlackCards.length >= 2 && compareBlacksValue >= compareRedsValue) {
                            const hasNoHighValueCards = sortedRedCards.every(card => get.value(card, player) < compareValue(player,'tao'));
                            if(sortedBlackCards.includes(button.link) && hasNoHighValueCards) return 1;
                            else return 0;
                        }
                        if (sortedAllCards.includes(button.link)) return 1;
                        else return 0;
                    }).forResult();
                    if (chooseCard.bool) {
                        event.result = {
                            bool: true,
                            cost_data: {
                                target: target,
                                cards: chooseCard.links,
                            },
                        };
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const target = event.cost_data.target;
            const cards = event.cost_data.cards;
            player.playjianglingAudio(event.name,target);
            await player.gain(cards,target,'giveAuto','bySelf');
            const colors = cards.map(card => get.color(card));
            const color = colors[0];
            if (colors.every(c => c === color)) {
                await target.damage(1, 'nocard', player);
            }
        },
        ai: {
            threaten: 3,
        },
        "_priority": 0,
    },
    //将灵：关索
    sznjl_xiefang: {
        audio:"ext:银竹离火/audio/jiangling:true", 
        trigger: {
            player:["phaseUseBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        setxiefang(){
            const num = game.countPlayer(function (current) {
                return current.hasSex('female');
            });
            return num + 1;
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            return Math.random() < 0.842 + 0.08;
        },
        check(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            player.playjianglingAudio(event.name);
            const setnum = get.info("sznjl_xiefang").setxiefang() || 1;
            await player.draw(setnum);
            await player.addTempSkill('sznjl_xiefang_sha',{player: "phaseUseEnd"});
            player.markSkill('sznjl_xiefang_sha');
        },
        ai: {
            threaten: 3,
        },
        subSkill: {
            sha: {
                mark: true,
                marktext: "<font color= #FF2400>撷芳</font>",
                intro: {
                    name: "<font color= #FF2400>撷芳</font>",
                    onunmark: true,
                    mark: function(dialog, storage, player) {
                        const setnum = get.info("sznjl_xiefang").setxiefang() || 1;
                        let result = "撷芳加成数值X = " + setnum + "。";
                        dialog.addText(result);
                    },
                    markcount: function(storage, player) {
                        return get.info("sznjl_xiefang").setxiefang() || 1;
                    },
                },
                trigger: {
                    player:["useCard"],
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                forced: true,
                usable: 2,
                async init(player, skill) {

                },
                filter(event, player, name) {
                    if (!player.hasSkill('sznjl_xiefang')) return;
                    const card = event.card;
                    return card && card.name == 'sha' && player.isPhaseUsing();
                },
                async content(event, trigger, player) {
                    trigger.baseDamage += get.info("sznjl_xiefang").setxiefang() || 1;
                },
                mod: {
                    cardUsable(card, player, num) {
                        if (!player.hasSkill('sznjl_xiefang') || !player.isPhaseUsing() || !card || card.name !== "sha") return;
                        return num + get.info("sznjl_xiefang").setxiefang() || 1;
                    },
                    globalFrom(from, to, distance) {
                        if (!from.hasSkill('sznjl_xiefang') || !from.isPhaseUsing()) return;
                        return distance - get.info("sznjl_xiefang").setxiefang() || 1;
                    },
                },
                sub: true,
                sourceSkill: "sznjl_xiefang",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    sznjl_zhengnan: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        marktext:"<font color= #FF2400>征南</font>",
        intro:{
            content: "players",
            onunmark:true,
            name:"<font color= #FF2400>征南</font>",
        },
        trigger: {
            global: ["damageAfter"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.hasSkill('sznjl_zhengnan_clear')) player.addSkill('sznjl_zhengnan_clear');
        },
        filter(event, player, name) {
            const evthp = event.player.hp;
            return Math.random() < 0.942 + 0.08 && evthp <= player.hp && !player.getStorage("sznjl_zhengnan").includes(event.player);
        },
        derivation: ['sznjl_zhengnan_wusheng','sznjl_zhengnan_dangxian','sznjl_zhengnan_zhiman'],
        async cost(event, trigger, player) {
            const drawnum = [1,2,3].randomGet();
            await player.draw(drawnum);
            const setSkills = ['sznjl_zhengnan_wusheng','sznjl_zhengnan_dangxian','sznjl_zhengnan_zhiman'];
            const unhasSkills = setSkills.filter(s =>!player.hasSkill(s));
            if (unhasSkills.length > 0) {
                const lists = [...unhasSkills, 'cancel2'];
                const prompt = setColor('〖征南〗：是否选择并获得一个技能直到你的回合结束？');
                const result = await player.chooseControl(lists).set('prompt', prompt).set ("ai", () => {
                    if (unhasSkills.includes('sznjl_zhengnan_dangxian')) return 'sznjl_zhengnan_dangxian';
                    return lists.randomGet();
                }).set(/*"forced", true*/).forResult();
                if (result.control !== 'cancel2') {
                    if (!player.getStorage(event.name).includes(trigger.player)) {
                        player.markAuto(event.name, [trigger.player]);
                    }
                    event.result = {
                        bool: true,
                        cost_data: {
                            setSkill: result.control,
                        }
                    }
                }
            } else {
                if (!player.getStorage(event.name).includes(trigger.player)) {
                    player.markAuto(event.name, [trigger.player]);
                }
                event.result = {
                    bool: true,
                    cost_data: {
                        setSkill: false,
                    }
                }
            }
        },
        async content(event, trigger, player) {
            const setSkill = event.cost_data?.setSkill;
            if (setSkill) {
                if (setSkill !== false) {
                    await player.addTempSkill(setSkill, { player: "phaseEnd" });
                    game.log(player, "获得了技能", setSkill);
                } else {
                    await player.recover();
                }
            }
        },
        ai: {
            threaten: 3,
            maixie: true,
            maixie_hp: true,
            skillTagFilter: function (player,tag,arg) {
                if(tag == "maixie" || tag == "maixie_hp") {
                    if(player.getStorage("sznjl_zhengnan").includes(player)) return false;
                    return true;
                }
            },
            effect: {
                target: function (card, player, target) {
                    if(target.getStorage("sznjl_zhengnan").includes(target)) return;
                    function getshouyi() {
                        const setSkills = ['sznjl_zhengnan_wusheng','sznjl_zhengnan_dangxian','sznjl_zhengnan_zhiman'];
                        const unhasSkills = setSkills.filter(s =>!target.hasSkill(s));
                        //1.摸牌，2.获得技能，3，回血
                        let num1 = 1, num2 = 0 ,num3 = 0;
                        if (getAliveNum(target, get.tag(card, "damage")) > 1) {
                            if (Math.random() < 0.942 + 0.08) {
                                num1 = [1,2,3].randomGet();
                                if(unhasSkills.length > 0) {
                                    num2 = unhasSkills.length;
                                } else {
                                    num2 = 0;
                                    num3 = 1;
                                }
                            }
                            return num1 + num2 + num3;
                        } else {
                            return 0;
                        }
                    }
                    const damage = get.tag(card, "damage") > 0.5;
                    if (damage) {
                        if (player.hasSkillTag("jueqing", false, target)) return;
                        return [1, getshouyi()];
                    }
                },
            },
        },
        subSkill: {
            wusheng:{
                audio:"ext:银竹离火/audio/skill:2",
                mod: {
                    aiValue(player, card, num) {
                        const cards = player.getCards("hes").filter(c => get.color(c) === 'red');
                        if (!cards.includes(card)) return;
                        const Vcard = { name: "sha", nature: "", isCard: true, sznjl_zhengnan_wusheng: true };
                        return Math.max(num, get.value(Vcard, player));
                    },
                    aiUseful() {
                        return lib.skill.sznjl_zhengnan_wusheng.mod.aiValue.apply(this, arguments);
                    },
                    targetInRange(card) {
                        if (get.suit(card) == "diamond" && card.name == "sha") return true;
                    },
                },
                enable: ["chooseToRespond","chooseToUse"],
                locked: false,
                filterCard(card, player) {
                    return get.color(card) == "red";
                },
                selectCard: 1,
                position: "hes",
                viewAsFilter(player) {
                    const cards = player.getCards("hes").filter(c => get.color(c) === 'red');
                    return cards.length > 0;
                },
                viewAs(cards, player) {
                    return { name: "sha", nature: "", isCard: true, sznjl_zhengnan_wusheng: true };
                },
                prompt: "将一张红色牌当杀使用或打出",
                check(card) {
                    const player = get.owner(card);
                    const cards = player.getCards("hes").filter(c => get.color(c) === 'red').sort((a, b) =>{
                        return get.value(a,player) - get.value(b,player);
                    });
                    const key1 = get.value(card,player) === get.value(cards[0],player);
                    const key2 = get.value(card,player) < compareValue(player,'tao');
                    return key1 && key2;
                },
                precontent: async function () {
                    //无
                },
                onrespond: function () {
                    return this.onuse.apply(this, arguments);
                },
                onuse: async function (result) {
                    //无
                },
                hiddenCard: function (player, name) {
                    const cards = player.getCards("hes").filter(c => get.color(c) === 'red');
                    if (name == "sha") return cards.length > 0;
                    return false;
                },
                ai: {
                    respondSha: true,
                    skillTagFilter: function (player, tag) {
                        if (tag !== 'respondSha') return;
                        return player.getCards("hes").filter(c => get.color(c) === 'red').length > 0;
                    },
                    order: function (item, player) {
                        if (player && _status.event.type == "phase") {
                            const Vcard = { name: "sha", nature: "", isCard: true, sznjl_zhengnan_wusheng: true };
                            const cards = player.getCards("hes").filter(c => get.color(c) === 'red');
                            if (!cards || !cards.length) return 0;
                            const order = get.order(Vcard, player);
                            if (order && order > 0) {
                                const filterCards = cards.filter(card => {
                                    return get.color(card) === "red" && get.value(card, player) <= get.value(Vcard, player);
                                });
                                if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0 && filterCards.length > 0) {
                                    return order + 0.15;//返回比杀大一点点，不然要这个技能单机又不用干鸡毛
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
                sourceSkill: "sznjl_zhengnan",
                "_priority": 0,
            },
            dangxian:{
                audio:"ext:银竹离火/audio/skill:2",
                trigger: {
                    player: ["phaseBegin","phaseUseBegin"],
                },
                locked: true,
                async init(player, skill) {
                    if (!player.storage.sznjl_zhengnan_dangxian) player.storage.sznjl_zhengnan_dangxian = false;
                },
                filter(event, player,name) {
                    if (name === "phaseBegin") {
                        return true;
                    } else if (name === "phaseUseBegin") {
                        return player.storage.sznjl_zhengnan_dangxian;
                    }
                },
                async cost(event, trigger, player) {
                    const Time = event.triggername;
                    if (Time === "phaseBegin") {
                        player.storage.sznjl_zhengnan_dangxian = true;
                        event.result = {
                            bool: true,
                            cost_data: {
                                phaseUse: false,
                            },
                        }
                    } else if (Time === "phaseUseBegin") {
                        player.storage.sznjl_zhengnan_dangxian = false;
                        const prompt = setColor('〖当先〗：是否要失去一点体力并从牌堆或弃牌堆中随机获得一张〖杀〗？');
                        const result = await player.chooseBool(prompt).set('ai', () => {
                            const hasSha = player.getCards("hes").filter(c => {
                                const skillkey = player.hasSkill('sznjl_zhengnan_wusheng');
                                if (skillkey) {
                                    return get.name(c) === "sha" || get.color(c) === "red";
                                } else {
                                    return get.name(c) === "sha";
                                }
                            });
                            const Vcard = { name: "sha", nature: "", isCard: true, sznjl_zhengnan_wusheng: true };
                            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                return player.hp > 2 && (!hasSha || hasSha.length === 0);
                            } else {
                                return false;
                            }
                        }).forResult();
                        if (result.bool) {
                            event.result = {
                                bool: true,
                                cost_data: {
                                    phaseUse: true,
                                },
                            }
                        }
                    }
                },
                async content(event, trigger, player) {
                    const phaseUse = event.cost_data?.phaseUse;
                    if (!phaseUse) {
                        const next = player.phaseUse();
                        event.next.remove(next);
                        trigger.next.push(next);
                    } else {
                        await player.loseHp();
                        await player.specifyCards('sha');
                    }
                },
                sub: true,
                sourceSkill: "sznjl_zhengnan",
                "_priority": 0,
            },
            zhiman:{
                audio:"ext:银竹离火/audio/skill:2",
                trigger: {
                    source: ["damageBegin2"],
                },
                locked: false,
                async init(player, skill) {
                    if (!player.storage.sznjl_zhengnan_dangxian) player.storage.sznjl_zhengnan_dangxian = false;
                },
                filter(event, player, name) {
                    return player != event.player;
                },
                async cost(event, trigger, player) {
                    const target = trigger.player;
                    const prompt = setColor('〖制蛮〗：是否要防止此伤害，然后获得' + get.translation(target) + '区域内一张牌？');
                    const result = await player.chooseBool(prompt).set('ai', () => {
                        if (get.damageEffect(target, player, player) < 0) return true;
                        const attitude = get.attitude(player, target);
                        if (attitude > 0 && target.countCards("j") > 0) return true;
                        if (trigger.num > 1) {
                            if (attitude > 0) return true;
                            else return false;
                        }
                        const cards = trigger.player.getGainableCards(player, "he");
                        for (let i = 0; i < cards.length; i++) {
                            if (get.equipValue(cards[i]) >= 6) {
                                return true;
                            }
                        }
                        return false;
                    }).forResult();
                    if (result.bool) {
                        event.result = {
                            bool: true,
                            cost_data: target,
                        }
                    }
                },
                logTarget: "player",
                line: "fire",
                async content(event, trigger, player) {
                    const target = event.cost_data;
                    const cards = target.getGainableCards(player, "hej");
                    if (cards && cards.length > 0) {
                        await player.gainPlayerCard(target, "hej", true);
                    }
                    trigger.cancel();
                },
                sub: true,
                sourceSkill: "sznjl_zhengnan",
                "_priority": 0,
            },
            clear:{
                trigger: { global: "phaseAfter", },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    player.removeStorage('sznjl_zhengnan');
                    player.unmarkSkill('sznjl_zhengnan');
                },
                sub: true,
                sourceSkill: "sznjl_zhengnan",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    //将灵：赵襄
    sznjl_fanghun: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            global: ["loseAfter","loseAsyncAfter","cardsDiscardAfter"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_fanghun_used) player.sznjl_fanghun_used = 0;
            if(!player.hasSkill('sznjl_fanghun_clear')) player.addSkill('sznjl_fanghun_clear');
        },
        isUseOrRespond(event, player) {
            if (event.name !== "cardsDiscard") {
                return false;
            }
            const evtx = event.getParent();
            if (evtx.name !== "orderingDiscard") {
                return false;
            }
            const evt2 = evtx.relatedEvent || evtx.getParent();
            return ["useCard", "respond"].includes(evt2.name) && evt2.player == player;
        },
        getCards(player) {
            const cards = [];
            game.checkGlobalHistory("cardMove", evt => {
                if (get.info("sznjl_fanghun").isUseOrRespond(evt, player)) {
                    cards.addArray(
                        evt.cards.filter(card => {
                            const key = card.name === "sha" || card.name === "shan";
                            return key && get.position(card) === "d";
                        })
                    );
                }
            });
            return cards;
        },
        filter(event, player, name) {
            return Math.random() < 0.892 + 0.08 && get.info("sznjl_fanghun").getCards(player).length > 0 && player.sznjl_fanghun_used < 3;
        },
        async cost(event, trigger, player) {
            const cards = get.info("sznjl_fanghun").getCards(player);
            const fanyi = cards.map(c => get.translation(c)).join('、');
            let num = 3 - player.sznjl_fanghun_used;
            const prompt = setColor('〖芳魂〗：是否要获得' + fanyi + '？然后你可以弃置一名其他角色至多三张牌，并随机摸一至三张牌，再对其造成一点伤害。本回合剩余次数：' + num + '次。');
            const result = await player.chooseBool(prompt).set('ai', () => {
                return true;
            }).forResult();
            if (result.bool) {
                let choosetargets = [], drawnum = 0;
                const targets = game.filterPlayer(o => {
                    const cards = o.getDiscardableCards(player, 'hej');
                    return o.isAlive() && cards.length > 0;
                });
                if (targets && targets.length > 0) {
                    const prompt = setColor('〖芳魂〗：是否要弃置一名其他角色至多三张牌，并随机摸一至三张牌，再对其造成一点伤害？');
                    const Targetresult = await player.chooseTarget(prompt, 1, (card, player, target) => {
                        return targets.includes(target);
                    }).set('ai', target => {
                        const friends = targets.filter(o => get.attitude(player, o) > 0);
                        const enemies = targets.filter(o => get.attitude(player, o) <= 0).sort((a, b) => {
                            const cards_a = a.getDiscardableCards(player, 'hej');
                            const cards_b = b.getDiscardableCards(player, 'hej');
                            if(cards_a.length !== cards_b.length) return cards_b.length - cards_a.length;
                            return a.hp - b.hp;
                        });
                        let hasBadjCards = [];
                        for (const friend of friends) {
                            const jcards = friend.getCards('j').filter(card => {
                                const effect = get.effect(friend, card, friend, friend);
                                return effect && effect < 0;
                            });
                            if (jcards.length > 0 && !hasBadjCards.includes(friend) && getAliveNum(friend,1) > 0) {
                                hasBadjCards.push(friend);
                            }
                        }
                        if (hasBadjCards.length > 0) return target === hasBadjCards[0];
                        if (enemies.length > 0) return target === enemies[0];
                        return false;
                    }).forResult();
                    if (Targetresult.bool) {
                        choosetargets = [Targetresult.targets[0]];
                        drawnum = [1, 2, 3].randomGet();
                    }
                }
                event.result = {
                    bool: true,
                    cost_data: {
                        cards: cards,
                        targets: choosetargets,
                        num: drawnum,
                    },
                }
            }
        },
        async content(event, trigger, player) {
            player.sznjl_fanghun_used ++;
            player.playjianglingAudio(event.name);
            const {cards, targets, num} = event.cost_data;
            if (cards && cards.length > 0) await player.gain(cards,'gain2');
            if(targets && targets.length > 0) {
                const target = targets[0];
                const Tcards = target.getDiscardableCards(player, 'hej');
                if (Tcards && Tcards.length > 0) {
                    await player.discardPlayerCard(target, 'hej', true, [1, Math.min(3, Tcards.length)]);
                }
                if (num > 0) await player.draw(num);
                await target.damage(1, 'nocard', player);
            }
        },
        ai: {
            threaten: 3,
            effect: {
                player: function (card, player, target) {
                    if(!player.hasSkill('sznjl_fanghun_clear') || !player.sznjl_fanghun_used) return;
                    if(player.sznjl_fanghun_used >= 3) return;
                    function getshouyi() {
                        //1.回收卡牌；2.弃置其他角色；3.随机摸牌；4.造成伤害
                        let num1 = 1, num2 = 0, num3 = 0 , num4 = 0;
                        if (Math.random() < 0.892 + 0.08) {
                            const enemies = game.filterPlayer(o => {
                                const cards = o.getDiscardableCards(player, 'hej');
                                return o.isAlive() && cards.length > 0 && get.attitude(player, o) <= 0;
                            }).sort((a, b) => {
                                const cards_a = a.getDiscardableCards(player, 'hej');
                                const cards_b = b.getDiscardableCards(player, 'hej');
                                if(cards_a.length !== cards_b.length) return cards_b.length - cards_a.length;
                                return a.hp - b.hp;
                            });
                            if (!enemies || enemies.length === 0) {
                                num2 = 0;
                            } else {
                                const cards = enemies[0].getDiscardableCards(player, 'hej');
                                num2 = cards.slice(0, 3).length;
                            }
                            num3 = [1, 2, 3].randomGet();
                            num4 = 1;
                        }
                        return num1 + num2 + num3 + num4;//毕竟使用者是你！num1起码还能返回1。
                    }
                    const name = get.name(card,player);
                    if (name) {
                        if (name === "sha" && get.attitude(player, target) <= 0) {
                            return [1, getshouyi()];
                        }
                        if (name === "shan") {
                            return [1, getshouyi()];
                        }
                    }
                },
            },
        },
        subSkill: {
            clear:{
                trigger: {
                    global: "phaseAfter",
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_fanghun_used) player.sznjl_fanghun_used = 0;
                    player.sznjl_fanghun_used = 0;
                },
                sub: true,
                sourceSkill: "sznjl_fanghun",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    sznjl_fuhan: {
        audio:"ext:银竹离火/audio/jiangling:true",
        mark: true,
        marktext: "<font color= #FF2400>扶汉</font>",
        intro: {
            name: "<font color= #FF2400>扶汉</font>",
            onunmark: true,
            mark: function(dialog, storage, player) {
                let result = "已获得技能：";
                const skills = player.sznjl_fuhan_addtemp || [];
                if (skills && skills.length > 0) {
                    result += skills.map(skill => get.translation(skill)).join('、');
                } else {
                    result += "无";
                }
                dialog.addText(result);
            },
            markcount: function(storage, player) {
                const skills = player.sznjl_fuhan_addtemp || [];
                return skills.length;
            },
        },
        trigger: {
            source:["damageEnd"],
            player:["damageEnd"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_fuhan_used) player.sznjl_fuhan_used = 0;
            if(!player.hasSkill('sznjl_fuhan_clear')) player.addSkill('sznjl_fuhan_clear');
            if(!player.sznjl_fuhan) player.sznjl_fuhan = [];
            if(!player.sznjl_fuhan_addtemp) player.sznjl_fuhan_addtemp = [];
            const shuSkills = get.info("sznjl_fuhan").setfuhan(player);
            if(shuSkills.length > 0) {
                player.sznjl_fuhan.push(...shuSkills);
            }
            if(!player.checksznjl_fuhan) player.checksznjl_fuhan = function(){
                const shuSkills = player.sznjl_fuhan.filter(skill => {
                    const hasSkills1 = player.getSkills(null, false, false);
                    const hasSkills2 = player.sznjl_fuhan_addtemp;
                    return !hasSkills1.includes(skill) && !hasSkills2.includes(skill);
                });
                return shuSkills;
            }
            if(!player.hasSkill('sznjl_fuhan_removeMark')) player.addSkill('sznjl_fuhan_removeMark');
        },
		skillsTypes: ["锁定技","主公技","限定技","觉醒技","转换技","隐匿技","宗族技","势力技","使命技","蓄力技","阵法技","主将技","副将技","君主技","蓄能技","Charlotte","昂扬技","持恒技","连招技","威主技"],
		bannedTypes: ["主公技","限定技","觉醒技","隐匿技","势力技","使命技","阵法技","主将技","副将技","君主技","Charlotte","威主技"],
        filterSkills(skillxx) {
            const infos = get.info(skillxx);
            if(!infos) return [];
            const bannedTypes = get.info("sznjl_fuhan").bannedTypes;
            const categories = get.skillCategoriesOf(skillxx, get.player());
            if(categories.some(c => bannedTypes.includes(c))) return [];
            return [skillxx];
        },
        setfuhan() {
            let shuSkills = [];
            const seenSkills = new Set();
            const setlist = [
                'refresh', // 界限突破
                'sp',      // 璀璨星河
                'sp2',     // 系列专属
                'newjiang',// 新一将成名
                'huicui',  // 群英荟萃
                'xianding', // 限定专属
            ];
            const Packs = lib.characterPack;
            for (const packName of setlist) {
                if (!Packs[packName]) continue;
                for (let characterName in Packs[packName]) {
                    const fanyi = lib.translate[characterName];
                    if (fanyi && fanyi.includes('赵云')) continue;
                    if (!fanyi) continue;
                    const info = Packs[packName][characterName];
                    if (info) {
                        const group = info.group;
                        if (group && group === 'shu' && info.skills && Array.isArray(info.skills) && info.skills.length > 0) {
                            const skills = info.skills.filter(skill => {
                                const filterSkills = get.info("sznjl_fuhan").filterSkills;
                                return filterSkills(skill).includes(skill);
                            });
                            if (skills.length > 0) {
                                for (const skill of skills) {
                                    if (!seenSkills.has(skill)) {
                                        seenSkills.add(skill);
                                        shuSkills.push(skill);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return shuSkills;
        },
        filter(event, player, name) {
            const key1 = event.source && event.num && event.num > 0;
            const key2 = player.checksznjl_fuhan() && player.checksznjl_fuhan().length > 0;
            return Math.random() < 0.842 + 0.08 && key1 && key2 && player.sznjl_fuhan_used < 3;
        },
        check(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            player.playjianglingAudio(event.name);
            player.sznjl_fuhan_used ++;
            let num = trigger.num || 1;
            while(num > 0) {
                num --;
                const hasSkills = player.sznjl_fuhan_addtemp;
                if(hasSkills.length < 3) {
                    const shuSkills = player.checksznjl_fuhan();
                    const skill = shuSkills[Math.floor(Math.random() * shuSkills.length)];
                    if(!player.sznjl_fuhan_addtemp.includes(skill)) player.sznjl_fuhan_addtemp.push(skill);
                    player.addTempSkill(skill, {player: 'phaseEnd'});
                    player.markSkill('sznjl_fuhan');
                    player.update();
                    game.log(player, '获得了技能：', skill);
                } else {
                    await player.recover();
                    await player.draw(2);
                }
            }
        },
        ai: {
            threaten: 3,
            maixie: true,
            maixie_hp: true,
            skillTagFilter: function (player,tag,arg) {
                if(tag == "maixie" || tag == "maixie_hp") {
                    if(!player.hasSkill('sznjl_fuhan_clear') || !player.sznjl_fuhan_used) return false;
                    if(player.sznjl_fuhan_used >= 3 || !player.sznjl_fuhan_addtemp) return false;
                    return true;
                }
            },
            effect: {
                target: function (card, player, target) {
                    if(!target.hasSkill('sznjl_fuhan_clear') || !target.sznjl_fuhan_used) return;
                    if(target.sznjl_fuhan_used >= 3 || !target.sznjl_fuhan_addtemp) return;
                    function getshouyi() {
                        let num = 0;
                        if (Math.random() < 0.842 + 0.08 && getAliveNum(target, get.tag(card, "damage")) > 0) {
                            if (target.sznjl_fuhan_addtemp.length < 3) {
                                num = 1.5;
                            } else {
                                if (target.isDamaged()) {
                                    num = 1 + 2;
                                } else {
                                    num = 2;
                                }
                            }
                        } else {
                            num = 0;//卖血不是啥好事儿
                        }
                        return num;
                    }
                    const damage = get.tag(card, "damage");
                    const type = get.type(card);
                    if (damage && type && type !== "delay") {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        return [1, getshouyi()];
                    }
                },
                player: function (card, player, target) {
                    if (player.hasSkillTag("jueqing", false, target)) return;
                    if(!player.hasSkill('sznjl_fuhan_clear') || !player.sznjl_fuhan_used) return;
                    if(player.sznjl_fuhan_used >= 3 || !player.sznjl_fuhan_addtemp) return;
                    function getshouyi() {
                        let num = 0;
                        if (Math.random() < 0.842 + 0.08) {
                            if (player.sznjl_fuhan_addtemp.length < 3) {
                                num = 1.5;
                            } else {
                                if (player.isDamaged()) {
                                    num = 1 + 2;
                                } else {
                                    num = 2;
                                }
                            }
                        } else {
                            num = 1;//毕竟使用者是你！
                        }
                        return num;
                    }
                    const damage = get.tag(card, "damage");
                    const type = get.type(card);
                    if (damage && type && type !== "delay" && get.attitude(player, target) <= 0) {
                        return [1, getshouyi()];
                    }
                },
            },
        },
        subSkill: {
            clear:{
                trigger: {
                    global: "phaseAfter",
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_fuhan_used) player.sznjl_fuhan_used = 0;
                    player.sznjl_fuhan_used = 0;
                },
                sub: true,
                sourceSkill: "sznjl_fanghun",
                forced: true,
                "_priority": Infinity,
            },
            removeMark: {
                trigger: {
                    player:["phaseEnd"],
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                filter(event, player, name) {
                    return player.hasSkill('sznjl_fuhan') && player.sznjl_fuhan_addtemp;
                },
                async content(event, trigger, player) {
                    const hasSkills = player.getSkills(null, false, false);
                    const getSkills = player.sznjl_fuhan_addtemp.filter(skill => {
                        return !hasSkills.includes(skill);
                    });
                    if(getSkills.length > 0) {
                        player.sznjl_fuhan_addtemp = player.sznjl_fuhan_addtemp.filter(skill => {
                            return !getSkills.includes(skill);
                        });
                        player.markSkill('sznjl_fuhan');
                        player.update();
                        const fanyi = getSkills.map(skill => get.translation(skill)).join('、');
                        game.log(player, '失去了技能：', fanyi);
                    }
                },
                sub: true,
                sourceSkill: "sznjl_fuhan",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    //将灵：年兽
    sznjl_fange: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player:["damageEnd"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            return Math.random() < 0.902 + 0.08 && event.source && event.num && event.num > 0;
        },
        async cost(event, trigger, player) {
            const source = trigger.source;
            const cards = source.getGainableCards(player, "hej");
            const setnum = cards.slice(0, 2).length;
            const prompt = setColor('〖反戈〗：是否选择摸两张牌然后获得' + get.translation(source) + '至多' + get.cnNumber(setnum) + '张牌，再对其随机造成一至两点伤害？');
            const result = await player.chooseBool(prompt).set('ai', () => {
                return get.attitude(player, source) < 2;
            }).forResult();
            if (result.bool) {
                event.result = { bool: true, cost_data: source};
            }
        },
        async content(event, trigger, player) {
            const source = event.cost_data;
            player.playjianglingAudio(event.name, source);
            await player.draw(2);
            const cards = source.getGainableCards(player, "hej");
            if(cards && cards.length > 0) {
                await player.gainPlayerCard(source, 'hej', true, [1, Math.min(2, cards.length)]);
            }
            const num = [1, 2].randomGet();
            await source.damage(num, 'nocard', player);
        },
        ai: {
            threaten: 3,
            maixie: true,
            maixie_hp: true,
            effect: {
                target: function (card, player, target) {
                    if (get.attitude(player, target) > 0) return;
                    if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                    function getshouyi() {//1.摸牌，2.获得牌，3.造成伤害
                        let num1 = 0 ,num2 = 0, num3 = 0;
                        if(Math.random() < 0.902 + 0.08) {
                            num1 = 2;
                            const cards = player.getGainableCards(target, "hej");
                            if(cards && cards.length > 0) {
                                num2 = Math.min(2, cards.length);
                            }
                            num3 = [1, 2].randomGet();
                        } else {
                            num1 = 0.5;
                        }
                        return num1 + num2 + num3;
                    }
                    const damage = get.tag(card, "damage") > 0.5;
                    if (damage && getAliveNum(target, damage) > 0) {
                        return [1, getshouyi()];
                    }
                },
            }
        },
        "_priority": 0,
    },
    sznjl_xunlie: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            global: "phaseEnd",
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_xunlie_roundcount) player.sznjl_xunlie_roundcount = 0;
            if(!player.hasSkill('sznjl_xunlie_roundcount')) player.addSkill('sznjl_xunlie_roundcount');
        },
        filter(event, player, name) {
            return Math.random() < 0.952 + 0.08 && player.sznjl_xunlie_roundcount < 2;
        },
        async cost(event, trigger, player) {
            const target = trigger.player;
            const list = [
                setColor("〖选项一〗：令" + get.translation(target) + "回复一点体力并摸两张牌。"),
                setColor("〖选项二〗：对" + get.translation(target) + "造成一点伤害并随机弃置其两张牌。"),
            ];
            const prompt = setColor("〖寻猎〗");
            const chooseButton = await player.chooseButton([prompt,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                if (button.link === 0) {
                    return true;
                } else if (button.link === 1) {
                    return true;
                }
            }).set("selectButton", 1).set("ai", function (button) {
                function getValueLinks() {
                    const attitude = get.attitude(player, target);
                    if (attitude >= 2) {
                        if (get.recoverEffect(target,player,player) > 0) {
                            return 0;
                        } else {
                            return -1;
                        }
                    } else {
                        if(get.damageEffect(target, player, player, "damage") > 0) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }
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
                event.result = {
                    bool: true,
                    cost_data: {
                        target: target,
                        choices: chooseButton.links
                    },
                };
            }
        },
        async content(event, trigger, player) {
            const {target, choices} = event.cost_data;
            if (choices.includes(0)) {
                player.playjianglingAudio(event.name, target);
                player.sznjl_xunlie_roundcount ++;
                await target.recover();
                await target.draw(2);
            } else if (choices.includes(1)) {
                player.playjianglingAudio(event.name, target);
                player.sznjl_xunlie_roundcount ++;
                await target.damage(1, 'nocard', player);
                const cards = target.getDiscardableCards(player, 'he');
                if(cards && cards.length > 0) {
                    const chooseCards = cards.randomGets(Math.min(2, cards.length));
                    const next = target.discard(chooseCards);
                    next.discarder = player;
                }
            }
        },
        subSkill: {
            roundcount:{
                trigger: {
                    global: "roundStart",
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_xunlie_roundcount) player.sznjl_xunlie_roundcount = 0;
                    player.sznjl_xunlie_roundcount = 0;
                },
                sub: true,
                sourceSkill: "sznjl_xunlie",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    //将灵：灵雎
    sznjl_jieyuan: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            source:["damageBegin4"],
            player:["damageBegin4"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_jieyuan_source) player.sznjl_jieyuan_source = 0;
            if(!player.sznjl_jieyuan_player) player.sznjl_jieyuan_player = 0;
            if(!player.hasSkill('sznjl_jieyuan_clear')) player.addSkill('sznjl_jieyuan_clear');
        },
        filter(event, player, name) {
            const num = event.num;
            const source = event.source;
            const target = event.player;
            if(source && source == player && num && num > 0) {
                return Math.random() < 0.842 + 0.08 && player.sznjl_jieyuan_source < 1;
            }
            if(target && target == player && num && num > 0) {
                return Math.random() < 0.842 + 0.08 && player.sznjl_jieyuan_player < 1;
            }
            return false;
        },
        async cost(event, trigger, player) {
            const source = trigger.source;
            const target = trigger.player;
            const key1 = source && source == player;
            const key2 = target && target == player;
            let prompt;
            if(key1) {
                prompt = setColor('〖竭缘〗：是否令此伤害随机增加一至两点？');
            } else if(key2) {
                prompt = setColor('〖竭缘〗：是否令此伤害随机削减一至两点？');
            } else {
                return;
            }
            const result = await player.chooseBool(prompt).set('ai', () => {
                if(key1) {
                    const one = get.damageEffect(trigger.player, player, player, "damage") > 0;
                    const two = get.attitude(player, trigger.player) <= 0;
                    return one || two;
                } else if(key2) {//再说吧让人机将灵配合焚心尽量
                    if(getAliveNum(player,trigger.num) > 1) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }).forResult();
            if (result.bool) {
                const str = key1 ? '增加' : (key2 ? '削减' : '');
                if (str) {
                    if (key1) player.sznjl_jieyuan_source++;
                    else if (key2) player.sznjl_jieyuan_player++;
                    event.result = {
                        bool: true,
                        cost_data: { choosed: str }
                    };
                }
            }
        },
        async content(event, trigger, player) {
            const str = event.cost_data?.choosed;
            if(str) {
                player.playjianglingAudio(event.name);
                const setnum = [1, 2].randomGet();
                if(str == '增加') {
                    trigger.num += setnum;
                } else if(str == '削减') {
                    trigger.num -= setnum;
                }
            }
        },
        ai: {
            threaten: 3,
            maixie: true,
            maixie_hp: true,
            effect: {
                target: function (card, player, target) {
                    const func = {
                        jieyuan() {
                            if(!target.hasSkill('sznjl_jieyuan_clear') || !target.sznjl_jieyuan_player) return false;
                            return Math.random() < 0.842 + 0.08 && target.sznjl_jieyuan_player < 1;
                        },
                        fenxin() {//焚心不写收益了
                            return target.hasSkill('sznjl_fenxin') && Math.random() < 0.892 + 0.08 && !target.sznjl_fenxin_used;
                        }
                    }
                    const shouyi = {
                        jieyuan(damage) {
                            if(func.jieyuan()) {
                                if(getAliveNum(target, damage - 1) > 0) {//提前削减
                                    return [1, 2].randomGet();
                                }
                                return 0;
                            } else {
                                return 0;
                            }
                        },
                        fenxin(damage) {
                            if(func.fenxin()) {
                                if(getAliveNum(target, damage) + 1 > 0) {//提前加个回复！
                                    return [3, 4, 5].randomGet() + [1, 2].randomGet();
                                }
                                return 0;
                            } else {
                                return 0;
                            }
                        }
                    }
                    const damage = get.tag(card, "damage");
                    if (damage && damage > 0.5 && get.attitude(player, target) <= 0) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        const effect1 = Math.max(damage - shouyi.jieyuan(damage), 0);
                        const effect2 = shouyi.fenxin(damage);
                        return [effect1,effect2];
                    }
                },
                player: function (card, player, target) {
                    const func = {
                        filter() {
                            if(!player.hasSkill('sznjl_jieyuan_clear') || !player.sznjl_jieyuan_source) return false;
                            return Math.random() < 0.842 + 0.08 && player.sznjl_jieyuan_source < 1;
                        },
                        shouyi() {
                            let num = 0.5;
                            if(func.filter()) num = [1, 2].randomGet();
                            return num;
                        }
                    }
                    const damage = get.tag(card, "damage");
                    if (damage && damage > 0.5 && get.attitude(player, target) <= 0) {
                        return damage + func.shouyi();
                    }
                },
            },
        },
        subSkill: {
            clear:{
                trigger: { global: "phaseAfter", },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_jieyuan_source) player.sznjl_jieyuan_source = 0;
                    player.sznjl_jieyuan_source = 0;
                    if(!player.sznjl_jieyuan_player) player.sznjl_jieyuan_player = 0;
                    player.sznjl_jieyuan_player = 0;
                },
                sub: true,
                sourceSkill: "sznjl_jieyuan",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    sznjl_fenxin: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            global: ["dying"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_fenxin_used) player.sznjl_fenxin_used = false;
            if(!player.hasSkill('sznjl_fenxin_clear')) player.addSkill('sznjl_fenxin_clear');
        },
        filter(event, player, name) {
            return Math.random() < 0.892 + 0.08 && !player.sznjl_fenxin_used;
        },
        async cost(event, trigger, player) {
            const prompt = setColor('〖焚心〗：是否选择随机摸三至五张牌并随机回复一至两点体力(每回合限1次)？');
            const result = await player.chooseBool(prompt).set('ai', () => {
                return true;
            }).forResult();
            if (result.bool) {
                event.result = { bool: true };
            }
        },
        async content(event, trigger, player) {
            player.playjianglingAudio(event.name);
            const num = [3, 4, 5].randomGet();
            await player.draw(num);
            const setnum = [1, 2].randomGet();
            player.recover(setnum);
            player.sznjl_fenxin_used = true;
        },
        ai: {
            threaten: 3,
        },
        subSkill: {
            clear:{
                trigger: { global: "phaseAfter", },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                direct: true,
                async content(event, trigger, player) {
                    if(!player.sznjl_fenxin_used) player.sznjl_fenxin_used = false;
                    player.sznjl_fenxin_used = false;
                },
                sub: true,
                sourceSkill: "sznjl_fenxin",
                forced: true,
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    //将灵：司马一一
    sznjl_yizuo: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player:["phaseZhunbeiBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            const targets = game.filterPlayer(o => o.isAlive() && o!= player);
            return Math.random() < 0.842 + 0.08 && targets.length > 0;
        },
        async cost(event, trigger, player) {
            const targets = game.filterPlayer(o => o.isAlive() && o!= player);
            const prompt = setColor('〖懿佐〗：是否选择一名其他角色对其造成随机点数的伤害并获得其若干张牌，总数为6。');
            event.result = await player.chooseTarget(prompt, 1, (card, player, target) => {
                return targets.includes(target);
            }).set('ai', target => {
                const enemies = targets.filter(o => get.attitude(player, o) <= 0).sort((a,b) => {
                    const cards_a = a.getGainableCards(player, 'hej');
                    const cards_b = b.getGainableCards(player, 'hej');
                    if(cards_a && cards_b) return cards_b.length - cards_a.length;
                    return a.hp - b.hp;
                });
                if(enemies.length > 0) return target === enemies[0];
                return false;
            }).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            player.playjianglingAudio(event.name,target);
            const damage = [0, 1, 2, 3, 4, 5, 6].randomGet();
            const gainmun = 6 - damage;
            await target.damage(damage, 'nocard', player);
            const cards = target.getGainableCards(player, 'hej');
            if(cards && cards.length > 0 && gainmun > 0) {
                await player.gainPlayerCard(target, 'hej', true, [1, gainmun]);
            }
        },
        "_priority": 0,
    },
    sznjl_zhengwei: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player: ["gainEnd"],
            global: ["loseAsyncEnd"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        usable: 1,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            const cards = event.getg(player);
            if (!cards || cards.length === 0) return false;
            const targets = game.filterPlayer(o => o.isAlive() && o!= player);
            if (!targets || targets.length === 0) return false;
            return Math.random() < 0.892 + 0.08;
        },
        async cost(event, trigger, player) {
            const cards = trigger.getg(player);
            const targets = game.filterPlayer(o => o.isAlive() && o!= player);
            const setnum = Math.min(2, targets.length);
            const prompt = setColor('〖拯危〗：是否选择至多两名角色各摸' + get.cnNumber(cards.length) + '张牌？');
            event.result = await player.chooseTarget(prompt, [1, setnum], (card, player, target) => {
                return targets.includes(target);
            }).set('ai', target => {
                return get.attitude(player, target) > 0;
            }).forResult();
            if(event.result.bool) event.result.cost_data = cards.length;
        },
        async content(event, trigger, player) {
            const targets = event.targets;
            player.playjianglingAudio(event.name,targets);
            for(const target of targets) {
                await target.draw(event.cost_data);
            }
        },
        "_priority": 0,
    },
    //将灵：小杀
    sznjl_guisha: {
        audio:"ext:银竹离火/audio/jiangling:true",
        trigger: {
            player: ["phaseUseBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {
            if(!player.sznjl_guisha) player.sznjl_guisha = { num: 0, bool: false }
        },
        filter(event, player, name) {
            return Math.random() < 0.892 + 0.08;
        },
        check() {
            return true;
        },
        async content(event, trigger, player) {
            player.playjianglingAudio(event.name);
            const num = [2, 3, 4].randomGet();
            player.sznjl_guisha.num = num;
            player.sznjl_guisha.bool = true;
            player.addTempSkill('sznjl_guisha_sha', {player: "phaseUseEnd"});
        },
        subSkill: {
            sha: {
                mark: true,
                marktext: "<font color= #FF2400>瑰杀</font>",
                intro: {
                    name: "<font color= #FF2400>瑰杀</font>",
                    onunmark: true,
                    mark: function(dialog, storage, player) {
                        const key = player.sznjl_guisha;
                        if(key && key.bool && player.isPhaseUsing()) {
                            const setnum = player.sznjl_guisha?.num || 0;
                            if(setnum && setnum > 0) {
                                let result = "瑰杀：杀的次数增加" + setnum + "。";
                                dialog.addText(result);
                            } else {
                                dialog.addText("瑰杀：杀的次数没有增加。");
                            }
                        } else {
                            dialog.addText("非出牌阶段，技能无效！");
                        }
                    },
                    markcount: function(storage, player) {
                        const key = player.sznjl_guisha;
                        if(key && key.bool && player.isPhaseUsing()) {
                            return player.sznjl_guisha?.num || 0;
                        } else {
                            return 0;
                        }
                    },
                },
                trigger: {
                    player:["useCard"],
                },
                firstDo: true,
                charlotte: true,
                popup: false,
                silent: true,
                forced: true,
                async init(player, skill) {

                },
                filter(event, player, name) {
                    return event.card && event.card.name ==='sha' && player.countUsed('sha') <= 3;
                },
                async content(event, trigger, player) {
                    const shaUsedcount = player.getHistory("useCard",function(evt){
                        return evt.card && evt.card.name === 'sha' ;
                    });
                    if(shaUsedcount.length > 0) {
                        await player.draw(shaUsedcount.length);
                    }
                },
                mod: {
                    cardUsable(card, player, num) {
                        if (!player.hasSkill('sznjl_guisha') || !player.isPhaseUsing() || !card || card.name !== "sha") return;
                        return num + player.sznjl_guisha?.num || 0;
                    },
                },
                sub: true,
                sourceSkill: "sznjl_guisha",
                "_priority": Infinity,
            },
        },
        "_priority": 0,
    },
    sznjl_shuli: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player: ["phaseJieshuBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            let damage = 0;
            const evts = player.getHistory("sourceDamage",function(evt){
                if(evt.source == player && evt.num && evt.num > 0) {
                    damage += evt.num;
                }
            });
            return Math.random() < 0.942 + 0.08 && damage > 0;
        },
        async cost(event, trigger, player) {
            let damage = 0;
            const evts = player.getHistory("sourceDamage",function(evt){
                if(evt.source == player && evt.num && evt.num > 0) {
                    damage += evt.num;
                }
            });
            //你可以将其中的牌交给任意名角色，每名角色限一次且至多两张
            const map = {};
            const cards = await player.specifyCards('basic', damage);
            if(cards && cards.length > 0) {
                player.addGaintag(cards, "sznjl_shuli");
                let setnum = cards.length;
                while(setnum > 0) {
                    const result = await player.chooseCardTarget({
                        filterCard(card) {
                            return get.itemtype(card) == "card" && card.hasGaintag("sznjl_shuli");
                        },
                        filterTarget(card, player, target) {
                            return !map[target.playerid];
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
                        player.removeGaintag("sznjl_shuli", cards);
                        const targetid = result.targets[0].playerid;
                        if(!map[targetid]) map[targetid] = cards;
                        setnum -= cards.length;
                    } else {
                        break;
                    }
                }
                event.result = { bool: true, cost_data: map };
            }
        },
        async content(event, trigger, player) {
            const map = event.cost_data;
            player.playjianglingAudio(event.name);
            for(const target of game.filterPlayer(o => o.isAlive())) {
                for(const targetid in map) {
                    if(target.playerid == targetid) {
                        const cards = map[targetid];
                        if(cards && cards.length > 0) {
                            player.line(target, "fire");
                            await player.give(cards, target);
                        }
                    }
                }
            }
            player.removeGaintag("sznjl_shuli");
        },
        "_priority": 0,
    },
    //将灵：小闪
    sznjl_shanpo: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            global: ['useCard','respond']
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        usable: 1,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            const card = event.card;
            const key = card && card.name === 'shan';
            return Math.random() < 0.892 + 0.08 && key;
        },
        async cost(event, trigger, player) {
            const target = trigger.player;
            const Tcards = target.getDiscardableCards(player, 'he');
            const shanCards = trigger.cards;
            let prompt = setColor('〖闪魄〗：');
            if(target == player) {
                let text1 ='是否摸随机摸一至三张牌张牌', text2 ='';
                if(shanCards && shanCards.length > 0) {
                    const fanyi = shanCards.map(c => get.translation(c)).join('、');
                text2 = setColor('然后获得' + fanyi);
                }
                prompt += text1 + text2 + '？';
            } else {
                if(!Tcards.length && !shanCards.length) return;
                let text1 ='', text2 = '';
                if(Tcards && Tcards.length > 0) {
                    const setnum = Math.min(3, Tcards.length);
                    text1 = setColor('是否弃置' + get.translation(target) + '至多' + get.cnNumber(setnum) + '张牌,');
                }
                if(shanCards && shanCards.length > 0) {
                    const fanyi = shanCards.map(c => get.translation(c)).join('、');
                    text2 = setColor('然后获得' + fanyi);
                }
                prompt += text1 + text2 + '？';
            }
            const result = await player.chooseBool(prompt).set('ai', () => {
                if(target == player) {
                    return true;
                } else {
                    return get.attitude(player, target) < 2;
                }
            }).forResult();
            if (result.bool) {
                event.result = { bool: true };
            }
        },
        async content(event, trigger, player) {
            const cards = trigger.cards;
            if(trigger.player == player) {
                const num = [1, 2, 3].randomGet();
                await player.draw(num);
                if(cards && cards.length > 0) {
                    await player.gain(cards,'gain2');
                }
            } else {
                const Tcards = trigger.player.getDiscardableCards(player, 'he');
                if(Tcards && Tcards.length > 0) {
                    const setnum = Math.min(3, Tcards.length);
                    await player.discardPlayerCard(trigger.player, 'he', true, [1, setnum]);
                }
                if(cards && cards.length > 0) {
                    await player.gain(cards,'gain2');
                }
            }
        },
        "_priority": 0,
    },
    sznjl_tanhua: {
        audio:"ext:银竹离火/audio/jiangling:true",  
        trigger: {
            player: ["phaseUseBegin"],
        },
        firstDo: true,
        charlotte: true,
        popup: false,
        jianglingSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.jianglingSkill) return ['将灵技'];
            return [];
        },
        async init(player, skill) {

        },
        filter(event, player, name) {
            const cards = player.getCards('hes').filter(c => c.name === 'shan');
            return Math.random() < 0.892 + 0.08 && cards.length > 0;
        },
        async cost(event, trigger, player) {
            const map = {cards: [], targets: []};
            const cards = player.getCards('hes').filter(c => c.name === 'shan');
            const setnum = Math.min(4, cards.length);
            const shans = player.getCardsform({ Pile: 'discardPile', field: null }).filter(c => c.name === 'shan');
            const enemies = game.filterPlayer(o => o.isAlive() && o != player && get.attitude(player, o) < 2);
            const prompt = setColor('〖昙花〗：是否弃置至多' + get.cnNumber(setnum) + '张〖闪〗并摸双倍张牌？');
            const result = await player.chooseCard(prompt, 'hes', [1,setnum], function(card) {
                return cards.includes(card);
            }).set('ai', function(card) {
                if (cards.length <= 1) {
                    let cankilldie = [];
                    if (!enemies || enemies.length == 0) return false;
                    for (const enemy of enemies) {
                        const damage = shans.length  + 1;
                        if (getAliveNum(enemy, damage) <= 0) {
                            cankilldie.push(enemy);
                            break;
                        }
                    }
                    if (cankilldie.length > 0) {
                        return 1;
                    } else {
                        return false;
                    }
                } else {
                    if (ui.selected.cards.length < cards.length -1) return 1;
                    return 0;
                }
            }).forResult();
            if (result.bool) {
                map.cards.push(...result.cards);
                const targets = game.filterPlayer(o => o.isAlive() && o != player);
                if(targets.length > 0) {
                    const Targetprompt = setColor('〖昙花〗：是否选择一名其他角色对其造成X点伤害(X为弃牌堆中〖闪〗的数量且至多为8)？');
                    const Targetresult = await player.chooseTarget(Targetprompt, 1, (card, player, target) => {
                        return targets.includes(target);
                    }).set('ai', target => {
                        return get.attitude(player, target) < 2;
                    }).forResult();
                    if(Targetresult.bool) {
                        map.targets.push(Targetresult.targets[0]);
                    }
                }
                event.result = { bool: true, cost_data: map };
            }
        },
        async content(event, trigger, player) {
            const { targets, cards } = event.cost_data;
            player.playjianglingAudio(event.name,targets);
            if(cards && cards.length > 0) {
                await player.discard(cards);
                await player.draw(cards.length * 2);
            }
            if(targets.length) {
                const target = targets[0];
                const shans = player.getCardsform({ Pile: 'discardPile', field: null }).filter(c => c.name === 'shan');
                const damage = Math.min(8, shans.length);
                if(damage > 0) {
                    await target.damage(damage, 'nocard', player);
                }
            }
        },
        "_priority": 0,
    },
    //烽火连天学习套
    fenghuo_zmdzyb: {//学习套1
        audio: false,        
        trigger: {
            global:["discardAfter"],
        },
        skillname: "张妈的作业本",
        skillinfo: "锁定技，当你使用技能弃置你自己的牌时，若弃置的牌数不小于3，你获得弃置的牌。",
        LearningSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.LearningSkill) return ['学习套'];
            return [];
        },
        forced: true,
        async init(player, skill) {
            if (!player.hasSkill('fenghuo_Learning')) player.addSkill('fenghuo_Learning');//添加学习套装技能
            if(!player.checkSKilldiscard) player.checkSKilldiscard =  function(event){
                const cards = event.cards;
                if(!cards ||!cards.length || cards.length < 3) return false;
                const evt1 = event.getParent(1);
                if (evt1 && evt1.name == "useSkill" && evt1.player == player) return true;
                const evt2 = event.getParent(2);
                if (evt2 && evt2.name && evt2.player == player) {
                    const isSKill = lib.skill[evt2.name];
                    const info = get.info(evt2.name);
                    return isSKill && info;
                }
                return false;
            }
        },
        filter(event, player) {
            return player.checkSKilldiscard(event);
        },
        async content(event, trigger, player) {
            await player.gain(trigger.cards,'gain2');
        },
        "_priority": 0,
    },
    fenghuo_zjdts: {//学习套2
        audio: false,        
        trigger: {
            source:["damageBegin4"],
        },
        skillname: "张角的天书",
        skillinfo: "被动：牌局内锁定技，你造成的雷电伤害翻倍,",
        LearningSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.LearningSkill) return ['学习套'];
            return [];
        },
        locked(skill, player) {
            if (!player || !player.fenghuo_zjdts) return false;
            return true;
        },
        direct: true,
        async init(player, skill) {
            if (!player.hasSkill('fenghuo_Learning')) player.addSkill('fenghuo_Learning');//添加学习套装技能
            if (!player.fenghuo_zjdts) player.fenghuo_zjdts = true;
        },
        filter(event, player) {
            return event.num && event.num > 0 && event.hasNature('thunder');
        },
        async content(event, trigger, player) {
            trigger.num *= 2;
        },
        "_priority": 0,
    },
    fenghuo_lscq: {//学习套3
        audio: false,        
        trigger: {
            source:["damageBegin4"],
        },
        skillname: "吕氏春秋",
        skillinfo: "被动：牌局内视为拥有技能【春秋】：锁定技，你使用锦囊牌造成的伤害 + 1。",
        LearningSkill: true,
        categories(skill, player) {
            if (!player.hasSkill('fenghuo_Learning')) player.addSkill('fenghuo_Learning');//添加学习套装技能
            if (lib.skill[skill]?.LearningSkill) return ['学习套'];
            return [];
        },
        locked(skill, player) {
            if (!player || !player.fenghuo_lscq) return false;
            return true;
        },
        direct: true,
        async init(player, skill) {
            if (!player.fenghuo_lscq) player.fenghuo_lscq = true;
        },
        filter(event, player) {
            if (!player.fenghuo_lscq) return false;
            const key1 = event.card && get.type2(event.card) && get.type2(event.card) == 'trick';
            const key2 = event.source && event.source === player;
            const key3 = event.num && event.num > 0;
            return key1 && key2 && key3;
        },
        async content(event, trigger, player) {
            trigger.num++;
        },
        "_priority": 0,
    },
    fenghuo_sj: {//学习套4
        audio: false,        
        skillname: "史记",
        skillinfo: "被动：每次有新武将加入队伍，立刻获得50碎银。",
        LearningSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.LearningSkill) return ['学习套'];
            return [];
        },
        direct: true,
        async init(player, skill) {
            if (!player.hasSkill('fenghuo_Learning')) player.addSkill('fenghuo_Learning');//添加学习套装技能
        },
        "_priority": 0,
    },
    fenghuo_sgyy: {//学习套5
        audio: false,        
        skillname: "三国演义",
        skillinfo: "被动：进入下一层会额外增加一个事件房。",
        LearningSkill: true,
        categories(skill, player) {
            if (lib.skill[skill]?.LearningSkill) return ['学习套'];
            return [];
        },
        direct: true,
        async init(player, skill) {
            if (!player.hasSkill('fenghuo_Learning')) player.addSkill('fenghuo_Learning');//添加学习套装技能
        },
        "_priority": 0,
    },
    fenghuo_Learning: {//学习套装技能
        audio: false,
        mark: true,
        intro: {
            content: "limited",
        },
        trigger: {
            player:["phaseZhunbeiBegin"],
        },
        skillname: "学习套",
        skillinfo1: "牌局内：限定技，准备阶段你可以，选择一名其他角色，随机获得该角色身上一个技能。",
        skillinfo2: "牌局内：限定技，准备阶段，你可以选择一名其他角色，获得该角色的所有技能。",
        LearningSkill: false,//套装技能不应有任何标签
        limited: true,
        skillAnimation: "epic",
        animationColor: "thunder",
        async init(player, skill) {
            player.storage[skill] = false;
            if (!player.checkLearning) player.checkLearning = function(){
                const targets = game.filterPlayer(o => {
                    const key1 = o.isAlive() && o != player;
                    const skills = o.getSkills(null, false, false).filter(skill => {
                        const info = get.info(skill);
                        const name = lib.translate[skill];
                        const skillinfo = lib.translate[skill + '_info'];
                        return info && name && skillinfo;
                    });
                    return key1 && skills.length > 0;
                });
                return targets;
            };
            if (!player.checkLearningSkills) player.checkLearningSkills = function(){
                const skills = player.getSkills(null, false, false);
                const LearningSkills = skills.filter(skill => {
                    const key = lib.skill[skill]?.LearningSkill;
                    return key && key === true;
                });
                return LearningSkills;
            };
        },
        check(event, player) {
            return player.checkLearning().length > 0;
        },
        filter(event, player) {
            return player.checkLearning().length > 0 && player.checkLearningSkills().length >= 2;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            let prompt;
            const LearningSkills = player.checkLearningSkills();
            let targets = player.checkLearning();
            if (!targets || targets.length == 0) return;
            const targetsTT = targets.map(o => get.translation(o)).join('、');
            if (LearningSkills.length >= 2 && LearningSkills.length < 5) {
                prompt = '请从' + targetsTT + '中选择一名角色，随机获得其一技能。';
            } else if (LearningSkills.length >= 5) {
                prompt = '请从' + targetsTT + '中选择一名角色，获得其所有技能。';
            } else {
                return;
            }
            const hasSkillInfo = (skill) => {
                return get.info(skill) && lib.translate[skill] && lib.translate[skill + '_info'];
            };
            const result = await player.chooseTarget(prompt, 1, function (card, player, target) {
                return targets.includes(target);
            }).set('ai', function (target) {
                const sorted = targets.sort((a, b) => {
                    const askills = a.getSkills(null, false, false).filter(hasSkillInfo);
                    const bskills = b.getSkills(null, false, false).filter(hasSkillInfo);
                    return bskills.length - askills.length;
                });
                return target == sorted[0];
            }).set('forced', true).forResult();
            if (result.bool) {
                player.line(result.targets[0], 'thunder');
                const skillLists = result.targets[0].getSkills(null, false, false).filter(hasSkillInfo);
                if (LearningSkills.length >= 2 && LearningSkills.length < 5) {
                    const skill = skillLists[Math.floor(Math.random() * skillLists.length)];
                    await player.addSkill(skill);
                    game.log(player, '获得技能', skill);
                } else if (LearningSkills.length >= 5) {
                    for (let i = 0; i < skillLists.length; i++) {
                        const skill = skillLists[i];
                        await player.addSkill(skill);
                        game.log(player, '获得技能', skill);
                    }
                }
            }
        },
        "_priority": 0,
    },
};
export default TAF_jianglingSkills;
