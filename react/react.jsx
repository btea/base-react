function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child => (typeof child === 'object' ? child : createTextElement(child))),
		},
	};
}

function createTextElement(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

function createDom(fiber) {
	const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

	updateDom(dom, {}, fiber.props);

	return dom;
}

const isEvent = key => key.startsWith('on');
const isProperty = key => key != 'children' && !isEvent(key);
const isNew = (prev, next) => key => {
	return prev[key] !== next[key];
};
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
	// 移除旧的事件
	prevProps &&
		Object.keys(prevProps)
			.filter(isEvent)
			.filter(key => !(key in nextProps) && isNew(prevProps, nextProps)(key))
			.forEach(name => {
				const eventType = name.toLowerCase().substring(2);
				dom.removeEventListener(eventType, prevProps[name]);
			});
	// 移除旧属性
	prevProps &&
		Object.keys(prevProps)
			.filter(isProperty)
			.filter(isGone(prevProps, nextProps))
			.forEach(name => {
				dom[name] = '';
			});
	// 设置或修改新属性
	nextProps &&
		Object.keys(nextProps)
			.filter(isProperty)
			.filter(isNew(prevProps, nextProps))
			.forEach(name => {
				let val = nextProps[name];
				if (typeof val === 'object') {
					val = Object.keys(val)
						.map(key => `${key}:${val[key]}`)
						.join(';');
				}
				dom[name] = val;
			});
	// 添加事件
	nextProps &&
		Object.keys(nextProps)
			.filter(isEvent)
			.filter(isNew(prevProps, nextProps))
			.forEach(name => {
				const eventType = name.toLowerCase().substring(2);
				dom.addEventListener(eventType, nextProps[name]);
			});
}

function commitRoot() {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
}

function commitWork(fiber) {
	if (!fiber) {
		return;
	}
	let domParentFiber = fiber.parent;
	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}
	const domParent = domParentFiber.dom;
	if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === 'DELETION') {
		// domParent.removeChild(fiber.dom);
		commitDeletion(fiber, domParent);
	}
	commitWork(fiber.child); // 深度优先遍历
	commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		commitDeletion(fiber.child, domParent);
	}
}

function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	};
	nextUnitOfWork = wipRoot;
	deletions = [];
}

// 把任务切割成小的单元，即时间切片
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = [];

function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}
	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}
	requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
	const isFunctionComponent = fiber.type instanceof Function;
	// console.log('======fiber======');
	// console.log(fiber);
	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
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
let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
	wipFiber = fiber;
	hookIndex = 0;
	wipFiber.hooks = [];
	const children = [fiber.type(fiber.props)];
	reconcileChildren(fiber, children);
}

function useState(initial) {
	const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	};
	const actions = oldHook ? oldHook.queue : [];
	actions.forEach(action => {
		hook.state = action(hook.state);
	});
	setTimeout(() => {
		wipFiber.effects && wipFiber.effects.forEach(eff => eff());
	});
	const setState = action => {
		if (typeof action === 'function') {
			hook.queue.push(action);
		} else {
			hook.state = action;
		}
		wipRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot,
		};
		nextUnitOfWork = wipRoot;
		deletions = [];
		wipFiber.effects = [];
	};
	wipFiber.hooks.push(hook);
	hookIndex++;
	return [hook.state, setState];
}

function updateHostComponent(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	if (fiber.props) {
		reconcileChildren(fiber, fiber.props.children);
	} else {
		reconcileChildren(fiber, []);
	}
}

function reconcileChildren(wipFiber, elements) {
	let index = 0;
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

	let prevSibling = null;
	if (elements && Array.isArray(elements[0])) {
		elements = [...elements[0]];
	}
	while (index < elements.length || oldFiber != null) {
		const element = elements[index];
		let newFiber = null;
		const sameType = oldFiber && element && oldFiber.type === element.type;
		if (sameType) {
			// 更新节点
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: 'UPDATE',
			};
		}
		if (element && !sameType) {
			// 添加这个新节点
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: 'PLACEMENT',
			};
		}
		if (oldFiber && !sameType) {
			// 移除旧的节点
			oldFiber.effectTag = 'DELETION';
			deletions.push(oldFiber);
		}
		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}

		if (index === 0) {
			wipFiber.child = newFiber;
		} else if (element) {
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;
	}
}

function useEffect(cb) {
	if (wipFiber.effects && wipFiber.effects.length) {
		wipFiber.effects.push(cb);
	} else {
		wipFiber.effects = [cb];
	}
}

const React = {
	render,
	createElement,
};

const container = document.getElementById('app');

// 函数组件
function Counter() {
	const [state, setState] = useState(1);
	useEffect(() => {
		console.log(1);
	});
	useEffect(() => {
		console.log(2);
	});
	/**
	 * 重复创建多个元素
	 * new Array(1000).map((k, i) => {
	 * 	return i + '--' + Math.random().toString().slice(2, 8)
	 * })
	 * 得到的是一个包含1000个空元素的数组
	 */
	const item_list = Array.from('a'.repeat(1000), (k, i) => {
		return i + '--' + Math.random().toString().slice(2, 8);
	});
	return (
		<h1 onClick={() => setState(state + 1)} style={{ color: '#6cf' }}>
			Count: {state}
			<div>======</div>
			<div className='item-list'>
				{item_list.map((k, v) => {
					return <div key={k}>{k}</div>;
				})}
			</div>
		</h1>
	);
}
const element = <Counter />;
React.render(element, container);
