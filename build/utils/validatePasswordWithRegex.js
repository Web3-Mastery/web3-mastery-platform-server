const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/;
export function validatePasswordWithRegex(password) {
    const isPasswordPatternValid = passwordRegex.test(password);
    return isPasswordPatternValid;
}
