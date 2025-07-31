<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {type Direction, Game} from './game';

const game = ref(new Game());
const lastMove = ref<Direction>();
const animating = ref(false);

function resetGame() {
    game.value = new Game();
}

function wait(): Promise<void> {
    return new Promise(resolve => setTimeout(() => {
        animating.value = false;
        const tiles = [...document.getElementsByClassName('active-tile')].reverse();
        for (const tile of tiles) {
            tile.remove();
        }
        game.value.step(lastMove.value as Direction);
        setTiles();
        resolve();
    }, 100));
}

/**
 * Calculates how far a tile should move in a direction given current board state
 * @param i
 * @param j
 */
function getMoveAmount(i: number, j: number): number {
    if (lastMove.value === 'left') {
        if (j > 0) {
            const state = game.value.state[i][j];
            if (state === game.value.state[i][j-1] || game.value.state[i][j-1] === 0) {
                return 1;
            }
            /*
            if (j === 1 && (state === game.value.state[i][j-1] || game.value.state[i][j-1] === 0)) {
                return 1;
            }
            else if (j === 2 && (state === game.value.state[i][j-1] || game.value.state[i][j-1] === 0)) {
                return 1;
            }
            else if (j === 3 && (state === game.value.state[i][j-1] || game.value.state[i][j-1] === 0)) {
                return 1;
            }
             */
        }
    }
    else if (lastMove.value === 'right') {
        if (j < game.value.state[i].length - 1) {
            const state = game.value.state[i][j];
            if (state === game.value.state[i][j+1] || game.value.state[i][j+1] === 0) {
                return 1;
            }
        }
    }
    else if (lastMove.value === 'up') {
        if (i > 0) {
            const state = game.value.state[i][j];
            if (state === game.value.state[i-1][j] || game.value.state[i-1][j] === 0) {
                return 1;
            }
        }
    }
    else if (lastMove.value === 'down') {
        if (i < game.value.state.length - 1) {
            const state = game.value.state[i][j];
            if (state === game.value.state[i + 1][j] || game.value.state[i + 1][j] === 0) {
                return 1;
            }
        }
    }
    return 0;
}

/**
 * Selection should be ordered such that 0 is the edge and 3 is the far side.
 * E.g. If the lastMove is left:
 * ```
 * selection = [tile0, tile1, tile2, tile3]
 * ```
 * If the lastMove is right:
 * ```
 * selection = [tile3, tile2, tile1, tile0]
 * ```
 * @param selection
 */
function iterateRow(selection: number[]) {
    const result = [];
    for (let i = 0; i < selection.length; i++) {
        if (selection[i] === 0) {
            continue;
        }
        for (let j = 0; j < i; j++) {
            if (selection[j] === 0) {
                result.push({i, j, css: `move-${lastMove.value}-${i-j}`});
                selection[j] = selection[i];
                selection[i] = 0;
                break;
            }
            if (selection[j] === selection[i]) {
                result.push({i, j, css: `move-${lastMove.value}-${i-j}`});
                selection[j] = selection[i];
                selection[i] = 0;
                break;
            }
        }
    }
}

function addAnimationClass() {
    const tiles = document.getElementsByClassName('active-tile');
    for (const tile of tiles) {
        const tileId = tile.id.split('-');
        const rowNum = Number(tileId[1]);
        const colNum = Number(tileId[2]);
        /**
         * Still need to do checks of how far tile can go
         */
        const moveAmt = getMoveAmount(rowNum, colNum);
        tile.classList.add(`move-${lastMove.value}-${moveAmt}`);
    }
}

function step(direction: Direction) {
    if (animating.value) {
        return;
    }
    animating.value = true;
    lastMove.value = direction;
    addAnimationClass();
    wait();
}

function setTiles() {
    for (let i = 0; i < game.value.state.length; i++) {
        for (let j = 0; j < game.value.state[i].length; j++) {
            const tile = document.getElementById(`row-${i}-${j}`) as HTMLElement;
            if (game.value.state[i][j] > 0) {
                const innerTile = document.createElement('div');
                innerTile.classList.add(`bg-${game.value.state[i][j]}`, 'active-tile');
                innerTile.innerText = game.value.state[i][j].toString();
                innerTile.id = `tile-${i}-${j}`;
                tile.appendChild(innerTile);
            }
        }
    }
}

onMounted(() => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            step('left');
        }
        else if (e.key === 'ArrowRight') {
            step('right');
        }
        else if (e.key === 'ArrowUp') {
            step('up');
        }
        else if (e.key === 'ArrowDown') {
            step('down');
        }
    });
    setTiles();
});

</script>

<template>
    <div class="container-fluid text-center text-white d-flex flex-column vw-100 vh-100">
        <div>
            <h2>Simply 2048</h2>
            <div>Last Move: {{ lastMove }}</div>
            <div>Game State: {{ game.currentGameState }}</div>
            <div>Animating: {{ animating }}</div>
            <button @click="resetGame">Reset</button>
        </div>
        <div class="mt-5 fs-2 fw-bold flex-grow-1">
            <div class="d-flex justify-content-center position-relative" v-for="i in game.state.length" :key="i">
                <div class="border border-dark bg-0 w-5 position-relative" :id="`row-${i-1}-${j-1}`" v-for="j in game.state[i-1].length" :key="j"></div>
            </div>
            <!--
            <div class="d-flex justify-content-center" v-for="i in 4" :key="i">
                <div v-for="j in 4" :key="j" :class="`border border-dark w-5 bg-${game.state[i-1][j-1]}`">{{ game.state[i-1][j-1] > 0 ? game.state[i-1][j-1] : '' }}</div>
            </div>
            -->
        </div>
    </div>
</template>

<style scoped>
.w-5 {
    width: 5vw;
    height: 5vw;
    line-height: 5vw;
}

</style>
