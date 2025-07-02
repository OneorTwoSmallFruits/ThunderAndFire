import { lib, game, ui, get, ai, _status } from '../../noname.js';


import { arenaReady } from './ThunderAndFire/arenaReady/arenaReady.js';
import { content } from './ThunderAndFire/content/content.js';
import { prepare } from './ThunderAndFire/prepare/prepare.js';
import { precontent } from './ThunderAndFire/precontent/precontent.js';
import { config } from './ThunderAndFire/config/config.js';
import { help } from './ThunderAndFire/help/help.js';
import { extpackage } from './ThunderAndFire/extpackage/extpackage.js';

let extensionPackage = {
    name: "银竹离火",
    editable: false,
    arenaReady : arenaReady,
    content: content,
    prepare: prepare,
    precontent: precontent,
    config: config,
    help: help,
    package: extpackage,
    files: {},
};
export let type = 'extension';
export default extensionPackage;
