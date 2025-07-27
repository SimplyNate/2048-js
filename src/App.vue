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
    }, 500));
}

function addAnimationClass() {
    const tiles = document.getElementsByClassName('active-tile');
    if (lastMove.value === 'left') {
        for (const tile of tiles) {
            tile.classList.add('move-left-1');
        }
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
