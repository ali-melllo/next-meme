'use client'

import { useCallback, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { analyzeAndPredictTokens, finalAnalyze, formatElapsedTime, formatMarketCap, shortenString } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import CopyButton from "@/components/ui/copyButton";
import { AnimatedCircularProgressBar } from "@/components/ui/animatedCircularProgressBar";
import { AnimatedList } from "@/components/ui/animatedList";

export default function Page() {

  const [memeCoins, setMemeCoins] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [startListing, setStartListing] = useState(false);
  const [startPredict, setStartPredict] = useState(false);
  const [predictProgressValue, setPredictProgressValue] = useState<number>(0);

  const [webSockets, setWebSockets] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const socket = new WebSocket("wss://frontend-api-v2.pump.fun/socket.io/?EIO=4&transport=websocket");
    setWebSockets(socket)
    socket.onopen = () => {
      socket.send('40');
      setLoading(false);
      setStartListing(true);
    };

    socket.onmessage = (event) => {
      if (event.data.startsWith("42")) {
        const jsonPart = event.data.substring(2);
        try {
          const parsedData = JSON.parse(jsonPart);
          const newData = parsedData[1];

          setMemeCoins((prevMemeCoins: any) => {
            const updatedCoins = [...prevMemeCoins, newData];
            const uniqueCoins = updatedCoins.reduce((acc, coin) => {
              if (!acc.some((item: any) => item.name === coin.name)) {
                acc.push(coin);
              }
              return acc;
            }, []);
            return uniqueCoins.slice(-100);
          });
          setLoading(false);
        } catch (error) {
          console.error("Failed to parse Socket.IO message:", event.data);
          setLoading(false);
        }
      } else {
        console.log("Unhandled message format:", event.data);
        setLoading(false);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setLoading(false);
      setStartListing(false);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      setStartListing(false);
    };

  }, [])

  const handleGetAllInfo = useCallback(async (address: string) => {
    webSockets.close();
    try {
      const response = await fetch(`https://meowshop-service.liara.run/api/v1/user/getMemeInfo?address=${address}`);
      const data = await response.json();
      return data
    } catch (err) {
      console.error("Error fetching transaction data:", err);
      setLoading(false);
    }
  }, [memeCoins]);

  const handlePredictions = useCallback(async () => {
    webSockets.close();
    setStartPredict(true);
    const result = analyzeAndPredictTokens(memeCoins);
    let arr: any = [];

    try {
      for (let coin of result) {
        const response = await handleGetAllInfo(coin.user); // Ensure we await the async call
        if (response) {
          arr.push({ ...response, ...coin }); // Add the resolved data to the array
          setPredictProgressValue(arr.length);
        }
      }
      const finalResult = await finalAnalyze(arr)
      setMemeCoins(finalResult);
      setStartPredict(false);

    } catch (err) {
      setStartPredict(false);
      console.error("Error in handlePredictions:", err);
    } finally {
      setStartPredict(false);
    }
  }, [memeCoins, webSockets]);


  return (
    <section className="flex w-full lg:w-5/12 lg:mx-auto flex-col justify-center p-5">
      <div className="flex flex-col items-center z-20 justify-center gap-1">
        <h1 className="text-2xl font-bold">Find Your Next Meme</h1>
        <p className="font-semibold text-muted-foreground">{'( Powered By ChatGPT )'}</p>
      </div>

      {<div className="flex z-20 justify-center mt-5 items-center">
        <Button disabled={startListing || loading || startPredict} onClick={handlePredictions} className="w-full text-lg font-semibold h-12">
          {loading ?
            <Loader className="size-5 animate-spin" /> : startListing ?
              <div className="flex items-center gap-x-5"> <Loader className="size-5 animate-spin" />Listing From Pump.fun ... </div> : startPredict ?
                <div className="flex items-center gap-x-5"> <Loader className="size-5 animate-spin" />Processing the Analyze ... </div> : 'Start Analyzing & Prediction'}
        </Button>
      </div>}

      <div className="mt-5 flex w-full flex-col items-center justify-center gap-y-3">
        {loading ?
          [1, 2, 3, 4, 5, , 7, 8, 9].map((item) => (
            <Skeleton key={item} className="w-full h-20 rounded-xl" />
          ))
          : !startPredict ?
            <AnimatedList>

              {memeCoins.map((token: any, index: number) => (
                <div key={token.name} className="flex bg-primary-foreground overflow-hidden relative w-full items-center justify-between rounded-xl border-2 p-3 shadow-2xl">
                  {token.score && <span className="absolute text-primary-foreground font-bold text-center w-14 -left-4 top-1 -rotate-45 h-5 text-sm bg-primary">{index + 1}</span>}
                  <div className="flex w-2/12 items-center justify-center">
                    <Image
                      width={10}
                      height={10}
                      src={token.image_uri}
                      alt={'token'}
                      className="size-14 rounded-full bg-gray-400" />
                  </div>
                  <div className="ml-3 flex w-5/12 flex-col items-start justify-between gap-y-2 overflow-x-visible">
                    <p className="font-semibold">{shortenString(token.name, 10)}</p>
                    <div className="mb-1 flex gap-x-3">
                      {
                        <Link
                          href={token.twitter ? token.twitter : "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icons.twitter className={`size-4 ${token.twitter ? 'opacity-100' : 'opacity-40'}`} />
                        </Link>}
                      {<Link
                        href={token.website ? token.website : "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icons.Globe className={`size-4 ${token.website ? 'opacity-100' : 'opacity-40'}`} />
                      </Link>}
                      {<Link
                        href={token.telegram ? token.telegram : "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icons.Telegram className={`size-4 ${token.telegram ? 'opacity-100' : 'opacity-40'}`} />
                      </Link>}
                    </div>
                  </div>
                  <div className="flex w-6/12 flex-col items-end justify-between gap-y-2 font-semibold">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center justify-end gap-x-2">
                        <CopyButton variant={'outline'} value={token.mint} className="h-6 w-6" />
                        <p className="text-xs text-gray-500">Mint</p>
                      </div>
                      <p className="text-green-500">{formatMarketCap(token.usd_market_cap)}</p>
                    </div>
                    <div className="flex w-full items-center justify-end">
                      <Link className="bg-primary w-6/12 text-center p-1 text-xs rounded-lg text-nowrap text-primary-foreground" href={`https://solscan.io/account/${token.user}`}>
                        Sol Scan
                      </Link>
                      <p className="w-6/12 text-gray-500 text-right">{formatElapsedTime(token.created_timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </AnimatedList> : null
        }

        {startPredict &&
          <AnimatedCircularProgressBar
            className="mt-10"
            max={10}
            min={0}
            value={predictProgressValue}
            gaugePrimaryColor="rgb(79 70 229)"
            gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
          />}
      </div>
    </section>
  )
}
