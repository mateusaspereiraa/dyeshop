import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { ReactElement } from 'react'
import '../styles/globals.css'
import Layout from '../components/Layout'

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session?: Session | null }>): ReactElement {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
