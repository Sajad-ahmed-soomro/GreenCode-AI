"use client"

import Image from "next/image";
import GreencodeScannerUI from "../components/GreencodeScanner";
import EnergyAnalyzer from "./energy-analyzer/page";




export default function Home() {
  return (
      
      <div>
        <GreencodeScannerUI/>
        <EnergyAnalyzer/>
        
      </div>
    );
}
