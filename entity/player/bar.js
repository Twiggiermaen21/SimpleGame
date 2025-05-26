export class HealthBar {
    constructor(elementId = 'health-bar') {
        this.bar = document.getElementById(elementId);
        this.value = 100;
        this.lastColor = '#0f0'; // zielony domyślnie
        this.flashTimeout = null;
    }

    set(percentage) {
        this.value = Math.max(0, Math.min(100, percentage));
        if (this.bar) {
            this.bar.style.width = `${this.value}%`;

            // Zmieniamy kolor w zależności od poziomu HP
            if (this.value > 60) {
                this.lastColor = '#0f0';
            } else if (this.value > 30) {
                this.lastColor = '#ffa500';
            } else {
                this.lastColor = '#e00';
            }

            // Jeśli nie świeci się na czerwono (po flashu) — ustaw standardowy kolor
            if (!this.bar.classList.contains('flash')) {
                this.bar.style.backgroundColor = this.lastColor;
            }
        }
    }

    decrease(amount) {
        // Najpierw ustaw czerwoną animację (błysk)
        if (this.bar) {
            this.bar.classList.add('flash');
            this.bar.style.backgroundColor = '#f00';

            if (this.flashTimeout) clearTimeout(this.flashTimeout);
            this.flashTimeout = setTimeout(() => {
                this.bar.classList.remove('flash');
                // Wróć do koloru zależnie od procenta HP
                this.bar.style.backgroundColor = this.lastColor;
            }, 250); // czas błysku w ms
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
}
