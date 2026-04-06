"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

export default function BlogTag({ tag, slug }) {
  const handleClick = () => {
    // 1. Manually trigger the event your SearchBox is listening for
    window.dispatchEvent(new CustomEvent("setSearchTag", { detail: tag }));
    
    // 2. Ensure the hash is set (this triggers your hashchange listener)
    window.location.hash = 'search';
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs bg-blue-600/50 border font-bold border-blue-600 text-blue-700 mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 hover:text-white transition-colors"
    >
      <Tag className="w-3 h-3" />
      {tag}
    </button>
  );
}