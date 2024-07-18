const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/;

export function validatePasswordWithRegex(password: string) {
  const isPasswordPatternValid = passwordRegex.test(password);
  return isPasswordPatternValid;
}
