"use client";

import { FileUpload } from "@/components/file-upload";
import {
  allowAllModules,
  FREIGHTER_ID,
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import Image from "next/image";
import { useEffect, useState } from "react";
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

const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export const CONTRACT_ID =
  "CB6KXLA5O36CRPHB3YE2AENKM5WSJIIPSZLYGSUW3RW3NILFKDLY4625";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageHash, setImageHash] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const isConnected = walletAddress !== "";

  // async function calculateMintFunctionCost(
  //   walletAddress: string,
  //   imageHash: string
  // ): Promise<string | null> {
  //   if (!walletAddress) {
  //     console.error("Wallet address is required");
  //     return null;
  //   }

  //   try {
  //     const server = new SorobanRpc.Server(SOROBAN_URL);
  //     const account = await server.getAccount(walletAddress);

  //     const contract = new Contract(CONTRACT_ID);

  //     // Convert address to ScVal
  //     const addressScVal = new Address(walletAddress).toScVal();

  //     // Convert imageHash to ScVal string
  //     const imageHashScVal = xdr.ScVal.scvString(imageHash);

  //     const tx = new TransactionBuilder(account, {
  //       fee: BASE_FEE,
  //       networkPassphrase: NETWORK_PASSPHRASE,
  //     })
  //       .addOperation(contract.call("mint", addressScVal, imageHashScVal))
  //       .setTimeout(30)
  //       .build();

  //     // Simulate the transaction to get a more accurate fee estimation
  //     const simulateResponse = await server.simulateTransaction(tx);
  //     console.log("Simulation Response:", simulateResponse);

  //     let estimatedFee: string;

  //     // Check if simulateResponse contains resource fee information
  //     if (simulateResponse && simulateResponse.minResourceFee) {
  //       // Convert resource fee from stroops to XLM
  //       const minResourceFeeInXLM = Number(simulateResponse.minResourceFee) / 10_000_000;

  //       // Convert base fee from stroops to XLM
  //       const baseFeeInXLM = Number(BASE_FEE) / 10_000_000;

  //       // Total estimated fee
  //       estimatedFee = (minResourceFeeInXLM + baseFeeInXLM).toFixed(4);
  //     } else {
  //       // Fallback to base fee if no detailed simulation is available
  //       estimatedFee = (Number(BASE_FEE) / 10_000_000).toFixed(4);
  //     }

  //     return estimatedFee;
  //   } catch (error) {
  //     console.error("Mint function cost calculation error:", error);
  //     return null;
  //   }
  // }

  // Wallet Connection Handler

  // async function calculateMintFunctionCost(
  //   owner: string,
  //   tokenUri: string,
  //   isFreeMintsAvailable: boolean = true
  // ): Promise<numb | null> {
  //   // Soroban-specific constants
  // const STROOP = 0.0000001;  // Stellar's smallest unit
  // const BASE_FEE = 0.00001;  // Base transaction fee
  // const BASE_RESERVE = 0.5;  // Account base reserve

  // // Estimate operation complexity
  // let operationCount = 0;
  // let storageOperations = 0;

  // // Authentication check
  // operationCount++;

  // // Minting frozen check
  // operationCount++;

  // // Token count retrieval
  // storageOperations++;
  // operationCount++;

  // // Maximum token limit check
  // operationCount++;

  // // Token count increment
  // storageOperations++;
  // operationCount++;

  // // Collection info retrieval
  // storageOperations++;
  // operationCount++;

  // // Paid minting logic (if applicable)
  // if (!isFreeMintsAvailable) {
  //   // Balance check
  //   operationCount++;
    
  //   // Token transfer
  //   operationCount++;
  // }

  // // Token info creation and storage
  // storageOperations += 2;
  // operationCount++;

  // // Tokens count update
  // storageOperations++;
  // operationCount++;

  // // Max token ID update
  // storageOperations++;
  // operationCount++;

  // // Event emission
  // operationCount++;

  // // Cost calculation
  // const operationFee = operationCount * BASE_FEE;
  // const storageOperationFee = storageOperations * (BASE_FEE * 2);  // Storage ops typically cost more

  // // Additional costs for complex operations
  // const complexOperationMultiplier = 1.5;

  // // Estimated transaction cost
  // const estimatedCost = {
  //   operationCount,
  //   storageOperations,
  //   baseFee: operationFee,
  //   storageFee: storageOperationFee,
  //   complexOperationAdjustment: complexOperationMultiplier,
  //   totalEstimatedCost: (operationFee + storageOperationFee) * complexOperationMultiplier,
    
  //   // Detailed breakdown for transparency
  //   breakdown: {
  //     baseOperationFee: operationFee,
  //     storageOperationFee: storageOperationFee,
  //     complexOperationMultiplier: complexOperationMultiplier
  //   }
  // }

  // console.log('Mint Function Cost Estimation:', {
  //   owner,
  //   tokenUri,
  //   isFreeMintsAvailable,
  //   totalEstimatedCost: estimatedCost.totalEstimatedCost.toFixed(6) + ' XLM',
  //   operationCount: estimatedCost.operationCount,
  //   storageOperations: estimatedCost.storageOperations
  // });

  // return estimatedCost.totalEstimatedCost;
  // }

  async function calculateMintFunctionCost(
    walletAddress: string,
    imageHash: string
  ): Promise<number> {
    // Constants
    const BASE_RESERVE = 0.5;
    const BASE_FEE = 0.00001;
    const MINT_COST = 1; // 1 XLM
  
    const baseReserveCount = 2 + (imageHash ? 1 : 0);
    const operationsCount = 4 + (imageHash ? 1 : 0);
  
    const reserveCost = baseReserveCount * BASE_RESERVE;
    const feeCost = operationsCount * BASE_FEE;
    
    const isPaidMinting = true;
  
    const totalCost = reserveCost + feeCost + (isPaidMinting ? MINT_COST : 0);
    console.log(totalCost)
    return totalCost;
  }




  const handleClick = async () => {
    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        setWalletAddress(address);
      },
    });
  };

  useEffect(() => {
    const estimateFee = async () => {
      if (!walletAddress) {
        return;
      }

      try {
        setLoading(true);
        const ImgHash = "QmegTodafnzZdPUanZ2RqnqYF3hoPmGETW8CHNc9SczXCx";

        // Use the calculateMintFunctionCost function
        const estimatedFee = await calculateMintFunctionCost(
          walletAddress,
          ImgHash
        );

        setEstimatedFee(estimatedFee);
      } catch (error) {
        console.error("Fee estimation error:", error);
        setEstimatedFee(null);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      estimateFee();
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

        console.log("tx:"+JSON.stringify(tx))

      const preparedTx = await server.prepareTransaction(tx);
      console.log("px:"+JSON.stringify(preparedTx))
      const feeInXLM = (
        Number(preparedTx._tx._attributes.fee) / 10000000
      ).toFixed(4);
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
