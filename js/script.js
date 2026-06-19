const textInput = document.getElementById("text-input");
const textOutput = document.getElementById("text-output");
const message = document.getElementById("message");

const uppercaseButton = document.getElementById("uppercase-btn");
const lowercaseButton = document.getElementById("lowercase-btn");
const titlecaseButton = document.getElementById("titlecase-btn");
const clearButton = document.getElementById("clear-btn");
const copyButton = document.getElementById("copy-btn");

function showMessage(text) {
  message.textContent = text;

  setTimeout(function () {
    message.textContent = "";
  }, 1800);
}

function convertToTitleCase(text) {
  return text.toLowerCase().replace(/\S+/g, function (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function copyTextToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  textOutput.select();
  document.execCommand("copy");
  return Promise.resolve();
}

uppercaseButton.addEventListener("click", function () {
  textOutput.value = textInput.value.toUpperCase();
});

lowercaseButton.addEventListener("click", function () {
  textOutput.value = textInput.value.toLowerCase();
});

titlecaseButton.addEventListener("click", function () {
  textOutput.value = convertToTitleCase(textInput.value);
});

clearButton.addEventListener("click", function () {
  textInput.value = "";
  textOutput.value = "";
  textInput.focus();
  showMessage("Cleared.");
});

copyButton.addEventListener("click", function () {
  if (textOutput.value.trim() === "") {
    showMessage("Nothing to copy yet.");
    return;
  }

  copyTextToClipboard(textOutput.value).then(function () {
    showMessage("Copied to clipboard.");
  });
});
