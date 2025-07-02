import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
/**
 * 使用 Fisher-Yates 洗牌算法对数组进行随机打乱。
 *
 * 该算法保证了每个元素出现的位置是完全随机的，且时间复杂度为 O(n)，适合用于公平洗牌场景。
 *
 * @param {Array} arr - 需要洗牌的数组。可以是任意类型的数组元素，例如卡牌对象、数字、字符串等。
 * @returns {Array} 返回一个新的、被打乱顺序的数组副本，原始数组不会被修改。
 *
 * @example
 * const cards = [card1, card2, card3, card4];
 * const shuffledCards = fisherYatesShuffle(cards);
 * console.log(shuffledCards); // 输出一个随机顺序的新数组
 */
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
async function filterCardsByCondition(player, cards, func, num) {
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
        await player.gain(selectedCards, "gain2");
    }
    return selectedCards;
};
/**
 * 两个条件的卡牌筛选函数（均不同，不像本体写的十周年文鸯那个逻辑）
 */
async function filterCardsByConditions(player, cards, func1, func2, num) {
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
        await player.gain(selectedCards, "gain2");
    }
    return selectedCards;

};



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
    gainCardsRandom: async function (num = 1, form = { Pile: 'allPile', field: null }) {
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const selectedCards = cards.slice(0, selectednum);
        await player.gain(selectedCards, "gain2");
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
    specifyCards: async function (conditions, num = 1, form = { Pile: 'allPile', field: null }) {
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
            await player.gain(selectedCards, "gain2");
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
        await player.gain(selectedCards, "gain2");
        return selectedCards;
    },

    /****************************单一条件的卡牌筛选函数************************************ */
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同的牌，并获得这些卡牌。
     */
    gainCardsColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色1
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.color, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同的牌，并获得这些卡牌。
     */
    gainCardsSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色2
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.suit, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同的牌，并获得这些卡牌。
     */
    gainCardsNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数3
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.number, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同的牌，并获得这些卡牌。
     */
    gainCardsNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名4
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.name, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同的牌，并获得这些卡牌。
     */
    gainCardsTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型5
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.type, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、副类别不同的牌，并获得这些卡牌。
     */
    gainCardsSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别6
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, get.subtype, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数7
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, getCardSuitNum, num);
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数8
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByCondition(player, cards, getCardNameNum, num);
    },

    /********************************本扩展定义的均不同！这才叫且！************************************ */
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且花色不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.suit, num)
    },
    gainCardsSuitsAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.suit, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且点数不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.number, num)
    },
    gainCardsNumbersAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.number, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且牌名不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.name, num)
    },
    gainCardsNamesAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.name, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.type, num)
    },
    gainCardsTypesAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.type, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.subtype, num)
    },
    gainCardsSubtypesAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, get.subtype, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardSuitNum, num)
    },
    gainCardsSuitNumAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardSuitNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、颜色不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsColorsAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardNameNum, num)
    },
    gainCardsNameNumAndColors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.color, getCardNameNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且点数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.number, num)
    },
    gainCardsNumbersAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.number, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且牌名不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.name, num)
    },
    gainCardsNamesAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.name, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.type, num)
    },
    gainCardsTypesAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.type, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.subtype, num)
    },
    gainCardsSubtypesAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, get.subtype, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardSuitNum, num)
    },
    gainCardsSuitNumAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardSuitNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitsAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardNameNum, num)
    },
    gainCardsNameNumAndSuits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.suit, getCardNameNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且牌名不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.name, num)
    },
    gainCardsNamesAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.name, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.type, num)
    },
    gainCardsTypesAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.type, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.subtype, num)
    },
    gainCardsSubtypesAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, get.subtype, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardSuitNum, num)
    },
    gainCardsSuitNumAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardSuitNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsNumbersAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardNameNum, num)
    },
    gainCardsNameNumAndNumbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.number, getCardNameNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且类型不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.type, num)
    },
    gainCardsTypesAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.type, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.subtype, num)
    },
    gainCardsSubtypesAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, get.subtype, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardSuitNum, num)
    },
    gainCardsSuitNumAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardSuitNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、牌名不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsNamesAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardNameNum, num)
    },
    gainCardsNameNumAndNames: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.name, getCardNameNum, num)
    },
    
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同且副类别不同的牌，并获得这些卡牌。
     */
    gainCardsTypesAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, get.subtype, num)
    },
    gainCardsSubtypesAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, get.subtype, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsTypesAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardSuitNum, num)
    },
    gainCardsSuitNumAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardSuitNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、类型不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsTypesAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardNameNum, num)
    },
    gainCardsNameNumAndTypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.type, getCardNameNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、副类别不同且花色序数不同的牌，并获得这些卡牌。
     */
    gainCardsSubtypesAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardSuitNum, num)
    },
    gainCardsSuitNumAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardSuitNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、副类别不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsSubtypesAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardNameNum, num)
    },
    gainCardsNameNumAndSubtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, get.subtype, getCardNameNum, num)
    },
    /**
     * 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色序数不同且牌名字数不同的牌，并获得这些卡牌。
     */
    gainCardsSuitNumAndNameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, getCardSuitNum, getCardNameNum, num)
    },
    gainCardsNameNumAndSuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        return await filterCardsByConditions(player, cards, getCardSuitNum, getCardNameNum, num)
    },

    /*****************************************且颜色不同的技能文案******************************** */ //七个函数
    gainSuits_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const suit = get.suit(card);
            if (color) return color;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const number = get.number(card);
            if (color) return color;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const name = get.name(card);
            if (color) return color;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const type = get.type(card);
            if (color) return color;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const subtype = get.subtype(card);
            if (color) return color;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const suitsNumber = getCardSuitNum(card, player);
            if (color) return color;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_Colors: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与颜色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getColors = function (card) {
            const color = get.color(card);
            const nameNumber = getCardNameNum(card, player);
            if (color) return color;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getColors(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getColors(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且花色不同的技能文案******************************** */ //七个函数
    gainColors_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const color = get.color(card);
            if (suit) return suit;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const number = get.number(card);
            if (suit) return suit;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const name = get.name(card);
            if (suit) return suit;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const type = get.type(card);
            if (suit) return suit;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const subtype = get.subtype(card);
            if (suit) return suit;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const suitsNumber = getCardSuitNum(card, player);
            if (suit) return suit;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_Suits: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与花色
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuits = function (card) {
            const suit = get.suit(card);
            const nameNumber = getCardNameNum(card, player);
            if (suit) return suit;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getSuits(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuits(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且点数不同的技能文案******************************** */ //七个函数
    gainColors_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const color = get.color(card);
            if (number) return number;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuits_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const suit = get.suit(card);
            if (number) return number;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const name = get.name(card);
            if (number) return number;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const type = get.type(card);
            if (number) return number;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const subtype = get.subtype(card);
            if (number) return number;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const suitsNumber = getCardSuitNum(card, player);
            if (number) return number;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_Numbers: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与点数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNumbers = function (card) {
            const number = get.number(card);
            const nameNumber = getCardNameNum(card, player);
            if (number) return number;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getNumbers(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNumbers(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且牌名不同的技能文案******************************** */ //七个函数
    gainColors_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const color = get.color(card);
            if (name) return name;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuits_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const suit = get.suit(card);
            if (name) return name;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const number = get.number(card);
            if (name) return name;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const type = get.type(card);
            if (name) return name;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const subtype = get.subtype(card);
            if (name) return name;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const suitsNumber = getCardSuitNum(card, player);
            if (name) return name;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_Names: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与牌名
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNames = function (card) {
            const name = get.name(card);
            const nameNumber = getCardNameNum(card, player);
            if (name) return name;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getNames(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNames(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且牌类型不同的技能文案******************************** */ //七个函数
    gainColors_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const color = get.color(card);
            if (type) return type;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuits_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const suit = get.suit(card);
            if (type) return type;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const number = get.number(card);
            if (type) return type;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const name = get.name(card);
            if (type) return type;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const subtype = get.subtype(card);
            if (type) return type;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const suitsNumber = getCardSuitNum(card, player);
            if (type) return type;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_Types: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与类型
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const gettypes = function (card) {
            const type = get.type(card);
            const nameNumber = getCardNameNum(card, player);
            if (type) return type;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = gettypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => gettypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且副类别不同的技能文案******************************** */ //七个函数
    gainColors_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const color = get.color(card);
            if (subtype) return subtype;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuits_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const suit = get.suit(card);
            if (subtype) return subtype;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const number = get.number(card);
            if (subtype) return subtype;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const name = get.name(card);
            if (subtype) return subtype;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const type = get.type(card);
            if (subtype) return subtype;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const suitsNumber = getCardSuitNum(card, player);
            if (subtype) return subtype;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_Subtypes: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与副类别
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSubtypes = function (card) {
            const subtype = get.subtype(card);
            const nameNumber = getCardNameNum(card, player);
            if (subtype) return subtype;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getSubtypes(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSubtypes(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且牌花色序数不同的技能文案******************************** */ //七个函数
    gainColors_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const color = get.color(card);
            if (suitsNumber) return suitsNumber;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuits_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const suit = get.suit(card);
            if (suitsNumber) return suitsNumber;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const number = get.number(card);
            if (suitsNumber) return suitsNumber;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const name = get.name(card);
            if (suitsNumber) return suitsNumber;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const type = get.type(card);
            if (suitsNumber) return suitsNumber;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const subtype = get.subtype(card);
            if (suitsNumber) return suitsNumber;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNameNum_SuitNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名字数与花色序数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getSuitNum = function (card) {
            const suitsNumber = getCardSuitNum(card, player);
            const nameNumber = getCardNameNum(card, player);
            if (suitsNumber) return suitsNumber;
            else if (nameNumber) return nameNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getSuitNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getSuitNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    /*****************************************且牌名字数不同的技能文案******************************** */ //七个函数
    gainColors_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//颜色与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const color = get.color(card);
            if (nameNumber) return nameNumber;
            else if (color) return color;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuits_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const suit = get.suit(card);
            if (nameNumber) return nameNumber;
            else if (suit) return suit;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNumbers_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//点数与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const number = get.number(card);
            if (nameNumber) return nameNumber;
            else if (number) return number;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainNames_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//牌名与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const name = get.name(card);
            if (nameNumber) return nameNumber;
            else if (name) return name;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainTypes_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//类型与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const type = get.type(card);
            if (nameNumber) return nameNumber;
            else if (type) return type;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSubtypes_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//副类别与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const subtype = get.subtype(card);
            if (nameNumber) return nameNumber;
            else if (subtype) return subtype;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },
    gainSuitNum_NameNum: async function (num = 1, form = { Pile: 'allPile', field: null }) {//花色序数与牌名字数
        const player = this;
        const cards = gainCards.getCardsform(form);
        if (cards.length === 0) return [];
        const selectednum = Math.max(1, Math.min(Number(num) || 1, cards.length));
        const shuffled = fisherYatesShuffle(cards);
        const selectedCards = [];

        const getNameNum = function (card) {
            const nameNumber = getCardNameNum(card, player);
            const suitsNumber = getCardSuitNum(card, player);
            if (nameNumber) return nameNumber;
            else if (suitsNumber) return suitsNumber;
        };
        for (const card of shuffled) {
            const cardProperty = getNameNum(card);
            if (cardProperty) {
                if (selectedCards.length >= selectednum) break;
                if (!selectedCards.some(c => getNameNum(c) === cardProperty)) {
                    selectedCards.push(card);
                }
            }
        }
        
        if (selectedCards.length > 0) {
            await player.gain(selectedCards, "gain2");
        }
        return selectedCards;
    },

}