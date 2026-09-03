/* =========================================================
   RAY SPORTS CLUB — ADMIN PANEL
   Supabase Admin JavaScript
   ========================================================= */

/* =========================================================
   SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL = "https://xkdqxtxfkgbrmbotazel.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Y2XKqEGilp7YY2P9Kww60g_NHzrRdH4";

const { createClient } = supabase;

const db = createClient(
    https://xkdqxtxfkgbrmbotazel.supabase.co,)
    sb_publishable_Y2XKqEGilp7YY2P9Kww60g_NHzrRdH4
);


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentAdmin = null;

let members = [];
let bookings = [];
let payments = [];
let trainers = [];

let currentSection = "dashboard";


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Ray Sports Club Admin Panel Loaded");

    setupNavigation();
    setupLogout();
    setupForms();

    await checkAdminSession();

});


/* =========================================================
   ADMIN SESSION
   ========================================================= */

async function checkAdminSession() {

    try {

        const {
            data: { session },
            error
        } = await db.auth.getSession();

        if (error) {
            console.error(error);
            return;
        }

        if (!session) {

            showLoginScreen();

            return;
        }

        currentAdmin = session.user;

        showAdminPanel();

        await loadAllData();

    } catch (error) {

        console.error("Session error:", error);

    }

}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLoginScreen() {

    const login = document.getElementById("loginSection");
    const panel = document.getElementById("adminPanel");

    if (login) {
        login.style.display = "flex";
    }

    if (panel) {
        panel.style.display = "none";
    }

}


/* =========================================================
   SHOW ADMIN PANEL
   ========================================================= */

function showAdminPanel() {

    const login = document.getElementById("loginSection");
    const panel = document.getElementById("adminPanel");

    if (login) {
        login.style.display = "none";
    }

    if (panel) {
        panel.style.display = "block";
    }

    updateAdminInfo();

}


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

async function adminLogin(event) {

    if (event) {
        event.preventDefault();
    }

    const emailInput =
        document.getElementById("adminEmail");

    const passwordInput =
        document.getElementById("adminPassword");

    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;

    if (!email || !password) {

        showToast(
            "Please enter email and password.",
            "error"
        );

        return;
    }

    try {

        setButtonLoading(
            "loginBtn",
            true,
            "Logging in..."
        );

        const {
            data,
            error
        } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        currentAdmin = data.user;

        showToast(
            "Login successful!",
            "success"
        );

        showAdminPanel();

        await loadAllData();

    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Login failed.",
            "error"
        );

    } finally {

        setButtonLoading(
            "loginBtn",
            false,
            "Login"
        );

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    try {

        const {
            error
        } = await db.auth.signOut();

        if (error) {
            throw error;
        }

        currentAdmin = null;

        showToast(
            "Logged out successfully.",
            "success"
        );

        setTimeout(() => {
            showLoginScreen();
        }, 500);

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to logout.",
            "error"
        );

    }

}


/* =========================================================
   ADMIN INFO
   ========================================================= */

function updateAdminInfo() {

    if (!currentAdmin) {
        return;
    }

    const emailElements = [
        "adminEmailDisplay",
        "loggedInEmail",
        "adminEmailText"
    ];

    emailElements.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                currentAdmin.email || "Administrator";
        }

    });

}


/* =========================================================
   LOAD ALL DATA
   ========================================================= */

async function loadAllData() {

    await Promise.all([
        loadMembers(),
        loadBookings(),
        loadPayments(),
        loadTrainers()
    ]);

    updateDashboard();

}


/* =========================================================
   LOAD MEMBERS
   ========================================================= */

async function loadMembers() {

    try {

        const {
            data,
            error
        } = await db
            .from("members")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error(
                "Members error:",
                error
            );

            members = [];

            return;
        }

        members = data || [];

        renderMembers();
        updateMemberStats();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   LOAD BOOKINGS
   ========================================================= */

async function loadBookings() {

    try {

        const {
            data,
            error
        } = await db
            .from("bookings")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Bookings error:",
                error
            );

            bookings = [];

            return;
        }

        bookings = data || [];

        renderBookings();
        updateBookingStats();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   LOAD PAYMENTS
   ========================================================= */

async function loadPayments() {

    try {

        const {
            data,
            error
        } = await db
            .from("payments")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Payments error:",
                error
            );

            payments = [];

            return;
        }

        payments = data || [];

        renderPayments();
        updatePaymentStats();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   LOAD TRAINERS
   ========================================================= */

async function loadTrainers() {

    try {

        const {
            data,
            error
        } = await db
            .from("trainers")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Trainers error:",
                error
            );

            trainers = [];

            return;
        }

        trainers = data || [];

        renderTrainers();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    setText(
        "totalMembers",
        members.length
    );

    setText(
        "totalBookings",
        bookings.length
    );

    setText(
        "totalPayments",
        payments.length
    );

    setText(
        "totalTrainers",
        trainers.length
    );

    calculateRevenue();

}


/* =========================================================
   MEMBER STATS
   ========================================================= */

function updateMemberStats() {

    const activeMembers =
        members.filter(member => {

            const status =
                String(
                    member.status || ""
                ).toLowerCase();

            return (
                status === "active" ||
                status === "approved"
            );

        });

    const inactiveMembers =
        members.filter(member => {

            const status =
                String(
                    member.status || ""
                ).toLowerCase();

            return (
                status === "inactive" ||
                status === "expired"
            );

        });

    setText(
        "activeMembers",
        activeMembers.length
    );

    setText(
        "inactiveMembers",
        inactiveMembers.length
    );

}


/* =========================================================
   BOOKING STATS
   ========================================================= */

function updateBookingStats() {

    const pending =
        bookings.filter(
            booking =>
                String(
                    booking.status || ""
                ).toLowerCase() === "pending"
        );

    const confirmed =
        bookings.filter(
            booking =>
                String(
                    booking.status || ""
                ).toLowerCase() === "confirmed"
        );

    setText(
        "pendingBookings",
        pending.length
    );

    setText(
        "confirmedBookings",
        confirmed.length
    );

}


/* =========================================================
   PAYMENT STATS
   ========================================================= */

function updatePaymentStats() {

    const total =
        payments.reduce(
            (sum, payment) =>
                sum +
                Number(
                    payment.amount || 0
                ),
            0
        );

    setText(
        "totalRevenue",
        formatCurrency(total)
    );

}


/* =========================================================
   CALCULATE REVENUE
   ========================================================= */

function calculateRevenue() {

    const revenue =
        payments.reduce(
            (total, payment) => {

                return (
                    total +
                    Number(
                        payment.amount || 0
                    )
                );

            },
            0
        );

    setText(
        "revenue",
        formatCurrency(revenue)
    );

    setText(
        "totalRevenue",
        formatCurrency(revenue)
    );

}


/* =========================================================
   RENDER MEMBERS
   ========================================================= */

function renderMembers(list = members) {

    const table =
        document.getElementById("membersTable");

    if (!table) {
        return;
    }

    if (!list.length) {

        table.innerHTML = `
            <tr>
                <td colspan="100%" class="empty-state">
                    No members found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        list.map((member, index) => {

            const name =
                member.name ||
                member.full_name ||
                "Unknown";

            const phone =
                member.phone ||
                member.mobile ||
                "-";

            const email =
                member.email ||
                "-";

            const status =
                member.status ||
                "Active";

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        <strong>
                            ${escapeHTML(name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(phone)}
                    </td>

                    <td>
                        ${escapeHTML(email)}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(status)}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>
                        <button
                            class="action-btn view-btn"
                            onclick="viewMember('${member.id}')">
                            View
                        </button>

                        <button
                            class="action-btn delete-btn"
                            onclick="deleteMember('${member.id}')">
                            Delete
                        </button>
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   SEARCH MEMBERS
   ========================================================= */

function searchMembers() {

    const input =
        document.getElementById(
            "memberSearch"
        );

    if (!input) {
        return;
    }

    const search =
        input.value
            .trim()
            .toLowerCase();

    const filtered =
        members.filter(member => {

            const text =
                `${member.name || ""}
                 ${member.full_name || ""}
                 ${member.email || ""}
                 ${member.phone || ""}
                 ${member.mobile || ""}`
                    .toLowerCase();

            return text.includes(search);

        });

    renderMembers(filtered);

}


/* =========================================================
   VIEW MEMBER
   ========================================================= */

function viewMember(id) {

    const member =
        members.find(
            item => String(item.id) === String(id)
        );

    if (!member) {
        return;
    }

    const modal =
        document.getElementById("memberModal");

    if (!modal) {

        alert(
            `Name: ${member.name || member.full_name || "-"}
Email: ${member.email || "-"}
Phone: ${member.phone || "-"}
Status: ${member.status || "-"}`
        );

        return;
    }

    setText(
        "modalMemberName",
        member.name ||
        member.full_name ||
        "-"
    );

    setText(
        "modalMemberEmail",
        member.email || "-"
    );

    setText(
        "modalMemberPhone",
        member.phone ||
        member.mobile ||
        "-"
    );

    setText(
        "modalMemberStatus",
        member.status || "-"
    );

    modal.classList.add("active");

}


/* =========================================================
   DELETE MEMBER
   ========================================================= */

async function deleteMember(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this member?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            error
        } = await db
            .from("members")
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        showToast(
            "Member deleted successfully.",
            "success"
        );

        await loadMembers();
        updateDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to delete member.",
            "error"
        );

    }

}


/* =========================================================
   RENDER BOOKINGS
   ========================================================= */

function renderBookings(list = bookings) {

    const table =
        document.getElementById(
            "bookingsTable"
        );

    if (!table) {
        return;
    }

    if (!list.length) {

        table.innerHTML = `
            <tr>
                <td colspan="100%" class="empty-state">
                    No bookings found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        list.map((booking, index) => {

            const name =
                booking.member_name ||
                booking.name ||
                "Unknown";

            const date =
                booking.date ||
                booking.booking_date ||
                "-";

            const time =
                booking.time ||
                booking.booking_time ||
                "-";

            const status =
                booking.status ||
                "Pending";

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${escapeHTML(name)}
                    </td>

                    <td>
                        ${escapeHTML(date)}
                    </td>

                    <td>
                        ${escapeHTML(time)}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(status)}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>

                        <button
                            class="action-btn confirm-btn"
                            onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                            Confirm
                        </button>

                        <button
                            class="action-btn delete-btn"
                            onclick="deleteBooking('${booking.id}')">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   UPDATE BOOKING STATUS
   ========================================================= */

async function updateBookingStatus(
    id,
    status
) {

    try {

        const {
            error
        } = await db
            .from("bookings")
            .update({
                status: status
            })
            .eq("id", id);

        if (error) {
            throw error;
        }

        showToast(
            `Booking ${status}.`,
            "success"
        );

        await loadBookings();
        updateDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to update booking.",
            "error"
        );

    }

}


/* =========================================================
   DELETE BOOKING
   ========================================================= */

async function deleteBooking(id) {

    if (
        !confirm(
            "Delete this booking?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } = await db
            .from("bookings")
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        showToast(
            "Booking deleted.",
            "success"
        );

        await loadBookings();
        updateDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to delete booking.",
            "error"
        );

    }

}


/* =========================================================
   RENDER PAYMENTS
   ========================================================= */

function renderPayments(list = payments) {

    const table =
        document.getElementById(
            "paymentsTable"
        );

    if (!table) {
        return;
    }

    if (!list.length) {

        table.innerHTML = `
            <tr>
                <td colspan="100%" class="empty-state">
                    No payments found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        list.map((payment, index) => {

            const name =
                payment.member_name ||
                payment.name ||
                "Unknown";

            const amount =
                Number(
                    payment.amount || 0
                );

            const method =
                payment.payment_method ||
                payment.method ||
                "-";

            const status =
                payment.status ||
                "Paid";

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${escapeHTML(name)}
                    </td>

                    <td>
                        ${formatCurrency(amount)}
                    </td>

                    <td>
                        ${escapeHTML(method)}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(status)}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>
                        ${formatDate(
                            payment.created_at
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   RENDER TRAINERS
   ========================================================= */

function renderTrainers(list = trainers) {

    const table =
        document.getElementById(
            "trainersTable"
        );

    if (!table) {
        return;
    }

    if (!list.length) {

        table.innerHTML = `
            <tr>
                <td colspan="100%" class="empty-state">
                    No trainers found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        list.map((trainer, index) => {

            const name =
                trainer.name ||
                "Unknown";

            const specialty =
                trainer.specialization ||
                trainer.specialty ||
                "-";

            const phone =
                trainer.phone ||
                "-";

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        <strong>
                            ${escapeHTML(name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(specialty)}
                    </td>

                    <td>
                        ${escapeHTML(phone)}
                    </td>

                    <td>

                        <button
                            class="action-btn delete-btn"
                            onclick="deleteTrainer('${trainer.id}')">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   DELETE TRAINER
   ========================================================= */

async function deleteTrainer(id) {

    if (
        !confirm(
            "Delete this trainer?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } = await db
            .from("trainers")
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        showToast(
            "Trainer deleted.",
            "success"
        );

        await loadTrainers();

        updateDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to delete trainer.",
            "error"
        );

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            "[data-section]"
        );

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const section =
                    item.dataset.section;

                switchSection(section);

            }
        );

    });

}


/* =========================================================
   SWITCH SECTION
   ========================================================= */

function switchSection(section) {

    currentSection = section;

    document
        .querySelectorAll(
            ".admin-section, .page-section"
        )
        .forEach(element => {

            element.style.display = "none";

        });


    const target =
        document.getElementById(section);

    if (target) {

        target.style.display =
            section === "dashboard"
                ? "block"
                : "block";

    }


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   LOGOUT BUTTON SETUP
   ========================================================= */

function setupLogout() {

    const buttons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            logout
        );

    });

}


/* =========================================================
   FORM SETUP
   ========================================================= */

function setupForms() {

    const loginForm =
        document.getElementById(
            "adminLoginForm"
        );

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            adminLogin
        );

    }

}


/* =========================================================
   ADD TRAINER
   ========================================================= */

async function addTrainer(event) {

    if (event) {
        event.preventDefault();
    }

    const name =
        document.getElementById(
            "trainerName"
        )?.value.trim();

    const specialty =
        document.getElementById(
            "trainerSpecialty"
        )?.value.trim();

    const phone =
        document.getElementById(
            "trainerPhone"
        )?.value.trim();


    if (!name) {

        showToast(
            "Enter trainer name.",
            "error"
        );

        return;
    }


    try {

        const {
            error
        } = await db
            .from("trainers")
            .insert({
                name,
                specialization: specialty,
                phone
            });

        if (error) {
            throw error;
        }

        showToast(
            "Trainer added successfully.",
            "success"
        );

        document
            .getElementById("trainerForm")
            ?.reset();

        await loadTrainers();

        updateDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to add trainer.",
            "error"
        );

    }

}


/* =========================================================
   SEARCH BOOKINGS
   ========================================================= */

function searchBookings() {

    const input =
        document.getElementById(
            "bookingSearch"
        );

    if (!input) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    const filtered =
        bookings.filter(booking => {

            const text =
                `${booking.name || ""}
                 ${booking.member_name || ""}
                 ${booking.status || ""}
                 ${booking.date || ""}`
                    .toLowerCase();

            return text.includes(value);

        });

    renderBookings(filtered);

}


/* =========================================================
   SEARCH PAYMENTS
   ========================================================= */

function searchPayments() {

    const input =
        document.getElementById(
            "paymentSearch"
        );

    if (!input) {
        return;
    }

    const value =
        input.value
            .toLowerCase()
            .trim();

    const filtered =
        payments.filter(payment => {

            const text =
                `${payment.name || ""}
                 ${payment.member_name || ""}
                 ${payment.method || ""}
                 ${payment.payment_method || ""}`
                    .toLowerCase();

            return text.includes(value);

        });

    renderPayments(filtered);

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("active");
    }

}


/* =========================================================
   REFRESH DATA
   ========================================================= */

async function refreshData() {

    const button =
        document.getElementById(
            "refreshBtn"
        );

    if (button) {

        button.disabled = true;

        button.classList.add(
            "loading"
        );

    }

    await loadAllData();

    if (button) {

        button.disabled = false;

        button.classList.remove(
            "loading"
        );

    }

    showToast(
        "Data refreshed.",
        "success"
    );

}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function exportData() {

    const data = {

        exportedAt:
            new Date().toISOString(),

        members,
        bookings,
        payments,
        trainers

    };


    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `ray-sports-club-backup-${Date.now()}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Backup downloaded.",
        "success"
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id = "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;

    toast.className =
        `toast ${type}`;


    requestAnimationFrame(() => {

        toast.classList.add(
            "show"
        );

    });


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }

}


function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount) || 0
    );

}


function formatDate(
    date
) {

    if (!date) {
        return "-";
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return date;
    }

    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getStatusClass(
    status
) {

    const value =
        String(status)
            .toLowerCase();

    if (
        value === "active" ||
        value === "approved" ||
        value === "confirmed" ||
        value === "paid" ||
        value === "success"
    ) {

        return "status-success";

    }


    if (
        value === "pending" ||
        value === "processing"
    ) {

        return "status-pending";

    }


    if (
        value === "inactive" ||
        value === "expired" ||
        value === "cancelled" ||
        value === "rejected" ||
        value === "failed"
    ) {

        return "status-danger";

    }


    return "status-default";

}


function escapeHTML(
    value
) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function setButtonLoading(
    id,
    loading,
    text
) {

    const button =
        document.getElementById(id);

    if (!button) {
        return;
    }

    button.disabled =
        loading;

    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            text;

    } else {

        button.textContent =
            button.dataset.originalText ||
            text;

    }

}


/* =========================================================
   REAL-TIME AUTH LISTENER
   ========================================================= */

db.auth.onAuthStateChange(
    async (event, session) => {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            currentAdmin =
                session.user;

            showAdminPanel();

        }


        if (
            event === "SIGNED_OUT"
        ) {

            currentAdmin = null;

            showLoginScreen();

        }

    }
);


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ========================================================= */

window.adminLogin =
    adminLogin;

window.logout =
    logout;

window.deleteMember =
    deleteMember;

window.viewMember =
    viewMember;

window.deleteBooking =
    deleteBooking;

window.updateBookingStatus =
    updateBookingStatus;

window.deleteTrainer =
    deleteTrainer;

window.addTrainer =
    addTrainer;

window.searchMembers =
    searchMembers;

window.searchBookings =
    searchBookings;

window.searchPayments =
    searchPayments;

window.closeModal =
    closeModal;

window.refreshData =
    refreshData;

window.exportData =
    exportData;

window.switchSection =
    switchSection;


/* =========================================================
   END OF ADMIN.JS
   ========================================================= */
