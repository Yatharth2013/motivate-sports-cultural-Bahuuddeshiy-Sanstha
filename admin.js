/* =========================================================
   RAY SPORTS CLUB — ADMIN PANEL
   Supabase Admin Dashboard
   ========================================================= */


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL = "https://xkdqxtxfkgbrmbotazel.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Y2XKqEGilp7YY2P9Kww60g_NHzrRdH4";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
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

    console.log("=================================");
    console.log("Ray Sports Club Admin Panel Loaded");
    console.log("Supabase client:", db);
    console.log("=================================");

    setupNavigation();
    setupLogout();
    setupForms();

    await checkAdminSession();

});


/* =========================================================
   CHECK ADMIN SESSION
   ========================================================= */

async function checkAdminSession() {

    try {

        const {
            data,
            error
        } = await db.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            showLoginScreen();
            return;
        }

        const session = data?.session;

        if (session) {

            console.log("Existing admin session found.");

            currentAdmin = session.user;

            showAdminPanel();

            await loadAllData();

        } else {

            console.log("No admin session.");

            showLoginScreen();

        }

    } catch (error) {

        console.error("CHECK SESSION ERROR:", error);

        showLoginScreen();

    }

}


/* =========================================================
   SHOW LOGIN SCREEN
   ========================================================= */

function showLoginScreen() {

    const login = document.getElementById("loginBox");
    const panel = document.getElementById("dashboard");

    if (login) {
        login.style.display = "block";
    }

    if (panel) {
        panel.style.display = "none";
    }

}


/* =========================================================
   SHOW ADMIN PANEL
   ========================================================= */

function showAdminPanel() {

    const login = document.getElementById("loginBox");
    const panel = document.getElementById("dashboard");

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
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const message =
        document.getElementById("loginMessage");

    const button =
        document.getElementById("loginBtn");


    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;


    /* ---------- VALIDATION ---------- */

    if (!email || !password) {

        if (message) {

            message.textContent =
                "Please enter email and password.";

            message.className =
                "message error";

        }

        return;

    }


    try {

        if (button) {

            button.disabled = true;

            button.textContent =
                "⏳ Logging in...";

        }


        if (message) {

            message.textContent =
                "Checking login...";

            message.className =
                "message";

        }


        console.log(
            "Attempting Supabase login:",
            email
        );


        /* ---------- SUPABASE LOGIN ---------- */

        const {
            data,
            error
        } = await db.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {

            throw error;

        }


        console.log(
            "Login successful:",
            data.user
        );


        currentAdmin =
            data.user;


        if (message) {

            message.textContent =
                "Login successful!";

            message.className =
                "message success";

        }


        /* ---------- SHOW ADMIN ---------- */

        showAdminPanel();


        /* ---------- LOAD DATA ---------- */

        await loadAllData();


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        if (message) {

            message.textContent =
                error.message ||
                "Login failed.";

            message.className =
                "message error";

        }

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "🔐 Login";

        }

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

        members = [];
        bookings = [];
        payments = [];
        trainers = [];

        showLoginScreen();

        const message =
            document.getElementById("loginMessage");

        if (message) {

            message.textContent =
                "";

            message.className =
                "message";

        }

        const password =
            document.getElementById("password");

        if (password) {
            password.value = "";
        }


        showToast(
            "Logged out successfully."
        );


    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        showToast(
            "Logout failed."
        );

    }

}


/* =========================================================
   SETUP FORMS
   ========================================================= */

function setupForms() {

    const loginButton =
        document.getElementById("loginBtn");


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            adminLogin
        );

        console.log(
            "Login button handler attached."
        );

    } else {

        console.warn(
            "Login button #loginBtn not found."
        );

    }


    /* Allow ENTER key to login */

    const email =
        document.getElementById("email");

    const password =
        document.getElementById("password");


    [email, password].forEach(input => {

        if (!input) return;

        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    adminLogin(event);

                }

            }
        );

    });

}


/* =========================================================
   LOGOUT BUTTON
   ========================================================= */

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );


    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            logout
        );

    });

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navButtons =
        document.querySelectorAll(
            "[data-section]"
        );


    navButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;

                if (section) {

                    switchSection(
                        section
                    );

                }

            }
        );

    });

}


/* =========================================================
   SWITCH SECTION
   ========================================================= */

function switchSection(sectionName) {

    currentSection =
        sectionName;


    const sections =
        document.querySelectorAll(
            ".admin-section, .page-section"
        );


    sections.forEach(section => {

        section.style.display =
            "none";

    });


    const target =
        document.getElementById(
            sectionName
        );


    if (target) {

        target.style.display =
            "block";

    }


    const navItems =
        document.querySelectorAll(
            "[data-section]"
        );


    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );


        if (
            item.dataset.section ===
            sectionName
        ) {

            item.classList.add(
                "active"
            );

        }

    });

}


/* =========================================================
   UPDATE ADMIN INFO
   ========================================================= */

function updateAdminInfo() {

    if (!currentAdmin) {
        return;
    }


    const email =
        currentAdmin.email ||
        "Administrator";


    const elements = [

        document.getElementById(
            "adminEmailDisplay"
        ),

        document.getElementById(
            "loggedInEmail"
        ),

        document.getElementById(
            "adminEmailText"
        )

    ];


    elements.forEach(element => {

        if (element) {

            element.textContent =
                email;

        }

    });

}


/* =========================================================
   LOAD ALL DATA
   ========================================================= */

async function loadAllData() {

    console.log(
        "Loading admin data..."
    );


    await Promise.all([

        loadMembers(),

        loadBookings(),

        loadPayments(),

        loadTrainers()

    ]);


    renderDashboard();

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
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Members error:",
                error
            );

            return;

        }


        members =
            data || [];


        console.log(
            "Members loaded:",
            members.length
        );


        renderMembers();


    } catch (error) {

        console.error(
            "LOAD MEMBERS ERROR:",
            error
        );

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
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Bookings error:",
                error
            );

            return;

        }


        bookings =
            data || [];


        console.log(
            "Bookings loaded:",
            bookings.length
        );


        renderBookings();


    } catch (error) {

        console.error(
            "LOAD BOOKINGS ERROR:",
            error
        );

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
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Payments error:",
                error
            );

            return;

        }


        payments =
            data || [];


        console.log(
            "Payments loaded:",
            payments.length
        );


        renderPayments();


    } catch (error) {

        console.error(
            "LOAD PAYMENTS ERROR:",
            error
        );

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
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Trainers error:",
                error
            );

            return;

        }


        trainers =
            data || [];


        console.log(
            "Trainers loaded:",
            trainers.length
        );


        renderTrainers();


    } catch (error) {

        console.error(
            "LOAD TRAINERS ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderDashboard() {

    updateStatistics();

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const memberCount =
        members.length;


    const bookingCount =
        bookings.length;


    const paymentCount =
        payments.length;


    const trainerCount =
        trainers.length;


    setText(
        "memberCount",
        memberCount
    );

    setText(
        "membersCount",
        memberCount
    );

    setText(
        "totalMembers",
        memberCount
    );


    setText(
        "bookingCount",
        bookingCount
    );

    setText(
        "bookingsCount",
        bookingCount
    );

    setText(
        "totalBookings",
        bookingCount
    );


    setText(
        "paymentCount",
        paymentCount
    );

    setText(
        "paymentsCount",
        paymentCount
    );


    setText(
        "trainerCount",
        trainerCount
    );

    setText(
        "trainersCount",
        trainerCount
    );

}


/* =========================================================
   RENDER MEMBERS
   ========================================================= */

function renderMembers() {

    const table =
        document.getElementById(
            "membersTable"
        );


    if (!table) {
        return;
    }


    if (!members.length) {

        table.innerHTML = `
            <tr>
                <td colspan="10">
                    No members found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        members.map(
            (member, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                member.name ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                member.email ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                member.phone ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                member.membership_type ||
                                member.membership ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                member.created_at
                            )}
                        </td>

                        <td>
                            <button
                                class="delete-btn"
                                onclick="deleteMember('${member.id}')"
                            >
                                🗑️ Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =========================================================
   RENDER BOOKINGS
   ========================================================= */

function renderBookings() {

    const table =
        document.getElementById(
            "bookingsTable"
        );


    if (!table) {
        return;
    }


    if (!bookings.length) {

        table.innerHTML = `
            <tr>
                <td colspan="10">
                    No bookings found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        bookings.map(
            (booking, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                booking.name ||
                                booking.member_name ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                booking.date ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                booking.time ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                booking.court ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                booking.status ||
                                "Pending"
                            )}
                        </td>

                        <td>
                            <button
                                class="delete-btn"
                                onclick="deleteBooking('${booking.id}')"
                            >
                                🗑️ Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =========================================================
   RENDER PAYMENTS
   ========================================================= */

function renderPayments() {

    const table =
        document.getElementById(
            "paymentsTable"
        );


    if (!table) {
        return;
    }


    if (!payments.length) {

        table.innerHTML = `
            <tr>
                <td colspan="10">
                    No payments found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        payments.map(
            (payment, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                payment.name ||
                                payment.member_name ||
                                "-"
                            )}
                        </td>

                        <td>
                            ₹${formatMoney(
                                payment.amount
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                payment.payment_method ||
                                payment.method ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                payment.status ||
                                "Paid"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                payment.created_at
                            )}
                        </td>

                        <td>
                            <button
                                class="delete-btn"
                                onclick="deletePayment('${payment.id}')"
                            >
                                🗑️ Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =========================================================
   RENDER TRAINERS
   ========================================================= */

function renderTrainers() {

    const table =
        document.getElementById(
            "trainersTable"
        );


    if (!table) {
        return;
    }


    if (!trainers.length) {

        table.innerHTML = `
            <tr>
                <td colspan="10">
                    No trainers found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        trainers.map(
            (trainer, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                trainer.name ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                trainer.specialization ||
                                trainer.experience ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                trainer.phone ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                trainer.email ||
                                "-"
                            )}
                        </td>

                        <td>
                            <button
                                class="delete-btn"
                                onclick="deleteTrainer('${trainer.id}')"
                            >
                                🗑️ Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =========================================================
   DELETE MEMBER
   ========================================================= */

async function deleteMember(id) {

    if (
        !confirm(
            "Are you sure you want to delete this member?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } = await db
            .from("members")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        showToast(
            "Member deleted."
        );


        await loadMembers();

        updateStatistics();


    } catch (error) {

        console.error(
            "DELETE MEMBER ERROR:",
            error
        );

        showToast(
            "Could not delete member."
        );

    }

}


/* =========================================================
   DELETE BOOKING
   ========================================================= */

async function deleteBooking(id) {

    if (
        !confirm(
            "Are you sure you want to delete this booking?"
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
            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        showToast(
            "Booking deleted."
        );


        await loadBookings();

        updateStatistics();


    } catch (error) {

        console.error(
            "DELETE BOOKING ERROR:",
            error
        );

        showToast(
            "Could not delete booking."
        );

    }

}


/* =========================================================
   DELETE PAYMENT
   ========================================================= */

async function deletePayment(id) {

    if (
        !confirm(
            "Are you sure you want to delete this payment?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } = await db
            .from("payments")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        showToast(
            "Payment deleted."
        );


        await loadPayments();

        updateStatistics();


    } catch (error) {

        console.error(
            "DELETE PAYMENT ERROR:",
            error
        );

        showToast(
            "Could not delete payment."
        );

    }

}


/* =========================================================
   DELETE TRAINER
   ========================================================= */

async function deleteTrainer(id) {

    if (
        !confirm(
            "Are you sure you want to delete this trainer?"
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
            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        showToast(
            "Trainer deleted."
        );


        await loadTrainers();

        updateStatistics();


    } catch (error) {

        console.error(
            "DELETE TRAINER ERROR:",
            error
        );

        showToast(
            "Could not delete trainer."
        );

    }

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
            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        showToast(
            "Booking status updated."
        );


        await loadBookings();


    } catch (error) {

        console.error(
            "UPDATE BOOKING ERROR:",
            error
        );

        showToast(
            "Could not update booking."
        );

    }

}


/* =========================================================
   SEARCH TABLE
   ========================================================= */

function searchTable(
    inputId,
    tableId
) {

    const input =
        document.getElementById(
            inputId
        );

    const table =
        document.getElementById(
            tableId
        );


    if (!input || !table) {
        return;
    }


    const search =
        input.value
            .toLowerCase()
            .trim();


    const rows =
        table.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(row => {

        const text =
            row.textContent
                .toLowerCase();


        row.style.display =
            text.includes(search)
                ? ""
                : "none";

    });

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "toast";

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}


/* =========================================================
   HELPER — SET TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   HELPER — FORMAT DATE
   ========================================================= */

function formatDate(date) {

    if (!date) {
        return "-";
    }


    try {

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    } catch {

        return date;

    }

}


/* =========================================================
   HELPER — FORMAT MONEY
   ========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;


    return number.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================================
   HELPER — ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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


/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */

db.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "Auth event:",
            event
        );


        if (
            event ===
            "SIGNED_IN"
        ) {

            currentAdmin =
                session?.user || null;


            showAdminPanel();


            /*
             * Small timeout prevents
             * Supabase auth event from
             * blocking the UI.
             */

            setTimeout(
                () => {
                    loadAllData();
                },
                0
            );

        }


        if (
            event ===
            "SIGNED_OUT"
        ) {

            currentAdmin =
                null;

            showLoginScreen();

        }

    }
);


/* =========================================================
   EXPOSE FUNCTIONS TO HTML
   ========================================================= */

window.adminLogin =
    adminLogin;

window.logout =
    logout;

window.switchSection =
    switchSection;

window.deleteMember =
    deleteMember;

window.deleteBooking =
    deleteBooking;

window.deletePayment =
    deletePayment;

window.deleteTrainer =
    deleteTrainer;

window.updateBookingStatus =
    updateBookingStatus;

window.searchTable =
    searchTable;

window.showToast =
    showToast;


/* =========================================================
   FINAL DEBUG
   ========================================================= */

console.log(
    "admin.js loaded successfully."
);

console.log(
    "Supabase URL:",
    SUPABASE_URL
);
