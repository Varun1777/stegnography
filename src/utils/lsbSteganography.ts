export class LSBSteganography {
  // Convert text to binary
  private static textToBinary(text: string): string {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  // Convert binary to text
  private static binaryToText(binary: string): string {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('');
  }

  // Encode message into image
  public static async encode(imageFile: File, message: string): Promise<Blob> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const binaryMessage = this.textToBinary(message);
    
    // Add message length at the beginning
    const binaryLength = binaryMessage.length.toString(2).padStart(32, '0');
    const fullBinary = binaryLength + binaryMessage;
    
    // Modify least significant bits
    for (let i = 0; i < fullBinary.length; i++) {
      const pixelIndex = i * 4; // RGBA
      if (pixelIndex < imageData.data.length) {
        // Only modify red channel
        imageData.data[pixelIndex] = 
          (imageData.data[pixelIndex] & 0xFE) | parseInt(fullBinary[i]);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob!)));
  }

  // Decode message from image
  public static async decode(imageFile: File): Promise<string> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let binaryMessage = '';
    
    // First read 32 bits to get message length
    for (let i = 0; i < 32; i++) {
      binaryMessage += imageData.data[i * 4] & 1;
    }
    
    const messageLength = parseInt(binaryMessage, 2);
    binaryMessage = '';
    
    // Read the actual message
    for (let i = 32; i < 32 + messageLength; i++) {
      const pixelIndex = i * 4;
      if (pixelIndex < imageData.data.length) {
        binaryMessage += imageData.data[pixelIndex] & 1;
      }
    }
    
    return this.binaryToText(binaryMessage);
  }
}