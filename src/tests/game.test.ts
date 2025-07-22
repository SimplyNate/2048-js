import { describe, test, expect } from "vitest";
import {Game} from "@/game.js";

describe('game', () => {
    test('should move left correctly', () => {
        const game = new Game();
        game.state = [
            [2, 0, 0, 0],
            [4, 2, 2, 0],
            [0, 8, 4, 4],
            [8, 8, 16, 4]
        ];
        game.stepLeft();
        const expectedState = [
            [2, 0, 0, 0],
            [4, 4, 0, 0],
            [8, 8, 0, 0],
            [16, 16, 4, 0]
        ];
        for (let i = 0; i < game.state.length; i++) {
            for (let j = 0; j < game.state[i].length; j++) {
                expect(game.state[i][j]).toEqual(expectedState[i][j]);
            }
        }

    });
    test('should move right correctly', () => {

    });
    test('should move up correctly', () => {

    });
    test('should move down correctly', () => {

    });
});
