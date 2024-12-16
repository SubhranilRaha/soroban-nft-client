import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
 
export default function Image({ params }: { params: { id: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: 'white',
          backgroundSize: '150px 150px',
          height: '100%',
          width: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          fontWeight: 700,
          fontSize: 60,
          color: 'black',
          padding: '20px',
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          IPFS Share
        </div>
        
        <div 
          style={{
            fontSize: 40,
            color: 'gray',
            textAlign: 'center',
            maxWidth: '80%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {decodeURIComponent(params.id || 'Shared IPFS Image')}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}