import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import { 
    character,
    神话再临character, 隐忍天弓character, 鼎足三分character, 星河皓月character,
    惊世银竹character, 期期离火character, 欲雨临泽character, 惊鸿玉蝶character,
    雾山五行character, 爆料体验character, 其他武将character, 异构Bosscharacter,
    测试专属character,
} from'../precontent/characters.js';
const { setColor } = ThunderAndFire;//银竹离火函数
const settings = {
    rarity : lib.config.extension_银竹离火_TAFset_rarity,
    prefix : lib.config.extension_银竹离火_TAFset_prefix,
    gifs : lib.config.extension_银竹离火_TAFset_gifs,
    skinschange : lib.config.extension_银竹离火_TAFset_skinschange,
    charReplace : lib.config.extension_银竹离火_TAFset_charReplace,
    SkillsTips : lib.config.extension_银竹离火_TAFset_SkillsTips,
    sortcards : lib.config.extension_银竹离火_TAFset_sortcards,
    Musics : lib.config.extension_银竹离火_TAFset_Background_Musics,
    Background : lib.config.extension_银竹离火_TAFset_Background_Pictures,
    autoSwap: lib.config.extension_银竹离火_TAFset_autoSwap,
};
const 神话再临 = Object.keys(神话再临character);
const 隐忍天弓 = Object.keys(隐忍天弓character);
const 鼎足三分 = Object.keys(鼎足三分character);
const 星河皓月 = Object.keys(星河皓月character);
const 惊世银竹 = Object.keys(惊世银竹character);
const 期期离火 = Object.keys(期期离火character);
const 欲雨临泽 = Object.keys(欲雨临泽character);
const 惊鸿玉蝶 = Object.keys(惊鸿玉蝶character);
const 雾山五行 = Object.keys(雾山五行character);
const 爆料体验 = Object.keys(爆料体验character);
const 其他武将 = Object.keys(其他武将character);
const 异构Boss = Object.keys(异构Bosscharacter);
const 测试专属 = Object.keys(测试专属character);
export function content(config, pack) {
    if (settings.rarity) {
        const setepic = [ ...惊世银竹, ...期期离火, ...欲雨临泽, ...惊鸿玉蝶, ...雾山五行, ...爆料体验, ...其他武将 ];
        const setlegend = [ ...神话再临, ...隐忍天弓, ...鼎足三分, ...星河皓月, ...异构Boss, ...测试专属 ];
        const rarityGroups = {
            junk: [],// 垃圾
            rare: [],// 稀有
            epic: [...setepic],// 史诗
            legend: [...setlegend],// 传说
        };
        for (const rarity in rarityGroups) {
            if (rarityGroups.hasOwnProperty(rarity)) {
                lib.rank.rarity[rarity].addArray(rarityGroups[rarity]);
            }
        }
    }
    if (settings.prefix) {
        const setEE9A00 = [...神话再临, ...隐忍天弓, ...鼎足三分, ...星河皓月, ...异构Boss, ...测试专属];
        const set0088CC = [...惊世银竹];
        const setFF2400 = [...期期离火];
        const set48D1CC = [...欲雨临泽];
        const setAFEEEE = [...惊鸿玉蝶];
        const setEE9AC7 = [...雾山五行];
        const colorMap = {};
        for (const character of setEE9A00) {
            const 翻译 = lib.translate[character];
            if (!colorMap[翻译]) colorMap[翻译] = { color: "#EE9A00", nature: "soil" };// 橙黄色, 土色边框
        }
        for (const character of set0088CC) {
            const 翻译 = lib.translate[character];
            if (!colorMap[翻译]) colorMap[翻译] = { color: "#0088CC", nature: "ice" };// 美丽的蓝色, 冰雪边框
        }
        for (const character of setFF2400) {
            const 翻译 = lib.translate[character];
            if (!colorMap[翻译]) colorMap[翻译] = { color: "#FF2400", nature: "ice" };// 橙红色, 冰雪边框
        }
        for (const character of set48D1CC) {
            const 翻译 = lib.translate[character];
            if (!colorMap[翻译]) colorMap[翻译] = { color: "#48D1CC", nature: "water" };// 水绿色, 水色边框
        }
        for (const character of setAFEEEE) {
            const 翻译 = lib.translate[character];
            if (!colorMap[翻译]) colorMap[翻译] = { color: "#AFEEEE", nature: "ice" };// 苍白的绿松石色, 冰雪边框
        }
        for  (const character of setEE9AC7) {
            const 翻译 = lib.translate[character];
            if (!colorMap[翻译]) colorMap[翻译] = { color: "#EE9AC7", nature: "firemm" };// 粉色，火焰边框
        }
        if (colorMap) {
            for (const [name, { color, nature }] of Object.entries(colorMap)) {
                lib.namePrefix.set(name, { color, nature });
            }
        }
        const txtEE9AC7 = ["◈","蝶","喵","SE"];
        for (const txt of txtEE9AC7) {
            lib.namePrefix.set(txt, { color: "#EE9AC7", nature: "firemm" });// 粉色，火焰边框
        }
        const txt0088CC = ["◈"];
        for (const txt of txt0088CC) {
            lib.namePrefix.set(txt, { color: "#0088CC", nature: "ice" });// 美丽的蓝色, 冰雪边框
        }
    }
    if (settings.gifs === "1" || settings.gifs === "2") {
        HTMLDivElement.prototype.ThunderAndFireGifSet = function (bg = '', pos = {}, time = 10000, func = null) {
            const that = this;
            game.broadcastAll(function (that) {
                const img = document.createElement('div');
                img.style.backgroundImage = `url(${bg}?${Math.random()})`;
                img.style.backgroundSize = 'cover';
                Object.assign(img.style, pos);
                that.appendChild(img);
                setTimeout(function () {
                    if (func) {
                        func(img);
                    } else {
                        img.remove();
                    }
                }, time);
            }, that);
        };
        lib.skill._ThunderAndFireGif = {
            trigger: {
                global: ["gameStart"],
            },
            ruleSkill: true,
            priority: Infinity,
            direct: true,
            filter: function (event, player) {
                const configValue = settings.gifs;
                if (configValue !== "1" && configValue !== "2") return false;
                return lib.characterPack.ThunderAndFire.hasOwnProperty(player.name) && get.mode() !== 'guozhan';
            },
            async content(event, trigger, player) {
                const configValue = settings.gifs;
                const gifMap = {
                    "1": 'extension/银竹离火/image/character/background/萤火.gif',
                    "2": 'extension/银竹离火/image/character/background/樱花.gif'
                };
                const gifUrl = gifMap[configValue];
                if (gifUrl) {
                    player.node.avatar.ThunderAndFireGifSet(gifUrl, {
                        width: "100%",
                        height: "100%"
                    }, 1000000000);
                }
            },
        };
    }
    if (settings.skinschange) {
        lib.skill._ThunderAndFire_changeskins = {//皮肤切换
            trigger: { 
                global: ["gameStart", "phaseBegin", "phaseEnd"],
            },
            ruleSkill: true,
            priority: Infinity,
            direct: true,
            filter: function (event, player) {
                return lib.characterPack.ThunderAndFire.hasOwnProperty(player.name) && get.mode() !== 'guozhan';
            },
            async content(event, trigger, player) {
                const Time = event.triggername;
                const targetsID = Object.keys(character);;
                const setID = [
                    "sun_simayi","sun_zhangchunhua", "moon_zhouyu", "thunder_guojia", 
                    "fire_jiangwei", "fire_baosanniang", "fire_zhaoxiang", "water_sunhanhua"
                ];
                const targets = game.filterPlayer((current) => {
                    return current.isAlive() && targetsID.includes(current.name);
                });
                if (Time === 'gameStart') {
                    for (let target of targets) {
                        const nameID = target.name;
                        for (let pID of setID) {
                            if (pID === nameID) {
                                const skinsID = target.checkSkins();
                                if (skinsID === nameID || skinsID === `${nameID}2`) {
                                    target.changeSkins(1);
                                }
                            }
                        }
                    }
                } else if (Time === 'phaseEnd') {
                    const skinsID = player.checkSkins();
                    if (skinsID === 'fire_zhaoxiang' || skinsID === 'fire_zhaoxiang2') {
                        player.changeSkins(1);
                    }
                }
            }
        };
    }
    if (settings.charReplace) {
        /**
         * 同名武将选将界面切换设置
         */
        function setcharReplace() { 
            let Replaces = lib.characterReplace;
            let characterlists = Object.keys(lib.character);
            let getcharacters = [神话再临, 隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 期期离火, 欲雨临泽, 惊鸿玉蝶];
            for  (let name of getcharacters) {
                if (!Replaces[name]) Replaces[name] = [];
                const fanyi = lib.translate[name];
                if (fanyi) {
                    const filters = characterlists.filter(i => lib.translate[i] === fanyi && i !== name);
                    if (filters.length) {
                        Replaces[name].push(...filters);
                    }
                }
            }
        }
        setcharReplace();
        //console.log(lib.characterReplace['TAF_zhaoyun']);
    }
    if (settings.SkillsTips) {
        lib.init.css(lib.assetURL + 'extension/银竹离火/ThunderAndFire/otherSettings/css', 'ThunderAndFire_SkillTips');
        get.ThunderAndFireSkills = function (str1, str2) {// 创建技能悬浮提示框
            return '<abbr title=\"' + str2 + '\"><ins>' + str1 + '</ins></abbr>';
        };
        game.ThunderAndFirePhone = function () {// 检测是否为移动设备
            var info = navigator.userAgent;
            return /mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(info);
        };
        get.ThunderAndFireSkillTips = function (tipname, id) {// 显示技能提示
            var dibeijing = ui.create.div('.ThunderAndFireBackground', document.body);
            dibeijing.style.zIndex = 16;
            var skilltip = ui.create.div('.ThunderAndFireSkillsTips', dibeijing);
            skilltip.innerHTML = tipname;
            var herf = document.getElementById(id);
            if (herf) {
                var left = herf.getBoundingClientRect().left;
                if (game.ThunderAndFirePhone()) left += herf.offsetParent.offsetLeft;
                left += document.body.offsetWidth * 0.15;
                skilltip.style.left = left + 'px';
                skilltip.style.top = (herf.getBoundingClientRect().top + 30) + 'px';
            }
            dibeijing.listen(function (e) {
                e.stopPropagation();
                this.remove();
            });
        };
        function createTAFSkill(str1, str2, textColor, underlineColor) {// 通用技能悬浮显示函数
            if (_status.ThunderAndFireSkills_temp) delete _status.ThunderAndFireSkills_temp;
            _status.ThunderAndFireSkills_temp = Math.random().toString(36).slice(-8);
            return "<a id='" + _status.ThunderAndFireSkills_temp + "' style='color:" + textColor + "; text-decoration: none; font-weight: bold; position: relative;' href=\"javascript:get.ThunderAndFireSkillTips('" + str2 + "','" + _status.ThunderAndFireSkills_temp + "');\">" +
                "<span style='position: relative; display: inline-block;'>" + str1 + 
                "<span style='position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px; background-color: " + underlineColor + ";'>" +
                "</a>";
        }
        get.TAFskills = function (str1, str2) {
            return createTAFSkill(str1, str2, '#FF2400', '#0088CC');
        };
        get._TAFskills = function (str1, str2) {//默认 蓝色+红色下划线
            return createTAFSkill(str1, str2, '#0088CC', '#FF2400');
        };
        get._TAFskillswei = function (str1, str2) {
            return createTAFSkill(str1, str2, '#0088CC', '#FF2400');
        };
        get._TAFskillsshu = function (str1, str2) {
            return createTAFSkill(str1, str2, '#FF2400', '#48D1CC');
        };
        get._TAFskillswu = function (str1, str2) {
            return createTAFSkill(str1, str2, '#48D1CC', '#0088CC');
        };
        get.doumiaoset = () => get._TAFskills(
            '逗猫', setColor(
            '<li>逗猫<li>　　回合开始时，你可以弃置一张牌并选择一名其他角色，转移「逗猫」，并使其摸一张牌，回合结束时，若你拥有「逗猫」，则需弃置一张牌。'
        ));
        lib.translate.icedoumao_info = setColor(
            '锁定技：<br>　　游戏开始时，你获得一个「'+ get.doumiaoset() +'」标记。'
        ); 
        //钟会 与 姜维 
        get.TAFjibanskill = () => get.TAFskills(
            '羁绊技', setColor(
            '<li>羁绊技<li>　　玩家释放此技能时，场上对应的「钟会丨姜维」均执行本技能增益效果。'
        ));
        lib.translate.thunderyujun_info = setColor(
            ''+ get.TAFjibanskill() +'「姜维」：<br>　　当一名其他角色进入濒死状态时，每轮游戏限一次，你可以弃置一张⚡标记并横置，若如此做：①其回复一点体力，并摸此牌名字数张牌：②新的一轮开始时，你横置并受到一点无来源的🔥伤害。'
        );
        lib.translate.fireyujun_info = setColor(
            ''+ get.TAFjibanskill() +'「钟会」：<br>　　当一名其他角色脱离濒死状态后若其存活，每回合限一次，则你可以选择一个「麟焱」记录中未选择过的记录牌名，并横置，若如此做：①「麟焱」记录之，其回复一点体力，并摸此牌名字数张牌；②该回合结束时，你横置并受到一点无来源的⚡伤害。'
        );
        //司马懿
        get.sunxiongyiskill = () => get._TAFskills(
            '雄奕', setColor(
            '<li>觉醒·雄奕<li>　　当你造成/受到一点伤害时，你可摸已拥有「势力标记数」张牌，若如此做：则令场上玩家依次摸一张牌，并随之获得其区域内一张牌，然后弃置「以此法获得牌数半数向下取整」张牌；若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点随机属性伤害「⚡丨🔥丨❄️」，然后本技能失效至该回合结束。'
        ));
        lib.translate.sunpingling_info = setColor(
            '势力转换技「魏丨晋」：<br>　　①当一名角色进入濒死状态时，且未获得全部势力标记：每名其他角色限一次/你每轮限一次，你将依次获得「魏」「蜀」「吴」标记，并回复一点体力摸当前已拥有「势力标记数」张牌；<br>　　②当获得全部势力标记时：将体力值上限调整至四并恒定之、势力调整至「晋」、修改技能〖'+ get.sunxiongyiskill() +'〗，最后失去本技能。。'
        );
        //诸葛亮《转阵》及《四象技》补充说明
        get.zhuanzhenskill = () => get._TAFskills(
            '转阵', setColor(
            '<li>转阵<li>　　点数「壹至拾叁」重新随机分布于「两仪丨四象丨八阵」中，两仪分配一点与「♠丨♣」和「♥丨♦」随机组合，四象分配四点与「♠丨♥丨♦丨♣」依次组合，八阵分配八点与「坎丨艮丨震丨巽丨离丨坤丨兑丨乾」依次组合。'
        ));
        lib.translate.starszhuanzhen_info = setColor(
            '持恒技：<br>　　每当缺失完整两仪后/每当缺失完整四象后/每当八阵数缺七的倍数后「整局游戏不重复」，你可以选择失去/回复/失去一点体力，重新〖'+ get.zhuanzhenskill() +'〗。'
        );
        get.sixiangskill = () => get._TAFskills(
            '四象技', setColor(
            '<li>四象技<li>玄武:受到的伤害时，摸一张牌且此伤害不会大于一点至其下个回合结束；<li>青龙:每回合第一次受到伤害后回复一点体力至其下个回合结束；<li>朱雀:立即获得一张♦杀，♦杀无距离限制且造成伤害时视为🔥伤害至其下个回合结束；<li>白虎:立即获得一张♣杀，♣杀不可被响应且造成伤害时视为⚡伤害至你下个回合结束。'
        ));
        lib.translate.starssixiang_info = setColor(
            '　　当一名其他角色受到伤害时，若其〖'+ get.sixiangskill() +'〗小于贰，你可令其随机获得一张四象牌并移除一象，其获得对应〖'+ get.sixiangskill() +'〗直到其下个回合结束；若场上存在其他蜀势力角色或首次脱离濒死状态后，将其他角色改为角色。'
        );
        //郭嘉《十胜十败》补充说明
        get.tenwintenlose = () => get._TAFskills(
            '十胜十败', setColor(
            '<li>十胜十败<li>延时类锦囊牌：出牌阶段，对自己使用，判定阶段若判定结果在点数十之内，奇数且为♠ / 偶数且为♥，则你须选择一名非郭嘉其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害；无有效目标或判定失败后，移动至下家判定区！'
        ));
        get.thunderyiji = () => get._TAFskills(
            '遗计', setColor(
            '<li>遗计<li>　　你可以将一张〖十胜十败〗牌当任意基本牌或普通锦囊使用或打出，且摸一张牌。'
        ));
        get.thunderlunshi = () => get._TAFskills(
            '论势', setColor(
            '<li>论势·改<li>　　当一名其他角色判定生效后，若判定结果为非〖十胜十败〗生效结果，或当你受到一点伤害后：则你判定一次〖十胜十败〗效果，若判定失败，则可令至多场上魏势力人数名其他角色各摸你已损失体力值数且至少为一张牌。'
        ));

        lib.translate.thunderqizuo_info = setColor(
            '锁定技：<br>　　游戏进场/每轮游戏开始时，将十张〖'+ get.tenwintenlose() +'〗加入牌堆/将一张〖十胜十败〗牌置入判定区；每当一张〖十胜十败〗进入弃牌堆时，摸一张牌；区域内牌的点数不大于十，手牌上限 + 场上判定区牌总数至多为四。'
        );
        lib.translate.thunderlunshi_info = setColor(
            '　　当一名其他角色判定生效后，若判定结果为非〖十胜十败〗生效结果，则你判定一次〖十胜十败〗效果，若判定失败，则可令至多场上魏势力人数名角色各摸你已损失体力值数且至少为一张牌；你于本局游戏发动三次本技能后获得技能〖'+ get.thunderyiji() +'〗，并修改〖'+ get.thunderlunshi() +'〗。'
        );
        //周瑜悬浮显示
        get.moonqinyin = () => get.TAFskills(
            '琴音', setColor(
            '<li>琴音♥<li>你令至多场上吴势力人数名其他角色执行一项：<br>　　①交给你一张牌其回复一点体力；<br>　　②令你摸一张牌其失去一点体力。'
        ));
        get.moonqishi = () => get._TAFskills(
            '棋势', setColor(
            '<li>棋势♠<li>你令一名其他角色弃置同棋势花色所有牌：<br>　　①若弃置了同棋势花色牌，则其摸一张牌；<br>　　②若未弃置同棋势花色牌，则你获得非棋势花色牌各一张。'
        ));
        get.moonshubi = () => get.TAFskills(
            '书笔', setColor(
            '<li>书笔♦<li>你摸一张牌并展示之，然后依次执行以下两项：<br>　　①若此牌同书笔花色，获得一张非书笔花色牌;<br>　　②若此时区域内有牌，则你重铸一张牌。'
        ));
        get.moonhuayi = () => get._TAFskills(
            '画意', setColor(
            '<li>画意♣<li>随机获得场上一张牌，若此牌类型为：<br>　　基本：下一张基本牌基础数值+1;<br>　　锦囊：下一张普通锦囊牌无距离限制可多指定两个目标;<br>　　装备：重铸区域内同画意花色所有牌，若无则摸一张牌。'
        ));
        lib.translate.moonyingmou_info = setColor(
            '　　当你失去卡牌后，若失去的卡牌中含有「'+ get.moonqinyin() +'丨'+ get.moonqishi() +'丨'+ get.moonshubi() +'丨'+ get.moonhuayi() +'」对应标签，每回合每项限「体力值：奇数:贰丨偶数:壹」次，你执行对应标签项。'
        );
        //曹操、孙权、刘备、张角
        get.feiying = () => get._TAFskills(
            '飞影', setColor(
            '<li>护驾·飞影<li>非锁定技：　　每回合限一次，当你受到魏势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。'
        ));
        get.dilu = () => get._TAFskills(
            '的卢', setColor(
            '<li>结营·的卢<li>非锁定技：　　每回合限一次，当你受到蜀势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。'
        ));
        get.yulong = () => get._TAFskills(
            '玉龙', setColor(
            '<li>权术·玉龙<li>非锁定技：　　每回合限一次，当你受到吴势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。'
        ));

        get.jieyi = () => get._TAFskills(
            '结义', setColor(
            '<li>结义<li>转换技：<br>　　每轮游戏限一次完整转换：阳，进入濒死状态前，可摸一张牌并令刘备摸两张牌，若如此做：其手牌数大于体力值则其可令你摸一张牌；阴，脱离濒死状态后(存活)，可弃一张牌并令刘备回复一点体力，若如此做：其为满体力则其可令你摸两张牌。'
        ));
        get.quandao = () => get._TAFskills(
            '权道', setColor(
            '<li>权道<li>转换技：<br>　　每轮游戏限一次完整转换：阳，造成伤害后，你可摸一张牌并弃置两张牌，若如此做：孙权回复一点体力并可移动场上一张牌；阴，受到伤害后，你可摸两张牌并弃置一张牌，若如此做：孙权摸一张牌并可弃置场上一张牌。'
        ));
        lib.translate.thunderhujia_info = setColor(
            '主公技：<br>　　①每轮限一次，当你进入濒死状态时，你可以对一名其他魏势力角色造成一点伤害，其并将区域内牌数调整至其体力值上限，然后你回复体力至一点；②修改技能〖'+ get.feiying() +'〗。'
        );
        lib.translate.firejieying_info = setColor(
            '主公技：<br>　　①游戏进场时/当一名角色回合开始或结束时，若场上存在未拥有〖'+ get.jieyi() +'〗技能的其他蜀势力角色，使其获得技能〖'+ get.jieyi() +'〗；②修改技能〖'+ get.dilu() +'〗、〖昭仁〗界改为神。'
        );
        lib.translate.waterquanshu_info = setColor(
            '主公技：<br>　　①游戏进场时/当一名角色回合开始或结束时，若场上存在未拥有〖'+ get.quandao() +'〗技能的其他吴势力角色，使其获得技能〖'+ get.quandao() +'〗；②修改技能〖'+ get.yulong() +'〗。'
        );
        //貂蝉
        get.icetan = () => get._TAFskills(
            '贪', setColor(
            '<li>离间·贪<li>　　使用牌后，每回合每种类型限一次，摸剩余类型数张牌并弃置已使用类型数张牌，每次使该回合手牌上限 - 该次获得牌数；该回合结束后，貂蝉摸反向手牌上限数张牌。'
        ));
        get.icechen = () => get._TAFskills(
            '嗔', setColor(
            '<li>离间·嗔<li>　　立即随机获得两张牌，回合内只能使用这些类型的卡牌。'
        ));
        get.icechi = () => get._TAFskills(
            '痴', setColor(
            '<li>离间·痴<li>　　使用牌后，每回合每种花色限一次，选择执行一项：弃置一张牌/貂蝉摸一张。'
        ));
        get.iceli = () => get._TAFskills(
            '戾', setColor(
            '<li>离间·戾<li>　　当戾/非戾角色使用牌指定非戾非貂蝉/戾非貂蝉的单一目标后，可弃置一张牌令貂蝉摸一张牌，并令此牌对该角色的伤害+1。。'
        ));
        get.iceyi = () => get._TAFskills(
            '疑', setColor(
            '<li>离间·疑<li>　　回合内/外，使用非伤害标签牌时，无法对自己及貂蝉/其他角色使用。'
        ));
        lib.skill.icelijian.derivation = [];
        lib.translate.icelijian_info = setColor(
            '　　当一名其他角色第奇数/偶数次造成伤害后，若此时为其回合内，每回合每项限三次：①你可交予其一张手牌，若其再次造成伤害后，其摸此牌名字数张牌，你摸此牌花色序数张牌；②你可令其随机获得「'+ get.icetan() +'丨'+ get.icechen() +'丨'+ get.icechi() +'丨'+ get.iceli() +'丨'+ get.iceyi() +'」技能中一个直到其下个回合结束(不重复获得，每名角色至多拥有三种离间技)。'
        );
        //蝶贾诩
        get.icejuehun = () => get._TAFskills(
            '吴起兵法', setColor(
            '<li>吴起兵法<li>　　当此牌离开你的装备区时，你销毁之；然后你令至多X名角色于本回合结束时将一张牌当〖杀〗使用（X为你的技能数）。'
        ));
        lib.translate.icejuehun_info = setColor(
            '锁定技：<br>　　当一名角色的「体力值与体力上限变化为相等后丨濒死状态结算结束后若其存活」，你将「'+ get.icejuehun() +'」置于你的装备区并替换原装备牌，然后若你发动此技能的次数为「偶数」，你失去武将牌上的「第一个技能」。'
        );
        get.iceluoshu = () => get._TAFskills(
            '络殊技能池', setColor(
            '<li>络殊技能池<li>　　〖乱武〗〖间书〗〖拥嫡〗〖兴衰〗〖焚城〗〖奇谋〗〖雄异〗〖凶算〗〖造王〗〖纷殕〗。'
        ));
        get.icefendang = () => get._TAFskills(
            '纷殕', setColor(
            '<li>纷殕<li>　　限定技：<br>　　每轮开始时，你可以令所有角色选择两项：1.翻面；2.摸两张牌；3.于本轮获得技能〖鸩毒〗。'
        ));
        lib.skill.iceluoshu.derivation = [];
        lib.translate.iceluoshu_info = setColor(
            '锁定技：<br>　　当你准备阶段开始时，你从「'+ get.iceluoshu() +'」中随机抽取三个限定技，然后你选择并获得其中一个限定技；其中专属限定技为「'+ get.icefendang() +'」。'
        );
        //张琪瑛
        //转换技：<br>　　每回合限一次，你可以视为使用或打出一张任意标准基本牌及随机四张〖法箓锦囊牌〗：阳，随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶；阴，随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底。以此发放置的牌称为〖法箓〗，然后随机获得至多一张〖法箓〗牌且〖法箓锦囊牌〗进入下一循环组。<br>　　〖法箓〗锦囊：标准、军争、国战、应变、用间、忠胆、逐鹿、运筹卡牌库中普通锦囊牌，整体为循环列表，每四种牌名为一循环小组，不重复设定，不足则重置并进入下一整体循环！
        const ZQY_compete = lib.config.extension_银竹离火_TAFset_TAF_ZQY_compete;//张琪瑛线下比赛投稿版
        if(ZQY_compete){
            get.icefalu = () => get._TAFskills(
                '法箓锦囊', setColor(
                '<li>法箓锦囊<li>　　「火烧连营丨出其不意丨随机应变丨推心置腹丨弃甲曳兵丨树上开花丨望梅止渴丨偷梁换柱」八张普通锦囊牌，整体为循环列表，每两种牌名为一循环小组，不足则重置并进入下一整体循环！'
            ));
            lib.translate.icefalu_info = setColor(
                '转换技、参赛版：<br>　　每回合限一次，可将一张牌当作任意〖'+ get.icefalu() +'〗使用或打出：阳，随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶；阴，随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底；以此法放置的牌称为〖法箓〗，然后随机获得至多一张〖法箓〗牌，且〖'+ get.icefalu() +'〗进入下一循环组。'
            );
        } else {
            get.icefalu = () => get._TAFskills(
                '法箓锦囊', setColor(
                '<li>法箓锦囊<li>　　「标准丨军争丨国战丨应变丨用间丨忠胆丨逐鹿丨运筹」卡牌库中普通锦囊牌，整体为循环列表，每四种牌名为一循环小组，不足则重置并进入下一整体循环！'
            ));
            lib.translate.icefalu_info = setColor(
                '转换技：<br>　　每回合限一次，你可以视为使用或打出一张任意标准基本牌及随机四张〖'+ get.icefalu() +'〗：阳，随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶；阴，随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底；以此法放置的牌称为〖法箓〗，然后随机获得至多一张〖法箓〗牌，且〖'+ get.icefalu() +'〗进入下一循环组。'
            );
        }
        //虎牢神吕布
        get.TAF_zhankai = () => get._TAFskills(
            '神武', setColor(
            '<li>神武装备牌：<li>〖金刚伏魔杵〗〖飞将神威剑〗〖无双修罗戟〗〖红莲紫金冠〗〖幽火摄魄令〗'
        ));
        lib.translate.TAF_zhankai_info = setColor(
            '锁定技：<br>　　出牌阶段开始时，随机装备一张〖'+ get.TAF_zhankai() +'〗牌；每累计受到其他角色〖叁〗/〖玖〗点伤害后：①你摸〖陆〗张牌，并令当前伤害来源受到一点伤害，随机弃置一张装备牌/否则你随机装备一张装备牌；②停止记录，当前事件结束后立即进入你的回合。'
        );
        get.TAF_shenfeng = () => get._TAFskills(
            '神锋', setColor(
            '<li>神锋<li>锁定技：<br>　　使用〖杀〗或〖决斗〗指定目标时，若此牌是/非转化牌，则随机获得并装备目标区域一张装备牌否则对目标造成一点⚡伤害/则随机获取目标手牌区域一张牌否则对目标造成一点🔥伤害。'
        ));
        get.TAF_liechu = () => get._TAFskills(
            '烈杵', setColor(
            '<li>烈杵<li>锁定技：<br>　　每回合使用〖杀〗或〖决斗〗第一次造成伤害后，每种卡牌限一次，若此牌是/非转化牌，获得牌堆顶/底〖陆〗张牌中所有〖装备牌〗〖基本牌〗〖决斗〗。'
        ));
        get.TAF_fumo = () => get._TAFskills(
            '伏魔', setColor(
            '<li>伏魔<li>锁定技：<br>　　每当你失去装备区的一张牌后，随机弃置所有其他角色两张牌(优先弃置装备区)，并随机获得至多两张非〖锦囊〗但包含〖决斗〗的牌。'
        ));
        get.TAF_jingang = () => get._TAFskills(
            '金刚', setColor(
            '<li>金刚<li>锁定技：<br>　　当你受到其他角色造成的一点伤害时/后，令其选择「交给你一张本回合你未记录的花色牌丨随机受到一点无来源的⚡或🔥伤害」 / 摸两张牌并可以使用一张〖桃〗牌。'
        ));
        get.TAF_shenji = () => get._TAFskills(
            '神戟', setColor(
            '<li>神戟<li>　　①摸牌阶段，可弃置所有手牌并将手牌摸至〖玖〗张；②使用非转化的〖杀〗或〖决斗〗可额外指定两个目标，且此〖杀〗的次数+2；使用转化的〖杀〗无距离与次数限制且无视目标防具。'
        ));
        lib.skill.TAF_xiuluo.derivation = [];
        lib.translate.TAF_xiuluo_info = setColor(
            '锁定技：<br>　　登场时，随机获得「'+ get.TAF_shenfeng() +'丨'+ get.TAF_liechu() +'丨'+ get.TAF_fumo() +'丨'+ get.TAF_jingang() +'」中的一个；体力值首次降至〖初始体力值〗的三分之二及以下后，再次随机获得剩余上述技能中的一个，并立即进入你的回合；当你体力值首次降至〖初始体力值〗的三分之一及以下后，获得技能「'+ get.TAF_shenji() +'」并立即进入你的回合。'
        );
        get.TAF_fumojingangchu = () => get._TAFskills(
            '金刚伏魔杵', setColor(
            '<li>金刚伏魔杵<li>　　你使用〖杀〗指定目标后，令其防具无效。你对有防具的角色造成的伤害+1。'
        ));
        get.TAF_feijiangshenweijian = () => get._TAFskills(
            '飞将神威剑', setColor(
            '<li>飞将神威剑<li>　　你使用〖杀〗造成伤害时，改为流失体力。每当有角色流失一点体力，你摸一张牌。'
        ));
        get.TAF_wushuangxiuluoji = () => get._TAFskills(
            '无双修罗戟', setColor(
            '<li>无双修罗戟<li>　　你的〖杀〗或〖决斗〗造成伤害后，你可以对受伤目标的一名相邻角色造成一点伤害。'
        ));
        get.TAF_honglianzijinguan = () => get._TAFskills(
            '红莲紫金冠', setColor(
            '<li>红莲紫金冠<li>　　你的回合结束时，你可以随机弃置所有其他角色一张牌。其中每有一张基本牌，你摸两张牌；每有一张装备牌，随机一名其他角色失去一点体力；每有一张锦囊牌，随机获得一名其他角色的一张牌。'
        ));
        get.TAF_youhuoshepoling = () => get._TAFskills(
            '幽火摄魄令', setColor(
            '<li>幽火摄魄令<li>　　出牌阶段结束时，你可以对所有其他角色随机造成一点⚡或🔥伤害，你回复等同于造成伤害数值的体力。'
        ));
        lib.translate.TAF_shenwu = "神武";
        lib.translate.TAF_shenwu_info = setColor(
            '神武装备牌：「'+ get.TAF_fumojingangchu() +'丨'+ get.TAF_feijiangshenweijian() +'丨'+ get.TAF_wushuangxiuluoji() +'丨'+ get.TAF_honglianzijinguan() +'丨'+ get.TAF_youhuoshepoling() +'」。'
        );
    }
    if (settings.sortcards) {
        lib.sort.card2 = function (a, b) {
            if (a.name !== b.name) return lib.sort.card(a.name, b.name);
            else if (a.suit !== b.suit) return lib.suit.indexOf(a.suit) - lib.suit.indexOf(b.suit);
            else if (a.number !== b.number) return a.number - b.number;
            else if (a.nature !== b.nature) return a.nature - b.nature;
            else return parseInt(a.cardid) - parseInt(b.cardid);
        };
        lib.skill._ThunderAndFireSortCards = {
            trigger: {
                player: ["gainAfter", "loseAfter"]
            },
            ruleSkill: true,
            priority: Infinity,
            direct: true,
            filter: function (event, player) {
                if (lib.config.extension_银竹离火_TAFset_sortcards === "false") return false;
                if (player === game.me && player.countCards("h")) {
                    var j = function (a, b) {
                        var n1 = a.length;
                        var n2 = b.length;
                        if (n1 !== n2) return 0;
                        for (var i = 0; i < n1; i++) {
                            if (a[i] !== b[i]) return 0;
                        }
                        return 1;
                    };
    
                    var cards = player.getCards("h");
                    var ca = cards.slice(0);
                    ca.sort(function (a, b) {
                        return lib.sort[player.useCard2 ? "rd_duel" : "card2"](a, b);
                    });
                    return j(ca, cards) !== 1;
                }
            },
            content: function() {
                "step 0";
                var sort = function (a, b) {
                    return -lib.sort[player.useCard2 ? "rd_duel" : "card2"](a, b);
                };
                var sort2 = function (a, b) {
                    var p1 = get.position(a);
                    var p2 = get.position(b);
                    if (p1 !== p2) {
                        if (p1 === "h") return 1;
                        else return -1;
                    }
                    return sort(a, b);
                };
                var cards = player.getCards("hs");
                if (cards.length > 1) {
                    if (window.dui && dui.queueNextFrameTick) {
                        cards.sort(sort2);
                        cards.forEach(function (i, j) {
                            player.node.handcards1.insertBefore(cards[j], player.node.handcards1.firstChild);
                        });
                        dui.queueNextFrameTick(dui.layoutHand, dui);
                    } else {
                        game.addVideo('lose', player, [get.cardsInfo(cards), [], []]);
                        for (var i = 0; i < cards.length; i++) {
                            cards[i].goto(ui.special);
                        }
                        cards.sort(sort2);
                        player.directgain(cards, false);
                    }
                }
            },
        };
    }
    game.TAFset_Background_Musics = function () {//背景音乐
        let temp = lib.config['extension_银竹离火_TAFset_Background_Musics'];
        if (temp == '0') {
            const randomNum = Math.floor(Math.random() * (14 - 2 + 1)) + 2;
            temp = randomNum.toString();
        };
        ui.backgroundMusic.pause();
        const item = {
            "2": "不凡.mp3",
            "3": "不由己.mp3",
            "4": "凡人.mp3",
            "5": "凡人不凡.mp3",
            "6": "归潮.mp3",
            "7": "归期.mp3",
            "8": "落英.mp3",
            "9": "屁.mp3",
            "10": "少年不凡.mp3",
            "11": "天地行.mp3",
            "12": "望乡曲.mp3",
            "13": "勿听.mp3",
            "14": "修仙缘.mp3",
        };
        if (item[temp]) {
            ui.backgroundMusic.src = lib.assetURL + 'extension/银竹离火/audio/backgroundMusic/' + item[temp];
        } else {
            game.playBackgroundMusic();
            ui.backgroundMusic.addEventListener('ended', game.playBackgroundMusic);
        }
    };
    if (settings.Musics && settings.Musics != "1") {
        lib.arenaReady.push(function () {
            game.TAFset_Background_Musics();
            ui.backgroundMusic.addEventListener('ended', game.TAFset_Background_Musics);
        });
    };
    game.TAFset_Background_Pictures = function () {//背景图片
        let temp = lib.config['extension_银竹离火_TAFset_Background_Pictures'];
        if (temp == 'auto') {
            const list = [
                'picture1',
                'picture2',
                'picture3',
                'picture4',
                'picture5',
                'picture6',
                'picture7',
                'picture8',
                'picture9',
                'picture10',
                'picture11',
                'picture12',
            ];
            if (_status.TAFBKskill) list.remove(_status.TAFBKskill);
            temp = list.randomGet();
        }
        _status.TAFBKskill = temp;
        if (temp !== '1') {
            game.broadcastAll() + ui.background.setBackgroundImage("extension/银竹离火/image/background/" + temp + ".png");
        } else {
            game.broadcastAll() + ui.background.setBackgroundImage('image/background/' + lib.config.image_background + '.png');
        }
        const item = lib.config['extension_银竹离火_TAFset_Background_Pictures'];
        if (item != "auto") {
            if (_status.TAFset_Background_Pictures_timeout) {
                clearTimeout(_status.TAFset_Background_Pictures_timeout);
            };
        } else if (item == "auto") {
            const autotime = lib.config['extension_银竹离火_TAFset_Background_Pictures_auto'];
            const Timeout = autotime ? parseInt(autotime) : 30000;
            const Timeout2 = _status.TAFset_Background_Pictures_Timeout2;
            if (_status.TAFset_Background_Pictures_timeout && Timeout2 && Timeout2 != Timeout) {
                clearTimeout(_status.TAFset_Background_Pictures_timeout);
            };
            _status.TAFset_Background_Pictures_timeout = setTimeout(function () {
                game.TAFset_Background_Pictures();
            }, Timeout);
            _status.TAFset_Background_Pictures_Timeout2 = Timeout;
        };
    };
    if (settings.Background && settings.Background !== "1") {
        lib.arenaReady.push(function () {
            game.TAFset_Background_Pictures();
        });
    }
    if (settings.autoSwap) {//自娱自乐
        lib.skill._ThunderAndFire_autoswap = {
            trigger: {
                player: [
                    "playercontrol",
                    "chooseToUseBegin",
                    "chooseToRespondBegin",
                    "chooseToDiscardBegin",
                    "chooseToCompareBegin",
                    "chooseButtonBegin",
                    "chooseCardBegin",
                    "chooseTargetBegin",
                    "chooseCardTargetBegin",
                    "chooseControlBegin",
                    "chooseBoolBegin",
                    "choosePlayerCardBegin",
                    "discardPlayerCardBegin",
                    "gainPlayerCardBegin",
                    "chooseToMoveBegin",
                    "chooseToPlayBeatmapBegin",
                    "chooseToGiveBegin",
                ],
            },
            ruleSkill: true,
            priority: Infinity,
            direct: true,
            filter: function (event, player) {
                if (!game.getExtensionConfig("银竹离火", "TAFset_autoSwap")) return false;
                if (event.autochoose && event.autochoose()) return false;
                if (lib.filter.wuxieSwap(event)) return false;
                if (_status.auto || player.isUnderControl(true))
                    return false;
                return true;
            },
            content: function () {
                game.swapPlayerAuto(player);
            },
        };
        lib.arenaReady.push(()=>{
            let button = ui.create.system("自娱自乐",function(){
                var bool = this.classList.toggle("glow");
                game.saveConfig("extension_银竹离火_TAFset_autoSwap", bool);
            }, true);
            button.classList.toggle("glow", Boolean(game.getExtensionConfig("银竹离火", "TAFset_autoSwap")));
        });
    }
}