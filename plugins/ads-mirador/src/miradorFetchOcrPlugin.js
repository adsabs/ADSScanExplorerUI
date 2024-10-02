import React, { Component } from 'react';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LibraryBooksOutlined from '@material-ui/icons/LibraryBooksOutlined';
import MenuItem from '@material-ui/core/MenuItem';
import { getCanvasIndex, getManifestTitle } from 'mirador/dist/es/src/state/selectors'
import { addError } from 'mirador/dist/es/src/state/actions'

class MiradorFetchOcr extends Component {

  fetchOCR() {
    const { authToken, ocrUrl, title, getCanvasIndex, addError } = this.props;

    const requestOptions = {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` },
    }

    let page = getCanvasIndex() + 1
    let url = `${ocrUrl}?id=${encodeURIComponent(title)}&page_number=${page}`

    fetch(url, requestOptions)
      .then(res => {
        if (!res.ok) {
          addError('Sorry, an error occured while generating the OCR file')
        } else {
          res.blob().then((blob) => {
            var element = document.createElement('a')
            var filename = `${title}_ocr.txt`

            if (blob) {
              element.setAttribute('href', window.URL.createObjectURL(blob));

              //set file title
              element.setAttribute('download', filename);

              //trigger download
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();

              //remove temporary link element
              document.body.removeChild(element);
          }
          })
        }
      })
  }


  render() {
    return (
      <React.Fragment>
        <MenuItem onClick={() => this.fetchOCR()}>
          <ListItemIcon>
            <LibraryBooksOutlined />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body1' }}>
            Download OCR
          </ListItemText>
        </MenuItem>
      </React.Fragment>
    );
  }
}



export default {
  target: 'WindowTopBarPluginMenu',
  mode: 'add',
  name: 'MiradorFetchOcrPlugin',
  component: MiradorFetchOcr,
  mapStateToProps: (state, { windowId }) => ({
    isArticle: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.isArticle,
    ocrUrl: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.ocrUrl,
    collectionId: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.collectionId,
    pageInCollection: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.pageInCollection,
    getCanvasIndex: () => {
      return getCanvasIndex(state, { windowId: windowId })
    },
    title: getManifestTitle(state, { windowId }),
    authToken: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.authToken
  }),
  mapDispatchToProps: (dispatch, { windowId }) => ({
    addError: (error) => dispatch(addError(error)),
  }),
};