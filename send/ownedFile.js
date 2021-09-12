import Keychain from './keychain';
import { arrayToB64 } from './utils';

export default class OwnedFile {
  constructor(obj) {
    if (!obj.manifest) {
      throw new Error('invalid file object');
    }
    this.id = obj.id;
    this.url = obj.url;
    this.name = obj.name;
    this.size = obj.size;
    this.manifest = obj.manifest;
    this.time = obj.time;
    this.speed = obj.speed;
    this.createdAt = obj.createdAt;
    this.expiresAt = obj.expiresAt;
    this.ownerToken = obj.ownerToken;
    this.dlimit = obj.dlimit || 1;
    this.dtotal = obj.dtotal || 0;
    this.keychain = new Keychain(obj.secretKey, obj.nonce);
    this._hasPassword = !!obj.hasPassword;
    this.timeLimit = obj.timeLimit;
  }

  get hasPassword() {
    return !!this._hasPassword;
  }

  get expired() {
    return this.dlimit === this.dtotal || Date.now() > this.expiresAt;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      name: this.name,
      size: this.size,
      manifest: this.manifest,
      time: this.time,
      speed: this.speed,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      secretKey: arrayToB64(this.keychain.rawSecret),
      ownerToken: this.ownerToken,
      dlimit: this.dlimit,
      dtotal: this.dtotal,
      hasPassword: this.hasPassword,
      timeLimit: this.timeLimit
    };
  }
}
