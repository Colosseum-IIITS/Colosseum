const fs = require('fs');
const path = require('path');

const plan = {
  // landing
  'About.js': 'landing',
  'AnimatedTitle.js': 'landing',
  'Button.js': 'landing',
  'CanvasCursor.js': 'landing',
  'Contact.js': 'landing',
  'Features.js': 'landing',
  'Footer.js': 'landing',
  'Hero.js': 'landing',
  'Story.js': 'landing',
  'VideoPreview.js': 'landing',

  // admin
  'AdminPanel.jsx': 'admin',
  'BanHistory.jsx': 'admin',
  'OrganizerManagement.jsx': 'admin',
  'PlayerManagement.jsx': 'admin',
  'ReportedOrganisers.jsx': 'admin',
  'ReportedOrganizers.jsx': 'admin',
  'ReportedTeams_Vihaan.jsx': 'admin',

  // layout
  'Navbar.js': 'layout',
  'NavProfile.jsx': 'layout',
  'app-sidebar.jsx': 'layout',
  'top-bar.js': 'layout',
  'top-bar.jsx': 'layout',

  // player
  'PlayerDetails.jsx': 'player',
  'PlayerRanking.jsx': 'player',
  'PlayerResults.jsx': 'player',
  'searchProf.jsx': 'player',
  'TournamentsPlayed.jsx': 'player',
  'TournamentsWon.jsx': 'player',
  'WinPercentage.jsx': 'player',
  'FollowedOrganisers.js': 'player',
  'NoOfOrgsFollowing.jsx': 'player',

  // org
  'ActiveTournaments.jsx': 'org',
  'CompletedTournaments.jsx': 'org',
  'PendingTournaments.jsx': 'org',
  'PrizePoolChart.jsx': 'org',
  'RegistrationsOverTime.jsx': 'org',
  'TopOrganisersByTournaments.jsx': 'org',
  'TournamentStatsCards.jsx': 'org',

  // providers
  'mode-toggle.js': 'providers',
  'theme-provider.js': 'providers',

  // ui
  'ScrollableTable.jsx': 'ui',
};

const componentsDir = path.join(__dirname, '..', 'components');

// 1. Create directories and Move files
console.log('--- Moving Files ---');
Object.entries(plan).forEach(([file, folder]) => {
  const source = path.join(componentsDir, file);
  const destDir = path.join(componentsDir, folder);
  const dest = path.join(destDir, file);
  
  if (fs.existsSync(source)) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(source, dest);
    console.log(`Moved: ${file} -> ${folder}/${file}`);
  }
});

// 2. Update imports across all .js/.jsx/.ts/.tsx files
console.log('\n--- Updating Imports ---');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const foldersToScan = ['app', 'components', 'hooks', 'context', 'utils', 'lib'].map(f => path.join(__dirname, '..', f));

foldersToScan.forEach(f => {
  walkDir(f, filePath => {
    if (filePath.match(/\.(js|jsx|ts|tsx)$/)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      Object.entries(plan).forEach(([file, folder]) => {
        const fileWithoutExt = file.replace(/\.(js|jsx|ts|tsx)$/, '');
        
        // Standard component references. 
        // We match /components/FileName or /components/FileName.ext
        const regexes = [
          new RegExp(`(components)/${fileWithoutExt}(['"\`])`, 'g'),
          new RegExp(`(components)/${fileWithoutExt}\\.(?:js|jsx|ts|tsx)(['"\`])`, 'g')
        ];

        regexes.forEach(regex => {
          if (regex.test(content)) {
            content = content.replace(regex, `$1/${folder}/${fileWithoutExt}$2`);
            modified = true;
            console.log(`Updated import for ${fileWithoutExt} in ${path.basename(filePath)}`);
          }
        });
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  });
});
console.log('Done!');
