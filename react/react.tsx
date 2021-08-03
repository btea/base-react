interface Attrs {
	[key: string]: unknown;
}
interface Eleme {
	tag: string;
	attrs: Attrs[];
	children: Eleme[];
}

function createElement(tag: string, attrs: Attrs[], ...children: Eleme[]): Eleme {
	return {
		tag,
		attrs,
		children,
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

function render(vnode: Eleme, container: HTMLElement): HTMLElement | Text {
	// 当vnode为字符串时，渲染结果是一段文本
	if (typeof vnode === 'string') {
		const textNode = document.createTextNode(vnode);
		return container.appendChild(textNode);
	}

	const dom = document.createElement(vnode.tag);

	if (vnode.attrs) {
		const list: string[] = Object.keys(vnode.attrs);
		list.forEach(key => {
			const des = Object.getOwnPropertyDescriptor(vnode.attrs, key);
			const value = des?.value;
			setAttribute(dom, key, value); // 设置属性
		});
	}

	vnode.children.forEach(child => render(child, dom)); // 递归渲染子节点

	return container.appendChild(dom); // 将渲染结果挂载到真正的DOM上
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
			<h1>Hello, world!</h1>
			<h2>It is {new Date().toLocaleTimeString()}.</h2>
		</div>
	);
	const el = document.getElementById('app')!;
	ReactDOM.render(element as unknown as Eleme, el);
};

setInterval(tick, 1000);
