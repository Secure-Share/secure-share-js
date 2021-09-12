import Keychain from './keychain';
import { encryptedSize, arrayToB64, streamToArrayBuffer } from './utils';
import { blobStream, concatStream } from './streams';

export default async function prepareForUpload(blob) {
    let keychain = new Keychain();
    const totalSize = encryptedSize(blob.size);
    const encStream = await keychain.encryptStream(concatStream([blobStream(blob)]));
    const rawMetadata = await keychain.encryptMetadata(blob);
    const secretKey = arrayToB64(keychain.rawSecret);

    const content = await streamToArrayBuffer(encStream, totalSize);
    const encryptedBlob = new Blob([content])
    const metadata = arrayToB64(new Uint8Array(rawMetadata))

    return { secretKey, metadata, encryptedBlob }
}
