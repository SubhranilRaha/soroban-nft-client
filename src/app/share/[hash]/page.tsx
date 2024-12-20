import { fetchIPFSMetadata } from "@/lib/ipfs";
import { Metadata } from "next";
import SharePageClient from "../[hash]/SharePageClient";

type Props = {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const hash = (await params).hash;

//   try {
//     const metadata = await fetchIPFSMetadata(hash);

//     return {
//       title: metadata.title || "Shared IPFS Image",
//       description: metadata.description || "Shared content from IPFS",
//       openGraph: {
//         type: "website",
//         url: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${hash}`,
//         title: metadata.title || "Shared IPFS Image",
//         description: metadata.description || "Shared content from IPFS",
//         images: [
//           {
//             url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`,
//             width: 1200,
//             height: 630,
//             alt: metadata.title || "Shared Image"
//           }
//         ],
//       },
//       twitter: {
//         card: "summary_large_image",
//         title: metadata.title || "Shared IPFS Image",
//         description: metadata.description || "Shared content from IPFS",
//         images: [`${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`]
//       },
//       other: {
//         "og:image": `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`,
//         "og:image:type": "image/png",
//         "og:image:width": "1200",
//         "og:image:height": "630",
//       }
//     };
//   } catch (error) {
//     console.error("Error generating metadata:", error);
//     return {
//       title: "Error Loading Image",
//       description: "Unable to fetch image metadata",
//     };
//   }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const hash = (await params).hash;

//   // IMPORTANT: Add explicit error handling and logging
//   if (!process.env.NEXT_PUBLIC_SITE_URL) {
//     console.error("NEXT_PUBLIC_SITE_URL is not set");
//     throw new Error("Site URL environment variable is missing");
//   }

//   try {
//     const metadata = await fetchIPFSMetadata(hash);

//     return {
//       title: metadata.title || "Shared IPFS Image",
//       description: metadata.description || "Shared content from IPFS",
//       openGraph: {
//         type: "website",
//         url: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${hash}`,
//         title: metadata.title || "Shared IPFS Image",
//         description: metadata.description || "Shared content from IPFS",
//         images: [
//           {
//             url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`,
//             width: 1200,
//             height: 630,
//             alt: metadata.title || "Shared Image"
//           }
//         ],
//       },
//       twitter: {
//         card: "summary_large_image",
//         title: metadata.title || "Shared IPFS Image",
//         description: metadata.description || "Shared content from IPFS",
//         images: [`${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`]
//       },
//     };
//   } catch (error) {
//     console.error("Metadata generation error:", error);
//     return {
//       title: "Error Loading Image",
//       description: "Unable to fetch image metadata",
//       openGraph: {
//         type: "website",
//         title: "Error Loading Image",
//         description: "Unable to fetch image metadata",
//         images: [
//           {
//             url: `${process.env.NEXT_PUBLIC_SITE_URL}/fallback-image.png`,
//             width: 1200,
//             height: 630,
//           }
//         ]
//       }
//     };
//   }
// }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = (await params).hash;

  try {
    const metadata = await fetchIPFSMetadata(hash);

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
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
      twitter: {
        card: "summary_large_image",
        title: metadata.title || "Shared IPFS Image",
        description: metadata.description || "Shared content from IPFS",
        images: [`/api/og?title=${encodeURIComponent(metadata.title || "Shared IPFS Image")}`]
      },
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
  const hash = (await params).hash;

  try {
    const metadata = await fetchIPFSMetadata(hash);

    return (
      <>
      <meta property="twitter:image" content="https://ipfs.io/ipfs/QmT42oqooiJB6R7atwpVw2L9mYDrEA7s645DRtY5q6s1ZY"></meta>
      <meta property="og:url" content="https://ipfs.io/ipfs/QmT42oqooiJB6R7atwpVw2L9mYDrEA7s645DRtY5q6s1ZY"></meta>
      <SharePageClient
        hash={hash}
        imageUrl={metadata.url || `https://ipfs.io/ipfs/${hash}`}
        title={metadata.title}
        description={metadata.description}
        />
        </>
    );
  } catch (error) {
    console.error("Error loading image:", error);
    return <div>Error loading image</div>;
  }
}