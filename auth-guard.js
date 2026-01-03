(function() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const currentPage = window.location.pathname.split("/").pop();

    function logout() {
        // DO NOT use localStorage.clear() - it deletes biometric registration
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
    }

    if (!token && currentPage !== 'login.html') {
        logout();
        return;
    }

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = Date.now() >= payload.exp * 1000;

            if (isExpired && navigator.onLine) {
                alert("Sitzung abgelaufen. Bitte neu einloggen.");
                logout();
            }

            if (currentPage === 'admin.html' && role !== 'admin') {
                window.location.href = 'index.html';
            }
        } catch (e) {
            logout();
        }
    }
})();