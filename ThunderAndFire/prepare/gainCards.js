import { lib, game, ui, get, ai, _status } from '../../../../noname.js'

function fisherYatesShuffle(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
/**
 * 卡牌的花色序号数，黑红梅方 = 1234
 */
function getCardSuitNum(card, player) {
    let suitsNumber = 0;
    let suit = get.suit(card, player);
    if (!suit) return 0;
    if (suit === 'spade') {
        suitsNumber = 1;
    } else if (suit === 'heart') {
        suitsNumber = 2;
    } else if (suit === 'club') {
        suitsNumber = 3;
    } else if (suit === 'diamond') {
        suitsNumber = 4;
    } else {
        suitsNumber = 0;
    }
    return suitsNumber;
};
/**
 * 卡牌的汉字牌名字数
 */
function getCardNameNum(card, player) {
    const actualCardName = lib.actualCardName, name = get.translation(typeof card === "string" ? card : get.name(card, player));
    return (actualCardName.has(name) ? actualCardName.get(name) : name).length;
};
/**
 * 单一条件的卡牌筛选函数
 */
async function filterCardsByCondition(player, cards, func, num, type = "gain2") {
    if (cards.length === 0) return [];
    const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
    const selectedCards = [];
    for (const card of cards) {
        const info = func(card);
        if (info) {
            if (selectedCards.length >= selectednum) break;
            if (!selectedCards.some(c => func(c) === info)) {
                selectedCards.push(card);
            }
        }
    }
    if (selectedCards.length > 0) {
        await player.gain(selectedCards, type);
    }
    return selectedCards;
};
/**
 * 两个条件的卡牌筛选函数（均不同，不像本体写的十周年文鸯那个逻辑）
 */
async function filterCardsByConditions(player, cards, func1, func2, num, type = "gain2") {
    if (cards.length === 0) return [];
    const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
    const selectedCards = [];
    for (const card of cards) {
        const info1 = func1(card);
        const info2 = func2(card);
        if (info1 && info2) {
            if (selectedCards.length >= selectednum) break;
            if (!selectedCards.some(c => func1(c) === info1 || func2(c) === info2)) {
                selectedCards.push(card);
            }
        }
    }
    if (selectedCards.length > 0) {
        await player.gain(selectedCards, type);
    }
    return selectedCards;
};
/**
 * 两个条件的卡牌筛选函数（十周年抽象逻辑：牌名不同且副类别不同，先找副类别再找牌名，先找后者再找前者）
 */
async function filterCardsByConditions_szn(player, cards, func1, func2, num, type = "gain2") {
    if (cards.length === 0) return [];
    const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
    const selectedCards = [];
    const getFunc = function (card) {
        const info2 = func2(card);
        const info1 = func1(card);
        if (info2) return info2;
        else if (info1) return info1;
    };
    for (const card of cards) {
        const cardProperty = getFunc(card);
        if (cardProperty) {
            if (selectedCards.length >= selectednum) break;
            if (!selectedCards.some(c => getFunc(c) === cardProperty)) {
                selectedCards.push(card);
            }
        }
    }
    
    if (selectedCards.length > 0) {
        await player.gain(selectedCards, type);
    }
    return selectedCards;
};


/**
 * 银竹离火的卡牌筛选函数
 */
export const gainCards = {
    /**
     * 从指定来源获取卡牌。
     *
     * 支持从牌堆、弃牌堆、玩家区域等位置获取卡牌，不进行随机筛选，直接返回符合条件的所有卡牌。
     *
     * @param {Object} [form={ Pile: 'allPile', field: null }] - 获取卡牌的配置对象，默认从所有牌堆中获取
     * @param {string} [form.Pile='allPile'] - 卡牌堆类型：
     *   - `'cardPile'`: 仅从牌堆中取
     *   - `'discardPile'`: 仅从弃牌堆中取
     *   - `'allPile'`: 从牌堆和弃牌堆中一起取（默认）
     *   - 其他值或为 `null` 时返回空数组
     * @param {string|null} [form.field=null] - 玩家区域字段（如 `'he'` 表示手牌与装备区）：
     *   - 若为 `null`：忽略玩家区域
     *   - 否则从所有玩家的该区域中获取卡牌
     *   - 当 `form.Pile` 不为 `null` 时，表示筛选具有特定 `parentNode.id` 的卡牌
     *
     * @returns {Array<Element>} 返回一个包含所有匹配卡牌的数组，每项是一个 card DOM 元素
     *
     * @example
     * // 获取牌堆和弃牌堆中的所有卡牌
     * const cards = getCardsform({ Pile: 'allPile', field: null });
     *
     * @example
     * // 获取所有玩家手牌/装备区（field: 'he'）中的卡牌
     * const cards = getCardsform({ Pile: null, field: 'he' });
     *
     * @example
     * // 获取 id 为 'hesjx' 的区域中的卡牌（包括牌堆中该区域的卡）
     * const cards = getCardsform({ Pile: 'allPile', field: 'hesjx' });
     */
    getCardsform:(form = { Pile: 'allPile', field: null }) => {
        function getPileCards(pileName) {
            return pileName ? [...ui[pileName]?.childNodes || []] : [];
        }
        let cards = [];
        if (form.field === null) {
            switch (form.Pile) {
                case 'cardPile':
                    cards = getPileCards('cardPile');
                    break;
                case 'discardPile':
                    cards = getPileCards('discardPile');
                    break;
                case 'allPile':
                    cards = [...getPileCards('cardPile'), ...getPileCards('discardPile')];
                    break;
                default:
                    cards = [];
                    break;
            }
        } else if (form.Pile === null) {
            const cardslist = [];
            const targets = game.filterPlayer(() => true);
            for (const target of targets) {
                const cards = target.getCards(form.field);
                if (cards.length > 0) {
                    cardslist.push(...cards);
                }
            }
            cards = cardslist;
        } else {
            let cardsFromPile = [];
            switch (form.Pile) {
                case 'cardPile':
                    cardsFromPile = getPileCards('cardPile');
                    break;
                case 'discardPile':
                    cardsFromPile = getPileCards('discardPile');
                    break;
                case 'allPile':
                    cardsFromPile = [...getPileCards('cardPile'), ...getPileCards('discardPile')];
                    break;
                default:
                    cardsFromPile = [];
                    break;
            }
            const cardslist = [];
            const targets = game.filterPlayer(() => true);
            for (const target of targets) {
                const cards = target.getCards(form.field);
                if (cards.length > 0) {
                    cardslist.push(...cards);
                }
            }
            cards = [...cardsFromPile, ...cardslist];
        }
        const shuffled = fisherYatesShuffle(cards);
        return shuffled;
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的卡牌，并获得这些卡牌。
     */
    gainCardsRandom: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const selectedCards = cards.slice(0, selectednum);
        await player.gain(selectedCards, type);
        return selectedCards;
    },
    /**
     * 根据指定条件从卡牌中筛选符合条件的卡牌，并随机获取指定数量的卡牌。
     *
     * 支持通过字符串或对象形式传入条件。若为字符串，则支持特定关键词（如颜色、花色、类型等）；若为对象，则每个键对应的值表示具体条件。
     *
     * @param {string|number|Object} conditions - 筛选卡牌的条件：
     *   - 若为字符串且为 `'min'` 或 `'max'`，则分别选择点数最小或最大的卡牌；
     *   - 若为字符串且为 `"red"`/`"black"`/`"spade"`/`"heart"` 等，表示根据颜色/花色等筛选；
     *   - 若为数字，则匹配对应点数；
     *   - 若为对象，则对象的键值对表示多个条件（例如：{ suit: "heart", color: "red" }）；
     * @param {number} [num=1] - 需要获取的卡牌数量，取值范围为 1 到实际可选卡牌总数；
     * @param {Object} [form={ Pile: 'allPile', field: null }] - 获取卡牌的来源配置：
     *   - `Pile`: 卡堆类型（`cardPile` 表示牌堆，`discardPile` 表示弃牌堆，`allPile` 表示两者都包含）；
     *   - `field`: 玩家区域字段（如 `'he'` 表示手牌与装备区），若为 `null` 表示忽略玩家区域；
     *
     * @returns {Promise<Array<Element>>} 返回一个 Promise，解析后得到所选卡牌数组，每项是一个 DOM 元素类型的 card；
     *
     * @example
     * // 获取所有红桃卡牌中的 2 张
     * specifyCards("heart", 2, { Pile: 'allPile', field: null });
     *
     * @example
     * // 获取所有红色卡牌中的 3 张
     * specifyCards("red", 3, { Pile: 'allPile', field: null });
     *
     * @example
     * // 获取满足火属性的基本牌中的 1 张
     * const cards = await player.specifyCards({ nature: 'fire', type: 'basic' });
     */
    specifyCards: async function (conditions, num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        let specifyCards = [];
        const shuffled = fisherYatesShuffle(cards);
        const minOrmax = ['min','max'];
        if (typeof conditions === 'string' && minOrmax.includes(conditions)) {
            let setnumlist = [];
            for (const card of shuffled) {
                const number = get.number(card);
                if (!setnumlist.includes(number)) {
                    setnumlist.push(number);
                }
            }
            if (setnumlist.length === 0) return [];
            const maxNumber = Math.max(...setnumlist);
            const minNumber = Math.min(...setnumlist);
            if (conditions ==='min') {
                specifyCards = cards.filter(card => get.number(card) === minNumber);
            } else if (conditions ==='max') {
                specifyCards = cards.filter(card => get.number(card) === maxNumber);
            }
            if (specifyCards.length === 0) return [];
            const selectednum = Math.max(1, Math.min(Number(num) || 1, specifyCards.length));
            const selectedCards = specifyCards.slice(0, selectednum);
            await player.gain(selectedCards, type);
            return selectedCards;
        }
        const colors = ["red", "black"];
        const types = ["basic", "equip", "trick", "delay"];
        const suits = ["spade", "heart", "club", "diamond"];
        const natures = ["nature", "thunder", "fire", "kami", "ice"];
        const subtypes = ["equip1", "equip2", "equip3", "equip4", "equip5"];
        const numbers = Array.from({ length: 13 }, (_, i) => i + 1);
        const matchesCondition = (card, condition) => {
            return (
                (colors.includes(condition) && get.color(card) === condition) ||
                (types.includes(condition) && get.type(card) === condition) ||
                (suits.includes(condition) && get.suit(card) === condition) ||
                (natures.includes(condition) && (condition === "nature" ? game.hasNature(card, "linked") : game.hasNature(card, condition))) ||
                (subtypes.includes(condition) && get.subtype(card) === condition) ||
                (numbers.includes(condition) && get.number(card) === condition) ||
                (get.name(card) === condition)
            );
        };
        const checkCard = (card) => {
            if (typeof conditions === 'string' || typeof conditions === 'number') {
                return matchesCondition(card, conditions);
            } else if (typeof conditions === 'object') {
                return Object.keys(conditions).every(key => matchesCondition(card, conditions[key]));
            } else {
                return [];
            }
        };
        for (const card of shuffled) {
            if (!specifyCards.includes(card) && checkCard(card)) {
                specifyCards.push(card);
            }
        }
        if (specifyCards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, specifyCards.length));
        const selectedCards = specifyCards.slice(0, selectednum);
        await player.gain(selectedCards, type);
        return selectedCards;
    },

    /****************************单一条件的卡牌筛选函数************************************ */
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同的牌，并获得这些卡牌。
     */
    gainCardsColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色1
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.color, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同的牌，并获得这些卡牌。
     */
    gainCardsSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色2
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.suit, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同的牌，并获得这些卡牌。
     */
    gainCardsNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数3
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.number, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同的牌，并获得这些卡牌。
     */
    gainCardsNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名4
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.name, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同的牌，并获得这些卡牌。
     */
    gainCardsTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型5
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.type, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、副类别不同的牌，并获得这些卡牌。
     */
    gainCardsSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//副类别6
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.subtype, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色序数7
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, getCardSuitNum, num, type);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名字数8
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, getCardNameNum, num, type);
    },

    /********************************本扩展定义的均不同！这才叫且！************************************ */
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且花色不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与花色1
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.suit, num, type)
    },
    gainCardsSuitsAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与花色2
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.suit, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且点数不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与点数3
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.number, num, type)
    },
    gainCardsNumbersAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与点数4
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.number, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且牌名不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与牌名5
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.name, num, type)
    },
    gainCardsNamesAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与牌名6
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.name, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与类型7
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.type, num, type)
    },
    gainCardsTypesAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与类型8
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.type, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与副类别9
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.subtype, num, type)
    },
    gainCardsSubtypesAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与副类别10
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.subtype, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与花色序数11
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardSuitNum, num, type)
    },
    gainCardsSuitNumAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与花色序数12
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardSuitNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与牌名字数13
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardNameNum, num, type)
    },
    gainCardsNameNumAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//颜色与牌名字数14
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardNameNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且点数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与点数15
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.number, num, type)
    },
    gainCardsNumbersAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与点数16
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.number, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且牌名不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与牌名17
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.name, num, type)
    },
    gainCardsNamesAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与牌名18
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.name, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与类型19
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.type, num, type)
    },
    gainCardsTypesAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与类型20
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.type, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与副类别21
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.subtype, num, type)
    },
    gainCardsSubtypesAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与副类别22
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.subtype, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与花色序数23
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardSuitNum, num, type)
    },
    gainCardsSuitNumAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与花色序数24
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardSuitNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与牌名字数25
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardNameNum, num, type)
    },
    gainCardsNameNumAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色与牌名字数26
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardNameNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且牌名不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与牌名27
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.name, num, type)
    },
    gainCardsNamesAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与牌名28
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.name, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与类型29
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.type, num, type)
    },
    gainCardsTypesAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与类型30
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.type, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与副类别31
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.subtype, num, type)
    },
    gainCardsSubtypesAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与副类别32
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.subtype, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与花色序数33
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardSuitNum, num, type)
    },
    gainCardsSuitNumAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与花色序数34
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardSuitNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与牌名字数35
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardNameNum, num, type)
    },
    gainCardsNameNumAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//点数与牌名字数36
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardNameNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与类型37
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.type, num, type)
    },
    gainCardsTypesAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与类型38
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.type, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与副类别39
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.subtype, num, type)
    },
    gainCardsSubtypesAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与副类别40
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.subtype, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与花色序数41
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardSuitNum, num, type)
    },
    gainCardsSuitNumAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与花色序数42
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardSuitNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与牌名字数43
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardNameNum, num, type)
    },
    gainCardsNameNumAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//牌名与牌名字数44
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardNameNum, num, type)
    },
    
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsTypesAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型与副类别45
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, get.subtype, num, type)
    },
    gainCardsSubtypesAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型与副类别46
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, get.subtype, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsTypesAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型与花色序数47
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardSuitNum, num, type)
    },
    gainCardsSuitNumAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型与花色序数48
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardSuitNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsTypesAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型与牌名字数49
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardNameNum, num, type)
    },
    gainCardsNameNumAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//类型与牌名字数50
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardNameNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、副类别不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsSubtypesAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//副类别与花色序数51
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardSuitNum, num, type)
    },
    gainCardsSuitNumAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//副类别与花色序数52
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardSuitNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、副类别不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsSubtypesAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//副类别与牌名字数53
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardNameNum, num, type)
    },
    gainCardsNameNumAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//副类别与牌名字数54
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardNameNum, num, type)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色序数不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitNumAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色序数与牌名字数55
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, getCardSuitNum, getCardNameNum, num, type)
    },
    gainCardsNameNumAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//花色序数与牌名字数56
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, getCardSuitNum, getCardNameNum, num, type)
    },

    /********************************十周年奔放的技能文案************************************ */
    //颜色
    gainColors_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//1
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, get.suit, num, type);
    },
    gainSuits_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//2
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, get.color, num, type);
    },
    gainColors_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//3
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, get.number, num, type);
    },
    gainNumbers_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//4
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, get.color, num, type);
    },
    gainColors_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//5
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, get.name, num, type);
    },
    gainNames_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//6
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, get.color, num, type);
    },
    gainColors_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//7
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, get.type, num, type);
    },
    gainTypes_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//8
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, get.color, num, type);
    },
    gainColors_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//9
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, get.subtype, num, type);
    },
    gainSubtypes_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//10
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, get.color, num, type);
    },
    gainColors_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//11
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, getCardSuitNum, num, type);
    },
    gainSuitNum_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//12
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, get.color, num, type);
    },
    gainColors_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//13
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.color, getCardNameNum, num, type);
    },
    gainNameNum_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//14
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, get.color, num, type);
    },
    //花色
    gainSuits_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//15
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, get.number, num, type);
    },
    gainNumbers_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//16
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, get.suit, num, type);
    },
    gainSuits_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//17
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, get.name, num, type);
    },
    gainNames_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//18
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, get.suit, num, type);
    },
    gainSuits_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//19
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, get.type, num, type);
    },
    gainTypes_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//20
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, get.suit, num, type);
    },
    gainSuits_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//21
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, get.subtype, num, type);
    },
    gainSubtypes_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//22
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, get.suit, num, type);
    },
    gainSuits_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//23
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, getCardSuitNum, num, type);
    },
    gainSuitNum_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//24
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, get.suit, num, type);
    },
    gainSuits_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//25
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.suit, getCardNameNum, num, type);
    },
    gainNameNum_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//26
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, get.suit, num, type);
    },
    //点数
    gainNumbers_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//27
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, get.name, num, type);
    },
    gainNames_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//28
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, get.number, num, type);
    },
    gainNumbers_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//29
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, get.type, num, type);
    },
    gainTypes_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//30
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, get.number, num, type);
    },
    gainNumbers_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//31
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, get.subtype, num, type);
    },
    gainSubtypes_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//32
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, get.number, num, type);
    },
    gainNumbers_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//33
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, getCardSuitNum, num, type);
    },
    gainSuitNum_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//34
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, get.number, num, type);
    },
    gainNumbers_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//35
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.number, getCardNameNum, num, type);
    },
    gainNameNum_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//36
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, get.number, num, type);
    },
    //牌名
    gainNames_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//37
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, get.type, num, type);
    },
    gainTypes_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//38
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, get.name, num, type);
    },
    gainNames_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//39
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, get.subtype, num, type);
    },
    gainSubtypes_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//40
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, get.name, num, type);
    },
    gainNames_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//41
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, getCardSuitNum, num, type);
    },
    gainSuitNum_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//42
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, get.name, num, type);
    },
    gainNames_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//43
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.name, getCardNameNum, num, type);
    },
    gainNameNum_Names: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//44
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, get.name, num, type);
    },
    //类型
    gainTypes_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//45
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, get.subtype, num, type);
    },
    gainSubtypes_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//46
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, get.type, num, type);
    },
    gainTypes_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//47
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, getCardSuitNum, num, type);
    },
    gainSuitNum_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//48
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, get.type, num, type);
    },
    gainTypes_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//49
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.type, getCardNameNum, num, type);
    },
    gainNameNum_Types: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//50
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, get.type, num, type);
    },
    //副类别
    gainSubtypes_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//51
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, getCardSuitNum, num, type);
    },
    gainSuitNum_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//52
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, get.subtype, num, type);
    },
    gainSubtypes_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//53
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, get.subtype, getCardNameNum, num, type);
    },
    gainNameNum_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//54
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, get.subtype, num, type);
    },
    //花色序数
    gainSuitNum_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//55
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardSuitNum, getCardNameNum, num, type);
    },
    gainNameNum_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }, type = "gain2") {//56
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions_szn(player, cards, getCardNameNum, getCardSuitNum, num, type);
    },
}