// DOM elements
const fileUploadImg = document.querySelector(".file-upload");
const dropPrompt = document.querySelector(".drop-zone__prompt");
const dropTt = document.querySelector(".drop-zone__tooltip");
const body = document.querySelector('body');
let progressBar = document.getElementsByClassName('progress-bar')[0];

// Progress variable for Loading bar
let currentProgress = 0;

// Initialize DOM elements globally for easy cleanup
let sheetSubmitBtn = null;
let sheetBtnContainer = null;
let sheetInputField = null;
let successCheckImg = null;
let dropUploaded = null;
let inputElement = null;
let dropZoneElement = null;
let loadingTooltip = null;
let loadingContainer = null;

// Set up for drag-n-drop area functionallity.
document.querySelectorAll(".drop-zone__input").forEach(inputElement => {
    // Uses file system access API which operates on
    // promises and returned handles.
    let fileHandle;
    dropZoneElement = inputElement.closest(".drop-zone");

    // Add a file browser on click functionality
    dropZoneElement.addEventListener("click", async e => {
        [fileHandle] = await window.showOpenFilePicker();

        // If chosen file is a file get the file object
        // and store all text inside.
        // Pass the text to the updateThumbnail function.
        if(fileHandle.kind === 'file') {
            let file = await fileHandle.getFile()
            let text = await file.text()
            inputElement.files[0] = file;
            updateThumbnail(dropZoneElement, text, file.name);
        }
    });

    // This allows the drag-n-drop field to change
    // when a file is dragged over the area.
    dropZoneElement.addEventListener("dragover", e => {
        if(inputElement.files.length == 0){
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
            fileUploadImg.classList.remove("image-normal-filter");
            fileUploadImg.classList.add("image-drag-filter");
        }
    });

    // The opposite of dragover
    ["dragleave", "dragend"].forEach(type => {
        dropZoneElement.addEventListener(type, e => {
            dropZoneElement.classList.remove("drop-zone--over");
            fileUploadImg.classList.remove("image-drag-filter");
            fileUploadImg.classList.add("image-normal-filter");
        });
    });

    // Functionallity when a file is dropped on the drag-n-drop zone.
    // Works exactly the same as the click to browse function.
    dropZoneElement.addEventListener("drop", async e => {
        e.preventDefault();

        console.log('Dropped');

        const fileHandlesPromises = [...e.dataTransfer.items].filter((item) => item.kind === 'file').map((item) => item.getAsFileSystemHandle());

        for await (const handle of fileHandlesPromises) {
            let file = await handle.getFile();
            let text = await file.text();
            if (handle.kind === 'file'){
                inputElement.files[0] = file;
                updateThumbnail(dropZoneElement, text, file.name)
            }
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });
});

// This changes the drop-zone to show that the file was
// successfully added.
function updateThumbnail(dropZoneElement, file, fileName) {
    console.log("Updating thumbnail");
    fileUploadImg.remove();
    dropPrompt.remove();
    dropTt.remove();

    successCheckImg = document.createElement('img');
    successCheckImg.src = 'success_check.svg';
    dropZoneElement.appendChild(successCheckImg);
    successCheckImg.classList.add("success-check");

    dropUploaded = document.createElement('div');
    dropZoneElement.appendChild(dropUploaded);
    dropUploaded.dataset.label = fileName;
    dropUploaded.classList.add("drop-zone__file-uploaded");
    
    createInputFields(file);
}

// After the file has been added this function creates an input
// field for the user to specify a name and creates a submit
// button to start the sheet creation.
function createInputFields(file){

    sheetNameContainer = document.createElement('div');
    body.appendChild(sheetNameContainer);
    sheetNameContainer.classList.add("sheet-name__container");

    sheetInputLabel = document.createElement('label');
    sheetNameContainer.appendChild(sheetInputLabel);
    sheetInputLabel.setAttribute("for","sheet-name-input");
    sheetInputLabel.classList.add("form-label")
    sheetInputLabel.textContent = "Sheet Name:";

    sheetInputField = document.createElement('input');
    sheetNameContainer.appendChild(sheetInputField);
    sheetInputField.classList.add("form__field");
    sheetInputField.setAttribute("type","text");
    sheetInputField.setAttribute("name","sheet-name-input");
    sheetInputField.setAttribute("placeholder","Sheet Name");
    sheetInputField.setAttribute("id", "sheet-name-input")

    sheetBtnContainer = document.createElement('div');
    body.appendChild(sheetBtnContainer);
    sheetBtnContainer.classList.add("submit-container");

    sheetSubmitBtn = document.createElement('button');
    sheetBtnContainer.appendChild(sheetSubmitBtn);
    sheetSubmitBtn.classList.add("submit-btn");
    sheetSubmitBtn.textContent = "SUBMIT";
    sheetSubmitBtn.setAttribute("type","submit");
    sheetSubmitBtn.addEventListener("click", e => {
        deletePage();
        setupNewPage();
        eel.startSheetCreation(file, sheetInputField.value);
    });
}

// Removes all the elements from the drop-zone
function deletePage(){
    sheetBtnContainer.remove();
    dropZoneElement.remove();
    sheetNameContainer.remove();
}

// Sets up the loading bar page.
function setupNewPage() {
    loadingContainer = document.createElement('div');
    body.appendChild(loadingContainer);
    loadingContainer.classList.add("loading-container");

    let uploadTitle = document.createElement('span');
    loadingContainer.appendChild(uploadTitle);
    uploadTitle.classList.add("upload-title");
    uploadTitle.textContent = "Uploading...";

    progressBar = document.createElement('div');
    loadingContainer.appendChild(progressBar);
    progressBar.classList.add("progress-bar");

    loadingTooltip = document.createElement('span');
    loadingContainer.appendChild(loadingTooltip);
    loadingTooltip.classList.add("loading-tooltip");
    loadingTooltip.textContent = "Reading .csv file...";
}

// Function exposed to the Python script that updates
// the fill of the loading bar.
eel.expose(updateProgressBar);
function updateProgressBar(addedProgress, newToolTip){
    const computedStyle = getComputedStyle(progressBar);
    const progress = parseFloat(computedStyle.getPropertyValue('--progress')) || 0;
    loadingTooltip.textContent = newToolTip;
    progressBar.style.setProperty('--progress', progress + addedProgress);
}

// Function to set-up the final "Done!" page when sheet uploading is
// complete.
eel.expose(done);
function done(){
    loadingContainer.remove();

    let doneContainer = document.createElement('div');
    body.appendChild(doneContainer);
    doneContainer.classList.add("done-container");

    let doneImg = document.createElement('img');
    doneImg.src = 'success_check.svg';
    doneContainer.appendChild(doneImg);
    doneImg.classList.add("success-check-lg");

    let doneText = document.createElement('span');
    doneContainer.appendChild(doneText);
    doneText.classList.add("done-text");
    doneText.textContent = "Done!";
}