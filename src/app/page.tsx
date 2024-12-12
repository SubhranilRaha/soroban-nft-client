"use client";

import { useState, useEffect } from "react";
import {
  Address,
  BASE_FEE,
  Contract,
  Networks,
  scValToNative,
  SorobanRpc,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
import * as StellarSdk from 'stellar-sdk';
import Image from "next/image";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
  ISupportedWallet,
  FREIGHTER_ID,
  FreighterModule
} from "@creit.tech/stellar-wallets-kit";
import { LedgerModule } from '@creit.tech/stellar-wallets-kit/modules/ledger.module';
import { FileUpload } from "@/components/file-upload";
import axios from "axios";

const horizonServer = new StellarSdk.Horizon.Server('https://horizon.stellar.org');

const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export const CONTRACT_ID =
  "CCWGOA3N4TQLAAAFQKCQGNAQGB5ML7I67OREIFKWZXCSSU7KQKHEZBUL";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageHash, setImageHash] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const isConnected = walletAddress !== "";

  // Wallet Connection Handler
  const handleClick = async () => {
    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        setWalletAddress(address);
      },
    });
  };

  // Transaction Fee Estimation Effect
  useEffect(() => {
    const estimateTransactionFee = async () => {
      try {
        // Fetch fee statistics from Horizon server
        const feeStats = await horizonServer.feeStats();
        
        // Choose a fee strategy (using mode/most common fee)
        const baseFeeInStroops = feeStats.fee_charged.mode;
        
        // Convert stroops to XLM (1 XLM = 10,000,000 stroops)
        const feeInXLM = (Number(baseFeeInStroops) / 10_000_000).toFixed(4);
        
        setEstimatedFee(feeInXLM);
        
        console.log('Fee Statistics:', {
          baseFee: baseFeeInStroops + ' stroops',
          feeInXLM: feeInXLM + ' XLM',
          minFee: feeStats.fee_charged.min,
          maxFee: feeStats.fee_charged.max,
          p90Fee: feeStats.fee_charged.p90
        });
        
      } catch (error) {
        console.error("Network fee estimation error:", error);
        setEstimatedFee(null);
      }
    };
  
    // Only run fee estimation if wallet is connected
    if (walletAddress) {
      estimateTransactionFee();
    }
  }, [walletAddress]);

  // Minting Handler
  const handleMint = async () => {
    console.log("Minting started");

    if (!walletAddress) {
      alert("Wallet is not connected!");
      return;
    }

    try {
      setLoading(true);

      // For testing, using a hardcoded IPFS hash
      const ImgHash = "QmegTodafnzZdPUanZ2RqnqYF3hoPmGETW8CHNc9SczSCx";
      setImageHash(ImgHash);
      console.log("ImgHash: " + ImgHash);

      const server = new SorobanRpc.Server(SOROBAN_URL);
      const account = await server.getAccount(walletAddress);

      const contract = new Contract(CONTRACT_ID);

      // Convert address to ScVal
      const addressScVal = new Address(walletAddress).toScVal();

      // Convert imageHash to ScVal string
      const imageHashScVal = xdr.ScVal.scvString(ImgHash);

      console.log("Minting parameters:", {
        walletAddress,
        imageHash: ImgHash,
        addressScVal: addressScVal.toString(),
        imageHashScVal: imageHashScVal.toString(),
      });

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("mint", addressScVal, imageHashScVal))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);

      const feeInXLM = (Number(preparedTx._tx._attributes.fee) / 10000000).toFixed(4);
      console.log("Transaction Fee:", feeInXLM);

      const { signedTxXdr } = await kit.signTransaction(
        preparedTx.toEnvelope().toXDR("base64"),
        {
          address: walletAddress,
          networkPassphrase: WalletNetwork.TESTNET,
        }
      );

      const parsedTransaction = TransactionBuilder.fromXDR(
        signedTxXdr,
        Networks.TESTNET
      );

      const txResult = await server.sendTransaction(parsedTransaction);

      if (!txResult || txResult.status !== "PENDING") {
        throw new Error(
          `Transaction failed with status: ${txResult?.status || "Unknown"}`
        );
      }

      console.log("Transaction sent successfully:", txResult.hash);

      const hash = txResult.hash;
      let getResponse = await server.getTransaction(hash);
      let retryCount = 0;
      const maxRetries = 30;

      while (getResponse.status === "NOT_FOUND" && retryCount < maxRetries) {
        console.log(
          `Waiting for transaction confirmation... Attempt ${retryCount + 1}`
        );
        getResponse = await server.getTransaction(hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retryCount++;
      }

      if (retryCount >= maxRetries) {
        throw new Error("Transaction confirmation timed out");
      }

      if (getResponse.status === "SUCCESS") {
        if (!getResponse.resultMetaXdr) {
          throw new Error("Empty resultMetaXDR in getTransaction response");
        }
        const returnValue = getResponse.resultMetaXdr
          .v3()
          .sorobanMeta()
          ?.returnValue();

        if (returnValue) {
          console.log("Return value:", returnValue);

          const mintedImageHash = scValToNative(returnValue);
          setImageHash(""); // Clear the input
          alert(`Successfully minted image with hash: ${mintedImageHash}`);
        }
      } else {
        console.error("Transaction error details:", {
          status: getResponse.status,
          resultXdr: getResponse,
        });

        throw new Error(`Transaction failed: ${getResponse}`);
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error message:", error.message);

      if (error.response) {
        console.error("Response error:", error.response);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="flex flex-col gap-4">
          <p className="text-4xl text-center font-bold">Soroban NFT</p>
          {walletAddress === "" ? null : (
            <p className="text-center text-xs">Connected to: {walletAddress}</p>
          )}
        </div>
        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            onClick={handleClick}
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            {isConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </div>
        <div className="mt-8">
          <FileUpload fileData={fileData} setFileData={setFileData} />
        </div>
        <button
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          onClick={handleMint}
          disabled={!isConnected || loading}
        >
          {estimatedFee 
            ? `Mint (Estimated Fee: ${estimatedFee} XLM)` 
            : "Preparing Mint..."}
        </button>
      </main>
    </div>
  );
}