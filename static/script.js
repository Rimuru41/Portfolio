/**
 * ULTIMATE GAME-THEMED JS LOGIC
 * Includes XP Scroll Tracking, 3D Tilt Cards, Intersection Observers, and Admin Logic
 */

const isAdmin = window.__isAdmin || false;

// ==========================================
// 1. VISUAL EFFECTS & ANIMATIONS
// ==========================================

// Render Pixel Particles
const particleContainer = document.getElementById('particles-container');
if (particleContainer) {
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'pixel-particle';
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDelay = `${Math.random() * 10}s`;
        p.style.animationDuration = `${5 + Math.random() * 10}s`;
        particleContainer.appendChild(p);
    }
}

// 3D Tilt Effect on Cards
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});

// Intersection Observer for Scroll Reveals
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: unobserve if we only want it to animate once
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));


// Scroll-based XP / Level Up System
const globalXpBar = document.getElementById('scroll-xp-bar');
const heroXpFill = document.getElementById('hero-xp-fill');
const xpText = document.getElementById('xp-text');
const lvlDisplay = document.getElementById('lvl-display');
const toastBox = document.getElementById('level-up-toast');
const toastLvl = document.getElementById('toast-lvl');

let currentLevel = 1;
const maxLevel = 99;

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;

    // Global Header Bar
    if (globalXpBar) {
        globalXpBar.style.width = `${scrollPercent * 100}%`;
    }

    // Hero Profile Math
    const totalXP = Math.floor(scrollPercent * 10000);
    if (heroXpFill) heroXpFill.style.width = `${scrollPercent * 100}%`;
    if (xpText) xpText.innerText = `${totalXP} / 10000 XP`;

    // Dynamic Leveling based on milestones
    const newLevel = Math.max(1, Math.floor((scrollPercent + 0.1) * 10)); // Arbitrary fun curve
    if (newLevel > currentLevel && newLevel <= 10) {
        currentLevel = newLevel;
        if (lvlDisplay) lvlDisplay.innerText = `LVL ${currentLevel}`;

        // Show Level Up Toast
        if (toastBox && currentLevel > 1) {
            toastLvl.innerText = currentLevel;
            toastBox.classList.remove('hidden');
            toastBox.style.animation = 'none';
            void toastBox.offsetWidth; // Trigger reflow
            toastBox.style.animation = 'slideInUp 0.5s forwards';

            setTimeout(() => {
                toastBox.style.animation = 'slideOutDown 0.5s forwards';
                setTimeout(() => toastBox.classList.add('hidden'), 500);
            }, 3000);
        }
    }
});


// ==========================================
// 2. SKILLS LOADER (AJAX)
// ==========================================
document.getElementById('load-skills')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const container = document.getElementById('skills-container');
    if (!container) return;

    btn.innerText = "Scanning... [||||      ]";
    container.innerHTML = "<div class='scanning-text'>Uplinking to Neural Net...</div>";

    try {
        const response = await fetch('/api/skills');
        const data = await response.json();

        setTimeout(() => {
            btn.innerText = "Abilities Scanned [OK]";

            // Build Skills Grid
            let html = `<div class="skill-tree-grid">`;
            data.skills.forEach(s => {
                html += `
                    <div class="skill-node cyber-hover tilt-card">
                        <div class="skill-core">
                            <span class="skill-name">${s.skill_name}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;

            if (isAdmin) {
                html += `
                <div class="admin-controls-panel mt-4">
                    <button id="add-skill-btn" class="btn-secondary cyber-btn">Forge Skill</button>
                    <!-- Deletion logic omitted for brevity in skill nodes, but could be added -->
                </div>`;
            }

            container.innerHTML = html;

            // Optional: Re-bind tilt effect for new dynamically added cards
            document.querySelectorAll('.skill-node').forEach(card => {
                // simple tilt bind
                card.addEventListener('mousemove', ev => {
                    card.style.transform = `scale(1.05)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = `scale(1)`;
                });
            });

        }, 800);
    } catch (error) {
        container.innerHTML = "<div class='danger-text'>Uplink severed.</div>";
        btn.innerText = "Scan Failed [ERR]";
    }
});


// ==========================================
// 3. PROJECT/QUEST MANAGEMENT (ADMIN)
// ==========================================
const projectModal = document.getElementById('project-modal');
const deleteModal = document.getElementById('delete-modal');
const projectForm = document.getElementById('project-form');
const modalTitle = document.getElementById('modal-title');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
let currentProjectId = null;

const toggleModal = (modal, show = true) => {
    if (!modal) return;
    modal.classList.toggle('active', show);
    if (!show && modal === projectModal && projectForm) projectForm.reset();
};

document.addEventListener('click', (e) => {
    // Menu Dropdown Toggle (admin only)
    if (e.target.classList.contains('menu-trigger')) {
        const dropdown = e.target.nextElementSibling;
        document.querySelectorAll('.menu-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
        return;
    }

    if (!e.target.closest('.card-menu')) {
        document.querySelectorAll('.menu-dropdown').forEach(d => d.classList.remove('active'));
    }

    if (e.target.classList.contains('closeModal') || e.target.classList.contains('modal')) {
        const modal = e.target.closest('.modal');
        if (modal && e.target === modal || e.target.classList.contains('closeModal')) {
            toggleModal(modal, false);
        }
    }

    // Edit Project
    if (e.target.classList.contains('edit-btn') && isAdmin) {
        currentProjectId = e.target.dataset.id;
        try {
            const projectData = JSON.parse(atob(e.target.dataset.proj));
            document.getElementById('project-id').value = projectData.id;
            document.getElementById('title').value = projectData.Project_Name;
            document.getElementById('description').value = projectData.Description;
            document.getElementById('tech_stack').value = projectData.Tech_Stack;
            document.getElementById('link').value = projectData.Link;
            document.getElementById('category').value = projectData.Category || 'Main Quest';
            document.getElementById('difficulty').value = projectData.Difficulty || 5;
            document.getElementById('image_url').value = projectData.Image_URL || '';

            modalTitle.innerText = "Modifying Quest Parameters";
            toggleModal(projectModal, true);
        } catch (err) {
            console.error("Data parse error", err);
        }
    }

    // Delete Project
    if (e.target.classList.contains('delete-btn') && isAdmin) {
        currentProjectId = e.target.dataset.id;
        toggleModal(deleteModal, true);
    }
});

// Add Project Button
document.getElementById('add-project-btn')?.addEventListener('click', () => {
    currentProjectId = null;
    modalTitle.innerText = "Forging New Quest";
    document.getElementById('project-id').value = "";
    toggleModal(projectModal, true);
});

// Submit Form
projectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        Project_Name: document.getElementById('title').value,
        Description: document.getElementById('description').value,
        Tech_Stack: document.getElementById('tech_stack').value,
        Link: document.getElementById('link').value,
        Category: document.getElementById('category').value,
        Difficulty: parseInt(document.getElementById('difficulty').value) || 5,
        Image_URL: document.getElementById('image_url').value
    };

    const url = currentProjectId ? `/api/projects/${currentProjectId}` : '/api/projects';
    const method = currentProjectId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            location.reload(); // Hard reload to fetch new categories/EJS layout properly
        } else {
            alert("Database Sync Failed.");
        }
    } catch (error) {
        console.error("Error saving project:", error);
    }
});

confirmDeleteBtn?.addEventListener('click', async () => {
    if (!currentProjectId) return;
    try {
        const response = await fetch(`/api/projects/${currentProjectId}`, { method: 'DELETE' });
        if (response.ok) {
            location.reload();
        } else {
            alert("Delete Protocol Failed.");
        }
    } catch (error) {
        console.error("Error deleting project:", error);
    }
});

// ==========================================
// 4. LOGIN LOGIC
// ==========================================

const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const adminCornerBtn = document.getElementById('admin-corner-btn');

adminCornerBtn?.addEventListener('click', () => {
    if (isAdmin) {
        fetch('/api/logout', { method: 'POST' }).then(() => location.reload());
    } else {
        toggleModal(loginModal, true);
    }
});

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginError = document.getElementById('login-error');
    loginError.textContent = 'Authenticating...';

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            location.reload();
        } else {
            const data = await response.json();
            loginError.textContent = data.error || 'Access Denied';
        }
    } catch (error) {
        loginError.textContent = 'Connection compromised.';
    }
});

// Smooth Scrolling Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});