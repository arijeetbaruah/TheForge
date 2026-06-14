export interface Member {
    Name: string;
    Tools: string;
    STR: number;
    DEX: number;
    INT: number;
    WIS: number;
    CHA: number;
}

// D&D 5e 2024 (5.5e) — Tool Proficiencies

// ── Artisan's Tools ──────────────────────────────────────────
export enum ArtisanTool {
    AlchemistsSupplies = "Alchemist's Supplies",
    BrewersSupplies = "Brewer's Supplies",
    CalligraphersSupplies = "Calligrapher's Supplies",
    CarpentersTools = "Carpenter's Tools",
    CartographersTools = "Cartographer's Tools",
    CobblerTools = "Cobbler's Tools",
    CooksUtensils = "Cook's Utensils",
    GlassblowersTools = "Glassblower's Tools",
    JewelersTools = "Jeweler's Tools",
    LeatherworkersTools = "Leatherworker's Tools",
    MasonsTools = "Mason's Tools",
    PaintersSupplies = "Painter's Supplies",
    PottersTools = "Potter's Tools",
    SmithsTools = "Smith's Tools",
    TinkersTools = "Tinker's Tools",
    WeaversTools = "Weaver's Tools",
    WoodcarversTools = "Woodcarver's Tools",
}

// ── Other Tools ───────────────────────────────────────────────
export enum OtherTool {
    DisguiseKit = "Disguise Kit",
    ForgeryKit = "Forgery Kit",
    HerbalismKit = "Herbalism Kit",
    NavigatorsTools = "Navigator's Tools",
    PoisonersKit = "Poisoner's Kit",
    ThievesTools = "Thieves' Tools",
}

// ── Gaming Sets ───────────────────────────────────────────────
export enum GamingSet {
    DiceSet = "Dice Set",
    DragonchessSet = "Dragonchess Set",
    PlayingCardSet = "Playing Card Set",
    ThreeDragonAnteSet = "Three-Dragon Ante Set",
}

// ── Musical Instruments ───────────────────────────────────────
export enum MusicalInstrument {
    Bagpipes = "Bagpipes",
    Drum = "Drum",
    Dulcimer = "Dulcimer",
    Flute = "Flute",
    Horn = "Horn",
    Lute = "Lute",
    Lyre = "Lyre",
    PanFlute = "Pan Flute",
    Shawm = "Shawm",
    Viol = "Viol",
}

// ── Union type (if you need a single type for all tools) ──────
export type ToolProficiency =
    | ArtisanTool
    | OtherTool
    | GamingSet
    | MusicalInstrument;