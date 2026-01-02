import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Driver } from '../../../common/types';

// Portrait Card dimensions
// 53.98mm = ~153.01 pt (Width)
// 85.6mm = ~242.64 pt (Height)
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        width: '53.98mm',
        height: '85.6mm',
        padding: 0,
        fontFamily: 'Helvetica'
    },
    // 1. Header (Black Strip)
    header: {
        height: 25,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    logo: {
        width: 18,
        height: 18,
        objectFit: 'contain'
    },
    
    // 2. Top Section (White)
    topSection: {
        height: 65,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    photoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 10,
        // borderWidth: 1,
        // borderColor: '#eee'
    },
    photo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    titleContainer: {
        width: 85,
        justifyContent: 'center'
    },
    titleText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#000000',
        textTransform: 'uppercase',
        lineHeight: 1.2
    },

    // 3. Middle Section (Yellow)
    middleSection: {
        flex: 1,
        backgroundColor: '#ffd333',
        flexDirection: 'row',
        padding: 8,
        paddingLeft: 0 
    },
    
    // Vertical Text Column
    verticalTextCol: {
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    verticalText: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        color: '#000000',
        textTransform: 'uppercase',
        transform: 'rotate(-90deg)',
        width: 120, 
        textAlign: 'center'
    },

    // White Card
    cardContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        padding: 8,
        justifyContent: 'center'
    },
    name: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        color: '#000000',
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    idText: {
        fontSize: 9,
        textAlign: 'center',
        color: '#000000',
        marginBottom: 5
    },
    divider: {
        height: 1,
        backgroundColor: '#ffd333',
        width: '100%',
        marginVertical: 5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3
    },
    label: {
        fontSize: 7,
        color: '#000000',
        fontFamily: 'Helvetica'
    },
    value: {
        fontSize: 7,
        color: '#000000',
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right'
    },

    // 4. Footer
    footer: {
        height: 18,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerText: {
        fontSize: 6,
        color: '#ffd333',
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase'
    }
});

interface IdCardDocumentProps {
    driver: Driver;
}

const IdCardDocument: React.FC<IdCardDocumentProps> = ({ driver }) => (
    <Document>
        <Page size={[153.01, 242.64]} style={styles.page}>
            {/* 1. Header */}
            <View style={styles.header}>
                 <Image 
                    src="/logo.png" 
                    style={styles.logo} 
                />
            </View>

            {/* 2. Top Section (Photo + Title) */}
            <View style={styles.topSection}>
                <View style={styles.photoContainer}>
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
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>Professional</Text>
                    <Text style={styles.titleText}>Identity Card</Text>
                </View>
            </View>

            {/* 3. Middle Section (Yellow + Card) */}
            <View style={styles.middleSection}>
                {/* Vertical Text */}
                <View style={styles.verticalTextCol}>
                    <Text style={styles.verticalText}>Professional Driver Identity Card</Text>
                </View>

                {/* White Card */}
                <View style={styles.cardContainer}>
                    <Text style={styles.name}>{driver.name}</Text>
                    <Text style={styles.idText}>ID: {driver.uniqueId || 'PENDING'}</Text>
                    
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Blood Group</Text>
                        <Text style={styles.value}>{driver.bloodGroup || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>{driver.phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>District</Text>
                        <Text style={styles.value}>{driver.district || 'N/A'}</Text>
                    </View>
                     <View style={styles.row}>
                        <Text style={styles.label}>State</Text>
                        <Text style={styles.value}>{driver.state || 'N/A'}</Text>
                    </View>
                </View>
            </View>

            {/* 4. Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Professional Driver Identity Card</Text>
            </View>
        </Page>
    </Document>
);

export default IdCardDocument;
