import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

export const HomeScreen: React.FC = () => {
  const { logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home está aqui</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xxl,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
  },
  logoutButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
});
