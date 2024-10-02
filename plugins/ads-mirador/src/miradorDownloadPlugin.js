import React, { Component } from "react";
import PropTypes from "prop-types";
import DownloadIcon from "@material-ui/icons/VerticalAlignBottomSharp";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import { addError } from "mirador/dist/es/src/state/actions";
import { getManifestTitle } from "mirador/dist/es/src/state/selectors";

const downloadDialogReducer = (state = {}, action) => {
  if (action.type === "OPEN_WINDOW_DIALOG") {
    return {
      ...state,
      [action.windowId]: {
        openDialog: action.dialogType,
      },
    };
  }

  if (action.type === "CLOSE_WINDOW_DIALOG") {
    return {
      ...state,
      [action.windowId]: {
        openDialog: null,
      },
    };
  }
  return state;
};

const mapDispatchToProps = (dispatch, { windowId }) => ({
  openDownloadDialog: () =>
    dispatch({ type: "OPEN_WINDOW_DIALOG", windowId, dialogType: "download" }),
  addError: (error) => dispatch(addError(error)),
});

class MiradorDownload extends Component {
  fetchPDF() {
    const {
      authToken,
      pdfUrl,
      title,
      addError,
      addExternalAlert,
      removeExternalAlert,
    } = this.props;
    const requestOptions = {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    };

    let url = `${pdfUrl}?id=${encodeURIComponent(title)}&dpi=${this.props.defaultDPI}`;

    addExternalAlert(
      "Please wait while your PDF is being generated. Depending on size and number of pages this might take a few minutes."
    );
    fetch(url, requestOptions).then(async (res) => {
      if (!res.ok) {
        addError("Sorry, an error occured while generating the PDF");
      } else {
        const blob = await res.blob();
        var element = document.createElement("a");
        var filename = `${title}.pdf`;

        if (blob) {
          element.setAttribute("href", window.URL.createObjectURL(blob));

          //set file title
          element.setAttribute("download", filename);

          //trigger download
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();

          //remove temporary link element
          document.body.removeChild(element);
        }

        removeExternalAlert();
      }
    });
  }

  openDialogAndCloseMenu() {
    const { handleClose, openDownloadDialog } = this.props;

    openDownloadDialog();
    handleClose();
  }

  render() {
    if (this.props.isArticle) {
      return (
        <React.Fragment>
          <MiradorMenuButton
            onClick={() => this.fetchPDF()}
            aria-label="Download article"
          >
            <DownloadIcon />
          </MiradorMenuButton>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <MiradorMenuButton
          onClick={() => this.openDialogAndCloseMenu()}
          aria-label="Download pages"
        >
          <DownloadIcon />
        </MiradorMenuButton>
      </React.Fragment>
    );
  }
}

MiradorDownload.propTypes = {
  handleClose: PropTypes.func,
  openDownloadDialog: PropTypes.func,
  addError: PropTypes.func,
};

MiradorDownload.defaultProps = {
  handleClose: () => {},
  openDownloadDialog: () => {},
  addError: () => {},
};

const mapStateToProps = (state, { windowId }) => ({
  authToken:
    state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.authToken,
  pdfUrl:
    state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.pdfUrl,
  title: getManifestTitle(state, { windowId }),
  addExternalAlert: (msg) =>
    state.config.miradorAdsPlugins &&
    state.config.miradorAdsPlugins.addExternalAlert(msg),
  removeExternalAlert: () =>
    state.config.miradorAdsPlugins &&
    state.config.miradorAdsPlugins.addExternalAlert(),
  isArticle: state?.config?.miradorAdsPlugins?.isArticle,
  defaultDPI: state?.config?.miradorAdsPlugins?.defaultDPI,
});

export default {
  target: "WindowTopBarPluginArea",
  mode: "add",
  name: "MiradorDownloadPlugin",
  component: MiradorDownload,
  mapDispatchToProps,
  reducers: {
    windowDialogs: downloadDialogReducer,
  },
  mapStateToProps,
};
