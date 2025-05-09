"use client"
import CollectionCarousel from "@/components/CollectionCarousel";
import HeroSection from "@/components/HeroSection";
import { useState } from "react";
import NFTPanel from "./NFTPanel";

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  console.log("Selected Categories: ", selectedCategories);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-[1240px] w-full relative z-10 mx-auto">
        <HeroSection />
        {/* <div className="mt-12" /> */}
        {/* <ExplorePanel /> */}
        <div className="mt-[50px]" />
        <CollectionCarousel
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
        <NFTPanel />        
      </div>
    </main>
  );
}
