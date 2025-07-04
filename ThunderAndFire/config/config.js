import {lib, game, ui, get, ai, _status} from '../../../../noname.js'
export const config = {
    ThunderAndFire_Two: { name: "二　扩展详情：", clear: true, },
    // 扩展包前言
    TAFset_qianyan: {
        name: "2.1　《银竹离火》更新详情",
        init: "1",
        intro: "更新内容",
        item: {
            "1": "更新内容",
            "2": "武将更新<br>　　新增武将、姜太虚、神庞统、瞳羽、普通锦囊牌【轮回之钥】，新增异构Boss神鬼高达。新增本扩展专属闯关乱斗模式！",
            "3": "武将更新<br>　　完善基本牌雷闪设定：因本体无懈的响应时机先于本卡牌技能的触发时机useCardToBegin，若已经被无懈，该伤害牌事件已经被略过，则不触发雷闪。",
            "4": "武将更新<br>　　优化雷闪的AI使用价值决策：1.场上存在有技能失效的友方，则优先使用雷闪；2.若响应的牌是【杀】，且手牌中有可以选择和响应的打出的卡牌闪，且有【杀】（证明不缺杀），则不使用雷闪，转而使用普通闪。",
            "5": "武将更新<br>　　ol南华老仙2025年6月18日 跟进最新线上内容。血量还是4血！技能应该和线上一模一样了，已过滤天书黑名单。",
            "6": "扩展更新<br>　　本次更新，扩展模块架构重新调整，可能会出现BUG(结构调整赋值的地方未及时调整)。后续更新会将在此基础上进行优化。",
        }
    },
    // 扩展说明
    TAFset_shuoming: {
        name: "2.2　《银竹离火》扩展说明",
        init: "1",
        intro: "扩展说明",
        item: {
            "1": "查看说明",
            "2": "武将分栏<br>　　「神话再临、隐忍天弓、鼎足三分、星河皓月、惊世银竹、期期离火、欲雨临泽、惊鸿玉蝶、爆料武将、其他武将、异构Boss、测试专属」",
            "3": "武将强度<br>　　十周年阴间偏上。个人不太喜欢强命、一刀斩的乱搞的设定，这只是一个卡牌为核心的游戏，每个武将各技能之间的关联性、可玩性拉满，请放心食用。<br>　　不要讲您那所谓的‘一眼阴间’；对于文案设计来讲，有趣的机制设定 > 您张口就来的那所谓的阴间数值，数值是可以调的！不喜欢玩，有个删除扩展谢谢配合。",
            "4": "版本适配<br>　　本扩展仅支持无名杀本杀版本，不支持清瑶！",
            "5": "AI代码说明<br>　　本武将包中的所有武将均可由 AI 托管操作，符合其全部技能设定的要求及使用思路。主打一个单机陪玩！哈哈",
        }
    },
    // 扩展说明
    TAFset_designer: {
        name: "2.3　《银竹离火》设计者名单",
        init: "1",
        intro: "文案设计者名单",
        item: {
            "1": "文案设计者名单",
            "2": "（一）神话再临分栏<br>　　姜太虚、神庞统 - 作者：白露为霜；<br>　　瞳羽 - 作者：想去远方",
            "3": "（一）星河皓月分栏<br>　　司马徽 - 作者：绘声03；",
            "4": "（二）惊鸿玉蝶分栏<br>　　张琪瑛 - 作者：想去远方；",
            "5": "（三）其他武将分栏：<br>　　SE贾诩 - 作者：夜啼林夕(插接算频繁，会出现BUG报错，本人目前暂时没有想法去修复或修改文案，做出来就是为了让设计者看看这个触发时机，下次设计技能的时候不要写这种触发时机了，哈哈)；<br>　　喵林夕 - 作者：夜啼林夕；<br>　　躬耕南阳诸葛亮 - 作者：落梦萧萧；<br>　　明徐阶 - 作者：数学家；",
        }
    },
    // 运行环境&扩展问题
    TAFset_huanjing: {
        name: "2.4　运行环境丨(Click Me)",
        init: "1",
        intro: "运行环境",
        item: {
            "1": "运行环境",
            "2": "　　① 较新的游戏版本（1.10.17及以上必需，无名杀本体）；<br>　　② 打开“兼容模式”（推荐）；<br>　　③ “十周年 UI”扩展（推荐）；<br>　　④ “千幻聆音”扩展（推荐）。",
        }
    },
    ThunderAndFire_Three: { name: "三　武将功能：", clear: true, },
    TAFset_rarity: {//设置3.1：武将默认稀有度设置
        name: "3.1　武将默认稀有度设置",
		init: true,
        intro: "本扩展武将将恢复至原本设定稀有度；默认开启！",
    },
    TAFset_prefix: {//设置3.2：武将名字颜色设置
        name: "3.2　武将名字颜色设置",
		init: true,
        intro: "将根据本扩展武将分类及阵营，设置武将名字、前缀的颜色；默认开启！",
    },
    TAFset_gifs: {//设置3.3：武将局内动态背景 @真理亚
        name: "3.3　武将局内动态背景",
        init: "1",
        intro: "本扩展武将牌牌面局内将显示对应特效；重启生效！",
        item: {
            "1": "萤火",
            "2": "樱花",
            "3": "关闭",
        },
    },
    TAFset_skinschange: {//设置3.4：武将局内皮肤切换设置
        name: "3.4　武将皮肤切换设置",
		init: true,
        intro: "<br>　　①扩展内：司马懿、张春华、郭嘉、周瑜、曹纯、赵襄，若局内携带本体皮肤及特定皮肤，会在特定状态下进行皮肤切换！<br>　　②若开启扩展《千幻聆音》查看本体及特定皮肤，便可查看特定皮肤切换时机及对应切换条件！",
    },
    TAFset_charReplace: {//设置3.5：加强贾诩
        name: "3.5　同名武将切换设置（出现本扩展武将时）",
		init: true, // 默认开启
        intro: "选将页面如果出现本扩展武将，将出现可以切换的同名的全扩所有武将(除禁将外)；默认开启！",
    },
    TAFset_lutou: {//设置3.6：武将露头皮肤设置
        name: "3.6　武将露头皮肤设置",
        intro: "武将原画及皮肤替换为露头版，需要配合十周年UI使用；但是我这边没有找露头皮肤，文件夹为空，嘿嘿；游戏重启后生效。",
        init: false, // 默认关闭
        onclick: function (item) {
            game.saveConfig('TAFset_lutou', item);
            game.saveConfig('extension_银竹离火_TAFset_lutou', item);
        }
    },
    TAFset_SkillsTips: {//设置3.7：武将技能悬浮显示
        name: "3.7　武将技能悬浮显示",
		init: true,
        intro: "本扩展部分武将技能描述将进行悬浮显示；默认开启，本人建议开启，因为原文案描述，我懒得改了哈哈！",
    },
    TAFset_ice_jiaxu: {//设置3.8：加强贾诩
        name: "3.8　蝶贾诩络殊技能池增加",
		init: false, // 默认关闭
        intro: "殊技能池为：〖乱武〗〖间书〗〖拥嫡〗〖兴衰〗〖焚城〗〖奇谋〗〖雄异〗〖凶算〗〖造王〗〖纷殕〗，开启此选项后，将筛选本体全部翻译为以上技能名字的技能且为限定技的技能加入络殊技能池！",
    },
    TAFset_TAF_boss: {//设置3.9：设置BOSS加入将池
        name: "3.9　扩展boss加入将池",
		init: false, // 默认关闭
        intro: "本扩展BOSS：神吕布、神鬼高达稍作调整后加入本扩展《其他武将》将池：玩家可在身份场等模式体验；默认关闭！",
    },
    TAFset_TAF_ZQY_compete: {//设置3.10：张琪瑛线下参赛投稿版
        name: "3.10　张琪瑛线下参赛投稿版",
		init: true, // 默认开启
        intro: "打开切换参赛投稿版；默认开启！",
    },
    ThunderAndFire_Four: { name: "四　全局功能：", clear: true, },
    addThunderAndFireFavoriteCharacters: {//设置4.1：一键添加《武将收藏列表》
        name: '4.1　一键添加《武将收藏列表》丨(除爆料其他)',
        intro: "点击确认收藏后:将一键添加《武将收藏列表》中本扩展的所有武将！",
        clear: true,
        onclick: function () {
            if (this.innerHTML === '<small><font color=\"red\">确认收藏</font></small>') {
                const object = lib.ThunderAndFire.characters;
                const characterID = lib.ThunderAndFire.characters.character;
                const charactersToAdd = [];
                const paichu = [...object.雾山五行,...object.爆料体验,...object.其他武将, ...object.异构Boss, ...object.测试专属];
                const newCharacterID = characterID.filter(id =>!paichu.includes(id));
                for (const name of newCharacterID) {
                    if (lib.translate[name] && !charactersToAdd.includes(name)) {
                        charactersToAdd.push(name);
                    }
                }
                if (charactersToAdd.length > 0) {
                    lib.config.favouriteCharacter = [...lib.config.favouriteCharacter, ...charactersToAdd];
                    game.saveConfig('favouriteCharacter', lib.config.favouriteCharacter);
                    game.uncheck();
                    game.check();
                    alert('已将《银竹离火》本体武将添加到《武将收藏列表》，重启生效！');
                } else {
                    alert('《银竹离火》本体武将已经在《武将收藏列表》中：☆☆☆重启生效哦亲☆☆☆');
                }
            } else {
                this.innerHTML = '<small><font color=\"red\">确认收藏</font></small>';
                const that = this;
                setTimeout(() => {
                    that.innerHTML = '<small><font color= #00FFFF>4.1　一键添加《<font color= #EE9A00>武将收藏列表</font>》</font><font color= #EE9A00>丨</font>(<font color=\"red\">除爆料其他</font>)</small>';
                }, 1500);
            }
        },
    },
    clearThunderAndFireFavoriteCharacters: {//设置4.2：一键清除《武将收藏列表》
        name: '4.2　一键清除《武将收藏列表》丨(仅本扩展)',
        intro: "点击确认清除后:将一键移除《武将收藏列表中》本扩展的所有武将！",
        clear: true,
        onclick: function () {
            if (this.innerHTML === '<small><font color=\"red\">确认清除</font></small>') {
                const characterID = lib.ThunderAndFire.characters.character;
                if (!Array.isArray(characterID)) return;
                const charactersToRemove = [];
                for (const name of characterID) {
                    if (lib.translate[name] && !charactersToRemove.includes(name)) {
                        charactersToRemove.push(name);
                    }
                }
                if (charactersToRemove.length > 0) {
                    lib.config.favouriteCharacter = lib.config.favouriteCharacter.filter(name => !charactersToRemove.includes(name));
                    game.saveConfig('favouriteCharacter', lib.config.favouriteCharacter);
                    game.uncheck();
                    game.check();
                    alert('已将《武将收藏列表》中含有《银竹离火》的武将全部清除，重启生效！');
                } else {
                    alert('《武将收藏列表》中《银竹离火》的武将已经全部清除：☆☆☆重启生效哦亲☆☆☆');
                }
            } else {
                this.innerHTML = '<small><font color=\"red\">确认清除</font></small>';
                const that = this;
                setTimeout(() => {
                    that.innerHTML = '<small><font color= #00FFFF>4.2　一键清除《<font color= #EE9A00>武将收藏列表</font>》</font><font color= #EE9A00>丨</font>(<font color=\"red\">仅本扩展</font>)</small>';
                }, 1500);
            }
        },
    },
    TAFset_sortcards: {//设置4.3：自动整理手牌 
        name: "4.3　自动整理手牌",
		init: false,//默认关闭
        intro: "手牌将进行自动整理，按牌名、价值、花色、点数升序排列；默认关闭！",
    },
    TAFset_Background_Musics: {//设置4.4：游戏背景音乐设置
        name: "4.4　游戏背景音乐设置",
        intro: "背景音乐：可随意点播、切换优质动听的背景音乐",
        init: "1",
        item: {
            "0": "随机播放",
            "1": "默认音乐",
            "2": "不凡",
            "3": "不由己",
            "4": "凡人",
            "5": "凡人不凡",
            "6": "归潮",
            "7": "归期",
            "8": "落英",
            "9": "屁",
            "10": "少年不凡",
            "11": "天地行",
            "12": "望乡曲",
            "13": "勿听",
            "14": "修仙缘",
            "15": "道心无畏",
            "16": "三国杀",
            "17": "新定军山",
        },
        onclick: function (item) {
            game.saveConfig('extension_银竹离火_TAFset_Background_Musics', item);
            game.TAFset_Background_Musics();
            ui.backgroundMusic.addEventListener('ended', game.TAFset_Background_Musics);
        },
    },
    TAFset_Background_Pictures: {//设置4.5：游戏背景图片设置
        name: "4.5　游戏背景图片设置",
        intro: "内置七张精选图片可开启图片自动切换",
        init: "1",
        item: {
            "1": "默认背景",
            "picture1": "神话再临",
            "picture2": "隐忍天弓",
            "picture3": "星河皓月",
            "picture4": "鼎足三分",
            "picture5": "惊世银竹",
            "picture6": "期期离火",
            "picture7": "欲雨临泽",
            "picture8": "惊鸿玉蝶",
            "picture9": "爆料武将",
            "picture10": "其他武将",
            "picture11": "异构Boss",
            "picture12": "测试专属",
            "auto": "自动切换",
        },
        onclick: function (item) {
            game.saveConfig('extension_银竹离火_TAFset_Background_Pictures', item);
            game.TAFset_Background_Pictures();
        },
        "visualMenu": function (node, link) {
            node.style.height = node.offsetWidth * 0.67 + "px";
            node.style.backgroundSize = '100% 100%';
            node.className = 'button  skBackgroundname';
            node.setBackgroundImage('extension/银竹离火/image/background/' + link + '.png');
        },
    },
    TAFset_Background_Pictures_auto: {//4.5游戏背景自动切换st
        name: "4.6　游戏背景自动切换st",
        intro: "设置自动换背景的时间",
        init: "30000",
        customItemFormat: true, // 标记这个配置项的 item 需要特殊处理
        item: {
            '5000': '五秒',
            '10000': '十秒',
            '20000': '二十秒',
            '30000': '半分钟',
            '60000': '一分钟',
            '120000': '两分钟',
            '300000': '五分钟',
        },
        onclick: function (item) {
            game.saveConfig('extension_银竹离火_TAFset_Background_Pictures_auto', item);
            if (lib.config.extension_银竹离火_TAFset_Background_Pictures == 'auto') {
                game.TAFset_Background_Pictures();
            }
        },
    },
    TAFset_autoSwap: {
        name: "4.7　自娱自乐",
        init: false,
        intro: "重启生效，默认关闭，接管场上所有角色的操作。",
    },
}
function setstyle_name(name,key){
    if(!name  || typeof name !== "string") return;
    if(!key || typeof key !== "string") return;
    if(key.startsWith('ThunderAndFire_')){
        name = `<font color='#EE9A00'>${name}</font>`;
    } else {
        name = `<small><font color='#00FFFF'>${name}</font></small>`;
    }
    return name;
}
function setstyle_intro(intro){
    if(!intro  || typeof intro !== "string") return;
    return `<small><font color='#00FFFF'>点击查看：</font></small><small>${intro}</small>`;
}
function setstyle(object){
    if(!object && typeof object !== "object") return;
    const keys = Object.keys(object);
    for (let key of keys) {
        const setings = object[key];//配置项
        const name = setings.name;
        if(name && typeof name === "string"){
            setings.name = setstyle_name(name,key);
        }
        const intro = setings.intro;
        if(intro && typeof intro === "string"){
            //console.log(intro,key);
            setings.intro = setstyle_intro(intro);
        }
        const item = setings.item;
        if(item && typeof item === "object"){
            const keys = Object.keys(item);
            for (let key of keys) {
                const value = item[key];
                const list1 = [
                    '更新内容','查看说明','文案设计者名单','运行环境','萤火','樱花','关闭','随机播放','默认音乐',
                    '不凡','不由己','凡人','凡人不凡','归潮','归期','落英','屁','少年不凡','天地行','望乡曲','勿听','修仙缘','道心无畏','三国杀','新定军山',
                    '默认背景','自动切换','五秒','十秒','二十秒','半分钟','一分钟','两分钟','五分钟','络殊技能池'
                ];
                const list2 = [
                    '神话再临','隐忍天弓','鼎足三分','星河皓月','惊世银竹','期期离火','欲雨临泽','惊鸿玉蝶','爆料武将','其他武将','异构Boss','测试专属'
                ];
                if(value && typeof value === "string"){
                    if(list1.includes(value)){
                        item[key] = `<small><font color=\"red\">${value}</font></small>`;
                    } else if(list2.includes(value)){
                        item[key] = `<small><font color= '#00FFFF'>${value}</font></small>`;
                    } else {
                        item[key] = `<small><font color= '#AFEEEE'>${value}</font></small>`;
                    }
                }
            }
        }
    }
    return object;
}
setstyle(config);