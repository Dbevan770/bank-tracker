const fileUploadImg = document.querySelector(".file-upload");
const dropPrompt = document.querySelector(".drop-zone__prompt");
const dropTt = document.querySelector(".drop-zone__tooltip");
const body = document.querySelector('body');

document.querySelectorAll(".drop-zone__input").forEach(inputElement => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("dragover", e => {
        if(inputElement.files.length == 0){
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        }
    });

    ["dragleave", "dragend"].forEach(type => {
        dropZoneElement.addEventListener(type, e => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", async e => {
        e.preventDefault();

        console.log('Dropped');

        const fileHandlesPromises = [...e.dataTransfer.items].filter((item) => item.kind === 'file').map((item) => item.getAsFileSystemHandle());
        console.log(fileHandlesPromises);

        for await (const handle of fileHandlesPromises) {
            let file = await handle.getFile();
            if (handle.kind === 'file'){
                inputElement.files[0] = file;
                updateThumbnail(dropZoneElement, file, file.name)
            }
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });
});

function updateThumbnail(dropZoneElement, file, fileName) {
    console.log("Updating thumbnail");
    fileUploadImg.remove();
    dropPrompt.remove();
    dropTt.remove();
    let successCheckImg = document.createElement('img');
    successCheckImg.src = 'success_check.svg';
    dropZoneElement.appendChild(successCheckImg);
    successCheckImg.classList.add("success-check");
    let dropUploaded = document.createElement('div');
    dropZoneElement.appendChild(dropUploaded);
    dropUploaded.dataset.label = fileName;
    dropUploaded.classList.add("drop-zone__file-uploaded");
    
    createInputFields(file);
}

function createInputFields(file){

    let sheetNameContainer = document.createElement('div');
    body.appendChild(sheetNameContainer);
    sheetNameContainer.classList.add("sheet-name__container");

    let sheetInputLabel = document.createElement('label');
    sheetNameContainer.appendChild(sheetInputLabel);
    sheetInputLabel.setAttribute("for","sheet-name-input");
    sheetInputLabel.classList.add("form-label")
    sheetInputLabel.textContent = "Sheet Name:";

    let sheetInputField = document.createElement('input');
    sheetNameContainer.appendChild(sheetInputField);
    sheetInputField.classList.add("form__field");
    sheetInputField.setAttribute("type","text");
    sheetInputField.setAttribute("name","sheet-name-input");
    sheetInputField.setAttribute("placeholder","Sheet Name");
    sheetInputField.setAttribute("id", "sheet-name-input")

    let sheetBtnContainer = document.createElement('div');
    body.appendChild(sheetBtnContainer);
    sheetBtnContainer.classList.add("submit-container");

    let sheetSubmitBtn = document.createElement('button');
    sheetBtnContainer.appendChild(sheetSubmitBtn);
    sheetSubmitBtn.classList.add("submit-btn");
    sheetSubmitBtn.textContent = "SUBMIT";
    sheetSubmitBtn.setAttribute("type","submit");
    sheetSubmitBtn.addEventListener("click", e => {
        eel.startSheetCreation(file.name, sheetInputField.value);
    });
}