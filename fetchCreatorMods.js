const https = require('https');
const fs = require('fs');
const path = require('path');

// Steam Creator ID à utiliser
const CREATOR_ID = '76561198041411600';

// Project Zomboid's Steam App ID
const APP_ID = 108600;

// API Steam
const steamApiBaseUrl = 'https://api.steampowered.com';
const steamApiKey = 'A228ED13FF86421919AC19B3E99C770D'; // Utilisez la même clé que dans vos autres scripts

// Create a date string for log files
const now = new Date();
const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format
const logFileName = `creator-mods-${dateString}.log`;
const logFilePath = path.join(__dirname, logFileName);

// Setup logging to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(message); // Console output without timestamp for readability
  fs.appendFileSync(logFilePath, logMessage + '\n'); // File output with timestamp
}

// Initialize log file
fs.writeFileSync(logFilePath, `[${now.toISOString()}] === Project Zomboid Mods by Creator ${CREATOR_ID} (${dateString}) ===\n\n`);

/**
 * Utilise ISteamPublishedFileService/QueryFiles pour récupérer les IDs des mods d'un créateur spécifique
 * Beaucoup plus direct et ciblé que les autres méthodes
 */
function getCreatorModIDs(creatorId, page = 1, limit = 100) {
  return new Promise((resolve, reject) => {
    const url = `${steamApiBaseUrl}/IPublishedFileService/QueryFiles/v1/?key=${steamApiKey}&page=${page}&numperpage=${limit}&creator=${creatorId}&appid=${APP_ID}&return_metadata=true&return_short_description=true`;
    
    log(`Récupération des IDs des mods du créateur ${creatorId}, page ${page}...`);
    
    https.get(url, (res) => {
      let data = '';
      
      log(`Statut HTTP: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data.trim().startsWith('<')) {
            return reject(new Error('Réponse HTML reçue au lieu de JSON. Vérifiez votre clé API.'));
          }
          
          const response = JSON.parse(data);
          
          if (response && response.response && response.response.publishedfiledetails) {
            resolve(response.response);
          } else {
            reject(new Error('Format de réponse API invalide'));
          }
        } catch (error) {
          log(`Erreur d'analyse JSON: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      log(`Erreur de requête: ${error.message}`);
      reject(error);
    });
  });
}

/**
 * Récupère les détails complets de plusieurs mods par leurs IDs
 */
function getPublishedFileDetails(publishedFileIds) {
  return new Promise((resolve, reject) => {
    if (!publishedFileIds || publishedFileIds.length === 0) {
      return resolve({ publishedfiledetails: [] });
    }
    
    // Construction de la requête POST
    const postData = new URLSearchParams();
    postData.append('itemcount', publishedFileIds.length);
    
    // Ajout de chaque ID à la requête
    publishedFileIds.forEach((id, index) => {
      postData.append(`publishedfileids[${index}]`, id);
    });
    
    const postDataString = postData.toString();
    
    const options = {
      hostname: 'api.steampowered.com',
      path: '/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postDataString)
      }
    };
    
    log(`Récupération des détails pour ${publishedFileIds.length} mods...`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response && response.response && response.response.publishedfiledetails) {
            // Filtrer pour ne garder que les mods de Project Zomboid
            const pzMods = response.response.publishedfiledetails.filter(
              mod => mod.consumer_app_id == APP_ID
            );
            
            resolve({ publishedfiledetails: pzMods });
          } else {
            reject(new Error('Format de réponse API invalide'));
          }
        } catch (error) {
          log(`Erreur d'analyse JSON: ${error.message}`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`Erreur de requête: ${error.message}`);
      reject(error);
    });
    
    // Envoi des données
    req.write(postDataString);
    req.end();
  });
}

/**
 * Récupère les informations utilisateur pour afficher le nom du créateur
 */
function getCreatorInfo(creatorId) {
  return new Promise((resolve, reject) => {
    const url = `${steamApiBaseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${creatorId}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.response && response.response.players && response.response.players.length > 0) {
            resolve(response.response.players[0]);
          } else {
            reject(new Error(`Informations créateur non trouvées pour ID: ${creatorId}`));
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
 * Fonction principale pour récupérer tous les mods
 */
async function fetchAllCreatorMods() {
  log(`Récupération des mods pour le Creator ID: ${CREATOR_ID}`);
  
  try {
    // Récupérer les informations du créateur d'abord
    const creatorInfo = await getCreatorInfo(CREATOR_ID);
    log(`\n=== Informations Créateur ===`);
    log(`Nom: ${creatorInfo.personaname}`);
    log(`URL Profil: ${creatorInfo.profileurl}`);
    
    // Récupérer d'abord les IDs des mods du créateur
    const modIdsResponse = await getCreatorModIDs(CREATOR_ID);
    const modItems = modIdsResponse.publishedfiledetails || [];
    
    if (modItems.length === 0) {
      log('Aucun mod trouvé pour ce créateur.');
      return;
    }
    
    log(`Trouvé ${modItems.length} mods associés au créateur.`);
    
    // Extraire les IDs des mods
    const modIds = modItems.map(item => item.publishedfileid);
    
    // Récupérer les détails complets des mods
    const detailsResponse = await getPublishedFileDetails(modIds);
    const mods = detailsResponse.publishedfiledetails || [];
    
    if (mods.length === 0) {
      log('Aucun détail de mod trouvé.');
      return;
    }
    
    log(`Récupéré les détails pour ${mods.length} mods.`);
    
    // Sauvegarder tous les mods dans un fichier JSON
    const outputFileName = `creator-${CREATOR_ID}-mods-${dateString}.json`;
    fs.writeFileSync(outputFileName, JSON.stringify(mods, null, 2));
    log(`Données sauvegardées dans ${outputFileName}`);
    
    // Afficher un résumé des mods
    logModsSummary(mods, creatorInfo.personaname);
    
  } catch (error) {
    log(`Erreur: ${error.message}`);
  }
}

/**
 * Affiche un résumé des mods
 */
function logModsSummary(mods, creatorName) {
  log(`\n=== Résumé des Mods par ${creatorName} ===`);
  
  // Trier par nombre d'abonnements
  const byPopularity = [...mods].sort((a, b) => b.subscriptions - a.subscriptions);
  
  // Trier par date de création (plus récent en premier)
  const byDate = [...mods].sort((a, b) => b.time_created - a.time_created);
  
  // Afficher les mods les plus populaires
  log(`\n-- Mods les plus populaires --`);
  byPopularity.slice(0, 10).forEach((mod, index) => {
    log(`${index + 1}. ${mod.title} - ${mod.subscriptions.toLocaleString()} abonnés`);
  });
  
  // Afficher les mods les plus récents
  log(`\n-- Mods les plus récents --`);
  byDate.slice(0, 10).forEach((mod, index) => {
    log(`${index + 1}. ${mod.title} - Publié le ${new Date(mod.time_created * 1000).toLocaleDateString()}`);
  });
  
  // Regrouper par tags
  const tagCount = {};
  mods.forEach(mod => {
    if (mod.tags) {
      mod.tags.forEach(tag => {
        const tagName = tag.tag;
        tagCount[tagName] = (tagCount[tagName] || 0) + 1;
      });
    }
  });
  
  // Afficher les tags les plus courants
  log(`\n-- Tags les plus utilisés --`);
  Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tag, count], index) => {
      log(`${index + 1}. ${tag}: ${count} mods`);
    });
}

// Lancer le script
fetchAllCreatorMods(); 