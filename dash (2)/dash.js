
document.addEventListener("DOMContentLoaded", () => {

    const content = document.getElementById("content");
    const sidebar = document.getElementById("sidebar");
    const topbarTitle = document.getElementById("topbarTitle");
    const toast = document.getElementById("toast");

    // ==================================
    // CURRENT LOGGED-IN USER SESSION
    // ==================================
    // Pareho ito ng sessionStorage keys na ginagamit ng login.js.
    // Kapag walang valid na login session, ibabalik sa login page.
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    const loggedInUser = {
        name: sessionStorage.getItem("fullname") || "User",
        username: sessionStorage.getItem("username") || "",
        role: sessionStorage.getItem("userRole") || "User"
    };

    // Gumawa ng initials mula sa pangalan ng kasalukuyang naka-login.
    loggedInUser.initials = loggedInUser.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase() || "US";

    // I-update ang profile sa sidebar at topbar.
    function updateLoggedInUserUI() {
        const sidebarNameEls = document.querySelectorAll(".sidebar-user h4");
        const sidebarRoleEls = document.querySelectorAll(".sidebar-user small");
        const sidebarAvatars = document.querySelectorAll(".user-avatar");

        const profileStrong = document.querySelector(".profile-info strong");
        const profileSmall = document.querySelector(".profile-info small");
        const profileAvatar = document.querySelector(".profile-avatar");

        sidebarNameEls.forEach(el => {
            el.textContent = loggedInUser.name;
        });

        sidebarRoleEls.forEach(el => {
            el.textContent = loggedInUser.role;
        });

        sidebarAvatars.forEach(el => {
            el.textContent = loggedInUser.initials;
        });

        if (profileStrong) profileStrong.textContent = loggedInUser.name;
        if (profileSmall) profileSmall.textContent = loggedInUser.role;
        if (profileAvatar) profileAvatar.textContent = loggedInUser.initials;
    }

    // ==================================
    // API CONFIGURATION (LIVE SESSION LOGS)
    // ==================================
    const USE_MOCK_DATA = true; // Gawing 'false' kapag ikokonekta na sa real Database API
    const API_BASE_URL = "http://localhost:3000/api/session-logs"; // Palitan ng actual API URL

    // ==================================
    // SAMPLE COMPUTER DATA
    // ==================================
    let computers = Array.from({ length: 30 }, (_, i) => {
        const n = i + 1;
        const statuses = [
            "Available",
            "In Use",
            "Available",
            "In Use",
            "Maintenance"
        ];

        const status = n <= 5
            ? statuses[n - 1]
            : (n <= 18
                ? "Available"
                : (n <= 29 ? "In Use" : "Maintenance"));

        const names = {
            1: "Juan Dela Cruz",
            2: "Maria Santos",
            4: "Pedro Reyes"
        };

        return {
            id: `PC-${String(n).padStart(3, "0")}`,
            workstation: `Workstation ${String(n).padStart(2, "0")}`,
            user: names[n] || (status === "In Use" ? "Student User" : "Unassigned"),
            ip: `192.168.1.${100 + n}`,
            status: status,
            activity: n <= 5
                ? ["10:45 AM", "10:42 AM", "10:30 AM", "10:25 AM", "09:15 AM"][n - 1]
                : "10:00 AM"
        };
    });

    // ==================================
    // LIVE SESSION LOGS DATABASE (API-READY FORMAT)
    // ==================================
    let liveSessionLogs = [
        {
            log_id: 101,
            pc_number: "PC-001",
            student_id: "2024001",
            student_name: "Juan Dela Cruz",
            course_section: "BSIT 1A",
            time_in: "2026-11-18T19:45:00",
            time_out: null,
            status: "Active",
            current_app: "Visual Studio Code",
            app_started_at: "2026-11-18T19:50:00"
        },
        {
            log_id: 102,
            pc_number: "PC-002",
            student_id: "2024002",
            student_name: "Maria Santos",
            course_section: "BSIT 1A",
            time_in: "2026-11-18T20:02:00",
            time_out: null,
            status: "Active",
            current_app: "Google Chrome",
            app_started_at: "2026-11-18T20:05:00"
        },
        {
            log_id: 103,
            pc_number: "PC-004",
            student_id: "2024003",
            student_name: "Pedro Reyes",
            course_section: "BSIT 1B",
            time_in: "2026-11-18T20:10:00",
            time_out: null,
            status: "Active",
            current_app: "Microsoft Word",
            app_started_at: "2026-11-18T20:12:00"
        },
        {
            log_id: 104,
            pc_number: "PC-008",
            student_id: "2024004",
            student_name: "Ana Lopez",
            course_section: "BSIT 1A",
            time_in: "2026-11-18T20:15:00",
            time_out: null,
            status: "Active",
            current_app: "Visual Studio Code",
            app_started_at: "2026-11-18T20:18:00"
        },
        {
            log_id: 105,
            pc_number: "PC-010",
            student_id: "2024005",
            student_name: "Carlo Santos",
            course_section: "BSIT 1B",
            time_in: "2026-11-18T18:00:00",
            time_out: "2026-11-18T19:30:00",
            status: "Completed",
            current_app: "Microsoft Excel",
            app_started_at: "2026-11-18T18:10:00"
        },
        {
            log_id: 106,
            pc_number: "PC-012",
            student_id: "2024006",
            student_name: "Rizza Villanueva",
            course_section: "BSIT 1A",
            time_in: "2026-11-18T17:15:00",
            time_out: "2026-11-18T19:25:00",
            status: "Completed",
            current_app: "Google Chrome",
            app_started_at: "2026-11-18T17:20:00"
        }
    ];

    // ==================================
    // SECURITY ALERTS DATA
    // ==================================
    let alerts = [
        {
            date: "Nov 18, 2026 10:30 AM",
            type: "Login Attempt",
            details: "Unusual login attempt detected",
            pc: "PC-012",
            priority: "High",
            status: "Open"
        },
        {
            date: "Nov 18, 2026 10:15 AM",
            type: "USB Device",
            details: "New USB device connected",
            pc: "PC-008",
            priority: "Medium",
            status: "Investigating"
        },
        {
            date: "Nov 18, 2026 09:45 AM",
            type: "Application",
            details: "Blocked suspicious application",
            pc: "PC-015",
            priority: "High",
            status: "Open"
        },
        {
            date: "Nov 18, 2026 09:20 AM",
            type: "Hardware",
            details: "Storage configuration changed",
            pc: "PC-006",
            priority: "Low",
            status: "Resolved"
        },
        {
            date: "Nov 18, 2026 09:05 AM",
            type: "Network",
            details: "Unusual network activity",
            pc: "PC-021",
            priority: "Medium",
            status: "Resolved"
        }
    ];

    // ==================================
    // APPLICATION USAGE DATA
    // ==================================
    const apps = [
        {
            name: "Visual Studio Code",
            icon: "fa-code",
            category: "Development",
            percent: 35,
            users: 18,
            time: "4h 25m"
        },
        {
            name: "Google Chrome",
            icon: "fa-globe",
            category: "Web Browsing",
            percent: 28,
            users: 25,
            time: "3h 40m"
        },
        {
            name: "Microsoft Word",
            icon: "fa-file-word",
            category: "Office Apps",
            percent: 12,
            users: 14,
            time: "1h 35m"
        },
        {
            name: "Microsoft Excel",
            icon: "fa-file-excel",
            category: "Office Apps",
            percent: 8,
            users: 9,
            time: "58m"
        },
        {
            name: "Microsoft PowerPoint",
            icon: "fa-file-powerpoint",
            category: "Office Apps",
            percent: 6,
            users: 7,
            time: "42m"
        },
        {
            name: "Other Applications",
            icon: "fa-layer-group",
            category: "Others",
            percent: 11,
            users: 12,
            time: "1h 10m"
        }
    ];

    let currentPage = "Dashboard";
    let currentSettingsTab = "General";

    // ==================================
    // HELPER FUNCTIONS
    // ==================================
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    }

    function esc(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function badgeClass(value) {
        return String(value)
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function formatTime(isoString) {
        if (!isoString) return "—";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function calculateDuration(timeInISO, timeOutISO) {
        const start = new Date(timeInISO);
        const end = timeOutISO ? new Date(timeOutISO) : new Date();
        const diffMins = Math.max(0, Math.floor((end - start) / 60000));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }

    function pageHeader(title, subtitle, action = "") {
        return `
            <div class="page-heading">
                <div>
                    <h1>${title}</h1>
                    <p>${subtitle}</p>
                </div>
                ${action}
            </div>
        `;
    }

    function metric(icon, color, label, value, caption = "") {
        return `
            <div class="metric-card">
                <div class="stat-icon ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div>
                    <small>${label}</small>
                    <strong>${value}</strong>
                    ${caption ? `<small>${caption}</small>` : ""}
                </div>
            </div>
        `;
    }

    // ==================================
    // API FETCH & FORCE TIMEOUT FUNCTIONS
    // ==================================
    async function fetchSessionLogs(showNotification = false) {
        try {
            if (!USE_MOCK_DATA) {
                const response = await fetch(API_BASE_URL);
                if (!response.ok) throw new Error("Failed to fetch logs from API");
                liveSessionLogs = await response.json();
            }

            if (currentPage === "Session Logs") {
                renderSessionLogsTable();
                updateSessionMetrics();
            } else if (currentPage === "Dashboard") {
                renderPage();
            }

            if (showNotification) {
                showToast("Session logs synchronized.");
            }
        } catch (error) {
            console.error("Error loading session logs:", error);
            const stateMsg = document.getElementById("sessionStateMessage");
            const tbody = document.getElementById("sessionTableBody");
            if (tbody) tbody.innerHTML = "";
            if (stateMsg) {
                stateMsg.textContent = "Error connecting to database API. Please try again.";
                stateMsg.classList.remove("hidden");
            }
        }
    }

    async function forceTimeOut(logId) {
        if (!confirm("Are you sure you want to end this student's active session?")) return;

        const nowISO = new Date().toISOString();

        if (USE_MOCK_DATA) {
            const target = liveSessionLogs.find(item => item.log_id === logId);
            if (target) {
                target.time_out = nowISO;
                target.status = "Completed";
            }
            renderSessionLogsTable();
            updateSessionMetrics();
            showToast(`Session #${logId} ended (Timed-Out).`);
        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/${logId}/timeout`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ time_out: nowISO, status: "Completed" })
                });
                if (response.ok) {
                    await fetchSessionLogs();
                    showToast(`Session #${logId} ended (Timed-Out).`);
                }
            } catch (error) {
                showToast("Failed to update session status.");
            }
        }
    }

    // ==================================
    // DASHBOARD PAGE
    // ==================================
    function dashboardPage() {
        const activeCount = liveSessionLogs.filter(s => s.status === "Active").length;

        return `
        <div class="welcome-section">
            <div>
                <h1>Welcome back, ${esc(loggedInUser.name.split(" ")[0])}!</h1>
                <p>Here's an overview of your computer laboratory.</p>
            </div>

            <div class="date-display">
                <i class="far fa-calendar"></i>
                <span id="currentDate"></span>
            </div>
        </div>

        <div class="stats-grid">
            <button class="stat-card" data-go="Computer Units">
                <div class="stat-icon blue"><i class="fas fa-desktop"></i></div>
                <div class="stat-details">
                    <p>Total Computers</p>
                    <h2>${computers.length}</h2>
                    <span>Registered units</span>
                </div>
                <div class="stat-arrow"><i class="fas fa-arrow-right"></i></div>
            </button>

            <button class="stat-card" data-go="Computer Units">
                <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
                <div class="stat-details">
                    <p>Available Computers</p>
                    <h2>${computers.filter(c => c.status === "Available").length}</h2>
                    <span>Ready for use</span>
                </div>
                <div class="stat-arrow"><i class="fas fa-arrow-right"></i></div>
            </button>

            <button class="stat-card" data-go="Computer Units">
                <div class="stat-icon orange"><i class="fas fa-computer"></i></div>
                <div class="stat-details">
                    <p>Computers in Use</p>
                    <h2>${computers.filter(c => c.status === "In Use").length}</h2>
                    <span>Currently occupied</span>
                </div>
                <div class="stat-arrow"><i class="fas fa-arrow-right"></i></div>
            </button>

            <button class="stat-card" data-go="Session Logs">
                <div class="stat-icon purple"><i class="fas fa-users"></i></div>
                <div class="stat-details">
                    <p>Active Sessions</p>
                    <h2>${activeCount}</h2>
                    <span>Live student logins</span>
                </div>
                <div class="stat-arrow"><i class="fas fa-arrow-right"></i></div>
            </button>
        </div>

        <div class="dashboard-grid">
            <div class="panel activity-panel">
                <div class="panel-header">
                    <div>
                        <h3><i class="fas fa-chart-line"></i> Laboratory Activity Overview</h3>
                        <p>Computer usage throughout the week</p>
                    </div>
                    <select id="chartFilter">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>

                <div class="chart-container">
                    <div class="chart-legend">
                        <span><i class="legend-dot blue-dot"></i> Active Sessions</span>
                        <span><i class="legend-dot light-dot"></i> Computer Usage</span>
                    </div>

                    <svg viewBox="0 0 600 220" preserveAspectRatio="none" class="chart">
                        <g class="grid-lines">
                            <line x1="35" y1="25" x2="590" y2="25"/>
                            <line x1="35" y1="65" x2="590" y2="65"/>
                            <line x1="35" y1="105" x2="590" y2="105"/>
                            <line x1="35" y1="145" x2="590" y2="145"/>
                            <line x1="35" y1="185" x2="590" y2="185"/>
                        </g>
                        <path d="M35 120 L125 85 L215 105 L305 50 L395 80 L485 65 L575 35 L575 185 L35 185 Z" fill="#2463eb" opacity=".10"/>
                        <polyline points="35,120 125,85 215,105 305,50 395,80 485,65 575,35" fill="none" stroke="#2463eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="35,155 125,135 215,145 305,110 395,130 485,115 575,95" fill="none" stroke="#91b8fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                    <div class="chart-days">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>

            <div class="panel status-panel">
                <div class="panel-header">
                    <div>
                        <h3><i class="fas fa-desktop"></i> Computer Status</h3>
                        <p>Current workstation availability</p>
                    </div>
                </div>

                <div class="status-content">
                    <div class="donut-chart">
                        <div class="donut-inner">
                            <h2>${Math.round(computers.filter(c => c.status === "Available").length / computers.length * 100)}%</h2>
                            <span>Available</span>
                        </div>
                    </div>

                    <div class="status-legend">
                        <div>
                            <span class="status-name"><i class="status-dot online"></i> Available</span>
                            <strong>${computers.filter(c => c.status === "Available").length}</strong>
                        </div>
                        <div>
                            <span class="status-name"><i class="status-dot offline"></i> In Use</span>
                            <strong>${computers.filter(c => c.status === "In Use").length}</strong>
                        </div>
                        <div>
                            <span class="status-name"><i class="status-dot maintenance-dot"></i> Maintenance</span>
                            <strong>${computers.filter(c => c.status === "Maintenance").length}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel table-panel">
            <div class="panel-header">
                <div>
                    <h3><i class="fas fa-computer"></i> Computer Monitoring</h3>
                    <p>Overview of laboratory workstation units</p>
                </div>

                <div class="table-actions">
                    <input id="dashboardSearch" placeholder="Search computer...">
                    <button class="filter-btn" data-go="Computer Units">
                        View All <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Computer ID</th>
                            <th>Workstation</th>
                            <th>Assigned User</th>
                            <th>IP Address</th>
                            <th>Status</th>
                            <th>Last Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${computers.slice(0, 5).map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td><i class="fas fa-desktop pc-icon"></i> ${c.workstation}</td>
                                <td>${esc(c.user)}</td>
                                <td>${c.ip}</td>
                                <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
                                <td>${c.activity}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="table-footer">
                <span>Showing 5 of ${computers.length} sample computers</span>
                <button class="text-button" data-go="Computer Units">
                    View All <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <div class="bottom-grid">
            <div class="panel bottom-panel">
                <div class="panel-header">
                    <h3><i class="fas fa-clock"></i> Recent Live Sessions</h3>
                    <button class="text-button" data-go="Session Logs">View All</button>
                </div>

                ${liveSessionLogs.slice(0, 3).map(s => `
                    <div class="log-item">
                        <div class="log-icon ${s.status === "Active" ? "green-bg" : "red-bg"}">
                            <i class="fas ${s.status === "Active" ? "fa-sign-in-alt" : "fa-sign-out-alt"}"></i>
                        </div>
                        <div class="log-details">
                            <strong>${esc(s.student_name)} ${s.status === "Active" ? "is using" : "timed out from"} ${esc(s.pc_number)}</strong>
                            <small>${esc(s.student_id)} · ${esc(s.course_section)}</small>
                        </div>
                        <span>${s.status === "Active" ? formatTime(s.time_in) : formatTime(s.time_out)}</span>
                    </div>
                `).join("")}
            </div>

            <div class="panel bottom-panel">
                <div class="panel-header">
                    <h3><i class="fas fa-shield-halved"></i> Security Alerts</h3>
                    <button class="text-button" data-go="Security Alerts">View All</button>
                </div>

                ${alerts.slice(0, 2).map(a => `
                    <div class="alert-item">
                        <div class="alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="alert-details">
                            <strong>${esc(a.details)}</strong>
                            <small>${a.pc} · ${a.date.split(" ").slice(-2).join(" ")}</small>
                        </div>
                        <span class="badge ${badgeClass(a.priority)}">${a.priority}</span>
                    </div>
                `).join("")}
            </div>
        </div>

        <footer class="footer">
            <p>Lab Monitoring System © 2026. All Rights Reserved.</p>
            <p>Computer Laboratory Monitoring Dashboard</p>
        </footer>
        `;
    }

    // ==================================
    // COMPUTER UNITS PAGE
    // ==================================
    function computerUnitsPage() {
        return `
        ${pageHeader(
            "Computer Units",
            "Manage and monitor all registered laboratory workstations.",
            '<button class="primary-btn" id="addComputer"><i class="fas fa-plus"></i> Add Computer</button>'
        )}

        <div class="metric-grid">
            ${metric("fa-desktop", "blue", "Total Computers", computers.length, "Registered units")}
            ${metric("fa-check-circle", "green", "Available", computers.filter(c => c.status === "Available").length, "Ready for use")}
            ${metric("fa-computer", "orange", "In Use", computers.filter(c => c.status === "In Use").length, "Currently occupied")}
            ${metric("fa-screwdriver-wrench", "purple", "Maintenance", computers.filter(c => c.status === "Maintenance").length, "Under maintenance")}
        </div>

        <div class="panel">
            <div class="panel-header">
                <div>
                    <h3><i class="fas fa-list"></i> Workstation List</h3>
                    <p>Computer inventory and current status</p>
                </div>
            </div>

            <div class="toolbar">
                <input id="computerSearch" placeholder="Search PC number, name, user, or IP...">
                <select id="computerStatus">
                    <option value="">All Status</option>
                    <option>Available</option>
                    <option>In Use</option>
                    <option>Maintenance</option>
                </select>
                <select id="computerSection">
                    <option value="">All Sections</option>
                    <option>BSIT 1A</option>
                    <option>BSIT 1B</option>
                </select>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>PC No.</th>
                            <th>Workstation Name</th>
                            <th>Status</th>
                            <th>Assigned User</th>
                            <th>IP Address</th>
                            <th>Last Activity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="computerRows"></tbody>
                </table>
            </div>

            <div class="table-footer">
                <span id="computerCount"></span>
                <div class="pagination">
                    <button class="active">1</button>
                    <button disabled>2</button>
                    <button disabled>3</button>
                </div>
            </div>
        </div>
        `;
    }

    function renderComputerRows() {
        const q = (document.getElementById("computerSearch")?.value || "").toLowerCase();
        const status = document.getElementById("computerStatus")?.value || "";

        const list = computers.filter(c =>
            (`${c.id} ${c.workstation} ${c.user} ${c.ip}`.toLowerCase().includes(q)) &&
            (!status || c.status === status)
        );

        const tbody = document.getElementById("computerRows");
        if (!tbody) return;

        tbody.innerHTML = list.map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td><i class="fas fa-desktop pc-icon"></i> ${c.workstation}</td>
                <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
                <td>${esc(c.user)}</td>
                <td>${c.ip}</td>
                <td>${c.activity}</td>
                <td>
                    <div class="unit-actions">
                        <button class="icon-btn" title="Edit" data-edit="${c.id}"><i class="fas fa-pen"></i></button>
                        <button class="icon-btn delete" title="Delete" data-delete="${c.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join("") || `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-computer"></i>
                        <h3>No computers found</h3>
                        <p>Try another search or status filter.</p>
                    </div>
                </td>
            </tr>
        `;

        const countEl = document.getElementById("computerCount");
        if (countEl) countEl.textContent = `Showing ${list.length} of ${computers.length} computers`;
    }

    // ==================================
    // LIVE SESSION LOGS PAGE (UPGRADED WITH APP USAGE!)
    // ==================================
    function sessionLogsPage() {
        const totalSessions = liveSessionLogs.length;
        const activeCount = liveSessionLogs.filter(s => s.status === "Active").length;
        const completedCount = liveSessionLogs.filter(s => s.status === "Completed").length;

        return `
        ${pageHeader(
            "Live Session Logs & Workstation Activity",
            "Real-time monitoring of student computer usage, Time-In, Time-Out, and active applications.",
            `<div class="live-indicator"><span class="pulse-dot"></span><span>Live Sync Active</span></div>`
        )}

        <div class="metric-grid" id="sessionMetricGrid">
            ${metric("fa-clipboard-list", "blue", "Total Logged Sessions", totalSessions, "Recorded today")}
            ${metric("fa-desktop", "green", "Active (In-Use)", activeCount, "Currently using PC")}
            ${metric("fa-right-from-bracket", "orange", "Completed (Timed-Out)", completedCount, "Ended sessions")}
            ${metric("fa-database", "purple", "API Sync Status", USE_MOCK_DATA ? "Ready (Mock)" : "Connected", "Auto-refresh: 10s")}
        </div>

        <div class="panel">
            <div class="panel-header">
                <div>
                    <h3><i class="fas fa-clock"></i> Real-Time Session Log Table</h3>
                    <p>Monitor active PC assignments, active applications, session durations, and Time-Out records</p>
                </div>

                <div style="display:flex; gap:8px;">
                    <button class="filter-btn" id="refreshLogsBtn">
                        <i class="fas fa-rotate"></i> Refresh Logs
                    </button>
                    <button class="secondary-btn" id="exportSessions">
                        <i class="fas fa-download"></i> Export CSV
                    </button>
                </div>
            </div>

            <div class="toolbar">
                <input
                    id="sessionSearch"
                    placeholder="Search Student Name, Student ID, or PC No..."
                >

                <select id="sessionStatusFilter">
                    <option value="all">All Sessions</option>
                    <option value="Active">Active (In-Use)</option>
                    <option value="Completed">Completed (Timed-Out)</option>
                </select>

                <select id="sessionSectionFilter">
                    <option value="all">All Sections</option>
                    <option value="BSIT 1A">BSIT 1A</option>
                    <option value="BSIT 1B">BSIT 1B</option>
                </select>
            </div>

            <div class="table-responsive">
                <table class="session-table" id="sessionTable">
                    <thead>
                        <tr>
                            <th>PC / Workstation</th>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Course & Section</th>
                            <th>Current App & Duration</th>
                            <th>Time-In</th>
                            <th>Time-Out</th>
                            <th>Total Duration</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="sessionTableBody"></tbody>
                </table>
            </div>

            <div id="sessionStateMessage" class="state-message hidden">
                No matching session records found.
            </div>

            <div class="table-footer">
                <span id="sessionCount"></span>
                <div class="pagination">
                    <button class="active">1</button>
                    <button disabled>2</button>
                    <button disabled>3</button>
                </div>
            </div>
        </div>
        `;
    }

    function updateSessionMetrics() {
        const grid = document.getElementById("sessionMetricGrid");
        if (!grid) return;

        const totalSessions = liveSessionLogs.length;
        const activeCount = liveSessionLogs.filter(s => s.status === "Active").length;
        const completedCount = liveSessionLogs.filter(s => s.status === "Completed").length;

        grid.innerHTML = `
            ${metric("fa-clipboard-list", "blue", "Total Logged Sessions", totalSessions, "Recorded today")}
            ${metric("fa-desktop", "green", "Active (In-Use)", activeCount, "Currently using PC")}
            ${metric("fa-right-from-bracket", "orange", "Completed (Timed-Out)", completedCount, "Ended sessions")}
            ${metric("fa-database", "purple", "API Sync Status", USE_MOCK_DATA ? "Ready (Mock)" : "Connected", "Auto-refresh: 10s")}
        `;
    }

    function renderSessionLogsTable() {
        const tbody = document.getElementById("sessionTableBody");
        const stateMsg = document.getElementById("sessionStateMessage");
        const countEl = document.getElementById("sessionCount");

        if (!tbody) return;

        const query = (document.getElementById("sessionSearch")?.value || "").toLowerCase().trim();
        const statusFilter = document.getElementById("sessionStatusFilter")?.value || "all";
        const sectionFilter = document.getElementById("sessionSectionFilter")?.value || "all";

        const filtered = liveSessionLogs.filter(log => {
            const matchesQuery =
                log.student_name.toLowerCase().includes(query) ||
                log.student_id.toLowerCase().includes(query) ||
                log.pc_number.toLowerCase().includes(query);

            const matchesStatus = statusFilter === "all" || log.status === statusFilter;
            const matchesSection = sectionFilter === "all" || log.course_section === sectionFilter;

            return matchesQuery && matchesStatus && matchesSection;
        });

        tbody.innerHTML = "";

        if (filtered.length === 0) {
            if (stateMsg) {
                stateMsg.textContent = "No matching session records found.";
                stateMsg.classList.remove("hidden");
            }
        } else {
            if (stateMsg) stateMsg.classList.add("hidden");

            filtered.forEach(log => {
                const isActive = log.status === "Active";
                const formattedTimeIn = formatTime(log.time_in);
                const formattedTimeOut = formatTime(log.time_out);
                const totalDuration = calculateDuration(log.time_in, log.time_out);

                const appDuration = log.current_app && isActive ? calculateDuration(log.app_started_at, null) : "—";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><span class="pc-badge"><i class="fas fa-desktop"></i> ${esc(log.pc_number)}</span></td>
                    <td>${esc(log.student_id)}</td>
                    <td><strong>${esc(log.student_name)}</strong></td>
                    <td>${esc(log.course_section)}</td>
                    <td>
                        ${log.current_app ? `
                            <div style="font-size: 10px; font-weight: 600; color: var(--navy);">
                                <i class="fas fa-window-maximize" style="color: var(--blue); margin-right: 4px;"></i> ${esc(log.current_app)}
                            </div>
                            <div style="font-size: 9px; color: var(--muted); margin-top: 2px;">
                                Usage: ${appDuration}
                            </div>
                        ` : '<span style="color: #94a3b8; font-size: 9px;">No active app</span>'}
                    </td>
                    <td>${formattedTimeIn}</td>
                    <td>${formattedTimeOut}</td>
                    <td>${totalDuration}</td>
                    <td>
                        <span class="status-pill ${isActive ? "status-active" : "status-completed"}">
                            ${isActive ? "Active" : "Completed"}
                        </span>
                    </td>
                    <td>
                        ${
                            isActive
                                ? `<button class="btn-timeout" data-timeout-id="${log.log_id}">End Session</button>`
                                : `<span style="color: #94a3b8; font-size: 9px;">Logged</span>`
                        }
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        if (countEl) {
            countEl.textContent = `Showing ${filtered.length} of ${liveSessionLogs.length} session logs`;
        }
    }

    // ==================================
    // APPLICATION USAGE PAGE
    // ==================================
    function applicationUsagePage() {
        return `
        ${pageHeader(
            "Application Usage",
            "Monitor software and application usage across laboratory workstations."
        )}

        <div class="app-grid">
            <div class="panel">
                <div class="panel-header">
                    <div>
                        <h3><i class="fas fa-chart-pie"></i> Usage Breakdown</h3>
                        <p>Top applications used by students</p>
                    </div>
                </div>

                <div class="usage-donut-wrap">
                    <div class="usage-donut">
                        <div>
                            <strong>6</strong>
                            <small>Apps Tracked</small>
                        </div>
                    </div>

                    <div class="legend-list">
                        <div><span><i style="background:var(--blue)"></i> Development (35%)</span></div>
                        <div><span><i style="background:#10b981"></i> Web Browsing (28%)</span></div>
                        <div><span><i style="background:#f59e0b"></i> Office Apps (26%)</span></div>
                        <div><span><i style="background:#8b5cf6"></i> Others (11%)</span></div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-header">
                    <div>
                        <h3><i class="fas fa-clock"></i> Summary Statistics</h3>
                        <p>Total recorded usage time today</p>
                    </div>
                </div>

                <div style="display:grid; gap:14px; padding-top:10px;">
                    ${metric("fa-stopwatch", "blue", "Total Active Hours", "11h 50m", "Across all units")}
                    ${metric("fa-user-group", "green", "Active Students", "78", "Unique users today")}
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <div>
                    <h3><i class="fas fa-list"></i> Application Inventory</h3>
                    <p>Detailed breakdown of installed and active software</p>
                </div>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Application Name</th>
                            <th>Category</th>
                            <th>Active Users</th>
                            <th>Total Usage Time</th>
                            <th>Usage Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${apps.map(app => `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div class="app-logo"><i class="fas ${app.icon}"></i></div>
                                        <strong>${esc(app.name)}</strong>
                                    </div>
                                </td>
                                <td>${esc(app.category)}</td>
                                <td>${app.users} students</td>
                                <td>${app.time}</td>
                                <td>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <div class="progress" style="width:100px;">
                                            <span style="width:${app.percent}%"></span>
                                        </div>
                                        <span class="app-percent">${app.percent}%</span>
                                    </div>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    // ==================================
    // SECURITY ALERTS PAGE
    // ==================================
    function securityAlertsPage() {
        return `
        ${pageHeader(
            "Security Alerts",
            "Real-time monitoring of security warnings and workstation incidents."
        )}

        <div class="alert-summary">
            ${metric("fa-triangle-exclamation", "red", "High Priority", alerts.filter(a => a.priority === "High").length, "Requires attention")}
            ${metric("fa-circle-exclamation", "orange", "Medium Priority", alerts.filter(a => a.priority === "Medium").length, "Under review")}
            ${metric("fa-shield-check", "green", "Resolved", alerts.filter(a => a.status === "Resolved").length, "Closed issues")}
        </div>

        <div class="panel">
            <div class="panel-header">
                <div>
                    <h3><i class="fas fa-shield-halved"></i> Incident Logs</h3>
                    <p>All recorded security events across workstations</p>
                </div>
            </div>

            <div class="toolbar">
                <input id="alertSearch" placeholder="Search alert details or PC number...">
                <select id="alertPriority">
                    <option value="">All Priorities</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
                <select id="alertStatus">
                    <option value="">All Status</option>
                    <option>Open</option>
                    <option>Investigating</option>
                    <option>Resolved</option>
                </select>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>PC Unit</th>
                            <th>Event Type</th>
                            <th>Details</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="alertRows"></tbody>
                </table>
            </div>
        </div>
        `;
    }

    function renderAlerts() {
        const q = (document.getElementById("alertSearch")?.value || "").toLowerCase();
        const priority = document.getElementById("alertPriority")?.value || "";
        const status = document.getElementById("alertStatus")?.value || "";

        const list = alerts.filter(a =>
            (`${a.date} ${a.pc} ${a.type} ${a.details}`.toLowerCase().includes(q)) &&
            (!priority || a.priority === priority) &&
            (!status || a.status === status)
        );

        const tbody = document.getElementById("alertRows");
        if (!tbody) return;

        tbody.innerHTML = list.map(a => `
            <tr>
                <td>${a.date}</td>
                <td><strong>${a.pc}</strong></td>
                <td>${esc(a.type)}</td>
                <td>${esc(a.details)}</td>
                <td><span class="badge ${badgeClass(a.priority)}">${a.priority}</span></td>
                <td><span class="badge ${badgeClass(a.status)}">${a.status}</span></td>
            </tr>
        `).join("") || `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-shield-halved"></i>
                        <h3>No security alerts found</h3>
                        <p>No incidents match your current filter.</p>
                    </div>
                </td>
            </tr>
        `;
    }

    // ==================================
    // SETTINGS PAGE
    // ==================================
    function settingsPage() {
        return `
        ${pageHeader(
            "System Settings",
            "Configure laboratory preferences, security parameters, and administrator access."
        )}

        <div class="settings-layout">
            <div class="panel settings-nav">
                <button class="settings-tab ${currentSettingsTab === 'General' ? 'active' : ''}" data-tab="General">
                    <i class="fas fa-sliders"></i> General
                </button>
                <button class="settings-tab ${currentSettingsTab === 'Security' ? 'active' : ''}" data-tab="Security">
                    <i class="fas fa-lock"></i> Security
                </button>
                <button class="settings-tab ${currentSettingsTab === 'Notifications' ? 'active' : ''}" data-tab="Notifications">
                    <i class="fas fa-bell"></i> Notifications
                </button>
            </div>

            <div class="panel settings-section">
                ${currentSettingsTab === 'General' ? `
                    <h3>General Laboratory Settings</h3>
                    <p>Manage basic parameters for the computer lab monitoring system.</p>
                    <div class="form-grid">
                        <div class="form-field">
                            <label>Laboratory Name</label>
                            <input class="form-control" value="Computer Laboratory A">
                        </div>
                        <div class="form-field">
                            <label>Default Session Time Limit (Hours)</label>
                            <input class="form-control" type="number" value="3">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="primary-btn" id="saveSettings">Save Changes</button>
                    </div>
                ` : ''}

                ${currentSettingsTab === 'Security' ? `
                    <h3>Security Protocols</h3>
                    <p>Configure automated restriction rules and login security.</p>
                    <div class="check-list">
                        <label class="check-row"><input type="checkbox" checked> Block unauthorized USB mass storage devices</label>
                        <label class="check-row"><input type="checkbox" checked> Enforce automatic logout after 15 minutes of inactivity</label>
                        <label class="check-row"><input type="checkbox"> Restrict access to restricted websites and game applications</label>
                    </div>
                    <div class="form-actions">
                        <button class="primary-btn" id="saveSettings">Update Security</button>
                    </div>
                ` : ''}

                ${currentSettingsTab === 'Notifications' ? `
                    <h3>Notification Preferences</h3>
                    <p>Manage email or system alert triggers for the administrator.</p>
                    <div class="check-list">
                        <label class="check-row"><input type="checkbox" checked> Send high-priority security alerts</label>
                        <label class="check-row"><input type="checkbox" checked> Daily laboratory session summary report</label>
                    </div>
                    <div class="form-actions">
                        <button class="primary-btn" id="saveSettings">Save Preferences</button>
                    </div>
                ` : ''}
            </div>
        </div>
        `;
    }

    // ==================================
    // RENDER PAGE SWITCHER
    // ==================================
    function renderPage() {
        if (!content) return;

        if (currentPage === "Dashboard") {
            content.innerHTML = dashboardPage();
            if (topbarTitle) topbarTitle.textContent = "Computer Laboratory Dashboard";
        } else if (currentPage === "Computer Units") {
            content.innerHTML = computerUnitsPage();
            if (topbarTitle) topbarTitle.textContent = "Computer Units Management";
            renderComputerRows();
        } else if (currentPage === "Session Logs") {
            content.innerHTML = sessionLogsPage();
            if (topbarTitle) topbarTitle.textContent = "Live Session Logs & Workstation Activity";
            renderSessionLogsTable();
        } else if (currentPage === "Application Usage") {
            content.innerHTML = applicationUsagePage();
            if (topbarTitle) topbarTitle.textContent = "Application Usage Analytics";
        } else if (currentPage === "Security Alerts") {
            content.innerHTML = securityAlertsPage();
            if (topbarTitle) topbarTitle.textContent = "Security Incident Logs";
            renderAlerts();
        } else if (currentPage === "Settings") {
            content.innerHTML = settingsPage();
            if (topbarTitle) topbarTitle.textContent = "System Preferences";
        }

        updateDateDisplay();
        updateLoggedInUserUI(); // I-apply ang user details pagkatapos mag-render ng page
    }

    function updateDateDisplay() {
        const dateEl = document.getElementById("currentDate");
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }

    // ==================================
    // GLOBAL EVENT LISTENERS
    // ==================================
    document.addEventListener("click", e => {
        // Mobile Sidebar Toggle
        if (e.target.closest("#menuToggle")) {
            sidebar?.classList.toggle("active");
            return;
        }

        // Sidebar Navigation
        const menuItem = e.target.closest(".menu-item");
        if (menuItem) {
            e.preventDefault();
            document.querySelectorAll(".menu-item").forEach(el => el.classList.remove("active"));
            menuItem.classList.add("active");
            currentPage = menuItem.dataset.page;
            sidebar?.classList.remove("active");
            renderPage();
            return;
        }

        // Quick navigation buttons (data-go)
        const goBtn = e.target.closest("[data-go]");
        if (goBtn) {
            e.preventDefault();
            const targetPage = goBtn.dataset.go;
            currentPage = targetPage;
            document.querySelectorAll(".menu-item").forEach(el => {
                el.classList.toggle("active", el.dataset.page === targetPage);
            });
            renderPage();
            return;
        }

        // Force Time-Out Action in Live Session Logs Table
        const timeoutBtn = e.target.closest("[data-timeout-id]");
        if (timeoutBtn) {
            const logId = Number(timeoutBtn.dataset.timeoutId);
            forceTimeOut(logId);
            return;
        }

        // Refresh Live Session Logs
        if (e.target.closest("#refreshLogsBtn")) {
            fetchSessionLogs(true);
            return;
        }

        // Settings Tabs
        const tabBtn = e.target.closest(".settings-tab");
        if (tabBtn) {
            currentSettingsTab = tabBtn.dataset.tab;
            renderPage();
            return;
        }

        // Save Settings / Export CSV
        if (e.target.id === "saveSettings") {
            showToast("Settings successfully updated!");
            return;
        }

        if (e.target.id === "exportSessions") {
            showToast("Session logs exported to CSV successfully.");
            return;
        }

        // Delete Computer
        const deleteBtn = e.target.closest("[data-delete]");
        if (deleteBtn) {
            const pcId = deleteBtn.dataset.delete;
            computers = computers.filter(c => c.id !== pcId);
            renderComputerRows();
            showToast(`Workstation ${pcId} deleted.`);
            return;
        }

        // Logout
        if (e.target.closest("#logoutButton")) {
            if (confirm("Are you sure you want to logout?")) {
                // Burahin ang kasalukuyang login session.
                sessionStorage.removeItem("isLoggedIn");
                sessionStorage.removeItem("fullname");
                sessionStorage.removeItem("username");
                sessionStorage.removeItem("userRole");

                window.location.href = "login.html";
            }
        }
    });

    // Input filters listeners
    document.addEventListener("input", e => {
        if (e.target.id === "computerSearch" || e.target.id === "dashboardSearch") {
            const searchInput = document.getElementById("computerSearch");
            if (searchInput) searchInput.value = e.target.value;
            renderComputerRows();
        }

        if (e.target.id === "sessionSearch") {
            renderSessionLogsTable();
        }

        if (e.target.id === "alertSearch") {
            renderAlerts();
        }
    });

    document.addEventListener("change", e => {
        if (e.target.id === "computerStatus" || e.target.id === "computerSection") {
            renderComputerRows();
        }

        if (e.target.id === "sessionStatusFilter" || e.target.id === "sessionSectionFilter") {
            renderSessionLogsTable();
        }

        if (e.target.id === "alertPriority" || e.target.id === "alertStatus") {
            renderAlerts();
        }
    });

    // Initial Load & Auto-Polling (Every 10 seconds for Real-Time Logs)
    renderPage();
    updateLoggedInUserUI();

    setInterval(() => {
        if (currentPage === "Session Logs") {
            fetchSessionLogs(false);
        }
    }, 10000);

});
