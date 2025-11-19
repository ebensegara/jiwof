'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, Bell, ArrowLeft, Brain, Briefcase, Lightbulb } from 'lucide-react';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SelfScreeningProps {
  onNavigate?: (tab: string) => void;
}

const mentalHealthQuestions = [
  {
    id: 'q1',
    text: 'Seberapa sering Anda merasa sedih, depresi, atau putus asa dalam dua minggu terakhir?',
    number: 1,
  },
  {
    id: 'q2', 
    text: 'Seberapa sering Anda mengalami kesulitan tidur, sering terbangun, atau tidur terlalu banyak?',
    number: 2,
  },
  {
    id: 'q3',
    text: 'Seberapa sering Anda merasa lelah atau kurang energi?',
    number: 3,
  },
  {
    id: 'q4',
    text: 'Seberapa sering Anda mengalami nafsu makan berkurang atau makan berlebihan?',
    number: 4,
  },
  {
    id: 'q5',
    text: 'Seberapa sering Anda kesulitan berkonsentrasi pada hal-hal seperti membaca atau menonton televisi?',
    number: 5,
  },
];

const personalityQuestions = [
  // E vs I
  { id: 'p1', text: 'Saya lebih suka menghabiskan waktu dengan banyak orang daripada sendirian', dimension: 'EI', direction: 'E' },
  { id: 'p2', text: 'Saya merasa energi saya terisi kembali setelah berinteraksi dengan orang lain', dimension: 'EI', direction: 'E' },
  { id: 'p3', text: 'Saya lebih suka merenung dan berpikir dalam diri sendiri', dimension: 'EI', direction: 'I' },
  { id: 'p4', text: 'Saya merasa nyaman bekerja sendiri dalam waktu lama', dimension: 'EI', direction: 'I' },
  
  // S vs N
  { id: 'p5', text: 'Saya lebih fokus pada fakta dan detail konkret', dimension: 'SN', direction: 'S' },
  { id: 'p6', text: 'Saya lebih suka mengikuti prosedur yang sudah terbukti', dimension: 'SN', direction: 'S' },
  { id: 'p7', text: 'Saya sering memikirkan kemungkinan dan pola di masa depan', dimension: 'SN', direction: 'N' },
  { id: 'p8', text: 'Saya lebih tertarik pada konsep abstrak dan teori', dimension: 'SN', direction: 'N' },
  
  // T vs F
  { id: 'p9', text: 'Saya membuat keputusan berdasarkan logika dan analisis objektif', dimension: 'TF', direction: 'T' },
  { id: 'p10', text: 'Saya lebih menghargai keadilan daripada harmoni', dimension: 'TF', direction: 'T' },
  { id: 'p11', text: 'Saya mempertimbangkan perasaan orang lain saat membuat keputusan', dimension: 'TF', direction: 'F' },
  { id: 'p12', text: 'Saya lebih suka menjaga harmoni dalam hubungan', dimension: 'TF', direction: 'F' },
  
  // J vs P
  { id: 'p13', text: 'Saya suka membuat rencana dan mengikuti jadwal', dimension: 'JP', direction: 'J' },
  { id: 'p14', text: 'Saya merasa nyaman dengan struktur dan organisasi', dimension: 'JP', direction: 'J' },
  { id: 'p15', text: 'Saya lebih suka tetap fleksibel dan spontan', dimension: 'JP', direction: 'P' },
  { id: 'p16', text: 'Saya nyaman dengan ketidakpastian dan perubahan', dimension: 'JP', direction: 'P' },
];

const personalityOptions = [
  { value: '1', label: 'Sangat Tidak Setuju' },
  { value: '2', label: 'Tidak Setuju' },
  { value: '3', label: 'Netral' },
  { value: '4', label: 'Setuju' },
  { value: '5', label: 'Sangat Setuju' },
];

const mentalHealthOptions = [
  { value: '0', label: 'Tidak sama sekali' },
  { value: '1', label: 'Beberapa hari' },
  { value: '2', label: 'Lebih dari setengah hari' },
  { value: '3', label: 'Hampir setiap hari' },
];

const mbtiProfiles: Record<string, any> = {
  INTJ: {
    name: 'The Architect',
    description: 'Pemikir strategis dengan visi jangka panjang',
    strengths: ['Analitis', 'Independen', 'Visioner', 'Strategis'],
    careers: ['Software Engineer', 'Data Scientist', 'Strategic Planner', 'Research Scientist', 'Investment Analyst'],
    lifeAdvice: 'Kembangkan keterampilan interpersonal dan fleksibilitas. Jangan terlalu perfeksionis.'
  },
  INTP: {
    name: 'The Logician',
    description: 'Pemikir inovatif yang suka memecahkan masalah kompleks',
    strengths: ['Logis', 'Kreatif', 'Objektif', 'Analitis'],
    careers: ['Programmer', 'Mathematician', 'Philosopher', 'Architect', 'Professor'],
    lifeAdvice: 'Praktikkan menyelesaikan proyek hingga tuntas. Kembangkan keterampilan sosial.'
  },
  ENTJ: {
    name: 'The Commander',
    description: 'Pemimpin alami yang berani dan tegas',
    strengths: ['Leadership', 'Strategis', 'Efisien', 'Percaya Diri'],
    careers: ['CEO', 'Business Manager', 'Lawyer', 'Entrepreneur', 'Management Consultant'],
    lifeAdvice: 'Dengarkan perspektif orang lain. Kembangkan empati dan kesabaran.'
  },
  ENTP: {
    name: 'The Debater',
    description: 'Inovator yang cerdas dan penuh ide',
    strengths: ['Inovatif', 'Energik', 'Cerdas', 'Adaptif'],
    careers: ['Entrepreneur', 'Marketing Director', 'Inventor', 'Consultant', 'Journalist'],
    lifeAdvice: 'Fokus pada eksekusi ide. Kembangkan konsistensi dan follow-through.'
  },
  INFJ: {
    name: 'The Advocate',
    description: 'Idealis yang penuh inspirasi dan prinsip',
    strengths: ['Empatik', 'Kreatif', 'Idealis', 'Organized'],
    careers: ['Counselor', 'Psychologist', 'Writer', 'HR Manager', 'Social Worker'],
    lifeAdvice: 'Jaga boundaries pribadi. Jangan terlalu keras pada diri sendiri.'
  },
  INFP: {
    name: 'The Mediator',
    description: 'Idealis yang kreatif dan penuh empati',
    strengths: ['Kreatif', 'Empatik', 'Idealis', 'Fleksibel'],
    careers: ['Writer', 'Artist', 'Therapist', 'Teacher', 'Designer'],
    lifeAdvice: 'Praktikkan pengambilan keputusan yang tegas. Jangan terlalu sensitif terhadap kritik.'
  },
  ENFJ: {
    name: 'The Protagonist',
    description: 'Pemimpin karismatik yang menginspirasi',
    strengths: ['Karismatik', 'Empatik', 'Organized', 'Inspiring'],
    careers: ['Teacher', 'HR Director', 'Coach', 'Public Relations', 'Event Coordinator'],
    lifeAdvice: 'Prioritaskan kebutuhan diri sendiri. Jangan terlalu people-pleasing.'
  },
  ENFP: {
    name: 'The Campaigner',
    description: 'Antusias, kreatif, dan sosial',
    strengths: ['Antusias', 'Kreatif', 'Sosial', 'Optimis'],
    careers: ['Marketing', 'Journalist', 'Actor', 'Entrepreneur', 'Counselor'],
    lifeAdvice: 'Kembangkan fokus dan disiplin. Selesaikan proyek sebelum memulai yang baru.'
  },
  ISTJ: {
    name: 'The Logistician',
    description: 'Praktis, faktual, dan dapat diandalkan',
    strengths: ['Reliable', 'Praktis', 'Detail-oriented', 'Organized'],
    careers: ['Accountant', 'Auditor', 'Project Manager', 'Military Officer', 'Administrator'],
    lifeAdvice: 'Buka diri terhadap perubahan. Kembangkan fleksibilitas dan kreativitas.'
  },
  ISFJ: {
    name: 'The Defender',
    description: 'Protektif, hangat, dan bertanggung jawab',
    strengths: ['Supportive', 'Reliable', 'Patient', 'Practical'],
    careers: ['Nurse', 'Teacher', 'Administrator', 'Social Worker', 'Librarian'],
    lifeAdvice: 'Belajar mengatakan tidak. Prioritaskan kebutuhan diri sendiri.'
  },
  ESTJ: {
    name: 'The Executive',
    description: 'Organizer yang efisien dan praktis',
    strengths: ['Organized', 'Practical', 'Direct', 'Loyal'],
    careers: ['Manager', 'Administrator', 'Judge', 'Military Officer', 'Business Analyst'],
    lifeAdvice: 'Kembangkan fleksibilitas. Dengarkan perspektif yang berbeda.'
  },
  ESFJ: {
    name: 'The Consul',
    description: 'Peduli, kooperatif, dan populer',
    strengths: ['Caring', 'Social', 'Organized', 'Loyal'],
    careers: ['Teacher', 'Nurse', 'Event Planner', 'HR Manager', 'Receptionist'],
    lifeAdvice: 'Jangan terlalu bergantung pada validasi orang lain. Kembangkan independensi.'
  },
  ISTP: {
    name: 'The Virtuoso',
    description: 'Praktis dan suka eksplorasi hands-on',
    strengths: ['Practical', 'Flexible', 'Logical', 'Hands-on'],
    careers: ['Engineer', 'Mechanic', 'Pilot', 'Forensic Scientist', 'Athlete'],
    lifeAdvice: 'Kembangkan keterampilan komunikasi. Ekspresikan emosi lebih terbuka.'
  },
  ISFP: {
    name: 'The Adventurer',
    description: 'Artistik, fleksibel, dan charming',
    strengths: ['Artistic', 'Flexible', 'Charming', 'Sensitive'],
    careers: ['Artist', 'Designer', 'Musician', 'Chef', 'Veterinarian'],
    lifeAdvice: 'Kembangkan perencanaan jangka panjang. Jangan terlalu impulsif.'
  },
  ESTP: {
    name: 'The Entrepreneur',
    description: 'Energik, spontan, dan pragmatis',
    strengths: ['Energetic', 'Pragmatic', 'Bold', 'Sociable'],
    careers: ['Entrepreneur', 'Sales', 'Paramedic', 'Detective', 'Marketing'],
    lifeAdvice: 'Pikirkan konsekuensi jangka panjang. Kembangkan kesabaran.'
  },
  ESFP: {
    name: 'The Entertainer',
    description: 'Spontan, energik, dan antusias',
    strengths: ['Enthusiastic', 'Friendly', 'Spontaneous', 'Practical'],
    careers: ['Entertainer', 'Event Planner', 'Sales', 'Teacher', 'Social Worker'],
    lifeAdvice: 'Kembangkan perencanaan finansial. Fokus pada tujuan jangka panjang.'
  },
};

export default function SelfScreening({ onNavigate }: SelfScreeningProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('mental-health');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mental Health State
  const [mentalAnswers, setMentalAnswers] = useState<Record<string, string>>({});
  const [mentalSubmitted, setMentalSubmitted] = useState(false);
  const [mentalScore, setMentalScore] = useState<number | null>(null);
  
  // Personality Test State
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string>>({});
  const [personalitySubmitted, setPersonalitySubmitted] = useState(false);
  const [mbtiType, setMbtiType] = useState<string | null>(null);

  const handleMentalAnswerChange = (questionId: string, value: string) => {
    setMentalAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handlePersonalityAnswerChange = (questionId: string, value: string) => {
    setPersonalityAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateMBTI = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    personalityQuestions.forEach(q => {
      const answer = parseInt(personalityAnswers[q.id] || '3');
      const score = answer - 3; // Convert to -2 to +2 scale
      
      if (q.direction === 'E' || q.direction === 'I') {
        if (q.direction === 'E') scores.E += score;
        else scores.I += score;
      } else if (q.direction === 'S' || q.direction === 'N') {
        if (q.direction === 'S') scores.S += score;
        else scores.N += score;
      } else if (q.direction === 'T' || q.direction === 'F') {
        if (q.direction === 'T') scores.T += score;
        else scores.F += score;
      } else if (q.direction === 'J' || q.direction === 'P') {
        if (q.direction === 'J') scores.J += score;
        else scores.P += score;
      }
    });

    const type = 
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P');
    
    return type;
  };

  const handleMentalSubmit = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      const totalScore = Object.values(mentalAnswers).reduce((sum, value) => sum + parseInt(value || '0'), 0);

      const { error } = await supabase.from("screenings").insert([
        {
          user_id: user.id,
          screening_type: 'mental_health',
          score: totalScore,
          responses: mentalAnswers,
          severity_level: totalScore <= 4 ? 'minimal' : totalScore <= 9 ? 'mild' : totalScore <= 14 ? 'moderate' : 'severe'
        },
      ]);

      if (error) throw error;

      setMentalScore(totalScore);
      setMentalSubmitted(true);

      toast({
        title: "Penilaian Selesai",
        description: "Hasil Anda telah disimpan.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan hasil",
        variant: "destructive",
      });
    }
  };

  const handlePersonalitySubmit = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      const type = calculateMBTI();

      const { error } = await supabase.from("screenings").insert([
        {
          user_id: user.id,
          screening_type: 'personality',
          responses: personalityAnswers,
          result_data: { mbti_type: type }
        },
      ]);

      if (error) throw error;

      setMbtiType(type);
      setPersonalitySubmitted(true);

      toast({
        title: "Test Selesai",
        description: "Hasil personality test Anda telah disimpan.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan hasil",
        variant: "destructive",
      });
    }
  };

  const getScoreInterpretation = () => {
    const totalScore = Object.values(mentalAnswers).reduce((sum, value) => sum + parseInt(value || '0'), 0);
    
    if (totalScore <= 4) return { 
      level: 'Minimal', 
      color: 'text-green-600', 
      description: 'Respons Anda menunjukkan gejala minimal.',
      recommendation: 'Anda dalam kondisi baik! Pertahankan kesehatan mental Anda dengan:',
      suggestions: [
        'Life Coaching untuk pengembangan diri',
        'Yoga Studio untuk relaksasi',
        'Art Therapy untuk ekspresi kreatif'
      ]
    };
    if (totalScore <= 9) return { 
      level: 'Ringan', 
      color: 'text-yellow-600', 
      description: 'Respons Anda menunjukkan gejala ringan.',
      recommendation: 'Anda mungkin mengalami stres ringan. Disarankan untuk:',
      suggestions: [
        'Life Coaching untuk dukungan emosional',
        'Yoga Studio untuk mengurangi stres',
        'Art Therapy untuk healing kreatif',
        'Konsultasi dengan Psikolog jika gejala berlanjut'
      ]
    };
    if (totalScore <= 14) return { 
      level: 'Sedang', 
      color: 'text-orange-600', 
      description: 'Respons Anda menunjukkan gejala sedang.',
      recommendation: 'Kami sangat menyarankan Anda untuk:',
      suggestions: [
        'Konsultasi dengan Psikolog untuk terapi',
        'Life Coaching sebagai dukungan tambahan',
        'Yoga dan Art Therapy sebagai terapi komplementer'
      ]
    };
    return { 
      level: 'Berat', 
      color: 'text-red-600', 
      description: 'Respons Anda menunjukkan gejala yang signifikan.',
      recommendation: 'Segera konsultasi dengan profesional:',
      suggestions: [
        'Psikiater untuk evaluasi medis dan pengobatan',
        'Psikolog untuk terapi intensif',
        'Dukungan keluarga dan teman terdekat'
      ]
    };
  };

  const allMentalQuestionsAnswered = mentalHealthQuestions.every(q => mentalAnswers[q.id]);
  const allPersonalityQuestionsAnswered = personalityQuestions.every(q => personalityAnswers[q.id]);

  // Mental Health Results
  if (mentalSubmitted && activeTab === 'mental-health') {
    const interpretation = getScoreInterpretation();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Penilaian Selesai
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Terima kasih telah menyelesaikan penilaian kesehatan mental.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-2">Hasil Anda</h3>
                  <p className={`text-xl font-bold ${interpretation.color} mb-2`}>
                    Gejala {interpretation.level}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {interpretation.description}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
                    {interpretation.recommendation}
                  </h3>
                  <ul className="space-y-2">
                    {interpretation.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="font-semibold mb-1">⚠️ Catatan Penting:</p>
                  <p>Penilaian ini bukan diagnosis medis. Silakan konsultasi dengan profesional kesehatan mental untuk evaluasi dan dukungan yang tepat.</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setMentalSubmitted(false);
                      setActiveTab('personality');
                    }}
                    className="w-full bg-primary"
                  >
                    Lanjut ke Personality Test
                  </Button>
                  <Button 
                    onClick={() => onNavigate?.('professionals')}
                    variant="outline"
                    className="w-full"
                  >
                    Lihat Profesional
                  </Button>
                  <Button 
                    onClick={() => onNavigate?.('dashboard')}
                    variant="outline"
                    className="w-full"
                  >
                    Kembali ke Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Personality Test Results
  if (personalitySubmitted && mbtiType && activeTab === 'personality') {
    const profile = mbtiProfiles[mbtiType];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {mbtiType} - {profile.name}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {profile.description}
                  </p>
                </div>
                
                {/* Strengths */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    Kekuatan Anda
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.strengths.map((strength: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full text-sm font-medium">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Career Recommendations */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Rekomendasi Karir
                  </h3>
                  <ul className="space-y-2">
                    {profile.careers.map((career: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{career}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Life Advice */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-purple-900 dark:text-purple-100">
                    Saran Pengembangan Diri
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {profile.lifeAdvice}
                  </p>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="font-semibold mb-1">💡 Catatan:</p>
                  <p>Hasil ini berdasarkan teori kepribadian Jungian (MBTI). Gunakan sebagai panduan untuk pengembangan diri dan eksplorasi karir.</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => onNavigate?.('professionals')}
                    className="w-full bg-primary"
                  >
                    Konsultasi dengan Life Coach
                  </Button>
                  <Button 
                    onClick={() => {
                      setPersonalitySubmitted(false);
                      setActiveTab('mental-health');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Kembali ke Mental Health Test
                  </Button>
                  <Button 
                    onClick={() => onNavigate?.('dashboard')}
                    variant="outline"
                    className="w-full"
                  >
                    Kembali ke Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Jiwo.AI</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </button>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
                Resources
              </a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
                Community
              </a>
            </nav>
            
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="mental-health" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Mental Health
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Personality Test
              </TabsTrigger>
            </TabsList>

            {/* Mental Health Test */}
            <TabsContent value="mental-health">
              <Card className="bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                      Penilaian Kesehatan Mental
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Jawab pertanyaan-pertanyaan ini untuk membantu kami memahami kondisi Anda saat ini.
                    </p>
                  </div>

                  <div className="space-y-10">
                    {mentalHealthQuestions.map((question) => (
                      <div key={question.id} className="space-y-4">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white pr-4">
                            {question.text}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {question.number} of {mentalHealthQuestions.length}
                          </p>
                        </div>
                        
                        <RadioGroup
                          value={mentalAnswers[question.id] || ''}
                          onValueChange={(value) => handleMentalAnswerChange(question.id, value)}
                          className="space-y-3"
                        >
                          {mentalHealthOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-4">
                              <Label
                                htmlFor={`${question.id}-${option.value}`}
                                className="flex items-center gap-4 cursor-pointer p-4 rounded-lg border-2 border-transparent bg-gray-50 dark:bg-gray-800 has-[:checked]:border-primary has-[:checked]:bg-primary/10 dark:has-[:checked]:bg-primary/20 transition-all flex-1"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${question.id}-${option.value}`}
                                  className="text-primary"
                                />
                                <span className="text-sm font-medium">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}

                    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={handleMentalSubmit}
                        disabled={!allMentalQuestionsAnswered}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Kirim Penilaian
                      </Button>
                      {!allMentalQuestionsAnswered && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                          Mohon jawab semua pertanyaan untuk mengirim penilaian
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personality Test */}
            <TabsContent value="personality">
              <Card className="bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                      Jungian Personality Test
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Temukan tipe kepribadian Anda berdasarkan teori Carl Jung (MBTI) untuk rekomendasi karir dan pengembangan diri.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {personalityQuestions.map((question, index) => (
                      <div key={question.id} className="space-y-4">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-base font-semibold text-gray-800 dark:text-white pr-4">
                            {question.text}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {index + 1} / {personalityQuestions.length}
                          </p>
                        </div>
                        
                        <RadioGroup
                          value={personalityAnswers[question.id] || ''}
                          onValueChange={(value) => handlePersonalityAnswerChange(question.id, value)}
                          className="space-y-2"
                        >
                          {personalityOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-4">
                              <Label
                                htmlFor={`${question.id}-${option.value}`}
                                className="flex items-center gap-4 cursor-pointer p-3 rounded-lg border-2 border-transparent bg-gray-50 dark:bg-gray-800 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50 dark:has-[:checked]:bg-purple-900/20 transition-all flex-1"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${question.id}-${option.value}`}
                                  className="text-purple-600"
                                />
                                <span className="text-sm font-medium">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}

                    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={handlePersonalitySubmit}
                        disabled={!allPersonalityQuestionsAnswered}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Lihat Hasil Personality Test
                      </Button>
                      {!allPersonalityQuestionsAnswered && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                          Mohon jawab semua pertanyaan untuk melihat hasil
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}