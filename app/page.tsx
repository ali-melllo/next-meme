'use client'

import { FlickeringGrid } from "@/components/ui/flickeringGrid"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatedBeamMultipleOutputDemo } from "@/components/animated-beam-tree";
import LetterPullup from "@/components/ui/letter-pullup";
import { RainbowButton } from "@/components/ui/rainbow-button";


export default function Page() {

  const [mounted, setMounted] = useState<boolean>(false);

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
        className="z-0 absolute top-0 inset-0 "
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={1000}
        width={2000}
      />
      {connected ?
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
        <div className="flex items-center mt-5 flex-col">
          <LetterPullup className="z-20 text-2xl text-[#512da8] font-extrabold" words={"Use AI to put Your Trade On"} delay={0.02} />
          <LetterPullup className="z-20 text-base lg:text-xl font-bold" words={"Reference From Any dex at same Time"} delay={0.02} />
          <AnimatedBeamMultipleOutputDemo className="bg-transparent lg:shadow-none mt-10" />
          <div className="px-5 w-full flex justify-center">
            <RainbowButton className="z-20 h-14 rounded-2xl font-bold text-xl pt-1 mt-10 w-full md:w-6/12">
              Subscribe & Start Trading
            </RainbowButton>
          </div>

        </div>
      }
    </section>
  )
}
