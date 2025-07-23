import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
/**
 * 本武将包势力转换技设定：游戏开始时，切换至开局设定势力，摸一张牌。
 * 开始死亡时，切换至初始设定势力。
 */
game.changeGroupSkill = async function(player, skill) {
    const changeGroup = lib.skill[skill]?.changeGroup;
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
            /此阶段限\s*(\d+|[一二两三四四肆五六七八八玖十拾佰千千万万亿壹贰叁伍陆柒捌玖拾]+)(?!\d)次/g,
            /则新的一轮开始前/g,
            /每名其他角色限一次/g,
            /延时类锦囊牌/g,
            /Min/g,
            /Max/g,
            /野心值/g,
            /琴音/g,
            /书笔/g,
            /羁绊技·与君丨规则技/g,
            /朱雀/g,
            /白虎/g,
            /注解/g,
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
     * 获取失效技能相关
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
     * 卡牌技能效果音效播放。
     * @param {*} event - 事件
     * @param {*} player - 玩家
     * @param {*} info - 默认播放卡牌语音。'effect'表示后续是否增设效果音效
     * @returns 
     */
    diyCardsAudio : function(trigger, player, info = 'card') {
        const name = trigger.card.name;
        if (!name) return;
        if(info === 'card') {
            const fanyi = get.translation(name);
            if (player.hasSex("female")) {
                if (fanyi) {
                    player.$fullscreenpop(fanyi, 'thunder');
                }
                if(name === 'TAF_daozhuanqiankun') {
                    player.chat('一个小小的惊喜！╰(*°▽°*)╯')
                } else if(name === 'TAF_leishan') {
                    player.chat('你打不着，略略略！(～￣▽￣)～')
                } else if(name === 'TAF_lunhuizhiyao') {
                    player.chat('女孩的心细，别猜(#^.^#)')
                }
                game.playAudio('..', 'extension', '银竹离火/audio/cards/diyCards/female', name);
            } else {
                if (fanyi) {
                    player.$fullscreenpop(fanyi, 'fire');
                }
                if(name === 'TAF_daozhuanqiankun') {
                    player.chat('行路难，行路难，多歧路今安在。')
                } else if(name === 'TAF_leishan') {
                    player.chat('必当竭力，开辟一条生路！')
                } else if(name === 'TAF_lunhuizhiyao') {
                    player.chat('人生得意须尽欢，莫使金樽空对月！')
                }
                game.playAudio('..', 'extension', '银竹离火/audio/cards/diyCards/male', name);
            }
            return;
        } else if (info === 'effect') {
            game.playAudio('..', 'extension', '银竹离火/audio/effect', name + '_effect');
        }
    },
    /**
     *《银竹离火》部分角色特殊卡牌语音
     * @param {Object} trigger - 触发事件对象，包含卡牌信息。
     * @param {Object} player - 玩家对象，包含玩家名称等信息。
     * @returns {void}
     */
    excCardsAudio : async function(trigger,player) {
        const standardcards = new Set([//军争标准的基本和锦囊
            'sha', 'shan', 'tao', 'jiu',
            'taoyuan', 'wanjian', 'wugu', 'jiedao',
            'juedou', 'nanman', 'huogong', 'wuzhong',
            'shunshou', 'guohe', 'tiesuo', 'wuxie',
            'lebu', 'bingliang', 'shandian',
        ]);
        const playerCards = {//额外配音
            'moon_zhugeliang': new Set([
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
            'moon_guojia': new Set([
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
        const basePath = ['..', 'extension', '银竹离火/audio/cards/characters', pn];
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
     * 计算某个牌或技能对于特定玩家的价值。
     * 常用于AI进行决策判断。
     *
     * @param {Object} player - 玩家对象。
     * @param {string|Object} infos - 牌的名称（字符串）或牌对象。
     * @returns {number} - 返回该牌或技能对当前玩家的价值数值。
     */
    compareValue: function(player,infos) {
        let value = 0;
        let card;
        if (typeof infos === "string") {
            card = { name: infos, nature: '', isCard: true };
        } else if (typeof infos === "object") {
            card = infos;
        }
        const info = get.info(card,false);
        if (!info) return value;
        if (info.multicheck && !info.multicheck(card, player)) return value;
        const type = info.type;
        if (!type && typeof type !== "string") return value;
        const fanyi = lib.translate[card.name];
        const fanyi_info = lib.translate[card.name + "_info"];
        if (!fanyi || !fanyi_info) return value;
        const Vvalue = get.value(card,player);
        if (Vvalue && typeof Vvalue === "number") {
            value = Vvalue;
        }
        return value;
    },
    /**
     * 计算某个牌或技能对于特定玩家的优先级。
     * 常用于AI进行决策判断。
     *
     * @param {Object} player - 玩家对象。
     * @param {string|Object} infos - 牌的名称（字符串）或牌对象。
     * @returns {number} - 返回该牌或技能对当前玩家的优先级数值。
     */
    compareOrder: function(player,infos) {
        let order = 0;
        let card;
        if (typeof infos === "string") {
            card = { name: infos, nature: '', isCard: true };
        } else if (typeof infos === "object") {
            card = infos;
        }
        const info = get.info(card,false);
        if (!info) return order;
        if (info.multicheck && !info.multicheck(card, player)) return order;
        const type = info.type;
        if (!type && typeof type !== "string") return order;
        const fanyi = lib.translate[card.name];
        const fanyi_info = lib.translate[card.name + "_info"];
        if (!fanyi || !fanyi_info) return order;
        const Vorder = get.order(card,player);
        if (Vorder && typeof Vorder === "number") {
            order = Vorder;
        }
        return order;
    },
    compareUseful: function(player,infos) {
        let useful = 0;
        let card;
        if (typeof infos === "string") {
            card = { name: infos, nature: '', isCard: true };
        } else if (typeof infos === "object") {
            card = infos;
        }
        const info = get.info(card,false);
        if (!info) return useful;
        if (info.multicheck && !info.multicheck(card, player)) return useful;
        const type = info.type;
        if (!type && typeof type !== "string") return useful;
        const fanyi = lib.translate[card.name];
        const fanyi_info = lib.translate[card.name + "_info"];
        if (!fanyi || !fanyi_info) return useful;
        const Vuseful = get.useful(card,player);
        if (Vuseful && typeof Vuseful === "number") {
            useful = Vuseful;
        }
        return useful;
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
     * 获取可以改判的卡牌列表，若有则返回一个带有卡牌的数组。若无返回空数组
     * @param {*} judges - 判定区卡牌-可以是单个卡牌，或者[]
     * @param {*} cards - 处理区观星类的卡牌
     * @param {*} player - 谁处理
     * @param {*} result - 默认返回处理让判定牌失效，布尔值为true则判定牌不失效，false则判定牌失效
     * @returns - 返回可以处理的改判牌的数组。
     */
    setjudgesResult : function(judges, cards, player, result = false) {
        if (get.itemtype(judges) === 'card' && typeof judges === "object") {
            judges = [judges];
        }
        if (!Array.isArray(cards) || cards.length === 0) return [];
        cards = cards.sort((a, b) => get.value(a, player) - get.value(b, player));
        const map = {};
        const usedCards = [];
        for (let i = 0; i < judges.length; i++) {
            const judgeCard = judges[i];
            const cardInfo = judgeCard.viewAs ? lib.card[judgeCard.viewAs] : get.info(judgeCard);
            const cardid = judgeCard.cardid;
            if (!cardInfo?.judge || map[cardid]) continue;
            map[cardid] = [];
            const judge = cardInfo.judge;
            const restCards = cards.filter(card => !usedCards.includes(card));
            for (let card of restCards) {
                const judgeResult = judge(card);
                if (map[cardid].length > 0) continue;
                if ((result === false && judgeResult > 0) || (result === true && judgeResult <= 0)) {
                    map[cardid].push(card);
                    usedCards.push(card);
                }
            }
        }
        let setcards = Object.values(map).map(arr => arr[0] || null);
        // 替换 null
        const notNullCards = setcards.filter(card => card !== null);
        if (notNullCards.length === 0) return [];
        const restCards = cards.filter(card => !notNullCards.includes(card));
        for (let i = 0; i < setcards.length; i++) {
            if (setcards[i] === null && restCards.length > 0) {
                setcards[i] = restCards.shift();
            }
        }
        const nullIndex = setcards.indexOf(null);
        return nullIndex === -1 ? setcards : setcards.slice(0, nullIndex);
    },
};
export const setAI = {
    name: "银竹离火func",
    version: "13.14.7",
    update: "2025.05.25",
    /**
     * 获取玩家：是否有杀且可以使用或继续接着使用杀，且场上存在可以对其使用且为正收益的目标；
     * 其中包含了玩家是否装备诸葛连弩，或有诸葛连弩且可以对自己使用
     */
    getShaValue : function(player, distance, includecard) {
        let Vcard = { name: "sha", nature: "", isCard: true };
        const shaCard = player.getCards("hejsx").filter(card => {
            const key1 = get.name(card, player) && get.name(card, player) === "sha";
            const key2 = lib.filter.cardEnabled(card, player);
        });

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
            if (equipcard && get.name(equipcard, player) && get.name(equipcard, player) === "zhuge") return true;
            const zhugeCards = player.getCards("hejsx").filter(card => {
                const key1 = get.name(card, player) && get.name(card, player) === "zhuge";
                const key2 = player.canUse(card, player);
                return key1 && key2;
            });
            return zhugeCards.length > 0;
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
        const selfSaves = player.getCards('hes').filter(card => player.canSaveCard(card, player));
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
         * 周瑜书笔选牌AI,返回了最优排序列表
         */
        moonshubiAI : function(player) {
            const ShaValue = player.getCardsValue('sha').length > 1;
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
            let cards = player.getCards("he").filter(card => player.canRecast(card));
            if (!cards || cards.length === 0) return [];
            if (!cards.some(card => tags.some(tag => card.hasGaintag(tag)))) {//没有标签牌
                if (Phase && ShaValue) {
                    const othercards = cards.filter(card => get.name(card) !== "zhuge").sort((a, b) => get.value(a, player) - get.value(b, player));
                    return othercards.concat(cards.filter(card => get.name(card) === "zhuge"));
                } else {
                    return cards.sort((a, b) => get.value(a, player) - get.value(b, player));
                }
            } else {//有标签牌
                let tagCards = [];
                for (let card of cards) {
                    const keys = Object.keys(settags);
                    for (let key of keys) {
                        if (card.hasGaintag(key) && settags[key].canuse()) {
                            tagCards.push(card);
                        }
                    }
                }
                tagCards.sort((a, b) => {
                    const orderA = settags[Array.from(a.gaintag.keys()).find(tag => settags[tag])]?.setoder() || 0;
                    const orderB = settags[Array.from(b.gaintag.keys()).find(tag => settags[tag])]?.setoder() || 0;
                    return orderB - orderA;
                });
                const otherCards = cards.filter(card => !tagCards.includes(card)).sort((a, b) => get.value(a, player) - get.value(b, player));
                if (Phase && ShaValue) {
                    let allcards = tagCards.concat(otherCards);
                    const othercards = allcards.filter(card => get.name(card) !== "zhuge");
                    return othercards.concat(allcards.filter(card => get.name(card) === "zhuge"));
                } else {
                    return tagCards.concat(otherCards);
                }
            }
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
                            return [1, settags[key].setoder()]
                        }
                    }
                }
            }
        },
    },
    qun:{
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
    },
};
