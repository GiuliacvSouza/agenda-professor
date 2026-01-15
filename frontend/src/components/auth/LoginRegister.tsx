import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { GraduationCap, BookOpen, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {handleLogin, handleRegister } from "../../services/auth.backend"; 
import { getCourses } from "../../services/course.backend";

interface LoginRegisterProps {
  onLogin: (email: string, password: string, role: "student" | "teacher" | "admin") => void;
  // curso pode ser string (aluno) ou string[] (professor). unidades é um objeto com chaves de curso e arrays de unidades
  onRegister: (email: string, password: string, role: "student" | "teacher", name: string, curso?: string | string[], unidades?: Record<string, string[]>) => void;
}  

export function LoginRegister({ onLogin, onRegister }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [teacherCourses, setTeacherCourses] = useState<string[]>([]);
  const [teacherUnits, setTeacherUnits] = useState<Record<string, string[]>>({});
  const [courses, setCourses] = useState<{ _id: string; name: string; unidades: string[] }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        // Fallback to empty array if fetch fails
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const toggleCourse = (c: string) => {
    setTeacherCourses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
    // when unselecting a course, remove its units
    setTeacherUnits((prev) => {
      if (prev[c]) {
        const copy = { ...prev };
        delete copy[c];
        return copy;
      }
      return prev;
    });
  };

  const toggleUnit = (courseName: string, unit: string) => {
    setTeacherUnits((prev) => {
      const cur = prev[courseName] || [];
      const next = cur.includes(unit) ? cur.filter((u) => u !== unit) : [...cur, unit];
      return { ...prev, [courseName]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password, role);
      return;
    }

    // Registro
    if (role === "student" && !course) {
      alert("Por favor selecione um curso.");
      return;
    }

    if (role === "teacher" && teacherCourses.length === 0) {
      alert("Por favor selecione pelo menos um curso para o professor.");
      return;
    }

    if (role === "teacher") {
      // ensure there's at least one unit selected per course
      for (const c of teacherCourses) {
        if (!teacherUnits[c] || teacherUnits[c].length === 0) {
          alert(`Por favor selecione ao menos uma unidade curricular para ${c}.`);
          return;
        }
      }
    }

    onRegister(
      email,
      password,
      role,
      name,
      role === "student" ? course : teacherCourses,
      role === "teacher" ? teacherUnits : undefined
    );
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

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  Entrar
                </Button>
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
                    <Select value={course} onValueChange={(value) => setCourse(value)} disabled={loadingCourses}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCourses ? "Carregando cursos..." : "Selecione o curso"} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === "teacher" && (
                  <div className="space-y-2">
                    <Label htmlFor="register-courses">Associação a Cursos</Label>
                    <Select onValueChange={(value) => toggleCourse(value)} disabled={loadingCourses}>
                      <SelectTrigger>
                        <SelectValue>{loadingCourses ? "Carregando cursos..." : teacherCourses.length ? teacherCourses.join(", ") : "Selecione um ou mais cursos"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => {
                          const selected = teacherCourses.includes(c.name);
                          return (
                            <SelectItem key={c._id} value={c.name}>
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-sm flex items-center justify-center ${selected ? "bg-indigo-500 text-white" : "bg-white border"}`}>
                                  {selected ? <Check className="size-3" /> : null}
                                </span>
                                <span className="truncate">{c.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* For each selected course, show units selector */}
                    {teacherCourses.map((c) => {
                      const courseData = courses.find(course => course.name === c);
                      const availableUnits = courseData?.unidades || [];
                      return (
                        <div key={`units_${c}`} className="mt-2">
                          <Label className="text-xs">Unidades para {c}</Label>
                          {availableUnits.length === 0 ? (
                            <p className="text-xs text-gray-500 mt-1">Nenhuma unidade curricular definida para este curso.</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                              {availableUnits.map((u) => {
                                const selected = (teacherUnits[c] || []).includes(u);
                                return (
                                  <button
                                    key={u}
                                    type="button"
                                    onClick={() => toggleUnit(c, u)}
                                    className={`p-2 text-xs rounded border transition-all text-left ${selected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-4 h-4 rounded-sm flex items-center justify-center ${selected ? "bg-indigo-500 text-white" : "bg-white border"}`}>
                                        {selected ? <Check className="size-3" /> : null}
                                      </span>
                                      <span className="truncate">{u}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
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