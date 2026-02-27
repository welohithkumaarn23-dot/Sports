<?php
// ================= DATABASE CONNECTION =================
$conn = new mysqli("localhost", "root", "", "sports_academy");

if ($conn->connect_error) {
    die("Database Connection Failed");
}

// ================= HANDLE LOGIN & REGISTER =================
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $action = $_POST['action'] ?? '';


    // ================= REGISTER =================
    if ($action == "register") {

        $name = $_POST['name'];
        $email = $_POST['email'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

        $check = $conn->prepare("SELECT id FROM users WHERE email=?");
        $check->bind_param("s",$email);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            echo "<script>alert('Email already exists');</script>";
        } else {
            $stmt = $conn->prepare("INSERT INTO users(name,email,password) VALUES(?,?,?)");
            $stmt->bind_param("sss",$name,$email,$password);
            $stmt->execute();
            echo "<script>alert('Registration Successful');</script>";
        }
    }

    // ================= LOGIN =================
    if ($action == "login") {

        $email = $_POST['email'];
        $password = $_POST['password'];

        $stmt = $conn->prepare("SELECT * FROM users WHERE email=?");
        $stmt->bind_param("s",$email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 0) {
            echo "<script>alert('Invalid Credentials');</script>";
        } else {
            $user = $result->fetch_assoc();

            if (password_verify($password,$user['password'])) {
                echo "<script>
                        alert('Login Successful');
                        window.location='index.html';
                      </script>";
            } else {
                echo "<script>alert('Invalid Credentials');</script>";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Academy - Login</title>
    <link rel="stylesheet" href="style.css">
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='28' fill='%23fff' stroke='%234b3fe0' stroke-width='4'/><path d='M32 4v56M4 32h56' stroke='%234b3fe0' stroke-width='4'/></svg>">
    
    <style>
        .invalid {
            border: 1px solid #ff4d4f !important;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/200/svg' viewBox='0 0 24 24'><path fill='%23ff4d4f' d='M12 2a10 10 0 100 20 10 10 0 000-20zm4.24 13.66L13.66 12l2.58-3.66-1.32-1.32L12 10.34 8.76 7.02 7.44 8.34 10.02 12l-2.58 3.66 1.32 1.32L12 13.66l3.24 3.32 1.32-1.32z'/></svg>");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 20px 20px;
        }
        .btn-strong { display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:1rem 1.2rem; border-radius:999px; background: linear-gradient(135deg, #4b3fe0 0%, #2563eb 100%); color:#fff; font-weight:800; font-size:1.05rem; letter-spacing:0.3px; box-shadow: 0 10px 24px rgba(37,99,235,0.35); border:none; transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
        .btn-strong:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(37,99,235,0.45); filter: brightness(1.05); }
        .btn-strong:active { transform: translateY(0); box-shadow: 0 8px 20px rgba(37,99,235,0.35); }
        .btn-strong:focus-visible { outline: 3px solid rgba(37,99,235,0.35); outline-offset: 2px; }
        .btn-ghost { display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:1rem 1.2rem; border-radius:999px; background: #10b981; color:#fff; font-weight:800; font-size:1.02rem; border:none; box-shadow: 0 8px 20px rgba(16,185,129,0.35); transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
        .btn-ghost:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(16,185,129,0.45); filter: brightness(1.06); }
        .btn-ghost:active { transform: translateY(0); box-shadow: 0 8px 20px rgba(16,185,129,0.35); }
        .btn-ghost:focus-visible { outline: 3px solid rgba(16,185,129,0.35); outline-offset: 2px; }
    </style>
    <style>
        .tab-row { display:flex; gap:10px; margin-bottom:14px; }
        .tab-btn { flex:1; padding:10px 14px; border-radius:999px; border:2px solid #c7d2fe; background:#eef2ff; color:#1f2937; cursor:pointer; font-weight:700; transition: all .15s ease; }
        .tab-btn:hover { filter: brightness(1.03); }
        .tab-btn.active { background: linear-gradient(135deg, #4b3fe0 0%, #2563eb 100%); color:#fff; border-color: transparent; box-shadow: 0 8px 20px rgba(37,99,235,0.35); }
        .hidden { display:none; }
        .input-with-icon { position: relative; }
        .toggle-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:transparent; border:none; color: var(--text-light); cursor:pointer; font-size:1rem; padding:2px; }
        .toggle-eye:hover { color: var(--primary-color); }
        .form-group label { color:#0f172a; font-weight:700; }
        .form-group input { padding:0.8rem 1rem; border-radius:12px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:1rem; caret-color:#2563eb; }
        .form-group input::placeholder { color:#64748b; opacity:1; }
        .form-group input:focus { outline:3px solid #93c5fd; border-color:#60a5fa; background:#ffffff; box-shadow: 0 0 0 4px rgba(147,197,253,0.25); }
    </style>
</head>
<body>

<header>
    <h1><i class="fas fa-running"></i> Sports Academy</h1>
    <div class="header-controls">
        <a href="index.html" class="cta-btn" style="padding: 0.5rem 1.5rem; font-size: 1rem;">Home</a>
    </div>
</header>

<nav class="nav-bar">
    <div class="nav-inner">
        <a class="nav-link" href="index.html">Home</a>
        <a class="nav-link" href="turfs.html">Explore</a>
        <a class="nav-link" href="tournaments.html">Tournaments</a>
        <a class="nav-link" href="contact.html">Contact</a>
        <a class="nav-link active" href="login.php">Login</a>
    </div>
</nav>

<div class="auth-container">
    <div class="card auth-card" style="max-width:520px;">

        <div class="tab-row">
            <button id="tab-signin" class="tab-btn active">Sign In</button>
            <button id="tab-signup" class="tab-btn">Sign Up</button>
        </div>

        <!-- SIGN IN -->
        <div id="signin">
            <form method="POST">
                <input type="hidden" name="action" value="login">

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="name@example.com" required>
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="Enter password" required>
                </div>

                <button type="submit" class="btn-strong">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                </button>
            </form>
        </div>

        <!-- SIGN UP -->
        <div id="signup" class="hidden">
            <form method="POST">
                <input type="hidden" name="action" value="register">

                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" name="name" placeholder="Your Name" required>
                </div>

                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="Enter Email" required>
                </div>

                <div class="form-group">
                    <label>Set Password</label>
                    <input type="password" name="password" placeholder="Password" required>
                </div>

                <button type="submit" class="btn-strong">
                    <i class="fas fa-user-plus"></i> Complete Signup
                </button>
            </form>
        </div>

    </div>
</div>

<script>
const tabSignin = document.getElementById('tab-signin');
const tabSignup = document.getElementById('tab-signup');
const signin = document.getElementById('signin');
const signup = document.getElementById('signup');

tabSignin.onclick = () => {
    signin.classList.remove("hidden");
    signup.classList.add("hidden");
    tabSignin.classList.add("active");
    tabSignup.classList.remove("active");
};

tabSignup.onclick = () => {
    signin.classList.add("hidden");
    signup.classList.remove("hidden");
    tabSignin.classList.remove("active");
    tabSignup.classList.add("active");
};
</script>

</body>
</html>

