import { Metadata } from "next";
import { fetchIPFSMetadata } from "@/lib/ipfs";
import SharePageClient from "../[hash]/SharePageClient";

type Props = {
  params: Promise<{hash: string}>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = (await params).hash
  
  try {
    const metadata = await fetchIPFSMetadata(hash);
    const imageUrl = metadata.url || `https://ipfs.io/ipfs/${hash}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://ipfs.io/ipfs/${hash}`;

    return {
      title: metadata.title || 'Shared IPFS Image',
      description: metadata.description || 'Shared content from IPFS',
      openGraph: {
        title: metadata.title || 'Shared IPFS Image',
        description: metadata.description || 'Shared content from IPFS',
        images: [
          {
            url: imageUrl,
            width: 460,
            height: 300,
            alt: metadata.title || 'Shared Image'
          }
        ],
        url: `${siteUrl}/share/${hash}`,
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.title || 'Shared IPFS Image',
        description: metadata.description || 'Shared content from IPFS',
        images: [imageUrl]
      },
      other: {
        'og:title': metadata.title || 'Shared IPFS Image',
        'og:description': metadata.description || 'Shared content from IPFS',
        'og:image': imageUrl,
        'og:url': `${siteUrl}/share/${hash}`,
        'twitter:card': 'summary_large_image',
        'twitter:title': metadata.title || 'Shared IPFS Image',
        'twitter:description': metadata.description || 'Shared content from IPFS',
        'twitter:image': imageUrl
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Error Loading Image',
      description: 'Unable to fetch image metadata'
    };
  }
}

export default async function SharePage({ params }: Props) {
  const hash = (await params).hash
  
  try {
    const metadata = await fetchIPFSMetadata(hash);

    return (
      <SharePageClient 
        hash={hash} 
        imageUrl={metadata.url || `https://ipfs.io/ipfs/${hash}`} 
        title={metadata.title}
        description={metadata.description}
      />
    );
  } catch (error) {
    console.error("Error loading image:", error);
    return <div>Error loading image</div>;
  }
}