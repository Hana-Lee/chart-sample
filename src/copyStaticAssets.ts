import * as shell from 'shelljs';

shell.cp('-R', './src/public/javascripts/app.js', './dist/public/javascripts/app.js');
shell.cp('-R', './src/public/fonts', './dist/public/');
shell.cp('-R', './src/public/images', './dist/public/');
shell.cp('-R', './src/data.json', './dist/data.json');
shell.cp('-R', './src/manifest.json', './dist/public/javascripts/manifest.json');
