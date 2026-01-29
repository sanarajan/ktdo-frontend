import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Driver } from '../../../common/types';
import { API_BASE_URL } from '../../../common/constants';

const CARD_BG_IMAGE = "/public/idcard.png"; 
const FOOTER_IMAGE = "/public/footer.png"; 
const LOGO_IMAGE = "/public/logo.png"; 
const SIGNATURE_IMAGE = "/public/signature.png";
const SEAL_IMAGE = "/public/seal.png";   


// Helper to scale font size based on text length
const getDynamicFontSize = (text: string, baseSize: number, maxLength: number) => {
  if (text.length > maxLength) {
    return baseSize - 2.5; // Shrink font for long names
  }
  return baseSize;
};

const getImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${serverUrl}/${url.replace(/^\//, '')}`;
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
  logo: {
    position: 'absolute',
    top: 12,           
    width: 15,         
    height: 'auto',
    left: '50%',       
    marginLeft: -7.5, 
  },
  mainLayer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center', 
    overflow: 'hidden', 
  },
 photoPositioner: {
    marginTop: 45, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  // SHADOW: Scaled down to match new smaller photo
  shadowOuter: {
    width: 74, 
    height: 74,
    borderRadius: 37,
    backgroundColor: '#F0F0F0', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  // WRAPPER: Reduced from 78 to 68
  photoWrapper: {
    width: 68, 
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // INNER: Reduced to 60 to keep the white ring thickness
  photoInner: {
    width: 60, 
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  nameContainer: {
    marginTop: 4, 
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows long names to drop to next line instead of overflowing card
    justifyContent: 'center',
    paddingHorizontal: 10, // Keeps text from touching edges
    textAlign: 'center',
  },
  nameFirst: {
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    textTransform: 'uppercase',
  },
  nameLast: {
    fontFamily: 'Helvetica-Bold',
    color: '#FFB800', 
    textTransform: 'uppercase',
    marginLeft: 3,
  },
  role: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginTop: 2,
  },
  infoSection: {
    width: 125, // Widened slightly to use more card space
    marginTop: 8, 
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top so wrapped text looks good
    marginBottom: 3,
  },
  label: {
    fontSize: 7.5,
    color: '#FFB800', 
    fontFamily: 'Helvetica-Bold',
    width: 50, 
  },
  labelColon: {
    fontSize: 7.5,
    color: '#FFB800',
    marginRight: 4,
  },
  value: {
    fontSize: 7.5,
    color: '#333333',
    fontFamily: 'Helvetica-Bold',
    flex: 1,
    textAlign: 'left',
    lineHeight: 1.1, // Better spacing for wrapped lines
  },
  footerImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 153,
    height: 15, 
    objectFit: 'stretch', 
  },
  signature: {
  position: 'absolute',
  bottom: 15,
  right: 12,
  width: 48,
  height: 20,
  objectFit: 'contain',
},

signatureLabel: {
  position: 'absolute',
  bottom: 27,
  right: 15,
  fontSize: 6,
  color: '#666666',
  fontFamily: 'Helvetica-Bold',
},
 photoArea: {
    marginTop: 45,
    position: 'relative',   // ✅ REQUIRED FOR OVERLAP
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seal: {
    position: 'absolute',
    width: 38,
    height: 38,
    right: -6,     // pushes ¾ outside
    bottom: 6,     // keeps ¼ touching photo
    objectFit: 'contain',
    opacity: 0.9,
  },


});

interface Props {
  driver: Driver;
}

const IdCardDocument: React.FC<Props> = ({ driver }) => {
  const nameParts = (driver.name || 'SANAM').split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';
  const fullName = driver.name || '';

  // Calculate dynamic size based on total length
  const dynamicNameSize = getDynamicFontSize(fullName, 13, 12);

  return (
    <Document>
      <Page size={[153, 241]} style={styles.page}>
        <Image src={CARD_BG_IMAGE} style={styles.fullBackground} />
        <Image src={LOGO_IMAGE} style={styles.logo} />

        <View style={styles.mainLayer}>
          
            <View style={styles.photoArea}>
            <View style={styles.shadowOuter}>
              <View style={styles.photoWrapper}>
                <View style={styles.photoInner}>
                  <Image style={styles.photo} src={{ uri: getImageUrl(driver.photoUrl) }} />
                </View>
              </View>
            </View>

            {/* ✅ SEAL OVERLAP */}
            <Image src={SEAL_IMAGE} style={styles.seal} />
          </View>

          <View style={styles.nameContainer}>
            <Text style={[styles.nameFirst, { fontSize: dynamicNameSize }]}>{firstName}</Text>
            {lastName ? (
              <Text style={[styles.nameLast, { fontSize: dynamicNameSize }]}>{lastName}</Text>
            ) : null}
          </View>
          
          <Text style={styles.role}>ID No: {driver.uniqueId || '1000'}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.labelColon}>:</Text>
              <Text style={styles.value}>{driver.bloodGroup || 'AB+'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Licence No</Text>
              <Text style={styles.labelColon}>:</Text>
              <Text style={styles.value}>{(driver as any).licenceNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.labelColon}>:</Text>
              <Text style={styles.value}>+91 {driver.phone || '5678906543'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>District</Text>
              <Text style={styles.labelColon}>:</Text>
              <Text style={styles.value}>{driver.district || 'Kozhikode'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>State</Text>
              <Text style={styles.labelColon}>:</Text>
              <Text style={styles.value}>{driver.state || 'Kerala'}</Text>
            </View>
          </View>
{/* Signature */}
<Text style={styles.signatureLabel}>Signature</Text>
<Image src={SIGNATURE_IMAGE} style={styles.signature} />

          <Image src={FOOTER_IMAGE} style={styles.footerImage} />
          
        </View>
      </Page>
    </Document>
  );
};

export default IdCardDocument;