import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useMid } from "../hooks/useMid.js";
import { supabase } from "../lib/supabase.js";
import "../styles/home.css";

export default function Booking() {
  const navigate = useNavigate();
  const { user, isReady: authReady } = useAuth();
  
  const userEmail = user?.email?.toLowerCase() ?? null;
  const { mid } = useMid(userEmail);

  const [nama, setNama] = useState("");
  const [topik, setTopik] = useState("Revisi Skripsi / Bab Akhir"); // Diperbarui agar sama persis dengan option pertama
  const [tanggal, setTanggal] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Otomatis isi nama jika user sudah terdeteksi login
  useEffect(() => {
    if (user?.nama || user?.name) {
      setNama(user.nama ?? user.name);
    }
  }, [user]);

  useEffect(() => {
    // Mematikan restore scroll bawaan browser agar tidak tersangkut di bawah saat refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!nama || !tanggal) {
      alert("Mohon lengkapi nama dan tanggal sesi ya.");
      return;
    }

    if (!mid) {
      alert("ID Mahasiswa belum terdeteksi. Pastikan kamu sudah login dengan benar.");
      return;
    }

    setLoading(true);
    try {
      // Simpan data booking ke tabel Supabase
      const { error } = await supabase.from("booking").insert([
        {
          id_mahasiswa: mid,
          tanggal_sesi: tanggal,
          topik_konsultasi: topik,
          status: "terjadwal"
        }
      ]);

      if (error) {
        console.error("Gagal menyimpan booking:", error);
        alert("Gagal menjadwalkan sesi: " + error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Terjadi kesalahan:", err);
      alert("Terjadi kesalahan sistem saat menyimpan jadwal.");
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.nama ?? user?.name ?? "Mahasiswa";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarSrc = user?.foto_url ?? null;

  return (
    <div className="sanctuary" style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Navbar Bersih: Hanya Beranda & Booking Konselor, Sinkron Status Login */}
      <header className="nav-shell" style={{ position: "sticky", top: 0, zIndex: 100, background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <nav className="nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1100px", margin: "0 auto", padding: "16px 20px" }}>
          <div className="nav-l" style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <span className="nav-logo" onClick={() => navigate("/")} style={{ fontWeight: "800", fontSize: "1.25rem", color: "#4f46e5", cursor: "pointer" }}>
              Curhat TA
            </span>
            <ul className="nav-menu" style={{ display: "flex", gap: "24px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
              <li onClick={() => navigate("/")} style={{ cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#64748b" }}>
                Beranda
              </li>
              <li style={{ cursor: "pointer", fontWeight: "700", fontSize: "14px", color: "#4f46e5" }}>
                Booking Konselor
              </li>
            </ul>
          </div>

          <div className="nav-r">
            {authReady && user ? (
              // Jika sudah login, tampilkan sapaan & avatar profil menuju dashboard
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                  Halo, {userName.split(" ")[0]}
                </span>
                <div 
                  onClick={() => navigate("/dashboard")} 
                  style={{ width: 38, height: 38, borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}
                  title="Ke Dashboard"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    userInitial
                  )}
                </div>
              </div>
            ) : (
              // Jika belum login, tampilkan tombol Masuk
              <button className="nav-cta" onClick={() => navigate("/login")} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                Masuk / Login
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Konten Form Booking Konselor */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px", textAlign: "center" }}>Jadwalkan Konseling</h2>
          <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", marginBottom: "24px" }}>Pilih waktu terbaikmu untuk sesi konsultasi bersama konselor profesional Polimedia.</p>

          {success ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
              <h3 style={{ fontWeight: "700", marginBottom: "8px" }}>Berhasil Dijadwalkan!</h3>
              <p style={{ fontSize: "14px", marginBottom: "16px" }}>Sesi konsultasi kamu telah tercatat. Cek email secara berkala untuk konfirmasi jadwal.</p>
              <button onClick={() => navigate("/dashboard")} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: "700", cursor: "pointer" }}>Ke Dashboard Saya</button>
            </div>
          ) : (
            <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>Nama Lengkap / Mahasiswa</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama kamu" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>Topik Konsultasi</label>
                <select value={topik} onChange={(e) => setTopik(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                  <option value="Revisi Skripsi / Bab Akhir">Revisi Skripsi / Bab Akhir</option>
                  <option value="Error Coding & Bug Sistem">Error Coding & Bug Sistem</option>
                  <option value="Stres / Burnout Kuliah">Stres / Burnout Kuliah</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>Pilih Tanggal Sesi</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={loading} style={{ width: "100%", marginTop: "8px", padding: "14px", borderRadius: "12px", background: "#4f46e5", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Menyimpan Jadwal..." : "Konfirmasi Jadwal"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}