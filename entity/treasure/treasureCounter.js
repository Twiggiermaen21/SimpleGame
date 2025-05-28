export default class TreasureCounter {
    constructor(countId = 'treasure-count', maxId = 'treasure-max', barId = 'treasure-bar') {
        this.count = 0;
        this.max = 0;
        this.countEl = document.getElementById(countId);
        this.maxEl = document.getElementById(maxId);
        this.barEl = document.getElementById(barId);
        this.update();
    }

    setMax(max) {
        this.max = max;
        if (this.maxEl) this.maxEl.textContent = max;
        this.update();
    }

    setCount(count) {
        this.count = count;
        this.update();
    }

    increment() {
        this.count++;
        this.update();
    }

    reset() {
        this.count = 0;
        this.update();
    }

    update() {
        if (this.countEl) this.countEl.textContent = this.count;
        if (this.maxEl) this.maxEl.textContent = this.max;
        if (this.barEl) {
            const perc = this.max === 0 ? 0 : Math.min(100, 100 * this.count / this.max);
            this.barEl.style.width = perc + "%";
        }
    }
}
