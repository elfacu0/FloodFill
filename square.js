class Square {
    constructor(x = 10, y = 10, size = 20, type = 'empty', color = 100) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.type = type;
    }
    draw() {
        // this.typeSelector();
        fill(this.color);
        rect(this.x, this.y, this.size, this.size);
    }

    isSelected(x, y) {
        if (y < this.y + this.size && y > this.y) {
            if (x < this.x + this.size && x > this.x) {
                return true;
            }
        }
        return false;
    }

    typeSelector(type) {
        this.type = type;
        switch (this.type) {
            case 'filled': {
                this.color = 255;
                break;
            }
            case 'wall': {
                this.color = 10;
                break;
            }
            case 'empty': {
                this.color = 100;
                break;
            }
        }
    }
}
