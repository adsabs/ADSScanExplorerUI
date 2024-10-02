import React, { Component } from "react";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {
  getCanvasLabel,
  getVisibleCanvases,
  selectInfoResponse,
} from "mirador/dist/es/src/state/selectors/canvases";
import { addError } from "mirador/dist/es/src/state/actions";
import { getManifestTitle } from "mirador/dist/es/src/state/selectors";
import { getWindowViewType } from "mirador/dist/es/src/state/selectors/windows";
import { getManifestoInstance } from "mirador/dist/es/src/state/selectors/manifests";
import { getContainerId } from "mirador/dist/es/src/state/selectors/config";
import ScrollIndicatedDialogContent from "mirador/dist/es/src/containers/ScrollIndicatedDialogContent";
import { getCanvasGroupings } from "mirador/dist/es/src/state/selectors";

/**
 * MiradorDownloadDialog ~
 */
export class MiradorDownloadDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usePageRange: this.props.isPage,
      startPage: this.props.isPage ? this.props.page : 1,
      endPage: this.props.isPage ? this.props.page : 1,
    };
  }

  fetchPDF(usePageRange) {
    const {
      authToken,
      pdfUrl,
      title,
      addError,
      closeDialog,
      addExternalAlert,
      removeExternalAlert,
    } = this.props;
    const requestOptions = {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    };

    let url = `${pdfUrl}?id=${encodeURIComponent(title)}&dpi=${this.state.defaultDPI}`;
    if (usePageRange) {
      url += `&page_start=${this.state.startPage}&page_end=${this.state.endPage}`;
    }

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

    closeDialog();
  }

  validateForm(e) {
    e.preventDefault();

    const { totalPages } = this.props;

    let error = "";
    if (this.state.usePageRange) {
      if (this.state.startPage > this.state.endPage) {
        error =
          "The final page number must be greater or equal that of the start page.";
      } else if (this.state.startPage < 1) {
        error = "Start page must be greater than 0.";
      } else if (this.state.endPage - this.state.startPage > 100) {
        error =
          "Sorry, downloading more than 100 pages at a time is not allowed.";
      }
    } else {
      if (totalPages > 100) {
        error =
          "Sorry, downloading more than 100 pages at a time is not allowed.";
      }
    }

    if (error == "") {
      this.fetchPDF(this.state.usePageRange);
    } else {
      this.setState({ formError: true, errorText: error });
    }
  }

  /**
   * Returns the rendered component
   */
  render() {
    const { closeDialog, containerId, open } = this.props;

    if (!open) return "";

    return (
      <React.Fragment>
        <Dialog
          container={document.querySelector(`#${containerId} .mirador-viewer`)}
          disableEnforceFocus
          onClose={closeDialog}
          open={open}
          scroll="paper"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>
            <Typography variant="h2">Download Pages</Typography>
          </DialogTitle>
          <ScrollIndicatedDialogContent>
            <FormControl>
              <form
                id={"download-pages-form"}
                onSubmit={(e) => this.validateForm(e)}
              >
                <h5 style={{ color: "#5D5D5D" }}>Pages</h5>
                <>
                  <RadioGroup
                    row
                    aria-labelledby="row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={this.state.usePageRange}
                    onChange={(event) => {
                      this.setState({
                        usePageRange: event.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value={false}
                      control={<Radio />}
                      label="All"
                    />
                    <FormControlLabel
                      value={true}
                      control={<Radio />}
                      label="Range"
                    />
                  </RadioGroup>

                  <TextField
                    required
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    id="outlined-required"
                    label="Page start"
                    defaultValue={this.state.startPage}
                    style={{ width: "80%" }}
                    disabled={!this.state.usePageRange}
                    error={this.state.formError}
                    onChange={(e) =>
                      this.setState({ startPage: e.target.value })
                    }
                  />

                  <TextField
                    required
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    id="outlined-disabled"
                    label="Page end"
                    defaultValue={this.state.endPage}
                    style={{ width: "80%" }}
                    disabled={!this.state.usePageRange}
                    onChange={(e) => this.setState({ endPage: e.target.value })}
                    error={this.state.formError}
                    helperText={this.state.errorText}
                  />
                </>
              </form>
            </FormControl>
          </ScrollIndicatedDialogContent>
          <DialogActions>
            <Button color="primary" type="submit" form="download-pages-form">
              Download
            </Button>
            <Button onClick={closeDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

MiradorDownloadDialog.propTypes = {
  canvasLabel: PropTypes.func.isRequired,
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number })
  ),
  classes: PropTypes.shape({
    h2: PropTypes.string,
    h3: PropTypes.string,
  }).isRequired,
  closeDialog: PropTypes.func.isRequired,
  containerId: PropTypes.string.isRequired,
  infoResponse: PropTypes.func.isRequired,
  manifest: PropTypes.shape({
    getSequences: PropTypes.func,
  }),
  open: PropTypes.bool,
  restrictDownloadOnSizeDefinition: PropTypes.bool,
  viewType: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
  pageInCollection: PropTypes.number.isRequired,
};
MiradorDownloadDialog.defaultProps = {
  canvases: [],
  manifest: {},
  open: false,
  restrictDownloadOnSizeDefinition: false,
};

const mapDispatchToProps = (dispatch, { windowId }) => ({
  closeDialog: () => dispatch({ type: "CLOSE_WINDOW_DIALOG", windowId }),
  addError: (error) => dispatch(addError(error)),
});

const mapStateToProps = (state, { windowId }) => ({
  canvases: getVisibleCanvases(state, { windowId }),
  canvasLabel: (canvasId) => getCanvasLabel(state, { canvasId, windowId }),
  containerId: getContainerId(state),
  infoResponse: (canvasId) =>
    selectInfoResponse(state, { windowId, canvasId }) || {},
  manifest: getManifestoInstance(state, { windowId }),
  authToken:
    state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.authToken,
  pdfUrl:
    state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.pdfUrl,
  id: state.config.miradorAdsPlugins && state.config.miradorAdsPlugins.id,
  open:
    state &&
    state.windowDialogs &&
    state.windowDialogs[windowId] &&
    state.windowDialogs[windowId].openDialog === "download",
  viewType: getWindowViewType(state, { windowId }),
  title: getManifestTitle(state, { windowId }),
  addExternalAlert: (msg) =>
    state.config.miradorAdsPlugins &&
    state.config.miradorAdsPlugins.addExternalAlert(msg),
  removeExternalAlert: () =>
    state.config.miradorAdsPlugins &&
    state.config.miradorAdsPlugins.addExternalAlert(),
  totalPages: getCanvasGroupings(state, { windowId }).length,
  isPage: state?.config?.miradorAdsPlugins?.isPage,
  page: state?.config?.miradorAdsPlugins?.page,
});

export default {
  target: "Window",
  mode: "add",
  name: "MiradorDownloadDialog",
  component: MiradorDownloadDialog,
  mapDispatchToProps,
  mapStateToProps,
};
