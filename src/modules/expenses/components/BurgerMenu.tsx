import React, {useState, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface BurgerMenuProps {
  onSettingsPress: () => void;
}

const {width: screenWidth} = Dimensions.get('window');

export const BurgerMenu: React.FC<BurgerMenuProps> = ({onSettingsPress}) => {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (isOpen) {
      // Close menu
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsOpen(false));
    } else {
      // Open menu
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSettingsPress = () => {
    toggleMenu();
    onSettingsPress();
  };

  return (
    <>
      <TouchableOpacity style={styles.burgerButton} onPress={toggleMenu}>
        <View style={[styles.burgerLine, isOpen && styles.burgerLineOpen]} />
        <View style={[styles.burgerLine, isOpen && styles.burgerLineOpen]} />
        <View style={[styles.burgerLine, isOpen && styles.burgerLineOpen]} />
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          style={[styles.overlay, {opacity: fadeAnim}]}
          onTouchEnd={toggleMenu}
        />
      )}

      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{translateX: slideAnim}],
          },
        ]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Меню</Text>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleSettingsPress}>
          <Text style={styles.menuItemText}>Настройки</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={toggleMenu}>
          <Text style={styles.menuItemText}>Закрыть</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  burgerButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  burgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#2c3e50',
    marginVertical: 2,
    borderRadius: 1,
  },
  burgerLineOpen: {
    backgroundColor: '#e74c3c',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth * 0.8,
    height: '100%',
    backgroundColor: '#ffffff',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
}); 