import crypto from "crypto";

const ALGORITHM_NAME = "aes-256-cbc";
const ALGORITHM_NONCE_SIZE = 16;
const ALGORITHM_TAG_SIZE = 16;

function simple_encrypt(plaintext, password) {
  // Generate a 96-bit nonce using a CSPRNG.
  const algorithm = "aes-192-cbc";

  // Getting key for the cipher object
  const key = crypto.scryptSync(password, "salt", 24);

  // Creating and initializing the static iv
  const iv = Buffer.alloc(16, 0);

  // Creating and initializing the cipher object
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Getting buffer value
  // by using final() method
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function simple_decrypt(encryptedText, password) {
  // Create buffers of nonce, ciphertext and tag.
  const algorithm = "aes-192-cbc";

  // Getting key for the cipher object
  const key = crypto.scryptSync(password, "salt", 24);

  // Creating and initializing the static iv
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const mysecret_secret = "laliluAljalaliluAljalaliluAljala";
//const mysecret_secret = "Password used to generate key";

export const encrypt = (text) => {
  return simple_encrypt(text, mysecret_secret);
};

export const decrypt = (encryptedText) => {
  return simple_decrypt(encryptedText, mysecret_secret);
};

const SYMBOLS = "$*?-!@#&><".split("");
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = "0123456789".split("");
const ALL_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");

function getRandomInt(max) {
  return Math.floor(Math.random() * (max - 1));
}

export const getPassword = (length, withSymbols) => {
  const usedLength = length <= 4 ? 4 : length;
  const password = new Array(usedLength);

  let idx = 0;
  //get the requirements out of the way
  password[idx++] = LOWERCASE[getRandomInt(LOWERCASE.length)];
  password[idx++] = UPPERCASE[getRandomInt(UPPERCASE.length)];
  password[idx++] = NUMBERS[getRandomInt(NUMBERS.length)];
  if (withSymbols) password[idx++] = SYMBOLS[getRandomInt(SYMBOLS.length)];

  //populate rest of the password with random chars
  for (let i = idx; i < length; i++) {
    password[i] = ALL_CHARS[getRandomInt(ALL_CHARS.length)];
  }

  //shuffle it up
  for (let i = 0; i < password.length; i++) {
    const randomPosition = getRandomInt(password.length);
    const temp = password[i];
    password[i] = password[randomPosition];
    password[randomPosition] = temp;
  }

  return password.join("");
};

// Example
