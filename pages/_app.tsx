import '../styles/globals.css'

import type {AppProps, AppContext} from 'next/app'
import App from 'next/app'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Router from 'next/router';
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import AlertProvider from '../providers/AlertProvider'
import VariantProvider, {resolveVariant} from '../providers/VariantProvider'
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

type MyAppProps = AppProps & { variant: "ADS" | "SciX" };

function MyApp({Component, pageProps, variant}: MyAppProps) {
    return (
        <SWRConfig value={{
            ...swrConfig,
            provider: () => new Map(),
        }}>
            <SSRProvider>
                <VariantProvider variant={variant}>
                    <AlertProvider>
                        <Component {...pageProps} />
                    </AlertProvider>
                </VariantProvider>
            </SSRProvider>
        </SWRConfig>
    )
}

// Need entire app to be SSR due to the nature of docker setup
// with runtime configurations that change with the environment.
MyApp.getInitialProps = async (appContext: AppContext) => {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    const host = typeof window === "undefined"
        ? appContext.ctx.req?.headers?.host
        : window.location.hostname;

    return {...appProps, variant: resolveVariant(host)}
}

export default MyApp
