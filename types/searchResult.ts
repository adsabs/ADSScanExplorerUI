import ArticleType from "./article"
import CollectionType from "./collection"
import PageType from "./page"

interface SearchResultType  {
    page: number
    pageCount: number
    total: number
    items: ArticleType[] | CollectionType[] | PageType[]
    query: string
}

export default SearchResultType