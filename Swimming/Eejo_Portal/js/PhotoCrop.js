let cropper;
  const UploadedPhoto = document.getElementById('UploadedPhoto');
  const image = document.getElementById('image');

  UploadedPhoto.addEventListener('change', function (e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (event) {
        image.src = event.target.result;
        image.style.display = 'block';

        if (cropper) {
          cropper.destroy();
        }

        cropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode: 1,
          autoCropArea: 1,
          responsive: true,
        });
      };
      reader.readAsDataURL(files[0]);
    }
  });

  

  function resetCrop() {
    if (cropper) {
      cropper.reset();
    }
  }