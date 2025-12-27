// For registration (call from admin.html after login)
async function registerBiometric() {
  try {
    const res = await fetch('/api/register-biometric', { method: 'GET', headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } });
    const { challenge } = await res.json();
    const publicKey = {
      challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
      rp: { name: 'YourApp' },
      user: { id: Uint8Array.from('user-id', c => c.charCodeAt(0)), name: 'username', displayName: 'User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }]
    };
    const credential = await navigator.credentials.create({ publicKey });
    await fetch('/api/register-biometric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      body: JSON.stringify(credential)
    });
    alert('Biometric registered');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

// For biometric login (call from login.html)
async function loginBiometric(username) { // Pass username if needed for multi-user
  try {
    const res = await fetch('/api/login-biometric', { method: 'GET' });
    const { challenge } = await res.json();
    const publicKey = {
      challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
      allowCredentials: [] // Fetch from server if multiple
    };
    const assertion = await navigator.credentials.get({ publicKey });
    const loginRes = await fetch('/api/login-biometric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assertion, username })
    });
    if (loginRes.ok) {
      const { token } = await loginRes.json();
      localStorage.setItem('jwt', token);
      window.location.href = 'index.html';
    } else {
      alert('Biometric login failed');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}
