import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainNavigator from "./MainNavigator";
import AdminScreen from "../screens/admin/adminRequestsScreen";
import RequestDetailScreen from "../screens/admin/adminRequestDetailScreen";
import MapSelectionScreen from '../screens/MapSelectionScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import ReviewScreen from '../screens/reviewScreen';
import PlaceGalleryScreen from '../screens/PlaceGalleryScreen';
import ViewReviewsScreen from '../screens/ViewReviewsScreen';
import AdminPendingReviewsScreen from '../screens/admin/adminPendingReviews';
import AdminEditPlacesScreen from '../screens/admin/adminEditPlaces';
import AdminEditOptionsScreen from '../screens/admin/adminEditOptions';
import AdminEditPlaceTypesScreen from '../screens/admin/adminEditPlaceTypes';
import AdminEditActivitiesScreen from '../screens/admin/adminEditActivities';
import AdminEditGenresScreen from '../screens/admin/adminEditGenres';
import AdminEditArtistsScreen from '../screens/admin/adminEditArtists';
import FavoriteLocationsScreen from '../screens/FavoriteLocationsScreen';
import SavedPlaylistsScreen from '../screens/SavedPlaylistsScreen';

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Main"
        component={MainNavigator}
      />
      <Stack.Screen
        name="AdminScreen"
        component={AdminScreen}
      />
      <Stack.Screen 
        name="AdminDetailScreen" 
        component={RequestDetailScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminEditPlacesScreen" 
        component={AdminEditPlacesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminEditOptionsScreen" 
        component={AdminEditOptionsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminEditPlaceTypesScreen" 
        component={AdminEditPlaceTypesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminEditActivitiesScreen" 
        component={AdminEditActivitiesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminEditGenresScreen" 
        component={AdminEditGenresScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminEditArtistsScreen" 
        component={AdminEditArtistsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AdminPendingReviews" 
        component={AdminPendingReviewsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="MapSelectionScreen" 
        component={MapSelectionScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="RecommendationScreen" 
        component={RecommendationScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="PlaceGallery"
        component={PlaceGalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ViewReviews"
        component={ViewReviewsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FavoriteLocations"
        component={FavoriteLocationsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="SavedPlaylistsScreen" 
        component={SavedPlaylistsScreen}
      />
    </Stack.Navigator>
  );
}