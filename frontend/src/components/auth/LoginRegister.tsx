import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { GraduationCap, BookOpen } from "lucide-react";

interface LoginRegisterProps {
  onLogin: (email: string, password: string, role: "student" | "teacher" | "admin") => void;
}

export function LoginRegister({ onLogin }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <GraduationCap className="size-6 sm:size-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Sistema de Agendamento</CardTitle>
          <CardDescription className="text-sm">
            Plataforma de agendamento entre alunos e professores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Palavra-passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Tipo de utilizador</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        role === "student"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <GraduationCap className={`size-6 mx-auto mb-2 ${role === "student" ? "text-blue-500" : "text-gray-400"}`} />
                      <p className={role === "student" ? "text-blue-700" : "text-gray-600"}>Aluno</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        role === "teacher"
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <BookOpen className={`size-6 mx-auto mb-2 ${role === "teacher" ? "text-indigo-500" : "text-gray-400"}`} />
                      <p className={role === "teacher" ? "text-indigo-700" : "text-gray-600"}>Professor</p>
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  Entrar
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => onLogin("admin@admin.com", "admin", "admin")}
                    className="text-blue-600 hover:underline"
                  >
                    Entrar como Administrador
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="José Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Palavra-passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Tipo de utilizador</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        role === "student"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <GraduationCap className={`size-6 mx-auto mb-2 ${role === "student" ? "text-blue-500" : "text-gray-400"}`} />
                      <p className={role === "student" ? "text-blue-700" : "text-gray-600"}>Aluno</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        role === "teacher"
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <BookOpen className={`size-6 mx-auto mb-2 ${role === "teacher" ? "text-indigo-500" : "text-gray-400"}`} />
                      <p className={role === "teacher" ? "text-indigo-700" : "text-gray-600"}>Professor</p>
                    </button>
                  </div>
                </div>

                {role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="register-course">Curso</Label>
                    <Input
                      id="register-course"
                      type="text"
                      placeholder="Engenharia Informática"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  Registar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}