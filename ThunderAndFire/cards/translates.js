import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { ThunderAndFire, setAI} from'../precontent/functions.js';
const { setColor } = ThunderAndFire;
const 基本牌 = {
    TAF_leishan:"雷闪",
    TAF_leishan_info:"　　抵消一张「未被抵消的」伤害牌并横置目标获得此伤害牌，然后可选择场上一名有因〖封印〗类技能而产生失效技能的角色，解除其至多一个正在被封印的技能直到该〖封印〗技能消失。",
    TAF_leishan_remove: "雷闪",
};
const 锦囊牌 = {
    TAF_lunhuizhiyao:"轮回之钥",
    TAF_lunhuizhiyao_info:"　　出牌阶段对一名其他角色使用，可调整其下一个回合的六大阶段顺序。",
    TAF_lunhuizhiyao_phaseZhunbei:"准备阶段",
    TAF_lunhuizhiyao_phaseJudge:"判定阶段",
    TAF_lunhuizhiyao_phaseDraw:"摸牌阶段",
    TAF_lunhuizhiyao_phaseUse:"出牌阶段",
    TAF_lunhuizhiyao_phaseDiscard:"弃牌阶段",
    TAF_lunhuizhiyao_phaseJieshu:"结束阶段",
    TAF_daozhuanqiankun:"倒转乾坤",
    TAF_daozhuanqiankun_info:"　　一名角色回合结束时，对所有角色使用(以使用者座次开始依次结算)，生效角色座次发生逆转（至少生效两名角色）。",
    thundertenwintenlose:"十胜十败",
    thundertenwintenlose_info:"　　出牌阶段，对自己使用，判定阶段若判定结果在点数十之内，奇数且为♠ / 偶数且为♥，则你须选择一名非郭嘉其他角色，与其依次比较手牌区、装备区、判定区的牌数：胜第一项，你摸两张牌；胜第二项，你回复一点体力与其均横置；胜第三项，其受到一点无来源的🔥伤害；无有效目标或判定失败后，移动至下家判定区！",
};
const 装备牌 = {
    TAF_fumojingangchu: "金刚伏魔杵",
    TAF_fumojingangchu_info: "　　你使用〖杀〗指定目标后，令其防具无效。你对有防具的角色造成的伤害+1。",
    TAF_feijiangshenweijian: "飞将神威剑",
    TAF_feijiangshenweijian_info: "　　你使用〖杀〗造成伤害时，改为流失体力。每当有角色流失一点体力，你摸一张牌。",
    TAF_wushuangxiuluoji: "无双修罗戟",
    TAF_wushuangxiuluoji_info: "　　你的〖杀〗或〖决斗〗造成伤害后，你可以对受伤目标的一名相邻角色造成一点伤害。",
    TAF_honglianzijinguan: "红莲紫金冠",
    TAF_honglianzijinguan_info: "　　你的回合结束时，你可以随机弃置所有其他角色一张牌。其中每有一张基本牌，你摸两张牌；每有一张装备牌，随机一名其他角色失去一点体力；每有一张锦囊牌，随机获得一名其他角色的一张牌。",
    TAF_youhuoshepoling: "幽火摄魄令",
    TAF_youhuoshepoling_info: "　　出牌阶段结束时，你可以对所有其他角色随机造成一点⚡或🔥伤害，你回复等同于造成伤害数值的体力。",
    icewuqibingfa:"吴起兵法",
    icewuqibingfa_info:"　　当此牌离开你的装备区时，你销毁之；然后你令至多X名角色于本回合结束时将一张牌当〖杀〗使用（X为你的技能数）。",
};
const translates = { ...基本牌, ...锦囊牌, ...装备牌 };
function Translatecolor(translate) {
    for (const key in translate) {
        if (key.endsWith("_info") && typeof translate[key] === "string") {
            translate[key] = setColor(translate[key]);
        }
    }
    return translate;
}
Translatecolor(translates);
export default translates;