export function save(state) {
	localStorage.setItem("state", JSON.stringify(state));
}

export function clear(container) {
	while (container.firstChild) container.removeChild(container.lastChild);
}

export function getParentId(elm) {
	let parent = elm;

	while (!parent.getAttribute("data-comment-id")) {
		parent = parent.parentElement;
	}
	return parseInt(parent.getAttribute("data-comment-id"));
}
