const CAPTCHA_STORAGE_KEY = "first-visit-captcha-completed";
const captchaDialog = document.querySelector("#first-visit-captcha");
const captchaForm = document.querySelector("#captcha-form");
const captchaQuestion = document.querySelector("#captcha-question");
const captchaAnswer = document.querySelector("#captcha-answer");
const captchaStatus = document.querySelector("#captcha-status");

let expectedAnswer;

function setChallenge() {
    const firstNumber = Math.floor(Math.random() * 8) + 2;
    const secondNumber = Math.floor(Math.random() * 8) + 2;
    expectedAnswer = firstNumber + secondNumber;
    captchaQuestion.textContent = `What is ${firstNumber} + ${secondNumber}?`;
}

try {
    if (localStorage.getItem(CAPTCHA_STORAGE_KEY) !== "true") {
        setChallenge();
        captchaDialog.showModal();
        captchaAnswer.focus();
    }
} catch (error) {
    console.error("Could not read first-visit verification status:", error);
    captchaStatus.textContent = "Verification could not be loaded. Please enable browser storage and reload.";
    setChallenge();
    captchaDialog.showModal();
}

captchaForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (Number(captchaAnswer.value) !== expectedAnswer) {
        captchaStatus.textContent = "That answer is not correct. Please try again.";
        captchaAnswer.select();
        return;
    }

    try {
        localStorage.setItem(CAPTCHA_STORAGE_KEY, "true");
        captchaDialog.close();
        window.dispatchEvent(new Event("first-visit-captcha-completed"));
    } catch (error) {
        console.error("Could not save first-visit verification status:", error);
        captchaStatus.textContent = "Verification could not be saved. Please enable browser storage and try again.";
    }
});

captchaDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
});
