import { fetchIPFSMetadata } from "@/lib/ipfs";
import { Metadata } from "next";
import SharePageClient from "../[hash]/SharePageClient";

type Props = {
  params: { hash: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = params.hash;

  try {
    console.log("Attempting to fetch metadata for hash:", hash);
    const metadata = await fetchIPFSMetadata(hash);
    console.log("Metadata fetched:", metadata);

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fallback.com'),
      title: metadata.title || "Shared IPFS Image",
      description: metadata.description || "Shared content from IPFS",
      openGraph: {
        type: "website",
        url: `/share/${hash}`,
        title: metadata.title || "Shared IPFS Image",
        description: metadata.description || "Shared content from IPFS",
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`,
            width: 1200,
            height: 630,
            alt: metadata.title || "Shared Image"
          }
        ],
      },
    };
  } catch (error) {
    console.error("CRITICAL Metadata generation error:", error);
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fallback.com'),
      title: "Error Loading Image",
      description: "Unable to fetch image metadata",
      openGraph: {
        type: "website",
        title: "Error Loading Image",
        description: "Unable to fetch image metadata",
        images: [
          {
            url: `/fallback-image.png`,
            width: 1200,
            height: 630,
          }
        ]
      }
    };
  }
}

export default async function SharePage({ params }: Props) {
  const hash = params.hash;

  try {
    console.log("SharePage: Attempting to fetch metadata for hash:", hash);
    const metadata = await fetchIPFSMetadata(hash);
    console.log("SharePage: Metadata fetched:", metadata);

    return (
      <SharePageClient
        hash={hash}
        imageUrl={metadata.url || `https://ipfs.io/ipfs/${hash}`}
        title={metadata.title}
        description={metadata.description}
      />
    );
  } catch (error) {
    console.error("CRITICAL SharePage error:", error);
    return <div>Error loading image: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }
}