"use client";

import { useEffect, useState } from "react";
import CheckersPiece from "./checkers-piece";
import PieceMoves from "./piece-moves";
import { CheckersType, initCheckers } from "@/types/checkers";
import Logic from "@/models/logic";

const LAZY_DRAW_MAX = 50;
const LIMITED_DRAW_MAX = 16;

export default function Board() {
    const [checkers, setCheckers] = useState<CheckersType>(initCheckers);

    // init board
    useEffect(() => {
        const updateCheckers = { ...checkers };
        if (updateCheckers.board.length === 0) {
            Logic.initBoard(updateCheckers);
            setCheckers(updateCheckers);
        }
    }, [checkers]);

    // generate moves
    useEffect(() => {
        const updateCheckers = { ...checkers };

        if (updateCheckers.board.length !== 0) {
            if (!updateCheckers.game_over) {
                if (
                    updateCheckers.move_allowed &&
                    !updateCheckers.must_capture &&
                    !updateCheckers.capture_allowed
                ) {
                    Logic.clearMoves(updateCheckers);
                    Logic.generateMoves(updateCheckers);

                    // game over if a player has no moves to make
                    if (updateCheckers.moves.length === 0) {
                        updateCheckers.game_over = true;
                    }
                    setCheckers(updateCheckers);
                }
            }
        }
    }, [checkers]);

    //generate captures
    useEffect(() => {
        const updateCheckers = { ...checkers };

        if (updateCheckers.board.length !== 0) {
            if (!updateCheckers.game_over) {
                if (updateCheckers.capture_allowed) {
                    Logic.clearCaptures(updateCheckers);
                    Logic.generateCaptures(updateCheckers);
                    setCheckers(updateCheckers);
                }
            }
        }
    }, [checkers]);

    // game over if a player has no pieces left
    useEffect(() => {
        const updateCheckers = { ...checkers };
        if (updateCheckers.board.length !== 0) {
            if (!updateCheckers.game_over) {
                let playerPiecesExist = false;
                updateCheckers.board.forEach((row) => {
                    row.forEach((piece) => {
                        if (piece) {
                            if (piece.color === updateCheckers.current_player) {
                                playerPiecesExist = true;
                            }
                        }
                    });
                });
                if (!playerPiecesExist) {
                    updateCheckers.game_over = true;
                    setCheckers(updateCheckers);
                }
            }
        }
    }, [checkers]);

    // TIMEWASTINGDRAW: draw if no capture or promotion made
    useEffect(() => {
        const updateCheckers = { ...checkers };
        if (!updateCheckers.game_over) {
            if (updateCheckers.draw_count === LAZY_DRAW_MAX) {
                // last check for available captures before ending in draw
                if (updateCheckers.captures.length === 0) {
                    updateCheckers.game_over = true;
                    updateCheckers.is_draw = true;
                    setCheckers(updateCheckers);
                }
            }
        }
    }, [checkers]);

    // draw if there are only two pieces left and draw_count === LIMITED_DRAW_MAX
    useEffect(() => {
        const updateCheckers = { ...checkers };
        if (updateCheckers.board.length !== 0) {
            if (!updateCheckers.game_over) {
                if (updateCheckers.draw_count === LIMITED_DRAW_MAX) {
                    let whitePieces = 0;
                    let blackPieces = 0;

                    // Count the pieces for each player
                    updateCheckers.board.forEach((row) => {
                        row.forEach((piece) => {
                            if (piece !== null) {
                                if (piece.color === "black") blackPieces += 1;
                                if (piece.color === "white") whitePieces += 1;
                            }
                        });
                    });

                    // Check if only two pieces remain (one for each player)
                    if (whitePieces + blackPieces === 2) {
                        updateCheckers.game_over = true;
                        updateCheckers.is_draw = true;
                        setCheckers(updateCheckers);
                    }
                }
            }
        }
    }, [checkers]);

    //show piece moves
    function highlight(row: number, col: number) {
        const is_capture_square = checkers.capture_positions.some(
            (capture) => capture[0] === row && capture[1] === col
        );
        if (is_capture_square && !checkers.selected_square.length) {
            return "!border-blue-600 !border-2";
        }
        return "";
    }

    function handleClick(row: number, col: number) {
        const updateCheckers = { ...checkers };
        if (!updateCheckers.game_over) {
            Logic.updateCursorLog(updateCheckers, [row, col]);
            Logic.selectSquare(updateCheckers);
            Logic.movePiece(updateCheckers);
            Logic.capturePiece(updateCheckers);
        }
        setCheckers(updateCheckers);
    }

    return (
        <div className="border border-zinc-900">
            {checkers.board.length !== 0 ? (
                <>
                    {checkers.board.map((row, rowIndex) => (
                        <div className="flex items-center" key={rowIndex}>
                            {row.map((piece, colIndex) => (
                                <div
                                    className={`relative flex h-[55px] w-[55px] items-center justify-center border ${
                                        rowIndex % 2 === colIndex % 2
                                            ? "border-zinc-200 bg-zinc-200"
                                            : "border-zinc-900 bg-zinc-900"
                                    } ${highlight(rowIndex, colIndex)}`}
                                    key={colIndex}
                                    onClick={() =>
                                        handleClick(rowIndex, colIndex)
                                    }
                                >
                                    <CheckersPiece
                                        checkers={checkers}
                                        piece={piece}
                                    />
                                    <PieceMoves
                                        checkers={checkers}
                                        position={[rowIndex, colIndex]}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </>
            ) : (
                <div>loading</div>
            )}
        </div>
    );
}
