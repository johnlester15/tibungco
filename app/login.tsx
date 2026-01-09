import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform, 
  ScrollView,
  StyleSheet,
  Text,
  TextInput, 
  TouchableOpacity,
  useWindowDimensions,
  View,
  SafeAreaView
} from 'react-native';

// --- PROJECT COMPONENTS ---
import AppButton from '../components/AppButton';
import { Typography } from '../constants/Colors';

const LOGIN_BG = "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=2000";

export default function LoginPage() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isDesktop = width >= 1024;

  useEffect(() => {
    if (errorMessage) setErrorMessage('');
  }, [email, password]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. ADMIN BYPASS
    if (normalizedEmail === 'tibungco@gmail.com' && cleanPassword === '123') {
      await AsyncStorage.setItem('user', JSON.stringify({ role: 'admin', email: normalizedEmail }));
      setLoading(false);
      router.replace('/(tabs)/admin');
      return;
    }

    // 2. RESIDENT LOGIN
    try {
      // Dynamic API base: prefer explicit env override, otherwise use
      // the current web origin (when running in browser) or localhost for dev.
      // For mobile emulators/devices set `EXPO_PUBLIC_API_URL` to your machine IP.
      const PRODUCTION_FALLBACK = 'https://tibungcoh.vercel.app';
      const DEFAULT_LOCAL = 'http://localhost:5000';
      let API_BASE = process.env.EXPO_PUBLIC_API_URL;
      if (!API_BASE) {
        const origin = (typeof globalThis !== 'undefined' && (globalThis as any).location?.origin) || '';
        // If running on a local dev server (expo web / localhost), prefer the local backend
        const isLocalWeb = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('19006');
        if (origin && isLocalWeb) {
          API_BASE = DEFAULT_LOCAL;
        } else if (origin) {
          API_BASE = origin; // production where frontend and backend share origin
        } else {
          API_BASE = PRODUCTION_FALLBACK; // fallback to deployed backend
        }
      }
      // Helpful debug: show which API host the client will call
      console.log('Using API_BASE ->', API_BASE);
      
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: cleanPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/(tabs)/home');
      } else {
        setErrorMessage(data.error || "Invalid email or password.");
      }
    } catch (error) {
      setErrorMessage("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back to Home Button */}
      <TouchableOpacity 
        onPress={() => router.push('/')} 
        style={[styles.globalBack, isDesktop ? styles.backWeb : styles.backMobile]}
      > 
        <Ionicons name="arrow-back" size={20} color={isDesktop ? "#FFFFFF" : "#1E293B"} />
        <Text style={[styles.backText, { color: isDesktop ? "#FFFFFF" : "#1E293B" }]}>Back to Home</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.mainWrapper, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          
          {isDesktop && (
            <View style={styles.sidePanel}>
              <ImageBackground source={{ uri: LOGIN_BG }} style={styles.bgImage}>
                <LinearGradient colors={['rgba(0,45,98,0.4)', '#002D62']} style={styles.imageOverlay}>
                  <View style={styles.brandOverlayContent}>
                    <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} style={styles.largeSeal} />
                    <Text style={styles.overlayTitle}>Tibungco Connect</Text>
                    <Text style={styles.overlaySub}>Empowering every resident through digital-first governance.</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          )}

          <View style={[styles.formPanel, { width: isDesktop ? '40%' : '100%' }]}>
            <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: isDesktop ? height : 'auto' }]} showsVerticalScrollIndicator={false}>
              {!isDesktop && (
                <View style={styles.mobileHeader}>
                  <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} style={styles.mobileSeal} />
                  <Text style={styles.mobileBrand}>TIBUNGCO CONNECT</Text>
                </View>
              )}

              <View style={styles.formCard}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.instructionText}>Please sign in to your resident portal account.</Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
                    <TextInput 
                      placeholder="e.g. juan.delacruz@email.com"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      placeholderTextColor="#A0AEC0"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity><Text style={styles.forgotLink}>Forgot Password?</Text></TouchableOpacity>
                  </View>
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

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#E53E3E" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* --- FIXED BUTTON --- */}
                <AppButton 
                  title={loading ? "Signing In..." : "Sign In to Portal"} 
                  onPress={handleLogin} 
                  style={[styles.loginBtn, loading && { opacity: 0.8 }]}
                  disabled={loading}
                />

                <View style={styles.divider}>
                  <View style={styles.line} /><Text style={styles.dividerText}>OR</Text><View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleBtn}>
                  <Ionicons name="logo-google" size={20} color="#1A202C" />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.footerLinks}>
                  <Text style={styles.footerText}>Not registered yet? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.signupLink}>Create an Account</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mainWrapper: { flex: 1 },
  globalBack: { position: 'absolute', zIndex: 200, flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8 },
  backMobile: { top: 10, left: 10, backgroundColor: 'rgba(241, 245, 249, 0.9)' },
  backWeb: { top: 30, left: 30 },
  backText: { marginLeft: 8, fontFamily: Typography.bodySemiBold, fontSize: 14 },
  sidePanel: { flex: 1.5, backgroundColor: '#002D62' },
  bgImage: { flex: 1 },
  imageOverlay: { flex: 1, justifyContent: 'center', padding: 80 },
  largeSeal: { width: 100, height: 100, marginBottom: 30 },
  overlayTitle: { fontFamily: Typography.heading, fontSize: 48, color: 'white', marginBottom: 20 },
  overlaySub: { fontFamily: Typography.body, fontSize: 18, color: '#CBD5E0', lineHeight: 28, maxWidth: 500 },
  formPanel: { backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 60 },
  formCard: { alignSelf: 'center', width: '100%', maxWidth: 420 },
  mobileHeader: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  mobileSeal: { width: 60, height: 60, marginBottom: 10 },
  mobileBrand: { fontFamily: Typography.bodyBold, fontSize: 18, color: '#002D62', letterSpacing: 1 },
  welcomeText: { fontFamily: Typography.heading, fontSize: 32, color: '#1A202C', marginBottom: 8 },
  instructionText: { fontFamily: Typography.body, fontSize: 15, color: '#718096', marginBottom: 35 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontFamily: Typography.bodySemiBold, fontSize: 14, color: '#2D3748' },
  forgotLink: { fontFamily: Typography.bodySemiBold, fontSize: 13, color: '#0056b3' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 55, backgroundColor: '#F8FAFC' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: Typography.body, fontSize: 15, color: '#1A202C' },
  loginBtn: { height: 55, borderRadius: 12 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 12, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#FEB2B2' },
  errorText: { color: '#E53E3E', fontSize: 14, fontFamily: Typography.bodySemiBold, marginLeft: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 15, fontFamily: Typography.bodySemiBold, fontSize: 12, color: '#A0AEC0' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, height: 55, gap: 12 },
  googleBtnText: { fontFamily: Typography.bodySemiBold, fontSize: 15, color: '#1A202C' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { fontFamily: Typography.body, color: '#718096', fontSize: 15 },
  signupLink: { fontFamily: Typography.bodyBold, color: '#002D62', fontSize: 15 }
});