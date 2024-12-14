'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImageShareForm() {
  const [ipfsHash, setIpfsHash] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ipfsHash) {
      router.push(`/share/${ipfsHash}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
      <input 
        type="text" 
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        placeholder="Enter IPFS Hash" 
        className="w-full p-2 border rounded text-black"
      />
      <button 
        type="submit" 
        className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
      >
        Generate Shareable Link
      </button>
    </form>
  );
}