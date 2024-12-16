import { fetchIPFSMetadata } from "@/lib/ipfs";
import { Metadata } from "next";
import SharePageClient from "../[hash]/SharePageClient";

type Props = {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = (await params).hash;

  try {
    const metadata = await fetchIPFSMetadata(hash);

    return {
      title: metadata.title || "Shared IPFS Image",
      description: metadata.description || "Shared content from IPFS",
      openGraph: {
        type: "website",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${hash}`,
        title: metadata.title || "Shared IPFS Image",
        description: metadata.description || "Shared content from IPFS",
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`,
            width: 1200,
            height: 630,
            alt: metadata.title || "Shared Image"
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.title || "Shared IPFS Image",
        description: metadata.description || "Shared content from IPFS",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`]
      },
      other: {
        "og:image": `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`,
        "og:image:type": "image/png",
        "og:image:width": "1200",
        "og:image:height": "630",
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error Loading Image",
      description: "Unable to fetch image metadata",
    };
  }
}

export default async function SharePage({ params }: Props) {
  const hash = (await params).hash;

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