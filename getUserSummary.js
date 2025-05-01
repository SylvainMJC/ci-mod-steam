import SteamAPI from 'steamapi';



const steam = new SteamAPI('A228ED13FF86421919AC19B3E99C770D');

const user = steam.getUserSummary('76561198041411600').then(summary => {
	console.log(summary);
});

console.log(user);

