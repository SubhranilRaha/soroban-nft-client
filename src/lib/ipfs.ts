import axios, { AxiosError, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';

interface IPFSMetadataResult {
  url: string;
  hash: string;
  title?: string;
  description?: string;
}

export async function fetchIPFSMetadata(hash: string): Promise<IPFSMetadataResult> {
  const gateways = [
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

      // Try to extract metadata from HTML content
      const $ = cheerio.load(response.data);
      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || 'Shared IPFS Image';
      const description = $('meta[name="description"]').attr('content') || 
                          $('meta[property="og:description"]').attr('content') || 
                          'Shared content from IPFS';

      return {
        url: url,
        hash: hash,
        title: title,
        description: description
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