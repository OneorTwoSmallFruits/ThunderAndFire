import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
import cards from "./cards.js";
import skills from "./skills.js";
import translates from "./translates.js";
game.import("card", function () {
	const ThunderAndFire_cards = {
		name: "ThunderAndFire_cards",
		connect: true,
		card: { ...cards },
		skill: { ...skills },
        list: [
            ['spade', 3, 'TAF_leishan'],
            ['club', 5, 'TAF_leishan'],
            ['spade', 7, 'TAF_leishan'],
            ['spade', 13, 'TAF_daozhuanqiankun'],
            ['spade', 6, 'TAF_lunhuizhiyao'],
        ],
        translate: {...translates},
	};
	lib.translate['ThunderAndFire_cards_card_config'] = "<font color= #0088CC>银竹</font><font color= #EE9A00>丨</font><font color= #FF2400>离火</font>";
	lib.config.characters.add("ThunderAndFire_cards");
	return ThunderAndFire_cards;
});