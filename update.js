const fs = require('fs');
const { exec } = require('child_process');

const name = 'package.json';

fs.readFile(name, (err, data) => {
	if (err) {
		process.exit(0);
	}
	const obj = JSON.parse(data.toString());
	const list = [...Object.keys(obj.devDependencies || {}), ...Object.keys(obj.dependencies || {})];
	if (list.length) {
		exec(`npm install ${list.join(' ')}`);
	}
});
