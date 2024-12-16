"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ToastProvider, 
  ToastRoot, 
  ToastTitle, 
  ToastDescription, 
  ToastClose, 
  ToastViewport 
} from "@/components/ui/toast";
import { Copy, Check } from "lucide-react";
import Image from 'next/image';

type SharePageClientProps = {
  hash: string;
  imageUrl: string;
  title?: string;
  description?: string;
};

export default function SharePageClient({ 
  hash, 
  imageUrl, 
  title = 'Shared IPFS Image', 
  description = 'Shared content from IPFS' 
}: SharePageClientProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${hash}` 
    : `${process.env.NEXT_PUBLIC_SITE_URL}/share/${hash}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setIsToastOpen(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL', err);
    }
  };

  return (
    <div className="container mx-auto p-4 relative">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        <Image 
          width={512}
          height={512}
          src={imageUrl} 
          alt={title} 
          className="max-w-full max-h-[600px] object-contain"
        />
        
        <Button 
          onClick={handleCopyUrl}
          className="flex items-center space-x-2"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Share URL
            </>
          )}
        </Button>

        <ToastProvider>
          <ToastRoot 
            open={isToastOpen} 
            onOpenChange={setIsToastOpen}
            duration={2000}
          >
            <div className="flex items-center">
              <ToastTitle>URL Copied!</ToastTitle>
              <ToastClose />
            </div>
            <ToastDescription>{shareUrl}</ToastDescription>
          </ToastRoot>
          <ToastViewport />
        </ToastProvider>
      </div>
    </div>
  );
}