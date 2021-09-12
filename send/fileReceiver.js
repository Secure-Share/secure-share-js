import Keychain from './keychain';
import {  streamToArrayBuffer, b64ToArray } from './utils';

async function decryptMetadata(secretKey, metadata) {
    const keychain = new Keychain(secretKey);
    const meta = await keychain.decryptMetadata(b64ToArray(metadata));
    return meta;
}

async function decryptFile(secretKey, file, metadata) {
    const keychain = new Keychain(secretKey);
    const plaintext = keychain.decryptStream(file)
    return await streamToArrayBuffer(plaintext, metadata.size)
}

async function saveFile(file) {
  return new Promise(function(resolve, reject) {
    const dataView = new DataView(file.plaintext);
    const blob = new Blob([dataView], { type: file.type });

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, file.name);
      return resolve();
    } else if (/iPhone|fxios/i.test(navigator.userAgent)) {
      // This method is much slower but createObjectURL
      // is buggy on iOS
      const reader = new FileReader();
      reader.addEventListener('loadend', function() {
        if (reader.error) {
          return reject(reader.error);
        }
        if (reader.result) {
          const a = document.createElement('a');
          a.href = reader.result;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
        }
        resolve();
      });
      reader.readAsDataURL(blob);
    } else {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setTimeout(resolve, 100);
    }
  });
}

export { saveFile, decryptMetadata, decryptFile }
