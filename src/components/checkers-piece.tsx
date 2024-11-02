import white_king from "../../public/icons/white_king.svg";
import white_king_selected from "../../public/icons/white_king_selected.svg";
import white_pawn from "../../public/icons/white_pawn.svg";
import white_pawn_selected from "../../public/icons/white_pawn_selected.svg";
import black_king from "../../public/icons/black_king.svg";
import black_king_selected from "../../public/icons/black_king_selected.svg";
import black_pawn from "../../public/icons/black_pawn.svg";
import black_pawn_selected from "../../public/icons/black_pawn_selected.svg";

import Image from "next/image";
import { CheckersType } from "@/types/checkers";
import { Piece } from "@/types/piece";

type Props = {
    checkers: CheckersType;
    piece: Piece | null;
};

export default function CheckersPiece({ checkers, piece }: Props) {
    return (
        <>
            {piece && (
                <>
                    {piece.color === "white" ? (
                        <>
                            {checkers.selected_square.toString() ===
                            piece.position.toString() ? (
                                <Image
                                    src={
                                        piece.is_king
                                            ? white_king_selected
                                            : white_pawn_selected
                                    }
                                    alt={piece.color}
                                    priority={true}
                                    className="h-auto w-[calc(0.85*55px)]"
                                />
                            ) : (
                                <Image
                                    src={
                                        piece.is_king ? white_king : white_pawn
                                    }
                                    alt={piece.color}
                                    priority={true}
                                    className="h-auto w-[calc(0.85*55px)]"
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {checkers.selected_square.toString() ===
                            piece.position.toString() ? (
                                <Image
                                    src={
                                        piece.is_king
                                            ? black_king_selected
                                            : black_pawn_selected
                                    }
                                    alt={piece.color}
                                    priority={true}
                                    className="h-auto w-[calc(0.85*55px)]"
                                />
                            ) : (
                                <Image
                                    src={
                                        piece.is_king ? black_king : black_pawn
                                    }
                                    alt={piece.color}
                                    priority={true}
                                    className="h-auto w-[calc(0.85*55px)]"
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}
