// DCT Steganography Implementation
export class DCTSteganography {
  private static readonly N = 8; // Block size for DCT

  // Apply 2D DCT to a block
  private static dct2d(block: number[][]): number[][] {
    const N = this.N;
    const output = Array(N).fill(0).map(() => Array(N).fill(0));
    
    for (let u = 0; u < N; u++) {
      for (let v = 0; v < N; v++) {
        let sum = 0;
        const cu = u === 0 ? 1/Math.sqrt(2) : 1;
        const cv = v === 0 ? 1/Math.sqrt(2) : 1;
        
        for (let x = 0; x < N; x++) {
          for (let y = 0; y < N; y++) {
            sum += block[x][y] * 
                   Math.cos((2*x + 1) * u * Math.PI/(2*N)) * 
                   Math.cos((2*y + 1) * v * Math.PI/(2*N));
          }
        }
        
        output[u][v] = (2/N) * cu * cv * sum;
      }
    }
    return output;
  }

  // Apply inverse 2D DCT to a block
  private static idct2d(block: number[][]): number[][] {
    const N = this.N;
    const output = Array(N).fill(0).map(() => Array(N).fill(0));
    
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        let sum = 0;
        
        for (let u = 0; u < N; u++) {
          for (let v = 0; v < N; v++) {
            const cu = u === 0 ? 1/Math.sqrt(2) : 1;
            const cv = v === 0 ? 1/Math.sqrt(2) : 1;
            sum += cu * cv * block[u][v] * 
                   Math.cos((2*x + 1) * u * Math.PI/(2*N)) * 
                   Math.cos((2*y + 1) * v * Math.PI/(2*N));
          }
        }
        
        output[x][y] = (2/N) * sum;
      }
    }
    return output;
  }

  // Convert image data to blocks
  private static imageToBlocks(imageData: ImageData): number[][][] {
    const blocks: number[][][] = [];
    const width = imageData.width;
    const height = imageData.height;
    
    for (let y = 0; y < height; y += this.N) {
      for (let x = 0; x < width; x += this.N) {
        const block: number[][] = Array(this.N).fill(0).map(() => Array(this.N).fill(0));
        
        for (let by = 0; by < this.N; by++) {
          for (let bx = 0; bx < this.N; bx++) {
            if (y + by < height && x + bx < width) {
              const idx = ((y + by) * width + (x + bx)) * 4;
              block[by][bx] = imageData.data[idx]; // Using only red channel for simplicity
            }
          }
        }
        
        blocks.push(block);
      }
    }
    
    return blocks;
  }

  // Embed message in DCT coefficients
  public static async encode(imageFile: File, message: string): Promise<Blob> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const blocks = this.imageToBlocks(imageData);
    
    // Convert message to binary
    const messageBits = message.split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
    
    // Embed message in mid-frequency DCT coefficients
    for (let i = 0; i < Math.min(blocks.length, messageBits.length); i++) {
      const dctBlock = this.dct2d(blocks[i]);
      // Modify mid-frequency coefficient
      dctBlock[4][4] += messageBits[i] === '1' ? 20 : -20;
      blocks[i] = this.idct2d(dctBlock);
    }
    
    // Reconstruct image
    for (let i = 0; i < blocks.length; i++) {
      const blockY = Math.floor((i * this.N) / canvas.width) * this.N;
      const blockX = (i * this.N) % canvas.width;
      
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const idx = ((blockY + y) * canvas.width + (blockX + x)) * 4;
          const value = Math.max(0, Math.min(255, Math.round(blocks[i][y][x])));
          imageData.data[idx] = value;
          imageData.data[idx + 1] = value;
          imageData.data[idx + 2] = value;
          imageData.data[idx + 3] = 255;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob!)));
  }

  // Extract message from DCT coefficients
  public static async decode(imageFile: File): Promise<string> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const blocks = this.imageToBlocks(imageData);
    
    // Extract bits from DCT coefficients
    let bits = '';
    for (let i = 0; i < blocks.length; i++) {
      const dctBlock = this.dct2d(blocks[i]);
      bits += dctBlock[4][4] > 0 ? '1' : '0';
      if (bits.length >= 800) break; // Limit message size
    }
    
    // Convert bits to text
    let message = '';
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8);
      if (byte.length === 8) {
        const charCode = parseInt(byte, 2);
        if (charCode === 0) break; // Stop at null terminator
        message += String.fromCharCode(charCode);
      }
    }
    
    return message;
  }
}