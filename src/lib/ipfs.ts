import axios from 'axios';
// import axios from ""

export async function fetchIPFSMetadata(hash: string) {
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/'
  ];

  for (const baseUrl of gateways) {
    try {
      const url = `${baseUrl}${hash}`;
      console.log('Attempting gateway:', url);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*'
        },
        timeout: 5000,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Default
        }
      });

      return { 
        url: url,
        hash: hash
      };
    } catch (error: any) {
      console.warn(`Failed with gateway ${baseUrl}:`, error.message);
    }
  }

  throw new Error(`IPFS metadata unavailable for hash: ${hash}`);
}