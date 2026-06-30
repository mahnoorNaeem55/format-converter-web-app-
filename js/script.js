const textInput = document.getElementById("text-input");
const textOutput = document.getElementById("text-output");
const textMessage = document.getElementById("message");

const uppercaseButton = document.getElementById("uppercase-btn");
const lowercaseButton = document.getElementById("lowercase-btn");
const titlecaseButton = document.getElementById("titlecase-btn");
const clearButton = document.getElementById("clear-btn");
const copyButton = document.getElementById("copy-btn");
const themeToggle = document.getElementById("theme-toggle");

const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".panel");

const sidebar = document.getElementById("sidebar");
const sidebarCollapseButton = document.getElementById("sidebar-collapse-btn");

const fileDropZone = document.getElementById("file-drop-zone");
const fileInput = document.getElementById("file-input");
const fileFormat = document.getElementById("file-format");
const selectedFileName = document.getElementById("selected-file-name");
const convertFileButton = document.getElementById("convert-file-btn");
const fileMessage = document.getElementById("file-message");

const imageDropZone = document.getElementById("image-drop-zone");
const imageInput = document.getElementById("image-input");
const imageFormat = document.getElementById("image-format");
const selectedImageName = document.getElementById("selected-image-name");
const convertImageButton = document.getElementById("convert-image-btn");
const imagePreview = document.getElementById("image-preview");
const imageMessage = document.getElementById("image-message");

let selectedTextFile = null;
let selectedImageFile = null;
let imagePreviewUrl = null;

// Shows the panel matching the clicked sidebar nav item and hides the rest.
function switchPanel(panelId) {
  panels.forEach(function (panel) {
    panel.classList.toggle("active", panel.id === panelId);
  });

  navItems.forEach(function (navItem) {
    const isActive = navItem.dataset.panel === panelId;

    navItem.classList.toggle("active", isActive);

    if (isActive) {
      navItem.setAttribute("aria-current", "page");
    } else {
      navItem.removeAttribute("aria-current");
    }
  });
}

// Connects each sidebar nav button to its matching panel.
function setupSidebarNav() {
  navItems.forEach(function (navItem) {
    navItem.addEventListener("click", function () {
      switchPanel(navItem.dataset.panel);
    });
  });
}

// Applies the collapsed/expanded state to the sidebar and updates the toggle button.
function applySidebarState(isCollapsed) {
  sidebar.classList.toggle("collapsed", isCollapsed);
  sidebarCollapseButton.setAttribute("aria-pressed", String(isCollapsed));
  sidebarCollapseButton.setAttribute(
    "aria-label",
    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
  );
}

// Saves the user's sidebar preference so it stays the same next time.
function saveSidebarPreference(isCollapsed) {
  try {
    localStorage.setItem("formatConverterSidebarCollapsed", String(isCollapsed));
  } catch (error) {
    console.warn("Sidebar preference could not be saved.", error);
  }
}

// Loads the saved sidebar preference, falling back to expanded.
function loadSidebarPreference() {
  try {
    return localStorage.getItem("formatConverterSidebarCollapsed") === "true";
  } catch (error) {
    console.warn("Sidebar preference could not be loaded.", error);
    return false;
  }
}

// Switches the sidebar between collapsed and expanded.
function toggleSidebar() {
  const isCollapsed = !sidebar.classList.contains("collapsed");

  applySidebarState(isCollapsed);
  saveSidebarPreference(isCollapsed);
}

// Connects the collapse button and restores the user's saved sidebar state.
function setupSidebarCollapse() {
  applySidebarState(loadSidebarPreference());
  sidebarCollapseButton.addEventListener("click", toggleSidebar);
}

// Applies the selected theme to the page and updates the toggle button.
function applyTheme(theme) {
  const isDarkMode = theme === "dark";

  document.body.classList.toggle("dark-mode", isDarkMode);
  themeToggle.setAttribute("aria-pressed", String(isDarkMode));
  themeToggle.setAttribute(
    "aria-label",
    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
  );
}

// Saves the user's theme choice so it stays the same next time.
function saveThemePreference(theme) {
  try {
    localStorage.setItem("formatConverterTheme", theme);
  } catch (error) {
    console.warn("Theme preference could not be saved.", error);
  }
}

// Loads the saved theme, falling back to light mode.
function loadThemePreference() {
  try {
    return localStorage.getItem("formatConverterTheme") || "light";
  } catch (error) {
    console.warn("Theme preference could not be loaded.", error);
    return "light";
  }
}

// Switches between light and dark mode.
function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";

  applyTheme(nextTheme);
  saveThemePreference(nextTheme);
}

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

// Checks that the selected file is a browser-supported image.
function isImageFile(file) {
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  const allowedExtensions = /\.(png|jpe?g|webp)$/i;

  return file && (allowedTypes.includes(file.type) || allowedExtensions.test(file.name));
}

// Creates a temporary download link for any converted file blob.
function downloadBlob(fileName, blob) {
  const downloadUrl = URL.createObjectURL(blob);
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

// Creates a text file blob and downloads it.
function downloadTextFile(fileName, text) {
  const fileBlob = new Blob([text], { type: "text/plain" });

  downloadBlob(fileName, fileBlob);
}

// Adds a helpful suffix to the original file name.
function createConvertedFileName(originalName, format) {
  return originalName.replace(/\.txt$/i, "") + "-" + format + ".txt";
}

// Creates a new image file name with the selected image extension.
function createConvertedImageName(originalName, mimeType) {
  const extensionByType = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };
  const baseName = originalName.replace(/\.[^.]+$/, "");

  return baseName + "-converted." + extensionByType[mimeType];
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

// Shows or hides drag feedback for any upload area.
function setDropZoneHighlight(dropZone, shouldHighlight) {
  dropZone.classList.toggle("drag-over", shouldHighlight);
}

// Adds the highlighted style to the image drop zone.
function showImageDragFeedback(event) {
  preventDefaultDragBehavior(event);
  setDropZoneHighlight(imageDropZone, true);
}

// Removes the highlighted style from the image drop zone.
function hideImageDragFeedback(event) {
  preventDefaultDragBehavior(event);
  setDropZoneHighlight(imageDropZone, false);
}

// Replaces the empty preview state with the selected image.
function showImagePreview(file) {
  if (imagePreviewUrl) {
    URL.revokeObjectURL(imagePreviewUrl);
  }

  imagePreviewUrl = URL.createObjectURL(file);
  imagePreview.innerHTML = "";

  const previewImage = document.createElement("img");
  previewImage.src = imagePreviewUrl;
  previewImage.alt = "Preview of " + file.name;
  imagePreview.appendChild(previewImage);
}

// Resets the preview back to its beginner-friendly empty state.
function clearImagePreview() {
  if (imagePreviewUrl) {
    URL.revokeObjectURL(imagePreviewUrl);
    imagePreviewUrl = null;
  }

  imagePreview.innerHTML = '<p class="preview-placeholder">Image preview will appear here.</p>';
}

// Stores a chosen image and updates the preview area state.
function setSelectedImage(file) {
  if (!file) {
    selectedImageFile = null;
    selectedImageName.textContent = "No image selected.";
    convertImageButton.disabled = true;
    clearImagePreview();
    return;
  }

  if (!isImageFile(file)) {
    selectedImageFile = null;
    selectedImageName.textContent = file.name;
    convertImageButton.disabled = true;
    clearImagePreview();
    showMessage(imageMessage, "Please select a PNG, JPEG, or WebP image.");
    return;
  }

  selectedImageFile = file;
  selectedImageName.textContent = file.name;
  convertImageButton.disabled = false;
  showImagePreview(file);
  showMessage(imageMessage, "Image ready to convert.");
}

// Updates the visible image name when the user picks an image.
function handleImageSelection() {
  setSelectedImage(imageInput.files[0]);
}

// Handles a dropped image exactly like an image chosen from the file input.
function handleImageDrop(event) {
  hideImageDragFeedback(event);
  setSelectedImage(event.dataTransfer.files[0]);
}

// Loads the selected image into an HTMLImageElement for canvas conversion.
function loadImageElement(file) {
  return new Promise(function (resolve, reject) {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = function () {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = function () {
      URL.revokeObjectURL(imageUrl);
      reject();
    };

    image.src = imageUrl;
  });
}

// Converts the loaded image to the chosen format using a canvas.
function convertImageToBlob(image, mimeType) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);

  return new Promise(function (resolve) {
    canvas.toBlob(resolve, mimeType, 0.92);
  });
}

// Converts and downloads the selected image.
function convertSelectedImage() {
  if (!selectedImageFile) {
    showMessage(imageMessage, "Please choose an image first.");
    return;
  }

  const selectedFormat = imageFormat.value;

  loadImageElement(selectedImageFile)
    .then(function (image) {
      return convertImageToBlob(image, selectedFormat);
    })
    .then(function (convertedBlob) {
      if (!convertedBlob) {
        showMessage(imageMessage, "This image format is not supported here.");
        return;
      }

      const convertedImageName = createConvertedImageName(selectedImageFile.name, selectedFormat);

      downloadBlob(convertedImageName, convertedBlob);
      showMessage(imageMessage, "Converted image downloaded.");
    })
    .catch(function () {
      showMessage(imageMessage, "Could not convert this image.");
    });
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

// Connects the image upload, drag-and-drop, and conversion controls.
function setupImageConverter() {
  imageInput.addEventListener("change", handleImageSelection);
  imageDropZone.addEventListener("dragenter", showImageDragFeedback);
  imageDropZone.addEventListener("dragover", showImageDragFeedback);
  imageDropZone.addEventListener("dragleave", hideImageDragFeedback);
  imageDropZone.addEventListener("drop", handleImageDrop);
  convertImageButton.addEventListener("click", convertSelectedImage);
}

// Connects the dark mode button and restores the user's saved theme.
function setupThemeToggle() {
  applyTheme(loadThemePreference());
  themeToggle.addEventListener("click", toggleTheme);
}

setupSidebarNav();
setupSidebarCollapse();
setupThemeToggle();
setupTextConverter();
setupFileConverter();
setupImageConverter();