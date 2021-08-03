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

function setAttribute(dom: HTMLElement, name: string, value: unknown): void {
	// 如果属性名是className，则改回class
	if (name === 'className') name = 'class';

	// 如果属性名是onXXX，则是一个事件监听方法
	if (/on\w+/.test(name)) {
		name = name.toLowerCase();
		const eve = value as (e: Event) => void;
		const e_name = name.slice(2) as keyof HTMLElementEventMap;
		dom.addEventListener(e_name, eve);
		// 如果属性名是style，则更新style对象
	} else if (name === 'style') {
		if (!value || typeof value === 'string') {
			Object.assign(dom.style, {
				cssText: value || '',
			});
		} else if (value && typeof value === 'object') {
			for (let name in value) {
				// 可以通过style={ width: 20 }这种形式来设置样式，可以省略掉单位px
				Object.defineProperty(dom.style, name, Object.getOwnPropertyDescriptor(value, name) || {});
			}
		}
		// 普通属性则直接更新属性
	} else {
		if (name !== 'class' && name in dom) {
			Object.defineProperty(dom, name, {
				value: value || '',
				configurable: true,
			});
		}
		if (value) {
			const _v = String(value) as string;
			dom.setAttribute(name, _v);
		} else {
			dom.removeAttribute(name);
		}
	}
}

function render(vnode: Eleme, container: HTMLElement | Text): HTMLElement | Text | void {
	const text = (vnode.props.nodeValue as string) || '';
	const dom = vnode.type === 'TEXT_ELEMENT' ? document.createTextNode(text) : document.createElement(vnode.type);

	const isProperty = (key: string) => key !== 'children';
	Object.keys(vnode.props)
		.filter(isProperty)
		.forEach(name => {
			let _v = vnode.props[name];
			if (typeof _v === 'object') {
				_v = Object.keys(_v)
					.map(k => {
						return `${k}: ${_v[k]}`;
					})
					.join(';');
			}
			dom[name] = _v;
		});
	vnode.props.children.forEach(child => {
		render(child, dom);
	});
	container.appendChild(dom);
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
