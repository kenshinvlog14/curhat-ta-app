import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

function buildUserData(session, profil) {
  const meta = session.user.user_metadata || {};
  const emailUser = session.user.email;

  // Tentukan foto_url khusus: Hanya jika emailnya rizagurih14@gmail.com, pakai foto Riza Gurih. 
  // Akun lain (seperti teman atau Bu Ama) akan mengambil dari profil/meta, atau null jika tidak ada.
  const defaultSpecialFoto = emailUser === "rizagurih14@gmail.com" 
    ? "https://isdygerttewvdncvpanm.supabase.co/storage/v1/object/public/avatars/Riza%20Gurih.jpeg" 
    : null;

  return {
    id: session.user.id,
    email: emailUser,
    nama: profil?.nama ?? meta.nama ?? emailUser.split("@")[0],
    name: profil?.nama ?? meta.nama ?? emailUser.split("@")[0],
    role: profil?.role ?? meta.role ?? "mahasiswa",
    konselorId: profil?.konselor_id ?? meta.konselor_id ?? null,
    student_id: profil?.student_id ?? meta.student_id ?? null,
    // Gunakan foto khusus untuk akun utama, atau ambil dari database profil/meta untuk akun lain
    foto_url: profil?.foto_url ?? meta.foto_url ?? defaultSpecialFoto,
  };
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sanctuary_user")); }
    catch { return null; }
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function syncUser(session) {
      if (!active) return;

      if (!session) {
        localStorage.removeItem("sanctuary_user");
        setUser(null);
        setIsReady(true);
        return;
      }

      try {
        // Ambil data langsung berdasarkan ID user yang sedang aktif login agar dijamin akurat
        const { data: profil, error } = await supabase
          .from("profil_pengguna")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.warn("useAuth: Gagal ambil profil_pengguna:", error.message);
        }

        const userData = buildUserData(session, profil);
        
        // Debugging di console browser untuk memastikan foto_url terbaca
        console.log("SYNC USER BERHASIL:", userData);

        localStorage.setItem("sanctuary_user", JSON.stringify(userData));
        setUser(userData);
      } catch (err) {
        console.error("useAuth syncUser error:", err);
        const cachedFallback = JSON.parse(localStorage.getItem("sanctuary_user") || "null");
        if (cachedFallback?.email === session.user.email) {
          setUser(cachedFallback);
        } else {
          const emailUser = session.user.email;
          const fallbackSpecialFoto = emailUser === "rizagurih14@gmail.com" 
            ? "https://isdygerttewvdncvpanm.supabase.co/storage/v1/object/public/avatars/Riza%20Gurih.jpeg" 
            : null;

          setUser({
            id: session.user.id,
            email: emailUser,
            role: "mahasiswa",
            foto_url: session.user.user_metadata?.foto_url ?? fallbackSpecialFoto,
          });
        }
      } finally {
        if (active) setIsReady(true);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => syncUser(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    localStorage.removeItem("sanctuary_user");
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return { user, isReady, logout };
}