import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../LoadingSpinner';
import { GoogleIcon } from '../icons';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      onSuccess();
    } else {
      // Caso de sucesso, mas sem usuário (ex: confirmação de email pendente)
      setError('Verifique seu email para confirmar o login.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // Redireciona de volta para a URL atual
      },
    });

    if (error) {
      setError(error.message);
    }
    // O sucesso é tratado pelo onAuthStateChange no AuthContext
    // Não precisamos de setIsGoogleLoading(false) aqui, pois o fluxo de OAuth
    // redireciona o usuário para fora da página.
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
      setEmail('');
      setPassword('');
      setFullName('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-headings">
            EcomLytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Planejador Financeiro Profissional
          </p>
        </div>

        {/* Card de Login/Cadastro */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-popover p-8 border border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-dark-card-alt text-gray-600 dark:text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-dark-card-alt text-gray-600 dark:text-gray-400'
              }`}
            >
              Cadastro
            </button>
          </div>

          {/* Mensagens */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {message}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-card-alt text-gray-900 dark:text-white"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-card-alt text-gray-900 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-card-alt text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

	            <button
	              type="submit"
	              disabled={loading}
	              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
	            >
	              {loading ? (
	                <>
	                  <LoadingSpinner size="sm" />
	                  <span>Processando...</span>
	                </>
	              ) : (
	                <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
	              )}
	            </button>
	          </form>

	          {/* Separador */}
	          <div className="flex items-center my-6">
	            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
	            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OU</span>
	            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
	          </div>

	          {/* Botão de Login com Google */}
	          <button
	            onClick={handleGoogleLogin}
	            disabled={isGoogleLoading}
	            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
	          >
	            {isGoogleLoading ? (
	              <>
	                <LoadingSpinner size="sm" />
	                <span>Redirecionando...</span>
	              </>
	            ) : (
	              <>
	                <GoogleIcon className="w-5 h-5" />
	                <span>Continuar com Google</span>
	              </>
	            )}
	          </button>

          {/* Link de recuperação de senha */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // TODO: Implementar recuperação de senha
                  alert('Funcionalidade em desenvolvimento');
                }}
                className="text-sm text-primary hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="text-primary hover:underline">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
