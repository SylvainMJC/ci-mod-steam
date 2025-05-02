/**
 * Fonction pour additionner deux nombres
 * @param {number} a - Premier nombre
 * @param {number} b - Deuxième nombre
 * @returns {number} - Somme des deux nombres
 */
export function addNumbers(a, b) {
  return a + b;
}

/**
 * Fonction pour vérifier si un nombre est pair
 * @param {number} num - Nombre à vérifier
 * @returns {boolean} - true si le nombre est pair, false sinon
 */
export function isEven(num) {
  return num % 2 === 0;
}

/**
 * Fonction pour formater un nom d'utilisateur Steam
 * @param {string} username - Nom d'utilisateur
 * @returns {string} - Nom d'utilisateur formaté
 */
export function formatSteamUsername(username) {
  if (!username || typeof username !== 'string') {
    return '';
  }
  return username.trim().toLowerCase();
} 