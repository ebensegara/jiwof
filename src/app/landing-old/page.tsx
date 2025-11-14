"use client";

import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Chatbot from "@/components/chatbot";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  Shield,
  Users,
  Brain,
  Clock,
  CheckCircle2,
  Zap,
  Smartphone,
  Lock,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPageOld() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] via-white to-[#f1ede8] dark:from-[#1b1918] dark:via-[#1f1d1a] dark:to-[#1b1918]">
      <Navbar />

      {/* Hero Section with AI Self-Therapy Focus */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&q=80"
            alt="Happy woman in nature - representing mental wellness"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        {/* AI Status Indicator */}
        <div className="absolute top-8 right-8 z-20">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Pendamping AI Online</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
          <div className="mb-6">
            <span className="inline-block bg-gradient-to-r from-[#756657] to-[#756657]/80 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
              Pendamping Berbasis AI - Cepat, Mudah, Terjangkau & Privat
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Hybrid AI + Human Support
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#756657] to-[#a08875]">
              Sahabat Jiwa Setiap Saat
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Dapatkan dukungan kesehatan mental instan dengan pendamping AI yang
            tersedia 24/7. Tanpa antrian, tanpa biaya tersembunyi, 100% privat.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Zap className="w-8 h-8 text-[#756657] mx-auto mb-2" />
              <div className="text-sm font-semibold">Akses Instan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Lock className="w-8 h-8 text-[#756657] mx-auto mb-2" />
              <div className="text-sm font-semibold">100% Privat</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Heart className="w-8 h-8 text-[#756657] mx-auto mb-2" />
              <div className="text-sm font-semibold">Terjangkau</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Clock className="w-8 h-8 text-[#756657] mx-auto mb-2" />
              <div className="text-sm font-semibold">24/7 Siap</div>
            </div>
          </div>

          <p className="text-sm opacity-75 mt-4">
            Tanpa biaya tersembunyi, tanpa komitmen, tanpa antrian
          </p>
        </div>
      </section>

      {/* AI Self-Therapy Vision Section */}
      <section className="py-20 bg-white dark:bg-[#1b1918]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Sahabat Jiwa , Setiap Hari
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Kami percaya setiap orang berhak mendapatkan dukungan kesehatan
              mental yang cepat, mudah, terjangkau, dan privat
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-[#756657]/20 hover:border-[#756657]/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[#756657]">Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Akses instan tanpa antrian. Pendamping AI siap membantu dalam
                  hitungan detik.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#756657]/20 hover:border-[#756657]/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[#756657]">Mudah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Interface sederhana, dapat diakses dari mana saja dengan
                  smartphone atau komputer.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#756657]/20 hover:border-[#756657]/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[#756657]">Terjangkau</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Biaya jauh lebih murah dibanding terapi tradisional. Mulai
                  gratis, lanjut dengan harga terjangkau.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#756657]/20 hover:border-[#756657]/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[#756657]">Privat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  100% anonim dan rahasia. Data Anda terenkripsi dan tidak
                  dibagikan kepada siapapun.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive AI Chat Demo */}
      <section className="py-20 bg-gradient-to-br from-[#f8f6f3] to-[#f1ede8] dark:from-[#1f1d1a] dark:to-[#1b1918]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Rasakan Pengalaman AI Life Coaching
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Lihat bagaimana AI kami membantu Anda dengan empati dan pemahaman
              yang mendalam
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#1b1918] rounded-2xl shadow-2xl border border-[#756657]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#756657] to-[#756657]/90 p-4 flex items-center">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-white/30 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4"></div>
                <span className="text-white font-semibold">
                  Chat dengan Life Coaching AI
                </span>
                <div className="ml-auto flex items-center text-white/80 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Online
                </div>
              </div>

              <div className="p-6 space-y-4 h-96 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">
                      Halo! Saya AI Jiwo. Bagaimana perasaan Anda hari ini?
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-[#756657] text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">
                      Saya merasa cemas tentang pekerjaan...
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">
                      Saya memahami perasaan cemas Anda. Mari kita eksplorasi
                      lebih dalam. Apa yang spesifik membuat Anda cemas tentang
                      pekerjaan?
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Ketik pesan Anda..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#756657] dark:bg-gray-800"
                    disabled
                  />
                  <button className="bg-[#756657] text-white p-3 rounded-lg hover:bg-[#756657]/90 transition-colors">
                    <MessageCircle className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our AI Therapist */}
      <section className="py-20 bg-white dark:bg-[#1b1918]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Mengapa Memilih Life Coaching AI Kami?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Canggih
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dilatih dengan ribuan kasus terapi nyata dan teknik CBT terbukti
                efektif
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Keamanan Terjamin
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enkripsi end-to-end dan standar keamanan medis internasional
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#756657] to-[#756657]/80 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Hasil Terukur
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tracking progress otomatis dan laporan perkembangan kesehatan
                mental
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-r from-[#756657] to-[#756657]/90">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-xl opacity-90">Sesi Chat AI</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-xl opacity-90">Selalu Online</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">0 Detik</div>
              <div className="text-xl opacity-90">Waktu Tunggu</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#f8f6f3] to-[#f1ede8] dark:from-[#1f1d1a] dark:to-[#1b1918]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Mulai Perjalanan Kesehatan Mental Anda Hari Ini
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Bergabunglah dengan ribuan orang yang telah merasakan manfaat Life
            Coaching AI kami
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 text-white bg-gradient-to-r from-[#756657] to-[#756657]/90 rounded-full hover:from-[#756657]/90 hover:to-[#756657]/80 transition-all duration-300 font-semibold text-lg shadow-lg"
            >
              <Brain className="w-6 h-6 mr-3" />
              Coba Pedamping AI Gratis
              <ArrowUpRight className="w-5 h-5 ml-3" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}
