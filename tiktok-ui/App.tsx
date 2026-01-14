import { useState, useRef, useEffect } from 'react';
import {
  FlatList,
  View,
  Dimensions,
  Image,
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewToken
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageItem {
  id: string;
  uri: string;
}

// Generate random images from Lorem Picsum
const generateImages = (count: number): ImageItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `image-${index}`,
    uri: `https://picsum.photos/seed/${Date.now()}-${index}/${Math.floor(SCREEN_WIDTH)}/${Math.floor(SCREEN_HEIGHT)}`,
  }));
};

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Generate 50 images for scrolling
    const initialImages = generateImages(50);
    setImages(initialImages);
    setLoading(false);
  }, []);

  const renderItem = ({ item }: { item: ImageItem }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading images...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        vertical
        bounces={false}
        onEndReached={() => {
          // Load more images when reaching the end
          const moreImages = generateImages(20);
          setImages(prev => [...prev, ...moreImages]);
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});
