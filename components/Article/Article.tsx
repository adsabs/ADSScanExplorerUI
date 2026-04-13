import useScanService from '../../hooks/useScanService'
import ArticleType from '../../types/article'
import ItemCard from '../ItemCard/ItemCard'
import getConfig from 'next/config'
import ArticleExtraType from '../../types/articleExtra'

type ArticleProps = {
    article: ArticleType
    thumbnail: string
    textQuery: string
}

const { publicRuntimeConfig } = getConfig()

/**
 * Article component used to visualize an article search result 
 */
const Article = ({ article, thumbnail, textQuery }: ArticleProps) => {
    const extraUrl = `${publicRuntimeConfig.metadataServiceUrl}/article/extra/${article.bibcode}`
    const { data, isLoading } = useScanService<ArticleExtraType>(extraUrl, {}, { ignore404: true })

    let query = '?art=true'
    query += textQuery ? `&full=${textQuery}` : ''
    const href = `/manifest/${article.id}${query}`

    const ArticleCard = () => {
        if (isLoading) {
            return <ItemCard subtitle={article.bibcode} text={`${article.pages} pages`} thumbnail={thumbnail} loadingExtra={true} href={href}/>
        }
        const title = data?.title?.toString() || article.bibcode
        const subtitle = data?.title ? article.bibcode : undefined
        const footer = data?.author?.toString()
        return <ItemCard title={title} subtitle={subtitle} text={`${article.pages} pages`} footer={footer} thumbnail={thumbnail} href={href}/>
    }



    return (
        <ArticleCard />
    )
}

export default Article