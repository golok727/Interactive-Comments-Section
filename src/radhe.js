console.log("Radhey Shyam");

import { save, clear } from "./applicationHandler.js";
class Comment {
	constructor(content, user) {
		this.id = Math.floor(Math.random() * 1000) + Date.now();
		this.content = content;
		this.formatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });
		this.createdAt = this.formatter.format(Date.now());
		this.replies = [
			{
				id: 1,
				content:
					"Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
				createdAt: "1 month ago",
				score: 12,
				user: {
					image: {
						png: "./images/avatars/image-amyrobson.png",
						webp: "./images/avatars/image-amyrobson.webp",
					},
					username: "amyrobson",
				},
				replies: [],
			},
		];
		this.user = user;
		this.score = 0;
	}
}

(async () => {
	const commentsContainer = $("[data-comments-container]");
	const commentTemplate = $("[data-comment-template]");
	const addCommentForm = $("[data-add-comment]");
	addCommentForm.addEventListener("submit", handleAddComment);

	// Load State
	let comments;
	let currentUser;
	const fromStorage = localStorage.getItem("state");
	if (!fromStorage) {
		const state = await fetchComments();
		localStorage.setItem("state", JSON.stringify(state));
		comments = state.comments;
		currentUser = state.currentUser;
	} else {
		const state = JSON.parse(fromStorage);

		comments = state.comments;
		currentUser = state.currentUser;
	}
	// Render
	render();

	async function fetchComments() {
		const res = await fetch("/data.json");
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
		const elem = findCommentById(comments, id);

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

	function handleAddComment(e) {
		e.preventDefault();

		// e.target.comment.value.split(/(@[a-zA-Z1-9]+)/g).filter((i) => i !== "")
		// TODO add error
		if (e.target.comment.value === "") return;
		const newComment = new Comment(e.target.comment.value, currentUser);
		commentsContainer.appendChild(commentMaker(commentTemplate, newComment));
		comments.push(newComment);
		console.log(comments);
		save({ comments, currentUser });
		render();
	}

	function render() {
		clear(commentsContainer);
		comments?.forEach((comment) => {
			const newComment = commentMaker(commentTemplate, comment);
			$("[data-show-replies]", newComment).addEventListener("click", (e) =>
				handleShowReplies(e)
			);

			$("[data-hide-replies]", newComment).addEventListener("click", (e) =>
				handleHideReplies(e)
			);
			commentsContainer.appendChild(newComment);
		});
	}
})();

function $(selector, element = document) {
	return element.querySelector(selector);
}

function $$(selector, element = document) {
	return element.querySelectorAll(selector);
}
