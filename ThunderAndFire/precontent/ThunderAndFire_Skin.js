
import { taici, gonglve, skininfo } from'../../image/ThunderAndFireSkins/Skins.js';
/**
 * 《银竹离火》皮肤设置
 */
export function ThunderAndFire_Skin(lib,game,ui,get,ai,_status){
    if(!lib.qhlypkg) lib.qhlypkg = [];
	let scoreItem = ['<small>输出</small>', '<small>生存</small>', '<small>过牌</small>', '<small>控制</small>', '<small>辅助</small>', '<small>难度</small>'];
	let colotItem = ['red', 'green', 'blue', 'navy', 'deeppink', 'brown'];
    lib.init.css(lib.assetURL + 'extension/银竹离火/ThunderAndFire/otherSettings/css', 'ThunderAndFire_Skins');
    lib.qhlypkg.push({
        isExt: true, // 是否是扩展，一般填 true
        filterCharacter: function (name) {
            return (
                name.indexOf('TAF_') === 0 ||
                name.indexOf('moon_') === 0 ||
                name.indexOf('sun_') === 0 ||
                name.indexOf('stars_') === 0 ||
                name.indexOf('thunder_') === 0 ||
                name.indexOf('fire_') === 0 ||
                name.indexOf('water_') === 0 ||
                name.indexOf('ice_') === 0
            );
        },
        characterNameTranslate: function (name) {
            return get.translation(name);
        },
        characterTaici: function (name) {
            return taici[name];
        },
        characterInfo: function (name) {
            // 这里可以返回角色资料。如不返回则显示 get.characterIntro(name)。
            // return get.characterIntro(name); // 确认是否需要加上这一行
        },
        originSkinInfo: function (name) {
            const info = {
                TAF_zhaoyun: '画师：DH',
                sun_simayi: '画师：木美人',
                sun_zhangchunhua: '画师：depp',
                thunder_caocao: '画师：鬼画府',
                fire_liubei: '画师：鬼画府',
                water_sunquan: '画师：鬼画府',
                thunder_guojia: '画师：鬼画府',
                stars_zhugeliang: '画师：未知',
                moon_zhouyu: '画师：鬼画府',
                ice_simahui: '画师：凡果_Make',
                thunder_caochun: '画师：泽舟',
                fire_baosanniang: '画师：木美人',
            };
            function setcolors(obj, color = '#FF2400') {
                if (typeof obj === 'object' && obj !== null) {
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            obj[key] = setcolors(obj[key], color);
                        }
                    }
                } else if (typeof obj === 'string') {
                    return `<small><font color="${color}">${obj}</font></small>`;
                }
                return obj;
            }
            setcolors(info)
            return info[name];
        },
        characterGonglve: function (name) {
            var gl = gonglve[name];
            if (!gl) return;
            if (typeof gl == 'string') return gl;
            var score = gl.score;
            var div = ui.create.div({
                position: 'relative',
                width: '90%',
                height: '50%',
                marginTop: '15px',
            });
            for (var i = 0; i < score.length; i++) {
                var element = score[i];
                var translate = scoreItem[i];
                var color = colotItem[i];
                var block = ui.create.div(div, '.block', {
                    position: 'relative',
                    width: '100%',
                    height: 100 / score.length + '%',
                });
                ui.create.div(block, {
                    width: '12%',
                    innerHTML: translate,
                    color,
                });
                var progress = document.createElement('progress');
                progress.max = 5; // 修改评分最高分为10
                progress.value = element;
                progress.className = color;
                block.appendChild(progress);
                ui.create.div(block, {
                    width: '12%',
                    innerHTML: `${element} / 5`, // 显示评分比例
                    color: 'black',
                    left: '85%',
                });
            }
            return {
                handleView: function (view) {
                    view.innerHTML +=
                        '<br><font color=red>【武将评分】</font><br> ';
                    view.appendChild(div);
                    view.innerHTML +=
                        '<div style="position: relative;">' + gl.comment + '</div>';
                },
            };
        },        
        characterIntroduceExtra: function (name) {
            var arr = [];
            if (gonglve[name]) {
                arr.push({ name: '攻略', func: 'characterGonglve' });
            }
            if (arr.length) return arr;
        },
        prefix: 'extension/银竹离火/image/character/standard/', // 原皮前缀，标识原皮肤的位置。
        isLutou: lib.config.extension_银竹离火_TAFset_lutou, // 判断是否当前启用露头，没有露头皮肤可不需要此项。
        lutouPrefix: 'extension/银竹离火/image/character/lutou/', // 没有露头皮肤可不需要此项。
        skin: {
            standard: 'extension/银竹离火/image/ThunderAndFireSkins/standard/', // 可切换普通皮肤的前缀
            lutou: 'extension/银竹离火/image/ThunderAndFireSkins/loutou/', // 可切换露头皮肤的前缀
        },
        audioOrigin: 'extension/银竹离火/audio/skill/', // 原技能配音位置
        audio: 'extension/银竹离火/image/ThunderAndFireSkins/audio/', // 切换皮肤后的技能配音位置
        replaceAvatarDestination: function (name, skin) {
            //不知道！！哼！
        },
        skininfo: skininfo,
    });
}