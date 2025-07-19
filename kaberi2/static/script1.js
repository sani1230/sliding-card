const container = document.querySelector(".carousel-container");
const track = document.querySelector(".carousel-track");
const cards = Array.from(document.querySelectorAll(".carousel-card"));
const indicators = document.querySelectorAll(".indicator");

let currentIndex = 0;

function moveToSlide(targetIndex) {
	if (targetIndex < 0 || targetIndex >= cards.length) return;

	const targetCard = cards[targetIndex];
	const cardOffset = targetCard.offsetLeft;
	const cardWidth = targetCard.offsetWidth;
	const containerWidth = container.offsetWidth;
	const offset = containerWidth / 2 - (cardOffset + cardWidth / 2);

	track.style.transform = `translateX(${offset}px)`;
	currentIndex = targetIndex;

	updateCarousel();
	handleCardActivation();
}

function updateCarousel() {
	cards.forEach((card, i) => {
		card.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next");

		if (i === currentIndex) {
			card.classList.add("is-active");
		} else if (i === currentIndex - 1) {
			card.classList.add("is-prev");
		} else if (i === currentIndex + 1) {
			card.classList.add("is-next");
		} else if (i < currentIndex - 1) {
			card.classList.add("is-far-prev");
		} else if (i > currentIndex + 1) {
			card.classList.add("is-far-next");
		}
	});

	indicators.forEach((indicator, i) => {
		indicator.classList.toggle("active", i === currentIndex);
	});
}

function animateDataCounter() {
	const activeCard = document.querySelector(".carousel-card.is-active");
	if (!activeCard) return;

	const statsElement = activeCard.querySelector(".card-stats");
	const completionText = statsElement.lastElementChild.textContent;
	const percentageMatch = completionText.match(/(\d+)%/);

	if (percentageMatch) {
		const targetPercentage = parseInt(percentageMatch[1]);
		let currentPercentage = 0;

		statsElement.lastElementChild.textContent = "0% COMPLETE";

		const interval = setInterval(() => {
			currentPercentage += Math.ceil(targetPercentage / 15);
			if (currentPercentage >= targetPercentage) {
				currentPercentage = targetPercentage;
				clearInterval(interval);
			}
			statsElement.lastElementChild.textContent = `${currentPercentage}% COMPLETE`;
		}, 50);

		const progressBar = activeCard.querySelector(".progress-value");
		progressBar.style.width = "0%";
		setTimeout(() => {
			progressBar.style.transition = "width 0.8s ease";
			progressBar.style.width = `${targetPercentage}%`;
		}, 100);
	}
}

function handleCardActivation() {
	cards.forEach((card, i) => {
		const techDetails = card.querySelector(".tech-details");
		if (i === currentIndex) {
			card.classList.add("is-active");
			techDetails?.classList.add("open");
		} else {
			card.classList.remove("is-active");
			techDetails?.classList.remove("open");
		}
	});
	animateDataCounter();
}

document.querySelector(".next").addEventListener("click", () => moveToSlide(currentIndex + 1));
document.querySelector(".prev").addEventListener("click", () => moveToSlide(currentIndex - 1));

indicators.forEach((indicator, i) => {
	indicator.addEventListener("click", () => moveToSlide(i));
});

window.addEventListener("resize", () => moveToSlide(currentIndex));

document.getElementById("themeToggle")?.addEventListener("click", () => {
	document.body.classList.toggle("light-mode");
});

window.addEventListener("load", () => {
	setTimeout(() => document.body.classList.add("loaded"), 1200);
});

moveToSlide(currentIndex);
