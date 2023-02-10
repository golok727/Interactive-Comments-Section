export function save(state) {
	localStorage.setItem("state", JSON.stringify(state));
}

export function clear(container) {
	while (container.firstChild) container.removeChild(container.lastChild);
}
