import type { NextPage } from 'next'
import Head from 'next/head'
import Mirador from '../../components/Mirador/mirador'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import React from 'react';
import Layout from '../../components/Layout/Layout'

const Viewer: NextPage = () => {
    const router = useRouter()
    const { id } = router.query

    return (
        <Layout>
              {id ? <Mirador config={{ id: "mirador", windows: [{ loadedManifest: `${process.env.NEXT_PUBLIC_MANIFEST_SERVICE}/${id}/manifest.json` }] }} plugins={[]} /> : <>Loading...</>}
        </Layout>
    )
}

export default Viewer
