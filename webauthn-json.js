/** Fixed WebAuthn-JSON Wrapper */
(function(window) {
    'use strict';

    function base64ToBuffer(base64) {
        const bin = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        return buf.buffer;
    }

    function bufferToBase64(buf) {
        const bin = String.fromCharCode.apply(null, new Uint8Array(buf));
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    window.webauthnJson = {
        create: async (options) => {
            const pk = options.publicKey;
            // Convert strings to buffers for the browser
            pk.challenge = base64ToBuffer(pk.challenge);
            pk.user.id = base64ToBuffer(pk.user.id);
            if (pk.excludeCredentials) {
                pk.excludeCredentials.forEach(c => c.id = base64ToBuffer(c.id));
            }

            const cred = await navigator.credentials.create({ publicKey: pk });
            
            return {
                id: cred.id,
                rawId: bufferToBase64(cred.rawId),
                type: cred.type,
                response: {
                    attestationObject: bufferToBase64(cred.response.attestationObject),
                    clientDataJSON: bufferToBase64(cred.response.clientDataJSON)
                }
            };
        },
        get: async (options) => {
            const pk = options.publicKey;
            pk.challenge = base64ToBuffer(pk.challenge);
            if (pk.allowCredentials) {
                pk.allowCredentials.forEach(c => c.id = base64ToBuffer(c.id));
            }

            const assertion = await navigator.credentials.get({ publicKey: pk });

            return {
                id: assertion.id,
                rawId: bufferToBase64(assertion.rawId),
                type: assertion.type,
                response: {
                    authenticatorData: bufferToBase64(assertion.response.authenticatorData),
                    clientDataJSON: bufferToBase64(assertion.response.clientDataJSON),
                    signature: bufferToBase64(assertion.response.signature),
                    userHandle: assertion.response.userHandle ? bufferToBase64(assertion.response.userHandle) : null
                }
            };
        }
    };
})(window);