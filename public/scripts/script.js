const acc = document.getElementsByClassName("accordion");
let i;
for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        this.classList.toggle("active-answer");
        this.classList.toggle("rotate-image");
        let panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
            this.classList.toggle("remove-image");
        } else {
            panel.style.display = "block";
            panel.classList.add('add-animation');
            this.classList.remove('remove-image');
        }
    });
}