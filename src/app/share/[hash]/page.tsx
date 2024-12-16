import { fetchIPFSMetadata } from "@/lib/ipfs";
import { Metadata } from "next";
import SharePageClient from "../[hash]/SharePageClient";

type Props = {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const hash = (await params).hash

//   try {
//     const metadata = await fetchIPFSMetadata(hash);
//     // const imageUrl = metadata.url || `https://ipfs.io/ipfs/${hash}`;
//     // const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://ipfs.io/ipfs/${hash}`;

//     return {
//       title: metadata.title || 'Shared IPFS Image',
//       description: metadata.description || 'Shared content from IPFS',
//       openGraph: {
//         title: metadata.title || 'Shared IPFS Image',
//         description: metadata.description || 'Shared content from IPFS',
//         images: [
//           // {
//           //   url: imageUrl,
//           //   width: 460,
//           //   height: 300,
//           //   alt: metadata.title || 'Shared Image'
//           // }
//           // "https://ipfs.io/ipfs/QmT42oqooiJB6R7atwpVw2L9mYDrEA7s645DRtY5q6s1ZY"
//           "/justimage.jpg"
//         ],
//         // url: `${siteUrl}/share/${hash}`,
//         // type: 'website'
//       },
//       // twitter: {
//       //   card: 'summary_large_image',
//       //   title: metadata.title || 'Shared IPFS Image',
//       //   description: metadata.description || 'Shared content from IPFS',
//       //   images: [imageUrl]
//       // },
//       // other: {
//       //   'og:title': metadata.title || 'Shared IPFS Image',
//       //   'og:description': metadata.description || 'Shared content from IPFS',
//       //   'og:image': imageUrl,
//       //   'og:url': `${siteUrl}/share/${hash}`,
//       //   'twitter:card': 'summary_large_image',
//       //   'twitter:title': metadata.title || 'Shared IPFS Image',
//       //   'twitter:description': metadata.description || 'Shared content from IPFS',
//       //   'twitter:image': imageUrl
//       // }
//     };
//   } catch (error) {
//     console.error("Error generating metadata:", error);
//     return {
//       title: 'Error Loading Image',
//       description: 'Unable to fetch image metadata'
//     };
//   }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const hash = (await params).hash

//   try {
//     const metadata = await fetchIPFSMetadata(hash);

//     return {
//       title: metadata.title || 'Shared IPFS Image',
//       description: metadata.description || 'Shared content from IPFS',
//       openGraph: {
//         title: metadata.title || 'Shared IPFS Image',
//         description: metadata.description || 'Shared content from IPFS',
//         images: [
//           {
//             url: `/api/og?title=${encodeURIComponent(metadata.title || 'Shared IPFS Image')}`,
//             width: 1200,
//             height: 630,
//           }
//         ],
//       },
//     };
//   } catch (error) {
//     console.error("Error generating metadata:", error);
//     return {
//       title: 'Error Loading Image',
//       description: 'Unable to fetch image metadata'
//     };
//   }
// }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = (await params).hash;

  try {
    const metadata = await fetchIPFSMetadata(hash);

    return {
      title: metadata.title || "Shared IPFS Image",
      description: metadata.description || "Shared content from IPFS",
      openGraph: {
        title: metadata.title || "Shared IPFS Image",
        description: metadata.description || "Shared content from IPFS",
        images: [
          {
            url: "/api/og",
            width: 1200,
            height: 630,
          },
        ],
      },
      other: {
        "og:image":
          "/api/og?title=" +
          encodeURIComponent(metadata.title || "Shared IPFS Image"),
        "og:image:type": "image/png",
        "og:image:width": "1200",
        "og:image:height": "630",
      },
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
