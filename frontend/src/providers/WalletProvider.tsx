import { createContext, useContext, useEffect, useState } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  AlbedoModule,
  FreighterModule,
  RabetModule,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit";
import { useTranslation } from "react-i18next";
import { useNotification } from "./NotificationProvider";

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const { t } = useTranslation();
  const { notify, notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    const newKit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      modules: [
        new AlbedoModule(),
        new FreighterModule(),
        new RabetModule(),
        new xBullModule(),
      ],
    });
    setKit(newKit);
  }, []);

  const connect = async () => {
    if (!kit) return;
    try {
      await kit.openModal({
        modalTitle: t("wallet.modalTitle"),
        onWalletSelected: (option) => {
          void (async () => {
            const { address } = await kit.getAddress();
            setAddress(address);
            notifySuccess("Wallet connected", `${address.slice(0, 6)}...${address.slice(-4)} via ${option.id}`);
          })();
        },
        onClosed: () => console.log("Modal closed"),
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      notifyError("Wallet connection failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const disconnect = () => {
    setAddress(null);
    notify("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};
