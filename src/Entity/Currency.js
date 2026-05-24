export const unit = Object.freeze({
    pp: 'PP',
    gp: 'GP',
    sp: 'SP',
    cp: 'CP',
});

class Currency {
    constructor(value, currencyUnit = unit.gp) {
        this.value = value;
        this.unit = currencyUnit;
    }
}

export default Currency;
