import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'./functions.js';
const {
    setColor, cardAudio, delay, getCardSuitNum, getCardNameNum,
    compareValue, 
    compareOrder, compareUseful, checkVcard, checkSkills,
    chooseCardsToPile, chooseCardsTodisPile, setTimelist,
    setjudgesResult
} = ThunderAndFire;//银竹离火函数
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
const luoshukey = lib.config.extension_银竹离火_TAFset_ice_jiaxu;//蝶贾诩络殊技能池拓展开关
const {
    getTypesCardsSum, getTypesCardsSum_byme, getShaValue, getDamageTrickValue,
    getTrickValue, getAliveNum,getFriends,getEnemies
} = setAI;
const {
    sunxiongyiAI, sunshangshiAI, thunderguixinAI, tenwintenloseAI,
    thunderxingshangAI,thunderfulongAI,
} = setAI.wei;
const {
    firezhanjueAI,firefengmingAI,
} = setAI.shu;
const {
    moonqinyinAI,moonqishiAI,moonshubiAI,
} = setAI.wu;
const {
    icefaluAI,icefaluOrderAI,longduiAI,icelijianCardsAI,icelingrenguessAI,icejiangxianresultAI
} = setAI.qun;
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
        TAF_zhaoyun:{
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
                            return skinsID === playerID && playerID === 'TAF_zhaoyun';
                        } else if(name == 'phaseEnd') {
                            return skinsID === playerID + '_change' && playerID === 'TAF_zhaoyun'; 
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
                                    const guding_imagePath = `${basePath}/${name}_${change}.gif`;
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
                                        const guding_imagePath = `${basePath}/${name}.gif`;
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
        TAF_pangtong:{
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
                    /*
                    console.log("玄羽初始化",xuanyu);
                    let count = 0;
                    for(let group in xuanyu){
                        count += xuanyu[group].length;
                    }
                    console.log("总数",count);
                    console.log("魏将的数量为", xuanyu.wei.length);
                    console.log("蜀将的数量为", xuanyu.shu.length);
                    console.log("吴将的数量为", xuanyu.wu.length);
                    console.log("群将的数量为", xuanyu.qun.length);
                    console.log("晋将的数量为", xuanyu.jin.length);
                    console.log("神将的数量为", xuanyu.shen.length);
                    */
                    const enterGamelists = game.players.map(player => player.name);
                    //将xuanyu每个势力进行过滤排除以上武将名
                    for(let group in xuanyu){
                        for(let i = xuanyu[group].length - 1; i >= 0; i--){
                            if(enterGamelists.includes(xuanyu[group][i])){
                                //console.log("移除已在游戏中的武将",xuanyu[group][i]);
                                xuanyu[group].splice(i, 1);
                            }
                        }
                    }
                    return xuanyu;
                } else if (choices == 'getCharacter') {
                    let characters = [];
                    const lists = await asyncs.shu.TAF_pangtong.setxuanyu();
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
                    //console.log("玄羽选择",characters);
                    return characters;
                }
            },
        },
        stars_zhugeliang:{
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
                    //console.log(asyncs.shu.stars_zhugeliang.starszhuanzhen(player,'starsbazhen'));
                    //const bazhenlist = asyncs.shu.stars_zhugeliang.starszhuanzhen(player, 'starsbazhen');
                    //const numberlist = bazhenlist.map(item => item[1]);
                    //console.log(numberlist);
                    const formatNumber = asyncs.shu.stars_zhugeliang.getNumberSymbol;
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
                    const SX = asyncs.shu.stars_zhugeliang.starszhuanzhen(player, 'starssixiang');
                    if (!SX || !Array.isArray(SX) || SX.length === 0) return object;
                    const list = asyncs.shu.stars_zhugeliang.starssixiang(player, target, 'hasSkill');
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
                const object = asyncs.shu.stars_zhugeliang.starssixiang(player, target, 'getSkill');
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
                const lists = asyncs.shu.stars_zhugeliang.starszhuanzhen(player, 'starsbazhen');
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
        fire_baosanniang:{
            name: "鲍三娘",
            initfirezhenwu : async function (player, skill) {
                const newname = skill + '_set';
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
                    filter:function (event, player, name) {
                        if (!player.hasSkill('firezhenwu')) return false;
                        return true;
                    },
                    async content(event, trigger, player) {
                        player.firezhenwuused = 0
                    }
                };
                player.addSkill(newname);
                player.update();
            },
            initfirezhennan : async function (player, skill) {
                if (!player.firezhennan_key) player.firezhennan_key = false;
                if (!player.firezhennan_used) player.firezhennan_used = [];
                const newname = skill + '_set';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[newname] = {
                    trigger:{
                        player:["phaseAfter"],
                    },
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        if (!player.hasSkill('firezhennan')) return false;
                        return player.firezhennan_key;
                    },
                    async content(event, trigger, player) {
                        player.logSkill('firezhennan');
                        player.firezhennan_key = false;
                        player.firezhennan_used = [];
                        player.link(true);
                        player.damage(1, "fire", "nosource");
                        player.removeGaintag("firezhennan_tag");
                        const skinsID = player.checkSkins();
                        if (changeSkinskey) {
                            if (skinsID === 'fire_baosanniang' || skinsID === 'fire_baosanniang2') {
                                player.changeSkins(1);
                            }
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
        fire_zhangxingcai:{
            name: "张星彩",
            FindSkillsReason : function(name, Reason) {
                let findevts = undefined;
                function findReason(evt) {
                    if (evt.skill && evt.skill === Reason) {
                        findevts = evt;
                        return true;
                    }
                    const parent = evt.parent;
                    if (parent) {
                        return findReason(parent);
                    }
                    return false;
                }
                const globalHistory = _status.globalHistory;
                if (globalHistory.length > 0) {
                    const Evts = globalHistory[globalHistory.length - 1];
                    if (Evts.everything && Evts.everything.length > 0) {
                        for (let evt of Evts.everything) {
                            if (evt.name === name && findReason(evt)) {
                                break;
                            }
                        }
                    }
                }
                return findevts;
            },
            fireqiangwu : function(player, string = 'filter') {
                const handCards = player.getCards('hs');
                const cards = player.getExpansions('fireqiangwu');
                if (string === 'filter') {
                    const dislist = player.getdisSkill();
                    if (dislist.includes('fireqiangwu')) return false;
                    if (!cards || cards.length === 0) return false;
                    if (!handCards || handCards.length < 2) return false;
                    const suit = player.fireqiangwu_suit;
                    if (!suit && typeof suit !== "string") return false;
                    let countSuits = { spade: 0, heart: 0, club: 0, diamond: 0 };
                    for (let countcard of handCards) {
                        const suitcard = get.suit(countcard);
                        if (suitcard !== suit) {
                            countSuits[suitcard]++;
                        }
                    }
                    let countSuit = 0;
                    const suitlists = Object.keys(countSuits);
                    for (let suitlist of suitlists) {
                        if (countSuits[suitlist] > 0) {
                            countSuit++;
                        }
                    }
                    return countSuit >= 2 && _status.currentPhase === player;
                } else if (string === 'cards') {
                    let canusecards = [];
                    const filter = asyncs.shu.fire_zhangxingcai.fireqiangwu(player);
                    if (filter) {
                        const suit = player.fireqiangwu_suit;
                        for (let countcard of handCards) {
                            const suitcard = get.suit(countcard);
                            if (suitcard !== suit) {
                                if (!canusecards.includes(countcard)) {
                                    canusecards.push(countcard);
                                }
                            }
                        }
                    }
                    return canusecards;
                }
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
        fire_huangzhong:{
            name: "神黄忠",
            initfirelieqiong : async function (player, skill) {
                const newname = skill + '_global';
                if (!lib.skill[newname]) lib.skill[newname] = {};
                lib.skill[skill + '_global'] = {
                    mod: {//气海
                        cardEnabled: function(card, player) {
                            if (get.suit(card)=="heart" && player.storage.firelieqiong_JS_QH) return false;
                        },
                        cardSavable: function(card, player) {
                            if (get.suit(card)=="heart" && player.storage.firelieqiong_JS_QH) return false;
                        },
                        cardRespondable: function(card, player){
                            if (get.suit(card)=="heart" && player.storage.firelieqiong_JS_QH) return false;
                        },
                    },
                    trigger:{
                        player:["phaseEnd"],
                        global:["useCard","respond","damageBegin","dieAfter"],
                    },
                    global:[newname],
                    firstDo: true,
                    superCharlotte: true,
                    charlotte: true,
                    silent: true,
                    priority: Infinity,
                    direct: true,
                    filter:function (event, player, name) {
                        if (name == 'damageBegin') {//地机
                            if (!event.player.storage.firelieqiong_JS_DJ) return;
                            return event.num > 0;
                        } else if (name == 'useCard' || name =='respond') {//中枢
                            if (!event.player.storage.firelieqiong_JS_ZS) return;
                            return event.card;
                        } else if (name == 'phaseEnd'|| name == 'dieAfter') {//玩家回合结束
                            return true;
                        }
                    },
                    async content(event, trigger, player) {
                        const Time = event.triggername;
                        if (Time == 'damageBegin') {//地机
                            trigger.player.storage.firelieqiong_JS_DJ = false;
                            trigger.num++;
                            game.log(trigger.player,'因','#g【裂穹】','击中','#g【地机】',',本次受到的伤害+1。');
                        } else if (Time == 'useCard' || Time =='respond') {//中枢
                            trigger.player.storage.firelieqiong_JS_ZS = false;
                            trigger.cancel();
                            game.log(trigger.player,'因','#g【裂穹】','击中','#g【中枢】，本次使用',trigger.card,'无效！');
                        } else if (Time == 'phaseEnd' || Time == 'dieAfter') {
                            if (Time == 'phaseEnd') {
                                if (player.hasSkill('firelieqiong_JS')) player.removeSkill('firelieqiong_JS');
                                player.storage.firelieqiong_JS_LF = false;
                                player.storage.firelieqiong_JS_DJ = false;
                                player.storage.firelieqiong_JS_ZS = false;
                                player.storage.firelieqiong_JS_QH = false;
                                player.storage.firelieqiong_JS_TC = false;
                                const shenhuangzhong = game.filterPlayer(function(current) {
                                    return current.hasSkill('firelieqiong') && current.isAlive();
                                });
                                if (shenhuangzhong.length > 0) {
                                    for (let target of shenhuangzhong) {
                                        if (target.getStorage('firelieqiong').includes(player)) {
                                            target.line(player, 'fire');
                                            target.logSkill('firelieqiong', player);
                                            target.unmarkAuto('firelieqiong', [player]);
                                        }
                                    }
                                }
                            } else if (Time == 'dieAfter') {
                                const shenhuangzhong = game.filterPlayer(function(current) {
                                    return current.hasSkill('firelieqiong') && current.isAlive();
                                });
                                if (shenhuangzhong.length > 0) {
                                    for (let target of shenhuangzhong) {
                                        if (target.getStorage('firelieqiong').includes(trigger.player)) {
                                            target.line(player, 'fire');
                                            target.logSkill('firelieqiong', trigger.player);
                                            target.unmarkAuto('firelieqiong', [trigger.player]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                player.addSkill(newname);
                player.update();
            },
            initfirezhanjue : async function (player, skill) {
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
                    init: async function(player, skill) {
                        if (!player.storage.firezhanjue_damage) player.storage.firezhanjue_damage = false;
                        if (!player.storage.firezhanjue_recover) player.storage.firezhanjue_recover = false;
                    },
                    filter:function (event, player, name) {
                        return true;
                    },
                    async content(event, trigger, player) {
                        player.storage.firezhanjuedamage = false;
                        player.storage.firezhanjuerecover = false;
                        player.unmarkSkill("firezhanjue");

                    }
                };
                player.addSkill(newname);
                player.update();
            },
        },
    },
    wu: {
        water_sunquan: {
            name: "孙权",
            wateryuheng : function () {

            },
        },
        moon_zhouyu:{
            name: "周瑜",
            moonqishi_suits : async function (player = null) {
                let listdraw = [];
                var suits = ['heart', 'club', 'diamond'];
                var piles = ["cardPile", "discardPile"];
                var foundSuits = [];
                for (var pile of piles) {
                    for (var i = 0; i < ui[pile].childNodes.length; i++) {
                        var node = ui[pile].childNodes[i];
                        var suit = get.suit(node);
                        if (suits.includes(suit) && !foundSuits.includes(suit)) {
                            listdraw.push(node);
                            foundSuits.push(suit);
                            if (foundSuits.length >= suits.length) break;
                        }
                    }
                    if (foundSuits.length >= suits.length) break;
                }
                if(player && listdraw.length > 0){
                    await player.gain(listdraw, "gain2");
                }
                return listdraw;
            },
            losemoontags : async function (player, tag) {
                const numchoose = game.filterPlayer(function (current) {
                    return current.group === 'wu';
                }).length;
                const skinsID = player.checkSkins();
                if (tag === "qinyin" && numchoose > 0) {
                    const result = await player.chooseTarget(
                        setColor("〖琴音〗：是否令至多" + get.cnNumber(numchoose) + "名其他角色，令其选择一项：<br>　　①交给你一张牌并回复一点体力；<br>　　②令你摸一张牌并失去一点体力。"),
                        [1, numchoose],
                        function (card, player, target) {
                            return target !== player;
                        }
                    ).set('ai', (target) => {
                        if (moonqinyinAI(player,"targetAI").includes(target)) return 1;
                        else return 0;
                    }).forResult();
                    if (result.bool) {
                        if (changeSkinskey) {
                            if (skinsID === 'moon_zhouyu' || skinsID === 'moon_zhouyu2') player.changeSkins(1);
                            if (skinsID === 'moon_zhouyu4') player.changeSkins(3);
                        }
                        const targets = result.targets;
                        player.line(targets, 'water');
                        while (targets.length) {
                            let target = targets.shift();
                            let allCards = target.getCards('hes');
                            const list = [
                                setColor("〖选项一〗：交给" + get.translation(player) + "一张牌，你回复一点体力。"),
                                setColor("〖选项二〗：令" + get.translation(player) + "摸一张牌，你失去一点体力。"),
                            ];
                            const chooseButton = await target.chooseButton([setColor('〖琴音〗'),
                                [list.map((item, i) => {return [i, item];}),"textbutton",],
                            ]).set("filterButton", function (button) {
                                if (button.link === 0) {
                                    return target.countGainableCards(player, "he") > 0 && allCards.length > 0;
                                } else if (button.link === 1) {
                                    return true;
                                }
                            }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
                                /**
                                 * 现在到了目标玩家选择选项了！
                                 * 站在目标玩家自身考虑，目标玩家到底是选哪个选项好？
                                 */
                                function getButtonLink() {
                                    let setnum = 0;
                                    const att = get.attitude(target, player);
                                    const cards = target.getCards('he');
                                    if (cards && cards.length) {
                                        if (att >= 2) {
                                            if (target.isDamaged()) setnum = 0;//选择选项一
                                            if (cards.length >= Math.max(4,target.maxHp) && target.isHealthy()) setnum = 1;//选择选项二
                                            else setnum = 0;//选择选项一
                                        } else {
                                            const hascards = cards.filter(card => get.value(card, target) < compareValue(target,'tao'));
                                            if (hascards.length) setnum = 0;//选择选项一
                                            else setnum = 1;//选择选项二
                                        }
                                    } else {
                                        setnum = 1;
                                    }
                                    return setnum;
                                }
                                return button.link == getButtonLink();
                            }).forResult();
                            if (chooseButton.bool) {
                                const choices = chooseButton.links;
                                if (choices.includes(0)) {
                                    let cards = await target.chooseCard("he", true, `选择交给${get.translation(player)}一张牌`).forResultCards();
                                    if (cards && cards.length) {
                                        await target.give(cards, player);
                                        await target.recover();
                                    }
                                } else if (choices.includes(1)) {
                                    await player.draw();
                                    await target.loseHp();
                                }
                            }
                        }
                    }
                } else if (tag === "qishi") {
                    const result = await player.chooseTarget(
                        setColor("〖棋势〗：请选择一名其他角色令其弃置同棋势花色的所有牌！"),
                        function (card, player, target) {
                            return target !== player;
                        }
                    ).set('ai', (target) => {
                        return target === moonqishiAI(player,"targetAI");
                    }).forResult();
                    if (result.bool) {
                        if (changeSkinskey) {
                            if (skinsID === 'moon_zhouyu' || skinsID === 'moon_zhouyu1') player.changeSkins(2);
                            if (skinsID === 'moon_zhouyu3') player.changeSkins(4);
                        }
                        const target = result.targets[0];
                        player.line(target, 'water');
                        const cards = target.getCards('he',{ suit: 'spade' });
                        if (cards.length) {
                            await target.discard(cards);
                            game.log(target, setColor('弃置了'), cards.length, setColor('张同棋势花色牌！'));
                            await target.draw();
                        } else {
                            game.log(target, setColor('没有同棋势花色牌可以弃置！'));
                            await asyncs.wu.moon_zhouyu.moonqishi_suits(player);
                        }
                    }
                } else if (tag === "shubi") {
                    if (changeSkinskey) {
                        if (skinsID === 'moon_zhouyu' || skinsID === 'moon_zhouyu2') player.changeSkins(1);
                        if (skinsID === 'moon_zhouyu4') player.changeSkins(3);
                    }
                    const text = setColor("〖书笔〗");
                    const topcards = get.cards(1);
                    if (!topcards || topcards.length === 0) return;
                    await player.showCards(topcards, get.translation(player) + "发动了" + text);
                    await player.gain(topcards, "draw");
                    let suits = get.suit(topcards[0]);
                    if (suits === 'diamond') {
                        game.log(player, '获得的',topcards[0],setColor('为书笔花色牌！'));
                        //await asyncs.wu.moon_zhouyu.moonshubi_suits(player);削弱！
                        const setsuits = ['spade','heart', 'club'];
                        const randomSuit = setsuits[Math.floor(Math.random() * setsuits.length)];
                        await player.specifyCards(randomSuit);
                    } else {
                        game.log(player, '获得的',topcards[0],setColor('非书笔花色牌！'));
                    }
                    const canRecastcards = player.getCards('he').filter(card => player.canRecast(card));
                    if (canRecastcards && canRecastcards.length > 0) {
                        const result = await player.chooseCard("请选择重铸一张牌", 'he', 1, true, function(card) {
                            return player.canRecast(card);
                        }).set('ai', async (card) => {
                            return moonshubiAI(player, card);
                        }).forResult();
                        if (result.bool) {
                            player.recast(result.cards[0]);
                        }
                    }
                } else if (tag === "huayi") {
                    let gaincards = [];
                    const targets = game.players.filter(o => o !== player && o.isAlive() && o.countGainableCards(player, "hej") > 0);
                    for (let target of targets) {
                        const hejcards = target.getGainableCards(player, "hej");
                        if (hejcards && hejcards.length > 0) {
                            for (let card of hejcards) {
                                gaincards.push(card);
                            }
                        }
                    }
                    if (gaincards.length === 0) return;
                    if (changeSkinskey) {
                        if (skinsID === 'moon_zhouyu' || skinsID === 'moon_zhouyu1') player.changeSkins(2);
                        if (skinsID === 'moon_zhouyu3') player.changeSkins(4);
                    }
                    //随机选择一张牌
                    const randomCard = gaincards[Math.floor(Math.random() * gaincards.length)];
                    let text = setColor("〖画意〗");
                    const type = get.type(randomCard);
                    if (type === "basic") {
                        text += setColor("：使用下一张基本牌的基础数值 + 1！");
                    } else if (type === "trick" || type === "delay") {
                        text += setColor("：使用下一张普通锦囊牌无距离限制且可多指定两个目标！");
                    } else if (type === "equip") {
                        text += setColor("：重铸区域内同画意花色所有牌，若无则摸一张牌！");
                    } else {
                        text += setColor("无！希望这不是BUG！而是您的扩展自定义的类型！");
                    }
                    await player.showCards([randomCard], get.translation(player) + "发动了" + text);
                    await player.gain(randomCard, "gain2");
                    if (type === "basic") {
                        player.addTempSkill('moonyingmou_basic');
                        player.markSkill('moonyingmou_basic');
                        player.update();
    
                    } else if (type === "trick" || type === "delay") {
                        player.addTempSkill('moonyingmou_trick');
                        player.markSkill('moonyingmou_trick');
                        player.update();
                    } else if (type === "equip") {
                        const canRecastclubCards = player.getCards('he').filter(card => get.suit(card) === "club" && player.canRecast(card));
                        if (canRecastclubCards && canRecastclubCards.length > 0) {
                            player.recast(canRecastclubCards);
                        } else {
                            await player.draw();
                        }
                    }
                }
            },
        },
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
                    player.tempdisSkill('wateryinghun', { global: 'roundStart' });
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
                            if (changeSkinskey) player.changeSkins(1);
                            return;
                        } else {
                            if (changeSkinskey) player.changeSkins(1);
                            if (player.watertaji_usedsuits) player.watertaji_usedsuits = [];
                            if(!player.watertaji_usedsuits) player.watertaji_usedsuits = [];
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
        TAF_tongyu:{
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
                        if (name === 'TAF_tongyu_shadow') {
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
                        if (name === 'TAF_tongyu_shadow') {
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
        TAF_jiangtaixu:{
            name: "姜太虚",
            shenwangjingtu : async function (choices = 'noname') {
                if (choices == 'noname') {
                    ui._shenwangjingtu_state.innerHTML = '';
                    ui.background.setBackgroundImage("extension/银竹离火/image/background/" + '经典军八龙纹' + ".png");
                    game.playBackgroundMusic();
                } else if (choices == '神王净土') {
                    ui._shenwangjingtu_state.innerHTML = '<br><font color= #EE9A00>神王净土</font>';
                    ui.background.setBackgroundImage("extension/银竹离火/image/background/" + '神王净土' + ".png");
                    ui.backgroundMusic.src = 'extension/银竹离火/audio/神王净土.mp3';
                }
            },
        },
        ice_zhangqiying:{
            name: "张琪瑛",
            viewAsicefalu : function (player, event = null) {
                if (!event) {
                    let basiclist = [], tricklist = []
                    const setPacks = ['standard', 'extra', 'guozhan', 'yingbian', 'yongjian', 'sp', 'zhulu', 'yunchou'];
                    const cardPacks = lib.cardPack
                    for (let cardPackname in cardPacks) {
                        if (cardPackname == "standard") {
                            const namelist = cardPacks[cardPackname];
                            if (namelist && namelist.length > 0) {
                                for (let name of namelist) {
                                    const type = get.type(name);
                                    if (type == "basic") {
                                        basiclist.push(name);
                                    }
                                }
                            }
                        }
                        for (let setPackname of setPacks) {
                            if (cardPackname == setPackname) {
                                const namelist = cardPacks[setPackname];
                                if (namelist && namelist.length > 0) {
                                    for (let name of namelist) {
                                        const type = get.type(name);
                                        if (type == "trick") {
                                            tricklist.push(name);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(!player.icefalu_basiclist) player.icefalu_basiclist = basiclist;
                    if(!player.icefalu_tricklist) player.icefalu_tricklist = tricklist;
                    if(player.icefalu_tricklist.length < 4) {
                        player.chat("什么四张锦囊牌都没有！不是我想要的！移除此技能！");
                        player.removeSkill("icefalu");
                    }
                    if(!player.icefalu_trickused) player.icefalu_trickused = [];
                    if (!player.icefalu_trickRandom) {
                        player.icefalu_trickRandom = [];
                        const chooselist = player.icefalu_tricklist.filter(name => !player.icefalu_trickused.includes(name));
                        if (chooselist.length >= 4) {
                            const shuffledList = chooselist.slice();
                            for (let i = shuffledList.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
                            }
                            const randomSelection = shuffledList.slice(0, 4);
                            player.icefalu_trickRandom = randomSelection;
                            player.icefalu_trickused = player.icefalu_trickused.concat(randomSelection);
                        }
                    }
                    player.update();
                } else if (event) {
                    const filter = event.filterCard;
                    if (!filter) return;
                    let list = [],standardbasic = [],tricklist = [];
                    const basiclist = player.icefalu_basiclist;
                    const natures = lib.inpile_nature;
                    if (basiclist && basiclist.length > 0) {
                        for (let name of basiclist) {
                            if (name == "sha") {
                                if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) standardbasic.push(["basic", '', name]);
                                for (let nature of natures) {
                                    if (filter(get.autoViewAs({ name: name, nature: nature }, "unsure"), player, event)) standardbasic.push(["basic", '', name, nature]);
                                }
                            } else {
                                if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) standardbasic.push(["basic", '', name]);
                            }
                        }
                    }
                    const Randomtricks = player.icefalu_trickRandom;
                    if (Randomtricks && Randomtricks.length > 0) {
                        for (let name of Randomtricks) {
                            if (filter(get.autoViewAs({ name: name }, "unsure"), player, event)) tricklist.push(["trick", '', name]);
                        }
                    }
                    list = [...standardbasic, ...tricklist];
                    if (list.length == 0) return [];
                    return list;
                }
            },
            changeicefalu : async function (player) {
                if (!player.hasSkill('icefalu')) return;
                const key = player.icefalu_change;
                async function canuse () {
                    if(key) {
                        const disPilecards = ui.discardPile.childNodes;
                        if(disPilecards.length <= 0) return false;
                        return true;
                    } else {
                        const pilecards = ui.cardPile.childNodes;
                        if(pilecards.length <= 0) return false;
                        return true;
                    }
                }
                if (!await canuse()) return;
                let cardslist = [];
                const pile = key ? ui.discardPile : ui.cardPile;
                const pilecards = Array.from(pile.childNodes);
                const maxCardsToSelect = 4;
                while (cardslist.length < maxCardsToSelect && pilecards.length > 0) {
                    const randomIndex = Math.floor(Math.random() * pilecards.length);
                    cardslist.push(pilecards[randomIndex]);
                    pilecards.splice(randomIndex, 1);
                }
                if(cardslist.length <= 0) return;
                await game.cardsGotoOrdering(cardslist);
                const redcards = cardslist.filter(card => get.color(card) === "red");
                const blackcards = cardslist.filter(card => get.color(card) === "black");
                let TXT_one = "",TXT_two = "";
                let list_one = [],list_two = [];
                if(key) {
                    TXT_one = setColor("〖法箓〗：将黑色牌以任意顺序置于〖牌堆顶〗！");
                    list_one = [TXT_one, blackcards];
                    TXT_two = setColor("〖法箓〗：将红色牌以任意顺序置于〖牌堆底〗，此些牌称为〖法箓〗！");
                    list_two = [TXT_two, redcards];
                } else {
                    TXT_one = setColor("〖法箓〗：将红色牌以任意顺序置于〖弃牌堆顶〗！");
                    list_one = [TXT_one, redcards];
                    TXT_two = setColor("〖法箓〗：将黑色牌以任意顺序置于〖弃牌堆底〗，此些牌称为〖法箓〗！");
                    list_two = [TXT_two, blackcards];
                }
                const Moveresult = await player.chooseToMove("〖法箓〗",true)
                .set("list", [list_one,list_two])
                .set("filterMove", (from, to, moved) => {
                    //to.link为要已选择并即将要交换的卡牌；from.link为要交换的卡牌。
                    //to为数字，表示要交换的位置；form为卡牌
                    const isFromInListOne = moved[0].includes(from.link);
                    const isToInListOne = moved[0].includes(to.link);
                    const isFromInListTwo = moved[1].includes(from.link);
                    const isToInListTwo = moved[1].includes(to.link);
                    // 如果 from 和 to 都在 list_one 或者都在 list_two，则允许交换
                    if ((isFromInListOne && isToInListOne) || (isFromInListTwo && isToInListTwo)) {
                        return true;
                    }
                    return false;
                }).set('filterOk', (moved) => {
                    return true;
                }).set("processAI", (list) => {
                    let 排序后 = [[],[]];
                    if(key) {
                        const blackcards = list[0][1];
                        const redcards = list[1][1];
                        const target = _status.currentPhase.next;
                        const judges = target.getCards("j");
                        const hasFriend = get.attitude(player, target) >= 2;
                        const att = get.attitude(player, target);
                        let cheats = [];
                        const wuxie_one = target.getCards('hs').filter(card => get.name(card,target) === 'wuxie');
                        const wuxie_two = player.getCards('hs').filter(card => get.name(card,player) === 'wuxie');
                        if (hasFriend) {
                            if (judges.length > 0 && !wuxie_one.length && !wuxie_two.length) {
                                cheats = setjudgesResult(judges,blackcards,player,false);//令判定牌失效的卡牌
                            }
                        } else {
                            if (judges.length > 0) {
                                cheats = setjudgesResult(judges,blackcards,player,true);//令判定牌生效的卡牌
                            }
                        }
                        let remainingBlackcards = blackcards.filter(card => !cheats.includes(card));
                        if (att >= 2) {
                            remainingBlackcards.sort((a, b) => get.value(b, target) - get.value(a, target));
                        } else {
                            remainingBlackcards.sort((a, b) => get.value(a, target) - get.value(b, target));
                        }
                        排序后 = [cheats.concat(remainingBlackcards), [...redcards]];
                    } else {
                        const redcards = list[0][1];
                        const blackcards = list[1][1];
                        排序后 = [[...redcards], [...blackcards]];
                    }
                    return 排序后;
                }).set('forced', true).forResult();
                if (Moveresult.bool) {
                    const topcards = Moveresult.moved[0];
                    const bottomcards = Moveresult.moved[1];
                    if(key) {
                        if (topcards.length > 0) {
                            await player.chooseCardsToPile(topcards, "top");
                        }
                        if (bottomcards.length > 0) {
                            for(let card of bottomcards) {
                                if(!card.storage.icefalu) {
                                    card.storage.icefalu = true;
                                }
                            }
                            await player.chooseCardsToPile(bottomcards, "bottom");
                        }
                        player.icefalu_change = false;
                        player.changeZhuanhuanji("icefalu");
                    } else {
                        if (topcards.length > 0) {
                            await player.chooseCardsTodisPile(topcards, "top");
                        }
                        if (bottomcards.length > 0) {
                            for(let card of bottomcards) {
                                if(!card.storage.icefalu) {
                                    card.storage.icefalu = true;
                                }
                            }
                            await player.chooseCardsTodisPile(bottomcards, "bottom");
                        }
                        player.icefalu_change = true;
                        player.changeZhuanhuanji("icefalu");
                    }
                }
            },
            icefaluCards : function (trigger,string = 'has' ){
                const card = trigger.card;
                const cards = trigger.cards;
                if(string == 'has') {
                    if(card) {
                        if (card && card.storage.icefalu) return true;
                        const scards = card.cards;
                        if (scards && scards.length > 0) {
                            for (let c of scards) {
                                if (c && c.storage.icefalu) return true;
                            }
                        }
                    }
                    if(cards) {
                        for (let c of cards) {
                            if (c && c.storage.icefalu) return true;
                        }
                    }
                    return false;
                } else if(string == 'clear') {
                    if(card) {
                        if (card && card.storage.icefalu) {
                            card.storage.icefalu = false;
                            delete card.storage.icefalu;
                        }
                        const scards = card.cards;
                        if (scards && scards.length > 0) {
                            for (let c of scards) {
                                if (c && c.storage.icefalu) {
                                    c.storage.icefalu = false;
                                    delete c.storage.icefalu;
                                }
                            }
                        }
                    }
                    if(cards) {
                        for(let card of cards) {
                            if (card && card.storage.icefalu) {
                                card.storage.icefalu = false;
                                delete card.storage.icefalu;
                            }
                        }
                    }
                    game.updateRoundNumber();
                }
            },
            icedianhua: async function (trigger, player) {
                if(!player.icedianhua_used) {
                    player.icedianhua_used = 0
                }
                player.icedianhua_used ++;
                const php = player.hp;
                const pDhp = player.getDamagedHp();
                const absnum = Math.abs(pDhp - php);
                player.hp = pDhp;
                player.update();
                if(absnum > 0) {
                    if(php > pDhp) {
                        await player.draw(absnum);
                    } else if(php < pDhp) {
                        if (player.countCards('he') >= absnum) {
                            await player.chooseToDiscard(absnum, 'he', true);
                        } else {
                            await player.discard(player.getCards('he'), true);
                        }
                    }
                } else {
                    await player.loseHp();
                }
                if (player.hp <= 0 && player.isAlive() && !trigger.nodying) {
                    game.delayx();
                    trigger._dyinged = true;
                    player.dying(trigger);
                }
            },
            onuseicefalu : async function (player) {
                const setAlltricklist = player.icefalu_tricklist;
                if (!setAlltricklist || setAlltricklist.length <= 0) {
                    player.chat("什么四张锦囊牌都没有！不是我想要的！移除此技能！");
                    player.removeSkill("icefalu");
                }
                const chooselist = player.icefalu_tricklist.filter(name => !player.icefalu_trickused.includes(name));
                if (chooselist.length >= 4) {
                    const shuffledList = chooselist.slice();
                    for (let i = shuffledList.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
                    }
                    const randomSelection = shuffledList.slice(0, 4);
                    player.icefalu_trickRandom = randomSelection;
                    player.icefalu_trickused = player.icefalu_trickused.concat(randomSelection);
                } else {
                    player.icefalu_trickused = [];
                    const chooselist = player.icefalu_tricklist.filter(name => !player.icefalu_trickused.includes(name));
                    if (chooselist.length >= 4) {
                        const shuffledList = chooselist.slice();
                        for (let i = shuffledList.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
                        }
                        const randomSelection = shuffledList.slice(0, 4);
                        player.icefalu_trickRandom = randomSelection;
                        player.icefalu_trickused = player.icefalu_trickused.concat(randomSelection);
                    }
                }
                player.update();
                let getcardsList = [];
                const piles = ["cardPile", "discardPile"];
                for (let pile of piles) {
                    if (!ui[pile]) continue;
                    const cards = ui[pile].childNodes;
                    for (let card of cards) {
                        const key = card.storage.icefalu;
                        if (key) {
                            if (!getcardsList.includes(card)) {
                                getcardsList.push(card);
                            }
                        }
                    }
                }
                if (getcardsList.length > 0) {
                    //随机选择其中一张
                    const randomIndex = Math.floor(Math.random() * getcardsList.length);
                    const randomCards = getcardsList[randomIndex];
                    await player.gain(randomCards, "gain2");
                }
            },
        },
        ice_zhugeliang:{
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
        thunder_jiaxu:{
            name: "SE贾诩",
            thunderweimuReason : function (name, cardname, skill) {
                let findevts = undefined;
                function findReason(evt) {
                    if (evt.skill && evt.skill === skill) {
                        findevts = evt;
                        return true;
                    }
                    const parent = evt.parent;
                    if (parent) {
                        return findReason(parent);
                    }
                    return false;
                }
                const globalHistory = _status.globalHistory;
                if (globalHistory.length > 0) {
                    const Evts = globalHistory[globalHistory.length - 1];
                    if (Evts.everything && Evts.everything.length > 0) {
                        for (let evt of Evts.everything) {
                            if (evt.name === name && evt.card.name === cardname && evt.card.cards.length === 0) {
                                if (findReason(evt)) {
                                   return evt;
                                }
                            }
                        }
                    }
                }
                return findevts;
            },
            thunderweimu: async function (player,target) {
                /**
                 * 必须拥有【谋身】不然这个技能【帷幕】文案就不通过！
                 */
                async function key(player,target) {
                    if (!player.thunderweimu_usedname) player.thunderweimu_usedname = [];
                    if (!player.thunderweimu_showdname) player.thunderweimu_showdname = [];
                    if (!player.thunderweimu_used) player.thunderweimu_used = false;
                    const showdnamelist = player.thunderweimu_showdname;
                    const usednamenamelist = player.thunderweimu_usedname;
                    const cards = player.getCards("hes").filter(card => !showdnamelist.includes(get.name(card,player)));
                    if(!cards || cards.length == 0) return false;
                    const cardnames = lib.inpile.filter(name => !usednamenamelist.includes(name));
                    if(cardnames && cardnames.length > 0) {
                        for(const name of cardnames) {
                            const Vcard = { name: name, nature: '', isCard: true };
                            const type = get.type(name);
                            if(type === 'trick') {
                                if (target.hasUseTarget(Vcard) && player.hasUseTarget(Vcard)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    return false;
                }
                if(!await key(player,target)) return;
                const text = setColor("〖帷幕〗");
                let text1 = setColor("〖帷幕〗：是否展示一张本轮与〖谋身·帷幕〗展示过的不同名牌，并声明一张本轮未声明的普通锦囊牌名并摸一张牌，令");
                let text2 = setColor("选择一项：1.失去一点体力视为使用你声明的牌；2.你将你展示的牌当做声明的牌使用？");
                let TXT1 = text1 + get.translation(target) + text2;
                let cards = await player.chooseCard('he',TXT1,function(card) {
                    const showdnamelist = player.thunderweimu_showdname || [];
                    return !showdnamelist.includes(get.name(card,player));
                }).set("ai", function (card) {
                    if (player.thundermoushen_canshow) {//如果是回合结束后执行，则改为强制执行！因为【谋身的设定】
                        if (get.name(card) === "tao"||get.name(card) === "shan"||get.name(card) === "jiu") {
                            return false;
                        } else {
                            const value = get.value(card,player);
                            if (value < 8) return true
                            else return true;
                        }
                    } else {
                        const att = get.attitude(player, target);
                        if (att < 2) {
                            return false;
                        } else {
                            if (get.name(card) === "tao"||get.name(card) === "shan"||get.name(card) === "jiu") {
                                return false;
                            } else {
                                const value = get.value(card,player);
                                if (value < 8) return true
                                return false;
                            }
                        }
                    }
                }).set('forced', player.thundermoushen_canshow).forResultCards();
                //如果是回合结束后执行，则改为强制执行！因为【谋身的设定】
                if (cards && cards.length) {
                    player.thunderweimu_used = true;
                    const showcard = cards[0];
                    const name1111 = get.translation(get.name(showcard, player));
                    await player.showCards([showcard], get.translation(player) + "发动了" + text);
    
                    const usednamenamelist = player.thunderweimu_usedname;
                    const cardnames = lib.inpile.filter(name => !usednamenamelist.includes(name));
                    let list = [];
                    for(const name of cardnames) {
                        const Vcard = { name: name, nature: '', isCard: true };
                        const type = get.type(name);
                        if(type === 'trick') {
                            if (target.hasUseTarget(Vcard) && player.hasUseTarget(Vcard)) {
                                list.push([type, '', name]);
                            }
                        }
                    }
                    if(list.length > 0) {
                        const chooseButton = await player.chooseButton([
                            "〖帷幕〗：请选择声明一个普通锦囊牌名：",
                            [list, "vcard"]
                        ]).set("ai", function (button) {
                            const card = { name: button.link[2], nature: button.link[3], isCard: true, };
                        }).set('forced', true).forResult();
                        if (chooseButton.bool) {
                            const cardName = chooseButton.links[0][2];

                            let cardtext = get.translation(cardName);
                            player.popup(cardtext);//声明的牌名
                            game.log(player,"声明了" + cardtext + "令" ,target, "执行" + text + "！");
                            await player.draw();
                            const lists = ['失去一点体力视为使用' + cardtext, get.translation(player) + "将" + name1111 + "当做" + cardtext + "使用"];
                            const result = await target.chooseControl(lists).set ("ai", control => {
                                if (target === player) return lists[1];
                                const att = get.attitude(player, target);
                                let livenum = target.hp + target.countCards('h', { name: ['tao', 'jiu'] }) - 1;
                                if (att < 2) {
                                    if (livenum >= 1) return lists[0];
                                    return lists[1];
                                }
                                return lists[1];
                            }).set('forced', true).forResult();
                            const Vcard = { name: cardName, nature: chooseButton.links[0][3], isCard: true };
                            if (result.control === lists[0]) {
                                await target.loseHp();
                                await target.chooseUseTarget(Vcard, true, false);
                                if (!player.thunderweimu_usedname.includes(cardName)) {
                                    player.thunderweimu_usedname.push(cardName);
                                }
                                const canstorage = player.thundermoushen_canshow;
                                if (canstorage && canstorage === true) {
                                    if (!player.thunderweimu_showdname.includes(showcard.name)) {
                                        player.thunderweimu_showdname.push(showcard.name);
                                    }
                                }
                            }
                            if (result.control === lists[1]) {
                                //await player.viewAsToUse(showcard,Vcard,'true');
                                if (!player.thunderweimu_usedname.includes(cardName)) {
                                    player.thunderweimu_usedname.push(cardName);
                                }
                                const canstorage = player.thundermoushen_canshow;
                                if (canstorage && canstorage === true) {
                                    if (!player.thunderweimu_showdname.includes(showcard.name)) {
                                        player.thunderweimu_showdname.push(showcard.name);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    player.thunderweimu_used = false;
                }
            },
            thunderwenhe_shan: async function (trigger, player) {
                function canUsebasic(player) {
                    const basiccards = player.getCards("hs").filter(c => get.type(c,player) === "basic" && get.name(c,player) !== "shan");
                    if (basiccards && basiccards.length > 0) {
                        let canuse = [];
                        for (let card of basiccards) {
                            const targets = game.players.filter(o => o.isAlive());
                            for (let target of targets) {
                                if (lib.filter.targetEnabled2(card, player, target) && lib.filter.cardRespondable(card, player, target) && lib.filter.targetInRange(card, player, target)) {
                                    canuse.push(card);
                                }
                            }
                        }
                        if (canuse.length > 0) {
                            const taocards = canuse.filter(c => get.name(c, player) === "tao");
                            if (taocards && taocards.length === canuse.length) {
                                if(!player.hasSkillTag("respondTao")) return false;
                                if(player.isHealthy()) return false;
                                return true;
                            } else {
                                return true;
                            }
                        }
                        return false;
                    }
                    return false;
                }
                if (!player.thunderwenhe_loseHp) player.thunderwenhe_loseHp = false;
                if (!player.thunderwenhe_chooseToUse) player.thunderwenhe_chooseToUse = false;
                if (!player.thunderwenhe_shan) player.thunderwenhe_shan = 0;
                if (!player.thunderwenhe_notShan) player.thunderwenhe_notShan = 0;
                if (player.thunderwenhe_loseHp) return false;
                if (player.thunderwenhe_chooseToUse) return false;
                let TXT = setColor("〖文和〗：是否要摸一张牌：");
                let text1 = setColor("〖打出一张基本牌〗："), text2 = setColor("〖失去一点体力〗：");
                const Tname = get.translation(trigger.player);
                const sss = setColor("〖闪〗响应〖杀〗的询问，");
                text1 += "跳过" + Tname + sss + "令其视为使用之。";
                text2 += "跳过" + Tname + sss + "令其视为使用之。";
                const list = [ text1, text2];
                const chooseButton = await player.chooseButton([TXT,
                    [list.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return canUsebasic(player);
                    } else if (button.link === 1) {
                        return true;
                    }
                }).set("selectButton", 1).set("ai", function (button) {
                    const att = get.attitude(player, trigger.player);
                    const { getAliveNum } = setAI;
                    if (att < 2) return false;
                    function linknum() {
                        let num = 0;
                        if (canUsebasic(player)) {
                            let getUseValue = false;
                            const basiccards = player.getCards("hs").filter(c => get.type(c,player) === "basic" && get.name(c,player) !== "shan");
                            for (let card of basiccards) {
                                if (player.hasValueTarget(card) && player.getUseValue(card) > 0) {
                                    getUseValue = true;
                                    break;
                                }
                            }
                            if (getUseValue) {
                                num = 0;
                            } else {
                                if (getAliveNum(player,1) > 1) {
                                    num = 1;
                                } else {
                                    return false;
                                }
                            }
                        } else {
                            if (getAliveNum(player,1) > 1) {
                                num = 1;
                            } else {
                                return false;
                            }
                        }
                        return num;
                    }
                    if (linknum() ===  false) return false;
                    else return button.link === linknum();
                }).forResult();
                if (chooseButton.bool) {
                    player.thunderwenhe_loseHp = true;
                    player.thunderwenhe_chooseToUse = true;
                    player.thunderwenhe_shan ++;
                    const choices = chooseButton.links;
                    if (choices.includes(0)) {
                        await player.draw();
                        player.chooseToUse({
                            prompt: "打出一张基本牌！",
                            filterCard: function (card, player) {
                                const cardinfo = get.info(card,false);
                                if (!cardinfo) return false;
                                if (cardinfo.type !== "basic") return false;
                                if (card.name === "shan") return false;
                                return true;
                            },
                            filterTarget: function(card, player, target) {
                                return lib.filter.targetEnabledx(card, player, target) && lib.filter.targetInRange(card, player, target);
                            },
                            position : "hs",
                            selectCard: 1,
                        }).set('forced', true);
                        trigger.untrigger();
                        trigger.set("responded", true);
                        trigger.result = { bool: true, card: { name: "shan", isCard: true } };
                        game.log(trigger.player, '因', player,'发动了', '#g【文和】', '已视为失去一点体力！');
                    } else if (choices.includes(1)) {
                        await player.draw();
                        await player.loseHp();
                        trigger.untrigger();
                        trigger.set("responded", true);
                        trigger.result = { bool: true, card: { name: "shan", isCard: true } };
                        game.log(trigger.player, '因', player,'发动了', '#g【文和】', '已视为失去一点体力！');
                    }
                }
            },
            thunderwenhe_notShan: async function (trigger, player) {
                function VCard() {
                    const name = trigger.card.name;
                    const nature = trigger.card.nature;
                    const color = trigger.card.color;
                    const number = trigger.card.number;
                    const suit = trigger.card.suit;
                    let VCard = {name: '', nature: '', color: '', number: '', suit: '', isCard:true};
                    if (!name) return;
                    if (name && typeof name === 'string') {
                        VCard.name = name;
                    }
                    if (nature && typeof nature === 'string') {
                        VCard.nature = nature;
                    }
                    if (color && typeof color === 'string') {
                        VCard.color = color;
                    }
                    if (number !== undefined) {
                        VCard.number = number;
                    }
                    if (suit && typeof suit === 'string') {
                        VCard.suit = suit;
                    }
                    return VCard;
                }
                function canUsebasic(player) {
                    const basiccards = player.getCards("hs").filter(c => get.type(c,player) === "basic" && get.name(c,player) !== "shan");
                    if (basiccards && basiccards.length > 0) {
                        let canuse = [];
                        for (let card of basiccards) {
                            const targets = game.players.filter(o => o.isAlive());
                            for (let target of targets) {
                                if (lib.filter.targetEnabled2(card, player, target) && lib.filter.cardRespondable(card, player, target) && lib.filter.targetInRange(card, player, target)) {
                                    canuse.push(card);
                                }
                            }
                        }
                        if (canuse.length > 0) {
                            const taocards = canuse.filter(c => get.name(c, player) === "tao");
                            if (taocards && taocards.length === canuse.length) {
                                if(!player.hasSkillTag("respondTao")) return false;
                                if(player.isHealthy()) return false;
                                return true;
                            } else {
                                return true;
                            }
                        }
                        return false;
                    }
                    return false;
                }
                if (!player.thunderwenhe_loseHp) player.thunderwenhe_loseHp = false;
                if (!player.thunderwenhe_chooseToUse) player.thunderwenhe_chooseToUse = false;
                if (!player.thunderwenhe_shan) player.thunderwenhe_shan = 0;
                if (!player.thunderwenhe_notShan) player.thunderwenhe_notShan = 0;
                if (player.thunderwenhe_loseHp) return false;
                if (player.thunderwenhe_chooseToUse) return false;
                const Vcard = VCard();
                if (!Vcard) return;
                const cardname = get.translation(trigger.card.name);
                const Tname = get.translation(trigger.player);
                const targetes = trigger.targets;
                if (!cardname || !Tname || !targetes || targetes.length === 0) return;
                let TXT = setColor("〖文和〗：是否要摸一张牌：");
                let text1 = setColor("〖打出一张基本牌〗："), text2 = setColor("〖失去一点体力〗：");
                let fanyilist = [];
                for (let target of targetes) {
                    const name = get.translation(target);
                    fanyilist.push(name);
                }
                text1 += "取消" + Tname + "对" + fanyilist.join("、") + "使用的" + cardname + "，令其视为使用之。";
                text2 += "取消" + Tname + "对" + fanyilist.join("、") + "使用的" + cardname + "，令其视为使用之。";
                const list = [ text1, text2];
                const chooseButton = await player.chooseButton([TXT,
                    [list.map((item, i) => {return [i, item];}),"textbutton",],
                ]).set("filterButton", function (button) {
                    if (button.link === 0) {
                        return canUsebasic(player);
                    } else if (button.link === 1) {
                        return true;
                    }
                }).set("selectButton", 1).set("ai", function (button) {
                    const att = get.attitude(player, trigger.player);
                    const { getAliveNum } = setAI;
                    if (att < 2) return false;
                    function linknum() {
                        let num = 0;
                        if (canUsebasic(player)) {
                            let getUseValue = false;
                            const basiccards = player.getCards("hs").filter(c => get.type(c,player) === "basic" && get.name(c,player) !== "shan");
                            for (let card of basiccards) {
                                if (player.hasValueTarget(card) && player.getUseValue(card) > 0) {
                                    getUseValue = true;
                                    break;
                                }
                            }
                            if (getUseValue) {
                                num = 0;
                            } else {
                                if (getAliveNum(player,1) > 1) {
                                    num = 1;
                                } else {
                                    return false;
                                }
                            }
                        } else {
                            if (getAliveNum(player,1) > 1) {
                                num = 1;
                            } else {
                                return false;
                            }
                        }
                        return num;
                    }
                    if (linknum() ===  false) return false;
                    else return button.link === linknum();
                }).forResult();
                if (chooseButton.bool) {
                    player.thunderwenhe_loseHp = true;
                    player.thunderwenhe_chooseToUse = true;
                    player.thunderwenhe_notShan++;
                    const choices = chooseButton.links;
                    if (choices.includes(0)) {
                        trigger.cancel();
                        await player.draw();
                        player.chooseToUse({
                            prompt: "打出一张基本牌！",
                            filterCard: function (card, player) {
                                const cardinfo = get.info(card,false);
                                if (!cardinfo) return false;
                                if (cardinfo.type !== "basic") return false;
                                if (card.name === "shan") return false;
                                return true;
                            },
                            filterTarget: function(card, player, target) {
                                return lib.filter.targetEnabledx(card, player, target) && lib.filter.targetInRange(card, player, target);
                            },
                            position : "hs",
                            selectCard: 1,
                        }).set('forced', true);
                        await trigger.player.useCard(Vcard, targetes, false);
                    } else if (choices.includes(1)) {
                        trigger.cancel();
                        await player.draw();
                        await player.loseHp();
                        await trigger.player.useCard(Vcard, targetes, false);
                    }
                }
            },
        },
        ice_jiaxu:{
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
        ice_simahui:{
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
                    const getcolors = asyncs.qun.ice_simahui.iceyinshi(player,'color');
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
        ice_huangfusong:{
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
                            //console.log(player.icelianjie_damage);
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
        TAF_Bosslvbu_Vcard : function (trigger) {
            const card = trigger.card;
            const cards = trigger.card.cards;
            /**
             * 这踏马就是不卡牌！
             */
            if(!card || !cards || !Array.isArray(cards)) return;
            if(!card.isCard) return "VCard";
            const name = card.name;
            if(cards.length !== 1){
                return "VCard";
            } else {
                if(name === cards[0].name) return "SCard";
                else return "VCard";
            }
        },
        TAF_Bosslvbu_fumo : async function (player) {
            let useSkill = false;
            const targets = game.filterPlayer(o => o.isAlive() && o != player && (o.getDiscardableCards(player, "h").length > 0 || o.getDiscardableCards(player, "e").length > 0));
            if(targets && targets.length > 0) {
                useSkill = true;
                player.logSkill("TAF_fumo");
                for(const target of targets) {
                    let setdisnum = 2;
                    while (setdisnum > 0) {
                        const hs = target.getDiscardableCards(player, "h");
                        const es = target.getDiscardableCards(player, "e");
                        if (!hs && !es) break;
                        if (hs && hs.length === 0 && es && es.length === 0) break;
                        if (setdisnum === 0) break;
                        if (es.length > 0) {
                            if (es.length >= setdisnum) {
                                await target.discard(es.randomGets(setdisnum));
                                setdisnum = 0;
                                break;
                            } else {
                                await target.discard(es.randomGet(es.length));
                                setdisnum -= es.length;
                            }
                        }
                        if (hs.length > 0 && setdisnum > 0) {
                            if (hs.length >= setdisnum) {
                                await target.discard(hs.randomGets(setdisnum));
                                setdisnum = 0;
                                break;
                            } else {
                                await target.discard(hs.randomGet(hs.length));
                                setdisnum -= hs.length;
                            }
                        }
                    }
                }
            }
            return useSkill;
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


const oltianshu_triggers = {
    /*******************************天书时机一 */
    1: {
        trigger: { global: ["useCardAfter"] },
        triggerinfo: "你使用牌后",
        type: 1,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    2: {
        trigger: { global: ["useCardAfter"] },
        triggerinfo: "其他角色对你使用牌后",
        type: 1,
        canuse: async function(trigger, player) {
            const targets = trigger.targets;
            if (!targets || targets.length === 0) return false;
            return trigger.player !== player && targets.includes(player);
        },
    },
    3: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "失去手牌后",
        type: 1,
        canuse: async function(trigger, player) {
            const evt = trigger.getl(player);
            return evt && evt.hs.length > 0;
        },
    },
    /*******************************天书时机二 */
    4: {
        trigger: { global: ["phaseUseBegin"] },
        triggerinfo: "出牌阶段开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    5: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "你受到伤害后",
        type: 2,
        canuse: async function(trigger, player) {
            const num = trigger.num;
            const target = trigger.player;
            if (!num || !target) return false;
            return target == player && num > 0;
        },
    },
    6: {
        trigger: { global: ["phaseZhunbeiBegin"] },
        triggerinfo: "准备阶段",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    7: {
        trigger: { global: ["phaseJieshuBegin"] },
        triggerinfo: "结束阶段",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player == player;
        },
    },
    8: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "你造成伤害后",
        type: 2,
        canuse: async function(trigger, player) {
            const source = trigger.source;
            if (!source) return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return source == player && num > 0;
        },
    },
    9: {
        trigger: { target: ["useCardToTarget"] },
        triggerinfo: "你成为〖杀〗的目标时",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return card.name == "sha";
        },
    },
    10: {
        trigger: { player: ["useCardToBefore"] },
        triggerinfo: "你使用或打出〖闪〗时",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return card.name == "shan";
        },
    },
    11: {
        trigger: { global: ["judgeBefore"] },
        triggerinfo: "当一张判定牌生效前",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return true;
        },
    },
    12: {
        trigger: { player: ["eventNeutralized","shaMiss"] },
        triggerinfo: "你使用的牌被抵消后",
        type: 2,
        canuse: async function(trigger, player) {
            if (trigger.type != "card" && trigger.name != "_wuxie") return false;
            const card = trigger.card;
            return card;
        },
    },
    13: {
        trigger: { global: ["judge"] },
        triggerinfo: "当一张判定牌生效后",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return true;
        },
    },
    14: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "你于回合外失去红色牌后",
        type: 2,
        canuse: async function(trigger, player) {
            if (player === _status.currentPhase) return false;
            const evt = trigger.getl(player);
            if (!evt) return false;
            if (!evt.cards2) return false;
            if (evt.cards2.length === 0) return false;
            for (let card of evt.cards2) {
                if (get.color(card, player) == "red") return true;
            }
            return false;
        },
    },
    15: {
        trigger: { player: ["phaseDiscardBegin"] },
        triggerinfo: "弃牌阶段开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return true;
        },
    },
    16: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "一名角色受到〖杀〗的伤害后",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            if (card.name != "sha") return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return num > 0;
        },
    },
    17: {
        trigger: { player: ["phaseDrawBegin"] },
        triggerinfo: "摸牌阶段开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return !trigger.numFixed;
        },
    },
    18: {
        trigger: { target: ["useCardToTargeted"] },
        triggerinfo: "你成为普通锦囊牌的目标后",
        type: 2,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return get.type(card) == "trick";
        },
    },
    19: {
        trigger: { global: ["linkAfter"] },
        triggerinfo: "一名角色进入连环状态后",
        type: 2,
        canuse: async function(trigger, player) {
            return trigger.player.isLinked();
        },
    },
    20: {
        trigger: { player: ["changeHpAfter"] },
        triggerinfo: "你的体力值变化后",
        type: 2,
        canuse: async function(trigger, player) {
            const num = trigger.num;
            if (!num) return false;
            return typeof num === "number";
        },
    },
    21: {
        trigger: { global: ["roundStart"] },
        triggerinfo: "每轮开始时",
        type: 2,
        canuse: async function(trigger, player) {
            return true;
        },
    },
    22: {
        trigger: { global: ["damageBegin1"] },
        triggerinfo: "一名角色造成伤害时",
        type: 2,
        canuse: async function(trigger, player) {
            const source = trigger.source;
            if(!source) return false;
            const num = trigger.num;
            if(!num || num <= 0) return false;
            return num > 0;
        },
    },
    23: {
        trigger: { global: ["damageBegin2"] },
        triggerinfo: "一名角色受到伤害时",
        type: 2,
        canuse: async function(trigger, player) {
            const target = trigger.player;
            if(!target) return false;
            const num = trigger.num;
            if(!num || num <= 0) return false;
            return num > 0;
        },
    },
    /*******************************天书时机三 */
    24: {
        trigger: { global: ["dying"] },
        triggerinfo: "一名角色进入濒死时",
        type: 3,
        canuse: async function(trigger, player) {
            const target = trigger.player;
            if (!target) return false;
            return true;
        },
    },
    25: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "你失去装备牌后",
        type: 3,
        canuse: async function(trigger, player) {
            const evt = trigger.getl(player);
            if (!evt) return false;
            if (!evt.es) return false;
            if (evt.es.length === 0) return false;
            return evt.es.length > 0;
        },
    },
    26: {
        trigger: { global: ["dieAfter"] },
        triggerinfo: "一名其他角色死亡后",
        type: 3,
        canuse: async function(trigger, player) {
            return trigger.player !== player;
        },
    },
    27: {
        trigger: { global: ["useCardAfter"] },
        triggerinfo: "〖南蛮入侵〗或〖万箭齐发〗结算后",
        type: 3,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            return card.name === "nanman" || card.name === "wanjian";
        },
    },
    28: {
        trigger: { source: ["damageAfter"] },
        triggerinfo: "你使用〖杀〗造成伤害后",
        type: 3,
        canuse: async function(trigger, player) {
            const card = trigger.card;
            if (!card) return false;
            if (card.name !== "sha") return false;
            const source = trigger.source;
            if (source !== player) return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return num > 0;
        },
    },
    29: {
        trigger: { global: ["damageAfter"] },
        triggerinfo: "一名角色受到属性伤害后",
        type: 3,
        canuse: async function(trigger, player) {
            if (!trigger.hasNature()) return false;
            const num = trigger.num;
            if (!num || num <= 0) return false;
            return num > 0;
        },
    },
    30: {
        trigger: { 
            global: ["equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter"], 
        },
        triggerinfo: "一名角色失去最后的手牌后",
        type: 3,
        canuse: async function(trigger, player) {
            const target = trigger.player;
            if (!target) return false;
            if (target.countCards("h") === 0) {
                const evt = trigger.getl(target);
                return evt && evt.player == target && evt.hs && evt.hs.length > 0;
            }
            return false;
        },
    },
};
const oltianshu_effects = {
    /*******************************天书效果一 */
    1: {//调试调用正确
        effectinfo: "你可以摸一张牌",
        prompt: "〖天书〗：是否摸一张牌？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const prompt = setColor(oltianshu_effects[1].prompt);
            async function useSkill() {
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    2: {//调试调用正确
        effectinfo: "你可以弃置一名角色区域内的一张牌",
        prompt: "〖天书〗：请选择一名角色，弃置其区域内一张牌？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[2].prompt);
                const targets = game.filterPlayer(o => o.isAlive() && o.getDiscardableCards(player, "hej").length > 0);
                if (!targets || targets.length === 0) return;
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const friends = targets.filter(o => get.attitude(player, o) >= 2 && o.getCards('j').length > 0);
                    if (friends.length > 0) {
                        let hasBadjfriends = [];
                        for (const friend of friends) {
                            const jcards = friend.getCards('j').filter(card => {
                                const effect = get.effect(friend, card, player, player);
                                return effect && effect < 0;
                            });
                            if (jcards.length > 0 && !hasBadjfriends.includes(friend)) {
                                hasBadjfriends.push(friend);
                            }
                        }
                        if (hasBadjfriends.length > 0) {
                            return target === hasBadjfriends[0];
                        }
                    }
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    await player.discardPlayerCard(target, 1, 'hej', true);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    3: {//调试调用正确
        effectinfo: "你可以观看牌堆顶的三张牌，以任意顺序置于牌堆顶或牌堆底",
        prompt: "〖天书〗：是否观看并调整牌堆顶的三张牌",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[3].prompt);
                let result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    const Pile = ui.cardPile.childNodes.length;
                    if(Pile < 3) await game.washCard();
                    const Pilewashed = ui.cardPile.childNodes.length;
                    const disPile = ui.discardPile.childNodes.length;
                    if(Pilewashed + disPile < 3) return;//避免牌堆不够的BUG
                    const cardstop = get.cards(3);
                    game.cardsGotoOrdering(cardstop);
                    let TXT_one = setColor("「天书」可以将所有牌按任意顺序置于〖牌堆顶〗！");
                    let TXT_middle = setColor("「天书」请选择要移动的位置 ↑ ↓ ！");
                    let TXT_two = setColor("「天书」可以将所有牌按任意顺序置于〖牌堆底〗！");
                    const result = await player.chooseToMove("〖天书〗",true)
                    .set("list", [[TXT_one, []],[TXT_middle, cardstop],[TXT_two, []]])
                    .set("filterMove", (from, to, moved) => {
                        return true;
                    }).set('filterOk', (moved) => {
                        return moved[1].length === 0 && (moved[0].length === 3 || moved[2].length === 3);
                    }).set("processAI", (list) => {
                        const cards = list[1][1];
                        let 排序后 = [[],[],[]];
                        const target = _status.currentPhase.next;
                        const judges = target.getCards("j");
                        const att = get.attitude(player, target);
                        if (att >= 2) {
                            if (judges.length > 0) {
                                //用于帮助队友改判断的牌
                                const cheats = setjudgesResult(judges,cards,player,false);//令判定牌失效的卡牌
                                const 剩余卡片 = cards.filter(card => !cheats.includes(card));
                                const 排序剩余卡片 = 剩余卡片.sort((a, b) => get.value(b, player) - get.value(a, player));
                                排序后 = [cheats.concat(排序剩余卡片), [], []];
                            } else {
                                const 排序cards = cards.sort((a, b) => get.value(b,player) - get.value(a, player));
                                排序后 = [排序cards,[],[]];
                            }
                        } else {
                            const taoValue = compareValue(player, 'tao');
                            const shanValue = compareValue(player, 'shan');
                            const jiuValue = compareValue(player, 'jiu');
                            const 不能放牌堆顶 = cards.some(card => {
                                const value = get.value(card, player);
                                return value >= taoValue || value >= shanValue || value >= jiuValue;
                            });
                            const 排序cards = cards.sort((a, b) => get.value(a,player) - get.value(b, player));
                            if (不能放牌堆顶) {
                                排序后 = [[], [], 排序cards];
                            } else {
                                排序后 = [排序cards, [], []];
                            }
                        }
                        return 排序后;
                    }).set('forced', true).forResult();
                    if (result.bool) {
                        let topcards = result.moved[0];
                        if (topcards.length > 0) {
                            const first = ui.cardPile.firstChild;
                            for (let card of topcards) {
                                ui.cardPile.insertBefore(card, first);
                            }
                            player.popup(get.cnNumber(topcards.length) + '上');
                            game.log(player, '将' + get.cnNumber(topcards.length) + '张牌置于牌堆顶！');
                            player.update();
                            game.updateRoundNumber();
                        }
                        let bottomcards = result.moved[2];
                        if (bottomcards.length > 0) {
                            for (let card of bottomcards) {
                                ui.cardPile.appendChild(card);
                            }
                            player.popup(get.cnNumber(bottomcards.length) + '下');
                            game.log(player, '将' + get.cnNumber(bottomcards.length) + '张牌置于牌堆底！');
                            player.update();
                            game.updateRoundNumber();
                        }
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    4: {//调试调用正确
        effectinfo: "你可以弃置任意张牌，摸等量张牌",
        prompt: "〖天书〗：是否弃置任意张牌，摸等量张牌？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[4].prompt);
                const num = player.getCards('he').length;
                if (!num || num === 0) return;
                let result = await player.chooseCard(prompt, 'he', [1, num],  function(card) {
                    return player.getCards('he').includes(card);
                }).set('ai', function(card) {
                    const taoValue = compareValue(player, 'tao');
                    const shanValue = compareValue(player, 'shan');
                    const jiuValue = compareValue(player, 'jiu');
                    const wuzhongValue = compareValue(player, 'wuzhong');
                    const wuxieValue = compareValue(player, 'wuxie');
                    const minValue = Math.min(taoValue, shanValue, jiuValue, wuzhongValue, wuxieValue);
                    const value = get.value(card, player);
                    return value <= minValue;
                }).forResult();
                if (result.bool) {
                    const cards = result.cards;
                    await player.discard(cards);
                    await player.draw(cards.length);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    5: {//调试调用正确
        effectinfo: "你可以获得造成伤害的牌",
        prompt: "〖天书〗：是否获得造成伤害的牌",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                let cards = [];
                if (Time == "useCardAfter") {
                    const evts = game.getGlobalHistory("everything", evt => {
                        if (!evt.name || evt.name !== "damage") return false;
                        const source = evt.source;
                        if (!source || source !== trigger.player) return false;
                        const evtcard = evt.card, card = evt.card;
                        if (!evtcard || !card) return false;
                        if (evtcard.name !== card.name) return false;
                        const evtcards = evt.cards;
                        if (!evtcards || evtcards.length === 0) return false;
                        const cards = trigger.cards;
                        if (!cards || cards.length === 0) return false;
                        if (cards.length !== evtcards.length) return false;
                        const evtcardsids = [], cardsids = [];
                        for (const card of evtcards) {
                            const cardid = card.cardid;
                            if (cardid) {
                                evtcardsids.push(cardid);
                            }
                        }
                        for (const card of cards) {
                            const cardid = card.cardid;
                            if (cardid) {
                                cardsids.push(cardid);
                            }
                        }
                        const evtSet = new Set(evtcardsids);
                        const cardSet = new Set(cardsids);
                        return evtSet.size === cardSet.size && [...evtSet].every(id => cardSet.has(id));
                    });
                    if (evts && evts.length > 0) {
                        cards = evts[0].cards
                    }
                } else {
                    const evts = game.getAllGlobalHistory("everything", evt => {
                        if (!evt.name || evt.name !== "damage") return false;
                        const source = evt.source;
                        const card = evt.card;
                        if (!source || !card) return false;
                        const evtcards = evt.cards;
                        if (!evtcards || evtcards.length === 0) return false;
                        return source === player;
                    });
                    if (evts && evts.length > 0) {
                        const damagCards = [];
                        const seenIds = new Set();
                        for (const evt of evts) {
                            for (const card of evt.cards) {
                                const cardId = card.cardid;
                                if (!seenIds.has(cardId)) {
                                    seenIds.add(cardId);
                                    damagCards.push(card);
                                }
                            }
                        }
                        let finddamage = [];
                        const disPilecards = ui.discardPile.childNodes;
                        for (let i = damagCards.length - 1; i >= 0; i--) {
                            const card = damagCards[i];
                            const cardId = card.cardid;
                            for (let j = 0; j < disPilecards.length; j++) {
                                if (disPilecards[j].cardid === cardId) {
                                    finddamage.push(card);
                                    break;
                                }
                            }
                            if (finddamage.length > 0) {
                                break;
                            }
                        }
                        cards = finddamage;
                    }  
                }
                if(cards.length === 0) return;
                const prompt = setColor(oltianshu_effects[5].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.gain(cards, "gain2");
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    6: {//调试调用正确
        effectinfo: "你可以视为使用一张无距离次数限制的〖杀〗",
        prompt: "〖天书〗：是否选择一名角色，视为对其使用一张无距离次数限制的〖杀〗？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                if (Time == "useCardAfter") {//排除傻逼设定，视为杀之后还复杀！压根就没有用实体牌！
                    const card = trigger.card;
                    if (card.TAFoltianshu_usesha) return;
                    if(!card.cards || card.cards.length === 0) return;
                }
                const prompt = setColor(oltianshu_effects[6].prompt);
                const Vcard = { name: 'sha', nature: '', TAFoltianshu_usesha: true };
                const canuse = player.hasUseTarget(Vcard,false);
                if (!canuse) return;
                const result = await player.chooseBool(prompt).set('ai', function() {
                    if (player.hasUseTarget(Vcard) && player.hasValueTarget(Vcard) && player.getUseValue(Vcard) > 0) {
                        return true;
                    }
                }).forResult();
                if (result.bool) {
                    await player.chooseUseTarget(prompt, Vcard, true, false, 'nodistance');
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    7: {//调试调用正确
        effectinfo: "你可令一名角色的手牌上限+2，直到其回合结束",
        prompt: "〖天书〗：是否选择一名角色，令其手牌上限+2，直到其回合结束？",
        type: 1,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[7].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    const targets = game.filterPlayer(o => o.isAlive() && !o.hasSkill("iceqingshu_maxHandcard"));
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) >= 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, 'ice');
                    target.addTempSkill("iceqingshu_maxHandcard",{player:"phaseEnd"});
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(1);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    /*******************************天书效果二 */
    8: {//调试调用正确
        effectinfo: "你可以获得一名角色区域内的一张牌",
        prompt: "〖天书〗：是否选择一名角色，获得其区域一张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const filterTimes = [];
            if (filterTimes.includes(Time)) return;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && o.getGainableCards(player, "hej").length > 0);
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[8].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const friends = targets.filter(o => get.attitude(player, o) >= 2 && o.getCards('j').length > 0);
                    if (friends.length > 0) {
                        let hasBadjfriends = [];
                        for (const friend of friends) {
                            const jcards = friend.getCards('j').filter(card => {
                                const effect = get.effect(friend, card, player, player);
                                return effect && effect < 0;
                            });
                            if (jcards.length > 0 && !hasBadjfriends.includes(friend)) {
                                hasBadjfriends.push(friend);
                            }
                        }
                        if (hasBadjfriends.length > 0) {
                            return target === hasBadjfriends[0];
                        }
                    }
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    await player.gainPlayerCard(target, 1, 'hej', true);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    9: {//调试调用正确
        effectinfo: "你可以回复一点体力",
        prompt: "〖天书〗：是否选择回复一点体力？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            const filterTimes = [];
            if (filterTimes.includes(Time)) return;
            async function useSkill() {
                if (player.isHealthy()) return;
                const prompt = setColor(oltianshu_effects[9].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.recover();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    10: {//调试调用正确
        effectinfo: "你可令此牌对你无效",
        prompt: "〖天书〗：是否令此牌对你无效？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            /***
             * 真几把抽象，次奥尼玛
             * 真几把抽象，次奥尼玛
             * 真几把抽象，次奥尼玛
             * 真几把抽象，次奥尼玛
             */
            const filterTimes = [
                "phaseUseBegin","phaseZhunbeiBegin","phaseJieshuBegin","phaseDiscardBegin","phaseDrawBegin","changeHpAfter","roundStart",
                "equipAfter","addJudgeAfter","gainAfter","loseAfter","loseAsyncAfter","addToExpansionAfter",
            ];
            if (filterTimes.includes(Time)) return;
            async function useSkill() {
                const card = trigger.card;
                if (!card) return;
                if (Time === "useCardToTarget") {
                    const targets = trigger.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "useCardToTargeted") {
                    const evt = trigger.getParent();
                    if (!evt) return;
                    const targets = evt.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "judgeBefore" || Time === "judge") {
                    const target = trigger.player;
                    if (target !== player) return;
                }
                if (Time === "linkAfter") {
                    const target = trigger.player;
                    if (target !== player) return;
                }
                if (Time === "damageBegin1" || Time === "damageBegin2") {
                    const target = trigger.player;
                    if (target !== player) return;
                }
                const prompt = setColor(oltianshu_effects[10].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    if (Time === "damageAfter") {
                        const Num = trigger.num;
                        const target = trigger.player;
                        await target.recover(Num);
                        game.log(card,"对",trigger.player,"使用无效");
                    } else if (Time === "useCardToTarget") {
                        const targets = trigger.targets;
                        if(targets.includes(player)){
                            targets.splice(targets.indexOf(player),1);
                            game.log(card,"对",player,"使用无效");
                        }
                    } else if (Time === "useCardToBefore") {
                        trigger.cancel();
                        game.log(player,"使用",trigger.card,"无效");
                    } else if (Time === "judgeBefore") {
                        trigger.cancel();
                        game.log(player, "取消了", trigger.card, "的判定！");
                    } else if (Time === "shaMiss" || Time === "eventNeutralized") {
                        const name = trigger.card.name;
                        const nature = trigger.card.nature;
                        const color = trigger.card.color;
                        const number = trigger.card.number;
                        const target = trigger.target;
                        const suit = trigger.card.suit;
                        let VCard = {name: '', nature: '', color: '', number: '', suit: '', isCard:true};
                        if (!name) return;
                        if (!target) return;
                        if (name && typeof name === 'string') {
                            VCard.name = name;
                        }
                        if (nature && typeof nature === 'string') {
                            VCard.nature = nature;
                        }
                        if (color && typeof color === 'string') {
                            VCard.color = color;
                        }
                        if (number !== undefined) {
                            VCard.number = number;
                        }
                        if (suit && typeof suit === 'string') {
                            VCard.suit = suit;
                        }
                        player.useCard(VCard, target, false);
                        game.log(player, "取消了", trigger.card, "的失效！");
                    } else if (Time === "judge") {
                        const piles = ["cardPile", "discardPile"];
                        let findjudgeCards = [];
                        for (const pile of piles) {
                            const cards = ui[pile].childNodes;
                            for (const card of cards) {
                                const judgefunc = trigger.judge;
                                if (judgefunc(card) && judgefunc(card) > 0) {
                                    findjudgeCards.push(card);
                                }
                                if (findjudgeCards.length > 0) break;
                            }
                            if (findjudgeCards.length > 0) break;
                        }
                        //console.log("findjudgeCards",findjudgeCards);
                        if (findjudgeCards.length > 0) {
                            game.cardsGotoOrdering(findjudgeCards);
                            await player.respond(findjudgeCards[0], "highlight", event.name, "noOrdering");
                            trigger.player.judging[0] = findjudgeCards[0];
                            trigger.orderingCards.addArray(findjudgeCards);
                            game.log(trigger.player, "的判定牌改为", findjudgeCards[0]);
                        }
                    } else if (Time === "useCardToTargeted") {
                        const evt = trigger.getParent();
                        if (evt) {
                            const targets = evt.targets;
                            if (targets && targets.length > 0 && targets.includes(player)) {
                                targets.splice(targets.indexOf(player), 1);
                                game.log(card,"对",player,"使用无效");
                            }
                        }
                    } else if (Time === "linkAfter") {
                        if(player.isLinked()) {
                            player.link(false);
                            game.log(player,"解除横置。");
                        }
                    } else if (Time === "damageBegin1" || Time === "damageBegin2") {
                        trigger.cancel();
                        game.log(card,"对",player,"使用无效");
                    } else {
                        trigger.cancel();
                        game.log(card,"对",player,"使用无效");
                    }
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    11: {//调试调用正确
        effectinfo: "你可以令一名其他角色判定，若结果为黑桃，你对其造成两点雷电伤害。",
        prompt: "〖天书〗：是否令一名其他角色判定，若结果为黑桃，你对其造成两点雷电伤害？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && o != player);
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[11].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    const judgeresult = await target.judge(function (card) {
                        const suitValues = { 'spade': -2, 'heart': 1, 'club': 1, 'diamond': 1 };
                        return suitValues[get.suit(card)];
                    }).forResult();
                    const card = judgeresult.card;//BUGfixed
                    if (card && get.suit(card) === 'spade') {
                        await target.damage(2, "thunder", 'nocard', player);
                        game.log(player, "对", target, "造成两点雷电伤害！");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    12: {//调试调用正确
        effectinfo: "你可以用一张手牌替换判定牌",
        prompt: "〖天书〗：是否用一张手牌替换判定牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time !== "judge" || Time !== "judgeBefore") return;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[12].prompt);
                const result = await player.chooseCard(prompt ,"h", card => {
                    const player = _status.event.player;
                    const mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
                    if (mod2 != "unchanged") return mod2;
                    const mod = game.checkMod(card, player, "unchanged", "cardRespondable", player);
                    if (mod != "unchanged") return mod;
                    return true;
                }).set("ai", card => {
                    const trigger = _status.event.getTrigger();
                    const player = _status.event.player;
                    const judging = _status.event.judging;
                    /**
                     * bug fixed
                     */
                    const cardresult = trigger.judge(card) - trigger.judge(judging);
                    const attitude = get.attitude(player, trigger.player);
                    if (attitude == 0 || cardresult == 0) return 0;
                    if (attitude > 0) {
                        return cardresult - get.value(card) / 2;
                    } else {
                        return -cardresult - get.value(card) / 2;
                    }
                }).forResult();
                if (result.bool) {
                    await player.respond(result.cards[0], "highlight", event.name, "noOrdering");
                    player.$gain2(trigger.player.judging[0]);
                    await player.gain(trigger.player.judging[0]);
                    trigger.player.judging[0] = result.cards[0];
                    trigger.orderingCards.addArray(result.cards);
                    game.log(trigger.player, "的判定牌改为", result.cards[0]);
                    await delay(1000);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    13: {//调试调用正确
        effectinfo: "你可以获得此判定牌",
        prompt: "〖天书〗：是否获得此判定牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            if (Time !== "judge" || Time !== "judgeBefore") return;
            const cards = trigger.orderingCards;
            if (!cards || cards.length === 0) return;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[13].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.gain(cards, "gain2");
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    14: {//调试调用正确
        effectinfo: "若你不是体力上限最高的角色，你可增加一点体力上限",
        prompt: "〖天书〗：是否增加一点体力上限？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const maxHP = Math.max(...game.players.filter(o => o.isAlive()).map(o => o.maxHp));
                const isNotMaxHP = player.maxHp < maxHP || game.players.filter(o => o.isAlive() && o.maxHp === maxHP).length > 1;
                if (!isNotMaxHP) return;
                const prompt = setColor(oltianshu_effects[14].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.gainMaxHp();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    15: {//调试调用正确
        effectinfo: "你可与一名已受伤角色拼点，若你赢，你获得其两张牌",
        prompt: "〖天书〗：是否选择与一名已受伤角色拼点，若你赢，你获得其两张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && o.isDamaged() && player.canCompare(o));
                if(!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[15].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const phs = player.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                    const ths = target.getCards("h").sort((a, b) => get.number(b) - get.number(a));
                    return get.attitude(player, target) < 2 && get.number(phs[0]) > get.number(ths[0]);
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, 'ice');
                    await oltianshu.updateMarks(event,player);
                    return target;
                } else { 
                    return null;
                }
            }
            async function Compare() {//bug fixed
                const target = await useSkill();
                if (!target) return;
                let { result } = await player.chooseToCompare(target);
                if (result.bool) {
                    const he = target.getGainableCards(player, "he");
                    if(he && he.length > 0) {
                        await player.gainPlayerCard(target, [1,2], 'he', true);
                    }
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await Compare();
                }
            }
        },
    },
    16: {//调试调用正确
        effectinfo: "你可令至多两名角色各摸一张牌",
        prompt: "〖天书〗：是否令至多两名角色各摸一张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[16].prompt);
                const targets = game.filterPlayer(o => o.isAlive());
                const result = await player.chooseTarget(prompt, [1, 2], (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) >= 2;
                }).forResult();
                if (result.bool) {
                    for (const target of result.targets) {
                        player.line(target, 'ice');
                        await target.draw();
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    17: {//调试调用正确
        effectinfo: "你可以弃置两张牌，令你和一名其他角色回复一点体力",
        prompt: "〖天书〗：是否弃置两张牌，令你和一名其他角色回复一点体力？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const cards = player.getDiscardableCards(player, "he");
                if (!cards || cards.length < 2) return;
                if (player.isHealthy()) return;
                const targets = game.findPlayer(o => o != player && o.isAlive() && o.isDamaged());
                if (!targets || targets.length === 0) return;
                const friends = game.filterPlayer(o => o != player && o.isAlive() && o.isDamaged());
                const prompt = setColor(oltianshu_effects[17].prompt);
                const choosecards = await player.chooseCard(prompt, 'he', 2, function(card) {
                    return cards.includes(card);
                }).set('ai', function(card) {//bugfix
                    if(friends.length > 0) {
                        return get.value(card, player) < compareValue(player, 'tao');
                    }
                    return false;
                }).forResultCards();
                if (choosecards && choosecards.length) {
                    await player.discard(choosecards);//BUG fixed
                    const prompt22 = setColor("请选择一名角色与其均回复一点体力！");
                    const result = await player.chooseTarget(prompt22, 1, (card, player, target) => {
                        return targets.includes(target);
                    }).set('ai', target => {
                        return get.attitude(player, target) >= 2;
                    }).forResult();
                    if (result.bool) {
                        const target = result.targets[0];
                        player.line(target, 'ice');
                        await player.recover();
                        await target.recover();
                    }
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    18: {//调试调用正确
        effectinfo: "你可令此伤害值+1",
        prompt: "〖天书〗：是否令此伤害值+1？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            /**
             * 成立的组合有：
             * 你成为〖杀〗的目标时，你可令此伤害值+1
             * 你成为普通锦囊牌的目标后,你可令此伤害值+1
             * 一名角色造成伤害时,你可令此伤害值+1
             * 一名角色受到伤害时,你可令此伤害值+1
             */
            const findTimes = [
                "useCardToTarget", "useCardToTargeted","damageBegin1","damageBegin2",
            ];
            if (!findTimes.includes(Time)) return;
            async function useSkill() {
                if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                    const card = trigger.card;
                    if (!card) return;
                    if(!get.tag(card, "damage")) return;
                }
                const prompt = setColor(oltianshu_effects[18].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                        return false;
                    } else {
                        const target = trigger.player;
                        return get.attitude(player, target) < 2;
                    }
                }).forResult();
                if (result.bool) {
                    if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                        const evt = trigger.getParent();
                        if (evt) {
                            const baseDamage = evt.baseDamage;
                            if (baseDamage && typeof baseDamage === "number") {
                                trigger.getParent().baseDamage ++;
                                game.log(player, "令", trigger.card, "的伤害数值+1！");
                            }
                        }
                    } else {
                        trigger.num ++;
                        game.log(player, "令此伤害值+1！");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    19: {//调试调用正确
        effectinfo: "你可以失去一点体力，摸三张牌",
        prompt: "〖天书〗：是否失去一点体力，摸三张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[19].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return getAliveNum(player, 1) > 1;
                }).forResult();
                if (result.bool) {
                    await player.loseHp();
                    await player.draw(3);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    20: {//调试调用正确
        effectinfo: "你可防止此伤害，令伤害来源摸三张牌",
        prompt: "〖天书〗：是否防止此伤害，令伤害来源摸三张牌？",
        type: 2,
        async content(event, trigger, player) {
            const Time = event.triggername;
            /**
             * 成立的组合有：
             * 你成为〖杀〗的目标时，你可防止此伤害，令伤害来源摸三张牌
             * 你成为普通锦囊牌的目标后,你可防止此伤害，令伤害来源摸三张牌
             * 一名角色造成伤害时,你可防止此伤害，令伤害来源摸三张牌
             * 一名角色受到伤害时,你可防止此伤害，令伤害来源摸三张牌
             */
            const findTimes = [
                "useCardToTarget", "useCardToTargeted","damageBegin1","damageBegin2",
            ];
            if (!findTimes.includes(Time)) return;
            async function useSkill() {
                if (Time === "useCardToTarget") {
                    const card = trigger.card;
                    if (!card) return;
                    const targets = trigger.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "useCardToTargeted") {
                    const card = trigger.card;
                    if (!card) return;
                    if(!get.tag(card, "damage")) return;
                    const evt = trigger.getParent();
                    if (!evt) return;
                    const targets = evt.targets;
                    if (!targets || targets.length === 0) return;
                    if(!targets.includes(player)) return;
                }
                if (Time === "damageBegin1" || Time === "damageBegin2") {
                    const source = trigger.source;
                    if (!source) return;
                }
                const prompt = setColor(oltianshu_effects[20].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    if (Time === "useCardToTarget" || Time === "useCardToTargeted") {
                        const target = trigger.player;
                        return get.attitude(player, target) >= 2;
                    } else if (Time === "damageBegin1") {//这块瞎写
                        const target = trigger.player;
                        const source = trigger.source;
                        return get.attitude(player, source) >= 2 && get.attitude(player, target) < 2;
                    } else if (Time === "damageBegin2") {//这块瞎写
                        const target = trigger.player;
                        const source = trigger.source;
                        return get.attitude(player, source) >= 2 && get.attitude(player, target) < 2;
                    } else {
                        return false;
                    }
                }).forResult();
                if (result.bool) {
                    if (Time === "useCardToTarget") {
                        const targets = trigger.targets;
                        if(targets.includes(player)){
                            targets.splice(targets.indexOf(player),1);
                            game.log(trigger.card,"对",player,"使用无效");
                            await trigger.player.draw(3);
                        }
                    }
                    if (Time === "useCardToTargeted") {
                        const evt = trigger.getParent();
                        if (evt) {
                            const targets = evt.targets;
                            if (targets && targets.length > 0 && targets.includes(player)) {
                                targets.splice(targets.indexOf(player), 1);
                                game.log(trigger.card,"对",player,"使用无效");
                                await trigger.player.draw(3);
                            }
                        }
                    }
                    if (Time === "damageBegin1" || Time === "damageBegin2") {
                        trigger.cancel();
                        const source = trigger.source;
                        await source.draw(3);
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(2);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    /*******************************天书效果三 */
    21: {//调试调用正确
        effectinfo: "你可以摸四张牌并翻面",
        prompt: "〖天书〗：是否摸四张牌并翻面？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[21].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw(4);
                    await player.turnOver();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    22: {//调试调用正确
        effectinfo: "你可以摸三张牌，弃置一张牌",
        prompt: "〖天书〗：是否摸三张牌，弃置一张牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[22].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw(3);
                    await player.chooseToDiscard(1, 'he', true);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    23: {//调试调用正确
        effectinfo: "你可以摸牌至体力上限（至多摸五张）",
        prompt: "〖天书〗：是否摸牌至体力上限（至多摸五张）？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const cards = player.getCards('h');
                const num = player.maxHp;
                const maxnum = Math.min(num, 5);
                if (cards.length >= maxnum) return;
                const prompt = setColor(oltianshu_effects[23].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    await player.draw(maxnum - cards.length);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    24: {//调试调用正确
        effectinfo: "你可令一名角色非锁定技失效直到其下个回合开始",
        prompt: "〖天书〗：是否令一名角色非锁定技失效直到其下个回合开始？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && !o.hasSkill("fengyin"));
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[24].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    target.addTempSkill("fengyin",{player:"phaseBegin"});
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    25: {//调试调用正确
        effectinfo: "你可令一名角色摸两张牌并翻面",
        prompt: "〖天书〗：是否令一名角色摸两张牌并翻面？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive());
                if (!targets || targets.length === 0) return;
                const prompt = setColor(oltianshu_effects[25].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    const friends = targets.filter(o => {
                        return get.attitude(player, o) >= 2 && o.isTurnedOver() && 
                        (!o.hasSkillTag("noTurnover", false, player) || !o.hasSkillTag("noturn", false, player));
                    });
                    if(friends && friends.length > 0) return target === friends[0];
                    const enemies = targets.filter(o => {
                        return get.attitude(player, o) < 2 && !o.isTurnedOver() && 
                        (!o.hasSkillTag("noTurnover", false, player) || !o.hasSkillTag("noturn", false, player));
                    });
                    if(enemies && enemies.length > 0) return target === enemies[0];
                    return false;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    await target.draw(2);
                    await target.turnOver();
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    26: {//调试调用正确
        effectinfo: "你可获得两张非基本牌",
        prompt: "〖天书〗：是否获得两张非基本牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[26].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    let gainCards = [];
                    const piles = ["cardPile", "discardPile"];
                    for (const pile of piles) {
                        if (!ui[pile]) continue;
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const type = get.type(card);
                            if(type && type !== 'basic' && !gainCards.includes(card)) {
                                gainCards.push(card);
                            }
                            if (gainCards.length >= 2) break;
                        }
                        if (gainCards.length >= 2) break;
                    }
                    if (gainCards.length > 0) {
                        await player.gain(gainCards, "gain2");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    27: {//调试调用正确
        effectinfo: "你可获得两张锦囊牌",
        prompt: "〖天书〗：是否获得两张锦囊牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const prompt = setColor(oltianshu_effects[27].prompt);
                const result = await player.chooseBool(prompt).set('ai', function() {
                    return true;
                }).forResult();
                if (result.bool) {
                    let gainCards = [];
                    const piles = ["cardPile", "discardPile"];
                    for (const pile of piles) {
                        if (!ui[pile]) continue;
                        const cards = ui[pile].childNodes;
                        for (const card of cards) {
                            const type = get.type2(card);
                            if(type && type === 'trick' && !gainCards.includes(card)) {
                                gainCards.push(card);
                            }
                            if (gainCards.length >= 2) break;
                        }
                        if (gainCards.length >= 2) break;
                    }
                    if (gainCards.length > 0) {
                        await player.gain(gainCards, "gain2");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    28: {//调试调用正确
        effectinfo: "你可令你对一名角色使用牌无次数或距离限制直到你的回合结束",
        prompt: "〖天书〗：是否选择一名角色，对其使用牌无次数或距离限制直到你的回合结束？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => {
                    if(!player.hasSkill("iceqingshu_useCard")) {
                        return o.isAlive();
                    } else {
                        return o.isAlive() && !player.getStorage('iceqingshu_useCard').includes(o);
                    }
                });
                const prompt = setColor(oltianshu_effects[28].prompt);
                const result = await player.chooseTarget(prompt, (card, player, target) => {
                    return targets.includes(target);
                }).set('ai', target => {
                    return get.attitude(player, target) < 2;
                }).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    player.line(target, "ice");
                    if(!player.hasSkill("iceqingshu_useCard")) {
                        player.addTempSkill("iceqingshu_useCard", {player:"phaseEnd"});
                    }
                    if(player.hasSkill("iceqingshu_useCard")) {
                        if (!player.getStorage('iceqingshu_useCard').includes(target)) {
                            player.getStorage('iceqingshu_useCard').push(target);
                        }
                        player.markSkill("iceqingshu_useCard");
                    }
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    29: {//调试调用正确
        effectinfo: "你可交换两名角色装备区的牌",
        prompt: "〖天书〗：是否交换两名角色装备区的牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && !o.isMin() && o.countCards("e") > 0);
                if (!targets || targets.length === 0) return;
                const hastargets = game.filterPlayer(o => o.isAlive());
                if (!hastargets || hastargets.length < 2) return;
                const prompt = setColor(oltianshu_effects[29].prompt);
                const result = await player.chooseTarget(prompt, 2,(card, player, target) => {
                    if (target.isMin()) return false;
                    if (ui.selected.targets.length == 0) return true;
                    if (ui.selected.targets.length == 1) {
                        const selectedTarget = ui.selected.targets[0];
                        return selectedTarget.countCards("e") > 0 || target.countCards("e") > 0;
                    }
                    return false;
                }).set('ai', target => {
                    const player = _status.event.player;
                    let enemyslist = [];
                    const enemys = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) < 2);
                    const friends = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) >= 2);
                    for (let enemy of enemys) {
                        if (enemy.countCards("e") > 0) {
                            enemyslist.push(enemy);
                        }
                    }
                    enemyslist.sort((a, b) => b.countCards("e") - a.countCards("e"));
                    friends.sort((a, b) => a.countCards("e") - b.countCards("e"));
                    if (enemyslist.length === 0) return false;
                    const F = friends[0];
                    const E = enemyslist[0];

                    if (F && F.countCards("e") >= E.countCards("e")) return false;
                    if (ui.selected.targets.length === 0) {
                        return E;
                    } else if (ui.selected.targets.length === 1) {
                        const selectedTarget = ui.selected.targets[0];
                        if (selectedTarget === E) {
                            return F;
                        } else {
                            return E;
                        }
                    }
                    return false;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    await targets[0].swapEquip(targets[1]);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
    30: {//调试调用正确
        effectinfo: "你可交换两名角色手牌区的牌",
        prompt: "〖天书〗：是否交换两名角色手牌区的牌？",
        type: 3,
        async content(event, trigger, player) {
            const Time = event.triggername;
            async function useSkill() {
                const targets = game.filterPlayer(o => o.isAlive() && !o.isMin() && o.countCards("h") > 0);
                if (!targets || targets.length === 0) return;
                const hastargets = game.filterPlayer(o => o.isAlive());
                if (!hastargets || hastargets.length < 2) return;
                const prompt = setColor(oltianshu_effects[30].prompt);
                const result = await player.chooseTarget(prompt, 2,(card, player, target) => {
                    if (target.isMin()) return false;
                    if (ui.selected.targets.length == 0) return true;
                    if (ui.selected.targets.length == 1) {
                        const selectedTarget = ui.selected.targets[0];
                        return selectedTarget.countCards("h") > 0 || target.countCards("h") > 0;
                    }
                    return false;
                }).set('ai', target => {
                    const player = _status.event.player;
                    let enemyslist = [];
                    const enemys = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) < 2);
                    const friends = game.players.filter(o => o.isAlive() && !o.isMin() && get.attitude(player, o) >= 2);
                    for (let enemy of enemys) {
                        if (enemy.countCards("h") > 0) {
                            enemyslist.push(enemy);
                        }
                    }
                    enemyslist.sort((a, b) => b.countCards("h") - a.countCards("h"));
                    friends.sort((a, b) => a.countCards("h") - b.countCards("h"));
                    if (enemyslist.length === 0) return false;
                    const F = friends[0];
                    const E = enemyslist[0];
                    
                    if (F && F.countCards("h") >= E.countCards("h")) return false;
                    if (ui.selected.targets.length === 0) {
                        return E;
                    } else if (ui.selected.targets.length === 1) {
                        const selectedTarget = ui.selected.targets[0];
                        if (selectedTarget === E) {
                            return F;
                        } else {
                            return E;
                        }
                    }
                    return false;
                }).forResult();
                if (result.bool) {
                    const targets = result.targets;
                    await targets[0].swapHandcards(targets[1]);
                    await oltianshu.updateMarks(event,player);
                }
            }
            const typeTimes = await oltianshu.get_triggers(3);
            
            if (typeTimes.includes(Time)) {
                if (await lib.skill[event.name].canuse(trigger, player)) {
                    await useSkill();
                }
            }
        },
    },
};
export const oltianshu = {
    name: "天书",
    update: '2025年6月19日',
    triggers: oltianshu_triggers,//天书时机
    effects: oltianshu_effects,//天书效果
    combination_sum: {
        name: "天书总组合",
        天书总数: 0,
        天书类型一: { 数量: 0, 组合: [], },
        天书类型二: { 数量: 0, 组合: [], },
        天书类型三: { 数量: 0, 组合: [], },
    },
    combination_use: {
        name: "天书净组合",
        info1: "当然有的抽象的，但我觉得合理的我都写了比如：",
        info2: "你成为普通锦囊牌的目标后，你可令此伤害值+1(过滤伤害牌)",
        info3: "失去手牌后，你可以获得造成伤害的牌。(历史记录造成伤害的牌在弃牌堆中)",
        info4: "你成为普通锦囊牌的目标后，你可防止此伤害，令伤害来源摸三张牌。(过滤伤害牌)",
        info5: "你使用的牌被抵消后，你可令此牌对你无效。(重新视为使用此牌)",
        info6: "等等，反正应该这些都可以执行，但避免不了有的地方字符写错，出现bug，如有遇见可以反馈。",
        天书总数: 0,
        天书类型一: { 数量: 0, 组合: [], },
        天书类型二: { 数量: 0, 组合: [], },
        天书类型三: { 数量: 0, 组合: [], },
    },
    /**
     * 获取天书黑名单
     * @param {*} num - 对应的天书时机。
     * @returns  - 带有黑名单的数组
     */
    getblacklist: function(num) {
        const blacklist = {
            4: ['10', '12', '13', '18', '20'],
            5: ['12', '13', '18', '20'],
            6: ['10', '12', '13', '18', '20'],
            7: ['10', '12', '13', '18', '20'],
            8: ['12', '13', '18', '20'],
            9: ['12', '13'],
            10: ['12', '13', '18', '20'],
            11: ['18', '20'],
            12: ['12', '13', '18', '20'],
            13: ['18', '20'],
            14: ['10', '12', '13', '18', '20'],
            15: ['10', '12', '13', '18', '20'],
            16: ['12', '13', '18', '20'],
            17: ['10', '12', '13', '18', '20'],
            18: ['12', '13'],
            19: ['12', '13', '18', '20'],
            20: ['10', '12', '13', '18', '20'],
            21: ['10', '12', '13', '18', '20'],
            22: ['12', '13'],
            23: ['12', '13'],
        }
        let getblacklist = [];
        const triggers_hasblacklist = Object.keys(blacklist);
        const numStr = String(num);
        if (triggers_hasblacklist.includes(numStr)) {
            getblacklist = blacklist[numStr];
        }
        return getblacklist;
    },
    /**
     * 统计总天书信息
     */
    setCombination_sum: function() {
        const 天书列表1 = [] ,天书列表2 = [], 天书列表3 = [];
        for(const key in oltianshu.triggers) {
            const info1 = oltianshu.triggers[key].triggerinfo;
            const type1 =  oltianshu.triggers[key].type;
            for(const key in oltianshu.effects) {
                const info2 = oltianshu.effects[key].effectinfo;
                const type2 =  oltianshu.effects[key].type;
                if (type1 === type2) {
                    const info = [info1 + "，" + info2 + "。"];
                    if (type1 === 1) 天书列表1.push(info);
                    if (type1 === 2) 天书列表2.push(info);
                    if (type1 === 3) 天书列表3.push(info);
                }
            }
        }
        oltianshu.combination_sum.天书总数 = 天书列表1.length + 天书列表2.length + 天书列表3.length;
        oltianshu.combination_sum.天书类型一.数量 = 天书列表1.length;
        oltianshu.combination_sum.天书类型一.组合 = 天书列表1;
        oltianshu.combination_sum.天书类型二.数量 = 天书列表2.length;
        oltianshu.combination_sum.天书类型二.组合 = 天书列表2;
        oltianshu.combination_sum.天书类型三.数量 = 天书列表3.length;
        oltianshu.combination_sum.天书类型三.组合 = 天书列表3;
    },
    /**
     * 统计可用天数信息
     */
    setCombination_use: function() {
        const 天书列表1 = [] ,天书列表2 = [], 天书列表3 = [];
        for(const key in oltianshu.triggers) {
            /**
             * 排除黑名单
             */
            const blacklist = oltianshu.getblacklist(key);
            const info1 = oltianshu.triggers[key].triggerinfo;
            const type1 =  oltianshu.triggers[key].type;
            for(const key in oltianshu.effects) {
                if (blacklist.includes(key)) continue;
                const info2 = oltianshu.effects[key].effectinfo;
                const type2 =  oltianshu.effects[key].type;
                if (type1 === type2) {
                    const info = [info1 + "，" + info2 + "。"];
                    if (type1 === 1) 天书列表1.push(info);
                    if (type1 === 2) 天书列表2.push(info);
                    if (type1 === 3) 天书列表3.push(info);
                }
            }
        }
        oltianshu.combination_use.天书总数 = 天书列表1.length + 天书列表2.length + 天书列表3.length;
        oltianshu.combination_use.天书类型一.数量 = 天书列表1.length;
        oltianshu.combination_use.天书类型一.组合 = 天书列表1;
        oltianshu.combination_use.天书类型二.数量 = 天书列表2.length;
        oltianshu.combination_use.天书类型二.组合 = 天书列表2;
        oltianshu.combination_use.天书类型三.数量 = 天书列表3.length;
        oltianshu.combination_use.天书类型三.组合 = 天书列表3;
    },
    /**
     * 设置天书翻译
     */
    setTranslate: function() {
        //设置所有天书技能组合的翻译和描述
        const tsTimesekys = Object.keys(oltianshu_triggers);
        const tsEffectsekys = Object.keys(oltianshu_effects);
        const namestartsWith = "TAFoltianshu_";
        let skillnames = [];
        for (let i = 0; i < tsTimesekys.length; i++) {
            for (let j = 0; j < tsEffectsekys.length; j++) {
                let skillname = namestartsWith + tsTimesekys[i] + tsEffectsekys[j];
                skillnames.push(skillname);
            }
        }
        if (skillnames.length > 0) {
            let TXT = setColor("一本神秘的〖天书〗！");
            for (let name of skillnames) {
                if (!lib.translate[name]) {
                    lib.translate[name] = "天书";
                }
                if (!lib.translate[name + "_info"]) {
                    lib.translate[name + "_info"] = TXT;
                }
            }
        }
    },
    /**
     * 根据类型获得该类型下的所有触发时机列表
     */
    get_triggers : async function(type){
        const Times = new Set();
        const triggers = oltianshu.triggers;
        const tianshuNums = Object.keys(triggers);
        for (const num of tianshuNums) {
            const gettype = triggers[num].type;
            if (type === gettype) {
                const trigger = triggers[num].trigger;
                for (const key in trigger) {
                    const timelist = trigger[key];
                    if (Array.isArray(timelist) && timelist.length > 0) {
                        timelist.forEach(time => Times.add(time));
                    }
                }
            }
        }
        return [...Times];
    },
    /**
     * 我这边设定的是 是否有全部南华老仙的技能的玩家，
     * 如果不是天书的拥有者，则返回true
     */
    filterOwner :function (player) {
        const skilllist = ['iceqingshu','iceshoushu','icehedao'];
        for (let skill of skilllist) {
            if (!player.hasSkill(skill)) return true;
        }
        return false;
    },
    /**
     * 为非南华老仙玩家添加天书技能的设定
     * 并获得可以显示看到天书信息的设定！
     */
    addTianshu: async function(player,skill) {
        if (!skill.startsWith("TAFoltianshu_")) return;
        const key = oltianshu.filterOwner(player);
        if (key) {
            player.addSkill(skill);
            player.update();
        } else {
            return '亲，您本身就是南华老头就不要调用这个破函数额了哦！';
        }
    },
    /**
     * 移除天书并还原天书技能描述
     */
    removeTianshu : async function (player,skill) {
        if (!skill.startsWith("TAFoltianshu_")) return;
        const TXT = setColor("一本神秘的〖天书〗！");
        lib.translate[skill + "_info"] = TXT;
        delete player[skill + '_use'];
        player.unmarkSkill(skill);
        player.removeSkill(skill);
        player.update();
    },
    /**
     * 〖天书〗标记的更新
     * 〖天书〗技能的描述对除技能拥有者以外的其他角色不可见直到拥有者发动之
     * 非〖天书〗拥有者的移除天书技能及可以看到天书信息的技能
     */
    updateMarks : async function(event,player) {
        const name = event.name;
        if (!name || typeof name !== 'string') return;
        if (!lib.skill[name]) return;
        if (!name.startsWith("TAFoltianshu_")) return;
        if (!player[event.name + '_use']) return;
        player[event.name + '_use']--;
        player.markSkill(event.name);
        const key = oltianshu.filterOwner(player);
        if (key) {
            //如果不是天书的拥有者，直接移除天书技能
            await oltianshu.removeTianshu(player,name);
        } else {
            //让瞎子看技能描述！
            const TXT = lib.skill[event.name].TAFoltianshu_info;
            if (!TXT || typeof TXT !== 'string') return;
            const num = player[event.name + '_use'];
            if (num < player.icehedao_tianshu) {
                lib.translate[event.name + "_info"] = TXT;
            }
        }
        player.update();
    },
    /**
     * 选择〖天书〗ing!
     * 注意选择〖天书〗触发时机后，要根据“已选择的〖天书〗触发时机类型”，从对应类型的天书效果中进行筛选！
     */
    chooseButtonX : async function(player, string) {
        if (!player.oltianshu_textone) player.oltianshu_textone = '';
        if (!player.oltianshu_choicestype) player.oltianshu_choicestype = null;
        if (!player.oltianshu_choicesNum) player.oltianshu_choicesNum = 0;
        if (!player.oltianshu_priority) player.oltianshu_priority = 0;
        function getRandomKeys(keys, count) {
            const shuffled = keys.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }
        let text1 = '', text2 = '', text3 = '', TXT = '';
        let number_times = [], number_effects = [];
        if (string === "times") {
            TXT = setColor("请为〖天书〗选择一个时机：");
            const object = oltianshu.triggers;
            const keys = Object.keys(object);
            const RandomKeys = getRandomKeys(keys, 3);
            number_times = RandomKeys;
            text1 = object[RandomKeys[0]].triggerinfo;
            text2 = object[RandomKeys[1]].triggerinfo;
            text3 = object[RandomKeys[2]].triggerinfo;

        } else if (string === "effects") {
            TXT = setColor("请为〖天书〗选择一个效果：<br/>") + player.oltianshu_textone;
            const object = oltianshu.effects;
            /**
             * 选择根据选择的时机类型，随机选择对应类型的三种天书效果
             */
            const type = player.oltianshu_choicestype;
            let keys_bytype = [];
            for (let key in object) {
                if (object[key].type === type) {
                    keys_bytype.push(key);
                }
            }
            /**
             * 天书黑名单过滤
             */
            const num = player.oltianshu_choicesNum;
            const blacklist = oltianshu.getblacklist(num);
            console.log(keys_bytype,num,blacklist);
            /**
             * 获取排除黑名单数的最终数组
             */
            const filteredKeys = keys_bytype.filter(key => !blacklist.includes(key));
            //console.log(filteredKeys);
            const RandomKeys = getRandomKeys(filteredKeys, 3);
            //console.log(RandomKeys);
            number_effects = RandomKeys;
            text1 = object[RandomKeys[0]].effectinfo;
            text2 = object[RandomKeys[1]].effectinfo;
            text3 = object[RandomKeys[2]].effectinfo;
        }
        const list = [ text1, text2, text3];
        const chooseButton = await player.chooseButton([TXT,
            [list.map((item, i) => {return [i, item];}),"textbutton",],
        ]).set("filterButton", function (button) {
            if (button.link === 0) {
                return true;
            } else if (button.link === 1) {
                return true;
            } else if (button.link === 2) {
                return true;
            }
        }).set("selectButton", 1).set("forced", true).set("ai", function (button) {
            const numlist = [0, 1, 2];
            const choices = numlist[Math.floor(Math.random() * numlist.length)];
            switch (button.link) {
                case 0: return choices === 0;
                case 1: return choices === 1;
                case 2: return choices === 2;
            }
        }).forResult();
        if (chooseButton.bool) {
            const choices = chooseButton.links;
            if (choices.includes(0)) {
                if (string === "times") {
                    player.oltianshu_textone = text1;
                    player.oltianshu_choicestype = oltianshu.triggers[number_times[0]].type;
                    player.oltianshu_choicesNum = number_times[0];
                    return [number_times[0],oltianshu.triggers[number_times[0]]];
                } else if (string === "effects") {
                    return [number_effects[0],oltianshu.effects[number_effects[0]]];
                }
            } else if (choices.includes(1)) {
                if (string === "times") {
                    player.oltianshu_textone = text2;
                    player.oltianshu_choicestype = oltianshu.triggers[number_times[1]].type;
                    player.oltianshu_choicesNum = number_times[1];
                    return [number_times[1],oltianshu.triggers[number_times[1]]];

                } else if (string === "effects") {
                    return [number_effects[1],oltianshu.effects[number_effects[1]]];
                }
            } else if (choices.includes(2)) {
                if (string === "times") {
                    player.oltianshu_textone = text3;
                    player.oltianshu_choicestype = oltianshu.triggers[number_times[2]].type;
                    player.oltianshu_choicesNum = number_times[2];
                    return [number_times[2],oltianshu.triggers[number_times[2]]];
                } else if (string === "effects") {
                    return [number_effects[2],oltianshu.effects[number_effects[2]]];
                }
            }
        } else {
            return {};
        }
    },
    /**
     * 自动为lib.skill添加天书技能
     */
    chooseButton : async function(player) {
        const skillslist = player.countSkills().filter(o => o.startsWith("TAFoltianshu_"));
        const TSLimit = player.icehedao_tianshu;
        //若获得天书达到上限，先移除一个已经用的天书技能！
        if (skillslist && skillslist.length >= TSLimit) {
            let list = [];
            let skilllist = [];
            let Usableist = [];
            for (let skill of skillslist) {
                //获取可使用的次数！
                const num = player[skill + '_use'];
                const text = lib.skill[skill].TAFoltianshu_info;
                let info = setColor("〖可使用次数：〗");
                if (text) {
                    info += num + "次" + "<br/>" + text;
                    list.push(info);
                    skilllist.push(skill);
                    Usableist.push(num);//用于AI判断！
                }
            }
            /**
             * 凸(艹皿艹 )，获得天书时！不是〖青书〗ing吗？非要把描述放在〖合道〗！艹！
             */
            let TEXT = setColor("〖合道〗") + "请移除一册天书：";
            const chooseButton = await player.chooseButton([TEXT,
                [list.map((item, i) => {return [i, item];}),"textbutton",],
            ]).set("filterButton", function (button) {
                return true;
            }).set("selectButton", 1).set("ai", function (button) {
                let numlist = Usableist;
                const minNum = Math.min(...numlist);
                const index = numlist.indexOf(minNum);
                return button.link === index;
            }).set("forced", true).forResult();
            if (chooseButton.bool) {
                if (player.hasSkill("icehedao")) player.logSkill("icehedao");
                const choices = chooseButton.links;
                const skill = skilllist[choices];
                await oltianshu.removeTianshu(player,skill);
            }
        }
        const Times = await oltianshu.chooseButtonX(player, "times");
        const Effects = await oltianshu.chooseButtonX(player, "effects");
        player.oltianshu_priority ++;
        let skillsobj = lib.skill;
        let namestartsWith = "TAFoltianshu_";
        /**
         * 1.生成天书技能ID：
         */
        let skillname = namestartsWith + Times[0] + Effects[0];
        /**
         * 1.获取天书的优先级；设定触发天书的优先级，后来者居上原则！
         */
        let prioritnum = player.oltianshu_priority;
        /**
         * 1.获取天书trigger：天书的触发器
         * 2.获取天书canuse ：非本体的二级filter函数
         * 3.获取天书content：天书效果content函数
         */
        const trigger_bytimes = Times[1].trigger, canuse_bytimes = Times[1].canuse, content_byeffects = Effects[1].content;
        /** 获取这本天书的技能描述 */
        const text1 = Times[1].triggerinfo, text2 = Effects[1].effectinfo;
        const TXT = text1 + "," + text2 + "。";
        /**
         * 添加新的天书技能
         */
        if (!skillsobj[skillname]) {
            lib.skill[skillname] = {
                audio: "ext:银竹离火/audio/skill:2",
                mark: true,
                marktext: "<font color= #EE9A00>天书</font>",
                TAFoltianshuname: skillname,//天书ID
                TAFoltianshu_info: TXT,//天书描述
                intro: {
                    mark: function(dialog, storage, player) {//天书设定不使用别人看不见只能看到天书使用的次数。
                        const num = player[skillname + '_use'];
                        const setnum = player.icehedao_tianshu;
                        const info = lib.skill[skillname].TAFoltianshu_info;
                        if (!num || num <= 0 || !setnum || !info) {
                            dialog.addText(setColor("这是一本空白的〖天书〗！"));
                        } else {
                            if (player.isUnderControl(true)) {
                                dialog.addText(info);
                            } else {
                                if (num >= setnum) {
                                    dialog.addText(setColor("这是一本神秘的〖天书〗，切勿窥探天机！"));
                                } else {
                                    dialog.addText(info);
                                }
                            }
                        }
                    },
                    markcount: function(storage, player) {
                        const num = player[skillname + '_use'] || 0;
                        return num;
                    },
                    onunmark: true,
                    name: "<font color= #EE9A00>天书</font>",
                },
                trigger: trigger_bytimes,
                direct: true,
                init: async function(player, skill) {
                    //Bug fix：非南华老仙角色天书只能使用一次，标记数设定为1！
                    const key = oltianshu.filterOwner(player);
                    const setnum = player.icehedao_tianshu;
                    if (setnum) {
                        if (!player[skillname + '_use']) player[skillname + '_use'] = player.icehedao_tianshu;
                    } else {
                        if (key) {
                            if (!player[skillname + '_use']) player[skillname + '_use'] = 1;
                        } else {
                            if (!player[skillname + '_use']) player[skillname + '_use'] = 2;
                        }
                    }
                    let TXT = setColor("获得了一本神秘的〖天书〗！");
                    player.markSkill(skill);
                    player.update();
                    game.log(player, TXT);
                },
                filter: function(event, player) {
                    return player[skillname + '_use'] > 0;
                },
                canuse:canuse_bytimes, 
                content:content_byeffects,
                "_priority": prioritnum,
            };
        }
        /**
         * 让系统方便一会儿！
         */
        await delay(1000);
        await player.addSkill(skillname);
        player.markSkill(skillname);
        player.update();
        /**
         * 不知道返回什么返回这个技能ID吧！
         */
        return skillname;
    },
};

oltianshu.setTranslate();

oltianshu.setCombination_sum();

oltianshu.setCombination_use();