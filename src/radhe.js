console.log("Radhey Shyam");

(async () => {
	const commentsContainer = $("[data-comments-container]");
	const commentTemplate = $("[data-comment-template]");

	const { comments, currentUser } = await fetchComments();

	comments?.forEach((comment) => {
		const newComment = commentMaker(commentTemplate, comment);
		$("[data-show-replies]", newComment).addEventListener("click", (e) =>
			handleShowReplies(e)
		);

		$("[data-hide-replies]", newComment).addEventListener("click", (e) =>
			handleHideReplies(e)
		);
		``;
		commentsContainer.appendChild(newComment);
	});

	async function fetchComments() {
		const res = await fetch("./data.json");
		const data = await res.json();
		return data;
	}
	function commentMaker(template, data) {
		const { content } = template;
		const imgSrc = "/assets" + data?.user?.image.webp.substr(1);

		$("[data-comment]", content).setAttribute("data-comment-id", data.id);
		$("[data-score]", content).innerHTML = data?.score;
		$("[data-profile-pic]", content).src = imgSrc;
		$("[data-comment-user-name]", content).innerText = data?.user.username;
		$("[data-time-ago]", content).innerText = data?.createdAt;
		$("[data-comment-content]", content).innerText = data?.content;

		const showRepliesButton = $("[data-show-replies]", content);
		if (!data.replies || data?.replies?.length <= 0)
			showRepliesButton.classList.add("hidden");
		else showRepliesButton.classList.remove("hidden");

		return template.content.cloneNode(true);
	}

	function handleHideReplies(e) {
		e.target.classList.add("hidden");
		e.target.parentElement
			.querySelector("[data-show-replies]")
			.classList.remove("hidden");
		const commentContainer = e.target.parentElement.parentElement.parentElement;
		const repliesContainer = commentContainer.querySelector("[data-replies]");
		while (repliesContainer.firstChild) {
			repliesContainer.removeChild(repliesContainer.lastChild);
		}
	}
	function handleShowReplies(e) {
		e.target.classList.add("hidden");
		e.target.parentElement
			.querySelector("[data-hide-replies]")
			.classList.remove("hidden");

		const commentContainer = e.target.parentElement.parentElement.parentElement;
		const repliesContainer = commentContainer.querySelector("[data-replies]");
		const id = parseInt(commentContainer.getAttribute("data-comment-id"));
		console.log(id);
		const elem = findCommentById(comments, id);
		console.log(elem);

		elem.replies.forEach((el) => {
			const newComment = commentMaker(commentTemplate, el);
			$("[data-show-replies]", newComment).addEventListener("click", (e) =>
				handleShowReplies(e)
			);

			$("[data-hide-replies]", newComment).addEventListener("click", (e) =>
				handleHideReplies(e)
			);
			``;
			repliesContainer.appendChild(newComment);
		});
	}
})();

function findCommentById(comments, id) {
	if (!comments) return null;
	// if (comments.length === 0) return null;
	const found = comments.find((comment) => comment.id === id);
	if (found) return found;

	for (let i = 0; i < comments.length; i++) {
		if (comments[i]?.replies?.length > 0)
			return findCommentById(comments[i].replies, id);
	}
}

function recurse(comment) {}

function $(selector, element = document) {
	return element.querySelector(selector);
}

function $$(selector, element = document) {
	return element.querySelectorAll(selector);
}
