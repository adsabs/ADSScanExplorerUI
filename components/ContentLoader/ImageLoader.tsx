import React from "react"
import ContentLoader from 'react-content-loader'

interface ImageLoaderProps {
    width?: number
    height?: number
    className?: string
}

const ImageLoader = ({ width, height, className }: ImageLoaderProps) => (

    <ContentLoader
        className={className}
        speed={2}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
    >
        <rect x="0" y="0" width="100%" height="100%" />
    </ContentLoader>
)


export default ImageLoader

