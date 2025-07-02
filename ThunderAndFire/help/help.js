import {lib, game, ui, get, ai, _status} from '../../../../noname.js'
import { 
    character,
    神话再临character, 隐忍天弓character, 鼎足三分character, 星河皓月character,
    惊世银竹character, 期期离火character, 欲雨临泽character, 惊鸿玉蝶character,
    雾山五行character, 爆料体验character, 其他武将character, 异构Bosscharacter,
    测试专属character,
} from'../precontent/characters.js';
const num1 = Object.keys(神话再临character).length + Object.keys(隐忍天弓character).length + Object.keys(鼎足三分character).length + 
    Object.keys(星河皓月character).length + Object.keys(惊世银竹character).length + Object.keys(期期离火character).length + 
    Object.keys(欲雨临泽character).length + Object.keys(惊鸿玉蝶character).length;
const num2 = Object.keys(雾山五行character).length + Object.keys(爆料体验character).length + Object.keys(其他武将character).length;
export const help = {
    银竹离火: '<font color= #EE9A00>一　扩展概况：</font>' + 
    '<li>本扩展特定范围武将分栏：神话再临、隐忍天弓、鼎足三分、星河皓月、惊世银竹、期期离火、欲雨临泽、惊鸿玉蝶。' +
    '<li>截止2025年6月2日，以上分栏武将共' + num1 + '个。' + 
    '<li>其他武将分栏：雾山五行、爆料体验、其他武将。' +
    '<li>截止2025年6月2日，其他武将分栏共' + num2 + '个。' + '<br>' +
    '<font color= #EE9A00>二　扩展设定：</font>' +
    '<li>势力转换技：本武将包势力转换技设定：游戏开始时，切换至开局设定势力，摸一张牌，死亡时，切换至初始设定势力。' 


};
