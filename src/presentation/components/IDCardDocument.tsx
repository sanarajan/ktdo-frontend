import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Driver } from "../../common/types";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    width: "85.6mm", // ATM Card size
    height: "53.98mm",
    padding: 10,
  },
  card: {
    border: "1px solid #000",
    height: "100%",
    borderRadius: 5,
    padding: 10,
    display: "flex",
    flexDirection: "row",
  },
  photo: {
    width: 60,
    height: 70,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  info: {
    flex: 1,
    fontSize: 8,
    justifyContent: "center",
  },
  header: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "darkblue",
  },
  label: {
    fontSize: 6,
    color: "gray",
  },
  value: {
    marginBottom: 2,
  },
  idNumber: {
    position: "absolute",
    bottom: 5,
    right: 10,
    fontSize: 8,
    fontWeight: "bold",
  },
});

interface IDCardProps {
  driver: Driver;
}

const IDCardDocument = ({ driver }: IDCardProps) => (
  <Document>
    <Page size={[242.6, 153]} style={styles.page}>
      {/* 85.6mm * 2.83pt/mm ~ 242pt */}
      <View style={styles.card}>
        <View style={styles.photo}>
          <Image
            src={driver.photoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.header}>DRIVER MEMBERSHIP CARD</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{driver.name}</Text>

          <Text style={styles.label}>Vehicle Number</Text>
          <Text style={styles.value}>{driver.vehicleNumber}</Text>

          <Text style={styles.label}>License Number</Text>
          <Text style={styles.value}>{driver.licenseNumber}</Text>

          <Text style={styles.idNumber}>{driver.uniqueId}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
export default IDCardDocument;
