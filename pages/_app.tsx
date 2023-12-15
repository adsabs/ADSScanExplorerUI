import '../styles/globals.css'

import type {AppProps} from 'next/app'
import App from 'next/app'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Router from 'next/router';
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import AlertProvider from '../providers/AlertProvider'
import '../styles/bootstrap.scss'
import {SSRProvider} from 'react-bootstrap';
import {SWRConfig, SWRConfiguration} from 'swr';

config.autoAddCss = false

NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 800,
    showSpinner: false,
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    errorRetryCount: 3,
    shouldRetryOnError: (err) => {
        switch (err.status) {
            case 401:
            case 403:
            case 404:
            case 429:
            case 500:
                return false
            default:
                return true
        }
    }
}

function MyApp({Component, pageProps}: AppProps) {
    return (
        <SWRConfig value={{
            ...swrConfig,
            provider: () => new Map(),
        }}>
            <SSRProvider>
                <AlertProvider>
                    <Component {...pageProps} />
                </AlertProvider>
            </SSRProvider>
        </SWRConfig>
    )
}

// Need entire app to be SSR due to the nature of docker setup
// with runtime configurations that change with the environment.
MyApp.getInitialProps = async (appContext) => {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    return {...appProps}
}

export default MyApp
