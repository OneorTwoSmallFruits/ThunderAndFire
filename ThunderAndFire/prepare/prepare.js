import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'../precontent/functions.js';
const { setColor } = ThunderAndFire;
import { gainCards } from "./gainCards.js";
export async function prepare() {
    const SetPlayerFunc = {
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
            const fanyi = lib.translate[skill];
            if (!info1 ||!info2 ||!fanyi) return;
            const player = this;
            if (get.itemtype(targets) == "player") {
                targets = [targets];
            }
            if (!chatlists || !Array.isArray(chatlists) || !chatlists.every(item => typeof item === 'string')) { 
                player.logSkill(skill, targets, nature);
                return;
            }
            function playAudio() {
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
            }
            playAudio();
            /**
             * 身份暴露度
             */
            function expose() {
                if (info1.ai && info1.ai.expose != undefined && player.logAi && (!targets || targets.length != 1 || targets[0] != player)) {
                    player.logAi(info1.ai.expose);
                }
            }
            expose();
            /**
             * 有毛病的，等本体更新
             */
            function round() {
                if (info1 && info1.round) {
                    const roundname = skill + "_roundcount";
                    player.storage[roundname] = game.roundNumber;
                    player.syncStorage(roundname);
                    player.markSkill(roundname);
                }
            }
            round();
            /**
             * 记录技能使用信息，有实际用处☆☆☆☆☆
             */
            function logSkill() {
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
            }
            logSkill();
            /**
             * 不懂也不想知道！
             */
            function _hookTrigger() {
                if (player._hookTrigger) {
                    for (let i = 0; i < player._hookTrigger.length; i++) {
                        let infoXXX = lib.skill[player._hookTrigger[i]].hookTrigger;
                        if (infoXXX && infoXXX.log) {
                            infoXXX.log(player, skill, targets);
                        }
                    }
                }
            }
            _hookTrigger();
        },
        playjianglingAudio: function (event, targets, nature = 'fire') {
            const player = this;
            if (get.itemtype(targets) == "player") {
                targets = [targets];
            }
            let skill;
            if (typeof event === 'string') {
                skill = event;
            } else if (typeof event === 'object') {
                skill = event.name;
            }
            const info1 = lib.skill[skill];
            const info2 = get.info(skill,false);
            const fanyi = lib.translate[skill];
            if (!info1 ||!info2 ||!fanyi) return;
            function playAudio() {
                const cleanText = fanyi.replace(/<[^>]+>/g, '');
                const word = cleanText.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '');
                player.popup(get.skillTranslation(skill, player));
                player.$fullscreenpop(word, nature);
                const Path = '银竹离火/audio/jiangling/';
                game.playAudio('..', 'extension', Path, skill);
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
            }
            playAudio();
            /**
             * 身份暴露度
             */
            function expose() {
                if (info1.ai && info1.ai.expose != undefined && player.logAi && (!targets || targets.length != 1 || targets[0] != player)) {
                    player.logAi(info1.ai.expose);
                }
            }
            expose();
            /**
             * 有毛病的，等本体更新
             */
            function round() {
                if (info1 && info1.round) {
                    const roundname = skill + "_roundcount";
                    player.storage[roundname] = game.roundNumber;
                    player.syncStorage(roundname);
                    player.markSkill(roundname);
                }
            }
            round();
            /**
             * 记录技能使用信息，有实际用处☆☆☆☆☆
             */
            function logSkill() {
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
            }
            logSkill();
            /**
             * 不懂也不想知道！
             */
            function _hookTrigger() {
                if (player._hookTrigger) {
                    for (let i = 0; i < player._hookTrigger.length; i++) {
                        let infoXXX = lib.skill[player._hookTrigger[i]].hookTrigger;
                        if (infoXXX && infoXXX.log) {
                            infoXXX.log(player, skill, targets);
                        }
                    }
                }
            }
            _hookTrigger();
        },
        /**
         * 获取玩家当前拥有的技能列表函数
         * @param {string} type - 类型；
         * @returns {Array} - 返回玩家拥有该类型的技能列表；//必须是玩家的技能，必须有完整技能文本。
         */
        countSkills: function (type = 'all') {
            const skillsTypes = ["锁定技","主公技","限定技","觉醒技","转换技","隐匿技","宗族技","势力技","使命技","蓄力技","阵法技","主将技","副将技","君主技","蓄能技","Charlotte","昂扬技","持恒技","连招技","威主技"];
            const bannedTypes = ["主公技","限定技","觉醒技","隐匿技","势力技","使命技","阵法技","主将技","副将技","君主技","Charlotte","威主技"];
            const player = this;
            const skills = player.getSkills(null, false, false).filter(skill => {
                const info = get.info(skill);
                const fanyi = lib.translate[skill];
                const fanyiInfo = lib.translate[skill + "_info"];
                return info && fanyi && fanyiInfo;
            });
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
         * 储存禁用技能的列表！本扩展
         */
        _extDislists: [],
        /**
         * 创建监听skillBlocker的技能列表，此列表允许通过skillBlocker
         */
        _extSkillBlockers: [],
        countDisSkillsTrigger: {
            global: { skills: [], triggers: [] },
            player: { skills: [], triggers: [] },
            target: { skills: [], triggers: [] },
            source: { skills: [], triggers: [] },
        },
        /**
         * 获取玩家拥有的封印类技能列表。
         * 该函数会筛选出当前玩家所拥有的所有满足条件的skillBlocker类型的技能（即封印类技能）。
         * 条件包括：
         *   - 技能必须定义了init属性；
         *   - 技能必须定义了skillBlocker属性；
         *   - skillBlocker属性必须是一个函数。
         * @returns {Array} 返回玩家当前拥有的skillBlocker类型的技能列表。
         */
        getSkillBlockers:function () {
            const player = this;
            const playerskills = [...new Set([...player.skills, ...player.initedSkills])];
            const SkillBlockers = playerskills.filter(item => {
                const init = lib.skill[item].init;
                const skillBlocker = lib.skill[item].skillBlocker;
                return init && skillBlocker && typeof skillBlocker === 'function';
            });
            return SkillBlockers;
        },
        /**
         * 移除所有封印类BUFF，并清空对SkillBlockers的监听。
         * @returns {Object} - 返回一个对象，包含两个属性：
         *   - skills: 被移除的封印类技能列表。
         *   - buffs: 被移除的BUFF列表。
         */
        removeSkillBlockers:function () {
            const player = this;
            const SkillBlockers = player.getSkillBlockers();
            const extSkillBlockers = player._extSkillBlockers;
            const extDislists = player._extDislists;
            let buffs = [];
            let skills = [];
            if (SkillBlockers.length > 0) {
                for (const item of SkillBlockers) {
                    player.removeSkill(item);
                    buffs.push(item);
                }
            }
            if(extSkillBlockers.length > 0){
                for (const item of player._extSkillBlockers) {
                    if(!skills.includes(item)) skills.push(item);
                }
                player._extSkillBlockers = [];
            }
            if(extDislists.length > 0){
                for (const item of player._extDislists) {
                    if(!skills.includes(item)) skills.push(item);
                }
                player._extDislists = [];
                player.updateDisSkills();
            }
            player.update();
            const result = {
                skills: skills,
                buffs: buffs,
            }
            return result;
        },
        /**
         * 获取玩家当前因封印类失效的技能列表。
         * @returns {Array} - 返回玩家当前失效的技能列表
         */
        getDisSkills:function () {
            const player = this;
            const SkillBlockers = player.getSkillBlockers();
            if (SkillBlockers.length === 0) return [];
            let getDisSkills = [];
            for (const item of SkillBlockers) {
                const skillBlocker = lib.skill[item].skillBlocker;
                const dislist = player.countSkills().filter(skill => {
                    return skillBlocker(skill, player);
                });
                for (const skill of dislist) {
                    if (!getDisSkills.includes(skill)) getDisSkills.push(skill);
                }
            }
            return getDisSkills;
        },
        /**
         * 玩家手动解除【因 skillBlocker 类型的技能】而被失效的技能中的某些技能。
         * 
         * @param {string|Array} skills - 要解除禁用的技能 id，可以是单个技能名或技能名数组。
         * @param {string} [type='skills'] - 操作类型：
         *   - 'all'：表示解除所有被封印的技能；
         *   - 'skills'：表示解除指定的技能；
         * @returns {Array} 返回被成功解除禁用的技能列表。
         */
        removeDisSkills: function(skills, type = 'skills') {
            let skills_ext = [];
            const player = this;
            const playerskills = [...new Set([...player.skills, ...player.initedSkills])];
            const SkillBlockers = player.getSkillBlockers();
            if (!SkillBlockers || SkillBlockers.length === 0) return skills_ext;
            if (type === 'all') {
                const result = player.removeSkillBlockers();
                const releasedSkills = result.skills;
                setTimeout(() => {
                    if (releasedSkills.length > 0) {
                        const fanyis = releasedSkills.map(skill => get.translation(skill)).join('丨');
                        const prompt = setColor('「' + fanyis + '」');
                        game.log(player, '的技能', prompt, '已解除封印。');
                    }
                    player.update();
                }, 250);
                return releasedSkills;
            } else {
                if (typeof skills == 'string') skills = [skills];
                for (const skill of skills) {
                    if (!playerskills.includes(skill)) continue;
                    if (!player._extSkillBlockers.includes(skill)) {
                        player._extSkillBlockers.push(skill);
                        if (!skills_ext.includes(skill)) skills_ext.push(skill);
                    }
                }
                setTimeout(() => {
                    /**
                     * 延迟执行后续判断逻辑（避免立即判断状态未更新）
                     */
                    const getNowDisSkills = player.getDisSkills();
                    if (getNowDisSkills.length === 0) {
                        // 如果当前已没有被封印的技能，则调用全量解除逻辑兜底
                        player.removeDisSkills(null, 'all');
                    } else {
                        if (skills_ext.length > 0) {
                            const fanyis = skills_ext.map(skill => get.translation(skill)).join('丨');
                            const prompt = setColor('「' + fanyis + '」');
                            game.log(player, '的技能', prompt, '已解除禁用。');
                        }
                        player.update();
                    }
                }, 250);
                return skills_ext;
            }
        },
        updateDisSkills: function() {
            const player = this;
            if (player._extDislists.length === 0) {
                player.countDisSkillsTrigger.global.skills = [];
                player.countDisSkillsTrigger.global.triggers = [];
                player.countDisSkillsTrigger.player.skills = [];
                player.countDisSkillsTrigger.player.triggers = [];
                player.countDisSkillsTrigger.target.skills = [];
                player.countDisSkillsTrigger.target.triggers = [];
                player.countDisSkillsTrigger.source.skills = [];
                player.countDisSkillsTrigger.source.triggers = [];
                const skill1 = '_disSkill_ThunderAndFire';
                const playerid = player.playerid;
                const skill12 = '_remove_disSkill_' + playerid;
                if(player.hasSkill(skill1)) player.removeSkill(skill1);
                if(player.hasSkill(skill12)) {
                    player.removeSkill(skill12);
                    delete lib.skill[skill12];
                };
                player.update();
            }
            return player._extDislists;
        },
        /**
         * 本扩展禁用某位玩家的技能至什么时候结束，以本体skillBlocker的形式实现，因为这样也方便，省的过AI了哈哈
         * 必须有翻译真实存在的技能！同时在全局进行了监听
         * @param {string|Array} skills - 要禁用的技能id
         * @param {Object} object - { global: 'phaseAfter' } - 默认禁用至每个回合结束后;
         */
        tempDisSkills: function(skills, object = { global: 'phaseAfter' }) {
            const player = this;
            const playerskills = [...new Set([...player.skills, ...player.initedSkills])];
            const _extSkillBlockers = player._extSkillBlockers;
            if (typeof skills == 'string') skills = [skills];
            let skills_ext = [];
            for (const skill of skills) {
                if(!playerskills.includes(skill) || _extSkillBlockers.includes(skill)) continue;
                const getSkills = player.countSkills();
                if (!getSkills.includes(skill)) continue;
                if (player._extDislists.includes(skill)) continue;
                skills_ext.push(skill);
            }
            if (skills_ext.length === 0) return skills_ext;
            const playerid = player.playerid;
            const newskillname = '_remove_disSkill_' + playerid;
            if (!lib.skill[newskillname]) lib.skill[newskillname] = {};
            for (const skill of skills_ext) {
                if (!player._extDislists.includes(skill)) player._extDislists.push(skill);
                if(!player.hasSkill('_disSkill_ThunderAndFire')) player.addSkill('_disSkill_ThunderAndFire');
                const globals = player.countDisSkillsTrigger.global;
                const players = player.countDisSkillsTrigger.player;
                const targets = player.countDisSkillsTrigger.target;
                const sources = player.countDisSkillsTrigger.source;
                for (const time in object) {
                    switch (time) {
                        case 'global':
                            if (!globals.skills.includes(skill)) globals.skills.push(skill);
                            if (!globals.triggers.includes(object[time])) globals.triggers.push(object[time]);
                            break;
                        case 'player':
                            if (!players.skills.includes(skill)) players.skills.push(skill);
                            if (!players.triggers.includes(object[time])) players.triggers.push(object[time]);
                            break;
                        case 'target':
                            if (!targets.skills.includes(skill)) targets.skills.push(skill);
                            if (!targets.triggers.includes(object[time])) targets.triggers.push(object[time]);
                            break;
                        case'source':
                            if (!sources.skills.includes(skill)) sources.skills.push(skill);
                            if (!sources.triggers.includes(object[time])) sources.triggers.push(object[time]);
                            break;
                        default:
                            break;
                    }
                }
                lib.skill[newskillname] = {
                    trigger: {
                        global: player.countDisSkillsTrigger.global.triggers,   
                        player: player.countDisSkillsTrigger.player.triggers,
                        target: player.countDisSkillsTrigger.target.triggers,
                        source: player.countDisSkillsTrigger.source.triggers,
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter(event, player, name){ 
                        const dislist = player._extDislists;
                        return dislist.length > 0;
                    },
                    async content(event, trigger, player) {
                        const Times = event.triggername;
                        const dislist = player._extDislists;
                        const triggers = {
                            global: player.countDisSkillsTrigger.global,
                            player: player.countDisSkillsTrigger.player,
                            target: player.countDisSkillsTrigger.target,
                            source: player.countDisSkillsTrigger.source,
                        };
                        let skills_ext = [];
                        Object.entries(triggers).forEach(([key, trigger]) => {
                            if (trigger.triggers.includes(Times)) {
                                const skills = trigger.skills;
                                skills.forEach(skill => {
                                    if (dislist.includes(skill)) {
                                        if (!skills_ext.includes(skill)) skills_ext.push(skill);
                                        player._extDislists = dislist.filter(item => item !== skill);
                                        if (!player._extSkillBlockers.includes(skill)) player._extSkillBlockers.push(skill);
                                        trigger.skills = skills.filter(item => item !== skill);
                                    }
                                });
                            }
                        });
                        if (skills_ext.length > 0) {
                            const fanyis = skills_ext.map(skill => get.translation(skill)).join('丨');
                            const prompt = setColor('「' + fanyis + '」');
                            game.log(player, '的技能', prompt, '已解除禁用。');
                        }
                        player.updateDisSkills();
                    },
                };
            }
            if(!player.hasSkill(newskillname)) {
                player.addSkill(newskillname);
            } else {
                player.removeSkill(newskillname);
                player.addSkill(newskillname);
            }
            player.update();
            const fanyis = skills_ext.map(skill => get.translation(skill)).join('丨');
            const prompt = setColor('「' + fanyis + '」');
            game.log(player, '的技能', prompt, '暂时已被禁用。');
            return skills_ext;
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
         * @param {GameEvent} evt - 事件对象。
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
                player.popup(get.cnNumber(cards.length) + '上');
                game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于牌堆顶！');
                player.update();
                game.addCardKnower(cards, player);
                game.updateRoundNumber();
                game.delayx();
            } else if (to === 'bottom') {
                for (let card of cards) {
                    ui.cardPile.appendChild(card);
                }
                player.popup(get.cnNumber(cards.length) + '下');
                game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于牌堆底！');
                player.update();
                game.addCardKnower(cards, player);
                game.updateRoundNumber();
                game.delayx();
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
                game.addCardKnower(cards, player);
                game.updateRoundNumber();
                game.delayx();
            } else if (to === 'bottom') {
                for (let card of cards) {
                    ui.discardPile.insertBefore(card, ui.discardPile.firstChild);
                }
                player.popup(get.cnNumber(cards.length) + '下');
                game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于弃牌堆底！');
                player.update();
                game.addCardKnower(cards, player);
                game.updateRoundNumber();
                game.delayx();
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
         * 将指定卡牌或其数组模拟为虚拟卡牌进行使用或打出。
         * @param {string|Object} Vcard - 虚拟卡牌定义对象，至少需包含 name 属性，并可选 nature、suit 等。
         * @param {Array<Card>|null} showcard - 实际使用的卡牌数组；若为 null，则不依赖实体卡牌。
         * @param {Player|Array<Player>} [gameplayers] - 指定允许的目标玩家或玩家列表。
         * @param {boolean} [forced=true] - 是否强制使用，忽略常规限制。
         * @param {boolean} [distance=false] - 是否考虑目标距离限制。
         * @param { boolean | GameEvent } [includecard] 是否受使用次数限制，可以填入用于检测的事件
         * @returns {Event} 返回创建的事件对象，可用于后续操作（如监听完成回调）。
         */
        viewAsToUse: async function (Vcard, showcard, gameplayers, forced = true, distance = false, includecard) {
            const player = this;
            if (typeof Vcard === 'string') Vcard = { name: Vcard };
            if (get.itemtype(showcard) == "card") showcard = [showcard];
            if (get.itemtype(gameplayers) == "player") gameplayers = [gameplayers];
            const info = get.info(Vcard);
            if (!info) return;
            if (info.multicheck && !info.multicheck(Vcard, player)) return;
            const targets = game.filterPlayer();
            if (targets.length === 0) return;
            if (!lib.filter.cardEnabled(Vcard, player)) return;

            if (distance !== false) {
                if (Array.isArray(gameplayers) && gameplayers.length) {
                    const canuse = gameplayers.filter(target => {
                        return lib.filter.targetInRange(Vcard, player, target) && target.isAlive();
                    });
                    if (canuse.length === 0) return;
                    gameplayers = canuse;
                } else {
                    const canuse = targets.filter(target => {
                        return lib.filter.targetInRange(Vcard, player, target) && target.isAlive();;
                    });
                    if (canuse.length === 0) return;
                }
            }
            if (includecard) {
                let evt = includecard;
                if (typeof evt !== "object") {
                    evt = _status.event.getParent("chooseToUse");
                }
                if (get.itemtype(evt) !== "event") {
                    evt = undefined;
                }
                if (!lib.filter.cardUsable(Vcard, player, evt)) return;
                if (Array.isArray(gameplayers) && gameplayers.length) {
                    const canuse = gameplayers.filter(target => {
                        return lib.filter.targetEnabledx(Vcard, player, target) && target.isAlive();;
                    });
                    if (canuse.length === 0) return;
                    gameplayers = canuse;
                } else {
                    const canuse = targets.filter(target => {
                        return lib.filter.targetEnabledx(Vcard, player, target) && target.isAlive();;
                    });
                    if (canuse.length === 0) return;
                }
            } else {
                if (Array.isArray(gameplayers) && gameplayers.length) {
                    const canuse = gameplayers.filter(target => {
                        return lib.filter.targetEnabled(Vcard, player, target) && target.isAlive();;
                    });
                    if (canuse.length === 0) return;
                    gameplayers = canuse;
                } else {
                    const canuse = targets.filter(target => {
                        return lib.filter.targetEnabled(Vcard, player, target) && target.isAlive();;
                    });
                    if (canuse.length === 0) return;
                }
            }
            lib.skill.ThunderAndFire_backup = {
                mod: {
                    targetInRange: function(card, player, target){
                        if(distance === false) return true;
                    },
                },
                charlotte: true,
                filterCard: function(card, player) {
                    if (!showcard) return false;
                    if (Array.isArray(showcard)) return showcard.includes(card);
                    return false;
                },
                selectCard: function() {
                    if (!showcard) return 0;
                    if (Array.isArray(showcard)) return showcard.length;
                    return 0;
                },
                position: "hejsx",
                viewAs: function (cards, player) {
                    return Vcard;
                },
                filterTarget: function(card, player, target) {
                    if (Array.isArray(gameplayers) && gameplayers.length) {
                        return gameplayers.includes(target);
                    } else {
                        const info = get.info(Vcard);
                        const filterTarget = info.filterTarget;
                        const isEnabled = includecard 
                            ? lib.filter.targetEnabledx(Vcard, player, target)
                            : lib.filter.targetEnabled(Vcard, player, target);

                        const isInRange = distance 
                            ? lib.filter.targetInRange(Vcard, player, target)
                            : true;
                        if (filterTarget && typeof filterTarget === 'function') {
                            return isEnabled && isInRange && filterTarget(card, player, target);
                        }
                        return isEnabled && isInRange;
                    }
                },
                selectTarget: function () {
                    if (Array.isArray(gameplayers) && gameplayers.length) {
                        return gameplayers.length;
                    } else {
                        const info = get.info(Vcard);
                        if (typeof info.selectTarget === 'function') {
                            return info.selectTarget();
                        }
                        return Array.isArray(info.selectTarget) || typeof info.selectTarget === 'number'
                            ? info.selectTarget
                            : 1;
                    }
                },
                precontent: async function () {
                    const evt = _status.event;
                    if (includecard === false) {//不计入次数限制
                        evt.getParent().addCount = false;
                    } else {
                        evt.getParent().addCount = true;
                    }
                    player.update();
                },
                log: false,
                "_priority": -25,
            };
            const cardname = (get.translation(Vcard.nature) || "") + get.translation(Vcard.name);
            let prompt;
            if (Array.isArray(gameplayers) && gameplayers.length) {
                const gameplayersfanyi = gameplayers.map(target => get.translation(target)).join('、');
                if (!showcard) prompt = "请视为对" + gameplayersfanyi + "使用一张" + cardname + "。";
                if (Array.isArray(showcard)) {
                    const fanyi = showcard.map(card => get.translation(card)).join('、');
                    prompt = "请将" + fanyi + "当作" + cardname + "对" + gameplayersfanyi + "使用或打出。";
                }
            } else {
                if (!showcard) prompt = "请视为使用一张" + cardname + "。";
                if (Array.isArray(showcard)) {
                    const fanyi = showcard.map(card => get.translation(card)).join('、');
                    prompt = "请将" + fanyi + "当作" + cardname + "使用或打出。";
                }
            }
            const next = player.chooseToUse();
            next.set("forced", forced? true : false);
            next.set("prompt", prompt);
            next.set('norestore', true);
            next.set('_backupevent', 'ThunderAndFire_backup');
            next.set('addCount', includecard? true : false);
            next.set('custom', {
                add: {},
                replace: {},
            });
            next.backup('ThunderAndFire_backup');
            return next;
        },
        /**
         * 返回可用卡牌且有正收益的卡牌列表数组，用于AI判断
         * 若包含次数限制，若检查的卡牌名为“杀”会进一步判断玩家是否有诸葛连弩，或有可用的诸葛连弩。若没有则会默认返回一张收益最高的杀
         * @param {string | Object} Vcard - 卡牌名或卡牌对象。
         * @param {boolean} [distance=true] - 是否考虑目标距离限制。
         * @param { boolean | GameEvent } [includecard = true] - 是否受使用次数限制，可以填入用于检测的事件
         * @returns {Array} - 返回一个数组，包含符合条件的卡牌。
         */
        getCardsValue: function(Vcard, distance = true, includecard = true) {
            let getcards = [];
            const player = this;
            if (typeof Vcard == "string") Vcard = { name: Vcard, nature: "", isCard: true };
            const info = get.info(Vcard);
            if (!info || (info.multicheck && !info.multicheck(Vcard, player))) return getcards;
            if (!lib.filter.cardEnabled(Vcard, player)) return getcards;
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
            if (includecard && includecard === true) {
                if (Vcard.name === "sha" && hasZhugeCard()) includecard = false;
            }
            let hasCards = player.getCards("hejsx").filter(card => {
                const key1 = get.name(card, player) && get.name(card, player) === Vcard.name;
                const key2 = player.hasUseTarget(card, distance, includecard);
                const key3 = player.hasValueTarget(card, distance, includecard);
                const key4 = player.getUseValue(card, distance, includecard) > 0;
                return key1 && key2 && key3 && key4;
            });
            if (!hasCards || !hasCards.length) return getcards;
            let usable = player.getCardUsable(Vcard);
            if (usable && typeof usable === 'number') {
                if (Vcard.name === "sha" && hasZhugeCard()) usable = Infinity;
                if (hasCards.length <= usable) {
                    return hasCards;
                } else {
                    const sortcards = hasCards.sort((a, b) => {
                        return player.getUseValue(b, distance, includecard) - player.getUseValue(a, distance, includecard);
                    });
                    return sortcards.slice(0, usable);
                }
            }
            return getcards;
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
    //SE孙鲁班
    const originalremoveSkill = lib.element.player.removeSkill;
    lib.element.player.removeSkill = new Proxy(originalremoveSkill, {
        apply(target, thisArg, argumentsList) {
            const skills = argumentsList;
            const ownedSkills = thisArg.countSkills();
            let removeSkills = [];
            for (const skill of skills) {
                if (ownedSkills.includes(skill)) removeSkills.push(skill);
            }
            const result = Reflect.apply(target, thisArg, argumentsList);
            if (removeSkills.length) {
                const next = game.createEvent('removeSkill_diy');
                next.player = thisArg;
                next.num = removeSkills.length;
                next.removeSkill_diy = removeSkills;
                next.setContent(async function (event, trigger, player) {
                    const waterjiaoman = game.filterPlayer(o => {
                        return o.isIn() && o.hasSkill('waterjiaoman');
                    });
                    if (waterjiaoman.length) {
                        game.log(player,'失去了技能',removeSkills)
                        const next = game.createEvent('waterjiaoman_removeSkill');
                        event.after.unshift(next);
                        next.player = thisArg;
                        next.num = removeSkills.length;
                        next.removeSkill_diy = removeSkills;
                        next.targets = waterjiaoman;
                        next.setContent(async function (event, trigger, player) {
                            const {updateMark} = get.info('waterjiaoman');
                            const setSkills = ["waterzenhui","waterxieming","waterfuxiong","waterzhanqing"];
                            const targets = event.targets;
                            if (setSkills.includes(event.removeSkill_diy[0])) {
                                for (const target of targets) {
                                    const markNum = target.countMark('waterjiaoman');
                                    switch (event.removeSkill_diy[0]) {
                                        case "waterzenhui":
                                            if (markNum > 15) {
                                                const num = markNum - 15;
                                                target.removeMark('waterjiaoman', num);
                                            }
                                            const lists1 = ["waterxieming","waterfuxiong","waterzhanqing"];
                                            for (const list of lists1) {
                                                if (target.hasSkill(list)) {
                                                    await target.removeSkill(list);
                                                }
                                            }
                                            break;
                                        case "waterxieming":
                                            if (markNum > 20) {
                                                const num = markNum - 20;
                                                target.removeMark('waterjiaoman', num);
                                            }
                                            const lists2 = ["waterfuxiong","waterzhanqing"];
                                            for (const list of lists2) {
                                                if (target.hasSkill(list)) {
                                                    await target.removeSkill(list);
                                                }
                                            }
                                            break;
                                        case "waterfuxiong":
                                            if (markNum > 50) {
                                                const num = markNum - 50;
                                                target.removeMark('waterjiaoman', num);
                                            }
                                            if (target.hasSkill("waterzhanqing")) {
                                                await target.removeSkill("waterzhanqing");
                                            }
                                            break;
                                        case "waterzhanqing":
                                            if (markNum > 75) {
                                                const num = markNum - 75;
                                                target.removeMark('waterjiaoman', num);
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            } else {
                                for (const target of targets) {
                                    target.logSkill('waterjiaoman', player, 'thunder');
                                    await updateMark(target,15);
                                }
                            }
                        });
                    }
                });
                return result;
            } else {
                return result;
            }
        },
    });
};