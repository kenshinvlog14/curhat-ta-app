import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import "../styles/settings.css";
import { supabase } from "../lib/supabase.js";
import { usePushNotif } from "../hooks/usePushNotif.js";

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "24px", marginBottom: "20px" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px", margin: "0 0 16px 0" }}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg]); 
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: "#4f46e5", color: "#fff", padding: "12px 20px", borderRadius: 12,
      fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(79,70,229,0.25)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {msg}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", paddingRight: 60 }} />
      <button type="button" onClick={() => setShow(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600 }}>
        {show ? "Sembunyikan" : "Lihat"}
      </button>
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "Lemah", color: "#ef4444" },
    { label: "Cukup", color: "#f97316" },
    { label: "Bagus", color: "#eab308" },
    { label: "Kuat", color: "#22c55e" },
  ];
  const lvl = levels[score - 1] ?? levels[0];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < score ? lvl.color : "#e2e8f0", transition: "background .3s" }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: lvl.color, margin: 0, fontWeight: 600 }}>Kekuatan password: {lvl.label}</p>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sanctuary_user")); }
    catch { return null; }
  }, []);

  const userName = user?.nama ?? user?.name ?? "Mahasiswa";
  const userEmail = (user?.email ?? "").toLowerCase();

  // AMBIL FOTO DARI LOCALSTORAGE AGAR LANGSUNG MUNCUL SAAT REFRESH
  const [displayName, setDisplayName] = useState(userName);
  const [fotoUrl, setFotoUrl] = useState(user?.foto_url ?? null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [pwLama, setPwLama] = useState("");
  const [pwBaru, setPwBaru] = useState("");
  const [pwKonfirm, setPwKonfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const [toast, setToast] = useState("");
  const showToast = (msg) => setToast(msg);

  const handleLogout = () => {
    supabase.auth.signOut();
    localStorage.removeItem("sanctuary_user");
    navigate("/login");
  };

  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      const { data, error } = await supabase
        .from("profil_pengguna")
        .select("nama, foto_url")
        .eq("email", userEmail)
        .maybeSingle();
      if (!error && data?.nama) {
        setDisplayName(data.nama);
      }
      if (!error && data?.foto_url) {
        setFotoUrl(data.foto_url);
      }
    })();
  }, [userEmail]);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!userEmail || !user?.id) {
      showToast("Sesi tidak valid. Silakan masuk kembali.");
      return;
    }

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      showToast("Nama tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      let uploadedUrl = fotoUrl;
      
      // Kompres gambar otomatis menggunakan Canvas agar ukurannya kecil dan aman masuk database
      if (fotoFile) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(fotoFile);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 300;
              const MAX_HEIGHT = 300;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);
              
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = (error) => reject(error);
          };
          reader.onerror = (error) => reject(error);
        });
      }

      const updatedAt = new Date().toISOString();
      const updatePayload = { 
        nama: trimmedName, 
        updated_at: updatedAt 
      };
      
      if (uploadedUrl) {
        updatePayload.foto_url = uploadedUrl;
      }

      console.log("Mengirim payload ke Supabase:", updatePayload);

      // Update langsung ke tabel profil_pengguna berdasarkan email
      const { data, error: updateErr } = await supabase
        .from("profil_pengguna")
        .update(updatePayload)
        .eq("email", userEmail)
        .select();

      if (updateErr) throw updateErr;
      console.log("Berhasil disimpan ke database:", data);

      // Perbarui local storage secara sinkron agar tidak hilang saat refresh
      const updatedUser = { 
        ...user, 
        email: userEmail, 
        name: trimmedName, 
        nama: trimmedName,
        foto_url: uploadedUrl ?? user?.foto_url 
      };
      
      localStorage.setItem("sanctuary_user", JSON.stringify(updatedUser));

      setFotoUrl(uploadedUrl);
      setFotoPreview(null);
      setFotoFile(null);
      setDisplayName(trimmedName);
      
      showToast("Profil berhasil diperbarui ✓");
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      showToast("Gagal menyimpan profil ke database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGantiPassword = async () => {
    setPwError("");
    if (!pwLama) { setPwError("Masukkan password lama kamu terlebih dahulu."); return; }
    if (!pwBaru) { setPwError("Password baru tidak boleh kosong."); return; }
    if (pwBaru.length < 6) { setPwError("Password baru minimal harus 6 karakter."); return; }
    if (pwBaru !== pwKonfirm) { setPwError("Konfirmasi password baru tidak cocok."); return; }
    
    setPwLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: pwLama });
      if (signInErr) { setPwError("Password lama yang kamu masukkan salah."); return; }
      
      const { error: updateErr } = await supabase.auth.updateUser({ password: pwBaru });
      if (updateErr) throw updateErr;
      
      showToast("Password berhasil diubah ✓");
      setPwLama(""); setPwBaru(""); setPwKonfirm("");
    } catch (err) {
      setPwError("Terjadi kesalahan saat memperbarui password.");
    } finally {
      setPwLoading(false);
    }
  };

  const avatarSrc = fotoPreview ?? fotoUrl;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <Toast msg={toast} onDone={() => setToast("")} />

      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <span onClick={() => navigate("/")} style={{ fontWeight: 800, fontSize: "1.25rem", color: "#4f46e5", cursor: "pointer" }}>
              Curhat TA
            </span>
            <nav style={{ display: "flex", gap: "16px", fontSize: "14px", fontWeight: 600 }}>
              <span onClick={() => navigate("/dashboard")} style={{ cursor: "pointer", color: "#64748b" }}>Dashboard</span>
              <span onClick={() => navigate("/booking")} style={{ cursor: "pointer", color: "#64748b" }}>Booking</span>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div 
              onClick={() => navigate("/settings")} 
              style={{ width: 38, height: 38, borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, cursor: "pointer", overflow: "hidden" }}
            >
              {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userName.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main style={{ flex: 1, maxWidth: "800px", width: "100%", margin: "0 auto", padding: "40px 20px", boxSizing: "border-box" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Pengaturan Akun</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Kelola profil mahasiswa Polimedia dan keamanan akunmu dalam Bahasa Indonesia.</p>
        </div>

        {/* Bagian 1: Identitas Profil */}
        <Section title="Identitas Profil">
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, overflow: "hidden" }}>
                {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userName.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFotoChange} />
                  <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, background: "#4f46e5", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }} title="Unggah Foto">
                    📷
                  </button>
                </>
              )}
            </div>

            <div style={{ flex: 1, minWidth: "250px" }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>NAMA LENGKAP</label>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", marginTop: "4px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>EMAIL TERDAFTAR</label>
                    <input value={userEmail} disabled style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", marginTop: "4px", fontSize: "14px", background: "#f1f5f9", cursor: "not-allowed", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button onClick={handleSaveProfile} disabled={isSaving} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button onClick={() => { setIsEditing(false); setDisplayName(userName); setFotoPreview(null); setFotoFile(null); }} style={{ background: "#f1f5f9", color: "#334155", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>{displayName}</h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{userEmail}</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} style={{ background: "#e0e7ff", color: "#4f46e5", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
                    Edit Profil
                  </button>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Bagian 2: Keamanan Akun */}
        <Section title="Keamanan & Ganti Password">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "450px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "4px" }}>PASSWORD LAMA</label>
              <PasswordInput value={pwLama} onChange={setPwLama} placeholder="Masukkan password lama" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "4px" }}>PASSWORD BARU</label>
              <PasswordInput value={pwBaru} onChange={setPwBaru} placeholder="Masukkan password baru" />
              <PasswordStrength password={pwBaru} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "4px" }}>KONFIRMASI PASSWORD BARU</label>
              <PasswordInput value={pwKonfirm} onChange={setPwKonfirm} placeholder="Ulangi password baru" />
            </div>
            {pwError && <p style={{ fontSize: "12px", color: "#dc2626", margin: 0, fontWeight: 600 }}>{pwError}</p>}
            <button onClick={handleGantiPassword} disabled={pwLoading || !pwLama || !pwBaru || !pwKonfirm} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", marginTop: "8px" }}>
              {pwLoading ? "Memperbarui..." : "Perbarui Password"}
            </button>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
        © 2026 Curhat TA Polimedia · Solusi Stres Skripsi &amp; Error Coding
      </footer>
    </div>
  );
}