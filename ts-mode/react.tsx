import React from '../packages/react';
import ReactDom from '../packages/react-dom';

const App = () => {
	const showLog = () => {
		console.log('click');
	};
	return (
		<div onClick={showLog}>
			<span></span>
			<span></span>
			<span></span>
			<span key='3'>lsf</span>
		</div>
	);
};

ReactDom.render(<App />, document.querySelector('#app')!);
