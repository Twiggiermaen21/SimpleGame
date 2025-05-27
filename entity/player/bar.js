export class HealthBar {
    constructor(elementId = 'health-bar') {
        this.bar = document.getElementById(elementId);
        this.value = 100;
        this.lastColor = '#0f0'; // domyślnie zielony
        this.flashTimeout = null;
    }

    set(percentage) {
        // Aktualizuje pasek zdrowia i kolor
        this.value = Math.max(0, Math.min(100, percentage));
        if (!this.bar) return;

        this.bar.style.width = `${this.value}%`;
        this.lastColor = this._getColorByValue();

        // Nie zmieniaj koloru podczas "flash"
        if (!this.bar.classList.contains('flash')) {
            this.bar.style.backgroundColor = this.lastColor;
        }
    }

    decrease(amount) {
        // Krótko miga na czerwono po otrzymaniu obrażeń
        if (this.bar) {
            this.bar.classList.add('flash');
            this.bar.style.backgroundColor = '#f00';
            if (this.flashTimeout) clearTimeout(this.flashTimeout);

            this.flashTimeout = setTimeout(() => {
                this.bar.classList.remove('flash');
                this.bar.style.backgroundColor = this.lastColor;
            }, 250);
        }
        this.set(this.value - amount);
    }

    increase(amount) {
        this.set(this.value + amount);
    }

    reset() {
        this.set(100);
    }

    get current() {
        return this.value;
    }

    _getColorByValue() {
        if (this.value > 60) return '#0f0';      // zielony
        if (this.value > 30) return '#ffa500';   // pomarańczowy
        return '#e00';                          // czerwony
    }
}
