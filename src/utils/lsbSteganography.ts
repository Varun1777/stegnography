import CryptoJS from 'crypto-js';

export class LSBSteganography {
  static async encode(file: File, message: string, secretKey: string): Promise<Blob> {
    console.log('Encoding message with key validation');
    const hashedKey = CryptoJS.SHA256(secretKey).toString();
    const messageWithKey = `${hashedKey}|||${message}`;
    
    if (file.type.startsWith('image/')) {
      return this.encodeImage(file, messageWithKey);
    } else if (file.type.startsWith('audio/')) {
      return this.encodeAudio(file, messageWithKey);
    } else if (file.type.startsWith('video/')) {
      return this.encodeVideo(file, messageWithKey);
    }
    
    throw new Error('Unsupported file type');
  }

  static async decode(file: File, secretKey: string): Promise<string> {
    console.log('Decoding message with key validation');
    const hashedInputKey = CryptoJS.SHA256(secretKey).toString();
    
    let encodedData: string;
    if (file.type.startsWith('image/')) {
      encodedData = await this.decodeImage(file);
    } else if (file.type.startsWith('audio/')) {
      encodedData = await this.decodeAudio(file);
    } else if (file.type.startsWith('video/')) {
      encodedData = await this.decodeVideo(file);
    } else {
      throw new Error('Unsupported file type');
    }

    const [storedHash, message] = encodedData.split('|||');
    
    if (storedHash !== hashedInputKey) {
      throw new Error('Invalid secret key');
    }
    
    return message;
  }

  private static async encodeImage(file: File, message: string): Promise<Blob> {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert message to binary
        const binaryMessage = message.split('').map(char => 
          char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('') + '1111111111111110'; // End marker
        
        if (binaryMessage.length > data.length * 3) {
          reject(new Error('Message too long for this image'));
          return;
        }
        
        let binaryIndex = 0;
        for (let i = 0; i < data.length && binaryIndex < binaryMessage.length; i += 4) {
          // Modify RGB channels
          for (let j = 0; j < 3 && binaryIndex < binaryMessage.length; j++) {
            data[i + j] = (data[i + j] & 254) | parseInt(binaryMessage[binaryIndex]);
            binaryIndex++;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private static async decodeImage(file: File): Promise<string> {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let binaryMessage = '';
        let byte = '';
        
        // Extract bits from RGB channels
        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            byte += (data[i + j] & 1).toString();
            if (byte.length === 8) {
              if (byte === '11111111') {
                const nextByte = binaryMessage.slice(-8);
                if (nextByte === '11111110') {
                  resolve(
                    binaryMessage
                      .slice(0, -8)
                      .match(/.{8}/g)!
                      .map(byte => String.fromCharCode(parseInt(byte, 2)))
                      .join('')
                  );
                  return;
                }
              }
              binaryMessage += byte;
              byte = '';
            }
          }
        }
        reject(new Error('No hidden message found'));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private static async encodeAudio(file: File, message: string): Promise<Blob> {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const binaryMessage = message.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('') + '1111111111111110';
    
    const channelData = audioBuffer.getChannelData(0);
    if (binaryMessage.length > channelData.length) {
      throw new Error('Message too long for this audio file');
    }
    
    const modifiedData = new Float32Array(channelData);
    for (let i = 0; i < binaryMessage.length; i++) {
      modifiedData[i] = Math.floor(modifiedData[i] * 10000) / 10000 + 
        (parseInt(binaryMessage[i]) ? 0.0001 : -0.0001);
    }
    
    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    newBuffer.copyToChannel(modifiedData, 0);
    
    const mediaStreamDest = audioContext.createMediaStreamDestination();
    const source = audioContext.createBufferSource();
    source.buffer = newBuffer;
    source.connect(mediaStreamDest);
    
    const mediaRecorder = new MediaRecorder(mediaStreamDest.stream);
    const chunks: BlobPart[] = [];
    
    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/wav' }));
      
      mediaRecorder.start();
      source.start();
      setTimeout(() => mediaRecorder.stop(), (audioBuffer.length / audioBuffer.sampleRate) * 1000);
    });
  }

  private static async decodeAudio(file: File): Promise<string> {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    let binaryMessage = '';
    let byte = '';
    
    for (let i = 0; i < channelData.length; i++) {
      const remainder = Math.abs(channelData[i] * 10000) % 1;
      byte += remainder > 0.5 ? '1' : '0';
      
      if (byte.length === 8) {
        if (byte === '11111111') {
          const nextByte = binaryMessage.slice(-8);
          if (nextByte === '11111110') {
            return binaryMessage
              .slice(0, -8)
              .match(/.{8}/g)!
              .map(byte => String.fromCharCode(parseInt(byte, 2)))
              .join('');
          }
        }
        binaryMessage += byte;
        byte = '';
      }
    }
    
    throw new Error('No hidden message found');
  }

  private static async encodeVideo(file: File, message: string): Promise<Blob> {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 0;
        video.onseeked = async () => {
          ctx.drawImage(video, 0, 0);
          try {
            const encodedFrame = await this.encodeImage(
              await new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob!], 'frame.png', { type: 'image/png' })))),
              message
            );
            resolve(encodedFrame);
          } catch (error) {
            reject(error);
          }
        };
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }

  private static async decodeVideo(file: File): Promise<string> {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 0;
        video.onseeked = async () => {
          ctx.drawImage(video, 0, 0);
          try {
            const message = await this.decodeImage(
              await new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob!], 'frame.png', { type: 'image/png' }))))
            );
            resolve(message);
          } catch (error) {
            reject(error);
          }
        };
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }
}
