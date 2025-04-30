document.addEventListener("DOMContentLoaded", () => {
    // Remove the preloader after the page has fully loaded
    window.onload = () => {
        const preloader = document.getElementById("preloader");
        const mainContent = document.getElementById("main-content");

        if (preloader && mainContent) {
            preloader.style.display = "none";
            mainContent.style.display = "block";
        }
    };

    // Scroll animation for general containers
    window.addEventListener("scroll", () => {
        const elements = document.querySelectorAll(".container");
        elements.forEach(el => {
            const position = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (position < windowHeight - 100) {
                el.classList.add("visible");
            }
        });
    });

    // Role-specific content data
    const practitionerServices = [
        { title: "Patient Management", description: "Manage patient records, appointments, and monitor health in real-time.", image: "https://via.placeholder.com/400x250?text=Practitioner+Service+1" },
        { title: "Telemedicine Tools", description: "Remote consultations with video/chat support, EHR integration, and secure sessions.", image: "https://via.placeholder.com/400x250?text=Practitioner+Service+2" },
        { title: "Remote Diagnostics", description: "AI-powered diagnostics with alerts, wearable sync, and specialist sharing.", image: "https://via.placeholder.com/400x250?text=Practitioner+Service+3" },
        { title: "Case Collaboration", description: "Collaborate on cases with shared records, peer invites, and voice/video notes.", image: "https://via.placeholder.com/400x250?text=Practitioner+Service+4" }
    ];

    const patientServices = [
        { title: "Health Dashboard", description: "Track vitals, meds, reminders, and appointments, with direct doctor communication.", image: "https://via.placeholder.com/400x250?text=Patient+Service+1" },
        { title: "24/7 Support", description: "Emergency chat, nurse hotline, condition guides, and wellness coaching.", image: "https://via.placeholder.com/400x250?text=Patient+Service+2" },
        { title: "Virtual Assistant", description: "Daily health guidance, Q&A, check-ins, mood support, and goal tracking.", image: "https://via.placeholder.com/400x250?text=Patient+Service+3" },
        { title: "Family Organizer", description: "Manage family health with linked profiles, shared meds, and group alerts.", image: "https://via.placeholder.com/400x250?text=Patient+Service+4" }
    ];

    // Store toggle state for role selection
    let currentRole = null;
    const servicesContainer = document.querySelector(".services-container");
    const roleSelector = document.querySelector("#role");
    const defaultContent = servicesContainer ? servicesContainer.innerHTML : "";

    function createServiceBox(service, roleClass) {
        const box = document.createElement("div");
        box.classList.add("service-box", "customized", roleClass);

        const img = document.createElement("img");
        img.src = service.image;
        img.alt = service.title;

        const title = document.createElement("h2");
        title.textContent = service.title;

        const desc = document.createElement("p");
        desc.textContent = service.description;

        box.appendChild(img);
        box.appendChild(title);
        box.appendChild(desc);

        return box;
    }

    function showRoleServices(role) {
        if (!servicesContainer || !roleSelector) return;
        
        if (currentRole === role) {
            servicesContainer.innerHTML = defaultContent;
            currentRole = null;
            roleSelector.textContent = "Select a role to get started";
            return;
        }

        servicesContainer.innerHTML = "";
        const selectedServices = role === "practitioner" ? practitionerServices : patientServices;

        selectedServices.forEach(service => {
            const box = createServiceBox(service, role);
            servicesContainer.appendChild(box);
        });

        currentRole = role;
        roleSelector.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Role Selected`;
    }

    // Modal open/close logic
    const loginLink = document.querySelector(".login-link");
    const loginModal = document.getElementById("loginModal");
    const closeModal = document.getElementById("closeModal");

    if (loginLink && loginModal) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            loginModal.style.display = "flex";
        });
    }

    function closeLoginModal() {
        if (loginModal) loginModal.style.display = "none";
    }

    if (closeModal) closeModal.addEventListener("click", closeLoginModal);

    if (loginModal) {
        loginModal.addEventListener("click", (e) => {
            if (!e.target.closest(".modal-content")) {
                closeLoginModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeLoginModal();
        }
    });

    // Role-specific form visibility toggle
    const roleDropdown = document.getElementById("role");
    const patientFields = document.getElementById("patientFields");
    const doctorFields = document.getElementById("doctorFields");

    if (roleDropdown && patientFields && doctorFields) {
        roleDropdown.addEventListener("change", function () {
            patientFields.style.display = this.value === "patient" ? "block" : "none";
            doctorFields.style.display = this.value === "doctor" ? "block" : "none";
        });
    }

    // Fix duplicate event listeners for login/register toggles
    const showLogin = document.getElementById("showLogin");
    const showRegister = document.getElementById("showRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (showLogin && showRegister && loginForm && registerForm) {
        showLogin.addEventListener("click", (e) => {
            e.preventDefault();
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        });

        showRegister.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        });
    }
});
