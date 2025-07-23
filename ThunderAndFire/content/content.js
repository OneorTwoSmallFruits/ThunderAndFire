import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'../precontent/functions.js';
const { setColor } = ThunderAndFire;//银竹离火函数
const settings = {
    rarity : lib.config.extension_银竹离火_TAFset_rarity,
    gifs : lib.config.extension_银竹离火_TAFset_gifs,
    skinschange : lib.config.extension_银竹离火_TAFset_skinschange,
    charReplace : lib.config.extension_银竹离火_TAFset_charReplace,
    SkillsTips : lib.config.extension_银竹离火_TAFset_SkillsTips,
    sortcards : lib.config.extension_银竹离火_TAFset_sortcards,
    Musics : lib.config.extension_银竹离火_TAFset_Background_Musics,
    Background : lib.config.extension_银竹离火_TAFset_Background_Pictures,
    autoSwap: lib.config.extension_银竹离火_TAFset_autoSwap,
    addjianglingSkills: lib.config.extension_银竹离火_TAFset_addjianglingSkills,
};
import characters from "../characters/character.js";
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "../characters/character.js";
const 银竹离火武将列表 = Object.keys(characters);
const 将灵协战列表 = Object.keys(将灵专属);
export async function content() {
    const prefixStyles = {
        "#EE9A00": ["天弓", "皓月", "灵"],
        "#ee9ac7": ["蝶", "喵", "SE", "轩辕", "容成", "申屠", "闻人", "公仪"],
        "#0088CC": ["银竹", "◈", "明"],
        "#FF2400": ["离火", "文"],
        "#48D1CC": ["临泽"],
        "#AFEEEE": ["玉蝶"]
    };

    for (const color in prefixStyles) {
        const texts = prefixStyles[color];
        for (const txt of texts) {
            lib.namePrefix.set(txt, { color: color, nature: 
                color === "#EE9A00" ? "soil" : 
                color === "#0088CC" || color === "#FF2400" || color === "#AFEEEE" ? "ice" :
                color === "#48D1CC" ? "water" :
                "firemm"
            });
        }
    }
    if (settings.rarity) {//武将评级
        const setlegend = [ 
            ...Object.keys(隐忍天弓), ...Object.keys(鼎足三分), ...Object.keys(星河皓月), ...Object.keys(星河皓月), 
            ...Object.keys(异构Boss), ...Object.keys(将灵专属), ...Object.keys(测试专属), ...Object.keys(爆料体验), 
        ];
        const setepic = 银竹离火武将列表.filter(x => !setlegend.includes(x));
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
        //移除全局设定
    }
    if (settings.charReplace) {
        function setcharReplace() { 
            let Replaces = lib.characterReplace;
            let characterlists = Object.keys(lib.character);
            let getcharacters = [
                ...Object.keys(隐忍天弓), ...Object.keys(鼎足三分), ...Object.keys(星河皓月), ...Object.keys(惊世银竹), 
                ...Object.keys(期期离火), ...Object.keys(欲雨临泽), ...Object.keys(惊鸿玉蝶), ...Object.keys(神话再临), 
            ];
            for  (let name of getcharacters) {
                if (!Replaces[name]) Replaces[name] = [];
                const fanyi = lib.translate[name];
                if (!fanyi || typeof fanyi != 'string') continue;
                const prefix = lib.translate[name + '_prefix'] || '';
                const setname = fanyi.replace(prefix, '');
                if (setname) {
                    const filters = characterlists.filter(player => lib.translate[player] && lib.translate[player].includes(setname));
                    if (filters.length) {
                        Replaces[name].push(...filters);
                    }
                }
            }
        }
        setcharReplace();
    }
    if (settings.SkillsTips) {
        lib.init.css(lib.assetURL + 'extension/银竹离火/ThunderAndFire/otherSettings/css', 'ThunderAndFire_SkillTips');
        get.ThunderAndFireSkills = function (str1, str2) {
            return '<abbr title=\"' + str2 + '\"><ins>' + str1 + '</ins></abbr>';
        };
        game.ThunderAndFirePhone = function () {
            const info = navigator.userAgent;
            return /mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(info);
        };
        get.ThunderAndFireSkillTips = function (tipname, id) {
            const dibeijing = ui.create.div('.ThunderAndFireBackground', document.body);
            dibeijing.style.zIndex = '9999';

            const skilltip = ui.create.div('.ThunderAndFireSkillsTips', dibeijing);
            skilltip.innerHTML = tipname;
            skilltip.style.position = 'absolute';
            skilltip.style.cursor = 'move';
            skilltip.draggable = false;

            const herf = document.getElementById(id);
            if (herf) {
                let left = herf.getBoundingClientRect().left;
                if (game.ThunderAndFirePhone()) left += herf.offsetParent.offsetLeft;
                left += document.body.offsetWidth * 0.15;
                skilltip.style.left = left + 'px';
                skilltip.style.top = (herf.getBoundingClientRect().top + 30) + 'px';
            }

            let offsetX = 0, offsetY = 0;
            let isDragging = false;

            const getEventPos = (e) => {
                const touch = e.touches ? e.touches[0] : e;
                return {
                    x: touch.clientX,
                    y: touch.clientY
                };
            };

            const onDown = (e) => {
                isDragging = true;
                const pos = getEventPos(e);
                offsetX = pos.x - parseFloat(skilltip.style.left || 0);
                offsetY = pos.y - parseFloat(skilltip.style.top || 0);
                e.preventDefault();
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const pos = getEventPos(e);
                skilltip.style.left = (pos.x - offsetX) + 'px';
                skilltip.style.top = (pos.y - offsetY) + 'px';
                e.preventDefault();
            };

            const onUp = () => {
                isDragging = false;
            };

            // 添加拖拽事件监听
            skilltip.addEventListener('mousedown', onDown);
            skilltip.addEventListener('mousemove', onMove);
            skilltip.addEventListener('mouseup', onUp);

            skilltip.addEventListener('touchstart', onDown);
            skilltip.addEventListener('touchmove', onMove);
            skilltip.addEventListener('touchend', onUp);

            // 新增：点击任意位置关闭提示框
            const removeTip = (e) => {
                if (!dibeijing.contains(e.target)) {
                    dibeijing.remove();
                    document.removeEventListener('click', removeTip);
                    document.removeEventListener('touchstart', removeTip);
                }
            };

            // 延迟绑定点击事件（避免刚点出就关掉）
            setTimeout(() => {
                document.addEventListener('click', removeTip);
                document.addEventListener('touchstart', removeTip);
            }, 100);

            dibeijing.listen(function (e) {
                e.stopPropagation();
                this.remove();
                document.removeEventListener('click', removeTip);
                document.removeEventListener('touchstart', removeTip);
            });
        };
        function skillTip(colorType, str1, str2) {
            const tempId = Math.random().toString(36).slice(-8);
            const colorMap = {
                red: { color: '#FF2400', underline: '#0088CC' },
                blue: { color: '#0088CC', underline: '#FF2400' }
            };
            const { color, underline } = colorMap[colorType];

            return `<a id='${tempId}' style='color:${color}; text-decoration: none; font-weight: bold; position: relative;' 
                            href="javascript:get.ThunderAndFireSkillTips('${setColor(str2)}','${tempId}');">
                                <span style='position: relative; display: inline-block;'>${str1}
                                    <span style='position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px; background-color: ${underline};'></span>
                                </span>
                            </a>`;
        }
        get.redSkillTips = (str1, str2) => skillTip('red', str1, str2);
        get.blueSkillTips = (str1, str2) => skillTip('blue', str1, str2);
        //司马懿
        const 雄奕 = get.blueSkillTips('雄奕', '<li>雄奕<li>　　当你「造成/受到」一点伤害时，你可摸已拥有「势力标记数」张牌，若如此做：则令场上玩家依次摸一张牌，并随之获得其区域内一张牌，然后弃置「以此法获得牌数半数向下取整」张牌；若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点随机属性伤害「⚡丨🔥丨❄️」，然后本技能失效至该回合结束。');
        lib.translate.sunpingling_info = setColor(
            '势力转换技「魏丨晋」：<br>　　①当一名角色进入濒死状态时，且未获得全部势力标记：每名其他角色限一次/你每轮限一次，你将依次获得「魏」「蜀」「吴」标记，并回复一点体力摸当前已拥有「势力标记数」张牌；<br>　　②当获得全部势力标记时：将体力值上限调整至四并恒定之、势力调整至「晋」、修改技能〖'+ 雄奕 +'〗，最后失去本技能。'
        );
        //曹操、孙权、刘备、张角
        const 飞影 = get.blueSkillTips('飞影', '<li>护驾·飞影<li>非锁定技：　　每回合限一次，当你受到魏势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。');
        const 的卢 = get.blueSkillTips('的卢', '<li>结营·的卢<li>非锁定技：　　每回合限一次，当你受到蜀势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。');
        const 玉龙 = get.blueSkillTips('玉龙', '<li>权术·玉龙<li>非锁定技：　　每回合限一次，当你受到吴势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。');
        const 结义 = get.blueSkillTips('结义', '<li>结义<li>转换技：<br>　　每轮游戏限一次完整转换，阳：进入濒死状态前，可摸一张牌并令刘备摸两张牌，若如此做：其手牌数大于体力值则其可令你摸一张牌；阴：脱离濒死状态后(存活)，可弃一张牌并令刘备回复一点体力，若如此做：其为满体力则其可令你摸两张牌。');
        const 权道 = get.blueSkillTips('权道', '<li>权道<li>转换技：<br>　　每轮游戏限一次完整转换，阳：造成伤害后，你可摸一张牌并弃置两张牌，若如此做：孙权回复一点体力并可移动场上一张牌；阴：受到伤害后，你可摸两张牌并弃置一张牌，若如此做：孙权摸一张牌并可弃置场上一张牌。');
        lib.translate.thunderhujia_info = setColor(
            '主公技：<br>　　①每轮限一次，当你进入濒死状态时，你可以对一名其他魏势力角色造成一点伤害，其并将区域内牌数调整至其体力值上限，然后你回复体力至一点；②修改技能〖'+飞影+'〗。'
        );
        lib.skill.firejieying.derivation = [];
        lib.translate.firejieying_info = setColor(
            '主公技：<br>　　①游戏进场时/当一名角色回合开始或结束时，若场上存在未拥有〖'+结义+'〗技能的其他蜀势力角色，使其获得技能〖'+结义+'〗；②修改技能〖'+的卢+'〗、〖昭仁〗界改为神。'
        );
        lib.skill.waterquanshu.derivation = [];
        lib.translate.waterquanshu_info = setColor(
            '主公技：<br>　　①游戏进场时/当一名角色回合开始或结束时，若场上存在未拥有〖'+权道+'〗技能的其他吴势力角色，使其获得技能〖'+权道+'〗；②修改技能〖'+玉龙+'〗。'
        );
        //郭嘉
        const 十胜十败 = get.blueSkillTips('十胜十败', '<li>十胜十败<li>延时类锦囊牌：　　出牌阶段，对自己使用，判定阶段若判定结果在点数十之内，奇数且为♠ / 偶数且为♥，则你须选择一名非郭嘉其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害；无有效目标或判定失败后，移动至下家判定区！');
        const 论势 = get.blueSkillTips('论势', '<li>论势·改<li>　　你可以将一张〖十胜十败〗牌当任意基本牌或普通锦囊使用或打出，且摸一张牌。');
        const 遗计 = get.blueSkillTips('遗计', '<li>遗计<li>　　你可以将一张〖十胜十败〗牌当任意基本牌或普通锦囊使用或打出，且摸一张牌。');
        lib.translate.thunderqizuo_info = setColor(
            '锁定技：<br>　　游戏进场/每轮游戏开始时，将十张〖'+十胜十败+'〗加入牌堆/将一张〖'+十胜十败+'〗牌置入判定区；每当一张〖'+十胜十败+'〗进入弃牌堆时，摸一张牌；区域内牌的点数不大于十，手牌上限 + 场上判定区牌总数至多为四。'
        );
        lib.skill.thunderlunshi.derivation = [];
        lib.translate.thunderlunshi_info = setColor(
            '　　当一名其他角色判定生效后，若判定结果为非〖'+十胜十败+'〗生效结果，则你判定一次〖'+十胜十败+'〗效果：若判定失败，则可令至多场上魏势力人数名角色各摸你已损失体力值数且至少为一张牌；你于本局游戏发动三次本技能后获得技能〖'+遗计+'〗，并修改〖'+论势+'〗。'
        );
        //诸葛亮《转阵》及《四象技》补充说明
        const 转阵 = get.blueSkillTips('转阵', '<li>转阵<li>　　点数「壹至拾叁」重新随机分布于「两仪丨四象丨八阵」中，两仪分配一点与「♠丨♣」和「♥丨♦」随机组合，四象分配四点与「♠丨♥丨♦丨♣」依次组合，八阵分配八点与「坎丨艮丨震丨巽丨离丨坤丨兑丨乾」依次组合。');
        const 四象技 = get.blueSkillTips('四象技', '<li>四象技<li>〖玄武〗:锁定技：受到的伤害时，摸一张牌且此伤害不会大于一点，直到你的下个回合结束。；<li>〖青龙〗:锁定技：每回合第一次受到伤害后回复一点体力，直到你的下个回合结束；<li>〖朱雀〗:锁定技：获得此技能时，立即获得一张♦杀；♦杀无距离限制且造成伤害时视为🔥伤害，直到你的下个回合结束；<li>〖白虎〗:锁定技：获得此技能时，立即获得一张♣杀；♣杀不可被响应且造成伤害时视为⚡伤害，直到你的下个回合结束。');
        lib.translate.starszhuanzhen_info = setColor(
            '持恒技：<br>　　每当缺失完整两仪后/每当缺失完整四象后/每当八阵数缺七的倍数后「整局游戏不重复」，你可以选择失去/回复/失去一点体力，重新〖'+转阵+'〗。'
        );
        lib.skill.starssixiang.derivation = [];
        lib.translate.starssixiang_info = setColor(
            '　　当一名其他角色受到伤害时，若其〖'+四象技+'〗小于贰，你可令其随机获得一张四象牌并移除一象，其获得对应〖'+四象技+'〗直到其下个回合结束；若场上存在其他蜀势力角色或首次脱离濒死状态后，将其他角色改为角色。'
        );
        //周瑜
        const 琴音 = get.redSkillTips('琴音', '<li>琴音♥<li>令至多场上吴势力人数名其他角色执行一项：①交给你一张牌其回复一点体力；②令你摸一张牌其失去一点体力。');
        const 棋势 = get.blueSkillTips('棋势', '<li>棋势♠<li>令一名其他角色弃置所有♠牌：若弃置了♠牌其摸一张牌，否则你获得非♠牌各一张。');
        const 书笔 = get.redSkillTips('书笔', '<li>书笔♦<li>摸一张牌并展示之，然后依次执行以下项：①若此牌为♦，获得一张非♦牌；②若此时区域内有牌，则你重铸一张牌。');
        const 画意 = get.blueSkillTips('画意', '<li>画意♣<li>随机获得场上一张牌，此牌来源摸一张牌，若此牌类型为：1.基本：下一张基本牌基础数值+1；2.锦囊：下一张普通锦囊牌无距离限制可多指定两个目标；3.装备：重铸区域内所有♣牌，若无则摸一张牌。');
        lib.translate.moonyingmou_info = setColor(
            '　　当你失去卡牌后，若失去的卡牌中含有「'+琴音+'丨'+棋势+'丨'+书笔+'丨'+画意+'」对应标签，每回合每项限「体力值：奇数:贰丨偶数:壹」次，你执行对应标签项。'
        );
        //银竹离火《羁绊技》说明
        const 羁绊技 = get.redSkillTips('羁绊技', '<li>羁绊技<li>玩家释放此技能时，场上对应的羁绊角色均执行本技能增益效果。');
        lib.translate.thunderyujun_info = setColor(
            羁绊技 + '「姜维」：<br>　　当一名其他角色进入濒死状态时，每轮游戏限一次，你可以选择一张⚡标记并横置，然后令其获得此牌并展示之，若如此做：①其回复一点体力，并摸此牌名字数张牌：②新的一轮开始时，你横置并受到一点无来源的🔥伤害。'
        );
        lib.translate.fireyujun_info = setColor(
            //羁绊技「钟会」：<br>　　当一名其他角色脱离濒死状态后若其存活，每回合限一次，则你可从〖麟焱〗记录中选择一个未选择过的记录牌名并横置，然后令其获得一张同名牌并展示之，若如此做：①其回复一点体力，并摸此牌名字数张牌：②该回合结束时，你横置并受到一点无来源的⚡伤害。
            羁绊技 +'「钟会」：<br>　　当一名其他角色脱离濒死状态后若其存活，每回合限一次，则你可从〖麟焱〗记录中选择一个未选择过的记录牌名并横置，然后令其获得一张同名牌并展示之，若如此做：①其回复一点体力，并摸此牌名字数张牌：②该回合结束时，你横置并受到一点无来源的⚡伤害。'
        );
        //曹纯
        const 攻伐 = get.blueSkillTips('攻伐', '<li>攻伐<li>　　①你计算与其他角色距离时-1，坐骑牌均视为「雷杀」且无距离限制；<br>　　②摸牌阶段摸牌时改为获得四种花色各一张，然后弃置一张牌：若你以此法弃置了：基本牌：可视为使用一张不计入次数限制的「雷杀」；装备牌：若场上存在可移动的牌则可移动一张；锦囊牌：本回合使用锦囊牌时无距离限制且摸一张牌。');
        const 御守 = get.blueSkillTips('御守', '<li>御守<li>　　①其他角色与你计算距离时+1；坐骑牌均视为「闪」；<br>　　②每轮每项限两次，受到⚡属性/非⚡属性伤害时，取消受到的⚡属性伤害改为回复一点体力/从牌堆或弃牌堆中获取你已损失体力值数与场上魏势力人数之和张牌名不同且副类别不同的牌，并于此时弃置多于七张的手牌。');
        lib.skill.thundershanjia.derivation = [];
        lib.translate.thundershanjia_info = setColor(
            '转换技：<br>　　武将牌无坐骑栏且游戏进场/回合结束时，武将牌翻面(正/反为阳/阴)，阳：切换至本状态后，解除横置并获得技能〖'+攻伐+'〗，每轮限两次，立即结束当前非你的出牌阶段，进入额外的回合；阴：切换至本状态后，进入横置并获得技能〖'+御守+'〗，立即执行一次受到非⚡属性伤害内容，不计入次数限制。'
        );
        //赵襄
        const 龙魂 = get.blueSkillTips('龙魂', '<li>龙魂<li>你可以将至多两张同花色「♦丨♣丨♥丨♠」当对应的「火杀丨闪丨桃丨无懈」使用或打出。若以此法转化了壹/贰张牌：红色，随机获得一张黑色牌/此牌基础数值加一；黑色，随机获得一张红色牌/获得当前回合角色一张牌。');
        const 绝骑 = get.blueSkillTips('绝骑', '<li>绝骑<li>　　出牌阶段限两次，可弃置一张牌并令一名未对其发动过此技能的其他角色展示一张手牌，若如此做：<br>　　①若此牌为黑色，则其弃置此牌并被标记「义绝」，然后其可令你失去一点体力并摸一张牌；<br>　　②若此牌为红色，则你获得此牌其被标记「封印」，然后你可令其回复一点体力并摸一张牌。');
        const 翼弓 = get.blueSkillTips('翼弓', '<li>翼弓<li>　　回合内使用的非转化〖杀〗造成的伤害时，可摸一张牌并受到一点🔥伤害，若如此做：令此〖杀〗造成的伤害+1，并重置〖杀〗的使用次数；当一名角色因受到来自你的伤害而死亡后，你移除所有凤魄标记，然后本技能失效至本回合结束。');
        lib.translate.firefengpo_info = setColor(
            '　　当你使用基本牌成为基本牌的目标后，你获得一枚「凤魄」标记；你可以弃置一枚「凤魄」标记来发动〖'+龙魂+'〗并摸一张牌。'
        );
        lib.skill.firehunyou.derivation = [];
        lib.translate.firehunyou_info = setColor(
            '锁定技：<br>　　①额定摸牌数量为3；你的手牌上限+2；计算与其他角色距离时-1；<br>　　②出牌阶段开始时，若你的「凤魄」标记数不小于五，则弃置所有「凤魄」标记并回复一点体力摸两张牌，然后获得〖'+绝骑+'〗〖'+翼弓+'〗直到本回合结束。'
        );
        //姜维
        //势力转换技「蜀丨群」：<br>　　当一张或多张「非伤害」标签牌进入弃牌堆时，若有未记录的牌名则记录之，每当记录大于等于「叁」的一个倍数时，你可选择一个未选择过的记录牌名获得一张同名牌并展示之，若如此做执行以下可执行项：<br>　　①若此牌点数小于记录数，你回复一点体力；<br>　　②令一名其他角色交予你一张牌，若此牌点数小于展示牌点数，则对其造成一点🔥伤害，否则其摸一张牌；<br>　　③当记录数量大于等于「玖」时：势力切换至「群」、获得〖燃己〗、本技能失效至脱离濒死状态后反向执行此项，并重置〖麟焱〗。
        const 燃己 = get.blueSkillTips('燃己', '<li>燃己<li>　　当一名其他角色受到伤害且来源不为你时，则你可从〖麟焱〗记录中选择一个未选择过的记录牌名令其获得一张同名牌并展示之，若如此做：你随机获得此牌花色序数与牌名字数之和张点数不同且牌名不同的牌，并弃置以此法获得牌数半数向下取整张牌，最后将此伤害转移至你；若该回合当前本技能使用次数大于其已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点无来源的🔥伤害，然后本技能失效至该回合结束。');
        lib.skill.firelinyan.derivation = [];
        lib.translate.firelinyan_info = setColor(
            '势力转换技「蜀丨群」：<br>　　当一张或多张「非伤害」标签牌进入弃牌堆时，若有未记录的牌名则记录之，每当记录大于等于「叁」的一个倍数时，你可选择一个未选择过的记录牌名获得一张同名牌并展示之，若如此做执行以下可执行项：<br>　　①若此牌点数小于记录数，你回复一点体力；<br>　　②令一名其他角色交予你一张牌，若此牌点数小于展示牌点数，则对其造成一点🔥伤害，否则其摸一张牌；<br>　　③当记录数量大于等于「玖」时：势力切换至「群」、获得〖'+燃己+'〗、本技能失效至脱离濒死状态后反向执行此项，并重置〖麟焱〗。'
        );
        //貂蝉
        const 贪 = get.blueSkillTips('贪', '<li>贪<li>　　使用牌后，每回合每种类型限一次，摸剩余类型数张牌并弃置已使用类型数张牌，每次使该回合手牌上限-该次获得牌数；该回合弃牌阶段开始时，场上所有貂蝉摸反向手牌上限数张牌。');
        const 嗔 = get.blueSkillTips('嗔', '<li>嗔<li>　　立即随机获得两张牌，回合内只能使用这些类型的卡牌。');
        const 痴 = get.blueSkillTips('痴', '<li>痴<li>　　使用牌后，每回合每种花色限一次，选择执行一项：①弃置一张牌；②场上所有貂蝉摸一张牌。');
        const 戾 = get.blueSkillTips('戾', '<li>戾<li>　　当戾/非戾角色，使用伤害标签牌指定单一的非貂蝉的目标后，若该目标为非戾/戾角色，则可弃置一张牌令场上所有貂蝉摸一张牌，若如此做，此牌对该目标角色造成的伤害+1。');
        const 疑 = get.blueSkillTips('疑', '<li>疑<li>　　回合内无法对自己/回合外无法对其他角色，使用非伤害标签牌。');
        lib.skill.icelijian.derivation = [];
        lib.translate.icelijian_info = setColor(
            '　　当一名其他角色第奇数/偶数次造成伤害后，若此时为其回合内，每回合每项限三次：①你可交予其一张手牌，若其该回合再次造成伤害后，其摸此牌名字数张牌，你摸此牌花色序数张牌；②你可令其从「'+贪+'丨'+嗔+'丨'+痴+'丨'+戾+'丨'+疑+'」技能中随机获得未拥有的一个技能，直到其下个回合结束(每名角色至多拥有三个)。'
        );
        //BOSS神吕布与吕玲绮
        const 神锋 = get.blueSkillTips('神锋', '<li>神锋<li>锁定技：<br>　　使用〖杀〗或〖决斗〗指定目标时，若此牌是/非转化牌，则随机获得并装备目标区域一张装备牌否则对目标造成一点⚡伤害/则随机获取目标手牌区域一张牌否则对目标造成一点🔥伤害。');
        const 烈杵 = get.blueSkillTips('烈杵', '<li>烈杵<li>锁定技：<br>　　每回合使用〖杀〗或〖决斗〗第一次造成伤害后，每种卡牌限一次，若此牌是/非转化牌，获得牌堆顶/底〖陆〗张牌中所有〖装备牌〗〖基本牌〗〖决斗〗。');
        const 伏魔 = get.blueSkillTips('伏魔', '<li>伏魔<li>锁定技：<br>　　每当你失去装备区的一张牌后，随机弃置所有其他角色两张牌(优先弃置装备区)，并随机获得至多两张非〖锦囊〗但包含〖决斗〗的牌。');
        const 金刚 = get.blueSkillTips('金刚', '<li>金刚<li>锁定技：<br>　　当你受到其他角色造成的一点伤害时/后，令其选择「交给你一张本回合你未记录的花色牌丨随机受到一点无来源的⚡或🔥伤害」 / 摸两张牌并可以使用一张〖桃〗牌。');
        const 神戟 = get.blueSkillTips('神戟', '<li>神戟<li>　　①摸牌阶段，可弃置所有手牌并将手牌摸至〖玖〗张；②使用非转化的〖杀〗或〖决斗〗可额外指定两个目标，且此〖杀〗的次数+2；使用转化的〖杀〗无距离与次数限制且无视目标防具。');
        
        const 金刚伏魔杵 = get.blueSkillTips('金刚伏魔杵', '<li>金刚伏魔杵<li>　　你使用〖杀〗指定目标后，令其防具无效。你对有防具的角色造成的伤害+1。');
        const 飞将神威剑 = get.blueSkillTips('飞将神威剑', '<li>飞将神威剑<li>　　你使用〖杀〗造成伤害时，改为流失体力。每当有角色流失一点体力，你摸一张牌。');
        const 无双修罗戟 = get.blueSkillTips('无双修罗戟', '<li>无双修罗戟<li>　　你的〖杀〗或〖决斗〗造成伤害后，你可以对受伤目标的一名相邻角色造成一点伤害。');
        const 红莲紫金冠 = get.blueSkillTips('红莲紫金冠', '<li>红莲紫金冠<li>　　你的回合结束时，你可以随机弃置所有其他角色一张牌。其中每有一张基本牌，你摸两张牌；每有一张装备牌，随机一名其他角色失去一点体力；每有一张锦囊牌，随机获得一名其他角色的一张牌。');
        const 幽火摄魄令 = get.blueSkillTips('幽火摄魄令', '<li>幽火摄魄令<li>　　出牌阶段结束时，你可以对所有其他角色随机造成一点⚡或🔥伤害，你回复等同于造成伤害数值的体力。');
        lib.skill.iceshenwu.derivation = [];
        lib.translate.iceshenwu_info = setColor(
            '　　出牌阶段开始时，可以展示全部手牌，根据展示的“类型数”获得对应效果：<br>　　>=1：从牌堆或弃牌堆随机检索一张〖杀〗获得之；<br>　　>=2：此阶段使用牌无距离限制，第一张〖杀〗和第一张〖决斗〗造成伤害后可获得目标区域一张牌；<br>　　>=3：此阶段使用〖杀〗或〖普通锦囊牌〗可以多指定两个目标，并从〖'+神锋+'〗〖'+烈杵+'〗〖'+伏魔+'〗〖'+金刚+'〗中随机一个技能获得之，直到你下个出牌阶段开始时。'
        );
        lib.translate.TAF_zhankai_info = setColor(
            '锁定技：<br>　　出牌阶段开始时，随机装备一张〖神武装备牌〗；每累计受到其他角色〖叁〗/〖玖〗点伤害后：①你摸〖陆〗张牌，并令当前伤害来源受到一点伤害，随机弃置一张装备牌/否则你随机装备一张装备牌；②停止记录，当前事件结束后立即进入你的回合。'
        );
        lib.skill.TAF_xiuluo.derivation = [];
        lib.translate.TAF_xiuluo_info = setColor(
            '锁定技：<br>　　登场时，随机获得〖'+神锋+'〗〖'+烈杵+'〗〖'+伏魔+'〗〖'+金刚+'〗中的一个；体力值首次降至〖初始体力值〗的三分之二及以下后，再次随机获得剩余上述技能中的一个，并立即进入你的回合；当你体力值首次降至〖初始体力值〗的三分之一及以下后，获得技能〖'+神戟+'〗并立即进入你的回合。'
        );
        lib.translate.TAF_shenwu_equips_info = setColor(
            '〖'+金刚伏魔杵+'〗〖'+飞将神威剑+'〗〖'+无双修罗戟+'〗〖'+红莲紫金冠+'〗〖'+幽火摄魄令+'〗'
        );
        //张琪瑛
        const ZQY_compete = lib.config.extension_银竹离火_TAFset_TAF_ZQY_compete;//张琪瑛线下比赛投稿版
        let 法箓锦囊;
        if(ZQY_compete){
            法箓锦囊 = get.blueSkillTips('法箓锦囊', '<li>法箓锦囊<li>①〖法箓锦囊〗：「火烧连营丨出其不意丨随机应变丨推心置腹丨弃甲曳兵丨树上开花丨望梅止渴丨偷梁换柱」八张普通锦囊牌，整体为循环列表，每两种牌名为一循环小组，不足则重置并进入下一整体循环！②〖法箓〗牌对获得的人可见。');
            lib.translate.icefalu_info = setColor(
                '转换技、参赛版：<br>　　每回合限一次，可将一张牌当作任意〖'+法箓锦囊+'〗使用或打出，阳：随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶；阴：随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底；以此法放置的牌称为〖法箓〗，并随机获得至多一张〖法箓〗牌，然后〖'+法箓锦囊+'〗进入下一循环组。'
            );
        } else {
            法箓锦囊 = get.blueSkillTips('法箓锦囊', '<li>法箓锦囊<li>①〖法箓锦囊〗：「标准丨军争丨国战丨应变丨用间丨忠胆丨逐鹿丨运筹」卡牌库中普通锦囊牌，整体为循环列表，每四种牌名为一循环小组，不足则重置并进入下一整体循环！②〖法箓〗牌对获得的人可见。');
            lib.translate.icefalu_info = setColor(
                '转换技：<br>　　每回合限一次，你可以视为使用或打出任意一张〖'+法箓锦囊+'〗，阳：随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶；阴：随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底；以此法放置的牌称为〖法箓〗，并随机获得至多一张〖法箓〗牌，然后〖'+法箓锦囊+'〗进入下一循环组。'
            );
        }
        //曹婴
        const 归心 = get.blueSkillTips('归心', '<li>归心<li>　　当你受到一点伤害时，则你可令场上「非魏势力角色」依次摸一张牌，然后获得所有玩家区域内一张牌并弃置以此法获得牌数半数向下取整张牌；若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至四翻面横置并受到一点⚡伤害，然后本技能失效至该回合结束。');
        const 行殇 = get.blueSkillTips('行殇', '<li>行殇<li>　　每轮游戏每名其他角色限一次，当其进入濒死状态时，你可选择弃置区域内 你已损失体力值数 / 你体力值数 张牌(至少为一)，然后执行对应项：随机使用一张装备牌，失去一点体力并摸场上魏势力人数张牌 / 随机失去一张装备牌，回复一点体力并获得其区域内半数向上取整张牌。');
        lib.skill.icelingren.derivation = [];
        lib.translate.icelingren_info = setColor(
            '势力转换技「群丨魏」：<br>　　当你使用带有「伤害」标签的牌指定目标后，每回合限一次，你可以猜测其中的一个目标的手牌中是否有「基本牌丨锦囊牌丨装备牌」，若猜中的项目数：<br>　　丨≥1：你摸一张牌，此牌对该角色的伤害+1；<br>　　丨≥2：你摸一张牌，并获得技能〖'+归心+'〗，直到你的下回合开始；<br>　　丨≥3：你摸一张牌，并获得技能〖'+行殇+'〗并将势力转换至「魏」直到你的下回合开始！'
        );

        //蝶贾诩
        const 吴起兵法 = get.blueSkillTips('吴起兵法', '<li>吴起兵法<li>　　当此牌离开你的装备区时，你销毁之；然后你令至多X名角色于本回合结束时将一张牌当〖杀〗使用（X为你的技能数）。');
        const 络殊技能池 = get.blueSkillTips('络殊技能池', '<li>络殊技能池<li>〖乱武〗〖间书〗〖拥嫡〗〖兴衰〗〖焚城〗〖奇谋〗〖雄异〗〖凶算〗〖造王〗〖纷殕〗');
        const 纷殕 = get.blueSkillTips('纷殕', '<li>纷殕<li>限定技：<br>　　每轮开始时，你可以令所有角色选择两项：1.翻面；2.摸两张牌；3.于本轮获得技能〖鸩毒〗。');
        lib.translate.icejuehun_info = setColor(
            '锁定技：<br>　　当一名角色的「体力值与体力上限变化为相等后丨濒死状态结算结束后若其存活」，你将〖'+吴起兵法+'〗置于你的装备区并替换原装备牌，然后若你发动此技能的次数为「偶数」，你失去武将牌上的「第一个技能」。'
        );
        lib.translate.iceluoshu_info = setColor(
            '锁定技：<br>　　当你准备阶段开始时，你从〖'+络殊技能池+'〗中随机抽取三个限定技，然后你选择并获得其中一个限定技；其中专属限定技为〖'+纷殕+'〗。'
        );
        //SE孙鲁班
        const 谮毁 = get.blueSkillTips('谮毁', '<li>谮毁<li>　　出牌阶段开始时，令所有角色是否参与〖议事〗：结果为红色，可选择一名未进行议事的角色，对其造成两点伤害；结果为黑色，可选择一名已进行议事的角色，令其非锁定技失效直到你的回合结束。');
        const 挟名 = get.blueSkillTips('挟名', '<li>挟名<li>　　回合结束时或受到伤害后，可选择「失去武将牌上一个技能并摸两张牌展示之丨选择一名其他角色与你随机展示一张手牌」，若如此做：你可弃置一名角色区域内一张牌其摸一张牌，若此牌点数处于展示牌点数之间/之外，随机装备一张装备牌/随机获得一张与之点数相同的牌。');
        const 赴凶 = get.blueSkillTips('赴凶', '<li>赴凶<li>　　　　出牌阶段限一次，选择一名其他角色并随机标记其一张手牌，然后与其进行拼点：你赢，随机从未选择过的至多三名吴势力武将中获得一个武将的全部技能直到你下个出牌阶段开始时，并摸一张此类型的牌；你输，双方随机均分手牌区、装备区中所有牌，并弃一张此类型的牌，本阶段你使用牌无次数与距离限制，且不可指定该角色为目标。');
        const 斩情 = get.blueSkillTips('斩情', '<li>斩情<li>限定技：<br>　　出牌阶段，你可以令所有角色依次将体力调整至一点并获得X点护甲(X为体力值调整数，你为X+2)。本局游戏增加「向死存吴」光环：当有装备牌进入弃牌堆后，每回合限两次，你可弃置任意张牌并随机获得等量+1张牌，且获得牌中至少有一张牌面信息含有「杀」的牌。');
        lib.skill.waterjiaoman.derivation = ["waterjiaoman_FAQ"];
        lib.translate.waterjiaoman_info = setColor(
            '锁定技：<br>　　①登场时获得15点权欲值；当你获得卡牌及失去装备后，或当一名角色失去技能后，或当一名角色受到非实体卡牌伤害后：获得对应「10/15/20」点「权欲」值(上限为99)。②若「权欲」值不小于25/50/75/99，你视为拥有对应技能〖'+谮毁+'〗〖'+挟名+'〗〖'+赴凶+'〗〖'+斩情+'〗。'
        );
        //喵林夕
        const 逗猫 = get.blueSkillTips('逗猫', '<li>逗猫<li>规则技：<br>　　回合开始时，你可以弃置一张牌并选择一名其他角色，转移「逗猫」，并使其摸一张牌，回合结束时，若你拥有「逗猫」，则需弃置一张牌。');
        lib.translate.icedoumao_info = setColor(
            '锁定技：<br>　　游戏开始时，你获得一个「'+逗猫+'」标记。'
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
            const randomNum = Math.floor(Math.random() * (17 - 2 + 1)) + 2;
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
            "15": "道心无畏.mp3",
            "16": "三国杀.mp3",
            "17": "新定军山.mp3",
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
    if (settings.addjianglingSkills && settings.addjianglingSkills !== "0") {//添加将灵技
        lib.translate["_addjianglingSkills_phaseUse"] = "将灵";
        function 将灵专属Button(item, type, position, noclick, node) {
            node = ui.create.buttonPresets.character(item, "character", position, noclick);
            const info = lib.character[item];
            const skills = info[3].filter((skill) => {
                const infos = get.info(skill);
                const name = lib.translate[skill];
                const nameinfos = lib.translate[skill + "_info"];
                const key = infos && name && nameinfos;
                const categories = get.skillCategoriesOf(skill, get.player());
                return key && categories.includes("将灵技");
            });
            if (skills.length) {
                const skillstr = skills.map(i => `[${get.translation(i)}]`).join("<br>");
                const skillnode = ui.create.caption(`<div class="text" data-nature=${get.groupnature(info[1], "raw")}m style="font-family: ${lib.config.name_font || "xinwei"},xinwei">${skillstr}</div>`, node);
                skillnode.style.left = "2px";
                skillnode.style.bottom = "2px";
            }
            node._customintro = function (uiintro, evt) {
                const character = node.link,
                    characterInfo = get.character(node.link);
                let capt = get.translation(character);
                if (characterInfo) {
                    capt += `&nbsp;&nbsp;${get.translation(characterInfo.sex)}`;
                    let charactergroup;
                    const charactergroups = get.is.double(character, true);
                    if (charactergroups) {
                        charactergroup = charactergroups.map(i => get.translation(i)).join("/");
                    } else {
                        charactergroup = get.translation(characterInfo.group);
                    }
                    capt += `&nbsp;&nbsp;${charactergroup}`;
                }
                uiintro.add(capt);

                if (lib.characterTitle[node.link]) {
                    uiintro.addText(get.colorspan(lib.characterTitle[node.link]));
                }
                for (let i = 0; i < skills.length; i++) {
                    if (lib.translate[skills[i] + "_info"]) {
                        let translation = lib.translate[skills[i] + "_ab"] || get.translation(skills[i]).slice(0, 2);
                        if (lib.skill[skills[i]] && lib.skill[skills[i]].nobracket) {
                            uiintro.add('<div><div class="skilln">' + get.translation(skills[i]) + "</div><div>" + get.skillInfoTranslation(skills[i]) + "</div></div>");
                        } else {
                            uiintro.add('<div><div class="skill">【' + translation + "】</div><div>" + get.skillInfoTranslation(skills[i]) + "</div></div>");
                        }
                        if (lib.translate[skills[i] + "_append"]) {
                            uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + "_append"] + "</div>");
                        }
                    }
                }
            };
            return node;
        };
        function get协战jianglings() {
            let jianglings = [];
            const targets = game.filterPlayer(o => {
                const haslists = o._hasJLCharacters || [];
                return haslists.length > 0 && o.isAlive();
            });
            if (targets.length === 0) jianglings;
            for (const target of targets) {
                const haslists = target._hasJLCharacters;
                jianglings = jianglings.concat(haslists.filter(i => jianglings.indexOf(i) === -1));
            }
            return jianglings;
        };
        async function check将灵专属(player,target) {
            if (!target._hasJLCharacters) target._hasJLCharacters = [];
            const haslists = target._hasJLCharacters || [];
            if (haslists && haslists.length >= 1) {
                const prompt = setColor("〖将灵协战〗：请先移除一位协战将灵！");
                const chooseButton = await player.chooseButton([prompt,
                    [haslists, (item, type, position, noclick, node) => 将灵专属Button(item, type, position, noclick, node)],
                    [1, 1],
                ]).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                    const name = haslists.randomGet();
                    return button.link === name;
                }).forResult();
                if (chooseButton.bool) {
                    const choices = chooseButton.links;
                    target._hasJLCharacters = haslists.filter(i =>!choices.includes(i));
                    const info = lib.character[choices[0]];
                    const prefix = lib.translate[choices[0] + '_prefix'] || '';
                    const name = get.translation(choices[0]).replace(prefix, '');
                    let fanyi = "";
                    if (info[3] && info[3].length) {
                        fanyi = "「" + info[3].map(i => get.translation(i)).join("丨") + "」";
                        for(const skill of info[3]) {
                            if (target.hasSkill(skill)) {
                                target.removeSkill(skill);
                            }
                        }
                    } else {
                        fanyi = "无";
                    }
                    if (!target.hasSkill("_jianglMark")) target.addSkill("_jianglMark");
                    target.markSkill("_jianglMark");
                    target.update();
                    ui.clear();
                    const prompt = setColor("替换掉了将灵〖" + name + "〗的协战，失去的协战技能为：" + fanyi + "。");
                    game.log(target, prompt);
                }
            }
        };
        async function add将灵专属(player,target) {
            if (!target._hasJLCharacters) target._hasJLCharacters = [];
            const jianglings = 将灵协战列表;
            const haslists = target._hasJLCharacters || [];
            if (!jianglings || jianglings.length === 0) return;
            const unhaslists = jianglings.filter(i =>!haslists.includes(i) && !get协战jianglings().includes(i));
            if (unhaslists.length === 0) return;

            const prompt = setColor("〖将灵协战〗：请选择一位将灵，为"+ get.translation(target) +"其进行协战！");
            const chooseButton = await player.chooseButton([prompt,
                [unhaslists, (item, type, position, noclick, node) => 将灵专属Button(item, type, position, noclick, node)],
                [1, 1],
            ]).set("selectButton", 1).set("forced", false).forResult();
            if (chooseButton.bool) {
                const choices = chooseButton.links;
                target._hasJLCharacters.push(choices[0]);
                const info = lib.character[choices[0]];
                const prefix = lib.translate[choices[0] + '_prefix'] || '';
                const name = get.translation(choices[0]).replace(prefix, '');
                let fanyi = "";
                if (info[3] && info[3].length) {
                    fanyi = "「" + info[3].map(i => get.translation(i)).join("丨") + "」";
                    for(const skill of info[3]) {
                        target.addSkill(skill);
                    }
                } else {
                    fanyi = "无";
                }
                if (!target.hasSkill("_jianglMark")) target.addSkill("_jianglMark");
                target.markSkill("_jianglMark");
                target.update();
                ui.clear();
                const prompt = setColor("获得了将灵〖" + name + "〗的协战，本局游戏协战技能为：" + fanyi + "。");
                game.log(target, prompt);
            }
        };
        function unHasJLtargets() {
            const targets = game.filterPlayer(o => {
                const haslists = o._hasJLCharacters || [];
                return haslists.length === 0 && o.isAlive();
            });
            return targets;
        };
        function HasJLtargets() {
            const targets = game.filterPlayer(o => {
                const haslists = o._hasJLCharacters || [];
                return haslists.length > 0 && o.isAlive();
            });
            return targets;
        }
        lib.skill._addjianglingSkills_gameStart = {
            trigger: {
                global: ["gameStart"],
            },
            forced: true,
            popup: false,
            filter(event, player) {
                const jianglings = 将灵协战列表;
                const unhaslists = jianglings.filter(name =>!get协战jianglings().includes(name));
                if (unhaslists.length === 0) return;
                let choiceNum = settings.addjianglingSkills || 1;
                let setnum =  Math.min(choiceNum - HasJLtargets().length, unHasJLtargets().length);
                return player === game.me && setnum > 0;
            },
            async content(event, trigger, player) {
                let choiceNum = settings.addjianglingSkills || 1;
                let setnum =  Math.min(choiceNum - HasJLtargets().length, unHasJLtargets().length);
                const Targetprompt = setColor('〖将灵协战〗：请选择至多'+ get.cnNumber(setnum) +'名他角色，令其获得一位将灵的协战？');
                const Targetresult = await game.me.chooseTarget(Targetprompt, [1, setnum], (card, player, target) => {
                    return unHasJLtargets().includes(target);
                }).set('ai', target => {
                    return get.attitude(game.me, target) >= 2;
                }).forResult();
                if (Targetresult.bool) {
                    const targets = Targetresult.targets.sortBySeat(game.me);
                    game.me.line(targets, "fire");
                    game.me.$fullscreenpop('将灵协战', 'fire');
                    for (const target of targets) {
                        await check将灵专属(game.me,target);
                        await add将灵专属(game.me, target);
                    }
                }
            },
        };
        lib.skill._jianglMark = {
            mark:true,
            marktext:"<font color= #EE9A00>将灵</font>",
            superCharlotte:true,
            charlotte:true,
            intro:{
                mark:function (dialog, storage, player) {
                    const jianglings = player._hasJLCharacters || [];
                    if (jianglings && jianglings.length > 0) {
                        dialog.addText("正在协战：");
                        dialog.addSmall([jianglings, (item, type, position, noclick, node) => 将灵专属Button(item, type, position, noclick, node)]);
                    } else {
                        dialog.addText("无将灵协战！");
                    }
                },
                markcount:function (storage, player) {
                    const jianglings = player._hasJLCharacters || [];
                    return jianglings.length || 0;
                },
                onunmark: true,
                name: "<font color= #EE9A00>将灵</font>",
            },
        };
        lib.skill._addjianglingSkills_phaseUse = {
            enable: "phaseUse",
            filter(event, player) {
                const jianglings = 将灵协战列表;
                const unhaslists = jianglings.filter(name =>!get协战jianglings().includes(name));
                if (unhaslists.length === 0) return;
                let choiceNum = settings.addjianglingSkills || 1;
                let setnum =  Math.min(choiceNum - HasJLtargets().length, unHasJLtargets().length);
                return game.getExtensionConfig("银竹离火", "TAFset_addjianglingSkills") && setnum > 0;
            },
            direct: true,
            async content(event, trigger, player) {
                player.$fullscreenpop('将灵协战', 'fire');
                await check将灵专属(player,player);
                await add将灵专属(player, player);
            },
        };
        lib.announce.subscribe("Noname.Game.Event.GameStart", function () {
            if (game.getExtensionConfig("银竹离火", "TAFset_addjianglingSkills")) {
                const control = ui.create.system(
                    "将灵",
                    function () {
                        if (game.me.isPhaseUsing()) return;
                        const next = game.createEvent("TAFset_addjianglingSkills");
                        next.player = game.me;
                        next.setContent(lib.skill._addjianglingSkills_phaseUse.content);
                    },
                    true,
                    true
                );
            }
        });
    }
    lib.skill['_disSkill_ThunderAndFire'] = {
        async init(player, skill) {
            player.addSkillBlocker(skill);
            player.addTip(skill, "技能失效");
        },
        onremove:function (player, skill) {
            player._extDislists = [];
            player.unmarkSkill(skill);
            player.removeSkillBlocker(skill);
            player.removeTip(skill);
        },
        superCharlotte:true,
        charlotte:true,
        skillBlocker:function (skill, player) {
            const dislist = player._extDislists;
            return dislist.includes(skill);
        },
        mark: true,
        marktext:"<font color= #0088CC>逐印</font>",
        intro:{
            content:function (storage, player, skill) {
                const dislist = player._extDislists.filter(item => {
                    return lib.skill['_disSkill_ThunderAndFire'].skillBlocker(item, player);
                });
                if (dislist.length) return "已失效技能：" + get.translation(dislist);
                return "无失效技能";
            },
        },
    };
    lib.translate['_disSkill_ThunderAndFire'] = '<font color= #0088CC>逐印</font>';
    async function noname_skillBlocker() {
        const skillBlockers = Object.keys(lib.skill).filter(skill => {
            const init = lib.skill[skill].init;
            const skillBlocker = lib.skill[skill].skillBlocker;
            return init && skillBlocker && typeof skillBlocker === 'function';
        });
        return skillBlockers;
    }
    const skillBlockers = await noname_skillBlocker();
    if (skillBlockers.length > 0) {
        for (const skill of skillBlockers) {
            const originalSkillBlocker = 'extSkill_blocker_' + skill;
            if (!lib[originalSkillBlocker]) lib[originalSkillBlocker] = lib.skill[skill].skillBlocker;
            lib.skill[skill].skillBlocker = new Proxy(lib[originalSkillBlocker], {
                apply(target, thisArg, argumentsList) {
                    let result = Reflect.apply(target, thisArg, argumentsList);
                    if(argumentsList[1]._extSkillBlockers && argumentsList[1]._extSkillBlockers.includes(argumentsList[0])) {
                        result = false;
                    }
                    return result;
                }
            });
            const intro = lib.skill[skill].intro;
            if (intro) {
                /**
                 * 就算你不是函数也得变成函数哥哥，因我要解封谋些技能！随便也完善了有些扩展写的不规范的封印技能。不要谢我嘎嘎
                 */
                const originalContent = intro.content;
                if (originalContent) {
                    intro.content = function (...args) {
                        const argumentsList = Array.from(args);
                        const player = argumentsList[1];
                        const skills = player.countSkills();//详见本扩展预备函数中的封装
                        const dislist = skills.filter(item => {
                            return lib.skill[skill].skillBlocker(item, player);
                        });
                        if(dislist.length) return "已失效技能：" + get.translation(dislist);
                        return "无失效技能";
                    }
                }
            }
        }
    }
    /**
     * 合理的移除对【封印】类技能被封技能的监听
     * 完善逻辑：
     * 1.没有skillBlocker，则清空监听数组！
     * 2.若有skillBlocker，则遍历所有skillBlocker技能，检查是否有失效技能，若有则继续监听！若没有则移除该skillBlocker技能！
     */
    const originalFilterTrigger = lib.filter.filterTrigger;
    lib.filter.filterTrigger = new Proxy(originalFilterTrigger, {
        apply(target, thisArg, argumentsList) {
            const player = argumentsList[1];
            if(player._extSkillBlockers && player._extSkillBlockers.length > 0) {
                const SkillBlockers = player.getSkillBlockers();//详见本扩展预备函数中的封装
                if(SkillBlockers.length === 0) {
                    player._extSkillBlockers = [];
                } else {
                    for (const item of SkillBlockers) {
                        const skillBlocker = lib.skill[item].skillBlocker;
                        const getdislists = player.countSkills().filter(skill => {
                            return skillBlocker(skill, player);
                        });
                        if(getdislists.length === 0) player.removeSkill(item);
                    }
                }
            }
            const result = Reflect.apply(target, thisArg, argumentsList);
            return result;
        }
    });
};