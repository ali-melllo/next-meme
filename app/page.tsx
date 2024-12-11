'use client'

import { FlickeringGrid } from "@/components/ui/flickeringGrid"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react";
import { AnimatedBeamMultipleOutputDemo } from "@/components/animated-beam-tree";
import LetterPullup from "@/components/ui/letter-pullup";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { toast, useToast } from "@/hooks/use-toast";
import { ArrowRightIcon, Loader } from "lucide-react";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";

const notifications = [
  {
    title: "Chose Your preferred Dex to Get reference from like Dex Tools & Pump fun & DEX Screener & Raydium & Sol Scan. ",
  },
  {
    title: "Helper to calculate the frequency of transfers and volatility and transfers data in a given reference",
  },
  {
    title: "Advanced trend detection: consider a token's momentum over multiple factors & Sorted by score descending",
  },
  {
    title: "Track the maximum balance change , Analyze functions with enhanced metrics by AI",
  }
]


export default function Page() {

  const { toast } = useToast();

  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registered, setRegistered] = useState<boolean>(false);


  const handlePayment = useCallback(async (userWallet: PublicKey, amountUSD: number) => {
    try {
      // Fetch the current SOL price
      const solPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await solPriceResponse.json();
      const solPrice = data.solana.usd; // Get SOL price in USD

      // Calculate the required SOL amount
      const solAmount = amountUSD / solPrice;

      // Connect to the Solana cluster (use a custom RPC if needed)
      const connection = new Connection("https://green-blue-star.solana-mainnet.quiknode.pro/bdbee5fc1847b0e075a2f9e3798a75553f3beb66/");

      // Define the recipient wallet
      const recipientWallet = new PublicKey("GEPVw9VznYmsX7jppEVShEmsFb5uMHMV3BRCZrVdiT52");

      // Create the transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userWallet,
          toPubkey: recipientWallet,
          lamports: Math.ceil(solAmount * 1e9), // Convert SOL to lamports
        })
      );

      // Fetch the recent blockhash
      const { blockhash } = await connection.getLatestBlockhash("confirmed");

      // Set the transaction's recent blockhash and fee payer
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userWallet;

      // Request the wallet to sign and send the transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Confirm the transaction
      const confirmation = await connection.confirmTransaction(signature, "confirmed");

      if (confirmation.value.err) {
        toast({ title: `Transaction failed: ${confirmation.value.err}` });

      } else {
        toast({ title: `Transaction successful: ${signature}` });
        return signature;
      }
    } catch (error) {
      toast({ title: `Payment error: ${error}` });
      throw error;
    }
  }, []);


  const handleSubscriptionPayment = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if Phantom is installed
      if (!window.solana?.isPhantom) {
        toast({ title: "Please install Phantom Wallet to proceed." });
        return;
      }

      // Connect wallet
      const response = await window.solana.connect();
      if (!response) {
        return toast({ title: "Failed To Fetch sol amount" });
      }
      const userWallet = response.publicKey;

      // Process payment
      const amountUSD = 9.99; // Fixed subscription price
      const transactionSignature = await handlePayment(userWallet, amountUSD);

      toast({ title: `Payment successful! Transaction: ${transactionSignature}` });
    } catch (error) {
      toast({ title: "Payment failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }, [])

  useEffect(() => {
    setMounted(true);
  }, [])

  const { connected } = useWallet();

  if (!mounted) {
    return null
  }

  return (
    <section className="flex w-full h-screen overflow-hidden relative lg:w-5/12 lg:mx-auto flex-col ">
      <FlickeringGrid
        className="z-0 absolute top-0 inset-0"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={1000}
        width={800}
      />
      {(connected && registered) ?
        <>
          <div className="flex flex-col mt-5 items-center z-20 justify-center gap-1">
            <h1 className="text-2xl font-bold">Select Your Reference</h1>
          </div>
          <div className="flex mt-5 px-5 flex-col items-center w-full gap-y-3">

            <Link href={'/pumpFun'} className="w-full z-20 flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2 bg-primary-foreground">
              <p className="text-xl font-bold tabular-nums">
                Pump.fun
              </p>
              <Image
                alt={'Pump fun'}
                src={'/icons/pumpFun.webp'}
                className=""
                width={30}
                height={30}
              />
            </Link>
            <div className="w-full z-20 bg-primary-foreground flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2">
              <p className="text-xl opacity-30 font-bold tabular-nums">
                Dex Screen
              </p>
              <div className={` opacity-30 bg-black w-10 h-10 flex justify-center items-center rounded-full`}>
                <Image
                  alt={'Pump fun'}
                  src={'/icons/dexScreener.svg'}
                  width={25}
                  height={25}
                />
              </div>
            </div>

            <div className="w-full z-20 bg-primary-foreground flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2">
              <p className="text-xl opacity-30 font-bold tabular-nums">
                Raydium
              </p>
              <Image
                alt={'Pump fun'}
                src={'/icons/raydium.svg'}
                className=" opacity-30"
                width={40}
                height={40}
              />
            </div>

            <div className="w-full z-20 bg-primary-foreground flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2">
              <p className="text-xl opacity-30 font-bold tabular-nums">
                Dex Tools
              </p>
              <Image
                alt={'Pump fun'}
                src={'/icons/dexTools.png'}
                className=" opacity-30"
                width={40}
                height={40}
              />
            </div>

            <div className="w-full  z-20 bg-primary-foreground flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2">
              <p className="text-xl opacity-30 font-bold tabular-nums">
                Sol Scan
              </p>
              <Image
                alt={'Pump fun'}
                src={'/icons/solScan.png'}
                className=" opacity-30"
                width={40}
                height={40}
              />
            </div>
          </div>
        </> :
        <div className="flex items-center mt-3 flex-col">
          <LetterPullup className="z-20 text-2xl text-[#512da8] font-extrabold" words={"Use AI to put Your Trade On"} delay={0.02} />
          <LetterPullup className="z-20 text-base lg:text-xl font-bold" words={"Reference From Any dex at same Time"} delay={0.02} />
          <AnimatedBeamMultipleOutputDemo className="bg-transparent lg:shadow-none mt-10" />
          <div className="px-5 w-full flex justify-center">
            <Drawer>
              <DrawerTrigger asChild>
                <RainbowButton className="z-20 h-14 rounded-2xl font-bold text-xl pt-1 mt-10 w-full md:w-6/12">
                  Subscribe & Start Trading
                </RainbowButton>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <div>
                    <Card className="w-[380px] border-none">
                      <CardHeader>
                        <CardTitle className="font-bold">$ 9,99 / 1 Month Subscription</CardTitle>
                        <CardDescription>Unlock All features for your trades for a month</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div >
                          {notifications.map((notification, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                              <div>
                                <p className="text-sm font-medium leading-none">
                                  {notification.title}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                  <DrawerFooter>
                    <Button onClick={handleSubscriptionPayment} className="bg-[#512da8] text-white h-14 mb-3 rounded-2xl font-bold text-xl">
                      {isLoading ?
                        <Loader className="h-10 w-10 animate-spin" />
                        :
                        '$ Purchase'
                      }

                    </Button>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <Button variant={"outline"} className="mt-3 rounded-3xl z-20">
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1   transition ease-out ">
              <span>✨ Know More About us</span>
              <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </Button>


        </div>
      }

    </section>
  )
}
