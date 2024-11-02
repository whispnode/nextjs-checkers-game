import move_piece from "../../public/icons/move_piece.svg";
import { CheckersType } from "@/types/checkers";
import Image from "next/image";
import { Fragment } from "react";

type Props = {
    checkers: CheckersType;
    position: number[];
};

export default function PieceMoves({ checkers, position }: Props) {
    if (!checkers.selected_square.length) return null;

    const captureMoves: number[][] = [];
    const tempCaptureSet = new Set<string>();

    // Check for capture moves if `must_capture` is true
    if (checkers.must_capture) {
        const currentCapture = checkers.captures.find(
            (capture) =>
                capture.start.toString() === checkers.selected_square.toString()
        );

        if (currentCapture) {
            checkers.captures.forEach((capture) => {
                if (
                    capture.start.toString() ===
                    checkers.selected_square.toString()
                ) {
                    tempCaptureSet.add(capture.end.toString());
                }
            });

            // Find any chained captures
            tempCaptureSet.forEach((move) => {
                checkers.captures.forEach((capture) => {
                    if (capture.start.toString() === move) {
                        tempCaptureSet.add(capture.end.toString());
                    }
                });
            });

            // Convert capture positions to number arrays
            captureMoves.push(
                ...Array.from(tempCaptureSet, (item) =>
                    item.split(",").map(Number)
                )
            );
        }
    }

    const isMovePosition = (moveEnd: number[]) =>
        moveEnd.toString() === position.toString();

    return (
        <>
            {checkers.must_capture
                ? captureMoves.map((capture_move, index) =>
                      isMovePosition(capture_move) ? (
                          <Fragment key={index}>
                              <Image
                                  src={move_piece}
                                  alt="capture icon"
                                  priority
                                  className="w-auto h-[12px]"
                              />
                          </Fragment>
                      ) : null
                  )
                : checkers.moves.map((move, index) =>
                      move.start.toString() ===
                          checkers.selected_square.toString() &&
                      isMovePosition(move.end) ? (
                          <Fragment key={index}>
                              <Image
                                  src={move_piece}
                                  alt="move icon"
                                  priority
                                  className="w-auto h-[12px]"
                              />
                          </Fragment>
                      ) : null
                  )}
        </>
    );
}
