import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

function buildUserData(session, profil) {
  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    email: session.user.email,
    nama: profil?.nama ?? meta.nama ?? session.user.email.split("@")[0],
    name: profil?.nama ?? meta.nama ?? session.user.email.split("@")[0],
    role: profil?.role ?? meta.role ?? "mahasiswa",
    konselorId: profil?.konselor_id ?? meta.konselor_id ?? null,
    student_id: profil?.student_id ?? meta.student_id ?? null,
    // Paksa langsung gunakan link Supabase Storage kamu di sini agar dijamin muncul!
    foto_url: profil?.foto_url ?? meta.foto_url ?? "https://isdygerttewvdncvpanm.supabase.co/storage/v1/object/public/avatars/Riza%20Gurih.jpeg",
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
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: "mahasiswa",
            foto_url: session.user.user_metadata?.foto_url ?? null,
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