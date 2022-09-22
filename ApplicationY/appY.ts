import { ClientTCP } from "../shared/clientTCP";
import { Cat } from "./models/cat";

new ClientTCP<Cat>(Cat, "Dog", 2000).connection();
