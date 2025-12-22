import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Driver } from '../../../common/types';

// ATM Card dimensions in points (1mm = 2.83465 points)
// 85.6mm = ~242.64 pt
// 53.98mm = ~153.01 pt
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        width: '85.6mm',
        height: '53.98mm',
        padding: 0
    },
    card: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1f2937', // Dark background like dashboard
        color: 'white',
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    photoSection: {
        width: '35%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 30, // Circular photo
        backgroundColor: '#ccc',
        objectFit: 'cover'
    },
    infoSection: {
        width: '65%',
        paddingLeft: 10,
        justifyContent: 'center'
    },
    header: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#fbbf24' // Amber/Gold header
    },
    row: {
        fontSize: 7,
        marginBottom: 3,
        flexDirection: 'row'
    },
    label: {
        width: 40,
        fontWeight: 'bold',
        color: '#9ca3af'
    },
    value: {
        flex: 1,
        color: 'white'
    },
    footer: {
        position: 'absolute',
        bottom: 5,
        right: 10,
        fontSize: 5,
        color: '#6b7280'
    }
});

interface IdCardDocumentProps {
    driver: Driver;
}

const IdCardDocument: React.FC<IdCardDocumentProps> = ({ driver }) => (
    <Document>
        <Page size={[242.64, 153.01]} style={styles.page}>
            <View style={styles.card}>
                <View style={styles.photoSection}>
                    {/* Use a placeholder if no photoUrl, or the actual photo */}
                    <Image
                        style={styles.photo}
                        src={{
                            uri: driver.photoUrl || 'https://via.placeholder.com/150',
                            method: 'GET',
                            headers: { "Cache-Control": "no-cache" },
                            body: ""
                        }}
                    />
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.header}>DRIVER IDENTITY CARD</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{driver.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>ID No:</Text>
                        <Text style={styles.value}>{driver.uniqueId || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>License:</Text>
                        <Text style={styles.value}>{driver.licenseNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Vehicle:</Text>
                        <Text style={styles.value}>{driver.vehicleNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>City:</Text>
                        <Text style={styles.value}>{driver.address?.split(',')[0] || 'Unknown'}</Text>
                    </View>
                </View>
                <Text style={styles.footer}>Authorized Signature</Text>
            </View>
        </Page>
    </Document>
);

export default IdCardDocument;
