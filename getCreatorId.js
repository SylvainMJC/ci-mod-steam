const https = require('https');
const readline = require('readline');

const steamApiBaseUrl = 'https://api.steampowered.com';
const steamApiKey = 'A228ED13FF86421919AC19B3E99C770D'; // Utilisez la même clé que dans votre autre script

// Création d'une interface readline pour les saisies utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Récupère les informations d'un utilisateur Steam via le nom d'utilisateur ou l'URL du profil
 */
function getSteamUserInfo(userIdentifier) {
  return new Promise((resolve, reject) => {
    let steamId = userIdentifier;
    
    // Si c'est une URL, essayons d'extraire le nom d'utilisateur ou l'ID
    if (userIdentifier.includes('steamcommunity.com')) {
      const parts = userIdentifier.split('/');
      steamId = parts[parts.length - 1] || parts[parts.length - 2];
    }
    
    // Construire l'URL pour l'API
    const url = `${steamApiBaseUrl}/ISteamUser/ResolveVanityURL/v1/?key=${steamApiKey}&vanityurl=${steamId}`;
    
    console.log(`Recherche d'informations pour l'identifiant: ${steamId}`);
    
    https.get(url, (res) => {
      let data = '';
      
      console.log(`Statut HTTP: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.response && response.response.success === 1) {
            // L'identifiant a été résolu en SteamID64
            const steamId64 = response.response.steamid;
            console.log(`SteamID64 trouvé: ${steamId64}`);
            
            // Maintenant récupérons les détails du profil
            getPlayerSummary(steamId64).then(resolve).catch(reject);
          } else if (/^[0-9]+$/.test(steamId)) {
            // Si l'identifiant semble être un ID numérique valide, essayons de l'utiliser directement
            console.log(`Utilisation de l'ID numérique directement: ${steamId}`);
            getPlayerSummary(steamId).then(resolve).catch(reject);
          } else {
            reject(new Error(`Impossible de résoudre l'identifiant Steam: ${steamId}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Récupère les détails d'un profil Steam à partir du SteamID64
 */
function getPlayerSummary(steamId64) {
  return new Promise((resolve, reject) => {
    const url = `${steamApiBaseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId64}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.response && response.response.players && response.response.players.length > 0) {
            const playerInfo = response.response.players[0];
            resolve(playerInfo);
          } else {
            reject(new Error(`Aucune information trouvée pour le SteamID64: ${steamId64}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Récupère les contenus publiés par un utilisateur
 */
function getUserPublishedFiles(steamId64) {
  return new Promise((resolve, reject) => {
    // Pour Project Zomboid, appID = 108600
    const url = `${steamApiBaseUrl}/IUserPublishedFiles/GetUserPublishedFiles/v1/?key=${steamApiKey}&steamid=${steamId64}&numperpage=10&appid=108600`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Fonction principale
async function getCreatorInfo() {
  rl.question('Entrez votre nom d\'utilisateur Steam ou l\'URL de votre profil: ', async (input) => {
    try {
      console.log('Recherche de vos informations Steam...');
      const userInfo = await getSteamUserInfo(input);
      
      console.log('\n=== Informations du Profil ===');
      console.log(`Nom: ${userInfo.personaname}`);
      console.log(`SteamID64 (Creator ID): ${userInfo.steamid}`);
      console.log(`URL du profil: ${userInfo.profileurl}`);
      
      console.log('\nRecherche de vos contenus publiés pour Project Zomboid...');
      try {
        const publishedFiles = await getUserPublishedFiles(userInfo.steamid);
        
        if (publishedFiles && publishedFiles.response && publishedFiles.response.publishedfiledetails) {
          const files = publishedFiles.response.publishedfiledetails;
          
          console.log(`\n=== Vos Contenus Publiés (${files.length}) ===`);
          files.forEach((file, index) => {
            console.log(`${index + 1}. ${file.title} (ID: ${file.publishedfileid})`);
          });
        } else {
          console.log('Aucun contenu publié trouvé pour Project Zomboid.');
        }
      } catch (error) {
        console.log('Erreur lors de la recherche de contenus publiés:', error.message);
      }
      
      console.log('\n=== Comment utiliser votre Creator ID ===');
      console.log(`Pour récupérer tous vos mods, utilisez votre SteamID64: ${userInfo.steamid}`);
      console.log('Vous pouvez l\'utiliser dans l\'API Workshop comme "creator" parameter pour voir tous vos mods.');
      
    } catch (error) {
      console.error('Erreur:', error.message);
      console.log('\nAstuces pour trouver votre Creator ID manuellement:');
      console.log('1. Connectez-vous à Steam et allez sur votre profil');
      console.log('2. Votre Creator ID est le numéro dans l\'URL: steamcommunity.com/profiles/[VOTRE_ID]');
      console.log('3. Ou allez sur l\'un de vos mods publiés et cherchez "creator" dans l\'URL'); 
    } finally {
      rl.close();
    }
  });
}

// Exécuter la fonction principale
getCreatorInfo(); 