"use client";

import type { NimiqProvider } from "@nimiq/mini-app-sdk";
import { unwrapNimiq } from "@/lib/nimiq-result";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NimiqClient = NimiqProvider;

type WalletState = {
  isConnecting: boolean;
  isReady: boolean;
  errorMessage: string | null;
  accounts: string[];
  address: string | null;
  language: string;
  consensus: boolean | null;
  connect: () => Promise<string | null>;
  signMessage: (message: string) => Promise<{ publicKey: string; signature: string }>;
  sendWithData: (input: {
    recipient: string;
    value: number;
    data: string;
  }) => Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);

let nimiqPromise: Promise<NimiqClient> | null = null;

async function getClient(): Promise<NimiqClient> {
  if (!nimiqPromise) {
    nimiqPromise = (async () => {
      const { init } = await import("@nimiq/mini-app-sdk");
      return await new Promise<NimiqClient>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          reject(new Error("Nimiq Pay is not available in this browser."));
        }, 8000);
        init({ timeout: 8_000 })
          .then((client) => {
            window.clearTimeout(timer);
            resolve(client);
          })
          .catch((error) => {
            window.clearTimeout(timer);
            reject(error);
          });
      });
    })().catch((error) => {
      nimiqPromise = null;
      throw error;
    });
  }
  return nimiqPromise;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const [consensus, setConsensus] = useState<boolean | null>(null);

  useEffect(() => {
    const injected = window.nimiqPay?.language;
    if (injected) setLanguage(injected);

    let cancelled = false;
    (async () => {
      try {
        await getClient();
        const client = await getClient();
        const established = await client.isConsensusEstablished();
        if (!cancelled) {
          setIsReady(true);
          setConsensus(established);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setIsReady(false);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Nimiq Pay is not available in this browser.",
          );
        }
      } finally {
        if (!cancelled) setIsConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    const client = await getClient();
    const listed = unwrapNimiq(await client.listAccounts(), "Could not list accounts.");
    setAccounts(listed);
    return listed[0] ?? null;
  }, []);

  const signMessage = useCallback(async (message: string) => {
    const client = await getClient();
    return unwrapNimiq(await client.sign(message), "Could not sign message.");
  }, []);

  const sendWithData = useCallback(
    async (input: { recipient: string; value: number; data: string }) => {
      const client = await getClient();
      return unwrapNimiq(
        await client.sendBasicTransactionWithData({
          recipient: input.recipient,
          value: input.value,
          data: input.data,
        }),
        "Could not send NIM.",
      );
    },
    [],
  );

  const value = useMemo<WalletState>(
    () => ({
      isConnecting,
      isReady,
      errorMessage,
      accounts,
      address: accounts[0] ?? null,
      language,
      consensus,
      connect,
      signMessage,
      sendWithData,
    }),
    [
      accounts,
      connect,
      errorMessage,
      isConnecting,
      isReady,
      language,
      consensus,
      sendWithData,
      signMessage,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return context;
}

export function isUserRejection(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("reject") ||
    message.includes("denied") ||
    message.includes("cancel") ||
    message.includes("user abort")
  );
}
