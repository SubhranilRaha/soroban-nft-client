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
import Image from "next/image";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { LedgerModule } from '@creit.tech/stellar-wallets-kit/modules/ledger.module';
import { FileUpload } from "@/components/file-upload";
import axios from "axios";

const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: XBULL_ID,
  modules: allowAllModules(),
  // modules: [
  //   new xBullModule(),
  //   new FreighterModule(),
  //   new AlbedoModule(),
  //   new LedgerModule(),
  // ],
});

export const CONTRACT_ID =
  "CD2KNAY4TNURVKE5GJPGBV6EJTUKNZQTHHWFDFYCTL3TBXDDP7DAWNDN";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";

export default function Home() {

  


  const handleClick = async () => {
    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        // Do something else
        setWalletAddress(address);
      },
    });
  };
  const [walletAddress, setWalletAddress] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageHash, setImageHash] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const isConnected = walletAddress !== "";

  // const estimateTransactionFee = async () => {
    //   if (!walletAddress || !fileData) {
    //     setEstimatedFee(null);
    //     return;
    //   }
  
    //   try {
    //     const server = new SorobanRpc.Server(SOROBAN_URL);
    //     const account = await server.getAccount(walletAddress);
  
    //     const contract = new Contract(CONTRACT_ID);
  
    //     // Convert address to ScVal
    //     const addressScVal = new Address(walletAddress).toScVal();
  
    //     // Estimate fee for uploading file hash to IPFS first
    //     const formData = new FormData();
    //     formData.append("file", fileData);
  
    //     const resFile = await axios({
    //       method: "post",
    //       url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    //       data: formData,
    //       headers: {
    //         pinata_api_key: `227563abeb8fd7e92ea8`,
    //         pinata_secret_api_key: `08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
    //         "Content-Type": "multipart/form-data",
    //       },
    //     });
  
    //     const imageHash = `${resFile.data.IpfsHash}`;
  
    //     // Convert imageHash to ScVal string
    //     const imageHashScVal = xdr.ScVal.scvString(imageHash);
  
    //     // Build transaction to estimate fee
    //     const tx = new TransactionBuilder(account, {
    //       fee: BASE_FEE,
    //       networkPassphrase: NETWORK_PASSPHRASE,
    //     })
    //       .addOperation(contract.call("mint", addressScVal, imageHashScVal))
    //       .setTimeout(30)
    //       .build();
  
    //     const preparedTx = await server.prepareTransaction(tx);
    //     // The fee is typically in stroops (1/10000000 of a token)
    //     const feeInXLM = (parseInt(preparedTx.fee) / 10000000).toFixed(4);
    //     console.log(feeInXLM)
    //     setEstimatedFee(feeInXLM);
  
    //   } catch (error) {
    //     console.error("Fee estimation error:", error);
    //     setEstimatedFee(null);
    //   }
    // };
    

  useEffect(() => {
    
    const estimateTransactionFee = async () => {
      if (!walletAddress || !fileData) {
        setEstimatedFee(null);
        return;
      }
    
      try {
        const server = new SorobanRpc.Server(SOROBAN_URL);
        const account = await server.getAccount(walletAddress);
    
        const contract = new Contract(CONTRACT_ID);
    
        // Convert address to ScVal
        const addressScVal = new Address(walletAddress).toScVal();
    
        // Upload file to IPFS
        const formData = new FormData();
        formData.append("file", fileData);
    
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `227563abeb8fd7e92ea8`,
            pinata_secret_api_key: `08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
            "Content-Type": "multipart/form-data",
          },
        });
    
        const imageHash = `${resFile.data.IpfsHash}`;
    
        // Convert imageHash to ScVal string
        const imageHashScVal = xdr.ScVal.scvString(imageHash);
    
        // Build transaction with explicit fee
        const tx = new TransactionBuilder(account, {
          fee: BASE_FEE.toString(),
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(contract.call("mint", addressScVal, imageHashScVal))
          .setTimeout(30)
          .build();
    
        // Simulate transaction
        const simulateResponse = await server.simulateTransaction(tx);
    
        // Type-safe handling of simulation response
        if ('result' in simulateResponse) {
          // Use minResourceFee instead of resourceFee
          const resourceFee = simulateResponse.minResourceFee ?? '0';
    
          // Convert from stroops to XLM (1 stroop = 0.0000001 XLM)
          const feeInXLM = (parseInt(resourceFee) / 10000000).toFixed(4);
          
          setEstimatedFee(feeInXLM);
        } else if ('error' in simulateResponse) {
          // Handle error case
          console.error("Fee estimation error:", simulateResponse.error);
          setEstimatedFee(null);
        } else {
          // Fallback for unexpected response
          console.error("Unexpected simulation response");
          setEstimatedFee(null);
        }
      } catch (error) {
        console.error("Fee estimation error:", error);
        setEstimatedFee(null);
      }
    };
    estimateTransactionFee()
  }, [walletAddress, fileData]);

//   const estimateTransactionFee = async () => {
//   if (!walletAddress || !fileData) {
//     setEstimatedFee(null);
//     return;
//   }

//   try {
//     const server = new SorobanRpc.Server(SOROBAN_URL);
//     const account = await server.getAccount(walletAddress);

//     const contract = new Contract(CONTRACT_ID);

//     // Convert address to ScVal
//     const addressScVal = new Address(walletAddress).toScVal();

//     // Upload file to IPFS
//     const formData = new FormData();
//     formData.append("file", fileData);

//     const resFile = await axios({
//       method: "post",
//       url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
//       data: formData,
//       headers: {
//         pinata_api_key: `227563abeb8fd7e92ea8`,
//         pinata_secret_api_key: `08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     const imageHash = `${resFile.data.IpfsHash}`;

//     // Convert imageHash to ScVal string
//     const imageHashScVal = xdr.ScVal.scvString(imageHash);

//     // Build transaction
//     const tx = new TransactionBuilder(account, {
//       networkPassphrase: NETWORK_PASSPHRASE,
//     })
//       .addOperation(contract.call("mint", addressScVal, imageHashScVal))
//       .setTimeout(30)
//       .build();

//     // Get the fee estimation
//     const simulateResponse = await server.simulateTransaction(tx);

//     // Type guard to check if it's a successful simulation
//     if ('result' in simulateResponse) {
//       // Extract resource fee from the simulation result
//       const resourceFee = simulateResponse.result.footprint.readOnly.length > 0 
//         ? simulateResponse.result.minResourceFee 
//         : '0';

//       // Convert from stroops to XLM (1 stroop = 0.0000001 XLM)
//       const feeInXLM = (parseInt(resourceFee) / 10000000).toFixed(4);
      
//       setEstimatedFee(feeInXLM);
//     } else {
//       // Handle error case
//       console.error("Fee estimation error:", simulateResponse.error);
//       setEstimatedFee(null);
//     }
//   } catch (error) {
//     console.error("Fee estimation error:", error);
//     setEstimatedFee(null);
//   }
// };

// const estimateTransactionFee = async () => {
//   if (!walletAddress || !fileData) {
//     setEstimatedFee(null);
//     return;
//   }

//   try {
//     const server = new SorobanRpc.Server(SOROBAN_URL);
//     const account = await server.getAccount(walletAddress);

//     const contract = new Contract(CONTRACT_ID);

//     // Convert address to ScVal
//     const addressScVal = new Address(walletAddress).toScVal();

//     // Upload file to IPFS
//     const formData = new FormData();
//     formData.append("file", fileData);

//     const resFile = await axios({
//       method: "post",
//       url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
//       data: formData,
//       headers: {
//         pinata_api_key: `227563abeb8fd7e92ea8`,
//         pinata_secret_api_key: `08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     const imageHash = `${resFile.data.IpfsHash}`;

//     // Convert imageHash to ScVal string
//     const imageHashScVal = xdr.ScVal.scvString(imageHash);

//     // Build transaction with explicit fee
//     const tx = new TransactionBuilder(account, {
//       fee: BASE_FEE.toString(), // Use BASE_FEE explicitly
//       networkPassphrase: NETWORK_PASSPHRASE,
//     })
//       .addOperation(contract.call("mint", addressScVal, imageHashScVal))
//       .setTimeout(30)
//       .build();

//     // Simulate transaction
//     const simulateResponse = await server.simulateTransaction(tx);

//     // Type-safe handling of simulation response
//     if ('result' in simulateResponse) {
//       const result = simulateResponse.result;
      
//       // Safely access minResourceFee
//       const resourceFee = result?.minResourceFee ?? '0';

//       // Convert from stroops to XLM (1 stroop = 0.0000001 XLM)
//       const feeInXLM = (parseInt(resourceFee) / 10000000).toFixed(4);
      
//       setEstimatedFee(feeInXLM);
//     } else if ('error' in simulateResponse) {
//       // Handle error case
//       console.error("Fee estimation error:", simulateResponse.error);
//       setEstimatedFee(null);
//     } else {
//       // Fallback for unexpected response
//       console.error("Unexpected simulation response");
//       setEstimatedFee(null);
//     }
//   } catch (error) {
//     console.error("Fee estimation error:", error);
//     setEstimatedFee(null);
//   }
// };

// const estimateTransactionFee = async () => {
//   if (!walletAddress || !fileData) {
//     setEstimatedFee(null);
//     return;
//   }

//   try {
//     const server = new SorobanRpc.Server(SOROBAN_URL);
//     const account = await server.getAccount(walletAddress);

//     const contract = new Contract(CONTRACT_ID);

//     // Convert address to ScVal
//     const addressScVal = new Address(walletAddress).toScVal();

//     // Upload file to IPFS
//     const formData = new FormData();
//     formData.append("file", fileData);

//     const resFile = await axios({
//       method: "post",
//       url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
//       data: formData,
//       headers: {
//         pinata_api_key: `227563abeb8fd7e92ea8`,
//         pinata_secret_api_key: `08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     const imageHash = `${resFile.data.IpfsHash}`;

//     // Convert imageHash to ScVal string
//     const imageHashScVal = xdr.ScVal.scvString(imageHash);

//     // Build transaction with explicit fee
//     const tx = new TransactionBuilder(account, {
//       fee: BASE_FEE.toString(),
//       networkPassphrase: NETWORK_PASSPHRASE,
//     })
//       .addOperation(contract.call("mint", addressScVal, imageHashScVal))
//       .setTimeout(30)
//       .build();

//     // Simulate transaction
//     const simulateResponse = await server.simulateTransaction(tx);

//     // Type-safe handling of simulation response
//     if ('result' in simulateResponse) {
//       // Extract cost directly from the response
//       const resourceFee = simulateResponse.resourceFee ?? '0';

//       // Convert from stroops to XLM (1 stroop = 0.0000001 XLM)
//       const feeInXLM = (parseInt(resourceFee) / 10000000).toFixed(4);
      
//       setEstimatedFee(feeInXLM);
//     } else if ('error' in simulateResponse) {
//       // Handle error case
//       console.error("Fee estimation error:", simulateResponse.error);
//       setEstimatedFee(null);
//     } else {
//       // Fallback for unexpected response
//       console.error("Unexpected simulation response");
//       setEstimatedFee(null);
//     }
//   } catch (error) {
//     console.error("Fee estimation error:", error);
//     setEstimatedFee(null);
//   }
// };



  console.log("estimatedFee: "+estimatedFee)

  const handleMint = async () => {
    console.log("MINTING START");

    if (!walletAddress) {
      alert("Wallet is not connected!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", fileData);

      const resFile = await axios({
        //code for uploading the file to pinata
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: `
            227563abeb8fd7e92ea8`,
          pinata_secret_api_key: `
            08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
          "Content-Type": "multipart/form-data",
        },
      });

      const ImgHash = `${resFile.data.IpfsHash}`;

      setImageHash(ImgHash);

      const server = new SorobanRpc.Server(SOROBAN_URL);
      const account = await server.getAccount(walletAddress);

      const contract = new Contract(CONTRACT_ID);

      // Convert address to ScVal
      const addressScVal = new Address(walletAddress).toScVal();

      // Convert imageHash to ScVal string
      const imageHashScVal = xdr.ScVal.scvString(imageHash);

      console.log("Minting parameters:", {
        walletAddress,
        imageHash,
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

      const { signedTxXdr } = await kit.signTransaction(
        preparedTx.toEnvelope().toXDR("base64"),
        {
          address: walletAddress,
          networkPassphrase: WalletNetwork.TESTNET,
        }
      );

      console.log( signedTxXdr )

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

          // Uncomment and modify if needed
          const mintedImageHash = scValToNative(returnValue);
          setImageHash(""); // Clear the input
          alert(`Successfully minted image with hash: ${mintedImageHash}`);
        }
      } else {
        // Log more detailed error information
        console.error("Transaction error details:", {
          status: getResponse.status,
          resultXdr: getResponse,
        });

        throw new Error(`Transaction failed: ${getResponse}`);
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error message:", error.message);

      // Add more detailed error logging
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
          >
            {estimatedFee 
            ? `Mint (Estimated Fee: ${estimatedFee} XLM)` 
            : "Preparing Mint..."}
          </button>
      </main>
    </div>
  );
}
