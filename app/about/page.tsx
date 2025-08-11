"use client"

import { Award, Users, Clock, Heart, Star, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function AboutPage() {
  const { language } = useLanguage()

  const stats = [
    {
      icon: Users,
      number: "5,000+",
      label: language === "th" ? "ลูกค้าพึงพอใจ" : "Happy Customers",
    },
    {
      icon: Clock,
      number: "8+",
      label: language === "th" ? "ปีประสบการณ์" : "Years Experience",
    },
    {
      icon: Award,
      number: "15,000+",
      label: language === "th" ? "ผ้าคลุมที่ผลิต" : "Covers Produced",
    },
    {
      icon: Star,
      number: "4.9/5",
      label: language === "th" ? "คะแนนรีวิว" : "Review Rating",
    },
  ]

  const timeline = [
    {
      year: "2016",
      title: language === "th" ? "ก่อตั้งบริษัท" : "Company Founded",
      description:
        language === "th" ? "เริ่มต้นธุรกิจผ้าคลุมโซฟาด้วยทีมงาน 3 คน" : "Started sofa cover business with a team of 3 people",
    },
    {
      year: "2018",
      title: language === "th" ? "ขยายสาขา" : "Branch Expansion",
      description:
        language === "th"
          ? "เปิดโรงงานผลิตและขยายทีมงานเป็น 15 คน"
          : "Opened production facility and expanded team to 15 people",
    },
    {
      year: "2020",
      title: language === "th" ? "ออนไลน์เต็มรูปแบบ" : "Full Online Service",
      description:
        language === "th"
          ? "เปิดบริการออนไลน์และระบบสั่งทำผ้าคลุมโซฟาแบบครบวงจร"
          : "Launched full online service and comprehensive custom cover system",
    },
    {
      year: "2022",
      title: language === "th" ? "รางวัลคุณภาพ" : "Quality Award",
      description:
        language === "th"
          ? "ได้รับรางวัลผู้ประกอบการ SME ดีเด่นด้านคุณภาพสินค้า"
          : "Received SME Excellence Award for Product Quality",
    },
    {
      year: "2024",
      title: language === "th" ? "ขยายสู่ภูมิภาค" : "Regional Expansion",
      description:
        language === "th"
          ? "ขยายบริการครอบคลุมทั่วประเทศและเพิ่มช่องทางการสั่งซื้อ"
          : "Expanded nationwide service and added more ordering channels",
    },
  ]

  const team = [
    {
      name: language === "th" ? "คุณสมชาย ใจดี" : "Mr. Somchai Jaidee",
      position: language === "th" ? "ผู้ก่อตั้งและซีอีโอ" : "Founder & CEO",
      image: "/placeholder.svg?height=200&width=200&text=CEO",
      description:
        language === "th"
          ? "ประสบการณ์ 15 ปีในธุรกิจสิ่งทอและการตกแต่งบ้าน"
          : "15 years experience in textile and home decoration business",
    },
    {
      name: language === "th" ? "คุณสมหญิง รักงาน" : "Ms. Somying Rakngaan",
      position: language === "th" ? "หัวหน้าฝ่ายผลิต" : "Production Manager",
      image: "/placeholder.svg?height=200&width=200&text=Production",
      description: language === "th" ? "ผู้เชี่ยวชาญด้านการตัดเย็บและควบคุมคุณภาพ" : "Expert in tailoring and quality control",
    },
    {
      name: language === "th" ? "คุณสมศักดิ์ ใส่ใจ" : "Mr. Somsak Saichai",
      position: language === "th" ? "หัวหน้าฝ่ายขาย" : "Sales Manager",
      image: "/placeholder.svg?height=200&width=200&text=Sales",
      description:
        language === "th" ? "ผู้เชี่ยวชาญด้านการให้คำปรึกษาและบริการลูกค้า" : "Expert in customer consultation and service",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: language === "th" ? "ใส่ใจในทุกรายละเอียด" : "Attention to Detail",
      description:
        language === "th"
          ? "เราใส่ใจในทุกขั้นตอนการผลิต ตั้งแต่การวัดขนาดไปจนถึงการเย็บผ้า"
          : "We care about every production step, from measuring to sewing",
    },
    {
      icon: CheckCircle,
      title: language === "th" ? "คุณภาพเป็นหลัก" : "Quality First",
      description:
        language === "th"
          ? "ใช้วัสดุคุณภาพสูงและมีการตรวจสอบคุณภาพอย่างเข้มงวด"
          : "Using high-quality materials with strict quality control",
    },
    {
      icon: Users,
      title: language === "th" ? "บริการเป็นเลิศ" : "Excellent Service",
      description:
        language === "th"
          ? "ทีมงานมืออาชีพพร้อมให้คำปรึกษาและดูแลลูกค้าอย่างใกล้ชิด"
          : "Professional team ready to consult and take care of customers closely",
    },
    {
      icon: Award,
      title: language === "th" ? "นวัตกรรมต่อเนื่อง" : "Continuous Innovation",
      description:
        language === "th"
          ? "พัฒนาเทคนิคการผลิตและออกแบบใหม่ๆ อย่างต่อเนื่อง"
          : "Continuously developing new production techniques and designs",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{language === "th" ? "เกี่ยวกับเรา" : "About Us"}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "ผู้เชี่ยวชาญด้านผ้าคลุมโซฟาที่มีประสบการณ์กว่า 8 ปี มุ่งมั่นสร้างสรรค์ผลงานคุณภาพเพื่อบ้านที่สวยงามของคุณ"
              : "Sofa cover specialists with over 8 years of experience, dedicated to creating quality products for your beautiful home"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-pink-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {language === "th" ? "เรื่องราวของเรา" : "Our Story"}
                  </h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      {language === "th"
                        ? "เริ่มต้นจากความรักในการตกแต่งบ้านและความต้องการที่จะช่วยให้ทุกคนมีบ้านที่สวยงาม เราจึงก่อตั้งธุรกิจผ้าคลุมโซฟาขึ้นมาในปี 2016"
                        : "Starting from a love of home decoration and the desire to help everyone have a beautiful home, we founded our sofa cover business in 2016"}
                    </p>
                    <p>
                      {language === "th"
                        ? "ด้วยประสบการณ์และความเชี่ยวชาญในการตัดเย็บ เราได้พัฒนาเทคนิคการผลิตผ้าคลุมโซฟาที่เหมาะสมกับโซฟาทุกรูปทรงและขนาด"
                        : "With experience and expertise in tailoring, we have developed techniques for producing sofa covers suitable for all sofa shapes and sizes"}
                    </p>
                    <p>
                      {language === "th"
                        ? "วันนี้เราภูมิใจที่ได้เป็นส่วนหนึ่งในการสร้างความสุขให้กับครอบครัวไทยมากกว่า 5,000 ครอบครัว"
                        : "Today we are proud to be part of creating happiness for more than 5,000 Thai families"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-100 flex items-center justify-center p-8">
                  <img
                    src="/placeholder.svg?height=400&width=500&text=Our+Story"
                    alt="Our Story"
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {language === "th" ? "เส้นทางการเติบโต" : "Growth Timeline"}
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-pink-200"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Badge className="mb-2 bg-pink-600 text-white">{item.year}</Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-pink-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {language === "th" ? "ทีมงานของเรา" : "Our Team"}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-pink-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {language === "th" ? "ค่านิยมของเรา" : "Our Values"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">
                {language === "th" ? "การรับรองและรางวัล" : "Certifications & Awards"}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-4xl">🏆</div>
                  <h3 className="font-bold">{language === "th" ? "รางวัล SME ดีเด่น" : "SME Excellence Award"}</h3>
                  <p className="text-sm opacity-90">2022</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">✅</div>
                  <h3 className="font-bold">{language === "th" ? "มาตรฐาน ISO 9001" : "ISO 9001 Standard"}</h3>
                  <p className="text-sm opacity-90">2021</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">🌟</div>
                  <h3 className="font-bold">{language === "th" ? "รางวัลบริการดีเด่น" : "Service Excellence Award"}</h3>
                  <p className="text-sm opacity-90">2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{language === "th" ? "พันธกิจ" : "Mission"}</h3>
              <p className="text-gray-600 leading-relaxed">
                {language === "th"
                  ? "มุ่งมั่นผลิตผ้าคลุมโซฟาคุณภาพสูงที่ตอบสนองความต้องการของลูกค้าทุกคน ด้วยการบริการที่เป็นเลิศและราคาที่เป็นธรรม เพื่อให้ทุกบ้านมีความสวยงามและอบอุ่น"
                  : "Committed to producing high-quality sofa covers that meet every customer's needs with excellent service and fair prices, so that every home is beautiful and warm"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{language === "th" ? "วิสัยทัศน์" : "Vision"}</h3>
              <p className="text-gray-600 leading-relaxed">
                {language === "th"
                  ? "เป็นผู้นำด้านผ้าคลุมโซฟาในประเทศไทย ที่ได้รับการยอมรับในเรื่องคุณภาพ นวัตกรรม และการบริการที่เป็นเลิศ พร้อมขยายสู่ตลาดภูมิภาคในอนาคต"
                  : "To be the leading sofa cover company in Thailand, recognized for quality, innovation and excellent service, ready to expand to regional markets in the future"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
