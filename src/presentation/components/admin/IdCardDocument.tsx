import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Driver } from '../../../common/types';
import { API_BASE_URL } from '../../../common/constants';

const CARD_BG_IMAGE = "/idcard_background.png";

// Helper to get full image URL
const getImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${serverUrl}/${url.replace(/^\//, '')}`;
};

// Helper to get dynamic font size for name
const getNameFontSize = (name: string): number => {
  if (name.length > 30) {
    return 8; // Readable bold
  } else if (name.length > 20) {
    return 9;
  }
  return 10;
};

const styles = StyleSheet.create({
  page: {
    width: 153,
    height: 241,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  fullBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 153,
    height: 241,
    objectFit: 'stretch',
  },
  mainLayer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPositioner: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70, // Fixed height for photo area
  },
  // User's preferred photo style (from latest edit)
  photoWrapper: {
    width: 65,
    height: 65,
    borderRadius: 32.5, // Perfect circle (size 65)
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',   // Important: This crops the passport photo to fill the circle
    borderRadius: 32.5,   // Apply radius to image as well for better compatibility
  },
  nameWrapper: {
    marginTop: 0,
    width: '100%',
    height: 22, // Tight height for up to 2 lines
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 0,
    lineHeight: 1,
    paddingHorizontal: 15,
  },
  idText: {
    marginTop: -4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 0.9,
  },
  infoSection: {
    width: 130,
    marginTop: 4, // Tighten gap from ID no
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginTop: 1,
    minHeight: 16, // Tightest height for address to clear signature
  },
  label: {
    fontSize: 7,
    color: '#000',
    fontFamily: 'Helvetica-Bold',
    width: 55,
    textTransform: 'uppercase',
    lineHeight: 1.2, // Reduced from 2.0 to fit everything
  },
  value: {
    fontSize: 7,
    color: '#000',
    fontFamily: 'Helvetica',
    flex: 1,
    textAlign: 'left',
    lineHeight: 1.2, // Reduced from 2.0
  },
  addressValue: {
    fontSize: 6,
    color: '#000',
    fontFamily: 'Helvetica',
    flex: 1,
    textAlign: 'left',
    lineHeight: 1,
  }
});

interface Props {
  driver: Driver;
}

const IdCardDocument: React.FC<Props> = ({ driver }) => {
  const rawName = driver.name || 'N/A';

  // No longer truncating name, relying on dynamic font size
  const displayName = rawName;

  // Get dynamic font size based on name length
  const nameFontSize = getNameFontSize(displayName);

  // Prepare address: house (8 + ..), place (full), pin (full)
  const housePartRaw = (driver.houseName || '').trim();
  const housePart = housePartRaw.length > 8 ? housePartRaw.substring(0, 8) + '..' : housePartRaw;
  const placePart = (driver.place || '').trim();
  const pinPart = (driver.pin || '').trim();

  const displayAddress = [housePart, placePart, pinPart].filter(Boolean).join(', ');

  return (
    <Document>
      <Page size={[153, 241]} style={styles.page}>
        {/* Background template image - contains seal and signature */}
        <Image src={CARD_BG_IMAGE} style={styles.fullBackground} />

        <View style={styles.mainLayer}>

          {/* Photo Section - FIXED POSITION */}
          <View style={styles.photoPositioner}>
            <View style={styles.photoWrapper}>
              <Image
                style={styles.photo}
                src={{ uri: getImageUrl(driver.photoUrl) }}
              />
            </View>
          </View>

          {/* Name Section */}
          <View style={styles.nameWrapper}>
            <Text style={[styles.nameText, { fontSize: nameFontSize }]}>
              {displayName.toUpperCase()}
            </Text>
          </View>

          {/* ID Number - Close to name (1pt gap) */}
          <View style={{ marginTop: 1 }}>
            <Text style={styles.idText}>
              ID: {driver.uniqueId || 'PENDING'}
            </Text>
          </View>

          {/* Member Information - Fixed starting position with more space below ID */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>{driver.bloodGroup || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>License No</Text>
              <Text style={styles.value}>{(driver as any).licenceNumber || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>+91 {driver.phone || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>District</Text>
              <Text style={styles.value}>{driver.district || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>State</Text>
              <Text style={styles.value}>{driver.state || 'Kerala'}</Text>
            </View>

            {/* Address field - Last data item as requested */}
            <View style={styles.addressRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.addressValue}>
                {displayAddress || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default IdCardDocument;