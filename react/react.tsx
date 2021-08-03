interface Attrs {
	[key: string]: unknown;
}
interface Eleme {
	type: string;
	props: {
		children: Eleme[];
		[key: string]: unknown;
	};
}

interface fiber {
	dom: HTMLElement;
}

function createElement(tag: string, attrs: Attrs[], ...children: Eleme[]): Eleme {
	return {
		type: tag,
		props: {
			...attrs,
			children: children.map(child => {
				return typeof child === 'object' ? child : createTextElement(child);
			}),
		},
	};
}

function createTextElement(text: string): Eleme {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

function render(vnode: Eleme, container: HTMLElement | Text): HTMLElement | Text | void {
	wipRoot = {
		dom: container,
		props: [vnode],
	};
	nextUnitOfWork = wipRoot;
}

function createDom(fiber) {
	const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);
	const isProperty = (key: string) => key !== 'children';
	Object.keys(fiber)
		.filter(isProperty)
		.map(name => {
			dom[name] = fiber.props[name];
		});
	return dom;
}

let nextUnitOfWork = null;
let wipRoot = null;
function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}
	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}

	const elements = fiber.props.children;
	let index = 0;
	let prevSibling = null;
	while (index < elements.length) {
		const element = elements[index];
		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		};
		if (index === 0) {
			fiber.child = newFiber;
		} else {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index++;
	}
	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
}

function commitRoot() {
	commitWork(wipRoot.child);
	wipRoot = null;
}

function commitWork(fiber) {
	if (!fiber) {
		return;
	}
	const domParent = fiber.parent.dom;
	domParent.appendChild(fiber.dom);
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

const React = {
	createElement,
};

const ReactDOM = {
	render: (vnode: Eleme, container: HTMLElement) => {
		container.innerHTML = '';
		return render(vnode, container);
	},
};

const tick = () => {
	const element = (
		<div>
			<div style='background: aqua;'>
				<h1>Hello World</h1>
			</div>
			<div style={{ color: '#6cf' }}>道心惟微</div>
		</div>
	);
	const el = document.getElementById('app')!;
	ReactDOM.render(element as unknown as Eleme, el);
};
tick();

// setInterval(tick, 1000);
