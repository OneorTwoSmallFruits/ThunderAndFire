import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { gainCards } from "./gainCards.js";
/**
 * 《银竹离火》PLayer封装汇总：
 */
export function prepare() {
    const SetPlayerFunc = {
        /**
         * 获取玩家当前拥有的技能列表函数
         * @param {string} type - 类型；
         * @returns {Array} - 返回玩家拥有该类型的技能列表；
         */
        countSkills: function (type = 'all') {
            const skillsTypes = ["锁定技","主公技","限定技","觉醒技","转换技","隐匿技","宗族技","势力技","使命技","蓄力技","阵法技","主将技","副将技","君主技","蓄能技","Charlotte","昂扬技","持恒技","连招技","威主技"];
            const bannedTypes = ["主公技","限定技","觉醒技","隐匿技","势力技","使命技","阵法技","主将技","副将技","君主技","Charlotte","威主技"];
            const player = this;
            const skills = player.getSkills(null, false, false);
            if (!skills || skills.length === 0) return [];
            const locked = skills.filter(skill => get.is.locked(skill, player));
            const unlocked = skills.filter(skill => !get.is.locked(skill, player));
            const zhuanhuanji = skills.filter(skill => get.is.zhuanhuanji(skill, player));
            if (type === 'locked') return locked;
            if (type === 'unlocked') return unlocked;
            if (type === 'zhuanhuanji') return zhuanhuanji;
            if (type === 'all') return skills;
            const result = skills.filter(skill => {
                const info = get.info(skill);
                const skilltype = info[type];
                if(info && skilltype) {
                    if(typeof skilltype === 'boolean' && skilltype === true) return true;
                    if(typeof skilltype === 'function') return true;
                    return false;
                }
                return false;
            });
            return result;
        },
        /**
         * 储存禁用技能的列表！
         */
        tempdislist: [],
        /**
         * 禁用某位玩家的技能至什么时候结束
         * @param {string} skill - 要禁用的技能id
         * @param {Object} object - { global: 'phaseAfter' } - 默认禁用至每个回合结束后;
         */
        tempdisSkill: function(skill, object = { global: 'phaseAfter' }) {
            const info = get.info(skill);
            if (!info) return;
            const player = this;
            const newskillname = '_dis_' + skill;
            const removeskillname = '_remove_' + skill;
            const distime = skill + "Before";
            if (!lib.skill[newskillname]) lib.skill[newskillname] = {};
            lib.skill[newskillname] = {
                trigger: {
                    player: [distime],
                },
                firstDo: true,
                superCharlotte: true,
                charlotte: true,
                silent: true,
                priority: Infinity,
                direct: true,
                init: async function (player) {
                    if (!lib.skill[removeskillname]) lib.skill[removeskillname] = {};
                    lib.skill[removeskillname] = {
                        trigger: object,
                        firstDo: true,
                        superCharlotte: true,
                        charlotte: true,
                        silent: true,
                        priority: Infinity,
                        direct: true,
                        async content(event, trigger, player) {
                            if (player.tempdislist && player.tempdislist.includes(skill)) {
                                player.tempdislist.splice(player.tempdislist.indexOf(skill), 1);
                            }
                            player.removeSkill(newskillname);
                            player.removeSkill(removeskillname);
                            delete lib.skill[newskillname];
                            player.update();
                            game.log(player, '的技能', '#g【' + get.translation(skill) + '】', '已解除禁用！');
                        },
                    };
                    if (!player.hasSkill(removeskillname)) {
                        player.addSkill(removeskillname);
                    } else {
                        player.removeSkill(removeskillname);
                        player.addSkill(removeskillname);
                    }
                    player.update();
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                },
            };
            if (!player.hasSkill(newskillname)) {
                player.addSkill(newskillname);
            } else {
                player.removeSkill(newskillname);
                player.addSkill(newskillname);
            }
            if (player.tempdislist && !player.tempdislist.includes(skill)) {
                player.tempdislist.push(skill);
            }
            player.update();
            game.log(player, '的技能', '#g【' + get.translation(skill) + '】', '暂时失效了！');
        },
        /**
         * 玩家手动解除禁用技能
         * @param {string} skill - 要解除禁用的技能id
         */
        removedisSkill: function(skill) {
            const player = this;
            const skilllist = ['_dis_' + skill, '_remove_' + skill];
            skilllist.forEach(skillname => {
                if (lib.skill[skillname]) {
                    if (player.hasSkill(skillname)) {
                        if (player.tempdislist && player.tempdislist.includes(skill)) {
                            player.tempdislist.splice(player.tempdislist.indexOf(skill), 1);
                        }
                    }
                    player.removeSkill(skillname);
                    delete lib.skill[skillname];
                    player.update();
                    game.log(player, '的技能', '#g【' + get.translation(skill) + '】', '已解除禁用！');
                }
            });
        },
        /**
         * 获取玩家当前禁用的技能列表
         * @returns {Array} - 返回玩家当前禁用的技能列表
         */
        getdisSkill:function () {
            const player = this;
            if (!player.tempdislist) return [];
            else return player.tempdislist;
        },
        /**
         * 获取当前玩家的皮肤名称
         * @returns {string} - 返回当前玩家的皮肤名称
         */
        checkSkins: function() {
            const player = this;
            const name = player.name;
            const currentImagePath = player.node.avatar.style.backgroundImage;
            if (!currentImagePath || !currentImagePath.includes(name)) {
                return null;
            }
            const validFormats = ['jpg', 'png', 'gif', 'webp'];
            const formatPattern = validFormats.join('|');
            const regex = new RegExp(`${name}([^/.]+)\\.(?:${formatPattern})`, 'i');
            const match = currentImagePath.match(regex);
            if (match) {
                return `${name}${match[1]}`;
            } else {
                return `${name}`;
            }
        },
        /**
         * 银竹离火皮肤更换函数
         * @param {number} num 皮肤编号 - 默认本扩展原皮
         * @param {string} format -  图片格式，默认为 'png'
         * @returns - 更换至对应皮肤编号的皮肤
         */
        changeSkins: function(num = 0, format = 'png') {
            const player = this;
            const effectPath = '银竹离火/audio/effect/';
            if (typeof num !== 'number' || num <= 0) {
                const defaultPath = `extension/银竹离火/image/character/standard/${player.name}.png`;
                const effectPath = '银竹离火/audio/effect/';
                game.playAudio('..', 'extension', effectPath, 'changeSkin');
                player.node.avatar.setBackgroundImage(defaultPath);
                return;
            }
            const validFormats = ['jpg', 'png', 'gif', 'webp']; // 支持的图片格式
            if (!validFormats.includes(format)) {
                format = 'png'; // 默认使用 png 格式
            }
            const name = player.name;
            // 构建图片通用路径
            const basePath = 'extension/银竹离火/image/ThunderAndFireSkins/standard/';
            const imagePath = `${basePath}${name}/${name}${num}.${format}`;
            game.playAudio('..', 'extension', effectPath, 'changeSkin');
            player.node.avatar.setBackgroundImage(imagePath);
        },
        /**
         * 封着玩，不过我也引用了。本扩展 - 周瑜、和香香 嘿嘿
         * 寻遍当前失去卡牌事件中的 父级事件下的所有子事件，找到对应标签和对应实体卡牌
         * @param {*} evt  - 当前事件
         * @returns {Object} - { cards: [], tags: [] } - 返回所有失去的卡牌和对应的标签
         */
        checkloseTags: function (evt) {
            const player = this;
            let checktags = { cards: [], tags: [] };
            const parentchildEvents = evt.parent.childEvents;
            if (!parentchildEvents || parentchildEvents.length === 0) return checktags;
            function findLoseEvent(events) {
                for (const event of events) {
                    if (event.name === 'lose' && event.player === player) {
                        if (event.gaintag_map) {
                            const keys = Object.keys(event.gaintag_map);
                            if (keys.length > 0) {
                                for (const key of keys) {
                                    if (event.gaintag_map[key].length > 0) {
                                        return event;
                                    }
                                }
                            }
                        }
                    }
                    if (event.childEvents && event.childEvents.length > 0) {
                        const foundEvent = findLoseEvent(event.childEvents);
                        if (foundEvent) {
                            return foundEvent;
                        }
                    }
                }
                return null;
            }
            const loseEvent = findLoseEvent(parentchildEvents);
            if (loseEvent) {
                const gaintagMap = loseEvent.gaintag_map;
                const keys = Object.keys(gaintagMap);
                const losecards = loseEvent.cards;
                for (const key of keys) {
                    for (const card of losecards) {
                        if (card.cardid === key) {
                            if (!checktags.cards.includes(card)) {
                                checktags.cards.push(card);
                            }
                            checktags.tags.push(gaintagMap[key]);
                        }
                        
                    }
                }
            }
            return checktags;
        },
        /**
         * 将指定的卡牌数组放置到牌堆的顶部或底部。
         * 
         * @param {Array} cards - 要放置的卡牌数组。
         * @param {string} [to='top'] - 指定放置位置，'top' 表示顶部，'bottom' 表示底部。
         * @returns {void} 无返回值。
         */
        chooseCardsToPile: async function (cards, to = 'top') {
            if (!cards || !Array.isArray(cards) || cards.length <= 0) return;
            const player = this;
            if (to === 'top') {
                const first = ui.cardPile.firstChild;
                for (let card of cards) {
                    ui.cardPile.insertBefore(card, first);
                }
                if (player) {
                    player.popup(get.cnNumber(cards.length) + '上');
                    game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于牌堆顶！');
                    player.update();
                }
                game.updateRoundNumber();
            } else if (to === 'bottom') {
                for (let card of cards) {
                    ui.cardPile.appendChild(card);
                }
                if (player) {
                    player.popup(get.cnNumber(cards.length) + '下');
                    game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于牌堆底！');
                    player.update();
                }
                game.updateRoundNumber();
            } else {
                return;
            }
        },
        /**
         * 将指定的卡牌数组放置到弃牌堆的顶部或底部。
         * @param {Array} cards - 要放置的卡牌数组。
         * @param {string} [to='top'] - 指定放置位置，'top' 表示顶部，'bottom' 表示底部。
         * @returns {void} 无返回值。
         */
        chooseCardsTodisPile: async function (cards, to = 'top') {
            if (!cards || !Array.isArray(cards) || cards.length <= 0) return;
            const player = this;
            if (to === 'top') {
                // 将 cards 中的每张牌按照逆序添加到弃牌堆的顶部
                for (let i = cards.length - 1; i >= 0; i--) {
                    ui.discardPile.appendChild(cards[i]);
                }
                player.popup(get.cnNumber(cards.length) + '上');
                game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于弃牌堆顶！');
                player.update();
                game.updateRoundNumber();
            } else if (to === 'bottom') {
                for (let card of cards) {
                    ui.discardPile.insertBefore(card, ui.discardPile.firstChild);
                }
                if (player) {
                    player.popup(get.cnNumber(cards.length) + '下');
                    game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于弃牌堆底！');
                    player.update();
                }
                game.updateRoundNumber();
            } else {
                return;
            }
        },
        /**
         * 调整玩家手牌区（或其他区域）的卡牌数量至指定数量。
         * @param {number} num - 目标卡牌数量，必须为非负数。
         * @param {string} [from='h'] - 获取卡牌的区域，默认为 'h'（手牌区），可传入其他区域标识如 'e'（装备区）、'j'（判定区）等。
         * @returns {void} 无返回值。
         */
        changeCardsTo: async function (num, from = 'h') {
            if(typeof num !== 'number' || num < 0)  return;
            const player = this;
            const cards = player.getCards(from);
            const numChange = Math.abs(num - cards.length);
            if(numChange === 0) return;
            if (num - cards.length  > 0) {
                await player.draw(numChange);
            } else if (num - cards.length < 0) { 
                await player.chooseToDiscard(numChange, from, true);
            }
        },
        /**
         * 将一张实体卡牌或卡牌数组当作另一张虚拟卡牌使用或打出。
         * @param {Card | Array<Card>} showcard - 要使用的实体卡牌对象或卡牌数组.
         * @param {Object} Vcard - 虚拟卡牌定义对象，必须包含
         *                         可选属性如 `nature`（属性）、`suit`（花色）等。
         * @param {boolean} [forced=true] - 是否强制使用，true 表示无视条件直接使用。
         * @param {boolean} [distance=false] - 是否受距离限制。
         * @param {boolean} [includecard=false] - 是否计入该卡牌的使用次数限制。
         * @returns {void} 无返回值。
         */
        viewAsToUse: async function (showcard, Vcard, forced = true, distance = false, includecard = false) {
            const player = this;
            const info = get.info(Vcard);
            const targets = game.filterPlayer();
            if (targets.length === 0) return;
            if (info.multicheck && !info.multicheck(Vcard, player)) return;
            if (!lib.filter.cardEnabled(Vcard, player)) return;
            if (distance !== false) {
                const canuse = targets.filter(target => {
                    return lib.filter.targetInRange(Vcard, player, target);
                });
                if (canuse.length === 0) return;
            }
            if (includecard) {
                const canuse = targets.filter(target => {
                    return lib.filter.targetEnabledx(Vcard, player, target);
                });
                if (canuse.length === 0) return;
            } else {
                const canuse = targets.filter(target => {
                    return lib.filter.targetEnabled(Vcard, player, target);
                });
                if (canuse.length === 0) return;
            }
            if (!lib.skill.ThunderAndFire_backup) lib.skill.ThunderAndFire_backup = {
                mod: {
                    targetInRange: function(card, player, target){
                        if(_status.event.skill === 'ThunderAndFire_backup' && distance === false) return true;
                    },
                },
                charlotte: true,
                filterCard: function(card, player) {
                    if (get.itemtype(showcard) === 'card' && typeof showcard === 'Object') {
                        return card === showcard;
                    }
                    if (Array.isArray(showcard)) {
                        return showcard.includes(card);
                    }
                },
                selectCard: function() {
                    if (get.itemtype(showcard) === 'card' && typeof showcard === 'Object') {
                        return 1;
                    }
                    if (Array.isArray(showcard)) {
                        return showcard.length;
                    }
                },
                position: "hejsx",
                viewAs: function (cards, player) {
                    return Vcard;
                },
                filterTarget: function(card, player, target) {
                    const key = {
                        1: distance === false && includecard === false,
                        2: distance === true && includecard === false,
                        3: distance === false && includecard === true,
                        4: distance === true && includecard === true,
                    }
                    if (key[1]) {
                        return lib.filter.targetEnabled(Vcard, player, target);
                    } else if (key[2]) {
                        return lib.filter.targetEnabled(Vcard, player, target) && lib.filter.targetInRange(Vcard, player, target);
                    } else if (key[3]) {
                        return lib.filter.targetEnabledx(Vcard, player, target);
                    } else if (key[4]) {
                        return lib.filter.targetEnabledx(Vcard, player, target) && lib.filter.targetInRange(Vcard, player, target);
                    }
                },
                selectTarget: 1,
                precontent: async function () {
                    if (includecard === false) {//不计入次数限制
                        const evt = _status.event;
                        evt.getParent().addCount = false;
                    }
                    player.update();
                },
                log: false,
                "_priority": -25,
            };
            const cardname = (get.translation(Vcard.nature) || "") + get.translation(Vcard.name);
            let prompt = "请将";
            if (get.itemtype(showcard) === 'card' && typeof showcard === 'Object') {
                prompt += get.translation(showcard) + "当作" + cardname + "使用或打出。";
            }
            if (Array.isArray(showcard)) {
                const fanyi = showcard.map(card => get.translation(card)).join('、');
                prompt += fanyi + "当作" + cardname + "使用或打出。";
            }
            const next = player.chooseToUse(forced? true : false);
            next.set("prompt", prompt);
            next.set('norestore', true);
            next.set('_backupevent', 'ThunderAndFire_backup');
            next.set('addCount', includecard? true : false);
            next.set('custom', {
                add: {},
                replace: {},
            });
            next.backup('ThunderAndFire_backup');
        },
        /**
         * 获取敌方角色，并按手牌数、装备区卡牌数和体力值，按照升序排序。
         * @returns {Array} 返回一个经过排序的玩家数组，排序规则如下：
         *   1. 手牌数量升序（少 -> 多）；
         *   2. 装备区卡牌数量升序（少 -> 多）；
         *   3. 体力值升序（低 -> 高）。
         */
        getEnemies_sorted: function() {
            const player = this;
            const enemies = game.filterPlayer(o => {
                return o.isAlive() && get.attitude(player, o) < 2 && o !== player;
            });
            return enemies.sort((a, b) => {
                const a_hs = a.getCards('hs').length, b_hs = b.getCards('hs').length;
                const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                if (a_hs !== b_hs) return a_hs - b_hs;
                if (a_es !== b_es) return a_es - b_es;
                return a.hp - b.hp;
            });
        },
        /**
         * 获取友方角色，并按手牌数、装备区卡牌数和体力值，按照升序排序。
         * @param {boolean} [ofplayer=true] - 是否包含自己作为友好玩家：
         *   - `true`: 包含自己在内的所有态度值 ≥ 2 的存活玩家；
         *   - `false`: 仅包含非自己的态度值 ≥ 2 的存活玩家。
         * @returns {Array} 返回一个经过排序的玩家数组，排序规则如下：
         *   1. 手牌数量升序（少 -> 多）；
         *   2. 装备区卡牌数量升序（少 -> 多）；
         *   3. 体力值升序（低 -> 高）。
         */
        getFriends_sorted: function(ofplayer = true) {
            const player = this;
            const friends = game.filterPlayer(o => {
                if(ofplayer) return o.isAlive() && get.attitude(player, o) >= 2;
                return o.isAlive() && get.attitude(player, o) >=2 && o !== player;
            });
            return friends.sort((a, b) => {
                const a_hs = a.getCards('hs').length, b_hs = b.getCards('hs').length;
                const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
                if (a_hs !== b_hs) return a_hs - b_hs;
                if (a_es !== b_es) return a_es - b_es;
                return a.hp - b.hp;
            });
        },
        /**
         * 触发技能时的聊天提示、播放音效和记录日志功能。
         *
         * @param {string} skill - 技能名称，必须存在于 `lib.skill` 或技能信息中。
         * @param {Array<string>} [chatlists] - 可选参数，包含触发技能时随机显示的聊天语句数组。
         * @param {Player|Array<Player>} [targets] - 可选参数，表示技能作用的目标玩家或玩家数组。
         * @param {string|boolean} [nature=false] - 可选参数，表示技能连线的颜色。若为 `false` 则不画线。
         * 
         * @returns {void} 无返回值。
         *
         * 此函数会：
         * 1. 检查技能是否存在；
         * 2. 若提供了 `chatlists`，则从中随机选择一条消息通过 `player.chat()` 发送；
         * 3. 根据当前皮肤播放对应的技能音效；
         * 4. 如果有目标，则绘制技能连线并记录日志；
         * 5. 记录技能使用事件到游戏日志和玩家技能历史；
         * 6. 如果没有提供 `chatlists`，则直接调用默认的日志记录方法 `同步本体的logskill和useskill事件。`。
         */
        chatSkill : function(skill, chatlists, targets, nature) {
            const info1 = lib.skill[skill];
            const info2 = get.info(skill,false);
            if (!info1 || !info2) return;
            const player = this;
            if (get.itemtype(targets) == "player") {
                targets = [targets];
            }
            if (chatlists && Array.isArray(chatlists) && chatlists.length) {
                const skinsID = player.checkSkins();
                const num = Math.floor(Math.random() * chatlists.length);
                player.chat(chatlists[num]);
                player.popup(get.skillTranslation(skill, player));
                const skinPath = skinsID !== player.name 
                    ? '银竹离火/image/ThunderAndFireSkins/audio/' + player.name + '/' + skinsID 
                    : '银竹离火/audio/skill';

                game.playAudio('..', 'extension', skinPath, skill + (num + 1));
                let str;
                if (Array.isArray(targets) && targets.length) {
                    str = targets.map(target => 
                        target === player ? "#b自己" : get.translation(target)
                    ).join('、');
                    if (nature !== false) {
                        player.line(targets, nature || "green");
                    }
                    game.log(player, "对", str, "发动了", "【" + get.skillTranslation(skill, player) + "】");
                } else {
                    game.log(player, "发动了", "【" + get.skillTranslation(skill, player) + "】");
                }
                let players = player.getSkills(false, false, false);
                let equips = player.getSkills("e");
                let global = lib.skill.global.slice(0);
                let logInfo = {
                    skill: skill,
                    targets: targets,
                    event: _status.event,
                };
                if (info1.sourceSkill) {
                    logInfo.sourceSkill = info1.sourceSkill;
                    if (global.includes(info1.sourceSkill)) {
                        logInfo.type = "global";
                    } else if (players.includes(info1.sourceSkill)) {
                        logInfo.type = "player";
                    } else if (equips.includes(info1.sourceSkill)) {
                        logInfo.type = "equip";
                    }
                } else {
                    if (global.includes(skill)) {
                        logInfo.sourceSkill = skill;
                        logInfo.type = "global";
                    } else if (players.includes(skill)) {
                        logInfo.sourceSkill = skill;
                        logInfo.type = "player";
                    } else if (equips.includes(skill)) {
                        logInfo.sourceSkill = skill;
                        logInfo.type = "equip";
                    } else {
                        let bool = false;
                        for (let i of players) {
                            let expand = [i];
                            game.expandSkills(expand);
                            if (expand.includes(skill)) {
                                bool = true;
                                logInfo.sourceSkill = i;
                                logInfo.type = "player";
                                break;
                            }
                        }
                        if (!bool) {
                            for (let i of players) {
                                let expand = [i];
                                game.expandSkills(expand);
                                if (expand.includes(skill)) {
                                    logInfo.sourceSkill = i;
                                    logInfo.type = "equip";
                                    break;
                                }
                            }
                        }
                    }
                }
                let next = game.createEvent("logSkill", false), evt = _status.event;
                next.player = player;
                next.forceDie = true;
                next.includeOut = true;
                evt.next.remove(next);
                if (evt.logSkill) {
                    evt = evt.getParent();
                }
                for (const i in logInfo) {
                    if (i == "event") {
                        next.log_event = logInfo[i];
                    } else {
                        next[i] = logInfo[i];
                    }
                }
                evt.after.push(next);
                next.setContent("emptyEvent");
                player.getHistory("useSkill").push(logInfo);
                const next2 = game.createEvent("logSkillBegin", false);
                next2.player = player;
                next2.forceDie = true;
                next2.includeOut = true;
                for (const i in logInfo) {
                    if (i == "event") {
                        next2.log_event = logInfo[i];
                    } else {
                        next2[i] = logInfo[i];
                    }
                }
                next2.setContent("emptyEvent");
            } else {
                player.logSkill(skill, targets, nature);
            }
        },
    }
    const gainCardsfunc =  gainCards;
    Object.entries(SetPlayerFunc).forEach(([name, func]) => {
        const setplayer = lib.element.Player.prototype;
        if (!setplayer[name]) {
            setplayer[name] = func;
        }
    });
    Object.entries(gainCardsfunc).forEach(([name, func]) => {
        const setplayer = lib.element.Player.prototype;
        if (!setplayer[name]) {
            setplayer[name] = func;
        }
    });

    lib.element.GameEvent.prototype._银竹离火 = [];

/*
const originalAddTempSkill = lib.element.player.addTempSkill;
const originalAddSkill = lib.element.player.addSkill;

// 代理 addTempSkill
lib.element.player.addTempSkill = new Proxy(originalAddTempSkill, {
    apply(target, thisArg, argumentsList) {
        console.log(`[addTempSkill 被调用]`, {
            this: thisArg,
            args: argumentsList,
            timestamp: new Date()
        });
        const result = Reflect.apply(target, thisArg, argumentsList);
        console.log(`[addTempSkill 被调用结果]`, {
            result,
            timestamp: new Date()
        });
        return result;
    }
});

lib.element.player.addSkill = new Proxy(originalAddSkill, {
    apply(target, thisArg, argumentsList) {
        console.log(`[addSkill 被调用]`, {
            this: thisArg,
            args: argumentsList,
            timestamp: new Date()
        });
        const skilllist = ['skill1', 'skill2', 'skill3'];
        if(thisArg) {
            if (typeof thisArg === 'object' && thisArg.name && thisArg.name === 'ice_nanhualaoxian') {
                if(argumentsList) {
                    if (typeof argumentsList === 'string') {
                        if (!skilllist.includes(argumentsList)) {
                            console.log(`检测到新增技能: ${argumentsList}，不在原始技能列表中`);
                        }
                    } else if (Array.isArray(argumentsList)) {
                        const notInList = argumentsList.filter(skill => !skilllist.includes(skill));
                        if (notInList.length > 0) {
                            console.log(`检测到以下技能不在原始列表中: ${notInList.join(', ')}`);
                        }
                    }
                }
            }
        }
        const result = Reflect.apply(target, thisArg, argumentsList);
        console.log(`[addSkill 被调用结果]`, {
            result,
            timestamp: new Date()
        });
        return result;
    }
});
*/
/*
// 原始的 get.effect 函数
const originallogSkill = lib.element.player.logSkill;

// 用 Proxy 包裹原始函数以进行调用监听
lib.element.player.logSkill = new Proxy(originallogSkill, {
    
    apply(target, thisArg, argumentsList) {
        debugger;
        console.log(`[logSkill 被调用]`, {
            this: thisArg,
            args: argumentsList,
            timestamp: new Date()
        });

        // 执行原始函数
        const result = Reflect.apply(target, thisArg, argumentsList);

        console.log(`[logSkill 调用结果]`, {
            result,
            timestamp: new Date()
        });

        return result;
    }
});
*/
}
