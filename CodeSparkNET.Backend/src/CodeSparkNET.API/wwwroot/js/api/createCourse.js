const mainImageInput = document.getElementById('MainImageUrl');
const imagePreviewWrap = document.getElementById('imagePreview');
const imgPreview = document.getElementById('imgPreview');

function showPreview(url) {
  if (!url) {
    imagePreviewWrap.style.display = 'none';
    imgPreview.src = '';
    return;
  }
  imgPreview.src = url;
  imagePreviewWrap.style.display = 'block';
}

if (mainImageInput) {
  mainImageInput.addEventListener('input', function () {
    const val = mainImageInput.value.trim();
    try {
      const u = new URL(val);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        showPreview(val);
        return;
      }
    } catch (e) { /* invalid url */ }
    showPreview('');
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (mainImageInput.value) showPreview(mainImageInput.value);
  });
}
