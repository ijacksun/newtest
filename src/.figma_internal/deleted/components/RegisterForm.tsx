import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterForm({
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Simular cadastro bem-sucedido
    onRegisterSuccess();
  };
  return (
    <Card className="w-full max-w-md mx-4 relative z-10 bg-white shadow-2xl border-0">
      <CardHeader className="text-center pb-6 pt-8">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <h1 className="text-2xl font-semibold text-gray-900">
            stride
          </h1>
        </div>
        <p className="text-sm text-gray-500">Cadastro</p>
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-8">
        {/* Registration Form */}
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="register-email"
              className="text-sm font-medium text-gray-700"
            >
              E-MAIL
            </Label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              className="h-12 bg-gray-50 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="register-password"
              className="text-sm font-medium text-gray-700"
            >
              SENHA
            </Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="h-12 bg-gray-50 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-medium text-gray-700"
            >
              CONFIRMAR SENHA
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder=""
              className="h-12 bg-gray-50 border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Register Button */}
        <Button
          onClick={handleRegister}
          className="w-full h-12 bg-black hover:bg-gray-800 text-white"
        >
          CADASTRAR
        </Button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Entrar
          </button>
        </p>
      </CardContent>
    </Card>
  );
}