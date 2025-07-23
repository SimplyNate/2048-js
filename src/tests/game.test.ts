import { describe, test, expect } from "vitest";
import {Game} from "@/game.js";

function statesAreEqual(s0: number[][], s1: number[][]) {
    expect(s0.length).toEqual(s1.length);
    for (let i = 0; i < s0.length; i++) {
        expect(s0[i].length).toEqual(s1[i].length);
        for (let j = 0; j < s0[i].length; j++) {
            expect(s0[i][j]).toEqual(s1[i][j]);
        }
    }
}

describe('game', () => {
    test('should move left correctly', () => {
        const game = new Game();
        game.state = [
            [2, 0, 0, 0],
            [4, 2, 2, 2],
            [0, 8, 4, 4],
            [8, 8, 16, 4]
        ];
        game.stepLeft();
        const expectedState = [
            [2, 0, 0, 0],
            [4, 4, 2, 0],
            [8, 8, 0, 0],
            [16, 16, 4, 0]
        ];
        statesAreEqual(game.state, expectedState);
    });
    test('should move right correctly', () => {
        const game = new Game();
        game.state = [
            [2, 0, 0, 0],
            [4, 2, 2, 2],
            [0, 8, 4, 4],
            [8, 8, 16, 4]
        ];
        game.stepRight();
        const expectedState = [
            [0, 0, 0, 2],
            [0, 4, 2, 4],
            [0, 0, 8, 8],
            [0, 16, 16, 4]
        ];
        statesAreEqual(game.state, expectedState);
    });
    test('should move up correctly', () => {
        const game = new Game();
        game.state = [
            [4, 0, 2, 0],
            [4, 16, 2, 4],
            [0, 8, 4, 4],
            [8, 8, 16, 4]
        ];
        game.stepUp();
        const expectedState = [
            [8, 16, 4, 8],
            [8, 16, 4, 4],
            [0, 0, 16, 0],
            [0, 0, 0, 0]
        ];
        statesAreEqual(game.state, expectedState);
    });
    test('should move down correctly', () => {
        const game = new Game();
        game.state = [
            [4, 0, 2, 0],
            [4, 16, 2, 4],
            [0, 8, 4, 4],
            [8, 8, 16, 4]
        ];
        game.stepDown();
        const expectedState = [
            [0, 0, 0, 0],
            [0, 0, 4, 0],
            [8, 16, 4, 4],
            [8, 16, 16, 8]
        ];
        statesAreEqual(game.state, expectedState);
    });
});
