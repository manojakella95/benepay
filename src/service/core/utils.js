import moment from "moment";
import axios from "axios";
import * as constants from "../../config/constants";
import { config } from "../../config/config";
import { FileType } from '../../enum/common.enum';
import CryptoJS from 'crypto-js';

export default class Utils {

    static AES_KEY_SIZE = 32;
    static IV_LENGTH = 12;
    static GCM_TAG_LENGTH = 16;
    static ENC_ALGO = "AES-GCM";

    static getFormattedDate(date) {
        if (!date) {
            return ''
        }
        return moment(date).format('MMM D YYYY, h:mm A');
    }

    static getFormattedDate2(date) {
        if (!date) {
            return ''
        }
        return moment(date).format('DD-MM-YYYY h:mm A');
    }

    static getFormattedDate3(date) {
        if (!date) {
            return ''
        }
        return moment(date).format('DD MMM YYYY');
    }

    static getFormattedDateCalendar(date) {
        if (!date) {
            return ''
        }
        return moment(date).format('MMM D YYYY');
    }

    static getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    static getVersion() {
        const v = config.version;
        return `${v.majorRevision}.${v.minorRevision}.${v.bugFixes}`
    }

    static getFormattedAddress(residentDetails) {
        return [residentDetails.address1,
        residentDetails.address2,
        residentDetails.cityOrTown,
        residentDetails.countyOrState,
        residentDetails.claimedCountry?.text,
        residentDetails.postCode].filter(Boolean).join(", ")
    }


    static encryptDataByCBC(data, secretKey) {
        if (!secretKey) {
            return null;
        }

        // Generate a random IV (Initialization Vector) for CBC mode
        const iv = CryptoJS.enc.Utf8.parse('1234567890123456'); // Fixed 16-byte IV (you can generate it randomly and send it with the data)

        // Encrypt using AES CBC mode with PKCS7 padding
        const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(secretKey), { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

        // Return the ciphertext in Base64 format (ciphertext + IV, concatenated, so the receiver can extract the IV)
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64url) + ":" + iv.toString(CryptoJS.enc.Base64url);
    }

    static decryptDataByCBC = async (encryptedData) => {
        try {
            // Split the input data into ciphertext and IV
            const [ciphertextBase64, ivBase64] = encryptedData.split(':');
            const ciphertext = Uint8Array.from(atob(this.urlSafeBase64ToBase64(ciphertextBase64)), c => c.charCodeAt(0));
            const iv = Uint8Array.from(atob(this.urlSafeBase64ToBase64(ivBase64)), c => c.charCodeAt(0));

            // Get the secret key from the environment or a constant (ensure it's 16 bytes for AES-128)
            const secretKey = process.env.REACT_APP_BENE_COLLECT_PAYMENT_ENCRYPTION_KEY; // Or use a constant
            if (!secretKey) {
                throw new Error('Secret key not provided!');
            }

            // Encode the secret key as a Uint8Array (it needs to be 16 bytes for AES-128)
            const key = new TextEncoder().encode(secretKey.padEnd(16, ' '));

            // Import the key for AES encryption
            const cryptoKey = await window.CryptoJS.subtle.importKey(
                'raw',
                key,
                { name: 'AES-CBC' },
                false,
                ['decrypt']
            );

            // Perform decryption
            const decrypted = await window.CryptoJS.subtle.decrypt(
                {
                    name: 'AES-CBC',
                    iv: iv,
                },
                cryptoKey,
                ciphertext
            );

            // Convert the decrypted data into a string (assuming UTF-8 encoding)
            return new TextDecoder().decode(decrypted);
        } catch (err) {
            console.log('Decryption failed: ' + err.message);

        }
    }

    static async encryptData(data, key) {
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH)); // AES-GCM standard IV size
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);

        const keyBytes = new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
        if (![this.AES_KEY_SIZE].includes(keyBytes.length)) {
            throw new Error(`Invalid key length: ${keyBytes.length} bytes. Must be 16 (AES-128) or 32 (AES-256).`);
        }
    
        // Convert key string to a cryptographic key
        const keyBuffer = await crypto.subtle.importKey(
            "raw",
            keyBytes, 
            { name: this.ENC_ALGO },
            false,
            ["encrypt"]
        );
    
        // Encrypt the data
        const encrypted = await crypto.subtle.encrypt(
            { name: this.ENC_ALGO, iv: iv },
            keyBuffer,
            encodedData
        );

        // Combine IV + Encrypted Data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0); // IV first
        combined.set(new Uint8Array(encrypted), iv.length); // Then encrypted data

        // Encode to Base64
        const base64 = btoa(String.fromCharCode(...combined))
        .replace(/\+/g, "-") // Replace '+' with '-'
        .replace(/\//g, "_") // Replace '/' with '_'
        .replace(/=+$/, "");

        return base64;
    }
    
    static async decryptData(encryptedData) {

        try {

            encryptedData = encryptedData.replace(/-/g, '+').replace(/_/g, '/');

            const encryptedBuffer = new Uint8Array(atob(encryptedData).split("").map(c => c.charCodeAt(0))); // Decode data

            const iv = encryptedBuffer.slice(0, this.IV_LENGTH); // First 12 bytes = IV
            const encryptedBufferData = encryptedBuffer.slice(this.IV_LENGTH);

            if (iv.length !== this.IV_LENGTH){
                throw new Error({messages: "Invalid IV"});
            }

            const key = process.env.REACT_APP_BENE_COLLECT_PAYMENT_ENCRYPTION_KEY;
    
            const keyBytes = new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
            if (![this.AES_KEY_SIZE].includes(keyBytes.length)) {
                throw new Error(`Invalid key length: ${keyBytes.length} bytes. Must be 16 (AES-128) or 32 (AES-256).`);
            }
    
            // Convert key string to a cryptographic key
            const keyBuffer = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: this.ENC_ALGO },
                false,
                ["decrypt"]
            );
        
            // Decrypt the data
            const decrypted = await crypto.subtle.decrypt(
                { name: this.ENC_ALGO, iv: iv },
                keyBuffer,
                encryptedBufferData
            );
        
            let da = new TextDecoder().decode(decrypted);
            return da;
        } catch (error) {
            console.log("ERROR", error, error.message);
        }
    }

    static urlSafeBase64ToBase64(base64url) {
        return base64url
            .replace(/-/g, '+')   // Replace "-" with "+"
            .replace(/_/g, '/')   // Replace "_" with "/"
            .concat('='.repeat((4 - base64url.length % 4) % 4)); // Add padding if necessary
    }

    static isNullOrEmpty(data) {
        return !(data && data.length != 0);
    }

    static isMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /iphone|ipod|android|webos|blackberry|windows phone|opera mini|mobile|tablet/.test(userAgent);
    }

}
