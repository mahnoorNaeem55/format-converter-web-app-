const textInput = document.getElementById("text-input");
const textOutput = document.getElementById("text-output");
const textMessage = document.getElementById("message");

const uppercaseButton = document.getElementById("uppercase-btn");
const lowercaseButton = document.getElementById("lowercase-btn");
const titlecaseButton = document.getElementById("titlecase-btn");
const clearButton = document.getElementById("clear-btn");
const copyButton = document.getElementById("copy-btn");

const fileDropZone = document.getElementById("file-drop-zone");
const fileInput = document.getElementById("file-input");
const fileFormat = document.getElementById("file-format");
const selectedFileName = document.getElementById("selected-file-name");
const convertFileButton = document.getElementById("convert-file-btn");
const fileMessage = document.getElementById("file-message");

let selectedTextFile = null;

// Shows a short status message, then clears it after a moment.
function showMessage(element, text) {
  element.textContent = text;

  setTimeout(function () {
    element.textContent = "";
  }, 1800);
}

// Converts text to uppercase. This is reused by the text and file converters.
function convertToUpperCase(text) {
  return text.toUpperCase();
}

// Converts text to lowercase.
function convertToLowerCase(text) {
  return text.toLowerCase();
}

// Converts every word to title case while preserving spaces and line breaks.
function convertToTitleCase(text) {
  return convertToLowerCase(text).replace(/\S+/g, function (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

// Picks the correct conversion function based on the selected format.
function convertTextByFormat(text, format) {
  if (format === "lowercase") {
    return convertToLowerCase(text);
  }

  if (format === "titlecase") {
    return convertToTitleCase(text);
  }

  return convertToUpperCase(text);
}

// Copies text using the modern Clipboard API, with a simple fallback.
function copyTextToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  textOutput.select();
  document.execCommand("copy");
  return Promise.resolve();
}

// Places converted text into the output box.
function updateTextOutput(convertedText) {
  textOutput.value = convertedText;
}

// Clears both text boxes and returns the cursor to the input box.
function clearTextConverter() {
  textInput.value = "";
  textOutput.value = "";
  textInput.focus();
  showMessage(textMessage, "Cleared.");
}

// Checks that the selected file is a plain text file.
function isTextFile(file) {
  return file && (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt"));
}

// Creates a temporary download link for the converted text file.
function downloadTextFile(fileName, text) {
  const fileBlob = new Blob([text], { type: "text/plain" });
  const downloadUrl = URL.createObjectURL(fileBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  setTimeout(function () {
    URL.revokeObjectURL(downloadUrl);
  }, 100);
}

// Adds a helpful suffix to the original file name.
function createConvertedFileName(originalName, format) {
  return originalName.replace(/\.txt$/i, "") + "-" + format + ".txt";
}

// Reads the selected .txt file, converts it, and downloads the result.
function convertSelectedFile() {
  if (!selectedTextFile) {
    showMessage(fileMessage, "Please choose a .txt file first.");
    return;
  }

  const selectedFormat = fileFormat.value;

  selectedTextFile
    .text()
    .then(function (fileText) {
      const convertedText = convertTextByFormat(fileText, selectedFormat);
      const convertedFileName = createConvertedFileName(selectedTextFile.name, selectedFormat);

      downloadTextFile(convertedFileName, convertedText);
      showMessage(fileMessage, "Converted file downloaded.");
    })
    .catch(function () {
      showMessage(fileMessage, "Could not read this file.");
    });
}

// Stores a chosen file and updates the upload area state.
function setSelectedFile(file) {
  if (!file) {
    selectedTextFile = null;
    selectedFileName.textContent = "No file selected.";
    convertFileButton.disabled = true;
    return;
  }

  if (!isTextFile(file)) {
    selectedTextFile = null;
    selectedFileName.textContent = file.name;
    convertFileButton.disabled = true;
    showMessage(fileMessage, "Please select a .txt file.");
    return;
  }

  selectedTextFile = file;
  selectedFileName.textContent = file.name;
  convertFileButton.disabled = false;
  showMessage(fileMessage, "File ready to convert.");
}

// Updates the visible file name when the user picks a file.
function handleFileSelection() {
  setSelectedFile(fileInput.files[0]);
}

// Stops the browser from opening the file while it is being dragged.
function preventDefaultDragBehavior(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Adds the highlighted drop-zone style.
function showDragFeedback(event) {
  preventDefaultDragBehavior(event);
  fileDropZone.classList.add("drag-over");
}

// Removes the highlighted drop-zone style.
function hideDragFeedback(event) {
  preventDefaultDragBehavior(event);
  fileDropZone.classList.remove("drag-over");
}

// Handles a dropped file exactly like a file chosen from the file input.
function handleFileDrop(event) {
  hideDragFeedback(event);
  setSelectedFile(event.dataTransfer.files[0]);
}

// Connects all text converter buttons to their actions.
function setupTextConverter() {
  uppercaseButton.addEventListener("click", function () {
    updateTextOutput(convertTextByFormat(textInput.value, "uppercase"));
  });

  lowercaseButton.addEventListener("click", function () {
    updateTextOutput(convertTextByFormat(textInput.value, "lowercase"));
  });

  titlecaseButton.addEventListener("click", function () {
    updateTextOutput(convertTextByFormat(textInput.value, "titlecase"));
  });

  clearButton.addEventListener("click", clearTextConverter);

  copyButton.addEventListener("click", function () {
    if (textOutput.value.trim() === "") {
      showMessage(textMessage, "Nothing to copy yet.");
      return;
    }

    copyTextToClipboard(textOutput.value).then(function () {
      showMessage(textMessage, "Copied to clipboard.");
    });
  });
}

// Connects the file input and convert button to the file converter.
function setupFileConverter() {
  fileInput.addEventListener("change", handleFileSelection);
  fileDropZone.addEventListener("dragenter", showDragFeedback);
  fileDropZone.addEventListener("dragover", showDragFeedback);
  fileDropZone.addEventListener("dragleave", hideDragFeedback);
  fileDropZone.addEventListener("drop", handleFileDrop);
  convertFileButton.addEventListener("click", convertSelectedFile);
}

setupTextConverter();
setupFileConverter();
