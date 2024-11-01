import { Piece } from "@/models/piece";

export type Move = {
    start: number[];
    end: number[];
    piece: Piece;
};
