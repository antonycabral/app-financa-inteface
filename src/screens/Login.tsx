import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { z } from 'zod';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInputField } from '../components/TextInputField';
import { useAuthStore } from '../store/authStore';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../styles/theme';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading, error, setError } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data);
      // Navegação será feita automaticamente quando isAuthenticated muda
    } catch (err: any) {
      // O erro já está no store, ele será exibido automaticamente
      console.error('Login error:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💰</Text>
        </View>
        <Text style={styles.title}>Bem Vindo de Volta!</Text>
        <Text style={styles.subtitle}>Gerencie sua riqueza com segurança.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <TextInputField
              label="Endereço de Email"
              placeholder="seu@email.com"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <TextInputField
              label="Senha"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              isPassword={true}
              editable={!isLoading}
              error={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Esqueceu a Senha?</Text>
        </TouchableOpacity>

        <PrimaryButton
          label={isLoading ? 'Entrando...' : 'Entrar →'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.apiError}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Novo por aqui?{' '}
          <Text
            style={styles.createAccountLink}
            onPress={() => navigation.navigate('Register')}
          >
            Crie uma Conta
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  form: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  forgotPassword: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'right',
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  apiError: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  createAccountLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
