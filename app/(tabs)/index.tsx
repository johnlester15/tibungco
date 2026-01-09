import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground, Modal,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// Font Loading
import {
  Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold,
  useFonts
} from '@expo-google-fonts/montserrat';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

import AppButton from '../../components/AppButton';

const HERO_IMG = "https://lh3.googleusercontent.com/p/AF1QipPYeNfVJ3UApN29Ln8MJnf-jQigSdHD7bAlIZ0k=w1024-k";
const ABOUT_IMG = "https://edgedavao.net/wp-content/uploads/2018/03/MAIN.jpeg";
const MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap?center=7.189985,125.6486496&zoom=17&size=600x300&markers=color:red|7.189985,125.6486496';

export default function TibungcoLandingPage() {
  const { width } = useWindowDimensions();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Navigation Refs
  const sectionPositions = useRef({ home: 0, about: 0, contact: 0 });

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold,
    PlayfairDisplay_700Bold
  });

  if (!fontsLoaded) return null;

  const isMobile = width < 768;
  const contentWidth = isMobile ? '92%' : 1140;

  // Single Page Navigation Logic
  const scrollTo = (section: 'home' | 'about' | 'contact') => {
    setMobileMenuOpen(false);
    scrollRef.current?.scrollTo({
      y: sectionPositions.current[section],
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* --- MOBILE MENU --- */}
      <Modal visible={isMobileMenuOpen} animationType="slide" transparent={true}>
        <View style={styles.mobileDrawerOverlay}>
          <LinearGradient colors={['#002D62', '#001A3D']} style={styles.mobileDrawer}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setMobileMenuOpen(false)}>
              <Ionicons name="close" size={40} color="white" />
            </TouchableOpacity>
            <View style={styles.drawerItems}>
              <TouchableOpacity onPress={() => scrollTo('home')}><Text style={styles.drawerText}>Home</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => scrollTo('about')}><Text style={styles.drawerText}>About</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => scrollTo('contact')}><Text style={styles.drawerText}>Contact</Text></TouchableOpacity>
              <AppButton title="Login to Portal" onPress={() => router.push('/login')} style={{marginTop: 20}} />
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <ScrollView ref={scrollRef} stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. NAVBAR --- */}
        <View style={styles.navbar}>
          <View style={[styles.navInner, { maxWidth: contentWidth }]}>
            <TouchableOpacity onPress={() => scrollTo('home')} style={styles.logoGroup}>
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} style={styles.seal} />
              <View>
                <Text style={styles.navLogoTitle}>TIBUNGCO</Text>
                <Text style={styles.navLogoSub}>DIGITAL CONNECT</Text>
              </View>
            </TouchableOpacity>

            {!isMobile ? (
              <View style={styles.navLinks}>
                <TouchableOpacity onPress={() => scrollTo('home')}><Text style={styles.navLink}>Home</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => scrollTo('about')}><Text style={styles.navLink}>About</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => scrollTo('contact')}><Text style={styles.navLink}>Contact</Text></TouchableOpacity>
                <AppButton title="Login" onPress={() => router.push('/login')} style={styles.navBtn} />
              </View>
            ) : (
              <TouchableOpacity onPress={() => setMobileMenuOpen(true)}>
                <Ionicons name="menu" size={32} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- 2. HERO (HOME) --- */}
        <View onLayout={(e) => sectionPositions.current.home = e.nativeEvent.layout.y}>
            <ImageBackground source={{ uri: HERO_IMG }} style={[styles.hero, isMobile && { height: 500 }]}>
            <LinearGradient colors={['rgba(0,0,0,0.2)', '#002D62']} style={styles.heroOverlay}>
                <View style={[styles.heroContent, { maxWidth: contentWidth }]}>
                <Text style={styles.heroPreTitle}>OFFICIAL COMMUNITY PORTAL</Text>
                <Text style={[styles.heroMainTitle, isMobile && { fontSize: 32, lineHeight: 40 }]}>Advancing Toward a Digital & Sustainable Future.</Text>
                <Text style={styles.heroDesc}>Serving over 50,000 residents with integrity, transparency, and innovation.</Text>
                <View style={styles.heroActions}>
                  <AppButton title="Get Started" onPress={() => router.push('/login')} />
                  <AppButton
                    title="Learn More"
                    onPress={() => scrollTo('about')}
                    color="transparent"
                    style={{ borderWidth: 1, borderColor: 'white' }}
                    textStyle={{ color: 'white', fontFamily: 'Montserrat_700Bold' }}
                  />
                </View>
                </View>
            </LinearGradient>
            </ImageBackground>
        </View>

        {/* --- 3. WHY TIBUNGCO --- */}
        <View style={styles.whiteSection}>
          <View style={[styles.sectionInner, { maxWidth: contentWidth }]}>
            <View style={styles.centeredHeader}>
              <Text style={styles.sectionLabel}>WHY TIBUNGCO?</Text>
              <Text style={[styles.sectionTitle, isMobile && { fontSize: 28 }]}>A Hub of Industry & Unity</Text>
              <Text style={styles.sectionSub}>Discover what makes our barangay the heart of Davao's Second District.</Text>
            </View>
            <View style={[styles.featureGrid, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <FeatureCard icon="account-group" title="50,000+ People" desc="A vibrant, diverse community of resilient families and professionals driving local growth." />
              <FeatureCard icon="shield-check" title="Gateway to Industry" desc="Strategic location hosting major industrial players, creating thousands of jobs for locals." />
              <FeatureCard icon="cellphone-check" title="Smart Governance" desc="First in the district to implement full digital document tracking and online resident portals." />
            </View>
          </View>
        </View>

        {/* --- 4. ABOUT SECTION --- */}
        <View 
            style={styles.aboutSection}
            onLayout={(e) => sectionPositions.current.about = e.nativeEvent.layout.y}
        >
          <View style={[styles.aboutInner, { maxWidth: contentWidth, flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={styles.aboutTextCol}>
              <Text style={styles.sectionLabel}>ESTABLISHED 19XX</Text>
              <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>Our Heritage</Text>
              <Text style={styles.bodyText}>Barangay Tibungco stands as a gateway to Davao City’s industrial heart. Known for its bustling markets and coastal beauty, we are a community where tradition meets technology.</Text>
              <Text style={styles.bodyText}>We are committed to fostering an environment where every resident feels heard, protected, and empowered. From our vibrant local markets to our digital government initiatives, we strive for a future that leaves no one behind.</Text>
              
              <View style={styles.vmGrid}>
                <View style={styles.vmItem}>
                    <Text style={styles.vmTitle}>Vision</Text>
                    <Text style={styles.vmDesc}>To be the leading industrial hub of Davao City, characterized by a technologically advanced community.</Text>
                </View>
                <View style={styles.vmItem}>
                    <Text style={styles.vmTitle}>Mission</Text>
                    <Text style={styles.vmDesc}>To deliver fast, transparent public service through digital innovation for all Tibungcohanons.</Text>
                </View>
              </View>
            </View>
            <View style={styles.aboutImgCol}>
                <Image source={{ uri: ABOUT_IMG }} style={styles.aboutImg} />
            </View>
          </View>
        </View>

        {/* --- 5. CONTACT & MAP --- */}
        <View 
            style={styles.whiteSection}
            onLayout={(e) => sectionPositions.current.contact = e.nativeEvent.layout.y}
        >
            <View style={[styles.sectionInner, { maxWidth: contentWidth }]}>
                <View style={styles.centeredHeader}>
                    <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
                    <Text style={styles.sectionTitle}>Contact & Location</Text>
                </View>

                <View style={[styles.contactGrid, { flexDirection: isMobile ? 'column' : 'row' }]}>
                    <View style ={styles.contactForm}>
                        <Text style={styles.formTitle}>Message the Brgy. Hall</Text>
                        <TextInput placeholder="Full Name" style={styles.input} />
                        <TextInput placeholder="Email Address" style={styles.input} />
                        <TextInput placeholder="Subject" style={styles.input} />
                        <TextInput placeholder="Your Message" style={[styles.input, { height: 120 }]} multiline />
                        <AppButton title="Send Message" onPress={() => Alert.alert("Sent", "We will get back to you soon.")} />
                    </View>

                    <View style={styles.contactInfo}>
                        <View style={styles.mapContainer}>
                            <Image source={{ uri: MAP_URL }} style={styles.mapImg} />
                            <View style={styles.mapPin}>
                                <Ionicons name="location" size={30} color="#EF4444" />
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color="#002D62" />
                            <Text style={styles.infoText}>+63 (082) 285 1234</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail" size={20} color="#002D62" />
                            <Text style={styles.infoText}>info@tibungco.davao.gov</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>

        {/* --- 6. ENHANCED FOOTER --- */}
        <View style={styles.footer}>
            <View style={[styles.footerInner, { maxWidth: contentWidth }]}>
                <View style={[styles.footerGrid, { flexDirection: isMobile ? 'column' : 'row' }]}>
                    {/* Brand Column */}
                    <View style={styles.footerCol}>
                        <Text style={styles.footerLogo}>TIBUNGCO</Text>
                        <Text style={styles.footerDesc}>The official digital gateway for the residents of Barangay Tibungco, Davao City. Empowering the community through technology.</Text>
                        <View style={styles.socialRow}>
                            {['logo-facebook', 'logo-twitter', 'logo-youtube'].map(icon => (
                                <TouchableOpacity key={icon} style={styles.socialIcon}>
                                    <Ionicons name={icon} size={20} color="white" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Links Column */}
                    <View style={styles.footerCol}>
                        <Text style={styles.footerHeading}>Quick Links</Text>
                        {['Home', 'About', 'Contact', 'Login'].map(link => (
                            <TouchableOpacity key={link} onPress={() => link === 'Login' ? router.push('/login') : scrollTo(link.toLowerCase() as any)}>
                                <Text style={styles.footerLink}>{link}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Dev Column */}
                    <View style={styles.footerCol}>
                        <Text style={styles.footerHeading}>Developer Spotlight</Text>
                        <View style={styles.devCard}>
                            <Text style={styles.devName}>John Lester D. Defensor</Text>
                            <Text style={styles.devRole}>Full Stack Developer</Text>
                            <Text style={styles.devTag}>Lead System Architect</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footerDivider} />
                <Text style={styles.copyright}>© 2026 Barangay Tibungco, Davao City. All Rights Reserved. | System Version 1.0.4</Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helpers
function FeatureCard({ icon, title, desc }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.iconBox}><MaterialCommunityIcons name={icon} size={30} color="#002D62" /></View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Navbar
  navbar: { backgroundColor: '#002D62', paddingVertical: 12, zIndex: 100 },
  navInner: { alignSelf: 'center', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  seal: { width: 38, height: 38, marginRight: 10 },
  navLogoTitle: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 16, letterSpacing: 1 },
  navLogoSub: { color: '#60A5FA', fontFamily: 'Montserrat_500Medium', fontSize: 8 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navLink: { color: '#CBD5E0', fontFamily: 'Montserrat_600SemiBold', fontSize: 13 },
  navBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6 },

  // Hero
  hero: { height: 600, width: '100%' },
  heroOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  heroContent: { alignSelf: 'center', width: '100%' },
  heroPreTitle: { color: '#60A5FA', fontFamily: 'Montserrat_700Bold', letterSpacing: 3, fontSize: 11, marginBottom: 15 },
  heroMainTitle: { color: 'white', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 48, lineHeight: 56 },
  heroDesc: { color: '#E2E8F0', fontFamily: 'Montserrat_400Regular', fontSize: 18, marginTop: 20, maxWidth: 600, lineHeight: 28 },
  heroActions: { flexDirection: 'row', marginTop: 35, gap: 15, flexWrap: 'wrap' },
  secondaryBtn: { padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'white' },
  secondaryBtnText: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 16, fontWeight: '700' },

  // Sections
  whiteSection: { paddingVertical: 80, backgroundColor: 'white' },
  sectionInner: { alignSelf: 'center', width: '100%', paddingHorizontal: 20 },
  centeredHeader: { alignItems: 'center', marginBottom: 50 },
  sectionLabel: { color: '#0056b3', fontFamily: 'Montserrat_700Bold', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  sectionTitle: { color: '#0F172A', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, textAlign: 'center' },
  sectionSub: { color: '#64748B', fontFamily: 'Montserrat_400Regular', fontSize: 16, textAlign: 'center', marginTop: 15 },

  // Why Tibungco Cards
  featureGrid: { gap: 20 },
  featureCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  iconBox: { width: 50, height: 50, backgroundColor: 'white', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, marginBottom: 20 },
  featureTitle: { color: '#1E293B', fontFamily: 'Montserrat_700Bold', fontSize: 18, marginBottom: 10 },
  featureDesc: { color: '#475569', fontFamily: 'Montserrat_400Regular', lineHeight: 22, fontSize: 14 },

  // About Section
  aboutSection: { backgroundColor: '#F1F5F9', paddingVertical: 80 },
  aboutInner: { alignSelf: 'center', width: '100%', gap: 50, paddingHorizontal: 20 },
  aboutTextCol: { flex: 1.2 },
  bodyText: { color: '#334155', fontFamily: 'Montserrat_400Regular', fontSize: 15, lineHeight: 26, marginBottom: 15 },
  vmGrid: { marginTop: 20, gap: 15 },
  vmItem: { backgroundColor: 'white', padding: 20, borderRadius: 15 },
  vmTitle: { fontFamily: 'Montserrat_700Bold', color: '#002D62', fontSize: 16, marginBottom: 5 },
  vmDesc: { fontFamily: 'Montserrat_400Regular', color: '#64748B', fontSize: 13, lineHeight: 18 },
  aboutImgCol: { flex: 1 },
  aboutImg: { width: '100%', height: 400, borderRadius: 24 },

  // Contact
  contactGrid: { gap: 30 },
  contactForm: { flex: 1.2, backgroundColor: '#F8FAFC', padding: 30, borderRadius: 20 },
  formTitle: { fontFamily: 'Montserrat_700Bold', fontSize: 20, marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontFamily: 'Montserrat_400Regular', borderWidth: 1, borderColor: '#E2E8F0' },
  contactInfo: { flex: 1 },
  mapContainer: { height: 250, borderRadius: 20, overflow: 'hidden', marginBottom: 25 },
  mapImg: { width: '100%', height: '100%', opacity: 0.6 },
  mapPin: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  infoText: { fontFamily: 'Montserrat_500Medium', color: '#475569' },

  // FOOTER ENHANCEMENT
  footer: { backgroundColor: '#001A3D', paddingVertical: 60 },
  footerInner: { alignSelf: 'center', width: '100%', paddingHorizontal: 20 },
  footerGrid: { gap: 40 },
  footerCol: { flex: 1 },
  footerLogo: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 22, letterSpacing: 2, marginBottom: 15 },
  footerDesc: { color: '#94A3B8', fontFamily: 'Montserrat_400Regular', fontSize: 13, lineHeight: 22 },
  socialRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
  socialIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  footerHeading: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 16, marginBottom: 20 },
  footerLink: { color: '#94A3B8', fontFamily: 'Montserrat_500Medium', fontSize: 14, marginBottom: 12 },
  devCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  devName: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 16 },
  devRole: { color: '#60A5FA', fontSize: 12, fontFamily: 'Montserrat_600SemiBold', marginTop: 2 },
  devTag: { color: '#475569', fontSize: 11, marginTop: 10, fontStyle: 'italic' },
  footerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 40 },
  copyright: { color: '#475569', textAlign: 'center', fontSize: 12, fontFamily: 'Montserrat_400Regular' },

  // Mobile Drawer
  mobileDrawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  mobileDrawer: { width: '80%', height: '100%', alignSelf: 'flex-end', padding: 40 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 40 },
  drawerItems: { gap: 25 },
  drawerText: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 28 }
});