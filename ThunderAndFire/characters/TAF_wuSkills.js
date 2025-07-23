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
const { waterjiang, wateryinghun } = asyncs.wu.water_sunce;//孙策
const { waterliangzhu } = asyncs.wu.water_sunshangxiang;//孙尚香
const { initwatertaji, waterqinghuang } = asyncs.wu.water_sunhanhua;//孙寒华
/** @type { importCharacterConfig['skill'] } */
const TAF_wuSkills = {
    //陆抗
    waterkegou:{
        audio:"ext:银竹离火/audio/skill:4",
        trigger:{
            player:["phaseBegin","phaseEnd"],
            global: "washCard",
        },
        locked:true,
        direct:true,
        async init(player, skill) {
            player.logSkill(skill);
            const list = await lib.skill.waterkegou.gainDis(player);
        },
        async gainDis(player) {
            const cards = [...ui.cardPile.childNodes];
            if (!cards.length) return [];
            let setnumlist = []; 
            for (const card of cards) {
                const number = get.number(card);
                if (!setnumlist.includes(number)) {
                    setnumlist.push(number);
                }
            }
            if (!setnumlist.length) return [];
            const maxSelection = Math.min(7, setnumlist.length);
            const selectedNumbers = [];
            while (selectedNumbers.length < maxSelection) {
                const randomIndex = Math.floor(Math.random() * setnumlist.length);
                const selectedNumber = setnumlist[randomIndex];

                if (!selectedNumbers.includes(selectedNumber)) {
                    selectedNumbers.push(selectedNumber);
                }
            }
            const sum = selectedNumbers.reduce((total, num) => total + num, 0);
            const lastDigit = sum % 10 === 0 ? 10 : sum % 10;
            let firstDigit = Math.abs(sum);
            while (firstDigit >= 10) {
                firstDigit = Math.floor(firstDigit / 10);
            }


            if (!player.waterkegou) player.waterkegou = [];
            player.waterkegou = [...selectedNumbers].sort((a, b) => a - b);
            const gainCards = [];
            for (const number of selectedNumbers) {
                const candidates = cards.filter(card => get.number(card) === number);
                if (candidates.length > 0) {
                    const randomCard = candidates[Math.floor(Math.random() * candidates.length)];
                    gainCards.push(randomCard);
                }
            }
            if (player && gainCards.length > 0) {
                await player.gain(gainCards, "gain2");
                const sortedCards = player.getCards('h').sort((a, b) => get.value(a, player) - get.value(b, player));
                game.cardsGotoOrdering(sortedCards);
                let selectedCards = [];
                let usedNumbers = [];
                for (let card of sortedCards) {
                    const number = get.number(card);
                    if (!usedNumbers.includes(number) && !selectedCards.includes(card)) {
                        selectedCards.push(card);
                        usedNumbers.push(number);
                        if (selectedCards.length >= gainCards.length) {
                            break;
                        }
                    }
                }
                let result = await player.chooseCardButton("请弃置" + get.cnNumber(gainCards.length) + "张不同点数的牌！", sortedCards, [gainCards.length, gainCards.length]).set("filterButton", function(button) {
                    const selectedNumbers = ui.selected.buttons.map((c) => get.number(c.link));
                    const num = get.number(button.link);
                    return !selectedNumbers.includes(num);
                }).set("ai", function(button) {
                    if(selectedCards.includes(button.link)) return 1;
                    else return 0;
                }).set('forced', true).forResult();
                if (result.bool) {
                    const cards = result.links;
                    player.discard(cards);
                    let list = sortedCards.filter(card => !cards.includes(card));
                    if (list.length) player.gain(list);
                }
            }
            return gainCards;
        },
        filter:function(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            player.logSkill(event.name);
            if (Time === "phaseBegin") {
                await player.specifyCards("min",{Pile: 'cardPile', field: null});
            } else if (Time === "phaseEnd") {
                await player.specifyCards("max",{Pile: 'discardPile', field: null});
            } else if (Time === "washCard") { 
                const list = await lib.skill.waterkegou.gainDis(player);
            }
        },
        "_priority":0,
    },
    waterposhi:{
        audio:"ext:银竹离火/audio/skill:4",
        enable:["chooseToUse","chooseToRespond"],
        unique: true,
        locked: false,
        async init(player, skill) {
            if(!player.waterposhi_trick) player.waterposhi_trick = false;
            if(!player.waterposhi_basic) player.waterposhi_basic = false;
        },
        filter(event, player) {
            if (!player.waterkegou || !Array.isArray(player.waterkegou) || player.waterkegou.length === 0) return false;
            if (player.waterposhi_trick && player.waterposhi_basic) return false;
            const filter = event.filterCard;
            const natures = lib.inpile_nature || [];
            const cards = player.getCards('he');
            if (!cards || cards.length === 0) return false;
            const allNumbers = [...Array(13).keys()].map(i => i + 1);
            const numlist = player.waterkegou;
            const outnumlist = allNumbers.filter(num => !numlist.includes(num));
            const trickCards = lib.inpile.filter(i => get.type(i) === "trick");
            const basicCards = lib.inpile.filter(i => get.type(i) === "basic");
            const hastrickCard = cards.some(card => numlist.includes(get.number(card)));
            const hasbasicCard = cards.some(card => outnumlist.includes(get.number(card)));
            if (hastrickCard && !player.waterposhi_trick) {
                for (let name of trickCards) {
                    if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) return true;
                }
            }
            if (hasbasicCard && !player.waterposhi_basic) {
                for (let name of basicCards) {
                    if (name === "sha") {
                        if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) return true;
                        for (let nature of natures) {
                            if (filter(get.autoViewAs({ name: name, nature: nature }, "unsure"), player, event)) return true;
                        }
                    } else {
                        if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) return true;
                    }
                }
            }
            return false;
        },
        chooseButton:{
            dialog:function (event, player) {
                const TXT = setColor("〖破势〗：请选择视为使用或打出的牌：");
                const filter = event.filterCard;
                const natures = lib.inpile_nature || [];
                const cards = player.getCards('he');
                const numlist = player.waterkegou;
                const allNumbers = [...Array(13).keys()].map(i => i + 1);
                const outnumlist = allNumbers.filter(num => !numlist.includes(num));
                const trickCards = lib.inpile.filter(i => get.type(i) === "trick");
                const basicCards = lib.inpile.filter(i => get.type(i) === "basic");
                const hastrickCard = cards.some(card => numlist.includes(get.number(card)));
                const hasbasicCard = cards.some(card => outnumlist.includes(get.number(card)));
                let list = [];
                if (hastrickCard && !player.waterposhi_trick) {
                    for (let name of trickCards) {
                        if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) list.push(["trick", '', name]);
                    }
                }
                if (hasbasicCard && !player.waterposhi_basic) {
                    for (let name of basicCards) {
                        if (name === "sha") {
                            if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) list.push(["basic", '', name]);
                            for (let nature of natures) {
                                if (filter(get.autoViewAs({ name: name, nature: nature }, "unsure"), player, event)) list.push(["basic", '', name, nature]);
                            }
                        } else {
                            if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) list.push(["basic", '', name]);
                        }
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
                    audio: "waterposhi",
                    popname: true,
                    filterCard: function (card) {
                        const allNumbers = [...Array(13).keys()].map(i => i + 1);
                        const numlist = player.waterkegou;
                        const outnumlist = allNumbers.filter(num => !numlist.includes(num));
                        const type = get.type(links[0][2]);
                        const number = get.number(card);
                        if (type == "trick") {
                            return numlist.includes(number);
                        } else if (type == "basic") {
                            return outnumlist.includes(number);
                        }
                    },
                    position: "hes",
                    selectCard: 1,
                    viewAs: { 
                        name: links[0][2], 
                        nature: links[0][3],
                        isCard: true,
                    },
                    precontent: async function () {

                    },
                    onuse: async function (result, player) {
                        const VCard = result.card;
                        const type = get.type(VCard.name);
                        const allNumbers = [...Array(13).keys()].map(i => i + 1);
                        const numlist = player.waterkegou;
                        const outnumlist = allNumbers.filter(num => !numlist.includes(num));
                        if (type == "trick") { 
                            player.waterposhi_trick = true;
                            const randomNum = outnumlist[Math.floor(Math.random() * outnumlist.length)];
                            await player.specifyCards(randomNum);
                        } else if (type == "basic") {
                            player.waterposhi_basic = true;
                            const randomNum = numlist[Math.floor(Math.random() * numlist.length)];
                            await player.specifyCards(randomNum);
                        }
                    },
                };
            },
            prompt: function (links, player) {
                return "将一张牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用或打出。";
            },
        },
        hiddenCard: function (player, name) {
            if (!lib.inpile.includes(name)) return false;
            const cards = player.getCards('he');
            if (!cards || cards.length === 0) return false;
            const allNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13];
            const numlist = player.waterkegou;
            const outnumlist = allNumbers.filter(num => !numlist.includes(num));
            const trickCards = lib.inpile.filter(i => get.type(i) === "trick");
            const basicCards = lib.inpile.filter(i => get.type(i) === "basic");
            const hastrickCard = cards.some(card => numlist.includes(get.number(card)));
            const hasbasicCard = cards.some(card => outnumlist.includes(get.number(card)));
            if (hastrickCard && !player.waterposhi_trick) {
                for (let n of trickCards) {
                    if (name === n) {
                        return true;
                    }
                }
            }
            if (hasbasicCard && !player.waterposhi_basic) {
                for (let n of basicCards) {
                    if (name === n) {
                        return true;
                    }
                }
            }
        },
        ai:{
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
                switch (tag) {
                    case "respondSha": return !player.waterposhi_basic;
                    case "respondShan": return !player.waterposhi_basic;
                    case "recover": return !player.waterposhi_basic;
                    case "save": return !player.waterposhi_basic;
                    case "respondTao": return !player.waterposhi_basic;
                    default: return false;
                }
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
                    const cards = player.getCards('he');
                    if (!cards || cards.length === 0) return order;
                    const allNumbers = [...Array(13).keys()].map(i => i + 1);
                    const numlist = player.waterkegou;
                    const outnumlist = allNumbers.filter(num => !numlist.includes(num));
                    const trickCards = lib.inpile.filter(i => get.type(i) === "trick");
                    const basicCards = lib.inpile.filter(i => get.type(i) === "basic");
                    const hastrickCard = cards.some(card => numlist.includes(get.number(card)));
                    const hasbasicCard = cards.some(card => outnumlist.includes(get.number(card)));
                    let canUselist = [];
                    if(hastrickCard && !player.waterposhi_trick) {
                        for (let name of trickCards) {
                            let Vcard = {name: name, nature: '', isCard: true};
                            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                canUselist.push(Vcard);
                            }
                        }
                    }
                    if(hasbasicCard && !player.waterposhi_basic) { 
                        for (let name of basicCards) {
                            let Vcard = {name: name, nature: '', isCard: true};
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
                    return Math.max(...ordernumlist);
                }
                return Math.max(addorder, 2);
            },
            result: {
                player: function (player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
        group: "waterposhi_change",
        subSkill: {
            change : {
                trigger: {
                    global: ["phaseAfter"],
                },
                charlotte:true,
                unique:true,
                direct:true,
                silent: true,
                popup: false,
                async content(event, trigger, player) {
                    if(!player.waterposhi_trick) player.waterposhi_trick = false;
                    if(!player.waterposhi_basic) player.waterposhi_basic = false;
                    player.waterposhi_trick = false;
                    player.waterposhi_basic = false;
                },
            },
        },
        "_priority":0,
    },
    //陆逊
    waterjunlve:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiOrder:function (player, card, num) {
                const cards = player.getCards("hs");
                if (cards.length === 0) return;
                if(!cards.includes(card)) return num;
                
                const allSuits = ["spade", "heart", "club", "diamond"];
                const usedSuits = player.waterjunlve_used;//已记录花色
                const unusedSuits = allSuits.filter(suit => !usedSuits.includes(suit));//未记录花色
                const suits_cycle = player.getJunlveSuits();//当前循环节，即循环花色。
                /**
                 * 尽量优先使用军略标签牌，联动二技能；然后优先处理并使用未记录花色，然后使用循环花色触发军略过牌。
                 */
                if (card.hasGaintag('waterjunlve_tag')) return num * 3.5;
                if(unusedSuits.length > 0) {
                    for (let suit of unusedSuits) {
                        if (get.suit(card, player) === suit) {
                            return num * 2;
                        }
                    }
                }
                if (suits_cycle) {
                    for (let suit of suits_cycle) {
                        if (get.suit(card, player) === suit) {
                            const addorder = player.countCards("h", { suit: suit });
                            return num + addorder * 2;
                        }
                    }
                }
            },
        },
        mark:true,
        marktext:"<font color= #48D1CC>军略</font>",
        intro:{
            content: function (storage, player) {
                const suits_used = player.waterjunlve_used.map(get.translation).join('、');
                const suits_cycle = player.getJunlveSuits().map(get.translation).join('、');
                let result = "<font color= #48D1CC><b>已记录花色</b></font>：" + suits_used;
                    result += "<br><font color= #48D1CC><b>当前循环节</b></font>：" + suits_cycle;
                return result;
            },
            markcount:function(storage, player) {
                const num = player.waterjunlve_used?.length || 0;
                return num;
            },
            onunmark: true,
            name:"<font color= #48D1CC>军略</font>",
        },
        trigger:{
            player:["loseAfter"],
            global:["equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter","addToExpansionAfter","logSkillBefore","phaseChange","chooseToUseBefore","useCardBefore"],
        },
        unique:true,
        locked:true,
        direct:true,
        async init(player, skill) {
            const setSuits = [['spade', 'heart'],['heart', 'club'],['club', 'diamond'], ['diamond', 'spade']];
            if(!player.waterjunlve_setSuits) player.waterjunlve_setSuits = setSuits;
            if(!player.waterjunlve_index) player.waterjunlve_index = 0;
            if(!player.getJunlveSuits) {
                player.getJunlveSuits = function() {
                    const Ordersuits = player.waterjunlve_setSuits;
                    const index = player.waterjunlve_index % 4;
                    return Ordersuits[index];
                }
            }
            if(!player.waterjunlve_used) player.waterjunlve_used = [];
            if(!player.clearJunlveSuits) {
                player.clearJunlveSuits = function() {
                    player.addTempSkill("waterjunlve_key");
                    player.waterjunlve_used = [];
                    player.unmarkSkill("waterjunlve");
                }
            }
            if(!player.gainJunlveCards) {
                player.gainJunlveCards = function() {
                    const suits = player.getJunlveSuits();
                    const missingSuits = suits.filter(suit => player.countCards('h', { suit: suit }) === 0);
                    let setfindSuits = missingSuits;
                    if (setfindSuits.length === 0) return [];
                    const piles = ["cardPile", "discardPile"];
                    let missingCards = [];
                    for (const pile of piles) {
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const suit = get.suit(card);
                            if (setfindSuits.includes(suit) && !missingCards.includes(card)) {
                                setfindSuits = setfindSuits.filter(o => o !== suit);
                                missingCards.push(card);
                                if (setfindSuits.length === 0) break;
                            } 
                        }
                        if (setfindSuits.length === 0) break;
                    }
                    return missingCards;
                }
            }
        },
        filter:function(event, player) {
            const suits = player.getJunlveSuits();
            const missingSuits = suits.filter(suit => player.countCards('h', { suit: suit }) === 0);
            return missingSuits.length > 0;
        },
        async content(event, trigger, player) {
            const cards = player.gainJunlveCards();
            if (cards && cards.length > 0) {
                player.waterjunlve_index ++;//循环节，进入下一组循环
                player.logSkill(event.name);
                await player.gain(cards, "gain2");
                for(const card of cards) {
                    const suit = get.suit(card);
                    if (suit && !player.waterjunlve_used.includes(suit)) {
                        player.waterjunlve_used.push(suit);
                        player.markSkill("waterjunlve");
                        player.addGaintag(card, "waterjunlve_tag");
                    }
                }
                if (player.waterjunlve_used.length >= 4) {
                    player.clearJunlveSuits();
                }
            }
        },
        ai:{
            noe: true,
            reverseEquip:true,
            threaten: 1.5,
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    const cards = player.getCards("h");
                    if (cards.length === 0) return;
                    const allSuits = ["spade", "heart", "club", "diamond"];
                    const usedSuits = player.waterjunlve_used;//已记录花色
                    const unusedSuits = allSuits.filter(suit => !usedSuits.includes(suit));//未记录花色
                    const suits_cycle = player.getJunlveSuits();//当前循环节，即循环花色。
                    /**
                     * 尽量优先使用军略标签牌，联动二技能；然后优先处理并使用未记录花色，然后使用循环花色触发军略过牌。
                     */
                    if (card && card.cards && card.cards.length > 0) {
                        for (const effectcard of card.cards) {
                            if (effectcard.hasGaintag('waterjunlve_tag')) {
                                return [1, 3.5];
                            }
                        }
                    }
                    if(unusedSuits.length > 0) {
                        for (let suit of unusedSuits) {
                            if (get.suit(card, player) === suit) {
                                return [1, 2];
                            }
                        }
                    }
                    if (suits_cycle) {
                        for (let suit of suits_cycle) {
                            if (get.suit(card, player) === suit) {
                                const addorder = player.countCards("h", { suit: suit });
                                return [1, addorder];
                            }
                        }
                    }
                },

            },
        },
        subSkill:{
            key:{
                charlotte:true,
                unique:true,
                sub:true,
                sourceSkill:"waterjunlve",
            },
        },
        "_priority":0,
    },
    watercuike:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:["useCardAfter","respondAfter"],
        },
        filter:function(event, player) {
            return player.hasHistory("lose", function (evt) {
                if (evt.getParent() != event) return false;
                for (let i in evt.gaintag_map) {
                    for (let tag of evt.gaintag_map[i]) {
                        if (tag === 'waterjunlve_tag') return true;
                    }
                }
                return false;
            });
        },
        unique:true,
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            let number = get.number(trigger.card);
            let suit = get.suit(trigger.card);
            if (!suit) {
                const allSuits = ["spade", "heart", "club", "diamond"];
                suit = allSuits[Math.floor(Math.random() * allSuits.length)];
            }
            if (!number) number = 0;
            if (number % 2 === 1) {
                let TXT = setColor("〖摧克〗：是否要横置一名其他角色，令其弃置一张花色为") + get.translation(suit) + "的手牌？";
                let result = await player.chooseTarget(TXT, 1, function(card, player, target) {
                    const targets = game.filterPlayer(function(current) {
                        return current !== player;
                    });
                    return targets.includes(target);
                }).set('ai', function(target) {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.logSkill(event.name, target);
                    player.line(target, 'fire');
                    target.link(true);
                    const suitcards = target.getCards("h").filter(card => get.suit(card) === suit);
                    if (suitcards.length > 0) {
                        await target.chooseToDiscard('h', 1, true, function(card) {
                            return get.suit(card) === suit;
                        });
                    }
                }
            } else { 
                let TXT = setColor("〖摧克〗：是否要解除横置并重铸一张花色不为") + get.translation(suit) + "的手牌，然后摸一张牌？";
                const cards = player.getCards("h").filter(card => player.canRecast(card) && get.suit(card) !== suit);
                if (!cards || cards.length === 0) return;
                let result = await player.chooseCard(TXT, 'h', 1, function(card) {
                    return cards.includes(card);
                }).set('ai', function(card) {
                    const sortedCards = cards.sort((a,b) => {
                        return get.value(a,player) - get.value(b,player);
                    });
                    return get.value(card,player) <= get.value(sortedCards[0], player);
                }).forResult();
                if (result.bool) {
                    const card = result.cards[0];
                    player.logSkill(event.name);
                    await player.recast(card);
                    await player.draw();
                }
            }
        },
        ai:{
            expose:0.5,
            threaten: 1.5,
        },
        "_priority":0,
    },
    waterzhanhuo:{
        audio:"ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "☯",
        onremove: true,
        zhuanhuanji: true,
        intro:{
            content:function(storage, player) {
                const key = player.storage.waterzhanhuo;
                let TXT = "";
                if (key) {
                    TXT = setColor("阴，选择至多两名其他角色，各随机弃置至多两张牌优先装备牌。");
                } else {
                    TXT = setColor("阳，选择一名其他角色，对其造成一点🔥伤害。");
                }
                return TXT;
            },
            name:"<font color= #48D1CC>绽火</font>",
        },
        trigger:{
            player:"waterjunlveAfter",
        },
        unique:true,
        locked:false,
        direct:true,
        async init (player, skill) {
            if(!player.storage[skill]) player.storage[skill] = false;
        },
        filter:function(event, player) {
            return player.hasSkill('waterjunlve_key') && !player.hasSkill('waterzhanhuo_off');
        },
        content: async function(event, trigger, player) {
            const key = player.storage.waterzhanhuo;
            let num = 1;
            let TXT = "";
            if (key) {
                TXT = setColor("〖绽火〗：是否要选择至多两名其他角色，各随机弃置至多两张牌优先装备牌。");
                num = 2;
            } else {
                TXT = setColor("〖绽火〗：是否要选择一名其他角色，对其造成一点🔥伤害。");
                num = 1;
            }
            const result = await player.chooseTarget(TXT, [1, num], function(card, player, target) {
                const targets = game.filterPlayer(function(current) {
                    return current !== player;
                });
                return targets.includes(target);
            }).set('ai', function(target) {
                if (key) {
                    const enemies = player.getEnemies_sorted();
                    if (enemies.includes(target)) return 1;
                    else return 0;
                } else {
                    return get.damageEffect(target, player, player, "fire") > 0;
                }
            }).forResult();
            if (result.bool) {
                player.changeZhuanhuanji(event.name);
                if (key) {
                    const targets = result.targets;
                    player.logSkill(event.name, targets);
                    for (const target of targets.sortBySeat()) {
                        player.line(target, 'fire');
                        const e_cards = target.getCards("e");
                        const h_cards = target.getCards("h");

                        function shuffle(array) {
                            for (let i = array.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [array[i], array[j]] = [array[j], array[i]];
                            }
                            return array;
                        }
                        const s_e_cards = shuffle([...e_cards]);
                        const s_h_cards = shuffle([...h_cards]);
                        let setdisnum = 2;
                        let disCard = [];
                        if (s_e_cards.length > 0) {
                            const discardNumE = Math.min(setdisnum, s_e_cards.length);
                            disCard.push(...s_e_cards.slice(0, discardNumE));
                            setdisnum -= discardNumE;
                        }
                        if (setdisnum > 0 && s_h_cards.length > 0) {
                            const discardNumH = Math.min(setdisnum, s_h_cards.length);
                            disCard.push(...s_h_cards.slice(0, discardNumH));
                        }
                        await target.discard(disCard);
                    }
                    player.storage.waterzhanhuo = false;
                    player.addTempSkill("waterzhanhuo_off");
                    return;
                } else {
                    const target = result.targets[0];
                    player.logSkill(event.name, target);
                    player.line(target, 'fire');
                    await target.damage('fire', "nocard");
                    player.storage.waterzhanhuo = true;
                    player.addTempSkill("waterzhanhuo_off");
                    return;
                }
            }
        },
        ai:{
            expose:0.5,
            threaten:1.5,
        },
        subSkill:{
            off:{
                charlotte:true,
                unique:true,
                sub:true,
                sourceSkill:"waterzhanhuo",
            },
        },
        "_priority":0,
    },
    //孙策
    waterjiang:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiOrder:function (player, card, num) {
                if (get.color(card, player) === "red") {
                    return num + 2;
                }
            },
        },
        mark: true,
        marktext: "<font color=#48D1CC>激昂</font>",
        onremove: true,
        intro: {
            content: function (storage, player) {
                let result = "";
                const keys = ['jiangred', 'jiangblack', 'redcount', 'blackcount'];
                const hasStorage = keys.some(key => player.storage[key] !== undefined);
                if (hasStorage) {
                    const redlist = ["spade", "heart", "club", "diamond"][player.storage.jiangred % 4];
                    const blacklist = ["diamond", "club", "heart", "spade"][player.storage.jiangblack % 4];
                    const redcount = player.storage.redcount;
                    const blackcount = player.storage.blackcount;
                    if (redcount <= 0 && (redlist === "spade" || redlist === "club")) {
                        result += "<font color=#48D1CC>激昂①</font>：" + get.translation(redlist) + "丨<font color=#48D1CC>获取已生效</font><br>";
                    } else {
                        result += "<font color=#48D1CC>激昂①</font>：" + get.translation(redlist) + "丨<font color=#FF2400>获取已失效</font><br>";
                    }
                    if (blackcount <= 0 && (blacklist === "heart" || blacklist === "diamond")) {
                        result += "<font color=#48D1CC>激昂②</font>：" + get.translation(blacklist) + "丨<font color=#48D1CC>获取已生效</font><br>";
                    } else {
                        result += "<font color=#48D1CC>激昂②</font>：" + get.translation(blacklist) + "丨<font color=#FF2400>获取已失效</font>";
                    }
                } else {
                    result += "<font color=#48D1CC>激昂</font>：无";
                }
                return result;
            },
            onunmark: true,
            name: "<font color=#48D1CC>激昂</font>",
        },
        trigger:{
            global:["useCard","phaseAfter"],
        },
        locked:false,
        direct:true,
        async init(player, skill) {
            const keys = ['jiangred', 'jiangblack','redcount', 'blackcount'];
            for (let key of keys) {
                if (!player.storage[key]) {
                    player.storage[key] = 0;
                }
            }
        },
        filter:function (event, player, name) {
            if (name == 'useCard') {
                if (event.targets && event.targets.length > 0) {
                    const card = event.card;
                    const color = get.color(card);
                    if (color == "red") {
                        return event.player === player;
                    } else if (color == "black" && event.targets.includes(player)) {
                        return event.player !== player;
                    }
                }
            } else if (name == 'phaseAfter') {
                const keys = ['redcount', 'blackcount'];
                for (let key of keys) {
                    if (!player.storage[key]) {
                        player.storage[key] = 0;
                    }
                    if (player.storage[key]) {
                        player.storage[key] = 0;
                    }
                }
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "phaseAfter") return;
            const cardslist = await waterjiang(trigger, player);
            if (cardslist.length > 0) {
                player.logSkill(event.name);
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 3.5;
                } else {
                    return 0.5;
                }
            },
            effect:{
                target:function (card, player, target) {
                    if (get.tag(card, "recover") && _status.currentPhase == target) {
                        const wuGroup = game.filterPlayer(function (current) {
                            return current.group == 'wu';
                        });
                        const cardsdraw = target.getDamagedHp() + wuGroup.length;
                        if (target.maxHp < 4) return;
                        if (cardsdraw <= 2 || target.hp >= 2) return [1, -Infinity];
                    }
                    if (get.color(card) == "black") {
                        if (target.storage.redcount < 1) {
                            if (get.type(card) == "delay") {
                                return [0, 2];
                            } else {
                                if (!target.hasFriend()) return;
                                return [1, 2];
                            }
                        } else {
                            return [1, 1];
                        }
                    } else if (get.color(card) == "red") {
                        if (player === target) {
                            if (target.storage.redcount < 1) {
                                return [1, 2];
                            }
                        } else {
                            return;
                        }
                    }
                },
            },
        },
        "_priority":1234,
    },
    waterhunzi:{
        audio:"ext:银竹离火/audio/skill:2",
        mod:{
            maxHandcard:function (player, num) {
                const wuGroup = game.filterPlayer(function (current) {
                    return current.group == 'wu';
                });
                return Math.min(5, player.getDamagedHp() + wuGroup.length);
            },
        },
        trigger:{
            player:["dying","phaseDrawBegin"],
        },
        locked:true,
        direct:true,
        filter:function (event, player,name) {
            if (name == 'phaseDrawBegin') {
                return !event.numFixed;
            } else {
                return player.isAlive();
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'phaseDrawBegin') {
                const wuGroup = game.filterPlayer(function (current) {
                    return current.group == 'wu';
                });
                trigger.num = Math.min(5, player.getDamagedHp() + wuGroup.length);
            } else {
                player.tempDisSkills('waterhunzi', { global: 'roundStart' });
                player.removeDisSkills('wateryinghun');
                player.recover();
                player.link(true);
            }
        },
        ai:{
            threaten: 1.5,
        },
        "_priority":Infinity,
    },
    wateryinghun:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            player:"damageEnd",
        },
        filter:function (event, player) {
            const numX =  player.getHandcardLimit();
            const sss = game.filterPlayer(function (current) {
                return current !== player && Math.ceil(current.getCards('hes').length * player.getDamagedHp() / player.maxHp) > 0;
            }).length;
            return numX > 0 || sss > 0;
        },
        locked:false,
        direct:true,
        async content(event, trigger, player) {
            let targetslist = await wateryinghun(player);
            if (targetslist.length > 0) {
                const target = targetslist[0];
                const att = get.attitude(player, target);
                const numX = player.getHandcardLimit();
                let numY = 0;
                const tcards = target.getCards('hes').length;
                if (tcards > 0) {
                    const num = Math.ceil(tcards * player.getDamagedHp() / player.maxHp);
                    if (num > 0) {
                        if (tcards >= num) {
                            numY = num;
                        }
                    }
                }
                const list = [
                    '选项一：令' + get.translation(target) + '摸' + get.cnNumber(numX) + '张牌。', 
                    '选项一：令' + get.translation(target) + '弃' + get.cnNumber(numY) + '张牌。', 
                ];
                let result = await player.chooseButton(['〖英魂〗：请选择一项令' + get.translation(target) + '执行之！',
                    [
                        list.map((item, i) => {
                            return [i, item];
                        }),
                        "textbutton",
                    ],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return numX > 0;
                    }
                    if (button.link === 1) {
                        const sss = game.filterPlayer(function (current) {
                            return current !== player && Math.ceil(current.getCards('hes').length * player.getDamagedHp() / player.maxHp) > 0;
                        }).length;
                        return sss > 0;
                    }
                }).set("forced", true).set("selectButton", 1).set("ai", function (button) {
                    switch (button.link) {
                        case 0:
                            if (att > 0) return 2;
                            return -2;
                        case 1:
                            if (att > 0) return -2;
                            return 2;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    const choices = result.links;
                    if (choices.includes(0)) {
                        await target.draw(numX);
                        if (target.countCards('he') > 7) {
                            await target.damage('fire', 1, player);
                        }
                    } else if (choices.includes(1)) {
                        await target.chooseToDiscard(numY, true, 'he');
                        if (target.countCards('he') > 7) {
                            await target.damage('ice', 1, player);
                        }
                    }
                }
            }
        },
        ai:{
            expose:0.75,          
            maixie:true,
            maixie_hp:true,
            threaten: 1.5,
            effect:{
                target:function (card, player, target) {
                    const att = get.attitude(player, target);
                    if (get.tag(card, "damage")) {
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        const tcardsnum = player.getCards('hes').length;
                        const drawnum = target.getHandcardLimit();
                        const disnum = Math.ceil(tcardsnum * target.getDamagedHp() / target.maxHp);
                        const num = Math.max(1, drawnum, disnum);
                        if (att < 2) {
                            const livenum = target.hp + target.countCards('hes', { name: ['tao', 'jiu'] }) - get.tag(card, "damage");
                            if (livenum <= 0) return;
                            return [1, num];
                        } else {
                            const livenum = target.hp + player.countCards('hes', { name: ['tao', 'jiu'] }) - get.tag(card, "damage");
                            if (livenum <= 2) return;
                            return [1, num];
                        }
                    }
                },
            },
        },
        "_priority":0,
    },
    //孙尚香
    waterbeiwu:{
        audio:"ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #48D1CC>备武</font>",
        intro:{
            name:"<font color= #48D1CC>备武</font>",
            mark:function(dialog, storage, player) {
                const cards = player.getCards('s', card => card.hasGaintag('waterbeiwu_tag'));
                if (cards.length) {
                    dialog.addAuto(cards);
                } else {
                    dialog.addText(setColor('无「备武」牌！'));
                }
            },
            markcount:function(storage, player) {
                const num = player.getCards('s', card => card.hasGaintag('waterbeiwu_tag')).length;
                return num;
            },
        },
        async init(player, skill) {
            player.storage.waterbeiwu = 0;
        },
        trigger:{
            player: "useCard",
            global:["phaseBegin","phaseEnd"],
        },
        locked:false,
        direct:true,
        filter:function(event, player, name) {
            if (name == "useCard") {
                const tags = ["waterbeiwu_tag"];
                const object = player.checkloseTags(event);
                if (object.tags.length > 0) {
                    for (let taglist of object.tags) {
                        for (let tag of taglist) {
                            if (tags.includes(tag)) {
                                return true;
                            }
                        }
                    }
                }
            } else if (name == "phaseBegin" || name == "phaseEnd") {
                const cards = player.getCards('s', card => card.hasGaintag('waterbeiwu_tag'));
                return !cards.length || cards.length <= 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == "useCard") {
                const VCard = trigger.card;
                if (VCard.cards) {
                    for (let vcard of VCard.cards) {
                        const object = player.checkloseTags(trigger);
                        if (object.cards.length > 0) {
                            for (let card of object.cards) {
                                if (card === vcard) {
                                    player.logSkill(event.name);
                                    game.log(trigger.card, "不可被响应");
                                    trigger.directHit.addArray(game.filterPlayer()); 
                                }
                            }
                        }
                    }
                }
            } else if (Time == "phaseBegin" || Time == "phaseEnd") {
                if (!player.storage.waterbeiwu) {
                    player.storage.waterbeiwu = 0;
                }
                const subtypes = ["equip1","equip4", "equip2", "equip3"][player.storage.waterbeiwu % 4];
                const list = [];
                const piles = ["cardPile", "discardPile"];
                for (let pile of piles) {
                    const cards = ui[pile].childNodes;
                    for (let i = cards.length - 1; i >= 0; i--) {
                        const card = cards[i];
                        if (!list.includes(card) && get.subtype(card) == subtypes) {
                            list.push(card);
                            if (list.length > 0) break;
                        }
                    }
                    if (list.length > 0) break;
                }
                if (list.length > 0) {
                    await player.gain(list, "gain2");
                    player.storage.waterbeiwu++;
                    player.loseToSpecial(list, "waterbeiwu_tag").visible = true;
                    game.log(player, '将', list, '放到了武将牌上');
                    player.logSkill(event.name);
                    player.markSkill('waterbeiwu');
                }
            }
        },
        ai:{
            threaten:function(player, target) {
                const cards = player.getCards('s', card => card.hasGaintag('waterbeiwu_tag'));
                const att = get.attitude(player, target);
                if (att < 2) {
                    if (cards.length > 0) {
                        return 1.5;
                    } else {
                        return 1;
                    }
                } else {
                    return 0.5;
                }
            },
        },
        "_priority":Infinity,
    },
    waterxiaoji:{
        audio:"ext:银竹离火/audio/skill:2",
        mod: {
            aiValue: function(player, card, num) {
                const subtype = get.subtype(card, player);
                if (subtype) {
                    if (subtype === "equip1") return Math.max(compareValue(player, "sha") * 1.25, num);
                    if (subtype === "equip2") return Math.max(compareValue(player, "shan") * 1.25,  num);
                    if (subtype === "equip3") return Math.max(compareValue(player, "tao") * 1.25, num);
                    if (subtype === "equip4") return Math.max(compareValue(player, "jiu") * 1.25, num);
                }
                return num;
            },
            aiUseful: function() {
                return lib.skill.waterxiaoji.mod.aiValue.apply(this, arguments);
            },
        },
        enable:["chooseToUse","chooseToRespond"],
        prompt:"　　你可以将一张「武器牌丨防具牌丨防御马丨进攻马」当对应的「杀丨闪丨桃丨酒」使用或打出，并摸一张牌然后移动场上一张牌；「备武」牌以此法转化的牌，不可被响应！",
        locked:false,
        filter:function(event,player){
            const filter = event.filterCard;
            if (filter(get.autoViewAs({ name: "sha" }, "unsure"), player, event) && player.countCards("hes", { subtype: 'equip1' })) return true;
            if (filter(get.autoViewAs({ name: "shan" }, "unsure"), player, event) && player.countCards("hes", { subtype: 'equip2' })) return true;
            if (filter(get.autoViewAs({ name: "tao" }, "unsure"), player, event) && player.countCards("hes", { subtype: 'equip3' })) return true;
            if (filter(get.autoViewAs({ name: "jiu" }, "unsure"), player, event) && player.countCards("hes", { subtype: 'equip4' })) return true;
            return;
        },
        filterCard:function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const name = get.subtype(card, player);
            if (name == "equip2" && filter({ name: "shan", cards: [card] }, player, event)) return true;
            if (name == "equip1" && filter({ name: "sha", cards: [card] }, player, event)) return true;
            if (name == "equip4" && filter({ name: "jiu", cards: [card] }, player, event)) return true;
            if (name == "equip3" && filter({ name: "tao", cards: [card] }, player, event)) return true;
            return false;
        },
        position:"hes",
        viewAs: function (cards, player) {
            if (cards.length) {
                let viewcard = false;
                switch (get.subtype(cards[0], player)) {
                    case "equip1": viewcard = "sha"; break;
                    case "equip2": viewcard = "shan"; break;
                    case "equip3": viewcard = "tao"; break;
                    case "equip4": viewcard = "jiu"; break;
                }
                if (viewcard) return { name: viewcard };
            }
            return null;
        },
        check:function (card) {
            const player = get.owner(card);
            const subtype = get.subtype(card, player);
            let useful = 0;
            let adduseful_one = 0;
            let adduseful_two = 0;
            const targets = _status.dying;
            if (targets && targets.length > 0) {
                const target = targets[0];
                const att = get.attitude(player, target);
                if (att >= 2) {
                    adduseful_one += 10;
                }
            }
            if (_status.event.type == "phase") {
                const hasequip = game.filterPlayer(function (current) {
                    return current.getCards('e').length > 0 && get.attitude(player, current) < 2;
                });
                if (!hasequip || hasequip.length <= 0) adduseful_two = 0;
                else adduseful_two = hasequip.length;
                const object = { sha: "equip1", shan: "equip2", tao: "equip3", jiu: "equip4" };
                const keys = Object.keys(object);
                for (let key of keys) {
                    const hassubtypes = player.countCards("hes", { subtype: object[key] });
                    if (hassubtypes > 0) {
                        let Vcard = { name: key, nature: '', isCard: true };
                        const Vorder = get.useful(Vcard);
                        if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                            if (Vorder >= useful) useful = Vorder * hassubtypes * 0.75 + adduseful_one + adduseful_two;
                        } else {
                            useful = Vorder * hassubtypes * 0.75 + adduseful_one / 5 + adduseful_two / 2;
                        }
                        if (adduseful_one > 0) {
                            return true;
                        } else if (useful > 0) {
                            return true;
                        }
                    }
                }
            }
            return adduseful_one > 0;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result, player) {
            const card = result.cards[0];
            if (card) {
                await player.draw();
                if (player.canMoveCard()) {
                    await player.moveCard();
                }
            }
        },
        hiddenCard:function(player,name){
            if (name == 'sha') return player.countCards('hes', { subtype: 'equip1' }) > 0;
            if (name == 'shan') return player.countCards('hes', { subtype: 'equip2' }) > 0;
            if (name == 'tao') return player.countCards('hes', { subtype: 'equip3' }) > 0;
            if (name == 'jiu') return player.countCards('hes', { subtype: 'equip4' }) > 0;
        },
        ai:{
            respondSha: true,
            respondShan: true,
            recover: true,
            save: true,
            respondTao: true,
            tag: {
                recover: 1,
                save: 1,
            },
            skillTagFilter:function (player, tag) {
                let viewcard;
                switch (tag) {
                    case "respondSha": viewcard = "equip1"; break;
                    case "respondShan": viewcard = "equip2"; break;
                    case "save": viewcard = "equip3"; break;
                    case "recover": viewcard = "equip4"; break;
                    case "respondTao": viewcard = "equip3"; break;
                }
                return player.countCards("hes", { subtype: viewcard }) > 0;
            },    
            order: function (item, player) {
                let order = 0;
                let addorder_one = 0;
                let addorder_two = 0;
                const targets = _status.dying;
                if (targets && targets.length > 0) {
                    const target = targets[0];
                    const att = get.attitude(player, target);
                    if (att >= 2) {
                        addorder_one += 10;
                    }
                }
                if (player && _status.event.type == "phase") {
                    const hasequip = game.filterPlayer(function (current) {
                        return current !== player && current.getCards('e').length > 0 && get.attitude(player, current) < 2;
                    });
                    if (!hasequip || hasequip.length <= 0)  addorder_two = 0;
                    else addorder_two = hasequip.length;
                    const object = { sha: "equip1", shan: "equip2", tao: "equip3", jiu: "equip4" };
                    const keys = Object.keys(object);
                    for (let key of keys) {
                        const hassubtypes = player.countCards("hes", { subtype: object[key] });
                        if (hassubtypes > 0) {
                            let Vcard = { name: key, nature: '', isCard: true };
                            const Vorder = get.order(Vcard);
                            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                                if (Vorder >= order) order = Vorder * hassubtypes * 0.75 + addorder_one + addorder_two;
                            } else {
                                order = Vorder * hassubtypes * 0.75 + addorder_one / 5 + addorder_two / 2;
                            }
                            return Math.max(order, 2);
                        }
                    }
                }
                return Math.max(addorder_one, 2);
            },
        },
        "_priority":Infinity,
    },
    waterliangzhu:{
        audio:"ext:银竹离火/audio/skill:2",
        trigger:{
            global:["recoverAfter","damageEnd","roundStart"],
        },
        locked:false,
        direct:true,
        async init(player) {
            if (!player.storage.waterliangzhu_recover) {
                player.storage.waterliangzhu_recover = [];
            }
            if (!player.storage.waterqinghuang_damage) {
                player.storage.waterqinghuang_damage = [];
            }
        },
        filter:function (event, player, name) {
            if (name == 'damageEnd') {
                if (!event.source) return false;
                if (event.source.isDead()) return false;
                if (!event.card) return false;
                if (event.card.name !== "sha") return false;
                const damagelist = player.storage.waterqinghuang_damage || [];
                if (damagelist && damagelist.length > 0) {
                    if (damagelist.includes(event.source)) return false;
                    return true;
                } else {
                    return true;
                }
            } else if (name == 'recoverAfter') {
                const recoverlist = player.storage.waterliangzhu_recover || [];
                if (recoverlist && recoverlist.length > 0) {
                    if (recoverlist.includes(event.player)) return false;
                    return true;
                } else {
                    return true;
                }
            } else if (name == 'roundStart') {
                player.storage.waterqinghuang_damage = [];
                player.storage.waterliangzhu_recover = [];
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'damageEnd') {
                const target = trigger.source;
                const txt = setColor("每轮游戏每名角色此项限一次，是否令" + get.translation(target) + "选择：「重铸一张牌并摸一张牌丨重置杀的使用次数」!");
                const  result = await player.chooseBool(txt).set('ai', function() {
                    const att = get.attitude(player, target);
                    if (att < 2) {
                        return false;
                    } else {
                        return true;
                    }
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    if (!player.storage.waterqinghuang_damage) {
                        player.storage.waterqinghuang_damage = [];
                    }
                    if (!player.storage.waterqinghuang_damage.includes(target)) {
                        player.storage.waterqinghuang_damage.push(target);
                    }
                    await waterliangzhu(trigger, player, 'damageEnd');
                }
            } else if (Time =='recoverAfter') {
                const target = trigger.player;
                if (!player.storage.waterliangzhu_recover) {
                    player.storage.waterliangzhu_recover = [];
                }
                if (!player.storage.waterliangzhu_recover.includes(target)) {
                    player.storage.waterliangzhu_recover.push(target);
                }
                await waterliangzhu(trigger, player,'recoverAfter');
            }
        },
        ai:{
            expose:0.3,       
            threaten: function(player, target) {
                const att = get.attitude(player, target);
                if (att < 2) {
                    return 1.5;
                } else {
                    return 0.5;
                }
            },
        },
        "_priority":0,
    },
    //孙寒华
    waterhuiling:{
        audio:"ext:银竹离火/audio/skill:4",
        mod: {
            aiValue: function(player, card, num) {
                const huilingcards = player.getCards("s", (card) => { return card.hasGaintag('waterhuiling_tag') });
                if (!huilingcards || huilingcards.length === 0) return;
                if (huilingcards.includes(card)) {
                    return Math.max(compareValue(player, "wuxie") * 1.25, num);
                }
            },
            aiUseful: function() {
                return lib.skill.waterhuiling.mod.aiValue.apply(this, arguments);
            },
        },
        mark:true,
        marktext:"<font color= #48D1CC>汇灵</font>",
        intro:{
            name:"<font color= #48D1CC>汇灵</font>",
            mark:function(dialog, storage, player) {
                const cards = player.getCards('s', card => card.hasGaintag('waterhuiling_tag'));
                if (cards.length) {
                    dialog.addAuto(cards);
                } else {
                    dialog.addText(setColor('无「汇灵」牌！'));
                }
            },
            markcount:function(storage, player) {
                const num = player.getCards('s', card => card.hasGaintag('waterhuiling_tag')).length || 0;
                return num;
            },
        },
        trigger:{
            player: ["useCard"],
            global: ["phaseBegin"],
        },
        unique:true,
        locked:false,
        direct:true,
        async init(player, skill) {
            if(!player.waterhuiling_used) player.waterhuiling_used = 0;
            if(!player.gainHuilingCards) {
                player.gainHuilingCards = function() {
                    const setsuits = ["spade", "heart", "club", "diamond"];
                    const getsuit = setsuits[player.waterhuiling_used % 4];
                    let list = [];
                    const piles = ["cardPile", "discardPile"];
                    for (const pile of piles) {
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const suit = get.suit(card);
                            if (suit === getsuit && !list.includes(card)) {
                                list.push(card);
                                if (list.length > 0) break;
                            }
                        }
                        if (list.length > 0) break;
                    }
                    return list;
                }
            }
        },
        filter:function(event, player, name) {
            if (name == 'useCard') {
                const card = event.card;
                if (card.name !== 'wuxie') return false;
                const key = card.waterhuiling;
                if (!key) return false;
                return card.waterhuiling;
            } else if (name == 'phaseBegin') {
                const cards = player.getCards('s', card => card.hasGaintag('waterhuiling_tag'));
                return !cards.length || cards.length <= 0;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'useCard') {
                player.logSkill(event.name, game.filterPlayer());
                game.log(player, '使用的', trigger.card, "不可被响应！");
                trigger.directHit.addArray(game.filterPlayer());
            } else if (Time == 'phaseBegin') {
                const cards = player.gainHuilingCards();
                if (cards.length > 0) {
                    player.logSkill(event.name);
                    await player.gain(cards, "gain2");
                    player.waterhuiling_used ++;
                    player.loseToSpecial(cards, "waterhuiling_tag").visible = true;
                    game.log(player, '将', cards, '放到了武将牌上');
                    player.markSkill("waterhuiling");
                    await delay(500);
                    player.update();
                }
            }
        },
        ai:{
            threaten:1.5,
        },
        group:["waterhuiling_wuxie"],
        subSkill:{
            wuxie:{
                audio:"waterhuiling",
                enable:"chooseToUse",
                filter:function(event, player) {
                    const cardsWithTag = player.getCards('s', card => card.hasGaintag('waterhuiling_tag'));
                    return cardsWithTag.length > 0;
                },
                filterCard:function (card) {
                    return card.hasGaintag('waterhuiling_tag');
                },
                unique:true,
                locked:false,
                position:"s",
                viewAsFilter:function (player) {
                    const cardsWithTag = player.getCards('s', card => card.hasGaintag('waterhuiling_tag'));
                    return cardsWithTag.length > 0;
                },
                viewAs: { 
                    name: 'wuxie', 
                    nature: '',
                    isCard: true,
                    waterhuiling: true,
                },
                prompt:"将一张「汇灵」标签牌当做无懈可击使用！",
                check:function (card) {
                    const player = get.owner(card);
                    return get.value(card, player) < compareValue(player, "tao");
                },
                hiddenCard: function (player, name) {
                    const cardsWithTag = player.getCards('s', card => card.hasGaintag('waterhuiling_tag'));
                    if (name == 'wuxie') {
                        return cardsWithTag.length > 0;
                    }
                },
                ai:{
                    expose:0.2,
                    basic: {
                        useful: [6,4,3],
                        value: [6,4,3],
                    },
                    result: {
                        player: 1,
                    },
                },
            },
        },
        "_priority":Infinity,
    },
    watertaji:{
        audio:"ext:银竹离火/audio/skill:4",
        mod: {
            aiOrder:function (player, card, num) {
                const setsuits = ['spade', 'heart', 'club', 'diamond'];
                const usedsuits = player.watertaji_usedsuits || [];
                const unusedsuits = setsuits.filter(suit => !usedsuits.includes(suit));
                if (!unusedsuits || unusedsuits.length === 0) return;
                const cards = player.getCards('h');
                if (!cards || cards.length === 0) return;
                if (!cards.includes(card)) return num;
                for (let suit of unusedsuits) {
                    const canRecasts = player.getCards('h').filter(card => get.suit(card) === suit && player.canRecast(card));
                    if (canRecasts.length <= 1) {
                        if (get.suit(card) === suit) return num;
                    } else {
                        if (get.suit(card) === suit) return num + canRecasts.length * 2;
                    }
                }
            },
        },
        mark: true,
        marktext: "<font color= #EE9A00>☯</font>",
        onremove: true,
        zhuanhuanji: true,
        intro: {
            name:"<font color= #EE9A00>踏寂</font>",
            onunmark: true,
            mark:function(dialog, storage, player) {
                let result = "已使用的花色：";
                const usedsuits = player.watertaji_usedsuits || [];
                if (usedsuits.length > 0) {
                    result += usedsuits.map(suit => get.translation(suit)).join('、');
                } else {
                    result += "无";
                }
                dialog.addText(result);
            },
            markcount:function(storage, player) {
                const usedsuits = player.watertaji_usedsuits || [];
                let num = 0;
                if (usedsuits.length > 0) {
                    num = usedsuits.length;
                }
                return num;
            },
        },
        trigger:{
            player:["useCardAfter","respondAfter"],
        },
        locked:false,
        direct:true,
        changeGroup:['wu','shen'],
        categories(skill, player) {
            const changeGroup = lib.skill[skill].changeGroup;
            if(Array.isArray(changeGroup) && changeGroup.length === 2) {
                return ['势力转化技'];
            } else {
                return [];
            }
        },
        async init (player, skill) {
            if (!player.watertaji_usedsuits) player.watertaji_usedsuits = [];
            await game.changeGroupSkill(player, skill);
            await initwatertaji(player, skill);
        },
        filter:function (event, player) {
            const setsuits = ['spade', 'heart', 'club', 'diamond'];
            const cardsuit = get.suit(event.card);
            if (!cardsuit) return false;
            if (!setsuits.includes(cardsuit)) return false;
            const usedsuits = player.watertaji_usedsuits || [];
            if (usedsuits.includes(cardsuit)) return false;
            return true;
        },
        async content(event, trigger, player) {
            const suit = get.suit(trigger.card);
            if (trigger.targets && trigger.targets.length == 1 && !trigger.targets[0].isLinked()) {
                await trigger.targets[0].link(true);
            }
            const canRecasts = player.getCards('h').filter(card => get.suit(card) === suit && player.canRecast(card));
            let recastnum = 0;
            if (canRecasts.length > 0) {
                const setsuits = ['spade', 'heart', 'club', 'diamond'];
                const usedsuits = player.watertaji_usedsuits || [];
                const unusedsuits = setsuits.filter(suit => !usedsuits.includes(suit));
                recastnum = Math.min(canRecasts.length, unusedsuits.length);
                if(recastnum > 0){
                    let recastcards = [];
                    while (recastcards.length < recastnum) {
                        const index = Math.floor(Math.random() * canRecasts.length);
                        const card = canRecasts[index];
                        if (!recastcards.includes(card)) {
                            recastcards.push(card);
                        }
                    }
                    if (recastcards.length > 0) {
                        await player.recast(recastcards);
                    }
                }
            }
            if (!player.watertaji_usedsuits.includes(suit)) player.watertaji_usedsuits.push(suit);
            const usedlist = player.watertaji_usedsuits || [];
            if (usedlist.length === 0) return;
            if (usedlist.length === 1) {
                const result = await player.chooseBool(setColor("是否发动【踏寂】：摸一张牌？")).set('ai', function(bool) {
                    return true;
                }).forResult();
                if (result.bool) {
                    player.logSkill(event.name);
                    if (changeSkinskey && player.name === 'water_sunhanhua') player.changeSkins(1);
                    await player.draw();
                }
            } else {
                let prompt = setColor("是否发动【踏寂】：");
                let choosenum = 1;
                if (usedlist.length === 2) {
                    prompt += "令一名角色弃置一张牌？";
                    choosenum = 1;
                } else if (usedlist.length === 3) {
                    prompt += "令至多两名角色各摸一张牌？";
                    choosenum = 2;
                } else if (usedlist.length === 4) {
                    prompt += "选择至多三名角色视为对其使用一张「万箭齐发」？";
                    choosenum = 3;
                }
                const result = await player.chooseTarget(prompt, [1, choosenum], function (card, player, target) {
                    if (usedlist.length === 2) {
                        return target.countCards('he') > 0;
                    } else if (usedlist.length === 3) {
                        return game.filterPlayer().length > 0;
                    } else if (usedlist.length === 4) {
                        const targets = game.filterPlayer(function (current) {
                            return player.canUse("wanjian", current ,false ,false);
                        });
                        return targets.includes(target);
                    }
                }).set('ai', function (target) {
                    if (usedlist.length === 2) {
                        return get.attitude(player, target) < 2;
                    } else if (usedlist.length === 3) {
                        return get.attitude(player, target) >= 2;
                    } else if (usedlist.length === 4) {
                        const targets = game.filterPlayer(function (current) {
                            return player.canUse("wanjian", current ,false ,false);
                        });
                        if (!targets || targets.length === 0) return false;
                        let list = [];
                        for (let t of targets) {
                            const Vcard = { name: "wanjian", nature: '', isCard: true };
                            const effect = get.effect(t, Vcard, player, player);
                            if (effect && effect > 0 && !list.includes(t)) {
                                list.push(t);
                            }
                        }
                        if (!list || list.length === 0) return false;
                        const sortlist = list.sort((a, b) => {
                            if (a.countCards('h') != b.countCards('h')) return a.countCards('h') - b.countCards('h');
                            return a.hp - b.hp;
                        });
                        if (sortlist.includes(target)) return 1;
                        else return 0;
                    }
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    if (usedlist.length === 2) {
                        const target = targets[0];
                        player.logSkill(event.name,target);
                        if (changeSkinskey && player.name === 'water_sunhanhua') player.changeSkins(2);
                        player.line(target, 'water');
                        await target.chooseToDiscard('he', true);
                    } else if (usedlist.length === 3) {
                        player.logSkill(event.name,targets);
                        if (changeSkinskey && player.name === 'water_sunhanhua') player.changeSkins(3);
                        for (let target of targets) {
                            player.line(target, 'water');
                            await target.draw();
                        }
                    } else if (usedlist.length === 4) {
                        player.logSkill(event.name,targets);
                        if (changeSkinskey && player.name === 'water_sunhanhua') player.changeSkins(4);
                        player.changeZhuanhuanji("watertaji");
                        if (player.group !== 'shen') player.changeGroup("shen");
                        await player.recover();
                        await player.chooseToDiscard(1, 'he', true);
                        player.line(targets, 'water');
                        await player.useCard({ name: "wanjian" }, targets, false);
                        if(player.hasSkill('waterqinghuang')) player.removeDisSkills('waterqinghuang');
                    }
                }
            }
        },
        ai:{
            expose:0.3,
            noe: true,
            reverseEquip:true,
            threaten:function (player, target) {
                const att = get.attitude(player, target);
                const setsuits = ['spade', 'heart', 'club', 'diamond'];
                const usedsuits = player.watertaji_usedsuits || [];
                const unusedsuits = setsuits.filter(suit => !usedsuits.includes(suit));
                if (!unusedsuits || unusedsuits.length === 0) return 1;
                const cards = player.getCards('h');
                if (!cards || cards.length === 0) return 1;
                for (let suit of unusedsuits) {
                    const canRecasts = player.getCards('h').filter(card => get.suit(card) === suit && player.canRecast(card));
                    if (canRecasts.length <= 1) {
                        return 1;
                    } else {
                        return Math.min(canRecasts.length, unusedsuits.length) + 0.5;
                    }
                }
            },
            effect: {
                target: function(card, player, target) {
                    //无
                },
                player:function (card, player, target) {
                    const setsuits = ['spade', 'heart', 'club', 'diamond'];
                    const usedsuits = player.watertaji_usedsuits || [];
                    const unusedsuits = setsuits.filter(suit => !usedsuits.includes(suit));
                    if (!unusedsuits || unusedsuits.length === 0) return;
                    const cards = player.getCards('h');
                    if (!cards || cards.length === 0) return;
                    for (let suit of unusedsuits) {
                        const canRecasts = player.getCards('h').filter(card => get.suit(card) === suit && player.canRecast(card));
                        if (canRecasts.length <= 1) {
                            if (get.suit(card) === suit) return [1, 0];
                        } else {
                            if (get.suit(card) === suit) {
                                let shouyi = Math.min(canRecasts.length, unusedsuits.length) + 0.5;
                                return [1, shouyi];
                            }
                        }
                    }
                },
            },
        },
        "_priority":Infinity,
    },
    waterqinghuang:{
        audio:"ext:银竹离火/audio/skill:4",
        trigger:{
            player:"damageBefore",
            global:"roundStart",
        },
        locked:false,
        direct:true,
        async init(player) {
            if (!player.waterqinghuang_suits) player.waterqinghuang_suits = [];
            if (!player.waterqinghuang_mark) player.waterqinghuang_mark = [];
        },
        filter:function (event, player, name) {
            if (name == 'damageBefore') {
                if (!event.card) return false;
                if (!event.cards || event.cards.length === 0) return false;
                const setsuits = ['spade', 'heart', 'club', 'diamond'];
                const cardsuit = get.suit(event.card);
                if (!cardsuit) return false;
                if (!setsuits.includes(cardsuit)) return false;
                return event.num > 0;
            } else if (name == 'roundStart') {
                if (player.waterqinghuang_mark) player.waterqinghuang_mark = [];
                if (!player.waterqinghuang_mark) player.waterqinghuang_mark = [];
                return;
            }
        },
        async content(event, trigger, player) {
            const Time = event.triggername;
            if(Time == 'roundStart') return;
            let count = trigger.num || 1;
            const cards = trigger.cards;
            let suitslist = [];
            for (let card of cards) {
                const suit = get.suit(card);
                if (!suitslist.includes(suit)) {
                    suitslist.push(suit);
                }
            }
            if (suitslist.length > 0 && suitslist.length < 4) {
                while (count > 0) {
                    count--;
                    player.logSkill(event.name);
                    const setsuits = ['spade', 'heart', 'club', 'diamond'];
                    const newsuits = setsuits.filter(suit => !suitslist.includes(suit));
                    if (newsuits.length > 0) {
                        if (!player.waterqinghuang_suits) player.waterqinghuang_suits = [];
                        if (!player.waterqinghuang_mark) player.waterqinghuang_mark = [];
                        player.waterqinghuang_suits = newsuits;
                        const judgesuit = await waterqinghuang(player);
                        if (judgesuit && judgesuit.length > 0) {
                            const suit = judgesuit[0];
                            if (!player.hasSkill('waterqinghuang_suits')) {
                                player.addTempSkill('waterqinghuang_suits', { global: 'roundStart' });
                            }
                            player.markSkill("waterqinghuang_suits");
                            if (setsuits.includes(suit)) {
                                if (!player.waterqinghuang_mark.includes(suit)) {
                                    player.waterqinghuang_mark.push(suit);
                                }
                            } else {
                                game.log(suit,"非现阶段所认知的三国杀卡牌的四花色之一！无效！！！！！！！" );
                            }
                            if (suit !== 'spade') {
                                player.tempDisSkills('waterqinghuang', { global: 'roundStart' });
                                return;
                            }
                        }
                    }
                }
            }
        },
        ai:{
            maixie:true,
            maixie_hp:true,
            threaten:1.5,
            effect:{
                target: function (card, player, target) {
                    const damage = get.tag(card, "damage");
                    const Phase = _status.currentPhase === target;
                    const setsuits = ['spade', 'heart', 'club', 'diamond'];
                    const cardsuit = get.suit(card);
                    if (!cardsuit) return;
                    if (!setsuits.includes(cardsuit)) return;
                    if (damage) {
                        if (!target.hasFriend()) return;
                        if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
                        const livenum = target.hp + target.countCards('hs', { name: ['tao', 'jiu'] }) - get.tag(card, "damage");
                        let shouyi = 0;
                        if (livenum <= 1) {
                            shouyi = 0;
                        } else {
                            const usedsuits = target.watertaji_usedsuits || [];
                            const unusedsuits = setsuits.filter(suit => !usedsuits.includes(suit));
                            let threaten = 0;
                            if (unusedsuits.length > 0) {
                                for (let suit of unusedsuits) {
                                    const canrecastsuits = target.getCards('h').filter(card => get.suit(card) === suit && target.canRecast(card));
                                    let recastnum = 0;
                                    if (canrecastsuits.length > 0) {
                                        if (canrecastsuits.length >= unusedsuits.length) {
                                            recastnum = unusedsuits.length;
                                        } else {
                                            recastnum = canrecastsuits.length;
                                        }
                                    }
                                    threaten += recastnum;
                                }
                            }
                            const canaddnum = Math.min(4, threaten)
                            const newsuits = setsuits.filter(suit => suit !== cardsuit);
                            if (newsuits.length > 0) {
                                const addnum = newsuits.length;
                                if (Phase) {
                                    shouyi = addnum + canaddnum;
                                } else {
                                    shouyi = addnum;
                                }
                            } else {
                                shouyi = 0;
                            }
                        }
                        return [1, shouyi];
                    }
                },
            },
        },
        subSkill:{
            suits:{
                marktext:"<font color= #48D1CC>清荒</font>",
                onremove:true,
                intro: {
                    name:"<font color= #48D1CC>清荒</font>",
                    onunmark: true,
                    mark:function(dialog, storage, player) {
                        let result = "视为酒的花色为：";
                        const marksuits = player.waterqinghuang_mark || [];
                        if (marksuits.length > 0) {
                            result += marksuits.map(suit => get.translation(suit)).join('、');
                        } else {
                            result += "无";
                        }
                        dialog.addText(result);
                    },
                    markcount:function(storage, player) {
                        const marksuits = player.waterqinghuang_mark || [];
                        let num = 0;
                        if (marksuits.length > 0) {
                            num = marksuits.length;
                        }
                        return num;
                    },
                },
                mod:{
                    cardname:function (card, player, name) {
                        const marksuits = player.waterqinghuang_mark || [];
                        if (!marksuits || marksuits.length === 0) return;
                        for (let suit of marksuits) {
                            if (get.suit(card) === suit) return "jiu";
                        }
                    },
                },
                superCharlotte: true,
                charlotte: true,
                sub:true,
                sourceSkill:"waterqinghuang",
            },
        },
        "_priority":Infinity,
    }
};
export default TAF_wuSkills;
