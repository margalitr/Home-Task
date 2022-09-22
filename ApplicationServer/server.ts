import * as net from "net";
import { Buffer } from 'buffer';
import { ItemDto } from "../shared/itemDto";
import { ResponseType, MyBuffer } from "../shared/MyBuffer";
import { ConnectedSockets } from "./models/connectedSockets";

// The port on which the server is listening.
const port = 8080;

let clients: ConnectedSockets = new ConnectedSockets();
let types = new Map<string, { sub: Set<string>, pub: Set<string> }>();

// Create a new TCP server.
const server = net.createServer((socket) => {
    console.log('A new connection has been established.');
    //add to the client map this connection
    clients.allSocketsMap.set(clients.newKey(), socket);
    socket.on('data', function (chunk) {
        //Breaks down the data for each message separately.
        //and activates the correct function.
        MyBuffer.getMessages(chunk).forEach(oneMessage => {
            let typeMassage = MyBuffer.getRequestType(oneMessage).toLocaleLowerCase();
            let buf = MyBuffer.getBufferWithOutType(oneMessage);
            switch (typeMassage) {
                case "publishertypes":
                    addPublisherType(MyBuffer.getBufferAsStringArr(buf), socket);
                    break;
                case "registersubscribertypes":
                    registerSubscriberTypes(MyBuffer.getBufferAsStringArr(buf), socket);
                    break;
                case "publisheritem":
                    publishItem(buf, socket);
                    break;
                case "getpublishertypes":
                    getpublisherTypes(socket);
                    break;
                default: sendError(socket,"ERROR: the type "+typeMassage+"didn't exist in this system")
            }
        })
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function () {
        //delete from the client list in the end of the connection socket.
        let keySocket = clients.findKey(socket);
        let keySocketOnlyStr: string;
        if (keySocket != undefined) {
            keySocketOnlyStr = keySocket;
        }
        else {
            sendError(socket,"ERROR: the key "+keySocket+"didn't exist in the client map")
            return;
        }
        //delete from the map clients.
        clients.allSocketsMap.delete(keySocketOnlyStr);
        //delete from the pub/sub set.
        //and if he the only publisher for the type delete the type.
        types.forEach((value, key) => {
            if (value.pub.delete(keySocketOnlyStr) && value.pub.size == 0) {
                types.delete(key);
            }
            value.sub.delete(keySocketOnlyStr);
        })
        console.log('Closing connection with the client', keySocket);
    });

    socket.on('error', function (err) {
        console.log(`Error: ${err}`);
    });

}).listen(port, '127.0.0.1', () => { console.log(`Server listening for connection requests on socket localhost:${port}.`); });

// add publisher type into the types
let addPublisherType = (publisherTypes: string[], socket: net.Socket) => {
    //over of all the types  registered the socketId as a publisher. 
    //and if they are didn't exist add them into a types map.
    let key = clients.findKey(socket);
    if (key == undefined) {
        sendError(socket,"ERROR: the key "+key+"didn't exist in the client map")
        return;
    }

    let newTypes: string[] = [];
    publisherTypes.forEach(pt => {
        let subPubSet = types.get(pt)
        if (subPubSet == undefined) {
            if (key != undefined) {
                types.set(pt, { sub: new Set(), pub: new Set<string>().add(key) });
                newTypes.push(pt);
            }
        }
        else if (key != undefined) {
            subPubSet.pub.add(key.toString());
            types.set(pt, subPubSet);
        }
    })
    //if same type are added, send to all the clients message "newPublisherTypes".
    if (newTypes.length > 0) {
        clients.allSocketsMap.forEach((socketClient) => {
            if (socket != socketClient)
                socketClient.write(MyBuffer.addTypeMessage(ResponseType.publisherTypes, MyBuffer.getStringArrAsBuffer(newTypes)));
        })
    }
    socket.write(MyBuffer.addTypeMessage(ResponseType.publisherTypesSuccesded));
}

//register sub to types.
let registerSubscriberTypes = (SubscriberTypes: string[], socket: net.Socket) => {
    //inset the socket key into the typesPublisher thet the clint want to register .
    let key = clients.findKey(socket);
    if (key == undefined) {
        sendError(socket,"ERROR: the key "+key+"didn't exist in the client map")
        return;
    }
    SubscriberTypes.forEach(st => {
        let set = types.get(st);
        if (set != undefined && key != undefined) {
            set.sub.add(key);
            types.set(st, set);
        }
        else {
            sendError(socket,"ERROR: the type"+ st+"didn't exist in the types publisher")
        }
    })
}

//get publish item and send to all the sub of this type.
let publishItem = (publisherItem: Buffer, socket: net.Socket) => {
    let type = ItemDto.parseBack(publisherItem).type;
    types.get(type)?.sub?.forEach(idSocket => {
        clients.allSocketsMap.get(idSocket)?.write(MyBuffer.addTypeMessage(ResponseType.publisherItem, publisherItem));
    })
}

//send message with all the exist type.
let getpublisherTypes = (socket: net.Socket) => {
    if (types.size > 0)
        socket.write(MyBuffer.addTypeMessage(ResponseType.publisherTypes, MyBuffer.getStringArrAsBuffer(Array.from(types.keys()))));
}
let sendError=(socket:net.Socket,err:string)=>{
    socket.write(MyBuffer.addTypeMessage(ResponseType.error,Buffer.from(err)))
}