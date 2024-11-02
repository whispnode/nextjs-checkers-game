import { Capture } from "./capture";
import { Move } from "./move";
import { Piece } from "./piece";

export const initCheckers: CheckersType = {
    board: [],
    current_player: "black",

    cursor_log: [],
    selected_square: [],

    in_capture_state: false,
    must_capture: false,
    capture_positions: [],
    captures: [],
    capture_allowed: true,
    active_capture_piece: null,

    draw_count: 0,
    is_draw: false,

    active_move_piece: null,
    moves: [],
    move_allowed: true,

    game_over: false,
};

export type CheckersType = {
    board: (Piece | null)[][];
    current_player: "white" | "black";

    cursor_log: number[][];
    selected_square: number[];

    in_capture_state: boolean;
    must_capture: boolean;
    capture_positions: number[][];
    captures: Capture[];
    capture_allowed: boolean;
    active_capture_piece: Piece | null;

    draw_count: number;
    is_draw: boolean;

    active_move_piece: Piece | null;
    moves: Move[];
    move_allowed: boolean;

    game_over: boolean;
};
