import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, COLORS } from '../styles/theme';
import { auth, db, storage } from '../services/FirebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// --- STEP 1: Added collection and getDocs to imports ---
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
// --- STEP 1: Added useFocusEffect to imports ---
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || '');
  const [userRole, setUserRole] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Profile Edit Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings Modal States
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  // Dynamic Preferences States 
  const [isPrefModalVisible, setIsPrefModalVisible] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [customGenreInput, setCustomGenreInput] = useState('');
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [artistInput, setArtistInput] = useState('');
  const [isInstrumentalOnly, setIsInstrumentalOnly] = useState(false);

  // --- STEP 2: State for Playlist Count ---
  const [savedPlaylistsCount, setSavedPlaylistsCount] = useState(0);

  const AVAILABLE_GENRES = ['Lo-Fi', 'Rock', 'Jazz', 'Acoustic', 'Classical', 'Ambient', 'Pop', 'Electronic', 'Piano'];

  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');
        setEmail(currentUser.email || '');
        setImageError(false);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role || 'user');

            setFavoriteGenres(userData.favoriteGenres || []);
            setFavoriteArtists(userData.favoriteArtists || []);
            setIsInstrumentalOnly(userData.isInstrumentalOnly || false);
          }

          await currentUser.reload();
          setDisplayName(auth.currentUser?.displayName || '');
          setPhotoURL(auth.currentUser?.photoURL || '');
        } catch (e) {
          console.log("Error reloading profile:", e);
        }
      } else {
        setUserRole(null);
      }
    });
    return unsubscribe;
  }, []);

  // --- STEP 2: useFocusEffect to refresh count every time tab is opened ---
  useFocusEffect(
    useCallback(() => {
      const fetchCount = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
          const snap = await getDocs(collection(db, "users", userId, "saved_playlists"));
          setSavedPlaylistsCount(snap.docs.length);
        } catch (e) {
          console.error("Error fetching count:", e);
        }
      };
      fetchCount();
    }, [])
  );

  const uploadPicture = async () => {
    const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (requestResult.status !== 'granted') {
      Alert.alert(t('alertPermissionTitle'), t('alertPermissionMsg'));
    } else {
      const imageResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (imageResult.canceled == true) {
        return;
      } else {
        setIsUpdating(true);
        try {
          const localUri = imageResult.assets[0].uri
          const response = await fetch(localUri);
          const blob = await response.blob();
          const fileRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`)
          const uploadResult = await uploadBytes(fileRef, blob);
          const downloadURL = await getDownloadURL(uploadResult.ref);
          setNewPhotoURL(downloadURL);
        } catch (error) {
          Alert.alert(t('alertErrorTitle'), error.message);
          console.log("Full Upload Error:", error);
        } finally {
          setIsUpdating(false);
        }
      }
    }
  }

  const handleUpdateProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!newName || newName.trim() === '') {
      Alert.alert(t('alertValidationTitle'), t('alertValidationMsg'));
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile(currentUser, {
        displayName: newName,
        photoURL: newPhotoURL,
      });

      const docReference = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docReference, {
        displayName: newName,
        photoURL: newPhotoURL,
      });

      await currentUser.reload();
      setImageError(false);
      setDisplayName(newName);
      setPhotoURL(newPhotoURL);

      Alert.alert(t('alertSuccessTitle'), t('alertSuccessMsg'));
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert(t('alertErrorTitle'), error.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsUpdating(true);
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        favoriteGenres,
        favoriteArtists,
        isInstrumentalOnly
      });
      setIsPrefModalVisible(false);
    } catch (error) {
      Alert.alert(t('alertErrorTitle') || 'Error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleGenre = (genre) => {
    setFavoriteGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    const trimmed = customGenreInput.trim();
    if (trimmed && !favoriteGenres.includes(trimmed)) {
      setFavoriteGenres(prev => [...prev, trimmed]);
      setCustomGenreInput('');
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setFavoriteGenres(prev => prev.filter(g => g !== genreToRemove));
  };

  const handleAddArtist = () => {
    const trimmed = artistInput.trim();
    if (trimmed && !favoriteArtists.includes(trimmed)) {
      setFavoriteArtists(prev => [...prev, trimmed]);
      setArtistInput('');
    }
  };

  const handleRemoveArtist = (artistToRemove) => {
    setFavoriteArtists(prev => prev.filter(a => a !== artistToRemove));
  };

  const handleLogout = () => {
    Alert.alert(t('alertLogoutTitle'), t('alertLogoutMsg'), [
      { text: t('cancelButton'), style: "cancel" },
      { text: t('logout'), onPress: () => signOut(auth), style: "destructive" }
    ]);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pt' : 'en');
  };

  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <View style={styles.profileAvatar}>
            {photoURL && !imageError ? (
              <Image
                source={{ uri: photoURL }}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>👤</Text>
            )}
          </View>
          <Text style={styles.userName}>{displayName || t('defaultUserName')}</Text>
          <Text style={styles.userEmail}>{email || t('noEmailLinked')}</Text>
        </View>

        {/* Admin Section */}
        {userRole === 'admin' && (
          <View style={globalStyles.sectionContainer}>
            <Text style={globalStyles.sectionTitle}>{t('adminSection')}</Text>

            <TouchableOpacity style={globalStyles.listItem}
              onPress={() => navigation.navigate('AdminScreen')}
            >
              <View style={[globalStyles.listItemIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Text>⏳</Text>
              </View>
              <View style={globalStyles.listItemTextContainer}>
                <Text style={globalStyles.listItemTitle}>{t('pendingLocation')}</Text>
              </View>
              <Text style={globalStyles.listItemChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.listItem}
              onPress={() => navigation.navigate('AdminEditPlacesScreen')}
            >
              <View style={[globalStyles.listItemIconBox, { backgroundColor: '#E1BEE7' }]}>
                <Text>📝</Text>
              </View>
              <View style={globalStyles.listItemTextContainer}>
                <Text style={globalStyles.listItemTitle}>{t('Edit Places')}</Text>
              </View>
              <Text style={globalStyles.listItemChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.listItem}
              onPress={() => navigation.navigate('AdminEditOptionsScreen')}
            >
              <View style={[globalStyles.listItemIconBox, { backgroundColor: '#D1C4E9' }]}>
                <Text>⚙️</Text>
              </View>
              <View style={globalStyles.listItemTextContainer}>
                <Text style={globalStyles.listItemTitle}>{t('editOptions')}</Text>
              </View>
              <Text style={globalStyles.listItemChevron}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Collection Section */}
        <View style={globalStyles.sectionContainer}>
          <Text style={globalStyles.sectionTitle}>{t('myCollectionSection')}</Text>

          {/* Navigates to your new SavedPlaylistsScreen */}
          <TouchableOpacity
            style={globalStyles.listItem}
            onPress={() => navigation.navigate('SavedPlaylistsScreen')}
          >
            <View style={[globalStyles.listItemIconBox, { backgroundColor: '#E8F0FE' }]}>
              <Text>🎵</Text>
            </View>
            <View style={globalStyles.listItemTextContainer}>
              <Text style={globalStyles.listItemTitle}>{t('savedPlaylists')}</Text>

              {/* --- STEP 3: Dynamic Item Count --- */}
              <Text style={globalStyles.listItemSubtitle}>
                {savedPlaylistsCount} {savedPlaylistsCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <Text style={globalStyles.listItemChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={globalStyles.listItem}
            onPress={() => navigation.navigate('FavoriteLocations')}
          >
            <View style={[globalStyles.listItemIconBox, { backgroundColor: '#FFEBEE' }]}>
              <Text>❤️</Text>
            </View>
            <View style={globalStyles.listItemTextContainer}>
              <Text style={globalStyles.listItemTitle}>{t('favouriteLocationsTitle')}</Text>
            </View>
            <Text style={globalStyles.listItemChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={globalStyles.sectionContainer}>
          <Text style={globalStyles.sectionTitle}>{t('accountSection')}</Text>

          <TouchableOpacity
            style={globalStyles.listItem}
            onPress={() => {
              setNewName(displayName);
              setNewPhotoURL(photoURL);
              setIsModalVisible(true);
            }}
          >
            <View style={[globalStyles.listItemIconBox, { backgroundColor: '#F8F9FA' }]}>
              <Text>✏️</Text>
            </View>
            <View style={globalStyles.listItemTextContainer}>
              <Text style={globalStyles.listItemTitle}>{t('editProfile')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={globalStyles.listItem}
            onPress={() => setIsPrefModalVisible(true)}
          >
            <View style={[globalStyles.listItemIconBox, { backgroundColor: '#F8F9FA' }]}>
              <Text>🎧</Text>
            </View>
            <View style={globalStyles.listItemTextContainer}>
              <Text style={globalStyles.listItemTitle}>{t('preferencesTitle')}</Text>
            </View>
            <Text style={globalStyles.listItemChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={globalStyles.listItem}
            onPress={() => setIsSettingsModalVisible(true)}
          >
            <View style={[globalStyles.listItemIconBox, { backgroundColor: '#F8F9FA' }]}>
              <Text>⚙️</Text>
            </View>
            <View style={globalStyles.listItemTextContainer}>
              <Text style={globalStyles.listItemTitle}>{t('settings')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.listItem} onPress={handleLogout}>
            <View style={[globalStyles.listItemIconBox, { backgroundColor: '#F8F9FA' }]}>
              <Text>🚪</Text>
            </View>
            <View style={globalStyles.listItemTextContainer}>
              <Text style={[globalStyles.listItemTitle, { color: COLORS.accent }]}>{t('logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('editProfileTitle')}</Text>

            <Text style={styles.inputLabel}>{t('displayNameLabel')}</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder={t('enterYourNamePlaceholder')}
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>{t('profilePictureLabel')}</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadPicture}
              disabled={isUpdating}
            >
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadButtonText}>{t('uploadFromDevice')}</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>{t('cancelButton')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('saveButton')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preferences Modal Layout */}
      <Modal
        visible={isPrefModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPrefModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '95%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{t('musicPreferencesTitle')}</Text>

              {/* Genres Section */}
              <Text style={styles.inputLabel}>{t('favoriteGenresLabel')}</Text>

              <View style={styles.addTagRow}>
                <TextInput
                  style={styles.tagInput}
                  placeholder={t('addCustomGenrePlaceholder')}
                  placeholderTextColor={COLORS.textLight}
                  value={customGenreInput}
                  onChangeText={setCustomGenreInput}
                  onSubmitEditing={handleAddCustomGenre}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={handleAddCustomGenre}>
                  <Text style={styles.addTagButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chipContainer}>
                {/* Render Quick Presets First */}
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = favoriteGenres.includes(genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleGenre(genre)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {genre} {isSelected && '✕'}
                      </Text>
                    </TouchableOpacity>
                  )
                })}

                {/* Render Custom Genres (ones not in the preset list) */}
                {favoriteGenres.filter(g => !AVAILABLE_GENRES.includes(g)).map((customGenre) => (
                  <TouchableOpacity
                    key={customGenre}
                    style={[styles.chip, styles.chipSelected]}
                    onPress={() => handleRemoveGenre(customGenre)}
                  >
                    <Text style={[styles.chipText, styles.chipTextSelected]}>
                      {customGenre} ✕
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Artists Section */}
              <Text style={[styles.inputLabel, { marginTop: 20 }]}>{t('favoriteArtistsLabel')}</Text>

              <View style={styles.addTagRow}>
                <TextInput
                  style={styles.tagInput}
                  placeholder={t('addArtistPlaceholder')}
                  placeholderTextColor={COLORS.textLight}
                  value={artistInput}
                  onChangeText={setArtistInput}
                  onSubmitEditing={handleAddArtist}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={handleAddArtist}>
                  <Text style={styles.addTagButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chipContainer}>
                {favoriteArtists.map((artist) => (
                  <TouchableOpacity
                    key={artist}
                    style={styles.removableChip}
                    onPress={() => handleRemoveArtist(artist)}
                  >
                    <Text style={styles.removableChipText}>{artist} ✕</Text>
                  </TouchableOpacity>
                ))}
                {favoriteArtists.length === 0 && (
                  <Text style={styles.settingDescription}>{t('noArtistsAdded')}</Text>
                )}
              </View>

              {/* Instrumental Toggle */}
              <View style={[styles.switchRow, { marginTop: 25 }]}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.inputLabel}>{t('instrumentalOnlyLabel')}</Text>
                  <Text style={styles.settingDescription}>{t('instrumentalOnlyDesc')}</Text>
                </View>
                <Switch
                  value={isInstrumentalOnly}
                  onValueChange={setIsInstrumentalOnly}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsPrefModalVisible(false)}
                  disabled={isUpdating}
                >
                  <Text style={styles.cancelButtonText}>{t('cancelButton')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSavePreferences}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('saveButton')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('settingsTitle')}</Text>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.inputLabel}>{t('language')}</Text>
                <Text style={styles.settingDescription}>{t('selectRegionDesc')}</Text>
              </View>
              <TouchableOpacity style={styles.settingBadge} onPress={toggleLanguage}>
                <Text style={styles.settingBadgeText}>
                  {language === 'en' ? t('langEnglish') : t('langPortuguese')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsSettingsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancelButton')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setIsSettingsModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>{t('saveButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  cancelButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#f0f0f0',
    marginBottom: 10,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  settingBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  settingBadgeText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textDark,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 5,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  removableChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removableChipText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  }
});

export default HomeScreen;