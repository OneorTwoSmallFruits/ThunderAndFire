import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
import { ThunderAndFire, setAI} from'./functions.js';
const {
    setColor, delay, getCardSuitNum, getCardNameNum, compareValue, 
    compareOrder, compareUseful, chooseCardsToPile, chooseCardsTodisPile, 
    setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数
const {
    getAliveNum, getFriends, getEnemies,
} = setAI;//银竹离火AI部分函数
export const asyncs = {
    wei:{
        thunder_caopi:{
            name: "曹丕",
            initxingshang : async function (player, skill) {
                const newname = skill + '_global';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[skill + '_global'] = {
                    trigger:{
                        global:["roundStart"],
                    },
                    global:[newname],
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player) {
                        if (player.hasSkill('thunderxingshang')) return true;
                        if (player.hasSkill('icelingren_xingshang')) return true;
                        if (player.storage.TXScp_used) return true;
                        if (player.storage.TXScy_used) return true;
                        return false;
                    },
                    async content(event, trigger, player) {
                        if (player.hasSkill('thunderxingshang')) {
                            player.removeStorage('thunderxingshang');
                            player.unmarkSkill('thunderxingshang');
                        }
                        if (player.hasSkill('icelingren_xingshang')) {
                            player.removeStorage('icelingren_xingshang');
                            player.unmarkSkill('icelingren_xingshang');
                        }
                        if (player.storage.TXScp_used) {
                            player.storage.TXScp_used = false;
                        }
                        if (player.storage.TXScy_used) {
                            player.storage.TXScy_used = false;
                        }
                        player.update();
                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
        thunder_wangji:{
            name: "王基",
            initthunderqizhi : async function (player, skill) {
                const newname = skill + '_clear';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        global:["phaseAfter"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    async content(event, trigger, player) {
                        if (player.hasSkill('thunderqizhi')) {
                            player.clearMark('thunderqizhi');
                            player.thunderqizhi_sha === 0;
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
        ice_caoying:{
            name: "曹婴",
            icelingren : async function (trigger, player) {
                let targetslist = [];
                let result = await player.chooseTarget(get.prompt('icelingren'), '选择一名目标角色并猜测其手牌构成', function (card, player, target) {
                    return _status.event.targets.includes(target);
                }).set('ai', function (target) {
                    return 2 - get.attitude(_status.event.player, target);
                }).set('targets', trigger.targets).forResult();
                if (result.bool) {
                    targetslist = result.targets;
                }
                return targetslist;
            },
        },
    },
    shu:{
        TAF_shen_zhaoyun:{
            name: "神赵云",
            initlonghun : async function (player, skill) {
                const newname = skill + '_useCard';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        player:["useCard","useCardAfter","respondAfter","phaseBegin", "phaseEnd"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        if(!player.hasSkill('TAFlonghun')) return;
                        const playerID = player.name;
                        const skinsID = player.checkSkins();
                        if(name == 'useCard') {
                            return ["sha", "tao"].includes(event.card.name) && event.skill == "TAFlonghun" && event.cards && event.cards.length == 2;
                        } else if(name == 'useCardAfter' || name == 'respondAfter') {
                            const target = _status.currentPhase;
                            return ["shan", "wuxie"].includes(event.card.name) && event.skill == "TAFlonghun" && event.cards && event.cards.length == 2 && target && target.countGainableCards(player, 'he') > 0;
                        } else if(name == 'phaseBegin') {
                            return skinsID === playerID && playerID === 'TAF_shen_zhaoyun';
                        } else if(name == 'phaseEnd') {
                            return skinsID === playerID + '_change' && playerID === 'TAF_shen_zhaoyun'; 
                        }
                    },
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        if (Time == 'useCard') {
                            trigger.baseDamage ++;
                            game.log(player, '使用技能', '#g【龙魂】', '转化的' ,trigger.card, "基础数值+1！");
                        } else if(Time == 'useCardAfter' || Time == 'respondAfter') {
                            const target = _status.currentPhase;
                            const cards = target.getGainableCards(player,"he");
                            if(cards.length) {
                                await player.gainPlayerCard(target, true, "he");
                            }
                        } else if(Time == 'phaseBegin') {
                            const name = player.name;
                            const skinsID = player.checkSkins();
                            const chuchang = 'start';
                            const basePath = 'extension/银竹离火/image/character/standard/';
                            if (skinsID === name) {
                                const chuchang_imagePath = `${basePath}${name}/${name}_${chuchang}2.gif`;
                                player.node.avatar.setBackgroundImage(chuchang_imagePath);
                                const gifDuration = 2920;
                                setTimeout(() => {
                                    const change = 'change';
                                    const guding_imagePath = `${basePath}${name}/${name}_${change}.gif`;
                                    player.node.avatar.setBackgroundImage(guding_imagePath);
                                }, gifDuration);
                            }
                        } else if(Time == 'phaseEnd') {
                            const name = player.name;
                            const skinsID = player.checkSkins();
                            const chuchang = 'start';
                            const basePath = 'extension/银竹离火/image/character/standard/';
                            if (skinsID) {
                                if (skinsID === name + '_change') {
                                    const chuchang_imagePath = `${basePath}${name}/${name}_${chuchang}1.gif`;
                                    player.node.avatar.setBackgroundImage(chuchang_imagePath);
                                    const gifDuration = 5000;
                                    setTimeout(() => {
                                        const guding_imagePath = `${basePath}${name}/${name}.gif`;
                                        player.node.avatar.setBackgroundImage(guding_imagePath);
                                    }, gifDuration);
                                }
                            }
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
            setlonghun : async function (result, player) {
                const Vlist = ["sha", "shan", "tao", "wuxie"];
                const VCard = result.card;
                if (VCard) {
                    if (Vlist.includes(VCard.name)) {
                        const usedcards = result.cards;
                        if (result.cards && usedcards.length > 0) {
                            if (usedcards.length === 1) {
                                const color = get.color(usedcards[0]);
                                if (color === 'black') {
                                    await player.specifyCards('red');
                                } else if (color === 'red') {
                                    await player.specifyCards('black');
                                }
                            } else if (usedcards.length >= 2) {
                                const allBlack = usedcards.every(card => get.color(card) === 'black');
                                if (allBlack) {
                                    const target = _status.currentPhase;
                                    if (target && target !== player) {
                                        if (target.countGainableCards(player, 'he')) {
                                            player.line(target, 'fire');
                                            await player.gainPlayerCard(target, 'he', true);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
        TAF_shen_pangtong:{
            name: "神庞统",
            /**
             * 获取玄羽牌的四个势力中的随机一个武将。作为玄羽牌
             * 为避免不必要的冲突，玄羽将池仅限无名杀本体武将将池
             * 将池范围：神话再临、神将、一将成名、界限突破、璀璨星河、系列专属、新一将成名、OL专属、文德兼备、门阀士族、群英荟萃、限定专属、移动版、始计篇、谋攻篇、外服武将
             * @param {*} choices - 参数为‘getCharacter’
             * @returns 参数为‘getCharacter’返回随机四个势力中的随机一个武将。作为玄羽牌
             */
            setxuanyu : async function (choices = 'noname') {
                if (choices == 'noname') {
                    const setlist = [
                        //'standard',//标准
                        'shenhua',//神话再临
                        'extra',//神将
                        'yijiang',//一将成名
                        'refresh',//界限突破
                        'sp',//璀璨星河
                        'sp2',//系列专属
                        'newjiang',//新一将成名
                        'onlyOL',//OL专属
                        'yingbian',//文德兼备
                        'clan',//门阀士族
                        'huicui',//群英荟萃
                        'xianding',//限定专属
                        'mobile',//移动版
                        'shiji',//始计篇
                        'sb',//谋攻篇
                        'tw',//外服武将
                    ];
                    let xuanyu = {
                        wei:[],
                        shu:[],
                        wu:[],
                        qun:[],
                        jin:[],
                        shen:[],
                    };
                    const Packs = lib.characterPack;
                    for(let name of setlist){
                        if(Packs[name]){
                            for(let character in Packs[name]){
                                const charactername = character;
                                const characterinfo = Packs[name][character];
                                if(charactername && characterinfo){
                                    const group = characterinfo.group;
                                    if(group){
                                        if(group == 'wei'){
                                            if(!xuanyu.wei.includes(charactername)) xuanyu.wei.push(charactername);
                                        }
                                        if(group =='shu'){
                                            if(!xuanyu.shu.includes(charactername)) xuanyu.shu.push(charactername);
                                        }
                                        if(group == 'wu'){
                                            if(!xuanyu.wu.includes(charactername)) xuanyu.wu.push(charactername);
                                        }
                                        if(group == 'qun'){
                                            if(!xuanyu.qun.includes(charactername)) xuanyu.qun.push(charactername);
                                        }
                                        if(group == 'jin'){
                                            if(!xuanyu.jin.includes(charactername)) xuanyu.jin.push(charactername);
                                        }
                                        if(group =='shen'){
                                            if(!xuanyu.shen.includes(charactername)) xuanyu.shen.push(charactername);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const enterGamelists = game.players.map(player => player.name);
                    for(let group in xuanyu){
                        for(let i = xuanyu[group].length - 1; i >= 0; i--){
                            if(enterGamelists.includes(xuanyu[group][i])){
                                xuanyu[group].splice(i, 1);
                            }
                        }
                    }
                    return xuanyu;
                } else if (choices == 'getCharacter') {
                    let characters = [];
                    const lists = await asyncs.shu.TAF_shen_pangtong.setxuanyu();
                    const groups = Object.keys(lists);
                    const shuffled = [...groups].sort(() => Math.random() - 0.5);
                    const selected = shuffled.slice(0, 4);
                    selected.sort((a, b) => groups.indexOf(a) - groups.indexOf(b));
                    for (let group of selected) {
                        const charactersInGroup = lists[group] || [];
                        if (charactersInGroup.length > 0) {
                            const randomCharacter = charactersInGroup[Math.floor(Math.random() * charactersInGroup.length)];
                            characters.push(randomCharacter);
                        }
                    }
                    return characters;
                }
            },
        },
        moon_zhugeliang:{
            name: "诸葛亮",
            getSuitSymbol : function (suit) {
                const suitMap = {
                    spade: '♠',
                    heart: '♥',
                    club: '♣',
                    diamond: '♦'
                };
                return suitMap[suit];
            },
            getNumberSymbol : function (number) {
                const numberMap = {
                    1: 'A',
                    10: 'X',
                    11: 'J',
                    12: 'Q',
                    13: 'K'
                };
                return numberMap[number] || number;
            },
            /**
             * 
             * @param {*} player - 玩家
             * @param {*} string - 无参，代表为两仪四象八阵重新分配点数；
             * @param {*} string - 有参；['liangyi','sixiang','bazhen']
             * @returns - 参数为；['starsliangyi','starssixiang','starsbazhen']-返回对应两仪四象八阵的分配的详情数组；
             * 
             */
            starszhuanzhen : function(player, string = null) {
                const keys =['StarsLY','StarsSX','StarsBZ'];
                const skills =['starsliangyi','starssixiang','starsbazhen'];
                for (let key of keys) {
                    if (!player[key + 'Mark']) player[key + 'Mark'] = [];
                    if (!player[key + 'Num']) player[key + 'Num'] = [];
                }
                if (!player.starszhuanzhen) player.starszhuanzhen = false;
                if (!player.starsbazhen_choicenum) player.starsbazhen_choicenum = 0;//记录八阵当前使用点数之和
                if (!player.starsbazhen_usednum) player.starsbazhen_usednum = [];//记录八阵已使用的七的倍数的点数[]整局游戏不重复
                function setskills(txt) {
                    if (txt = 'mark') {
                        for (let skill of skills) {
                            if (player.hasSkill(skill)) player.markSkill(skill);
                        }
                    } else if (txt === 'unmark') {
                        for (let skill of skills) {
                            if (player.hasSkill(skill)) player.unmarkSkill(skill);
                        }
                    }
                }
                if (!string) {
                    player.starszhuanzhen = true;
                    const suitsBlack = ['spade', 'club'];
                    const suitsWhite = ['heart', 'diamond'];
                    const suits = ['spade', 'heart', 'diamond','club'];
                    const words = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾'];
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
                    setskills('unmark');
                    for (let key of keys) {
                        player[key + 'Mark'] = [];
                        player[key + 'Num'] = [];
                    }
                    const shuffledNumbers = [...numbers];
                    for (let i = shuffledNumbers.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]];
                    }
                    player.StarsLYNum.push(shuffledNumbers[0]);
                    player.StarsSXNum.push(...shuffledNumbers.slice(1, 5));
                    player.StarsBZNum.push(...shuffledNumbers.slice(5));
            
                    // 生成两仪组合
                    const numLY = player.StarsLYNum[0];
                    const LYBlack = [suitsBlack[Math.floor(Math.random() * suitsBlack.length)], numLY];
                    const LYWhite = [suitsWhite[Math.floor(Math.random() * suitsWhite.length)], numLY];
                    player.StarsLYMark = [LYBlack, LYWhite];
            
                    // 生成四象组合
                    const numSX = player.StarsSXNum;
                    const SXspade = [suits[0], numSX[0]];
                    const SXheart = [suits[1], numSX[1]];
                    const SXclub = [suits[2], numSX[2]];
                    const SXdiamond = [suits[3], numSX[3]];
                    player.StarsSXMark = [SXspade, SXheart, SXclub, SXdiamond];
            
                    // 生成八阵组合
                    const numBZ = player.StarsBZNum;
                    player.StarsBZMark = [
                        [words[0], numBZ[0]],
                        [words[1], numBZ[1]],
                        [words[2], numBZ[2]],
                        [words[3], numBZ[3]],
                        [words[4], numBZ[4]],
                        [words[5], numBZ[5]],
                        [words[6], numBZ[6]],
                        [words[7], numBZ[7]],
                    ];
                    setskills('mark');
                    const formatNumber = asyncs.shu.moon_zhugeliang.getNumberSymbol;
                    const formattedLY = player.StarsLYNum.map(formatNumber).join('、');
                    const formattedSX = player.StarsSXNum.map(formatNumber).join('、');
                    const formattedBZ = player.StarsBZNum.map(formatNumber).join('、');
                    game.log(player, '发动了技能', '#g【转阵】', '并重新分配1-13点数：<br>',
                        '#g【两仪】：', formattedLY, '<br>',
                        '#g【四象】：', formattedSX, '<br>',
                        '#g【八阵】：', formattedBZ
                    );
                } else if (string) {
                    if (!player.starszhuanzhen) return [];
                    const mapping = {
                        starsliangyi: player.StarsLYMark,
                        starssixiang: player.StarsSXMark,
                        starsbazhen: player.StarsBZMark
                    };
                    return mapping[string] || [];
                }
            },
            starssixiang : function(player, target, string) {
                const skillskeys = ['starsxuanwu','starsqinglong','starszhuque','starsbaihu'];
                if (string === 'hasSkill') {
                    let skillslist = [];
                    for (let key of skillskeys) {
                        if (target[key]) skillslist.push(key);
                    }
                    return skillslist;
                } else if (string === 'getSkill') {
                    let object = {
                        canget: false,
                        skills : [],
                        infos :[],
                    };
                    const SX = asyncs.shu.moon_zhugeliang.starszhuanzhen(player, 'starssixiang');
                    if (!SX || !Array.isArray(SX) || SX.length === 0) return object;
                    const list = asyncs.shu.moon_zhugeliang.starssixiang(player, target, 'hasSkill');
                    if (list.length >= 2) return object;//若目标的四象技数量>=2,则不触发此技能！
                    const canGetlist = skillskeys.filter(item => !list.includes(item));
                    if (canGetlist.length === 0) return object;
                    for (let skill of canGetlist) {
                        if (skill === 'starsxuanwu') {
                            const spades = SX.find(item => item[0] === 'spade');
                            if (spades && spades.length > 0) {
                                object.skills.push('starsxuanwu');
                                object.infos.push(spades);
                            }
                        } else if (skill === 'starsqinglong') {
                            const hearts = SX.find(item => item[0] === 'heart');
                            if (hearts && hearts.length > 0) {
                                object.skills.push('starsqinglong');
                                object.infos.push(hearts);
                            }
                        } else if (skill === 'starszhuque') {
                            const diamonds = SX.find(item => item[0] === 'diamond');
                            if (diamonds && diamonds.length > 0) {
                                object.skills.push('starszhuque');
                                object.infos.push(diamonds);
                            }
                        } else if (skill === 'starsbaihu') {
                            const clubs = SX.find(item => item[0] === 'club');
                            if (clubs && clubs.length > 0) {
                                object.skills.push('starsbaihu');
                                object.infos.push(clubs);
                            }
                        }
                    }
                    if (object.skills.length > 0) {
                        object.canget = true;
                    }
                    return object;
                }
            },
            useSkillsixiang : async function(player, target) {
                let sixiangObject = {};
                const att = get.attitude(player, target);
                const object = asyncs.shu.moon_zhugeliang.starssixiang(player, target, 'getSkill');
                if (!object.canget) return sixiangObject;
                if (!object.skills || object.skills.length === 0) return sixiangObject;
                if (!object.infos || object.infos.length === 0) return sixiangObject;
                let TXT = '是否令' + get.translation(target) + '获得随机获得以下一个技能：';
                for (let skill of object.skills) {
                    if (skill === 'starsxuanwu') {
                        TXT += setColor("〖玄武〗");
                    } else if (skill === 'starsqinglong') {
                        TXT += setColor("〖青龙〗");
                    } else if (skill === 'starszhuque') {
                        TXT += setColor("〖朱雀〗");
                    } else if (skill === 'starsbaihu') {
                        TXT += setColor("〖白虎〗");
                    }
                }
                let result = await player.chooseBool(TXT).set('ai', function() {
                    return att >= 2;
                }).forResult();
                if (result.bool) {
                    player.logSkill("starssixiang", target);
                    const skillslist = object.skills;
                    const SX = player.StarsSXMark;
                    const skill = skillslist[Math.floor(Math.random() * skillslist.length)];
                    if (!sixiangObject[skill]) sixiangObject[skill] = [];
                    if (!target[skill]) target[skill] = true;
                    if (skill === 'starsxuanwu') {
                        const spades = SX.find(item => item[0] === 'spade');
                        if (spades && spades.length > 0) {
                            sixiangObject[skill] = spades;
                        }
                        player.StarsSXMark = SX.filter(item => item[0] !== 'spade');
                    } else if (skill === 'starsqinglong') {
                        const hearts = SX.find(item => item[0] === 'heart');
                        if (hearts && hearts.length > 0) {
                            sixiangObject[skill] = hearts;
                        }
                        player.StarsSXMark = SX.filter(item => item[0] !== 'heart');
                    } else if (skill === 'starszhuque') {
                        const diamonds = SX.find(item => item[0] === 'diamond');
                        if (diamonds && diamonds.length > 0) {
                            sixiangObject[skill] = diamonds;
                        }
                        player.StarsSXMark = SX.filter(item => item[0] !== 'diamond');
                    } else if (skill === 'starsbaihu') {
                        const clubs = SX.find(item => item[0] === 'club');
                        if (clubs && clubs.length > 0) {
                            sixiangObject[skill] = clubs;
                        }
                        player.StarsSXMark = SX.filter(item => item[0] !== 'club');
                    }
                    player.markSkill("starssixiang");
                }
                return sixiangObject;
            },
            starsbazhendialog : function(player) {
                let list = [];
                const lists = asyncs.shu.moon_zhugeliang.starszhuanzhen(player, 'starsbazhen');
                const cards = player.getCards("hes");
                const hes_numlist = [...new Set(cards.map(card => get.number(card)))];
                const markwords = lists.map(item => item[0]);
                const tricks = {
                    '坎': 'wuxie',
                    '艮': 'guohe',
                    '震': 'tiesuo',
                    '巽':'shunshou',
                    '离': 'huogong',
                    '坤': 'nanman',
                    '兑': 'wuzhong',
                    '乾': 'wanjian',
                };
                for(const word of markwords) {
                    const name  = tricks[word];
                    const number = lists.find(item => item[0] === word)[1];
                    if (hes_numlist.includes(number)) {
                        if(!list.includes(name)) list.push(name);
                    }
                }
                return list;
            },
        },
        fire_zhaoxiang:{
            name: "赵襄",
            initlonghun : async function (player, skill) {
                const newname = skill + '_useCard';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        player:["useCard","useCardAfter","respondAfter"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        if(!player.hasSkill('firefengpo')) return;
                        if(name == 'useCard') {
                            return ["sha", "tao"].includes(event.card.name) && event.skill == "firefengpo_longhun" && event.cards && event.cards.length == 2;
                        } else {
                            const target = _status.currentPhase;
                            return ["shan", "wuxie"].includes(event.card.name) && event.skill == "firefengpo_longhun" && event.cards && event.cards.length == 2 && target && target.countGainableCards(player, 'he') > 0;
                        }
                    },
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        if (Time == 'useCard') {
                            trigger.baseDamage ++;
                            game.log(player, '使用技能', '#g【龙魂】', '转化的' ,trigger.card, "基础数值+1！");
                        } else {
                            const target = _status.currentPhase;
                            const cards = target.getGainableCards(player,"he");
                            if(cards.length) {
                                await player.gainPlayerCard(target, true, "he");
                            }
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
            initfirehunyou : async function (player, skill) {
                const newname = skill + '_changeSkin';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        player:["phaseBegin","phaseEnd"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        const names = ["fire_zhaoxiang", "fire_zhaoxiang1", "fire_zhaoxiang2"];
                        if (!changeSkinskey) return;
                        const skinsID = player.checkSkins();
                        if (!names.includes(skinsID)) return;
                        if (Time === "phaseBegin") {
                            if (skinsID === "fire_zhaoxiang" || skinsID === "fire_zhaoxiang1") player.changeSkins(2);
                        } else {
                            if (skinsID === "fire_zhaoxiang2") player.changeSkins(1);
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
        fire_jiangwei:{
            name: "姜维",
            initfirebazhen : async function (player, skill) {
                const newname = skill + '_global';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[skill + '_global'] = {
                    trigger:{
                        player:["enterGame"],
                        global:["phaseBefore","logSkillBefore","phaseChange","chooseToUseBefore","useCardBefore"],
                    },
                    global:[newname],
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        if(!player.hasSkill('firebazhen')) return false;
                        if (name == 'enterGame' || name == 'phaseBefore') {
                            return (event.name != 'phase' || game.phaseNumber == 0) && player.hasEquipableSlot(2);
                        } else {
                            return player.hasEquipableSlot(2);
                        }
                    },
                    async content(event, trigger, player) {
                        player.disableEquip(2);
                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
    },
    wu: {
        water_sunce: {
            name: "孙策",
            waterjiang : async function (trigger, player) {
                const keys = ['jiangred', 'jiangblack','redcount', 'blackcount'];
                for (let key of keys) {
                    if (!player.storage[key]) {
                        player.storage[key] = 0;
                    }
                }
                const card = trigger.card;
                const color = get.color(trigger.card);
                const redlist = ["spade", "heart", "club", "diamond"][player.storage.jiangred % 4];
                const blacklist = ["diamond", "club", "heart", "spade"][player.storage.jiangblack % 4];
                const piles = ["cardPile", "discardPile"];
                let redgainlist = [];
                let blackgainlist = [];
                for (let pile of piles) {
                    const cards = ui[pile].childNodes;
                    for (let card of cards) {
                        if (color === "red") {
                            if (get.suit(card) === redlist) {
                                redgainlist.push(card);
                                if (redgainlist.length > 0) break;
                            }
                        } else if (color === "black") {
                            if (get.suit(card) === blacklist) {
                                blackgainlist.push(card);
                                if (blackgainlist.length > 0) break;
                            }
                        } else {
                            return [];
                        }
                    }
                    if (redgainlist.length > 0 || blackgainlist.length > 0) break;
                }
                const gaintc = trigger.cards;
                if (redgainlist.length > 0) {
                    await player.gain(redgainlist, "gain2");
                    player.storage.jiangred++;
                    const gainedcard = redgainlist[0];
                    if (get.color(gainedcard) === "black" && player.storage.redcount < 1) {
                        await player.gain(gaintc, "gain2");
                        player.storage.redcount++;
                    }
                    return redgainlist;
                } else if (blackgainlist.length > 0) {
                    await player.gain(blackgainlist, "gain2");
                    player.storage.jiangblack++;
                    const gainedcard = blackgainlist[0];
                    if (get.color(gainedcard) === "red" && player.storage.blackcount < 1) {
                        await player.gain(gaintc, "gain2");
                        player.storage.blackcount++;
                    }
                    return blackgainlist;
                } else {
                    return [];
                }
            },
            wateryinghun : async function (player) {
                let targetslist = [];
                let result = await player.chooseTarget(get.prompt('wateryinghun'), function (card, player, target) {
                    return target != player;
                }).set('ai', function (target) {
                    const player = _status.event.player;
                    const friends = game.filterPlayer(function (current) {
                        return current !== player && get.attitude(player, current) >= 2;
                    });
                    const enemys = game.filterPlayer(function (current) {
                        return current !== player && get.attitude(player, current) < 2;
                    });
        
        
                    let leastCardsFriend = null;
                    if (friends.length > 0) {
                        leastCardsFriend = friends.reduce((minFriend, current) => {
                            return current.countCards('he') < minFriend.countCards('he') ? current : minFriend;
                        }, friends[0]);
                    }
                    let mostCardsFriend = null;
                    if (friends.length > 0) {
                        mostCardsFriend = friends.reduce((maxFriend, current) => {
                            return current.countCards('he') > maxFriend.countCards('he') ? current : maxFriend;
                        }, friends[0]);
                    }
                    let mostCardsEnemy = null;
                    if (enemys.length > 0) {
                        mostCardsEnemy = enemys.reduce((maxEnemy, current) => {
                            return current.countCards('he') > maxEnemy.countCards('he') ? current : maxEnemy;
                        }, enemys[0]);
                    }
                    let CardsEnd1 = game.filterPlayer(function (current) {
                        return get.attitude(player, current) >= 2;
                    }).reduce((sum, p) => sum + p.countCards('he'), 0);
                    let CardsEnd2 = game.filterPlayer(function (current) {
                        return get.attitude(player, current) < 2;
                    }).reduce((sum, p) => sum + p.countCards('he'), 0);
                    // 判定选择目标的条件：
                    if (player.getDamagedHp() === 1 && player.maxHp > 3) return;
                    if (friends.length > 0) {
                        if (CardsEnd1 >= CardsEnd2) {
                            let rand = Math.random();
                            if (rand < 0.65) {//0.0 - 0.65
                                return leastCardsFriend;
                            } else if (rand < 0.90) {//0.65 - 0.90
                                let otherFriends = friends.filter(function (current) {
                                    return current !== leastCardsFriend && current !== mostCardsFriend;
                                });
                                if (otherFriends.length > 0) {
                                    return otherFriends[Math.floor(Math.random() * otherFriends.length)];
                                } else {
                                    return leastCardsFriend || mostCardsFriend;
                                }
                            } else {//0.90 - 1.0
                                return mostCardsFriend;
                            }
                        } else {
                            return mostCardsEnemy;
                        }
                    } else {
                        return mostCardsEnemy;
                    }            
                }).forResult();
                if (result.bool) {
                    player.tempDisSkills('wateryinghun', { global: 'roundStart' });
                    targetslist = result.targets;
                }
                return targetslist;
            },
        },
        water_sunshangxiang:{
            name: "孙尚香",
            waterliangzhu : async function (trigger, player, time) {
                if (!time) {
                    return;
                } else if (time && time === 'damageEnd') {
                    const target = trigger.source;
                    const listdamage = [
                        setColor("〖选项一〗：重铸一张牌并摸一张牌！"),
                        setColor("〖选项二〗：重置杀的使用次数！"),
                    ];
                    const chooseButton = await target.chooseButton([get.prompt('waterliangzhu'),
                        [listdamage.map((item, i) => {return [i, item];}),"textbutton",],
                    ]).set("filterButton", function (button) {
                        if (button.link === 0) {
                            const cards = target.getCards('hes', card => target.canRecast(card));
                            if (cards.length > 0) {
                                return true;
                            }
                        } else if (button.link === 1) {
                            return true;
                        }
                    }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                        let shouyi = 0;
                        const cards = target.getCards('hes');
                        const shaCardCount = cards.filter(card => card.name == "sha").length;
                        const recastCards = cards.filter(card => target.canRecast(card));
                        if (shaCardCount.length > 0) {
                            const targets = game.filterPlayer(function (current) {
                                return target.canUse("sha", current ,true ,false);
                            });
                            if (targets.length <= 0) {
                                shouyi = 1;
                            } else {
                                let list = [];
                                for (let t of targets) {
                                    const Vcard = { name: "sha", nature: '', isCard: true };
                                    const effect = get.effect(t, Vcard, target, target);
                                    if (effect > 0 && !list.includes(t)) {
                                        list.push(t);
                                    }
                                }
                                if (list.length <= 0) {
                                    shouyi = 1;
                                } else {
                                    shouyi = 2;
                                }
                            }
                        } else if (recastCards.length > 0) {
                            shouyi = 1;
                        } else {
                            shouyi = 2;
                        }
                        switch (button.link) {
                            case 0:
                                if (shouyi !== 1) return false;
                                if (shouyi == 1) return true;
                            case 1:
                                if (shouyi !== 2) return false;
                                if (shouyi == 2) return true;
                        }
                    }).forResult();
                    if (chooseButton.bool) {
                        const choices = chooseButton.links;
                        if (choices.includes(0)) {
                            const result = await target.chooseCard("请选择重铸一张牌", 'hes', 1, true, function(card) {
                                return target.canRecast(card);
                            }).set('ai', async (card) => {
                                const shaCardCount = target.countCards("hes", function(card) {
                                    return get.name(card, target) === "sha" && target.hasValueTarget(card);
                                });
                                const Phase = _status.currentPhase === target;
                                const cards = target.getCards('hes');
                                const numtao = target.countCards("hes", "tao");
                                const numshan = target.countCards("hes", "shan");
                                const numjiu = target.countCards("hes", "jiu");
            
                                const inPhase = (card) => {
                                    if (get.name(card) === "zhuge" && shaCardCount > 0) {
                                        return false;
                                    } else if (numtao === 1 && get.name(card) === "tao") {
                                        return false;
                                    } else if (numshan === 1 && get.name(card) === "shan") {
                                        return false;
                                    } else if (numjiu === 1 && get.name(card) === "jiu") {
                                         return false;
                                    } else {
                                         return true;
                                    }
                                };
                                const outPhase = (card) => {
                                    if (numtao === 1 && get.name(card) === "tao") {
                                        return false;
                                    } else if (numshan === 1 && get.name(card) === "shan") {
                                        return false;
                                    } else if (numjiu === 1 && get.name(card) === "jiu") {
                                         return false;
                                    } else {
                                         return true;
                                    }
                                };
                                if (cards.length > 1) {
                                    if (Phase) {
                                        return inPhase(card);
                                    } else {
                                        return outPhase(card);
                                    }
                                } else {
                                    return true;
                                }
                            }).forResult();
                            if (result.bool) {
                                await target.recast(result.cards[0]);
                                await target.draw();
                            }
                        } else if (choices.includes(1)) {
                            if (trigger.addCount !== false) {
                                trigger.addCount = false;
                                target.getStat().card.sha = 0;
                                game.log(target, "重置了杀的使用次数！");
                            }
                        }
                    }
                } else if (time && time === 'recoverAfter') {
                    const target = trigger.player;
                    //你可以选择：「获得其一张装备牌装备之并摸一张牌丨令其随机获得三张牌并弃置一张牌」。
                    const txt = setColor("每轮游戏每名角色此项限一次，你可以选择：");
                    const listrecover = [
                        setColor("〖选项一〗：获得" + get.translation(target) + "一张装备牌装备之并摸一张牌！"),
                        setColor("〖选项二〗：令" + get.translation(target) + "随机获得三张牌并弃置一张牌！"),
                    ];
                    const chooseButton = await player.chooseButton([txt,
                        [listrecover.map((item, i) => {return [i, item];}),"textbutton",],
                    ]).set("filterButton", function (button) {
                        if (button.link === 0) {
                            const cardse = target.getCards('es').length;
                            return target.countGainableCards(player, "e") > 0 && cardse > 0;
                        } else if (button.link === 1) {
                            return true;
                        }
                    }).set("selectButton", 1).set("ai", function (button) {
                        let shouyi = 0;
                        const att = get.attitude(player, target);
                        const cardse = target.getCards('es').length;
                        if (att < 2) {
                            if (cardse > 0 && target.countGainableCards(player, "e") > 0) {
                                shouyi = 1;
                            }
                        } else {
                            shouyi = 2;
                        }
                        switch (button.link) {
                            case 0:
                                if (shouyi !== 1) return false;
                                if (shouyi == 1) return true;
                            case 1:
                                if (shouyi !== 2) return false;
                                if (shouyi == 2) return true;
                        }
                    }).forResult();
                    if (chooseButton.bool) {
                        player.logSkill('waterliangzhu');
                        const choices = chooseButton.links;
                        if (choices.includes(0)) {
                            if (target.countGainableCards(player, "e") > 0) {
                                const result = await player.gainPlayerCard(target, 1, 'e', true).forResult();
                                if (result.bool) {
                                    const equipcards = result.cards[0];
                                    await player.equip(equipcards);
                                }
                                await player.draw();
                            }
                        } else if (choices.includes(1)) {
                            const cards = await target.gainCardsRandom(3);
                            if (cards.length > 0) {
                                await target.chooseToDiscard(1, 'hes', true);
                            }
                        }
                    }
                } else {
                    return;
                }
            },
        },
        water_sunhanhua:{
            name: "孙寒华",
            initwatertaji : async function (player, skill) {
                const newname = skill + '_changeSkins';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        global: ["enterGame","phaseBefore", "phaseAfter"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        if (name === "enterGame" || name === "phaseBefore") {
                            return (event.name !== 'phase' || game.phaseNumber === 0);
                        } else {
                            return player.hasSkill('watertaji');
                        }
                    },
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        if (Time === "enterGame" || Time === "phaseBefore") {
                            if (changeSkinskey && player.name === 'water_sunhanhua') player.changeSkins(1);
                            return;
                        } else {
                            if (changeSkinskey && player.name === 'water_sunhanhua') player.changeSkins(1);
                            if(!player.watertaji_usedsuits) player.watertaji_usedsuits = [];
                            player.watertaji_usedsuits = [];
                            player.markSkill("watertaji");
                            if (player.group !== 'wu') {
                                player.changeZhuanhuanji("watertaji");
                                player.logSkill("watertaji");
                                player.changeGroup("wu");
                                await player.loseHp();
                                await player.draw();
                            }
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
            waterqinghuang : async function (player) {
                let marklist = [];
                const newsuits = player.waterqinghuang_suits || [];
                if (newsuits.length > 0) {
                    for (let suit of newsuits) {
                        await player.specifyCards(suit);
                    }
                }
                player.waterqinghuang_suits = [];
                const result = await player.judge(function (card) {
                    const suitValues = { 'spade': 10, 'heart': -5, 'club': -1, 'diamond': -3 };
                    return suitValues[get.suit(card)];
                }).forResult();
                const card = result.card;
                if (card) {
                    const suit = get.suit(card);
                    marklist.push(suit);
                }
                return marklist;
            },
        },
    },
    qun:{
        TAF_shen_tongyu:{
            name: "瞳羽",
            changeCharacter : async function (player, name, skill) {
                const fanyi = lib.translate[name];
                const hp = player.hp;
                const maxHp = player.maxHp;
                if (fanyi) {
                    const skills = lib.character[name][3];
                    if (skills && skills.length > 0) {
                        await player.link(false);
                        await player.turnOver(false);
                        await player.discard(player.getCards('hejsx'));
                        await player.gainCardsSuits(4);
                        player.reinit(player.name, name);
                        if (name === 'TAF_shen_tongyu_shadow') {
                            player.maxHp = maxHp - 1;
                            player.hp = hp;
                        } else {
                            const skill = 'TAFfanzhuan_change';
                            if(lib.skill[skill]) {
                                if(player.hasSkill(skill)) {
                                    await player.removeSkill(skill);
                                }
                            }
                            player.maxHp = maxHp + 1;
                            player.hp = hp;
                        }
                        player.update();
                        for (const j in player.tempSkills) {
                            player.removeSkill(j);
                        }
                        const getskills = player.getSkills();
                        for (let i = 0; i < getskills.length; i++) {
                            const skillName = getskills[i];
                            const skill = lib.skill[skillName];
                            if (skill && skill.vanish) {
                                player.removeSkill(skillName);
                            }
                        }
                        player.update();
                        ui.clear();
                        if (name === 'TAF_shen_tongyu_shadow') {
                            let evtU = _status.event.getParent("phaseUse");
                            let evtP = _status.event.getParent("phase");
                            if (evtU && evtU.name == "phaseUse") {
                                evtU.skipped = true;
                                player.insertPhase(skill);
                                player.logSkill(skill, game.filterPlayer());
                                return;
                            } else if (evtP && evtP.name == "phase") {
                                evtP.finish();
                                player.insertPhase(skill);
                                player.logSkill(skill, game.filterPlayer());
                                return;
                            }
                        } 
                    }
                }
            },
            initfanzhuan : async function (player, skill) {
                const newname = skill + '_change';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        player:["phaseBeforeStart"],
                        global:["phaseUseAfter",'phaseJudgeBefore'],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function(event, player, name) {
                        if (name === "phaseBeforeStart") {
                            return true;
                        } else if (name === "phaseUseAfter") {
                            return event.player === player.previous;
                        } else if (name === "phaseJudgeBefore") {
                            return event.player === player.next;
                        }
                    },
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        if (Time === "phaseBeforeStart") {
                            trigger.phaseList = ['phaseJieshu', 'phaseDiscard', 'phaseDraw', 'phaseZhunbei'];
                        } else if (Time === "phaseUseAfter") {
                            const next = player.phaseJudge();
                            event.next.remove(next);
                            trigger.next.push(next);
                        } else if (Time === "phaseJudgeBefore") {
                            const next = player.phaseUse();
                            event.next.remove(next);
                            trigger.next.push(next);
                        }
                    },
                };
                player.addSkill(newname);
                player.update();
            },
        },
        TAF_shen_jiangtaixu:{
            name: "姜太虚",
            shenwangjingtu : async function (choices = 'noname') {
                if (choices == 'noname') {
                    ui._shenwangjingtu_state.innerHTML = '';
                    ui.background.setBackgroundImage("extension/银竹离火/image/background/" + '经典军八龙纹' + ".png");
                    game.playBackgroundMusic();
                } else if (choices == '神王净土') {
                    ui._shenwangjingtu_state.innerHTML = '<br><font color= #EE9A00>神王净土</font>';
                    ui.background.setBackgroundImage("extension/银竹离火/image/background/" + '神王净土' + ".png");
                    ui.backgroundMusic.src = 'extension/银竹离火/audio/gameBGM/神王净土.mp3';
                }
            },
        },
        TAF_qt_SEzhugeliang:{
            name: "躬耕南阳诸葛亮",
            icelongdui : async function (player, target, cardslist) {
                const cards = cardslist;
                if(!cards || cards.length == 0 || !Array.isArray(cards)) return;
                if(!player.hasSkill('icelongdui')) return
                let typelist = [];
                for(let card of cards) {
                    const type = get.type(card);
                    if(!typelist.includes(type)) {
                        typelist.push(type);
                    }
                }
                if(typelist.length === 0) return;
                function canuse() {
                    if(typelist.includes('basic') && !target.hasSkill('icelongdui_basic')) return true;
                    if(typelist.includes('trick') || typelist.includes('delay')) {
                        if (!target.hasSkill('icelongdui_trick')) return true;
                    }
                    if(typelist.includes('equip') && !target.hasSkill('icelongdui_equip')) return true;
                    return false;
                }
                if(!canuse()) return;
                let TXT = setColor("〖隆对〗：是否令") + get.translation(target) + setColor("获得对应〖隆对效果〗？");
                let result = await player.chooseBool(TXT).set('ai', function() {
                    const att = get.attitude(player, target);
                    const juexing = player.storage.icechushan;
                    if(juexing && juexing === true) {
                        return att >= 2;
                    } else {
                        if(att >= 2) {
                            return true;
                        } else {
                            if(player.hasSkill('icechushan')) {
                                const list = player.getStorage('icechushan');
                                if(list && list.length < 3) {
                                    if(typelist.length === 1 && typelist[0] !== 'basic') {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }
                    }
                }).forResult();
                if (result.bool) {
                    if(typelist.includes('basic')) {
                        if (!target.hasSkill('icelongdui_basic')) {
                            target.addSkill('icelongdui_basic');
                            target.markSkill('icelongdui_basic');
                            target.update();
                        }
                    }
                    if(typelist.includes('trick') || typelist.includes('delay')) {
                        if (!target.hasSkill('icelongdui_trick')) {
                            target.addSkill('icelongdui_trick');
                            target.markSkill('icelongdui_trick');
                            target.update();
                        }
                    }
                    if(typelist.includes('equip')) {
                        if (!target.hasSkill('icelongdui_equip')) {
                            target.addSkill('icelongdui_equip');
                            target.markSkill('icelongdui_equip');
                            target.update();
                        }
                    }
                    if(player.hasSkill('icechushan')) {
                        if(!player.storage.icechushan) player.storage.icechushan = false;
                        if (!player.getStorage('icechushan').includes(target)) {
                            player.markAuto('icechushan', [target]);
                        }
                    }
                }
            },
        },
        TAF_bl_shenjiaxu:{
            name: "蝶贾诩",
            icefangcan : async function (trigger, player) {
                const cards = trigger.getd();
                if (!cards || cards.length === 0) return;
                for (const card of cards) {
                    if (get.type(card) === 'trick' || get.tag(card, 'damage')) {
                        const name = card.name;
                        if (!player.getStorage('icefangcan').includes(name)) {
                            player.logSkill('icefangcan');
                            player.markAuto('icefangcan', [name]);
                        } else {
                            player.unmarkAuto('icefangcan', [name]);
                        }
                    }
                }
            },
            choosefangcan : async function (player, info) {
                const list = player.getStorage('icefangcan');
                if (!list || list.length === 0) return;
                let TXT = "";
                if (info === "gain") {
                    TXT = setColor("〖纺残〗：请选择获得其中一张牌：");
                } else if (info === "use") {
                    TXT = setColor("〖纺残〗：请选择使用其中一张牌：");
                }
                const result = await player.chooseButton([
                    TXT, [list, "vcard"]
                ]).set("ai", function (button) {
                    const name = button.link[2];
                    const nature = button.link[3];
                    let Vcard = { name: name, nature: nature, isCard: true };
                    if (info === "gain") {
                        return get.value(Vcard) + 1;
                    } else if (info === "use") {
                        return player.getUseValue(Vcard) + 1;
                    }
                }).forResult();
                if (result.bool) {
                    let cardName = result.links[0][2];
                    if (info === "gain") {
                        await player.specifyCards(cardName);
                    } else if (info === "use") {
                        await player.chooseUseTarget({ name: result.links[0][2], nature: result.links[0][3], isCard: true }, true, false);
                    }
                }
            },
        },
        moon_simahui:{
            name: "司马徽",
            iceyinshi : function (player,info) {
                if (!player.hasSkill('iceshuijing')) return[];
                let getnames = [];
                let getcolors = [];
                const uselist = player.trick_usecard;
                if (uselist && uselist.length > 0) {
                    for (let card of uselist) {
                        const name = get.name(card, player);
                        const color = get.color(card, player);
                        if (info === 'name') {
                            if (!getnames.includes(name)) {
                                getnames.push(name);
                            }
                        } else if (info === 'color') {
                            if (!getcolors.includes(color)) {
                                getcolors.push(color);
                            }
                        }
                    }
                }
                const beuselist = player.trick_beusecard;
                if (beuselist && beuselist.length > 0) {
                    for (let card of beuselist) {
                        const name = get.name(card, player);
                        const color = get.color(card, player);
                        if (info === 'name') {
                            if (!getnames.includes(name)) {
                                getnames.push(name);
                            }
                        } else if (info === 'color') {
                            if (!getcolors.includes(color)) {
                                getcolors.push(color);
                            }
                        }
                    }
                }
                if (info === 'name') {
                    return getnames;
                } else if (info === 'color') {
                    return getcolors;
                }
            },
            iceshuijing : async function (event, trigger, player) {
                if (trigger.player === player) {
                    player.trick_use++;
                    const usenum = player.trick_use;
                    if (usenum % 2 === 0 && usenum > 0) {
                        player.logSkill(event.name);
                        const list = player.trick_usecard;
                        if (list && list.length > 0) {
                            let foundcardids = [];
                            for (let card of list) {
                                const cardid = card.cardid;
                                if (!foundcardids.includes(cardid)) {
                                    foundcardids.push(cardid);
                                }
                            }
                            let foundcard = [];
                            const piles = ["discardPile","cardPile"];
                            for (let pile of piles) {
                                const cards = ui[pile].childNodes;
                                for (let i = 0; i < cards.length; i++) {
                                    const card = cards[i];
                                    const cardid = card.cardid;
                                    for (let foundid of foundcardids) {
                                        if (cardid == foundid) {
                                            foundcard.push(card);
                                        }
                                    }
                                }
                            }
                            if (foundcard && foundcard.length > 0) {
                                await player.gain(foundcard, "gain2");
                            }
                            player.trick_usecard = [];
                        }
                        let pushcards = [];
                        const cards = trigger.cards;
                        if (cards && cards.length > 0) {
                            for (const card of cards) {
                                if (!pushcards.includes(card)) {
                                    pushcards.push(card);
                                }
                            }
                        } else {
                            pushcards.push(trigger.card);
                        }
                        player.trick_usecard = pushcards;
                    }
                } else {
                    player.trick_beuse++;
                    const beusenum = player.trick_beuse;
                    if (beusenum % 2 === 1 && beusenum > 0) {
                        player.logSkill(event.name);
                        const list = player.trick_beusecard;
                        if (list && list.length > 0) {
                            let foundcardids = [];
                            for (let card of list) {
                                const cardid = card.cardid;
                                if (!foundcardids.includes(cardid)) {
                                    foundcardids.push(cardid);
                                }
                            }
                            let foundcard = [];
                            const piles = ["discardPile","cardPile"];
                            for (let pile of piles) {
                                const cards = ui[pile].childNodes;
                                for (let i = 0; i < cards.length; i++) {
                                    const card = cards[i];
                                    const cardid = card.cardid;
                                    for (let foundid of foundcardids) {
                                        if (cardid == foundid) {
                                            foundcard.push(card);
                                        }
                                    }
                                }
                            }
                            if (foundcard && foundcard.length > 0) {
                                await player.gain(foundcard, "gain2");
                            }
                            player.trick_beusecard = [];
                        }
                        let pushcards = [];
                        const cards = trigger.cards;
                        if (cards && cards.length > 0) {
                            for (const card of cards) {
                                if (!pushcards.includes(card)) {
                                    pushcards.push(card);
                                }
                            }
                        } else {
                            pushcards.push(trigger.card);
                        }
                        player.trick_beusecard = pushcards;
                    }
                }
                if (player.hasSkill("iceyinshi")) {
                    const getcolors = asyncs.qun.moon_simahui.iceyinshi(player,'color');
                    if (getcolors.length > 0) {
                        if (getcolors.length === 1) {
                            lib.skill.iceyinshi.intro.name = "<font color= #AFEEEE>同色</font>";
                        } else {
                            lib.skill.iceyinshi.intro.name = "<font color= #AFEEEE>异色</font>";
                        }
                    } else {
                        lib.skill.iceyinshi.intro.name = "<font color= #AFEEEE>无色</font>";
                    }
                    player.update();
                }
            },
        },
        TAF_bl_Wuhuangfusong:{
            name: "武皇甫嵩",
            initicelianjie : async function (player, skill) {
                const newname = skill + '_change';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        source:["damageAfter"],
                        global:["phaseAfter"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    init: async function (player, skill) {
                        if (!player.icelianjie_damage) player.icelianjie_damage = 0;
                    },
                    filter:function (event, player, name) {
                        if (name === "damageAfter") {
                            return event.num > 0;
                        } else if (name === "phaseAfter") {
                            return true;
                        }
                    },
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        if (Time === "damageAfter") { 
                            player.icelianjie_damage ++;
                            let num = player.icelianjie_damage;
                            if (num > 5) player.icelianjie_damage = 5;
                        } else if (Time === "phaseAfter") {
                            player.icelianjie_damage = 0;
                            player.removeStorage('icelianjie');
                            player.unmarkSkill("icelianjie");
                            player.removeGaintag("icelianjie_tag");
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
            initicejiangxian : async function (player, skill) {
                if (!player.storage.icejiangxian) player.storage.icejiangxian = false;
                const newname = skill + '_change';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        player:["phaseEnd"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        return player.storage.icejiangxian;
                    },
                    async content(event, trigger, player) {
                        const list = [
                            setColor("〖选项一〗：失去〖朝镇〗。"),
                            setColor("〖选项二〗：失去〖连捷〗。"),
                        ];
                        const chooseButton = await player.chooseButton([setColor("〖将贤〗") ,
                            [list.map((item, i) => {return [i, item];}),"textbutton",],
                        ]).set("filterButton", function (button) {
                            if (button.link === 0) {
                                return player.hasSkill("icechaozhen");
                            } else if (button.link === 1) {
                                return player.hasSkill("icelianjie");
                            }
                        }).set("selectButton", 1).set("ai", async function (button) {
                            return button.link === 0;
                        }).set('forced', true).forResult();
                        if (chooseButton.bool) {
                            //player.logSkill('icejiangxian');
                            const choices = chooseButton.links;
                            if (choices.includes(0)) {
                                player.removeSkill("icechaozhen");
                                game.log(player,'发动','#g【将贤】','并失去了技能','#g【朝镇】');
                            } else if (choices.includes(1)) {
                                player.removeSkill("icelianjie");
                                game.log(player,'发动','#g【将贤】','并失去了技能','#g【连捷】');
                            }
                            player.removeSkill(newname);
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
        ice_diaochan:{
            name: "貂蝉",
            checkdiaochans : function () {
                const diaochans = game.players.filter(o => o.isAlive() && lib.translate[o.name].includes("貂蝉"));
                if (diaochans && diaochans.length > 0) {
                    return diaochans;
                }
                return [];
            },
            checklijiandebuffs : function () {
                const setSkills = [ 'icelijian_tanbuff', 'icelijian_chenbuff', 'icelijian_chibuff', 'icelijian_libuff', 'icelijian_yibuff'];
                const targets = game.players.filter(o => o.isAlive());
                let count = 0;
                for (let target of targets) {
                    for (let setSkill of setSkills) {
                        if (target.hasSkill(setSkill)) count++;
                    }
                }
                return count;
            },
            checklijiantargets : function () {
                const setSkills = [ 'icelijian_tanbuff', 'icelijian_chenbuff', 'icelijian_chibuff', 'icelijian_libuff', 'icelijian_yibuff'];
                const targets = game.players.filter(o => o.isAlive());
                let count = 0;
                for (let target of targets) {
                    if (setSkills.some(skill => target.hasSkill(skill))) {
                        count++;
                    }
                }
                return count;
            },
            getlijianSkills : function (target,string = 'filter') {
                let skillList = [];
                const setSkills = [ 'icelijian_tanbuff', 'icelijian_chenbuff', 'icelijian_chibuff', 'icelijian_libuff', 'icelijian_yibuff'];
                if (string == 'filter') {
                    for (let setSkill of setSkills) {
                        if (target.hasSkill(setSkill)) skillList.push(setSkill);
                    }
                    return skillList;
                } else if (string == 'gain') {
                    for (let setSkill of setSkills) {
                        if (!target.hasSkill(setSkill)) skillList.push(setSkill);
                    }
                    if (skillList.length > 0) {
                        const skillname = skillList[Math.floor(Math.random() * skillList.length)];
                        const fanyi = lib.translate[skillname];
                        if (fanyi) {
                            game.log(target, '获得了技能', fanyi, '！');
                        }
                        return skillname;
                    } else {
                        return false;
                    }
                }
            },
        },
    },
    boss:{
        initboss_juejing : async function (player, skill) {
            const newname = skill + '_change';
            if (!lib.skill[newname]) lib.skill[newname] = {};
            lib.skill[newname] = {
                trigger:{
                    player:["phaseBeforeStart"],
                },
                superCharlotte: true,
                charlotte: true,
                silent: true,
                direct: true,
                fixed: true,
                filter:function(event, player, name) {
                    return true;
                },
                async content(event, trigger, player) {
                    trigger.phaseList = [ 'phaseZhunbei', 'phaseJudge', 'phaseUse', 'phaseDiscard', 'phaseJieshu' ];
                },
                "_priority": -Infinity,
            };
            player.addSkill(newname);
            player.update();
        },
        TAF_Bosslvbu_xuli : async function (player, name, skill) {
            const fanyi = lib.translate[name];
            if (fanyi) {
                const skills = lib.character[name][3];
                if (skills && skills.length > 0) {
                    if(player.group !== "shen") await player.changeGroup("shen");
                    if(player.isLinked()) await player.link(false);
                    if(player.isTurnedOver()) await player.turnOver(false);
                    await player.discard(player.getCards('hejsx'));
                    await player.draw(15);
                    player.reinit(player.name, name);
                    player.maxHp = player.hp;
                    player.update();
                    for (const j in player.tempSkills) {
                        player.removeSkill(j);
                    }
                    const getskills = player.getSkills();
                    for (let i = 0; i < getskills.length; i++) {
                        const skillName = getskills[i];
                        const skill = lib.skill[skillName];
                        if (skill && skill.vanish) {
                            player.removeSkill(skillName);
                        }
                    }
                    player.update();
                    ui.clear();
                    let evtU = _status.event.getParent("phaseUse");
                    let evtP = _status.event.getParent("phase");
                    if (evtU && evtU.name == "phaseUse") {
                        evtU.skipped = true;
                        player.insertPhase(skill);
                        player.logSkill(skill, game.filterPlayer());
                        return;
                    } else if (evtP && evtP.name == "phase") {
                        evtP.finish();
                        player.insertPhase(skill);
                        player.logSkill(skill, game.filterPlayer());
                        return;
                    }
                }
            }
        },
    },
};


