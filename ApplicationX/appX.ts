import { ClientTCP } from "../shared/clientTCP";
import { Dog } from "./models/dog";

new ClientTCP<Dog>(Dog, "Cat", 1000).connection();

