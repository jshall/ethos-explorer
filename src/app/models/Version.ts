import { IVersion } from "ethos";

export function sortVersions(a: IVersion, b: IVersion): number {
    let [a1, a2, a3] = a.name.split('.').map(n => parseInt(n, 10))
    let [b1, b2, b3] = b.name.split('.').map(n => parseInt(n, 10))
    if (a1 - b1) return a1 - b1
    if (a2 - b2) return a2 - b2
    return a3 - b3
}