import { useEffect } from "react";
import styles from "./Mirador.module.css"
import * as React from "react";

interface MiradorProps {
    config: any
}

/**
 * IIIF image viewer used to process and visualize the IIIF manifest.
 */
const Mirador = ({ config }: MiradorProps) => {
    useEffect(() => {
        let cancelled = false;
        const initializeMirador = async () => {
            const mirador = (await import("mirador/dist/es/src/index")).default;
            const imageToolsPlugin = (await import("mirador-image-tools")).miradorImageToolsPlugin;
            const downloadPlugin = (await import("mirador-ads-plugin")).miradorDownloadPlugin;
            const downloadDialogPlugin = (await import("mirador-ads-plugin")).miradorDownloadDialogPlugin;
            const nextManifestPlugin = (await import("mirador-ads-plugin")).miradorNextManifestPlugin;
            const closeButtonPlugin = (await import("mirador-ads-plugin")).miradorCloseButtonPlugin;
            const fetchOcrPlugin = (await import("mirador-ads-plugin")).miradorFetchOcrPlugin;
            if (cancelled) return;
            mirador.viewer(config, [imageToolsPlugin, downloadPlugin, downloadDialogPlugin, nextManifestPlugin, closeButtonPlugin, fetchOcrPlugin]);
        };
        initializeMirador();
        return () => {
            cancelled = true;
            const el = document.getElementById(config.id);
            if (el) el.innerHTML = '';
        };
    }, [config]);

    return (
        <div id={config.id} className={styles.viewer} />
    );
}


export default Mirador
