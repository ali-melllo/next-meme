'use client'

import { FlickeringGrid } from "@/components/ui/flickeringGrid"
import Image from "next/image"
import Link from "next/link"


export default function Page() {

  return (
    <section className="flex w-full h-screen overflow-y-hidden relative lg:w-5/12 lg:mx-auto flex-col justify-center">
      <div className="flex flex-col -mt-40 items-center z-20 justify-center gap-1">
        <h1 className="text-2xl font-bold">Select Your Reference</h1>
        <p className="font-semibold text-muted-foreground">{'( Powered By ChatGPT )'}</p>
      </div>
      <div className="flex mt-5 px-5 flex-col items-center w-full gap-y-3">
        <FlickeringGrid
          className="z-0 absolute top-0 inset-0 "
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
          height={1000}
          width={800}
        />
        <Link href={'/pumpFun'} className="w-full z-20 flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2 bg-primary-foreground">
          <p className="text-xl font-bold tabular-nums">
            Pump.fun
          </p>
          <Image
            alt={'Pump fun'}
            src={'/icons/pumpFun.webp'}
            className="ml-5"
            width={30}
            height={30}
          />
        </Link>
        <div className="w-full z-20 bg-primary-foreground flex justify-between items-center p-5 shadow-xl h-20 rounded-xl border-2">
          <p className="text-xl opacity-30 font-bold tabular-nums">
            Dex Screen
          </p>
          <div className={`ml-5 opacity-30 bg-black w-10 h-10 flex justify-center items-center rounded-full`}>
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
            className="ml-5 opacity-30"
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
            className="ml-5 opacity-30"
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
            src={'/icons/solScan.svg'}
            className="ml-5 opacity-30"
            width={90}
            height={90}
          />
        </div>

      </div>
    </section>
  )
}
