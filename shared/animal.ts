import { ItemDto } from "./itemDto";

abstract class Animal {
    name: string;
    kind: string;
    age: number;
    constructor(name: string, kind: string, age: number) {
        this.name = name;
        this.kind = kind;
        this.age = age;
    }
    public abstract getAsItemDto(): ItemDto;
}
export { Animal };