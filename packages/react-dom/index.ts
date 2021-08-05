export default {
	render(element: any, container: Element) {
		if (typeof element === 'string') {
			const dom = document.createTextNode(element);
			return container.appendChild(dom);
		}
		const { type, props } = element;
		if (typeof type === 'function') {
			const ele = type();
			this.render(ele, container);
		} else {
			const dom = document.createElement(type) as Element;
			// 绑定属性
			const isEvent = (key: string) => key.startsWith('on');
			const isProperty = (key: string) => key != 'children' && !isEvent(key);
			const attrs = props as { [key: string]: any };
			Object.keys(attrs)
				.filter(isProperty)
				.forEach((pro: string) => {
					Object.defineProperty(dom, pro, {
						value: attrs[pro],
						enumerable: true,
					});
				});
			Object.keys(attrs)
				.filter(isEvent)
				.forEach((pro: string) => {
					const event = pro.toLowerCase().slice(2);
					dom.addEventListener(event, attrs[pro]);
				});
			container.appendChild(dom);
			if (Array.isArray(props.children)) {
				props.children.forEach((child: any) => {
					this.render(child, dom);
				});
			} else {
				if (typeof props.children === 'string') {
					const _dom = document.createTextNode(props.children);
					dom.appendChild(_dom);
				}
			}
		}
	},
};
