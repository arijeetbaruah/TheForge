import Category from "./Category.js";

const tier = Object.freeze({
    tier1: 'Tier1',
    tier2: 'Tier2',
    tier3: 'Tier3',
});

class Enchantment {
    constructor() {
        this.Category = Category.weapon;
        this.name     = "";
        this.tier     = tier.tier1;
    }
}

export { tier };
export default Enchantment;