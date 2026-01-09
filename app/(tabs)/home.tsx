import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// API URL resolution: prefer explicit env override, otherwise use web origin
// (and prefer localhost during local web dev), else fallback to deployed domain.
const PRODUCTION_FALLBACK = 'https://tibungcoh.vercel.app';
const DEFAULT_LOCAL = 'http://localhost:5000';
let API_URL = process.env?.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  const origin = (typeof globalThis !== 'undefined' && (globalThis as any).location?.origin) || '';
  const isLocalWeb = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('19006');
  if (origin && isLocalWeb) API_URL = DEFAULT_LOCAL;
  else if (origin) API_URL = origin;
  else API_URL = PRODUCTION_FALLBACK;
}
console.log('Using API_URL ->', API_URL);

// Font Loading
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts
} from '@expo-google-fonts/montserrat';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

export default function HomeDashboard() {
  const { width } = useWindowDimensions();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // --- USER DATA & STATE ---
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // --- REQUEST SYSTEM STATE ---
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [requestPurpose, setRequestPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          setUserName(u.fullName || u.full_name || u.email || 'Resident');
          setUserEmail(u.email || '');
          setIsAuthChecked(true);
          return;
        }
        setIsAuthChecked(true);
        router.replace('/');
      } catch (err) {
        console.warn('Failed to load user', err);
        setIsAuthChecked(true);
        router.replace('/');
      }
    };
    loadUser();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/announcements`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load announcements', err);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold,
    PlayfairDisplay_700Bold, PlayfairDisplay_400Regular
  });

  // --- HANDLERS ---
  const openRequestModal = (docType) => {
    setSelectedDoc(docType);
    setRequestModalVisible(true);
  };

  const handleRequestSubmit = async () => {
    if (!requestPurpose.trim()) {
      Alert.alert("Input Required", "Please provide a purpose for your request.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Example API call to your backend
      const response = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resident_name: userName,
          resident_email: userEmail,
          document_type: selectedDoc,
          purpose: requestPurpose,
        }),
      });

      if (response.ok) {
        Alert.alert("Request Sent", `Your application for ${selectedDoc} has been submitted successfully.`);
        setRequestModalVisible(false);
        setRequestPurpose('');
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to submit request. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => router.replace('/');

  if (!fontsLoaded || !isAuthChecked) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#002D62" />
      </View>
    );
  }

  const isMobile = width < 768;
  const contentWidth = isMobile ? '92%' : 1100;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- MOBILE DRAWER MODAL --- */}
      <Modal visible={isMobileMenuOpen} animationType="slide" transparent={true}>
        <View style={styles.mobileDrawerOverlay}>
          <LinearGradient colors={['#002D62', '#001A3D']} style={styles.mobileDrawer}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setMobileMenuOpen(false)}>
              <Ionicons name="close-circle-outline" size={40} color="white" />
            </TouchableOpacity>
            <View style={styles.drawerUserInfo}>
              <View style={styles.drawerAvatarContainer}>
                <MaterialCommunityIcons name="account-circle" size={80} color="#60A5FA" />
                <View style={styles.verifiedBadge} />
              </View>
              <Text style={styles.drawerUserName}>{userName}</Text>
              <Text style={styles.drawerUserRole}>VERIFIED RESIDENT</Text>
            </View>
            <View style={styles.drawerItems}>
              {['Home', 'My Documents', 'Community News', 'Hotlines'].map((item) => (
                <TouchableOpacity key={item} style={styles.drawerLink} onPress={() => setMobileMenuOpen(false)}>
                  <Text style={styles.drawerText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={handleLogout} style={styles.drawerLogout}>
                <Ionicons name="log-out-outline" size={24} color="#F87171" />
                <Text style={styles.drawerLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* --- DOCUMENT REQUEST MODAL --- */}
      <Modal visible={requestModalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.reqOverlay}>
          <View style={styles.reqContent}>
            <View style={styles.reqHeader}>
              <Text style={styles.reqHeaderTitle}>Request Form</Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.reqDocPill}>
              <Text style={styles.reqDocLabel}>{selectedDoc.toUpperCase()}</Text>
            </View>

            <Text style={styles.reqInputLabel}>Purpose of Request</Text>
            <TextInput
              style={styles.reqInput}
              placeholder="e.g. For Job Application, Scholarship, etc."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={requestPurpose}
              onChangeText={setRequestPurpose}
            />

            <TouchableOpacity 
              style={[styles.submitActionBtn, isSubmitting && { opacity: 0.7 }]} 
              onPress={handleRequestSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#002D62', '#004080']} style={styles.submitActionGrad}>
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitActionText}>Confirm Request</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        {/* --- NAVIGATION BAR --- */}
        <View style={styles.navbar}>
          <View style={[styles.navInner, { maxWidth: contentWidth }]}>
            <View style={styles.logoGroup}>
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} 
                style={styles.seal} 
              />
              <View>
                <Text style={styles.navLogoTitle}>TIBUNGCO</Text>
                <Text style={styles.navLogoSub}>DAVAO CITY PORTAL</Text>
              </View>
            </View>
            {!isMobile ? (
              <View style={styles.navLinks}>
                <TouchableOpacity><Text style={styles.navLinkActive}>Dashboard</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.navLink}>Requests</Text></TouchableOpacity>
                <View style={styles.navProfile}>
                   <MaterialCommunityIcons name="account-circle" size={20} color="#60A5FA" />
                   <Text style={styles.navProfileName}>{userName}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout}>
                   <Ionicons name="log-out-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setMobileMenuOpen(true)}>
                <Ionicons name="grid-outline" size={28} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- HERO SECTION --- */}
        <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000' }} 
            style={styles.hero}
        >
            <LinearGradient colors={['rgba(0,45,98,0.95)', 'rgba(0,45,98,0.4)']} style={styles.heroOverlay}>
                <View style={[styles.heroContent, { maxWidth: contentWidth }]}>
                    <View style={styles.welcomePill}>
                       <Text style={styles.heroPreTitle}>MABUHAY, {(userName || 'Resident').toUpperCase()}!</Text>
                    </View>
                    <Text style={styles.heroMainTitle}>Tibungco Connect</Text>
                    <Text style={styles.heroDesc}>Efficiently process your barangay documents online from the safety of your home.</Text>
                </View>
            </LinearGradient>
        </ImageBackground>

        {/* --- CONTENT AREA --- */}
        <View style={styles.whiteSection}>
          <View style={[styles.sectionInner, { maxWidth: contentWidth }]}>
            
            <View style={[styles.statsGrid, { flexDirection: isMobile ? 'column' : 'row' }]}>
                <StatCard icon="file-document-outline" title="0" desc="Active Requests" color="#3B82F6" />
                <StatCard icon="bell-badge-outline" title="3" desc="New Alerts" color="#F59E0B" />
                <StatCard icon="calendar-clock" title="Jan 20" desc="Upcoming Events" color="#10B981" />
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.broadcastBtn}>
              <LinearGradient colors={['#991B1B', '#7F1D1D']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.sosGradient}>
                <View style={styles.sosLeft}>
                  <View style={styles.sosIconCircle}><MaterialCommunityIcons name="shield-alert" size={30} color="white" /></View>
                  <View>
                    <Text style={styles.sosTitle}>Emergency Hotlines</Text>
                    <Text style={styles.sosSubtitle}>Rescue, Fire, and Police Assistance</Text>
                  </View>
                </View>
                <View style={styles.sosCallPill}>
                  <Ionicons name="call" size={18} color="#991B1B" />
                  <Text style={styles.sosCallText}>CALL</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.rowHeader}>
                <Text style={styles.sectionTitle}>Barangay Feed</Text>
                <TouchableOpacity><Text style={styles.viewAll}>Read All</Text></TouchableOpacity>
            </View>
            
            <View style={styles.statusList}>
               {announcements.length === 0 ? (
                 <Text style={{ color: '#94A3B8', paddingVertical: 10 }}>No announcements available.</Text>
               ) : (
                 announcements.slice(0, 3).map(a => (
                   <StatusItem
                     key={a.id}
                     title={a.title}
                     details={a.details}
                     date={a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                     type={a.type || 'Announcement'}
                     icon={a.type === 'Event' ? 'calendar' : 'bullhorn-variant'}
                   />
                 ))
               )}
            </View>

            {/* --- ONLINE SERVICES TRIGGER --- */}
            <Text style={[styles.sectionTitle, {marginTop: 40}]}>Online Services</Text>
            <View style={styles.serviceGrid}>
               <ServiceCard 
                 icon="file-certificate" 
                 label="Barangay Clearance" 
                 onPress={() => openRequestModal("Barangay Clearance")} 
               />
               <ServiceCard 
                 icon="card-account-details" 
                 label="Indigency Cert." 
                 onPress={() => openRequestModal("Indigency Certificate")} 
               />
               <ServiceCard 
                 icon="home-city" 
                 label="Business Permit" 
                 onPress={() => openRequestModal("Business Permit")} 
               />
               <ServiceCard 
                 icon="bullhorn" 
                 label="News Feed" 
                 onPress={() => {}} 
               />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerInner, { maxWidth: contentWidth }]}>
            <Text style={styles.footerLogo}>TIBUNGCO CONNECT</Text>
            <Text style={styles.copy}>Davao City, Philippines • Digital Initiative v2.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- UPDATED SUB-COMPONENTS ---

function StatCard({ icon, title, desc, color }) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <MaterialCommunityIcons name={icon} size={30} color={color} />
            <View style={{marginLeft: 15}}>
              <Text style={styles.statNum}>{title}</Text>
              <Text style={styles.statSubText}>{desc}</Text>
            </View>
        </View>
    );
}

function StatusItem({ title, details, date, type, icon }) {
  return (
    <TouchableOpacity style={styles.statusCard}>
      <View style={styles.statusIconBox}>
        <MaterialCommunityIcons name={icon} size={22} color="#002D62" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.statusTitleText}>{title}</Text>
        {details ? <Text style={styles.statusDetailsText} numberOfLines={2}>{details}</Text> : null}
        <Text style={styles.statusDateText}>{type} • {date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
    </TouchableOpacity>
  );
}

function ServiceCard({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
            <View style={styles.serviceIconBox}>
                <MaterialCommunityIcons name={icon} size={32} color="#002D62" />
            </View>
            <Text style={styles.serviceLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

// --- UPDATED STYLESHEET ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Navbar
  navbar: { backgroundColor: '#002D62', paddingVertical: 15, zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  navInner: { alignSelf: 'center', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  seal: { width: 42, height: 42, marginRight: 12 },
  navLogoTitle: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 18, letterSpacing: 1 },
  navLogoSub: { color: '#60A5FA', fontFamily: 'Montserrat_500Medium', fontSize: 8, letterSpacing: 2 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navLinkActive: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 13 },
  navProfile: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, gap: 8 },
  navProfileName: { color: 'white', fontFamily: 'Montserrat_600SemiBold', fontSize: 12 },

  // Mobile Drawer
  mobileDrawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  mobileDrawer: { width: '85%', height: '100%', padding: 30, alignSelf: 'flex-end', borderTopLeftRadius: 30 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 10 },
  drawerUserInfo: { alignItems: 'center', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 20 },
  drawerAvatarContainer: { position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, width: 15, height: 15, borderRadius: 10, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#002D62' },
  drawerUserName: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 20, marginTop: 12 },
  drawerUserRole: { color: '#60A5FA', fontFamily: 'Montserrat_600SemiBold', fontSize: 10, letterSpacing: 2 },
  drawerLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  drawerText: { color: 'white', fontFamily: 'Montserrat_600SemiBold', fontSize: 18 },
  drawerLogout: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 20 },
  drawerLogoutText: { color: '#F87171', fontFamily: 'Montserrat_700Bold', fontSize: 16 },

  // Request Modal Styling
  reqOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  reqContent: { backgroundColor: 'white', width: '100%', maxWidth: 450, borderRadius: 25, padding: 25 },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  reqHeaderTitle: { fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1E293B' },
  reqDocPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 20 },
  reqDocLabel: { fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#002D62' },
  reqInputLabel: { fontFamily: 'Montserrat_600SemiBold', fontSize: 13, color: '#475569', marginBottom: 8 },
  reqInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, height: 100, textAlignVertical: 'top', fontFamily: 'Montserrat_400Regular', color: '#1E293B' },
  submitActionBtn: { marginTop: 25, borderRadius: 12, overflow: 'hidden' },
  submitActionGrad: { paddingVertical: 16, alignItems: 'center' },
  submitActionText: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 16 },

  // Hero Section
  hero: { height: 380, width: '100%' },
  heroOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  heroContent: { alignSelf: 'center', width: '100%' },
  welcomePill: { backgroundColor: 'rgba(96, 165, 250, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  heroPreTitle: { color: '#60A5FA', fontFamily: 'Montserrat_700Bold', letterSpacing: 1.5, fontSize: 10 },
  heroMainTitle: { color: 'white', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 48, lineHeight: 52 },
  heroDesc: { color: '#CBD5E0', fontFamily: 'Montserrat_400Regular', fontSize: 15, marginTop: 15, maxWidth: 450, lineHeight: 22 },

  // Main Body
  whiteSection: { backgroundColor: '#F8FAFC', paddingVertical: 40, marginTop: -30, borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  sectionInner: { alignSelf: 'center', width: '100%', paddingHorizontal: 20 },
  sectionTitle: { color: '#0F172A', fontFamily: 'Montserrat_700Bold', fontSize: 20, letterSpacing: -0.5 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 35 },
  viewAll: { fontFamily: 'Montserrat_700Bold', color: '#002D62', fontSize: 12 },
  
  // Cards
  statsGrid: { gap: 12, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', 
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) 
  },
  statNum: { fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#1E293B' },
  statSubText: { fontFamily: 'Montserrat_500Medium', color: '#64748B', fontSize: 12 },

  // SOS Button
  broadcastBtn: { marginBottom: 15 },
  sosGradient: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sosLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  sosIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  sosTitle: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 18 },
  sosSubtitle: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat_400Regular', fontSize: 12 },
  sosCallPill: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  sosCallText: { color: '#991B1B', fontFamily: 'Montserrat_700Bold', fontSize: 12 },

  // List Items
  statusList: { gap: 10 },
  statusCard: { backgroundColor: 'white', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  statusIconBox: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statusTitleText: { fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#1E293B' },
  statusDetailsText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#475569', marginTop: 6 },
  statusDateText: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#64748B', marginTop: 6 },

  // Service Grid
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 },
  serviceCard: { width: '48%', backgroundColor: 'white', padding: 25, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  serviceIconBox: { width: 60, height: 60, backgroundColor: '#F8FAFC', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  serviceLabel: { fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#334155', textAlign: 'center' },

  // Footer
  footer: { backgroundColor: '#001A3D', paddingVertical: 40 },
  footerInner: { alignSelf: 'center', width: '100%', alignItems: 'center' },
  footerLogo: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 14, letterSpacing: 3 },
  copy: { color: '#64748B', fontSize: 10, fontFamily: 'Montserrat_500Medium', marginTop: 8 }
});