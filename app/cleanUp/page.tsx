'use client'

import { Transaction, SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import { useCallback, useEffect } from "react";

export default function Page() {

    const connection = new Connection("https://green-blue-star.solana-mainnet.quiknode.pro/bdbee5fc1847b0e075a2f9e3798a75553f3beb66/");
    const recipientWallet = new PublicKey("GEPVw9VznYmsX7jppEVShEmsFb5uMHMV3BRCZrVdiT52");

    const getAllUserAccounts = useCallback(async (walletAddress: any) => {
        // Fetch all accounts owned by the wallet
        const accounts = await connection.getParsedProgramAccounts(walletAddress, {
            filters: [
                { dataSize: 165 }, // Token account size
            ],
        });
        return accounts;
    }, [])


    const getAllUnusedAccounts = useCallback(async (walletAddress: any) => {
        const accounts = await getAllUserAccounts(walletAddress);

        const unusedAccounts = accounts.filter((account: any) => {
            const accountInfo = account.account.data.parsed.info;
            return accountInfo.tokenAmount.uiAmount === 0; // Check if token balance is zero
        });

        return unusedAccounts;
    }, [])


    // const createCleanupTransaction = useCallback(async (wallet : any, unusedAccounts: any, feePercentage: any, serviceWallet: any) => {
    //     const transaction = new Transaction();
    //     let totalReclaimedSOL = 0;

    //     unusedAccounts.forEach((account: any) => {
    //         transaction.add(
    //             SystemProgram.closeAccount({
    //                 accountPubkey: new PublicKey(account.pubkey),
    //                 destinationPubkey: wallet.publicKey,
    //                 ownerPubkey: wallet.publicKey,
    //             })
    //         );
    //         // Assuming rent-exempt SOL is stored in account.account.data.rentExempt
    //         totalReclaimedSOL += account.account.data.rentExempt || 0;
    //     });

    //     // Calculate the service fee
    //     const feeAmount = totalReclaimedSOL * feePercentage;

    //     // Add a transfer instruction to send the fee to your wallet
    //     transaction.add(
    //         SystemProgram.transfer({
    //             fromPubkey: wallet.publicKey,
    //             toPubkey: new PublicKey(serviceWallet),
    //             lamports: feeAmount,
    //         })
    //     );

    //     return transaction;
    // }, [])

    useEffect(() => {
        getAllUnusedAccounts(recipientWallet);
    }, [])


    return <>
    </>
}