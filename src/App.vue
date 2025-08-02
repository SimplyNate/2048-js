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
 * Selection should be ordered such that 0 is the edge and 3 is the far side.
 * E.g., If the lastMove is left:
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
    // EX: 4 32 0 4 -> last 4 can move to index 2, but current method it tries to jump to 0
    const result: {i: number, css: string}[] = [];
    for (let i = 0; i < selection.length; i++) {
        if (selection[i] === 0) {
            continue;
        }
        for (let j = 0; j < i; j++) {
            if (selection[j] === 0 || selection[j] === selection[i]) {
                // check if the move has blocking pieces
                let bad = false;
                for (let k = j + 1; k < i; k++) {
                    if (selection[k] !== 0) {
                        bad = true;
                    }
                }
                if (bad) {
                    continue;
                }
                result.push({i, css: `move-${lastMove.value}-${i-j}`});
                selection[j] = selection[i];
                selection[i] = 0;
                break;
            }
        }
    }
    return result;
}

function addAnimationClass() {
    const results: {i: number, j: number, css: string}[] = [];
    if (lastMove.value === 'left') {
        for (let i = 0; i < game.value.state.length; i++) {
            const selection = [];
            for (let j = 0; j < game.value.state[i].length; j++) {
                selection.push(game.value.state[i][j]);
            }
            const a = iterateRow(selection);
            results.push(...a.map(r => {
                return { i, j: r.i, css: r.css };
            }));
        }
    }
    else if (lastMove.value === 'right') {
        for (let i = 0; i < game.value.state.length; i++) {
            const selection = [];
            for (let j = game.value.state[i].length - 1; j >= 0; j--) {
                selection.push(game.value.state[i][j]);
            }
            const a = iterateRow(selection);
            results.push(...a.map(r => {
                // Invert because iterating backwards
                return { i, j: (game.value.state[i].length - 1 - r.i), css: r.css };
            }));
        }
    }
    else if (lastMove.value === 'up') {
        for (let j = 0; j < game.value.state[0].length; j++) {
            const selection = [];
            for (let i = 0; i < game.value.state.length; i++) {
                selection.push(game.value.state[i][j]);
            }
            const a = iterateRow(selection);
            results.push(...a.map(r => {
                return { i: r.i, j, css: r.css };
            }));
        }
    }
    else if (lastMove.value === 'down') {
        for (let j = 0; j < game.value.state[0].length; j++) {
            const selection = [];
            for (let i = game.value.state.length - 1; i >= 0; i--) {
                selection.push(game.value.state[i][j]);
            }
            const a = iterateRow(selection);
            results.push(...a.map(r => {
                return { i: game.value.state.length - 1 - r.i, j, css: r.css };
            }));
        }
    }
    for (const res of results) {
        const tile = document.getElementById(`tile-${res.i}-${res.j}`) as HTMLElement;
        tile.classList.add(res.css);
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

const touchStart = ref({x: 0, y: 0});
const touchEnd = ref({x: 0, y: 0});

function setDirectionByTouch() {
    const x = touchEnd.value.x - touchStart.value.x;
    const y = touchEnd.value.y - touchStart.value.y;
    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
            step('right');
        }
        else if (x < 0) {
            step('left');
        }
    }
    else {
        if (y > 0) {
            step('down');
        }
        else if (y < 0) {
            step('up');
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
    document.addEventListener('touchstart', (e) => {
        touchStart.value = {x: e.touches[0].clientX, y: e.touches[0].clientY};
    });
    document.addEventListener('touchend', (e) => {
        touchEnd.value = {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
        setDirectionByTouch();
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
        <div class="mt-5 fs-2 fw-bold flex-grow-1 pointer-events-none">
            <div class="d-flex justify-content-center position-relative" v-for="i in game.state.length" :key="i">
                <div class="border border-dark bg-0 w-5 position-relative" :id="`row-${i-1}-${j-1}`" v-for="j in game.state[i-1].length" :key="j"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.w-5 {
    width: 10vmax;
    height: 10vmax;
    line-height: 10vmax;
}

</style>
