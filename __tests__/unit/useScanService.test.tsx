import React, { useContext, useState } from 'react'
import { render, act, waitFor, screen } from '@testing-library/react'
import { AlertContext } from '../../providers/AlertProvider'

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        bootstrapServiceUrl: 'http://test/bootstrap',
        metadataServiceUrl: 'http://test/metadata',
        serviceUrl: 'http://test/service',
    }
}))

jest.mock('../../hooks/useBootstrap', () => ({
    __esModule: true,
    default: () => ({
        data: { access_token: 'token', token_type: 'Bearer' },
        error: null,
    }),
}))

jest.mock('cookies-next', () => ({
    getCookies: () => 'test-cookie',
}))

jest.mock('swr/immutable', () => ({
    __esModule: true,
    default: () => ({ data: null, error: null }),
}))

let mockSwrReturn = { data: null, error: null }
jest.mock('swr', () => ({
    __esModule: true,
    default: (key, fetcher) => mockSwrReturn,
    mutate: jest.fn(),
}))

import useScanService from '../../hooks/useScanService'
import AlertProvider from '../../providers/AlertProvider'

function ScanConsumer({ url, queries }: { url: string; queries: any }) {
    useScanService(url, queries)
    return null
}

function AlertDisplay() {
    const { alert } = useContext(AlertContext)
    return <div data-testid="alert">{alert?.message || 'none'}</div>
}

describe('useScanService', () => {
    it('preserves alerts set by other components when there is no error', async () => {
        mockSwrReturn = { data: { items: [] }, error: null }

        function SetAlertFirst() {
            const { addMessage } = useContext(AlertContext)
            useState(() => { addMessage('external alert') })
            return null
        }

        await act(async () => {
            render(
                <AlertProvider>
                    <SetAlertFirst />
                    <ScanConsumer url="http://test/metadata/article/search" queries={{ q: 'test' }} />
                    <AlertDisplay />
                </AlertProvider>
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId('alert').textContent).toBe('external alert')
        })
    })
})
