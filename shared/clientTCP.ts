
import { Buffer } from "buffer";
import * as net from "net"
import { Animal } from "./animal";
import { ItemDto } from "./itemDto";
import { MyBuffer, RequestType } from "./MyBuffer";
// The port number and hostname of the server.
const port = 8080;
const host = 'localhost';

class ClientTCP<T extends Animal>{
    //the data structure of T's
    public allItems = new Set<T>();
    public countOfItemsSub = 0;
    public client: net.Socket;
    public time: number;
    private type: new () => T;
    private publishAnimal: string;
    private subscribeAnimal: string;

    constructor(type: new () => T, subscribeAnimal: string, time: number) {
        this.type = type;
        this.publishAnimal = type.name;
        this.subscribeAnimal = subscribeAnimal;
        this.time = time;
        // Create a new TCP client.
        this.client = new net.Socket();
    }

    connection() {
        this.client.connect({ port: port, host: host }, () => {
            console.log('TCP connection established with the server.');
            //send information to the server-"I am a publisher of T "
            //get buffer with all the types that client want
            let buf = MyBuffer.getStringArrAsBuffer([this.publishAnimal]);
            //add the type of request
            buf = MyBuffer.addTypeMessage(RequestType.publisherTypes, buf);
            //clint can send the massage
            this.client.write(buf);
            //requst to server to get all the exist types
            this.client.write(MyBuffer.addTypeMessage(RequestType.getpublisherTypes));
        });

        this.client.on('data', (chunk) => {
            MyBuffer.getMessages(chunk).forEach(oneMessage => {
                let typeMassage = MyBuffer.getResponseType(oneMessage);
                let buffer = MyBuffer.getBufferWithOutType(oneMessage);
                switch (typeMassage) {
                    case "publisherTypes":
                        this.publisherTypes(buffer);
                        break;
                    case "publisherItem":
                        this.publishItem(buffer);
                        break;
                    case "publisherTypesSuccesded":
                        this.beginPublish();
                        break;
                    case "succesdedPublish":
                        break;
                    case "error":
                        console.log('error',buffer.toString());          
                        break;
                    default: //throw new Error("the type massage didn't exist");
                }
            });
        })

        this.client.on('end', () => {
            console.log('Requested an end to the TCP connection');
        });
    }

    // Send a connection request to the server.
    beginPublish = (() => {
        let executed = false;
        return () => {
            if (!executed) {
                executed = true;
                let internalCnt = 0;
                const myinternal = setInterval(() => {
                    let item: T = new this.type();
                    this.allItems.add(item);
                    this.client.write(MyBuffer.addTypeMessage(RequestType.publisherItem, item.getAsItemDto().parseBuffer()));
                    if (internalCnt == 100) {
                        clearInterval(myinternal);
                        this.client.end();
                    }
                    internalCnt++;
                }, this.time);
            }
        }
    })()

    //check if the new types inclueds T
    //And if so sends a request to the server to register to subscriber types
    publisherTypes = (buffer: Buffer) => {
        //if type T is exist send message to register subscriber with the type T
        if (MyBuffer.getBufferAsStringArr(buffer).includes(this.subscribeAnimal)) {
            let buf = MyBuffer.getStringArrAsBuffer([this.subscribeAnimal]);
            //add the type of request
            buf = MyBuffer.addTypeMessage(RequestType.registerSubscriberTypes, buf);
            // clint can send the massage
            this.client.write(buf);
        }
    }

    publishItem = (buffer: Buffer) => {
        let itemDto = ItemDto.parseBack(buffer);
        this.countOfItemsSub++;
        console.log("new", this.subscribeAnimal, this.countOfItemsSub);
        console.log("name :", itemDto.name);
        console.log("time :", new Date());
    }


}
export { ClientTCP };