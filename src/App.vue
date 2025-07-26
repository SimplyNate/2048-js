<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { Game } from './game';

const game = ref(new Game());
const lastMove = ref<string>();
const animating = ref(false);

function resetGame() {
    game.value = new Game();
}

function wait() {
    return new Promise(resolve => setTimeout(resolve, 500));
}

function stepLeft() {
    if (animating.value) {
        return;
    }
    animating.value = true;
    lastMove.value = 'left';
    game.value.step('left');
    wait();
}
function stepRight() {
    if (animating.value) {
        return;
    }
    animating.value = true;
    lastMove.value = 'right';
    game.value.step('right');
    wait();
}
function stepUp() {
    if (animating.value) {
        return;
    }
    lastMove.value = 'up';
    game.value.step('up');
    wait();
}
function stepDown() {
    if (animating.value) {
        return;
    }
    lastMove.value = 'down';
    game.value.step('down');
    wait();
}

onMounted(() => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stepLeft();
        }
        else if (e.key === 'ArrowRight') {
            stepRight();
        }
        else if (e.key === 'ArrowUp') {
            stepUp();
        }
        else if (e.key === 'ArrowDown') {
            stepDown();
        }
    })
});

</script>

<template>
    <div class="container-fluid text-center text-white d-flex flex-column vw-100 vh-100">
        <div>
            <h2>Simply 2048</h2>
            <div>Last Move: {{ lastMove }}</div>
            <div>Game State: {{ game.currentGameState }}</div>
            <button @click="resetGame">Reset</button>
        </div>
        <div class="mt-5 fs-2 fw-bold flex-grow-1">
            <div class="d-flex justify-content-center position-relative" v-for="i in 4" :key="i">
                <div class="border border-dark bg-0 w-5 position-relative">
                    <div :class="`position-absolute top-0 left-0 w-5 border border-dark bg-${game.state[i-1][0]}`" v-if="game.state[i-1][0] > 0">{{ game.state[i-1][0] }}</div>
                </div>
                <div class="border border-dark bg-0 w-5 position-relative">
                    <div :class="`position-absolute top-0 left-0 w-5 border border-dark bg-${game.state[i-1][1]}`" v-if="game.state[i-1][1] > 0">{{ game.state[i-1][1] }}</div>
                </div>
                <div class="border border-dark bg-0 w-5 position-relative">
                    <div :class="`position-absolute top-0 left-0 w-5 border border-dark bg-${game.state[i-1][2]}`" v-if="game.state[i-1][2] > 0">{{ game.state[i-1][2] }}</div>
                </div>
                <div class="border border-dark bg-0 w-5 position-relative">
                    <div :class="`position-absolute top-0 left-0 w-100 border border-dark bg-${game.state[i-1][3]}`" v-if="game.state[i-1][3] > 0">{{ game.state[i-1][3] }}</div>
                </div>
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
.move-left-1 {
    transform: translateX(-100%);
    animation: 0.5s ease-in-out;
}
.move-left-2 {
    transform: translateX(-200%);
    animation: 0.5s ease-in-out;
}
.move-left-3 {
    transform: translateX(-300%);
    animation: 0.5s ease-in-out;
}
.move-right-1 {
    transform: translateX(100%);
    animation: 0.5s ease-in-out;
}
.move-right-2 {
    transform: translateX(200%);
    animation: 0.5s ease-in-out;
}
.move-right-3 {
    transform: translateX(300%);
    animation: 0.5s ease-in-out;
}
.move-up-1 {
    transform: translateY(-100%);
    animation: 0.5s ease-in-out;
}
.move-up-2 {
    transform: translateY(-200%);
    animation: 0.5s ease-in-out;
}
.move-up-3 {
    transform: translateY(-300%);
    animation: 0.5s ease-in-out;
}
.move-down-1 {
    transform: translateY(100%);
    animation: 0.5s ease-in-out;
}
.move-down-2 {
    transform: translateY(200%);
    animation: 0.5s ease-in-out;
}
.move-down-3 {
    transform: translateY(300%);
    animation: 0.5s ease-in-out;
}
</style>
