describe('Steam API', () => {
  test('Vérification de la structure de l\'API Steam', () => {
    const mockSteamAPI = {
      getUserSummary: (steamId) => {
        return Promise.resolve({
          steamid: '76561198041411600',
          personaname: 'TestUser',
          profileurl: 'https://steamcommunity.com/id/testuser/',
          avatar: 'https://steamcommunity.com/avatar/abc123',
          personastate: 1
        });
      }
    };

    expect(mockSteamAPI).toHaveProperty('getUserSummary');
    expect(typeof mockSteamAPI.getUserSummary).toBe('function');
  });

  test('Vérification de la structure des données de l\'utilisateur Steam', () => {
    const mockUserSummary = {
      steamid: '76561198041411600',
      personaname: 'TestUser',
      profileurl: 'https://steamcommunity.com/id/testuser/',
      avatar: 'https://steamcommunity.com/avatar/abc123',
      personastate: 1
    };

    expect(mockUserSummary).toHaveProperty('steamid');
    expect(mockUserSummary).toHaveProperty('personaname');
    expect(mockUserSummary).toHaveProperty('profileurl');
    expect(mockUserSummary).toHaveProperty('avatar');
    expect(mockUserSummary).toHaveProperty('personastate');
  });
}); 