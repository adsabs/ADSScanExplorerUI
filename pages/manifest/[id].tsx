import type { NextPage } from "next";
import Layout from "../../components/Layout/Layout";
import getConfig from "next/config";
import styles from "../../styles/Manifest.module.css";
import Mirador from "../../components/Mirador/Mirador";
import useBootstrap from "../../hooks/useBootstrap";
import Container from "react-bootstrap/Container";
import useScanService from "../../hooks/useScanService";
import CollectionType from "../../types/collection";
import useAlert from "../../hooks/useAlert";

const { publicRuntimeConfig } = getConfig();

interface ManifestProps {
  id: string;
  page: number;
  textQuery: string;
  isArticle: boolean;
  isPage: boolean;
}

/**
 * Page that visualizes the IIIF manifest using the Mirador component.
 */
const Manifest: NextPage<ManifestProps> = ({
  id,
  page,
  textQuery,
  isArticle = false,
  isPage = false,
}: ManifestProps) => {
  const { data: authData } = useBootstrap();
  const { data, isLoading, isError } = useScanService<CollectionType>(
    isArticle
      ? `${publicRuntimeConfig.metadataServiceUrl}/article/${id}/collection`
      : "",
    {}
  );
  const { addMessage, removeAlert } = useAlert();

  if (!authData || !authData.access_token) {
    return (
      <Layout>
        <></>
      </Layout>
    );
  }

  const config = {
    id: "ads_mirador_viewer",
    windows: [
      {
        imageToolsEnabled: true,
        allowClose: false,
        allowFullscreen: true,
        allowMaximize: false,
        allowTopMenuButton: true,
        loadedManifest: `${publicRuntimeConfig.manifestServiceUrl}/${id}/manifest.json`,
        canvasIndex: page - 1,
        defaultSearchQuery: textQuery,
        draggingEnabled: false,
        sideBarPanel: "search",
        views: [{ key: "single" }, { key: "book" }],
      },
    ],
    requests: {
      preprocessors: [
        (url, options) =>
          url.match(publicRuntimeConfig.serviceUrl) && {
            ...options,
            headers: {
              Authorization: `${authData?.token_type} ${authData?.access_token}`,
            },
          },
      ],
    },
    osdConfig: {
      alwaysBlend: false,
      blendTime: 0.1,
      preserveImageSizeOnResize: true,
      preserveViewport: true,
      showNavigationControl: false,
      loadTilesWithAjax: true,
      ajaxHeaders: {
        Authorization: "Bearer " + authData?.access_token,
      },
    },
    thumbnailNavigation: {
      displaySettings: false,
    },
    workspace: {
      showZoomControls: true,
    },
    workspaceControlPanel: {
      enabled: false,
    },
    miradorAdsPlugins: {
      id: id,
      isArticle: isArticle,
      isPage: isPage,
      page: page,
      collectionId: data ? data.id : id,
      pageInCollection: data ? data.selected_page : 0,
      authToken: authData.access_token,
      manifestBaseUrl: `${publicRuntimeConfig.manifestServiceUrl}`,
      pdfUrl: `${publicRuntimeConfig.serviceUrl}/image/pdf`,
      ocrUrl: `${publicRuntimeConfig.metadataServiceUrl}/page/ocr`,
      addExternalAlert: (msg) => addMessage(msg),
      removeExternalAlert: () => removeAlert(),
      defaultDPI: 600,
    },
  };

  const adsref = isArticle
    ? `${process.env.NEXT_PUBLIC_ADS_DEFAULT_URL}/abs/${id}/abstract`
    : undefined;

  return (
    <Layout adsUrl={adsref}>
      <Container fluid className="d-flex flex-column h-100">
        <Mirador config={config} />
      </Container>
    </Layout>
  );
};

Manifest.getInitialProps = async ({ query }) => {
  const { id, full = "", p = 1, art = false } = query;
  const props: ManifestProps = {
    id: String(id),
    textQuery: String(full),
    page: Number(p),
    isArticle: Boolean(art),
    isPage: !!query.p,
  };
  return props;
};

export default Manifest;
