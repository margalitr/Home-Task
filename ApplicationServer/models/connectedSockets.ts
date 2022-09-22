import { Socket } from "net";

class ConnectedSockets {

    allSocketsMap: Map<string, Socket>;
    private count = 0;

    constructor() {
        this.allSocketsMap = new Map<string, Socket>();
    }

    //return key-id of the socket
    findKey(socket: Socket): string | undefined {
        let keySocket: string | undefined = undefined;
        this.allSocketsMap.forEach((value, key) => {
            if (value == socket)
                keySocket = key;
        })
        return keySocket;
    }

    //return new key-id of new socket
    newKey() {
        this.count++;
        return this.count.toString();
    }
}

export { ConnectedSockets }