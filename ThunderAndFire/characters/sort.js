import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import characters from "./character.js";
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "./character.js";
export const characterSort = {
    TAF_sun : Object.keys(隐忍天弓),
    TAF_sf : Object.keys(鼎足三分),
    TAF_moon : Object.keys(星河皓月),
    TAF_wei : Object.keys(惊世银竹),
    TAF_shu : Object.keys(期期离火),
    TAF_wu : Object.keys(欲雨临泽),
    TAF_qun : Object.keys(惊鸿玉蝶),
    TAF_shen : Object.keys(神话再临),
    TAF_wx : Object.keys(雾山五行),
    TAF_bl : Object.keys(爆料体验),
    TAF_qt : Object.keys(其他武将),
    TAF_boss : Object.keys(异构Boss),
    TAF_sznjl : Object.keys(将灵专属),
    TAF_cs : Object.keys(测试专属),
};
export const characterSortTranslate = {
    TAF_sun:"<font color= #EE9A00><b>隐忍天弓</b></font>",
    TAF_sf:"<font color= #EE9A00><b>鼎足三分</b></font>",
    TAF_moon:"<font color= #EE9A00><b>星河皓月</b></font>",
    TAF_wei:"<font color= #0088CC><b>惊世银竹</b></font>",
    TAF_shu:"<font color= #FF2400><b>期期离火</b></font>",
    TAF_wu:"<font color= #48D1CC><b>欲雨临泽</b></font>",
    TAF_qun:"<font color= #AFEEEE><b>惊鸿玉蝶</b></font>",
    TAF_shen:"<font color= #EE9A00><b>神话再临</b></font>",
    TAF_wx:"🌫️·<font color= #EE9AC7><b>雾山五行</b></font>",
    TAF_bl:"🍀·<font color= #00FFFF><b>爆料体验</b></font>",
    TAF_qt:"⚓·<font color= #00FFFF><b>其他武将</b></font>",
    TAF_boss:"🌩️·<font color= #00FFFF><b>异构Boss(乱斗挑战专属)</b></font>",
    TAF_sznjl:"🌀·<font color= #00FFFF><b>将灵专属(全模式禁用)</b></font>",
    TAF_cs:"💦·<font color= #00FFFF><b>测试专属(全模式禁用)</b></font>",
};