import { Buffer } from 'buffer';

enum RequestType {
    publisherTypes = 1,
    registerSubscriberTypes,
    publisherItem,
    getpublisherTypes
}

enum ResponseType {
    publisherTypes = 1,
    publisherItem,
    publisherTypesSuccesded,
    succesdedPublish,
    error
}

class MyBuffer {
    static endMessage = '|';
    private constructor() { }

    //return new buffer with add message type to message and end message.
    public static addTypeMessage = (requestType: RequestType | ResponseType, buffer?: Buffer) => {
        let newBuffer;
        if (buffer != undefined) {
            newBuffer = Buffer.alloc(buffer.byteLength + 1, requestType);
            newBuffer.fill(buffer, 1);
        }
        else {
            newBuffer = Buffer.alloc(1, requestType);
        }
        return this.addEndMessage(newBuffer);
    }

    //return the RequestType message.
    public static getRequestType = (buffer: Buffer) => {
        return RequestType[buffer.readInt8(0)];
    }

    //return the ResponseType message.
    public static getResponseType = (buffer: Buffer) => {
        return ResponseType[buffer.readInt8(0)];
    }

    //return only the message without type message.
    public static getBufferWithOutType = (buffer: Buffer) => {
        return buffer.slice(1);
    }

    //convert array of string to buffer.
    public static getStringArrAsBuffer = (strArr: string[]) => {
        return Buffer.from(strArr.join(","));
    }

    //convert buffer to array of string.
    public static getBufferAsStringArr = (buffer: Buffer) => {
        return buffer.toString().split(",");
    }

    //add end message to buffer.
    public static addEndMessage = (buffer: Buffer) => {
        let newBuffer = Buffer.alloc(buffer.byteLength + 1, buffer);
        newBuffer.fill(this.endMessage, buffer.byteLength);
        return newBuffer;
    }

    //add two messages to one message.
    public static addTowMessage = (buffer1: Buffer, buffer2: Buffer) => {
        let newBuffer = Buffer.alloc(buffer1.byteLength + buffer2.byteLength, buffer1);
        newBuffer.fill(buffer2, buffer1.byteLength);
        return newBuffer;
    }

    //return from the buffer all the messages
    public static getMessages = (buffer: Buffer) => {
        let arrBuffer: Buffer[] = [];
        let indexEndMessage = buffer.indexOf(this.endMessage);
        while (indexEndMessage != -1) {
            let newBuffer = Buffer.alloc(indexEndMessage, buffer);
            arrBuffer.push(newBuffer);
            buffer = buffer.slice(indexEndMessage + 1, buffer.byteLength);
            indexEndMessage = buffer.indexOf(this.endMessage);
        }
        return arrBuffer;
    }
}

export { RequestType, ResponseType, MyBuffer };
