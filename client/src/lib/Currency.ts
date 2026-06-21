// ─── Types ───────────────────────────────────────────────────────────────────

export type Denomination = "cp" | "sp" | "ep" | "gp" | "pp";
export type CurrencyVector = [number, number, number, number, number];

export interface Currency {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const DENOMS: Denomination[] = ["cp", "sp", "ep", "gp", "pp"];

/** Value of each denomination in copper pieces */
export const RATES: CurrencyVector = [1, 10, 50, 100, 1000];

/**
 * 5×5 conversion matrix.
 * CONVERSION_MATRIX[i][j] = how many of denom[j] you get for 1 of denom[i]
 * e.g. CONVERSION_MATRIX[3][0] = 100  → 1 gp = 100 cp
 *      CONVERSION_MATRIX[0][3] = 0.01 → 1 cp = 0.01 gp
 */
export const CONVERSION_MATRIX: number[][] = RATES.map(from =>
    RATES.map(to => from / to)
);

// ─── Vector Helpers ───────────────────────────────────────────────────────────

export const toVector = (c: Currency): CurrencyVector =>
    DENOMS.map(d => c[d]) as CurrencyVector;

export const fromVector = (v: CurrencyVector): Currency =>
    Object.fromEntries(DENOMS.map((d, i) => [d, v[i]])) as Currency;

export const zeroCurrency = (): Currency =>
    ({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });

// ─── Core Operations ──────────────────────────────────────────────────────────

/**
 * Convert a currency vector to its total value in copper pieces.
 * Uses the rate vector as a dot product: total = vec · RATES
 */
export const toCp = (vec: CurrencyVector): number =>
    vec.reduce((sum, amount, i) => sum + amount * RATES[i], 0);

/**
 * Build a currency vector from a raw copper value.
 * Greedily assigns from highest denomination downward.
 */
export const fromCp = (total: number): CurrencyVector => {
    const result: CurrencyVector = [0, 0, 0, 0, 0];
    let remaining = Math.round(total);
    for (let i = RATES.length - 1; i >= 0; i--) {
        result[i] = Math.floor(remaining / RATES[i]);
        remaining %= RATES[i];
    }
    return result;
};

/**
 * Normalize a currency vector.
 * Collapses mixed denominations into the fewest coins possible.
 * e.g. [10, 0, 0, 0, 0] → [0, 1, 0, 0, 0]  (10 cp → 1 sp)
 */
export const normalize = (vec: CurrencyVector): CurrencyVector =>
    fromCp(toCp(vec));

/**
 * Add two currency vectors and normalize the result.
 * Implemented as element-wise sum → toCp → fromCp.
 */
export const add = (a: CurrencyVector, b: CurrencyVector): CurrencyVector =>
    normalize(a.map((v, i) => v + b[i]) as CurrencyVector);

/**
 * Subtract b from a. Returns un-normalized negative values if b > a.
 * Caller should check toCp(result) >= 0 for validity.
 */
export const subtract = (a: CurrencyVector, b: CurrencyVector): CurrencyVector =>
    normalize(a.map((v, i) => v - b[i]) as CurrencyVector);

/**
 * Multiply a currency vector by a scalar and normalize.
 * Useful for pricing (x3 copies) or merchant markups (x1.5).
 * Fractional remainders are floored during normalization.
 */
export const multiply = (vec: CurrencyVector, scalar: number): CurrencyVector =>
    normalize(vec.map(v => v * scalar) as CurrencyVector);

/**
 * Split a currency vector N ways.
 * Returns the per-share amount and the remainder that cannot be divided.
 */
export const split = (
    vec: CurrencyVector,
    n: number
): { share: CurrencyVector; remainder: CurrencyVector } => {
    const totalCp = toCp(vec);
    const shareCp = Math.floor(totalCp / n);
    const remainderCp = totalCp % n;
    return {
        share: fromCp(shareCp),
        remainder: fromCp(remainderCp),
    };
};

// ─── Matrix Operations ────────────────────────────────────────────────────────

/**
 * Convert the entire wallet into a single target denomination.
 * Uses the conversion matrix row as a dot product.
 * e.g. convertToDenom(vec, 3) → total value expressed in gp
 */
export const convertToDenom = (
    vec: CurrencyVector,
    target: Denomination
): number => {
    const targetIdx = DENOMS.indexOf(target);
    return vec.reduce(
        (sum, amount, i) => sum + amount * CONVERSION_MATRIX[i][targetIdx],
        0
    );
};

/**
 * Exchange a specific amount of one denomination into another.
 * Returns the converted amount (may be fractional).
 * e.g. exchange(10, "sp", "gp") → 1
 */
export const exchange = (
    amount: number,
    from: Denomination,
    to: Denomination
): number => {
    const fromIdx = DENOMS.indexOf(from);
    const toIdx = DENOMS.indexOf(to);
    return amount * CONVERSION_MATRIX[fromIdx][toIdx];
};

// ─── Currency Class (Fluent API) ──────────────────────────────────────────────

export class CurrencyAmount {
    private readonly vec: CurrencyVector;

    constructor(currency: Partial<Currency> = {}) {
        this.vec = DENOMS.map(d => currency[d] ?? 0) as CurrencyVector;
    }

    static fromCp(total: number): CurrencyAmount {
        return new CurrencyAmount(fromVector(fromCp(total)));
    }

    static fromVector(vec: CurrencyVector): CurrencyAmount {
        return new CurrencyAmount(fromVector(vec));
    }

    add(other: CurrencyAmount): CurrencyAmount {
        return CurrencyAmount.fromVector(add(this.vec, other.vec));
    }

    subtract(other: CurrencyAmount): CurrencyAmount {
        return CurrencyAmount.fromVector(subtract(this.vec, other.vec));
    }

    multiply(scalar: number): CurrencyAmount {
        return CurrencyAmount.fromVector(multiply(this.vec, scalar));
    }

    normalize(): CurrencyAmount {
        return CurrencyAmount.fromVector(normalize(this.vec));
    }

    split(n: number): { share: CurrencyAmount; remainder: CurrencyAmount } {
        const { share, remainder } = split(this.vec, n);
        return {
            share: CurrencyAmount.fromVector(share),
            remainder: CurrencyAmount.fromVector(remainder),
        };
    }

    convertToDenom(target: Denomination): number {
        return convertToDenom(this.vec, target);
    }

    toCp(): number {
        return toCp(this.vec);
    }

    toVector(): CurrencyVector {
        return [...this.vec] as CurrencyVector;
    }

    toCurrency(): Currency {
        return fromVector(this.vec);
    }

    isNegative(): boolean {
        return toCp(this.vec) < 0;
    }

    toString(): string {
        const parts = DENOMS
            .map((d, i) => (this.vec[i] !== 0 ? `${this.vec[i]}${d}` : null))
            .filter(Boolean);
        return parts.length > 0 ? parts.join(" ") : "0cp";
    }
}
