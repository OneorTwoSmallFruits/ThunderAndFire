import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import characters from "../characters/character.js";
import {
    隐忍天弓, 鼎足三分, 星河皓月, 惊世银竹, 
    期期离火, 欲雨临泽, 惊鸿玉蝶, 神话再临, 
    雾山五行, 爆料体验, 其他武将, 异构Boss, 
    将灵专属, 测试专属
} from "../characters/character.js";
import cards from "../cards/cards.js";
import { 基本牌, 锦囊牌, 装备牌 } from "../cards/cards.js";
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import { asyncs } from'../precontent/asyncs.js';
import { oltianshu} from'../precontent/oltianshu.js';
lib.ThunderAndFire = {
    name: "银竹离火",
    characters: {
        总数: Object.keys(characters).length,
        character: Object.keys(characters),
        隐忍天弓: Object.keys(隐忍天弓),
        鼎足三分: Object.keys(鼎足三分),
        星河皓月: Object.keys(星河皓月),
        惊世银竹: Object.keys(惊世银竹),
        期期离火: Object.keys(期期离火),
        欲雨临泽: Object.keys(欲雨临泽),
        惊鸿玉蝶: Object.keys(惊鸿玉蝶),
        神话再临: Object.keys(神话再临),
        雾山五行: Object.keys(雾山五行),
        爆料体验: Object.keys(爆料体验),
        其他武将: Object.keys(其他武将),
        异构Boss: Object.keys(异构Boss),
        将灵专属: Object.keys(将灵专属),
        测试专属: Object.keys(测试专属),
    },
    cards: {
        总数: Object.keys(cards).filter(card => !cards[card]?.notCards).length,
        card: Object.keys(cards).filter(card => !cards[card]?.notCards),
        basic: Object.keys(基本牌).filter(card => !cards[card]?.notCards),
        trick: Object.keys(锦囊牌).filter(card => !cards[card]?.notCards),
        equip: Object.keys(装备牌).filter(card => !cards[card]?.notCards),
        专属卡牌: Object.keys(cards).filter(card => cards[card]?.derivation),
        神武卡牌: Object.keys(cards).filter(card => cards[card].shenwu),
        setDestroy: Object.keys(cards).filter(card => cards[card]?.destroy),
        setAudio: Object.keys(cards).filter(card => cards[card]?.setAudio && cards[card]?.audio === false),
    },
    func : ThunderAndFire,
    ai: setAI,
    asyncs: asyncs,
    oltianshu : oltianshu,
};
