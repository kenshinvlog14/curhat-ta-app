import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.js";
import { useMid } from "../hooks/useMid.js";

// Modal Pesan Masuk
function PesanModal({ pesan, onClose }) {
  if (!pesan) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Detail Pesan</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>
        <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{pesan.teks}</p>
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Tutup</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isReady: authReady } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPesan, setSelectedPesan] = useState(null);

  const userEmail = user?.email?.toLowerCase() ?? null;
  const firstName = (user?.nama ?? user?.name ?? "Mahasiswa").split(" ")[0];
  const avatarSrc = user?.foto_url ?? null;

  const { mid, loading: midLoading } = useMid(userEmail);
  const [bookings, setBookings] = useState([]);
  const [pesan, setPesan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    if (!userEmail) { setIsLoading(false); return; }
    if (!midLoading && !mid) { setIsLoading(false); }
  }, [userEmail, mid, midLoading, authReady]);

  useEffect(() => {
    if (!mid) return;
    let active = true;
    async function fetchDashboardData() {
      try {
        const bookingRes = await supabase
          .from("booking")
          .select("*")
          .eq("id_mahasiswa", mid)
          .order("tanggal_sesi", { ascending: false });

        if (!active) return;
        setBookings(bookingRes.data ?? []);

        const { data: pesanData } = await supabase
          .from("pesan")
          .select("*")
          .eq("id_penerima", userEmail)
          .order("created_at", { ascending: false });

        if (active) {
          setPesan((pesanData ?? []).map(p => ({
            id: p.id,
            nama: p.nama_pengirim,
            teks: p.teks,
            unread: !p.dibaca,
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [mid, userEmail]);

  const handleLogout = async () => {
    localStorage.removeItem("sanctuary_user");
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!authReady) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", color: "#4f46e5", fontWeight: 600 }}>Memuat Dashboard Curhat TA...</div>;
  }

  const totalSesi = bookings.length;
  const lastBooking = bookings[0] ?? null;
  const lastTanggal = lastBooking ? new Date(lastBooking.tanggal_sesi).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";
  const unreadCount = pesan.filter(p => p.unread).length;

  return (
    <div className="db-shell" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif", display: "flex" }}>
      <PesanModal pesan={selectedPesan} onClose={() => setSelectedPesan(null)} />

      {/* Sidebar Profesional */}
      <aside className={`db-sidebar ${sidebarOpen ? "db-sidebar--open" : ""}`} style={{ background: "#ffffff", borderRight: "1px solid #e2e8f0", width: "260px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "100vh", boxSizing: "border-box" }}>
        <div>
          <span className="db-logo" style={{ color: "#4f46e5", fontWeight: 800, fontSize: "1.25rem", cursor: "pointer" }} onClick={() => navigate("/")}>Curhat TA</span>
          <nav className="db-nav" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="db-nav-item" style={{ background: "#e0e7ff", color: "#4f46e5", fontWeight: 600, borderRadius: "8px", padding: "10px 14px", cursor: "pointer" }}>Beranda Dashboard</div>
            <div className="db-nav-item" onClick={() => navigate("/booking")} style={{ padding: "10px 14px", cursor: "pointer", color: "#475569", fontWeight: 500 }}>Booking Konselor</div>
            <div className="db-nav-item" onClick={() => navigate("/settings")} style={{ padding: "10px 14px", cursor: "pointer", color: "#475569", fontWeight: 500 }}>Pengaturan Akun</div>
          </nav>
        </div>
        <button className="db-logout" onClick={handleLogout} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", width: "100%" }}>Keluar</button>
      </aside>

      <main className="db-main" style={{ padding: "30px", flex: 1, maxWidth: "1000px", margin: "0 auto" }}>
        {/* Topbar */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", background: "#fff", padding: "16px 24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Dashboard Mahasiswa Polimedia</h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Kelola jadwal konsultasi skripsi dan solusi kodingmu di sini.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
              Halo, {firstName}
            </span>
            <div 
              onClick={() => navigate("/settings")} 
              style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, cursor: "pointer", overflow: "hidden" }}
              title="Pengaturan Akun"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                firstName.charAt(0)
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", borderRadius: "20px", padding: "35px", color: "#fff", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 25px -5px rgba(79,70,229,0.2)" }}>
          <div>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>SEMESTER AKHIR POLIMEDIA</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "12px 0 8px 0" }}>Halo, {firstName}! Siap selesaikan TA?</h2>
            <p style={{ fontSize: "14px", opacity: 0.9, maxWidth: "550px", lineHeight: 1.6, margin: 0 }}>
              Jangan biarkan error koding atau revisi menumpuk membuatmu stres. Jadwalkan sesi bimbingan bersama konselor sebaya atau dosen pendampingmu.
            </p>
          </div>
          <button onClick={() => navigate("/booking")} style={{ background: "#fff", color: "#4f46e5", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            Buat Jadwal Sekarang
          </button>
        </div>

        {/* Statistik Kartu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 600 }}>Total Sesi Bimbingan</p>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{isLoading ? "..." : totalSesi}</h3>
          </div>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 600 }}>Konsultasi Terakhir</p>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{isLoading ? "..." : lastTanggal}</h3>
          </div>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 600 }}>Pesan Masuk</p>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#4f46e5", margin: 0 }}>{isLoading ? "..." : unreadCount}</h3>
          </div>
        </div>

        {/* Bagian Riwayat Sesi Konsultasi */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
            Riwayat Sesi Bimbingan Saya
          </h3>

          {isLoading ? (
            <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", padding: "20px 0" }}>Memuat riwayat sesi...</p>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#64748b" }}>
              <p style={{ fontSize: "14px", margin: 0 }}>Belum ada sesi bimbingan yang terjadwal.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {bookings.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>{item.topik_konsultasi}</h4>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      Tanggal Sesi: {new Date(item.tanggal_sesi).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, textTransform: "capitalize" }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px", borderTop: "1px solid #e2e8f0", marginTop: "40px" }}>
          © 2026 Curhat TA Polimedia · Solusi Stres Skripsi &amp; Error Coding
        </footer>
      </main>
    </div>
  );
}