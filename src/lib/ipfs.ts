import axios, { AxiosError, AxiosResponse } from 'axios';

interface IPFSMetadataResult {
  url: string;
  hash: string;
  title?: string;
  description?: string;
}

export async function fetchIPFSMetadata(hash: string): Promise<IPFSMetadataResult> {
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/'
  ];

  for (const baseUrl of gateways) {
    try {
      const url = `${baseUrl}${hash}`;
      console.log('Attempting gateway:', url);

      const response: AxiosResponse = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*'
        },
        timeout: 5000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });

      console.log(response);
      return {
        url: url,
        hash: hash,
        title: 'Shared IPFS Image', // Default title
        description: 'Shared content from IPFS' // Default description
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.warn(`Failed with gateway ${baseUrl}:`, error.message);
      } else {
        console.warn(`Unexpected error with gateway ${baseUrl}:`, error);
      }
    }
  }

  throw new Error(`IPFS metadata unavailable for hash: ${hash}`);
}