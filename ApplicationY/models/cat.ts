import { Animal } from "../../shared/animal";
import { ItemDto } from "../../shared/itemDto";
class Cat extends Animal {
    private static names = ["Kittie", "Luna", "Leo", "Loki", "Bella"];
    private static kinds = ["Gray Tabby", "Scottish Fold", "Persian"];

    constructor() {
        super(Cat.names[Math.floor(Math.random() * Cat.names.length)], Cat.kinds[Math.floor(Math.random() * Cat.kinds.length)], Math.floor(Math.random() * 100))

    }
    public getAsItemDto() {
        return new ItemDto(Cat.name, this.name);
    }
}
export { Cat };