import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { z } from 'zod';
import { CheckboxField } from '../components/CheckboxField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInputField } from '../components/TextInputField';
import { useAuthStore } from '../store/authStore';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../styles/theme';

const registerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha não pode ter mais de 50 caracteres'),
  confirmPassword: z.string()
    .min(6, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, isLoading, error, setError } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (!agreeTerms) {
        setError('Você deve aceitar os Termos e Condições');
        return;
      }

      setError(null);
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      // Navegação será feita automaticamente quando isAuthenticated muda
    } catch (err: any) {
      // O erro já está no store
      console.error('Register error:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Rastreie, guarde e controle suas economias hoje.</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <TextInputField
              label="Nome Completo"
              placeholder="João Silva"
              value={value}
              onChangeText={onChange}
              editable={!isLoading}
              error={errors.name?.message}
            />
          )}
        />

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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange } }) => (
            <TextInputField
              label="Confirmar Senha"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              isPassword={true}
              editable={!isLoading}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {/* Termos e Condições */}
        <CheckboxField
          label="Concordo com os"
          checked={agreeTerms}
          onChange={setAgreeTerms}
          link={{ text: 'Termos e Condições' }}
          required
        />

        {/* Erro Geral */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Botão de Cadastro */}
        <PrimaryButton
          label={isLoading ? 'Criando conta...' : 'Criar Conta'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          disabled={isLoading || !agreeTerms}
          style={styles.registerButton}
        />

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              Fazer Login
            </Text>
          </Text>
        </View>
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
    marginBottom: SPACING.xl,
  },
  backButton: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  registerButton: {
    marginTop: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
