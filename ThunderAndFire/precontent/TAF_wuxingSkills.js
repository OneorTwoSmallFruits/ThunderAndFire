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
const TAF_wuxingSkills = {
    //五行世家设定
    TAFwuxing: {
        audio: "ext:银竹离火/audio/skill:2",
        mark: true,
        marktext: "<font color= #EE9AC7>五行</font>",
        intro: {
            content: function(event, player) {
                let TXT = setColor("每回合使用的第三的倍数张非延时锦囊牌指定单一目标时，目标为你的克制/被克属性，则摸一张牌/此牌无效。");
                return TXT;
            }
        },
        trigger: {
            player: "useCardToBefore",
            global: "phaseAfter",
        },
        locked:true,
        direct:true,
        init:async function (player, skill) {
            const name = player.name;
            const setlist = ['TAF_xuanyuan','TAF_rongcheng','TAF_shentu','TAF_wenren','TAF_gongyi'];
            if(setlist.some(prefix => name.startsWith(prefix))){
                if(!player[name]) player[name] = 0;
            } else {
                player.unmarkSkill("TAFwuxing");
                player.removeSkill("TAFwuxing");
                player.update();
            }
        },
        filter: function(event, player, name) {
            if(name === "useCardToBefore") {
                if (!event.target || event.targets.length != 1) return false;
                const setlist = ['TAF_xuanyuan','TAF_rongcheng','TAF_shentu','TAF_wenren','TAF_gongyi'];
                const name = event.player.name;
                if(setlist.some(prefix => name.startsWith(prefix))) return get.type(event.card) != "delay";
                return false;
            } else {
                const name = player.name;
                if(!player[name]) return;
                player[name] = 0;
                player.update();
                return;
            }
        },
        async content(event, trigger, player) {
            const name = player.name;
            const Tname = trigger.target.name;
            player[name]++;
            if (player[name] % 3 !== 0) return;
            // 相生相克制
            const 相生相克 = {
                'TAF_xuanyuan': { self: '金', win: 'TAF_rongcheng', lose: 'TAF_wenren' },   // 金克木，被火克
                'TAF_rongcheng': { self: '木', win: 'TAF_gongyi', lose: 'TAF_xuanyuan' },   // 木克土，被金克
                'TAF_shentu': { self: '水', win: 'TAF_wenren', lose: 'TAF_gongyi' },       // 水克火，被土克
                'TAF_wenren': { self: '火', win: 'TAF_xuanyuan', lose: 'TAF_shentu' },     // 火克金，被水克
                'TAF_gongyi': { self: '土', win: 'TAF_shentu', lose: 'TAF_rongcheng' },    // 土克水，被木克
            };
            const prefixList = Object.keys(相生相克);
            const matchedPrefix = prefixList.find(prefix => name.startsWith(prefix));
            if (!matchedPrefix) return;
            const { win, lose } = 相生相克[matchedPrefix];
            if (Tname.startsWith(win)) {
                await player.draw(); // 克制目标，你摸一张牌
            } else if (Tname.startsWith(lose)) {
                trigger.cancel(); // 被对方克制，此牌无效
            }
        },
        ai:{
            effect: {
                target: function (card, player, target) {
                    const 相生相克 = {
                        'TAF_xuanyuan': { self: '金', win: 'TAF_rongcheng', lose: 'TAF_wenren' },   // 金克木，被火克
                        'TAF_rongcheng': { self: '木', win: 'TAF_gongyi', lose: 'TAF_xuanyuan' },   // 木克土，被金克
                        'TAF_shentu': { self: '水', win: 'TAF_wenren', lose: 'TAF_gongyi' },       // 水克火，被土克
                        'TAF_wenren': { self: '火', win: 'TAF_xuanyuan', lose: 'TAF_shentu' },     // 火克金，被水克
                        'TAF_gongyi': { self: '土', win: 'TAF_shentu', lose: 'TAF_rongcheng' },    // 土克水，被木克
                    };
                    if (get.type(card) != "delay" && player != target) {
                        const Pname = player.name;
                        const Tname = target.name;
                        const prefixList = Object.keys(相生相克);
                        const matchedPrefix = prefixList.find(prefix => Pname.startsWith(prefix));
                        if (matchedPrefix && player[Pname] % 3 === 0) {
                            const { win, lose } = 相生相克[matchedPrefix];
                            if (Tname.startsWith(win)) {
                                return [1, 1];
                            } else if (Tname.startsWith(lose)) {
                                return "zeroplayertarget";
                            }
                        }
                    }
                },
            },
        },
        "_priority": 1314
    },
    //轩辕神君
    TAFjianzhen: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #EE9AC7>剑阵</font>",
        intro:{
            content: function (storage, player) {
                const numlist = player.TAFjianzhen.map(get.translation).join('、');
                return numlist;
            },
            onunmark: true,
            name:"<font color= #EE9AC7>剑阵</font>",
        },
        mod: {
            cardnumber: function(card,player) {
                const list = player.TAFjianzhen;
                if (list && list.includes(card.number)) {
                    return 1;
                }
            },
            aiValue: function(player, card, num) {
                const setNumlist = [1, ...player.TAFjianzhen];
                const cardNum = get.number(card);
                if (!setNumlist.includes(cardNum)) return;
                const shaValue =  compareValue(player,"sha");
                return Math.max(num * 1.25, shaValue + 0.5);
            },
            aiUseful: function(player, card, num) {
                return lib.skill.TAFjianzhen.mod.aiValue.apply(this, arguments);
            },
        },
        enable: ["chooseToUse","chooseToRespond"],
        prompt: "将一张点数为〖一〗的牌当〖杀〗使用或打出，并随机获得一张点数非〖一〗的牌，本局游戏将此点数视为〖一〗，至多记录四个不同点数。",
        init: async function(player, skill) {
            if (!player[skill]) player[skill] = [];
        },
        filter: function (event, player) {
            const filter = event.filterCard;
            const setNumlist = [1, ...player.TAFjianzhen];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (filter(get.autoViewAs({ name: "sha", nature: "" }, "unsure"), player, event) && cards.length > 0) return true;
            return false;
        },
        unique: true,
        locked: false,
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const setNumlist = [1, ...player.TAFjianzhen];
            const cardNum = get.number(card, player);
            if (setNumlist.includes(cardNum) && filter(get.autoViewAs({ name: "sha", nature: "" }, "unsure"), player, event)) return true;
            return false;
        },
        viewAs: function (cards, player) {
            return { name: "sha", nature: "", isCard: true };
        },
        position: "hes",
        selectCard: 1,
        complexCard: true,
        check: function (card) {
            const player = get.owner(card);
            let value = 0;
            let Vcard = { name: "sha", nature: "", isCard: true };
            const setNumlist = [1, ...player.TAFjianzhen];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            }).sort((a, b) => get.value(a, player) - get.value(b, player));;
            if (!cards || cards.length === 0) return value;

            const Vvalue = get.value(Vcard,player);

            if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
                if (numberOneUselist.length > 0) {//若可以使用杀，且有价值大于0的目标，且此牌小于杀的价值
                    return numberOneUselist[0];
                }
            }
            return value;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result, player) {
            const allNumbers = [...Array(13).keys()].map(i => i + 1);
            const numlist = [1];
            const outnumlist = allNumbers.filter(num => !numlist.includes(num));
            const randomNum = outnumlist[Math.floor(Math.random() * outnumlist.length)];
            let list = player.TAFjianzhen;
            if (list && list.length < 4) {
                if (!list.includes(randomNum)) {
                    player.TAFjianzhen.push(randomNum);
                    player.markSkill("TAFjianzhen");
                }
            }
            await player.specifyCards(randomNum);
        },
        hiddenCard: function (player, name) {
            const setNumlist = [1, ...player.TAFjianzhen];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (name == 'sha') return cards.length > 0;
            return false;
        },
        ai: {
            respondSha: true,
            skillTagFilter: function (player, tag) {
                if (tag == 'respondSha') {
                    const setNumlist = [1, ...player.TAFjianzhen];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    });
                    if (cards.length > 0) return true;
                }
            },
            effect: {
                target: function(card, player, target, current) {
                    if (get.tag(card, "respondSha") && current < 0) return 0.8;
                },
            },
            order: function (item, player) {
                if (player && _status.event.type == "phase") {
                    let order = 0;
                    let Vcard = { name: "sha", nature: "", isCard: true };
                    if (!player.TAFjianzhen) return order;
                    const setNumlist = [1, ...player.TAFjianzhen] || [];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    }).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (!cards || cards.length === 0) return order;

                    const Vorder = get.order(Vcard);
                    const Vvalue = get.value(Vcard);

                    if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                        const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
                        if (numberOneUselist.length > 0) {
                            if (Vorder >= order) order = Vorder + 0.5;
                        }
                    }
                    return order;
                }
                return 2;
            },
        },
        "_priority": 0,
    },
    //容成墨熙
    TAFsenyu: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #EE9AC7>森愈</font>",
        intro:{
            content: function (storage, player) {
                const numlist = player.TAFsenyu.map(get.translation).join('、');
                return numlist;
            },
            onunmark: true,
            name:"<font color= #EE9AC7>森愈</font>",
        },
        mod: {
            cardnumber: function(card,player) {
                const list = player.TAFsenyu;
                if (list && list.includes(card.number)) {
                    return 2;
                }
            },
            aiValue: function(player, card, num) {
                const setNumlist = [2, ...player.TAFsenyu];
                const cardNum = get.number(card);
                if (!setNumlist.includes(cardNum)) return;
                const taoValue =  compareValue(player,"tao");
                return Math.max(num * 1.25, taoValue + 0.5);
            },
            aiUseful: function(player, card, num) {
                return lib.skill.TAFsenyu.mod.aiValue.apply(this, arguments);
            },
        },
        enable: ["chooseToUse","chooseToRespond"],
        prompt: "将一张点数为〖二〗的牌当〖桃〗使用或打出，并随机获得一张点数非〖二〗的牌，本局游戏将此点数视为〖二〗，至多记录四个不同点数。",
        init: async function(player, skill) {
            if (!player[skill]) player[skill] = [];
        },
        filter: function (event, player) {
            const filter = event.filterCard;
            const setNumlist = [2, ...player.TAFsenyu];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (filter(get.autoViewAs({ name: "tao", nature: "" }, "unsure"), player, event) && cards.length > 0) return true;
            return false;
        },
        unique: true,
        locked: false,
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const setNumlist = [2, ...player.TAFsenyu];
            const cardNum = get.number(card, player);
            if (setNumlist.includes(cardNum) && filter(get.autoViewAs({ name: "tao", nature: "" }, "unsure"), player, event)) return true;
            return false;
        },
        viewAs: function (cards, player) {
            return { name: "tao", nature: "", isCard: true };
        },
        position: "hes",
        selectCard: 1,
        complexCard: true,
        check: function (card) {
            const player = get.owner(card);
            let value = 0;
            let Vcard = { name: "tao", nature: "", isCard: true };
            const setNumlist = [2, ...player.TAFsenyu];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            }).sort((a, b) => get.value(a, player) - get.value(b, player));;
            if (!cards || cards.length === 0) return value;

            const Vvalue = get.value(Vcard,player);

            const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
            if (numberOneUselist.length > 0) {
                return numberOneUselist[0];
            }
            return value;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result, player) {
            const allNumbers = [...Array(13).keys()].map(i => i + 1);
            const numlist = [2];
            const outnumlist = allNumbers.filter(num => !numlist.includes(num));
            const randomNum = outnumlist[Math.floor(Math.random() * outnumlist.length)];
            let list = player.TAFsenyu;
            if (list && list.length < 4) {
                if (!list.includes(randomNum)) {
                    player.TAFsenyu.push(randomNum);
                    player.markSkill("TAFsenyu");
                }
            }
            await player.specifyCards(randomNum);
        },
        hiddenCard: function (player, name) {
            const setNumlist = [2, ...player.TAFsenyu];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (name == 'tao') return cards.length > 0;
            return false;
        },
        ai: {
            recover: true,
            save: true,
            respondTao: true,
            tag: {
                recover: 1,
                save: 1,
            },
            skillTagFilter: function (player, tag) {
                 if (tag == 'recover' || tag == 'save' || tag == 'respondTao') {
                    const setNumlist = [2, ...player.TAFsenyu];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    });
                    if (cards.length > 0) return true;
                }
            },
            result: {
                player: function (player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
            order: function (item, player) {
                if (player && _status.event.type == "phase") {
                    let order = 0;
                    let Vcard = { name: "tao", nature: "", isCard: true };
                    if (!player.TAFsenyu) return order;
                    const setNumlist = [2, ...player.TAFsenyu] || [];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    }).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (!cards || cards.length === 0) return order;

                    const Vorder = get.order(Vcard);
                    const Vvalue = get.value(Vcard);

                    const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
                    if (numberOneUselist.length > 0) {
                        if (Vorder >= order) order = Vorder + 0.5;
                    }
                    return order;
                }
                return 2;
            },
        },
        "_priority": 0,
    },
    //申屠子夜
    TAFshunshan: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #EE9AC7>瞬闪</font>",
        intro:{
            content: function (storage, player) {
                const numlist = player.TAFshunshan.map(get.translation).join('、');
                return numlist;
            },
            onunmark: true,
            name:"<font color= #EE9AC7>瞬闪</font>",
        },
        mod: {
            cardnumber: function(card,player) {
                const list = player.TAFshunshan;
                if (list && list.includes(card.number)) {
                    return 3;
                }
            },
            aiValue: function(player, card, num) {
                const setNumlist = [3, ...player.TAFshunshan];
                const cardNum = get.number(card);
                if (!setNumlist.includes(cardNum)) return;
                const shanValue =  compareValue(player,"shan");
                return Math.max(num * 1.25, shanValue + 0.5);
            },
            aiUseful: function(player, card, num) {
                return lib.skill.TAFshunshan.mod.aiValue.apply(this, arguments);
            },
        },
        enable: ["chooseToUse","chooseToRespond"],
        prompt: "将一张点数为三的牌当闪使用或打出，并随机获得一张点数非三的牌，本局游戏将此点数视为三，至多记录四个不同点数。",
        init: async function(player, skill) {
            if (!player[skill]) player[skill] = [];
        },
        filter: function (event, player) {
            const filter = event.filterCard;
            const setNumlist = [3, ...player.TAFshunshan];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (filter(get.autoViewAs({ name: "shan", nature: "" }, "unsure"), player, event) && cards.length > 0) return true;
            return false;
        },
        unique: true,
        locked: false,
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const setNumlist = [3, ...player.TAFshunshan];
            const cardNum = get.number(card, player);
            if (setNumlist.includes(cardNum) && filter(get.autoViewAs({ name: "shan", nature: "" }, "unsure"), player, event)) return true;
            return false;

        },
        viewAs: function (cards, player) {
            return { name: "shan", nature: "", isCard: true };
        },
        position: "hes",
        selectCard: 1,
        complexCard: true,
        check: function (card) {
            const player = get.owner(card);
            let value = 0;
            let Vcard = { name: "shan", nature: "", isCard: true };
            const setNumlist = [3, ...player.TAFshunshan];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            }).sort((a, b) => get.value(a, player) - get.value(b, player));
            if (!cards || cards.length === 0) return value;

            const Vvalue = get.value(Vcard,player);

            const numberOneUselist = cards.filter(card => get.value(card,player) <= Vvalue + 0.5);
            if (numberOneUselist.length > 0) {//若存在小于闪价值的牌
                return numberOneUselist[0];
            }
            return value;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result, player) {
            const allNumbers = [...Array(13).keys()].map(i => i + 1);
            const numlist = [3];
            const outnumlist = allNumbers.filter(num => !numlist.includes(num));
            const randomNum = outnumlist[Math.floor(Math.random() * outnumlist.length)];
            let list = player.TAFshunshan;
            if (list && list.length < 4) {
                if (!list.includes(randomNum)) {
                    player.TAFshunshan.push(randomNum);
                    player.markSkill("TAFshunshan");
                }
            }
            await player.specifyCards(randomNum);
        },
        hiddenCard: function (player, name) {
            const setNumlist = [3, ...player.TAFshunshan];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (name == 'shan') return cards.length > 0;
            return false;
        },
        ai: {
            respondShan: true,
            skillTagFilter: function (player, tag) {
                if (tag == 'respondShan') {
                    const setNumlist = [3, ...player.TAFshunshan];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    });
                    if (cards.length > 0) return true;
                }
            },
            effect: {
                target: function(card, player, target, current) {
                    if (get.tag(card, "respondShan") && current < 0) return 0.6;
                },
            },
            order: function (item, player) {
                if (player && _status.event.type == "phase") {
                    let order = 0;
                    let Vcard = { name: "shan", nature: "", isCard: true };
                    if (!player.TAFshunshan) return order;
                    const setNumlist = [3, ...player.TAFshunshan] || [];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    }).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (!cards || cards.length === 0) return order;

                    const Vvalue = get.value(Vcard);

                    const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
                    if (numberOneUselist.length > 0) {//若存在小于闪价值的牌
                        if (Vvalue >= order) order = Vvalue + 1;
                    }
                    return order;
                }
                return 2;
            },
        },
        "_priority": 0,
    },
    //闻人镜悬
    TAFyanyan: {
        audio: "ext:银竹离火/audio/skill:2",
        mark:true,
        marktext:"<font color= #EE9AC7>焱炎</font>",
        intro:{
            content: function (storage, player) {
                const numlist = player.TAFyanyan.map(get.translation).join('、');
                return numlist;
            },
            onunmark: true,
            name:"<font color= #EE9AC7>焱炎</font>",
        },
        mod: {
            cardnumber: function(card,player) {
                const list = player.TAFyanyan;
                if (list && list.includes(card.number)) {
                    return 4;
                }
            },
            aiValue: function(player, card, num) {
                const setNumlist = [4, ...player.TAFyanyan];
                const cardNum = get.number(card);
                if (!setNumlist.includes(cardNum)) return;
                const jiuValue =  compareValue(player,"jiu");
                return Math.max(num * 1.25, jiuValue + 0.5);
            },
            aiUseful: function(player, card, num) {
                return lib.skill.TAFyanyan.mod.aiValue.apply(this, arguments);
            },
        },
        enable: ["chooseToUse","chooseToRespond"],
        prompt: "将一张点数为〖四〗的牌当〖酒〗使用或打出，并随机获得一张点数非〖四〗的牌，本局游戏将此点数视为〖四〗，至多记录四个不同点数。",
        init: async function(player, skill) {
            if (!player[skill]) player[skill] = [];
        },
        filter: function (event, player) {
            const filter = event.filterCard;
            const setNumlist = [4, ...player.TAFyanyan];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (filter(get.autoViewAs({ name: "jiu", nature: "" }, "unsure"), player, event) && cards.length > 0) return true;
            return false;
        },
        unique: true,
        locked: false,
        filterCard: function (card, player, event) {
            event = event || _status.event;
            const filter = event._backup.filterCard;
            const setNumlist = [4, ...player.TAFyanyan];
            const cardNum = get.number(card, player);
            if (setNumlist.includes(cardNum) && filter(get.autoViewAs({ name: "jiu", nature: "" }, "unsure"), player, event)) return true;
            return false;
        },
        viewAs: function (cards, player) {
            return { name: "jiu", nature: "", isCard: true };
        },
        position: "hes",
        selectCard: 1,
        complexCard: true,
        check: function (card) {
            const player = get.owner(card);
            let value = 0;
            let Vcard = { name: "jiu", nature: "", isCard: true };
            const setNumlist = [4, ...player.TAFyanyan];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            }).sort((a, b) => get.value(a, player) - get.value(b, player));;
            if (!cards || cards.length === 0) return value;

            const Vvalue = get.value(Vcard,player);

            const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
            if (numberOneUselist.length > 0) {
                return numberOneUselist[0];
            }
            return value;
        },
        onrespond: function () {
            return this.onuse.apply(this, arguments);
        },
        onuse: async function (result, player) {
            const allNumbers = [...Array(13).keys()].map(i => i + 1);
            const numlist = [4];
            const outnumlist = allNumbers.filter(num => !numlist.includes(num));
            const randomNum = outnumlist[Math.floor(Math.random() * outnumlist.length)];
            let list = player.TAFyanyan;
            if (list && list.length < 4) {
                if (!list.includes(randomNum)) {
                    player.TAFyanyan.push(randomNum);
                    player.markSkill("TAFyanyan");
                }
            }
            await player.specifyCards(randomNum);
        },
        hiddenCard: function (player, name) {
            const setNumlist = [4, ...player.TAFyanyan];
            const cards = player.getCards("he").filter(card => {
                const num = get.number(card);
                return setNumlist.includes(num);
            });
            if (name == 'jiu') return cards.length > 0;
            return false;
        },
        ai: {
            save: true,
            tag: {
                save: 1,
            },
            skillTagFilter: function (player, tag) {
                 if (tag == 'save') {
                    const setNumlist = [4, ...player.TAFyanyan];
                    const cards = player.getCards("he").filter(card => {
                        const num = get.number(card);
                        return setNumlist.includes(num);
                    });
                    if (cards.length > 0) return true;
                }
            },
            result: {
                player: function (player) {
                    if (_status.event.dying && _status.event.dying === player) return 1;
                    return 1;
                },
            },
            order: function (item, player) {
                if (player && _status.event.type == "phase") {
                }
                if (_status.event.dying) return 9;
                let sha = get.order({ name: "sha" });
                if (sha <= 0) return 2;
                
                let usable = player.getCardUsable("sha");
                if (
                    usable < 2 &&
                    player.hasCard(i => {
                        return get.name(i, player) == "zhuge";
                    }, "hs")
                )
                    usable = Infinity;
                let shas = Math.min(usable, player.mayHaveSha(player, "use", item, "count"));
                if (shas != 1 || (lib.config.mode === "stone" && !player.isMin() && player.getActCount() + 1 >= player.actcount)) return 0;
                return sha + 0.2;












                let order = 0;
                let Vcard = { name: "jiu", nature: "", isCard: true };
                if (!player.TAFyanyan) return order;
                const setNumlist = [4, ...player.TAFyanyan] || [];
                const cards = player.getCards("he").filter(card => {
                    const num = get.number(card);
                    return setNumlist.includes(num);
                }).sort((a, b) => get.value(a, player) - get.value(b, player));
                if (!cards || cards.length === 0) return order;

                const Vorder = get.order(Vcard);
                const Vvalue = get.value(Vcard);

                const numberOneUselist = cards.filter(card => get.value(card, player) <= Vvalue + 0.5);
                if (numberOneUselist.length > 0) {
                    if (Vorder >= order) order = Vorder + 0.5;
                }
                console.log(order);
                return order;
            },
        },
        "_priority": 0,
    },
};
export default TAF_wuxingSkills;