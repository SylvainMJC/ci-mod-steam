import { addNumbers, formatSteamUsername, isEven } from '../utils.js';

describe('Fonctions utilitaires', () => {
  test('addNumbers additionne correctement deux nombres positifs', () => {
    expect(addNumbers(1, 2)).toBe(3);
    expect(addNumbers(5, 7)).toBe(12);
  });

  test('addNumbers fonctionne avec des nombres négatifs', () => {
    expect(addNumbers(-1, -3)).toBe(-4);
    expect(addNumbers(-5, 10)).toBe(5);
  });

  test('isEven détecte correctement les nombres pairs', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(10)).toBe(true);
    expect(isEven(0)).toBe(true);
  });

  test('isEven détecte correctement les nombres impairs', () => {
    expect(isEven(1)).toBe(false);
    expect(isEven(7)).toBe(false);
    expect(isEven(-3)).toBe(false);
  });

  test('formatSteamUsername formate correctement les noms d\'utilisateur', () => {
    expect(formatSteamUsername('User123')).toBe('user123');
    expect(formatSteamUsername('  JohnDoe  ')).toBe('johndoe');
  });

  test('formatSteamUsername gère correctement les entrées invalides', () => {
    expect(formatSteamUsername('')).toBe('');
    expect(formatSteamUsername(null)).toBe('');
    expect(formatSteamUsername(undefined)).toBe('');
  });
}); 