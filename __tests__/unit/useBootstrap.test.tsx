import React from 'react'
import { render, act } from '@testing-library/react'

const mockMutate = jest.fn()

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        bootstrapServiceUrl: 'http://test/bootstrap',
    }
}))

jest.mock('swr/immutable', () => ({
    __esModule: true,
    default: () => ({
        data: {
            access_token: 'expired-token',
            token_type: 'Bearer',
            expires_at: '2020-01-01T00:00:00',
        },
        error: null,
    }),
}))

jest.mock('swr', () => ({
    __esModule: true,
    mutate: (...args) => mockMutate(...args),
}))

jest.mock('cookies-next', () => ({
    getCookies: () => 'test-cookie',
}))

import useBootstrap from '../../hooks/useBootstrap'

function TestComponent({ onRender }: { onRender: () => void }) {
    onRender()
    const result = useBootstrap()
    return <div data-testid="token">{result.data?.access_token}</div>
}

describe('useBootstrap', () => {
    beforeEach(() => {
        mockMutate.mockClear()
    })

    it('revalidates expired token without causing excessive renders', () => {
        let renderCount = 0
        const onRender = () => { renderCount++ }

        act(() => {
            render(<TestComponent onRender={onRender} />)
        })

        expect(mockMutate).toHaveBeenCalledTimes(1)
        expect(renderCount).toBeLessThanOrEqual(3)
    })
})
