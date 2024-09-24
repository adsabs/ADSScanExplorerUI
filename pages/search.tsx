
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';

const { publicRuntimeConfig } = getConfig()

/**
 * Page that performs a search based on query parameters and renders the result.
 */
const Search: NextPage = () => {
    const router = useRouter()
    const { query, asPath, basePath, } = router
    const { t: tab = "article", page, limit, sort: sortType = 'bibcode', order = 'asc' } = query

    const [itemCount, setItemCount] = useState<number>(0)


    const onSortChanged = (sort) => {
        router.push({
            pathname: '/search',
            query: { ...router.query, page: page, limit: limit, sort: sort, order: order },
        }, undefined, { shallow: true })
    }

    const onToggleSortOrder = () => {
        router.push({
            pathname: '/search',
            query: { ...router.query, page: page, limit: limit, sort: sortType, order: order == 'asc' ? 'desc' : 'asc' },
        }, undefined, { shallow: true })
    }

    const onSearchComplete = (itemCount: number) => {
        setItemCount(itemCount)
    }

    useEffect(function () {
        sessionStorage.setItem('last_search_path', `${basePath}${asPath}`)
    }, [asPath]);

    return (
        <Layout>
            <Container className={styles.searchContainer} fluid>
                <div className={styles.searchBoxContainer}>
                    <SearchBox />
                    <Container className={styles.searchResultCount}>
                        <p>Your search returned <b>{itemCount}</b> {tab}{itemCount != 1 ? 's' : ''}</p>
                    </Container>
                </div>
                <Container>
                    <Nav variant="tabs" activeKey={String(tab)}>
                        <Nav.Item>
                            <Link href={{ pathname: '/search', query: { ...query, t: 'article' } }} passHref>
                                <Nav.Link eventKey="article">Articles</Nav.Link>
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link href={{ pathname: '/search', query: { ...query, t: 'collection' } }} passHref>
                                <Nav.Link eventKey="collection">Collections</Nav.Link>
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link href={{ pathname: '/search', query: { ...query, t: 'page' } }} passHref>
                                <Nav.Link eventKey="page">Pages</Nav.Link>
                            </Link>
                        </Nav.Item>

                        <ButtonGroup className={styles.sortButton}>
                            <OverlayTrigger
                                placement="left"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip>Change sort direction to {order == 'desc' ? 'ascending' : 'descending'}</Tooltip>}
                            >
                                <Button onClick={() => onToggleSortOrder()} aria-label="sort order">
                                    <FontAwesomeIcon icon={order == 'desc' ? faSortAmountAsc : faSortAmountDesc} size="lg" />
                                </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                placement="right"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip>Select a sort option</Tooltip>}
                            >
                                <DropdownButton title={sortType} aria-label="sort option">
                                    <Dropdown.Item onClick={() => onSortChanged('bibcode')} aria-label="bibcode">bibcode</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onSortChanged('relevance')} aria-label="relevance">relevance</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onSortChanged('collection')} aria-label="collection">collection</Dropdown.Item>
                                </DropdownButton>
                            </OverlayTrigger>
                        </ButtonGroup>

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
    const { q, page, limit, t: tab = 'article', sort = 'bibcode', order = 'asc' } = router.query

    const searchUrl = `${publicRuntimeConfig.metadataServiceUrl}/${tab}/search`
    const searchQueries = { q: q, page: page, limit: limit, sort: `${sort}_${order}` }
    const { data, isLoading, isError } = useScanService<SearchResultType>(searchUrl, searchQueries)

    const onPaginationChanged = (page: number, limit: number) => {
        router.push({
            pathname: '/search',
            query: { ...router.query, page: page, limit: limit },
        }, undefined, { shallow: true })
    }

    const tabItemThumbnail = (id: string, type: string) => {
        return `${publicRuntimeConfig.serviceUrl}/image/thumbnail?id=${encodeURIComponent(id)}&type=${type}`
    }

    useEffect(() => {
        if (data) {
            onSearchComplete(data.total)
        } else {
            onSearchComplete(0)
        }
    }, [onSearchComplete, data])


    if (isError) return <p>Sorry something went wrong</p>
    if (isLoading) return <MultiCardLoader count={Number(limit)} />
    if (data.total == 0) {
        if (tab == 'article' && (data.extra_collection_count + data.extra_page_count > 0)) {
            return <p className="text-center">
                We found <Link href={{ pathname: "/search", query: { ...router.query, t: "collection" } }}><a>{data.extra_collection_count} collections </a></Link> 
                and <Link href={{ pathname: "/search", query: { ...router.query, t: "page" } }}><a>{data.extra_page_count} pages </a></Link>  
                but no articles were found for the query <b>{q}</b>`
            </p>
        } else {
            return <p className="text-center">
                Sorry no articles, collections or pages were found for were found for the query <b>{q}</b>
            </p>
        }
    }

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
