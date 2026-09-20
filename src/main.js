/* =========================================================================
   Ben Quadinaros Clicker
   -------------------------------------------------------------------------
   Every dynamic part of the page is built by the class that owns it.
   index.html only holds static chrome plus a few empty mount points.

   To add a new upgrade you now touch exactly ONE place: the GENERATORS
   array below. No HTML, no new ids.
   ========================================================================= */


/* ------------------------------ config ---------------------------------- */

const ASSETS = "assets/";

const CONFIG = {
    clickPower: 1,        // clicks earned per click on Ben
    tickMs: 1000,         // how often passive income is paid out
    clickSound: ASSETS + "mixkit-mouse-click-close-1113.wav",
    music: ASSETS + "backgroundmusic.wav",

    // empty <div>s in index.html that the game fills in
    mounts: {
        clock: "clock-slot",
        readouts: "readout-slot",
        stage: "stage-slot",
        shop: "shop-slot",
        controls: "controls-slot",
    },
};

/*
 * A generator is anything you buy that helps you earn.
 *   rate  = flat clicks/second added per unit owned
 *   boost = +fraction to the TOTAL rate per unit owned (0.2 = +20% each)
 * A thing can have both. Storage keys are kept as-is so old saves survive.
 */
const GENERATORS = [
    {
        key: "rat",
        name: "Ratts Tyerell",
        icon: ASSETS + "rattstyerell.png",
        baseCost: 20,
        costGrowth: 1.2,
        rate: 1,
        boost: 0,
        storage: { owned: "rats-owned", cost: "rat-cost" },
    },
    {
        key: "bt310quadra",
        name: "BT-310 Quadra",
        icon: ASSETS + "bt310_quadra.png",
        baseCost: 1500,
        costGrowth: 1.2,
        rate: 0,
        boost: 0.2,
        storage: { owned: "bt310quadras-owned", cost: "bt310quadra-cost" },
    },
];

/* Skins you can unlock and swap between on the main Ben button. */
const SKINS = {
    ben: { img: ASSETS + "ben.png", label: "Ben" },
    polyben: { img: ASSETS + "benquad.png", label: "PolyBen" },
};


/* ------------------------------ helpers --------------------------------- */

/**
 * Tiny DOM builder. Roughly "createElement with batteries":
 *     el("button", { class: "shop-button" }, [icon, label])
 * Children may be elements or plain strings. Strings become text nodes, so
 * game data can never be parsed as HTML.
 */
function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(props)) {
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key.includes("-")) node.setAttribute(key, value);
        else node[key] = value;
    }

    for (const child of [].concat(children)) {
        node.appendChild(
            typeof child === "string" ? document.createTextNode(child) : child
        );
    }

    return node;
}

/** Thin typed wrapper over localStorage. Everything in there is a string. */
class Save {
    static number(key, fallback) {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const value = Number(raw);
        return Number.isFinite(value) ? value : fallback;
    }

    static bool(key, fallback = false) {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw === "true";
    }

    static text(key, fallback) {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw;
    }

    static set(key, value) {
        localStorage.setItem(key, value);
    }
}

/** A sound effect that can retrigger before the previous play finished. */
class Sound {
    constructor(src, { loop = false } = {}) {
        this.audio = new Audio(src);
        this.audio.loop = loop;
    }

    play() {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {
            /* browsers block audio until the first real user gesture */
        });
    }
}


/* ------------------------------ widgets --------------------------------- */

/**
 * Base class for every piece of the UI.
 *
 * The contract is three steps, and it is always the same:
 *   build()  -> create and return your DOM, stash refs to bits you update
 *   mount()  -> attach that DOM to the page (done for you)
 *   render() -> push current state into the DOM you built
 *
 * build() is NOT called from the constructor on purpose: a subclass can't
 * assign its own fields until after super() has run, so building there would
 * read half-initialised objects. Construct first, mount second.
 */
class Widget {
    constructor(game) {
        this.game = game;
        this.element = null;
    }

    build() {
        throw new Error(`${this.constructor.name} must implement build()`);
    }

    mount(parent) {
        this.element = this.build();
        parent.appendChild(this.element);
        this.render();
        return this;
    }

    render() {}
}

/** A Widget that responds to clicks. Subclasses just implement onClick(). */
class GameButton extends Widget {
    constructor(game, { sound = true } = {}) {
        super(game);
        this.playsSound = sound;
    }

    mount(parent) {
        super.mount(parent);

        // Arrow function so `this` stays the widget, not the DOM node.
        this.element.addEventListener("click", () => {
            if (this.playsSound) this.game.clickSound.play();
            this.onClick();
            this.game.refresh();
        });

        return this;
    }

    onClick() {}
}

/** A "Label: value" line in the header. */
class Readout extends Widget {
    constructor(game, label, getValue) {
        super(game);
        this.label = label;
        this.getValue = getValue;
    }

    build() {
        this.value = el("span");
        return el("h1", { class: "readout" }, [`${this.label}: `, this.value]);
    }

    render() {
        this.value.textContent = this.getValue();
    }
}

/** The big Ben image. Click it, get clicks. */
class ClickTarget extends GameButton {
    constructor(game) {
        super(game);
        this.skin = Save.text("skin", "ben");
    }

    build() {
        return el("img", { class: "ben", alt: "Ben" });
    }

    onClick() {
        this.game.addClicks(this.game.clickPower);
    }

    setSkin(skinKey) {
        this.skin = skinKey;
        Save.set("skin", skinKey);
        this.render();
    }

    render() {
        this.element.src = SKINS[this.skin].img;
    }
}

/** A buyable upgrade that produces clicks and/or boosts your rate. */
class Generator extends GameButton {
    constructor(game, def) {
        super(game);

        this.key = def.key;
        this.name = def.name;
        this.icon = def.icon;
        this.rate = def.rate;
        this.boost = def.boost;
        this.costGrowth = def.costGrowth;
        this.storage = def.storage;

        this.owned = Save.number(this.storage.owned, 0);
        this.cost = Save.number(this.storage.cost, def.baseCost);
    }

    build() {
        this.ownedLabel = el("span");
        this.costLabel = el("span");

        return el("button", { class: "shop-button", id: `${this.key}_button` }, [
            el("img", { class: "icon", src: this.icon, alt: this.name }),
            el("span", {}, [
                `${this.name}: `, this.ownedLabel,
                " Cost: ", this.costLabel,
            ]),
        ]);
    }

    onClick() {
        if (!this.game.spend(this.cost)) return;

        this.owned += 1;
        this.cost = Math.floor(this.cost * this.costGrowth);
        this.save();
    }

    /** Flat clicks/sec this generator contributes. */
    get flatRate() {
        return this.rate * this.owned;
    }

    /** Fractional bonus this generator adds to the total rate. */
    get rateBoost() {
        return this.boost * this.owned;
    }

    save() {
        Save.set(this.storage.owned, this.owned);
        Save.set(this.storage.cost, this.cost);
    }

    render() {
        this.ownedLabel.textContent = this.owned;
        this.costLabel.textContent = this.cost;
        this.element.classList.toggle("affordable", this.game.clicks >= this.cost);
    }
}

/** One-time purchase that unlocks a skin, then toggles between the two. */
class SkinButton extends GameButton {
    constructor(game, { unlockCost, skinKey, storageKey }) {
        super(game);
        this.unlockCost = unlockCost;
        this.skinKey = skinKey;
        this.storageKey = storageKey;
        this.unlocked = Save.bool(storageKey, false);
    }

    build() {
        this.icon = el("img", { class: "icon", alt: SKINS[this.skinKey].label });
        this.label = el("span");

        return el("button", { class: "shop-button", id: `${this.skinKey}_button` }, [
            this.icon,
            this.label,
        ]);
    }

    onClick() {
        if (!this.unlocked) {
            if (!this.game.spend(this.unlockCost)) return;
            this.unlocked = true;
            Save.set(this.storageKey, true);
            return;
        }

        const target = this.game.benButton.skin === "ben" ? this.skinKey : "ben";
        this.game.benButton.setSkin(target);
    }

    render() {
        if (!this.unlocked) {
            this.label.textContent =
                `Unlock ${SKINS[this.skinKey].label} - Cost: ${this.unlockCost}`;
            this.icon.src = SKINS[this.skinKey].img;
            this.element.classList.toggle(
                "affordable", this.game.clicks >= this.unlockCost
            );
            return;
        }

        // Once unlocked, show the skin you'd switch TO.
        const other = this.game.benButton.skin === "ben" ? this.skinKey : "ben";
        this.label.textContent = `Switch to ${SKINS[other].label}`;
        this.icon.src = SKINS[other].img;
        this.element.classList.add("affordable");
    }
}

/** Wipes your clicks (but not your upgrades), same as before. */
class ResetButton extends GameButton {
    build() {
        return el("button", { class: "reset", id: "reset-clicks", text: "Reset" });
    }

    onClick() {
        this.game.setClicks(0);
    }
}

/** The wall clock at the top of the page. */
class Clock extends Widget {
    build() {
        return el("div", { class: "clock", id: "clock" });
    }

    mount(parent) {
        super.mount(parent);
        setInterval(() => this.render(), 1000);
        return this;
    }

    render() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");

        this.element.textContent =
            `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
}

/** Background music. Browsers won't let it start until the user interacts. */
class MusicPlayer {
    constructor(src) {
        this.track = new Sound(src, { loop: true });

        const start = () => this.track.play();
        document.addEventListener("click", start, { once: true });
        document.addEventListener("keydown", start, { once: true });
    }
}


/* -------------------------------- game ---------------------------------- */

class Game {
    constructor() {
        this.clickPower = CONFIG.clickPower;
        this.clickSound = new Sound(CONFIG.clickSound);
        this.clicks = Save.number("totalClicks", 0);

        this.benButton = new ClickTarget(this);
        this.generators = GENERATORS.map((def) => new Generator(this, def));

        this.skinButton = new SkinButton(this, {
            unlockCost: 1000,
            skinKey: "polyben",
            storageKey: "polyben_unlocked",
        });

        this.clock = new Clock(this);

        this.readouts = [
            new Readout(this, "Total Clicks", () => this.clicks),
            new Readout(this, "Rate", () => this.rate),
        ];

        // Everything that needs redrawing when state changes.
        this.widgets = [
            this.benButton,
            ...this.generators,
            this.skinButton,
            ...this.readouts,
        ];
    }

    /** Look up a mount point from CONFIG.mounts by name. */
    slot(name) {
        const node = document.getElementById(CONFIG.mounts[name]);
        if (!node) throw new Error(`Missing mount point: #${CONFIG.mounts[name]}`);
        return node;
    }

    /** Build the whole page. Order here is the order things appear. */
    mount() {
        this.clock.mount(this.slot("clock"));
        this.readouts.forEach((readout) => readout.mount(this.slot("readouts")));
        this.benButton.mount(this.slot("stage"));

        const shop = this.slot("shop");
        this.generators.forEach((generator) => generator.mount(shop));
        this.skinButton.mount(shop);

        new ResetButton(this).mount(this.slot("controls"));
    }

    /** Total clicks per second, from flat rates plus percentage boosts. */
    get rate() {
        const flat = this.generators.reduce((sum, g) => sum + g.flatRate, 0);
        const boost = this.generators.reduce((sum, g) => sum + g.rateBoost, 0);
        return Math.floor(flat * (1 + boost));
    }

    addClicks(amount) {
        this.setClicks(this.clicks + amount);
    }

    /** Spend clicks if affordable. Returns whether the purchase went through. */
    spend(amount) {
        if (this.clicks < amount) return false;
        this.setClicks(this.clicks - amount);
        return true;
    }

    setClicks(value) {
        this.clicks = Math.floor(value);
        Save.set("totalClicks", this.clicks);
    }

    /** Redraw everything. Cheap enough to just always do it. */
    refresh() {
        this.widgets.forEach((widget) => widget.render());
    }

    tick() {
        this.addClicks(this.rate);
        this.refresh();
    }

    start() {
        this.mount();
        this.refresh();
        setInterval(() => this.tick(), CONFIG.tickMs);
    }
}


/* -------------------------------- boot ---------------------------------- */

const game = new Game();
game.start();

new MusicPlayer(CONFIG.music);
