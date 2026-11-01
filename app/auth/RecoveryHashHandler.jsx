"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RecoveryHashHandler() {
  const router = useRouter();
  const sudahDiproses = useRef(false);

  useEffect(() => {
    if (sudahDiproses.current) {
      return;
    }

    const hash = window.location.hash;
    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash.slice(1));
    if (params.get("type") !== "recovery") {
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      window.history.replaceState(null, "", "/");
      router.replace("/admin/login?error=Link%20reset%20tidak%20valid%20atau%20sudah%20kedaluwarsa.");
      return;
    }

    sudahDiproses.current = true;
    fetch("/auth/recovery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Sesi recovery tidak valid.");
        }

        window.history.replaceState(null, "", "/admin/password/reset");
        router.replace("/admin/password/reset");
      })
      .catch(() => {
        window.history.replaceState(null, "", "/");
        router.replace("/admin/login?error=Link%20reset%20tidak%20valid%20atau%20sudah%20kedaluwarsa.");
      });
  }, [router]);

  return null;
}
