/* =========================================================
   RAY SPORTS CLUB — ADMIN PANEL
   SUPABASE ADMIN DASHBOARD
   PHOTO / VIDEO GALLERY MANAGEMENT
   ========================================================= */


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://xkdqxtxfkgbrmbotazel.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Y2XKqEGilp7YY2P9Kww60g_NHzrRdH4";


/* =========================================================
   CREATE SUPABASE CLIENT
   ========================================================= */

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   STORAGE CONFIG
   ========================================================= */

/*
   IMPORTANT:

   Create this bucket in:

   Supabase
   → Storage
   → New Bucket

   Bucket name:

   club-media

   Make it PUBLIC if your main website
   should display the uploaded photos/videos.
*/

const MEDIA_BUCKET =
    "club-media";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentAdmin = null;

let members = [];

let bookings = [];

let payments = [];

let trainers = [];

let currentSection =
    "dashboard";


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "================================="
        );

        console.log(
            "Ray Sports Club Admin Panel Loaded"
        );

        console.log(
            "Supabase URL:",
            SUPABASE_URL
        );

        console.log(
            "Storage bucket:",
            MEDIA_BUCKET
        );

        console.log(
            "================================="
        );


        setupNavigation();

        setupLogout();

        setupForms();

        setupMediaSystem();


        await checkAdminSession();

    }
);


/* =========================================================
   CHECK ADMIN SESSION
   ========================================================= */

async function checkAdminSession() {

    try {

        const {
            data,
            error
        } =
            await db.auth.getSession();


        if (error) {

            console.error(
                "SESSION ERROR:",
                error
            );

            showLoginScreen();

            return;

        }


        const session =
            data?.session;


        if (session) {

            console.log(
                "Existing admin session found."
            );


            currentAdmin =
                session.user;


            showAdminPanel();


            await loadAllData();


            /*
             * Load gallery after login
             */

            await loadGallery();

        } else {

            console.log(
                "No admin session."
            );


            showLoginScreen();

        }

    } catch (error) {

        console.error(
            "CHECK SESSION ERROR:",
            error
        );


        showLoginScreen();

    }

}


/* =========================================================
   SHOW LOGIN SCREEN
   ========================================================= */

function showLoginScreen() {

    const login =
        document.getElementById(
            "loginBox"
        );


    const panel =
        document.getElementById(
            "dashboard"
        );


    if (login) {

        login.style.display =
            "block";

    }


    if (panel) {

        panel.style.display =
            "none";

    }

}


/* =========================================================
   SHOW ADMIN PANEL
   ========================================================= */

function showAdminPanel() {

    const login =
        document.getElementById(
            "loginBox"
        );


    const panel =
        document.getElementById(
            "dashboard"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (panel) {

        panel.style.display =
            "block";

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
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const message =
        document.getElementById(
            "loginMessage"
        );


    const button =
        document.getElementById(
            "loginBtn"
        );


    const email =
        emailInput?.value
            .trim();


    const password =
        passwordInput?.value;


    /* =====================================================
       VALIDATION
       ===================================================== */

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

            button.disabled =
                true;

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


        /* =================================================
           SUPABASE LOGIN
           ================================================= */

        const {
            data,
            error
        } =
            await db.auth.signInWithPassword({

                email:
                    email,

                password:
                    password

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


        showAdminPanel();


        await loadAllData();


        await loadGallery();


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

            button.disabled =
                false;

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
        } =
            await db.auth.signOut();


        if (error) {

            throw error;

        }


        currentAdmin =
            null;


        members = [];

        bookings = [];

        payments = [];

        trainers = [];


        showLoginScreen();


        const message =
            document.getElementById(
                "loginMessage"
            );


        if (message) {

            message.textContent =
                "";

            message.className =
                "message";

        }


        const password =
            document.getElementById(
                "password"
            );


        if (password) {

            password.value =
                "";

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
   SETUP LOGIN FORMS
   ========================================================= */

function setupForms() {

    const loginButton =
        document.getElementById(
            "loginBtn"
        );


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            adminLogin
        );


        console.log(
            "Login button handler attached."
        );

    }


    const email =
        document.getElementById(
            "email"
        );


    const password =
        document.getElementById(
            "password"
        );


    [email, password].forEach(
        input => {

            if (!input) {

                return;

            }


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        adminLogin(event);

                    }

                }
            );

        }
    );

}


/* =========================================================
   LOGOUT BUTTON
   ========================================================= */

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );


    logoutButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                logout
            );

        }
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navButtons =
        document.querySelectorAll(
            "[data-section]"
        );


    navButtons.forEach(
        button => {

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

        }
    );

}


/* =========================================================
   SWITCH SECTION
   ========================================================= */

function switchSection(
    sectionName
) {

    currentSection =
        sectionName;


    const sections =
        document.querySelectorAll(
            ".admin-section, .page-section"
        );


    sections.forEach(
        section => {

            section.style.display =
                "none";

        }
    );


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


    navItems.forEach(
        item => {

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

        }
    );

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


    elements.forEach(
        element => {

            if (element) {

                element.textContent =
                    email;

            }

        }
    );

}


/* =========================================================
   LOAD ALL DATABASE DATA
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
        } =
            await db
                .from("members")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
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
        } =
            await db
                .from("bookings")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
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
        } =
            await db
                .from("payments")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
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
        } =
            await db
                .from("trainers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
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
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    updateStatistics();

}


/* =========================================================
   STATISTICS
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
                                onclick="deleteMember('${escapeHTML(member.id)}')">

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
                                onclick="deleteBooking('${escapeHTML(booking.id)}')">

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
                                onclick="deletePayment('${escapeHTML(payment.id)}')">

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
                                onclick="deleteTrainer('${escapeHTML(trainer.id)}')">

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
        } =
            await db
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
        } =
            await db
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
        } =
            await db
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
        } =
            await db
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
        } =
            await db
                .from("bookings")
                .update({
                    status:
                        status
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


    rows.forEach(
        row => {

            const text =
                row.textContent
                    .toLowerCase();


            row.style.display =
                text.includes(search)
                    ? ""
                    : "none";

        }
    );

}


/* =========================================================
   =========================================================
   PHOTO / VIDEO SYSTEM
   =========================================================
   ========================================================= */


/* =========================================================
   SETUP MEDIA SYSTEM
   ========================================================= */

function setupMediaSystem() {

    const mediaFile =
        document.getElementById(
            "mediaFile"
        );


    const uploadButton =
        document.getElementById(
            "uploadBtn"
        );


    const refreshButton =
        document.getElementById(
            "refreshGalleryBtn"
        );


    /* =====================================================
       FILE SELECTION
       ===================================================== */

    if (mediaFile) {

        mediaFile.addEventListener(
            "change",
            handleFileSelection
        );

    }


    /* =====================================================
       UPLOAD BUTTON
       ===================================================== */

    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            uploadSelectedMedia
        );

    }


    /* =====================================================
       REFRESH GALLERY
       ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadGallery
        );

    }


    console.log(
        "Media system initialized."
    );

}


/* =========================================================
   FILE SELECTED
   ========================================================= */

function handleFileSelection() {

    const input =
        document.getElementById(
            "mediaFile"
        );


    const selectedFile =
        document.getElementById(
            "selectedFile"
        );


    if (!input || !selectedFile) {

        return;

    }


    const file =
        input.files?.[0];


    if (!file) {

        selectedFile.textContent =
            "No file selected";

        return;

    }


    /* =====================================================
       FILE TYPE
       ===================================================== */

    const isImage =
        file.type.startsWith(
            "image/"
        );


    const isVideo =
        file.type.startsWith(
            "video/"
        );


    if (!isImage && !isVideo) {

        selectedFile.textContent =
            "❌ Unsupported file type";

        input.value =
            "";

        return;

    }


    /* =====================================================
       SIZE
       ===================================================== */

    const size =
        formatFileSize(
            file.size
        );


    const type =
        isImage
            ? "📸 Photo"
            : "🎥 Video";


    selectedFile.innerHTML = `

        <strong>
            ${type}
        </strong>

        <br>

        ${escapeHTML(file.name)}

        <br>

        <small>
            ${size}
        </small>

    `;


    console.log(
        "Selected file:",
        file
    );

}


/* =========================================================
   UPLOAD SELECTED MEDIA
   ========================================================= */

async function uploadSelectedMedia() {

    const input =
        document.getElementById(
            "mediaFile"
        );


    const button =
        document.getElementById(
            "uploadBtn"
        );


    const message =
        document.getElementById(
            "uploadMessage"
        );


    if (!input) {

        return;

    }


    const file =
        input.files?.[0];


    /* =====================================================
       NO FILE
       ===================================================== */

    if (!file) {

        setUploadMessage(
            "Please select a photo or video first.",
            "error"
        );

        return;

    }


    /* =====================================================
       CHECK TYPE
       ===================================================== */

    const isImage =
        file.type.startsWith(
            "image/"
        );


    const isVideo =
        file.type.startsWith(
            "video/"
        );


    if (!isImage && !isVideo) {

        setUploadMessage(
            "Only image and video files are allowed.",
            "error"
        );

        return;

    }


    /* =====================================================
       SIZE LIMIT
       ===================================================== */

    const maxImageSize =
        10 * 1024 * 1024;


    const maxVideoSize =
        100 * 1024 * 1024;


    if (
        isImage &&
        file.size >
        maxImageSize
    ) {

        setUploadMessage(
            "Photo is too large. Maximum size is 10 MB.",
            "error"
        );

        return;

    }


    if (
        isVideo &&
        file.size >
        maxVideoSize
    ) {

        setUploadMessage(
            "Video is too large. Maximum size is 100 MB.",
            "error"
        );

        return;

    }


    try {

        /* =================================================
           DISABLE BUTTON
           ================================================= */

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "⏳ Uploading...";

        }


        setUploadMessage(
            isImage
                ? "📸 Uploading photo..."
                : "🎥 Uploading video...",
            ""
        );


        /* =================================================
           UPLOAD
           ================================================= */

        const result =
            await uploadMedia(
                file
            );


        console.log(
            "UPLOAD RESULT:",
            result
        );


        /* =================================================
           SUCCESS
           ================================================= */

        setUploadMessage(
            "✅ Media uploaded successfully!",
            "success"
        );


        showToast(
            "Media uploaded successfully!"
        );


        /* =================================================
           RESET FILE INPUT
           ================================================= */

        input.value =
            "";


        const selectedFile =
            document.getElementById(
                "selectedFile"
            );


        if (selectedFile) {

            selectedFile.textContent =
                "No file selected";

        }


        /* =================================================
           REFRESH GALLERY
           ================================================= */

        await loadGallery();


    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        setUploadMessage(
            error.message ||
            "Upload failed.",
            "error"
        );


        showToast(
            "Upload failed."
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "⬆️ Upload to Gallery";

        }

    }

}


/* =========================================================
   UPLOAD MEDIA TO SUPABASE STORAGE
   ========================================================= */

async function uploadMedia(
    file
) {

    if (!file) {

        throw new Error(
            "No file selected."
        );

    }


    /* =====================================================
       VALID TYPES
       ===================================================== */

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif",

        "video/mp4",

        "video/webm",

        "video/quicktime"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        throw new Error(
            "Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, WEBM or MOV."
        );

    }


    /* =====================================================
       CREATE FOLDER
       ===================================================== */

    const folder =
        file.type.startsWith(
            "image/"
        )
            ? "photos"
            : "videos";


    /* =====================================================
       FILE EXTENSION
       ===================================================== */

    let extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    /* =====================================================
       SAFE FILE NAME
       ===================================================== */

    const uniqueFileName =

        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(
                2,
                12
            ) +
        "." +
        extension;


    const filePath =
        folder +
        "/" +
        uniqueFileName;


    console.log(
        "Uploading:",
        filePath
    );


    /* =====================================================
       STORAGE UPLOAD
       ===================================================== */

    const {
        data,
        error
    } =
        await db.storage
            .from(
                MEDIA_BUCKET
            )
            .upload(
                filePath,
                file,
                {

                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type

                }
            );


    if (error) {

        console.error(
            "SUPABASE STORAGE ERROR:",
            error
        );


        throw error;

    }


    console.log(
        "Storage upload successful:",
        data
    );


    /* =====================================================
       GET PUBLIC URL
       ===================================================== */

    const {
        data: publicData
    } =
        db.storage
            .from(
                MEDIA_BUCKET
            )
            .getPublicUrl(
                filePath
            );


    const publicUrl =
        publicData?.publicUrl;


    if (!publicUrl) {

        throw new Error(
            "Could not create public URL."
        );

    }


    console.log(
        "PUBLIC URL:",
        publicUrl
    );


    return {

        path:
            filePath,

        url:
            publicUrl,

        name:
            file.name,

        type:
            file.type,

        size:
            file.size

    };

}


/* =========================================================
   LOAD GALLERY
   ========================================================= */

async function loadGallery() {

    const gallery =
        document.getElementById(
            "adminGallery"
        );


    if (!gallery) {

        return;

    }


    gallery.innerHTML = `

        <div class="galleryLoading">

            🔄 Loading gallery...

        </div>

    `;


    try {

        /* =================================================
           GET PHOTOS
           ================================================= */

        const {
            data: photos,
            error: photoError
        } =
            await db.storage
                .from(
                    MEDIA_BUCKET
                )
                .list(
                    "photos",
                    {

                        limit:
                            100,

                        sortBy: {

                            column:
                                "created_at",

                            order:
                                "desc"

                        }

                    }
                );


        if (photoError) {

            throw photoError;

        }


        /* =================================================
           GET VIDEOS
           ================================================= */

        const {
            data: videos,
            error: videoError
        } =
            await db.storage
                .from(
                    MEDIA_BUCKET
                )
                .list(
                    "videos",
                    {

                        limit:
                            100,

                        sortBy: {

                            column:
                                "created_at",

                            order:
                                "desc"

                        }

                    }
                );


        if (videoError) {

            throw videoError;

        }


        const photoFiles =
            (photos || [])
                .filter(
                    file =>
                        file.name &&
                        file.name !== ".emptyFolderPlaceholder"
                )
                .map(
                    file => ({
                        ...file,

                        mediaType:
                            "image",

                        path:
                            "photos/" +
                            file.name
                    })
                );


        const videoFiles =
            (videos || [])
                .filter(
                    file =>
                        file.name &&
                        file.name !== ".emptyFolderPlaceholder"
                )
                .map(
                    file => ({
                        ...file,

                        mediaType:
                            "video",

                        path:
                            "videos/" +
                            file.name
                    })
                );


        const allFiles =
            [
                ...photoFiles,
                ...videoFiles
            ];


        /* =================================================
           SORT NEWEST FIRST
           ================================================= */

        allFiles.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    new Date(
                        a.created_at ||
                        0
                    ).getTime();


                const dateB =
                    new Date(
                        b.created_at ||
                        0
                    ).getTime();


                return dateB -
                    dateA;

            }
        );


        renderGallery(
            allFiles
        );


    } catch (error) {

        console.error(
            "LOAD GALLERY ERROR:",
            error
        );


        gallery.innerHTML = `

            <div class="galleryLoading">

                ❌ Could not load gallery.

                <br><br>

                <small>
                    ${escapeHTML(
                        error.message ||
                        "Unknown error"
                    )}
                </small>

            </div>

        `;

    }

}


/* =========================================================
   RENDER GALLERY
   ========================================================= */

function renderGallery(
    files
) {

    const gallery =
        document.getElementById(
            "adminGallery"
        );


    if (!gallery) {

        return;

    }


    if (!files.length) {

        gallery.innerHTML = `

            <div class="galleryLoading">

                📭 No photos or videos uploaded yet.

            </div>

        `;

        return;

    }


    gallery.innerHTML =
        files.map(
            file => {

                const {
                    data
                } =
                    db.storage
                        .from(
                            MEDIA_BUCKET
                        )
                        .getPublicUrl(
                            file.path
                        );


                const publicUrl =
                    data?.publicUrl ||
                    "";


                const fileName =
                    file.name ||
                    "Media";


                const date =
                    formatDate(
                        file.created_at
                    );


                if (
                    file.mediaType ===
                    "video"
                ) {

                    return `

                        <div
                            class="galleryItem">

                            <div
                                class="galleryMedia">

                                <video
                                    src="${escapeHTML(publicUrl)}"
                                    controls
                                    preload="metadata">
                                </video>

                            </div>


                            <div
                                class="galleryInfo">

                                <strong>
                                    🎥 Video
                                </strong>

                                <span>
                                    ${escapeHTML(fileName)}
                                </span>

                                <small>
                                    ${date}
                                </small>

                            </div>


                            <button
                                class="delete-btn"
                                type="button"
                                onclick="deleteGalleryFile('${escapeHTML(file.path)}')">

                                🗑️ Delete

                            </button>

                        </div>

                    `;

                }


                return `

                    <div
                        class="galleryItem">

                        <div
                            class="galleryMedia">

                            <img
                                src="${escapeHTML(publicUrl)}"
                                alt="${escapeHTML(fileName)}"
                                loading="lazy">

                        </div>


                        <div
                            class="galleryInfo">

                            <strong>
                                📸 Photo
                            </strong>

                            <span>
                                ${escapeHTML(fileName)}
                            </span>

                            <small>
                                ${date}
                            </small>

                        </div>


                        <button
                            class="delete-btn"
                            type="button"
                            onclick="deleteGalleryFile('${escapeHTML(file.path)}')">

                            🗑️ Delete

                        </button>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   DELETE GALLERY FILE
   ========================================================= */

async function deleteGalleryFile(
    filePath
) {

    if (!filePath) {

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this media?"
        );


    if (!confirmed) {

        return;

    }


    try {

        showToast(
            "Deleting media..."
        );


        const {
            error
        } =
            await db.storage
                .from(
                    MEDIA_BUCKET
                )
                .remove([
                    filePath
                ]);


        if (error) {

            throw error;

        }


        showToast(
            "Media deleted successfully."
        );


        await loadGallery();


    } catch (error) {

        console.error(
            "DELETE MEDIA ERROR:",
            error
        );


        showToast(
            error.message ||
            "Could not delete media."
        );

    }

}


/* =========================================================
   UPLOAD MESSAGE
   ========================================================= */

function setUploadMessage(
    message,
    type = ""
) {

    const element =
        document.getElementById(
            "uploadMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        "message";


    if (type) {

        element.classList.add(
            type
        );

    }

}


/* =========================================================
   FORMAT FILE SIZE
   ========================================================= */

function formatFileSize(
    bytes
) {

    if (!bytes) {

        return "0 Bytes";

    }


    const units = [

        "Bytes",

        "KB",

        "MB",

        "GB"

    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(
            1024,
            index
        );


    return (
        size.toFixed(
            index === 0
                ? 0
                : 2
        ) +
        " " +
        units[index]
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
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


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

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
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    try {

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"

            }
        );

    } catch {

        return String(
            date
        );

    }

}


/* =========================================================
   FORMAT MONEY
   ========================================================= */

function formatMoney(
    amount
) {

    const number =
        Number(amount) ||
        0;


    return number.toLocaleString(
        "en-IN",
        {

            minimumFractionDigits:
                0,

            maximumFractionDigits:
                2

        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    )

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
    async (
        event,
        session
    ) => {

        console.log(
            "Auth event:",
            event
        );


        if (
            event ===
            "SIGNED_IN"
        ) {

            currentAdmin =
                session?.user ||
                null;


            showAdminPanel();


            setTimeout(
                async () => {

                    await loadAllData();

                    await loadGallery();

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


            members = [];

            bookings = [];

            payments = [];

            trainers = [];


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
   MEDIA FUNCTIONS
   ========================================================= */

window.uploadSelectedMedia =
    uploadSelectedMedia;


window.uploadMedia =
    uploadMedia;


window.loadGallery =
    loadGallery;


window.deleteGalleryFile =
    deleteGalleryFile;


window.handleFileSelection =
    handleFileSelection;


/* =========================================================
   FINAL DEBUG
   ========================================================= */

console.log(
    "================================="
);

console.log(
    "admin.js loaded successfully."
);

console.log(
    "Photo / Video upload system ready."
);

console.log(
    "Storage bucket:",
    MEDIA_BUCKET
);

console.log(
    "================================="
);
