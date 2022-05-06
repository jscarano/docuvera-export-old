export class Utility {
  public static str2ab(input: string): ArrayBuffer {
    const stringLength = input.length;
    const buffer = new ArrayBuffer(stringLength * 2);
    const bufferView = new Uint16Array(buffer);
    for (let i = 0; i < stringLength; i++) {
      bufferView[i] = input.charCodeAt(i);
    }
    return buffer;
  }
}