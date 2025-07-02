import { lib, game, ui, get, ai, _status } from '../../../../noname.js'

game.compareValue = function(player,string) {
    let value = 0;
    let card = { name: string, nature: '', isCard: true };
    const info = get.info(card,false);
    if (info) {
        const type = info.type;
        if (!type && typeof type !== "string") return value;
        const fanyi = lib.translate[string];
        const fanyi_info = lib.translate[string + "_info"];
        if (!fanyi || !fanyi_info) return value;
        const Vvalue = get.value(card,player);
        if (Vvalue && typeof Vvalue === "number") {
            value = Vvalue;
        }
    }
    return value;
};
game.compareOrder = function(player,string) {
    let order = 0;
    let card = { name: string, nature: '', isCard: true };
    const info = get.info(card,false);
    if (info) {
        const type = info.type;
        if (!type && typeof type !== "string") return order;
        const fanyi = lib.translate[string];
        const fanyi_info = lib.translate[string + "_info"];
        if (!fanyi || !fanyi_info) return order;
        const Oorder = get.order(card,player);
        if (Oorder && typeof Oorder === "number") {
            order = Oorder;
        }
    }
    return order;
};
game.compareUseful = function(player,string) {
    let useful = 0;
    let card = { name: string, nature: '', isCard: true };
    const info = get.info(card,false);
    if (info) {
        const type = info.type;
        if (!type && typeof type !== "string") return useful;
        const fanyi = lib.translate[string];
        const fanyi_info = lib.translate[string + "_info"];
        if (!fanyi || !fanyi_info) return useful;
        const Uuseful = get.useful(card,player);
        if (Uuseful && typeof Uuseful === "number") {
            useful = Uuseful;
        }
    }
    return useful;
};
/**
 * 本武将包势力转换技设定：游戏开始时，切换至开局设定势力，摸一张牌。
 * 开始死亡时，切换至初始设定势力。
 */
game.changeGroupSkill = async function(player, skill) {
    const changeGroup = lib.skill[skill].changeGroup;
    if (!changeGroup || !Array.isArray(changeGroup) || changeGroup.length < 2) return;
    const first = changeGroup[0];
    if (game.phaseNumber == 0) {
        if (!lib.skill[skill + '_change']) lib.skill[skill + '_change'] = {};
        lib.skill[skill + '_change'] = {
            trigger: {
                player:["enterGame"],
                global:["phaseBefore"],
            },
            firstDo: true,
            superCharlotte: true,
            charlotte: true,
            silent: true,
            priority: Infinity,
            direct: true,
            init: function (player, skill) {
    
            },
            filter:function (event, player) {
                if (!player.hasSkill(skill)) return;
                return (event.name !== 'phase' || game.phaseNumber === 0);
            },
            async content(event, trigger, player) {
                player.logSkill(skill);
                player.changeGroup(first);
                await player.draw();
                player.update();
                player.removeSkill(event.name);
            },
        };
        player.addSkill(skill + '_change');
    } else {
        player.logSkill(skill);
        player.changeGroup(first);
        await player.draw();
    }
    if (!lib.skill[skill + '_die']) lib.skill[skill + '_die'] = {};
    lib.skill[skill + '_die'] = {
        trigger: {
            player:["dieBefore"],
        },
        firstDo: true,
        superCharlotte: true,
        charlotte: true,
        silent: true,
        priority: Infinity,
        forceDie: true,
        direct: true,
        async content(event, trigger, player) {
            player.logSkill(skill);
            player.chat('尘归尘，土归土，人归人，天归天。');
            player.changeGroup(first);
        },
    };
    player.addSkill(skill + '_die');
    player.update();
};
export const ThunderAndFire = {
    name: "银竹离火func",
    version: "13.14.7",
    update: "2025.05.25",
    /**
     * 对输入的字符串进行关键词和符号的高亮处理。
     * 
     * @param {string} string - 需要处理的原始字符串。
     * @returns {string} - 经过高亮处理后的字符串。
     * 
     */
    setColor : function(string) {
        const infos1 = [//红色
            /每轮游戏限一次完整转换/g,
            /每回合限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每回合每项限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮每项限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮每名其他角色限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮每名角色限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每回合每名其他角色限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每回合每名角色限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮游戏限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮游戏每项限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮游戏每名其他角色限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮游戏每名角色限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮游戏每名角色每项限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /每轮游戏每名角色此项限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /出牌阶段限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /出牌阶段每项限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /则新的一轮开始前/g,
            /每名其他角色限一次/g,
            /延时类锦囊牌/g,
            /Min/g,
            /Max/g,
            /野心值/g,
            /琴音/g,
            /书笔/g,
            /羁绊技·与君丨规则技/g,
            /御雷/g,
            /朱雀/g,
            /白虎/g,
        ];
        const infos2 = [//蓝色
            /护驾·飞影/g,
            /结营·的卢/g,
            /权术·玉龙/g,
            /结义/g,
            /权道/g,
            /整局游戏不重复/g,
            /四象技/g,
            /十胜十败/g,
            /玄武/g,
            /青龙偃月刀/g,
            /青龙/g,
            //曹操
            /若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至四翻面横置并受到一点⚡伤害，然后本技能失效至该回合结束。/g,
            //曹丕
            /整体四项为循环列表，每被选择一项移除一项；且目标角色在其下个回合结束前无法选择已选项/g,
            //钟会
            /若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点无来源的⚡伤害，然后本技能失效至该回合结束。/g,
            /当获取标记数等于三时，选择一名其他角色与其均横置并弃置一张牌，然后本技能失效至该回合结束。/g,
            //姜维
            /若该回合当前本技能使用次数大于其已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点无来源的🔥伤害，然后本技能失效至该回合结束。/g,
            //司马懿
            /若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点随机属性伤害「⚡丨🔥丨❄️」，然后本技能失效至该回合结束。/g,
            //关银屏
            //鲍三娘
            /若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至体力值上限数且暂时横置无法解除，然后本技能失效至该回合结束。/g,
            //张星彩
            //孙寒华
            /*
            /复原反向执行/g,
            /若此牌的目标数为一且目标未横置则横置此牌目标/g,
            /若有此花色手牌则随机重铸至多未记录花色数张牌/g,
            */
            //其他
            /离间·贪/g,
            /离间·嗔/g,
            /离间·痴/g,
            /离间·戾/g,
            /离间·疑/g,
            /棋势/g,
            /画意/g,
            /力烽/g,
            /地机/g,
            /中枢/g,
            /气海/g,
            /天冲/g,
        ];
        infos1.forEach(limitRegex => {
            string = string.replace(limitRegex, (match, number) => {
                return `<font color= #FF2400><b>${match}</b></font>`;
            });
        });
        infos2.forEach(limitRegex => {
            string = string.replace(limitRegex, (match, number) => {
                return `<font color= #0088CC><b>${match}</b></font>`;
            });
        });
        const skillsTypes = ["势力转换技","非锁定技","锁定技","主公技","限定技","觉醒技","转换技","隐匿技","宗族技","势力技","使命技","蓄力技","阵法技","主将技","副将技","君主技","蓄能技","Charlotte","昂扬技","持恒技","连招技","威主技","战场技","衍生技","羁绊技"];
        const blackSymbols = ["♠", "♣"];
        const redSymbols = ["♥", "♦"];
        const letters = ["X", "Y", "Z"];
        skillsTypes.forEach(keyword => {
            string = string.replace(new RegExp(keyword, 'g'), `<font color= #FF2400><b>${keyword}</b></font>`);
        });
        blackSymbols.forEach(symbol => {
            string = string.replace(new RegExp(symbol, 'g'), `<font color= #0088CC><b>${symbol}</b></font>`);
        });
        redSymbols.forEach(symbol => {
            string = string.replace(new RegExp(symbol, 'g'), `<font color= #FF2400><b>${symbol}</b></font>`);
        });
        letters.forEach(symbol => {
            string = string.replace(new RegExp(symbol, 'g'), `<font color= #0088CC><b>${symbol}</b></font>`);
        });
        // 处理 「字符1/字符2」 或 「字符1/字符2/字符3...」 的格式，必须包含固定的「 / 」 用于多触发时机描述
        const slashComboRegex = /「([\u4e00-\u9fa5]+\/[\u4e00-\u9fa5]+(\/[\u4e00-\u9fa5]+)*)」/g;
        string = string.replace(slashComboRegex, (match, content) => {
            const parts = content.split('/');
            const formattedParts = parts.map(part => `<font color= #EE9A00><b>${part}</b></font>`);
            return `「${formattedParts.join('/') }」`;
        });
        // 处理 「字符1丨字符2」 或 「字符1丨字符2丨字符3...」 的格式，适用于任何汉字组合
        const genericComboRegex = /「((?:[\u4e00-\u9fa5]+)(?:丨(?:[\u4e00-\u9fa5]+))*)」/g;
        string = string.replace(genericComboRegex, (match, content) => {
            const parts = content.split('丨');
            const formattedParts = parts.map(part => `<font color= #0088CC><b>${part}</b></font>`);
            return `「${formattedParts.join('丨')}」`;
        });
        // 处理〖字符〗
        const bracketsRegex = /〖([\u4e00-\u9fa5]+)〗/g;
        string = string.replace(bracketsRegex, (match, p1) => {
            return `〖<font color= #0088CC><b>${p1}</b></font>〗`;
        });
        return string;
    },
    /**
     * 
     * @param {*} key  - 默认值为 "targets"，可选值为 "skills"。
     * @param {*} target - 目标对象，默认值为 null。
     * @returns - 参数key 为 "targets" 时，返回场上有失效技能的玩家列表。
     *          - 参数key 为 "skills"，且参数target 有效时，返回参数target的失效技能列表。
     *          - 参数key 为 "buffs"，且参数target 有效时，返回令参数target技能失效的buff列表。
     *          - 参数key 为 "skills"，target无参，返回场上所有失效技能列表。
     *          - 参数key 为 "buffs"，target无参；返回场上所有技能失效的buff列表。
     */
    getDisSkillsTargets : function(key = "targets",target = null) {
        let getDisTargets = {};
        const targets = game.filterPlayer();
        for (let target of targets) {
            const skills = [...new Set([...target.skills, ...target.initedSkills])];
            for (let skill of skills) {
                const init = lib.skill[skill].init;
                const skillBlocker = lib.skill[skill].skillBlocker;
                if (init && skillBlocker) {
                    if (!getDisTargets[target.playerid]) getDisTargets[target.playerid] = [];
                    if (!getDisTargets[target.playerid].includes(skill)) {
                        getDisTargets[target.playerid].push(skill);
                    }
                }
            }
        }
        const targetslist = Object.keys(getDisTargets);
        if (targetslist.length === 0) return [];
        if (key === "targets") {
            return targets.filter(target => targetslist.includes(target.playerid));
        } else if (key === "skills") {
            if (target) {
                const id = target.playerid;
                if(!id || !targetslist.includes(id) || getDisTargets[id].length === 0) return [];
                const skills = [...new Set([...target.skills, ...target.initedSkills])];
                let getdislists = [];
                for(let skill of getDisTargets[id]) {
                    const skillBlocker = lib.skill[skill].skillBlocker;
                    const dislist = skills.filter(s => {
                        return skillBlocker(s, target);
                    });
                    for(let dis of dislist) {
                        if (!getdislists.includes(dis)) {
                            getdislists.push(dis);
                        }
                    }
                }
                return getdislists;
            } else {
                const targets = targets.filter(target => targetslist.includes(target.playerid));
                if (targets.length === 0) return [];
                let getdislists = [];
                for (let target of targets) {
                    const id = target.playerid;
                    const skills = [...new Set([...target.skills, ...target.initedSkills])];
                    for(let skill of getDisTargets[id]) {
                        const skillBlocker = lib.skill[skill].skillBlocker;
                        const dislist = skills.filter(s => {
                            return skillBlocker(s, target);
                        });
                        for(let dis of dislist) {
                            if (!getdislists.includes(dis)) {
                                getdislists.push(dis);
                            }
                        }
                    }
                }
                return getdislists;
            }
        } else if (key === "buffs") {
            if (target) {
                const id = target.playerid;
                if(!id || !targetslist.includes(id) || getDisTargets[id].length === 0) return [];
                return getDisTargets[id];
            } else {
                let getbuffs = [];
                for (let id of targetslist) {
                    if (getDisTargets[id].length > 0) {
                        for (let skill of getDisTargets[id]) {
                            if(!getbuffs.includes(skill)) {
                                getbuffs.push(skill);
                            }
                        }
                    }
                }
                return getbuffs;
            }
        } else {
            return [];
        }
    },
    /**
     * 
     * @param {*} player 
     * @param {*} skill - 技能对象id
     * @param {*} chatlists - 技能台词列表
     */
    chatAudio : function(player,skill,chatlists) {
        if (!Array.isArray(chatlists) || chatlists.length === 0) return;
        const skinsID = player.checkSkins();
        const num = Math.floor(Math.random() * chatlists.length);
        player.chat(chatlists[num]);
        const txt = get.translation(skill);
        player.popup(txt);
        if (skinsID !== player.name) {
            const skinPath = '银竹离火/image/ThunderAndFireSkins/audio/' + player.name + '/' + skinsID;
            game.playAudio('..', 'extension', skinPath, skill + (num + 1));
            game.log(player,'发动了技能', '#g【'+ txt +'】');
            return;
        }
        if (skinsID === player.name) {
            game.playAudio('..', 'extension', '银竹离火/audio/skill', skill + (num + 1));
            game.log(player,'发动了技能', '#g【'+ txt +'】');
            return;
        }
    },
    /**
     * 
     * @param {*} event - 事件
     * @param {*} player - 玩家
     * @param {*} info - 默认播放卡牌语音。'effect'表示后续是否增设效果音效
     * @returns 
     */
    DiycardAudio : function(event, player, info = 'card') {
        const name = event.card.name;
        if (!name) return;
        if(info === 'card') {
            if (player.hasSex("female")) {
                game.playAudio('..', 'extension', '银竹离火/audio/card/diycard/female', name);
            } else {
                game.playAudio('..', 'extension', '银竹离火/audio/card/diycard/male', name);
            }
            return;
        } else if (info === 'effect') {
            //console.log(name2);
            game.playAudio('..', 'extension', '银竹离火/audio/effect', name + '_effect');
        }
    },
    /**
     * 根据触发事件和玩家信息播放卡牌音频。
     *
     * @param {Object} trigger - 触发事件对象，包含卡牌信息。
     * @param {Object} player - 玩家对象，包含玩家名称等信息。
     * @returns {void}
     */
    cardAudio : function(trigger,player) {
        const standardcards = new Set([//军争标准的基本和锦囊
            'sha', 'shan', 'tao', 'jiu',
            'taoyuan', 'wanjian', 'wugu', 'jiedao',
            'juedou', 'nanman', 'huogong', 'wuzhong',
            'shunshou', 'guohe', 'tiesuo', 'wuxie',
            'lebu', 'bingliang', 'shandian',
        ]);
        const playerCards = {//额外配音
            'stars_zhugeliang': new Set([
                ...standardcards,
                'binglinchengxia', 'caomu', 'diaohulishan', 'huoshaolianying',
                'shengdong', 'shuiyanqijun', 'tiaojiyanmei', 'wy_meirenji',
                'yiyi', 'yuanjiao', 'tiaojiyanmei', 'zengbin',
                'zhibi', 'dz_mantianguohai',
            ]),
            'thunder_zhonghui': new Set([
                ...standardcards,
                'chiling', 'diaohulishan', 'gz_guguoanbang', 'gz_haolingtianxia',
                'gz_kefuzhongyuan', 'huoshaolianying', 'lianjunshengyan', 'lulitongxin',
                'shuiyanqijun', 'gz_wenheluanwu', 'yiyi', 'yuanjiao',
                'zhibi'
            ]),
            'thunder_guojia': new Set([
                ...standardcards,
                'diaohulishan', 'lianjunshengyan', 'lulitongxin', 'shuiyanqijun',
                'yuanjiao', 'zhibi', 
            ]),
            'thunder_wenyang': new Set([
                ...standardcards,
            ])
        };
        const card = trigger.card;
        if (!card) return;
        const pn = player.name;
        const cn = get.name(card, player);
        const basePath = ['..', 'extension', '银竹离火/audio/card', pn];
        function playAudio(cards, cn) {
            if (cards.has(cn)) {
                trigger.audio = false;
                if (cn === 'sha') {
                    let audioType = 'sha';
                    if (game.hasNature(card, "fire")) {
                        audioType = 'sha_fire';
                    } else if (game.hasNature(card, "thunder")) {
                        audioType = 'sha_thunder';
                    }
                    try {
                        game.playAudio(...basePath, audioType);
                    } catch (error) {
                        console.error(`Failed to play audio for ${audioType}:`, error);
                    }
                } else {
                    try {
                        game.playAudio(...basePath, cn);
                    } catch (error) {
                        console.error(`Failed to play audio for ${cn}:`, error);
                    }
                }
            }
        }
        if (playerCards[pn]) {
            playAudio(playerCards[pn], cn);
        }
    },
    /**
     * 延迟指定毫秒数后解析的 Promise。
     *
     * @param {number} ms - 延迟的时间（毫秒）。
     * @returns {Promise} - 在指定毫秒数后解析的 Promise。
     */
    delay : function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    /**
     * 根据牌的花色返回对应的数字。
     *
     * @param {Object} card - 牌对象。
     * @param {Object} player - 玩家对象。
     * @returns {number} - 花色对应的数字。
     */
    getCardSuitNum : function(card, player) {
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
    },
    /**
     * 根据牌的名称返回其长度。
     *
     * @param {Object|string} card - 牌对象或牌的名称字符串。
     * @param {Object} player - 玩家对象。
     * @returns {number} - 牌名称的长度。
     */
    getCardNameNum : function(card, player) {
        const actualCardName = lib.actualCardName, name = get.translation(typeof card === "string" ? card : get.name(card, player));
        return (actualCardName.has(name) ? actualCardName.get(name) : name).length;
    },
    /**
     * 玩家将区域内牌数调整至指定数量。
     * @param {*} player - 玩家
     * @param {*} num - 将牌调至的数量。
     * @param {*} from - 默认手牌区，可选值为 'h' 或 'he'。
     */
    changeCardsTo : async function(player, num, from = 'h') {
        if(typeof num !== 'number' || num < 0)  return;
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
     * 计算某个牌或技能对于特定玩家的价值。
     * 常用于AI判断
     *
     * @param {Object} player - 玩家对象。
     * @param {string} string - 牌或技能的名称。
     * @returns {number} - 计算出的牌或技能的价值。
     */
    compareValue: function(player,string) {
        return game.compareValue(player,string);
    },
    /**
     * 计算某个牌或技能对于特定玩家的优先级。
     * 常用于AI判断
     *
     * @param {Object} player - 玩家对象。
     * @param {string} string - 牌或技能的名称。
     * @returns {number} - 计算出的牌或技能的优先级。
     */
    compareOrder: function(player,string) {
        return game.compareOrder(player,string);
    },
    /**
     * 计算某个牌或技能对于特定玩家的有用程度。
     *
     * @param {Object} player - 玩家对象。
     * @param {string} string - 牌或技能的名称。
     * @returns {number} - 计算出的牌或技能的有用程度。
     */
    compareUseful: function(player,string) {
        return game.compareUseful(player,string);
    },
    /**
     * 检查事件中的卡牌是否为转化牌
     */
    checkVcard: function (trigger) {
        const card = trigger.card;
        const cards = trigger.card.cards;
        if(!card) return false;
        if(!card.cardid) return true;
        if(!card.isCard) return true;
        if(cards && cards.length) {
            if(cards.length !== 1) return true;
            if(cards.length === 1) {
                const name = card.name;
                if(name === cards[0].name) return false;
                else return true;
            }
        }
        return false;
    },
    /**
     * 排除本体定义的规则技、固有技、superCharlotte技、卡牌技能等；或未有翻译及定义不可禁用！
     * 主要是看你尊不遵守规则！凸(艹皿艹 )
     * 游戏开始是获取
     */
    checkSkills : async function() {
        let {list_can, list_not} = lib.ThunderAndFire.disSkills;
        const skillslist = lib.skill;
        if (skillslist) {
            const keys = Object.keys(skillslist);
            for (const skill of keys) {
                const skillData = skillslist[skill];
                if (
                    !skillData.ruleSkill && !skillData.fixed && 
                    !skillData.superCharlotte && !skillData.charlotte && 
                    !skillData.type && lib.translate[skill] && lib.translate[skill + "_info"]
                ) {
                    if (!list_can.includes(skill)) {
                        list_can.push(skill);
                    }
                }
                else {
                    if (!list_not.includes(skill)) {
                        list_not.push(skill);
                    }
                }
            }
        }
    },
    /**
     * 将牌置入牌堆顶或底。
     */
    chooseCardsToPile : async function(cards, to = 'top', player = null) {
        if (!cards || !Array.isArray(cards) || cards.length <= 0) return;
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
     * 将牌置入弃牌堆顶或底。
     */
    chooseCardsTodisPile : async function(cards, to = 'top', player = null) {
        if (!cards || !Array.isArray(cards) || cards.length <= 0) return;
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
     * 
     */
    setTimelist : async function(list = null) {
        let {setTimes} = lib.ThunderAndFire.Times;
        async function Setlist(list) {
            if (Array.isArray(list) && list.every(item => typeof item === "string")) {
                const phases = ["Before", "Begin", "End", "After"];
                const result = [];
                for (const item of list) {
                    for (const phase of phases) {
                        if (!result.includes(`${item}${phase}`)) {
                            result.push(`${item}${phase}`);
                        }
                    }
                }
                return result;
            }
            return [];
        };
        if (list && Array.isArray(list) && list.length > 0) {
            return await Setlist(list);
        } else if (!list) {
            let checktimeslist = [];
            const checklist = await Setlist(setTimes);
            if (checklist.length > 0) {
                checktimeslist = checklist;
            }
            lib.ThunderAndFire.Times.checkTimes = [...setTimes,...checktimeslist];
            return lib.ThunderAndFire.Times.checkTimes;
        }
        return [];
    },
    /**
     * 获取可以改判的卡牌列表，若有则返回一个带有卡牌的数组。若无返回空数组
     * @param {*} judges - 判定区卡牌-可以是单个卡牌，或者[]
     * @param {*} cards - 处理区观星类的卡牌
     * @param {*} player - 谁处理
     * @param {*} result - 默认返回处理让判定牌失效，布尔值为true则判定牌不失效，false则判定牌失效
     * @returns - 返回可以处理的改判牌的数组。
     */
    setjudgesResult : function(judges, cards, player, result = false) {
        if (!Array.isArray(judges) && typeof judges === "object") {
            // 单张判定牌逻辑
            let judgeGoods = [];
            let judgeBads = [];
            const cardInfo = judges.viewAs ? lib.card[judges.viewAs] : get.info(judges);
            if (cardInfo?.judge) {
                const judge = cardInfo.judge;
                for (let card of cards) {
                    const judgeResult = judge(card);
                    if (judgeResult > 0 && !judgeGoods.includes(card)) judgeGoods.push(card);
                    if (judgeResult <= 0 && !judgeBads.includes(card)) judgeBads.push(card);
                }
            }
            if (result === false) {
                if (judgeGoods.length === 0) return [];
                const sorted = judgeGoods.sort((a, b) => get.value(a, player) - get.value(b, player));
                return [sorted[0]];
            } else if (result === true) {
                if (judgeBads.length === 0) return [];
                const sorted = judgeBads.sort((a, b) => get.value(a, player) - get.value(b, player));
                return [sorted[0]];
            }
            return [];
        } else if (Array.isArray(judges)) {
            let getResult = {};
            for (let i = 0; i < judges.length; i++) { 
                if (!getResult[i]) {
                    getResult[i] = {judgeGoods: [], judgeBads: []};
                }
                const cardInfo = judges[i].viewAs ? lib.card[judges[i].viewAs] : get.info(judges[i]);
                if (cardInfo && cardInfo.judge ? cardInfo.judge : () => 0) {
                    const judge = cardInfo.judge;//获取该卡牌的判定函数
                    for (let card of cards) {
                        const judgeResult = judge(card);
                        if (judgeResult > 0 && !getResult[i].judgeGoods.includes(card)) {
                            getResult[i].judgeGoods.push(card);//从现有实体卡牌中找出判断结果大于0的所有实体卡牌
                        }
                        if (judgeResult <= 0 && !getResult[i].judgeBads.includes(card)) {
                            getResult[i].judgeBads.push(card);//从现有实体卡牌中找出判断结果小于等于0的所有实体卡牌
                        }
                    }
                }
            }
            const keys = Object.keys(getResult);
            if(result === false) {//令判定牌无效
                let stopped = false;
                for(let key of keys) {
                    if(getResult[key].judgeBads.length == 0) {
                        stopped = false;
                    } else if(getResult[key].judgeGoods.length > 0) {
                        stopped = true;
                        break;
                    }
                }
                //console.log(stopped);
                if(!stopped) return [];//cards中没有一张可以令判定牌无效的改判卡牌。
                let used = [];
                let result = [];
                for(let key of keys) {
                    const cards = getResult[key].judgeGoods.filter(card => !used.includes(card)).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if(cards.length === 0) {
                        result.push(null);
                    } else {
                        used.push(cards[0]);
                        result.push(cards[0]);
                    }
                }

                if (result.includes(null)) {
                    const otherCards = cards.filter(card => !result.includes(card)).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (otherCards.length > 0) {
                        let cardIndex = 0;
                        for (let i = 0; i < result.length; i++) {
                            if (result[i] === null && cardIndex < otherCards.length) {
                                result[i] = otherCards[cardIndex];
                                cardIndex++;
                            }
                        }
                    } else {
                        return [];
                    }
                }
                //return result.reverse();
                return result;
            } else if (result === true) { //令判定牌有效
                let stopped = false;
                for(let key of keys) {
                    if(getResult[key].judgeBads.length == 0) {
                        stopped = false;
                    } else if(getResult[key].judgeBads.length > 0) {
                        stopped = true;
                        break;
                    }
                }
                //console.log(stopped);
                if(!stopped) return [];//cards中没有一张可以令判定牌生效的改判卡牌。
                let used = [];
                let result = [];
                for(let key of keys) {
                    const cards = getResult[key].judgeBads.filter(card => !used.includes(card)).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if(cards.length === 0) {
                        result.push(null);
                    } else {
                        used.push(cards[0]);
                        result.push(cards[0]);
                    }
                }

                if (result.includes(null)) {
                    const otherCards = cards.filter(card => !result.includes(card)).sort((a, b) => get.value(a, player) - get.value(b, player));
                    if (otherCards.length > 0) {
                        let cardIndex = 0;
                        for (let i = 0; i < result.length; i++) {
                            if (result[i] === null && cardIndex < otherCards.length) {
                                result[i] = otherCards[cardIndex];
                                cardIndex++;
                            }
                        }
                    } else {
                        return [];
                    }
                }
                //return result.reverse();
                return result;
            }
        } else {
            return [];
        }
    },
};
export const setAI = {
    name: "银竹离火func",
    version: "13.14.7",
    update: "2025.05.25",
    /**
     * 统计全场卡牌的数量，包括基本卡牌、锦囊卡牌和装备卡牌。
     */
    getTypesCardsSum : function() {
        const basicCardsum = new Set();
        const trickCardsum = new Set();
        const equipCardsum = new Set();
        const piles = ["cardPile", "discardPile"];
        for (let pile of piles) {
            const cards = ui[pile].childNodes;
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const cardType = get.type(card);
                
                if (cardType === "basic") {
                    basicCardsum.add(card);
                } else if (cardType === "trick" || cardType === "delay") {
                    trickCardsum.add(card);
                } else if (cardType === "equip") {
                    equipCardsum.add(card);
                }
            }
        }
        game.findPlayer(function (current) {
            const hejCards = current.getCards("hej");
            for (let i = 0; i < hejCards.length; i++) {
                const card = hejCards[i];
                const cardType = get.type(card);
                
                if (cardType === "basic") {
                    basicCardsum.add(card);
                } else if (cardType === "trick" || cardType === "delay") {
                    trickCardsum.add(card);
                } else if (cardType === "equip") {
                    equipCardsum.add(card);
                }
            }
        });
        return {
            basic: basicCardsum.size, // 基本卡牌总数量
            trick: trickCardsum.size,   // 锦囊卡牌总数量
            equip: equipCardsum.size,    // 装备卡牌总数量
        };
    },
    /**
     * 站在玩家自身角度，已知卡牌的数量，包括弃牌、场上牌（ej），以及玩家手牌（hs）。
     */
    getTypesCardsSum_byme : function(player) {
        const basicCardsum = new Set();
        const trickCardsum = new Set();
        const equipCardsum = new Set();
        const piles = ["discardPile"];
        for (let pile of piles) {
            const cards = ui[pile].childNodes;
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const cardType = get.type(card);
                
                if (cardType === "basic") {
                    basicCardsum.add(card);
                } else if (cardType === "trick" || cardType === "delay") {
                    trickCardsum.add(card);
                } else if (cardType === "equip") {
                    equipCardsum.add(card);
                }
            }
        }
        game.findPlayer(function (current) {
            const ejCards = current.getCards("ej");
            for (let i = 0; i < ejCards.length; i++) {
                const card = ejCards[i];
                const cardType = get.type(card);
                
                if (cardType === "basic") {
                    basicCardsum.add(card);
                } else if (cardType === "trick" || cardType === "delay") {
                    trickCardsum.add(card);
                } else if (cardType === "equip") {
                    equipCardsum.add(card);
                }
            }
        });
        const hsCards = player.getCards("hs");
        for (let i = 0; i < hsCards.length; i++) {
            const card = hsCards[i];
            const cardType = get.type(card);
            
            if (cardType === "basic") {
                basicCardsum.add(card);
            } else if (cardType === "trick" || cardType === "delay") {
                trickCardsum.add(card);
            } else if (cardType === "equip") {
                equipCardsum.add(card);
            }
        }
        return {
            basic: basicCardsum.size,
            trick: trickCardsum.size,
            equip: equipCardsum.size,
        };
    },
    /**
     * 获取玩家：是否有杀且可以使用或继续接着使用杀，且场上存在可以对其使用且为正收益的目标；
     * 其中包含了玩家是否装备诸葛连弩，或有诸葛连弩且可以对自己使用
     */
    getShaValue : function(player, distance = null) {
        let Vcard = { name: "sha", nature: "", isCard: true };
        const shaCard = player.getCards("hes").filter(card => get.name(card, player) === "sha");
        if (!shaCard || shaCard.length === 0) return false;//没有杀

        function canuseSha () {//判断使用杀是否有正收益的目标
            if (distance === false) {
                return player.hasUseTarget(Vcard, false) && player.hasValueTarget(Vcard, false) && player.getUseValue(Vcard, false) > 0;
            } else {
                return player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0;
            }
        }
        if (!canuseSha()) return false;
        
        function hasZhugeCard () {//判断是否装备诸葛连弩，或有诸葛连弩且可以对自己使用
            const equipcard = player.getEquip(1);
            if (equipcard) {
                return get.name(equipcard) == "zhuge";
            } else {
                const zhugeCards = player.getCards("hes").filter(card => get.name(card, player) === "zhuge");
                for (let zhugeCard of zhugeCards) {
                    if (player.canUse(zhugeCard, player)) return true;
                }
                return false;
            }
        }
        let usable = player.getCardUsable(Vcard);
        return usable > 0 || hasZhugeCard ();
    },
    /**
     * 判断玩家是否有伤害标签锦囊牌，且这些牌中(是否存在有正收益的目标)的牌
     */
    getDamageTrickValue : function(player) {
        const damageCard = player.getCards("hes").filter(card => get.type2(card, player) == "trick" && get.tag(card, "damage") > 0);
        if (!damageCard || damageCard.length === 0) return false;
        for (let card of damageCard) {
            if (player.hasUseTarget(card) && player.hasValueTarget(card) && player.getUseValue(card) > 0) {
                return true;
            }
        }
        return false;
    },
    /**
     * 判断玩家是否有锦囊牌，且这些牌中(是否存在有正收益的目标)的牌
     */
    getTrickValue : function(player) {
        const trickCard = player.getCards("hes").filter(card => get.type2(card, player) == "trick");
        if (!trickCard || trickCard.length === 0) return false;
        for (let card of trickCard) {
            if (player.hasUseTarget(card) && player.hasValueTarget(card) && player.getUseValue(card) > 0) {
                return true;
            }
        }
        return false;
    },
    /**
     * 判断玩家自身受到一定数值伤害后是否可以生存（仅限自己的牌救自己）
     * @param {*} player - 玩家
     * @param {*} damagenum - 伤害值
     * @returns  - 返回的数值＞0，表示可以存活
     */
    getAliveNum : function(player, damagenum) {
        const selfSaves = player.getCards('he').filter(card => player.canSaveCard(card, player));
        return player.hp + selfSaves.length - damagenum;
    },
    /**
     * 获取友方角色，并按手牌数、装备区卡牌数和体力值，按照升序排序。
     * @param {Object} player - 当前参考玩家对象。
     * @param {boolean} [ofplayer=true] - 是否包含自己作为友好玩家：
     *   - `true`: 包含自己在内的所有态度值 ≥ 2 的存活玩家；
     *   - `false`: 仅包含非自己的态度值 ≥ 2 的存活玩家。
     * @returns {Array} 返回一个经过排序的玩家数组，排序规则如下：
     *   1. 手牌数量升序（少 -> 多）；
     *   2. 装备区卡牌数量升序（少 -> 多）；
     *   3. 体力值升序（低 -> 高）。
     */
    getFriends : function(player, ofplayer = true) {
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
     * 获取敌方角色，并按手牌数、装备区卡牌数和体力值，按照升序排序。
     * @param {Object} player - 当前参考玩家对象。
     * @returns {Array} 返回一个经过排序的玩家数组，排序规则如下：
     *   1. 手牌数量升序（少 -> 多）；
     *   2. 装备区卡牌数量升序（少 -> 多）；
     *   3. 体力值升序（低 -> 高）。
     */
    getEnemies : function(player) {
        const enemies = game.filterPlayer(o => {
            return o.isAlive() && get.attitude(player, o) < 2;
        });
        return enemies.sort((a, b) => {
            const a_hs = a.getCards('hs').length, b_hs = b.getCards('hs').length;
            const a_es = a.getCards('e').length, b_es = b.getCards('e').length;
            if (a_hs !== b_hs) return a_hs - b_hs;
            if (a_es !== b_es) return a_es - b_es;
            return a.hp - b.hp;
        });
    },
    wei:{
        /**
         * 是否触发雄奕的AI，返回的收益值
         */
        sunxiongyiAI : function(player) {
            let numdrawA = 0;
            const keys = ['wei','shu','wu'];
            for (const key of keys) {
                if (player['sunpingling_' + key]) numdrawA ++;
            }
            let numdrawB = 0;
            for (let target of game.players.sortBySeat()) {
                if(target.countGainableCards(player, "hej") > 0){
                    /**
                     * 提前计算，参与技能收益的判断
                     */
                    numdrawB ++;
                }
            }
            const disnum = Math.floor((numdrawB + numdrawA) / 2);
            /**
             * 翻面+横置+随机属性伤的debuff计算
             */
            let debuff = 0;
            const skilluse = player.countMark('sunxiongyi') + 1 - player.getDamagedHp();
            const liveKey = setAI.getAliveNum(player, 1);
            if (skilluse > 0) {
                if (liveKey > 0) {
                    if (player.isTurnedOver()) { 
                        debuff = 2 - 0.5 - 1;
                    } else{
                        debuff = - Infinity;
                    }
                } else { 
                    debuff = 1;
                }
            }
            const skillKey = player.storage.sunpingling;
            if (!skillKey) {
                return 1.5;
            } else {
                return Math.max(numdrawA + numdrawB - disnum + debuff, -2);
            }
        },
        //伤势选牌AI
        sunshangshiAI : function(player, card) {
            const key = setAI.getShaValue(player);
            const Phase = _status.currentPhase === player;
            const cards = player.getCards('he');
            if (!cards || cards.length === 0) return false;
            if (Phase && key) {
                if (get.name(card) === "zhuge") return false;
                else return true;
            }
            return true;
        },
        /**
         * 曹操 曹婴 归心是否触发AI，返回的收益值
         */
        thunderguixinAI : function(player) {
            let count = 0;
            const choosetargets = game.filterPlayer(function (current) {
                return current.isAlive() && current.getCards('hej').length > 0 && current.countGainableCards(player, "hej") > 0;
            });
            if (choosetargets && choosetargets.length > 0) {
                const disnum = Math.floor(choosetargets.length / 2);
                if (disnum > 0) {
                    count = choosetargets.length - disnum;
                }
            }
            /**
             * 翻面+横置+随机属性伤的debuff计算
             */
            let debuff = 0;
            const hasSkill_1 = player.hasSkill('thunderguixin');
            const skilluse_1 = player.countMark('thunderguixin') + 1 - player.getDamagedHp();
            const hasSkill_2 = player.hasSkill('icelingren_guixin');
            const skilluse_2 = player.countMark('icelingren_guixin') + 1 - player.getDamagedHp();
            const liveKey = setAI.getAliveNum(player, 1);
            if (hasSkill_1 && skilluse_1 > 0) {
                if (liveKey > 0) {
                    if (player.isTurnedOver()) { 
                        debuff = 2 - 0.5 - 1;
                    } else{
                        debuff = - Infinity;
                    }
                } else { 
                    debuff = 1;
                }
            } else if (hasSkill_2 && skilluse_2 > 0) {
                if (liveKey > 0) {
                    if (player.isTurnedOver()) { 
                        debuff = 2 - 0.5 - 1;
                    } else{
                        debuff = - Infinity;
                    }
                } else { 
                    debuff = 1;
                }
            }
            return Math.max(count + debuff, -2);
        },
        /**
         * 十胜十败选人AI 和 "resultAI"
         */
        tenwintenloseAI : function(player , choices = "targetAI") {
            const rejudge = {//检索场上可改判的敌我双方
                friends: game.players.filter(o => o.isAlive() && o !== player && get.attitude(o, player) > 0 && o.hasSkillTag('rejudge', false, player)),
                enemys: game.players.filter(o => o.isAlive() && o !== player && get.attitude(o, player) <= 0 && o.hasSkillTag('rejudge', false, player))
            };
            const guojia = {//检索场上敌我方郭嘉数量
                friends: game.players.filter(o => o.isAlive() && o !== player && get.attitude(o, player) >= 2 && lib.translate[o.name].includes("郭嘉")),
                enemys:  game.players.filter(o => o.isAlive() && o !== player && get.attitude(o, player) < 2 && lib.translate[o.name].includes("郭嘉")),
            };
            const targetRegions = {
                hs: 'h',//可摸牌
                es: 'e',//可回复
                js: 'j',//可造成伤害
                hes: 'he',//可摸牌+可回复
                hjs: 'hj',//可摸牌+可造成伤害
                ejs: 'ej',//可回复+可造成伤害
                hejs: 'hej'//可摸牌+可回复+可造成伤害
            };
            const target = {};
            Object.entries(targetRegions).forEach(([key, region]) => {
                target[key] = game.players.filter(o =>
                    o.isAlive() &&
                    o !== player &&
                    !lib.translate[o.name].includes("郭嘉") &&
                    player.getCards(region).length > o.getCards(region).length &&
                    (key === 'js' || key === 'hjs' || key === 'ejs' || key === 'hejs' ? get.attitude(o, player) < 2 : true)
                );
            });
            const Damaged = player.isDamaged();
            const keynum = Math.max(1, Math.floor(player.maxHp / 3)) + 1;
            if (choices === "targetAI") {//用于判定生效，选择合适目标的AI
                if(target.hejs && target.hejs.length > 0) return target.hejs.sort((a, b) => a.hp - b.hp)[0];
                if(Damaged && player.hp <= keynum){//回复＞伤害＞摸牌
                    if(target.ejs && target.ejs.length > 0) return target.ejs.sort((a, b) => a.hp - b.hp)[0];
                    if(target.hjs && target.hjs.length > 0) return target.hjs.sort((a, b) => a.hp - b.hp)[0];
                    if(target.hes && target.hes.length > 0) return target.hes[Math.floor(Math.random() * target.hes.length)];
                    if(target.es && target.es.length > 0) return target.es[Math.floor(Math.random() * target.es.length)];
                    if(target.js && target.js.length > 0) return target.js.sort((a, b) => a.hp - b.hp)[0];
                    if(target.hs && target.hs.length > 0) return target.hs[Math.floor(Math.random() * target.hs.length)];
                } else {//伤害＞摸牌＞回复
                    if(target.hjs && target.hjs.length > 0) return target.hjs.sort((a, b) => a.hp - b.hp)[0];
                    if(target.ejs && target.ejs.length > 0) return target.ejs.sort((a, b) => a.hp - b.hp)[0];
                    if(target.js && target.js.length > 0) return target.js.sort((a, b) => a.hp - b.hp)[0];
                    if(target.hes && target.hes.length > 0) return target.hes[Math.floor(Math.random() * target.hes.length)];
                    if(target.hs && target.hs.length > 0) return target.hs[Math.floor(Math.random() * target.hs.length)];
                    if(target.es && target.es.length > 0) return target.es[Math.floor(Math.random() * target.es.length)];
                }
                const targetlist = game.filterPlayer(o => o.isAlive() && o !== player && !lib.translate[o.name].includes("郭嘉"));
                return targetlist[Math.floor(Math.random() * targetlist.length)];//无事发生
            } else if (choices === "resultAI") {//用于是否使用本锦囊牌的卡牌AI设定
                let shouyi = 0;
                const setMap = {
                    hejs: 1 + 2 + 1,
                    ejs:  1 + 1,
                    hjs:  1 + 2,
                    hes:  2 + 1,
                    es:  1,
                    js:  1,
                    hs:  2
                };
                if (rejudge.friends && rejudge.friends.length > 0) shouyi += rejudge.friends.length;
                if (rejudge.enemys && rejudge.enemys.length > 0) shouyi -= rejudge.enemys.length * 2;
                if (guojia.friends && guojia.friends.length > 0) shouyi += guojia.friends.length ;
                if (guojia.enemys && guojia.enemys.length > 0) shouyi -= guojia.enemys.length * 2;
                const regions = Object.entries(setMap);
                for(const [key, value] of regions) {
                    if(target[key] && target[key].length > 0) {
                        shouyi += value;
                        break;
                    }
                }
                const skillkey = player.hasSkill("thunderqizuo");
                if(skillkey) {
                    return Math.max(1, shouyi);
                }
                return shouyi;
            }
        },
        /**
         * 行殇AI
         */
        thunderxingshangAI : function (player, target, att) {
            const phes = player.getCards('hes').length;
            /**
             * 选项一：弃置区域内 你已损失体力值数 张牌：随机使用一张装备牌，失去一点体力并摸场上魏势力人数张牌
             */
            let shouyiA = 0;
            const dissumA = Math.max(player.getDamagedHp(), 1);
            const drawsumA = game.filterPlayer(function (current) {
                return current.group == 'wei';
            }).length;
    
            const keynum = Math.max(1,Math.floor(player.maxHp / 3))+1;
    
            const choiceAlive = player.hp + player.countCards('h', { name: ['tao', 'jiu'] }) - 1;
            if (choiceAlive > 1 && phes - dissumA > 1 && player.hp >= keynum) {
                shouyiA = - dissumA + 1.5 - 2 + drawsumA;
            } else {//无法生存
                let num = Math.abs(- dissumA + 1.5 - 2 + drawsumA);
                if (num > 2) {
                    shouyiA = - num;
                } else {
                    shouyiA = - 2;
                }
            }
            /**
             * 选项二：弃置区域内 你体力值数 张牌：随机失去一张装备牌，回复一点体力并获得其区域内半数向上取整张牌。
             */
            let shouyiB = 0;
            const dissumB = Math.max(player.hp, 1);
            const thej = target.getCards('hej');
            const gainsum = Math.max(Math.ceil(thej.length / 2), 0);
            const equipcards = player.getCards('es').length;
            if (player.isDamaged()) {
                if (equipcards > 1) {
                    shouyiB = - dissumB/2 - 1 + 2.5 + gainsum;
                } else if (equipcards === 1) {
                    shouyiB = - dissumB/2 - 0.5 + 2.5 + gainsum;
                } else {
                    shouyiB = - dissumB/2 + 2.5 + gainsum;
                }
            } else {
                if (equipcards > 1) {
                    shouyiB = - dissumB - 1 + gainsum;
                } else if (equipcards === 1) {
                    shouyiB = - dissumB - 0.5 + gainsum;
                } else {
                    shouyiB = - dissumB + gainsum;
                }
            }
            let shouyi = 0;
            const numTao = player.countCards('h', { name: ['tao'] });
            if (phes >= dissumA && phes >= dissumB) {//两个选项都在
                if(att >= 2){//友方
                    if (shouyiA >= shouyiB && shouyiA > 0) {
                        if (numTao > 0) {//有桃
                            shouyi = 0;
                        } else {//无桃
                            shouyi = 1;
                        }
                    } else if (shouyiB > shouyiA && shouyiB > 0) {
                        if (numTao > 0) {//有桃
                            shouyi = 0;
                        } else {//无桃
                            shouyi = 2;
                        }
                    } else {
                        shouyi = 0;
                    }
                } else if(att < 2){//敌方
                    if (shouyiA >= shouyiB && shouyiA > 0) {
                        shouyi = 1;
                    } else if (shouyiB > shouyiA && shouyiB > 0) {
                        shouyi = 2;
                    } else {
                        shouyi = 0;
                    }
                }
            } else if (phes >= dissumA && phes < dissumB) {//只有选项一
                if(att >= 2){//友方
                    if (shouyiA > 0) {
                        if (numTao > 0) {//有桃
                            shouyi = 0;
                        } else {//无桃
                            shouyi = 1;
                        }
                    } else {
                        shouyi = 0;
                    }
                } else if(att < 2){//敌方
                    if (shouyiA > 0) {
                        shouyi = 1;
                    } else {
                        shouyi = 0;
                    }
                }
            } else if (phes < dissumA && phes >= dissumB) {//只有选项二
                if(att >= 2){//友方
                    if (shouyiB > 0) {
                        if (numTao > 0) {//有桃
                            shouyi = 0;
                        } else {//无桃
                            shouyi = 2;
                        }
                    } else {
                        shouyi = 0;
                    }
                } else if(att < 2){//敌方
                    if (shouyiB > 0) {
                        shouyi = 2;
                    } else {
                        shouyi = 0;
                    }
                }
            }
            return shouyi;
        },
        /**
         * 却敌AI，返回对应选项
         */
        thunderquediAI : function (trigger, player) {
            const target = trigger.targets[0];
            function getButtonLinks() {
                let list = [];
                if (target.countGainableCards(player, "he") > 0) {
                    list.push(0);
                    list.push(2);
                }
                list.push(1);
                return list;
            }
            function getchoices() {
                const cardname = trigger.card.name;
                const PTagkey1 = player.hasSkillTag("nothunder", false, target);
                const PTagkey2 = player.hasSkillTag("nodamage", false, target);
                const TTagkey1 = target.hasSkillTag("filterDamage", false, player);
                const TTagkey2 = target.hasSkillTag("nodamage", false, player);
                const TTagkey3 = target.hasSkillTag("freeShan", false, player);
                const TTagkey4 = target.hasSkillTag("respondShan", false, player);
                const TTagkey5 = target.hasSkillTag("respondSha", false, player);
                if (get.attitude(player, target) >= 2) return -5;
                const links = getButtonLinks();
                if (links.includes(2)) {//含有第三选项的判断：即可以执行两项的判断
                    if(target.hp - 2 > 0) {
                        if(PTagkey1 || PTagkey2) return 1;
                        if (setAI.getAliveNum(player,1) <= 0 || TTagkey1 || TTagkey2) {
                            if (links.includes(0)) return 0;
                            return -5;
                        }
                        if (cardname == "sha") {
                            if(TTagkey3 || TTagkey4 || target.hasShan()) {
                                if (links.includes(0)) return 0;
                                return -5;
                            }
                            return 1;
                        }
                        if (cardname == "juedou") {
                            const PshaCards = player.getCards("hes").filter(c => c.name == "sha");
                            const TshaCards = target.getCards("hes").filter(c => c.name == "sha");
                            if(TTagkey5 || target.hasSha()) {
                                if (PshaCards.length >= TshaCards.length) return 1;
                            }
                        }
                        if (links.includes(0)) return 0;
                        return -5;
                    } else {
                        if(PTagkey1 || PTagkey2) return 2;
                        if (setAI.getAliveNum(player,1) <= 0 || TTagkey1 || TTagkey2) return 0;
                        if (cardname == "sha") {
                            if(TTagkey3 || TTagkey4 || target.hasShan()) return 0;
                            return 2;
                        }
                        if (cardname == "juedou") {
                            const PshaCards = player.getCards("hes").filter(c => c.name == "sha");
                            const TshaCards = target.getCards("hes").filter(c => c.name == "sha");
                            if(TTagkey5 || target.hasSha()) {
                                if (PshaCards.length >= TshaCards.length) return 2;
                            }
                        }
                        return 0;
                    }
                }
                if (links.includes(1)) {//含有第二选项的判断
                    if(PTagkey1 || PTagkey2) return 1;
                    if (setAI.getAliveNum(player,1) <= 0 || TTagkey1 || TTagkey2) {
                        if (links.includes(0)) return 0;
                        return -5;
                    }
                    if (cardname == "sha") {
                        if(TTagkey3 || TTagkey4 || target.hasShan()) {
                            if (links.includes(0)) return 0;
                            return -5;
                        }
                        return 1;
                    }
                    if (cardname == "juedou") {
                        const PshaCards = player.getCards("hes").filter(c => c.name == "sha");
                        const TshaCards = target.getCards("hes").filter(c => c.name == "sha");
                        if(TTagkey5 || target.hasSha()) {
                            if (PshaCards.length >= TshaCards.length) return 1;
                        }
                    }
                    if (links.includes(0)) return 0;
                    return -5;
                }
                if (links.includes(0)) return 0;
                return -5;
            }
            return getchoices();
        },
        /**
         * 膂力AI，返回收益数值
         */
        thunderlvliAI : function (player) {
            const weis = game.filterPlayer(function(current) {
                return current.group == 'wei';
            });
            const numdraw = Math.min(weis.length + player.maxHp, 7);
            const cards = player.getCards('he');
            const hp = player.hp;
            const numChange = hp - cards.length;
            const shouyi = numChange + numdraw;
            return shouyi;
        },
        /**
         * 缚龙AI，返回收益数值
         */
        thunderfulongAI : function (card, player) {
            const numdraw = ThunderAndFire.getCardSuitNum(card) + ThunderAndFire.getCardNameNum(card);
            const numdis = player.countMark('thunderfulong') + 1;
            /**
             * 翻面+横置+随机属性伤的debuff计算
             */
            let debuff = 0;
            const skilluse = player.countMark('thunderfulong') + 1 - player.getDamagedHp();
            const liveKey = setAI.getAliveNum(player, 1);
            if (skilluse > 0) {
                if (liveKey > 0) {
                    if (player.isTurnedOver()) { 
                        debuff = 2 - 0.5 - 1;
                    } else{
                        debuff = - Infinity;
                    }
                } else { 
                    debuff = numdis;
                }
            }
            return Math.max(numdraw - numdis + debuff, -2);
        },
    },
    shu:{
        /**
         * 镇武AI，返回镇武收益值
         */
        firezhenwuAI : function (player) {
            if (!player.hasSkill('firezhenwu')) return 0;
            if (!player.firezhenwuused) player.firezhenwuused = 0;
            const zhenwu = player.firezhenwu();
            const cards1 = zhenwu.前邻;
            const cards3 = zhenwu.后邻;
            let numdraw1 = 0;
            if (cards1.length > 0) {
                const suitNum = ThunderAndFire.getCardSuitNum(cards1[0],player);
                const nameNum = ThunderAndFire.getCardNameNum(cards1[0],player);
                if (suitNum && suitNum ) {
                    numdraw1 = Math.abs(suitNum - nameNum);
                }
            }
            let numdraw2 = 0;
            if (cards3.length > 0) {
                const suitNum = ThunderAndFire.getCardSuitNum(cards3[0],player);
                const nameNum = ThunderAndFire.getCardNameNum(cards3[0],player);
                if (suitNum && suitNum ) {
                    numdraw2 = Math.abs(suitNum - nameNum);
                }
            }
            const numdraw = numdraw1 + numdraw2;
            const pDhp = player.getDamagedHp();
            const skillused = player.firezhenwuused;
            let numdis = 0;
            if (skillused + 1 > pDhp) {
                const cards = player.getCards('he');
                const cardsEnd = cards.length + numdraw;
                numdis = 3 - cardsEnd;
            }
            return numdraw + numdis;
        },
        /**
         * 斩决AI
         */
        firezhanjueAI : function (player) {
            let shouyi = 2;
            const php = player.hp;
            const pdhp = player.getDamagedHp();
            const { getShaValue, getDamageTrickValue } = setAI;
            const PTaos = player.countCards('hes', { name: 'tao' });
            if (php < pdhp) {
                if (PTaos > 0) {
                    if (getShaValue(player) || getDamageTrickValue(player)) {
                        shouyi = 1;
                    } else {
                        shouyi = 2;
                    }
                } else {
                    shouyi = 2;
                }
            } else {
                shouyi = 1;
            }
            return shouyi;
        },
        /**
         * 凤鸣AI
         */
        firefengmingAI : function (player) {
            if (!player.hasSkill('firefengming')) return 0;
            const phdisnum = player.getCards('h').length;//弃牌数

            const pDhp = player.getDamagedHp();
            const Shu = game.filterPlayer(function(current) {
                return current.group == 'shu';
            }).length;
            const numdraws = pDhp + Shu;//摸牌数

            const phebegin = player.getCards('he').length;//区域牌开始总数

            const phesTaos = player.countCards('hes', { name: ['tao', 'jiu'] });
            const phesTaosSum = player.countCards('hes', { name: ['tao'] });

            const livenum = player.hp + phesTaos;
            const pheEnd = phebegin - phdisnum + numdraws - 3;
            let shouyi = 0;
            let equips = player.getCards('e').length;
            if (livenum > 0) {
                if (phesTaosSum > 1) {
                    shouyi = -2;
                } else {//也就是找桃子哈哈
                    shouyi = pheEnd - phebegin;
                }
            } else {
                shouyi = Math.max(1, pheEnd - phebegin + equips);
            }
            return shouyi
        },
    },
    wu: {
        /**
         * 周瑜琴音选人AI，及收益
         */
        moonqinyinAI : function (player, choices = "targetAI") {
            const wugroup = game.filterPlayer(function (current) {
                return current.group === 'wu';
            });
            const Friends = game.filterPlayer(function (current) {
                return current !== player &&
                    get.attitude(player, current) >= 2 &&
                    current.countCards('he') > 1 &&
                    current.isDamaged() &&
                    current.hp <= Math.max(1, Math.floor(current.maxHp / 3)) + 1;
            }).sort((a, b) => {
                if (a.hp !== b.hp) return a.hp - b.hp;
                return b.countCards('he') - a.countCards('he');
            });
            const Enemys = game.filterPlayer(function (current) {
                return current !== player &&
                    get.attitude(player, current) < 2 &&
                    (!current.countCards('he') ||
                    current.hp === current.maxHp ||
                    current.countCards('he') <= 2);
            }).sort((a, b) => {
                if (a.hp !== b.hp) return a.hp - b.hp;
                return a.countCards('he') - b.countCards('he');
            });
            let findtargets = Friends.concat(Enemys);
            if (choices === "targetAI") {
                const num = Math.min(findtargets.length, wugroup.length);
                return findtargets.slice(0, num);
            } else if (choices === "effectAI") {
                if (!wugroup || wugroup.length === 0) return 0;
                if (!findtargets || findtargets.length === 0) return 0;
                const num = Math.min(findtargets.length, wugroup.length);
                return num * 1.5;
            }
        },
        /**
         * 周瑜棋势选人AI，及收益
         */
        moonqishiAI : function (player, choices = "targetAI") {
            let comparenum = 0;
            const Friends = game.filterPlayer(function (current) {
                return get.attitude(player, current) >= 2;
            }).sort((a, b) => b.countCards('he') - a.countCards('he'));
            if (Friends && Friends.length > 0) {
                comparenum = Friends[0].countCards('he');
            } else {
                comparenum = player.countCards('he');
            }

            const Enemys = game.filterPlayer(function (current) {
                return current !== player && get.attitude(player, current) < 2;
            }).sort((a, b) => a.countCards('he') - b.countCards('he'));
            const one = Enemys.filter(o => o.countCards('he') > Math.max(4,comparenum)).sort((a, b) => b.countCards('he') - a.countCards('he'));
            const two = Enemys.filter(o => o.getCards('e', card => card.suit === 'spade').length > 1).sort((a, b) => b.countCards('he') - a.countCards('he'));

            const noSpade = game.filterPlayer(function (current) {
                return current !== player && (!current.countCards('he') || (current.getCards('e', card => card.suit === 'spade').length === 0 && !current.countCards('h')));
            });
            if (choices === "targetAI") {
                if (one.length) return one[0];
                if (two.length) return two[0];
                if (noSpade && noSpade.length) return noSpade[0];
                return Enemys[0];
            } else if (choices === "effectAI") {
                if (!Enemys || Enemys.length === 0) return 0;
                if (one.length) return Math.max(2, one[0].getCards('he',{ suit: 'spade' }).length - 1);
                if (two.length) return Math.max(two[0].getCards('e', card => card.suit === 'spade').length - 1, two[0].getCards('he',{ suit: 'spade' }).length - 1);
                if (noSpade && noSpade.length) return 3;
                const cards = Enemys[0].getCards('he',{ suit: 'spade' });
                if (cards.length) return cards.length - 1;
                return 3;
            }
        },
        /**
         * 周瑜书笔选牌AI
         */
        moonshubiAI : async function(player, card) {
            const ShaValue = setAI.getShaValue(player);
            const Phase = _status.currentPhase === player;
            const settags = {
                moonqinyin_tag: {
                    canuse: function () {
                        return player.qinyinused < player.moonqinyin;
                    },
                    setoder: function () {
                        return setAI.wu.moonqinyinAI(player,"effectAI");
                    }
                },
                moonqishi_tag: { 
                    canuse: function () {
                        return player.qishiused < player.moonqishi;
                    },
                    setoder: function () {
                        return setAI.wu.moonqishiAI(player,"effectAI");
                    },
                },
                moonshubi_tag: {
                    canuse: function () {
                        return player.shubiused < player.moonshubi;
                    },
                    setoder: function () {
                        const numone = setAI.wu.moonqinyinAI(player,"effectAI");
                        const numtwo = setAI.wu.moonqishiAI(player,"effectAI");
                        return 1 + Math.max(numone,numtwo);
                    },
                },
                moonhuayi_tag: { 
                    canuse: function () {
                        return player.huayiused < player.moonhuayi;
                    },
                    setoder: function () {
                        //画意居于书笔之下，琴音和棋势之上之上
                        const numone = settags.moonqinyin_tag.setoder();
                        const numtwo = settags.moonqishi_tag.setoder();
                        const numthree = settags.moonshubi_tag.setoder();
                        const setnumone = (numone + numthree) / 2;
                        const setnumtwo = (numtwo + numthree) / 2;
                        return Math.max(setnumone, setnumtwo);
                    },
                },
            };
            const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
            const cards = player.getCards("he").filter(card => player.canRecast(card));
            if (!cards || cards.length === 0) return false;
            //没有标签牌
            if (!cards.some(card => tags.some(tag => card.hasGaintag(tag)))) {
                const value = get.value(card,player)
                if (value < 8) return true
                else return true;
            }
            //有标签牌
            const keys = Object.keys(settags);
            for (let key of keys) {
                if (card.hasGaintag(key) && settags[key].canuse() && settags[key].setoder() > 0) {
                    const value = get.value(card,player);
                    if (Phase && ShaValue) {
                        if (get.name(card) === "zhuge") return false;
                        else if (value < 8) return true;
                        else return true;
                    } else {
                        if (value < 8) return true;
                        else return true;
                    }
                }
            }
            const value = get.value(card,player)
            if (value < 8) return true
            else return true;
        },
        /**
         * 周瑜英谋使用卡牌收益AI
         */
        moonyingmouAI : function(card, player, target) {
            if (!player.hasSkill('moonyingzi')) return;
            const tags = ['moonqinyin_tag', 'moonqishi_tag', 'moonshubi_tag', 'moonhuayi_tag'];
            const cards = player.getCards("hs");
            if (cards.length === 0 || !cards.some(card => tags.some(tag => card.hasGaintag(tag)))) {
                return;
            }
            const settags = {
                moonqinyin_tag: {
                    canuse: function () {
                        return player.qinyinused < player.moonqinyin;
                    },
                    setoder: function () {
                        return setAI.wu.moonqinyinAI(player,"effectAI");
                    }
                },
                moonqishi_tag: { 
                    canuse: function () {
                        return player.qishiused < player.moonqishi;
                    },
                    setoder: function () {
                        return setAI.wu.moonqishiAI(player,"effectAI");
                    },
                },
                moonshubi_tag: {
                    canuse: function () {
                        return player.shubiused < player.moonshubi;
                    },
                    setoder: function () {
                        const numone = setAI.wu.moonqinyinAI(player,"effectAI");
                        const numtwo = setAI.wu.moonqishiAI(player,"effectAI");
                        return 1 + Math.max(numone,numtwo);
                    },
                },
                moonhuayi_tag: { 
                    canuse: function () {
                        return player.huayiused < player.moonhuayi;
                    },
                    setoder: function () {
                        //画意居于书笔之下，琴音和棋势之上之上
                        const numone = settags.moonqinyin_tag.setoder();
                        const numtwo = settags.moonqishi_tag.setoder();
                        const numthree = settags.moonshubi_tag.setoder();
                        const setnumone = (numone + numthree) / 2;
                        const setnumtwo = (numtwo + numthree) / 2;
                        return Math.max(setnumone, setnumtwo);
                    },
                },
            };
            const keys = Object.keys(settags);
            for (const key of keys) {
                if (card && card.cards && card.cards.length > 0) {
                    for (const effectcard of card.cards) {
                        if (effectcard.hasGaintag(key) && settags[key].canuse()) {
                            //console.log('周瑜英谋使用卡牌收益AI：',[key,settags[key].setoder()])
                            return [1, settags[key].setoder()]
                        }
                    }
                }
            }
        },
    },
    qun:{
        /**
         * 〖法箓〗选牌AI
         */
        icefaluAI : function(button,lists) {
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
        icefaluOrderAI : function(player) {
            let order = 0;
            let canUselist = [];
            const viewAsbasic = player.icefalu_basiclist;
            const viewAstrick = player.icefalu_trickRandom;
            if (!viewAsbasic && !viewAstrick) return order;
            const viewAslist = [...viewAsbasic,...viewAstrick];
            if (viewAslist.length == 0) return order;
            const natures = lib.inpile_nature;
            for (let name of viewAslist) {
                const type = get.type(name);
                let Vcard = {name: name, nature: '', isCard: true};
                if (type == "basic") {
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
                } else if (type == "trick") {
                    if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                        canUselist.push(Vcard);
                    }
                }
            }
            let ordernumlist = [];
            if (canUselist.length > 0) {
                for (let Vcard of canUselist) {
                    const Vorder = get.order(Vcard);
                    if (Vorder && Vorder > order) {
                        ordernumlist.push(Vorder);
                    }
                }
                if (ordernumlist.length > 0) {
                    return Math.max(...ordernumlist);
                } else {
                    return Math.max(order, 2);
                }
            } else {
                return Math.max(order, 2);
            }
        },
        longduiAI : function(player) {
            const{
                getShaValue, getDamageTrickValue, getTrickValue
            } = setAI;
            const types = {
                basic : function(){
                    const basiccards = player.getCards("hs").filter(card => get.type(card) === "basic");
                    if(basiccards && basiccards.length > 1) {
                        if (getShaValue(player) && !player.hasSkill('icelongdui_basic')) {
                            return true;
                        }
                    }
                    return false;
                },
                trick : function(){
                    const trickcards = player.getCards("hs").filter(card => get.type(card) === "trick");
                    if(trickcards && trickcards.length > 1) {
                        if ((getTrickValue(player) || getDamageTrickValue(player)) && !player.hasSkill('icelongdui_trick')) {
                            return true;
                        }
                    }
                    return false;
                },
                equip : function(){
                    const equipcards = player.getCards("hes").filter(card => get.type(card) === "equip");
                    const hcards = player.getCards("h");
                    const Handnum = player.getHandcardLimit();
                    if(player.hasSkill('icelongdui_equip')) return false;
                    if(hcards && hcards.length - 1 <= Handnum) return false;
                    if(equipcards && equipcards.length > 1) return true;
                    return false;
                },
            }
            return {
                basic : types.basic(),
                trick : types.trick(),
                equip : types.equip(),
            }
        },
        /**
         * 貂蝉选牌AI
         */
        icelijianCardsAI : function(player, target) {
            return function(card) {
                const att = get.attitude(player, target);
                const equipcard = target.getEquip(1);  
                if (att >= 2) {
                    if (get.tag(card, "damage") > 0) {
                        if (get.name(card) === "sha") {
                            if (equipcard && get.name(equipcard) == "zhuge") {
                                return true;
                            }
                        } else if (get.type(card) === "trick") {
                            return true;
                        }
                    } else {
                        if (get.name(card) === "shan" && player.countCards("h", { name: "shan" }) < 2) {
                            return false;
                        } else if (get.name(card) === "zhuge" && target.countCards("h", { name: "sha" }) > 0) {
                            return true;
                        } else if (get.type(card) === "trick" || get.type(card) === "delay") {
                            return true;
                        } else if (get.type(card) === "equip") {
                            if (player.getEquip(2) && get.name(card) === get.name(player.getEquip(2))) {
                                return false;
                            } else if (player.getEquip(3) && get.name(card) === get.name(player.getEquip(3))) {
                                return true;
                            }
                        }
                    }
                } else {
                    return false;
                }
            };
        },
        /**
         * 曹婴凌人猜测AI
         */
        icelingrenguessAI : function(player, target) {
            const {getTypesCardsSum, getTypesCardsSum_byme} = setAI;
            return function(button) {
                // 现有牌堆各类型卡牌总数
                let basiccardssum = 0;
                let trickcardssum = 0;
                let equipcardssum = 0;
                let cardssum = 0;
                const TypesCard = getTypesCardsSum();
                basiccardssum = TypesCard.basic;
                trickcardssum = TypesCard.trick;
                equipcardssum = TypesCard.equip;
                cardssum = basiccardssum + trickcardssum + equipcardssum;
        
                // 曹婴角度已知弃牌堆、场上、曹婴手牌区各类型卡牌数量
                let knownbasiccardssum = 0;
                let knowstrickcardssum = 0;
                let knowsequipcardssum = 0;
                let knowncardssum = 0;
                const knownCardCounts = getTypesCardsSum_byme(player);
                knownbasiccardssum = knownCardCounts.basic;
                knowstrickcardssum = knownCardCounts.trick;
                knowsequipcardssum = knownCardCounts.equip;
                knowncardssum = knownbasiccardssum + knowstrickcardssum + knowsequipcardssum;
                const guesssum = cardssum - knowncardssum;
                const guessbasic = basiccardssum - knownbasiccardssum;
                const guesstrick = trickcardssum - knowstrickcardssum;
                const guessequip = equipcardssum - knowsequipcardssum;
                const tbasic = target.countCards("h", { type: ["basic"] });
                const ttrick = target.countCards("h", { type: ["trick", "delay"] });
                const tequip = target.countCards("h", { type: ["equip"] });
                const ths = target.countCards("h");
                /**
                 * 猜测占比概率模拟
                 * 是否有基本牌的系数：guessbasic/guesssum  0.5为分界线，越往两端走猜中概率越大！
                 * 是否有锦囊牌的系数：guesstrick/guesssum  0.5为分界线，越往两端走猜中概率越大！
                 * 是否有装备牌的系数：guessequip/guesssum  0.5为分界线，越往两端走猜中概率越大！
                 */
                let basic_L = 0.5;
                let trick_L = 0.5;
                let equip_L = 0.5;
                if (guesssum <= 0) {
                    basic_L = 1;
                    trick_L = 1;
                    equip_L = 1;
                } else {
                    basic_L = guessbasic / guesssum >= 0.5 ? guessbasic / guesssum : 1 - guessbasic / guesssum;
                    trick_L = guesstrick / guesssum >= 0.5 ? guesstrick / guesssum : 1 - guesstrick / guesssum;
                    equip_L = guessequip / guesssum >= 0.5 ? guessequip / guesssum : 1 - guessequip / guesssum;
                }
                switch (button.link[2]) {
                    case "basic":
                        if (player.getStorage('icefujian').includes(target)) {
                            return tbasic ? true : false;
                        } else if (guessbasic <= 0) {
                            return tbasic ? true : false;
                        } else if (ths <= 0) {
                            return false;
                        } else {
                            return Math.random() < basic_L ? tbasic : !tbasic;
                        }
                    case "trick":
                        if (player.getStorage('icefujian').includes(target)) {
                            return ttrick ? true : false;
                        } else if (guesstrick <= 0) {
                            return ttrick ? true : false;
                        } else if (ths <= 0) {
                            return false;
                        } else {
                            return Math.random() < trick_L ? ttrick : !ttrick;
                        }
                    case "equip":
                        if (player.getStorage('icefujian').includes(target)) {
                            return tequip ? true : false;
                        } else if (guessequip <= 0) {
                            return tequip ? true : false;
                        } else if (ths <= 0) {
                            return false;
                        } else {
                            return Math.random() < equip_L ? tequip : !tequip;
                        }
                }
            };
        },
        /**
         * 武皇甫嵩将贤AI
         */
        icejiangxianresultAI : function (player) {
            if (player.storage.icejiangxian && (!player.hasSkill("icechaozhen") || !player.hasSkill("icelianjie"))) return 0;
            //判断需要失去朝镇
            if (player.maxHp <= 2) return 1;
            //判断需要失去连捷进行决战！
            const { getShaValue, getDamageTrickValue } = setAI;
            const numDamage = player.getHistory('sourceDamage').length;
            const numhp = player.maxHp - player.hp;
            const numjiu = player.countCards("h", "jiu");
            const numtao = player.countCards("h", "tao");
            const numshan = player.countCards("h", "shan");
            if(numshan > Math.floor(player.maxHp / 2) || numshan > 1) return 0;//排除卡闪
            if(numjiu > Math.floor(player.maxHp / 2) || numjiu > 1) return 0;//排除卡酒
            //多人场判断，尽量有限发动失去一技能！
            const friends = game.players.filter(p =>  get.attitude(player, p) >= 2).length;
            const enemies = game.players.filter(p =>  get.attitude(player, p) < 2).length;
            if(game.players.length > 2 && (friends >= enemies && enemies > 1))  return 0;
            if(player.isDamaged()) {
                if(numtao - numhp > 1) return 0;//排除卡桃
                if ( numDamage > 0 && (getShaValue(player) || getDamageTrickValue(player))) return 1;
            } else {
                if(numtao > Math.floor(player.maxHp / 2)) return 0;
                if (numDamage > 0 && (getShaValue(player) || getDamageTrickValue(player))) return 1;
            }
        },
    },
};
