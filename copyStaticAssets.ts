import * as shell from 'shelljs';

// shell.cp('-R', 'src/public/javascripts/app.js', 'dist/public/javascripts/app.js');
shell.cp('-R', 'src/public/javascripts/main.js', 'dist/public/javascripts/main.js');
// shell.cp('-Rf', 'src/public/javascripts', 'dist/public/javascripts');
shell.cp('-Rf', 'src/public/fonts', 'dist/public/');
shell.cp('-Rf', 'src/public/images', 'dist/public/');
shell.cp('-Rf', 'src/data.json', 'dist/data.json');
shell.cp('-Rf', 'src/manifest.json', 'dist/public/javascripts/manifest.json');
