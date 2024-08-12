let uploadedFile = null;
let cropper = null;


document.addEventListener("DOMContentLoaded", function() {
    const hasAcceptedPrivacy = localStorage.getItem("acceptedPrivacy");
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.getElementById('pageModeToggle').checked = isDarkMode;
    if (isDarkMode){
        document.body.style.backgroundColor = "#303136";
        document.documentElement.style.backgroundColor = "#303136";
    }
  
    if (!hasAcceptedPrivacy) {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.display = "flex";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.zIndex = "1000";
  
      const privacyCard = document.createElement("div");
      privacyCard.innerHTML = `
        <div class="card">
          <div class="card-wrapper">
            <div class="card-icon">
              <div class="icon-cart-box">
                <svg viewBox="0 0 512 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z" fill="#ffffff"></path>
                </svg>
              </div>
            </div>
            <div class="card-content">
              <div class="card-title-wrapper">
                <span class="card-title">Privacy</span>
                <span class="card-action">
                  <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 384 512">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                  </svg>
                </span>
              </div>
              <div class="card-text">
                This website requires cookies to provide all of its features. Please enable your browser cookies.
              </div>
              <button type="button" class="btn-accept">Accept</button>
            </div>
          </div>
        </div>
      `;
      
      overlay.appendChild(privacyCard);
      document.body.appendChild(overlay);
  
      privacyCard.querySelector(".btn-accept").addEventListener("click", function() {
        localStorage.setItem("acceptedPrivacy", "true");
        document.body.removeChild(overlay);
      });
  
      privacyCard.querySelector(".card-action svg").addEventListener("click", function() {
        document.body.removeChild(overlay);
      });
    }
});

document.getElementById('pageModeToggle').addEventListener('change', function () {
    if (this.checked) {
        document.body.style.backgroundColor = "#303136";
        document.documentElement.style.backgroundColor = "#303136";
    } else {
        document.body.style.backgroundColor = "#f2f2f2";
        document.documentElement.style.backgroundColor = "#f2f2f2";
    }
});

document.getElementById('pageModeToggle').addEventListener('change', function () {
    localStorage.setItem('darkMode', this.checked);
});

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

document.getElementById('file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        const fileType = file.type;

        if (!fileType.startsWith('image/')) {

            event.target.value = '';

            Swal.fire({
                icon: 'error',
                title: 'Invalid File',
                text: 'Please upload a valid image file.',
            });
        } else {
            uploadedFile = file;
            const imageUrl = URL.createObjectURL(file);

            Swal.fire({
                icon: 'success',
                title: "File Accepted",
                text: "Do you want to upload this image ?",
                imageUrl: imageUrl,
                imageAlt: "Custom image",
                showCancelButton: true,
                confirmButtonText: 'Yes, proceed',
                cancelButtonText: 'No, cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('dashboardPopup').style.display = 'block';
                } else if (result.isDismissed) {
                    document.getElementById('file-input').value = '';

                    Swal.fire(
                        'Cancelled',
                        'You have chosen to cancel.',
                        'error'
                    );
                }
            });
        }
    }
});




function closePopup() {
    document.getElementById('dashboardPopup').style.display = 'none';
    document.getElementById('file-input').value = '';
}

function Cropped() {
    if (uploadedFile) {
        const imageUrl = URL.createObjectURL(uploadedFile);

        function throttle(fn, wait) {
            let lastTime = 0;
            return function (...args) {
                const now = Date.now();
                if (now - lastTime >= wait) {
                    lastTime = now;
                    fn(...args);
                }
            };
        }

        Swal.fire({
            title: 'Cropper',
            html: `
                <img id="preview" src="${imageUrl}">
                <div>
                    <img id="cropperjs" src="${imageUrl}">
                </div>
            `,
            didOpen: () => {
                const image = Swal.getPopup().querySelector('#cropperjs');
                cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                    crop: throttle(function () {
                        const croppedCanvas = cropper.getCroppedCanvas();
                        const preview = Swal.getPopup().querySelector('#preview');
                        preview.src = croppedCanvas.toDataURL();
                    }, 25),
                });
            },
            showCancelButton: true,
            confirmButtonText: 'Download Cropped Image',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const croppedCanvas = cropper.getCroppedCanvas();
                return croppedCanvas.toDataURL();
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const link = document.createElement('a');
                link.href = result.value;
                link.download = 'cropped-image.png';
                link.click();
                Toast.fire({
                    icon: "success",
                    title: "Downloaded successfully"
                });
            }
        });
    } else {
        Swal.fire({
            title: "Error!",
            text: "No file uploaded.",
            icon: "error"
        });
    }
}

function resizeImage() {
    if (uploadedFile) {
        const imageUrl = URL.createObjectURL(uploadedFile);

        Swal.fire({
            title: 'Resize Image',
            html: `
                <img id="previewresize" src="${imageUrl}" style="max-width: 100%; height: auto;">
                <div>
                    <input type="number" id="resizeWidth" placeholder="Width (px)" style="margin-top: 10px;">
                    <input type="number" id="resizeHeight" placeholder="Height (px)" style="margin-top: 10px;">
                </div>
            `,
            didOpen: () => {
                const preview = Swal.getPopup().querySelector('#previewresize');
                document.getElementById('resizeWidth').addEventListener('input', () => updatePreview(preview));
                document.getElementById('resizeHeight').addEventListener('input', () => updatePreview(preview));
            },
            showCancelButton: true,
            confirmButtonText: 'Download Resized Image',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const width = parseInt(document.getElementById('resizeWidth').value, 10);
                const height = parseInt(document.getElementById('resizeHeight').value, 10);

                if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                    Swal.showValidationMessage('Please enter valid width and height.');
                    return;
                }

                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = imageUrl;
                    img.onload = () => {
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/png'));
                    };
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const link = document.createElement('a');
                link.href = result.value;
                link.download = 'resized-image.png';
                link.click();
                Toast.fire({
                    icon: "success",
                    title: "Downloaded successfully"
                });
            }
        });

        function updatePreview(preview) {
            const width = parseInt(document.getElementById('resizeWidth').value, 10);
            const height = parseInt(document.getElementById('resizeHeight').value, 10);

            if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    preview.src = canvas.toDataURL('image/png');
                };
            }
        }
    } else {
        Swal.fire({
            title: "Error!",
            text: "No file uploaded.",
            icon: "error"
        });
    }
}



function ImageToPdf() {
    if (uploadedFile) {
        const imageUrl = URL.createObjectURL(uploadedFile);
        let imgWidth, imgHeight;
        const { jsPDF } = window.jspdf;

        Swal.fire({
            title: 'Convert Image to PDF',
            html: `
                <img id="uploadedImage" src="${imageUrl}" style="max-width: 100%; height: auto;">
                <div>
                    <label for="pdfOption">Choose PDF Option:</label>
                    <select id="pdfOption">
                        <option value="fit">Fit PDF to Image Size</option>
                        <option value="portraitA4">Portrait (A4 - 297x210 mm)</option>
                        <option value="landscapeA4">Landscape (A4 - 297x210 mm)</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Download as PDF',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                return new Promise((resolve) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.src = imageUrl;

                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        resolve({
                            imgData: canvas.toDataURL('image/png'),
                            imgWidth: img.width,
                            imgHeight: img.height,
                            pdfOption: document.getElementById('pdfOption').value
                        });
                    };
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { imgData, imgWidth, imgHeight, pdfOption } = result.value;
                let pdf;

                if (pdfOption === 'fit') {
                    pdf = new jsPDF({
                        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [imgWidth, imgHeight]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                } else if (pdfOption === 'portraitA4') {
                    pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    const scaleFactor = Math.min(210 / imgWidth, 297 / imgHeight);
                    const pdfWidth = imgWidth * scaleFactor;
                    const pdfHeight = imgHeight * scaleFactor;
                    const xOffset = (210 - pdfWidth) / 2;
                    const yOffset = (297 - pdfHeight) / 2;
                    pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight);
                } else if (pdfOption === 'landscapeA4') {
                    pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'mm',
                        format: 'a4'
                    });
                    const scaleFactor = Math.min(297 / imgWidth, 210 / imgHeight);
                    const pdfWidth = imgWidth * scaleFactor;
                    const pdfHeight = imgHeight * scaleFactor;
                    const xOffset = (297 - pdfWidth) / 2;
                    const yOffset = (210 - pdfHeight) / 2;
                    pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight);
                }

                pdf.save('image.pdf');
                URL.revokeObjectURL(imageUrl);
                Toast.fire({
                    icon: "success",
                    title: "Downloaded successfully"
                });
            }
        });
    } else {
        Swal.fire({
            title: "Error!",
            text: "No file uploaded.",
            icon: "errorerror"
        });
    }
}
