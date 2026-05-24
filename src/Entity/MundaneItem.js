import category from "./Category.js";
import Currency from "./Currency.js";

class MundaneItem {
    constructor() {
        this.Category = category.weapon;
        this.itemName = "";
        this.price = new Currency(0);
    }
}

export default MundaneItem;