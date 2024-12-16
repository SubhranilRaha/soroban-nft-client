import { fetchIPFSMetadata } from "@/lib/ipfs";
import { Metadata } from "next";
import SharePageClient from "./SharePageClient";

type Props = {
  params: { hash: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = params.hash;

  try {
    const metadata = await fetchIPFSMetadata(hash);

    // Ensure all required fields are present
    const title = metadata.title || "Shared IPFS Image";
    const description = metadata.description || "Shared content from IPFS";
    const imageUrl = metadata.url || `https://ipfs.io/ipfs/${hash}`;

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not set");
    }

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
      title: title,
      description: description,
      openGraph: {
        type: "website",
        url: `/share/${hash}`,
        title: title,
        description: description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: [imageUrl]
      },
      other: {
        "og:image": imageUrl,
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:image:type": "image/jpeg", // Adjust based on actual image type
        "og:url": `${process.env.NEXT_PUBLIC_SITE_URL}/share/${hash}`
      }
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
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