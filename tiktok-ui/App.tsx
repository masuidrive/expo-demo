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

// Separate component for image item to properly use hooks
function ImageItemComponent({ item }: { item: ImageItem }) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View style={styles.imageContainer}>
      {imageLoading && (
        <View style={styles.imageLoadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="cover"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
      />
    </View>
  );
}

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const prefetchedIndices = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Generate 50 images for scrolling
    const initialImages = generateImages(50);
    setImages(initialImages);
    setLoading(false);
  }, []);

  // Prefetch images around the current index
  useEffect(() => {
    const prefetchImages = async () => {
      const PREFETCH_RANGE = 3; // Prefetch 3 images ahead and behind
      const startIndex = Math.max(0, currentIndex - PREFETCH_RANGE);
      const endIndex = Math.min(images.length - 1, currentIndex + PREFETCH_RANGE);

      for (let i = startIndex; i <= endIndex; i++) {
        // Skip if already prefetched
        if (prefetchedIndices.current.has(i)) continue;

        try {
          await Image.prefetch(images[i].uri);
          prefetchedIndices.current.add(i);
        } catch (error) {
          console.warn(`Failed to prefetch image at index ${i}:`, error);
        }
      }
    };

    if (images.length > 0) {
      prefetchImages();
    }
  }, [currentIndex, images]);

  // Track viewable items to update current index
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const firstViewableIndex = viewableItems[0].index;
      if (firstViewableIndex !== null) {
        setCurrentIndex(firstViewableIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: ImageItem; index: number }) => {
    return <ImageItemComponent item={item} />;
  };

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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
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
