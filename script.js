const track = document.querySelector(".carousel-track");
const cards = Array.from(track.children);
const nextButton = document.querySelector(".carousel-button.next");
const prevButton = document.querySelector(".carousel-button.prev");
const container = document.querySelector(".carousel-container");
const indicators = document.querySelectorAll(".indicator");

let currentIndex = 0;
let cardWidth = cards[0].offsetWidth;
let cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;

function debounce(func, wait, immediate) {
	let timeout;
	return function () {
		let context = this,
			args = arguments;
		let later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

// 🔁 Initialize
function initializeCarousel() {
	cardWidth = cards[0].offsetWidth;
	cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;
	moveToSlide(currentIndex); // <-- this will recenter on resize
}


// 🎯 Move to specific card
function moveToSlide(targetIndex) {
	if (targetIndex < 0 || targetIndex >= cards.length) return;

	const targetCard = cards[targetIndex];
	const cardOffset = targetCard.offsetLeft;
	const cardWidth = targetCard.offsetWidth;

	const containerWidth = container.offsetWidth;
	const trackOffset = (containerWidth / 2) - (cardOffset + cardWidth / 2);

	track.style.transition = "transform 0.75s cubic-bezier(0.21, 0.61, 0.35, 1)";
	track.style.transform = `translateX(${trackOffset}px)`;

	currentIndex = targetIndex;
	updateCarousel();
	handleCardActivation?.();
}

function updateCarousel() {
	cards.forEach((card, index) => {
		card.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next");
		if (index === currentIndex) card.classList.add("is-active");
		else if (index === currentIndex - 1) card.classList.add("is-prev");
		else if (index === currentIndex + 1) card.classList.add("is-next");
		else if (index < currentIndex - 1) card.classList.add("is-far-prev");
		else if (index > currentIndex + 1) card.classList.add("is-far-next");
	});
	indicators.forEach((indicator, index) => {
		indicator.classList.toggle("active", index === currentIndex);
	});
}

// ➡️⬅️ Button Nav
nextButton.addEventListener("click", () => {
	if (currentIndex < cards.length - 1) moveToSlide(currentIndex + 1);
});
prevButton.addEventListener("click", () => {
	if (currentIndex > 0) moveToSlide(currentIndex - 1);
});

// 🔘 Indicators
indicators.forEach((indicator, index) => {
	indicator.addEventListener("click", () => moveToSlide(index));
});

// 👆 Swipe Support
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

track.addEventListener("mousedown", dragStart);
track.addEventListener("touchstart", dragStart, { passive: true });
track.addEventListener("mousemove", drag);
track.addEventListener("touchmove", drag, { passive: true });
track.addEventListener("mouseup", dragEnd);
track.addEventListener("mouseleave", dragEnd);
track.addEventListener("touchend", dragEnd);

function dragStart(event) {
	isDragging = true;
	startPos = getPositionX(event);
	const transformMatrix = window.getComputedStyle(track).getPropertyValue("transform");
	currentTranslate = transformMatrix !== "none" ? parseInt(transformMatrix.split(",")[4]) : 0;
	prevTranslate = currentTranslate;
	track.style.transition = "none";
	animationID = requestAnimationFrame(animation);
	track.style.cursor = "grabbing";
}

function drag(event) {
	if (!isDragging) return;
	const currentPosition = getPositionX(event);
	currentTranslate = prevTranslate + (currentPosition - startPos);
}

function animation() {
	if (!isDragging) return;
	track.style.transform = `translateX(${currentTranslate}px)`;
	requestAnimationFrame(animation);
}

function dragEnd() {
	if (!isDragging) return;
	cancelAnimationFrame(animationID);
	isDragging = false;
	const movedBy = currentTranslate - prevTranslate;
	track.style.transition = "transform 0.75s cubic-bezier(0.21, 0.61, 0.35, 1)";
	track.style.cursor = "grab";
	const threshold = cardWidth / 3.5;
	if (movedBy < -threshold && currentIndex < cards.length - 1) moveToSlide(currentIndex + 1);
	else if (movedBy > threshold && currentIndex > 0) moveToSlide(currentIndex - 1);
	else moveToSlide(currentIndex);
}

function getPositionX(event) {
	return event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
}

function animateActiveCard() {
	const activeCard = document.querySelector(".carousel-card.is-active");
	if (!activeCard) return;

	const scanLine = document.createElement("div");
	scanLine.style.cssText = `
		position: absolute;
		left: 0;
		top: 0;
		height: 2px;
		width: 100%;
		background: linear-gradient(90deg, transparent, rgba(56,189,248,0.8), transparent);
		opacity: 0.7;
		z-index: 10;
		pointer-events: none;
		animation: scanLine 2s ease-in-out forwards;
	`;

	const styleTag = document.createElement("style");
	styleTag.textContent = `
		@keyframes scanLine {
			0% { top: 0; opacity: 0.6; }
			90% { top: 100%; opacity: 0.6; }
			100% { top: 100%; opacity: 0; }
		}
	`;
	document.head.appendChild(styleTag);

	const container = activeCard.querySelector(".card-image-container");
	if (container) {
		container.appendChild(scanLine);
		setTimeout(() => container.removeChild(scanLine), 2000);
	}
}


// 📈 Animate Counter + Progress Bar
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
			progressBar.style.transition = "width 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
			progressBar.style.width = `${targetPercentage}%`;
		}, 100);
	}
}

function handleCardActivation() {
	animateActiveCard();      // ✅ adds the scan effect
	animateDataCounter();     // ✅ animates progress bar

	setTimeout(() => {
		document.querySelectorAll(".progress-value").forEach(bar => {
			bar.style.transition = "none";
		});
	}, 1000);
}


const toggleInput = document.getElementById("themeToggle");

// Set default mode to dark
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleInput.checked = true;
} else {
  document.body.classList.remove("dark-mode");
  toggleInput.checked = false;
}

// Toggle on switch
toggleInput.addEventListener("change", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme", toggleInput.checked ? "light" : "dark");
});



// 📱 Haptic Feedback on Mobile
function triggerHapticFeedback() {
	if ("vibrate" in navigator && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
		navigator.vibrate(25);
	}
}
document.querySelectorAll(".carousel-button").forEach(btn => {
	btn.addEventListener("click", triggerHapticFeedback);
});

// 🔁 On Resize
window.addEventListener("resize", debounce(() => {
	initializeCarousel();
}, 250));

window.addEventListener("load", () => {
  initializeCarousel();

  // Delay to ensure layout is calculated correctly
  setTimeout(() => {
    moveToSlide(0);
  }, 100); // you can increase to 200 if still glitchy
});

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

const menuToggle = document.getElementById("menuToggle");
const sidebarMenu = document.getElementById("sidebarMenu");

menuToggle.addEventListener("click", () => {
  sidebarMenu.classList.toggle("open");
});
window.addEventListener("click", (e) => {
  if (
    sidebarMenu.classList.contains("open") &&
    !sidebarMenu.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    sidebarMenu.classList.remove("open");
  }
});
