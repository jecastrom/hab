(function() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const currentPage = window.location.pathname.split("/").pop();

    function logout() {
        localStorage.clear();
        window.location.href = 'login.html';
    }

    if (!token) {
        logout();
        return;
    }

    try {
        // Decode JWT to check expiry (without a library)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() >= payload.exp * 1000;

        // "Technician Logic": If expired but OFFLINE, allow access. 
        // If expired and ONLINE, force logout.
        if (isExpired && navigator.onLine) {
            alert("Sitzung abgelaufen. Bitte neu einloggen.");
            logout();
        }

        // Role Protection for Admin Page
        if (currentPage === 'admin.html' && role !== 'admin') {
            window.location.href = 'index.html';
        }
    } catch (e) {
        logout();
    }
})();