import { Piece } from "@/models/piece";

export type Capture = {
    start: number[];
    end: number[];
    fallen: {
        position: number[];
    };
    piece: Piece;
};
