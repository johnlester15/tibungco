import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
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

// --- PROJECT CONSTANTS & COMPONENTS ---
import AppButton from '../components/AppButton';
import { Typography } from '../constants/Colors';

const REGISTER_BG = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000";

export default function RegisterPage() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isDesktop = width >= 1024;

  useEffect(() => {
    if (errorMessage) setErrorMessage('');
  }, [email, fullName, password, phone]);

  const handleRegister = async () => {
    setErrorMessage('');
    if (!agreeTerms) {
      Alert.alert("Required", "Please agree to the Terms and Conditions.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const PRODUCTION_FALLBACK = 'https://tibungcoh.vercel.app';
      const DEFAULT_LOCAL = 'http://localhost:5000';
      let API_BASE = process.env?.EXPO_PUBLIC_API_URL;
      if (!API_BASE) {
        const origin = (typeof globalThis !== 'undefined' && (globalThis as any).location?.origin) || '';
        const isLocalWeb = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('19006');
        if (origin && isLocalWeb) API_BASE = DEFAULT_LOCAL;
        else if (origin) API_BASE = origin;
        else API_BASE = PRODUCTION_FALLBACK;
      }
      console.log('Using API_BASE ->', API_BASE);

      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/login');
      } else {
        setErrorMessage(data?.error || "Registration failed");
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMessage("Connection Error: Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. GLOBAL BACK BUTTON (Goes to Index/Home) */}
      <TouchableOpacity 
        onPress={() => router.push('/')} 
        style={[styles.globalBack, isDesktop ? styles.backWeb : styles.backMobile]}
      > 
        <Ionicons 
            name="arrow-back" 
            size={20} 
            color={isDesktop ? "#FFFFFF" : "#1E293B"} 
        />
        <Text style={[
            styles.backText, 
            { color: isDesktop ? "#FFFFFF" : "#1E293B" }
        ]}>
            Back to Home
        </Text>
      </TouchableOpacity>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.mainWrapper, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          
          {/* --- LEFT SIDE: BRANDING (Desktop Only) --- */}
          {isDesktop && (
            <View style={styles.sidePanel}>
              <ImageBackground source={{ uri: REGISTER_BG }} style={styles.bgImage}>
                <LinearGradient 
                  colors={['rgba(0,45,98,0.4)', '#002D62']} 
                  style={styles.imageOverlay}
                >
                  <View style={styles.brandOverlayContent}>
                    <Image 
                      source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} 
                      style={styles.largeSeal} 
                    />
                    <Text style={styles.overlayTitle}>Join the Community</Text>
                    <Text style={styles.overlaySub}>Access Barangay Tibungco's digital services in one click.</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          )}

          {/* --- RIGHT SIDE: REGISTER FORM --- */}
          <View style={[styles.formPanel, { width: isDesktop ? '40%' : '100%' }]}>
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { minHeight: isDesktop ? height : 'auto' }]} 
                showsVerticalScrollIndicator={false}
            >
              
              {/* Mobile Branding Header */}
              {!isDesktop && (
                <View style={styles.mobileHeader}>
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} 
                    style={styles.mobileSeal} 
                  />
                  <Text style={styles.mobileBrand}>TIBUNGCO CONNECT</Text>
                </View>
              )}

              <View style={styles.formCard}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.instructionText}>Register to get started with your resident portal.</Text>

                <InputGroup label="Full Name" icon="person-outline" placeholder="Juan Delacruz" value={fullName} onChange={setFullName} />
                <InputGroup label="Email Address" icon="mail-outline" placeholder="juan@example.com" value={email} onChange={setEmail} keyboardType="email-address" />
                <InputGroup label="Phone Number" icon="call-outline" placeholder="0912 345 6789" value={phone} onChange={setPhone} keyboardType="phone-pad" />

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
                    <TextInput 
                      placeholder="••••••••"
                      style={styles.input}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholderTextColor="#A0AEC0"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#718096" />
                    </TouchableOpacity>
                  </View>
                </View>

                <InputGroup label="Confirm Password" icon="lock-closed-outline" placeholder="••••••••" value={confirmPassword} onChange={setConfirmPassword} secureTextEntry={true} />

                <TouchableOpacity style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
                    <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                        {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text style={styles.termsText}>I agree to the Terms & Privacy Policy</Text>
                </TouchableOpacity>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#E53E3E" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <AppButton 
                  title={loading ? "Creating..." : "Register Account"} 
                  onPress={handleRegister} 
                  style={[styles.loginBtn, (!agreeTerms || loading) && { opacity: 0.7 }]}
                  disabled={!agreeTerms || loading}
                />

                {/* 2. BACK TO LOGIN LINK */}
                <View style={styles.footerLinks}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.signupLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputGroup({ label, icon, placeholder, value, onChange, keyboardType = 'default', secureTextEntry = false }) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name={icon} size={20} color="#718096" style={styles.inputIcon} />
                <TextInput 
                    placeholder={placeholder} 
                    style={styles.input} 
                    value={value} 
                    onChangeText={onChange} 
                    keyboardType={keyboardType} 
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor="#A0AEC0"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mainWrapper: { flex: 1 },
  
  // Navigation
  globalBack: { 
    position: 'absolute', 
    zIndex: 200, 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  backMobile: { top: 10, left: 10, backgroundColor: 'rgba(241, 245, 249, 0.8)' },
  backWeb: { top: 30, left: 30 },
  backText: { marginLeft: 8, fontFamily: Typography.bodySemiBold, fontSize: 14 },

  // Side Panel
  sidePanel: { flex: 1.5, backgroundColor: '#002D62' },
  bgImage: { flex: 1 },
  imageOverlay: { flex: 1, justifyContent: 'center', padding: 60 },
  largeSeal: { width: 90, height: 90, marginBottom: 25 },
  overlayTitle: { fontFamily: Typography.heading, fontSize: 42, color: 'white', marginBottom: 15 },
  overlaySub: { fontFamily: Typography.body, fontSize: 17, color: '#CBD5E0', lineHeight: 26, maxWidth: 450 },

  // Form Panel
  formPanel: { backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 25, paddingVertical: 60 },
  formCard: { alignSelf: 'center', width: '100%', maxWidth: 420 },

  // Mobile Header
  mobileHeader: { alignItems: 'center', marginBottom: 25, marginTop: 20 },
  mobileSeal: { width: 50, height: 50, marginBottom: 10 },
  mobileBrand: { fontFamily: Typography.bodyBold, fontSize: 16, color: '#002D62', letterSpacing: 1 },

  welcomeText: { fontFamily: Typography.heading, fontSize: 28, color: '#1A202C', marginBottom: 6 },
  instructionText: { fontFamily: Typography.body, fontSize: 14, color: '#718096', marginBottom: 25 },
  
  inputGroup: { marginBottom: 16 },
  label: { fontFamily: Typography.bodySemiBold, fontSize: 13, color: '#4A5568', marginBottom: 6 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 15,
    height: 52,
    backgroundColor: '#F8FAFC'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: Typography.body, fontSize: 15, color: '#1A202C' },

  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#CBD5E0', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#002D62', borderColor: '#002D62' },
  termsText: { fontFamily: Typography.body, fontSize: 13, color: '#4A5568' },

  loginBtn: { height: 52, borderRadius: 12 },

  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#FEB2B2' },
  errorText: { color: '#E53E3E', fontSize: 13, fontFamily: Typography.bodySemiBold, marginLeft: 8 },

  footerLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { fontFamily: Typography.body, color: '#718096', fontSize: 14 },
  signupLink: { fontFamily: Typography.bodyBold, color: '#002D62', fontSize: 14 }
});