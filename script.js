const slide1 = document.getElementById("slide-1");
const slide2 = document.getElementById("slide-2");

document.getElementById("btn-lanjut").addEventListener("click", function () {
    slide1.hidden = true;
    slide2.hidden = false;
});