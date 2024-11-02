import { CheckersType } from "@/types/checkers";
import { Piece } from "@/types/piece";

const customBoard: number[][] = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
];

const Logic = {
    initBoard: function (state: CheckersType) {
        state.board = Array(8)
            .fill(null)
            .map(() => Array(8).fill(null));

        customBoard.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value !== 0) {
                    state.board[r][c] = {
                        color: value === 1 ? "white" : "black",
                        is_king: false,
                        position: [r, c],
                    };
                    this.promotePiece(state, state.board[r][c]);
                }
            });
        });
        return state;
    },
    updateCursorLog: function (state: CheckersType, position: number[]) {
        if (!state.game_over) {
            if (state.cursor_log.length) {
                if (
                    state.cursor_log[state.cursor_log.length - 1].toString() !==
                    position.toString()
                ) {
                    state.cursor_log.push(position);
                } else {
                    if (!state.in_capture_state) {
                        state.cursor_log.length = 0;
                    }
                }
            } else {
                state.cursor_log.push(position);
            }
        }
        return state;
    },
    selectSquare: function (state: CheckersType) {
        if (state.cursor_log.length !== 0) {
            const [row, col] = state.cursor_log[state.cursor_log.length - 1];
            if (state.board[row][col]?.color === state.current_player) {
                if (!state.must_capture) {
                    const has_move = state.moves.some(
                        (_move) =>
                            _move.start.toString() === [row, col].toString()
                    );
                    if (has_move) {
                        state.selected_square = [row, col];
                        state.active_move_piece = state.board[row][col];
                    } else {
                        state.cursor_log.length = 0;
                        state.selected_square.length = 0;
                    }
                } else {
                    state.selected_square = [row, col];
                    const is_capture_square = state.capture_positions.some(
                        (capture) =>
                            capture.toString() ===
                            state.selected_square.toString()
                    );
                    if (!is_capture_square) {
                        state.selected_square.length = 0;
                    } else {
                        state.active_capture_piece = state.board[row][col];
                    }
                }
            } else {
                if (!state.in_capture_state) {
                    state.selected_square = [];
                }
            }
        } else {
            state.selected_square = [];
        }
        return state;
    },
    promotePiece: function (state: CheckersType, piece: Piece) {
        if (!piece.is_king) {
            if (piece.color === "white") {
                if (piece.position[0] === 7) {
                    piece.is_king = true;
                    state.draw_count = 0;
                }
            } else {
                if (piece.position[0] === 0) {
                    piece.is_king = true;
                    state.draw_count = 0;
                }
            }
        }
    },
    switchTurn: function (state: CheckersType) {
        state.current_player =
            state.current_player === "white" ? "black" : "white";
        return state;
    },
    generateMoves: function (state: CheckersType) {
        state.board.forEach((row) => {
            row.forEach((piece) => {
                if (piece) {
                    if (piece.color === state.current_player) {
                        if (piece.is_king) {
                            this.kingMoves(state, piece);
                        } else {
                            this.pawnMoves(state, piece);
                        }
                    }
                }
            });
        });
        return state;
    },
    kingMoves: function (state: CheckersType, piece: Piece) {
        const [row, col] = piece.position;

        const addMove = (row_offset: number, col_offset: number) => {
            state.moves.push({
                start: [row, col],
                end: [row_offset, col_offset],
                piece,
            });
            state.move_allowed = false;
        };

        const directions = [
            [1, -1],
            [1, 1],
            [-1, -1],
            [-1, 1],
        ];

        for (const [r, c] of directions) {
            const [new_row, new_col] = [row + r, col + c];
            if (new_row >= 0 && new_row < 8 && new_col >= 0 && new_col < 8) {
                if (state.board[new_row][new_col] === null) {
                    addMove(new_row, new_col);
                }
            }
        }
        return state;
    },
    pawnMoves: function (state: CheckersType, piece: Piece) {
        const [row, col] = piece.position;

        const addMove = (row_offset: number, col_offset: number) => {
            state.moves.push({
                start: [row, col],
                end: [row_offset, col_offset],
                piece,
            });
            state.move_allowed = false;
        };

        const direction = piece.color === "white" ? 1 : -1;

        if (row + direction >= 0 && row + direction < 8) {
            if (
                col - 1 >= 0 &&
                state.board[row + direction][col - 1] === null
            ) {
                addMove(row + direction, col - 1);
            }
            if (col + 1 < 8 && state.board[row + direction][col + 1] === null) {
                addMove(row + direction, col + 1);
            }
        }
        return state;
    },
    movePiece: function (state: CheckersType) {
        if (state.moves.length) {
            if (state.cursor_log.length > 1) {
                const [r, c] = state.cursor_log[state.cursor_log.length - 2];
                const [row, col] =
                    state.cursor_log[state.cursor_log.length - 1];
                state.moves.forEach((move) => {
                    if (move.start.toString() === [r, c].toString()) {
                        if (move.end.toString() === [row, col].toString()) {
                            move.piece.position = [row, col];
                            state.board[row][col] = move.piece;
                            state.draw_count += 1;

                            this.promotePiece(state, move.piece);

                            state.board[r][c] = null;
                            state.moves.length = 0;
                            state.cursor_log.length = 0;

                            state.move_allowed = true;
                            state.capture_allowed = true;
                            this.switchTurn(state);
                        }
                    }
                });
            }
        }
        return state;
    },
    clearMoves: function (state: CheckersType) {
        state.moves.length = 0;
        return state;
    },
    clearCaptures: function (state: CheckersType) {
        state.captures.length = 0;
        state.capture_positions.length = 0;
        return state;
    },
    generateCaptures: function (state: CheckersType) {
        const checkCapture = (piece: Piece) => {
            if (piece.is_king) {
                this.kingCaptures(state, piece);
            } else {
                this.pawnCaptures(state, piece);
            }
            state.capture_allowed = false;
        };

        if (!state.in_capture_state) {
            state.board.forEach((row) => {
                row.forEach((piece) => {
                    if (piece) {
                        if (piece.color === state.current_player) {
                            checkCapture(piece);
                        }
                    }
                });
            });
        } else {
            if (state.active_capture_piece) {
                if (state.active_capture_piece.color === state.current_player) {
                    checkCapture(state.active_capture_piece);
                }
            }
        }
        return state;
    },
    kingCaptures: function (state: CheckersType, piece: Piece) {
        const [_r, _c] = piece.position;
        const board_size = state.board.length;

        const visited = new Set();
        const queue: number[][] = [[_r, _c]];
        const taken_route = [];

        let has_capture = false;

        while (queue.length > 0) {
            const position = queue.shift();

            if (position === undefined) {
                return;
            }
            const [row, col] = position;

            if (visited.has(`${row}-${col}`)) {
                continue;
            }

            visited.add(`${row}-${col}`);
            const offsets = [-2, 2];

            for (const r_offset of offsets) {
                for (const c_offset of offsets) {
                    const [end_row, end_col] = [row + r_offset, col + c_offset];
                    const [r, c] = [row + r_offset / 2, col + c_offset / 2];
                    if (end_row >= 0 && end_row < board_size) {
                        if (end_col >= 0 && end_col < board_size) {
                            if (state.board[r][c] !== null) {
                                if (state.board[r][c].color !== piece.color) {
                                    if (
                                        taken_route.length === 0 ||
                                        (taken_route.length !== 0 &&
                                            taken_route[
                                                taken_route.length - 1
                                            ].toString() !== [r, c].toString())
                                    ) {
                                        if (
                                            state.board[end_row][end_col] ===
                                            null
                                        ) {
                                            state.captures.push({
                                                start: [row, col],
                                                end: [end_row, end_col],
                                                fallen: {
                                                    position: [r, c],
                                                },
                                                piece,
                                            });
                                            queue.push([end_row, end_col]);
                                            taken_route.push([r, c]);
                                            has_capture = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (has_capture) {
            state.must_capture = true;
            state.capture_positions.push(piece.position);
        }
        return state;
    },
    pawnCaptures: function (state: CheckersType, piece: Piece) {
        const [_r, _c] = piece.position;
        const opponet = piece.color === "white" ? "black" : "white";
        const queue: number[][] = [[_r, _c]];
        const visited = new Set();

        let has_capture = false;

        while (queue.length !== 0 && queue !== undefined) {
            const position = queue.shift();

            if (position === undefined) {
                return;
            }
            const [row, col] = position;

            if (visited.has(`${row}-${col}`)) {
                continue;
            }

            visited.add(`${row}-${col}`);

            const player = piece.color === "black";

            if ((player && row - 2 > -1) || (!player && row + 2 < 8)) {
                if (col - 2 > -1) {
                    if (
                        state.board[row + (player ? -2 : 2)][col - 2] === null
                    ) {
                        if (
                            state.board[row + (player ? -1 : 1)][col - 1]
                                ?.color === opponet
                        ) {
                            state.captures.push({
                                start: [row, col],
                                end: [row + (player ? -2 : 2), col - 2],
                                fallen: {
                                    position: [
                                        row + (player ? -1 : 1),
                                        col - 1,
                                    ],
                                },
                                piece,
                            });
                            queue.push([row + (player ? -2 : 2), col - 2]);
                            has_capture = true;
                        }
                    }
                }
                if (col + 2 < 8) {
                    if (
                        state.board[row + (player ? -2 : 2)][col + 2] === null
                    ) {
                        if (
                            state.board[row + (player ? -1 : 1)][col + 1]
                                ?.color === opponet
                        ) {
                            state.captures.push({
                                start: [row, col],
                                end: [row + (player ? -2 : 2), col + 2],
                                fallen: {
                                    position: [
                                        row + (player ? -1 : 1),
                                        col + 1,
                                    ],
                                },
                                piece,
                            });
                            queue.push([row + (player ? -2 : 2), col + 2]);
                            has_capture = true;
                        }
                    }
                }
            }
        }
        if (has_capture) {
            state.must_capture = true;
            state.capture_positions.push(piece.position);
        }
        return state;
    },
    capturePiece: function (state: CheckersType) {
        if (state.must_capture) {
            if (state.cursor_log.length > 1) {
                const [old_row, old_col] =
                    state.cursor_log[state.cursor_log.length - 2];
                const [new_row, new_col] =
                    state.cursor_log[state.cursor_log.length - 1];
                let capture_piece = null;
                if (!state.in_capture_state) {
                    const capture_pos = state.capture_positions.find(
                        (pos) =>
                            pos.toString() === [old_row, old_col].toString()
                    );
                    if (capture_pos) {
                        capture_piece = state.captures.find(
                            (capture) =>
                                capture.start.toString() ===
                                    capture_pos.toString() &&
                                capture.end.toString() ===
                                    [new_row, new_col].toString()
                        );
                    }
                }
                if (state.in_capture_state) {
                    if (
                        state.active_capture_piece?.position.toString() ===
                        [old_row, old_col].toString()
                    ) {
                        capture_piece = state.captures.find(
                            (capture) =>
                                capture.start.toString() ===
                                    state.active_capture_piece?.position.toString() &&
                                capture.end.toString() ===
                                    [new_row, new_col].toString()
                        );
                    }
                }

                if (capture_piece) {
                    const first_capture = [capture_piece.end];

                    state.board[capture_piece.fallen.position[0]][
                        capture_piece.fallen.position[1]
                    ] = null;
                    capture_piece.piece.position = [new_row, new_col];
                    state.board[new_row][new_col] = capture_piece.piece;
                    state.board[old_row][old_col] = null;
                    state.draw_count = 0;

                    const clear_current_capture = () => {
                        state.must_capture = false;
                        state.in_capture_state = false;
                        state.cursor_log.length = 0;
                        state.selected_square.length = 0;
                        this.clearCaptures(state);
                        this.promotePiece(state, capture_piece.piece);
                        this.switchTurn(state);
                        state.capture_allowed = true;
                    };

                    const moves = [];

                    state.captures.forEach((capture) => {
                        if (
                            capture.start.toString() ===
                                first_capture.toString() &&
                            capture.end.toString() !==
                                [old_row, old_col].toString()
                        ) {
                            moves.push(first_capture);
                        }
                    });

                    if (moves.length !== 0) {
                        state.in_capture_state = true;
                        state.cursor_log = [[new_row, new_col]];
                        state.selected_square = [new_row, new_col];
                        state.active_capture_piece = capture_piece.piece;
                        state.capture_allowed = true;
                    } else {
                        clear_current_capture();
                    }
                } else {
                    if (state.in_capture_state && state.active_capture_piece) {
                        state.cursor_log = [
                            state.active_capture_piece.position,
                        ];
                        state.selected_square =
                            state.active_capture_piece.position;
                        state.capture_allowed = true;
                    }
                }
            } else {
                if (state.in_capture_state && state.active_capture_piece) {
                    state.cursor_log = [state.active_capture_piece.position];
                    state.selected_square = state.active_capture_piece.position;
                    state.capture_allowed = true;
                }
            }
        }
        return state;
    },
};

export default Logic;
