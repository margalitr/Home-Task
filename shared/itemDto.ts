import { Buffer } from 'buffer';

class ItemDto {
    type: string
    name: string

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
    }

    //return this convert to buffer
    public parseBuffer() {
        let len = 0;
        let buffer = Buffer.alloc(this.name.length + this.type.length + 2);
        buffer.writeInt8(this.type.length, len);
        len += 1;
        buffer.write(this.type, len);
        len += this.type.length;
        buffer.writeInt8(this.name.length, len);
        len += 1;
        buffer.write(this.name, len);
        return buffer;
    }

    //return new ItemDto from buffer
    public static parseBack(buffer: Buffer) {
        let len = 0;
        let typeLen = buffer.readInt8(0);
        len += 1;
        let type = buffer.toString(undefined, 1, typeLen + 1);
        len += typeLen;
        let nameLen = buffer.readInt8(typeLen + 1);
        len += 1;
        let name = buffer.toString(undefined, len, len + nameLen);
        let item = new ItemDto(type, name);
        return item
    }

}


export { ItemDto };