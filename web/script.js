// DOM elements
const fileUploadImg = document.querySelector(".file-upload");
const dropPrompt = document.querySelector(".drop-zone__prompt");
const dropTt = document.querySelector(".drop-zone__tooltip");
const body = document.querySelector('body');
let progressBar = document.getElementsByClassName('progress-bar')[0];
let uploadError = document.querySelector('.upload-error');

// Progress variable for Loading bar
let currentProgress = 0;
let fileCount = 0;

// Initialize DOM elements globally for easy cleanup
let sheetNameContainer = null;
let sheetSubmitBtn = null;
let sheetTitle = null;
let sheetBtnContainer = null;
let sheetInputContainer = null;
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
    let isMulti = false;

    const pickerOpts = {
        types: [
            {
                description: 'Bank CSVs',
                accept: {
                    'csv/*': ['.csv']
                }
            },
        ],
        excludeAcceptAllOption: true,
        multiple: true
    };

    dropZoneElement = inputElement.closest(".drop-zone");

    // Add a file browser on click functionality
    dropZoneElement.addEventListener("click", async e => {
        let fileText = [];
        let fileList = [];
        let fileHandle = [];
        let inputContainer = document.querySelector('.sheet-input-container')
        fileHandle = await window.showOpenFilePicker(pickerOpts);

        if(fileHandle.length > 5){
            if(inputContainer){
                uploadError = document.createElement('span');
                dropZoneElement.insertAdjacentElement("afterend", uploadError);
                uploadError.classList.add('upload-error');
                uploadError.classList.add('invisible');
                uploadError.textContent = "There is a limit of 5 files. Please try again."
            }
            uploadError.classList.remove('invisible');
            return;
        }
        else{
            if(!uploadError.classList.contains('invisible')){
                uploadError.classList.add('invisible');
            } 
        }

        if(fileHandle.length > 1){
            isMulti = true;
        }
        else {
            isMulti = false;
        }

        // If chosen file is a file get the file object
        // and store all text inside.
        // Pass the text to the updateThumbnail function.
        for await(const handle of fileHandle){
            let file = await handle.getFile();
            let text = await file.text();
            if(handle.kind === 'file'){
                fileList.push(file);
                fileText.push(text);
            }
        }

        fileCount = fileList.length;
        updateThumbnail(dropZoneElement, fileList[0].name, isMulti, fileCount);
        createInputFields(fileText, fileCount, fileList);
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
        let fileText = [];
        let fileList = [];
        let inputContainer = document.querySelector('.sheet-input-container')

        const fileHandlesPromises = [...e.dataTransfer.items].filter((item) => item.kind === 'file').map((item) => item.getAsFileSystemHandle());

        if(fileHandlesPromises.length > 5){
            if(inputContainer){
                uploadError = document.createElement('span');
                dropZoneElement.insertAdjacentElement("afterend", uploadError);
                uploadError.classList.add('upload-error');
                uploadError.classList.add('invisible');
                uploadError.textContent = "There is a limit of 5 files. Please try again."
            }
            uploadError.classList.remove('invisible');
            dropZoneElement.classList.remove("drop-zone--over");
            return;
        }
        else{
            if(!uploadError.classList.contains('invisible')){
                uploadError.classList.add('invisible');
            } 
        }

        if(fileHandlesPromises.length > 1){
            isMulti = true;
        }
        else{
            isMulti = false;
        }

        for await (const handle of fileHandlesPromises) {
            let file = await handle.getFile();
            let text = await file.text();
            if(handle.kind === 'file'){
                fileList.push(file);
                fileText.push(text);
            }
        }

        fileCount = fileList.length;
        updateThumbnail(dropZoneElement, fileList[0].name, isMulti, fileCount);
        createInputFields(fileText, fileCount, fileList);

        dropZoneElement.classList.remove("drop-zone--over");
    });
});

// This changes the drop-zone to show that the file was
// successfully added.
function updateThumbnail(dropZoneElement, fileName, isMulti, fileCount) {
    console.log("Updating thumbnail");
    fileUploadImg.remove();
    dropPrompt.remove();
    dropTt.remove();
    uploadError.remove();

    if(successCheckImg == null || dropUploaded == null){
        successCheckImg = document.createElement('img');
        successCheckImg.src = 'success_check.svg';
        dropZoneElement.appendChild(successCheckImg);
        successCheckImg.classList.add("success-check");

        dropUploaded = document.createElement('div');
        dropZoneElement.appendChild(dropUploaded);
        dropUploaded.classList.add("drop-zone__file-uploaded");
    }
    
    if(isMulti){
        dropUploaded.dataset.label = fileName + ", +" + (fileCount - 1).toString() + " more";
    }
    else {
        dropUploaded.dataset.label = fileName;
    }

}

// After the file has been added this function creates an input
// field for the user to specify a name and creates a submit
// button to start the sheet creation.
function createInputFields(fileText, fileCount, fileList){
    console.log("Creating Input Fields...");
    let inputContainers = document.querySelectorAll('.sheet-input-container');

    if(inputContainers != null && sheetBtnContainer != null){
        inputContainers.forEach(inputContainer =>{
            inputContainer.remove();
        });
        sheetBtnContainer.remove();
        sheetBtnContainer = null;
    }

    if(sheetNameContainer == null){
        sheetNameContainer = document.createElement('form');
        body.appendChild(sheetNameContainer);
        sheetNameContainer.classList.add("sheet-name__container");
    }

    for(let i = 0; i < fileCount; i++){
        sheetInputContainer = document.createElement('div');
        sheetNameContainer.appendChild(sheetInputContainer);
        sheetInputContainer.classList.add("sheet-input-container");

        sheetInputLabel = document.createElement('label');
        sheetInputContainer.appendChild(sheetInputLabel);
        sheetInputLabel.setAttribute("for","sheet-name-input");
        sheetInputLabel.classList.add("form-label")
        sheetInputLabel.textContent = "Sheet Name:";

        sheetInputField = document.createElement('input');
        sheetInputContainer.appendChild(sheetInputField);
        sheetInputField.classList.add("form__field");
        sheetInputField.setAttribute("type","text");
        sheetInputField.setAttribute("maxlength", 50);
        sheetInputField.setAttribute("name","sheet-name-input");
        sheetInputField.setAttribute("placeholder", fileList[i].name);
        sheetInputField.setAttribute("id", "sheet-name-input");
    }

    console.log(sheetBtnContainer);

    if(sheetBtnContainer == null){
        sheetBtnContainer = document.createElement('div');
        sheetNameContainer.appendChild(sheetBtnContainer);
        sheetBtnContainer.classList.add("submit-container");

        sheetSubmitBtn = document.createElement('button');
        sheetBtnContainer.appendChild(sheetSubmitBtn);
        sheetSubmitBtn.classList.add("submit-btn");
        sheetSubmitBtn.textContent = "SUBMIT";
        sheetSubmitBtn.setAttribute("type","submit");
        sheetNameContainer.setAttribute("onsubmit","submit(fileText)");
        sheetSubmitBtn.addEventListener("click", e => {
            submit(fileText);
        });
    }   
}

function submit(fileText){
    let isLast = false;
    var inputFields = document.querySelectorAll('.form__field');
    deletePage();
    setupNewPage();
    fileText.forEach((file, index) => {
        if(index == fileText.length - 1){
            isLast = true;
        }
        else{
            isLast = false;
        }
        eel.startSheetCreation(file, inputFields[index].value, isLast);
    });
}

eel.expose(updateSheetTitle);
function updateSheetTitle(sheetName){
    sheetTitle.textContent = sheetName;
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

    sheetTitle = document.createElement('div');
    loadingContainer.appendChild(sheetTitle);
    sheetTitle.classList.add("sheet-title");

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
    addedProgress = addedProgress / fileCount;
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