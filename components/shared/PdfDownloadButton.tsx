"use client";

import { useEffect, useState } from "react";
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  title: {
    fontSize: 18,
    marginBottom: 14,
    fontFamily: "Helvetica-Bold",
  },
  line: {
    marginBottom: 5,
  },
  block: {
    marginBottom: 8,
  },
});

function TextPdfDocument({ title, text }: { title: string; text: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {blocks.map((block, index) => (
          <View key={`${block.slice(0, 12)}-${index}`} style={styles.block}>
            {block.split(/\n/).map((line, lineIndex) => (
              <Text key={`${line.slice(0, 12)}-${lineIndex}`} style={styles.line}>
                {line}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function PdfDownloadButton({
  title,
  text,
  fileName,
  className = "",
}: {
  title: string;
  text: string;
  fileName: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const buttonClass =
    className ||
    "btn-ghost py-1.5 text-xs";

  if (!mounted) {
    return (
      <button className={buttonClass} disabled>
        Download PDF
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<TextPdfDocument title={title} text={text} />}
      fileName={fileName}
      className={buttonClass}
    >
      {({ loading }) => (loading ? "Preparing PDF" : "Download PDF")}
    </PDFDownloadLink>
  );
}
