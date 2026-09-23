/* =========================================================================
   BEN QUADINAROS CLICKER
   =========================================================================

   HOW THIS FILE IS ORGANISED (top to bottom):
     1. CONFIG      - numbers and names you tweak to balance the game
     2. HELPERS     - small reusable tools (DOM builder, save file, sound)
     3. WIDGETS     - the classes that draw and manage each piece of the UI
     4. GAME        - the object that owns all state and ties it together
     5. BOOT        - the two lines that actually start everything

   Every visible, changing part of the page is created by JavaScript.
   index.html only contains a few empty <div>s for this code to fill in.

   To add a new upgrade, you only edit the GENERATORS list below.
   ========================================================================= */


/* =========================================================================
   1. CONFIG
   ========================================================================= */

// `const` = a name that can never be reassigned. Closest Python equivalent
// is a CONSTANT by convention, except JS actually enforces it.
// Note: `const` only locks the NAME. The contents of an object or array
// with a const name can still be changed. It is not "frozen".
const ASSETS = "assets/";   // folder prefix, so paths are written once

// An object literal: `{ key: value }`. This is JS's version of a dict.
// Difference from Python: keys are written WITHOUT quotes, and you read
// them with a dot (CONFIG.tickMs) instead of brackets (CONFIG["tickMs"]).
const CONFIG = {
    baseClickPower: 1,             // clicks per click BEFORE any upgrades
    tickMs: 1000,                  // milliseconds between passive-income payouts
    clickSound: ASSETS + "mixkit-mouse-click-close-1113.wav",   // "+" joins strings
    music: ASSETS + "backgroundmusic.wav",

    // A nested object. `CONFIG.mounts.shop` reads "shop-slot".
    // These are the id names of the empty <div>s in index.html.
    mounts: {
        clock: "clock-slot",           // where the wall clock goes
        readouts: "readout-slot",      // where "Total Clicks" / "Rate" go
        stage: "stage-slot",           // where the big Ben image goes
        clickShop: "click-shop-slot",  // where CLICK POWER upgrades go
        shop: "shop-slot",             // where GENERATORS (passive income) go
        skinShop: "skin-shop-slot",     // where the skin buttons go
        controls: "controls-slot",     // where the reset button goes
        minigames: "minigames-slot",   // where the minigame buttons go
    },
};

/*
 * GENERATORS: the list of things you can buy.
 *
 *   rate  = flat clicks-per-second added for each one you own
 *   boost = extra fraction added to your TOTAL rate per one owned
 *           (0.2 means "+20% each")
 *
 * Something can have both. Add an entry here and a working button appears
 * on the page automatically - you never touch index.html.
 */
// Square brackets `[ ]` make an array. Same as a Python list.
const GENERATORS = [
    {   // ---- first upgrade ----
        key: "rat",                              // short internal name, no spaces
        name: "Ratts Tyerell",                   // the text shown on the button
        icon: ASSETS + "rattstyerell.png",       // the little picture on the button
        baseCost: 20,                            // what it costs before any are bought
        costGrowth: 1.2,                         // cost multiplies by this per purchase
        rate: 1,                                 // each one earns 1 click/sec
        boost: 0,                                // and gives no percentage bonus
        // Which localStorage keys hold this upgrade's saved numbers.
        // These exact strings match the old code so old saves still load.
        storage: { owned: "rats-owned", cost: "rat-cost" },
    },
    {   // ---- second upgrade ----
        key: "bt310quadra",
        name: "BT-310 Quadra",
        icon: ASSETS + "bt310_quadra.png",
        baseCost: 1500,
        costGrowth: 1.2,
        rate: 0,                                 // earns nothing by itself...
        boost: 0.2,                              // ...but makes everything else +20%
        storage: { owned: "bt310quadras-owned", cost: "bt310quadra-cost" },
    },
    { // --- third upgrade ----
        key: "mawhonic",
        name: "Mawhonic",
        icon: ASSETS + "mawhonic.jpeg",
        baseCost: 10000,
        costGrowth: 1.2,
        rate: 10,                                // earns 10 clicks/sec
        boost: 0,                                // no percentage bonus
        storage: { owned: "mawhonics-owned", cost: "mawhonic-cost" },
    },
    { // --- fourth upgrade ----
        key:"mars_guo",
        name:"Mars Guo",
        icon: ASSETS + "mars_guo.png",
        baseCost: 25000,
        costGrowth: 1.2,
        rate: 30,
        boost:0.05,
        storage: { owned: "mars_guo-owned", cost: "mars_guo-cost" },   
    },
    { // --- fifth upgrade ----
        key:"sebulba",
        name:"Sebulba",
        icon: ASSETS + "sebulba.png",
        baseCost: 100000,
        costGrowth: 1.2,
        rate: 100,
        boost:0,
        storage: { owned: "sebulba-owned", cost: "sebulba-cost" },   
    },
    { // --- sixth upgrade ----
        key:"aldar_beedo",
        name:"Aldar Beedo",
        icon: ASSETS + "aldar_beedo.png",
        baseCost: 500000,
        costGrowth: 1.2,
        rate: 500,
        boost:0.1,
        storage: { owned: "aldar_beedo-owned", cost: "aldar_beedo-cost" },   
    }
];

/*
 * CLICK_UPGRADES: things you buy to make each manual click worth more.
 *
 * This is the exact same shape as GENERATORS above, but the two numbers
 * mean something different:
 *
 *   power      = flat clicks added to EVERY click, per one owned
 *   multiplier = extra fraction added to your TOTAL click power, per one
 *                owned (0.25 means "+25% each")
 *
 * GENERATORS earn while you do nothing. CLICK_UPGRADES only pay off when
 * you actually click. Same as GENERATORS, adding an entry here is all you
 * need to do - the button builds itself.
 */
const CLICK_UPGRADES = [
    {
        key: "gasgano",
        name: "Gasgano",
        icon: ASSETS + "gasgano.jpeg",
        baseCost: 50,
        costGrowth: 1.25,
        power: 1,                    // +1 per click, each
        multiplier: 0,               // no percentage bonus
        storage: { owned: "gasgano-owned", cost: "gasgano-cost" },
    },
    {
        key: "wansandage",
        name: "Wan Sandage",
        icon: ASSETS + "wansandage.png",
        baseCost: 2500,
        costGrowth: 1.4,
        power: 0,                    // adds nothing on its own...
        multiplier: 0.25,            // ...but makes every click 25% stronger
        storage: { owned: "wansandage-owned", cost: "wansandage-cost" },
    },
    {
        key:"ebe_e_endocott",
        name:" Ebe E. Endocott",
        icon: ASSETS + "ebe_e_endocott.jpg",
        baseCost: 5000,
        costGrowth: 1.4,
        power: 5,
        multiplier: 0,
        storage: { owned: "ebe_e_endocott-owned", cost: "ebe_e_endocott-cost" },
    },
    {
        key:"dud_bolt",
        name:"Dud Bolt",
        icon: ASSETS + "Dud_Bolt.png",
        baseCost: 10000,
        costGrowth: 1.4,
        power: 15,
        multiplier: 0.05,
        storage: { owned: "dud_bolt-owned", cost: "dud_bolt-cost" },
    }
];

// Future minigame buttons can be added here as objects in the same pattern.
// Starting empty means the section exists and is ready without breaking the page.
const MINIGAME_BUTTONS = [
    {
        key: "ben_pong",
        name: "Ben Pong",
        icon: ASSETS + "ben.png",
        cost: 10000,
    },
    {
        key: "ben_brick_breaker",
        name: "Ben Brick Breaker",
        icon: ASSETS + "ben.png",
        cost: 25000,
    },
    {
        key: "ben_quadinaros_podracing",
        name: "Ben Quadinaros Podracing",
        icon: ASSETS + "ben.png",
        cost: 50000,
    }
];

// The two skins the big Ben image can wear.
// This is an object used as a lookup table: SKINS["ben"] gives the first one.
// `rateMultiplier` multiplies your PASSIVE INCOME while that skin is worn.
// PolyBen has four arms, so his pod runs harder - which turns the skin
// toggle from pure decoration into a real choice.
//
// 1 means "no change" (not 0 - multiplying by zero would wipe your income
// out entirely). 1.5 means "one and a half times as fast", i.e. +50%.
const SKINS = {
    ben: { img: ASSETS + "ben.png", label: "Ben", rateMultiplier: 1 },
    polyben: { img: ASSETS + "benquad.png", label: "PolyBen", rateMultiplier: 1.5 },
    ben_figure: { img: ASSETS + "ben_figure.png", label: "Ben Figure", rateMultiplier: 2 },
    legoben: { img: ASSETS + "lego_ben.png", label: "Lego Ben", rateMultiplier: 2.5 },
};

// Builds the little " (1.5x rate)" note shown on the skin button.
// Returns an empty string for a skin with no bonus, so nothing is shown.
function skinRateText(skinKey) {
    const multiplier = SKINS[skinKey].rateMultiplier;
    // `!==` is "not equal". A skin with a multiplier of exactly 1 changes
    // nothing, so there is no point advertising it.
    return multiplier !== 1 ? ` (${multiplier}x rate)` : "";
}


/**
 * Safety check, run once at startup.
 *
 * Every upgrade's `key` becomes an HTML id, and its `storage` names become
 * save-file keys. If two upgrades share either one, you get a duplicate id
 * (invalid HTML) or, much worse, two upgrades silently overwriting each
 * other's saved numbers.
 *
 * That is a nasty bug to track down, so this turns it into a loud error at
 * startup instead. It costs nothing and only ever runs once.
 */
function checkForDuplicateKeys() {
    // Combine both lists into one, since a clash ACROSS the two lists is
    // just as broken as a clash within one.
    const all = [...GENERATORS, ...CLICK_UPGRADES];

    // A Set stores unique values and tells you if it has seen one before.
    // Same idea as a Python set.
    const seen = new Set();

    for (const def of all) {
        // Check all three names this upgrade claims. The "key:" / "owned:"
        // prefixes keep the three kinds separate, so a `key` named "rat"
        // does not falsely clash with a storage key named "rat".
        const claimed = [
            `key:${def.key}`,
            `owned:${def.storage.owned}`,
            `cost:${def.storage.cost}`,
        ];

        for (const name of claimed) {
            if (seen.has(name)) {
                throw new Error(
                    `Duplicate upgrade name "${name}" on "${def.name}". ` +
                    `Every key and storage name must be unique across ` +
                    `GENERATORS and CLICK_UPGRADES.`
                );
            }
            seen.add(name);
        }
    }
}


/* =========================================================================
   2. HELPERS
   ========================================================================= */

/**
 * el() builds one HTML element in memory and hands it back.
 *
 * Example:
 *     el("button", { class: "shop-button" }, [icon, label])
 * produces:
 *     <button class="shop-button"><img...><span...></span></button>
 *
 * `tag`      - the element type, like "div" or "button"
 * `props`    - attributes to set, as an object
 * `children` - things to put inside it
 *
 * `props = {}` and `children = []` are DEFAULT VALUES, exactly like
 * Python's `def el(tag, props=None, children=None)`. If the caller leaves
 * them out, these are used instead.
 */
function el(tag, props = {}, children = []) {
    // document.createElement makes the element but does NOT put it on the
    // page yet. It exists only in memory until something appends it.
    const node = document.createElement(tag);

    // Object.entries(obj) turns {a: 1} into [["a", 1]] - it is JS's
    // version of Python's dict.items().
    // `for (const x of list)` is JS's version of `for x in list`.
    // The `[key, value]` part unpacks each pair, like Python's
    // `for key, value in d.items()`.
    for (const [key, value] of Object.entries(props)) {
        // `===` means "equal AND the same type". Always prefer it over `==`,
        // which does surprising type conversions ("1" == 1 is true!).
        if (key === "class") node.className = value;         // "class" is a reserved
                                                             // word, so the DOM calls
                                                             // this property className
        else if (key === "text") node.textContent = value;   // our shorthand for
                                                             // "put this text inside"
        else if (key.includes("-")) node.setAttribute(key, value);  // e.g. data-foo
        else node[key] = value;                              // everything else: id,
                                                             // src, alt, etc.
    }

    // [].concat(children) means "make sure this is an array".
    // If children is already an array it stays as-is; if it is a single
    // item it gets wrapped into a one-item array. This lets callers pass
    // either one child or a list of them.
    for (const child of [].concat(children)) {
        node.appendChild(
            // `condition ? a : b` is a TERNARY. It is JS's version of
            // Python's `a if condition else b`.
            // If the child is a plain string, turn it into a text node.
            // Doing it this way means text can never be treated as HTML,
            // which is what keeps this safe.
            typeof child === "string" ? document.createTextNode(child) : child
        );
    }

    return node;   // hand the finished element back to whoever asked
}

/**
 * Save: a small wrapper around localStorage (the browser's save file).
 *
 * localStorage only ever stores STRINGS. Read the number 5 back out and
 * you get the text "5". That caused real bugs in the old version, so every
 * read goes through one of these methods to convert it properly.
 *
 * Every method here is `static`, which means you call it on the class
 * itself - Save.number(...) - and never create one with `new Save()`.
 * It is the same idea as Python's @staticmethod. In Python you would
 * probably just use a module of plain functions.
 */
class Save {
    // Read a key and guarantee you get a real number back.
    static number(key, fallback) {
        const raw = localStorage.getItem(key);     // returns null if never saved
        if (raw === null) return fallback;         // nothing saved -> use the default
        const value = Number(raw);                 // convert the text into a number
        // Number("abc") gives NaN ("not a number"), so check before trusting it.
        return Number.isFinite(value) ? value : fallback;
    }

    // Read a key as a true/false value.
    // This is the fix for the old PolyBen bug: localStorage handed back the
    // TEXT "false", and any non-empty string counts as true in JS, so the
    // skin unlocked itself on every reload.
    static bool(key, fallback = false) {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw === "true";   // only the exact text
                                                           // "true" means true
    }

    // Read a key as plain text.
    static text(key, fallback) {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw;
    }

    // Write a value. It gets converted to text automatically on the way in.
    static set(key, value) {
        localStorage.setItem(key, value);
    }
}

/**
 * Sound: one audio file you can play over and over.
 */
class Sound {
    // `constructor` is this class's __init__.
    // `{ loop = false } = {}` is destructuring with a default. It means
    // "accept an options object; if it has a `loop` key use it, otherwise
    // false; and if no object is passed at all, use an empty one".
    // It is JS's way of writing Python's `def __init__(self, src, loop=False)`.
    constructor(src, { loop = false } = {}) {
        // `this` is JS's `self`. The big difference: you never write it as
        // a parameter, it is just available inside methods.
        this.audio = new Audio(src);   // `new` creates an instance, like Audio(src)
        this.audio.loop = loop;        // true = restart forever (for music)
    }

    play() {
        // Rewind to the start first, so rapid clicks retrigger the sound
        // instead of being ignored because it is already playing.
        this.audio.currentTime = 0;

        // .play() returns a PROMISE - a value that arrives later, similar
        // to a Python awaitable. If it fails, .catch() runs instead.
        // Browsers refuse to play audio until the user has clicked
        // something, so an early failure here is normal and we ignore it.
        this.audio.play().catch(() => {
            // `() => {}` is an ARROW FUNCTION: a short anonymous function,
            // like Python's lambda but it can hold multiple statements.
            // Empty body = do nothing, swallow the error.
        });
    }
}


/* =========================================================================
   3. WIDGETS
   ========================================================================= */

/**
 * Widget: the base class every visible piece of the game inherits from.
 *
 * The contract is always the same three steps:
 *
 *   build()  -> create your HTML, and keep references to the bits that change
 *   mount()  -> attach that HTML to the page  (written once here, inherited)
 *   render() -> copy the current state into the HTML you built
 *
 * build() runs ONCE. render() runs constantly. Keeping them separate is
 * what makes it cheap to redraw the whole game after every click.
 */
class Widget {
    constructor(game) {
        this.game = game;        // a link back to the main Game object
        this.element = null;     // filled in by mount(). `null` means
                                 // "deliberately empty", like Python's None
    }

    // Subclasses are expected to replace this method with their own.
    // If one forgets, this throws a clear error naming the guilty class
    // instead of failing mysteriously later.
    build() {
        // Backticks make a TEMPLATE LITERAL - JS's f-string. The `${...}`
        // parts get substituted in.
        // `this.constructor.name` gives the class's own name as text.
        throw new Error(`${this.constructor.name} must implement build()`);
    }

    // Attach this widget to a parent element on the page.
    mount(parent) {
        this.element = this.build();   // ask the subclass for its HTML
        parent.appendChild(this.element);  // this is the moment it becomes visible
        this.render();                 // fill in the starting values
        return this;                   // returning `this` lets you chain calls
    }

    // Does nothing by default; subclasses that display changing values
    // replace it. Widgets with nothing to update just inherit this.
    render() {}
}

/**
 * GameButton: a Widget you can click.
 *
 * `extends` means "inherits from", exactly like Python's `class B(A):`.
 * Subclasses only need to write build() and onClick() - the click plumbing
 * and the sound effect are handled once, here.
 */
class GameButton extends Widget {
    constructor(game, { sound = true } = {}) {
        // super() calls the PARENT's constructor - Python's
        // super().__init__(game).
        // IMPORTANT JS RULE: in a subclass you must call super() BEFORE
        // you touch `this`. Unlike Python, `this` does not exist until
        // super() has run, and using it early is a hard error.
        super(game);
        this.playsSound = sound;
    }

    mount(parent) {
        // Run the parent's mount() first (build + attach + first render),
        // then add the click behaviour on top.
        super.mount(parent);

        // addEventListener says "when this happens, run this function".
        // The function is not called now - it is stored and called later,
        // every time the button is clicked.
        //
        // The arrow function `() => {...}` matters enormously here.
        // A normal function would have `this` pointing at the HTML button
        // element when clicked. An arrow function has no `this` of its own,
        // so it keeps the one from out here: the widget object. This is
        // the JS equivalent of Python's bound methods.
        this.element.addEventListener("click", () => {
            if (this.playsSound) this.game.clickSound.play();   // click noise
            this.onClick();          // whatever this specific button does
            this.game.refresh();     // redraw every number on the page
        });

        return this;
    }

    // Default behaviour: nothing. Subclasses replace this.
    onClick() {}
}

/**
 * Readout: one "Label: value" line in the header, e.g. "Total Clicks: 42".
 */
class Readout extends Widget {
    // `getValue` is a FUNCTION passed in as an argument. Functions are
    // ordinary values in JS, same as in Python - you can store and pass them.
    // Storing the function (rather than the number) means this Readout
    // always fetches a fresh value instead of a stale copy.
    constructor(game, label, getValue) {
        super(game);
        this.label = label;         // the fixed text, e.g. "Total Clicks"
        this.getValue = getValue;   // a function that returns the current number
    }

    build() {
        // Save a reference to this empty span so render() can write into it.
        this.value = el("span");

        // An <h1> containing the label text followed by that span.
        return el("h1", { class: "readout" }, [`${this.label}: `, this.value]);
    }

    render() {
        // Call the stored function to get the number right now.
        // textContent replaces whatever text is inside the element.
        this.value.textContent = this.getValue();
    }
}

/**
 * ClickTarget: the big Ben image in the middle. Click it to earn clicks.
 */
class ClickTarget extends GameButton {
    constructor(game) {
        super(game);
        // Which skin is being worn. Loaded from the save, defaulting to "ben".
        this.skin = Save.text("skin", "ben");
    }

    build() {
        // No src yet - render() sets it, because it depends on the skin.
        return el("img", { class: "ben", alt: "Ben" });
    }

    onClick() {
        this.game.addClicks(this.game.clickPower);   // usually +1
    }

    // Switch skins and remember the choice.
    setSkin(skinKey) {
        this.skin = skinKey;
        Save.set("skin", skinKey);   // write to the save file
        this.render();               // redraw immediately
    }

    render() {
        // SKINS[this.skin] looks the skin up in the table at the top.
        // Square brackets are used here (not a dot) because the key is
        // held in a variable - same rule as Python dictionaries.
        this.element.src = SKINS[this.skin].img;
    }
}

/**
 * Upgrade: the shared behaviour of ANYTHING you buy repeatedly.
 *
 * Both kinds of upgrade in this game work identically when it comes to
 * buying: check you can afford it, take the clicks, add one to the count,
 * raise the price, save. The only thing that differs is WHAT the purchase
 * actually does for you.
 *
 * So all of that shared work lives here once, and the two subclasses below
 * add nothing but their own contribution getters. This is the main reason
 * to use inheritance: write the common part a single time.
 *
 * Nothing ever creates an Upgrade directly - only Generator and
 * ClickUpgrade, which extend it. Python would call this a base class.
 */
class Upgrade extends GameButton {
    // `def` is one entry from GENERATORS or CLICK_UPGRADES.
    constructor(game, def) {
        super(game);

        // The fields every upgrade has, whatever it does.
        this.key = def.key;
        this.name = def.name;
        this.icon = def.icon;
        this.costGrowth = def.costGrowth;
        this.storage = def.storage;

        // Load progress from the save file, falling back to a fresh start.
        this.owned = Save.number(this.storage.owned, 0);
        this.cost = Save.number(this.storage.cost, def.baseCost);
    }

    build() {
        // Two empty spans kept as properties so render() can update them
        // without ever searching the page for them.
        this.ownedLabel = el("span");
        this.costLabel = el("span");

        return el("button", { class: "shop-button", id: `${this.key}_button` }, [
            el("img", { class: "icon", src: this.icon, alt: this.name }),
            // This span's children are a mix of fixed text and live spans.
            el("span", {}, [
                `${this.name}: `, this.ownedLabel,
                " Cost: ", this.costLabel,
            ]),
        ]);
    }

    onClick() {
        // spend() returns true if you could afford it, false if not.
        // `!` means "not". So: if the purchase failed, stop here.
        // `return` with no value exits the method early, like a bare
        // `return` in Python.
        if (!this.game.spend(this.cost)) return;

        this.owned += 1;                                      // one more owned
        this.cost = Math.floor(this.cost * this.costGrowth);  // price goes up
                                                              // Math.floor rounds
                                                              // down to a whole number
        this.save();                                          // write to the save file
    }

    save() {
        Save.set(this.storage.owned, this.owned);
        Save.set(this.storage.cost, this.cost);
    }

    render() {
        this.ownedLabel.textContent = this.owned;   // update "owned" number
        this.costLabel.textContent = this.cost;     // update "cost" number

        // classList.toggle(name, condition) adds the CSS class when the
        // condition is true and removes it when false. The styling itself
        // lives in styles.css - this line only decides whether it applies.
        this.element.classList.toggle("affordable", this.game.clicks >= this.cost);
    }
}

/**
 * Generator: an upgrade that earns you clicks automatically, every second.
 * One of these is created for every entry in the GENERATORS list.
 *
 * Notice how short this class is. Everything about buying it, drawing it
 * and saving it was inherited from Upgrade. All it adds is "here is what
 * I contribute to your income".
 */
class Generator extends Upgrade {
    constructor(game, def) {
        super(game, def);       // let Upgrade do all the shared setup first
        this.rate = def.rate;   // then keep the two numbers only WE care about
        this.boost = def.boost;
    }

    // `get` makes a GETTER: a method you read like a plain property.
    // You write `generator.flatRate`, with NO parentheses.
    // This is exactly Python's @property.
    get flatRate() {
        return this.rate * this.owned;   // flat clicks/sec from this upgrade
    }

    get rateBoost() {
        return this.boost * this.owned;  // percentage bonus from this upgrade
    }
}

/**
 * ClickUpgrade: an upgrade that makes each manual click worth more.
 * One of these is created for every entry in the CLICK_UPGRADES list.
 *
 * Structurally this is the mirror image of Generator - same parent, same
 * amount of new code, just a different pair of getters. Game.clickPower
 * adds these up the same way Game.rate adds up the generators.
 */
class ClickUpgrade extends Upgrade {
    constructor(game, def) {
        super(game, def);
        this.power = def.power;            // flat clicks added per click
        this.multiplier = def.multiplier;  // percentage added to click power
    }

    get flatPower() {
        return this.power * this.owned;
    }

    get powerMultiplier() {
        return this.multiplier * this.owned;
    }
}

/**
 * SkinButton: costs clicks once to unlock a skin, then toggles between
 * that skin and the normal one for free.
 */
class SkinButton extends GameButton {
    constructor(game, { unlockCost, skinKey, storageKey }) {
        // The `{ unlockCost, skinKey, storageKey }` in the parameter list
        // is DESTRUCTURING: it pulls those three keys out of the object
        // that gets passed in, so you can use them as plain variables.
        super(game);
        this.unlockCost = unlockCost;              // one-time price
        this.skinKey = skinKey;                    // which skin it unlocks
        this.storageKey = storageKey;              // save-file key for "unlocked"
        this.unlocked = Save.bool(storageKey, false);   // .bool, not .text - see
                                                        // the note in Save above
    }

    build() {
        // Keep references to both the icon and the label, since both change.
        this.icon = el("img", { class: "icon", alt: SKINS[this.skinKey].label });
        this.label = el("span");

        return el("button", { class: "shop-button", id: `${this.skinKey}_button` }, [
            this.icon,
            this.label,
        ]);
    }

    onClick() {
        // CASE 1: not unlocked yet - try to buy it.
        if (!this.unlocked) {
            if (!this.game.spend(this.unlockCost)) return;   // can't afford it
            this.unlocked = true;
            Save.set(this.storageKey, true);
            return;   // stop here, so this same click does not also toggle
        }

        // CASE 2: already unlocked - swap to whichever skin is not showing.
        const target = this.game.benButton.skin === "ben" ? this.skinKey : "ben";
        this.game.benButton.setSkin(target);
    }

    render() {
        // While locked, show the price.
        if (!this.unlocked) {
            this.label.textContent =
                `Unlock ${SKINS[this.skinKey].label}` +
                `${skinRateText(this.skinKey)} - Cost: ${this.unlockCost}`;
            this.icon.src = SKINS[this.skinKey].img;
            this.element.classList.toggle(
                "affordable", this.game.clicks >= this.unlockCost
            );
            return;   // done - skip the unlocked case below
        }

        // Once unlocked, show the skin you would switch TO, not the one
        // you are currently wearing.
        const other = this.game.benButton.skin === "ben" ? this.skinKey : "ben";
        // Includes the bonus, so you can see what the swap is worth.
        this.label.textContent =
            `Switch to ${SKINS[other].label}${skinRateText(other)}`;
        this.icon.src = SKINS[other].img;
        this.element.classList.add("affordable");   // always usable now, so
                                                    // never show it dimmed
    }
}

/**
 * MinigameButton: a generic shop button for the future Minigames section.
 * Named this way so new entries can be added by extending the same pattern
 * used by the upgrade and skin buttons without duplicating the DOM logic.
 */
class MinigameButton extends GameButton {
    constructor(game, def = {}) {
        super(game);
        this.key = def.key || "minigame";
        this.name = def.name || "Minigame";
        this.icon = def.icon || "";
        this.cost = def.baseCost || 0;
    }

    build() {
        this.iconNode = el("img", {
            class: "icon",
            src: this.icon,
            alt: this.name,
        });
        this.label = el("span", { text: this.name });

        return el("button", { class: "shop-button", id: `${this.key}_button` }, [
            this.iconNode,
            this.label,
        ]);
    }

    onClick() {
        // Reserved for future minigame logic; no-op for now.
    }

    render() {
        this.element.classList.toggle("affordable", this.game.clicks >= this.cost);
    }
}

/**
 * ResetButton: sets your clicks back to zero. Upgrades are kept.
 */
class ResetButton extends GameButton {
    build() {
        // `text:` is the el() shorthand for "put this text inside".
        return el("button", { class: "reset", id: "reset-clicks", text: "Reset" });
    }

    onClick() {
        this.game.setClicks(0);
    }
    // No render() needed - the button's text never changes, so it just
    // inherits the empty one from Widget.
}

/**
 * Clock: the running wall clock at the top of the page.
 */
class Clock extends Widget {
    build() {
        return el("div", { class: "clock", id: "clock" });
    }

    mount(parent) {
        super.mount(parent);   // build + attach + draw the time once

        // setInterval(fn, ms) runs a function over and over forever, with
        // that many milliseconds between runs. Here: redraw every second.
        // Arrow function again, so `this` stays the Clock.
        setInterval(() => this.render(), 1000);

        return this;
    }

    render() {
        const now = new Date();   // current date and time, right now

        // A tiny helper function stored in a variable.
        // An arrow function with no braces returns its expression directly,
        // so this is "take n, return it as text padded to 2 characters".
        // padStart(2, "0") turns 7 into "07". Python: f"{n:02d}".
        const pad = (n) => String(n).padStart(2, "0");

        // getHours/getMinutes/getSeconds read the parts off the date.
        this.element.textContent =
            `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
}

/**
 * MusicPlayer: loops the background track.
 * Not a Widget - it has no visible HTML at all.
 */
class MusicPlayer {
    constructor(src) {
        this.track = new Sound(src, { loop: true });

        // Browsers block audio until the user interacts with the page, so
        // we wait for the first click or keypress and start the music then.
        const start = () => this.track.play();

        // `{ once: true }` makes the browser remove the listener
        // automatically after it fires a single time.
        // `document` means the whole page, so a click anywhere counts.
        document.addEventListener("click", start, { once: true });
        document.addEventListener("keydown", start, { once: true });
    }
}


/* =========================================================================
   4. GAME
   ========================================================================= */

/**
 * Game: owns all the state (your clicks, your upgrades) and the main loop.
 * Everything else holds a reference back to this one object.
 */
class Game {
    constructor() {
        // NOTE: there is no `this.clickPower = ...` here any more.
        // Click power is now a GETTER further down, recalculated from your
        // upgrades and current skin every time it is read.
        this.clickSound = new Sound(CONFIG.clickSound);
        this.clicks = Save.number("totalClicks", 0);   // your score, from the save

        // --- create the widgets (this does NOT draw anything yet) ---

        this.benButton = new ClickTarget(this);   // `this` = pass the game itself
                                                  // in, so widgets can reach it

        // .map() makes a NEW array by running a function on every item.
        // It is Python's [Generator(self, d) for d in GENERATORS].
        this.generators = GENERATORS.map((def) => new Generator(this, def));

        // Exactly the same pattern for the click-power upgrades.
        this.clickUpgrades = CLICK_UPGRADES.map(
            (def) => new ClickUpgrade(this, def)
        );

        this.skinButton = new SkinButton(this, {
            unlockCost: 1000,
            skinKey: "polyben",
            storageKey: "polyben_unlocked",
        });
        this.figureSkinButton = new SkinButton(this, {
            unlockCost: 10000,
            skinKey: "ben_figure",
            storageKey: "ben_figure_unlocked",
        });
        this.legoSkinButton = new SkinButton(this, {
            unlockCost: 100000,
            skinKey: "legoben",
            storageKey: "legoben_unlocked",
        });
        this.minigameButtons = MINIGAME_BUTTONS.map(
            (def) => new MinigameButton(this, def)
        );

        this.clock = new Clock(this);

        this.readouts = [
            // Each Readout gets a function that fetches its current value.
            // `() => this.clicks` means "when asked, look up clicks NOW".
            new Readout(this, "Total Clicks", () => this.clicks),
            new Readout(this, "Per Click", () => this.clickPower),
            new Readout(this, "Rate", () => this.rate),
        ];

        // One list of everything that needs redrawing when state changes.
        // `...` is the SPREAD operator: it unpacks an array's items into
        // this one, exactly like Python's `[a, *generators, b]`.
        this.widgets = [
            this.benButton,
            ...this.generators,     // unpacked, so we get a flat list
            ...this.clickUpgrades,  // same again for the click upgrades
            this.skinButton,
            this.figureSkinButton,
            this.legoSkinButton,
            ...this.minigameButtons,
            ...this.readouts,
        ];
    }

    // Find one of the empty <div>s in index.html by name.
    slot(name) {
        const node = document.getElementById(CONFIG.mounts[name]);

        // Fail loudly with a useful message. Without this check a typo
        // gives you `null` and a confusing crash somewhere else later.
        if (!node) throw new Error(`Missing mount point: #${CONFIG.mounts[name]}`);

        return node;
    }

    // Build the whole page. The order of these lines is the order things
    // appear on screen.
    mount() {
        this.clock.mount(this.slot("clock"));

        // .forEach() runs a function once per item. Like a plain Python
        // `for` loop, but it does not build a new list the way .map() does.
        this.readouts.forEach((readout) => readout.mount(this.slot("readouts")));

        this.benButton.mount(this.slot("stage"));

        // Click-power upgrades go in their own section, above the
        // generators.
        const clickShop = this.slot("clickShop");
        this.clickUpgrades.forEach((upgrade) => upgrade.mount(clickShop));

        // The skin button sits with the generators, because PolyBen
        // multiplies your passive income rather than your click power.
        const shop = this.slot("shop");   // looked up once, reused below
        this.generators.forEach((generator) => generator.mount(shop));
        const skinShop = this.slot("skinShop");
        this.skinButton.mount(skinShop);
        this.figureSkinButton.mount(skinShop);
        this.legoSkinButton.mount(skinShop);

        const minigameSlot = this.slot("minigames");
        this.minigameButtons.forEach((button) => button.mount(minigameSlot));

        // Created and mounted in one line - nothing needs to refer to the
        // reset button again afterwards, so it does not need a name.
        new ResetButton(this).mount(this.slot("controls"));
    }

    // How much ONE manual click on Ben is worth right now.
    //
    // A getter, so it is recalculated from scratch every time - which is
    // why buying an upgrade or switching skin takes effect instantly with
    // no extra bookkeeping anywhere.
    //
    // The sum works the same way as rate() below: add up all the flat
    // bonuses first, then apply the percentage bonuses to that total.
    get clickPower() {
        // Flat "+N per click" from upgrades like Mawhonic and Gasgano.
        const flat = this.clickUpgrades.reduce((sum, u) => sum + u.flatPower, 0);

        // Percentage bonuses from upgrades like Wan Sandage.
        const mult = this.clickUpgrades.reduce(
            (sum, u) => sum + u.powerMultiplier, 0
        );

        // Skins do NOT affect click power - they multiply your passive
        // income instead. See the rate getter below.

        // e.g. base 1 + 2 Gasgano = 3, with one Wan Sandage
        //      -> 3 * 1.25 = 3 clicks per click
        return Math.floor((CONFIG.baseClickPower + flat) * (1 + mult));
    }

    // Your total clicks per second. A getter, so `game.rate` recalculates
    // from scratch every time and can never go stale.
    get rate() {
        // .reduce() boils an array down to a single value. The function
        // gets (accumulatedSoFar, currentItem) and returns the new total.
        // The `0` at the end is the starting value.
        // This is Python's sum(g.flat_rate for g in self.generators).
        const flat = this.generators.reduce((sum, g) => sum + g.flatRate, 0);
        const boost = this.generators.reduce((sum, g) => sum + g.rateBoost, 0);

        // Multiplier from whichever skin you are currently wearing.
        // Wearing PolyBen gives 1.5; wearing plain Ben gives 1 (no change).
        const skinMultiplier = SKINS[this.benButton.skin].rateMultiplier;

        // Applied last, on top of everything else. So:
        // e.g. 5 clicks/sec with two BT-310s and PolyBen on
        //      -> 5 * (1 + 0.4) * 1.5 = 10 clicks/sec
        return Math.floor(flat * (1 + boost) * skinMultiplier);
    }

    addClicks(amount) {
        this.setClicks(this.clicks + amount);
    }

    // Try to spend clicks. Returns true if it worked, false if too poor.
    // Returning a true/false is what lets every buy button write the
    // one-line check `if (!this.game.spend(cost)) return;`
    spend(amount) {
        if (this.clicks < amount) return false;   // cannot afford - change nothing
        this.setClicks(this.clicks - amount);
        return true;
    }

    // The ONLY place clicks are ever changed. Everything routes through
    // here, which guarantees the save file can never drift out of sync.
    setClicks(value) {
        this.clicks = Math.floor(value);      // keep it a whole number
        Save.set("totalClicks", this.clicks); // save on every single change
    }

    // Redraw every widget. Fast enough to just always do all of them
    // rather than tracking which one actually changed.
    refresh() {
        this.widgets.forEach((widget) => widget.render());
    }

    // One second of game time: collect passive income, then redraw.
    tick() {
        this.addClicks(this.rate);
        this.refresh();
    }

    // Start everything.
    start() {
        this.mount();      // create all the HTML and put it on the page
        this.refresh();    // fill in the starting numbers
        // Run tick() forever, once per second. Arrow function so that
        // `this` inside tick() is still the Game.
        setInterval(() => this.tick(), CONFIG.tickMs);
    }
}


/* =========================================================================
   5. BOOT
   =========================================================================
   Everything above only DEFINES things. These lines actually run the game.
   This works at the top level because index.html loads this file with the
   `defer` attribute, which guarantees the page's HTML is fully parsed
   before any of this code runs.
   ========================================================================= */

checkForDuplicateKeys();   // fail loudly now if two upgrades clash

const game = new Game();   // create the game (loads the save, makes widgets)
game.start();              // build the page and start the clock ticking

new MusicPlayer(CONFIG.music);   // no name needed - it just listens and plays
