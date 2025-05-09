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
        {
            title: "Patient Management",
            description: "Manage patient records, appointments, and monitor health in real-time.",
            image: "https://via.placeholder.com/400x250?text=Practitioner+Service+1",
        },
        {
            title: "Telemedicine Tools",
            description: "Remote consultations with video/chat support, EHR integration, and secure sessions.",
            image: "https://via.placeholder.com/400x250?text=Practitioner+Service+2",
        },
        {
            title: "Remote Diagnostics",
            description: "AI-powered diagnostics with alerts, wearable sync, and specialist sharing.",
            image: "https://via.placeholder.com/400x250?text=Practitioner+Service+3",
        },
        {
            title: "Case Collaboration",
            description: "Collaborate on cases with shared records, peer invites, and voice/video notes.",
            image: "https://via.placeholder.com/400x250?text=Practitioner+Service+4",
        },
    ];

    const patientServices = [
        {
            title: "Health Dashboard",
            description: "Track vitals, meds, reminders, and appointments, with direct doctor communication.",
            image: "https://via.placeholder.com/400x250?text=Patient+Service+1",
        },
        {
            title: "24/7 Support",
            description: "Emergency chat, nurse hotline, condition guides, and wellness coaching.",
            image: "https://via.placeholder.com/400x250?text=Patient+Service+2",
        },
        {
            title: "Virtual Assistant",
            description: "Daily health guidance, Q&A, check-ins, mood support, and goal tracking.",
            image: "https://via.placeholder.com/400x250?text=Patient+Service+3",
        },
        {
            title: "Personalized Care Plans",
            description: "Receive tailored care plans based on your health needs and goals.",
            image: "https://via.placeholder.com/400x250?text=Patient+Service+4",
        },
    ];

    // Function to dynamically update the services container
    function updateServices(role) {
        const servicesContainer = document.querySelector(".services-container");
        const roleSelector = document.querySelector("#role");

        if (!servicesContainer || !roleSelector) return;

        // Clear the current content
        servicesContainer.innerHTML = "";

        // Select the appropriate services based on the role
        const selectedServices = role === "practitioner" ? practitionerServices : patientServices;

        // Update the role selector text
        roleSelector.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Role Selected`;

        // Populate the container with the selected services
        selectedServices.forEach((service) => {
            const serviceBox = document.createElement("div");
            serviceBox.classList.add("service-box");

            const img = document.createElement("img");
            img.src = service.image;
            img.alt = service.title;

            const title = document.createElement("h2");
            title.textContent = service.title;

            const description = document.createElement("p");
            description.textContent = service.description;

            serviceBox.appendChild(img);
            serviceBox.appendChild(title);
            serviceBox.appendChild(description);

            servicesContainer.appendChild(serviceBox);
        });

        // Scroll to the services section
        servicesContainer.scrollIntoView({ behavior: "smooth" });
    }

    // Attach event listeners to the buttons
    document.querySelector(".styled-button:nth-child(1)").addEventListener("click", () => updateServices("practitioner"));
    document.querySelector(".styled-button:nth-child(2)").addEventListener("click", () => updateServices("patient"));

    // Modal open/close logic
    const loginLink = document.querySelector(".login-link");
    const loginModal = document.getElementById("loginModal");
    const closeModal = document.getElementById("closeModal");
    const closeModalLogin = document.getElementById("closeModalLogin");

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
    if (closeModalLogin) closeModalLogin.addEventListener("click", closeLoginModal);

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

    // Form visibility toggle based on selected role in the form
    const formRoleSelector = document.getElementById("formRoleSelector");
    const patientFields = document.getElementById("patientFields");
    const doctorFields = document.getElementById("doctorFields");

    if (formRoleSelector && patientFields && doctorFields) {
        formRoleSelector.addEventListener("change", function () {
            const selectedRole = this.value;
            patientFields.style.display = selectedRole === "patient" ? "block" : "none";
            doctorFields.style.display = selectedRole === "doctor" ? "block" : "none";
        });

        // Trigger once on load to ensure correct initial display
        formRoleSelector.dispatchEvent(new Event("change"));
    }

    // Fix login/register form toggle
    const showLogin = document.getElementById("showLogin");
    const showRegister = document.getElementById("showRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (showLogin && showRegister && loginForm && registerForm) {
        // Preserve styling when toggling between forms
        showLogin.addEventListener("click", (e) => {
            e.preventDefault();
            registerForm.style.display = "none";
            loginForm.style.display = "flex"; // Changed from "block" to "flex"
            
            // Make sure login form has all the necessary styling
            loginForm.classList.add("form");
            
            // Ensure proper positioning of elements inside the form
            const labelElements = loginForm.querySelectorAll("label");
            labelElements.forEach(label => {
                if (label.querySelector(".input")) {
                    const input = label.querySelector(".input");
                    const span = label.querySelector("span");
                    if (input && span) {
                        // Ensure proper behavior for floating labels
                        input.addEventListener("focus", () => {
                            span.style.top = "-8px";
                            span.style.fontSize = "0.7em";
                            span.style.color = "#38DB7C";
                            span.style.fontWeight = "600";
                        });
                        
                        input.addEventListener("blur", () => {
                            if (input.value === "") {
                                span.style.top = "12px";
                                span.style.fontSize = "0.9em";
                                span.style.color = "#888";
                                span.style.fontWeight = "normal";
                            }
                        });
                    }
                }
            });
        });

        showRegister.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.style.display = "none";
            registerForm.style.display = "flex"; // Changed from "block" to "flex"
            
            // Make sure register form has all the necessary styling
            registerForm.classList.add("form");
            
            // Ensure proper positioning of elements inside the form
            const labelElements = registerForm.querySelectorAll("label");
            labelElements.forEach(label => {
                if (label.querySelector(".input")) {
                    const input = label.querySelector(".input");
                    const span = label.querySelector("span");
                    if (input && span) {
                        // Ensure proper behavior for floating labels
                        input.addEventListener("focus", () => {
                            span.style.top = "-8px";
                            span.style.fontSize = "0.7em";
                            span.style.color = "#38DB7C";
                            span.style.fontWeight = "600";
                        });
                        
                        input.addEventListener("blur", () => {
                            if (input.value === "") {
                                span.style.top = "12px";
                                span.style.fontSize = "0.9em";
                                span.style.color = "#888";
                                span.style.fontWeight = "normal";
                            }
                        });
                    }
                }
            });
        });
    }

    // Initialize floating labels behavior for all inputs
    const allInputs = document.querySelectorAll(".input");
    allInputs.forEach(input => {
        const label = input.parentElement;
        const span = label.querySelector("span");
        
        if (span) {
            // Set initial state based on whether input has value
            if (input.value !== "") {
                span.style.top = "-8px";
                span.style.fontSize = "0.7em";
                span.style.color = "#38DB7C";
                span.style.fontWeight = "600";
            }
            
            // Add event listeners
            input.addEventListener("focus", () => {
                span.style.top = "-8px";
                span.style.fontSize = "0.7em";
                span.style.color = "#38DB7C";
                span.style.fontWeight = "600";
            });
            
            input.addEventListener("blur", () => {
                if (input.value === "") {
                    span.style.top = "12px";
                    span.style.fontSize = "0.9em";
                    span.style.color = "#888";
                    span.style.fontWeight = "normal";
                }
            });
        }
    });

    // Store the selected role in localStorage and redirect to the personalized dashboard
    function selectRole(role) {
        console.log(`Redirecting user with role: ${role}`); // Debugging log
        localStorage.setItem("userRole", role); // Save the role ("doctor" or "patient")
        if (role === "doctor") {
            window.location.href = "doctors/appointments.html"; // Redirect to the doctor's appointments page
        } else if (role === "patient") {
            window.location.href = "patients/appointments/appointment.html"; // Redirect to the patient's appointments page
        }
    }

    // Redirect to the appropriate Messages page based on the stored role
    function redirectToMessages() {
        const userRole = localStorage.getItem("userRole"); // Retrieve the stored role
        if (userRole === "doctor") {
            window.location.href = "doctors/messages.html"; // Redirect to Doctors Messages page
        } else if (userRole === "patient") {
            window.location.href = "patients/messages.html"; // Redirect to Patients Messages page
        } else {
            alert("Please select a role first.");
            window.location.href = "home.html"; // Redirect back to the home page if no role is selected
        }
    }

    // Login form submission logic
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        const email = document.querySelector("#loginForm input[type='email']").value;
        const password = document.querySelector("#loginForm input[type='password']").value;

        let userRole;
        if (email === "doctor@example.com" && password === "password") {
            userRole = "doctor";
        } else if (email === "patient@example.com" && password === "password") {
            userRole = "patient";
        } else {
            alert("Invalid credentials. Please try again.");
            return;
        }

        console.log(`User role determined: ${userRole}`); // Debugging log
        selectRole(userRole);
    });

    // Register form submission logic
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        const role = document.getElementById("formRoleSelector").value;

        if (!role) {
            alert("Please select a role.");
            return;
        }

        console.log(`User role selected during registration: ${role}`); // Debugging log
        selectRole(role);
        document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting

    const roleSelector = document.getElementById('formRoleSelector');
    const selectedRole = roleSelector.value;

    if (!selectedRole) {
      alert('Please select a role before submitting.');
      return;
    }

    // Store the selected role in localStorage
    localStorage.setItem('userRole', selectedRole);

    alert('Registration successful! Role saved as: ' + selectedRole);

    // Redirect to the dashboard or another page
    window.location.href = '/dashboard.html'; // Adjust the path as needed
  });

  // Show/hide additional fields based on the selected role
  document.getElementById('formRoleSelector').addEventListener('change', function () {
    const selectedRole = this.value;

    document.getElementById('patientFields').style.display =
      selectedRole === 'patient' ? 'block' : 'none';
    document.getElementById('doctorFields').style.display =
      selectedRole === 'doctor' ? 'block' : 'none';
  });
  
    });
});