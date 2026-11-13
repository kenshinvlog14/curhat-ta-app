import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const notice = location.state?.notice ?? "";

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Masukkan email kamu dulu sebelum reset password ya.");
      return;
    }
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (resetErr) {
      setError("Gagal kirim email reset: " + resetErr.message);
    } else {
      setError("");
      alert(`Link reset password sudah dikirim ke ${email}. Cek inbox atau folder spam ya.`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Yuk lengkapi email dan password dulu");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      if (authError?.message?.toLowerCase().includes("email not confirmed")) {
        setError("Email kamu belum dikonfirmasi. Cek inbox atau folder spam ya.");
      } else if (authError?.message?.toLowerCase().includes("invalid login credentials")) {
        setError("Hmm, email atau password kamu belum cocok. Coba cek lagi ya.");
      } else if (authError?.message?.toLowerCase().includes("too many requests")) {
        setError("Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.");
      } else {
        setError(authError?.message ?? "Hmm, email atau password kamu belum cocok. Coba cek lagi ya.");
      }
      setLoading(false);
      return;
    }

    const emailLower = email.toLowerCase();

    let { data: profil } = await supabase
      .from("profil_pengguna")
      .select("*")
      .eq("email", emailLower)
      .maybeSingle();

    const nama = profil?.nama ?? authData.user.user_metadata?.nama ?? emailLower.split("@")[0];
    let studentId = profil?.student_id ?? null;

    if (!studentId) {
      const suffix = Date.now().toString().slice(-6);
      studentId = `M-${suffix}`;
    }

    // Pastikan tersimpan sebagai mahasiswa di database profil
    await supabase
      .from("profil_pengguna")
      .upsert(
        {
          email: emailLower,
          nama,
          role: "mahasiswa",
          student_id: studentId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    localStorage.setItem("sanctuary_user", JSON.stringify({
      id: authData.user.id,
      name: nama,
      nama: nama,
      email: emailLower,
      role: "mahasiswa",
      student_id: studentId,
    }));

    setLoading(false);

    const redirect = sessionStorage.getItem("redirect_after_login") || "/dashboard";
    sessionStorage.removeItem("redirect_after_login");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "1.35rem", fontWeight: "800", color: "#4f46e5", cursor: "pointer" }} onClick={() => navigate("/")}>
              Curhat TA
            </span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-h1">Selamat Datang Kembali</h1>
            <p className="auth-form-sub">Masuk untuk melanjutkan konsultasi skripsi &amp; error coding.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Alamat Email</label>
              <input
                type="email"
                className="auth-input"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <button type="button" className="auth-forgot" onClick={handleForgotPassword}>Lupa password?</button>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  className="auth-input"
                  placeholder="Masukkan password kamu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw(!showPw)}>
                  {showPw ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {notice && <p className="auth-notice">{notice}</p>}
            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className={`auth-submit ${loading ? "auth-submit--loading" : ""}`}
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Masuk"}
            </button>
          </form>

          <p className="auth-switch" style={{ textAlign: "center" }}>
            Belum punya akun?{" "}
            <span className="auth-switch-link" onClick={() => navigate("/register")}>Yuk daftar dulu</span>
          </p>

          <div className="auth-support-wrapper">
            <button className="auth-support-btn" onClick={() => navigate("/")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}