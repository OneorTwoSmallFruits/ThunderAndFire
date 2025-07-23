import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const changeSkinskey = lib.config.extension_银竹离火_TAFset_skinschange;//皮肤切换开关
import { ThunderAndFire, setAI} from'../precontent/functions.js';
import { asyncs } from'../precontent/asyncs.js';
import { oltianshu} from'../precontent/oltianshu.js';
const {
    setColor, delay, getCardSuitNum, getCardNameNum, compareValue, 
    compareOrder, compareUseful, chooseCardsToPile, chooseCardsTodisPile, 
    setjudgesResult,
} = ThunderAndFire;//银竹离火部分函数
const {
    getAliveNum, getFriends, getEnemies,
} = setAI;//银竹离火AI部分函数
/** @type { importCharacterConfig['skill'] } */
const TAF_ceshiSkills = {
    iceceshiSkill: {     
        trigger: {
            player:["useCardAfter"],
        },
        firstDo: true,
        charlotte: true,
        async init(player, skill) {

        },
        check() {
            return true;
        },
        filter(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            await player.specifyCards('TAF_leishan');//获得一张雷闪
            await player.specifyCards('juedou');
            const skillslist = ["thunderyulei", "thunderfulong","thunderyujun","TAFjuejing","TAFlonghun"];
            for (let skill of skillslist) {
                if(!player.hasSkill(skill)) player.addSkill(skill);
            }
            player.addSkill('fangzhu');


            player.addSkill('fengyin');//直接获得封印
            player.tempDisSkills('watertaji',{ source : 'damageEnd' });//封印

            const skills = player.countSkills();
            const lists = player.getDisSkills();
            console.log('获取玩家当前玩家全部技能列表。',skills);
            console.log('获取玩家当前因封印类失效的技能列表。',lists);
            console.log('玩家',[player]);
            

            player.removeDisSkills(["thunderyulei", "thunderfulong","thunderyujun","TAFjuejing","TAFlonghun",'fangzhu']);
            const lists2 = player.getDisSkills();
            console.log('玩家解除对缚龙的技能的封印后，当前因封印类失效的技能列表',lists2);
            console.log('玩家',[player]);


        },
        "_priority": 0,
    },

};
export default TAF_ceshiSkills;
