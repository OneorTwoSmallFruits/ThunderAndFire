import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { ThunderAndFire, setAI} from'../precontent/functions.js';
const { setColor } = ThunderAndFire;//银竹离火部分函数
const dynamicTranslates = {
    TAFfenshen(player){
        const bool = player.storage.TAFfenshen;
        let yang = "你失去一点体力，目标角色重铸一张基本牌，然后令此牌额外结算一次",
            yin = "你失去一点体力上限，与目标角色各摸一张牌，然后令此牌无法响应";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = "锁定技，转换技：<br>　　当你使用基本牌或普通锦囊指定其他角色为唯一目标时，",
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    TAFjuechen(player){
        const bool = player.JueChen_change;
        let yang = "可以将任意张花色相同的牌当一张智囊使用",
            yin = "可以将任意张花色不同的牌当一张普通锦囊牌使用";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = "转换技，限定技：<br>　　每轮每种牌名限一次，",
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    TAFxingqi(player){
        const bool = player.storage.TAFxingqi;
        let yang = "受到雷属性伤害时，从牌堆中获得一张红色牌，然后将一张红色牌当作兵粮寸断置入判定区",
            yin = "受到火属性伤害时，从弃牌堆中获得一张黑色牌，然后将一张黑色牌当作乐不思蜀置入判定区";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = "转换技：<br>　　",
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    TAFxingqi(player){
        const bool = player.storage.TAFxingqi;
        let yang = "受到雷属性伤害时，从牌堆中获得一张红色牌，然后将一张红色牌当作兵粮寸断置入判定区",
            yin = "受到火属性伤害时，从弃牌堆中获得一张黑色牌，然后将一张黑色牌当作乐不思蜀置入判定区";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = "转换技：<br>　　",
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    sunxiongyi(player) {//雄奕
        const bool = player.storage.sunpingling;
        if (!bool) {
            return setColor('　　当你「造成/受到」一点伤害时，你可摸已拥有「势力标记数」张牌，若如此做：则令场上玩家依次摸一张牌，并随之获得其区域内一张牌，然后弃置「以此法获得牌数半数向下取整」张牌；若该回合当前本技能使用次数大于你已损失体力值数，则你将区域内牌数调整至三翻面横置并受到一点随机属性伤害「⚡丨🔥丨❄️」，然后本技能失效至该回合结束。');
        } else {
            return setColor('　　当你受到一点伤害时，你可将势力调整至与目标相同并摸已拥有「势力标记数」张牌，若如此做：则令场上同势力玩家依次摸一张牌，并随之获得其区域内一张牌，然后重置势力并弃置「目标势力数」张牌。');
        }
    },
    sunjueqing(player) {//绝情
        const bool = player.group !== 'wei';
        let yang = "可增加一点体力值上限，令此次伤害数值加一并失去一点体力，然后摸一张红色牌",
            yin = "可减去一点体力值上限，令此次伤害改为流失体力并回复等量体力，然后摸一张黑色牌";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = setColor("势力转换技「魏丨晋」：<br>　　游戏进场时，你摸一张牌并将势力调整至「魏」；当你对其他角色造成伤害时，"),
            end = "。";
        return `${start}魏：${yang}；晋：${yin}${end}`;
    },
    thunderfeiying : function (player) {//飞影
        const bool = player.hasZhuSkill('thunderhujia');
        if (!bool) {
            return setColor('锁定技：其他角色与你计算距离时+1。');
        } else {
            return setColor('非锁定技：　　每回合限一次，当你受到魏势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。');
        }
    },
    firedilu : function (player) {//的卢
        const bool = player.hasZhuSkill('firejieying');
        if (!bool) {
            return setColor('锁定技：其他角色与你计算距离时+1。');
        } else {
            return setColor('非锁定技：　　每回合限一次，当你受到魏势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。');
        }
    },
    firejieying_jieyi(player) {//结义
        const bool = player.storage.firejieying_jieyi;
        let yang = "进入濒死状态前，可摸一张牌并令刘备摸两张牌，若如此做：其手牌数大于体力值则其可令你摸一张牌",
            yin = "脱离濒死状态后(存活)，可弃一张牌并令刘备回复一点体力，若如此做：其为满体力则其可令你摸两张牌";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = setColor("转换技：<br>　　每轮游戏限一次完整转换，"),
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    wateryulong : function (player) {//玉龙
        const bool = player.hasZhuSkill('waterquanshu');
        if (!bool) {
            return setColor('锁定技：其他角色与你计算距离时+1。');
        } else {
            return setColor('非锁定技：　　每回合限一次，当你受到吴势力角色伤害时，若其有武器牌，可令其弃置武器牌你摸一张牌。');
        }
    },
    waterquanshu_quandao(player) {//权道
        const bool = player.storage.waterquanshu_quandao;
        let yang = "造成伤害后，你可摸一张牌并弃置两张牌，若如此做：孙权回复一点体力并可移动场上一张牌",
            yin = "受到伤害后，你可摸两张牌并弃置一张牌，若如此做：孙权摸一张牌并可弃置场上一张牌";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = setColor("转换技：<br>　　每轮游戏限一次完整转换，"),
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    thundershanjia(player) {//缮甲
        const bool = player.isTurnedOver();
        let yang = "切换至本状态后，解除横置并获得技能〖攻伐〗，每轮限两次，立即结束当前非你的出牌阶段，进入额外的回合",
            yin = "切换至本状态后，进入横置并获得技能〖御守〗，立即执行一次受到非⚡属性伤害内容，不计入次数限制";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = setColor("转换技：<br>　　武将牌无坐骑栏且游戏进场/回合结束时，武将牌翻面(正/反为阳/阴)，"),
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    waterzhanhuo(player) {//绽火
        const bool = player.storage.waterzhanhuo;
        let yang = "选择一名其他角色，对其造成一点🔥伤害",
            yin = "选择至多两名其他角色，各随机弃置至多两张牌优先装备牌";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        const start = setColor("转换技：<br>　　每回合限一次，当〖军略〗花色记录完毕后，"),
            end = "。";
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    watertaji(player) {//踏寂
        const list = player.watertaji_usedsuits || [];
        let prompt1 = "你摸一张牌";
        let prompt2 = "令一名角色弃置一张牌";
        let prompt3 = "令至多两名角色各摸一张牌";
        let prompt4 = "暂时切换至〖神〗回复一点体力弃一张牌「复原反向执行」，并视为对至多三名角色使用一张「万箭齐发」，然后重置〖清荒〗的使用次数";
        if (list && Array.isArray(player.watertaji_usedsuits)) {
            if(list.length === 0) {
                prompt1 = `<span class=firetext>${prompt1}</span>`;
            } else if(list.length === 1) {
                prompt2 = `<span class=firetext>${prompt2}</span>`;
            } else if(list.length === 2) {
                prompt3 = `<span class=firetext>${prompt3}</span>`;
            } else if(list.length >= 3) {
                prompt4 = `<span class=bluetext>${prompt4}</span>`;
            }
            const start = setColor("势力转换技「吴丨神」：<br>　　当你使用或打出卡牌后，每回合每种花色限一次，「若此牌的目标数为一且目标未横置则横置此牌目标丨若有此花色手牌则随机重铸至多未记录花色数张牌」，然后记录此花色，已记录花色数等于："),
                end = "。";
            return `${start}1.${prompt1}；2.${prompt2}；3.${prompt3}；4.${prompt4}${end}`;
        } else {
            return setColor('势力转换技「吴丨神」：<br>　　当你使用或打出卡牌后，每回合每种花色限一次，「若此牌的目标数为一且目标未横置则横置此牌目标丨若有此花色手牌则随机重铸至多未记录花色数张牌」，然后记录此花色，已记录花色数等于：1.你摸一张牌；2.令一名角色弃置一张牌；3.令至多两名角色各摸一张牌；4.暂时切换至〖神〗回复一点体力弃一张牌「复原反向执行」，并视为对至多三名角色使用一张「万箭齐发」，然后重置〖清荒〗的使用次数。');
        }
    },
    icefalu(player) {//法箓
        const ZQY_compete = lib.config.extension_银竹离火_TAFset_TAF_ZQY_compete;
        const bool = player.storage.icefalu;
        let yang = "随机观看牌堆中至多四张牌，将红/黑牌以任意顺序置于弃牌堆底/顶",
            yin = "随机观看弃牌堆中至多四张牌，将黑/红牌以任意顺序置于牌堆顶/底";
        if (!bool) {
            yang = `<span class=firetext>${yang}</span>`;
        } else {
            yin = `<span class=bluetext>${yin}</span>`;
        }
        let start, end;
        if (ZQY_compete) {
            start = setColor("转换技、参赛版：<br>　　每回合限一次，可将一张牌当作任意〖法箓锦囊〗使用或打出，"),
            end = setColor("；以此法放置的牌称为〖法箓〗，并随机获得至多一张〖法箓〗牌，然后〖法箓锦囊〗进入下一循环组。");
        } else {
            start = setColor("转换技：<br>　　每回合限一次，你可以视为使用或打出任意一张〖法箓锦囊〗，"),
            end = setColor("；以此法放置的牌称为〖法箓〗，并随机获得至多一张〖法箓〗牌，然后〖法箓锦囊〗进入下一循环组。");
        }
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    TAF_chiyan(player) {//赤焰
        const name = player.name;
        if (name && (name === "TAF_lvbu_one" || name === "TAF_lvbu_two")) {
            return setColor('锁定技：<br>　　手牌上限为场上其他角色体力值上限之和，且至少为〖玖〗；你计算与其他角色距离时-1，进攻坐骑牌均视为〖杀〗 / 其他角色计算与你的距离时+1，防御坐骑牌均视为〖决斗〗。');
        } else {
            return setColor('锁定技：<br>　　手牌上限为体力值上限且至多为〖柒〗；你计算与其他角色距离时-1，进攻坐骑牌均视为〖杀〗 / 其他角色计算与你的距离时+1，防御坐骑牌均视为〖决斗〗。');
        }
    },
    thunderlunshi(player) {//论势
        const bool = player.storage.lunshijudge;
        if (!bool) {
            return setColor('　　当一名其他角色判定生效后，若判定结果为非〖十胜十败〗生效结果，则你判定一次〖十胜十败〗效果：若判定失败，则可令至多场上魏势力人数名角色各摸你已损失体力值数且至少为一张牌；你于本局游戏发动三次本技能后获得技能〖遗计〗，并修改〖论势〗。');
        } else {
            return setColor('　　当一名其他角色判定生效后，若判定结果为非「十胜十败」生效结果，或当你受到一点伤害后：则你判定一次「十胜十败」效果：若判定失败，则可令至多场上魏势力人数名角色各摸你已损失体力值数且至少为一张牌');
        }
    },
    mingxinxue(player) {//心学//徐阶
        if (player.storage.mingxinxue) return '　　出牌阶段限三次，你可以将一张牌置于武将牌上称为「知」，<font color= #FF2400><b>并摸一张牌</b></font>，你至多拥有五张且不同牌名的「知」；当你使用或打出同「知」中相同牌名的牌时，你可以弃置1张同此牌名的「知」并摸两张牌。';
        return '　　出牌阶段限三次，你可以将一张牌置于武将牌上称为「知」，<font color= #FF2400><b><span style=\"text-decoration: line-through;\">并摸一张牌</span></b></font>，你至多拥有五张且不同牌名的「知」；当你使用或打出同「知」中相同牌名的牌时，你可以弃置1张同此牌名的「知」并摸两张牌。';
    },
};
export default dynamicTranslates;