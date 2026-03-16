import Image from 'next/image'
import useBootstrap from '../../hooks/useBootstrap'
import ImageLoader from '../ContentLoader/ImageLoader'
import useSWR from 'swr';


interface ProtectedImageProps {
    src: string
    className?: any
    alt?: string
    width: number
    height: number
}

const fetcher = (url, token) => fetch(url, { method: "GET", headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => URL.createObjectURL(blob))


const ProtectedImage = ({ src, className, alt, width, height }: ProtectedImageProps) => {
    const { data: authData } = useBootstrap()
    const token = authData?.access_token
    const { data: image, error } = useSWR(token ? [src, token] : null, fetcher)

    if (!image || error) return <ImageLoader width={width} height={height} />

    return <Image className={className} src={image} alt={alt} width={width} height={height} unoptimized />
}


export default ProtectedImage
