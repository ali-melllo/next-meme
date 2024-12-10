'use client'

import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "./ui/button"
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { useEffect, useState } from "react"
import { shortenString } from "@/lib/utils"

export function SiteHeader() {

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, [])

  const { publicKey, disconnect } = useWallet();

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">

      <div className="px-5 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            {publicKey ? (
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-[#512da8] text-white rounded-3xl h-[3em] px-5">{shortenString(publicKey.toBase58() , 10)}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#512da8] font-bold">Disconnect and Log out</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will disconnect your wallet and logged out of application.
                        You wont be able to use it's features until logged in.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-[#512da8] rounded-2xl ">Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-[#512da8] rounded-2xl text-white" onClick={disconnect}>Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : !publicKey ? (
              <WalletMultiButton style={{ borderRadius: "30px", fontSize: "0.9em" , height:"3em", textWrap:"nowrap"}}>
                Connect
              </WalletMultiButton>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  )
}
