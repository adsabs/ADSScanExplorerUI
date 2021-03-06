
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import Article from '../components/Article/Article'
import Collection from '../components/Collection/Collection'
import styles from '../styles/Search.module.css'
import Layout from '../components/Layout/Layout'
import Pagination from '../components/Pagination/Pagination'
import SearchBox from '../components/SearchBox/SearchBox';
import Page from '../components/Page/Page';
import useScanService from '../hooks/useScanService';
import SearchResultType from '../types/searchResult';
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import getConfig from 'next/config'
import Link from 'next/link';
import MultiCardLoader from '../components/ContentLoader/MultiCardLoader';

const { publicRuntimeConfig } = getConfig()

/**
 * Page that performs a search based on query parameters and renders the result.
 */    
const Search: NextPage = () => {
    const router = useRouter()
    const { t: tab = "article" } = router.query

    const [itemCount, setItemCount] = useState<number>(0)

    const onSearchComplete = (itemCount: number) => {
        setItemCount(itemCount)
    }

    return (
        <Layout>
            <Container className={styles.searchContainer} fluid>
                <div className={styles.searchBoxContainer}>
                    <SearchBox />
                    <Container className={styles.searchResultCount}>
                        <p>Your search returned <b>{itemCount}</b> results</p>
                    </Container>
                </div>
                <Container>
                    <Nav variant="tabs" activeKey={String(tab)}>
                        <Nav.Item>
                            <Link href={{ pathname: '/search', query: { ...router.query, t: 'article' } }} passHref>
                                <Nav.Link eventKey="article">Articles</Nav.Link>
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link href={{ pathname: '/search', query: { ...router.query, t: 'collection' } }} passHref>
                                <Nav.Link eventKey="collection">Collections</Nav.Link>
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link href={{ pathname: '/search', query: { ...router.query, t: 'page' } }} passHref>
                                <Nav.Link eventKey="page">Pages</Nav.Link>
                            </Link>
                        </Nav.Item>
                    </Nav>
                    <div className={styles.resultsContainer}>
                        <SearchResultTab onSearchComplete={onSearchComplete} />
                    </div>
                </Container>
            </Container>
        </Layout>
    )

}

interface TabProps {
    onSearchComplete(total: number)
}

const SearchResultTab = ({ onSearchComplete }: TabProps) => {
    const router = useRouter()
    const { q, page, limit, t: tab = 'article' } = router.query

    const searchUrl = `${publicRuntimeConfig.metadataServiceUrl}/${tab}/search`
    const searchQueries = { q: q, page: page, limit: limit }
    const { data, isLoading, isError } = useScanService<SearchResultType>(searchUrl, searchQueries)

    const onPaginationChanged = (page: number, limit: number) => {
        router.push({
            pathname: '/search',
            query: { ...router.query, page: page, limit: limit },
        }, undefined, { shallow: true })
    }

    const tabItemThumbnail = (id: string, type: string) => {
        return `${publicRuntimeConfig.serviceUrl}/image/thumbnail?id=${id}&type=${type}`
    }

    useEffect(() => {
        if (data) {
            onSearchComplete(data.total)
        }
    }, [onSearchComplete, data])


    if (isError) return <p>Sorry something went wrong</p>
    if (isLoading) return <MultiCardLoader count={Number(limit)} />
    if (data.total == 0) return <p>Sorry no results were found for <b>{q}</b></p>
    if (data.pageCount < Number(page)) onPaginationChanged(1, Number(limit))



    return (
        <>
            {data.items.map((item, i) => {
                if (tab == "article") {
                    return <Article key={i} article={item} thumbnail={tabItemThumbnail(item.id, 'article')} textQuery={data.query} />
                } else if (tab == "collection") {
                    return <Collection key={i} thumbnail={tabItemThumbnail(item.id, 'collection')} collection={item} textQuery={data.query} />
                } else if (tab == "page") {
                    return <Page key={i} thumbnail={tabItemThumbnail(item.id, 'page')} page={item} textQuery={data.query} />
                }
            })}
            < Pagination page={Number(page)} limit={Number(limit)} pageCount={data.pageCount} onPaginationChanged={onPaginationChanged} />
        </>
    )
}



export default Search
