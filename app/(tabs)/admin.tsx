    import React, { useCallback, useEffect, useState } from 'react';
    import {
        ActivityIndicator, Alert, Image, KeyboardAvoidingView,
        Modal, Platform, RefreshControl, SafeAreaView,
        ScrollView, StyleSheet, Text, TextInput,
        TouchableOpacity, useWindowDimensions, View, FlatList
    } from 'react-native';
    import { Stack, useRouter } from 'expo-router';
    import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
    import { LinearGradient } from 'expo-linear-gradient';
    import { BlurView } from 'expo-blur';

    // Custom Fonts
    import { 
        useFonts, 
        Montserrat_400Regular, Montserrat_500Medium, 
        Montserrat_600SemiBold, Montserrat_700Bold 
    } from '@expo-google-fonts/montserrat';
    import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

    const API_URL = (process.env?.EXPO_PUBLIC_API_URL) || 'http://localhost:5000';

    export default function EnhancedAdminDashboard() {
        const { width } = useWindowDimensions();
        const router = useRouter();
        
        // --- STATE ---
        const [isLoading, setIsLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Data State
        const [totalResidents, setTotalResidents] = useState(0);
        const [updates, setUpdates] = useState([]);
        const [requests, setRequests] = useState([]); 

        // UI Modals
        const [isPostModalVisible, setPostModalVisible] = useState(false);
        const [isRequestModalVisible, setRequestModalVisible] = useState(false);

        // Form State (Announcements)
        const [postTitle, setPostTitle] = useState('');
        const [postDetails, setPostDetails] = useState('');
        const [postType, setPostType] = useState('Announcement'); 
        const [postDate, setPostDate] = useState('');

        // Load Fonts
        let [fontsLoaded] = useFonts({
            Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold,
            PlayfairDisplay_700Bold
        });

        // --- DATA FETCHING ---
        const fetchData = async () => {
            try {
                const [statsRes, annRes, reqRes] = await Promise.all([
                    fetch(`${API_URL}/api/stats`).catch(() => null),
                    fetch(`${API_URL}/api/announcements`).catch(() => null),
                    fetch(`${API_URL}/api/requests/admin/all`).catch(() => null)
                ]);

                if (statsRes) {
                    const statsData = await statsRes.json();
                    setTotalResidents(Number(statsData.totalResidents) || 0);
                }
                if (annRes) {
                    const annData = await annRes.json();
                    setUpdates(annData || []);
                }
                if (reqRes) {
                    const reqData = await reqRes.json();
                    console.log("Debug Requests Data:", reqData); // CHECK CONSOLE IF EMPTY
                    setRequests(Array.isArray(reqData) ? reqData : []);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
                setRefreshing(false);
            }
        };

        useEffect(() => { fetchData(); }, []);

        const onRefresh = useCallback(() => {
            setRefreshing(true);
            fetchData();
        }, []);

        // --- HANDLERS ---
        const handleUpdateStatus = async (id: number, newStatus: string) => {
            try {
                const response = await fetch(`${API_URL}/api/requests/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (response.ok) {
                    fetchData(); // Refresh list
                    Alert.alert("Success", `Request marked as ${newStatus}`);
                } else {
                    Alert.alert("Error", "Could not update status.");
                }
            } catch (error) {
                Alert.alert("Error", "Server connection failed.");
            }
        };

        const handleCreatePost = async () => {
            if (!postTitle || !postDate || !postDetails) {
                Alert.alert("Required", "Please fill in all fields.");
                return;
            }
            try {
                setIsSubmitting(true);
                const response = await fetch(`${API_URL}/api/announcements`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: postTitle,
                        details: postDetails,
                        type: postType,
                        scheduled_date: postDate,
                        author_name: "Barangay Admin" 
                    }),
                });
                if (response.ok) {
                    fetchData();
                    setPostModalVisible(false);
                    setPostTitle(''); setPostDetails(''); setPostDate('');
                }
            } catch (error) { Alert.alert("Error", "Server connection failed."); }
            finally { setIsSubmitting(false); }
        };

        const handleDeleteAnnouncement = (id: number) => {
            Alert.alert("Delete Post", "Remove this update permanently?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    await fetch(`${API_URL}/api/announcements/${id}`, { method: 'DELETE' });
                    fetchData();
                }}
            ]);
        };

        if (!fontsLoaded || isLoading) return (
            <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color="#002D62" />
            </View>
        );

        const isMobile = width < 768;
        const contentWidth = isMobile ? '92%' : 1000;

        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                
                {/* --- 1. NAVBAR --- */}
                <View style={styles.navbarContainer}>
                    <BlurView intensity={Platform.OS === 'ios' ? 30 : 100} tint="light" style={styles.navbarBlur}>
                        <View style={[styles.navInner, { maxWidth: contentWidth }]}>
                            <View style={styles.logoGroup}>
                                <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Davao_City_Ph_official_seal.png' }} style={styles.seal} />
                                <View>
                                    <Text style={styles.navLogoTitle}>ADMIN</Text>
                                    <Text style={styles.navLogoSub}>DASHBOARD CONTROL</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
                                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>

                <ScrollView 
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002D62" />}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View style={[styles.mainBody, { maxWidth: contentWidth }]}>
                        
                        <View style={styles.headerFlex}>
                            <Text style={styles.sectionLabel}>SYSTEM OVERVIEW</Text>
                            <Text style={[styles.sectionTitle, { fontSize: isMobile ? 32 : 42 }]}>Management Portal</Text>
                        </View>

                        {/* --- 2. STATS CARDS --- */}
                        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 15, marginBottom: 20 }}>
                            <LinearGradient colors={['#002D62', '#004A99']} style={[styles.heroStatsCard, { flex: 1 }]}>
                                <View style={styles.statInfo}>
                                    <MaterialCommunityIcons name="account-group" size={32} color="#60A5FA" />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.statValue}>{totalResidents.toLocaleString()}</Text>
                                        <Text style={styles.statLabel}>Registered Residents</Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            <TouchableOpacity 
                                style={[styles.heroStatsCard, styles.whiteCard, { flex: 1 }]}
                                onPress={() => setRequestModalVisible(true)}
                            >
                                <View style={styles.statInfo}>
                                    <MaterialCommunityIcons name="file-document-edit" size={32} color="#3B82F6" />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.statValue, { color: '#0F172A' }]}>{requests.length}</Text>
                                        <Text style={[styles.statLabel, { color: '#64748B' }]}>Active Requests</Text>
                                    </View>
                                </View>
                                <Text style={styles.clickHint}>Review Submissions →</Text>
                            </TouchableOpacity>
                        </View>

                        {/* --- 3. QUICK ACTIONS --- */}
                        <Text style={styles.subHeading}>Broadcast Tools</Text>
                        <View style={[styles.actionRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                            <TouchableOpacity style={styles.actionCard} onPress={() => { setPostType('Announcement'); setPostModalVisible(true); }}>
                                <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                                    <Ionicons name="megaphone" size={24} color="#4338CA" />
                                </View>
                                <View>
                                    <Text style={styles.actionTitle}>Push Announcement</Text>
                                    <Text style={styles.actionDesc}>General news and urgent alerts</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionCard} onPress={() => { setPostType('Event'); setPostModalVisible(true); }}>
                                <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="calendar" size={24} color="#15803D" />
                                </View>
                                <View>
                                    <Text style={styles.actionTitle}>Create Event</Text>
                                    <Text style={styles.actionDesc}>Medical missions & meetings</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* --- 4. PORTAL FEED --- */}
                        <View style={styles.feedHeader}>
                            <Text style={styles.subHeading}>Portal Feed</Text>
                            <Text style={styles.dbCount}>{updates.length} Active Posts</Text>
                        </View>

                        {updates.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={60} color="#E2E8F0" />
                                <Text style={styles.emptyText}>No recent updates posted.</Text>
                            </View>
                        ) : (
                            updates.map((item: any) => (
                                <View key={item.id} style={styles.feedCard}>
                                    <View style={styles.cardTop}>
                                        <View style={[styles.typeBadge, { backgroundColor: item.type === 'Event' ? '#F0FDF4' : '#EFF6FF' }]}>
                                            <Text style={[styles.cardType, { color: item.type === 'Event' ? '#16A34A' : '#2563EB' }]}>{item.type}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteAnnouncement(item.id)}>
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardDetails}>{item.details}</Text>
                                    <View style={styles.cardFooter}>
                                        <Ionicons name="time-outline" size={14} color="#94A3B8" />
                                        <Text style={styles.footerDate}>{item.scheduled_date}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* --- 5. DOCUMENT REQUESTS MODAL --- */}
                <Modal visible={isRequestModalVisible} animationType="slide">
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                        <View style={styles.requestModalHeader}>
                            <View>
                                <Text style={styles.requestModalTitle}>Resident Requests</Text>
                                <Text style={styles.requestModalSub}>Tibungco Connect Document Services</Text>
                            </View>
                            <TouchableOpacity onPress={() => setRequestModalVisible(false)} style={styles.closeModalBtn}>
                                <Ionicons name="close" size={28} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={requests}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ padding: 20 }}
                            renderItem={({ item }) => (
                                <View style={styles.requestItemCard}>
                                    <View style={styles.requestHeader}>
                                        <Text style={styles.requestName}>{item.resident_name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? '#FEF3C7' : '#DCFCE7' }]}>
                                            <Text style={[styles.statusText, { color: item.status === 'Pending' ? '#92400E' : '#166534' }]}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.requestDocType}>{item.document_type}</Text>
                                    <View style={styles.purposeBox}>
                                        <Text style={styles.purposeLabel}>PURPOSE:</Text>
                                        <Text style={styles.purposeText}>{item.purpose}</Text>
                                    </View>
                                    
                                    {item.status === 'Pending' && (
                                        <TouchableOpacity 
                                            style={styles.completeBtn} 
                                            onPress={() => handleUpdateStatus(item.id, 'Completed')}
                                        >
                                            <Ionicons name="checkmark-circle" size={18} color="white" />
                                            <Text style={styles.completeBtnText}>Mark as Completed</Text>
                                        </TouchableOpacity>
                                    )}

                                    <View style={styles.requestFooter}>
                                        <Text style={styles.requestEmail}>{item.resident_email}</Text>
                                        <Text style={styles.requestDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="file-tray-outline" size={60} color="#CBD5E1" />
                                    <Text style={styles.emptyText}>No requests in database.</Text>
                                </View>
                            }
                        />
                    </SafeAreaView>
                </Modal>

                {/* --- 6. CREATE POST MODAL --- */}
                <Modal visible={isPostModalVisible} animationType="slide" transparent={true}>
                    <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.modalOverlay}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"} style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Compose {postType}</Text>
                                    <TouchableOpacity onPress={() => setPostModalVisible(false)}>
                                        <Ionicons name="close-circle" size={32} color="#CBD5E1" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.inputLabel}>Subject Title</Text>
                                <TextInput style={styles.input} placeholder="Headline..." value={postTitle} onChangeText={setPostTitle} />
                                
                                <Text style={styles.inputLabel}>Content Details</Text>
                                <TextInput 
                                    style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
                                    placeholder="Write message..." multiline 
                                    value={postDetails} onChangeText={setPostDetails} 
                                />

                                <Text style={styles.inputLabel}>Target Schedule</Text>
                                <TextInput style={styles.input} placeholder="e.g. Jan 25, 2026" value={postDate} onChangeText={setPostDate} />

                                <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePost} disabled={isSubmitting}>
                                    <LinearGradient colors={['#002D62', '#004A99']} style={styles.submitGrad}>
                                        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Publish to Public Portal</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </BlurView>
                </Modal>
            </SafeAreaView>
        );
    }

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        
        // Navbar
        navbarContainer: { zIndex: 100 },
        navbarBlur: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
        navInner: { alignSelf: 'center', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
        logoGroup: { flexDirection: 'row', alignItems: 'center' },
        seal: { width: 35, height: 35, marginRight: 12 },
        navLogoTitle: { color: '#002D62', fontFamily: 'Montserrat_700Bold', fontSize: 16 },
        navLogoSub: { color: '#64748B', fontFamily: 'Montserrat_500Medium', fontSize: 8, letterSpacing: 1 },
        logoutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },

        mainBody: { alignSelf: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 30 },
        headerFlex: { marginBottom: 25 },
        sectionLabel: { color: '#3B82F6', fontFamily: 'Montserrat_700Bold', letterSpacing: 1.5, fontSize: 11, marginBottom: 5 },
        sectionTitle: { color: '#0F172A', fontFamily: 'PlayfairDisplay_700Bold' },
        subHeading: { fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#1E293B', marginTop: 30, marginBottom: 15 },

        // Stats Card
        heroStatsCard: { padding: 25, borderRadius: 24, elevation: 5, shadowOpacity: 0.1, shadowRadius: 10 },
        whiteCard: { backgroundColor: 'white', borderWidth: 1, borderColor: '#F1F5F9' },
        statInfo: { flexDirection: 'row', alignItems: 'center' },
        statValue: { fontSize: 32, fontFamily: 'Montserrat_700Bold', color: 'white' },
        statLabel: { fontSize: 12, color: '#CBD5E1', fontFamily: 'Montserrat_500Medium' },
        clickHint: { fontSize: 11, fontFamily: 'Montserrat_700Bold', color: '#3B82F6', marginTop: 10 },

        // Actions
        actionRow: { gap: 15 },
        actionCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: '#E2E8F0' },
        actionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
        actionTitle: { fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#1E293B' },
        actionDesc: { fontSize: 12, color: '#64748B', fontFamily: 'Montserrat_400Regular' },

        // Feed
        feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
        dbCount: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold', color: '#3B82F6' },
        feedCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
        cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
        typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
        cardType: { fontFamily: 'Montserrat_700Bold', fontSize: 10 },
        deleteBtn: { padding: 8, backgroundColor: '#FFF1F2', borderRadius: 10 },
        cardTitle: { fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#1E293B', marginBottom: 8 },
        cardDetails: { color: '#475569', fontSize: 14, fontFamily: 'Montserrat_400Regular', lineHeight: 22, marginBottom: 15 },
        cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        footerDate: { fontSize: 12, color: '#94A3B8', fontFamily: 'Montserrat_500Medium' },

        // Requests Modal
        requestModalHeader: { padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
        requestModalTitle: { fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold', color: '#002D62' },
        requestModalSub: { fontSize: 11, fontFamily: 'Montserrat_600SemiBold', color: '#64748B' },
        closeModalBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
        requestItemCard: { backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
        requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
        requestName: { fontSize: 17, fontFamily: 'Montserrat_700Bold', color: '#1E293B' },
        statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
        statusText: { fontSize: 10, fontFamily: 'Montserrat_700Bold' },
        requestDocType: { fontSize: 15, fontFamily: 'Montserrat_600SemiBold', color: '#3B82F6', marginBottom: 12 },
        purposeBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 15 },
        purposeLabel: { fontSize: 9, fontFamily: 'Montserrat_700Bold', color: '#94A3B8', marginBottom: 4 },
        purposeText: { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: '#334155' },
        
        // Complete Button
        completeBtn: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 15 },
        completeBtnText: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 13 },

        requestFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
        requestEmail: { fontSize: 11, color: '#64748B', fontFamily: 'Montserrat_400Regular' },
        requestDate: { fontSize: 11, color: '#94A3B8', fontFamily: 'Montserrat_600SemiBold' },

        emptyContainer: { padding: 80, alignItems: 'center' },
        emptyText: { color: '#94A3B8', marginTop: 15, fontFamily: 'Montserrat_500Medium' },

        // Modal Style
        modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
        modalContainer: { width: '100%', maxWidth: 500 },
        modalContent: { backgroundColor: 'white', borderRadius: 32, padding: 30 },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
        modalTitle: { fontSize: 24, fontFamily: 'PlayfairDisplay_700Bold', color: '#002D62' },
        inputLabel: { fontSize: 12, fontFamily: 'Montserrat_700Bold', color: '#64748B', marginBottom: 8, marginLeft: 5 },
        input: { backgroundColor: '#F1F5F9', borderRadius: 16, padding: 18, marginBottom: 20, fontFamily: 'Montserrat_500Medium' },
        submitBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 10 },
        submitGrad: { paddingVertical: 20, alignItems: 'center' },
        submitText: { color: 'white', fontFamily: 'Montserrat_700Bold', fontSize: 16 }
    });