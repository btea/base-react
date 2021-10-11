const fs = require('fs');
const { exec, spawn } = require('child_process');

const name = 'package.json';

const alternativeCommands = {
	npm: 'install ',
	pnpm: 'install ',
	yarn: 'add ',
};

function getPackageManger() {
	const execPath = process.env.npm_execpath || 'npm';
	if (execPath.includes('yarn')) {
		return 'yarn';
	}
	if (execPath.includes('pnpm')) {
		return 'pnpm';
	}
	if (execPath.includes('npm')) {
		return 'npm';
	}
	return 'npm';
}

fs.readFile(name, (err, data) => {
	if (err) {
		process.exit(0);
	}
	const obj = JSON.parse(data.toString());
	const dep = Object.assign({}, obj.devDependencies, obj.dependencies);
	const list = [...Object.keys(dep)];
	if (list.length) {
		const cmd = getPackageManger() + ' ' + alternativeCommands[getPackageManger()];
		exec(
			`${cmd}${list.join(' ')}`,
			{
				stdio: 'inherit',
				shell: true,
			},
			(err, stdout) => {
				if (err) {
					console.log(err);
				} else {
					console.log(stdout);
				}
			}
		);
	}
});
