const END_MARKER = '1111111111111110';
const BITS_PER_PIXEL = 3; // Using 1 bit from each RGB channel

export class LSBSteganography {
  private static stringToBinary(str: string): string {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('') + END_MARKER;
  }

  private static binaryToString(binary: string): string {
    const endMarkerIndex = binary.indexOf(END_MARKER);
    if (endMarkerIndex === -1) {
      throw new Error("No valid end marker found in the decoded data");
    }
    
    const messageBinary = binary.substring(0, endMarkerIndex);
    const bytes = messageBinary.match(/.{1,8}/g) || [];
    return bytes.map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('');
  }

  static async encode(imageFile: File, message: string): Promise<Blob> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const binaryMessage = this.stringToBinary(message);
    const maxMessageLength = Math.floor((data.length * BITS_PER_PIXEL) / 8) - 2;
    
    if (binaryMessage.length > maxMessageLength) {
      throw new Error("Message is too long for this image");
    }

    let bitIndex = 0;
    for (let i = 0; i < binaryMessage.length; i++) {
      const bit = parseInt(binaryMessage[i]);
      const pixelIndex = Math.floor(bitIndex / BITS_PER_PIXEL) * 4;
      const channel = bitIndex % BITS_PER_PIXEL;
      
      // Clear LSB and set it to our message bit
      data[pixelIndex + channel] = (data[pixelIndex + channel] & 0xFE) | bit;
      
      bitIndex++;
    }

    ctx.putImageData(imageData, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else throw new Error("Failed to create image blob");
      }, 'image/png'); // Always use PNG to prevent data loss
    });
  }

  static async decode(imageFile: File): Promise<string> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let binaryMessage = '';
    let bitIndex = 0;
    
    // Extract bits until we find the end marker or reach the end of data
    while (bitIndex < data.length * BITS_PER_PIXEL) {
      const pixelIndex = Math.floor(bitIndex / BITS_PER_PIXEL) * 4;
      const channel = bitIndex % BITS_PER_PIXEL;
      
      const bit = data[pixelIndex + channel] & 1;
      binaryMessage += bit;

      // Check for end marker
      if (binaryMessage.endsWith(END_MARKER)) {
        return this.binaryToString(binaryMessage);
      }

      bitIndex++;
    }

    throw new Error("No valid message found in image");
  }
}