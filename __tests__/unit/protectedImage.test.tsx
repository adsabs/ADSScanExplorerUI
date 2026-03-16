import React from 'react'
import { render, waitFor } from '@testing-library/react'

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => <img {...props} />,
}))

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        bootstrapServiceUrl: 'http://test/bootstrap',
    }
}))

const mockUseBootstrap = jest.fn()
jest.mock('../../hooks/useBootstrap', () => ({
    __esModule: true,
    default: () => mockUseBootstrap(),
}))

let swrKeys: any[] = []
jest.mock('swr', () => ({
    __esModule: true,
    default: (key, fetcher) => {
        swrKeys.push(key)
        if (key && key[1]) {
            return { data: 'blob:http://test/fake-blob', error: null }
        }
        return { data: undefined, error: null }
    },
}))

jest.mock('swr/immutable', () => ({
    __esModule: true,
    default: () => ({ data: null, error: null }),
}))

import ProtectedImage from '../../components/ProtectedImage/ProtectedImage'

beforeEach(() => {
    global.URL.revokeObjectURL = jest.fn()
})

describe('ProtectedImage', () => {
    beforeEach(() => {
        swrKeys = []
    })

    it('does not fetch when auth token is not available', () => {
        mockUseBootstrap.mockReturnValue({ data: null })

        render(<ProtectedImage src="http://test/image.jpg" width={100} height={100} />)

        const lastKey = swrKeys[swrKeys.length - 1]
        expect(lastKey).toBeNull()
    })

    it('fetches with valid SWR key when auth token is available', () => {
        mockUseBootstrap.mockReturnValue({
            data: { access_token: 'valid-token', token_type: 'Bearer' },
        })

        render(<ProtectedImage src="http://test/image.jpg" width={100} height={100} />)

        const lastKey = swrKeys[swrKeys.length - 1]
        expect(lastKey).toEqual(['http://test/image.jpg', 'valid-token'])
    })

    it('renders image when blob URL is available', () => {
        mockUseBootstrap.mockReturnValue({
            data: { access_token: 'valid-token', token_type: 'Bearer' },
        })

        const { container } = render(<ProtectedImage src="http://test/image.jpg" width={100} height={100} />)

        const img = container.querySelector('img')
        expect(img).toBeTruthy()
        expect(img.getAttribute('src')).toBe('blob:http://test/fake-blob')
    })
})
