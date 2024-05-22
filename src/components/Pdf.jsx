import React from 'react'
import { Page, View, Document, StyleSheet } from "@react-pdf/renderer";

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

function Pdf({children}) {
  return (
    <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <img src="/poster.png" alt="" />
        <img src="/poster.png" alt="" />
        <img src="/poster.png" alt="" />
      </View>
    </Page>
  </Document>
  )
}

export default Pdf