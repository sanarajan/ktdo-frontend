import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font
} from "@react-pdf/renderer";
import type { Driver } from "../../common/types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    width: "85.6mm",
    height: "53.98mm",
    padding: 0,
  },
  card: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  // Black Header with Logo
  header: {
    backgroundColor: "#000",
    height: "18%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 25,
    height: 25,
  },
  // Middle Section (Photo + Title)
  photoSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: "35%",
    backgroundColor: "#fff",
  },
  photoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    border: "1px solid #eee",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 15,
    width: "50%",
  },
  // Bottom Main Body with Yellow Background
  bottomBody: {
    flex: 1,
    backgroundColor: "#FFC107", // The brand yellow
    flexDirection: "row",
    padding: 2,
  },
  // Vertical Sidebar Text
  sidebar: {
    width: "12%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  verticalText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
    transform: "rotate(-90deg)",
    width: 150, // Ensures text doesn't wrap awkwardly
    textAlign: "center",
  },
  // White Info Box
  infoBox: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  driverName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  idText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#FFC107",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 3,
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 8,
    color: "#333",
  },
  detailValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
  },
  // Footer Black Bar
  footer: {
    backgroundColor: "#000",
    height: "8%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#FFC107",
    fontWeight: "bold",
    textTransform: "uppercase",
  }
});

interface IDCardProps {
  driver: Driver;
}

const IDCardDocument = ({ driver }: IDCardProps) => {
  const housePart = (driver.houseName || '').trim();
  const placePart = (driver.place || '').trim();
  const pinPart = (driver.pin || '').trim();
  const displayAddress = [housePart, placePart, pinPart].filter(Boolean).join(', ');

  return (
    <Document>
      <Page size={[242.6, 153]} style={styles.page}>
        <View style={styles.card}>

          {/* 1. Header with Logo */}
          <View style={styles.header}>
            <Image src="/logo.png" style={styles.logo} />
          </View>

          {/* 2. Photo and Main Title */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {driver.photoUrl ? (
                <Image src={driver.photoUrl} style={styles.photo} />
              ) : (
                <View style={{ width: "100%", height: "100%", backgroundColor: "#eee" }} />
              )}
            </View>
            <Text style={styles.mainTitle}>PROFESSIONAL IDENTITY CARD</Text>
          </View>

          {/* 3. The Yellow Body Section */}
          <View style={styles.bottomBody}>

            {/* Vertical Sidebar */}
            <View style={styles.sidebar}>
              <Text style={styles.verticalText}>PROFESSIONAL DRIVER IDENTITY CARD</Text>
            </View>

            {/* White Details Box */}
            <View style={styles.infoBox}>
              <Text style={styles.driverName}>{driver.name?.toUpperCase() || "NAME"}</Text>
              <Text style={styles.idText}>ID: {driver.uniqueId || "PENDING"}</Text>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Blood Group</Text>
                <Text style={styles.detailValue}>{driver.bloodGroup || "O+"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Licence No</Text>
                <Text style={styles.detailValue}>{(driver as any).licenceNumber || "N/A"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{driver.phone || "N/A"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{displayAddress || "N/A"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}> District</Text>
                <Text style={styles.detailValue}>{driver.district || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}> State</Text>
                <Text style={styles.detailValue}>{driver.state || "N/A"}</Text>
              </View>
            </View>
          </View>


          {/* 4. Bottom Footer Bar */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Professional Driver Identity Card</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
};

export default IDCardDocument;
