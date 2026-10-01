import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'
 
export default function AppleIcon() {
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
        }}
      >
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50px',
          border: '14px solid #2563eb',
          display: 'flex',
          position: 'relative',
        }}>
           <div style={{
             position: 'absolute',
             top: '14px',
             left: '43px',
             width: '14px',
             height: '37px',
             background: '#2563eb',
             borderRadius: '7px',
           }}></div>
        </div>
      </div>
    ),
    { ...size }
  )
}
