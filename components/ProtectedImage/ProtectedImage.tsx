import Image from 'next/image'
import useSWR from 'swr'
import useBootstrap from '../../hooks/useBootstrap'


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
    const { data: image, error } = useSWR([src, authData.access_token], fetcher)

    return <Image className={className} src={image} alt={alt} width={width} height={height} unoptimized />
}


export default ProtectedImage