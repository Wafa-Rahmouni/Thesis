document.addEventListener("DOMContentLoaded", () => {
    const scrollingBackground = document.querySelector(".scrolling-background");

    // Array of image paths
    const images = [
        "./frame-medical-equipment-desk.jpg", // Corrected to relative paths
        "./clean-medical-background_53876-116877.jpg",
        "./v870-tang-36.jpg"
    ];

    // Dynamically add images to the scrolling background
    images.forEach((imagePath) => {
        const div = document.createElement("div");
        div.classList.add("background-image");
        div.style.backgroundImage = `url('${imagePath}')`;
        // Remove any blur-related styles
        div.style.filter = "none";
        scrollingBackground.appendChild(div);
    });

    // Move the header down slightly
    const header = document.querySelector("header");
    if (header) {
        header.style.marginTop = "20px"; // Adjust the value as needed
    }

    // Handle animated slider effect
    let currentIndex = 0;
    setInterval(() => {
        const backgroundImages = document.querySelectorAll(".background-image");
        backgroundImages.forEach((img, index) => {
            img.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
        });
        currentIndex = (currentIndex + 1) % images.length;
    }, 3000); // Change image every 3 seconds

    const searchBar = document.querySelector(".search-bar");
    const searchInput = searchBar.querySelector("input");

    // Expand search bar on focus
    searchInput.addEventListener("focus", () => {
        searchBar.classList.add("focused");
    });

    // Collapse search bar when focus is lost
    searchInput.addEventListener("blur", () => {
        searchBar.classList.remove("focused");
    });
});
