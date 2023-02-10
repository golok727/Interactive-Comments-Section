console.log("Radhey Shyam");

import { save, clear, getParentId } from "./applicationHandler.js";
class Comment {
	constructor(content, user) {
		this.id = Math.floor(Math.random() * 1000) + Date.now();
		this.content = content;
		this.formatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });
		this.createdAt = this.formatter.format(Date.now());
		this.replies = [];
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
		commentsContainer.insertBefore(
			commentMaker(commentTemplate, newComment),
			commentsContainer.firstChild
		);
		comments.unshift(newComment);
		console.log(comments);
		save({ comments, currentUser });
		e.target.comment.value = "";
		render();
	}
	function addReply(e, repliesContainer) {
		if ($("[data-add-comment]", repliesContainer)) return;
		const makeReplyClone = addCommentForm.cloneNode(true);

		const id = getParentId(e.target);
		const comment = findCommentById(comments, id);
		console.log(comment);

		repliesContainer.appendChild(makeReplyClone);
		makeReplyClone.addEventListener("submit", (e) => {
			e.preventDefault();
			const content = e.target.querySelector("textarea").value;
			if (content === "") return;
			const newComment = new Comment(content, currentUser);
			repliesContainer.insertBefore(
				commentMaker(commentTemplate, newComment),
				repliesContainer.firstChild
			);
			if (!comment.replies) {
				comment.replies = [];
				comment.replies.unshift(newComment);
			} else {
				comment.replies.unshift(newComment);
			}
			console.log(comments);
			save({ comments, currentUser });
			render();
			const hide = $(`[data-comment-id='${id}']`).querySelector(
				"[data-show-replies]"
			);
			hide.classList.remove("hidden");
			hide.click();

			makeReplyClone.remove();
		});
	}

	function render() {
		clear(commentsContainer);
		comments?.forEach((comment) => {
			const newComment = commentMaker(commentTemplate, comment);
			const repliesContainer = $("[data-replies]", newComment);
			$("[data-show-replies]", newComment).addEventListener("click", (e) =>
				handleShowReplies(e)
			);

			$("[data-hide-replies]", newComment).addEventListener("click", (e) =>
				handleHideReplies(e)
			);
			$("[data-reply-btn]", newComment).addEventListener("click", (e) =>
				addReply(e, repliesContainer)
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
