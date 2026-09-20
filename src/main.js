/* =========================================================================
   Ben Quadinaros Clicker
   -------------------------------------------------------------------------
   Everything lives here now: config at the top, classes in the middle,
   boot at the bottom.

   To add a new upgrade you should only ever have to touch two places:
     1. add an entry to GENERATORS below
     2. add the matching markup to index.html
   ========================================================================= */


/* ------------------------------ config ---------------------------------- */

const ASSETS = "assets/";

const CONFIG = {
    clickPower: 1,        // clicks earned per click on Ben
    tickMs: 1000,         // how often passive income is paid out
    clickSound: ASSETS + "mixkit-mouse-click-close-1113.wav",
    music: ASSETS + "backgroundmusic.wav",
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
        baseCost: 20,
        costGrowth: 1.2,
        rate: 1,
        boost: 0,
        elements: { button: "rat_button", owned: "rats-owned", cost: "rat-cost" },
        storage: { owned: "rats-owned", cost: "rat-cost" },
    },
    {
        key: "bt310quadra",
        name: "BT-310 Quadra",
        baseCost: 1500,
        costGrowth: 1.2,
        rate: 0,
        boost: 0.2,
        elements: {
            button: "bt310quadra_button",
            owned: "bt310quadra-owned",
            cost: "bt310quadra-cost",
        },
        storage: { owned: "bt310quadras-owned", cost: "bt310quadra-cost" },
    },
];

/* Skins you can unlock and swap between on the main Ben button. */
const SKINS = {
    ben: { img: ASSETS + "ben.png", label: "Ben" },
    polyben: { img: ASSETS + "benquad.png", label: "PolyBen" },
};


/* ------------------------------ helpers --------------------------------- */

/** Thin typed wrapper over localStorage. Everything in there is a string. */
class Save {
    static number(key, fallback) {
        const raw = Number(localStorage.getItem(key));
        return Number.isFinite(raw) && localStorage.getItem(key) !== null
            ? raw
            : fallback;
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


/* ------------------------------ buttons --------------------------------- */

/**
 * Base class for anything clickable in the game.
 * Subclasses implement onClick(); render() is optional.
 */
class GameButton {
    constructor(game, elementId, { sound = true } = {}) {
        this.game = game;
        this.element = document.getElementById(elementId);
        this.playsSound = sound;

        if (!this.element) {
            console.warn(`GameButton: no element with id "${elementId}"`);
            return;
        }

        this.element.addEventListener("click", () => {
            if (this.playsSound) this.game.clickSound.play();
            this.onClick();
            this.game.refresh();
        });
    }

    onClick() {}

    render() {}
}

/** The big Ben image. Click it, get clicks. */
class ClickTarget extends GameButton {
    constructor(game, elementId) {
        super(game, elementId);
        this.skin = Save.text("skin", "ben");
        this.render();
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
        if (!this.element) return;
        this.element.src = SKINS[this.skin].img;
    }
}

/** A buyable upgrade that produces clicks and/or boosts your rate. */
class Generator extends GameButton {
    constructor(game, def) {
        super(game, def.elements.button);

        this.key = def.key;
        this.name = def.name;
        this.rate = def.rate;
        this.boost = def.boost;
        this.costGrowth = def.costGrowth;
        this.storage = def.storage;

        this.owned = Save.number(this.storage.owned, 0);
        this.cost = Save.number(this.storage.cost, def.baseCost);

        this.ownedLabel = document.getElementById(def.elements.owned);
        this.costLabel = document.getElementById(def.elements.cost);

        this.render();
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
        if (this.ownedLabel) this.ownedLabel.textContent = this.owned;
        if (this.costLabel) this.costLabel.textContent = this.cost;
    }
}

/** One-time purchase that unlocks a skin, then toggles between the two. */
class SkinButton extends GameButton {
    constructor(game, { elementId, imgId, textId, unlockCost, skinKey, storageKey }) {
        super(game, elementId);

        this.unlockCost = unlockCost;
        this.skinKey = skinKey;
        this.storageKey = storageKey;
        this.unlocked = Save.bool(storageKey, false);

        this.img = document.getElementById(imgId);
        this.label = document.getElementById(textId);

        this.render();
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
            if (this.label) {
                this.label.textContent =
                    `Unlock ${SKINS[this.skinKey].label} - Cost: ${this.unlockCost}`;
            }
            return;
        }

        // Show the skin you'd switch TO, on both the label and the icon.
        const showing = this.game.benButton.skin;
        const other = showing === "ben" ? this.skinKey : "ben";

        if (this.label) this.label.textContent = `Switch to ${SKINS[other].label}`;
        if (this.img) this.img.src = SKINS[other].img;
    }
}

/** Wipes your clicks (but not your upgrades), same as before. */
class ResetButton extends GameButton {
    onClick() {
        this.game.setClicks(0);
    }
}


/* ------------------------------ widgets --------------------------------- */

/** The wall clock at the top of the page. */
class Clock {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.tick();
        setInterval(() => this.tick(), 1000);
    }

    tick() {
        if (!this.element) return;

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

        this.clickLabel = document.getElementById("click-count");
        this.rateLabel = document.getElementById("display-rate");

        // Order matters: benButton exists before SkinButton reads its skin.
        this.benButton = new ClickTarget(this, "ben-img");

        this.generators = GENERATORS.map((def) => new Generator(this, def));

        this.buttons = [
            this.benButton,
            ...this.generators,
            new SkinButton(this, {
                elementId: "polyben_button",
                imgId: "polyben_button_img",
                textId: "polyben-text",
                unlockCost: 1000,
                skinKey: "polyben",
                storageKey: "polyben_unlocked",
            }),
            new ResetButton(this, "reset-clicks"),
        ];
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

    /** Redraw every label in the game. Cheap enough to just always do it. */
    refresh() {
        if (this.clickLabel) this.clickLabel.textContent = this.clicks;
        if (this.rateLabel) this.rateLabel.textContent = this.rate;
        this.buttons.forEach((button) => button.render());
    }

    tick() {
        this.addClicks(this.rate);
        this.refresh();
    }

    start() {
        this.refresh();
        setInterval(() => this.tick(), CONFIG.tickMs);
    }
}


/* -------------------------------- boot ---------------------------------- */

const game = new Game();
game.start();

new Clock("clock");
new MusicPlayer(CONFIG.music);
