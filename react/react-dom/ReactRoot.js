import * as DOMRenderer from '../react-reconciler';
import { FiberNode } from '../react-reconciler/ReactFiber';
import { createUpdate, initializeUpdateQueue, enqueueUpdate } from '../react-reconciler/ReactUpdateQueue';

/**
 * @description 创建 FiberRoot ，其中 FiberRoot.current === RootFiber ，RootFiber.stateNode === FiberRoot
 */
export default class ReactRoot {
	constructor(container) {
		// RootFiber tag === 3
		this.current = new FiberNode(3);
		// 初始化rootFiber的updateQueue
		initializeUpdateQueue(this.current);
		// RootFiber指向FiberRoot
		this.current.stateNode = this;
		// 应用挂载的根DOM节点
		this.containerInfo = container;
		// root下已经render完毕的fiber
		this.finishedWork = null;
	}
	render(element) {
		const current = this.current;
		const expirationTime = DOMRenderer.requestCurrentTimeForUpdate();
		// var expirationTime = computeExpirationForFiber(currentTime, current$$1);
		const update = createUpdate(expirationTime);
		// fiber.tag为HostRoot类型，payload为对应要渲染的ReactComponents
		update.payload = { element };
		enqueueUpdate(current, update);
		return DOMRenderer.scheduleUpdateOnFiber(current, expirationTime);
	}
}
