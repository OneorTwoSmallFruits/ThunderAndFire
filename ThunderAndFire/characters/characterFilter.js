import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import characters from "./character.js";
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "./character.js";
/**
 * 全部武将
 */
const lists = Object.keys(characters);
/**
 * 禁用列表
 */
const banedlists = [
    "TAF_cs_ceshi", 
    "TAF_sf_zhangjiao",
    "TAF_shen_tongyu_shadow",
     ...Object.keys(雾山五行),
     ...Object.keys(将灵专属),
];
/**
 * 剩余武将
 */
const remainlists = lists.filter(item =>!banedlists.includes(item));
const characterFilters = {};
for(const baned of banedlists) {
    if (!characterFilters[baned]) {
        characterFilters[baned] = function (mode) {
            return false;
        }
    }
}
for(const remain of remainlists) {
    if (!characterFilters[remain]) {
        characterFilters[remain] = function (mode) {// 身份、对决、斗地主
            return mode === "identity" || mode === "versus" || mode === "doudizhu" || mode === "boss";
        }
    }
}
export default characterFilters;