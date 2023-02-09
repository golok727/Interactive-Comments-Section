console.log("Radhey Shyam");
(async () => {
	const state = await fetchComments();
	console.log(state);
	async function fetchComments() {
		const res = await fetch("./data.json");
		const data = await res.json();
		return data;
	}
})();
