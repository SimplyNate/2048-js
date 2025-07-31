
export type Direction = 'left' | 'right' | 'up' | 'down';
export type GameState = 'playing' | 'win' | 'lose';
export type Tile = {i: number, j: number};

function getRandomIntInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

export class Tile2 {
    i: number;
    j: number;
    value: number;

    constructor(i: number, j: number, value: number) {
        this.i = i;
        this.j = j;
        this.value = value;
    }
}

export class Board {
    private board: Tile2[][];
    constructor(width: number, height: number) {
        this.board = [];
        for (let i = 0; i < height; i++) {
            const row: Tile2[] = [];
            for (let j = 0; j < width; j++) {
                this.board[i].push(new Tile2(i, j, 0));
            }
            this.board.push(row);
        }
    }
}

export class Game {
    state: number[][];
    constructor() {
        this.state = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        this.randomStart();
    }
    randomStart() {
        this.setRandomTile();
        this.setRandomTile();
    }
    setRandomTile() {
        const freeTiles: {i: number, j: number}[] = [];
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                if (this.state[i][j] === 0) {
                    freeTiles.push({i, j});
                }
            }
        }
        const randomTile = freeTiles[getRandomIntInclusive(0, freeTiles.length - 1)];
        const randomValue = Math.random();
        if (randomValue < 0.1) {
            this.state[randomTile.i][randomTile.j] = 4;
        }
        else {
            this.state[randomTile.i][randomTile.j] = 2;
        }
    }
    get width(): number {
        return this.state[0].length;
    }
    get height(): number {
        return this.state.length;
    }
    get hasMergeAvailable(): boolean {
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                if (j < this.state[i].length - 1 && this.state[i][j] === this.state[i][j + 1]) {
                    return true;
                }
                if (i < this.state.length - 1 && this.state[i][j] === this.state[i+1][j]) {
                    return true;
                }
            }
        }
        return false;
    }
    get currentGameState(): GameState {
        const freeTiles = [];
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                if (this.state[i][j] === 2048) {
                    return 'win';
                }
                else if (this.state[i][j] === 0) {
                    freeTiles.push({i, j});
                }
            }
        }
        if (freeTiles.length === 0 && !this.hasMergeAvailable) {
            return 'lose';
        }
        return 'playing';
    }
    step(direction: Direction) {
        if (this.currentGameState !== 'playing') {
            return;
        }
        let somethingHappened = false;
        if (direction === 'left') {
            somethingHappened = this.stepLeft();
        }
        else if (direction === 'right') {
            somethingHappened = this.stepRight();
        }
        else if (direction === 'up') {
            somethingHappened = this.stepUp();
        }
        else if (direction === 'down') {
            somethingHappened = this.stepDown();
        }
        if (this.currentGameState === 'playing' && somethingHappened) {
            this.setRandomTile();
        }
    }
    private canMerge(item0: number, item1: number) {
        return item0 === item1;
    }

    /**
     * Bug: multiple merges can occur
     * 0 2 2 4 merges into 8 instead of 0 0 4 4
     * Merge does not happen left to right or right to left as you would expect
     */
    private processMerges(selection: Tile[]): boolean {
        let somethingHappened = false;
        let preventMergeBefore = -1;
        for (let i = 0; i < selection.length - 1; i++) {
            const iTile = selection[i];
            if (this.state[iTile.i][iTile.j] === 0) {
                continue;
            }
            for (let j = i + 1; j < selection.length; j++) {
                const jTile = selection[j];
                if (this.state[iTile.i][iTile.j] === 0 || this.state[jTile.i][jTile.j] === 0) {
                    continue;
                }
                if (this.canMerge(this.state[iTile.i][iTile.j], this.state[jTile.i][jTile.j]) && i > preventMergeBefore) {
                    this.state[iTile.i][iTile.j] = this.state[iTile.i][iTile.j] + this.state[jTile.i][jTile.j];
                    this.state[jTile.i][jTile.j] = 0;
                    somethingHappened = true;
                    preventMergeBefore = i;
                }
                else {
                    break;
                }
            }
        }
        return somethingHappened;
    }
    selectRow(row: number): Tile[] {
        const selection: Tile[] = [];
        for (let j = 0; j < this.state[row].length; j++) {
            selection.push({i: row, j});
        }
        return selection;
    }
    selectColumn(column: number): Tile[] {
        const selection: Tile[] = [];
        for (let i = 0; i < this.state.length; i++) {
            selection.push({i, j: column});
        }
        return selection;
    }
    private processStep(selection: Tile[]): boolean {
        let somethingHappened = false;
        if (this.processMerges(selection)) {
            somethingHappened = true;
        }
        // Then, step through each tile in this column and push as far down as possible
        for (let j = 0; j < selection.length; j++) {
            const tile0 = selection[j];
            if (this.state[tile0.i][tile0.j] === 0) {
                continue;
            }
            for (let k = 0; k < j; k++) {
                const tile1 = selection[k];
                if (this.state[tile1.i][tile1.j] === 0) {
                    this.state[tile1.i][tile1.j] = this.state[tile0.i][tile0.j];
                    this.state[tile0.i][tile1.j] = 0;
                    somethingHappened = true;
                    break;
                }
            }
        }
        return somethingHappened;
    }
    stepLeft(): boolean {
        let somethingHappened = false;
        for (let i = 0; i < this.state.length; i++) {
            // Process tiles that can merge
            if (this.processMerges(this.selectRow(i))) {
                somethingHappened = true;
            }
            // Then, step through each tile in this row and push as far left as possible
            for (let j = 0; j < this.state[i].length; j++) {
                if (this.state[i][j] === 0) {
                    continue;
                }
                for (let k = 0; k < j; k++) {
                    if (this.state[i][k] === 0) {
                        this.state[i][k] = this.state[i][j];
                        this.state[i][j] = 0;
                        somethingHappened = true;
                        break;
                    }
                }
            }
        }
        return somethingHappened;
    }
    stepRight(): boolean {
        let somethingHappened = false;
        for (let i = 0; i < this.state.length; i++) {
            // Process tiles that can merge
            if (this.processMerges(this.selectRow(i).reverse())) {
                somethingHappened = true;
            }
            // Then, step through each tile in this row and push as far right as possible
            for (let j = this.state[i].length - 1; j >= 0; j--) {
                if (this.state[i][j] === 0) {
                    continue;
                }
                for (let k = this.state[i].length - 1; k > j; k--) {
                    if (this.state[i][k] === 0) {
                        this.state[i][k] = this.state[i][j];
                        this.state[i][j] = 0;
                        somethingHappened = true;
                        break;
                    }
                }
            }
        }
        return somethingHappened;
    }
    stepUp(): boolean {
        let somethingHappened = false;
        for (let i = 0; i < this.state[0].length; i++) {
            const selection = this.selectColumn(i);
            const somethingHappenedInSelection = this.processStep(selection);
            if (somethingHappenedInSelection) {
                somethingHappened = true;
            }
        }
        return somethingHappened;
    }
    stepDown(): boolean {
        let somethingHappened = false;
        for (let i = 0; i < this.state[0].length; i++) {
            const selection = this.selectColumn(i).reverse();
            const somethingHappenedInSelection = this.processStep(selection);
            if (somethingHappenedInSelection) {
                somethingHappened = true;
            }
        }
        return somethingHappened;
    }
}
