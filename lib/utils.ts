// This function generates a short code following the project rule: [A-Za-z0-9]{6,8}.
export function generateShortCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Randomly choose a length between 6 and 8 characters (inclusive)
  const length = Math.floor(Math.random() * 3) + 6; 
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// A simple helper function to validate URL format before saving
export function isValidUrl(url: string): boolean {
  try {
    // Attempt to create a URL object. If it fails, the URL is invalid.
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}