// Import global styles and fonts
import './globals.css'
import { Inter } from 'next/font/google'

    
const inter = Inter({ subsets: ['latin'] })
 

export default function GlobalNotFound() {
  return (
      <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  )
}