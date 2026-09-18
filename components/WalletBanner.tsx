"use client";

import { useWallet } from "@/components/WalletProvider";
import { useEffect, useState } from "react";

export function WalletBanner() {
  const wallet = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const frame = "border-b border-hairline bg-highlight px-5 py-3 text-[13px] leading-5";

  if (!mounted || wallet.isConnecting) {
    return <p className={`${frame} text-mute`}>Looking for Nimiq Pay…</p>;
  }

  if (!wallet.isReady) {
    return (
      <div className={`${frame} text-ink`}>
        <p>Open this app inside Nimiq Pay to send NIM. Roster and history still work here.</p>
        {wallet.errorMessage ? <p className="mt-1 text-mute">{wallet.errorMessage}</p> : null}
      </div>
    );
  }

  if (!wallet.address) {
    return (
      <p className={`${frame} text-mute`}>
        Wallet ready{wallet.consensus === null ? "" : wallet.consensus ? " · consensus" : " · waiting for consensus"}.
        Connect when you add people or send.
      </p>
    );
  }

  return (
    <p className={`${frame} break-all font-mono text-[12px] text-mute`}>
      {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
    </p>
  );
}
