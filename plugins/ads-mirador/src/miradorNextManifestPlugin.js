import { setNextCanvas, setPreviousCanvas, updateWindow } from 'mirador/dist/es/src/state/actions';
import { getNextCanvasGrouping, getPreviousCanvasGrouping, getCanvasIndex } from 'mirador/dist/es/src/state/selectors'
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import ChevronLeftOutlined from '@material-ui/icons/ChevronLeftOutlined';
import ChevronRightOutlined from '@material-ui/icons/ChevronRightOutlined';
import LibraryBooksOutlined from '@material-ui/icons/LibraryBooksOutlined';
import { Component } from 'react';

class MyPluginComponent extends Component {

    prevCanvas() {
        const { setPreviousCanvas, } = this.props;
        setPreviousCanvas();
    }

    nextCanvas() {
        const { setNextCanvas } = this.props;
        setNextCanvas();
    }

    hasNextCanvas() {
        const { hasNextCanvas } = this.props;
        return hasNextCanvas();
    }

    hasPrevCanvas() {
        const { hasPrevCanvas } = this.props;
        return hasPrevCanvas();
    }

    openCollection() {
        const { getCanvasIndex, pageInCollection, updateWindow, manifestBaseUrl, collectionId, setIsArticle } = this.props;
        if (!manifestBaseUrl || !collectionId) {
            return;
        }

        if (window.history.replaceState) {
            window.history.replaceState({}, null, `/scan/manifest/${collectionId}`);
        }

        setIsArticle(false)
        updateWindow(`${manifestBaseUrl}/${collectionId}/manifest.json`, pageInCollection + getCanvasIndex());
    }



    render() {
        const { isArticle } = this.props;
        return (
            <React.Fragment>
                <MiradorMenuButton onClick={() => this.prevCanvas()} disabled={!this.hasPrevCanvas()} aria-label='Previous page'>
                    <ChevronLeftOutlined />
                </MiradorMenuButton>
                <MiradorMenuButton onClick={() => this.nextCanvas()} disabled={!this.hasNextCanvas()} aria-label='Next page'>
                    <ChevronRightOutlined />
                </MiradorMenuButton>
                {isArticle ? <MiradorMenuButton onClick={() => this.openCollection()} aria-label='Open in collection'>
                    <LibraryBooksOutlined />
                </MiradorMenuButton> : ''}
            </React.Fragment >
        );
    }
}


const miradorNextManifestPlugin = {
    component: MyPluginComponent,
    target: 'ViewerNavigation',
    mode: 'wrap',
    mapDispatchToProps: (dispatch, { windowId }) => ({
        setNextCanvas: () => dispatch(setNextCanvas(windowId)),
        setPreviousCanvas: () => dispatch(setPreviousCanvas(windowId)),
        updateWindow: (manifestUrl, page) => dispatch(updateWindow(windowId, { manifestId: manifestUrl, canvasIndex: page - 1 }))
    }),

    mapStateToProps: (state, { windowId }) => ({
        isArticle: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.isArticle,
        manifestBaseUrl: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.manifestBaseUrl,
        collectionId: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.collectionId,
        pageInCollection: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.pageInCollection,
        hasNextCanvas: () => {
            return !!getNextCanvasGrouping(state, {
                windowId: windowId
            });

        },
        hasPrevCanvas: () => {
            return !!getPreviousCanvasGrouping(state, { windowId: windowId });

        },
        setIsArticle: (isArticle) => {
            state.config.miradorAdsPlugins.isArticle = isArticle;
        },
        getCanvasIndex: () => {
            return getCanvasIndex(state, { windowId: windowId })
        }
    })
}

export default miradorNextManifestPlugin;

