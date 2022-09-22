import { Animal } from "../../shared/animal";
import { ItemDto } from "../../shared/itemDto";

class Dog extends Animal {
    private static names = ["Puppy", "Niki", "Bo", "Ozzy"];
    private static kinds = ["Beagle", "German Shepherd", "Dachshund"];

    constructor() {
        super(Dog.names[Math.floor(Math.random() * Dog.names.length)], Dog.kinds[Math.floor(Math.random() * Dog.kinds.length)], Math.floor(Math.random() * 100))
    }

    public getAsItemDto() {
        return new ItemDto(Dog.name, this.name);
    }
}
export { Dog };

