import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e0e5ec',
          borderRadius: '100px',
        }}
      >
        <div style={{
          width: '300px',
          height: '300px',
          borderRadius: '150px',
          border: '40px solid #2563eb',
          display: 'flex',
          position: 'relative',
        }}>
           <div style={{
             position: 'absolute',
             top: '40px',
             left: '130px',
             width: '40px',
             height: '110px',
             background: '#2563eb',
             borderRadius: '20px',
           }}></div>
           <div style={{
             position: 'absolute',
             top: '110px',
             left: '130px',
             width: '110px',
             height: '40px',
             background: '#2563eb',
             borderRadius: '20px',
             transform: 'rotate(45deg)',
             transformOrigin: 'left center',
           }}></div>
        </div>
      </div>
    ),
    { ...size }
  )
}
