/** @github/webauthn-json v2.1.1 (Global Version) */
(function(exports) {
    'use strict';
    function base64urlToBuffer(baseurl64String) {
        const base64 = baseurl64String.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (base64.length % 4)) % 4;
        const padded = base64.padEnd(base64.length + padLength, '=');
        const binary = atob(padded);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) { buffer[i] = binary.charCodeAt(i); }
        return buffer.buffer;
    }
    function bufferToBase64url(buffer) {
        const bytes = new Uint8Array(buffer);
        let str = '';
        for (const charCode of bytes) { str += String.fromCharCode(charCode); }
        const base64 = btoa(str);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    function recursive(obj, callback) {
        if (obj instanceof ArrayBuffer) { return callback(obj); }
        if (Array.isArray(obj)) { return obj.map(item => recursive(item, callback)); }
        if (obj !== null && typeof obj === 'object') {
            const newObj = {};
            for (const key in obj) { newObj[key] = recursive(obj[key], callback); }
            return newObj;
        }
        return obj;
    }
    exports.create = async function(options) {
        const credentialOptions = recursive(options.publicKey, base64urlToBuffer);
        const credential = await navigator.credentials.create({ publicKey: credentialOptions });
        return {
            id: credential.id,
            rawId: bufferToBase64url(credential.rawId),
            type: credential.type,
            response: {
                attestationObject: bufferToBase64url(credential.response.attestationObject),
                clientDataJSON: bufferToBase64url(credential.response.clientDataJSON)
            }
        };
    };
    exports.get = async function(options) {
        const credentialOptions = recursive(options.publicKey, base64urlToBuffer);
        const assertion = await navigator.credentials.get({ publicKey: credentialOptions });
        return {
            id: assertion.id,
            rawId: bufferToBase64url(assertion.rawId),
            type: assertion.type,
            response: {
                authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
                clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
                signature: bufferToBase64url(assertion.response.signature),
                userHandle: assertion.response.userHandle ? bufferToBase64url(assertion.response.userHandle) : null
            }
        };
    };
    window.webauthnJson = exports;
})({});