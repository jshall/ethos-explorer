import { ISource, IVersion } from "ethos";

export class Version implements IVersion {
    name: string
    schema: any
    sources: { [name: string]: ISource } = {}
}