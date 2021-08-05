// 协调子fiber的过程
import { createFiberFromElement, createFiberFromText } from './ReactFiber';
import { Placement } from '../shared/ReactSideEffectTags';
import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols';

// 为了在2个方法中复用一批共用方法
// shouldTrackSideEffects标示是否标记fiber的effectTag
// 对于首次渲染，不需要标记effectTag，因为completeWork时会appendAllChildren，最后一次渲染整棵树
// 对于单次更新，需要标记更新fiber的effectTag
function ChildReconciler(shouldTrackSideEffects) {
	function createChild(returnFiber, newChild) {
		if (typeof newChild === 'number' || typeof newChild === 'string') {
			const created = createFiberFromText(newChild);
			created.return = returnFiber;
			return created;
		}
		if (typeof newChild === 'object' && newChild !== null) {
			if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
				const created = createFiberFromElement(newChild);
				created.return = returnFiber;
				return created;
			}
		}
		return null;
	}

	// 协调子fiber 创建fiber
	function reconcileSingleElement(returnFiber, currentFirstChild, element) {
		// key diff 算法待补充
		const created = createFiberFromElement(element);
		created.return = returnFiber;
		return created;
	}

	function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent) {
		// 省略更新过程
		const created = createFiberFromText(textContent);
		created.return = returnFiber;
		return created;
	}

	// 标志当前fiber需要在commit阶段插入DOM
	function placeSingleChild(fiber) {
		// alternate存在表示该fiber已经插入到DOM
		if (shouldTrackSideEffects && !fiber.alternate) {
			fiber.effectTag = Placement;
		}
		return fiber;
	}

	function reconcileChildrenArray(returnFiber, currentFirstChild, newChild) {
		// TODO array diff
		let prev;
		let first;
		for (let i = 0; i < newChild.length; i++) {
			const child = newChild[i];
			const newFiber = createChild(returnFiber, child);
			if (!newFiber) {
				continue;
			}
			placeSingleChild(newFiber);
			if (prev) {
				prev.sibling = newFiber;
			}
			if (!first) {
				first = newFiber;
			}
			prev = newFiber;
		}
		return first;
	}

	function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
		// React.createElement类型 或者 子节点是String、Number对应的Array类型
		const isObject = typeof newChild === 'object' && newChild !== null;
		if (isObject) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
			}
			// 在 beginWork update各类Component时并未处理HostText，这里处理单个HostText
			if (typeof newChild === 'number' || typeof newChild === 'string') {
				return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, newChild));
			}
			// 在 beginWork update各类Component时并未处理HostText，这里处理多个HostText
			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
			}
		}
		console.log('未实现的协调分支逻辑');
	}
	return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
