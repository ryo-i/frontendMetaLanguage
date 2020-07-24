import { unsei } from "./unsei";

// 結果
export let kekka = (): string => {
    let nmb: number = Math.floor(Math.random() * unsei.length );
    return unsei[nmb]; 
}