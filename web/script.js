const fileUploadImg = document.querySelector(".file-upload");
const dropPrompt = document.querySelector(".drop-zone__prompt");

document.querySelectorAll(".drop-zone__input").forEach(inputElement => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("dragover", e => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach(type => {
        dropZoneElement.addEventListener(type, e => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", e => {
        e.preventDefault();

        console.log('Dropped');
        
        if(e.dataTransfer.files.length){
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });
});

function updateThumbnail(dropZoneElement, file) {
    console.log("Updating thumbnail");
    fileUploadImg.remove();
    dropPrompt.remove();
    let successCheckImg = document.createElement('img');
    successCheckImg.src = 'success_check.svg';
    dropZoneElement.appendChild(successCheckImg);
    successCheckImg.classList.add("success-check");
    let dropUploaded = document.createElement('div');
    dropZoneElement.appendChild(dropUploaded);
    dropUploaded.dataset.label = file.name;
    dropUploaded.classList.add("drop-zone__file-uploaded");
}