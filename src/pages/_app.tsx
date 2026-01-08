import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import '../styles/globals.css'
import Layout from '../components/Layout'

export default function MyApp({
  Component,
  pageProps
}: AppProps<{ session?: Session | null }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
