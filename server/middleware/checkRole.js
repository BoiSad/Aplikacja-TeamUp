// Middleware do sprawdzania roli użytkownika
function checkRole(role) {
    return (req, res, next) => {
        // Zakładając, że użytkownik jest zapisany w req.user po logowaniu
        if (!req.user || req.user.role !== role) {
            return res.status(403).send('Brak uprawnień');
        }
        next();
    };
}

module.exports = checkRole;
