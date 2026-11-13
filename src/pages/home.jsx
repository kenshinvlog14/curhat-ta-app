import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user, isReady: authReady } = useAuth();
  
  const [activeNav, setActiveNav] = useState("beranda");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Halo, Mahasiswa Polimedia! Ada kendala apa dengan skripsi atau error coding kamu hari ini? Tuliskan di bawah ya." }
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setActiveNav("beranda");
  }, []);

  const handleSendAI = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const newMsgs = [...messages, { sender: "user", text: userText }];
    setMessages(newMsgs);
    setInput("");

    // Simulasi respons AI yang jauh lebih cerdas, kontekstual, dan solutif
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = "Pertanyaan yang sangat menarik! Untuk pembahasan teknis yang lebih mendalam, pastikan kamu mendiskusikannya langsung dengan dosen pembimbing atau menjadwalkan sesi bersama konselor profesional di Polimedia.";

      if (lower.includes("tambah") || lower.includes("kurang") || lower.includes("kali") || lower.includes("bagi") || !isNaN(userText.trim())) {
        reply = "Wah, sepertinya kamu sedang menguji logika matematika ya! Kalau untuk urusan angka di skripsi, pastikan data statistik pengujian aplikasimu sudah valid. Semangat terus buat pengerjaannya!";
      } else if (lower.includes("sitasi") || lower.includes("daftar pustaka") || lower.includes("referensi") || lower.includes("plagiasi")) {
        reply = "Penambahan sitasi dan daftar pustaka yang valid sangat krusial untuk menjaga kredibilitas laporan TA. Gunakan minimal referensi 5 tahun terakhir dari jurnal terakreditasi atau buku resmi.";
      } else if (lower.includes("laravel") || lower.includes("php") || lower.includes("composer") || lower.includes("controller") || lower.includes("route")) {
        reply = "Tips untuk error Laravel: pastikan konfigurasi database di file `.env` sudah benar, lalu jalankan `php artisan config:clear` atau `php artisan cache:clear` di terminal untuk menyegarkan route dan konfigurasi server lokal kamu.";
      } else if (lower.includes("supabase") || lower.includes("database") || lower.includes("tabel") || lower.includes("query") || lower.includes("sql")) {
        reply = "Untuk kendala database Supabase, periksa kembali URL project dan anon key pada file konfigurasi client kamu. Cek juga tab Table Editor di Supabase untuk memastikan nama kolom serta tipe datanya sudah sesuai dengan skema aplikasi.";
      } else if (lower.includes("error") || lower.includes("bug") || lower.includes("failed") || lower.includes("undefined") || lower.includes("exception")) {
        reply = "Jangan panik hadapi bug! Coba cek pesan log di terminal atau buka Inspect Element -> Console di browser (F12) untuk melacak letak baris kode yang bermasalah. Perhatikan juga tanda kurung atau titik koma yang terlewat.";
      } else if (lower.includes("sidang") || lower.includes("penguji") || lower.includes("presentasi") || lower.includes("demo")) {
        reply = "Menghadapi sidang TA kuncinya ada pada penguasaan alur demo aplikasi dan pemahaman bab metodologi. Latihlah presentasi bersama teman kelompok dan siapkan jawaban untuk mengantisipasi pertanyaan penguji.";
      } else if (lower.includes("skripsi") || lower.includes("bab") || lower.includes("proposal") || lower.includes("laporan") || lower.includes("kesimpulan")) {
        reply = "Pastikan rumusan masalah pada Bab 1 selaras dengan hasil implementasi dan kesimpulan di Bab Akhir. Perhatikan juga panduan format penulisan resmi dari kampus Polimedia.";
      } else if (lower.includes("stres") || lower.includes("capek") || lower.includes("burnout") || lower.includes("pusing") || lower.includes("lelah") || lower.includes("anjing") || lower.includes("anjir")) {
        reply = "Wajar banget kalau merasa penat dan tertekan di semester akhir ini. Tarik napas dalam-dalam, istirahat sejenak dari layar monitor, atau jadwalkan sesi curhat langsung melalui menu Booking Konselor ya!";
      } else if (lower.includes("halo") || lower.includes("hai") || lower.includes("pagi") || lower.includes("siang") || lower.includes("malam")) {
        reply = "Halo juga! Ada kendala seputar kodingan web/multimedia atau progres bab skripsi yang ingin didiskusikan hari ini?";
      }

      setMessages([...newMsgs, { sender: "ai", text: reply }]);
    }, 800);
  };

  const scrollToSection = (id, navName) => {
    setActiveNav(navName);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const userName = user?.nama ?? user?.name ?? "Mahasiswa";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarSrc = user?.foto_url ?? null;

  return (
    <div className="sanctuary" style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Navbar Atas */}
      <header className="nav-shell" style={{ position: "sticky", top: 0, zIndex: 100, background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <nav className="nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1100px", margin: "0 auto", padding: "16px 20px" }}>
          <div className="nav-l" style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <span 
              className="nav-logo" 
              onClick={() => scrollToSection("top", "beranda")} 
              style={{ fontWeight: "800", fontSize: "1.25rem", color: "#4f46e5", cursor: "pointer" }}
            >
              Curhat TA
            </span>
            <ul className="nav-menu" style={{ display: "flex", gap: "24px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
              <li 
                onClick={() => scrollToSection("top", "beranda")} 
                style={{ 
                  cursor: "pointer", 
                  fontWeight: "700", 
                  fontSize: "14px", 
                  color: activeNav === "beranda" ? "#4f46e5" : "#64748b",
                  transition: "color 0.2s"
                }}
              >
                Beranda
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
              <button className="nav-cta" onClick={() => navigate("/login")} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.15)" }}>
                Masuk / Login
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section Beranda */}
      <main id="top" style={{ flex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 20px 40px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#e0e7ff", color: "#4f46e5", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
            Platform Konseling &amp; Bimbingan TA Polimedia
          </div>
          <h1 style={{ fontSize: "2.75rem", fontWeight: "800", color: "#0f172a", lineHeight: "1.2", marginBottom: "16px" }}>
            Stres Revisi dan <span style={{ color: "#4f46e5" }}>Error Coding</span>?<br />
            Tumpahkan Semuanya di Curhat TA
          </h1>
          <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "650px", margin: "0 auto 30px", lineHeight: "1.6" }}>
            Jangan biarkan skripsi dan bug coding membuatmu burnout. Curhat anonim lewat Tanya Jawab AI di bawah ini atau jadwalkan sesi dengan konselor profesional.
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "50px" }}>
            <button 
              onClick={() => scrollToSection("tanya-jawab-section", "tanya-jawab")} 
              style={{ background: "#4f46e5", color: "#fff", padding: "14px 28px", borderRadius: "12px", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }}
            >
              Mulai Tanya Jawab AI
            </button>
            <button 
              onClick={() => navigate("/booking")} 
              style={{ background: "#ffffff", color: "#0f172a", padding: "14px 28px", borderRadius: "12px", fontWeight: "700", border: "1px solid #cbd5e1", cursor: "pointer" }}
            >
              Booking Konselor
            </button>
          </div>

          {/* Fitur Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "60px", textAlign: "left" }}>
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>🤖 Tanya Jawab Instan</h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>Solusi cepat untuk error coding Laravel, kueri database, hingga penyusunan bab skripsi.</p>
            </div>
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>📅 Booking Konselor</h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>Atur jadwal konsultasi privat dengan dosen atau konselor ahli Polimedia dengan mudah.</p>
            </div>
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>🔒 100% Aman &amp; Anonim</h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>Kenyamanan dan privasi mahasiswa tingkat akhir Polimedia terjaga sepenuhnya.</p>
            </div>
          </div>
        </div>

        {/* Bagian Tanya Jawab AI */}
        <div id="tanya-jawab-section" style={{ background: "#f1f5f9", padding: "60px 20px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Tanya Jawab AI</h2>
              <p style={{ fontSize: "14px", color: "#64748b" }}>Diskusikan masalah skripsi, struktur database, atau error coding secara anonim dan langsung di sini.</p>
            </div>

            {/* Kotak Riwayat Percakapan AI */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", height: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.sender === "user" ? "#4f46e5" : "#f1f5f9", color: m.sender === "user" ? "#fff" : "#0f172a", padding: "12px 18px", borderRadius: "14px", fontSize: "14px", lineHeight: "1.5" }}>
                  {m.text}
                </div>
              ))}
            </div>

            {/* Input Form Chat AI */}
            <form onSubmit={handleSendAI} style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pertanyaan seputar skripsi atau error coding kamu di sini..."
                style={{ flex: 1, padding: "16px 20px", borderRadius: "14px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#fff" }}
              />
              <button type="submit" style={{ padding: "0 28px", borderRadius: "14px", background: "#4f46e5", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }}>
                Kirim
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}