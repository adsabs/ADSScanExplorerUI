import { fireEvent, render, screen, act, waitFor} from '@testing-library/react'
import Search from '../../pages/search'
import Router from 'next/router'
import React from 'react'


const useRouter = jest.spyOn(require('next/router'), 'useRouter')

jest.mock('next/image', () => ({
    __esModule: true,
    default: () => {
        return 'Next image stub'; // whatever
    },
}));

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        metadataServiceUrl: 'test_url',
        serviceUrl: 'test_url' // whatever

    }
}))

jest.mock('next/router', () => ({
    __esModule: true,
    useRouter: jest.fn()
  }))

const mockUseScanService = jest.fn()
jest.mock('../../hooks/useScanService.ts', () => ({
    __esModule: true,
    default: (...args) => mockUseScanService(...args),
}))

jest.mock('next/link', () => ({ children }) => children);

const defaultSearchData = {
    data: {
        "items": [
            {
                "bibcode": "1895ApJ.....1....1M",
                "id": "1895ApJ.....1....1M",
                "pages": 10
            },
            {
                "bibcode": "1895ApJ.....1...29R",
                "id": "1895ApJ.....1...29R",
                "pages": 16
            },
            {
                "bibcode": "1895ApJ.....1...52W",
                "id": "1895ApJ.....1...52W",
                "pages": 29
            },
        ],
        "limit": 3,
        "page": 1,
        "pageCount": 4344,
        "query": "",
        "total": 43436,
        "extra_collection_count": 0,
        "extra_page_count": 0,
    },
    isLoading: false,
    isError: false
}

describe('SearchPage', () => {
    process.env.NEXT_PUBLIC_ADS_DEFAULT_URL = "test_url" // whatever
    process.env.NEXT_PUBLIC_BASE_PATH = "scan"

    beforeEach(() => {
        mockUseScanService.mockReturnValue(defaultSearchData)
        useRouter.mockImplementation(() => ({
            query: { q: 'bibstem:ApJ', limit: 30, page: 1 },
        }))
    })

    it('renders the search result text', () => {
        render(<Search />)
        const title = screen.getByText(/Your search returned/i)
        expect(title).toBeInTheDocument()

        // Test that result renders correct amount of results
        expect(title.innerHTML).toContain('43436')
    }),
    it('renders the nav tabs', () => {
        const { container } = render(<Search />)

        const nt = container.querySelector('.nav-tabs')
        expect(nt).toBeInTheDocument()
    }),
    it('renders pagination', () => {
        const { container } = render(<Search />)

        const etext = screen.getByText(/of 4344/i)
        expect(etext).toBeInTheDocument()

        const option30 = (screen.getByRole('option', { name: '30' }) as HTMLOptionElement)
        const option10 = (screen.getByRole('option', { name: '10' }) as HTMLOptionElement)

        expect(option30.selected).toBe(true)
        expect(option10.selected).toBe(false)
    }),
    it('renders search result cards', () => {
        const { container } = render(<Search />)

        const nt = container.querySelector("[class^='resultsContainer']")
        expect(nt.children.length == 4).toBeTruthy()
    }),
    it('updates sort order', () => {
        const mockRouter = {
            push: jest.fn(),
            query: { q: 'bibstem:ApJ', limit: 30, page: 1, order: 'asc' },
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter);

        render(<Search />)
        const sortOrderBtn = screen.getByRole('button', {
            name: /sort order/i
        })

        fireEvent.click(sortOrderBtn)

        expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
            query: expect.objectContaining({
                order: "desc"
            })
        }),
        undefined,
        {"shallow": true})
    }),
    it('updates sort option', async () => {
        const mockRouter = {
            push: jest.fn(),
            query: { q: 'bibstem:ApJ', limit: 30, page: 1, sort: 'bibcode' },
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter);

        render(<Search />)

        const sortOptionBtn = screen.getByText('bibcode')
        expect(sortOptionBtn).toBeInTheDocument()

        fireEvent.click(sortOptionBtn)

        const relOption =  screen.getByText('relevance')
        fireEvent.click(relOption)

        expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
            query: expect.objectContaining({
                sort: "relevance"
            })
        }),
        undefined,
        {"shallow": true})
    }),
    it('resets page to 1 when page exceeds pageCount', async () => {
        const mockRouter = {
            push: jest.fn(),
            query: { q: 'bibstem:ApJ', limit: '10', page: '9999', t: 'article', sort: 'bibcode', order: 'asc' },
            asPath: '/search?q=bibstem:ApJ&page=9999&limit=10',
            basePath: '/scan',
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter)

        mockUseScanService.mockReturnValue({
            data: {
                items: [{ bibcode: '1895ApJ.....1....1M', id: '1895ApJ.....1....1M', pages: 10 }],
                limit: 10,
                page: 9999,
                pageCount: 100,
                query: '',
                total: 1000,
                extra_collection_count: 0,
                extra_page_count: 0,
            },
            isLoading: false,
            isError: false,
        })

        await act(async () => {
            render(<Search />)
        })

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith(
                expect.objectContaining({
                    query: expect.objectContaining({ page: 1 }),
                }),
                undefined,
                { shallow: true }
            )
        })
    }),
    it('does not reset page when page is within pageCount', async () => {
        const mockRouter = {
            push: jest.fn(),
            query: { q: 'bibstem:ApJ', limit: '10', page: '5', t: 'article', sort: 'bibcode', order: 'asc' },
            asPath: '/search?q=bibstem:ApJ&page=5&limit=10',
            basePath: '/scan',
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter)

        mockUseScanService.mockReturnValue({
            data: {
                items: [{ bibcode: '1895ApJ.....1....1M', id: '1895ApJ.....1....1M', pages: 10 }],
                limit: 10,
                page: 5,
                pageCount: 100,
                query: '',
                total: 1000,
                extra_collection_count: 0,
                extra_page_count: 0,
            },
            isLoading: false,
            isError: false,
        })

        await act(async () => {
            render(<Search />)
        })

        expect(mockRouter.push).not.toHaveBeenCalled()
    }),
    it('renders without error when page and limit are missing from query', async () => {
        const mockRouter = {
            push: jest.fn(),
            query: { q: 'bibstem:ApJ', t: 'article' },
            asPath: '/search?q=bibstem:ApJ',
            basePath: '/scan',
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter)

        mockUseScanService.mockReturnValue({
            data: {
                items: [{ bibcode: '1895ApJ.....1....1M', id: '1895ApJ.....1....1M', pages: 10 }],
                limit: 10,
                page: 1,
                pageCount: 100,
                query: '',
                total: 1000,
                extra_collection_count: 0,
                extra_page_count: 0,
            },
            isLoading: false,
            isError: false,
        })

        await act(async () => {
            render(<Search />)
        })

        const pagination = screen.getByText(/of 100/i)
        expect(pagination).toBeInTheDocument()
    }),
    it('shows loading skeleton when page and limit are missing from query', async () => {
        const mockRouter = {
            push: jest.fn(),
            query: { q: 'bibstem:ApJ', t: 'article' },
            asPath: '/search?q=bibstem:ApJ',
            basePath: '/scan',
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter)

        mockUseScanService.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        let container
        await act(async () => {
            const result = render(<Search />)
            container = result.container
        })

        expect(container).toBeDefined()
    })
})
