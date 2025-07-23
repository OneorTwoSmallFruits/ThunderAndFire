《银竹离火》Player扩展功能使用方法
# 2025/7/19 update

# 一、技能相关函数
1. 获取玩家当前拥有的技能列表。
* @param {string} type - 类型；默认所有技能
* @returns {Array} - 返回玩家拥有该类型的技能列表；
```js
player.countSkills(type = 'all');
```

2. 本扩展禁用某位玩家的技能至什么时候结束，以本体skillBlocker的形式实现，因为这样也方便，省的过AI了哈哈
* 必须有翻译真实存在的技能！同时在全局进行了监听
* @param {string|Array} skills - 要禁用的技能id
* @param {Object} object - { global: 'phaseAfter' } - 默认禁用至每个回合结束后;
```js
player.tempDisSkills(skills, object = { global: 'phaseAfter' });
```

3. 玩家手动解除禁用技能封印类
* 玩家手动解除【因 skillBlocker 类型的技能】而被失效的技能中的某些技能。
* @param {string|Array} skills - 要解除禁用的技能 id，可以是单个技能名或技能名数组。
* @param {string} [type='skills'] - 操作类型：
*   - 'all'：表示解除所有被封印的技能；
*   - 'skills'：表示解除指定的技能；
* @returns {Array} 返回被成功解除禁用的技能列表。
```js
player.removeDisSkills(skills);
```

4. 获取玩家当前因封印类失效的技能列表。
* @returns {Array} - 返回玩家当前失效的技能列表
```js
player.getDisSkills();
```

# 二、皮肤相关函数
1. 获取当前玩家所使用的皮肤名称。
* @returns {string} - 返回当前玩家的皮肤名称
* 返回值：如 'zhouyu01' 或 'zhouyu'（原皮）。
```js
player.checkSkins();
```
2. 银竹离火皮肤更换函数
    * @param {number} num - 皮肤编号（0 表示恢复原皮）。
    * @param {string} format - 图片格式，默认为 'png'。
    * @returns - 更换至对应皮肤编号的皮肤;若为0，则恢复原皮。
```js
player.changeSkins(num = 0, format = 'png');
```

# 三、卡牌操作函数
    1. 寻遍当前失去卡牌事件中的 父级事件下的所有子事件，找到对应标签和对应实体卡牌
    * 封着玩，不过我也引用了。本扩展 - 周瑜、和香香 嘿嘿
    * @param {GameEvent} evt - 事件对象。
    * @returns {Object} - { cards: [], tags: [] } - 返回所有失去的卡牌和对应的标签
```js
player.checkloseTags(evt);
```

2. 将指定的卡牌数组放置到牌堆的顶部或底部。
    * @param {Array} cards - 要放置的卡牌数组。
    * @param {string} [to='top'] - 指定放置位置，'top' 表示顶部，'bottom' 表示底部。
```js
player.chooseCardsToPile(cards, to = 'top');
```

3. 将指定的卡牌数组放置到弃牌堆的顶部或底部。
    * @param {Array} cards - 要放置的卡牌数组。
    * @param {string} [to='top'] - 指定放置位置，'top' 表示顶部，'bottom' 表示底部。
```js
player.chooseCardsTodisPile(cards, to = 'top');
```

4. 调整玩家手牌区（或其他区域）的卡牌数量至指定数量。
    * @param {number} num - 目标卡牌数量，必须为非负数。
    * @param {string} [from='h'] - 获取卡牌的区域，默认为 'h'（手牌区）。
```js
player.changeCardsTo(num, from = 'h');
```

5. 将指定卡牌或其数组模拟为虚拟卡牌进行使用或打出。
    * @param {Object} Vcard - 虚拟卡牌定义对象，至少需包含 name 属性，并可选 nature、suit 等。
    * @@param {Card|Array<Card>|null} showcard - 实际使用的卡牌或数组；若为 null，则不依赖实体卡牌。
    * @param {Player|Array<Player>} [gameplayers] - 指定允许的目标玩家或玩家列表。
    * @param {boolean} [forced=true] - 是否强制使用，忽略常规限制。
    * @param {boolean} [distance=false] - 是否考虑目标距离限制。
    * @param { boolean | GameEvent } [includecard] 是否受使用次数限制，可以填入用于检测的事件
    * @returns {Event} 返回创建的事件对象，可用于后续操作（如监听完成回调）。
```js
player.viewAsToUse(Vcard, showcard, gameplayers, forced = true, distance = false, includecard);
```

6. 返回可用卡牌且有正收益的卡牌列表数组，用于AI判断
    * 若包含次数限制，若检查的卡牌名为“杀”会进一步判断玩家是否有诸葛连弩，或有可用的诸葛连弩。若没有则会默认返回一张收益最高杀
    * @param {string | Object} Vcard - 卡牌名或卡牌对象。
    * @param {boolean} [distance=true] - 是否考虑目标距离限制。
    * @param { boolean | GameEvent } [includecard = true] - 是否受使用次数限制，可以填入用于检测的事件
    * @returns {Array} - 返回一个数组，包含符合条件的卡牌。
```js
player.getCardsValue(Vcard, distance = true, includecard = true);
```
7. 从指定来源获取卡牌，真随机排序。
     * 从指定来源获取卡牌。
     * 支持从牌堆、弃牌堆、玩家区域等位置获取卡牌，不进行随机筛选，直接返回符合条件的所有卡牌。
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
     * @returns {Array<Element>} 返回一个包含所有匹配卡牌的数组，每项是一个 card DOM 元素
     * @example
     * // 获取牌堆和弃牌堆中的所有卡牌
     * const cards = getCardsform({ Pile: 'allPile', field: null });
     * @example
     * // 获取所有玩家手牌/装备区（field: 'he'）中的卡牌
     * const cards = getCardsform({ Pile: null, field: 'he' });
     * @example
     * // 获取 id 为 'hesjx' 的区域中的卡牌（包括牌堆中该区域的卡）
     * const cards = getCardsform({ Pile: 'allPile', field: 'hesjx' });
```js
player.getCardsform(form = { Pile: 'allPile', field: null });
```

8. 根据指定条件从卡牌中筛选符合条件的卡牌，并随机获取指定数量的卡牌。
     * 支持通过字符串或对象形式传入条件。若为字符串，则支持特定关键词（如颜色、花色、类型等）；若为对象，则每个键对应的值表示具体条件。
     * @param {string|number|Object} conditions - 筛选卡牌的条件：
     *   - 若为字符串且为 `'min'` 或 `'max'`，则分别选择点数最小或最大的卡牌；
     *   - 若为字符串且为 `"red"`/`"black"`/`"spade"`/`"heart"` 等，表示根据颜色/花色等筛选；
     *   - 若为数字，则匹配对应点数；
     *   - 若为对象，则对象的键值对表示多个条件（例如：{ suit: "heart", color: "red" }）；
     * @param {number} [num=1] - 需要获取的卡牌数量，取值范围为 1 到实际可选卡牌总数；
     * @param {Object} [form={ Pile: 'allPile', field: null }] - 获取卡牌的来源配置：
     *   - `Pile`: 卡堆类型（`cardPile` 表示牌堆，`discardPile` 表示弃牌堆，`allPile` 表示两者都包含）；
     *   - `field`: 玩家区域字段（如 `'he'` 表示手牌与装备区），若为 `null` 表示忽略玩家区域；
     * @returns {Promise<Array<Element>>} 返回一个 Promise，解析后得到所选卡牌数组，每项是一个 DOM 元素类型的 card；
     * @example
     * // 获取所有红桃卡牌中的 2 张
     * specifyCards("heart", 2, { Pile: 'allPile', field: null });
     * @example
     * // 获取所有红色卡牌中的 3 张
     * specifyCards("red", 3, { Pile: 'allPile', field: null });
     * @example
     * // 获取满足火属性的基本牌中的 1 张
     * const cards = await player.specifyCards({ nature: 'fire', type: 'basic' });
```js
player.specifyCards(conditions, num = 1, form = { Pile: 'allPile', field: null });
```

9. 等一系列随机获卡牌函数(颜色、花色、点数、牌名、类型、副类别、花色序数、牌名字数)：单组合，两两不同组合！
* @example 令玩家从符合条件的所有卡牌中随机选取指定数量的、花色不同的牌，并获得这些卡牌。
```js
player.gainCardsSuits(cnum = 1, form = { Pile: 'allPile', field: null });
```
* @example 令玩家从符合条件的所有卡牌中随机选取指定数量的卡牌，并获得这些卡牌。
```js
player.gainCardsSuits(num = 1, form = { Pile: 'allPile', field: null });
```
* @example 令玩家从符合条件的所有卡牌中随机选取指定数量的、点数不同且牌名不同的牌，并获得这些卡牌。
```js
player.gainCardsNumbersAndNames(num = 1, form = { Pile: 'allPile', field: null });
```
* 十周年傻逼文案我也排列了。
* @example 副类别与牌名，十周年那边的傻逼逻辑，若没有牌名可选，进一步筛选不同副类别
```js
player.gainSubtypes_Names(num = 1, form = { Pile: 'allPile', field: null });
```
* @example 牌名与副类别，十周年那边的傻逼逻辑，若没有副类别可选，进一步筛选不同牌名
```js
player.gainNames_Subtypes(num = 1, form = { Pile: 'allPile', field: null });
```


# 四、角色排序函数
1. 获取敌方角色，并按手牌数、装备区卡牌数和体力值，按照升序排序。
* @returns {Array} 返回一个经过排序的玩家数组，排序规则如下：
*   1. 手牌数量升序（少 -> 多）；
*   2. 装备区卡牌数量升序（少 -> 多）；
*   3. 体力值升序（低 -> 高）。
```js
player.getEnemies_sorted();
```

2. 获取友方角色，并按手牌数、装备区卡牌数和体力值，按照升序排序。
* @param {boolean} [ofplayer=true] - 是否包含自己作为友好玩家：
*   - `true`: 包含自己在内的所有态度值 ≥ 2 的存活玩家；
*   - `false`: 仅包含非自己的态度值 ≥ 2 的存活玩家。
* @returns {Array} 返回一个经过排序的玩家数组，排序规则如下：
*   1. 手牌数量升序（少 -> 多）；
*   2. 装备区卡牌数量升序（少 -> 多）；
*   3. 体力值升序（低 -> 高）。
```js
player.getFriends_sorted(ofplayer = true);
```


# 五、技能触发辅助函数
1. 触发技能时显示聊天提示、播放音效、记录日志。
* 触发技能时的聊天提示、播放音效和记录日志功能。
* @param {string} skill - 技能名称，必须存在于 `lib.skill` 或技能信息中。
* @param {Array<string>} [chatlists] - 可选参数，包含触发技能时随机显示的聊天语句数组。
* @param {Player|Array<Player>} [targets] - 可选参数，表示技能作用的目标玩家或玩家数组。
* @param {string|boolean} [nature=false] - 可选参数，表示技能连线的颜色。若为 `false` 则不画线。
* @returns {void} 无返回值。
* 此函数会：
* 1. 检查技能是否存在；
* 2. 若提供了 `chatlists`，则从中随机选择一条消息通过 `player.chat()` 发送；
* 3. 根据当前皮肤播放对应的技能音效；
* 4. 如果有目标，则绘制技能连线并记录日志；
* 5. 记录技能使用事件到游戏日志和玩家技能历史；
* 6. 如果没有提供 `chatlists`，则直接调用默认的日志记录方法 `同步本体的logskill和useskill事件。`。
```js
player.chatSkill(skill, chatlists, targets, nature);
```

# 六、其它的话，不写了。
* 就提一嘴这个，反正我这边不会动本体或者其他扩展的任何设定！包括我条件的全局函数修改卡牌价值的全局技能！
* 包括我修改字体颜色 也只会动我扩展的翻译。
```js
    const TAFcharacters = Object.keys(character);
    lib.skill._ThunderAndFire_useCardAI = {
        mod: {
            aiValue: function(player, card, num) {
                const Pname = player.name;
                const useKey = _status.currentPhase === player;
                if(!TAFcharacters.includes(Pname) && !useKey) return;
                const cardname = get.name(card, player);
                if (cardname == 'zhuge') {//仅限银竹离火武将
                    return player.getCardsValue('sha').length * 2;
                }
            },
            aiUseful: function(player, card, num) {
                const Pname = player.name;
                const useKey = _status.currentPhase === player;
                if(!TAFcharacters.includes(Pname) && !useKey) return;
                const cardname = get.name(card, player);
                if (cardname == 'zhuge') {//仅限银竹离火武将
                    return player.getCardsValue('sha').length;
                }
            },
            aiOrder:function (player, card, num) {

            },
        },
        silent: true,
        unique: true,
        charlotte: true,
        superCharlotte: true,
        forced: true,
        popup: false,
        "_priority": Infinity,
    };
    //《银竹离火》阵亡、部分角色卡牌语音全局函数
    lib.skill._ThunderAndFire_setaudio = {
        trigger: { player: ['useCardBefore','dieBefore']},
        ruleSkill: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        fixed: true,
        priority: Infinity ,
        direct: true,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time == 'useCardBefore') {
                const name = trigger.card.name;
                if (!name) return;
                const setaudiocard = lib.ThunderAndFire.cards.setAudio;
                if (setaudiocard.includes(name)) {
                    const num = Math.floor(Math.random() * 2) + 1;
                    game.playAudio('..', 'extension', '银竹离火/audio/card/diycard', name + num);
                } else {
                    cardAudio(trigger, player);//特殊武将及卡牌语音：目前有郭嘉、诸葛亮、钟会、文鸯
                }
            } else if (Time == 'dieBefore') {
                const characters = lib.ThunderAndFire.characters.character;
                const playerID = trigger.player.name;
                if (characters.includes(playerID)) {
                    trigger.audio = false;
                    game.playAudio('..', 'extension', '银竹离火/audio/die', trigger.player.name);
                }
            }
        }
    };
```
