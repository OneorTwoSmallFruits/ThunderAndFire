import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
export async function precontent() {
    await import('../firstSettings/index.js');
    await import('../characters/index.js');
    await import('../cards/index.js');
    await import('../skinSetings/index.js');
    await import('../global/index.js');
    console.log('《银竹离火》lib.ThunderAndFire loaded',lib.ThunderAndFire);
}