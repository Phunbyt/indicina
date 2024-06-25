export const generateRandomString = (length: number): string => {
  const randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  while (result.length < length) {
    const randomIndex = Math.floor(Math.random() * randomChars.length);
    result += randomChars[randomIndex];
  }

  return result;
};
