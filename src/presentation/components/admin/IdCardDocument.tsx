import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Driver } from '../../../common/types';
import { API_BASE_URL } from '../../../common/constants';

const CARD_BG_IMAGE = "/idcard_background.jpg";

const getImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${serverUrl}/${url.replace(/^\//, '')}`;
};

const getPrintImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/150';
  const originalUrl = getImageUrl(url);
  if (originalUrl.startsWith('data:')) return originalUrl;
  return `${API_BASE_URL}/admin/print-image-cmyk?url=${encodeURIComponent(originalUrl)}`;
};


// Helper to get dynamic font size for name
const getNameFontSize = (name: string): number => {
  if (name.length > 25) {
    return 7; // Readable bold
  } else if (name.length > 18) {
    return 8;
  }
  return 9;
};

// Physical dimensions
const MM_TO_PT = 72 / 25.4;

const CARD_WIDTH = 54 * MM_TO_PT;
const CARD_HEIGHT = 86 * MM_TO_PT;

const styles = StyleSheet.create({
  page: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    padding: 0,
    margin: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF'
  },
  fullBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  photoWrapper: {
    position: 'absolute',
    top: 45.25,
    left: ((CARD_WIDTH - 61.5) / 2) - 0.25,
    width: 61.5,
    height: 61.5,
    borderRadius: 30.75, 
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',   
    borderRadius: 30.75,   
  },
  nameWrapper: {
    position: 'absolute',
    top: 110,
    left: 0,
    width: CARD_WIDTH,
    height: 14, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'Helvetica-Bold',
    color: 'cmyk(0,0,0,100)',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 0,
    lineHeight: 1,
    paddingHorizontal: 10,
  },
  idText: {
    position: 'absolute',
    top: 124,
    left: 0,
    width: CARD_WIDTH,
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: 'cmyk(0,0,0,100)',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 1,
  },
  infoSection: {
    position: 'absolute',
    top: 137,
    left: (CARD_WIDTH - 133) / 2,
    width: 133,
    paddingHorizontal: 9,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1.2, // Reduced row spacing to compensate for downward shift, preventing seal overlap
  },
  label: {
    fontSize: 6,
    color: 'cmyk(0,0,0,100)',
    fontFamily: 'Helvetica-Bold',
    width: 48,
    textTransform: 'uppercase',
    lineHeight: 1.2, 
  },
  colon: {
    fontSize: 6,
    color: 'cmyk(0,0,0,100)',
    fontFamily: 'Helvetica-Bold',
    width: 5,
    lineHeight: 1.2,
  },
  value: {
    fontSize: 6,
    color: 'cmyk(0,0,0,100)',
    fontFamily: 'Helvetica',
    flex: 1,
    textAlign: 'left',
    lineHeight: 1.2, 
  },
  addressFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CARD_WIDTH,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  addressValue: {
    fontSize: 5.5,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 1.2,
  }
});

interface Props {
  driver: Driver;
}

const IdCardDocument: React.FC<Props> = ({ driver }) => {
  const rawName = driver.name || 'N/A';
  const displayName = rawName;
  const nameFontSize = getNameFontSize(displayName);

  // Address - Full concatenation without truncation
  const houseName = (driver.houseName || '').trim();
  const placeName = (driver.place || '').trim();
  const districtName = (driver.district || '').trim();
  const stateName = (driver.state || '').trim();
  const pinCode = (driver.pin || '').trim();

  const displayAddress = [houseName, placeName, districtName, stateName, pinCode]
    .filter(Boolean)
    .join(', ');

  return (
    <Document>
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <Image src={CARD_BG_IMAGE} style={styles.fullBackground} />

        <View style={styles.photoWrapper}>
          <Image
            style={styles.photo}
            src={{ uri: getPrintImageUrl(driver.photoUrl) }}
          />
        </View>

        <View style={styles.nameWrapper}>
          <Text style={[styles.nameText, { fontSize: nameFontSize }]}>
            {displayName.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.idText}>
          ID: {driver.uniqueId || 'PENDING'}
        </Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>LICENSE NO</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{(driver as any).licenceNumber || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>PHONE</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{driver.phone || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>BLOOD GROUP</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{driver.bloodGroup || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>DISTRICT</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{driver.district || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>RTO CODE</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{driver.stateRtoCode || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>STATE</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{driver.state || 'Kerala'}</Text>
          </View>
        </View>

        {/* Footer Address */}
        <View style={styles.addressFooter}>
          <Text style={styles.addressValue}>
            {displayAddress || 'N/A'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default IdCardDocument;