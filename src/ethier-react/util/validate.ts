// Check if an email is valid
export function validateEmail(email: string) {
  var reg = /\S+@\S+\.\S+/;
  return reg.test(email);
}