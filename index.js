const { ipcRenderer } = require('electron');
require('dotenv').config();

// display app version on title bar
const version = document.getElementById('version');

ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (e, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    version.innerText = 'Image Converter ' + arg.version;
});

// image type the user choose to convertTo in the dropdown
const imageType = document.getElementById('img-type');
let convertTo = 'png';

imageType.addEventListener('change', (e) => {
    convertTo = e.target.value;
})

// error modal when imageArray is empty
const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
let imageArray = [];

// fill imageArray with inserted input images
const inputImages = document.getElementById('formFileMultiple');

inputImages.addEventListener('change', (e) => {
    imageArray = Array.from(e.target.files);
});


const convertButton = document.getElementById('convert');
convertButton.addEventListener('click', (e) => {
    if (imageArray.length === 0) {
        modal.show();
    } else {
        imageArray.forEach(image => {
            ipcRenderer.send('image:sent', {
                images: image.path,
                name: image.name,
                convertTo: convertTo
            });
        })
    }
});