import React from 'react'
import { Page, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f2f2f2'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

function Pdf({images = []}) {
    console.log("datasaasas",images)
  return (
    <Document>
    <Page size={{width:840, height:6000}} style={styles.page}>
        {images && images.map((item, key) => (
            <Image src={item} key={key} />
        ))}
    </Page>
  </Document>
  )
}

export default Pdf