const API_URL = 'http://localhost:3000/api';

/* =======================
   MOCK DATA
======================= */

const DEFAULT_USERS = [
    { id: 1, name: 'Demo User', email: 'user@example.com', password: 'password', role: 'user', mobile: '1234567890' },
    { id: 2, name: 'Admin User', email: 'admin@sports.com', password: 'admin123', role: 'admin', mobile: '0987654321' }
];

const DEFAULT_SPORTS = [
    { id: 1, name: 'Football', image_url: 'img/football.jpeg', description: 'Match-play and position-focused drills.' },
    { id: 2, name: 'Swimming Pool', image_url: 'img/swim.jpeg', description: 'Lap sessions and beginner coaching.' },
    { id: 3, name: 'Gym', image_url: 'img/gym.jpeg', description: 'Strength, conditioning, and mobility.' },
    { id: 4, name: 'Pickleball', image_url: 'img/pickleball.jpeg', description: 'Fun rallies and skills development.' },
    { id: 5, name: 'Cricket', image_url: 'img/cricket.jpeg', description: 'Practice nets and match formats.' },
    { id: 6, name: 'Badminton', image_url: 'img/badminton.jpeg', description: 'Technical drills and ladder sessions.' },
    { id: 7, name: 'Tennis', image_url: 'img/tennis.jpeg', description: 'Technique, agility, and match exposure.' }
];

function generateDefaultSlots() {
    const prices = { 1: 500, 2: 400, 3: 200, 4: 300, 5: 500, 6: 300, 7: 400 };
    let slots = [];
    let id = 1;

    DEFAULT_SPORTS.forEach(sport => {
        for (let h = 6; h < 24; h++) {
            slots.push({
                id: id++,
                sport_id: sport.id,
                start_time: `${String(h).padStart(2,'0')}:00`,
                end_time: `${String((h+1)%24).padStart(2,'0')}:00`,
                price: prices[sport.id]
            });
        }
    });
    return slots;
}

const DEFAULT_MOCK_DATA = {
    users: DEFAULT_USERS,
    sports: DEFAULT_SPORTS,
    slots: generateDefaultSlots(),
    bookings: [],
    archivedBookings: [],
    tournaments: [],
    tournamentSlots: [],
    participants: [],
    images: DEFAULT_SPORTS.map(s => ({ url: s.image_url, source: 'sport', ref_id: s.id })),
    memberships: { 3: { monthly: 1000, yearly: 10000 } },
    whatsapp: { api_key: '', sender: '0987654321' }
};

function getMockData() {
    const d = localStorage.getItem('mock_data');
    if (d) return JSON.parse(d);
    localStorage.setItem('mock_data', JSON.stringify(DEFAULT_MOCK_DATA));
    return DEFAULT_MOCK_DATA;
}

function saveMockData(data) {
    localStorage.setItem('mock_data', JSON.stringify(data));
}

/* =======================
   Responsive Navigation
======================= */
function initResponsiveNav() {
    try {
        const toggle = document.querySelector('.nav-toggle');
        const navInner = document.querySelector('.nav-inner');
        if (!toggle || !navInner) return;
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navInner.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!navInner.classList.contains('open')) return;
            if (!navInner.contains(e.target) && e.target !== toggle) {
                navInner.classList.remove('open');
            }
        });
    } catch (e) {}
}
document.addEventListener('DOMContentLoaded', initResponsiveNav);

function cleanOldBookings(days = 30) {
    const data = getMockData();
    const now = new Date();
    const cutoff = days * 24 * 60 * 60 * 1000;
    const keep = [];
    const archive = data.archivedBookings || [];
    (data.bookings || []).forEach(b => {
        const d = new Date(b.booking_date);
        if (!isNaN(d.getTime()) && (now - d) > cutoff) {
            archive.push({ ...b, archived_at: Date.now() });
        } else {
            keep.push(b);
        }
    });
    data.bookings = keep;
    data.archivedBookings = archive;
    saveMockData(data);
    return data.bookings;
}

function generateSlotsForSport(sportId, basePrice = 300) {
    const data = getMockData();
    const nextIdStart = (data.slots[data.slots.length - 1]?.id || 0) + 1;
    let id = nextIdStart;
    for (let h = 6; h < 24; h++) {
        data.slots.push({
            id: id++,
            sport_id: parseInt(sportId, 10),
            start_time: `${String(h).padStart(2,'0')}:00`,
            end_time: `${String((h+1)%24).padStart(2,'0')}:00`,
            price: basePrice
        });
    }
    saveMockData(data);
}

/* =======================
   TOURNAMENTS (Customer)
======================= */

async function fetchTournaments() {
    try {
        const response = await fetch('http://localhost:5000/tournaments');
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch tournaments');
            return [];
        }
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return [];
    }
}

async function fetchSports() {
    try {
        const response = await fetch('http://localhost:5000/sports');
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch sports');
            return [];
        }
    } catch (error) {
        console.error('Error fetching sports:', error);
        return [];
    }
}

async function fetchTournamentSlots(tournamentId) {
    const data = getMockData();
    return (data.tournamentSlots || []).filter(s => s.tournament_id === tournamentId);
}

async function registerTournamentParticipant(payload) {
    try {
        const response = await fetch('http://localhost:5000/register-tournament', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            alert('Registration successful');
            return true;
        } else {
            let errMsg = 'Server error';
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const err = await response.json();
                    errMsg = err.error || errMsg;
                } else {
                    const text = await response.text();
                    if (text.startsWith('<!DOCTYPE')) {
                        errMsg = 'Server not running or endpoint missing.';
                    } else {
                        errMsg = text;
                    }
                }
            } catch (e) {}
            alert('Registration failed: ' + errMsg);
            return false;
        }
    } catch (error) {
        alert('Registration failed: ' + error.message);
        return false;
    }
}

/* =======================
   AUTH
======================= */

async function login(email, password, expectedRole = null) {
    const data = getMockData();
    const user = data.users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        alert('Invalid credentials');
        return;
    }

    if (expectedRole && user.role !== expectedRole) {
        alert('Access denied');
        return;
    }

    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function checkAuth(role = null) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    if (role && user.role !== role) {
        logout();
        return null;
    }
    return user;
}

/* =======================
   BOOKINGS
======================= */

function bookSlot(slotId, date, price) {
    const user = checkAuth('user');
    const data = getMockData();
    const slot = data.slots.find(s => s.id === slotId);
    const sport = data.sports.find(s => s.id === slot.sport_id);
    
    let mobile = user.mobile || '';
    if (!mobile || !/^\d{10}$/.test(mobile)) {
        mobile = prompt('Enter 10 digit phone number for this booking:') || '';
        if (!/^\d{10}$/.test(mobile)) {
            alert('Invalid phone number. Please enter 10 digits.');
            return;
        }
        // persist to user profile for subsequent bookings
        const updatedUser = { ...user, mobile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    data.bookings.push({
        id: Date.now(),
        user_id: user.id,
        user_name: user.name,
        user_mobile: mobile,
        sport_name: sport.name,
        booking_date: date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        price
    });

    saveMockData(data);
    alert('Booking successful');
}

/* =======================
   ADMIN VIEW
======================= */

function loadAdminBookings() {
    const admin = checkAuth('admin');
    const data = getMockData();
    const table = document.getElementById('admin-bookings');

    if (!table) return;

    if (data.bookings.length === 0) {
        table.innerHTML = '<tr><td colspan="5">No bookings</td></tr>';
        return;
    }

    table.innerHTML = data.bookings.map(b => `
        <tr>
            <td>${b.user_name}</td>
            <td>${b.user_mobile || ''}</td>
            <td>${b.sport_name}</td>
            <td>${b.booking_date}</td>
            <td>${b.start_time} - ${b.end_time}</td>
            <td>₹${b.price}</td>
        </tr>
    `).join('');
}
