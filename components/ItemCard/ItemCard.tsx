import styles from './ItemCard.module.css'
import ProtectedImage from '../ProtectedImage/ProtectedImage'
import Card from 'react-bootstrap/Card'
import Placeholder from 'react-bootstrap/Placeholder'
import ImageLoader from '../ContentLoader/ImageLoader'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import {useRouter} from 'next/router'

type ItemCardProps = {
    title?: string
    text?: string
    thumbnail?: string
    subtitle?: string
    footer?: string
    showPlaceholder?: boolean
    loadingExtra?: boolean
    href?: string
}

/**
 * Card with generalized content used to display search result (article, collection or page).
 * 
 * Can render a placeholder or a partial placeholder while content loads.
 */
const ItemCard = ({ title, text, thumbnail, subtitle, footer, showPlaceholder = false, loadingExtra = false , href}: ItemCardProps) => {

    const router = useRouter()

    const placeholder = () => {
        return <>
            <Card.Img as={ImageLoader} width={300} height={300} />
            <Card.Body onClick={(e) => {e.stopPropagation()}}>
                <Placeholder as={Card.Title} animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
                <Placeholder as={Card.Text} animation="glow">
                    <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />
                </Placeholder>
            </Card.Body>
        </>
    }


    const partial = () => {
        return <>
            <Card.Img className={styles.thumbnail} variant="top" src={thumbnail} alt="Thumbnail" width={300} height={300} as={ProtectedImage} />
            <Card.Body onClick={(e) => {e.stopPropagation()}}>
                <Placeholder as={Card.Title} animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
                <Card.Subtitle>{subtitle}</Card.Subtitle>
                <Card.Text>{text}</Card.Text>
                <Placeholder as={Card.Footer} animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
            </Card.Body>
        </>
    }

    const card = () => {
        return <>
            <Card.Img className={styles.thumbnail} variant="top" src={thumbnail} alt="Thumbnail" width={300} height={300} as={ProtectedImage} />
            <Card.Body onClick={(e) => {e.stopPropagation()}}>
                <OverlayTrigger placement='auto' overlay={<Tooltip>{title}</Tooltip>}>
                    <Card.Title className='text-truncate'>{title}</Card.Title>
                </OverlayTrigger>
                <Card.Subtitle>{subtitle}</Card.Subtitle>
                <Card.Text>{text}</Card.Text>
                {footer ? (
                    <OverlayTrigger placement='auto' overlay={<Tooltip>{footer}</Tooltip>}>
                        <Card.Footer className='text-truncate'>{footer}</Card.Footer>
                    </OverlayTrigger>) : ''}
            </Card.Body>
        </>
    }

    return (
        <Card className={styles.card} onClick={() => {router.push(href)}}>
            {showPlaceholder ? placeholder() : loadingExtra ? partial() : card()}
        </Card>
    )
}




export default ItemCard